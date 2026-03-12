import React from "react";
import { Badge } from "@/components/ui/badge";
import moment from "moment";

const statusColors = {
  pendente: "bg-amber-400",
  confirmado: "bg-emerald-400",
  concluido: "bg-blue-400",
  cancelado: "bg-red-400",
};

const statusBg = {
  pendente: "bg-amber-50 border-amber-200 hover:bg-amber-100",
  confirmado: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
  concluido: "bg-blue-50 border-blue-200 hover:bg-blue-100",
  cancelado: "bg-red-50 border-red-200 hover:bg-red-100 opacity-60",
};

export default function DayView({ date, agendamentos, onSlotClick, onAgendamentoClick }) {
  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 to 19:00

  const getAgendamentosForHour = (hour) => {
    return agendamentos.filter((a) => {
      const h = moment(a.data_hora_inicio).hour();
      return h === hour;
    });
  };

  return (
    <div className="space-y-1">
      {hours.map((hour) => {
        const items = getAgendamentosForHour(hour);
        return (
          <div
            key={hour}
            className="flex gap-3 group min-h-[60px]"
          >
            <div className="w-14 text-right text-xs text-gray-400 font-medium pt-2 flex-shrink-0">
              {String(hour).padStart(2, "0")}:00
            </div>
            <div
              className="flex-1 border-t border-gray-100 pt-1 cursor-pointer rounded-lg transition-colors hover:bg-purple-50/50 px-2"
              onClick={() => {
                if (items.length === 0) {
                  const d = moment(date).hour(hour).minute(0).second(0);
                  onSlotClick(d.toISOString());
                }
              }}
            >
              {items.map((ag) => (
                <div
                  key={ag.id}
                  className={`flex items-center gap-2 p-2 rounded-lg border mb-1 cursor-pointer transition-colors ${statusBg[ag.status] || ""}`}
                  onClick={(e) => { e.stopPropagation(); onAgendamentoClick(ag); }}
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColors[ag.status] || ""}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{ag.cliente_nome}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {ag.servico_nome} • {moment(ag.data_hora_inicio).format("HH:mm")} - {moment(ag.data_hora_fim).format("HH:mm")}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">{ag.profissional_nome}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}