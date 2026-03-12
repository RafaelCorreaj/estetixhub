import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

const formatPhone = (value) => {
  const nums = value.replace(/\D/g, "").slice(0, 11);
  if (nums.length <= 2) return `(${nums}`;
  if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
  return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
};

const formatCPF = (value) => {
  const nums = value.replace(/\D/g, "").slice(0, 11);
  if (nums.length <= 3) return nums;
  if (nums.length <= 6) return `${nums.slice(0, 3)}.${nums.slice(3)}`;
  if (nums.length <= 9) return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6)}`;
  return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6, 9)}-${nums.slice(9)}`;
};

export default function ClienteForm({ cliente, onSave, onCancel, isLoading }) {
  const [form, setForm] = useState({
    nome: cliente?.nome || "",
    telefone: cliente?.telefone || "",
    email: cliente?.email || "",
    data_nascimento: cliente?.data_nascimento || "",
    cpf: cliente?.cpf || "",
    endereco: cliente?.endereco || "",
    como_conheceu: cliente?.como_conheceu || "",
    observacoes: cliente?.observacoes || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900">
          {cliente ? "Editar Cliente" : "Novo Cliente"}
        </h3>
        <button type="button" onClick={onCancel} className="p-1 rounded-lg hover:bg-gray-100">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nome *</Label>
          <Input
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            placeholder="Nome completo"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Telefone *</Label>
          <Input
            value={form.telefone}
            onChange={(e) => setForm({ ...form, telefone: formatPhone(e.target.value) })}
            placeholder="(00) 00000-0000"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>E-mail</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="email@exemplo.com"
          />
        </div>
        <div className="space-y-2">
          <Label>Data de Nascimento</Label>
          <Input
            type="date"
            value={form.data_nascimento}
            onChange={(e) => setForm({ ...form, data_nascimento: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>CPF</Label>
          <Input
            value={form.cpf}
            onChange={(e) => setForm({ ...form, cpf: formatCPF(e.target.value) })}
            placeholder="000.000.000-00"
          />
        </div>
        <div className="space-y-2">
          <Label>Como Conheceu</Label>
          <Select value={form.como_conheceu} onValueChange={(v) => setForm({ ...form, como_conheceu: v })}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Instagram">Instagram</SelectItem>
              <SelectItem value="Facebook">Facebook</SelectItem>
              <SelectItem value="Indicação">Indicação</SelectItem>
              <SelectItem value="Google">Google</SelectItem>
              <SelectItem value="Outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Endereço</Label>
        <Input
          value={form.endereco}
          onChange={(e) => setForm({ ...form, endereco: e.target.value })}
          placeholder="Endereço completo"
        />
      </div>

      <div className="space-y-2">
        <Label>Observações</Label>
        <Textarea
          value={form.observacoes}
          onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
          placeholder="Observações gerais sobre o cliente"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
        >
          {isLoading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}