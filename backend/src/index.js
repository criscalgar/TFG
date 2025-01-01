import express from 'express';
import db from '../config/db.js';
import bodyParser from 'body-parser';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';

const app = express();
const port = 3000;

// Middlewares
app.use(bodyParser.json());
app.use(cors());

// Rutas
app.use('/auth', authRoutes);

// Prueba de conexión a la base de datos
app.get('/prueba-conexion', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT NOW() AS hora_actual');
        res.json({ mensaje: 'Conexión exitosa', hora_actual: rows[0].hora_actual });
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
        res.status(500).json({ error: 'No se pudo conectar con la base de datos' });
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});