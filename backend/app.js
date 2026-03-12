import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Importar rotas
import servicosRoutes from './routes/servicos.js';
import clientesRoutes from './routes/clientes.js';
// import agendamentosRoutes from './routes/agendamentos.js';
// import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middlewares
app.use(cors());
app.use(express.json());

// Middleware para injetar prisma nas rotas (opcional)
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

// Usar rotas
app.use('/api/servicos', servicosRoutes);
app.use('/api/clientes', clientesRoutes);
// app.use('/api/agendamentos', agendamentosRoutes);
// app.use('/api/auth', authRoutes);

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📝 Teste: http://localhost:${PORT}/api/health`);
  console.log(`👥 Clientes: http://localhost:${PORT}/api/clientes`);
  console.log(`💇 Serviços: http://localhost:${PORT}/api/servicos`);
});