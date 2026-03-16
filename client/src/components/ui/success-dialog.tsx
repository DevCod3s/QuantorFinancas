/**
 * @fileoverview Componente de Dialog de Sucesso para o sistema Quantor
 * 
 * Dialog de feedback positivo baseado na imagem de referência fornecida.
 * Características do design:
 * - Header verde gradiente com ícone de balão de mensagem + check
 * - Corpo branco limpo com tipografia hierárquica
 * - Botão "OK" azul discreto na parte inferior
 * - Auto-close inteligente com countdown visual de 3 segundos
 * - Animações suaves de entrada e saída
 * - Proporções adequadas (nem muito grande, nem muito pequeno)
 * - Compatível com leitores de tela (DialogTitle/Description invisíveis)
 * 
 * Uso recomendado:
 * - Confirmação de operações bem-sucedidas
 * - Feedback de salvamento de dados
 * - Notificações de conclusão de processos
 * 
 * @author Equipe Quantor
 * @version 1.0.0
 */

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MessageCircle, Check, LogOut } from "lucide-react";
import { IButtonPrime } from "./i-ButtonPrime";
import { useEffect, useState } from "react";

/**
 * Props do componente SuccessDialog
 */
interface SuccessDialogProps {
  isOpen: boolean; // Estado de abertura do dialog
  onClose: () => void; // Callback para fechar o dialog
  title: string; // Título principal do dialog
  message: string; // Mensagem detalhada
  autoClose?: boolean; // Se deve fechar automaticamente (padrão: true)
  autoCloseDelay?: number; // Delay em ms para auto-close (padrão: 3000)
}

export function SuccessDialog({
  isOpen,
  onClose,
  title,
  message,
  autoClose = true,
  autoCloseDelay = 3000
}: SuccessDialogProps) {
  const [timeLeft, setTimeLeft] = useState(autoCloseDelay / 1000);

  useEffect(() => {
    if (!isOpen || !autoClose) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, autoClose, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(autoCloseDelay / 1000);
    }
  }, [isOpen, autoCloseDelay]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto p-0 overflow-hidden border-0 shadow-2xl z-[9999]" style={{ zIndex: 9999 }}>
        {/* Elementos de acessibilidade (invisíveis) */}
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{message}</DialogDescription>

        {/* Header verde com ícone */}
        <div className="bg-gradient-to-br from-green-400 to-green-500 px-6 py-8 text-center relative">
          {/* Ícone de balão de mensagem com check */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
            <div className="relative">
              <MessageCircle className="w-10 h-10 text-white" strokeWidth={1.5} />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-green-500" strokeWidth={3} />
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo branco */}
        <div className="bg-white px-6 py-6 text-center">
          {/* Título */}
          <h2 className="text-lg font-semibold text-[#1D3557] mb-2">
            {title}
          </h2>

          {/* Mensagem */}
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            {message}
          </p>

          {/* Linha divisória sutil */}
          <div className="w-full h-px bg-gray-200 mb-6"></div>

          {/* Botão OK */}
          <div className="flex justify-center">
            <IButtonPrime
              icon={<LogOut className="h-5 w-5" />}
              variant="red"
              title={autoClose && timeLeft > 0 ? `Sair (${timeLeft}s)` : 'Sair'}
              onClick={onClose}
              className="px-8"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook para facilitar o uso
export function useSuccessDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogProps, setDialogProps] = useState({
    title: "",
    message: "",
    autoClose: true,
    autoCloseDelay: 3000
  });

  const showSuccess = (title: string, message: string, options?: {
    autoClose?: boolean;
    autoCloseDelay?: number;
  }) => {
    setDialogProps({
      title,
      message,
      autoClose: options?.autoClose ?? true,
      autoCloseDelay: options?.autoCloseDelay ?? 3000
    });
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  return {
    showSuccess,
    closeDialog,
    successDialogProps: {
      isOpen,
      onClose: closeDialog,
      ...dialogProps
    },
    SuccessDialog: () => (
      <SuccessDialog
        isOpen={isOpen}
        onClose={closeDialog}
        {...dialogProps}
      />
    )
  };
}