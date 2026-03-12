import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import moment from "moment";

export default function AgendamentoForm({ 
  agendamento, 
  defaultDate, 
  defaultClienteId, 
  defaultClienteNome, 
  onSave, 
  onCancel, 
  isLoading,
  clientes: clientesProp, // Receber dos props (opcional)
  servicos: servicosProp, // Receber dos props (opcional)
}) {
  // Buscar clientes se não foram passados por props
  const { data: clientesData = [] } = useQuery({
    queryKey: ["clientes"],
    queryFn: () => api.getClientes(),
    enabled: !clientesProp, // Só buscar se não vieram por props
  });

  // Buscar serviços se não foram passados por props
  const { data: servicosData = [] } = useQuery({
    queryKey: ["servicos"],
    queryFn: () => api.getServicos(),
    enabled: !servicosProp,
  });

  // Buscar usuários (profissionais)
  const { data: usuarios = [] } = useQuery({
    queryKey: ["usuarios"],
    queryFn: () => api.getUsuarios(), // Precisamos criar este método
  });

  const clientes = clientesProp || clientesData;
  const servicos = servicosProp || servicosData;
  const profissionais = usuarios.filter((u) => u.perfil === "profissional");

  const [form, setForm] = useState({
    cliente_id: agendamento?.cliente_id || defaultClienteId || "",
    cliente_nome: agendamento?.cliente_nome || defaultClienteNome || "",
    servico_id: agendamento?.servico_id || "",
    servico_nome: agendamento?.servico_nome || "",
    profissional_id: agendamento?.profissional_id || "",
    profissional_nome: agendamento?.profissional_nome || "",
    data_hora_inicio: agendamento?.data_hora_inicio
      ? moment(agendamento.data_hora_inicio).format("YYYY-MM-DDTHH:mm")
      : defaultDate
        ? moment(defaultDate).format("YYYY-MM-DDTHH:mm")
        : moment().format("YYYY-MM-DDT09:00"),
    status: agendamento?.status || "pendente",
    forma_pagamento: agendamento?.forma_pagamento || "nao_pago",
    observacoes: agendamento?.observacoes || "",
  });

  const handleClienteChange = (id) => {
    const c = clientes.find((c) => c.id === id);
    setForm({ ...form, cliente_id: id, cliente_nome: c?.nome || "" });
  };

  const handleServicoChange = (id) => {
    const s = servicos.find((s) => s.id === id);
    setForm({ ...form, servico_id: id, servico_nome: s?.nome || "" });
  };

  const handleProfissionalChange = (id) => {
    const p = profissionais.find((p) => p.id === id);
    setForm({ ...form, profissional_id: id, profissional_nome: p?.nome || "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const servico = servicos.find((s) => s.id === form.servico_id);
    const inicio = moment(form.data_hora_inicio);
    const fim = servico ? inicio.clone().add(servico.duracao_min, "minutes") : inicio.clone().add(60, "minutes");
    
    const data = {
      cliente_id: form.cliente_id,
      servico_id: form.servico_id,
      profissional_id: form.profissional_id,
      data_hora_inicio: inicio.toISOString(),
      data_hora_fim: fim.toISOString(),
      status: form.status,
      forma_pagamento: form.forma_pagamento,
      observacoes: form.observacoes,
      valor_total: servico?.preco || 0,
    };
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900">
          {agendamento ? "Editar Agendamento" : "Novo Agendamento"}
        </h3>
        <button type="button" onClick={onCancel} className="p-1 rounded-lg hover:bg-gray-100">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Cliente *</Label>
          <Select value={form.cliente_id} onValueChange={handleClienteChange} required>
            <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
            <SelectContent>
              {clientes.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Serviço *</Label>
          <Select value={form.servico_id} onValueChange={handleServicoChange} required>
            <SelectTrigger><SelectValue placeholder="Selecione o serviço" /></SelectTrigger>
            <SelectContent>
              {servicos.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.nome} - R$ {s.preco?.toFixed(2)} ({s.duracao_min}min)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Profissional *</Label>
          <Select value={form.profissional_id} onValueChange={handleProfissionalChange} required>
            <SelectTrigger><SelectValue placeholder="Selecione o profissional" /></SelectTrigger>
            <SelectContent>
              {profissionais.length === 0 ? (
                <SelectItem value="_none" disabled>Nenhum profissional cadastrado</SelectItem>
              ) : (
                profissionais.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Data e Hora *</Label>
          <Input
            type="datetime-local"
            value={form.data_hora_inicio}
            onChange={(e) => setForm({ ...form, data_hora_inicio: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="confirmado">Confirmado</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Pagamento</Label>
          <Select value={form.forma_pagamento} onValueChange={(v) => setForm({ ...form, forma_pagamento: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="nao_pago">Não Pago</SelectItem>
              <SelectItem value="dinheiro">Dinheiro</SelectItem>
              <SelectItem value="cartao_credito">Cartão Crédito</SelectItem>
              <SelectItem value="cartao_debito">Cartão Débito</SelectItem>
              <SelectItem value="pix">PIX</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Observações</Label>
        <Textarea
          value={form.observacoes}
          onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
          placeholder="Observações sobre o agendamento"
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button
          type="submit"
          disabled={isLoading || !form.cliente_id || !form.servico_id || !form.profissional_id}
          className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
        >
          {isLoading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}