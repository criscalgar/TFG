import express from 'express';
import { registerUser } from '../controllers/authController.js';

const router = express.Router();

// Ruta de registro
router.post('/register', registerUser);

export default router;
