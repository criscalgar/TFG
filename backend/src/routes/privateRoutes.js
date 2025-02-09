import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { checkRole } from '../middlewares/authMiddleware.js';
import db from '../../config/db.js';

const router = express.Router();

// Acceso a la información de todos los usuarios
router.get('/clases', verifyToken, async (req, res) => {
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



router.post('/sesiones', verifyToken, checkRole(['administrador']), async (req, res) => {
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

//De momento no necesario
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

//De momento no necesario
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


router.get('/trabajadores', verifyToken, async (req, res) => {
    try {
        const query = `
            SELECT 
                t.id_trabajador, 
                t.id_usuario, 
                t.rol, 
                t.fecha_contratacion, 
                t.telefono, 
                t.beneficio_gratuito, 
                u.nombre, 
                u.apellido, 
                u.email, 
                u.tipo_usuario
            FROM Trabajadores t
            INNER JOIN Usuarios u ON t.id_usuario = u.id_usuario;
        `;

        const [result] = await db.query(query);

        res.status(200).json(result); // Retorna la lista de trabajadores
    } catch (error) {
        console.error('Error al obtener la lista de trabajadores:', error);
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
// Ruta para POST: Crear una nueva reserva
app.post('/private/reservas', async (req, res) => {
    const { id_usuario, id_sesion } = req.body;

    // Validar datos de entrada
    if (!id_usuario || !id_sesion) {
        return res.status(400).json({ message: 'Faltan parámetros obligatorios (id_usuario, id_sesion)' });
    }

    try {
        // Verificar si el id_sesion existe
        const [session] = await db.query('SELECT * FROM Sesiones WHERE id_sesion = ?', [id_sesion]);
        if (!session.length) {
            return res.status(404).json({ message: 'Sesión no encontrada' });
        }

        // Insertar la nueva reserva
        const [result] = await db.query(
            `INSERT INTO Reservas (id_usuario, id_sesion, fecha_reserva, estado) 
            VALUES (?, ?, NOW(), 'pendiente')`,
            [id_usuario, id_sesion]
        );

        // Respuesta exitosa
        res.status(201).json({
            message: 'Reserva creada exitosamente',
            reserva_id: result.insertId,
        });
    } catch (error) {
        console.error('Error al crear la reserva:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
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


import moment from 'moment-timezone';

router.put('/turnos/salida', verifyToken, async (req, res) => {
    try {
        const { id_usuario } = req.user;
        const zonaHoraria = 'Europe/Madrid'; // Ajusta esto a tu zona horaria
        const fechaActual = moment().tz(zonaHoraria).format('YYYY-MM-DD'); // Fecha local
        const horaSalida = moment().tz(zonaHoraria).format('HH:mm:ss'); // Hora local

        // Obtener el id_trabajador correcto
        const [trabajador] = await db.query(
            `SELECT id_trabajador FROM Trabajadores WHERE id_usuario = ?`,
            [id_usuario]
        );

        if (!trabajador || trabajador.length === 0) {
            return res.status(403).json({ error: 'No tienes permisos para registrar una salida.' });
        }

        const id_trabajador = trabajador[0].id_trabajador;

        // Buscar turno activo
        const [turno] = await db.query(
            `SELECT id_registro, hora_entrada FROM Registros_Turnos WHERE id_trabajador = ? AND fecha = ? AND hora_salida IS NULL`,
            [id_trabajador, fechaActual]
        );

        if (!turno || turno.length === 0) {
            return res.status(404).json({ error: 'No se encontró un turno activo para este trabajador.' });
        }

        const { id_registro, hora_entrada } = turno[0];

        // Validar que hora_salida > hora_entrada
        if (horaSalida <= hora_entrada) {
            return res.status(400).json({
                error: `Error: La hora de salida (${horaSalida}) no puede ser menor o igual a la hora de entrada (${hora_entrada}).`
            });
        }

        // Actualizar la hora de salida
        await db.query(
            `UPDATE Registros_Turnos SET hora_salida = ? WHERE id_registro = ?`,
            [horaSalida, id_registro]
        );

        res.status(200).json({ message: 'Hora de salida registrada exitosamente.' });
    } catch (error) {
        console.error('Error al registrar la hora de salida:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

router.get('/turnos/registros', verifyToken, async (req, res) => {
    try {
        const query = `
            SELECT 
                rt.id_registro, 
                u.nombre, 
                u.apellido, 
                rt.fecha, 
                rt.hora_entrada, 
                rt.hora_salida
            FROM Registros_Turnos rt
            JOIN Trabajadores t ON rt.id_trabajador = t.id_trabajador
            JOIN Usuarios u ON t.id_usuario = u.id_usuario
            ORDER BY rt.fecha DESC, rt.hora_entrada DESC;
        `;

        const [registros] = await db.query(query);

        res.status(200).json(registros);
    } catch (error) {
        console.error('Error al obtener los registros de turnos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.get('/turnos/anos', verifyToken, async (req, res) => {
    try {
        const query = `SELECT DISTINCT YEAR(fecha) as ano FROM Registros_Turnos ORDER BY ano DESC;`;
        const [result] = await db.query(query);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error al obtener años:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.get('/turnos/meses/:ano', verifyToken, async (req, res) => {
    try {
        const { ano } = req.params;
        const query = `SELECT DISTINCT MONTH(fecha) as mes FROM Registros_Turnos WHERE YEAR(fecha) = ? ORDER BY mes ASC;`;
        const [result] = await db.query(query, [ano]);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error al obtener meses:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


router.get('/turnos/registros/:ano/:mes', verifyToken, async (req, res) => {
    try {
        const { ano, mes } = req.params;
        const query = `
            SELECT 
                rt.id_registro, 
                u.nombre, 
                u.apellido, 
                rt.fecha, 
                rt.hora_entrada, 
                rt.hora_salida
            FROM Registros_Turnos rt
            JOIN Trabajadores t ON rt.id_trabajador = t.id_trabajador
            JOIN Usuarios u ON t.id_usuario = u.id_usuario
            WHERE YEAR(rt.fecha) = ? AND MONTH(rt.fecha) = ?
            ORDER BY rt.fecha DESC, rt.hora_entrada DESC;
        `;

        const [registros] = await db.query(query, [ano, mes]);
        res.status(200).json(registros);
    } catch (error) {
        console.error('Error al obtener registros:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


export default router;