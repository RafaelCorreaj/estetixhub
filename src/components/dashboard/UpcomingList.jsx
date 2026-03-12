import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User } from "lucide-react";
import moment from "moment";

const statusColors = {
  pendente: "bg-amber-100 text-amber-700 border-amber-200",
  confirmado: "bg-emerald-100 text-emerald-700 border-emerald-200",
  concluido: "bg-blue-100 text-blue-700 border-blue-200",
  cancelado: "bg-red-100 text-red-700 border-red-200",
};

const statusLabels = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export default function UpcomingList({ agendamentos }) {
  if (!agendamentos || agendamentos.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Próximos Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400 text-center py-6">Nenhum agendamento encontrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Próximos Agendamentos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {agendamentos.slice(0, 5).map((ag) => (
          <div
            key={ag.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/80 hover:bg-purple-50/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{ag.cliente_nome || "Cliente"}</p>
              <p className="text-xs text-gray-500 truncate">{ag.servico_nome || "Serviço"}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {moment(ag.data_hora_inicio).format("HH:mm")}
              </div>
              <Badge variant="outline" className={`text-[10px] mt-1 ${statusColors[ag.status] || ""}`}>
                {statusLabels[ag.status] || ag.status}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}