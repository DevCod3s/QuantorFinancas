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
import { Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
    const [localValue, setLocalValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [calendarOpen, setCalendarOpen] = useState(false);

    // Converte ISO (YYYY-MM-DD) para formato brasileiro (DD/MM/YYYY)
    const isoToBrazilian = (isoDate: string): string => {
      if (!isoDate) return '';
      const parts = isoDate.split('-');
      if (parts.length !== 3) return '';
      const [year, month, day] = parts;
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

    // Converte ISO para Date object
    const isoToDate = (isoDate: string): Date | undefined => {
      if (!isoDate) return undefined;
      const date = new Date(isoDate + 'T12:00:00');
      return isNaN(date.getTime()) ? undefined : date;
    };

    // Converte Date object para ISO
    const dateToISO = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
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
      if (limited.length >= 3) {
        formatted = `${limited.substring(0, 2)}/${limited.substring(2)}`;
      }
      if (limited.length >= 5) {
        formatted = `${limited.substring(0, 2)}/${limited.substring(2, 4)}/${limited.substring(4)}`;
      }
      
      return formatted;
    };

    // Sincroniza valor externo com valor local quando não está focado
    useEffect(() => {
      if (!isFocused && value) {
        setLocalValue(isoToBrazilian(value));
      } else if (!isFocused && !value) {
        setLocalValue('');
      }
    }, [value, isFocused]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const formatted = formatDateInput(inputValue);
      
      console.log('Input:', inputValue, 'Formatted:', formatted);
      
      setLocalValue(formatted);
      
      // Tenta converter para ISO se tiver 8 dígitos
      const numbers = formatted.replace(/\D/g, '');
      if (numbers.length === 8) {
        const isoDate = brazilianToISO(formatted);
        if (isoDate) {
          onChange(isoDate);
        }
      } else if (numbers.length === 0) {
        onChange('');
      }
    };

    const handleBlur = () => {
      setIsFocused(false);
      
      // Validação ao sair do campo
      if (localValue) {
        const isoDate = brazilianToISO(localValue);
        if (isoDate) {
          onChange(isoDate);
          setLocalValue(isoToBrazilian(isoDate));
        } else {
          // Data inválida, limpa
          setLocalValue('');
          onChange('');
        }
      }
    };

    const handleFocus = () => {
      setIsFocused(true);
      // Inicializa com valor formatado se existir
      if (value && !localValue) {
        setLocalValue(isoToBrazilian(value));
      }
    };

    const handleCalendarSelect = (date: Date | undefined) => {
      if (date) {
        const isoDate = dateToISO(date);
        onChange(isoDate);
        setLocalValue(isoToBrazilian(isoDate));
        setCalendarOpen(false);
      }
    };

    return (
      <div className={className} style={{ position: 'relative', paddingTop: '16px' }}>
        {label && (
          <label 
            className="block text-xs absolute top-0 left-0 transition-all"
            style={{ 
              color: '#666',
              fontSize: '12px',
              lineHeight: '1',
              transform: 'translate(0, 0) scale(0.75)',
              transformOrigin: 'top left'
            }}
          >
            {label}
          </label>
        )}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            ref={ref}
            type="text"
            value={localValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={10}
            className="w-full border-0 border-b border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent"
            style={{ 
              fontSize: '16px',
              padding: '4px 0 5px',
              paddingRight: '32px',
              lineHeight: '1.4375em'
            }}
          />
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={disabled}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCalendarOpen(!calendarOpen);
                }}
                className="absolute right-0 bottom-1 p-1 hover:bg-gray-100 rounded transition-colors"
                style={{ height: '24px', width: '24px' }}
              >
                <CalendarIcon className="h-4 w-4 text-gray-500" />
              </button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-auto p-0" 
              align="start"
              sideOffset={5}
              style={{ zIndex: 9999 }}
              onInteractOutside={(e) => {
                e.preventDefault();
              }}
            >
              <Calendar
                mode="single"
                selected={isoToDate(value)}
                onSelect={handleCalendarSelect}
                locale={ptBR}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    );
  }
);

DateInput.displayName = 'DateInput';
