import express from 'express';
import { PrismaClient } from '@prisma/client';
import { upload } from '../middleware/upload.js';
import { 
  uploadImagemPost, 
  dispararMensagemManual,
  getEstatisticas  // 👈 IMPORT ADICIONADO AQUI!
} from '../controllers/marketingController.js';

const router = express.Router();
const prisma = new PrismaClient();

// ========== ROTAS DE POSTS ==========

// GET /api/marketing/posts - Listar todos os posts
router.get('/posts', async (req, res) => {
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
});

// GET /api/marketing/posts/:id - Buscar post por ID
router.get('/posts/:id', async (req, res) => {
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
});

// POST /api/marketing/posts - Criar novo post
router.post('/posts', async (req, res) => {
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
});

// PUT /api/marketing/posts/:id - Atualizar post
router.put('/posts/:id', async (req, res) => {
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
});

// DELETE /api/marketing/posts/:id - Deletar post
router.delete('/posts/:id', async (req, res) => {
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
});

// ========== ROTAS DE MODELOS ==========

// GET /api/marketing/modelos - Listar todos os modelos
router.get('/modelos', async (req, res) => {
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
});

// GET /api/marketing/modelos/:id - Buscar modelo por ID
router.get('/modelos/:id', async (req, res) => {
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
});

// POST /api/marketing/modelos - Criar novo modelo
router.post('/modelos', async (req, res) => {
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
});

// PUT /api/marketing/modelos/:id - Atualizar modelo
router.put('/modelos/:id', async (req, res) => {
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
});

// DELETE /api/marketing/modelos/:id - Deletar modelo
router.delete('/modelos/:id', async (req, res) => {
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
});

// ========== ROTAS DE DISPARO E UPLOAD ==========

// Rota de disparo manual
router.post('/disparar/manual', dispararMensagemManual);

// Rota de upload
router.post('/upload', upload.single('imagem'), uploadImagemPost);

// ========== ROTA DE ESTATÍSTICAS ==========
// Agora com a função importada corretamente!
router.get('/estatisticas', getEstatisticas);

export default router;