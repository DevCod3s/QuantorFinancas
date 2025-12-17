import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { TABS } from "@/types";
import DashboardOverview from "@/components/dashboard/dashboard-overview";
import TransactionList from "@/components/transactions/transaction-list";
import BudgetCards from "@/components/budgets/budget-cards";
import ReportsCharts from "@/components/reports/charts";
import ChatInterface from "@/components/ai/chat-interface";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Não autorizado",
        description: "Você precisa estar logado. Redirecionando...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-chart-line text-white text-2xl animate-pulse"></i>
          </div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getPageTitle = (tabId: string) => {
    const tab = TABS.find(t => t.id === tabId);
    return tab?.label || 'Dashboard';
  };

  const getPageDescription = (tabId: string) => {
    const descriptions = {
      'dashboard': 'Bem-vindo de volta! Aqui está seu resumo financeiro.',
      'transactions': 'Adicione, edite e organize suas receitas e despesas',
      'budgets': 'Defina e acompanhe seus orçamentos mensais e anuais',
      'reports': 'Análises detalhadas do seu comportamento financeiro',
      'ai-assistant': 'Seu consultor financeiro pessoal com inteligência artificial'
    };
    return descriptions[tabId as keyof typeof descriptions] || '';
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'transactions':
        return <TransactionList />;
      case 'budgets':
        return <BudgetCards />;
      case 'reports':
        return <ReportsCharts />;
      case 'ai-assistant':
        return <ChatInterface />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      
      <main className="flex-1 overflow-y-auto">
        <Header 
          title={getPageTitle(activeTab)}
          description={getPageDescription(activeTab)}
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <div className="p-6">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
}
