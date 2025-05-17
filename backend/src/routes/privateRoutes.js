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
    const { tipo_clase, descripcion } = req.body;

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


router.delete('/clases/:id', verifyToken, checkRole(['administrador']), async (req, res) => {
    const { id } = req.params;

    try {
        // 🔹 Obtener los usuarios que tienen reservas en sesiones de esta clase
        const [usuariosReservados] = await db.query(
            `SELECT DISTINCT r.id_usuario, c.tipo_clase 
             FROM Reservas r
             JOIN Sesiones s ON r.id_sesion = s.id_sesion
             JOIN Clases c ON s.id_clase = c.id_clase
             WHERE s.id_clase = ?`,
            [id]
        );

        // 🔹 Eliminar reservas asociadas a las sesiones de esta clase
        await db.query(`
            DELETE Reservas
            FROM Reservas
            INNER JOIN Sesiones ON Reservas.id_sesion = Sesiones.id_sesion
            WHERE Sesiones.id_clase = ?`, [id]);

        // 🔹 Eliminar sesiones asociadas a la clase
        await db.query('DELETE FROM Sesiones WHERE id_clase = ?', [id]);

        // 🔹 Eliminar la clase
        const [result] = await db.query('DELETE FROM Clases WHERE id_clase = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Clase no encontrada' });
        }

        // 🔹 Enviar notificación a los usuarios afectados
        for (const usuario of usuariosReservados) {
            await db.query(
                `INSERT INTO Notificaciones (id_usuario, texto, estado, timestamp) 
                 VALUES (?, ?, 'no leido', NOW())`,
                [usuario.id_usuario, `⚠️ La clase de ${usuario.tipo_clase} ha sido cancelada.`]
            );
        }

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
    let { fecha, hora_inicio, hora_fin, capacidad_maxima } = req.body;

    if (!fecha || !hora_inicio || !hora_fin || !capacidad_maxima) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        // Extraer solo la parte `YYYY-MM-DD` de la fecha ISO
        fecha = fecha.split('T')[0];

        // Obtener los usuarios con reserva en la sesión
        const [usuariosReservados] = await db.query(
            `SELECT DISTINCT r.id_usuario, c.tipo_clase 
             FROM Reservas r
             JOIN Sesiones s ON r.id_sesion = s.id_sesion
             JOIN Clases c ON s.id_clase = c.id_clase
             WHERE r.id_sesion = ?`,
            [id]
        );

        // Actualizar la sesión
        const [result] = await db.query(
            `UPDATE Sesiones 
             SET fecha = ?, hora_inicio = ?, hora_fin = ?, capacidad_maxima = ?
             WHERE id_sesion = ?`,
            [fecha, hora_inicio, hora_fin, capacidad_maxima, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Sesión no encontrada' });
        }

        // Enviar notificación a los usuarios afectados
        for (const usuario of usuariosReservados) {
            await db.query(
                `INSERT INTO Notificaciones (id_usuario, texto, estado, timestamp) 
                 VALUES (?, ?, 'no leido', NOW())`,
                [usuario.id_usuario, `⚠️ La sesión de ${usuario.tipo_clase} ha sido modificada a las ${hora_inicio}.`]
            );
        }

        res.status(200).json({ message: 'Sesión y reservas actualizadas correctamente' });

    } catch (error) {
        console.error('Error al actualizar la sesión:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});




router.delete('/sesiones/:id_sesion', verifyToken, checkRole(['administrador']), async (req, res) => {
    const { id_sesion } = req.params;

    try {
        // Obtener los usuarios con reserva en la sesión eliminada
        const [usuariosReservados] = await db.query(
            `SELECT DISTINCT r.id_usuario, c.tipo_clase 
             FROM Reservas r
             JOIN Sesiones s ON r.id_sesion = s.id_sesion
             JOIN Clases c ON s.id_clase = c.id_clase
             WHERE r.id_sesion = ?`,
            [id_sesion]
        );

        // Eliminar reservas asociadas a la sesión
        await db.query('DELETE FROM Reservas WHERE id_sesion = ?', [id_sesion]);

        // Ahora eliminar la sesión
        const [result] = await db.query('DELETE FROM Sesiones WHERE id_sesion = ?', [id_sesion]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Sesión no encontrada' });
        }

        // Enviar notificación a los usuarios afectados
        for (const usuario of usuariosReservados) {
            await db.query(
                `INSERT INTO Notificaciones (id_usuario, texto, estado, timestamp) 
                 VALUES (?, ?, 'no leido', NOW())`,
                [usuario.id_usuario, `⚠️ La sesión de ${usuario.tipo_clase} ha sido cancelada.`]
            );
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
router.get('/pagoss/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // Consultar la base de datos para obtener el último pago del usuario
        const [userResult] = await db.query(
            `SELECT Usuarios.id_usuario, Membresias.tipo_membresia, Pagos.fecha_pago
             FROM Usuarios
             LEFT JOIN Membresias ON Usuarios.id_membresia = Membresias.id_membresia
             LEFT JOIN Pagos ON Usuarios.id_usuario = Pagos.id_usuario
             WHERE Usuarios.id_usuario = ?
             ORDER BY Pagos.fecha_pago DESC
             LIMIT 1`,
            [userId]
        );

        // Si no se encuentra el usuario
        if (userResult.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Extraer el tipo de membresía y la fecha del último pago
        const { tipo_membresia, fecha_pago } = userResult[0];

        // Simulación: Si el tipo de membresía es "trabajador", no se requiere pago
        if (tipo_membresia === 'trabajador') {
            return res.status(200).json({ message: 'No procede pago para trabajadores', noPago: true });
        }

        // Verificar si la fecha del último pago corresponde al mes y año actuales
        const fechaUltimoPago = new Date(fecha_pago);
        const fechaActual = new Date();

        if (
            fechaUltimoPago.getFullYear() !== fechaActual.getFullYear() ||
            fechaUltimoPago.getMonth() !== fechaActual.getMonth()
        ) {
            return res.status(200).json({
                message: 'No tienes la cuota al día. Por favor, realiza tu pago.',
                fechaPago: null,
            });
        }

        // Si el pago está actualizado, devolver la fecha del último pago
        res.status(200).json({ fechaPago: fechaUltimoPago.toISOString(), noPago: false });
    } catch (error) {
        console.error('Error al obtener el pago:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});



router.post('/pagoss/:userId', async (req, res) => {
    const { userId } = req.params;
    const { monto, metodo_pago } = req.body;

    if (!monto || monto <= 0) {
        return res.status(400).json({ error: 'Monto inválido' });
    }

    if (!metodo_pago || (metodo_pago !== 'tarjeta' && metodo_pago !== 'bizum')) {
        return res.status(400).json({ error: 'Método de pago inválido' });
    }

    try {
        // 🔹 Insertar el pago en la base de datos
        await db.query(
            `INSERT INTO Pagos (id_usuario, monto, metodo_pago, fecha_pago) 
             VALUES (?, ?, ?, CURDATE())`,
            [userId, monto, metodo_pago]
        );

        // 🔹 Enviar notificación al usuario
        await db.query(
            `INSERT INTO Notificaciones (id_usuario, texto, estado, timestamp) 
             VALUES (?, ?, 'no leido', NOW())`,
            [userId, `✅ Has realizado el pago de este mes por un importe de ${monto}€. ¡Gracias!`]
        );

        res.status(201).json({ message: 'Pago registrado con éxito' });

    } catch (error) {
        console.error('Error al registrar el pago:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


router.get('/perfil/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // Consultar la base de datos para obtener los detalles del usuario y su membresía
        const [userResult] = await db.query(
            `SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.tipo_usuario,
                    m.tipo_membresia, m.precio AS monto
             FROM Usuarios u
             JOIN Membresias m ON u.id_membresia = m.id_membresia
             WHERE u.id_usuario = ?`,
            [userId]
        );

        // Si no se encuentra el usuario
        if (userResult.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const userData = userResult[0]; // El primer (y único) resultado de la consulta

        // Si el tipo de usuario no es "cliente", asignamos 0 al monto y "No" a pago_realizado
        let monto = userData.monto;
        let pago_realizado = 'Cuota no pagada';

        if (userData.tipo_usuario !== 'cliente') {
            monto = 0;  // Monto para usuarios que no son clientes
            pago_realizado = 'Cuota gratuita';  // No aplica pago realizado
        } else {
            // Consultar el último pago del usuario si es cliente
            const [paymentResult] = await db.query(
                `SELECT p.fecha_pago
                 FROM Pagos p
                 WHERE p.id_usuario = ?
                 ORDER BY p.fecha_pago DESC
                 LIMIT 1`,
                [userId]
            );

            // Verificar si se encontró un pago
            const paymentDate = paymentResult.length > 0 ? paymentResult[0].fecha_pago : null;

            // Verificar si la fecha del último pago coincide con el mes y año actuales
            if (paymentDate) {
                const currentDate = new Date();
                const paymentDateObj = new Date(paymentDate);

                // Comparar el mes y el año del último pago con el mes y año actuales
                if (paymentDateObj.getMonth() === currentDate.getMonth() && paymentDateObj.getFullYear() === currentDate.getFullYear()) {
                    pago_realizado = 'Cuota pagada';
                }
            }
        }

        // Enviar la respuesta con los datos del usuario, su membresía y estado del pago
        res.status(200).json({
            id_usuario: userData.id_usuario,
            nombre: userData.nombre,
            apellido: userData.apellido,
            email: userData.email,
            tipo_membresia: userData.tipo_membresia,
            monto: monto,
            pago_realizado: pago_realizado,  // Nuevo campo para indicar si el pago fue realizado este mes
        });
    } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});






// Endpoint para obtener los clientes (sin token)
router.get('/clients', async (req, res) => {
    try {
        // Consultar los clientes que no han pagado este mes
        const [clients] = await db.query(
            `SELECT u.id_usuario, u.nombre, u.apellido, u.id_membresia, m.precio AS monto
            FROM Usuarios u
            INNER JOIN Membresias m ON u.id_membresia = m.id_membresia
            LEFT JOIN Pagos p ON u.id_usuario = p.id_usuario
            WHERE u.tipo_usuario = 'cliente' 
            AND (p.fecha_pago IS NULL OR MONTH(p.fecha_pago) != MONTH(CURDATE()) OR YEAR(p.fecha_pago) != YEAR(CURDATE()))`
        );

        if (clients.length === 0) {
            return res.status(404).json({ error: 'No se encontraron clientes con cuota no pagada' });
        }

        res.status(200).json(clients);
    } catch (error) {
        console.error('Error al obtener clientes:', error);
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
        // 🔹 Insertar el pago en la base de datos
        await db.query(
            `INSERT INTO Pagos (id_usuario, monto, metodo_pago, fecha_pago) 
             VALUES (?, ?, 'tarjeta', CURDATE())`,
            [userId, monto]
        );

        // 🔹 Enviar notificación al usuario
        await db.query(
            `INSERT INTO Notificaciones (id_usuario, texto, estado, timestamp) 
             VALUES (?, ?, 'no leido', NOW())`,
            [userId, `✅ Has realizado el pago de este mes por un importe de ${monto}€. ¡Gracias!`]
        );

        res.status(201).json({ message: 'Pago registrado con éxito y notificación enviada' });

    } catch (error) {
        console.error('Error al registrar el pago:', error);
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


// 📌 Ruta para hacer una reserva (solo clientes pueden reservar)
router.post('/reservas', verifyToken, async (req, res) => {
    const { id_usuario, id_sesion } = req.body;

    try {
        // 🔹 Verificar que el usuario es cliente
        const [user] = await db.query('SELECT tipo_usuario FROM Usuarios WHERE id_usuario = ?', [id_usuario]);
        console.log(user.tipo)
        if (!user.length || user[0].tipo_usuario !== 'cliente') {
            return res.status(403).json({ error: 'Solo los clientes pueden realizar reservas' });
        }

        // 🔹 Verificar que la sesión existe y tiene cupo
        const [session] = await db.query(
            'SELECT capacidad_maxima, asistentes_actuales FROM Sesiones WHERE id_sesion = ?',
            [id_sesion]
        );
        if (!session.length) {
            return res.status(404).json({ error: 'La sesión no existe' });
        }
        if (session[0].asistentes_actuales >= session[0].capacidad_maxima) {
            return res.status(400).json({ error: 'La sesión está llena' });
        }

        // 🔹 Insertar la reserva
        await db.query(
            'INSERT INTO Reservas (id_usuario, id_sesion, fecha_reserva, estado) VALUES (?, ?, NOW(), "confirmada")',
            [id_usuario, id_sesion]
        );

        // 🔹 Actualizar el número de asistentes en la sesión
        await db.query(
            'UPDATE Sesiones SET asistentes_actuales = asistentes_actuales + 1 WHERE id_sesion = ?',
            [id_sesion]
        );

        // 🔹 Obtener los detalles de la sesión y tipo de clase
        const [sesion] = await db.query(
            `SELECT c.tipo_clase, TIME_FORMAT(s.hora_inicio, '%H:%i') AS hora_inicio
             FROM Sesiones s
             JOIN Clases c ON s.id_clase = c.id_clase
             WHERE s.id_sesion = ?`,
            [id_sesion]
        );

        if (sesion.length === 0) {
            return res.status(404).json({ error: 'Detalles de la sesión no encontrados' });
        }

        const { tipo_clase, hora_inicio } = sesion[0];

        // 🔹 Enviar una notificación al usuario que ha hecho la reserva
        await db.query(
            `INSERT INTO Notificaciones (id_usuario, texto, estado, timestamp) 
             VALUES (?, ?, 'no leido', NOW())`,
            [id_usuario, `✅ Tu reserva en la sesión de ${tipo_clase} a las ${hora_inicio} ha sido confirmada.`]
        );

        res.status(201).json({ message: 'Reserva creada con éxito, notificación enviada al usuario' });

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


router.delete('/reservas/:id_reserva', verifyToken, checkRole(['administrador', 'cliente']), async (req, res) => {
    const { id_reserva } = req.params;

    try {
        // 🔹 Obtener la sesión asociada a la reserva
        const [reserva] = await db.query(
            'SELECT id_sesion, id_usuario FROM Reservas WHERE id_reserva = ?',
            [id_reserva]
        );

        if (reserva.length === 0) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }

        const { id_sesion, id_usuario } = reserva[0];

        // 🔹 Obtener el tipo de sesión y la hora en formato HH:mm
        const [sesion] = await db.query(
            `SELECT c.tipo_clase, TIME_FORMAT(s.hora_inicio, '%H:%i') AS hora_inicio
             FROM Sesiones s
             JOIN Clases c ON s.id_clase = c.id_clase
             WHERE s.id_sesion = ?`,
            [id_sesion]
        );

        if (sesion.length === 0) {
            return res.status(404).json({ error: 'Sesión no encontrada' });
        }

        const { tipo_clase, hora_inicio } = sesion[0]; // `hora_inicio` ya está en formato HH:mm

        // 🔹 Eliminar la reserva
        await db.query('DELETE FROM Reservas WHERE id_reserva = ?', [id_reserva]);

        // 🔹 Reducir asistentes_actuales en la sesión
        await db.query(
            'UPDATE Sesiones SET asistentes_actuales = asistentes_actuales - 1 WHERE id_sesion = ?',
            [id_sesion]
        );

        // 🔹 Obtener todos los trabajadores para enviar la notificación
        const [trabajadores] = await db.query(
            'SELECT id_usuario FROM Trabajadores'
        );

        if (trabajadores.length > 0) {
            // 🔹 Crear notificaciones para cada trabajador
            for (const trabajador of trabajadores) {
                await db.query(
                    `INSERT INTO Notificaciones (id_usuario, texto, estado, timestamp) 
                     VALUES (?, ?, 'no leido', NOW())`,
                    [trabajador.id_usuario, `❗ Un cliente ha cancelado su reserva en la sesión de ${tipo_clase} a las ${hora_inicio}.`]
                );
            }
        }

        // 🔹 Enviar notificación al usuario que hizo la reserva
        await db.query(
            `INSERT INTO Notificaciones (id_usuario, texto, estado, timestamp) 
             VALUES (?, ?, 'no leido', NOW())`,
            [id_usuario, `❗ Tu reserva en la sesión de ${tipo_clase} a las ${hora_inicio} ha sido cancelada.`]
        );

        res.status(200).json({ message: 'Reserva eliminada, trabajadores y usuario notificados correctamente' });

    } catch (error) {
        console.error('Error al eliminar la reserva:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});




router.get('/mis-reservas/:id_usuario', verifyToken, async (req, res) => {
    const { id_usuario } = req.params;
    try {
        const [reservas] = await db.query(
            `SELECT r.id_reserva, r.fecha_reserva, r.estado, 
                    s.id_sesion, s.fecha, s.hora_inicio, s.hora_fin, 
                    c.tipo_clase,
                    CASE 
                        WHEN EXISTS (
                            SELECT 1 FROM Reservas 
                            WHERE id_usuario = ? AND id_sesion = s.id_sesion AND estado = 'confirmada'
                        ) THEN 1 ELSE 0 
                    END AS ya_reservado
             FROM Reservas r
             JOIN Sesiones s ON r.id_sesion = s.id_sesion
             JOIN Clases c ON s.id_clase = c.id_clase
             WHERE r.id_usuario = ? AND r.estado = 'confirmada'`,  // 🔹 Filtramos solo reservas confirmadas
            [id_usuario, id_usuario]
        );

        res.status(200).json(reservas);
    } catch (error) {
        console.error('Error al obtener las reservas:', error);
        res.status(500).json({ error: 'Error al obtener las reservas' });
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

// Función para calcular distancia entre dos puntos GPS en metros (Haversine)
const haversineDistance = (coords1, coords2) => {
  function toRad(x) {
    return (x * Math.PI) / 180;
  }

  const lat1 = coords1.lat;
  const lon1 = coords1.lon;
  const lat2 = coords2.lat;
  const lon2 = coords2.lon;

  const R = 6371000; // Radio de la Tierra en metros
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distancia en metros
};


// Ubicacion etsii: 37.358254, -5.987093

// Coordenadas fijas del gimnasio (modifica según corresponda)
const GYM_LOCATION = { lat: 37.358254, lon: -5.987093 };
const DISTANCE_THRESHOLD_METERS = 100;

router.post('/turnos/entrada', verifyToken, async (req, res) => {
  try {
    const { id_usuario } = req.user;
    const { lat, lon } = req.body;

    // Validar que lat y lon estén presentes y sean números
    if (typeof lat !== 'number' || typeof lon !== 'number') {
      return res.status(400).json({ error: 'Latitud y longitud son obligatorias y deben ser números.' });
    }

    // Verificar distancia al gimnasio
    const distance = haversineDistance({ lat, lon }, GYM_LOCATION);
    if (distance > DISTANCE_THRESHOLD_METERS) {
      return res.status(403).json({ error: 'Debes estar a menos de 100 metros del gimnasio para registrar la entrada.' });
    }

    const zonaHoraria = 'Europe/Madrid';
    const fechaActual = moment().tz(zonaHoraria).format('YYYY-MM-DD');
    const horaEntrada = moment().tz(zonaHoraria).format('HH:mm:ss');

    // Obtener id_trabajador
    const [trabajador] = await db.query(
      `SELECT id_trabajador FROM Trabajadores WHERE id_usuario = ?`,
      [id_usuario]
    );

    if (!trabajador || trabajador.length === 0) {
      return res.status(403).json({ error: 'No tienes permisos para registrar una entrada.' });
    }

    const id_trabajador = trabajador[0].id_trabajador;

    // Verificar si ya registró entrada hoy
    const [turno] = await db.query(
      `SELECT id_registro FROM Registros_Turnos WHERE id_trabajador = ? AND fecha = ?`,
      [id_trabajador, fechaActual]
    );

    if (turno.length > 0) {
      return res.status(400).json({ error: 'Ya has registrado tu entrada hoy.' });
    }

    // Insertar registro de entrada
    await db.query(
      `INSERT INTO Registros_Turnos (id_trabajador, fecha, hora_entrada) VALUES (?, ?, ?)`,
      [id_trabajador, fechaActual, horaEntrada]
    );

    res.status(200).json({ message: 'Entrada registrada exitosamente.' });

  } catch (error) {
    console.error('Error al registrar la entrada:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});


router.put('/turnos/salida', verifyToken, async (req, res) => {
  try {
    const { id_usuario } = req.user;
    const { lat, lon } = req.body;

    // Validar que lat y lon estén presentes y sean números
    if (typeof lat !== 'number' || typeof lon !== 'number') {
      return res.status(400).json({ error: 'Latitud y longitud son obligatorias y deben ser números.' });
    }

    // Verificar distancia al gimnasio
    const distance = haversineDistance({ lat, lon }, GYM_LOCATION);
    if (distance > DISTANCE_THRESHOLD_METERS) {
      return res.status(403).json({ error: 'Debes estar a menos de 100 metros del gimnasio para registrar la salida.' });
    }

    const zonaHoraria = 'Europe/Madrid';
    const fechaActual = moment().tz(zonaHoraria).format('YYYY-MM-DD');
    const horaSalida = moment().tz(zonaHoraria).format('HH:mm:ss');

    // Obtener id_trabajador
    const [trabajador] = await db.query(
      `SELECT id_trabajador FROM Trabajadores WHERE id_usuario = ?`,
      [id_usuario]
    );

    if (!trabajador || trabajador.length === 0) {
      return res.status(403).json({ error: 'No tienes permisos para registrar una salida.' });
    }

    const id_trabajador = trabajador[0].id_trabajador;

    // Buscar turno activo sin hora de salida
    const [turno] = await db.query(
      `SELECT id_registro, hora_entrada FROM Registros_Turnos WHERE id_trabajador = ? AND fecha = ? AND hora_salida IS NULL`,
      [id_trabajador, fechaActual]
    );

    if (!turno || turno.length === 0) {
      return res.status(404).json({ error: 'No se encontró un turno activo para este trabajador.' });
    }

    const { id_registro, hora_entrada } = turno[0];

    // Validar que la hora de salida sea posterior a la de entrada
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

/**
 * ✅ Obtener todas las notificaciones del usuario autenticado
 */
router.get('/notificaciones', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id_usuario; // ID del usuario autenticado

        const [notificaciones] = await db.query(
            'SELECT * FROM Notificaciones WHERE id_usuario = ? ORDER BY timestamp DESC',
            [userId]
        );

        res.json({ success: true, notificaciones });
    } catch (error) {
        console.error('Error obteniendo notificaciones:', error);
        res.status(500).json({ error: 'Error al obtener notificaciones' });
    }
});

/**
 * ✅ Marcar una notificación específica como "leída"
 */
router.put('/notificaciones/:id/marcar-leida', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id_usuario;

        const [result] = await db.query(
            'UPDATE Notificaciones SET estado = "leido" WHERE id_notificacion = ? AND id_usuario = ?',
            [id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Notificación no encontrada o ya está marcada como leída' });
        }

        res.json({ success: true, message: 'Notificación marcada como leída' });
    } catch (error) {
        console.error('Error marcando notificación como leída:', error);
        res.status(500).json({ error: 'Error al marcar como leída' });
    }
});

/**
 * ✅ Marcar todas las notificaciones del usuario como "leídas"
 */
router.put('/notificaciones/marcar-todas-leidas', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id_usuario;

        await db.query(
            'UPDATE Notificaciones SET estado = "leido" WHERE id_usuario = ?',
            [userId]
        );

        res.json({ success: true, message: 'Todas las notificaciones marcadas como leídas' });
    } catch (error) {
        console.error('Error marcando todas las notificaciones como leídas:', error);
        res.status(500).json({ error: 'Error al marcar todas como leídas' });
    }
});

/**
 * ✅ Eliminar una notificación específica del usuario autenticado
 */
router.delete('/notificaciones/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id_usuario;

        const [result] = await db.query(
            'DELETE FROM Notificaciones WHERE id_notificacion = ? AND id_usuario = ?',
            [id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Notificación no encontrada' });
        }

        res.json({ success: true, message: 'Notificación eliminada' });
    } catch (error) {
        console.error('Error eliminando notificación:', error);
        res.status(500).json({ error: 'Error al eliminar notificación' });
    }
});

/**
 * ✅ Eliminar todas las notificaciones del usuario autenticado
 */
router.delete('/notificaciones', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id_usuario;

        const [result] = await db.query(
            'DELETE FROM Notificaciones WHERE id_usuario = ?',
            [userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Notificación no encontrada' });
        }

        res.json({ success: true, message: 'Notificación eliminada' });
    } catch (error) {
        console.error('Error eliminando notificación:', error);
        res.status(500).json({ error: 'Error al eliminar notificación' });
    }
});

router.get('/mensajes-no-leidos/:id_usuario', async (req, res) => {
    const { id_usuario } = req.params;

    try {
        const query = `
            SELECT COUNT(*) AS unreadCount 
            FROM Mensajes 
            WHERE id_mensaje NOT IN (
                SELECT id_mensaje FROM MensajesLeidos WHERE id_usuario = ?
            )
        `;
        const [rows] = await db.query(query, [id_usuario]);

        res.json({ unreadCount: rows[0].unreadCount });
    } catch (error) {
        console.error('Error al obtener mensajes no leídos:', error);
        res.status(500).json({ error: 'Error al obtener mensajes no leídos' });
    }
});

router.post('/marcar-mensajes-leidos', async (req, res) => {
    const { id_usuario } = req.body;

    try {
        const query = `
            INSERT IGNORE INTO MensajesLeidos (id_usuario, id_mensaje)
            SELECT ?, id_mensaje FROM Mensajes
        `;
        await db.query(query, [id_usuario]);

        res.json({ success: true, message: 'Todos los mensajes han sido marcados como leídos' });
    } catch (error) {
        console.error('Error al marcar mensajes como leídos:', error);
        res.status(500).json({ error: 'Error al marcar mensajes como leídos' });
    }
});



router.get("/mensajes", async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT m.id_mensaje, u.nombre, u.tipo_usuario, u.apellido, m.texto, m.timestamp 
            FROM Mensajes m 
            JOIN Usuarios u ON m.id_usuario = u.id_usuario 
            ORDER BY m.timestamp ASC`
        );
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener mensajes:", error);
        res.status(500).json({ error: "No se pudieron obtener los mensajes" });
    }
});

// Enviar un nuevo mensaje
router.post("/mensajes", async (req, res) => {
    const { id_usuario, texto } = req.body;

    if (!id_usuario || !texto.trim()) {
        return res.status(400).json({ error: "Faltan datos en el mensaje" });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO Mensajes (id_usuario, texto, fecha_envio) 
             VALUES (?, ?, CURDATE())`, // CURDATE() establece solo la fecha actual (día y mes)
            [id_usuario, texto]
        );

        res.json({
            message: "Mensaje enviado",
            id_mensaje: result.insertId,
            timestamp: new Date().toISOString() // Enviar la hora exacta
        });

    } catch (error) {
        console.error("Error al enviar mensaje:", error);
        res.status(500).json({ error: "No se pudo enviar el mensaje" });
    }
});

router.get('/horarios-laborales', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT hl.id_horario, hl.id_usuario, u.nombre, u.apellido, 
                    hl.fecha AS fecha, 
                    DATE_FORMAT(hl.hora_entrada, '%H:%i') AS hora_entrada, 
                    DATE_FORMAT(hl.hora_salida, '%H:%i') AS hora_salida
             FROM HorarioLaboral hl
             JOIN Usuarios u ON hl.id_usuario = u.id_usuario
             WHERE hl.fecha >= CURDATE() 
             ORDER BY hl.fecha ASC`
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener los horarios laborales:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// 📌 Eliminar un horario laboral
router.delete('/horarios-laborales/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query(`DELETE FROM HorarioLaboral WHERE id_horario = ?`, [id]);
        res.json({ message: 'Horario laboral eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar horario laboral:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

/**
 * 📌 2️⃣ Crear un nuevo horario laboral (solo administradores)
 */
router.post('/horarios-laborales', verifyToken, checkRole(['administrador']), async (req, res) => {
  const { id_usuario, fecha, hora_entrada, hora_salida } = req.body;

  if (!id_usuario || !fecha || !hora_entrada || !hora_salida) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

  if (!horaRegex.test(hora_entrada)) {
    return res.status(400).json({ error: 'Formato de hora_entrada inválido. Debe ser HH:mm' });
  }

  if (!horaRegex.test(hora_salida)) {
    return res.status(400).json({ error: 'Formato de hora_salida inválido. Debe ser HH:mm' });
  }

  try {
    // Comprobar si id_usuario está en Trabajadores
    const [trabajador] = await db.query(
      'SELECT id_usuario FROM Trabajadores WHERE id_usuario = ?',
      [id_usuario]
    );

    if (trabajador.length === 0) {
      return res.status(400).json({ error: 'El usuario no es un trabajador.' });
    }

    // Obtener día de la semana (0=dom, 1=lun, ..., 6=sáb)
    const diaSemana = new Date(fecha).getDay();

    let horaEntradaMin, horaSalidaMax;

    if (diaSemana >= 1 && diaSemana <= 5) {
      horaEntradaMin = "06:00";
      horaSalidaMax = "22:00";
    } else {
      horaEntradaMin = "08:00";
      horaSalidaMax = "20:00";
    }

    if (hora_entrada < horaEntradaMin) {
        if(diaSemana<=5){
            return res.status(400).json({ error: `La hora de entrada debe ser igual o posterior a ${horaEntradaMin} de Lunes a Viernes.` });
        }
        else{
            return res.status(400).json({ error: `La hora de entrada debe ser igual o posterior a ${horaEntradaMin} los Sábados y los Domingos.` });
        }
      
    }

    if (hora_salida > horaSalidaMax) {
        if(diaSemana<=5){
            return res.status(400).json({ error: `La hora de salida debe ser igual o anterior a ${horaSalidaMax} de Lunes a Viernes.` });
        }
        else{
            return res.status(400).json({ error: `La hora de salida debe ser igual o anterior a ${horaSalidaMax} los Sabados y los Domingos.` });
        }
    }

    // Parsear añadiendo segundos para Date()
    const entrada = new Date(`1970-01-01T${hora_entrada}:00Z`);
    const salida = new Date(`1970-01-01T${hora_salida}:00Z`);

    const diffMs = salida - entrada;
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours !== 8) {
      return res.status(400).json({ error: 'El turno debe ser de 8 horas' });
    }

    // Insertar en BD
    const [result] = await db.query(
      `INSERT INTO HorarioLaboral (id_usuario, fecha, hora_entrada, hora_salida) 
       VALUES (?, ?, ?, ?)`,
      [id_usuario, fecha, hora_entrada, hora_salida]
    );

    // Insertar notificación
    const mensaje = `📅 Se te ha asignado un nuevo horario laboral el ${fecha} de ${hora_entrada} a ${hora_salida}.`;
    await db.query(
      `INSERT INTO Notificaciones (id_usuario, texto, estado, timestamp) 
       VALUES (?, ?, 'no leido', NOW())`,
      [id_usuario, mensaje]
    );

    res.status(201).json({ message: '✅ Horario laboral asignado y notificado con éxito' });
  } catch (error) {
    console.error('❌ Error al asignar horario laboral:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});




/**
 * 📌 4️⃣ Obtener solo los trabajadores (entrenadores y administradores)
 */
router.get('/trabajadores', verifyToken, async (req, res) => {
    try {
        const query = `
            SELECT u.id_usuario, u.nombre, u.apellido, t.rol
            FROM Usuarios u
            JOIN Trabajadores t ON u.id_usuario = t.id_usuario
            WHERE u.tipo_usuario IN ('entrenador', 'administrador')
            ORDER BY u.nombre ASC, u.apellido ASC;
        `;

        const [result] = await db.query(query);
        res.status(200).json(result);
    } catch (error) {
        console.error('❌ Error al obtener la lista de trabajadores:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Endpoint para obtener el usuario por email
router.get('/usuario', verifyToken, async (req, res) => {
    const { email } = req.query; // Obtenemos el email desde los parámetros de la query

    if (!email) {
        return res.status(400).json({ error: 'El email es obligatorio' });
    }

    try {
        const query = `
            SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.cuota_pagada
            FROM Usuarios u
            WHERE u.email = ?;
        `;
        const [result] = await db.query(query, [email]);

        if (result.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const user = result[0]; // Asumimos que solo hay un resultado para el email
        return res.status(200).json(user);
    } catch (error) {
        console.error('❌ Error al obtener el usuario:', error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Endpoint para obtener el usuario por email
router.get('/usuario/:email', async (req, res) => {
    const { email } = req.params; // Obtenemos el email desde los parámetros de la URL

    if (!email) {
        return res.status(400).json({ error: 'El email es obligatorio' });
    }

    try {
        const query = `
            SELECT u.id_usuario, u.nombre, u.apellido, m.precio AS monto, m.tipo_membresia
            FROM Usuarios u
            JOIN Membresias m ON u.id_membresia = m.id_membresia
            WHERE u.email = ?;
        `;
        const [result] = await db.query(query, [email]);

        if (result.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const user = result[0]; // Asumimos que solo hay un resultado para el email
        return res.status(200).json(user); // Devolvemos los datos del usuario
    } catch (error) {
        console.error('❌ Error al obtener el usuario:', error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});





export default router;