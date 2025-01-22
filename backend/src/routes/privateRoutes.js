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

router.post('/clases', verifyToken, checkRole(['administrador']), async (req, res) => {
    const { nombre, descripcion, horario } = req.body;

    if (!nombre || !descripcion || !horario) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        await db.query('INSERT INTO Clases (nombre, descripcion, horario) VALUES (?, ?, ?)', [nombre, descripcion, horario]);
        res.status(201).json({ message: 'Clase creada exitosamente' });
    } catch (error) {
        console.error('Error al crear clase:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Modificar Clase
router.put('/clases/:id', verifyToken, checkRole(['administrador']), async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, horario } = req.body;

    try {
        await db.query('UPDATE Clases SET nombre = ?, descripcion = ?, horario = ? WHERE id = ?', [nombre, descripcion, horario, id]);
        res.status(200).json({ message: 'Clase modificada exitosamente' });
    } catch (error) {
        console.error('Error al modificar clase:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Eliminar Clase
router.delete('/clases/:id', verifyToken, checkRole(['administrador']), async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM Clases WHERE id = ?', [id]);
        res.status(200).json({ message: 'Clase eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar clase:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Reporte de Reservas
router.get('/reportes/reservas', verifyToken, checkRole(['administrador']), async (req, res) => {
    try {
        const [reservas] = await db.query(`
            SELECT Clases.nombre AS clase, COUNT(Reservas.id) AS total_reservas
            FROM Reservas
            INNER JOIN Clases ON Reservas.clase_id = Clases.id
            GROUP BY Clases.nombre
        `);
        res.status(200).json(reservas);
    } catch (error) {
        console.error('Error al generar reporte de reservas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Reporte de Asistencia
router.get('/reportes/asistencia', verifyToken, checkRole(['administrador']), async (req, res) => {
    try {
        const [asistencia] = await db.query(`
            SELECT Usuarios.nombre AS usuario, COUNT(Turnos.id) AS total_asistencia
            FROM Turnos
            INNER JOIN Usuarios ON Turnos.usuario_id = Usuarios.id
            GROUP BY Usuarios.nombre
        `);
        res.status(200).json(asistencia);
    } catch (error) {
        console.error('Error al generar reporte de asistencia:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.get('/membresias', verifyToken, checkRole(['administrador', 'entrenador']), async (req, res) => {
    try {
        const [membresias] = await db.query(`
            SELECT tipo_membresia,precio
            FROM Membresias
        `);
        res.status(200).json(membresias);
    } catch (error) {
        console.error('Error al obtener la lista de membresias:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.get('/membresias', verifyToken, checkRole(['administrador', 'entrenador']), async (req, res) => {
    try {
        const [membresias] = await db.query(`
            SELECT tipo_membresia,precio
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

// Crear Promoción
router.post('/promociones', verifyToken, checkRole(['administrador']), async (req, res) => {
    const { descripcion, descuento, fecha_inicio, fecha_fin } = req.body;

    if (!descripcion || !descuento || !fecha_inicio || !fecha_fin) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        await db.query('INSERT INTO Promociones (descripcion, descuento, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?)', [descripcion, descuento, fecha_inicio, fecha_fin]);
        res.status(201).json({ message: 'Promoción creada exitosamente' });
    } catch (error) {
        console.error('Error al crear promoción:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Aplicar Promoción a Membresía
router.post('/promociones/aplicar', verifyToken, checkRole(['administrador']), async (req, res) => {
    const { promocion_id, membresia_id } = req.body;

    try {
        await db.query('INSERT INTO Membresias_Promociones (membresia_id, promocion_id) VALUES (?, ?)', [membresia_id, promocion_id]);
        res.status(201).json({ message: 'Promoción aplicada a la membresía exitosamente' });
    } catch (error) {
        console.error('Error al aplicar promoción:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Estadísticas de Actividad de Usuarios
router.get('/estadisticas/actividad', verifyToken, checkRole(['administrador']), async (req, res) => {
    try {
        const [actividad] = await db.query(`
            SELECT Usuarios.nombre, Usuarios.apellido, COUNT(Turnos.id) AS total_turnos, COUNT(Reservas.id) AS total_reservas
            FROM Usuarios
            LEFT JOIN Turnos ON Usuarios.id = Turnos.usuario_id
            LEFT JOIN Reservas ON Usuarios.id = Reservas.usuario_id
            GROUP BY Usuarios.id
        `);
        res.status(200).json(actividad);
    } catch (error) {
        console.error('Error al generar estadísticas de actividad:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Estadísticas de Uso del Gimnasio
router.get('/estadisticas/uso-gimnasio', verifyToken, checkRole(['administrador']), async (req, res) => {
    try {
        const [uso] = await db.query(`
            SELECT DATE(Turnos.hora) AS fecha, COUNT(Turnos.id) AS total_usuarios
            FROM Turnos
            GROUP BY DATE(Turnos.hora)
            ORDER BY fecha DESC
        `);
        res.status(200).json(uso);
    } catch (error) {
        console.error('Error al generar estadísticas de uso del gimnasio:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Control de Acceso al Gimnasio
router.post('/accesos', verifyToken, checkRole(['cliente']), async (req, res) => {
    const { id } = req.user;

    try {
        const [membresia] = await db.query('SELECT estado FROM Membresias WHERE usuario_id = ? AND estado = "activa"', [id]);
        if (membresia.length === 0) {
            return res.status(403).json({ error: 'Acceso denegado: Membresía no activa.' });
        }

        // Registrar acceso
        await db.query('INSERT INTO Accesos (usuario_id, fecha_hora) VALUES (?, NOW())', [id]);
        res.status(200).json({ message: 'Acceso registrado exitosamente.' });
    } catch (error) {
        console.error('Error al registrar acceso:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Acceso a la información de todos los usuarios
router.get('/usuarios', verifyToken, checkRole(['administrador', 'entrenador']), async (req, res) => {
    try {
        const [usuarios] = await db.query(`
            SELECT nombre, apellido, email, tipo_usuario
            FROM Usuarios
        `);
        res.status(200).json(usuarios);
    } catch (error) {
        console.error('Error al obtener la lista de usuarios:', error);
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

router.get('/usuarios/:id/pago', verifyToken, async (req, res) => {
    const userId = req.params.id;
    try {
        // Verificar si el usuario ha realizado el pago en el mes actual
        const [result] = await db.query(`
            SELECT * FROM Pagos
            WHERE id_usuario = ? 
            AND MONTH(fecha_pago) = MONTH(CURRENT_DATE) 
            AND YEAR(fecha_pago) = YEAR(CURRENT_DATE)
        `, [userId]);

        if (result.length > 0) {
            res.status(200).json({ pagoRealizado: true });
        } else {
            res.status(200).json({ pagoRealizado: false });
        }
    } catch (error) {
        console.error('Error al verificar el pago:', error);
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


export default router;
