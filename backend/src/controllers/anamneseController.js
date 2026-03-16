import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Listar todas as anamneses
export const getAnamneses = async (req, res) => {
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
};

// Buscar anamnese por ID
export const getAnamneseById = async (req, res) => {
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
};

// Buscar anamnese por cliente
export const getAnamneseByCliente = async (req, res) => {
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
};

// Criar nova anamnese
export const createAnamnese = async (req, res) => {
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
        observacoes_gerais,
        preenchido: true
      }
    });

    res.status(201).json(anamnese);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Atualizar anamnese
export const updateAnamnese = async (req, res) => {
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
    res.status(500).json({ error: error.message });
  }
};

// Deletar anamnese
export const deleteAnamnese = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.anamnese.delete({ where: { id } });
    res.json({ message: 'Anamnese removida com sucesso' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Anamnese não encontrada' });
    }
    res.status(500).json({ error: error.message });
  }
};

// ========== NOVAS FUNÇÕES PARA TOKEN PÚBLICO ==========

// Gerar token único para anamnese
export const gerarTokenAnamnese = async (req, res) => {
  try {
    const { clienteId } = req.params;
    
    // Verificar se cliente existe
    const cliente = await prisma.clientes.findUnique({
      where: { id: clienteId }
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    // Gerar token único
    const crypto = await import('crypto');
    const token = crypto.randomBytes(16).toString('hex');
    
    // Salvar token no cliente (você precisará adicionar campo token_anamnese no model)
    await prisma.clientes.update({
      where: { id: clienteId },
      data: { token_anamnese: token }
    });
    
    // Criar link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const link = `${frontendUrl}/anamnese/publica/${token}`;
    
    res.json({ 
      token,
      link,
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        telefone: cliente.telefone
      }
    });
  } catch (error) {
    console.error('Erro ao gerar token:', error);
    res.status(500).json({ error: error.message });
  }
};

// Validar token e obter dados
export const validarTokenAnamnese = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Buscar cliente pelo token
    const cliente = await prisma.clientes.findFirst({
      where: { token_anamnese: token }
    });
    
    if (!cliente) {
      return res.status(404).json({ error: 'Token inválido ou expirado' });
    }
    
    res.json({ 
      valido: true,
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email
      }
    });
  } catch (error) {
    console.error('Erro ao validar token:', error);
    res.status(500).json({ error: error.message });
  }
};