import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, X, ClipboardList, AlertTriangle, CheckCircle2 } from "lucide-react";
import moment from "moment";

function AnamneseForm({ anamnese, clienteId, clienteNome, clientes, onSave, onCancel, isLoading }) {
  const [form, setForm] = useState({
    cliente_id: anamnese?.cliente_id || clienteId || "",
    cliente_nome: anamnese?.cliente_nome || clienteNome || "",
    alergias: anamnese?.alergias || "",
    medicamentos_em_uso: anamnese?.medicamentos_em_uso || "",
    cirurgias_previas: anamnese?.cirurgias_previas || "",
    problemas_cardiacos: anamnese?.problemas_cardiacos || false,
    diabetes: anamnese?.diabetes || false,
    gestante: anamnese?.gestante || false,
    fumante: anamnese?.fumante || false,
    objetivo_tratamento: anamnese?.objetivo_tratamento || "",
    observacoes_medicas: anamnese?.observacoes_medicas || "",
    preenchido: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const c = clientes?.find((c) => c.id === form.cliente_id);
    onSave({ ...form, cliente_nome: c?.nome || form.cliente_nome });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{anamnese ? "Editar Anamnese" : "Nova Anamnese"}</h3>
        <button type="button" onClick={onCancel} className="p-1 rounded-lg hover:bg-gray-100">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {!clienteId && (
        <div className="space-y-2">
          <Label>Cliente *</Label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
            value={form.cliente_id}
            onChange={(e) => {
              const c = clientes?.find((c) => c.id === e.target.value);
              setForm({ ...form, cliente_id: e.target.value, cliente_nome: c?.nome || "" });
            }}
            required
          >
            <option value="">Selecione o cliente</option>
            {clientes?.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-2">
        <Label>Alergias</Label>
        <Textarea value={form.alergias} onChange={(e) => setForm({ ...form, alergias: e.target.value })} placeholder='Ex: "Alergia a látex" ou "Nenhuma"' rows={2} />
      </div>
      <div className="space-y-2">
        <Label>Medicamentos em Uso</Label>
        <Textarea value={form.medicamentos_em_uso} onChange={(e) => setForm({ ...form, medicamentos_em_uso: e.target.value })} rows={2} />
      </div>
      <div className="space-y-2">
        <Label>Cirurgias Prévias</Label>
        <Textarea value={form.cirurgias_previas} onChange={(e) => setForm({ ...form, cirurgias_previas: e.target.value })} rows={2} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <Switch checked={form.problemas_cardiacos} onCheckedChange={(v) => setForm({ ...form, problemas_cardiacos: v })} />
          <Label className="text-sm">Prob. Cardíacos</Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={form.diabetes} onCheckedChange={(v) => setForm({ ...form, diabetes: v })} />
          <Label className="text-sm">Diabetes</Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={form.gestante} onCheckedChange={(v) => setForm({ ...form, gestante: v })} />
          <Label className="text-sm">Gestante</Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={form.fumante} onCheckedChange={(v) => setForm({ ...form, fumante: v })} />
          <Label className="text-sm">Fumante</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Objetivo do Tratamento</Label>
        <Textarea value={form.objetivo_tratamento} onChange={(e) => setForm({ ...form, objetivo_tratamento: e.target.value })} rows={2} />
      </div>
      <div className="space-y-2">
        <Label>Observações Médicas</Label>
        <Textarea value={form.observacoes_medicas} onChange={(e) => setForm({ ...form, observacoes_medicas: e.target.value })} rows={2} />
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

export default function Anamnese() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [urlClienteId, setUrlClienteId] = useState(null);
  const [urlClienteNome, setUrlClienteNome] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("clienteId")) {
      setUrlClienteId(params.get("clienteId"));
      setUrlClienteNome(decodeURIComponent(params.get("clienteNome") || ""));
    }
  }, []);

  // Buscar anamneses
  const { data: anamneses = [], isLoading: loadingAnamneses } = useQuery({
    queryKey: ["anamneses"],
    queryFn: () => api.getAnamneses(), // Vamos precisar criar este método
  });

  // Buscar clientes
  const { data: clientes = [], isLoading: loadingClientes } = useQuery({
    queryKey: ["clientes"],
    queryFn: () => api.getClientes(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.createAnamnese(data), // Vamos precisar criar este método
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["anamneses"] }); 
      setShowForm(false); 
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.updateAnamnese(id, data), // Vamos precisar criar este método
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["anamneses"] }); 
      setShowForm(false); 
      setEditing(null); 
    },
  });

  const handleSave = (data) => {
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  const filtered = useMemo(() => {
    if (!searchTerm) return urlClienteId ? anamneses.filter((a) => a.cliente_id === urlClienteId) : anamneses;
    const term = searchTerm.toLowerCase();
    return anamneses.filter((a) => a.cliente_nome?.toLowerCase().includes(term));
  }, [anamneses, searchTerm, urlClienteId]);

  const isLoading = loadingAnamneses || loadingClientes;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando anamneses...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Anamnese</h1>
          <p className="text-sm text-gray-500 mt-1">
            {urlClienteNome ? `Fichas de ${urlClienteNome}` : `${anamneses.length} fichas cadastradas`}
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-gradient-to-r from-purple-600 to-pink-500 shadow-md shadow-purple-200/50">
          <Plus className="w-4 h-4 mr-2" />Nova Anamnese
        </Button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input placeholder="Buscar por nome do cliente..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-white" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((an) => (
          <Card key={an.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setEditing(an); setShowForm(true); }}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-purple-50">
                  <ClipboardList className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">{an.cliente_nome || "Cliente"}</h3>
                    <Badge variant="outline" className={an.preenchido ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}>
                      {an.preenchido ? <><CheckCircle2 className="w-3 h-3 mr-1" />Preenchida</> : <><AlertTriangle className="w-3 h-3 mr-1" />Pendente</>}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{moment(an.created_date).format("DD/MM/YYYY HH:mm")}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {an.problemas_cardiacos && <Badge variant="secondary" className="text-[10px] bg-red-50 text-red-600">Cardíaco</Badge>}
                    {an.diabetes && <Badge variant="secondary" className="text-[10px] bg-orange-50 text-orange-600">Diabetes</Badge>}
                    {an.gestante && <Badge variant="secondary" className="text-[10px] bg-pink-50 text-pink-600">Gestante</Badge>}
                    {an.fumante && <Badge variant="secondary" className="text-[10px] bg-gray-100 text-gray-600">Fumante</Badge>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12"><p className="text-gray-400">Nenhuma ficha encontrada</p></div>
      )}

      <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) setEditing(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <AnamneseForm
            anamnese={editing}
            clienteId={urlClienteId}
            clienteNome={urlClienteNome}
            clientes={clientes}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditing(null); }}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}