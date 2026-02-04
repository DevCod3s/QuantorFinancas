/**
 * @fileoverview Componente de Input de Data com formatação automática DD/MM/YYYY
 * 
 * Formata automaticamente enquanto o usuário digita no padrão brasileiro.
 * Aceita entrada tanto no formato DD/MM/YYYY quanto via seletor de data.
 * 
 * @author Equipe Quantor
 * @version 1.0.0
 */

import { forwardRef, useState, useEffect } from 'react';

interface DateInputProps {
  value: string; // Formato ISO: YYYY-MM-DD
  onChange: (value: string) => void; // Retorna formato ISO: YYYY-MM-DD
  label?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ value, onChange, label, className = '', required = false, disabled = false, placeholder = 'DD/MM/AAAA' }, ref) => {
    const [displayValue, setDisplayValue] = useState('');
    const [inputType, setInputType] = useState<'text' | 'date'>('text');

    // Converte ISO (YYYY-MM-DD) para formato brasileiro (DD/MM/YYYY)
    const isoToBrazilian = (isoDate: string): string => {
      if (!isoDate) return '';
      const [year, month, day] = isoDate.split('-');
      return `${day}/${month}/${year}`;
    };

    // Converte formato brasileiro (DD/MM/YYYY) para ISO (YYYY-MM-DD)
    const brazilianToISO = (brDate: string): string => {
      if (!brDate) return '';
      const cleaned = brDate.replace(/\D/g, '');
      if (cleaned.length !== 8) return '';
      
      const day = cleaned.substring(0, 2);
      const month = cleaned.substring(2, 4);
      const year = cleaned.substring(4, 8);
      
      // Validação básica
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      
      if (dayNum < 1 || dayNum > 31) return '';
      if (monthNum < 1 || monthNum > 12) return '';
      if (yearNum < 1900 || yearNum > 2100) return '';
      
      return `${year}-${month}-${day}`;
    };

    // Formata a data enquanto o usuário digita
    const formatDateInput = (input: string): string => {
      // Remove tudo que não é número
      const numbers = input.replace(/\D/g, '');
      
      // Limita a 8 dígitos
      const limited = numbers.substring(0, 8);
      
      // Adiciona as barras automaticamente
      let formatted = limited;
      if (limited.length >= 2) {
        formatted = `${limited.substring(0, 2)}/${limited.substring(2)}`;
      }
      if (limited.length >= 4) {
        formatted = `${limited.substring(0, 2)}/${limited.substring(2, 4)}/${limited.substring(4)}`;
      }
      
      return formatted;
    };

    // Atualiza o valor de exibição quando o valor ISO muda (de fora)
    useEffect(() => {
      if (value && inputType === 'text') {
        setDisplayValue(isoToBrazilian(value));
      }
    }, [value, inputType]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (inputType === 'text') {
        const formatted = formatDateInput(e.target.value);
        setDisplayValue(formatted);
        
        // Se completou 10 caracteres (DD/MM/YYYY), converte para ISO e notifica
        if (formatted.length === 10) {
          const isoDate = brazilianToISO(formatted);
          if (isoDate) {
            onChange(isoDate);
          }
        }
      } else {
        // Input tipo date já retorna no formato ISO
        onChange(e.target.value);
      }
    };

    const handleBlur = () => {
      // Ao sair do campo, tenta converter para ISO se tiver valor parcial
      if (inputType === 'text' && displayValue) {
        const isoDate = brazilianToISO(displayValue);
        if (isoDate) {
          onChange(isoDate);
          setDisplayValue(isoToBrazilian(isoDate));
        }
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // No mobile/tablet, muda para date picker nativo
      if (window.innerWidth <= 768) {
        setInputType('date');
      }
    };

    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && '*'}
          </label>
        )}
        <input
          ref={ref}
          type={inputType}
          value={inputType === 'text' ? displayValue : value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={inputType === 'text' ? placeholder : ''}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    );
  }
);

DateInput.displayName = 'DateInput';
