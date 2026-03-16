import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';


// Importar rotas
import servicosRoutes from './routes/servicos.js';
import clientesRoutes from './routes/clientes.js';
import anamneseRoutes from './routes/anamnese.js';
import marketingRoutes from './routes/marketing.js';
import agendamentosRoutes from './routes/agendamentos.js';
import usuariosRoutes from './routes/usuarios.js';
import authRoutes from './routes/auth.js';
import './jobs/marketingJobs.js';  // NOVA ROTA

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Usar rotas
app.use('/api/servicos', servicosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/anamnese', anamneseRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/agendamentos', agendamentosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/auth', authRoutes);  // NOVA ROTA

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📝 Teste: http://localhost:${PORT}/api/health`);
  console.log(`👥 Clientes: http://localhost:${PORT}/api/clientes`);
  console.log(`💇 Serviços: http://localhost:${PORT}/api/servicos`);
  console.log(`📋 Anamnese: http://localhost:${PORT}/api/anamnese`);
  console.log(`📱 Marketing: http://localhost:${PORT}/api/marketing/posts`); 
  console.log(`📅 Agendamentos: http://localhost:${PORT}/api/agendamentos`);
  console.log(`👤 Usuários: http://localhost:${PORT}/api/usuarios`);  // NOVO
});