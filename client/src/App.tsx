import { Router, Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Dashboard } from "@/pages/Dashboard";
import { Transactions } from "@/pages/Transactions";
import { Categories } from "@/pages/Categories";
import { Budgets } from "@/pages/Budgets";
import { Reports } from "@/pages/Reports";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    // Redireciona para login se não estiver autenticado
    window.location.href = "/api/login";
    return <LoadingSpinner />;
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