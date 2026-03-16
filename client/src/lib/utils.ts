import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converte data UTC (ISO string) para Date local preservando o dia do calendário.
 * Resolve o bug onde T00:00:00.000Z em UTC vira dia anterior em BRT (UTC-3).
 */
export function toLocalDate(dateStr: string | Date): Date {
  const d = dateStr instanceof Date ? dateStr : new Date(dateStr);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12, 0, 0);
}

/**
 * Retorna a data local (Brasília) no formato YYYY-MM-DD
 * Evita o problema de new Date().toISOString().split('T')[0] que retorna UTC
 */
export function localDateStr(date?: Date): string {
  const d = date || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converte uma string de data (ISO ou Date object) para YYYY-MM-DD
 * sem deslocamento de fuso horário
 */
export function toLocalDateStr(dateInput: string | Date): string {
  if (typeof dateInput === 'string') {
    // Se já é YYYY-MM-DD, retorna direto
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) return dateInput;
    // Se é ISO string com T, parseia com T12:00 para evitar shift
    const d = new Date(dateInput.includes('T') ? dateInput : dateInput + 'T12:00:00');
    return localDateStr(d);
  }
  return localDateStr(dateInput);
}