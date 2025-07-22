/**
 * @fileoverview Componente de Dialog de Confirmação para o sistema Quantor
 * 
 * Dialog de confirmação baseado na imagem de referência fornecida.
 * Características do design:
 * - Header cinza clean com texto preto
 * - Corpo branco limpo com pergunta de confirmação
 * - Botões "OK" azul e "Cancelar" cinza lado a lado
 * - Proporções adequadas e design minimalista
 * - Compatível com leitores de tela
 * 
 * Uso recomendado:
 * - Confirmação de exclusão de registros
 * - Validação de ações irreversíveis
 * - Confirmação de operações críticas
 * 
 * @author Equipe Quantor
 * @version 1.0.0
 */

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";

/**
 * Props do componente ConfirmDialog
 */
interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

/**
 * Componente ConfirmDialog
 * 
 * Dialog de confirmação com design baseado na imagem de referência
 */
export function ConfirmDialog({ 
  open, 
  onClose, 
  onConfirm,
  title, 
  message,
  confirmText = "OK",
  cancelText = "Cancelar"
}: ConfirmDialogProps) {

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-white border-0 shadow-2xl rounded-lg overflow-hidden p-0">
        {/* DialogTitle e DialogDescription invisíveis para acessibilidade */}
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{message}</DialogDescription>
        
        {/* Header com fundo cinza claro */}
        <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
          <h2 className="text-sm font-medium text-black leading-tight">
            {title}
          </h2>
        </div>
        
        {/* Corpo do dialog */}
        <div className="px-6 py-6">
          <p className="text-gray-800 text-sm leading-relaxed">
            {message}
          </p>
        </div>
        
        {/* Footer com botões */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-200 hover:bg-gray-300 rounded transition-colors duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200"
          >
            {confirmText}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook personalizado para gerenciar o estado do dialog de confirmação
 * 
 * Fornece uma interface simples para exibir dialogs de confirmação:
 * - showConfirm(title, message, onConfirm): Exibe o dialog
 * - ConfirmDialog: Componente para renderizar no JSX
 * 
 * Exemplo de uso:
 * ```tsx
 * const { showConfirm, ConfirmDialog } = useConfirmDialog();
 * 
 * const handleDelete = () => {
 *   showConfirm(
 *     "Confirmar Exclusão", 
 *     "Tem certeza que deseja excluir esta conta?",
 *     () => deleteAccount(id)
 *   );
 * };
 * 
 * return (
 *   <div>
 *     <button onClick={handleDelete}>Excluir</button>
 *     <ConfirmDialog />
 *   </div>
 * );
 * ```
 */
export function useConfirmDialog() {
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText: string;
    cancelText: string;
  }>({
    open: false,
    title: "",
    message: "",
    onConfirm: () => {},
    confirmText: "OK",
    cancelText: "Cancelar"
  });

  const showConfirm = (
    title: string, 
    message: string, 
    onConfirm: () => void,
    confirmText: string = "OK",
    cancelText: string = "Cancelar"
  ) => {
    setDialogState({
      open: true,
      title,
      message,
      onConfirm,
      confirmText,
      cancelText
    });
  };

  const closeDialog = () => {
    setDialogState(prev => ({
      ...prev,
      open: false
    }));
  };

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      open={dialogState.open}
      onClose={closeDialog}
      onConfirm={dialogState.onConfirm}
      title={dialogState.title}
      message={dialogState.message}
      confirmText={dialogState.confirmText}
      cancelText={dialogState.cancelText}
    />
  );

  return {
    showConfirm,
    ConfirmDialog: ConfirmDialogComponent
  };
}