import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Clock, DollarSign, Percent, X } from "lucide-react";

function ServicoForm({ servico, onSave, onCancel, isLoading }) {
  const [form, setForm] = useState({
    nome: servico?.nome || "",
    descricao: servico?.descricao || "",
    duracao_min: servico?.duracao_min || 60,
    preco: servico?.preco || 0,
    comissao_percentual: servico?.comissao_percentual || 0,
    cor_identificacao: servico?.cor_identificacao || "#9333ea",
    ativo: servico?.ativo !== false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{servico ? "Editar Serviço" : "Novo Serviço"}</h3>
        <button type="button" onClick={onCancel} className="p-1 rounded-lg hover:bg-gray-100">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label>Nome *</Label>
          <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Limpeza de Pele" required />
        </div>
        <div className="space-y-2">
          <Label>Duração (min) *</Label>
          <Input type="number" value={form.duracao_min} onChange={(e) => setForm({ ...form, duracao_min: parseInt(e.target.value) || 0 })} min={5} required />
        </div>
        <div className="space-y-2">
          <Label>Preço (R$) *</Label>
          <Input type="number" step="0.01" value={form.preco} onChange={(e) => setForm({ ...form, preco: parseFloat(e.target.value) || 0 })} min={0} required />
        </div>
        <div className="space-y-2">
          <Label>Comissão (%)</Label>
          <Input type="number" value={form.comissao_percentual} onChange={(e) => setForm({ ...form, comissao_percentual: parseFloat(e.target.value) || 0 })} min={0} max={100} />
        </div>
        <div className="space-y-2">
          <Label>Cor</Label>
          <Input type="color" value={form.cor_identificacao} onChange={(e) => setForm({ ...form, cor_identificacao: e.target.value })} className="h-10 p-1 cursor-pointer" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Descrição</Label>
          <Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} rows={2} />
        </div>
        <div className="flex items-center gap-3 md:col-span-2">
          <Switch checked={form.ativo} onCheckedChange={(v) => setForm({ ...form, ativo: v })} />
          <Label>Serviço ativo</Label>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-purple-600 to-pink-500">
          {isLoading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}

export default function Servicos() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const queryClient = useQueryClient();

  const { data: servicos = [], isLoading } = useQuery({
    queryKey: ["servicos"],
    queryFn: () => api.getServicos(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.createServico(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["servicos"] }); setShowForm(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.updateServico(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["servicos"] }); setShowForm(false); setEditing(null); },
  });

  const handleSave = (data) => {
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
          <p className="text-sm text-gray-500 mt-1">{servicos.length} serviços cadastrados</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-gradient-to-r from-purple-600 to-pink-500 shadow-md shadow-purple-200/50">
          <Plus className="w-4 h-4 mr-2" />Novo Serviço
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {servicos.map((s) => (
          <Card key={s.id} className="border-0 shadow-sm hover:shadow-md transition-shadow p-4">
            <div className="flex items-start gap-3">
              <div className="w-3 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: s.cor_identificacao || "#9333ea" }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-gray-900">{s.nome}</h3>
                  {!s.ativo && <Badge variant="secondary" className="text-[10px]">Inativo</Badge>}
                </div>
                {s.descricao && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{s.descricao}</p>}
                <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.duracao_min} min</span>
                  <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />R$ {s.preco?.toFixed(2)}</span>
                  {s.comissao_percentual > 0 && (
                    <span className="flex items-center gap-1"><Percent className="w-3 h-3" />{s.comissao_percentual}%</span>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => { setEditing(s); setShowForm(true); }} className="text-gray-400 hover:text-purple-600">
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {servicos.length === 0 && !isLoading && (
        <div className="text-center py-12"><p className="text-gray-400">Nenhum serviço cadastrado</p></div>
      )}

      <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) setEditing(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <ServicoForm
            servico={editing}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditing(null); }}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}