import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Listar usuários (com filtro por perfil)
export const getUsuarios = async (req, res) => {
  try {
    const { perfil, ativo } = req.query;
    
    const where = {};
    if (perfil) where.perfil = perfil;
    if (ativo) where.ativo = ativo === 'true';

    const usuarios = await prisma.usuarios.findMany({
      where,
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        perfil: true,
        especialidade: true,
        ativo: true
      },
      orderBy: { nome: 'asc' }
    });

    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Criar usuário
export const createUsuario = async (req, res) => {
  try {
    const { nome, email, senha, telefone, perfil, especialidade } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    // Aqui você deve hash a senha com bcrypt
    // const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuarios.create({
      data: {
        nome,
        email,
        senha, // Idealmente: senhaHash
        telefone,
        perfil: perfil || 'atendente',
        especialidade
      }
    });

    // Não retornar a senha
    const { senha: _, ...usuarioSemSenha } = usuario;
    res.status(201).json(usuarioSemSenha);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Atualizar usuário
export const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, telefone } = req.body;

    // Verificar se o usuário existe
    const usuarioExistente = await prisma.usuarios.findUnique({
      where: { id }
    });

    if (!usuarioExistente) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar se email já está em uso por outro usuário
    if (email && email !== usuarioExistente.email) {
      const emailExistente = await prisma.usuarios.findUnique({
        where: { email }
      });
      if (emailExistente) {
        return res.status(400).json({ error: 'Email já está em uso' });
      }
    }

    const usuario = await prisma.usuarios.update({
      where: { id },
      data: {
        nome: nome || undefined,
        email: email || undefined,
        telefone: telefone || undefined
      },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        perfil: true,
        especialidade: true,
        ativo: true
      }
    });

    res.json(usuario);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: error.message });
  }
};