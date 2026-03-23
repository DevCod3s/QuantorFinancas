import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import PsychologyAltIcon from '@mui/icons-material/PsychologyAlt';

export function AiLoadingDialog({ open }: { open: boolean }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Iniciando Mente Artificial...");

  useEffect(() => {
    if (open) {
      setProgress(0);
      setStatus("Iniciando Mente Artificial...");
      
      const timings = [
        { time: 500, p: 15, msg: "Lendo histórico de transações..." },
        { time: 2000, p: 40, msg: "Aplicando padrões de DRE..." },
        { time: 4000, p: 60, msg: "Criando Categorias de Receitas e Despesas..." },
        { time: 7000, p: 80, msg: "Reconhecendo Lançamentos..." },
        { time: 10000, p: 90, msg: "Realocando histórico no novo Plano..." },
        { time: 14000, p: 98, msg: "Finalizando Mapeamento no Banco..." },
      ];

      const timeouts = timings.map(t => 
        setTimeout(() => {
          setProgress(t.p);
          setStatus(t.msg);
        }, t.time)
      );

      // Limpar interval se mock atingir max enquanto response não volta
      const interval = setInterval(() => {
        setProgress(prev => (prev >= 98 ? 98 : prev + 1));
      }, 500);

      return () => {
        timeouts.forEach(clearTimeout);
        clearInterval(interval);
      };
    }
  }, [open]);

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-md p-8 gap-4 flex flex-col items-center justify-center rounded-xl border-0 shadow-2xl z-[9999]" style={{ zIndex: 9999 }}>
        <DialogTitle className="sr-only">Processando Inteligência Artificial</DialogTitle>
        <DialogDescription className="sr-only">Aguarde enquanto a IA constrói seu plano.</DialogDescription>
        
        <div className="relative mt-2">
          <div className="absolute inset-0 bg-[#8B7355] blur-xl opacity-30 animate-pulse rounded-full"></div>
          <PsychologyAltIcon sx={{ fontSize: 80 }} className="text-[#8B7355] animate-bounce relative z-10" />
        </div>
        
        <h3 className="text-xl font-bold text-[#1D3557] text-center mt-4">
          Inteligência Artificial Trabalhando
        </h3>
        
        <div className="w-full bg-gray-100 rounded-full h-5 mt-4 overflow-hidden border border-gray-200 shadow-inner relative">
          <div 
            className="bg-gradient-to-r from-[#1D3557] to-[#8B7355] h-full transition-all duration-300 ease-out flex items-center justify-end"
            style={{ width: `${progress}%` }}
          >
            {progress >= 15 && (
              <span className="text-[10px] text-white font-bold mr-2">{progress}%</span>
            )}
          </div>
        </div>
        
        <p className="text-sm text-gray-600 font-medium text-center animate-pulse min-h-[20px]">
          {status}
        </p>

        <p className="text-xs text-orange-600 mt-2 text-center bg-orange-50 px-4 py-3 rounded-lg border border-orange-200">
          Esta operação usa uma IA muito robusta e processa centenas de registros. Pode demorar de 10 a 25 segundos. Por favor, <b>NÃO</b> feche o navegador ou troque aba!
        </p>
      </DialogContent>
    </Dialog>
  );
}
