import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Link } from "react-router-dom";
import { Calendar, Users, Clock, Plus, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import moment from "moment";

import StatsCard from "../components/dashboard/StatsCard";
import UpcomingList from "../components/dashboard/UpcomingList";
import WeekChart from "../components/dashboard/WeekChart";
import BirthdayList from "../components/dashboard/BirthdayList";

export default function Dashboard() {
  const today = moment().format("YYYY-MM-DD");

  // Buscar agendamentos
  const { data: agendamentos = [], isLoading: loadingAgendamentos } = useQuery({
    queryKey: ["agendamentos"],
    queryFn: () => api.getAgendamentos(),
  });

  // Buscar clientes
  const { data: clientes = [], isLoading: loadingClientes } = useQuery({
    queryKey: ["clientes"],
    queryFn: () => api.getClientes(),
  });

  // Filtrar agendamentos de hoje
  const todayAgendamentos = useMemo(() => {
    return agendamentos.filter(
      (a) => moment(a.data_hora_inicio).format("YYYY-MM-DD") === today && a.status !== "cancelado"
    );
  }, [agendamentos, today]);

  // Filtrar agendamentos pendentes
  const pendentes = useMemo(() => {
    return agendamentos.filter((a) => a.status === "pendente");
  }, [agendamentos]);

  // Filtrar aniversariantes do dia
  const aniversariantes = useMemo(() => {
    const todayMD = moment().format("MM-DD");
    return clientes.filter((c) => {
      if (!c.data_nascimento) return false;
      return moment(c.data_nascimento).format("MM-DD") === todayMD;
    });
  }, [clientes]);

  // Preparar dados para o gráfico da semana
  const weekData = useMemo(() => {
    const days = [];
    const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    for (let i = 0; i < 7; i++) {
      const d = moment().startOf("week").add(i, "days");
      const count = agendamentos.filter(
        (a) => moment(a.data_hora_inicio).format("YYYY-MM-DD") === d.format("YYYY-MM-DD") && a.status !== "cancelado"
      ).length;
      days.push({ dia: dayNames[i], total: count });
    }
    return days;
  }, [agendamentos]);

  // Próximos agendamentos
  const upcomingAgendamentos = useMemo(() => {
    return agendamentos
      .filter((a) => moment(a.data_hora_inicio).isSameOrAfter(moment(), "day") && a.status !== "cancelado")
      .sort((a, b) => moment(a.data_hora_inicio).diff(moment(b.data_hora_inicio)))
      .slice(0, 5);
  }, [agendamentos]);

  // Estado de carregamento combinado
  const isLoading = loadingAgendamentos || loadingClientes;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {moment().format("dddd, D [de] MMMM [de] YYYY")}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/agenda?new=true">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 shadow-md shadow-purple-200/50">
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Button>
          </Link>
          <Link to="/clientes?new=true">
            <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Agendamentos Hoje"
          value={todayAgendamentos.length}
          icon={Calendar}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          iconColor="text-purple-600"
        />
        <StatsCard
          title="Total de Clientes"
          value={clientes.length}
          icon={Users}
          gradient="bg-gradient-to-br from-pink-500 to-pink-600"
          iconColor="text-pink-600"
        />
        <StatsCard
          title="Aniversariantes"
          value={aniversariantes.length}
          icon={Gift}
          gradient="bg-gradient-to-br from-amber-500 to-amber-600"
          iconColor="text-amber-600"
        />
        <StatsCard
          title="Pendentes"
          value={pendentes.length}
          icon={Clock}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          iconColor="text-blue-600"
        />
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WeekChart data={weekData} />
        </div>
        <div>
          <BirthdayList clientes={aniversariantes} />
        </div>
      </div>

      {/* Upcoming */}
      <UpcomingList agendamentos={upcomingAgendamentos} />
    </div>
  );
}