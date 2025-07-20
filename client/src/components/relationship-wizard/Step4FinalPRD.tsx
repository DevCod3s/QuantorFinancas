/**
 * @fileoverview Etapa 4 do cadastro de relacionamento - PRD Final
 * 
 * Quarta e última etapa do wizard para finalização do cadastro.
 * Consolida todas as informações e permite confirmação final.
 * 
 * Funcionalidades:
 * - Resumo consolidado de todas as etapas
 * - Download de documentos gerados
 * - Confirmação final do cadastro
 * - Geração de códigos/IDs únicos
 * - Envio para aprovação final
 * 
 * @author Equipe Quantor
 * @version 1.0.0
 */

import React, { useState } from "react";
import { TEInput, TETextarea } from "tw-elements-react";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  Download, 
  FileText, 
  Hash, 
  Calendar,
  User,
  Building2,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Save
} from "lucide-react";

/**
 * Interface para dados do formulário da Etapa 4
 */
interface Step4FormData {
  finalConfirmation: boolean; // Confirmação final
  relationshipCode: string; // Código do relacionamento
  observations: string; // Observações finais
  notifyByEmail: boolean; // Notificar por email
  notifyBySMS: boolean; // Notificar por SMS
  generateWelcomeKit: boolean; // Gerar kit de boas-vindas
}

/**
 * Props do componente Step4FinalPRD
 */
interface Step4FinalPRDProps {
  onDataChange: (data: Step4FormData, isValid: boolean) => void; // Callback para mudança de dados
  initialData?: Partial<Step4FormData>; // Dados iniciais
  relationshipData?: any; // Dados da etapa 1
  contractData?: any; // Dados da etapa 2
  reviewData?: any; // Dados da etapa 3
}

/**
 * Componente Step4FinalPRD
 */
export default function Step4FinalPRD({ 
  onDataChange, 
  initialData = {},
  relationshipData,
  contractData,
  reviewData
}: Step4FinalPRDProps) {
  // Estado do formulário
  const [formData, setFormData] = useState<Step4FormData>({
    finalConfirmation: false,
    relationshipCode: '',
    observations: '',
    notifyByEmail: true,
    notifyBySMS: false,
    generateWelcomeKit: true,
    ...initialData
  });

  /**
   * Gera código único do relacionamento
   */
  const generateRelationshipCode = () => {
    const prefix = relationshipData?.documentType === 'CNPJ' ? 'PJ' : 'PF';
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${randomNum}`;
  };

  /**
   * Atualiza dados do formulário
   */
  const updateFormData = (updates: Partial<Step4FormData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    
    // Validar se etapa está completa
    const isValid = newData.finalConfirmation && newData.relationshipCode.length > 0;
    
    onDataChange(newData, isValid);
  };

  /**
   * Inicializar código se ainda não existe
   */
  React.useEffect(() => {
    if (!formData.relationshipCode) {
      updateFormData({ relationshipCode: generateRelationshipCode() });
    }
  }, []);

  /**
   * Calcula estatísticas do relacionamento
   */
  const getRelationshipStats = () => {
    const stats = {
      totalSteps: 4,
      completedSteps: 3 + (formData.finalConfirmation ? 1 : 0),
      hasContract: contractData?.generateContract || false,
      estimatedValue: contractData?.monthlyValue || 0,
      completionDate: new Date().toLocaleDateString('pt-BR')
    };
    return stats;
  };

  const stats = getRelationshipStats();

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-medium text-gray-900">
            Finalização do Cadastro
          </h3>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{stats.completionDate}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1 - Resumo do Relacionamento */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card de Progresso */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-blue-900">Progresso do Cadastro</h4>
              <span className="text-sm font-medium text-blue-600">
                {stats.completedSteps}/{stats.totalSteps} etapas
              </span>
            </div>
            
            <div className="w-full bg-blue-200 rounded-full h-2 mb-3">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(stats.completedSteps / stats.totalSteps) * 100}%` }}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-blue-700">Dados Básicos</span>
                <CheckCircle2 className="h-3 w-3 text-green-600" />
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-blue-700">
                  {stats.hasContract ? 'Contrato Gerado' : 'Sem Contrato'}
                </span>
                <CheckCircle2 className="h-3 w-3 text-green-600" />
              </div>
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span className="text-blue-700">Revisão Concluída</span>
                <CheckCircle2 className="h-3 w-3 text-green-600" />
              </div>
              <div className="flex items-center space-x-2">
                <Save className="h-4 w-4 text-blue-600" />
                <span className="text-blue-700">
                  {formData.finalConfirmation ? 'Finalizado' : 'Pendente'}
                </span>
                {formData.finalConfirmation ? (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                ) : (
                  <div className="h-3 w-3 border border-gray-300 rounded-full" />
                )}
              </div>
            </div>
          </div>

          {/* Informações Consolidadas */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4">Informações Consolidadas</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Hash className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Código:</span>
                  <span className="font-mono font-medium">{formData.relationshipCode}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Nome:</span>
                  <span className="font-medium">{relationshipData?.socialName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Documento:</span>
                  <span className="font-medium">{relationshipData?.document}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Localização:</span>
                  <span className="font-medium">
                    {relationshipData?.city}/{relationshipData?.state}
                  </span>
                </div>
                {stats.hasContract && (
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Valor Mensal:</span>
                    <span className="font-medium text-green-600">
                      R$ {stats.estimatedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Observações Finais */}
          <div>
            <TETextarea
              label="Observações Finais"
              rows={3}
              value={formData.observations}
              onChange={(e) => updateFormData({ observations: e.target.value })}
              placeholder="Digite observações adicionais sobre este relacionamento..."
            />
          </div>
        </div>

        {/* Coluna 2 - Ações e Configurações */}
        <div className="space-y-6">
          {/* Código do Relacionamento */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Código do Relacionamento</h4>
            <div className="flex space-x-2">
              <TEInput
                type="text"
                value={formData.relationshipCode}
                onChange={(e) => updateFormData({ relationshipCode: e.target.value })}
                size="base"
                readonly
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFormData({ relationshipCode: generateRelationshipCode() })}
                className="mt-1"
              >
                Gerar
              </Button>
            </div>
          </div>

          {/* Configurações de Notificação */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Notificações</h4>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.notifyByEmail}
                  onChange={(e) => updateFormData({ notifyByEmail: e.target.checked })}
                  className="rounded"
                />
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">Notificar por email</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.notifyBySMS}
                  onChange={(e) => updateFormData({ notifyBySMS: e.target.checked })}
                  className="rounded"
                />
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">Notificar por SMS</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.generateWelcomeKit}
                  onChange={(e) => updateFormData({ generateWelcomeKit: e.target.checked })}
                  className="rounded"
                />
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">Gerar kit de boas-vindas</span>
              </label>
            </div>
          </div>

          {/* Downloads Disponíveis */}
          {stats.hasContract && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Downloads</h4>
              
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Contrato PDF
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Ficha Cadastral
                </Button>
              </div>
            </div>
          )}

          {/* Confirmação Final */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.finalConfirmation}
                onChange={(e) => updateFormData({ finalConfirmation: e.target.checked })}
                className="mt-1 rounded text-green-600"
              />
              <div>
                <div className="font-medium text-green-900">Confirmar Cadastro</div>
                <div className="text-sm text-green-700 mt-1">
                  Confirmo que todas as informações estão corretas e autorizo a finalização do cadastro.
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}