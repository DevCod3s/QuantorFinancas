import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Box, Typography, Autocomplete, TextField } from "@mui/material";
import { IButtonPrime } from "./ui/i-ButtonPrime";
import { X, Calendar, DollarSign, FileText, CheckCheck, TrendingDown, TrendingUp, AlertTriangle, LogOut, Save, Plus } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toLocalDate } from "@/lib/utils";
import { Transaction } from "@shared/schema";
import CustomInput, { CustomSelect } from "./CustomInput";
import { DateInput } from "./DateInput";
import MenuItem from '@mui/material/MenuItem';

interface TransactionLiquidateModalProps {
  open: boolean;
  onClose: () => void;
  transaction: any;
  bankAccounts: any[];
  paymentMethods?: any[];
  onAddPaymentMethod?: (name: string) => void;
  onConfirm: (data: any) => void;
}

export function TransactionLiquidateModal({
  open,
  onClose,
  transaction,
  bankAccounts,
  paymentMethods,
  onAddPaymentMethod,
  onConfirm
}: TransactionLiquidateModalProps) {
  const [bankAccountId, setBankAccountId] = useState<string>("");
  const [paymentMethodId, setPaymentMethodId] = useState<string>("");
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [newPaymentName, setNewPaymentName] = useState("");
  const [discountType, setDiscountType] = useState<"valor" | "percentual">("valor");
  const [discountValue, setDiscountValue] = useState<string>("");
  const [jurosType, setJurosType] = useState<"valor" | "percentual">("percentual");
  const [jurosValue, setJurosValue] = useState<string>("");
  const [moraType, setMoraType] = useState<"valor" | "percentual">("percentual");
  const [moraValue, setMoraValue] = useState<string>("");
  const [liquidationDate, setLiquidationDate] = useState<string>("");

  useEffect(() => {
    if (open && transaction) {
      setBankAccountId(transaction.bankAccountId?.toString() || "");
      setPaymentMethodId(transaction.paymentMethodId?.toString() || "");
      const todayISO = new Date().toISOString().split('T')[0];
      setLiquidationDate(todayISO);
      setDiscountType("valor");
      setDiscountValue("");
      
      const isRecurrentOrInstallment = transaction.repeticao === 'Recorrente' || transaction.repeticao === 'Parcelado';
      const hasPreConfig = transaction.aplicarEncargos === true || transaction.aplicarJuros === true;
      
      if (isRecurrentOrInstallment && hasPreConfig) {
         const jMes = transaction.jurosMes ? parseFloat(transaction.jurosMes) : (transaction.valorJuros ? parseFloat(transaction.valorJuros) : 0);
         const mDia = transaction.moraDia ? parseFloat(transaction.moraDia) : 0;
         
         setJurosType("percentual");
         setJurosValue(jMes > 0 ? jMes.toString().replace('.', ',') : ""); 
         
         setMoraType("percentual");
         setMoraValue(mDia > 0 ? mDia.toString().replace('.', ',') : "");
      } else {
         setJurosType("percentual");
         setJurosValue("");
         setMoraType("percentual");
         setMoraValue("");
      }
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

  const parseNum = (valStr: string) => {
    if (!valStr) return 0;
    if (valStr.includes(',')) {
       const cleaned = valStr.replace(/\./g, '').replace(',', '.');
       return parseFloat(cleaned) || 0;
    }
    return parseFloat(valStr) || 0;
  };

  const calculateDiscount = () => {
    const val = parseNum(discountValue);
    if (!val) return 0;
    if (discountType === "percentual") {
      return amount * (val / 100);
    }
    return val;
  };

  const calculatePenalty = () => {
    let total = 0;
    const jVal = parseNum(jurosValue);
    if (jVal > 0) {
      if (jurosType === "percentual") {
        const txDiaria = (jVal / 100) / 30; // Juros a.m.
        total += amount * txDiaria * daysOverdue;
      } else {
        total += jVal;
      }
    }
    const mVal = parseNum(moraValue);
    if (mVal > 0) {
      if (moraType === "percentual") {
        total += amount * (mVal / 100) * daysOverdue; // Mora a.d.
      } else {
        total += mVal * daysOverdue;
      }
    }
    return total;
  };

  const discountAmount = isEarlyOrOnTime ? calculateDiscount() : 0;
  const interestAmount = isOverdue ? calculatePenalty() : 0;

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
      paymentMethodId: paymentMethodId ? parseInt(paymentMethodId) : undefined,
      finalAmount,
      discountAmount,
      interestAmount,
      liquidationDate
    });
  };

  const accentColor = isExpense ? '#dc2626' : '#16a34a';

  return (
    <>
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
            
            {/* Esquerda (Conta e Forma Pag) - Ocupa 5 colunas */}
            <div className="col-span-6 flex flex-col gap-3">
              <Autocomplete
                options={bankAccounts}
                getOptionLabel={(account: any) => `${account.name || 'Conta'} (${account.bank || 'Banco'} - Cc: ${account.accountNumber || 'S/N'})`}
                value={(bankAccounts || []).find((a: any) => a.id.toString() === bankAccountId.toString()) || null}
                onChange={(_, newValue: any) => setBankAccountId(newValue ? newValue.id.toString() : '')}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Conta Bancária Origem/Destino *" 
                    required 
                    variant="standard"
                    sx={{
                      '& .MuiInputLabel-root': { color: '#1D3557' },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#B59363' },
                      '& .MuiInput-underline:after': { borderBottomColor: '#B59363' },
                      '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#1D3557' },
                      '& .MuiInputBase-input': { color: '#1D3557', fontWeight: 500 }
                    }}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
                componentsProps={{ paper: { sx: { zIndex: 1400 } } }}
              />
              
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <CustomSelect
                    label="Forma de Pagamento"
                    value={paymentMethodId}
                    onChange={(e: any) => setPaymentMethodId(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {paymentMethods?.map((method) => (
                      <option key={method.id} value={method.id.toString()}>
                        {method.name}
                      </option>
                    ))}
                  </CustomSelect>
                </div>
                <IButtonPrime
                  variant="neutral"
                  icon={<Plus className="h-5 w-5" />}
                  title="Nova Forma"
                  onClick={() => setIsAddingPayment(true)}
                  className="px-2"
                />
              </div>
            </div>

            {/* Modificadores (Desconto ou Juros) - Ocupam 7 colunas */}
            <div className="col-span-7 flex gap-2">
              {isEarlyOrOnTime ? (
                // DESCONTO
                <>
                  <div className="w-[40%]">
                    <CustomSelect
                      label="Tipo Desconto"
                      value={discountType}
                      onChange={(e: any) => {
                         setDiscountType(e.target.value as "valor" | "percentual");
                         setDiscountValue("");
                      }}
                    >
                      <option value="valor">Valor (R$)</option>
                      <option value="percentual">Percentual (%)</option>
                    </CustomSelect>
                  </div>
                  <div className="w-[60%]">
                    <CustomInput
                      label="Desconto Concedido"
                      value={discountValue}
                      onChange={(e: any) => setDiscountValue(e.target.value)}
                      placeholder={discountType === "valor" ? "R$ 0,00" : "0,00 %"}
                    />
                  </div>
                </>
              ) : (
                // JUROS E MORA
                <div className="flex flex-col w-full gap-3">
                  <div className="flex w-full gap-2">
                    <div className="w-[40%]">
                      <CustomSelect
                        label="Taxa de Juros"
                        value={jurosType}
                        onChange={(e: any) => setJurosType(e.target.value as "valor" | "percentual")}
                      >
                        <option value="percentual">Percentual (%)</option>
                        <option value="valor">Valor (R$)</option>
                      </CustomSelect>
                    </div>
                    <div className="w-[60%]">
                      <CustomInput
                        label={jurosType === 'percentual' ? "Juros a.m. (%)" : "Juros Total (R$)"}
                        value={jurosValue}
                        onChange={(e: any) => setJurosValue(e.target.value)}
                        placeholder={jurosType === "valor" ? "R$ 0,00" : "0,00 %"}
                      />
                    </div>
                  </div>
                  <div className="flex w-full gap-2">
                    <div className="w-[40%]">
                      <CustomSelect
                        label="Taxa de Mora"
                        value={moraType}
                        onChange={(e: any) => setMoraType(e.target.value as "valor" | "percentual")}
                      >
                        <option value="percentual">Percentual (%)</option>
                        <option value="valor">Valor (R$)</option>
                      </CustomSelect>
                    </div>
                    <div className="w-[60%]">
                      <CustomInput
                        label={moraType === 'percentual' ? "Mora a.d. (%)" : "Mora / Dia (R$)"}
                        value={moraValue}
                        onChange={(e: any) => setMoraValue(e.target.value)}
                        placeholder={moraType === "valor" ? "R$ 0,00" : "0,00 %"}
                      />
                    </div>
                  </div>
                </div>
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

        <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid #e0e0e0', display: 'flex', justifyContent: 'flex-end', gap: 2, backgroundColor: '#f9fafb' }}>
          <IButtonPrime
            icon={<LogOut className="h-4 w-4" />}
            variant="red"
            title="Sair"
            onClick={onClose}
            className="w-auto h-auto min-w-[100px]"
          />
          <IButtonPrime
            icon={<Save className="h-4 w-4" />}
            variant="gold"
            title="Salvar"
            onClick={handleConfirm}
            disabled={!bankAccountId || finalAmount < 0}
            className="w-auto h-auto min-w-[100px]"
          />
        </Box>
      </DialogContent>
    </Dialog>

    {/* Modal para Adicionar Nova Forma de Pagamento */}
    <Dialog open={isAddingPayment} onOpenChange={setIsAddingPayment}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden bg-white gap-0 rounded-xl">
        <DialogHeader className="p-4 border-b border-gray-100 bg-gray-50/50">
          <DialogTitle className="text-sm font-semibold text-[#1D3557]">Nova Forma de Pagamento</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <CustomInput
            label="Nome (Ex: Pix, Cartão)"
            value={newPaymentName}
            onChange={(e: any) => setNewPaymentName(e.target.value)}
            autoFocus
          />
        </div>
        <DialogFooter className="p-4 bg-gray-50/50 border-t border-gray-100 flex gap-2 sm:justify-end">
          <IButtonPrime icon={<X className="h-4 w-4" />} variant="neutral" title="Cancelar" onClick={() => setIsAddingPayment(false)} className="w-auto min-w-[100px]" />
          <IButtonPrime icon={<Save className="h-4 w-4" />} variant="primary" title="Salvar" onClick={() => {
            if (newPaymentName.trim() && onAddPaymentMethod) {
              onAddPaymentMethod(newPaymentName);
              setNewPaymentName("");
              setIsAddingPayment(false);
            }
          }} className="w-auto min-w-[100px]" />
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
