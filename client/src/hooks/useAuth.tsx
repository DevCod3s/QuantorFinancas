/**
 * @fileoverview Hook personalizado para gerenciamento de autenticação
 * 
 * Fornece estado de autenticação global usando TanStack Query.
 * Utilizado em toda a aplicação para verificar se usuário está logado.
 * 
 * @author Equipe Quantor
 * @version 1.0.0
 */

import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

/**
 * Hook para gerenciar estado de autenticação
 * 
 * Faz uma requisição para /api/auth/user para verificar se o usuário
 * está autenticado. O resultado é cacheado pelo TanStack Query.
 * 
 * @returns {Object} Estado de autenticação
 * @returns {User | null} user - Dados do usuário logado ou null
 * @returns {boolean} isLoading - Se está carregando dados do usuário
 * @returns {boolean} isAuthenticated - Se usuário está autenticado
 * @returns {Error | null} error - Erro na autenticação, se houver
 */
export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"], // Cache key para dados do usuário
    retry: false, // Não retry em caso de erro 401 (não autenticado)
  });

  return {
    user, // Dados completos do usuário ou null
    isLoading, // Loading state durante verificação inicial
    isAuthenticated: !!user, // Boolean derivado do estado do usuário
    error, // Erro de autenticação, se houver
  };
}