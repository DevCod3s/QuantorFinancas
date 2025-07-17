import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Budget } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export function useBudgets() {
  const { toast } = useToast();

  return useQuery({
    queryKey: ["/api/budgets"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/budgets", {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error(`${response.status}: ${response.statusText}`);
        }
        return response.json();
      } catch (error) {
        if (isUnauthorizedError(error as Error)) {
          toast({
            title: "Não autorizado",
            description: "Você foi desconectado. Redirecionando...",
            variant: "destructive",
          });
          setTimeout(() => {
            window.location.href = "/api/login";
          }, 500);
          return null;
        }
        throw error;
      }
    },
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (budget: {
      categoryId?: number;
      budgetedAmount: string;
      period: 'mensal' | 'anual';
      startDate: string;
      endDate: string;
    }) => {
      await apiRequest("POST", "/api/budgets", budget);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Sucesso",
        description: "Orçamento criado com sucesso!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você foi desconectado. Redirecionando...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro",
        description: "Erro ao criar orçamento. Tente novamente.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...budget }: { id: number } & Partial<Budget>) => {
      await apiRequest("PUT", `/api/budgets/${id}`, budget);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Sucesso",
        description: "Orçamento atualizado com sucesso!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você foi desconectado. Redirecionando...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro",
        description: "Erro ao atualizar orçamento. Tente novamente.",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/budgets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Sucesso",
        description: "Orçamento excluído com sucesso!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você foi desconectado. Redirecionando...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro",
        description: "Erro ao excluir orçamento. Tente novamente.",
        variant: "destructive",
      });
    },
  });
}
