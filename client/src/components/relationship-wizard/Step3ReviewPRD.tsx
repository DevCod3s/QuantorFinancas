/**
 * @fileoverview Etapa 3 do cadastro de relacionamento - Revisar PRD
 * 
 * Terceira etapa do wizard para revisão do Produto/Serviço (PRD).
 * Permite revisão e validação das informações antes da finalização.
 * 
 * Funcionalidades:
 * - Revisão dos dados das etapas anteriores
 * - Validação de informações
 * - Edição rápida de campos importantes
 * - Preview consolidado
 * - Aprovação para prosseguir
 * 
 * @author Equipe Quantor
 * @version 1.0.0
 */

import React, { useState } from "react";
import { TEInput, TETextarea } from "tw-elements-react";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Edit, 
  Eye, 
  FileText, 
  User, 
  Building,
  Calendar,
  DollarSign,
  AlertTriangle
} from "lucide-react";

/**
 * Interface para dados do formulário da Etapa 3
 */
interface Step3FormData {
  reviewApproved: boolean; // Se a revisão foi aprovada
  notes: string; // Observações da revisão
  modificationsRequested: boolean; // Se há modificações solicitadas
  modificationNotes: string; // Notas sobre modificações
}

/**
 * Props do componente Step3ReviewPRD
 */
interface Step3ReviewPRDProps {
  onDataChange: (data: Step3FormData, isValid: boolean) => void; // Callback para mudança de dados
  initialData?: Partial<Step3FormData>; // Dados iniciais
  relationshipData?: any; // Dados da etapa 1
  contractData?: any; // Dados da etapa 2
}

/**
 * Componente Step3ReviewPRD
 */
export default function Step3ReviewPRD({ 
  onDataChange, 
  initialData = {},
  relationshipData,
  contractData
}: Step3ReviewPRDProps) {
  // Estado do formulário
  const [formData, setFormData] = useState<Step3FormData>({
    reviewApproved: false,
    notes: '',
    modificationsRequested: false,
    modificationNotes: '',
    ...initialData
  });

  /**
   * Atualiza dados do formulário
   */
  const updateFormData = (updates: Partial<Step3FormData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    
    // Validar se etapa está completa
    const isValid = newData.reviewApproved || newData.modificationsRequested;
    
    onDataChange(newData, isValid);
  };

  /**
   * Formatar dados para exibição
   */
  const formatDisplayData = (data: any) => {
    if (!data) return 'Não informado';
    if (typeof data === 'boolean') return data ? 'Sim' : 'Não';
    if (Array.isArray(data)) return data.join(', ');
    return data.toString();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <Eye className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-medium text-gray-900">
          Revisar Informações do Relacionamento
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coluna Esquerda - Dados da Etapa 1 */}
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <User className="h-5 w-5 text-gray-600" />
              <h4 className="font-medium text-gray-900">Informações Básicas</h4>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Documento:</span>
                <span className="font-medium">{formatDisplayData(relationshipData?.document)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Razão Social:</span>
                <span className="font-medium">{formatDisplayData(relationshipData?.socialName)}</span>
              </div>
              {relationshipData?.fantasyName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Nome Fantasia:</span>
                  <span className="font-medium">{formatDisplayData(relationshipData?.fantasyName)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Cidade/Estado:</span>
                <span className="font-medium">
                  {relationshipData?.city} / {relationshipData?.state}
                </span>
              </div>
            </div>
          </div>

          {/* Dados do Contrato */}
          {contractData?.generateContract && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="h-5 w-5 text-gray-600" />
                <h4 className="font-medium text-gray-900">Informações do Contrato</h4>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Segmento:</span>
                  <span className="font-medium">
                    {formatDisplayData(contractData?.segment || contractData?.customSegment)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data Inicial:</span>
                  <span className="font-medium">{formatDisplayData(contractData?.startDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Validade:</span>
                  <span className="font-medium">{formatDisplayData(contractData?.validityPeriod)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor Mensal:</span>
                  <span className="font-medium">
                    R$ {contractData?.monthlyValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Formas de Pagamento:</span>
                  <span className="font-medium">{formatDisplayData(contractData?.paymentMethods)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Coluna Direita - Revisão e Aprovação */}
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-4">Status da Revisão</h4>
            
            <div className="space-y-4">
              {/* Aprovação */}
              <label className="flex items-center space-x-3 p-3 border border-green-200 rounded-lg hover:bg-green-50 cursor-pointer">
                <input
                  type="radio"
                  name="reviewStatus"
                  checked={formData.reviewApproved && !formData.modificationsRequested}
                  onChange={() => updateFormData({ 
                    reviewApproved: true, 
                    modificationsRequested: false 
                  })}
                  className="text-green-600"
                />
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium text-green-900">Aprovar Informações</div>
                  <div className="text-sm text-green-700">
                    Todas as informações estão corretas
                  </div>
                </div>
              </label>

              {/* Modificações */}
              <label className="flex items-center space-x-3 p-3 border border-orange-200 rounded-lg hover:bg-orange-50 cursor-pointer">
                <input
                  type="radio"
                  name="reviewStatus"
                  checked={formData.modificationsRequested}
                  onChange={() => updateFormData({ 
                    modificationsRequested: true, 
                    reviewApproved: false 
                  })}
                  className="text-orange-600"
                />
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="font-medium text-orange-900">Solicitar Modificações</div>
                  <div className="text-sm text-orange-700">
                    Algumas informações precisam ser ajustadas
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Observações */}
          <div>
            <TETextarea
              label="Observações da Revisão"
              rows={4}
              value={formData.notes}
              onChange={(e) => updateFormData({ notes: e.target.value })}
              placeholder="Digite suas observações sobre a revisão..."
            />
          </div>

          {/* Notas de Modificação */}
          {formData.modificationsRequested && (
            <div>
              <TETextarea
                label="Modificações Solicitadas *"
                rows={4}
                value={formData.modificationNotes}
                onChange={(e) => updateFormData({ modificationNotes: e.target.value })}
                placeholder="Descreva as modificações necessárias..."
              />
            </div>
          )}

          {/* Resumo de Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Resumo</h4>
            <div className="text-sm text-gray-600">
              {formData.reviewApproved && !formData.modificationsRequested && (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Pronto para finalização</span>
                </div>
              )}
              {formData.modificationsRequested && (
                <div className="flex items-center space-x-2 text-orange-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Modificações solicitadas</span>
                </div>
              )}
              {!formData.reviewApproved && !formData.modificationsRequested && (
                <div className="text-gray-500">
                  Aguardando revisão...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}