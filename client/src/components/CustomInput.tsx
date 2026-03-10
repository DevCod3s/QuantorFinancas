/**
 * @fileoverview Componente de Input customizado baseado na imagem de referência
 * 
 * Input clean com label flutuante dourada e borda simples, seguindo a paleta de cores
 * padrão do sistema (Dourado #B59363 e Azul Escuro #1D3557).
 * 
 * @author Equipe Quantor
 * @version 1.0.0
 */

import React from "react";

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(({
  label,
  error,
  className = "",
  ...props
}, ref) => {
  return (
    <div className="relative">
      <input
        ref={ref}
        {...props}
        className={`
          w-full px-3 py-2 rounded-md shadow-md
          border-0 focus:outline-none focus:border-2 
          peer placeholder-transparent
          ${error ? 'focus:border-red-500' : 'focus:border-[#B59363]'}
          ${className}
        `}
        placeholder=" "
      />
      <label
        htmlFor={props.id}
        className={`
          absolute left-3 -top-2.5 bg-white px-1 text-sm transition-all
          peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-placeholder-shown:top-2.5
          peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#B59363]
          ${error ? 'text-red-500 peer-focus:text-red-500' : 'text-[#1D3557]'}
        `}
      >
        {label}
      </label>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

CustomInput.displayName = 'CustomInput';

export default CustomInput;

interface CustomSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export function CustomSelect({
  label,
  error,
  children,
  className = "",
  ...props
}: CustomSelectProps) {
  return (
    <div className="relative">
      <select
        {...props}
        className={`
          w-full px-3 py-2 rounded-md shadow-md
          border-0 focus:outline-none focus:border-2 
          peer bg-white
          ${error ? 'focus:border-red-500' : 'focus:border-[#B59363]'}
          ${className}
        `}
      >
        {children}
      </select>
      <label
        htmlFor={props.id}
        className={`
          absolute left-3 -top-2.5 bg-white px-1 text-sm
          peer-focus:text-[#B59363]
          ${error ? 'text-red-500 peer-focus:text-red-500' : 'text-[#1D3557]'}
        `}
      >
        {label}
      </label>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

interface CustomTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function CustomTextarea({
  label,
  error,
  className = "",
  ...props
}: CustomTextareaProps) {
  return (
    <div className="relative">
      <textarea
        {...props}
        className={`
          w-full px-3 py-2 rounded-md shadow-md
          border-0 focus:outline-none focus:border-2 
          peer placeholder-transparent resize-vertical
          ${error ? 'focus:border-red-500' : 'focus:border-[#B59363]'}
          ${className}
        `}
        placeholder=" "
      />
      <label
        htmlFor={props.id}
        className={`
          absolute left-3 -top-2.5 bg-white px-1 text-sm transition-all
          peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-placeholder-shown:top-2.5
          peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#B59363]
          ${error ? 'text-red-500 peer-focus:text-red-500' : 'text-[#1D3557]'}
        `}
      >
        {label}
      </label>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}