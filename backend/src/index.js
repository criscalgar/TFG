import express from 'express';
import db from '../config/db.js';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import privateRoutes from './routes/privateRoutes.js';
import bcrypt from 'bcrypt';

// Cargar variables de entorno según el entorno (por defecto usa desarrollo)
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: envFile });

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Configurar CORS según el entorno
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000'
};
app.use(cors(corsOptions));

// Rutas
app.use('/auth', authRoutes);
app.use('/private', privateRoutes);

// Ruta para obtener usuarios
app.get('/usuarios', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Usuarios');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'No se pudo obtener los usuarios' });
    }
});

// Crear usuarios de prueba automáticamente al iniciar el servidor
const createTestUsers = async () => {
    const users = [
        { nombre: 'Carlos', apellido: 'González', email: 'carlos@gmail.com', password: 'password1', tipo_usuario: 'cliente', id_membresia: 1 },
        { nombre: 'Ana', apellido: 'Martínez', email: 'ana@gmail.com', password: 'password2', tipo_usuario: 'cliente', id_membresia: 2 },
        { nombre: 'Luis', apellido: 'Pérez', email: 'luis@gmail.com', password: 'password3', tipo_usuario: 'entrenador', id_membresia: 5 },
        { nombre: 'Marta', apellido: 'Gómez', email: 'marta@gmail.com', password: 'password4', tipo_usuario: 'administrador', id_membresia: 5 },
        { nombre: 'Cristina', apellido: 'Calderón', email: 'criscargal@gmail.com', password: 'admin', tipo_usuario: 'administrador', id_membresia: 5 }
    ];

    try {
        for (const user of users) {
            const [existingUser] = await db.query('SELECT * FROM Usuarios WHERE email = ?', [user.email]);
            if (existingUser.length === 0) {
                const hashedPassword = await bcrypt.hash(user.password, 10);
                await db.query('INSERT INTO Usuarios (nombre, apellido, email, contraseña, tipo_usuario, id_membresia) VALUES (?, ?, ?, ?, ?, ?)', 
                    [user.nombre, user.apellido, user.email, hashedPassword, user.tipo_usuario, user.id_membresia]);
                console.log(`Usuario ${user.email} creado con éxito`);
            } else {
                console.log(`El usuario ${user.email} ya existe`);
            }
        }
    } catch (error) {
        console.error('Error al crear usuarios de prueba:', error);
    }
};

// Llamar a la función para crear usuarios de prueba
createTestUsers();

// Iniciar el servidor en modo dinámico
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en modo ${process.env.NODE_ENV} en http://localhost:${port}`);
});
