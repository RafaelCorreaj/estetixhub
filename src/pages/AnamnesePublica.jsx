import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import moment from 'moment';

export default function AnamnesePublica() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [clienteInfo, setClienteInfo] = useState(null);

  const [form, setForm] = useState({
    // Seção 1: Informações Gerais
    profissao: '',
    estado_civil: '',
    contato_emergencia: '',
    telefone_emergencia: '',
    
    // Seção 2: Histórico Médico
    alergias: '',
    medicamentos_em_uso: '',
    cirurgias_previas: '',
    tratamento_medico: false,
    qual_tratamento: '',
    
    // Seção 3: Condições Específicas
    problemas_cardiacos: false,
    pressao_alta: false,
    diabetes: false,
    problemas_pele: '',
    gestante: false,
    lactante: false,
    fumante: false,
    bebidas_alcool: false,
    
    // Seção 4: Histórico Estético
    procedimentos_anteriores: '',
    resultados_esperados: '',
    
    // Seção 5: Observações
    observacoes_gerais: '',
  });

  // Campos obrigatórios
  const camposObrigatorios = [
    'profissao',
    'estado_civil',
    'contato_emergencia',
    'telefone_emergencia',
  ];

  // Verificar se o formulário está válido
  const isFormValid = () => {
    return camposObrigatorios.every(campo => form[campo]?.trim() !== '');
  };

  // Validar token ao carregar
  useEffect(() => {
    async function validarToken() {
      try {
        setLoading(true);
        
        // Chamada real para validar o token
        const response = await api.validarTokenAnamnese(token);
        
        if (response.valido) {
          setClienteInfo(response.cliente);
        } else {
          setError('Link inválido ou expirado');
        }
      } catch (err) {
        console.error('Erro ao validar token:', err);
        setError('Link inválido ou expirado');
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      validarToken();
    } else {
      setError('Token não fornecido');
      setLoading(false);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    
    try {
      // Enviar anamnese com o token do cliente
      await api.enviarAnamnesePublica(token, {
        cliente_id: clienteInfo.id,
        ...form
      });
      
      setSuccess(true);
      
      // Opcional: redirecionar após 3 segundos
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch (error) {
      console.error('Erro ao enviar:', error);
      setError('Erro ao enviar formulário. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Validando link de acesso...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Link inválido</h1>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={() => navigate('/')}>
              Voltar para o início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Obrigado!</h1>
            <p className="text-gray-500 mb-4">
              Sua ficha de anamnese foi enviada com sucesso. Em breve nossa equipe entrará em contato.
            </p>
            <Button onClick={() => navigate('/')}>
              Voltar para o início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center border-b">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Ficha de Anamnese</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Preencha todos os campos com atenção para sua segurança
          </p>
          {clienteInfo && (
            <div className="mt-4 p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-700">
                <span className="font-semibold">Olá,</span> {clienteInfo.nome}
              </p>
              {clienteInfo.email && (
                <p className="text-sm text-purple-700">
                  <span className="font-semibold">Email:</span> {clienteInfo.email}
                </p>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seção 1: Informações Gerais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-700 border-b pb-2">
                1. INFORMAÇÕES GERAIS
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Profissão <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    value={form.profissao} 
                    onChange={(e) => setForm({...form, profissao: e.target.value})} 
                    placeholder="Ex: Advogada, Médica..."
                    className={!form.profissao ? 'border-red-200' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Estado Civil <span className="text-red-500">*</span>
                  </Label>
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
                  <Label>
                    Contato de Emergência <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    value={form.contato_emergencia} 
                    onChange={(e) => setForm({...form, contato_emergencia: e.target.value})} 
                    placeholder="Nome completo"
                    className={!form.contato_emergencia ? 'border-red-200' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Telefone de Emergência <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    value={form.telefone_emergencia} 
                    onChange={(e) => setForm({...form, telefone_emergencia: e.target.value})} 
                    placeholder="(11) 99999-9999"
                    className={!form.telefone_emergencia ? 'border-red-200' : ''}
                  />
                </div>
              </div>
            </div>

            {/* Seção 2: Histórico Médico */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-700 border-b pb-2">
                2. HISTÓRICO MÉDICO
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Alergias</Label>
                  <Textarea 
                    value={form.alergias} 
                    onChange={(e) => setForm({...form, alergias: e.target.value})} 
                    placeholder="Medicamentos, alimentos, látex..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Medicamentos em uso</Label>
                  <Textarea 
                    value={form.medicamentos_em_uso} 
                    onChange={(e) => setForm({...form, medicamentos_em_uso: e.target.value})} 
                    placeholder="Anticoncepcional, anti-hipertensivos..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cirurgias prévias</Label>
                  <Textarea 
                    value={form.cirurgias_previas} 
                    onChange={(e) => setForm({...form, cirurgias_previas: e.target.value})} 
                    placeholder="Plástica, cesárea, etc..."
                    rows={2}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Switch 
                    checked={form.tratamento_medico} 
                    onCheckedChange={(v) => setForm({...form, tratamento_medico: v})} 
                  />
                  <Label>Faz tratamento médico atualmente?</Label>
                </div>

                {form.tratamento_medico && (
                  <div className="space-y-2">
                    <Label>Qual(is) tratamento(s)?</Label>
                    <Input 
                      value={form.qual_tratamento} 
                      onChange={(e) => setForm({...form, qual_tratamento: e.target.value})} 
                      placeholder="Descreva"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Seção 3: Condições Específicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-700 border-b pb-2">
                3. CONDIÇÕES ESPECÍFICAS
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Switch 
                    checked={form.problemas_cardiacos} 
                    onCheckedChange={(v) => setForm({...form, problemas_cardiacos: v})} 
                  />
                  <Label>Problemas cardíacos</Label>
                </div>

                <div className="flex items-center gap-3">
                  <Switch 
                    checked={form.pressao_alta} 
                    onCheckedChange={(v) => setForm({...form, pressao_alta: v})} 
                  />
                  <Label>Pressão alta</Label>
                </div>

                <div className="flex items-center gap-3">
                  <Switch 
                    checked={form.diabetes} 
                    onCheckedChange={(v) => setForm({...form, diabetes: v})} 
                  />
                  <Label>Diabetes</Label>
                </div>

                <div className="flex items-center gap-3">
                  <Switch 
                    checked={form.gestante} 
                    onCheckedChange={(v) => setForm({...form, gestante: v})} 
                  />
                  <Label>Gestante</Label>
                </div>

                <div className="flex items-center gap-3">
                  <Switch 
                    checked={form.lactante} 
                    onCheckedChange={(v) => setForm({...form, lactante: v})} 
                  />
                  <Label>Lactante</Label>
                </div>

                <div className="flex items-center gap-3">
                  <Switch 
                    checked={form.fumante} 
                    onCheckedChange={(v) => setForm({...form, fumante: v})} 
                  />
                  <Label>Fumante</Label>
                </div>

                <div className="flex items-center gap-3">
                  <Switch 
                    checked={form.bebidas_alcool} 
                    onCheckedChange={(v) => setForm({...form, bebidas_alcool: v})} 
                  />
                  <Label>Consome bebidas alcoólicas</Label>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Problemas de pele</Label>
                  <Input 
                    value={form.problemas_pele} 
                    onChange={(e) => setForm({...form, problemas_pele: e.target.value})} 
                    placeholder="Acne, rosácea, dermatite..."
                  />
                </div>
              </div>
            </div>

            {/* Seção 4: Histórico Estético */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-700 border-b pb-2">
                4. HISTÓRICO ESTÉTICO
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Procedimentos anteriores</Label>
                  <Textarea 
                    value={form.procedimentos_anteriores} 
                    onChange={(e) => setForm({...form, procedimentos_anteriores: e.target.value})} 
                    placeholder="Botox, preenchimento, laser..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Resultados esperados</Label>
                  <Textarea 
                    value={form.resultados_esperados} 
                    onChange={(e) => setForm({...form, resultados_esperados: e.target.value})} 
                    placeholder="O que você espera alcançar?"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Seção 5: Observações */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-700 border-b pb-2">
                5. OBSERVAÇÕES
              </h3>
              
              <div className="space-y-2">
                <Label>Observações gerais</Label>
                <Textarea 
                  value={form.observacoes_gerais} 
                  onChange={(e) => setForm({...form, observacoes_gerais: e.target.value})} 
                  placeholder="Informações adicionais que achar relevante"
                  rows={4}
                />
              </div>
            </div>

            {/* Botão de envio */}
            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={enviando || !isFormValid()}
                className={`bg-gradient-to-r from-purple-600 to-pink-500 min-w-[200px]
                  ${(!isFormValid() && !enviando) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {enviando ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Anamnese'
                )}
              </Button>
            </div>

            {/* Indicador de campos obrigatórios */}
            <p className="text-sm text-gray-400 text-center">
              <span className="text-red-500">*</span> Campos obrigatórios
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}