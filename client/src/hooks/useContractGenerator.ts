/**
 * @fileoverview Hook para geração de contratos com IA
 * 
 * Hook personalizado que integra com OpenAI para gerar contratos profissionais
 * baseados nos dados fornecidos pelo usuário. Utiliza prompts especializados
 * em cláusulas contratuais por segmento de negócio.
 * 
 * Funcionalidades:
 * - Geração automática de contratos por IA
 * - Cláusulas específicas por segmento
 * - Layout profissional e ilustrado
 * - Integração com dados do relacionamento
 * - Estados de loading e erro
 * 
 * @author Equipe Quantor
 * @version 1.0.0
 */

import { useState } from 'react';

/**
 * Interface para dados do contrato
 */
interface ContractData {
  segment: string; // Segmento de negócio
  startDate: string; // Data inicial
  validityPeriod: string; // Prazo de validade
  paymentMethods: string[]; // Formas de pagamento
  hasAdhesion: boolean; // Tem adesão
  monthlyValue: number; // Valor mensal
  relationshipData?: any; // Dados do relacionamento da etapa 1
  customTemplate?: string; // Template personalizado
}

/**
 * Interface para resposta da geração
 */
interface ContractGenerationResult {
  contract: string; // HTML do contrato gerado
  success: boolean; // Sucesso da operação
  error?: string; // Mensagem de erro
}

/**
 * Hook useContractGenerator
 */
export function useContractGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContract, setGeneratedContract] = useState<string>('');
  const [error, setError] = useState<string>('');

  /**
   * Gera prompt especializado para contrato
   */
  const buildContractPrompt = (data: ContractData): string => {
    return `
    Você é um especialista em elaboração de contratos comerciais brasileiros. Crie um contrato profissional e juridicamente sólido com as seguintes especificações:

    DADOS DO CONTRATO:
    - Segmento: ${data.segment}
    - Data de Início: ${data.startDate}
    - Prazo de Validade: ${data.validityPeriod}
    - Formas de Pagamento: ${data.paymentMethods.join(', ')}
    - Possui Adesão: ${data.hasAdhesion ? 'Sim' : 'Não'}
    - Valor Mensal: R$ ${data.monthlyValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

    DADOS DO CONTRATANTE:
    ${data.relationshipData ? `
    - Nome/Razão Social: ${data.relationshipData.socialName}
    - Documento: ${data.relationshipData.document}
    - Endereço: ${data.relationshipData.street}, ${data.relationshipData.number}, ${data.relationshipData.neighborhood}, ${data.relationshipData.city}/${data.relationshipData.state}
    ` : ''}

    INSTRUÇÕES:
    1. Crie um contrato completo e profissional
    2. Use cláusulas específicas para o segmento ${data.segment}
    3. Inclua todas as cláusulas obrigatórias por lei brasileira
    4. Formate em HTML com estilo CSS inline para impressão
    5. Use layout elegante e profissional
    6. Inclua cabeçalho, rodapé e numeração de páginas
    7. Adicione espaços para assinaturas

    RETORNE APENAS O HTML COMPLETO, SEM EXPLICAÇÕES ADICIONAIS.
    `;
  };

  /**
   * Gera contrato usando OpenAI
   */
  const generateContract = async (data: ContractData): Promise<ContractGenerationResult> => {
    setIsGenerating(true);
    setError('');

    try {
      const prompt = data.customTemplate 
        ? `${data.customTemplate}\n\nAdapte este template com os dados: ${JSON.stringify(data)}`
        : buildContractPrompt(data);

      const response = await fetch('/api/generate-contract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          contractData: data
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar contrato');
      }

      const result = await response.json();
      setGeneratedContract(result.contract);
      
      return {
        contract: result.contract,
        success: true
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      return {
        contract: '',
        success: false,
        error: errorMessage
      };
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Limpa dados gerados
   */
  const clearContract = () => {
    setGeneratedContract('');
    setError('');
  };

  return {
    isGenerating,
    generatedContract,
    error,
    generateContract,
    clearContract
  };
}