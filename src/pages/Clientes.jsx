import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, Plus, LayoutGrid, List } from "lucide-react";

import ClienteForm from "../components/clientes/ClienteForm";
import ClienteCard from "../components/clientes/ClienteCard";

export default function Clientes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Check URL params for auto-open form
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("new") === "true") {
      setShowForm(true);
    }
  }, []);

  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ["clientes"],
    queryFn: () => api.getClientes(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.createCliente(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      setShowForm(false);
      setEditingCliente(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.updateCliente(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      setShowForm(false);
      setEditingCliente(null);
    },
  });

  const handleSave = (data) => {
    if (editingCliente) {
      updateMutation.mutate({ id: editingCliente.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (cliente) => {
    setEditingCliente(cliente);
    setShowForm(true);
  };

  const handleAgendamento = (cliente) => {
    navigate(createPageUrl("Agenda") + `?new=true&clienteId=${cliente.id}&clienteNome=${encodeURIComponent(cliente.nome)}`);
  };

  const handleAnamnese = (cliente) => {
    navigate(createPageUrl("Anamnese") + `?clienteId=${cliente.id}&clienteNome=${encodeURIComponent(cliente.nome)}`);
  };

  const filtered = useMemo(() => {
    if (!searchTerm) return clientes;
    const term = searchTerm.toLowerCase();
    return clientes.filter(
      (c) =>
        c.nome?.toLowerCase().includes(term) ||
        c.telefone?.includes(term) ||
        c.email?.toLowerCase().includes(term)
    );
  }, [clientes, searchTerm]);

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-500 mt-1">{clientes.length} clientes cadastrados</p>
        </div>
        <Button
          onClick={() => { setEditingCliente(null); setShowForm(true); }}
          className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 shadow-md shadow-purple-200/50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar por nome, telefone ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-gray-200"
          />
        </div>
        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2.5 ${viewMode === "grid" ? "bg-purple-50 text-purple-600" : "text-gray-400 hover:bg-gray-50"}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2.5 ${viewMode === "list" ? "bg-purple-50 text-purple-600" : "text-gray-400 hover:bg-gray-50"}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Clients Grid/List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Nenhum cliente encontrado</p>
        </div>
      ) : (
        <div className={viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          : "space-y-3"
        }>
          {filtered.map((cliente) => (
            <ClienteCard
              key={cliente.id}
              cliente={cliente}
              onEdit={handleEdit}
              onAgendamento={handleAgendamento}
              onAnamnese={handleAnamnese}
            />
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) setEditingCliente(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <ClienteForm
            cliente={editingCliente}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingCliente(null); }}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}