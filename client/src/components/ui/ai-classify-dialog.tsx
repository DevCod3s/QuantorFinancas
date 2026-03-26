import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import { LogOut, Sparkles, FolderDown } from "lucide-react";
import { IButtonPrime } from "./i-ButtonPrime";
import PsychologyAltIcon from '@mui/icons-material/PsychologyAlt';

interface AiClassifyDialogProps {
  open: boolean;
  onClose: () => void;
  onClassifyWithGeneration: () => void;
  onBatchClassify: () => void;
  hasChartAccounts: boolean;
}

export function AiClassifyDialog({ 
  open, onClose, onClassifyWithGeneration, onBatchClassify, hasChartAccounts 
}: AiClassifyDialogProps) {
  const [selected, setSelected] = useState<'generate' | 'batch'>('generate');

  const handleConfirm = () => {
    if (selected === 'generate') {
      onClassifyWithGeneration();
    } else {
      onBatchClassify();
    }
    onClose();
  };

  const options: { value: 'generate' | 'batch'; label: string; desc: string; icon: React.ReactNode; disabled?: boolean }[] = [
    {
      value: 'generate',
      label: 'Classificar ao Gerar Plano de Contas',
      desc: 'O Assistente cria (ou recria) o Plano de Contas e classifica todas as transações automaticamente',
      icon: <Sparkles className="h-4 w-4 text-[#B59363]" />,
    },
    {
      value: 'batch',
      label: 'Classificação em Lote',
      desc: hasChartAccounts
        ? 'O Assistente classifica as transações sem classificação usando o Plano de Contas atual'
        : 'É necessário ter um Plano de Contas criado para usar esta opção',
      icon: <FolderDown className="h-4 w-4 text-[#1D3557]" />,
      disabled: !hasChartAccounts,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 gap-0 rounded-xl border-0 shadow-2xl">
        <DialogTitle className="sr-only">Classificar Transações</DialogTitle>
        <DialogDescription className="sr-only">Escolha como classificar suas transações no Plano de Contas</DialogDescription>

        {/* Header */}
        <div className="bg-[#4D4E48] px-6 py-4 rounded-t-xl flex items-center justify-center relative">
          <div className="bg-white rounded-full p-2 shadow-sm">
            <PsychologyAltIcon sx={{ fontSize: 24 }} className="text-[#B59363]" />
          </div>
        </div>

        {/* Body */}
        <div className="bg-white px-6 py-5 space-y-4 rounded-b-xl">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-[#1D3557] flex items-center justify-center gap-2">
              <FolderDown className="h-5 w-5" />
              Classificar Transações
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Como deseja classificar suas transações no Plano de Contas?
            </p>
          </div>

          {/* Options */}
          <div className="space-y-2">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => !opt.disabled && setSelected(opt.value)}
                disabled={opt.disabled}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                  opt.disabled
                    ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                    : selected === opt.value
                      ? 'border-[#B59363] bg-[#B59363]/5 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    opt.disabled
                      ? 'border-gray-200'
                      : selected === opt.value ? 'border-[#B59363]' : 'border-gray-300'
                  }`}>
                    {selected === opt.value && !opt.disabled && (
                      <div className="w-2 h-2 rounded-full bg-[#B59363]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className={`text-sm font-medium flex items-center gap-1.5 ${
                      opt.disabled
                        ? 'text-gray-400'
                        : selected === opt.value ? 'text-[#1D3557]' : 'text-gray-700'
                    }`}>
                      {opt.icon}
                      {opt.label}
                    </span>
                    <p className={`text-xs mt-0.5 ${opt.disabled ? 'text-gray-300' : 'text-gray-400'}`}>
                      {opt.desc}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 pt-4 mt-4 flex justify-center gap-3">
            <IButtonPrime
              icon={<Sparkles className="h-4 w-4" />}
              variant="gold"
              title="Classificar"
              onClick={handleConfirm}
              className="w-full"
            />
            <IButtonPrime
              icon={<LogOut className="h-4 w-4" />}
              variant="red"
              title="Cancelar"
              onClick={onClose}
              className="w-full"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
