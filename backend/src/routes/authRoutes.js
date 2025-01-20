import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Ruta para registrar usuario (solo administradores pueden acceder)
router.post('/register', registerUser);

// Ruta para iniciar sesión
router.post('/login', loginUser);

// Ruta para obtener todos los usuarios
router.get('/usuarios', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Usuarios');
        res.json(rows); // Devuelve todos los usuarios en la respuesta
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'No se pudo obtener los usuarios' });
    }
});


export default router;
