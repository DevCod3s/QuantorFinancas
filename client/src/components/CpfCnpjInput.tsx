/**
 * @fileoverview Componente de input para CPF/CNPJ com formatação automática
 * 
 * Componente especializado que:
 * - Formata automaticamente CPF (000.000.000-00) ou CNPJ (00.000.000/0000-00)
 * - Detecta automaticamente se é CPF ou CNPJ baseado no número de dígitos
 * - Valida os dados em tempo real
 * - Integra com tw-elements-react conforme padrão solicitado
 * - Avança automaticamente para próximo campo quando válido
 * 
 * @author Equipe Quantor
 * @version 1.0.0
 */

import React, { useState, useEffect } from "react";

/**
 * Props do componente CpfCnpjInput
 */
interface CpfCnpjInputProps {
  value: string; // Valor atual do input
  onChange: (value: string, isValid: boolean, type: 'CPF' | 'CNPJ' | null) => void; // Callback de mudança
  onValidDocument?: (documentData: any) => void; // Callback quando documento for válido
  label?: string; // Label do input
  id?: string; // ID do input
  className?: string; // Classes CSS adicionais
}

/**
 * Formata CPF: 000.000.000-00
 */
function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 11) {
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return value;
}

/**
 * Formata CNPJ: 00.000.000/0000-00
 */
function formatCNPJ(value: string): string {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 14) {
    return numbers
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }
  return value;
}

/**
 * Valida CPF usando algoritmo oficial
 */
function validateCPF(cpf: string): boolean {
  const numbers = cpf.replace(/\D/g, '');
  
  if (numbers.length !== 11) return false;
  if (/^(.)\1{10}$/.test(numbers)) return false; // Sequência igual
  
  let sum = 0;
  let remainder;
  
  // Validação do primeiro dígito
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(numbers.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers.substring(9, 10))) return false;
  
  // Validação do segundo dígito
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(numbers.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers.substring(10, 11))) return false;
  
  return true;
}

/**
 * Valida CNPJ usando algoritmo oficial
 */
function validateCNPJ(cnpj: string): boolean {
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
}

/**
 * Componente CpfCnpjInput
 */
const CpfCnpjInput = React.forwardRef<HTMLInputElement, CpfCnpjInputProps>(({ 
  value, 
  onChange, 
  onValidDocument,
  label = "CPF/CNPJ *",
  id = "cpf-cnpj-input",
  className = ""
}, ref) => {
  const [formattedValue, setFormattedValue] = useState(value);
  const [documentType, setDocumentType] = useState<'CPF' | 'CNPJ' | null>(null);

  /**
   * Manipula mudanças no input
   */
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const numbers = inputValue.replace(/\D/g, '');
    
    let formatted = '';
    let type: 'CPF' | 'CNPJ' | null = null;
    let isValid = false;
    
    if (numbers.length <= 11) {
      // Tratar como CPF
      formatted = formatCPF(inputValue);
      type = 'CPF';
      
      if (numbers.length === 11) {
        isValid = validateCPF(numbers);
      }
    } else if (numbers.length <= 14) {
      // Tratar como CNPJ
      formatted = formatCNPJ(inputValue);
      type = 'CNPJ';
      
      if (numbers.length === 14) {
        isValid = validateCNPJ(numbers);
      }
    } else {
      // Mais de 14 dígitos, não permitir
      return;
    }
    
    setFormattedValue(formatted);
    setDocumentType(type);
    onChange(formatted, isValid, type);
    
    // Se documento válido, simular consulta de dados
    if (isValid && onValidDocument) {
      setTimeout(() => {
        // Simular dados retornados de uma API de consulta
        const mockData = {
          document: numbers,
          type: type,
          name: type === 'CPF' ? 'João Silva Santos' : 'Empresa Exemplo LTDA',
          socialName: type === 'CNPJ' ? 'Empresa Exemplo' : undefined,
          stateRegistration: type === 'CNPJ' ? '123456789' : undefined,
          address: {
            zipCode: '01234-567',
            street: 'Rua Exemplo',
            number: '123',
            complement: 'Sala 1',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP'
          }
        };
        onValidDocument(mockData);
      }, 500); // Simular delay de API
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={ref}
        type="text"
        id={id}
        value={formattedValue}
        onChange={handleInputChange}
        className={`
          w-full px-3 py-2 rounded-md bg-gray-50 shadow-sm
          border-0 focus:outline-none focus:border-2 focus:border-blue-500 focus:bg-white
          peer placeholder-transparent transition-all duration-200
          ${documentType === 'CPF' && formattedValue.replace(/\D/g, '').length === 11 && validateCPF(formattedValue.replace(/\D/g, '')) ? 'focus:border-green-500' : ''}
          ${documentType === 'CNPJ' && formattedValue.replace(/\D/g, '').length === 14 && validateCNPJ(formattedValue.replace(/\D/g, '')) ? 'focus:border-green-500' : ''}
        `}
        placeholder=" "
      />
      <label 
        htmlFor={id}
        className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-blue-600 transition-all peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
      >
        {label}
      </label>
      
      {/* Indicador do tipo de documento */}
      {documentType && (
        <div className="mt-1 text-xs text-gray-500">
          Documento: {documentType}
        </div>
      )}
    </div>
  );
});

CpfCnpjInput.displayName = 'CpfCnpjInput';

export default CpfCnpjInput;