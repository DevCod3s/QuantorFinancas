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
  socialName: string; // Razão social (CNPJ) ou Nome (CPF)
  fantasyName: string; // Nome fantasia (apenas CNPJ)
  stateRegistration: string; // Inscrição estadual (CNPJ) ou RG (CPF)
  isExempt: boolean; // Isento de inscrição estadual
  birthDate: string; // Data de nascimento (apenas CPF)
  zipCode: string; // CEP
  street: string; // Logradouro
  number: string; // Número
  complement: string; // Complemento
  neighborhood: string; // Bairro
  city: string; // Cidade
  state: string; // Estado
  isLoading: boolean; // Estado de carregamento para APIs
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
    birthDate: '',
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    isLoading: false,
    ...initialData
  });

  // Referências para navegação automática entre campos
  const socialNameRef = useRef<HTMLInputElement>(null);
  const fantasyNameRef = useRef<HTMLInputElement>(null);
  const stateRegistrationRef = useRef<HTMLInputElement>(null);
  const birthDateRef = useRef<HTMLInputElement>(null);
  const zipCodeRef = useRef<HTMLInputElement>(null);

  /**
   * Atualiza dados do formulário
   */
  const updateFormData = (updates: Partial<Step1FormData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    
    // Validar se formulário está completo baseado no tipo de documento
    const isValid = !!(
      newData.document &&
      newData.socialName &&
      newData.stateRegistration &&
      (newData.documentType === 'CPF' ? newData.birthDate : true) &&
      newData.zipCode &&
      newData.street &&
      newData.number &&
      newData.neighborhood &&
      newData.city &&
      newData.state
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
   * Busca dados de CNPJ na API da Receita Federal
   */
  const fetchCNPJData = async (cnpj: string) => {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    updateFormData({ isLoading: true });

    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
      if (response.ok) {
        const data = await response.json();
        updateFormData({
          socialName: data.razao_social || data.nome_fantasia || '',
          fantasyName: data.nome_fantasia || '',
          stateRegistration: '',
          zipCode: data.cep?.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2') || '',
          street: data.logradouro || '',
          number: data.numero || '',
          complement: data.complemento || '',
          neighborhood: data.bairro || '',
          city: data.municipio || '',
          state: data.uf || '',
          isLoading: false
        });
        
        // Se temos CEP, buscar dados completos do endereço
        if (data.cep) {
          fetchCEPData(data.cep.replace(/\D/g, ''));
        }
      } else {
        updateFormData({ isLoading: false });
      }
    } catch (error) {
      console.error('Erro ao buscar CNPJ:', error);
      updateFormData({ isLoading: false });
    }
  };

  /**
   * Busca dados de endereço via CEP
   */
  const fetchCEPData = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    updateFormData({ isLoading: true });

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      if (response.ok) {
        const data = await response.json();
        if (!data.erro) {
          updateFormData({
            street: data.logradouro || formData.street,
            neighborhood: data.bairro || formData.neighborhood,
            city: data.localidade || formData.city,
            state: data.uf || formData.state,
            isLoading: false
          });
        } else {
          updateFormData({ isLoading: false });
        }
      } else {
        updateFormData({ isLoading: false });
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      updateFormData({ isLoading: false });
    }
  };

  /**
   * Manipula auto-preenchimento quando documento válido
   */
  const handleValidDocument = (documentData: any) => {
    if (documentData.type === 'CNPJ') {
      // Para CNPJ, buscar dados reais da API
      fetchCNPJData(documentData.document);
    } else {
      // Para CPF, limpar campos não aplicáveis
      updateFormData({
        fantasyName: '',
        isExempt: false
      });
    }
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
    
    // Se CEP completo, buscar endereço
    const cleanCep = formatted.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      fetchCEPData(cleanCep);
    }
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
              label="CPF/CNPJ *"
              id="document"
            />
            {formData.isLoading && (
              <div className="mt-1 text-xs text-blue-600 flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                Buscando dados...
              </div>
            )}
          </div>

          {/* Nome/Razão Social */}
          <div>
            <CustomInput
              ref={socialNameRef}
              type="text"
              id="social-name"
              label={formData.documentType === 'CPF' ? 'Nome completo *' : 'Razão social *'}
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

          {/* RG (CPF) ou Inscrição Estadual (CNPJ) */}
          <div className="relative">
            <CustomInput
              ref={stateRegistrationRef}
              type="text"
              id="state-registration"
              label={formData.documentType === 'CPF' ? 'RG *' : 'Inscrição estadual *'}
              value={formData.stateRegistration}
              onChange={(e) => updateFormData({ stateRegistration: e.target.value })}
              disabled={formData.documentType === 'CNPJ' && formData.isExempt}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (formData.documentType === 'CPF' && birthDateRef.current) {
                    birthDateRef.current.focus();
                  } else if (zipCodeRef.current) {
                    zipCodeRef.current.focus();
                  }
                }
              }}
            />
            {/* Checkbox Isento (apenas para CNPJ) */}
            {formData.documentType === 'CNPJ' && (
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
            )}
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

        {/* Data de Nascimento (apenas para CPF) */}
        {formData.documentType === 'CPF' && (
          <div className="mt-6">
            <CustomInput
              ref={birthDateRef}
              type="date"
              id="birth-date"
              label="Data de nascimento *"
              value={formData.birthDate}
              onChange={(e) => updateFormData({ birthDate: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && zipCodeRef.current) {
                  zipCodeRef.current.focus();
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
            {formData.isLoading && formData.zipCode.replace(/\D/g, '').length === 8 && (
              <div className="mt-1 text-xs text-blue-600 flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                Buscando endereço...
              </div>
            )}
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