import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, Edit, ClipboardList, Calendar, MessageCircle } from "lucide-react";

export default function ClienteCard({ cliente, onEdit, onAgendamento, onAnamnese }) {
  const whatsappNumber = cliente.telefone?.replace(/\D/g, "");

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {cliente.nome?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{cliente.nome}</h3>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
              <Phone className="w-3 h-3" />
              <span>{cliente.telefone}</span>
            </div>
            {cliente.email && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                <Mail className="w-3 h-3" />
                <span className="truncate">{cliente.email}</span>
              </div>
            )}
            {cliente.como_conheceu && (
              <Badge variant="secondary" className="mt-2 text-[10px] bg-purple-50 text-purple-600">
                {cliente.como_conheceu}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-50">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-500 hover:text-purple-600 flex-1"
            onClick={() => onEdit(cliente)}
          >
            <Edit className="w-3 h-3 mr-1" />
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-500 hover:text-purple-600 flex-1"
            onClick={() => onAnamnese(cliente)}
          >
            <ClipboardList className="w-3 h-3 mr-1" />
            Ficha
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-500 hover:text-purple-600 flex-1"
            onClick={() => onAgendamento(cliente)}
          >
            <Calendar className="w-3 h-3 mr-1" />
            Agendar
          </Button>
          {whatsappNumber && (
            <a
              href={`https://wa.me/55${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <MessageCircle className="w-3 h-3" />
              </Button>
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}