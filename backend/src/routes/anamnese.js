import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// ========== FUNÇÕES PARA TOKEN PÚBLICO ==========

// Gerar token único para anamnese
const gerarTokenAnamnese = async (req, res) => {
  try {
    const { clienteId } = req.params;
    
    // Gerar token único usando crypto
    const crypto = await import('crypto');
    const token = crypto.randomBytes(16).toString('hex');
    
    // Aqui você pode salvar o token no banco se quiser
    // Por exemplo, criar um registro temporário ou atualizar o cliente
    
    res.json({ 
      token,
      link: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/anamnese/publica/${token}`
    });
  } catch (error) {
    console.error('Erro ao gerar token:', error);
    res.status(500).json({ error: error.message });
  }
};

// Validar token e obter dados do cliente
const validarTokenAnamnese = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Aqui você deve validar o token no banco
    // Por enquanto, retorna um mock
    res.json({ 
      valido: true,
      cliente: {
        id: 'cliente-id-exemplo',
        nome: 'Cliente Exemplo'
      }
    });
  } catch (error) {
    console.error('Erro ao validar token:', error);
    res.status(500).json({ error: error.message });
  }
};

// ========== ROTAS DE TOKEN ==========
// (Coloque estas rotas ANTES das rotas com parâmetros dinâmicos)
router.get('/token/:clienteId', gerarTokenAnamnese);
router.get('/publica/validar/:token', validarTokenAnamnese);

// ========== ROTAS CRUD ==========

// GET /api/anamnese - Listar todas
router.get('/', async (req, res) => {
  try {
    const anamneses = await prisma.anamnese.findMany({
      include: {
        cliente: {
          select: { id: true, nome: true, telefone: true }
        }
      },
      orderBy: { data_preenchimento: 'desc' }
    });
    res.json(anamneses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/anamnese/:id - Buscar por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const anamnese = await prisma.anamnese.findUnique({
      where: { id },
      include: { cliente: true }
    });
    if (!anamnese) {
      return res.status(404).json({ error: 'Anamnese não encontrada' });
    }
    res.json(anamnese);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/anamnese/cliente/:clienteId - Buscar por cliente
router.get('/cliente/:clienteId', async (req, res) => {
  try {
    const { clienteId } = req.params;
    const anamneses = await prisma.anamnese.findMany({
      where: { cliente_id: clienteId },
      orderBy: { data_preenchimento: 'desc' }
    });
    res.json(anamneses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/anamnese - Criar nova
router.post('/', async (req, res) => {
  try {
    const {
      cliente_id,
      profissao,
      estado_civil,
      contato_emergencia,
      telefone_emergencia,
      alergias,
      medicamentos_em_uso,
      cirurgias_previas,
      tratamento_medico,
      qual_tratamento,
      problemas_cardiacos,
      pressao_alta,
      diabetes,
      problemas_pele,
      gestante,
      lactante,
      fumante,
      bebidas_alcool,
      procedimentos_anteriores,
      resultados_esperados,
      produtos_utilizados,
      reacoes_adversas,
      observacoes_medicas,
      observacoes_gerais
    } = req.body;

    if (!cliente_id) {
      return res.status(400).json({ error: 'cliente_id é obrigatório' });
    }

    const anamnese = await prisma.anamnese.create({
      data: {
        cliente_id,
        profissao,
        estado_civil,
        contato_emergencia,
        telefone_emergencia,
        alergias,
        medicamentos_em_uso,
        cirurgias_previas,
        tratamento_medico,
        qual_tratamento,
        problemas_cardiacos: problemas_cardiacos || false,
        pressao_alta: pressao_alta || false,
        diabetes: diabetes || false,
        problemas_pele,
        gestante: gestante || false,
        lactante: lactante || false,
        fumante: fumante || false,
        bebidas_alcool: bebidas_alcool || false,
        procedimentos_anteriores,
        resultados_esperados,
        produtos_utilizados,
        reacoes_adversas,
        observacoes_medicas,
        observacoes_gerais,
        preenchido: true
      }
    });

    res.status(201).json(anamnese);
  } catch (error) {
    console.error('Erro ao criar anamnese:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/anamnese/:id - Atualizar
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const anamnese = await prisma.anamnese.update({
      where: { id },
      data
    });
    
    res.json(anamnese);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Anamnese não encontrada' });
    }
    console.error('Erro ao atualizar anamnese:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/anamnese/:id - Deletar
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.anamnese.delete({ where: { id } });
    res.json({ message: 'Anamnese removida com sucesso' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Anamnese não encontrada' });
    }
    console.error('Erro ao deletar anamnese:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;