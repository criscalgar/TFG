import db from '../../config/db.js';
import bcrypt from 'bcrypt';

export const registerUser = async (req, res) => {
    const { nombre, apellido, email, contraseña, tipo_usuario, id_membresia } = req.body;

    try {
        // Verificar si el email ya está registrado
        const [existingUser] = await db.query('SELECT * FROM Usuarios WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(contraseña, 10);

        // Insertar el usuario en la base de datos
        await db.query('INSERT INTO Usuarios(nombre,apellido,email,contraseña,tipo_usuario, id_membresia) VALUES (?, ?, ?, ?, ?, ?)', [nombre, apellido, email, hashedPassword, tipo_usuario, id_membresia]);
        res.status(201).json({ message: 'Usuario registrado con éxito' });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
