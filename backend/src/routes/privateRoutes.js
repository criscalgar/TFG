import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { checkRole } from '../middlewares/authMiddleware.js';
import db from '../../config/db.js';

const router = express.Router();

// Ejemplo: Ruta protegida que devuelve el perfil del usuario
router.get('/perfil', verifyToken, (req, res) => {
    res.json({
        message: 'Acceso a perfil autorizado',
        user: req.user, // Información del usuario decodificada del token
    });
});

// Acceso a la información de todos los usuarios
router.get('/clases', verifyToken, checkRole(['administrador', 'entrenador']), async (req, res) => {
    try {
        const [clases] = await db.query(`
            SELECT id_clase, tipo_clase, descripcion
            FROM Clases
        `);
        res.status(200).json(clases);
    } catch (error) {
        console.error('Error al obtener la lista de clases:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.post('/clases', verifyToken, checkRole(['administrador']), async (req, res) => {
    const { tipo_clase, descripcion} = req.body;

    if (!tipo_clase || !descripcion) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        await db.query('INSERT INTO Clases (tipo_clase, descripcion) VALUES (?, ?)', [tipo_clase, descripcion]);
        res.status(201).json({ message: 'Clase creada exitosamente' });
    } catch (error) {
        console.error('Error al crear clase:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }

});


// Eliminar una clase y sus relaciones asociadas
router.delete('/clases/:id', verifyToken, checkRole(['administrador']), async (req, res) => {
    const { id } = req.params;

    try {
        // Paso 1: Eliminar reservas asociadas a las sesiones de esta clase
        await db.query(`
            DELETE Reservas
            FROM Reservas
            INNER JOIN Sesiones ON Reservas.id_sesion = Sesiones.id_sesion
            WHERE Sesiones.id_clase = ?`, [id]);

        // Paso 2: Eliminar sesiones asociadas a la clase
        await db.query('DELETE FROM Sesiones WHERE id_clase = ?', [id]);

        // Paso 3: Eliminar la clase
        await db.query('DELETE FROM Clases WHERE id_clase = ?', [id]);

        res.status(200).json({ message: 'Clase, sesiones y reservas eliminadas exitosamente' });
    } catch (error) {
        console.error('Error al eliminar clase:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener todas las sesiones para una clase específica
router.get('/sesiones/:id_clase', verifyToken, async (req, res) => {
    const { id_clase } = req.params;

    try {
        const [sesiones] = await db.query('SELECT * FROM Sesiones WHERE id_clase = ?', [id_clase]);
        res.status(200).json(sesiones);
    } catch (error) {
        console.error('Error al obtener sesiones:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});



router.post('/sesiones', verifyToken, checkRole(['administrador', 'entrenador']), async (req, res) => {
    const { id_clase, id_trabajador, fecha, hora_inicio, hora_fin, capacidad_maxima } = req.body;

    // Validación de los campos obligatorios
    if (!id_clase || !id_trabajador || !fecha || !hora_inicio || !hora_fin || !capacidad_maxima) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        const horaInicioFormatted = `${hora_inicio}:00`;
        const horaFinFormatted = `${hora_fin}:00`;

        // Inserta la nueva sesión en la base de datos
        await db.query(
            `INSERT INTO Sesiones (id_clase, id_trabajador, fecha, hora_inicio, hora_fin, capacidad_maxima, asistentes_actuales) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id_clase, id_trabajador, fecha, horaInicioFormatted, horaFinFormatted, capacidad_maxima, 0]
        );

        res.status(201).json({ message: 'Sesión creada exitosamente' });
    } catch (error) {
        console.error('Error al crear sesión:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});





router.put('/sesiones/:id', verifyToken, checkRole(['administrador']), async (req, res) => {
    const { id } = req.params;
    const { fecha, hora_inicio, hora_fin, capacidad_maxima } = req.body;

    if (!fecha || !hora_inicio || !hora_fin || !capacidad_maxima) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        // Actualizar la sesión
        await db.query(
            `UPDATE Sesiones 
            SET fecha = ?, hora_inicio = ?, hora_fin = ?, capacidad_maxima = ?
            WHERE id_sesion = ?`,
            [fecha, hora_inicio, hora_fin, capacidad_maxima, id]
        );

        // Actualizar las reservas asociadas
        await db.query(
            `UPDATE Reservas 
            SET fecha_reserva = ?
            WHERE id_sesion = ?`,
            [fecha, id]
        );

        res.status(200).json({ message: 'Sesión y reservas actualizadas correctamente' });
    } catch (error) {
        console.error('Error al actualizar la sesión:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});



// Eliminar una sesión existente
router.delete('/sesiones/:id_sesion', verifyToken, checkRole(['administrador']), async (req, res) => {
    const { id_sesion } = req.params;

    try {
        // Eliminar reservas asociadas a la sesión
        await db.query('DELETE FROM Reservas WHERE id_sesion = ?', [id_sesion]);

        // Ahora eliminar la sesión
        const [result] = await db.query('DELETE FROM Sesiones WHERE id_sesion = ?', [id_sesion]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Sesión no encontrada' });
        }

        res.status(200).json({ message: 'Sesión eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar sesión:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


router.get('/membresias', verifyToken, checkRole(['administrador', 'entrenador']), async (req, res) => {
    try {
        const [membresias] = await db.query(`
            SELECT id_membresia,tipo_membresia,precio
            FROM Membresias
        `);
        res.status(200).json(membresias);
    } catch (error) {
        console.error('Error al obtener la lista de membresias:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.get('/usuarios/:id/membresia', verifyToken, checkRole(['administrador', 'entrenador']), async (req, res) => {
    const userId = req.params.id; // Obtenemos el id del usuario desde los parámetros de la ruta
    try {
        // Consultar la membresía asociada al usuario
        const [result] = await db.query(`
            SELECT M.tipo_membresia, M.precio
            FROM Membresias M
            JOIN Usuarios U ON M.id_membresia = U.id_membresia
            WHERE U.id_usuario = ?
        `, [userId]);

        if (result.length > 0) {
            res.status(200).json(result[0]); // Retorna el tipo de membresía y precio
        } else {
            res.status(404).json({ error: 'Usuario no encontrado o sin membresía asociada' });
        }
    } catch (error) {
        console.error('Error al obtener la membresía del usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


// Obtener Membresía por ID
router.get('/membresias/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [membresia] = await db.query('SELECT tipo_membresia, precio FROM Membresias WHERE id_membresia = ?', [id]);

        if (membresia.length > 0) {
            res.status(200).json(membresia[0]);
        } else {
            res.status(404).json({ error: 'Membresía no encontrada' });
        }
    } catch (error) {
        console.error('Error al obtener membresía:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


// Crear Membresía
router.post('/membresias', verifyToken, checkRole(['administrador']), async (req, res) => {
    const { nombre, precio, duracion } = req.body;

    if (!nombre || !precio || !duracion) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        await db.query('INSERT INTO Membresias (nombre, precio, duracion) VALUES (?, ?, ?)', [nombre, precio, duracion]);
        res.status(201).json({ message: 'Membresía creada exitosamente' });
    } catch (error) {
        console.error('Error al crear membresía:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Modificar Membresía
router.put('/membresias/:id', verifyToken, checkRole(['administrador']), async (req, res) => {
    const { id } = req.params;
    const { nombre, precio, duracion } = req.body;

    try {
        await db.query('UPDATE Membresias SET nombre = ?, precio = ?, duracion = ? WHERE id = ?', [nombre, precio, duracion, id]);
        res.status(200).json({ message: 'Membresía modificada exitosamente' });
    } catch (error) {
        console.error('Error al modificar membresía:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Eliminar Membresía
router.delete('/membresias/:id', verifyToken, checkRole(['administrador']), async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM Membresias WHERE id = ?', [id]);
        res.status(200).json({ message: 'Membresía eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar membresía:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


// Acceso a la información de todos los usuarios
router.get('/usuarios', verifyToken, checkRole(['administrador', 'entrenador']), async (req, res) => {
    try {
        const [usuarios] = await db.query(`
            SELECT id_usuario, nombre, apellido, email, tipo_usuario, id_membresia
            FROM Usuarios
        `);
        res.status(200).json(usuarios);
    } catch (error) {
        console.error('Error al obtener la lista de usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


// Ruta para actualizar un usuario
router.put('/usuarios/:email', verifyToken, checkRole(['administrador']), async (req, res) => {
    const { email } = req.params;
    const { nombre, apellido, tipo_usuario, id_membresia } = req.body;

    // Validar campos requeridos
    if (!nombre || !apellido || !tipo_usuario || id_membresia === undefined) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        const [result] = await db.query(
            `UPDATE Usuarios 
             SET nombre = ?, apellido = ?, tipo_usuario = ?, id_membresia = ?
             WHERE email = ?`,
            [nombre, apellido, tipo_usuario, id_membresia, email]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.status(200).json({ message: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta para eliminar un usuario
router.delete('/usuarios/:email', verifyToken, checkRole(['administrador']), async (req, res) => {
    console.log('Middleware pasado, email:', req.params.email);
    const { email } = req.params;

    try {
        const [result] = await db.query('DELETE FROM Usuarios WHERE email = ?', [email]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});





// Registro de entrada
router.post('/turnos/entrada', verifyToken, checkRole(['entrenador', 'administrador']), async (req, res) => {
    const { id } = req.user;

    try {
        await db.query('INSERT INTO Turnos (usuario_id, tipo, hora) VALUES (?, "entrada", NOW())', [id]);
        res.status(201).json({ message: 'Entrada registrada exitosamente' });
    } catch (error) {
        console.error('Error al registrar entrada:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Registro de salida
router.post('/turnos/salida', verifyToken, checkRole(['entrenador', 'administrador']), async (req, res) => {
    const { id } = req.user;

    try {
        await db.query('INSERT INTO Turnos (usuario_id, tipo, hora) VALUES (?, "salida", NOW())', [id]);
        res.status(201).json({ message: 'Salida registrada exitosamente' });
    } catch (error) {
        console.error('Error al registrar salida:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


// Acceso a la información de todos los usuarios
router.get('/pagos', verifyToken, checkRole(['administrador', 'entrenador']), async (req, res) => {
    try {
        const [usuarios] = await db.query(`
            SELECT *
            FROM Pagos
        `);
        res.status(200).json(usuarios);
    } catch (error) {
        console.error('Error al obtener los pagos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.get('/pagos/:userId', verifyToken, async (req, res) => {
    const { userId } = req.params;

    try {
        // Consultar datos del usuario y su membresía
        const [userResult] = await db.query(
            `SELECT tipo_membresia 
             FROM Usuarios 
             INNER JOIN Membresias ON Usuarios.id_membresia = Membresias.id_membresia 
             WHERE id_usuario = ?`,
            [userId]
        );

        if (userResult.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const { tipo_membresia } = userResult[0];

        // Si es "trabajador", no procede pago
        if (tipo_membresia === 'trabajador') {
            return res.status(200).json({ message: 'No procede pago para trabajadores', noPago: true });
        }

        // Obtener el último pago
        const [result] = await db.query(
            `SELECT fecha_pago AS fechaPago 
             FROM Pagos 
             WHERE id_usuario = ? 
             ORDER BY fecha_pago DESC 
             LIMIT 1`,
            [userId]
        );

        if (result.length === 0) {
            return res.status(200).json({ fechaPago: null });
        }

        res.status(200).json(result[0]); // Retorna la fecha del último pago
    } catch (error) {
        console.error('Error al obtener el pago:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


router.post('/pagos/:userId', verifyToken, async (req, res) => {
    const { userId } = req.params;
    const { monto } = req.body;

    if (!monto || monto <= 0) {
        return res.status(400).json({ error: 'Monto inválido' });
    }

    try {
        await db.query(
            `INSERT INTO Pagos (id_usuario, monto, metodo_pago, fecha_pago) 
             VALUES (?, ?, 'tarjeta', CURDATE())`,
            [userId, monto]
        );

        res.status(201).json({ message: 'Pago registrado con éxito' });
    } catch (error) {
        console.error('Error al registrar el pago:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});




router.post('/gimnasio/validar-acceso', verifyToken, checkRole(['cliente']), async (req, res) => {
    const { id } = req.user;

    try {
        const [membresia] = await db.query('SELECT estado FROM Membresias WHERE usuario_id = ? AND estado = "activa"', [id]);

        if (membresia.length === 0) {
            return res.status(403).json({ error: 'No tienes una membresía activa. Por favor, realiza el pago.' });
        }

        res.status(200).json({ message: 'Acceso permitido. Membresía válida.' });
    } catch (error) {
        console.error('Error al validar membresía:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.post('/reservas', verifyToken, checkRole(['cliente']), async (req, res) => {
    const { id } = req.user;
    const { clase_id } = req.body;

    try {
        // Verificar membresía activa
        const [membresia] = await db.query('SELECT estado FROM Membresias WHERE usuario_id = ? AND estado = "activa"', [id]);
        if (membresia.length === 0) {
            return res.status(403).json({ error: 'No tienes una membresía activa. Por favor, realiza el pago.' });
        }

        // Registrar la reserva
        await db.query('INSERT INTO Reservas (usuario_id, clase_id, estado) VALUES (?, ?, "pendiente")', [id, clase_id]);
        res.status(201).json({ message: 'Reserva realizada exitosamente.' });
    } catch (error) {
        console.error('Error al realizar la reserva:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});



// 📌 **GET: Obtener todas las reservas de una sesión específica**
router.get('/reservas/:id_sesion', verifyToken, async (req, res) => {
    const { id_sesion } = req.params;

    try {
        const [reservas] = await db.query(`
            SELECT r.id_reserva, r.id_usuario, r.estado, r.fecha_reserva, 
                   u.nombre, u.apellido, u.email
            FROM Reservas r
            INNER JOIN Usuarios u ON r.id_usuario = u.id_usuario
            WHERE r.id_sesion = ?`, 
            [id_sesion]
        );

        res.status(200).json(reservas);
    } catch (error) {
        console.error('Error al obtener reservas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


// 📌 **POST: Crear una nueva reserva**
router.post('/reservas', verifyToken, async (req, res) => {
    const { id_usuario, id_sesion } = req.body;

    if (!id_usuario || !id_sesion) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        // Verificar si la sesión tiene cupo disponible
        const [sesion] = await db.query('SELECT capacidad_maxima, asistentes_actuales FROM Sesiones WHERE id_sesion = ?', [id_sesion]);

        if (sesion.length === 0) {
            return res.status(404).json({ error: 'Sesión no encontrada' });
        }

        if (sesion[0].asistentes_actuales >= sesion[0].capacidad_maxima) {
            return res.status(400).json({ error: 'La sesión está llena' });
        }

        // Insertar nueva reserva
        await db.query(
            'INSERT INTO Reservas (id_usuario, id_sesion, fecha_reserva, estado) VALUES (?, ?, CURDATE(), ?)',
            [id_usuario, id_sesion, 'pendiente']
        );

        // Incrementar asistentes_actuales en la sesión
        await db.query('UPDATE Sesiones SET asistentes_actuales = asistentes_actuales + 1 WHERE id_sesion = ?', [id_sesion]);

        res.status(201).json({ message: 'Reserva creada exitosamente' });
    } catch (error) {
        console.error('Error al crear la reserva:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


// 📌 **PUT: Actualizar una reserva (cambiar estado)**
router.put('/reservas/:id_reserva', verifyToken, checkRole(['administrador', 'cliente']), async (req, res) => {
    const { id_reserva } = req.params;
    const { estado } = req.body;

    if (!estado) {
        return res.status(400).json({ error: 'El estado es obligatorio' });
    }

    try {
        // Obtener la reserva actual
        const [reserva] = await db.query('SELECT id_sesion FROM Reservas WHERE id_reserva = ?', [id_reserva]);

        if (reserva.length === 0) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }

        const id_sesion = reserva[0].id_sesion;

        // Actualizar estado de la reserva
        await db.query('UPDATE Reservas SET estado = ? WHERE id_reserva = ?', [estado, id_reserva]);

        // Si la reserva es cancelada, reducir el número de asistentes en la sesión
        if (estado === 'cancelada') {
            await db.query('UPDATE Sesiones SET asistentes_actuales = asistentes_actuales - 1 WHERE id_sesion = ?', [id_sesion]);
        }

        res.status(200).json({ message: 'Reserva actualizada correctamente' });
    } catch (error) {
        console.error('Error al actualizar la reserva:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


// 📌 **DELETE: Eliminar una reserva**
router.delete('/reservas/:id_reserva', verifyToken, checkRole(['administrador', 'cliente']), async (req, res) => {
    const { id_reserva } = req.params;

    try {
        // Obtener la sesión asociada a la reserva
        const [reserva] = await db.query('SELECT id_sesion FROM Reservas WHERE id_reserva = ?', [id_reserva]);

        if (reserva.length === 0) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }

        const id_sesion = reserva[0].id_sesion;

        // Eliminar la reserva
        await db.query('DELETE FROM Reservas WHERE id_reserva = ?', [id_reserva]);

        // Reducir asistentes_actuales en la sesión
        await db.query('UPDATE Sesiones SET asistentes_actuales = asistentes_actuales - 1 WHERE id_sesion = ?', [id_sesion]);

        res.status(200).json({ message: 'Reserva eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar la reserva:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


// Obtener ID del trabajador autenticado
router.get('/trabajador', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id_usuario; // Obtener el ID del usuario autenticado

        // Buscar el trabajador en la base de datos
        const [result] = await db.query(
            `SELECT * FROM Trabajadores WHERE id_usuario = ? LIMIT 1`, 
            [userId]
        );

        if (result.length === 0) {
            return res.status(404).json({ error: 'No se encontró un trabajador asociado a este usuario' });
        }

        res.json({ id_trabajador: result[0].id_trabajador });
    } catch (error) {
        console.error('Error al obtener el ID del trabajador:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


export default router;
