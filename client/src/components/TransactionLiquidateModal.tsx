import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Box, Typography } from "@mui/material";
import { IButtonPrime } from "./ui/i-ButtonPrime";
import { X, Calendar, DollarSign, FileText, CheckCheck, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toLocalDate } from "@/lib/utils";
import { Transaction } from "@shared/schema";
import CustomInput from "./CustomInput";
import MenuItem from '@mui/material/MenuItem';

interface TransactionLiquidateModalProps {
  open: boolean;
  onClose: () => void;
  transaction: any;
  bankAccounts: any[];
  onConfirm: (data: any) => void;
}

export function TransactionLiquidateModal({
  open,
  onClose,
  transaction,
  bankAccounts,
  onConfirm
}: TransactionLiquidateModalProps) {
  const [bankAccountId, setBankAccountId] = useState<string>("");
  const [discountType, setDiscountType] = useState<"valor" | "percentual">("valor");
  const [discountValue, setDiscountValue] = useState<string>("");
  const [interestType, setInterestType] = useState<"valor" | "percentual">("valor");
  const [interestValue, setInterestValue] = useState<string>("");

  useEffect(() => {
    if (open && transaction) {
      setBankAccountId(transaction.bankAccountId?.toString() || "");
      setDiscountType("valor");
      setDiscountValue("");
      setInterestType("valor");
      setInterestValue("");
    }
  }, [open, transaction]);

  if (!open || !transaction) return null;

  const isExpense = transaction.type === "expense";
  const amount = parseFloat(transaction.amount);
  const dueDate = toLocalDate(transaction.date);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(dueDate);
  compareDate.setHours(0, 0, 0, 0);

  const isOverdue = transaction.status !== 'pago' && compareDate < today;
  const daysOverdue = isOverdue ? differenceInDays(today, compareDate) : 0;
  const isEarlyOrOnTime = !isOverdue;

  // Calcula o valor numérico dos modificadores (desconto ou juros)
  const calculateModifier = (type: "valor" | "percentual", valStr: string) => {
    const valObj = valStr.replace(/\D/g, "");
    if (!valObj) return 0;
    const num = parseFloat(valObj) / 100;
    
    if (type === "percentual") {
      return amount * (num / 100);
    }
    return num;
  };

  const discountAmount = isEarlyOrOnTime ? calculateModifier(discountType, discountValue) : 0;
  const interestAmount = isOverdue ? calculateModifier(interestType, interestValue) : 0;

  // Valor final atualizado
  const finalAmount = amount - discountAmount + interestAmount;

  const fmt = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleConfirm = () => {
    if (!bankAccountId) {
      alert("Por favor, selecione uma conta bancária.");
      return;
    }

    onConfirm({
      bankAccountId: parseInt(bankAccountId),
      finalAmount,
      discountAmount,
      interestAmount
    });
  };

  const accentColor = isExpense ? '#dc2626' : '#16a34a';

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-white gap-0 rounded-xl">
        {/* Header Customizado */}
        <Box sx={{
          background: isExpense
            ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
            : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
          px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isExpense ? <TrendingDown className="h-4 w-4 text-white" /> : <TrendingUp className="h-4 w-4 text-white" />}
            <Typography sx={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>
              Liquidar {isExpense ? 'Despesa' : 'Receita'}
            </Typography>
          </Box>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-1 rounded-full transition-colors">
            <X className="h-4 w-4" />
          </button>
        </Box>

        <div className="p-4 space-y-4">
          {/* Badge de Status / Atraso */}
          {isOverdue ? (
            <Box sx={{ p: 1, borderRadius: 1.5, backgroundColor: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
              <Typography sx={{ color: '#dc2626', fontWeight: 600, fontSize: '0.75rem' }}>
                Vencido há {daysOverdue} {daysOverdue === 1 ? 'dia' : 'dias'}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 1, borderRadius: 1.5, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CheckCheck className="h-3.5 w-3.5 text-green-500" />
              <Typography sx={{ color: '#16a34a', fontWeight: 600, fontSize: '0.75rem' }}>
                No Prazo / Antecipado
              </Typography>
            </Box>
          )}

          {/* Grid de Informações Básicas (Descrição, Data, Valor Original) - Numa linha compacta */}
          <div className="grid grid-cols-12 gap-3 items-end bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="col-span-6">
              <Typography sx={{ color: '#8C8C8C', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.55rem', letterSpacing: '0.5px', mb: 0.5 }}>
                Descrição
              </Typography>
              <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900 truncate">
                <FileText className="h-3.5 w-3.5 text-[#B59363]" />
                <span className="truncate">{transaction.description}</span>
              </div>
            </div>
            <div className="col-span-3">
              <Typography sx={{ color: '#8C8C8C', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.55rem', letterSpacing: '0.5px', mb: 0.5 }}>
                Vencimento
              </Typography>
              <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                <Calendar className="h-3.5 w-3.5 text-[#B59363]" />
                <span className={isOverdue ? "text-red-600" : ""}>{format(dueDate, "dd/MM/yyyy")}</span>
              </div>
            </div>
            <div className="col-span-3 text-right">
              <Typography sx={{ color: '#8C8C8C', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.55rem', letterSpacing: '0.5px', mb: 0.5 }}>
                Valor Original
              </Typography>
              <div className="text-sm font-bold text-gray-900">
                {fmt(amount)}
              </div>
            </div>
          </div>

          {/* Linha de Entradas (Conta + Juros/Desconto) lado a lado para evitar scroll */}
          <div className="grid grid-cols-12 gap-3 items-start">
            
            {/* Conta Bancária (Ocupa 5 colunas) */}
            <div className="col-span-5">
              <CustomInput
                type="select"
                label="Conta Bancária Origem/Destino *"
                value={bankAccountId}
                onChange={(e: any) => setBankAccountId(e.target.value)}
                required
                size="small"
                fullWidth
              >
                <MenuItem value="" disabled>Selecione uma conta</MenuItem>
                {bankAccounts.map((account) => (
                  <MenuItem key={account.id} value={account.id.toString()}>
                    {account.name}
                  </MenuItem>
                ))}
              </CustomInput>
            </div>

            {/* Modificadores (Desconto ou Juros) - Ocupam 7 colunas */}
            <div className="col-span-7 flex gap-2">
              {isEarlyOrOnTime ? (
                // DESCONTO
                <>
                  <div className="w-[40%]">
                    <CustomInput
                      type="select"
                      label="Tipo Desconto"
                      value={discountType}
                      onChange={(e: any) => {
                         setDiscountType(e.target.value as "valor" | "percentual");
                         setDiscountValue("");
                      }}
                      size="small"
                      fullWidth
                    >
                      <MenuItem value="valor">Valor (R$)</MenuItem>
                      <MenuItem value="percentual">Percentual (%)</MenuItem>
                    </CustomInput>
                  </div>
                  <div className="w-[60%]">
                    <CustomInput
                      label="Desconto Concedido"
                      value={discountValue}
                      onChange={(e: any) => setDiscountValue(e.target.value)}
                      size="small"
                      placeholder={discountType === "valor" ? "R$ 0,00" : "0,00 %"}
                      numericType={discountType === "percentual" ? "percentage" : "currency"}
                      fullWidth
                    />
                  </div>
                </>
              ) : (
                // JUROS / MULTA
                <>
                  <div className="w-[40%]">
                    <CustomInput
                      type="select"
                      label="Tipo Encargo"
                      value={interestType}
                      onChange={(e: any) => {
                        setInterestType(e.target.value as "valor" | "percentual");
                        setInterestValue("");
                      }}
                      size="small"
                      fullWidth
                    >
                      <MenuItem value="valor">Valor (R$)</MenuItem>
                      <MenuItem value="percentual">Percentual (%)</MenuItem>
                    </CustomInput>
                  </div>
                  <div className="w-[60%]">
                    <CustomInput
                      label="Multa / Juros Cobrado"
                      value={interestValue}
                      onChange={(e: any) => setInterestValue(e.target.value)}
                      size="small"
                      placeholder={interestType === "valor" ? "R$ 0,00" : "0,00 %"}
                      numericType={interestType === "percentual" ? "percentage" : "currency"}
                      fullWidth
                    />
                  </div>
                </>
              )}
            </div>
            
          </div>

          {/* Resumo Final - Calculado dinamicamente */}
          <div className="mt-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200 flex justify-between items-center shadow-sm">
            <div>
              <Typography sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                Resumo da Liquidação
              </Typography>
              <div className="text-xs text-gray-500 mt-1">
                {isEarlyOrOnTime && discountAmount > 0 && <span className="text-green-600 font-medium">Desconto: {fmt(discountAmount)}</span>}
                {isOverdue && interestAmount > 0 && <span className="text-red-600 font-medium">Acréscimos: {fmt(interestAmount)}</span>}
                {(!discountAmount && !interestAmount) && <span>Valor original mantido</span>}
              </div>
            </div>
            <div className="text-right">
              <Typography sx={{ color: '#8C8C8C', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                Valor Final a Liquidar
              </Typography>
              <Typography sx={{ color: accentColor, fontWeight: 800, fontSize: '1.6rem', lineHeight: 1 }}>
                {fmt(finalAmount)}
              </Typography>
            </div>
          </div>

        </div>

        {/* Rodapé e Ações */}
        <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid #e0e0e0', display: 'flex', justifyContent: 'flex-end', gap: 2, backgroundColor: '#f9fafb' }}>
          <IButtonPrime
            icon={<X className="h-4 w-4" />}
            variant="neutral"
            title="Cancelar"
            onClick={onClose}
          />
          <IButtonPrime
            icon={<CheckCheck className="h-4 w-4" />}
            variant="primary"
            title="Confirmar Liquidação"
            onClick={handleConfirm}
            disabled={!bankAccountId || finalAmount < 0}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
}
