import { Router, Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Dashboard } from "@/pages/Dashboard";
import { Transactions } from "@/pages/Transactions";
import { Categories } from "@/pages/Categories";
import { Budgets } from "@/pages/Budgets";
import { Reports } from "@/pages/Reports";
import { Login } from "@/pages/Login";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth.tsx";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { queryClient } from "@/lib/queryClient";

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    // Exibe tela de login se não estiver autenticado
    return <Login />;
  }

  return (
    <Layout>
      <Router>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/transactions" component={Transactions} />
          <Route path="/categories" component={Categories} />
          <Route path="/budgets" component={Budgets} />
          <Route path="/reports" component={Reports} />
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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster />
    </QueryClientProvider>
  );
}