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
import { ArrowLeft, ArrowRight, Save, CheckCircle, X } from "lucide-react";
import { useRelationshipManager } from "@/hooks/useRelationshipManager";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  isOpen: boolean; // Estado de abertura do modal
  onClose: () => void; // Callback para fechar o wizard
  relationshipType?: 'cliente' | 'fornecedor' | 'outros'; // Tipo do relacionamento
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
export default function RelationshipWizard({ isOpen, onClose, relationshipType = 'cliente' }: RelationshipWizardProps) {
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

  // Hook para gerenciamento de relacionamentos
  const { saveRelationship, isLoading: isSaving, error, clearError } = useRelationshipManager();
  
  // Estado para controle de sucesso
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  /**
   * Finaliza o wizard salvando o relacionamento
   */
  const handleFinish = async () => {
    if (!wizardData.step1) return;
    
    const step1Data = wizardData.step1;
    
    try {
      const success = await saveRelationship({
        document: step1Data.document,
        documentType: step1Data.documentType,
        socialName: step1Data.socialName,
        fantasyName: step1Data.fantasyName,
        stateRegistration: step1Data.stateRegistration,
        birthDate: step1Data.birthDate,
        zipCode: step1Data.zipCode,
        street: step1Data.street,
        number: step1Data.number,
        complement: step1Data.complement,
        neighborhood: step1Data.neighborhood,
        city: step1Data.city,
        state: step1Data.state
      });
      
      if (success) {
        setShowSuccessDialog(true);
        // Fechar após 3 segundos ou quando usuário clicar
        setTimeout(() => {
          setShowSuccessDialog(false);
          onClose();
        }, 3000);
      }
    } catch (error) {
      console.error('Erro ao salvar relacionamento:', error);
    }
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

  if (!isOpen) return null;

  return (
    <div className="space-y-6">
      {/* Card do Cabeçalho com título e fechar */}
      <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Novo Relacionamento
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Preencha as informações para cadastrar um novo relacionamento no sistema.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Card do Stepper de navegação */}
      <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 flex justify-center">
        <div className="max-w-2xl w-full">
          <StepperWizard
            steps={wizardSteps}
            currentStep={currentStep}
          />
        </div>
      </div>

      {/* Card do Conteúdo da etapa atual */}
      <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 max-h-[60vh] overflow-y-auto scrollbar-hide">
        {renderStepContent()}
      </div>

      {/* Card dos Botões de navegação */}
      <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
        <div className="flex justify-center items-center gap-4">
          {currentStep > 1 && (
            <button
              onClick={handlePrevious}
              className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
          )}
          
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
          >
            Cancelar
          </button>
          
          {currentStep < wizardSteps.length ? (
            <button
              onClick={handleNext}
              disabled={!currentStepValid}
              className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
            >
              <ArrowRight className="h-5 w-5 text-white" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!currentStepValid || isSaving}
              className="w-12 h-12 rounded-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Save className="h-5 w-5 text-white" />
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Dialog de sucesso */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>Relacionamento cadastrado com sucesso!</span>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              O relacionamento foi salvo e organizado automaticamente no tipo correto.
              Esta janela será fechada automaticamente em 3 segundos.
            </p>
            <div className="mt-4 flex justify-end">
              <Button 
                onClick={() => {
                  setShowSuccessDialog(false);
                  onClose();
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Exibir erro se houver */}
      {error && (
        <div className="fixed bottom-4 right-4 p-4 bg-red-50 border border-red-200 rounded-md shadow-lg max-w-md">
          <p className="text-sm text-red-600 mb-2">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearError}
          >
            Tentar novamente
          </Button>
        </div>
      )}
    </div>
  );
}