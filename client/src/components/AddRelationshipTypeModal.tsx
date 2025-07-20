/**
 * @fileoverview Modal para adicionar novo tipo de relacionamento
 * 
 * Modal que permite ao usuário cadastrar novos tipos de relacionamento
 * com nome e descrição. Após salvar, o novo tipo é automaticamente
 * adicionado à lista de opções disponíveis.
 * 
 * @author Equipe Quantor
 * @version 1.0.0
 */

import React, { useState } from "react";
import { X, Save, ArrowLeft } from "lucide-react";
import CustomInput, { CustomTextarea } from "./CustomInput";

/**
 * Interface para novo tipo de relacionamento
 */
interface NewRelationshipType {
  name: string;
  description: string;
}

/**
 * Props do modal
 */
interface AddRelationshipTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newType: NewRelationshipType) => void;
}

/**
 * Modal para adicionar novo tipo de relacionamento
 */
export default function AddRelationshipTypeModal({ 
  isOpen, 
  onClose, 
  onSave 
}: AddRelationshipTypeModalProps) {
  const [formData, setFormData] = useState<NewRelationshipType>({
    name: '',
    description: ''
  });

  /**
   * Manipula o salvamento do novo tipo
   */
  const handleSave = () => {
    if (formData.name.trim()) {
      onSave(formData);
      setFormData({ name: '', description: '' });
      onClose();
    }
  };

  /**
   * Manipula o fechamento do modal
   */
  const handleClose = () => {
    setFormData({ name: '', description: '' });
    onClose();
  };

  /**
   * Manipula tecla Enter para salvar
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100" 
           style={{
             boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
           }}>
        {/* Cabeçalho do modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Novo Tipo de Relacionamento
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Conteúdo do modal */}
        <div className="p-6 space-y-6">
          {/* Campo Nome */}
          <CustomInput
            type="text"
            id="type-name"
            label="Nome do Tipo *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="Ex: Parceiro, Consultor, Contador..."
            autoFocus
          />

          {/* Campo Descrição */}
          <CustomTextarea
            id="type-description"
            label="Descrição (opcional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="Descrição do tipo de relacionamento..."
            rows={3}
          />
        </div>

        {/* Rodapé do modal */}
        <div className="flex items-center justify-center gap-4 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="w-12 h-12 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center"
            title="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.name.trim()}
            className="w-12 h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center"
            title="Salvar"
          >
            <Save className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}