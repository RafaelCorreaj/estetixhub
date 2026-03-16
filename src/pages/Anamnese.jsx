import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { CheckCircle2, Loader2, Calendar, FileText, Download, ChevronDown, Edit, Trash2, Lock } from 'lucide-react';
import moment from 'moment';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useAuth } from '@/lib/AuthContext';

// Componente de Formulário (para criação e edição)
function AnamneseFormulario({ clienteId, anamneseParaEditar, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("geral");
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    profissao: anamneseParaEditar?.profissao || '',
    estado_civil: anamneseParaEditar?.estado_civil || '',
    contato_emergencia: anamneseParaEditar?.contato_emergencia || '',
    telefone_emergencia: anamneseParaEditar?.telefone_emergencia || '',
    alergias: anamneseParaEditar?.alergias || '',
    medicamentos_em_uso: anamneseParaEditar?.medicamentos_em_uso || '',
    cirurgias_previas: anamneseParaEditar?.cirurgias_previas || '',
    tratamento_medico: anamneseParaEditar?.tratamento_medico || false,
    qual_tratamento: anamneseParaEditar?.qual_tratamento || '',
    problemas_cardiacos: anamneseParaEditar?.problemas_cardiacos || false,
    pressao_alta: anamneseParaEditar?.pressao_alta || false,
    diabetes: anamneseParaEditar?.diabetes || false,
    problemas_pele: anamneseParaEditar?.problemas_pele || '',
    gestante: anamneseParaEditar?.gestante || false,
    lactante: anamneseParaEditar?.lactante || false,
    fumante: anamneseParaEditar?.fumante || false,
    bebidas_alcool: anamneseParaEditar?.bebidas_alcool || false,
    procedimentos_anteriores: anamneseParaEditar?.procedimentos_anteriores || '',
    resultados_esperados: anamneseParaEditar?.resultados_esperados || '',
    produtos_utilizados: anamneseParaEditar?.produtos_utilizados || '',
    reacoes_adversas: anamneseParaEditar?.reacoes_adversas || '',
    observacoes_medicas: anamneseParaEditar?.observacoes_medicas || '',
    observacoes_gerais: anamneseParaEditar?.observacoes_gerais || '',
  });

  // Definição dos campos obrigatórios
  const camposObrigatorios = {
    profissao: true,
    estado_civil: true,
    contato_emergencia: true,
    telefone_emergencia: true,
  };

  // Função para verificar se o formulário é válido
  const isFormValid = () => {
    for (const campo in camposObrigatorios) {
      if (camposObrigatorios[campo] && !form[campo]) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (anamneseParaEditar) {
        // Atualizar anamnese existente
        await api.updateAnamnese(anamneseParaEditar.id, {
          cliente_id: clienteId,
          ...form
        });
        queryClient.invalidateQueries({ queryKey: ['anamneses'] });
      } else {
        // Criar nova anamnese
        await api.createAnamnese({
          cliente_id: clienteId,
          ...form
        });
      }
      
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (error) {
      console.error('Erro detalhado:', error);
      alert(`Erro ao salvar: ${error.message || 'Tente novamente.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <Alert className="bg-emerald-50 border-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertDescription>
            Anamnese {anamneseParaEditar ? 'atualizada' : 'salva'} com sucesso!
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="medico">Médico</TabsTrigger>
          <TabsTrigger value="condicoes">Condições</TabsTrigger>
          <TabsTrigger value="estetico">Estético</TabsTrigger>
          <TabsTrigger value="observacoes">Obs</TabsTrigger>
        </TabsList>

        {/* Aba 1: Informações Gerais */}
        <TabsContent value="geral" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Profissão <span className="text-red-500">*</span></Label>
                <Input 
                  value={form.profissao} 
                  onChange={(e) => setForm({...form, profissao: e.target.value})} 
                  placeholder="Ex: Advogada, Médica..."
                  className={!form.profissao ? 'border-red-200 focus:border-red-500' : ''}
                />
              </div>
              <div className="space-y-2">
                <Label>Estado Civil <span className="text-red-500">*</span></Label>
                <Select value={form.estado_civil} onValueChange={(v) => setForm({...form, estado_civil: v})}>
                  <SelectTrigger className={!form.estado_civil ? 'border-red-200' : ''}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                    <SelectItem value="casado">Casado(a)</SelectItem>
                    <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                    <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Contato de Emergência <span className="text-red-500">*</span></Label>
                <Input 
                  value={form.contato_emergencia} 
                  onChange={(e) => setForm({...form, contato_emergencia: e.target.value})} 
                  placeholder="Nome completo"
                  className={!form.contato_emergencia ? 'border-red-200' : ''}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone de Emergência <span className="text-red-500">*</span></Label>
                <Input 
                  value={form.telefone_emergencia} 
                  onChange={(e) => setForm({...form, telefone_emergencia: e.target.value})} 
                  placeholder="(11) 99999-9999"
                  className={!form.telefone_emergencia ? 'border-red-200' : ''}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba 2: Histórico Médico */}
        <TabsContent value="medico" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Alergias</Label>
                <Textarea value={form.alergias} onChange={(e) => setForm({...form, alergias: e.target.value})} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Medicamentos em uso</Label>
                <Textarea value={form.medicamentos_em_uso} onChange={(e) => setForm({...form, medicamentos_em_uso: e.target.value})} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Cirurgias prévias</Label>
                <Textarea value={form.cirurgias_previas} onChange={(e) => setForm({...form, cirurgias_previas: e.target.value})} rows={2} />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.tratamento_medico} onCheckedChange={(v) => setForm({...form, tratamento_medico: v})} />
                <Label>Faz tratamento médico atualmente?</Label>
              </div>
              {form.tratamento_medico && (
                <div className="space-y-2">
                  <Label>Qual(is) tratamento(s)?</Label>
                  <Input value={form.qual_tratamento} onChange={(e) => setForm({...form, qual_tratamento: e.target.value})} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba 3: Condições Específicas */}
        <TabsContent value="condicoes" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Switch checked={form.problemas_cardiacos} onCheckedChange={(v) => setForm({...form, problemas_cardiacos: v})} />
                <Label>Problemas cardíacos</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.pressao_alta} onCheckedChange={(v) => setForm({...form, pressao_alta: v})} />
                <Label>Pressão alta</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.diabetes} onCheckedChange={(v) => setForm({...form, diabetes: v})} />
                <Label>Diabetes</Label>
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Problemas de pele</Label>
                <Input value={form.problemas_pele} onChange={(e) => setForm({...form, problemas_pele: e.target.value})} />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.gestante} onCheckedChange={(v) => setForm({...form, gestante: v})} />
                <Label>Gestante</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.lactante} onCheckedChange={(v) => setForm({...form, lactante: v})} />
                <Label>Lactante</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.fumante} onCheckedChange={(v) => setForm({...form, fumante: v})} />
                <Label>Fumante</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.bebidas_alcool} onCheckedChange={(v) => setForm({...form, bebidas_alcool: v})} />
                <Label>Consome bebidas alcoólicas</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba 4: Histórico Estético */}
        <TabsContent value="estetico" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Procedimentos anteriores</Label>
                <Textarea value={form.procedimentos_anteriores} onChange={(e) => setForm({...form, procedimentos_anteriores: e.target.value})} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Resultados esperados</Label>
                <Textarea value={form.resultados_esperados} onChange={(e) => setForm({...form, resultados_esperados: e.target.value})} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Produtos utilizados</Label>
                <Textarea value={form.produtos_utilizados} onChange={(e) => setForm({...form, produtos_utilizados: e.target.value})} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Reações adversas</Label>
                <Textarea value={form.reacoes_adversas} onChange={(e) => setForm({...form, reacoes_adversas: e.target.value})} rows={2} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba 5: Observações */}
        <TabsContent value="observacoes" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Observações médicas</Label>
                <Textarea value={form.observacoes_medicas} onChange={(e) => setForm({...form, observacoes_medicas: e.target.value})} rows={4} />
              </div>
              <div className="space-y-2">
                <Label>Observações gerais</Label>
                <Textarea value={form.observacoes_gerais} onChange={(e) => setForm({...form, observacoes_gerais: e.target.value})} rows={4} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={loading || !isFormValid()}
          className={`bg-gradient-to-r from-purple-600 to-pink-500 ${(!isFormValid() && !loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Salvando...' : (anamneseParaEditar ? 'Atualizar' : 'Salvar')}
        </Button>
      </div>
    </form>
  );
}

// Componente de Confirmação de Senha para Exclusão
function ConfirmarExclusaoDialog({ open, onOpenChange, onConfirm, loading }) {
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const { user } = useAuth();

  const handleConfirm = () => {
    // Aqui você pode implementar a verificação real da senha
    // Por enquanto, vamos usar uma senha fixa para teste: "123456"
    if (senha === '123456') {
      setErro('');
      onConfirm();
    } else {
      setErro('Senha incorreta');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-500" />
            Confirmar exclusão
          </DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. Digite sua senha para confirmar.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Senha</Label>
            <Input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••"
              onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
            />
            {erro && <p className="text-sm text-red-500">{erro}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={loading || !senha}
          >
            {loading ? 'Excluindo...' : 'Confirmar exclusão'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Componente de Histórico com visualização em pastas
function HistoricoAnamnese({ clienteId, onEdit }) {
  const [visualizandoAnamnese, setVisualizandoAnamnese] = useState(null);
  const [pastaAberta, setPastaAberta] = useState(null);
  const [excluirId, setExcluirId] = useState(null);
  const [excluirLoading, setExcluirLoading] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: anamneses = [], isLoading } = useQuery({
    queryKey: ['anamneses', clienteId],
    queryFn: () => clienteId ? api.getAnamneseByCliente(clienteId) : api.getAnamneses(),
  });

  // Agrupar anamneses por cliente
  const anamnesesPorCliente = useMemo(() => {
    const grupos = {};
    
    anamneses.forEach(anamnese => {
      const clienteNome = anamnese.cliente?.nome || 'Cliente não identificado';
      if (!grupos[clienteNome]) {
        grupos[clienteNome] = {
          cliente: anamnese.cliente,
          anamneses: []
        };
      }
      grupos[clienteNome].anamneses.push(anamnese);
    });
    
    // Ordenar por data (mais recente primeiro)
    Object.values(grupos).forEach(grupo => {
      grupo.anamneses.sort((a, b) => 
        moment(b.data_preenchimento).diff(moment(a.data_preenchimento))
      );
    });
    
    return grupos;
  }, [anamneses]);

  const gerarPDF = (anamnese, paraDownload = true) => {
    try {
      const doc = new jsPDF();
      let y = 20;
      
      // Título
      doc.setFillColor(93, 38, 138);
      doc.rect(0, 0, 210, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('FICHA DE ANAMNESE', 20, 10);
      
      y += 10;
      
      // Dados do cliente
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('DADOS DO CLIENTE', 20, y);
      y += 7;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Nome: ${anamnese.cliente?.nome || 'Não informado'}`, 25, y);
      y += 6;
      doc.text(`Data da avaliação: ${moment(anamnese.data_preenchimento).format('DD/MM/YYYY HH:mm')}`, 25, y);
      y += 10;
      
      // Seção 1
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('1. INFORMAÇÕES GERAIS', 20, y);
      y += 7;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      if (anamnese.profissao) {
        doc.text(`Profissão: ${anamnese.profissao}`, 25, y);
        y += 6;
      }
      if (anamnese.estado_civil) {
        doc.text(`Estado Civil: ${anamnese.estado_civil}`, 25, y);
        y += 6;
      }
      if (anamnese.contato_emergencia) {
        doc.text(`Contato Emergência: ${anamnese.contato_emergencia}`, 25, y);
        y += 6;
      }
      if (anamnese.telefone_emergencia) {
        doc.text(`Telefone Emergência: ${anamnese.telefone_emergencia}`, 25, y);
        y += 6;
      }
      y += 2;
      
      // Seção 2
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('2. HISTÓRICO MÉDICO', 20, y);
      y += 7;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      if (anamnese.alergias) {
        doc.text(`Alergias: ${anamnese.alergias}`, 25, y);
        y += 6;
      }
      if (anamnese.medicamentos_em_uso) {
        doc.text(`Medicamentos: ${anamnese.medicamentos_em_uso}`, 25, y);
        y += 6;
      }
      y += 2;
      
      // Seção 3
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('3. CONDIÇÕES ESPECÍFICAS', 20, y);
      y += 7;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      if (anamnese.problemas_pele) {
        doc.text(`Problemas de pele: ${anamnese.problemas_pele}`, 25, y);
        y += 6;
      }
      y += 2;
      
      // Seção 4
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('4. HISTÓRICO ESTÉTICO', 20, y);
      y += 7;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      if (anamnese.procedimentos_anteriores) {
        doc.text(`Procedimentos: ${anamnese.procedimentos_anteriores}`, 25, y);
        y += 6;
      }
      if (anamnese.resultados_esperados) {
        doc.text(`Resultados esperados: ${anamnese.resultados_esperados}`, 25, y);
        y += 6;
      }
      y += 2;
      
      // Seção 5
      if (anamnese.observacoes_gerais) {
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text('5. OBSERVAÇÕES', 20, y);
        y += 7;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        
        const observacoes = doc.splitTextToSize(anamnese.observacoes_gerais, 160);
        observacoes.forEach(line => {
          doc.text(line, 25, y);
          y += 5;
        });
      }
      
      // Rodapé
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Documento gerado pelo EstetixHub', 20, 280);
      doc.text(`Gerado em: ${moment().format('DD/MM/YYYY HH:mm')}`, 20, 285);
      
      if (paraDownload) {
        doc.save(`anamnese-${anamnese.cliente?.nome || 'cliente'}-${moment().format('YYYYMMDD')}.pdf`);
      } else {
        return doc.output('datauristring');
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    }
  };

  const visualizarPDF = (anamnese) => {
    setVisualizandoAnamnese(anamnese);
  };

  const baixarPDF = (anamnese) => {
    gerarPDF(anamnese, true);
  };

  const handleExcluir = async () => {
    setExcluirLoading(true);
    try {
      await api.deleteAnamnese(excluirId);
      queryClient.invalidateQueries({ queryKey: ['anamneses'] });
      setExcluirId(null);
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir anamnese');
    } finally {
      setExcluirLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <>
      {/* Visualização em Pastas */}
      <div className="space-y-4">
        {Object.entries(anamnesesPorCliente).map(([nomeCliente, grupo]) => (
          <div key={nomeCliente} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Cabeçalho da pasta (cliente) */}
            <div 
              className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 cursor-pointer flex items-center justify-between hover:from-purple-100 hover:to-pink-100 transition-colors"
              onClick={() => setPastaAberta(pastaAberta === nomeCliente ? null : nomeCliente)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-sm">
                  {nomeCliente.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{nomeCliente}</h3>
                  <p className="text-sm text-gray-500">
                    {grupo.anamneses.length} {grupo.anamneses.length === 1 ? 'ficha' : 'fichas'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  Última: {moment(grupo.anamneses[0]?.data_preenchimento).format('DD/MM/YYYY')}
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${pastaAberta === nomeCliente ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {/* Conteúdo da pasta (anamneses) */}
            {pastaAberta === nomeCliente && (
              <div className="p-4 space-y-3 bg-white">
                {grupo.anamneses.map((anamnese, index) => (
                  <div 
                    key={anamnese.id}
                    className="flex items-center justify-between p-3 rounded-lg border-l-4 border-l-purple-400 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {/* Ícone de documento */}
                      <FileText className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="font-medium text-sm">
                          Avaliação de {moment(anamnese.data_preenchimento).format('DD/MM/YYYY')}
                        </p>
                        <div className="flex gap-2 mt-1">
                          {anamnese.profissao && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                              {anamnese.profissao}
                            </span>
                          )}
                          {anamnese.problemas_pele && (
                            <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
                              {anamnese.problemas_pele}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Ações da anamnese */}
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onEdit(anamnese)}
                        className="text-gray-400 hover:text-blue-600"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => visualizarPDF(anamnese)}
                        className="text-gray-400 hover:text-purple-600"
                        title="Visualizar"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => baixarPDF(anamnese)}
                        className="text-gray-400 hover:text-green-600"
                        title="Baixar PDF"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setExcluirId(anamnese.id)}
                        className="text-gray-400 hover:text-red-600"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {Object.keys(anamnesesPorCliente).length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">Nenhuma ficha de anamnese encontrada</p>
            <p className="text-sm text-gray-300 mt-1">Crie uma nova anamnese para começar</p>
          </div>
        )}
      </div>

      {/* Modal de visualização */}
      <Dialog open={!!visualizandoAnamnese} onOpenChange={() => setVisualizandoAnamnese(null)}>
        <DialogContent className="max-w-4xl !p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>Visualizar Anamnese</DialogTitle>
          </DialogHeader>
          
          {visualizandoAnamnese && (
            <div className="flex flex-col h-[80vh]">
              {/* Área do PDF - sem margens extras */}
              <div className="flex-1 w-full bg-gray-50">
                <iframe
                  src={gerarPDF(visualizandoAnamnese, false)}
                  className="w-full h-full border-0"
                  title="Visualização de Anamnese"
                />
              </div>
              
              {/* Rodapé com botões */}
              <div className="flex justify-end gap-2 px-6 py-4 border-t bg-gray-50">
                <Button variant="outline" onClick={() => setVisualizandoAnamnese(null)}>
                  Fechar
                </Button>
                <Button onClick={() => baixarPDF(visualizandoAnamnese)}>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação de exclusão */}
      <ConfirmarExclusaoDialog
        open={!!excluirId}
        onOpenChange={() => setExcluirId(null)}
        onConfirm={handleExcluir}
        loading={excluirLoading}
      />
    </>
  );
}

// Página principal
export default function AnamnesePage() {
  const [activeTab, setActiveTab] = useState('form');
  const [clienteId] = useState(null);
  const [editandoAnamnese, setEditandoAnamnese] = useState(null);

  const handleEdit = (anamnese) => {
    setEditandoAnamnese(anamnese);
    setActiveTab('form');
  };

  const handleSuccess = () => {
    setEditandoAnamnese(null);
    setActiveTab('historico');
  };

  const handleCancel = () => {
    setEditandoAnamnese(null);
    setActiveTab('historico');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Anamnese</h1>
        <p className="text-sm text-gray-500">Ficha de avaliação e histórico do cliente</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="form">
            {editandoAnamnese ? 'Editar Anamnese' : 'Nova Anamnese'}
          </TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="form">
          <AnamneseFormulario 
            clienteId={clienteId}
            anamneseParaEditar={editandoAnamnese}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </TabsContent>

        <TabsContent value="historico">
          <HistoricoAnamnese 
            clienteId={clienteId} 
            onEdit={handleEdit}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}