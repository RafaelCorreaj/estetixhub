import express from 'express';
import {
  getAgendamentos,
  getAgendamentoById,
  createAgendamento,
  updateAgendamento,
  cancelAgendamento
} from '../controllers/agendamentoController.js';

const router = express.Router();

router.get('/', getAgendamentos);
router.get('/:id', getAgendamentoById);
router.post('/', createAgendamento);
router.put('/:id', updateAgendamento);
router.patch('/:id/cancel', cancelAgendamento);

export default router;