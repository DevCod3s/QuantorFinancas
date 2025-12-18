/**
 * @fileoverview Componente principal da aplicação Quantor
 * 
 * Este arquivo contém o roteamento principal e a configuração do QueryClient.
 * É responsável por:
 * - Configurar o provider do TanStack Query para gerenciamento de estado
 * - Definir as rotas da aplicação usando Wouter
 * - Implementar proteção de rotas baseada em autenticação
 * - Renderizar o layout principal e componentes de notificação
 * 
 * @author Equipe Quantor
 * @version 1.0.0
 */

// Importações de roteamento
import { Router, Route, Switch } from "wouter";

// Importações de gerenciamento de estado
import { QueryClientProvider } from "@tanstack/react-query";

// Importações de componentes UI
import { Toaster } from "@/components/ui/toaster";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Importações de páginas
import Dashboard from "@/pages/dashboard";
import { Relationships } from "@/pages/Relationships";
import { Transactions } from "@/pages/Transactions";
import { Categories } from "@/pages/Categories";
import { Login } from "@/pages/Login";

// Importações de layout e hooks
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth.tsx";

// Configuração do cliente de queries
import { queryClient } from "@/lib/queryClient";

/**
 * Componente interno que gerencia a lógica de autenticação e roteamento
 * 
 * @returns {JSX.Element} Componente renderizado baseado no estado de autenticação
 */
function AppContent() {
  // Hook personalizado para gerenciar estado de autenticação
  const { user, isLoading } = useAuth();

  // Exibe spinner de carregamento durante verificação de autenticação
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Redireciona para login se usuário não estiver autenticado
  if (!user) {
    return <Login />;
  }

  // Renderiza aplicação principal com layout e rotas protegidas
  return (
    <Layout>
      <Router>
        <Switch>
          {/* Rota principal - Dashboard com métricas financeiras */}
          <Route path="/" component={Dashboard} />
          
          {/* Página de gestão de relacionamentos (clientes, fornecedores) */}
          <Route path="/relationships" component={Relationships} />
          
          {/* Página de gestão financeira (transações, fluxo de caixa) */}
          <Route path="/transactions" component={Transactions} />
          
          {/* Página de gestão de negócios (categorias empresariais) */}
          <Route path="/categories" component={Categories} />
          
          {/* Rota padrão para páginas não encontradas */}
          <Route>
            <div className="flex items-center justify-center h-96">
              <h1 className="text-2xl text-gray-600">Página não encontrada</h1>
            </div>
          </Route>
        </Switch>
      </Router>
    </Layout>
  );
}

/**
 * Componente raiz da aplicação
 * 
 * Configura os providers principais:
 * - QueryClientProvider: Para cache e sincronização de dados do servidor
 * - Toaster: Para notificações toast globais
 * 
 * @returns {JSX.Element} Aplicação completa com providers configurados
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Componente principal com lógica de autenticação */}
      <AppContent />
      
      {/* Sistema global de notificações toast */}
      <Toaster />
    </QueryClientProvider>
  );
}