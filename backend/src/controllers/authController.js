import db from '../../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const registerUser = async (req, res) => {
    const { nombre, apellido, email, contraseña, tipo_usuario, id_membresia } = req.body;
  
    try {
      // Eliminar la verificación del rol de administrador
      // No es necesario verificar si el usuario tiene el rol de 'admin' si cualquier usuario puede registrar.
  
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

    // Validar entrada
    if (!email || !contraseña) {
        return res.status(400).json({ error: 'Por favor, proporciona email y contraseña' });
    }

    try {
        // Buscar usuario por email
        const [user] = await db.query('SELECT * FROM Usuarios WHERE email = ?', [email]);
        if (user.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Verificar contraseña
        const validPassword = await bcrypt.compare(contraseña, user[0].contraseña);
        if (!validPassword) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        // Generar token JWT
        const token = jwt.sign(
            { id: user[0].id, tipo_usuario: user[0].tipo_usuario },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Enviar respuesta con el token
        res.json({
            message: 'Inicio de sesión exitoso',
            token,
            user: {
                id: user[0].id,
                email: user[0].email,
                tipo_usuario: user[0].tipo_usuario
            }
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

