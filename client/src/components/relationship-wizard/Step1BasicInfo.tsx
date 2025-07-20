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
import { Plus } from "lucide-react";
import CpfCnpjInput from "../CpfCnpjInput";
import CustomInput, { CustomSelect } from "../CustomInput";
import AddRelationshipTypeModal from "../AddRelationshipTypeModal";

/**
 * Interface para dados do formulário da Etapa 1
 */
interface Step1FormData {
  relationshipType: string; // Tipo de relacionamento
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
    relationshipType: '',
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

  // Estado para controlar modal e tipos customizados
  const [showModal, setShowModal] = useState(false);
  const [customTypes, setCustomTypes] = useState<Array<{value: string, text: string}>>([]);

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
      newData.relationshipType &&
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
    
    // Se CNPJ válido, buscar dados automaticamente
    if (isValid && type === 'CNPJ') {
      fetchCNPJData(value);
    }
    // Se CPF válido, focar no próximo campo
    else if (isValid && socialNameRef.current) {
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
        
        // Processar endereço
        const cep = data.cep?.replace(/\D/g, '');
        const formattedCep = cep ? `${cep.slice(0, 5)}-${cep.slice(5)}` : '';
        
        updateFormData({
          socialName: data.razao_social || '',
          fantasyName: data.nome_fantasia || '',
          zipCode: formattedCep,
          street: data.logradouro || '',
          number: data.numero || '',
          complement: data.complemento || '',
          neighborhood: data.bairro || '',
          city: data.municipio || '',
          state: data.uf || '',
          isLoading: false
        });
        
        // Se temos CEP mas dados incompletos, buscar via ViaCEP
        if (formattedCep && (!data.logradouro || !data.bairro || !data.municipio)) {
          await fetchCEPData(formattedCep);
        }
        
        // Focar próximo campo após preenchimento
        setTimeout(() => {
          if (stateRegistrationRef.current) {
            stateRegistrationRef.current.focus();
          }
        }, 200);
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

  /**
   * Manipula adição de novo tipo de relacionamento
   */
  const handleAddNewType = (newType: { name: string; description: string }) => {
    const typeValue = newType.name.toLowerCase().replace(/\s+/g, '_');
    const newOption = { value: typeValue, text: newType.name };
    
    setCustomTypes(prev => [...prev, newOption]);
    updateFormData({ relationshipType: typeValue });
  };

  /**
   * Gera lista de opções incluindo tipos customizados
   */
  const getRelationshipOptions = () => {
    const defaultOptions = [
      { value: '', text: 'Selecione...' },
      { value: 'cliente', text: 'Cliente' },
      { value: 'fornecedor', text: 'Fornecedor' },
      { value: 'prestador_servicos', text: 'Prestador de Serviços' }
    ];
    
    return [...defaultOptions, ...customTypes];
  };

  return (
    <div className="space-y-6">
      {/* Seção: Tipo de relacionamento */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Tipo de relacionamento
          </h3>
        </div>
        
        <div className="max-w-md flex items-end gap-2">
          <div className="flex-1">
            <CustomSelect
              id="relationship-type"
              label="Selecione o tipo de relacionamento *"
              value={formData.relationshipType}
              onChange={(e) => updateFormData({ relationshipType: e.target.value })}
            >
              {getRelationshipOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.text}
                </option>
              ))}
            </CustomSelect>
          </div>
          
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="w-8 h-8 border border-blue-400 text-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center rounded-lg"
            title="Adicionar novo tipo"
          >
            <Plus className="h-4 w-4 stroke-1" />
          </button>
        </div>
      </div>

      {/* Seção: Informação básica */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
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
        <h3 className="text-lg font-medium text-gray-900 mb-4">
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

      {/* Modal para adicionar novo tipo */}
      <AddRelationshipTypeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleAddNewType}
      />
    </div>
  );
}