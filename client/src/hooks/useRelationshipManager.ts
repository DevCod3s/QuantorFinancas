/**
 * @fileoverview Hook personalizado para gerenciamento de relacionamentos
 * 
 * Gerencia o ciclo completo de relacionamentos (CRUD) com integração
 * às APIs externas, validação automática e organização por tipos.
 * 
 * Funcionalidades:
 * - Detecção automática do tipo de relacionamento baseado na rota
 * - Validação de CPF/CNPJ com APIs externas
 * - Auto-preenchimento via ViaCEP e ReceitaWS
 * - Salvamento automático no tipo correto
 * - Estados de carregamento e erro
 * - Integração com React Query para cache
 * 
 * @author Equipe Quantor
 * @version 1.0.0
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import type { InsertRelationship } from '@shared/schema';

/**
 * Interface para dados completos do relacionamento
 */
interface RelationshipData {
  // Dados básicos
  document: string;
  documentType: 'CPF' | 'CNPJ';
  socialName: string;
  fantasyName?: string;
  stateRegistration: string;
  birthDate?: string;
  
  // Endereço
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  
  // Metadados
  type: 'cliente' | 'fornecedor' | 'outros';
  status: 'ativo' | 'inativo' | 'bloqueado' | 'cancelado';
}

/**
 * Hook useRelationshipManager
 * 
 * Gerencia operações CRUD de relacionamentos com detecção automática de tipo
 */
export function useRelationshipManager() {
  const [location] = useLocation();
  const queryClient = useQueryClient();
  
  // Estados locais
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Detecta o tipo de relacionamento baseado na rota atual
   */
  const detectRelationshipType = (): 'cliente' | 'fornecedor' | 'outros' => {
    if (location.includes('/relationships')) {
      // Se vier de uma aba específica, detectar pelo hash ou parâmetro
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);
      
      if (hash.includes('clientes') || params.get('tab') === 'clientes') {
        return 'cliente';
      } else if (hash.includes('fornecedores') || params.get('tab') === 'fornecedores') {
        return 'fornecedor';
      } else if (hash.includes('outros') || params.get('tab') === 'outros') {
        return 'outros';
      }
    }
    
    // Valor padrão
    return 'cliente';
  };

  /**
   * Validação de CPF usando algoritmo oficial
   */
  const validateCPF = (cpf: string): boolean => {
    const cleanCpf = cpf.replace(/\D/g, '');
    
    if (cleanCpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cleanCpf)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.charAt(10))) return false;
    
    return true;
  };

  /**
   * Validação de CNPJ usando algoritmo oficial
   */
  const validateCNPJ = (cnpj: string): boolean => {
    const numbers = cnpj.replace(/\D/g, '');
    
    if (numbers.length !== 14) return false;
    if (/^(.)\1{13}$/.test(numbers)) return false; // Sequência igual
    
    let length = numbers.length - 2;
    let sequence = numbers.substring(0, length);
    let digits = numbers.substring(length);
    let sum = 0;
    let pos = length - 7;
    
    // Validação do primeiro dígito
    for (let i = length; i >= 1; i--) {
      sum += parseInt(sequence.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;
    
    // Validação do segundo dígito
    length += 1;
    sequence = numbers.substring(0, length);
    sum = 0;
    pos = length - 7;
    
    for (let i = length; i >= 1; i--) {
      sum += parseInt(sequence.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;
    
    return true;
  };

  /**
   * Busca dados de CNPJ na API externa
   */
  const fetchCNPJData = async (cnpj: string) => {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
      if (!response.ok) throw new Error('CNPJ não encontrado');
      
      const data = await response.json();
      return {
        socialName: data.razao_social || '',
        fantasyName: data.nome_fantasia || '',
        zipCode: data.cep?.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2') || '',
        street: data.logradouro || '',
        number: data.numero || '',
        complement: data.complemento || '',
        neighborhood: data.bairro || '',
        city: data.municipio || '',
        state: data.uf || ''
      };
    } catch (error) {
      console.error('Erro ao buscar CNPJ:', error);
      return null;
    }
  };

  /**
   * Busca dados de endereço via CEP
   */
  const fetchCEPData = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return null;
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      if (!response.ok) throw new Error('CEP não encontrado');
      
      const data = await response.json();
      if (data.erro) throw new Error('CEP inválido');
      
      return {
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || ''
      };
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      return null;
    }
  };

  /**
   * Mutation para criar relacionamento
   */
  const createRelationshipMutation = useMutation({
    mutationFn: async (data: RelationshipData) => {
      const relationshipData: InsertRelationship = {
        type: data.type,
        documentType: data.documentType,
        document: data.document,
        socialName: data.socialName,
        fantasyName: data.fantasyName || null,
        stateRegistration: data.stateRegistration || null,
        birthDate: data.birthDate || null,
        zipCode: data.zipCode,
        street: data.street,
        number: data.number,
        complement: data.complement || null,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        status: data.status || 'ativo',
        userId: 0 // Será preenchido pelo backend
      };

      return apiRequest('POST', '/api/relationships', relationshipData);
    },
    onSuccess: () => {
      // Invalidar cache para atualizar listas
      queryClient.invalidateQueries({ queryKey: ['/api/relationships'] });
      setError(null);
    },
    onError: (error: any) => {
      setError(error.message || 'Erro ao salvar relacionamento');
    }
  });

  /**
   * Função principal para salvar relacionamento
   */
  const saveRelationship = async (data: Omit<RelationshipData, 'type' | 'status'>) => {
    setIsLoading(true);
    setError(null);

    try {
      // Detectar tipo automaticamente
      const type = detectRelationshipType();
      
      // Validar documento
      if (data.documentType === 'CPF' && !validateCPF(data.document)) {
        throw new Error('CPF inválido');
      }
      
      if (data.documentType === 'CNPJ' && !validateCNPJ(data.document)) {
        throw new Error('CNPJ inválido');
      }

      // Preparar dados completos
      const completeData: RelationshipData = {
        ...data,
        type,
        status: 'ativo'
      };

      // Salvar no backend
      await createRelationshipMutation.mutateAsync(completeData);
      
      return true;
    } catch (error: any) {
      setError(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Estados
    isLoading: isLoading || createRelationshipMutation.isPending,
    error,
    
    // Funções de validação
    validateCPF,
    validateCNPJ,
    
    // Funções de busca externa
    fetchCNPJData,
    fetchCEPData,
    
    // Função principal
    saveRelationship,
    
    // Utilitários
    detectRelationshipType,
    
    // Reset de estado
    clearError: () => setError(null)
  };
}