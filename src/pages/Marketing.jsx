import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X, Calendar, MessageSquare, Instagram, Facebook } from "lucide-react";
import moment from "moment";

const statusColors = {
  rascunho: "bg-gray-100 text-gray-600",
  programado: "bg-blue-100 text-blue-700",
  publicado: "bg-emerald-100 text-emerald-700",
};

function PostForm({ post, onSave, onCancel, isLoading }) {
  const [form, setForm] = useState({
    titulo: post?.titulo || "",
    descricao: post?.descricao || "",
    data_programada: post?.data_programada || moment().format("YYYY-MM-DD"),
    rede_social: post?.rede_social || "Instagram",
    status: post?.status || "rascunho",
    imagem_url: post?.imagem_url || "",
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{post ? "Editar Post" : "Novo Post"}</h3>
        <button type="button" onClick={onCancel} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
      </div>
      <div className="space-y-2"><Label>Título *</Label><Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required /></div>
      <div className="space-y-2"><Label>Descrição</Label><Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} rows={3} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Data</Label><Input type="date" value={form.data_programada} onChange={(e) => setForm({ ...form, data_programada: e.target.value })} /></div>
        <div className="space-y-2">
          <Label>Rede Social</Label>
          <Select value={form.rede_social} onValueChange={(v) => setForm({ ...form, rede_social: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Instagram">Instagram</SelectItem>
              <SelectItem value="Facebook">Facebook</SelectItem>
              <SelectItem value="Ambos">Ambos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="rascunho">Rascunho</SelectItem>
            <SelectItem value="programado">Programado</SelectItem>
            <SelectItem value="publicado">Publicado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2"><Label>URL da Imagem</Label><Input value={form.imagem_url} onChange={(e) => setForm({ ...form, imagem_url: e.target.value })} placeholder="https://..." /></div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-purple-600 to-pink-500">{isLoading ? "Salvando..." : "Salvar"}</Button>
      </div>
    </form>
  );
}

function ModeloForm({ modelo, onSave, onCancel, isLoading }) {
  const [form, setForm] = useState({
    nome_modelo: modelo?.nome_modelo || "",
    mensagem: modelo?.mensagem || "",
    tipo_disparo: modelo?.tipo_disparo || "manual",
    trigger_dias: modelo?.trigger_dias || 1,
    ativo: modelo?.ativo !== false,
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{modelo ? "Editar Modelo" : "Novo Modelo"}</h3>
        <button type="button" onClick={onCancel} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
      </div>
      <div className="space-y-2"><Label>Nome *</Label><Input value={form.nome_modelo} onChange={(e) => setForm({ ...form, nome_modelo: e.target.value })} placeholder="Ex: Lembrete 24h" required /></div>
      <div className="space-y-2">
        <Label>Mensagem *</Label>
        <Textarea value={form.mensagem} onChange={(e) => setForm({ ...form, mensagem: e.target.value })} rows={4} placeholder="Olá {nome_cliente}, lembrete do seu agendamento em {data} às {hora}." required />
        <p className="text-xs text-gray-400">Variáveis: {"{nome_cliente}"}, {"{data}"}, {"{hora}"}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select value={form.tipo_disparo} onValueChange={(v) => setForm({ ...form, tipo_disparo: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="automatico">Automático</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Dias antes</Label>
          <Input type="number" value={form.trigger_dias} onChange={(e) => setForm({ ...form, trigger_dias: parseInt(e.target.value) || 0 })} min={0} />
        </div>
      </div>
      <div className="flex items-center gap-3"><Switch checked={form.ativo} onCheckedChange={(v) => setForm({ ...form, ativo: v })} /><Label>Ativo</Label></div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-purple-600 to-pink-500">{isLoading ? "Salvando..." : "Salvar"}</Button>
      </div>
    </form>
  );
}

export default function Marketing() {
  const [activeTab, setActiveTab] = useState("posts");
  const [showPostForm, setShowPostForm] = useState(false);
  const [showModeloForm, setShowModeloForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editingModelo, setEditingModelo] = useState(null);
  const queryClient = useQueryClient();

  // Buscar posts
  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ["posts"],
    queryFn: () => api.getPosts(),
  });

  // Buscar modelos
  const { data: modelos = [], isLoading: loadingModelos } = useQuery({
    queryKey: ["modelos"],
    queryFn: () => api.getModelosMensagem(),
  });

  const createPostMutation = useMutation({
    mutationFn: (data) => api.createPost(data),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["posts"] }); 
      setShowPostForm(false); 
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ id, data }) => api.updatePost(id, data),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["posts"] }); 
      setShowPostForm(false); 
      setEditingPost(null); 
    },
  });

  const createModeloMutation = useMutation({
    mutationFn: (data) => api.createModeloMensagem(data),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["modelos"] }); 
      setShowModeloForm(false); 
    },
  });

  const updateModeloMutation = useMutation({
    mutationFn: ({ id, data }) => api.updateModeloMensagem(id, data),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["modelos"] }); 
      setShowModeloForm(false); 
      setEditingModelo(null); 
    },
  });

  const handleSavePost = (data) => {
    if (editingPost) updatePostMutation.mutate({ id: editingPost.id, data });
    else createPostMutation.mutate(data);
  };

  const handleSaveModelo = (data) => {
    if (editingModelo) updateModeloMutation.mutate({ id: editingModelo.id, data });
    else createModeloMutation.mutate(data);
  };

  const isLoading = loadingPosts || loadingModelos;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando marketing...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie posts e mensagens</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100">
          <TabsTrigger value="posts" className="flex items-center gap-2"><Calendar className="w-4 h-4" />Posts</TabsTrigger>
          <TabsTrigger value="modelos" className="flex items-center gap-2"><MessageSquare className="w-4 h-4" />Modelos</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setEditingPost(null); setShowPostForm(true); }} className="bg-gradient-to-r from-purple-600 to-pink-500 shadow-md shadow-purple-200/50">
              <Plus className="w-4 h-4 mr-2" />Novo Post
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((p) => (
              <Card key={p.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setEditingPost(p); setShowPostForm(true); }}>
                {p.imagem_url && (
                  <div className="h-36 overflow-hidden rounded-t-xl">
                    <img src={p.imagem_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{p.titulo}</h3>
                    <Badge className={statusColors[p.status] || ""}>{p.status}</Badge>
                  </div>
                  {p.descricao && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.descricao}</p>}
                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                    {(p.rede_social === "Instagram" || p.rede_social === "Ambos") && <Instagram className="w-3 h-3" />}
                    {(p.rede_social === "Facebook" || p.rede_social === "Ambos") && <Facebook className="w-3 h-3" />}
                    <span>{p.data_programada ? moment(p.data_programada).format("DD/MM/YYYY") : ""}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {posts.length === 0 && <div className="text-center py-12"><p className="text-gray-400">Nenhum post cadastrado</p></div>}
        </TabsContent>

        <TabsContent value="modelos" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setEditingModelo(null); setShowModeloForm(true); }} className="bg-gradient-to-r from-purple-600 to-pink-500 shadow-md shadow-purple-200/50">
              <Plus className="w-4 h-4 mr-2" />Novo Modelo
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modelos.map((m) => (
              <Card key={m.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setEditingModelo(m); setShowModeloForm(true); }}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-purple-500" />
                      <h3 className="font-semibold text-gray-900">{m.nome_modelo}</h3>
                    </div>
                    <div className="flex gap-1">
                      <Badge variant="outline" className={m.ativo ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-500"}>
                        {m.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                      <Badge variant="outline">{m.tipo_disparo === "automatico" ? "Auto" : "Manual"}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg whitespace-pre-line line-clamp-3">{m.mensagem}</p>
                  {m.trigger_dias > 0 && <p className="text-xs text-gray-400 mt-2">{m.trigger_dias} dia(s) antes</p>}
                </CardContent>
              </Card>
            ))}
          </div>
          {modelos.length === 0 && <div className="text-center py-12"><p className="text-gray-400">Nenhum modelo cadastrado</p></div>}
        </TabsContent>
      </Tabs>

      <Dialog open={showPostForm} onOpenChange={(open) => { setShowPostForm(open); if (!open) setEditingPost(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <PostForm 
            post={editingPost} 
            onSave={handleSavePost} 
            onCancel={() => { setShowPostForm(false); setEditingPost(null); }} 
            isLoading={createPostMutation.isPending || updatePostMutation.isPending} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showModeloForm} onOpenChange={(open) => { setShowModeloForm(open); if (!open) setEditingModelo(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <ModeloForm 
            modelo={editingModelo} 
            onSave={handleSaveModelo} 
            onCancel={() => { setShowModeloForm(false); setEditingModelo(null); }} 
            isLoading={createModeloMutation.isPending || updateModeloMutation.isPending} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}