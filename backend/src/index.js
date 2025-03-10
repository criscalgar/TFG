import express from 'express';
import db from '../config/db.js';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import privateRoutes from './routes/privateRoutes.js';
import bcrypt from 'bcrypt';
import path from 'path';

// Determinar el archivo .env a cargar según el entorno (por defecto usa 'development')
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
const __dirname = path.dirname(new URL(import.meta.url).pathname); // Usamos import.meta.url para obtener __dirname en ES Modules

// Cargar las variables de entorno dependiendo del entorno
dotenv.config({ path: path.resolve(__dirname, '..', envFile) });

console.log('DB_HOST:', process.env.DB_HOST);  // Debe mostrar la IP de la base de datos
console.log('DB_USER:', process.env.DB_USER);  // Debe mostrar 'root' u otro usuario

const app = express();
const port = process.env.PORT || 3000;

// Definir la constante API_URL a partir de la variable de entorno
const API_URL = process.env.API_URL || 'http://192.168.1.139:3000';

// Middleware
app.use(bodyParser.json());

// Configurar CORS según el entorno
const corsOptions = {
    origin: process.env.FRONTEND_URL || API_URL,  // Acepta dispositivos dentro de la red 192.168.1.x
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Rutas
app.use('/auth', authRoutes);
app.use('/private', privateRoutes);

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

// Ejecutar crear usuarios de prueba siempre
createTestUsers();

// Iniciar el servidor en modo dinámico
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en modo ${process.env.NODE_ENV} en ${API_URL}`);
});
