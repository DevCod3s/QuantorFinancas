/**
 * @fileoverview Etapa 2 do cadastro de relacionamento - Geração de Contrato
 * 
 * Segunda etapa do wizard que permite gerar contratos automaticamente usando IA.
 * Implementa funcionalidades avançadas de personalização e geração inteligente.
 * 
 * Funcionalidades:
 * - Opção de gerar contrato ou pular etapa
 * - Upload de modelo personalizado
 * - Campos de configuração do contrato
 * - Cadastro dinâmico de segmentos
 * - Preview em tempo real
 * - Integração com IA para geração
 * 
 * @author Equipe Quantor
 * @version 1.0.0
 */

import React, { useState, useRef } from "react";
import { TEInput, TESelect, TETextarea } from "tw-elements-react";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  Plus, 
  FileText, 
  Eye, 
  Download, 
  Wand2, 
  Calendar,
  CreditCard,
  DollarSign,
  Building2,
  AlertCircle
} from "lucide-react";
import { useContractGenerator } from "../../hooks/useContractGenerator";

/**
 * Interface para dados do formulário da Etapa 2
 */
interface Step2FormData {
  generateContract: boolean; // Se vai gerar contrato
  segment: string; // Segmento selecionado
  customSegment: string; // Segmento personalizado
  startDate: string; // Data inicial
  validityPeriod: string; // Prazo de validade
  paymentMethods: string[]; // Formas de pagamento
  hasAdhesion: boolean; // Tem adesão
  monthlyValue: number; // Valor mensal
  customTemplate: string; // Template personalizado
  templateFile?: File; // Arquivo do template
}

/**
 * Props do componente Step2ContractGeneration
 */
interface Step2ContractGenerationProps {
  onDataChange: (data: Step2FormData, isValid: boolean) => void; // Callback para mudança de dados
  initialData?: Partial<Step2FormData>; // Dados iniciais
  relationshipData?: any; // Dados da etapa 1
}

/**
 * Segmentos predefinidos
 */
const predefinedSegments = [
  { value: 'tecnologia', text: 'Tecnologia e Software' },
  { value: 'consultoria', text: 'Consultoria Empresarial' },
  { value: 'marketing', text: 'Marketing e Publicidade' },
  { value: 'educacao', text: 'Educação e Treinamento' },
  { value: 'saude', text: 'Saúde e Bem-estar' },
  { value: 'financeiro', text: 'Serviços Financeiros' },
  { value: 'comercio', text: 'Comércio e Varejo' },
  { value: 'industria', text: 'Indústria e Manufatura' },
  { value: 'servicos', text: 'Serviços Gerais' },
  { value: 'outro', text: 'Outro (especificar)' }
];

/**
 * Formas de pagamento disponíveis
 */
const paymentOptions = [
  { id: 'pix', label: 'PIX' },
  { id: 'cartao', label: 'Cartão de Crédito/Débito' },
  { id: 'boleto', label: 'Boleto Bancário' },
  { id: 'transferencia', label: 'Transferência Bancária' },
  { id: 'dinheiro', label: 'Dinheiro' },
  { id: 'cheque', label: 'Cheque' }
];

/**
 * Componente Step2ContractGeneration
 */
export default function Step2ContractGeneration({ 
  onDataChange, 
  initialData = {},
  relationshipData 
}: Step2ContractGenerationProps) {
  // Estado do formulário
  const [formData, setFormData] = useState<Step2FormData>({
    generateContract: false,
    segment: '',
    customSegment: '',
    startDate: '',
    validityPeriod: '',
    paymentMethods: [],
    hasAdhesion: false,
    monthlyValue: 0,
    customTemplate: '',
    ...initialData
  });

  // Estados auxiliares
  const [showCustomSegment, setShowCustomSegment] = useState(false);
  const [showTemplateUpload, setShowTemplateUpload] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Referências
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Hook para geração de contratos
  const { isGenerating, generatedContract, generateContract, clearContract } = useContractGenerator();

  /**
   * Atualiza dados do formulário
   */
  const updateFormData = (updates: Partial<Step2FormData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    
    // Etapa 2 sempre válida - usuário pode pular geração de contrato
    const isValid = true;
    
    onDataChange(newData, isValid);
  };

  /**
   * Manipula mudança de checkbox de gerar contrato
   */
  const handleGenerateContractChange = (checked: boolean) => {
    updateFormData({ generateContract: checked });
    if (!checked) {
      clearContract();
      setShowPreview(false);
    }
  };

  /**
   * Manipula mudança no segmento
   */
  const handleSegmentChange = (value: string) => {
    setShowCustomSegment(value === 'outro');
    updateFormData({ segment: value, customSegment: value === 'outro' ? formData.customSegment : '' });
  };

  /**
   * Adiciona novo segmento personalizado
   */
  const handleAddCustomSegment = () => {
    if (formData.customSegment.trim()) {
      // Aqui poderia salvar no sistema para uso futuro
      updateFormData({ segment: formData.customSegment });
      setShowCustomSegment(false);
    }
  };

  /**
   * Manipula seleção de formas de pagamento
   */
  const handlePaymentMethodChange = (method: string, checked: boolean) => {
    const updatedMethods = checked
      ? [...formData.paymentMethods, method]
      : formData.paymentMethods.filter(m => m !== method);
    
    updateFormData({ paymentMethods: updatedMethods });
  };

  /**
   * Manipula upload de template
   */
  const handleTemplateUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        updateFormData({ 
          customTemplate: content,
          templateFile: file 
        });
      };
      reader.readAsText(file);
    }
  };

  /**
   * Gera preview do contrato
   */
  const handleGeneratePreview = async () => {
    const contractData = {
      segment: formData.segment || formData.customSegment,
      startDate: formData.startDate,
      validityPeriod: formData.validityPeriod,
      paymentMethods: formData.paymentMethods,
      hasAdhesion: formData.hasAdhesion,
      monthlyValue: formData.monthlyValue,
      relationshipData,
      customTemplate: formData.customTemplate
    };

    const result = await generateContract(contractData);
    if (result.success) {
      setShowPreview(true);
    }
  };

  /**
   * Não renderizar nada se não for gerar contrato
   */
  if (!formData.generateContract) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Geração de Contrato (Opcional)
          </h3>
          <p className="text-gray-600 mb-6">
            Você pode gerar um contrato profissional automaticamente usando IA especializada ou pular esta etapa.
          </p>
          
          <div className="space-y-4">
            <Button
              onClick={() => handleGenerateContractChange(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Gerar Contrato com IA
            </Button>
            
            <div className="text-sm text-gray-500">
              ou prosseguir para a próxima etapa
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">
            Configuração do Contrato
          </h3>
        </div>
        
        <Button
          variant="outline"
          onClick={() => handleGenerateContractChange(false)}
          size="sm"
        >
          Pular Etapa
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coluna Esquerda - Configurações */}
        <div className="space-y-6">
          {/* Template Personalizado */}
          <div>
            <label className="flex items-center space-x-2 mb-3">
              <input
                type="checkbox"
                checked={showTemplateUpload}
                onChange={(e) => setShowTemplateUpload(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Usar template personalizado
              </span>
            </label>
            
            {showTemplateUpload && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-600 mb-2">
                    Importe seu modelo de contrato
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.doc,.docx,.html"
                    onChange={handleTemplateUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Selecionar Arquivo
                  </Button>
                  {formData.templateFile && (
                    <div className="mt-2 text-xs text-green-600">
                      ✓ {formData.templateFile.name}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Segmento */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Building2 className="h-4 w-4 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">
                Segmento de Negócio *
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCustomSegment(true)}
                className="p-1"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            {!showCustomSegment ? (
              <TESelect
                data={predefinedSegments}
                label="Selecione o segmento"
                value={formData.segment}
                onValueChange={handleSegmentChange}
              />
            ) : (
              <div className="flex space-x-2">
                <TEInput
                  type="text"
                  label="Novo segmento"
                  value={formData.customSegment}
                  onChange={(e) => updateFormData({ customSegment: e.target.value })}
                  size="base"
                />
                <Button
                  onClick={handleAddCustomSegment}
                  size="sm"
                  className="mt-1"
                >
                  Adicionar
                </Button>
              </div>
            )}
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center space-x-2 mb-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Data Inicial *
                </span>
              </label>
              <TEInput
                type="date"
                value={formData.startDate}
                onChange={(e) => updateFormData({ startDate: e.target.value })}
                size="base"
              />
            </div>
            
            <div>
              <TEInput
                type="text"
                label="Prazo de Validade *"
                placeholder="Ex: 12 meses"
                value={formData.validityPeriod}
                onChange={(e) => updateFormData({ validityPeriod: e.target.value })}
                size="base"
              />
            </div>
          </div>

          {/* Valor Mensal */}
          <div>
            <label className="flex items-center space-x-2 mb-3">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Valor Mensal (R$) *
              </span>
            </label>
            <TEInput
              type="number"
              step="0.01"
              min="0"
              value={formData.monthlyValue}
              onChange={(e) => updateFormData({ monthlyValue: parseFloat(e.target.value) || 0 })}
              size="base"
            />
          </div>

          {/* Adesão */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.hasAdhesion}
                onChange={(e) => updateFormData({ hasAdhesion: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Contrato possui taxa de adesão
              </span>
            </label>
          </div>
        </div>

        {/* Coluna Direita - Formas de Pagamento */}
        <div className="space-y-6">
          <div>
            <label className="flex items-center space-x-2 mb-4">
              <CreditCard className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Formas de Pagamento *
              </span>
            </label>
            
            <div className="grid grid-cols-2 gap-3">
              {paymentOptions.map((option) => (
                <label key={option.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.paymentMethods.includes(option.id)}
                    onChange={(e) => handlePaymentMethodChange(option.id, e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="space-y-3">
            <Button
              onClick={handleGeneratePreview}
              disabled={isGenerating || !formData.segment && !formData.customSegment}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Gerando Contrato...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Gerar Preview
                </>
              )}
            </Button>

            {generatedContract && (
              <Button
                onClick={() => setShowPreview(!showPreview)}
                variant="outline"
                className="w-full"
              >
                <FileText className="h-4 w-4 mr-2" />
                {showPreview ? 'Ocultar' : 'Visualizar'} Contrato
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Preview do Contrato */}
      {showPreview && generatedContract && (
        <div className="mt-8 border-t pt-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">Preview do Contrato</h4>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
          </div>
          
          <div 
            className="border rounded-lg p-6 bg-white max-h-96 overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: generatedContract }}
          />
        </div>
      )}
    </div>
  );
}