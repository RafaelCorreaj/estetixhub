import express from 'express';
import { 
  getUsuarios, 
  createUsuario,
  updateUsuario
} from '../controllers/usuarioController.js';

const router = express.Router();

router.get('/', getUsuarios);
router.post('/', createUsuario);
router.put('/:id', updateUsuario);

export default router;