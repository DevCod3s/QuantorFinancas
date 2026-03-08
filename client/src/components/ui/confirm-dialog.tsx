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
import { X, HelpCircle } from "lucide-react";

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
      <DialogContent className="max-w-md p-0 gap-0 rounded-xl border-0 shadow-2xl">
        {/* Elementos de acessibilidade (invisíveis) */}
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{message}</DialogDescription>

        {/* Header Colorido com Ícone de Alerta/Info */}
        <div className="bg-blue-600 px-6 py-4 rounded-t-xl flex items-center justify-center relative">
          <div className="bg-white rounded-full p-2 shadow-sm">
            <HelpCircle className="h-6 w-6 text-blue-600" />
          </div>

          {/* Botão de fechar no canto superior direito */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white hover:text-blue-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Corpo do Dialog */}
        <div className="bg-white px-6 py-6 space-y-4 rounded-b-xl text-center">
          {/* Título */}
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>

          {/* Mensagem principal */}
          <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
            {message}
          </p>

          {/* Footer com botões divididos */}
          <div className="border-t border-gray-100 pt-5 mt-5 flex justify-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 w-full"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 w-full shadow-sm"
            >
              {confirmText}
            </button>
          </div>
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
    onConfirm: () => { },
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