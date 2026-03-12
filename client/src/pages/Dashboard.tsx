import { useState, useEffect, lazy, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, ChevronRight, Loader2 } from "lucide-react";

const GeographicIntelligence = lazy(() => import("@/components/dashboard/GeographicIntelligence").then(module => ({ default: module.GeographicIntelligence })));

interface GeographicStats {
  clients: any[];
  locationRanking: Array<{
    location: string;
    count: number;
    totalRevenue: number;
  }>;
  stateRanking: Array<{
    state: string;
    count: number;
  }>;
}

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  
  // Buscar dados geográficos
  const { data: geoStats, isLoading: isDataLoading } = useQuery<GeographicStats>({
    queryKey: ["/api/dashboard/geographic"],
    enabled: isAuthenticated
  });

  // Auth Guard
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      toast({
        title: "Não autorizado",
        description: "Você precisa estar logado.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    }
  }, [isAuthenticated, isAuthLoading, toast]);

  if (isAuthLoading || (isAuthenticated && isDataLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#B59363]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Loader2 className="text-[#B59363] animate-spin" size={24} />
          </div>
          <p className="text-muted-foreground font-medium">Extraindo indicadores...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="p-2 md:p-6 space-y-6 bg-[#fdfdfd] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#4D4E48] tracking-tight">Dashboard</h1>
          <p className="text-gray-500 font-medium mt-1">Bem-vindo ao centro de inteligência Quantor.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col items-end px-4">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{(user as any)?.name || "Usuário"}</span>
            <span className="text-sm font-bold text-green-500 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Operacional
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Main Card */}
        <div className="lg:col-span-2">
          <Suspense fallback={
            <div className="h-[600px] flex flex-col items-center justify-center bg-white rounded-[2.5rem] shadow-xl animate-pulse text-gray-400 font-bold gap-4 border border-gray-100">
              <div className="w-16 h-16 bg-[#B59363]/10 rounded-2xl flex items-center justify-center">
                <Loader2 className="animate-spin text-[#B59363]" size={32} />
              </div>
              MASTRANDO BI INTELIGENTE...
            </div>
          }>
            <GeographicIntelligence clients={geoStats?.clients || []} />
          </Suspense>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#4D4E48] to-[#2a2a2a] p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group border border-white/10">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#B59363]/20 rounded-full blur-3xl group-hover:bg-[#B59363]/40 transition-all"></div>
             <h4 className="text-[10px] font-black text-[#B59363] uppercase tracking-[0.3em] mb-6">Foco Estratégico</h4>
             <p className="text-xl font-medium leading-tight tracking-tight opacity-95">
                Sua maior concentração de relacionamentos está atualmente em <span className="text-[#B59363] font-black">{geoStats?.locationRanking?.[0]?.location || 'análise'}</span>.
             </p>
             <button className="mt-8 flex items-center gap-3 text-[11px] font-black text-[#B59363] hover:text-white transition-all group">
                ACESSAR RELATÓRIO COMPLETO
                <ChevronRight size={16} className="group-hover:translate-x-2 transition-transform" />
             </button>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-8">
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-green-500/5 rounded-2xl flex items-center justify-center text-green-500 shadow-inner">
                 <TrendingUp size={20} />
               </div>
               <div>
                <h5 className="text-sm font-black text-[#4D4E48] uppercase tracking-wider">Performance</h5>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Visão Geral</p>
               </div>
             </div>
             
             <div className="pt-6 border-t border-gray-50">
                <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase">
                   <span className="text-gray-400">Registros Ativos</span>
                   <span className="text-[#4D4E48] bg-gray-100 px-3 py-1 rounded-full">{geoStats?.clients?.length || 0}</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
