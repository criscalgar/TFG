import db from '../../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const registerUser = async (req, res) => {
    const { nombre, apellido, email, contraseña, tipo_usuario, id_membresia } = req.body;

    try {
        // Verificar que todos los campos estén presentes y no estén vacíos
        if (!nombre || !apellido || !email || !contraseña || !tipo_usuario || !id_membresia) { 
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        // Verificar si el email ya está registrado
        const [existingUser] = await db.query('SELECT * FROM Usuarios WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(contraseña, 10);

        // Insertar el usuario en la base de datos
        await db.query('INSERT INTO Usuarios(nombre, apellido, email, contraseña, tipo_usuario, id_membresia) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, apellido, email, hashedPassword, tipo_usuario, id_membresia]);

        res.status(201).json({ message: 'Usuario registrado con éxito' });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


export const loginUser = async (req, res) => {
    const { email, contraseña } = req.body;

    if (!email || !contraseña) {
        return res.status(400).json({ error: 'Por favor, proporciona email y contraseña' });
    }

    try {
        // Buscar usuario por email
        const [user] = await db.query(
            `SELECT id_usuario, nombre, apellido, email, tipo_usuario, id_membresia, contraseña 
            FROM Usuarios WHERE email = ?`,
            [email]
        );

        if (user.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Verificar contraseña
        const validPassword = await bcrypt.compare(contraseña, user[0].contraseña);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales incorrectas. Verifica tu email y contraseña.' });
        }

        // Si es un cliente, verificar pago de membresía
        if (user[0].tipo_usuario === 'cliente') {
            const [ultimoPago] = await db.query(
                `SELECT MAX(fecha_pago) AS ultimo_pago FROM Pagos WHERE id_usuario = ?`,
                [user[0].id_usuario]
            );

            if (!ultimoPago[0].ultimo_pago) {
                return res.status(403).json({ error: 'No tienes la cuota al día. Por favor, realiza tu pago en recepción.' });
            }

            const fechaUltimoPago = new Date(ultimoPago[0].ultimo_pago);
            const fechaActual = new Date();

            if (
                fechaUltimoPago.getFullYear() !== fechaActual.getFullYear() ||
                fechaUltimoPago.getMonth() !== fechaActual.getMonth()
            ) {
                return res.status(403).json({ error: 'No tienes la cuota al día. Por favor, realiza tu pago en recepción.' });
            }
        }

        // Generar token JWT
        const token = jwt.sign(
            {
                id_usuario: user[0].id_usuario,
                nombre: user[0].nombre,
                apellido: user[0].apellido,
                email: user[0].email,
                tipo_usuario: user[0].tipo_usuario,
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Responder con éxito
        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            token,
            user: user[0],
        });

    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};





