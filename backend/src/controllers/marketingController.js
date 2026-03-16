import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ========== POSTS ==========

// Listar todos os posts
export const getPosts = async (req, res) => {
  try {
    const { status, rede_social } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (rede_social) where.rede_social = rede_social;

    const posts = await prisma.posts_marketing.findMany({
      where,
      orderBy: { data_programada: 'asc' }
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Buscar post por ID
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await prisma.posts_marketing.findUnique({
      where: { id }
    });
    if (!post) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Criar novo post
export const createPost = async (req, res) => {
  try {
    const { titulo, descricao, data_programada, rede_social, status, imagem_url } = req.body;

    if (!titulo) {
      return res.status(400).json({ error: 'Título é obrigatório' });
    }

    const post = await prisma.posts_marketing.create({
      data: {
        titulo,
        descricao,
        data_programada: data_programada ? new Date(data_programada) : null,
        rede_social,
        status: status || 'rascunho',
        imagem_url
      }
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Atualizar post
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, data_programada, rede_social, status, imagem_url } = req.body;

    const post = await prisma.posts_marketing.update({
      where: { id },
      data: {
        titulo,
        descricao,
        data_programada: data_programada ? new Date(data_programada) : null,
        rede_social,
        status,
        imagem_url
      }
    });

    res.json(post);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Post não encontrado' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Deletar post
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.posts_marketing.delete({ where: { id } });
    res.json({ message: 'Post removido com sucesso' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Post não encontrado' });
    }
    res.status(500).json({ error: error.message });
  }
};

// ========== MODELOS DE MENSAGEM ==========

// Listar todos os modelos
export const getModelos = async (req, res) => {
  try {
    const { ativo, tipo_disparo } = req.query;
    
    const where = {};
    if (ativo !== undefined) where.ativo = ativo === 'true';
    if (tipo_disparo) where.tipo_disparo = tipo_disparo;

    const modelos = await prisma.modelos_mensagem.findMany({
      where,
      orderBy: { nome: 'asc' }
    });
    res.json(modelos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Buscar modelo por ID
export const getModeloById = async (req, res) => {
  try {
    const { id } = req.params;
    const modelo = await prisma.modelos_mensagem.findUnique({
      where: { id }
    });
    if (!modelo) {
      return res.status(404).json({ error: 'Modelo não encontrado' });
    }
    res.json(modelo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Criar novo modelo
export const createModelo = async (req, res) => {
  try {
    const { nome, mensagem, tipo_disparo, trigger_dias, ativo } = req.body;

    if (!nome || !mensagem) {
      return res.status(400).json({ error: 'Nome e mensagem são obrigatórios' });
    }

    const modelo = await prisma.modelos_mensagem.create({
      data: {
        nome,
        mensagem,
        tipo_disparo: tipo_disparo || 'manual',
        trigger_dias: trigger_dias || 0,
        ativo: ativo !== false
      }
    });

    res.status(201).json(modelo);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Já existe um modelo com este nome' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Atualizar modelo
export const updateModelo = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, mensagem, tipo_disparo, trigger_dias, ativo } = req.body;

    const modelo = await prisma.modelos_mensagem.update({
      where: { id },
      data: {
        nome,
        mensagem,
        tipo_disparo,
        trigger_dias,
        ativo
      }
    });

    res.json(modelo);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Modelo não encontrado' });
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Já existe um modelo com este nome' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Deletar modelo
export const deleteModelo = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.modelos_mensagem.delete({ where: { id } });
    res.json({ message: 'Modelo removido com sucesso' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Modelo não encontrado' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Upload de imagem para post
export const uploadImagemPost = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const imagemUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      message: 'Upload realizado com sucesso',
      imagemUrl
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Disparo manual de mensagem
export const dispararMensagemManual = async (req, res) => {
  try {
    const { modeloId, clienteIds } = req.body;

    if (!modeloId || !clienteIds || clienteIds.length === 0) {
      return res.status(400).json({ 
        error: 'Modelo e lista de clientes são obrigatórios' 
      });
    }

    // Buscar modelo
    const modelo = await prisma.modelos_mensagem.findUnique({
      where: { id: modeloId }
    });

    if (!modelo) {
      return res.status(404).json({ error: 'Modelo não encontrado' });
    }

    // Buscar clientes
    const clientes = await prisma.clientes.findMany({
      where: {
        id: { in: clienteIds }
      }
    });

    // Simular envio (aqui você integraria com API do WhatsApp)
    const disparos = clientes.map(cliente => {
      // Substituir variáveis no template
      let mensagem = modelo.mensagem
        .replace('{nome_cliente}', cliente.nome)
        .replace('{telefone}', cliente.telefone || '');

      console.log(`📱 Enviando para ${cliente.nome}: ${mensagem}`);
      
      return {
        clienteId: cliente.id,
        clienteNome: cliente.nome,
        mensagem,
        status: 'simulado'
      };
    });

    // Registrar logs
    for (const disparo of disparos) {
      await prisma.logs_disparo.create({
        data: {
          modelo_id: modeloId,
          cliente_id: disparo.clienteId,
          mensagem: disparo.mensagem,
          status: 'simulado',
          tipo: 'manual'
        }
      });
    }

    res.json({
      message: `Mensagens simuladas para ${disparos.length} clientes`,
      disparos
    });

  } catch (error) {
    console.error('Erro no disparo manual:', error);
    res.status(500).json({ error: error.message });
  }
};

// ========== ESTATÍSTICAS (SEM MOMENT) ==========
export const getEstatisticas = async (req, res) => {
  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());
    
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    // Total de disparos
    const totalDisparos = await prisma.logs_disparo.count();
    
    // Disparos hoje
    const disparosHoje = await prisma.logs_disparo.count({
      where: {
        created_at: { gte: hoje }
      }
    });

    // Disparos por tipo
    const disparosPorTipo = await prisma.logs_disparo.groupBy({
      by: ['tipo'],
      _count: true
    });

    // Disparos por status
    const disparosPorStatus = await prisma.logs_disparo.groupBy({
      by: ['status'],
      _count: true
    });

    // Aniversariantes do mês
    const aniversariantesMes = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM clientes 
      WHERE EXTRACT(MONTH FROM data_nascimento) = EXTRACT(MONTH FROM CURRENT_DATE)
    `;

    // Posts por status
    const postsPorStatus = await prisma.posts_marketing.groupBy({
      by: ['status'],
      _count: true
    });

    // Últimos disparos
    const ultimosDisparos = await prisma.logs_disparo.findMany({
      take: 10,
      orderBy: { created_at: 'desc' },
      include: {
        cliente: {
          select: { nome: true, telefone: true }
        },
        modelo: {
          select: { nome: true }
        }
      }
    });

    res.json({
      totalDisparos,
      disparosHoje,
      disparosPorTipo,
      disparosPorStatus,
      aniversariantesMes: Number(aniversariantesMes[0]?.count || 0),
      postsPorStatus,
      ultimosDisparos,
      periodo: {
        hoje: hoje.toISOString().split('T')[0],
        inicioSemana: inicioSemana.toISOString().split('T')[0],
        inicioMes: inicioMes.toISOString().split('T')[0]
      }
    });

  } catch (error) {
    console.error('Erro nas estatísticas:', error);
    res.status(500).json({ error: error.message });
  }
};