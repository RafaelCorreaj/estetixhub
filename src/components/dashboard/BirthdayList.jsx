import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Gift } from "lucide-react";

export default function BirthdayList({ clientes }) {
  if (!clientes || clientes.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-pink-500" />
            <CardTitle className="text-base font-semibold">Aniversariantes de Hoje</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400 text-center py-4">Nenhum aniversariante hoje</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-pink-50/50 to-purple-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Gift className="w-4 h-4 text-pink-500" />
          <CardTitle className="text-base font-semibold">Aniversariantes de Hoje</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {clientes.map((c) => (
          <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
              {c.nome?.[0]?.toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700">{c.nome}</span>
            <Gift className="w-3 h-3 text-pink-400 ml-auto" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}