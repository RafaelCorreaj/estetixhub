import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/servicos - Listar todos os serviços ativos
router.get('/', async (req, res) => {
  try {
    const servicos = await prisma.servicos.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' }
    });
    res.json(servicos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/servicos/:id - Buscar serviço por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const servico = await prisma.servicos.findUnique({
      where: { id }
    });
    
    if (!servico) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }
    
    res.json(servico);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/servicos - Criar novo serviço
router.post('/', async (req, res) => {
  try {
    const { nome, descricao, duracao_min, preco, comissao_percentual, cor_identificacao } = req.body;
    
    // Validações básicas
    if (!nome || !duracao_min || !preco) {
      return res.status(400).json({ error: 'Nome, duração e preço são obrigatórios' });
    }
    
    const servico = await prisma.servicos.create({
      data: {
        nome,
        descricao,
        duracao_min: parseInt(duracao_min),
        preco: parseFloat(preco),
        comissao_percentual: comissao_percentual ? parseFloat(comissao_percentual) : null,
        cor_identificacao
      }
    });
    
    res.status(201).json(servico);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Já existe um serviço com este nome' });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/servicos/:id - Atualizar serviço
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, duracao_min, preco, comissao_percentual, cor_identificacao, ativo } = req.body;
    
    const servico = await prisma.servicos.update({
      where: { id },
      data: {
        nome,
        descricao,
        duracao_min: duracao_min ? parseInt(duracao_min) : undefined,
        preco: preco ? parseFloat(preco) : undefined,
        comissao_percentual: comissao_percentual ? parseFloat(comissao_percentual) : null,
        cor_identificacao,
        ativo
      }
    });
    
    res.json(servico);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Já existe um serviço com este nome' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/servicos/:id - Desativar serviço (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.servicos.update({
      where: { id },
      data: { ativo: false }
    });
    
    res.json({ message: 'Serviço desativado com sucesso' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;