import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Calendar, 
  FileText, 
  Download, 
  ChevronRight,
  AlertCircle,
  Pill,
  Heart,
  Activity,
  Scissors,
  Loader2
} from 'lucide-react';
import moment from 'moment';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function HistoricoAnamnese({ clienteId }) {
  const [selectedAnamnese, setSelectedAnamnese] = useState(null);
  const [compararIds, setCompararIds] = useState([]);
  const [showComparacao, setShowComparacao] = useState(false);

  // Buscar histórico do cliente
  const { data: historico = [], isLoading } = useQuery({
    queryKey: ['anamnese', clienteId],
    queryFn: () => api.getAnamneseByCliente(clienteId),
  });

    const gerarPDF = (anamnese) => {
    try {
        const doc = new jsPDF();
        let y = 20;
        
        // Título principal com fundo colorido
        doc.setFillColor(93, 38, 138);
        doc.rect(0, 0, 210, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('FICHA DE ANAMNESE - ESTETIXHUB', 20, 10);
        
        // Linha decorativa
        doc.setTextColor(93, 38, 138);
        doc.setDrawColor(93, 38, 138);
        doc.line(20, y, 190, y);
        y += 5;
        
        // Cabeçalho do cliente
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text('DADOS DO CLIENTE', 20, y);
        y += 5;
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Nome: ${anamnese.cliente?.nome || 'Não informado'}`, 25, y);
        y += 6;
        doc.text(`Data da avaliação: ${moment(anamnese.data_preenchimento).format('DD/MM/YYYY [às] HH:mm')}`, 25, y);
        y += 8;
        
        // Seção 1: Informações Gerais
        doc.setDrawColor(200, 200, 200);
        doc.line(20, y, 190, y);
        y += 5;
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(93, 38, 138);
        doc.text('1. INFORMAÇÕES GERAIS', 20, y);
        y += 6;
        
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        
        const infoGerais = [
        { label: 'Profissão', value: anamnese.profissao },
        { label: 'Estado Civil', value: anamnese.estado_civil },
        { label: 'Contato Emergência', value: anamnese.contato_emergencia },
        { label: 'Telefone Emergência', value: anamnese.telefone_emergencia }
        ];
        
        infoGerais.forEach(item => {
        if (item.value) {
            doc.text(`${item.label}: ${item.value}`, 25, y);
            y += 6;
        }
        });
        
        if (infoGerais.every(i => !i.value)) {
        doc.text('Nenhuma informação cadastrada', 25, y);
        y += 6;
        }
        y += 2;
        
        // Seção 2: Histórico Médico
        doc.line(20, y, 190, y);
        y += 5;
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(93, 38, 138);
        doc.text('2. HISTÓRICO MÉDICO', 20, y);
        y += 6;
        
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        
        const historico = [
        { label: 'Alergias', value: anamnese.alergias },
        { label: 'Medicamentos em uso', value: anamnese.medicamentos_em_uso },
        { label: 'Cirurgias prévias', value: anamnese.cirurgias_previas },
        { label: 'Tratamento médico atual', value: anamnese.tratamento_medico ? 'Sim' : 'Não' }
        ];
        
        historico.forEach(item => {
        if (item.value && item.value !== 'Não') {
            doc.text(`${item.label}: ${item.value}`, 25, y);
            y += 6;
        } else if (item.label === 'Tratamento médico atual' && anamnese.tratamento_medico) {
            doc.text(`${item.label}: Sim`, 25, y);
            y += 6;
            if (anamnese.qual_tratamento) {
            doc.text(`Qual: ${anamnese.qual_tratamento}`, 30, y);
            y += 6;
            }
        }
        });
        y += 2;
        
        // Seção 3: Condições Específicas
        doc.line(20, y, 190, y);
        y += 5;
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(93, 38, 138);
        doc.text('3. CONDIÇÕES ESPECÍFICAS', 20, y);
        y += 6;
        
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        
        const condicoes = [
        { label: 'Problemas cardíacos', value: anamnese.problemas_cardiacos },
        { label: 'Pressão alta', value: anamnese.pressao_alta },
        { label: 'Diabetes', value: anamnese.diabetes },
        { label: 'Gestante', value: anamnese.gestante },
        { label: 'Lactante', value: anamnese.lactante },
        { label: 'Fumante', value: anamnese.fumante },
        { label: 'Consome álcool', value: anamnese.bebidas_alcool }
        ];
        
        let temCondicoes = false;
        condicoes.forEach(item => {
        if (item.value) {
            doc.text(`${item.label}: Sim`, 25, y);
            y += 6;
            temCondicoes = true;
        }
        });
        
        if (anamnese.problemas_pele) {
        doc.text(`Problemas de pele: ${anamnese.problemas_pele}`, 25, y);
        y += 6;
        temCondicoes = true;
        }
        
        if (!temCondicoes) {
        doc.text('Nenhuma condição específica informada', 25, y);
        y += 6;
        }
        y += 2;
        
        // Seção 4: Histórico Estético
        doc.line(20, y, 190, y);
        y += 5;
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(93, 38, 138);
        doc.text('4. HISTÓRICO ESTÉTICO', 20, y);
        y += 6;
        
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        
        const estetico = [
        { label: 'Procedimentos anteriores', value: anamnese.procedimentos_anteriores },
        { label: 'Resultados esperados', value: anamnese.resultados_esperados },
        { label: 'Produtos utilizados', value: anamnese.produtos_utilizados },
        { label: 'Reações adversas', value: anamnese.reacoes_adversas }
        ];
        
        let temEstetico = false;
        estetico.forEach(item => {
        if (item.value) {
            doc.text(`${item.label}: ${item.value}`, 25, y);
            y += 6;
            temEstetico = true;
        }
        });
        
        if (!temEstetico) {
        doc.text('Nenhum histórico estético cadastrado', 25, y);
        y += 6;
        }
        y += 2;
        
        // Seção 5: Observações
        if (anamnese.observacoes_medicas || anamnese.observacoes_gerais) {
        doc.line(20, y, 190, y);
        y += 5;
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(93, 38, 138);
        doc.text('5. OBSERVAÇÕES', 20, y);
        y += 6;
        
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        
        if (anamnese.observacoes_medicas) {
            doc.text('Observações médicas:', 25, y);
            y += 5;
            const obsMedicas = doc.splitTextToSize(anamnese.observacoes_medicas, 160);
            obsMedicas.forEach(line => {
            doc.text(line, 25, y);
            y += 5;
            });
            y += 3;
        }
        
        if (anamnese.observacoes_gerais) {
            doc.text('Observações gerais:', 25, y);
            y += 5;
            const obsGerais = doc.splitTextToSize(anamnese.observacoes_gerais, 160);
            obsGerais.forEach(line => {
            doc.text(line, 25, y);
            y += 5;
            });
        }
        }
        
        // Rodapé
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 270, 190, 270);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Documento gerado pelo EstetixHub - Sistema de Gestão para Clínicas de Estética', 20, 280);
        doc.text(`Gerado em: ${moment().format('DD/MM/YYYY HH:mm')}`, 20, 285);
        
        // Salvar PDF
        const nomeArquivo = `anamnese-${anamnese.cliente?.nome || 'cliente'}-${moment().format('YYYYMMDD')}.pdf`;
        doc.save(nomeArquivo);
        
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        alert('Erro ao gerar PDF. Tente novamente.');
    }
    };

  // Componente de comparação
  const CompararAnamneses = () => {
    if (compararIds.length !== 2) return null;

    const [id1, id2] = compararIds;
    const a1 = historico.find(h => h.id === id1);
    const a2 = historico.find(h => h.id === id2);

    if (!a1 || !a2) return null;

    const compararCampo = (label, campo, tipo = 'texto') => {
      if (tipo === 'booleano') {
        const val1 = a1[campo] ? '✅ Sim' : '❌ Não';
        const val2 = a2[campo] ? '✅ Sim' : '❌ Não';
        return (
          <div className="grid grid-cols-2 gap-4 py-2 border-b">
            <div className="font-medium text-gray-600">{label}</div>
            <div className="grid grid-cols-2 gap-4">
              <div className={a1[campo] !== a2[campo] ? 'bg-yellow-50 p-2 rounded' : ''}>
                {val1}
              </div>
              <div className={a1[campo] !== a2[campo] ? 'bg-yellow-50 p-2 rounded' : ''}>
                {val2}
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="grid grid-cols-2 gap-4 py-2 border-b">
          <div className="font-medium text-gray-600">{label}</div>
          <div className="grid grid-cols-2 gap-4">
            <div className={a1[campo] !== a2[campo] ? 'bg-yellow-50 p-2 rounded' : ''}>
              {a1[campo] || '-'}
            </div>
            <div className={a1[campo] !== a2[campo] ? 'bg-yellow-50 p-2 rounded' : ''}>
              {a2[campo] || '-'}
            </div>
          </div>
        </div>
      );
    };

    return (
      <Dialog open={showComparacao} onOpenChange={setShowComparacao}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comparar Evoluções</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center font-bold">
              <div className="text-purple-600">
                {moment(a1.data_preenchimento).format('DD/MM/YYYY HH:mm')}
              </div>
              <div className="text-pink-600">
                {moment(a2.data_preenchimento).format('DD/MM/YYYY HH:mm')}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Informações Gerais</h3>
              {compararCampo('Profissão', 'profissao')}
              {compararCampo('Estado Civil', 'estado_civil')}
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Histórico Médico</h3>
              {compararCampo('Alergias', 'alergias')}
              {compararCampo('Medicamentos', 'medicamentos_em_uso')}
              {compararCampo('Cirurgias', 'cirurgias_previas')}
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Condições</h3>
              {compararCampo('Problemas Cardíacos', 'problemas_cardiacos', 'booleano')}
              {compararCampo('Pressão Alta', 'pressao_alta', 'booleano')}
              {compararCampo('Diabetes', 'diabetes', 'booleano')}
              {compararCampo('Gestante', 'gestante', 'booleano')}
              {compararCampo('Lactante', 'lactante', 'booleano')}
              {compararCampo('Fumante', 'fumante', 'booleano')}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho com opções */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Histórico de Anamneses ({historico.length})
        </h2>
        {historico.length >= 2 && (
          <div className="flex items-center gap-2">
            <Select
              value={compararIds[0] || ''}
              onValueChange={(v) => setCompararIds([v, compararIds[1]].filter(Boolean))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecionar 1ª" />
              </SelectTrigger>
              <SelectContent>
                {historico.map((h) => (
                  <SelectItem key={h.id} value={h.id}>
                    {moment(h.data_preenchimento).format('DD/MM/YYYY')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={compararIds[1] || ''}
              onValueChange={(v) => setCompararIds([compararIds[0], v].filter(Boolean))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecionar 2ª" />
              </SelectTrigger>
              <SelectContent>
                {historico.map((h) => (
                  <SelectItem key={h.id} value={h.id}>
                    {moment(h.data_preenchimento).format('DD/MM/YYYY')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={() => setShowComparacao(true)}
              disabled={compararIds.length !== 2}
              variant="outline"
            >
              Comparar
            </Button>
          </div>
        )}
      </div>

      {/* Lista de Anamneses */}
      <div className="space-y-4">
        {historico.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <span className="font-medium">
                      {moment(item.data_preenchimento).format('DD/MM/YYYY HH:mm')}
                    </span>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                      {item.preenchido ? 'Preenchida' : 'Pendente'}
                    </Badge>
                  </div>

                  {/* Indicadores rápidos */}
                  <div className="flex flex-wrap gap-3">
                    {item.alergias && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <AlertCircle className="w-3 h-3 text-red-400" />
                        Alergias
                      </div>
                    )}
                    {item.medicamentos_em_uso && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Pill className="w-3 h-3 text-blue-400" />
                        Medicamentos
                      </div>
                    )}
                    {item.problemas_cardiacos && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Heart className="w-3 h-3 text-red-400" />
                        Cardíaco
                      </div>
                    )}
                    {item.diabetes && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Activity className="w-3 h-3 text-orange-400" />
                        Diabetes
                      </div>
                    )}
                    {item.procedimentos_anteriores && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Scissors className="w-3 h-3 text-purple-400" />
                        Procedimentos
                      </div>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => gerarPDF(item)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAnamnese(item)}
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal para visualizar anamnese completa */}
      <Dialog open={!!selectedAnamnese} onOpenChange={() => setSelectedAnamnese(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Anamnese - {moment(selectedAnamnese?.data_preenchimento).format('DD/MM/YYYY HH:mm')}
            </DialogTitle>
          </DialogHeader>
          
          {selectedAnamnese && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Informações Gerais</h3>
                  <p className="text-sm"><span className="text-gray-600">Profissão:</span> {selectedAnamnese.profissao || '-'}</p>
                  <p className="text-sm"><span className="text-gray-600">Estado Civil:</span> {selectedAnamnese.estado_civil || '-'}</p>
                  <p className="text-sm"><span className="text-gray-600">Contato:</span> {selectedAnamnese.contato_emergencia || '-'}</p>
                  <p className="text-sm"><span className="text-gray-600">Telefone:</span> {selectedAnamnese.telefone_emergencia || '-'}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Histórico Médico</h3>
                  <p className="text-sm"><span className="text-gray-600">Alergias:</span> {selectedAnamnese.alergias || '-'}</p>
                  <p className="text-sm"><span className="text-gray-600">Medicamentos:</span> {selectedAnamnese.medicamentos_em_uso || '-'}</p>
                  <p className="text-sm"><span className="text-gray-600">Cirurgias:</span> {selectedAnamnese.cirurgias_previas || '-'}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Condições</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-600">Problemas cardíacos:</span> {selectedAnamnese.problemas_cardiacos ? 'Sim' : 'Não'}</div>
                  <div><span className="text-gray-600">Pressão alta:</span> {selectedAnamnese.pressao_alta ? 'Sim' : 'Não'}</div>
                  <div><span className="text-gray-600">Diabetes:</span> {selectedAnamnese.diabetes ? 'Sim' : 'Não'}</div>
                  <div><span className="text-gray-600">Gestante:</span> {selectedAnamnese.gestante ? 'Sim' : 'Não'}</div>
                  <div><span className="text-gray-600">Lactante:</span> {selectedAnamnese.lactante ? 'Sim' : 'Não'}</div>
                  <div><span className="text-gray-600">Fumante:</span> {selectedAnamnese.fumante ? 'Sim' : 'Não'}</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Observações</h3>
                <p className="text-sm whitespace-pre-line">{selectedAnamnese.observacoes_gerais || '-'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Componente de comparação */}
      <CompararAnamneses />
    </div>
  );
}