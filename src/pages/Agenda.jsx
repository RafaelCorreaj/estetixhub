import React, { useState, useMemo } from "react";
import { useDataBrasil } from '@/hooks/useDataBrasil';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import moment from "moment";

// IMPORTANTE: Importar o locale pt-br
import 'moment/locale/pt-br';

// Configurar moment para português
moment.locale('pt-br');

import AgendamentoForm from "../components/agenda/AgendamentoForm";
import DayView from "../components/agenda/DayView";
import DraggableAgendamento from "../components/agenda/DraggableAgendamento";

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(moment());
  const [view, setView] = useState("day"); // "day", "week", "month"
  const [showForm, setShowForm] = useState(false);
  const [editingAg, setEditingAg] = useState(null);
  const [defaultDate, setDefaultDate] = useState(null);
  const [defaultClienteId, setDefaultClienteId] = useState(null);
  const [defaultClienteNome, setDefaultClienteNome] = useState(null);
  const queryClient = useQueryClient();
  const { formatarData } = useDataBrasil();

  // Configuração dos sensores para drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Só ativa após 8px de movimento
      },
    }),
    useSensor(KeyboardSensor)
  );

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
    enabled: showForm,
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

  // Função para lidar com o fim do drag-and-drop
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over) return;

    const agendamentoId = active.id;
    const destinoId = over.id;

    // Extrair data do destino (formato: "dia-2026-03-13")
    const destinoData = destinoId.replace('dia-', '');
    
    const agendamento = agendamentos.find(a => a.id === agendamentoId);
    if (!agendamento) return;

    // Pegar horário original
    const horaOriginal = moment(agendamento.data_hora_inicio).format("HH:mm");
    
    // Criar nova data com o mesmo horário
    const novaData = moment(`${destinoData}T${horaOriginal}`);

    // Calcular duração do serviço
    const servico = servicos.find(s => s.id === agendamento.servico_id);
    const duracao = servico?.duracao_min || 60;

    try {
      // Atualizar no backend
      await api.updateAgendamento(agendamentoId, {
        data_hora_inicio: novaData.toISOString(),
        data_hora_fim: moment(novaData).add(duracao, 'minutes').toISOString(),
      });

      // Recarregar agendamentos
      queryClient.invalidateQueries({ queryKey: ["agendamentos"] });
    } catch (error) {
      console.error('Erro ao remarcar agendamento:', error);
      alert('Erro ao remarcar. Tente novamente.');
    }
  };

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
    if (view === "week") {
      setCurrentDate((prev) => prev.clone().add(dir, "week"));
    } else if (view === "month") {
      setCurrentDate((prev) => prev.clone().add(dir, "month"));
    } else {
      setCurrentDate((prev) => prev.clone().add(dir, "day"));
    }
  };

  // Filtrar agendamentos do dia atual
  const dayAgendamentos = useMemo(() => {
    return agendamentos.filter(
      (a) => moment(a.data_hora_inicio).format("YYYY-MM-DD") === currentDate.format("YYYY-MM-DD")
    );
  }, [agendamentos, currentDate]);

  // Gerar dias da semana para visualização semanal
  const weekDays = useMemo(() => {
    const startOfWeek = currentDate.clone().startOf('week');
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(startOfWeek.clone().add(i, 'days'));
    }
    return days;
  }, [currentDate]);

  // Agendamentos por dia da semana
  const weekAgendamentos = useMemo(() => {
    return weekDays.map(day => ({
      date: day,
      agendamentos: agendamentos.filter(
        (a) => moment(a.data_hora_inicio).format("YYYY-MM-DD") === day.format("YYYY-MM-DD") && a.status !== "cancelado"
      )
    }));
  }, [weekDays, agendamentos]);

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
          <p className="text-sm text-gray-500 mt-1">
            {view === "week" 
              ? `${weekDays[0].format("DD/MM")} - ${weekDays[6].format("DD/MM/YYYY")}`
              : formatarData(currentDate, 'mesAno')}
          </p>
        </div>
        <Button
          onClick={() => { setEditingAg(null); setDefaultDate(null); setShowForm(true); }}
          className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 shadow-md shadow-purple-200/50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {/* Controls - VERSÃO RESPONSIVA CORRIGIDA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="h-8 w-8">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={() => setCurrentDate(moment())} size="sm" className="text-sm h-8">
            Hoje
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigate(1)} className="h-8 w-8">
            <ChevronRight className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium text-gray-700 ml-2">
            {view === "week" 
              ? `Semana de ${weekDays[0].format("DD/MM")} a ${weekDays[6].format("DD/MM")}`
              : view === "month" 
                ? formatarData(currentDate, 'mesAno')
                : formatarData(currentDate, 'completa')}
          </span>
        </div>
        
        {/* BOTÕES CORRIGIDOS - AGORA COM FLEX-WRAP */}
        <div className="flex flex-wrap gap-1 rounded-lg overflow-hidden border border-gray-200 w-full sm:w-auto">
          {[
            { value: "day", label: "Dia" },
            { value: "week", label: "Semana" },
            { value: "month", label: "Mês" }
          ].map((v) => (
            <button
              key={v.value}
              onClick={() => setView(v.value)}
              className={`flex-1 min-w-[60px] sm:min-w-[70px] px-2 sm:px-3 py-1.5 text-xs font-medium transition-colors
                ${view === v.value 
                  ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white" 
                  : "text-gray-500 hover:bg-gray-50"
                }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Content */}
      <Card className="border-0 shadow-sm p-4 md:p-6">
        {view === "day" && (
          <DayView
            date={currentDate}
            agendamentos={dayAgendamentos}
            onSlotClick={handleSlotClick}
            onAgendamentoClick={handleAgendamentoClick}
          />
        )}

        {view === "week" && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div>
              {/* Cabeçalho da semana */}
              <div className="grid grid-cols-7 gap-px mb-4">
                {weekDays.map((day, i) => {
                  const isToday = day.isSame(moment(), "day");
                  return (
                    <div key={i} className="text-center">
                      <div className="text-xs font-medium text-gray-400">
                        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][i]}
                      </div>
                      <div className={`text-lg font-semibold mt-1 ${isToday ? "text-purple-600" : "text-gray-700"}`}>
                        {day.date()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Grid da semana */}
              <div className="grid grid-cols-7 gap-2">
                {weekAgendamentos.map(({ date, agendamentos: dayAgs }, idx) => {
                  const isToday = date.isSame(moment(), "day");
                  const dayId = `dia-${date.format("YYYY-MM-DD")}`;
                  
                  return (
                    <SortableContext
                      key={idx}
                      items={dayAgs.map(a => a.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div
                        id={dayId}
                        className={`min-h-[200px] p-2 border rounded-lg transition-all
                          ${isToday ? "border-purple-300 bg-purple-50/30" : "border-gray-100"}
                          hover:border-purple-200 hover:shadow-md`}
                        onClick={() => { setCurrentDate(date.clone()); setView("day"); }}
                      >
                        {dayAgs.map((ag) => (
                          <DraggableAgendamento
                            key={ag.id}
                            agendamento={ag}
                            onClick={handleAgendamentoClick}
                          />
                        ))}
                        {dayAgs.length === 0 && (
                          <div 
                            className="h-full flex items-center justify-center text-xs text-gray-400 border-2 border-dashed border-gray-200 rounded-lg p-2 hover:border-purple-300 hover:text-purple-400 transition-colors"
                            onClick={(e) => { e.stopPropagation(); handleSlotClick(date.format("YYYY-MM-DD")); }}
                          >
                            + Agendar
                          </div>
                        )}
                      </div>
                    </SortableContext>
                  );
                })}
              </div>
            </div>
          </DndContext>
        )}

        {view === "month" && (
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