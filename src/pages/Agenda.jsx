import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import moment from "moment";

import AgendamentoForm from "../components/agenda/AgendamentoForm";
import DayView from "../components/agenda/DayView";

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(moment());
  const [view, setView] = useState("day");
  const [showForm, setShowForm] = useState(false);
  const [editingAg, setEditingAg] = useState(null);
  const [defaultDate, setDefaultDate] = useState(null);
  const [defaultClienteId, setDefaultClienteId] = useState(null);
  const [defaultClienteNome, setDefaultClienteNome] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("new") === "true") {
      setShowForm(true);
      if (params.get("clienteId")) setDefaultClienteId(params.get("clienteId"));
      if (params.get("clienteNome")) setDefaultClienteNome(decodeURIComponent(params.get("clienteNome")));
    }
  }, []);

  // Buscar agendamentos
  const { data: agendamentos = [], isLoading } = useQuery({
    queryKey: ["agendamentos"],
    queryFn: () => api.getAgendamentos(),
  });

  // Buscar clientes e serviços para o formulário (quando necessário)
  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes"],
    queryFn: () => api.getClientes(),
    enabled: showForm, // só carrega quando o formulário estiver aberto
  });

  const { data: servicos = [] } = useQuery({
    queryKey: ["servicos"],
    queryFn: () => api.getServicos(),
    enabled: showForm,
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.createAgendamento(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendamentos"] });
      closeForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.updateAgendamento(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendamentos"] });
      closeForm();
    },
  });

  const closeForm = () => {
    setShowForm(false);
    setEditingAg(null);
    setDefaultDate(null);
    setDefaultClienteId(null);
    setDefaultClienteNome(null);
  };

  const handleSave = (data) => {
    if (editingAg) {
      updateMutation.mutate({ id: editingAg.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleSlotClick = (dateStr) => {
    setDefaultDate(dateStr);
    setEditingAg(null);
    setShowForm(true);
  };

  const handleAgendamentoClick = (ag) => {
    setEditingAg(ag);
    setShowForm(true);
  };

  const navigate = (dir) => {
    setCurrentDate((prev) => prev.clone().add(dir, view === "month" ? "month" : "day"));
  };

  // Filtrar agendamentos do dia atual
  const dayAgendamentos = useMemo(() => {
    return agendamentos.filter(
      (a) => moment(a.data_hora_inicio).format("YYYY-MM-DD") === currentDate.format("YYYY-MM-DD")
    );
  }, [agendamentos, currentDate]);

  // Gerar dias do mês para visualização mensal
  const monthDays = useMemo(() => {
    const start = currentDate.clone().startOf("month").startOf("week");
    const end = currentDate.clone().endOf("month").endOf("week");
    const days = [];
    let d = start.clone();
    while (d.isSameOrBefore(end, "day")) {
      days.push(d.clone());
      d.add(1, "day");
    }
    return days;
  }, [currentDate]);

  const getMonthDayAgendamentos = (day) => {
    return agendamentos.filter(
      (a) => moment(a.data_hora_inicio).format("YYYY-MM-DD") === day.format("YYYY-MM-DD") && a.status !== "cancelado"
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando agenda...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-sm text-gray-500 mt-1">{currentDate.format("MMMM YYYY")}</p>
        </div>
        <Button
          onClick={() => { setEditingAg(null); setDefaultDate(null); setShowForm(true); }}
          className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 shadow-md shadow-purple-200/50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={() => setCurrentDate(moment())} className="text-sm">
            Hoje
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigate(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium text-gray-700 ml-2">
            {view === "month" ? currentDate.format("MMMM YYYY") : currentDate.format("ddd, D [de] MMMM")}
          </span>
        </div>
        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
          {["day", "month"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-xs font-medium ${view === v ? "bg-purple-50 text-purple-600" : "text-gray-500 hover:bg-gray-50"}`}
            >
              {v === "day" ? "Dia" : "Mês"}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Content */}
      <Card className="border-0 shadow-sm p-4 md:p-6">
        {view === "day" ? (
          <DayView
            date={currentDate}
            agendamentos={dayAgendamentos}
            onSlotClick={handleSlotClick}
            onAgendamentoClick={handleAgendamentoClick}
          />
        ) : (
          <div>
            <div className="grid grid-cols-7 gap-px mb-2">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
                <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-px">
              {monthDays.map((day) => {
                const isToday = day.isSame(moment(), "day");
                const isCurrentMonth = day.month() === currentDate.month();
                const dayAgs = getMonthDayAgendamentos(day);
                return (
                  <div
                    key={day.format("YYYY-MM-DD")}
                    onClick={() => { setCurrentDate(day.clone()); setView("day"); }}
                    className={`min-h-[80px] p-1.5 border border-gray-100 rounded-lg cursor-pointer transition-colors hover:bg-purple-50/30
                      ${!isCurrentMonth ? "opacity-40" : ""}
                      ${isToday ? "bg-purple-50 border-purple-200" : ""}`}
                  >
                    <span className={`text-xs font-medium ${isToday ? "text-purple-600" : "text-gray-600"}`}>
                      {day.date()}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {dayAgs.slice(0, 3).map((ag) => (
                        <div key={ag.id} className="text-[10px] text-gray-600 truncate px-1 py-0.5 bg-purple-100/50 rounded">
                          {moment(ag.data_hora_inicio).format("HH:mm")} {ag.cliente_nome?.split(" ")[0]}
                        </div>
                      ))}
                      {dayAgs.length > 3 && (
                        <span className="text-[10px] text-purple-500 font-medium">+{dayAgs.length - 3} mais</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) closeForm(); else setShowForm(true); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <AgendamentoForm
            agendamento={editingAg}
            defaultDate={defaultDate}
            defaultClienteId={defaultClienteId}
            defaultClienteNome={defaultClienteNome}
            onSave={handleSave}
            onCancel={closeForm}
            isLoading={createMutation.isPending || updateMutation.isPending}
            clientes={clientes}
            servicos={servicos}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}