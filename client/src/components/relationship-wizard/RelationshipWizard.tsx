/**
 * @fileoverview Wizard principal para cadastro de relacionamentos
 * 
 * Componente principal que gerencia o fluxo completo de cadastro por etapas.
 * Integra o StepperWizard com os formulários de cada etapa.
 * 
 * Funcionalidades:
 * - Navegação entre etapas com validação
 * - Persistência de dados entre etapas
 * - Controle de estado global do wizard
 * - Layout responsivo com card elevado
 * - Botões de navegação (voltar/próximo)
 * 
 * @author Equipe Quantor
 * @version 1.0.0
 */

import React, { useState } from "react";
import StepperWizard from "../StepperWizard";
import Step1BasicInfo from "./Step1BasicInfo";
import Step2ContractGeneration from "./Step2ContractGeneration";
import Step3ReviewPRD from "./Step3ReviewPRD";
import Step4FinalPRD from "./Step4FinalPRD";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";

/**
 * Interface para dados completos do relacionamento
 */
interface RelationshipWizardData {
  step1?: any; // Dados da etapa 1
  step2?: any; // Dados da etapa 2
  step3?: any; // Dados da etapa 3
  step4?: any; // Dados da etapa 4
}

/**
 * Props do componente RelationshipWizard
 */
interface RelationshipWizardProps {
  onClose: () => void; // Callback para fechar o wizard
  onSave: (data: RelationshipWizardData) => void; // Callback para salvar dados
}

/**
 * Definição das etapas do wizard
 */
const wizardSteps = [
  {
    id: 1,
    title: "Selecionar Cliente",
    subtitle: "Current"
  },
  {
    id: 2,
    title: "Detalhes do Projeto", 
    subtitle: "Upcoming"
  },
  {
    id: 3,
    title: "Revisar PRD",
    subtitle: "Upcoming"
  },
  {
    id: 4,
    title: "PRD Final",
    subtitle: "Upcoming"
  }
];

/**
 * Componente RelationshipWizard
 */
export default function RelationshipWizard({ onClose, onSave }: RelationshipWizardProps) {
  // Estado atual da etapa
  const [currentStep, setCurrentStep] = useState(1);
  
  // Dados acumulados do wizard
  const [wizardData, setWizardData] = useState<RelationshipWizardData>({});
  
  // Estado de validação da etapa atual
  const [currentStepValid, setCurrentStepValid] = useState(false);

  /**
   * Atualiza dados da etapa atual
   */
  const updateStepData = (stepNumber: number, data: any, isValid: boolean) => {
    setWizardData(prev => ({
      ...prev,
      [`step${stepNumber}`]: data
    }));
    setCurrentStepValid(isValid);
  };

  /**
   * Navega para próxima etapa
   */
  const handleNext = () => {
    if (currentStep < wizardSteps.length && currentStepValid) {
      setCurrentStep(prev => prev + 1);
      setCurrentStepValid(false); // Reset validation for next step
    }
  };

  /**
   * Navega para etapa anterior
   */
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setCurrentStepValid(true); // Previous steps are assumed valid
    }
  };

  /**
   * Finaliza o wizard
   */
  const handleFinish = () => {
    onSave(wizardData);
    onClose();
  };

  /**
   * Renderiza o conteúdo da etapa atual
   */
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1BasicInfo
            onDataChange={(data, isValid) => updateStepData(1, data, isValid)}
            initialData={wizardData.step1}
          />
        );
      case 2:
        return (
          <Step2ContractGeneration
            onDataChange={(data, isValid) => updateStepData(2, data, isValid)}
            initialData={wizardData.step2}
            relationshipData={wizardData.step1}
          />
        );
      case 3:
        return (
          <Step3ReviewPRD
            onDataChange={(data, isValid) => updateStepData(3, data, isValid)}
            initialData={wizardData.step3}
            relationshipData={wizardData.step1}
            contractData={wizardData.step2}
          />
        );
      case 4:
        return (
          <Step4FinalPRD
            onDataChange={(data, isValid) => updateStepData(4, data, isValid)}
            initialData={wizardData.step4}
            relationshipData={wizardData.step1}
            contractData={wizardData.step2}
            reviewData={wizardData.step3}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header com título */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Novo Relacionamento
          </h1>
          <p className="text-gray-600">
            Preencha as informações para cadastrar um novo relacionamento no sistema.
          </p>
        </div>

        {/* Stepper de navegação */}
        <StepperWizard
          steps={wizardSteps}
          currentStep={currentStep}
          className="mb-8"
        />

        {/* Conteúdo da etapa atual */}
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* Botões de navegação */}
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <div>
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            
            {currentStep < wizardSteps.length ? (
              <Button
                onClick={handleNext}
                disabled={!currentStepValid}
                className="flex items-center gap-2"
              >
                Próximo
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={!currentStepValid}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Finalizar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}