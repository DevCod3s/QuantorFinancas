import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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
          <div className="w-16 h-16 bg-[#B59363]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-chart-line text-[#B59363] text-2xl animate-pulse"></i>
          </div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="w-24 h-24 bg-[#B59363]/10 rounded-full flex items-center justify-center mb-8">
        <i className="fas fa-tools text-[#B59363] text-4xl"></i>
      </div>

      <h2 className="text-3xl font-bold text-[#4D4E48] mb-4">Dashboard em Desenvolvimento</h2>

      <p className="text-gray-500 max-w-lg mx-auto text-lg leading-relaxed">
        Estamos preparando um painel de indicadores completo, elegante e profissional para você.
        Em breve, todas as suas métricas, gráficos e insights financeiros estarão disponíveis nesta central.
      </p>

      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => window.location.href = "/transactions"}
          className="px-8 py-3 bg-[#B59363] text-white rounded-xl hover:bg-[#a38459] transition-all shadow-lg shadow-[#B59363]/20 font-semibold text-lg"
        >
          <i className="fas fa-receipt mr-2"></i>
          Ver Minhas Finanças
        </button>

        <button
          onClick={() => window.location.href = "/relationships"}
          className="px-8 py-3 bg-white text-[#4D4E48] border-2 border-gray-100 rounded-xl hover:bg-gray-50 transition-all font-semibold text-lg"
        >
          <i className="fas fa-users mr-2"></i>
          Relacionamentos
        </button>
      </div>

      <div className="mt-12 flex items-center gap-2 text-sm text-gray-400">
        <div className="w-2 h-2 bg-[#B59363] rounded-full animate-ping"></div>
        Novidades chegando em breve
      </div>
    </div>
  );
}
