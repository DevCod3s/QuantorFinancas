/**
 * @fileoverview Componente Stepper Wizard para cadastro de relacionamentos
 * 
 * Implementa um sistema de etapas visuais baseado na imagem de referência fornecida.
 * Componente reutilizável que gerencia navegação entre etapas com indicadores visuais.
 * 
 * Funcionalidades:
 * - Círculos numerados conectados por linha horizontal
 * - Estados visuais: current (azul ativo), completed (verde), upcoming (cinza)
 * - Navegação programática entre etapas
 * - Layout responsivo e clean
 * - Tipografia hierárquica
 * 
 * @author Equipe Quantor
 * @version 1.0.0
 */

import React from "react";

/**
 * Interface para definição de uma etapa do wizard
 */
interface WizardStep {
  id: number; // Número da etapa
  title: string; // Título da etapa
  subtitle: string; // Subtítulo/status da etapa
}

/**
 * Props do componente StepperWizard
 */
interface StepperWizardProps {
  steps: WizardStep[]; // Array de etapas
  currentStep: number; // Etapa ativa atual
  className?: string; // Classes CSS adicionais
}

/**
 * Componente StepperWizard
 * Renderiza o indicador de progresso das etapas baseado na imagem de referência
 */
export default function StepperWizard({ steps, currentStep, className = "" }: StepperWizardProps) {
  return (
    <div className={`flex items-center justify-between w-full max-w-lg mx-auto py-4 ${className}`}>
      {steps.map((step, index) => {
        const isCurrentStep = index + 1 === currentStep;
        const isCompletedStep = index + 1 < currentStep;
        const isFutureStep = index + 1 > currentStep;
        
        return (
          <div key={step.id} className="flex items-center">
            {/* Container da etapa */}
            <div className="flex flex-col items-center text-center">
              {/* Círculo numerado */}
              <div
                className={`
                  relative w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-semibold
                  ${isCurrentStep
                    ? 'bg-blue-500 border-blue-500 text-white' // Etapa atual - azul ativo
                    : isCompletedStep
                    ? 'bg-green-500 border-green-500 text-white' // Etapa concluída - verde
                    : 'bg-gray-100 border-gray-300 text-gray-500' // Etapa futura - cinza
                  }
                `}
              >
                {isCompletedStep ? (
                  // Ícone de check para etapas concluídas
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  // Número da etapa
                  step.id
                )}
              </div>
              
              {/* Título e subtítulo */}
              <div className="mt-3 min-w-0 max-w-[120px]">
                <h3 className={`text-xs font-medium ${isCurrentStep ? 'text-blue-600' : isCompletedStep ? 'text-green-600' : 'text-gray-500'}`}>
                  {step.title}
                </h3>
                <p className={`text-xs mt-1 ${isCurrentStep ? 'text-blue-500' : isCompletedStep ? 'text-green-500' : 'text-gray-400'}`}>
                  {step.subtitle}
                </p>
              </div>
            </div>

            {/* Linha conectora (não renderizar após a última etapa) */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-2">
                <div className={`h-px ${isCompletedStep ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}