import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Lock, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Configuracoes() {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Estado para dados do perfil
  const [perfil, setPerfil] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
    telefone: user?.telefone || '',
  });

  // Estado para alteração de senha
  const [senha, setSenha] = useState({
    atual: '',
    nova: '',
    confirmar: '',
  });

  // Atualizar perfil
  const handleUpdatePerfil = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedUser = await api.updateUsuario(user.id, perfil);
      
      // Atualizar o usuário no contexto (se necessário)
      // Nota: Precisaríamos de uma função updateUser no AuthContext
      
      setSuccess('Perfil atualizado com sucesso!');
    } catch (err) {
      setError(err.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  // Alterar senha
  const handleChangeSenha = async (e) => {
    e.preventDefault();
    
    if (senha.nova !== senha.confirmar) {
      setError('As senhas não conferem');
      return;
    }

    if (senha.nova.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Endpoint específico para alterar senha
      await api.changePassword({
        senhaAtual: senha.atual,
        novaSenha: senha.nova
      });
      
      setSuccess('Senha alterada com sucesso!');
      setSenha({ atual: '', nova: '', confirmar: '' });
    } catch (err) {
      setError(err.message || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-sm text-gray-500 mt-1">Gerencie suas informações pessoais e segurança</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="perfil" className="space-y-4">
        <TabsList>
          <TabsTrigger value="perfil" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="senha" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Segurança
          </TabsTrigger>
        </TabsList>

        {/* Aba de Perfil */}
        <TabsContent value="perfil">
          <Card>
            <form onSubmit={handleUpdatePerfil}>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>
                  Atualize suas informações de perfil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo</Label>
                  <Input
                    id="nome"
                    value={perfil.nome}
                    onChange={(e) => setPerfil({ ...perfil, nome: e.target.value })}
                    placeholder="Seu nome"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={perfil.email}
                    onChange={(e) => setPerfil({ ...perfil, email: e.target.value })}
                    placeholder="seu@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={perfil.telefone || ''}
                    onChange={(e) => setPerfil({ ...perfil, telefone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-pink-500"
                >
                  {loading ? 'Salvando...' : 'Salvar alterações'}
                  <Save className="w-4 h-4 ml-2" />
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Aba de Segurança */}
        <TabsContent value="senha">
          <Card>
            <form onSubmit={handleChangeSenha}>
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>
                  Escolha uma senha forte e única
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="senhaAtual">Senha atual</Label>
                  <Input
                    id="senhaAtual"
                    type="password"
                    value={senha.atual}
                    onChange={(e) => setSenha({ ...senha, atual: e.target.value })}
                    placeholder="••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="novaSenha">Nova senha</Label>
                  <Input
                    id="novaSenha"
                    type="password"
                    value={senha.nova}
                    onChange={(e) => setSenha({ ...senha, nova: e.target.value })}
                    placeholder="••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha">Confirmar nova senha</Label>
                  <Input
                    id="confirmarSenha"
                    type="password"
                    value={senha.confirmar}
                    onChange={(e) => setSenha({ ...senha, confirmar: e.target.value })}
                    placeholder="••••••"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-pink-500"
                >
                  {loading ? 'Alterando...' : 'Alterar senha'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}