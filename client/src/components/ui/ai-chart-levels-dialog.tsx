import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import { Check, LogOut, Sparkles, Layers } from "lucide-react";
import { IButtonPrime } from "./i-ButtonPrime";
import PsychologyAltIcon from '@mui/icons-material/PsychologyAlt';

interface AiChartLevelsDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (levels: number | 'auto') => void;
}

export function AiChartLevelsDialog({ open, onClose, onConfirm }: AiChartLevelsDialogProps) {
  const [selected, setSelected] = useState<number | 'auto'>('auto');

  const options: { value: number | 'auto'; label: string; desc: string }[] = [
    { value: 'auto', label: 'Automático (Recomendado)', desc: 'A IA analisa seus lançamentos e define a melhor profundidade' },
    { value: 2, label: '2 Níveis', desc: 'Categorias e subcategorias (ex: Despesas → Operacionais)' },
    { value: 3, label: '3 Níveis', desc: 'Estrutura completa DRE (ex: Despesas → Operacionais → Aluguel)' },
    { value: 4, label: '4 Níveis', desc: 'Plano detalhado com sub-subcategorias para empresas maiores' },
  ];

  const handleConfirm = () => {
    onConfirm(selected);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 gap-0 rounded-xl border-0 shadow-2xl">
        <DialogTitle className="sr-only">Configurar Plano de Contas</DialogTitle>
        <DialogDescription className="sr-only">Escolha a profundidade hierárquica do plano de contas</DialogDescription>

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
              <Layers className="h-5 w-5" />
              Níveis Hierárquicos
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Quantos níveis de profundidade deseja no Plano de Contas?
            </p>
          </div>

          {/* Options */}
          <div className="space-y-2">
            {options.map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => setSelected(opt.value)}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                  selected === opt.value
                    ? 'border-[#B59363] bg-[#B59363]/5 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selected === opt.value ? 'border-[#B59363]' : 'border-gray-300'
                  }`}>
                    {selected === opt.value && (
                      <div className="w-2 h-2 rounded-full bg-[#B59363]" />
                    )}
                  </div>
                  <div>
                    <span className={`text-sm font-medium ${
                      selected === opt.value ? 'text-[#1D3557]' : 'text-gray-700'
                    }`}>
                      {opt.value === 'auto' && <Sparkles className="h-3.5 w-3.5 inline mr-1 text-[#B59363]" />}
                      {opt.label}
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 pt-4 mt-4 flex justify-center gap-3">
            <IButtonPrime
              icon={<Check className="h-4 w-4" />}
              variant="gold"
              title="Gerar Plano"
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