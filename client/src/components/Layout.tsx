/**
 * @fileoverview Layout principal do sistema Quantor
 * 
 * Componente que define a estrutura base da aplicação:
 * - Sidebar responsiva com gradiente azul
 * - Navegação principal com 5 seções
 * - Sistema de colapso/expansão da sidebar
 * - Menu mobile com overlay
 * - Botão de logout e informações do usuário
 * - Design baseado na identidade visual Vizta
 * 
 * @author Equipe Quantor
 * @version 1.0.0
 */

// Importações de roteamento
import { Link, useLocation } from "wouter";

// Importações de ícones Lucide
import { 
  LayoutDashboard, 
  Receipt, 
  Building2, 
  Users, 
  MessageSquare,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  Settings
} from "lucide-react";

// Hooks e componentes React
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

/**
 * Props do componente Layout
 */
interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Configuração da navegação principal
 * Array de objetos com nome, rota e ícone para cada seção
 */
const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Relacionamentos", href: "/relationships", icon: Users },
  { name: "Finanças", href: "/transactions", icon: Receipt },
  { name: "Negócios", href: "/categories", icon: Building2 },
  { name: "Assistente IA", href: "/ai-chat", icon: MessageSquare },
];

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const sidebarWidth = sidebarCollapsed ? "w-16" : "w-64";
  const mainMargin = sidebarCollapsed ? "lg:ml-16" : "lg:ml-64";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white"
        >
          {sidebarOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 ${sidebarWidth} bg-gradient-to-b from-blue-600 via-blue-700 to-blue-800 shadow-xl transform transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full relative">
          {/* Collapse button */}
          <div className="absolute -right-3 top-80 z-50">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="h-6 w-6 bg-white hover:bg-gray-50 border-gray-300 rounded-full shadow-md hidden lg:flex"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-3 w-3" />
              ) : (
                <ChevronLeft className="h-3 w-3" />
              )}
            </Button>
          </div>

          {/* Header com logo */}
          <div className="p-6 border-b border-blue-500/30">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Q</span>
                </div>
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h1 className="text-xl font-bold text-white">Quantor</h1>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={`
                      flex items-center px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer group
                      ${isActive 
                        ? 'bg-blue-500/20 text-white border-r-2 border-white' 
                        : 'text-blue-100 hover:bg-blue-500/10 hover:text-white'
                      }
                      ${sidebarCollapsed ? 'justify-center' : ''}
                    `}
                    onClick={() => setSidebarOpen(false)}
                    title={sidebarCollapsed ? item.name : ''}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="ml-3 truncate">{item.name}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Logout button */}
          {!sidebarCollapsed && (
            <div className="p-3">
              <Button
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-md transition-colors duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          )}

          {/* User info */}
          <div className="p-4 border-t border-blue-500/30">
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center border-2 border-blue-300">
                <span className="text-white text-sm font-medium">
                  {(user as any)?.name?.charAt(0).toUpperCase() || (user as any)?.firstName?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{(user as any)?.name || (user as any)?.firstName}</p>
                  <p className="text-xs text-blue-200 truncate">Administrador</p>
                </div>
              )}
              {!sidebarCollapsed && (
                <ChevronRight className="h-4 w-4 text-blue-300" />
              )}
            </div>
          </div>

          {/* Collapsed logout button */}
          {sidebarCollapsed && (
            <div className="p-3">
              <Button
                onClick={handleLogout}
                size="icon"
                className="w-full bg-red-600 hover:bg-red-700 text-white aspect-square rounded-md"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className={`${mainMargin} flex flex-col min-h-screen transition-all duration-300`}>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Content */}
        <main className="flex-1 px-4 py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}