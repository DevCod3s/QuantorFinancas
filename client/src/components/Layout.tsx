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
  Settings,
  Package
} from "lucide-react";

// Hooks e componentes React
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import logoFull from "@/assets/images/logo-full.svg";
import logoIcon from "@/assets/images/logo-icon.svg";


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

/**
 * Estilo de fundo compartilhado (Preto com Textura)
 */
const sidebarBackgroundStyle: React.CSSProperties = {
  backgroundColor: '#1a1a1a',
  backgroundImage: `
    linear-gradient(45deg, #222 25%, transparent 25%), 
    linear-gradient(-45deg, #222 25%, transparent 25%), 
    linear-gradient(45deg, transparent 75%, #222 75%), 
    linear-gradient(-45deg, transparent 75%, #222 75%)
  `,
  backgroundSize: '20px 20px',
  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
};

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
    <div className="min-h-screen relative" style={sidebarBackgroundStyle}>
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
      <div
        className={`fixed inset-y-0 left-0 z-40 ${sidebarWidth} shadow-xl transform transition-all duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={sidebarBackgroundStyle}
      >
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
          <div className="p-4 border-b border-white/5">
            <div className={`flex items-center transition-all duration-300 ${sidebarCollapsed ? 'justify-center overflow-hidden' : 'px-2'}`}>
              <div className="flex-shrink-0 transition-all duration-500">
                {sidebarCollapsed ? (
                  <img
                    src={logoIcon}
                    alt="Quantor Icon"
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <img
                    src={logoFull}
                    alt="Quantor Logo"
                    className="h-16 w-auto object-contain max-w-[200px]"
                  />
                )}
              </div>
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
                        ? 'bg-white/5 border-r-2 border-[#B59363]'
                        : 'hover:bg-white/5'
                      }
                      ${sidebarCollapsed ? 'justify-center' : ''}
                    `}
                    style={{ color: isActive ? '#B59363' : '#E6E7E8' }}
                    onClick={() => setSidebarOpen(false)}
                    title={sidebarCollapsed ? item.name : ''}
                  >
                    <Icon
                      className="h-5 w-5 flex-shrink-0"
                      style={{ color: isActive ? '#B59363' : '#E6E7E8' }}
                    />
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
                className="w-full text-white py-3 rounded-md transition-all duration-200 border-none shadow-lg"
                style={{
                  backgroundColor: '#B59363',
                  boxShadow: '0 4px 14px 0 rgba(181, 147, 99, 0.39)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c4a475'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#B59363'}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          )}

          {/* User info */}
          <div className="p-4 border-t border-white/5">
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-white/5 flex items-center justify-center border-2 border-[#B59363]/30">
                <span className="text-[#B59363] text-sm font-medium">
                  {(user as any)?.name?.charAt(0).toUpperCase() || (user as any)?.firstName?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#E6E7E8] truncate">{(user as any)?.name || (user as any)?.firstName}</p>
                  <p className="text-xs text-[#E6E7E8]/60 truncate">Administrador</p>
                </div>
              )}
              {!sidebarCollapsed && (
                <ChevronRight className="h-4 w-4 text-[#E6E7E8]/40" />
              )}
            </div>
          </div>

          {/* Collapsed logout button */}
          {sidebarCollapsed && (
            <div className="p-3">
              <Button
                onClick={handleLogout}
                size="icon"
                className="w-full text-white aspect-square rounded-md transition-all duration-200 border-none shadow-lg"
                style={{
                  backgroundColor: '#B59363',
                  boxShadow: '0 4px 14px 0 rgba(181, 147, 99, 0.39)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c4a475'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#B59363'}
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main content - A "Folha" Branca Arredondada */}
      <div className={`${mainMargin} flex flex-col min-h-screen transition-all duration-300 bg-white lg:rounded-tl-[40px] lg:rounded-bl-[40px] shadow-2xl relative z-10 overflow-hidden`}>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Content */}
        <main className="flex-1 px-4 py-8 lg:px-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}