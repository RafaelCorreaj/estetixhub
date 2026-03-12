import React from "react";
import { Card } from "@/components/ui/card";

export default function StatsCard({ title, value, icon: Icon, gradient, iconColor }) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className={`absolute inset-0 ${gradient} opacity-5`} />
      <div className="relative p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-xl ${gradient} bg-opacity-10`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        </div>
      </div>
    </Card>
  );
}