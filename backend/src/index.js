import express from 'express';
import db from '../config/db.js';

const app = express();
const port = 3000;

app.get('/prueba-conexion', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT NOW() AS hora_actual');
        res.json({ mensaje: 'Conexión exitosa', hora_actual: rows[0].hora_actual });
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
        res.status(500).json({ error: 'No se pudo conectar con la base de datos' });
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
