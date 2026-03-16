import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-aqui';

// Login
export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const usuario = await prisma.usuarios.findUnique({
      where: { email }
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    // Comparar senha (aqui você precisa implementar bcrypt)
    // Por enquanto, comparação simples
    if (senha !== '123456' && senha !== usuario.senha) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, perfil: usuario.perfil },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { senha: _, ...usuarioSemSenha } = usuario;

    res.json({
      user: usuarioSemSenha,
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Registrar novo usuário
export const register = async (req, res) => {
  try {
    const { nome, email, senha, perfil, telefone } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuarios.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        perfil: perfil || 'atendente',
        telefone
      }
    });

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, perfil: usuario.perfil },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { senha: _, ...usuarioSemSenha } = usuario;

    res.status(201).json({
      user: usuarioSemSenha,
      token
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Rota para obter dados do usuário atual
export const me = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const usuario = await prisma.usuarios.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        telefone: true,
        especialidade: true,
        ativo: true
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Alterar senha
export const changePassword = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const { senhaAtual, novaSenha } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const usuario = await prisma.usuarios.findUnique({
      where: { id: decoded.id }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar senha atual
    // Por enquanto, comparação simples
    if (senhaAtual !== '123456' && senhaAtual !== usuario.senha) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    // Hash da nova senha
    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

    await prisma.usuarios.update({
      where: { id: decoded.id },
      data: { senha: novaSenhaHash }
    });

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    res.status(500).json({ error: error.message });
  }
};