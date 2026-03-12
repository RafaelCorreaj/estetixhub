import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/clientes - Listar todos os clientes
router.get('/', async (req, res) => {
  try {
    const clientes = await prisma.clientes.findMany({
      orderBy: { nome: 'asc' },
      include: {
        agendamentos: {
          take: 5,
          orderBy: { data_hora_inicio: 'desc' }
        }
      }
    });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/clientes/:id - Buscar cliente por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await prisma.clientes.findUnique({
      where: { id },
      include: {
        agendamentos: {
          include: {
            servico: true,
            profissional: true
          },
          orderBy: { data_hora_inicio: 'desc' }
        },
        anamneses: {
          orderBy: { data_preenchimento: 'desc' }
        }
      }
    });
    
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/clientes - Criar novo cliente
router.post('/', async (req, res) => {
  try {
    const { nome, telefone, email, data_nascimento, cpf, endereco, como_conheceu, observacoes } = req.body;
    
    if (!nome || !telefone) {
      return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
    }
    
    const cliente = await prisma.clientes.create({
      data: {
        nome,
        telefone,
        email,
        data_nascimento: data_nascimento ? new Date(data_nascimento) : null,
        cpf,
        endereco,
        como_conheceu,
        observacoes
      }
    });
    
    res.status(201).json(cliente);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'CPF já cadastrado' });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/clientes/:id - Atualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, telefone, email, data_nascimento, cpf, endereco, como_conheceu, observacoes } = req.body;
    
    const cliente = await prisma.clientes.update({
      where: { id },
      data: {
        nome,
        telefone,
        email,
        data_nascimento: data_nascimento ? new Date(data_nascimento) : null,
        cpf,
        endereco,
        como_conheceu,
        observacoes
      }
    });
    
    res.json(cliente);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'CPF já cadastrado' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/clientes/:id - Remover cliente
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.clientes.delete({
      where: { id }
    });
    
    res.json({ message: 'Cliente removido com sucesso' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;