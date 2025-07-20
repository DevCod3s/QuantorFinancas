/**
 * @fileoverview Etapa 1 do cadastro de relacionamento - Informações Básicas
 * 
 * Primeira etapa do wizard de cadastro que coleta dados básicos do relacionamento.
 * Implementa auto-preenchimento baseado em CPF/CNPJ e navegação automática entre campos.
 * 
 * Funcionalidades:
 * - Input CPF/CNPJ com formatação e validação automática
 * - Auto-preenchimento de dados quando documento válido
 * - Navegação automática entre campos
 * - Layout baseado na imagem de referência
 * - Integração com tw-elements-react
 * - Card elevado com sombreamento
 * 
 * @author Equipe Quantor
 * @version 1.0.0
 */

import React, { useState, useRef, useEffect } from "react";
import CpfCnpjInput from "../CpfCnpjInput";
import CustomInput, { CustomSelect } from "../CustomInput";

/**
 * Interface para dados do formulário da Etapa 1
 */
interface Step1FormData {
  document: string; // CPF ou CNPJ
  documentType: 'CPF' | 'CNPJ' | null; // Tipo do documento
  socialName: string; // Razão social
  fantasyName: string; // Nome fantasia
  stateRegistration: string; // Inscrição estadual
  isExempt: boolean; // Isento de inscrição estadual
  zipCode: string; // CEP
  street: string; // Logradouro
  number: string; // Número
  complement: string; // Complemento
  neighborhood: string; // Bairro
  state: string; // Estado
  city: string; // Cidade
}

/**
 * Props do componente Step1BasicInfo
 */
interface Step1BasicInfoProps {
  onDataChange: (data: Step1FormData, isValid: boolean) => void; // Callback para mudança de dados
  initialData?: Partial<Step1FormData>; // Dados iniciais
}

/**
 * Estados brasileiros para o select
 */
const brazilianStates = [
  { value: 'AC', text: 'Acre' },
  { value: 'AL', text: 'Alagoas' },
  { value: 'AP', text: 'Amapá' },
  { value: 'AM', text: 'Amazonas' },
  { value: 'BA', text: 'Bahia' },
  { value: 'CE', text: 'Ceará' },
  { value: 'DF', text: 'Distrito Federal' },
  { value: 'ES', text: 'Espírito Santo' },
  { value: 'GO', text: 'Goiás' },
  { value: 'MA', text: 'Maranhão' },
  { value: 'MT', text: 'Mato Grosso' },
  { value: 'MS', text: 'Mato Grosso do Sul' },
  { value: 'MG', text: 'Minas Gerais' },
  { value: 'PA', text: 'Pará' },
  { value: 'PB', text: 'Paraíba' },
  { value: 'PR', text: 'Paraná' },
  { value: 'PE', text: 'Pernambuco' },
  { value: 'PI', text: 'Piauí' },
  { value: 'RJ', text: 'Rio de Janeiro' },
  { value: 'RN', text: 'Rio Grande do Norte' },
  { value: 'RS', text: 'Rio Grande do Sul' },
  { value: 'RO', text: 'Rondônia' },
  { value: 'RR', text: 'Roraima' },
  { value: 'SC', text: 'Santa Catarina' },
  { value: 'SP', text: 'São Paulo' },
  { value: 'SE', text: 'Sergipe' },
  { value: 'TO', text: 'Tocantins' }
];

/**
 * Componente Step1BasicInfo
 */
export default function Step1BasicInfo({ onDataChange, initialData = {} }: Step1BasicInfoProps) {
  // Estado do formulário
  const [formData, setFormData] = useState<Step1FormData>({
    document: '',
    documentType: null,
    socialName: '',
    fantasyName: '',
    stateRegistration: '',
    isExempt: false,
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    state: '',
    city: '',
    ...initialData
  });

  // Referências para navegação automática entre campos
  const socialNameRef = useRef<HTMLInputElement>(null);
  const fantasyNameRef = useRef<HTMLInputElement>(null);
  const stateRegistrationRef = useRef<HTMLInputElement>(null);
  const zipCodeRef = useRef<HTMLInputElement>(null);

  /**
   * Atualiza dados do formulário
   */
  const updateFormData = (updates: Partial<Step1FormData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    
    // Validar se formulário está completo
    const isValid = !!(
      newData.document &&
      newData.socialName &&
      newData.zipCode &&
      newData.street &&
      newData.neighborhood &&
      newData.state &&
      newData.city
    );
    
    onDataChange(newData, isValid);
  };

  /**
   * Manipula mudança no CPF/CNPJ
   */
  const handleDocumentChange = (value: string, isValid: boolean, type: 'CPF' | 'CNPJ' | null) => {
    updateFormData({ 
      document: value, 
      documentType: type,
      // Limpar nome fantasia se for CPF
      fantasyName: type === 'CPF' ? '' : formData.fantasyName
    });
    
    // Se válido, focar no próximo campo
    if (isValid && socialNameRef.current) {
      setTimeout(() => {
        socialNameRef.current?.focus();
      }, 100);
    }
  };

  /**
   * Manipula auto-preenchimento quando documento válido
   */
  const handleValidDocument = (documentData: any) => {
    updateFormData({
      socialName: documentData.name,
      fantasyName: documentData.socialName || '',
      stateRegistration: documentData.stateRegistration || '',
      zipCode: documentData.address?.zipCode || '',
      street: documentData.address?.street || '',
      number: documentData.address?.number || '',
      complement: documentData.address?.complement || '',
      neighborhood: documentData.address?.neighborhood || '',
      city: documentData.address?.city || '',
      state: documentData.address?.state || ''
    });
  };

  /**
   * Formata CEP
   */
  const formatZipCode = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{1,3})/, '$1-$2');
  };

  /**
   * Manipula mudança no CEP
   */
  const handleZipCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatZipCode(event.target.value);
    updateFormData({ zipCode: formatted });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
      {/* Seção: Informação básica */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-6 border-b border-gray-200 pb-2">
          Informação básica
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CPF/CNPJ */}
          <div>
            <CpfCnpjInput
              value={formData.document}
              onChange={handleDocumentChange}
              onValidDocument={handleValidDocument}
              label="CNPJ *"
              id="document"
            />
          </div>

          {/* Razão Social */}
          <div>
            <CustomInput
              ref={socialNameRef}
              type="text"
              id="social-name"
              label="Razão social *"
              value={formData.socialName}
              onChange={(e) => updateFormData({ socialName: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && formData.documentType === 'CNPJ' && fantasyNameRef.current) {
                  fantasyNameRef.current.focus();
                } else if (e.key === 'Enter' && formData.documentType === 'CPF' && stateRegistrationRef.current) {
                  stateRegistrationRef.current.focus();
                }
              }}
            />
          </div>

          {/* Inscrição Estadual */}
          <div className="relative">
            <CustomInput
              ref={stateRegistrationRef}
              type="text"
              id="state-registration"
              label="Inscrição estadual *"
              value={formData.stateRegistration}
              onChange={(e) => updateFormData({ stateRegistration: e.target.value })}
              disabled={formData.isExempt}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && zipCodeRef.current) {
                  zipCodeRef.current.focus();
                }
              }}
            />
            {/* Checkbox Isento */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
              <input
                type="checkbox"
                id="exempt-checkbox"
                checked={formData.isExempt}
                onChange={(e) => updateFormData({ 
                  isExempt: e.target.checked, 
                  stateRegistration: e.target.checked ? 'ISENTO' : '' 
                })}
                className="mr-2"
              />
              <label htmlFor="exempt-checkbox" className="text-xs text-gray-600">
                Isento
              </label>
            </div>
          </div>
        </div>

        {/* Nome Fantasia (apenas para CNPJ) */}
        {formData.documentType === 'CNPJ' && (
          <div className="mt-6">
            <CustomInput
              ref={fantasyNameRef}
              type="text"
              id="fantasy-name"
              label="Nome fantasia"
              value={formData.fantasyName}
              onChange={(e) => updateFormData({ fantasyName: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && stateRegistrationRef.current) {
                  stateRegistrationRef.current.focus();
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Seção: Localização */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-6 border-b border-gray-200 pb-2">
          Localização
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CEP */}
          <div>
            <CustomInput
              ref={zipCodeRef}
              type="text"
              id="zip-code"
              label="CEP *"
              value={formData.zipCode}
              onChange={handleZipCodeChange}
              placeholder="00000-000"
            />
          </div>

          {/* Logradouro */}
          <div>
            <CustomInput
              type="text"
              id="street"
              label="Logradouro *"
              value={formData.street}
              onChange={(e) => updateFormData({ street: e.target.value })}
            />
          </div>

          {/* Número */}
          <div>
            <CustomInput
              type="text"
              id="number"
              label="Número *"
              value={formData.number}
              onChange={(e) => updateFormData({ number: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Complemento */}
          <div>
            <CustomInput
              type="text"
              id="complement"
              label="Complemento"
              value={formData.complement}
              onChange={(e) => updateFormData({ complement: e.target.value })}
            />
          </div>

          {/* Bairro */}
          <div>
            <CustomInput
              type="text"
              id="neighborhood"
              label="Bairro *"
              value={formData.neighborhood}
              onChange={(e) => updateFormData({ neighborhood: e.target.value })}
            />
          </div>

          {/* Estado */}
          <div>
            <CustomSelect
              id="state"
              label="Estado *"
              value={formData.state}
              onChange={(e) => updateFormData({ state: e.target.value })}
            >
              <option value="">Selecione...</option>
              {brazilianStates.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.text}
                </option>
              ))}
            </CustomSelect>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Cidade */}
          <div>
            <CustomInput
              type="text"
              id="city"
              label="Cidade *"
              value={formData.city}
              onChange={(e) => updateFormData({ city: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}