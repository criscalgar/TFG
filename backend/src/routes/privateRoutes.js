import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Ejemplo: Ruta protegida que devuelve el perfil del usuario
router.get('/perfil', verifyToken, (req, res) => {
    res.json({
        message: 'Acceso a perfil autorizado',
        user: req.user, // Información del usuario decodificada del token
    });
});

export default router;
