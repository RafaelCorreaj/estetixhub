import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Listar agendamentos com filtros
export const getAgendamentos = async (req, res) => {
  try {
    const { data, profissional_id, cliente_id, status } = req.query;
    
    const where = {};
    
    if (data) {
      const startDate = new Date(data);
      const endDate = new Date(data);
      endDate.setDate(endDate.getDate() + 1);
      where.data_hora_inicio = { gte: startDate, lt: endDate };
    }
    
    if (profissional_id) where.profissional_id = profissional_id;
    if (cliente_id) where.cliente_id = cliente_id;
    if (status) where.status = status;

    const agendamentos = await prisma.agendamentos.findMany({
      where,
      include: {
        cliente: { select: { id: true, nome: true, telefone: true } },
        servico: { select: { id: true, nome: true, preco: true, duracao_min: true } },
        profissional: { select: { id: true, nome: true } }
      },
      orderBy: { data_hora_inicio: 'asc' }
    });

    res.json(agendamentos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Buscar agendamento por ID
export const getAgendamentoById = async (req, res) => {
  try {
    const { id } = req.params;
    const agendamento = await prisma.agendamentos.findUnique({
      where: { id },
      include: { cliente: true, servico: true, profissional: true }
    });
    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    res.json(agendamento);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Criar agendamento
export const createAgendamento = async (req, res) => {
  try {
    const { cliente_id, servico_id, profissional_id, data_hora_inicio, observacoes, status, forma_pagamento } = req.body;

    if (!cliente_id || !servico_id || !profissional_id || !data_hora_inicio) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const servico = await prisma.servicos.findUnique({ where: { id: servico_id } });
    if (!servico) return res.status(404).json({ error: 'Serviço não encontrado' });

    const inicio = new Date(data_hora_inicio);
    const fim = new Date(inicio.getTime() + servico.duracao_min * 60000);

    // Verificar conflito
    const conflito = await prisma.agendamentos.findFirst({
      where: {
        profissional_id,
        status: { not: 'cancelado' },
        data_hora_inicio: { lt: fim },
        data_hora_fim: { gt: inicio }
      }
    });

    if (conflito) {
      return res.status(409).json({ error: 'Horário já ocupado' });
    }

    const agendamento = await prisma.agendamentos.create({
      data: {
        cliente_id,
        servico_id,
        profissional_id,
        data_hora_inicio: inicio,
        data_hora_fim: fim,
        valor_total: servico.preco,
        status: status || 'pendente',
        forma_pagamento: forma_pagamento || 'nao_pago',
        observacoes
      },
      include: { cliente: true, servico: true, profissional: true }
    });

    res.status(201).json(agendamento);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Atualizar agendamento
export const updateAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, forma_pagamento, observacoes } = req.body;

    const agendamento = await prisma.agendamentos.update({
      where: { id },
      data: { status, forma_pagamento, observacoes }
    });

    res.json(agendamento);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Cancelar agendamento
export const cancelAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.agendamentos.update({
      where: { id },
      data: { status: 'cancelado' }
    });
    res.json({ message: 'Agendamento cancelado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};