import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Megaphone,
  ClipboardList,
  Scissors,
  Menu,
  LogOut,
  ChevronRight,
  Sparkles,
  Settings // Adicionado ícone de configurações
} from "lucide-react";

// Menu principal (sem Configurações)
const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Clientes", icon: Users, path: "/clientes" },
  { name: "Agenda", icon: Calendar, path: "/agenda" },
  { name: "Serviços", icon: Scissors, path: "/servicos" },
  { name: "Anamnese", icon: ClipboardList, path: "/anamnese" },
  { name: "Marketing", icon: Megaphone, path: "/marketing" },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-pink-50/30">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-purple-100 shadow-lg transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-purple-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-200">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-gray-900 tracking-tight">EstéticaPro</h1>
                <p className="text-xs text-purple-400 font-medium">Gestão & Beleza</p>
              </div>
            </div>
          </div>

          {/* Navigation - Menu Principal */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive
                      ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md shadow-purple-200"
                      : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                    }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? "text-white" : ""}`} />
                  {item.name}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* User section - AGORA COM CONFIGURAÇÕES */}
          <div className="p-4 border-t border-purple-50">
            {user && (
              <div className="space-y-2">
                {/* Informações do usuário */}
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                    {user.nome?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.nome || "Usuário"}</p>
                    <p className="text-xs text-purple-400 capitalize">{user.perfil || "admin"}</p>
                  </div>
                </div>

                {/* Menu do Usuário - Configurações e Logout */}
                <div className="space-y-1">
                  {/* Link de Configurações */}
                  <Link
                    to="/configuracoes"
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                      ${location.pathname === "/configuracoes"
                        ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md shadow-purple-200"
                        : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                      }`}
                  >
                    <Settings className={`w-5 h-5 ${location.pathname === "/configuracoes" ? "text-white" : ""}`} />
                    Configurações
                    {location.pathname === "/configuracoes" && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </Link>

                  {/* Botão de Logout */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top bar mobile */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-purple-100 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-purple-50 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">EstéticaPro</span>
            </div>
            <div className="w-9" />
          </div>
        </header>

        {/* ÁREA PRINCIPAL */}
        <main className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}