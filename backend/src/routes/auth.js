import express from 'express';
import { login, register, me, changePassword } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', me);
router.post('/change-password', changePassword);  // NOVA ROTA

export default router;