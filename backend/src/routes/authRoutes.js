import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Ruta para registrar usuario (solo administradores pueden acceder)
router.post('/register', registerUser);

// Ruta para iniciar sesión
router.post('/login', loginUser);


export default router;
