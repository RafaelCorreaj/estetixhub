import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import moment from 'moment';

const prisma = new PrismaClient();

// Função para enviar mensagem (placeholder - depois integrar com WhatsApp)
const enviarMensagem = async (telefone, mensagem) => {
  console.log(`📱 Enviando para ${telefone}: ${mensagem}`);
  // Aqui você vai integrar com a API do WhatsApp depois
  return { success: true };
};

// JOB 1: Aniversariantes - todo dia às 8h
cron.schedule('0 8 * * *', async () => {
  console.log('🎂 Verificando aniversariantes do dia...');
  
  try {
    // Buscar clientes que fazem aniversário hoje
    const aniversariantes = await prisma.$queryRaw`
      SELECT * FROM clientes 
      WHERE to_char(data_nascimento, 'MM-DD') = to_char(CURRENT_DATE, 'MM-DD')
    `;
    
    if (aniversariantes.length === 0) {
      console.log('📭 Nenhum aniversariante hoje');
      return;
    }
    
    // Buscar modelo de aniversário
    const modelo = await prisma.modelos_mensagem.findFirst({
      where: {
        tipo_disparo: 'automatico',
        ativo: true,
        OR: [
          { nome: { contains: 'aniversário', mode: 'insensitive' } },
          { nome: { contains: 'aniversario', mode: 'insensitive' } }
        ]
      }
    });
    
    if (!modelo) {
      console.log('⚠️ Nenhum modelo de aniversário encontrado');
      return;
    }
    
    console.log(`🎂 Encontrados ${aniversariantes.length} aniversariantes`);
    
    // Disparar mensagens
    for (const cliente of aniversariantes) {
      const mensagem = modelo.mensagem.replace('{nome_cliente}', cliente.nome);
      await enviarMensagem(cliente.telefone, mensagem);
      
      // Registrar log
      await prisma.logs_disparo.create({
        data: {
          modelo_id: modelo.id,
          cliente_id: cliente.id,
          mensagem,
          status: 'enviado',
          tipo: 'aniversario'
        }
      });
    }
    
    console.log(`✅ Mensagens de aniversário enviadas para ${aniversariantes.length} clientes`);
    
  } catch (error) {
    console.error('❌ Erro no job de aniversário:', error);
  }
});

// JOB 2: Lembretes de consulta - todo dia às 9h
cron.schedule('0 9 * * *', async () => {
  console.log('📅 Verificando consultas de amanhã...');
  
  try {
    const amanha = moment().add(1, 'day').startOf('day').toDate();
    const fimDoDia = moment().add(1, 'day').endOf('day').toDate();
    
    // Buscar agendamentos de amanhã
    const agendamentos = await prisma.agendamentos.findMany({
      where: {
        data_hora_inicio: {
          gte: amanha,
          lte: fimDoDia
        },
        status: { in: ['confirmado', 'pendente'] }
      },
      include: {
        cliente: true,
        servico: true
      }
    });
    
    if (agendamentos.length === 0) {
      console.log('📭 Nenhuma consulta para amanhã');
      return;
    }
    
    // Buscar modelo de lembrete
    const modelo = await prisma.modelos_mensagem.findFirst({
      where: {
        tipo_disparo: 'automatico',
        ativo: true,
        OR: [
          { nome: { contains: 'lembrete', mode: 'insensitive' } },
          { nome: { contains: 'consulta', mode: 'insensitive' } }
        ]
      }
    });
    
    if (!modelo) {
      console.log('⚠️ Nenhum modelo de lembrete encontrado');
      return;
    }
    
    console.log(`📅 Encontrados ${agendamentos.length} agendamentos para amanhã`);
    
    // Disparar mensagens
    for (const ag of agendamentos) {
      const hora = moment(ag.data_hora_inicio).format('HH:mm');
      const mensagem = modelo.mensagem
        .replace('{nome_cliente}', ag.cliente.nome)
        .replace('{hora}', hora);
      
      await enviarMensagem(ag.cliente.telefone, mensagem);
      
      // Registrar log
      await prisma.logs_disparo.create({
        data: {
          modelo_id: modelo.id,
          cliente_id: ag.cliente.id,
          agendamento_id: ag.id,
          mensagem,
          status: 'enviado',
          tipo: 'lembrete'
        }
      });
      
      // Marcar que o lembrete foi enviado
      await prisma.agendamentos.update({
        where: { id: ag.id },
        data: { lembrete_enviado: true }
      });
    }
    
    console.log(`✅ Lembretes enviados para ${agendamentos.length} clientes`);
    
  } catch (error) {
    console.error('❌ Erro no job de lembretes:', error);
  }
});

// JOB 3: Clientes inativos - todo dia 1º do mês às 10h
cron.schedule('0 10 1 * *', async () => {
  console.log('🔍 Verificando clientes inativos...');
  
  try {
    const trintaDiasAtras = moment().subtract(30, 'days').toDate();
    
    const clientesInativos = await prisma.clientes.findMany({
      where: {
        agendamentos: {
          none: {
            data_hora_inicio: { gte: trintaDiasAtras }
          }
        }
      }
    });
    
    if (clientesInativos.length === 0) {
      console.log('📭 Nenhum cliente inativo encontrado');
      return;
    }
    
    console.log(`🔍 Encontrados ${clientesInativos.length} clientes inativos`);
    
  } catch (error) {
    console.error('❌ Erro no job de inativos:', error);
  }
});

console.log('⏰ Jobs automáticos iniciados:');
console.log('   - Aniversariantes: 08:00 diariamente');
console.log('   - Lembretes: 09:00 diariamente');
console.log('   - Inativos: 10:00 no dia 1 de cada mês');

export default cron;