import { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ErrorDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

/**
 * Componente de Dialog de Erro
 * 
 * Design baseado na imagem de referência fornecida pelo usuário:
 * - Header vermelho com ícone de alerta triangular
 * - Corpo branco com título e mensagem
 * - Botão "OK" vermelho na parte inferior
 * - Auto-close opcional com countdown de 3 segundos (padrão)
 * - Animações suaves de entrada e saída
 */
export function ErrorDialog({ 
  open, 
  onClose, 
  title, 
  message, 
  autoClose = true, 
  autoCloseDelay = 3000 
}: ErrorDialogProps) {
  const [countdown, setCountdown] = useState(autoCloseDelay / 1000);

  // Effect para gerenciar o auto-close e countdown
  useEffect(() => {
    if (open && autoClose) {
      setCountdown(autoCloseDelay / 1000);
      
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [open, autoClose, autoCloseDelay, onClose]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 gap-0 rounded-xl border-0 shadow-2xl">
        {/* Header Vermelho com Ícone de Alerta */}
        <div className="bg-red-500 px-6 py-4 rounded-t-xl flex items-center justify-center relative">
          <div className="bg-white rounded-full p-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          
          {/* Botão de fechar no canto superior direito */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white hover:text-red-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Corpo do Dialog */}
        <div className="bg-white px-6 py-6 space-y-4">
          {/* Título */}
          <h3 className="text-lg font-semibold text-gray-900 text-center">
            {title}
          </h3>
          
          {/* Mensagem */}
          <p className="text-sm text-gray-600 text-center leading-relaxed">
            {message}
          </p>
          
          {/* Linha divisória sutil */}
          <div className="border-t border-gray-200 pt-4">
            {/* Botão OK com contador */}
            <button
              onClick={onClose}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              {autoClose ? `OK (${countdown}s)` : 'OK'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook personalizado para gerenciar o estado do dialog de erro
 * 
 * Fornece uma interface simples para exibir dialogs de erro:
 * - showError(title, message): Exibe o dialog com título e mensagem
 * - ErrorDialog: Componente para renderizar no JSX
 * 
 * Exemplo de uso:
 * ```tsx
 * const { showError, ErrorDialog } = useErrorDialog();
 * 
 * const handleError = () => {
 *   showError("Erro de Validação", "Por favor, verifique os campos obrigatórios.");
 * };
 * 
 * return (
 *   <div>
 *     <button onClick={handleError}>Testar Erro</button>
 *     <ErrorDialog />
 *   </div>
 * );
 * ```
 */
export function useErrorDialog() {
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({
    open: false,
    title: "",
    message: ""
  });

  const showError = (title: string, message: string) => {
    setDialogState({
      open: true,
      title,
      message
    });
  };

  const closeDialog = () => {
    setDialogState(prev => ({
      ...prev,
      open: false
    }));
  };

  const ErrorDialogComponent = () => (
    <ErrorDialog
      open={dialogState.open}
      onClose={closeDialog}
      title={dialogState.title}
      message={dialogState.message}
    />
  );

  return {
    showError,
    ErrorDialog: ErrorDialogComponent
  };
}