/**
 * @fileoverview Configuração do cliente TanStack Query
 * 
 * Configura o cliente global do TanStack Query para gerenciamento de estado servidor.
 * Define comportamentos padrão para queries e mutations em toda a aplicação.
 * 
 * Funcionalidades:
 * - Cache automático com 5 minutos de validade
 * - Retry inteligente em caso de falhas
 * - Query function padrão para requests HTTP
 * - Helper para mutations (POST, PUT, DELETE)
 * 
 * @author Equipe Quantor
 * @version 1.0.0
 */

import { QueryClient } from "@tanstack/react-query";

/**
 * Cliente global do TanStack Query
 * 
 * Configurações:
 * - retry: 1 tentativa adicional em caso de falha
 * - staleTime: Dados considerados frescos por 5 minutos
 * - queryFn: Função padrão para fazer requests GET
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Uma tentativa adicional em caso de falha
      staleTime: 5 * 60 * 1000, // Dados frescos por 5 minutos
      
      /**
       * Query function padrão para requests GET
       * 
       * @param queryKey - Array onde primeiro elemento é a URL
       * @returns Promise com dados JSON da resposta
       */
      queryFn: async ({ queryKey }) => {
        const url = queryKey[0] as string;
        const res = await fetch(url);
        
        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }
        
        return res.json();
      },
    },
  },
});

/**
 * Helper para requisições de API (mutations)
 * 
 * Utilizado para operações POST, PUT, DELETE que modificam dados.
 * Adiciona automaticamente headers JSON e trata erros.
 * 
 * @param url - URL do endpoint da API
 * @param options - Opções do fetch (method, body, headers, etc)
 * @returns Promise com dados JSON da resposta
 * 
 * @example
 * // Criar nova categoria
 * await apiRequest('/api/categories', {
 *   method: 'POST',
 *   body: JSON.stringify({ name: 'Alimentação', type: 'expense' })
 * });
 */
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json", // Header padrão para JSON
      ...options.headers, // Permite override de headers
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
};