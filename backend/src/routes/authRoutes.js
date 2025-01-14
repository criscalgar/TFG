import express from 'express';
import { registerUser } from '../controllers/authController.js';
import { loginUser } from '../controllers/authController.js';

const router = express.Router();

// Ruta de registro

router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;
