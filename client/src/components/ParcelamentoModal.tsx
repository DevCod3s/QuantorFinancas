/**
 * Modal de configuração de parcelamento Dinâmico Avançado
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Box,
  RadioGroup,
  Radio,
  Typography,
} from '@mui/material';
import { X, Save, LogOut } from 'lucide-react';
import { DateInput } from './DateInput';
import { IButtonPrime } from '@/components/ui/i-ButtonPrime';

export interface InstallmentItem {
  installmentNumber: number;
  date: string;
  value: number; 
  formattedValue: string;
}

export interface ParcelamentoConfig {
  numeroParcelas: string;
  dataPrimeiraParcela: string;
  aplicarJuros: boolean;
  tipoJuros: 'percentual' | 'valor';
  valorJuros: string;
  aplicarJurosEm: 'total' | 'parcela' | 'atraso';
  tipoRateio: 'dividir' | 'multiplicar';
  installments: InstallmentItem[];
  valorTotalFormatado?: string;
}

interface ParcelamentoModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (config: ParcelamentoConfig) => void;
  initialConfig?: ParcelamentoConfig;
  valorTotal: string; // ex: "1.000,00"
}

export function ParcelamentoModal({
  open,
  onClose,
  onSave,
  initialConfig,
  valorTotal
}: ParcelamentoModalProps) {
  const toDisplay = (val: string | undefined) => val ? val.replace('.', ',') : '';

  const [numeroParcelas, setNumeroParcelas] = useState(initialConfig?.numeroParcelas || '');
  const [dataPrimeiraParcela, setDataPrimeiraParcela] = useState(initialConfig?.dataPrimeiraParcela || '');
  const [aplicarJuros, setAplicarJuros] = useState(initialConfig?.aplicarJuros || false);
  const [tipoJuros, setTipoJuros] = useState<'percentual' | 'valor'>(initialConfig?.tipoJuros || 'percentual');
  const [valorJuros, setValorJuros] = useState(toDisplay(initialConfig?.valorJuros));
  const [aplicarJurosEm, setAplicarJurosEm] = useState<'total' | 'parcela' | 'atraso'>(initialConfig?.aplicarJurosEm || 'total');
  
  // Novos estados da arquitetura dinâmica
  const [tipoRateio, setTipoRateio] = useState<'dividir' | 'multiplicar'>(initialConfig?.tipoRateio || 'dividir');
  const [installments, setInstallments] = useState<InstallmentItem[]>(initialConfig?.installments || []);

  // Update effect if external config comes in / modal opened
  useEffect(() => {
    if (initialConfig && open) {
      setNumeroParcelas(initialConfig.numeroParcelas || '');
      setDataPrimeiraParcela(initialConfig.dataPrimeiraParcela || '');
      setAplicarJuros(initialConfig.aplicarJuros || false);
      setTipoJuros(initialConfig.tipoJuros || 'percentual');
      setValorJuros(toDisplay(initialConfig.valorJuros));
      setAplicarJurosEm(initialConfig.aplicarJurosEm || 'total');
      setTipoRateio(initialConfig.tipoRateio || 'dividir');
      if (initialConfig.installments && initialConfig.installments.length > 0) {
        setInstallments(initialConfig.installments);
      }
    }
  }, [initialConfig, open]);

  // Efeito Reativo que recalcula a Grade
  useEffect(() => {
    if (!open) return;
    const num = parseInt(numeroParcelas);
    if (!num || num <= 0) {
      setInstallments([]);
      return;
    }

    const valorNumerico = parseFloat(valorTotal.replace(/[R$\s.,]/g, '')) / 100;
    if (!valorNumerico) return;

    let valorBaseTotal = tipoRateio === 'dividir' ? valorNumerico : valorNumerico * num;
    let valorBaseParcela = tipoRateio === 'dividir' ? valorNumerico / num : valorNumerico;

    // Cálculo Financeiro Dinâmico
    if (aplicarJuros && valorJuros) {
      const juros = parseFloat(valorJuros.replace(',', '.'));
      if (!isNaN(juros)) {
        if (tipoJuros === 'percentual') {
          if (aplicarJurosEm === 'total') {
            const montanteComJuros = valorBaseTotal * (1 + juros / 100);
            valorBaseParcela = montanteComJuros / num;
            valorBaseTotal = montanteComJuros; // apenas para constar, pois recalculamos a parcela
          } else if (aplicarJurosEm === 'parcela') {
            valorBaseParcela = valorBaseParcela * (1 + juros / 100);
          }
        } else {
          // Valor Fixo
          if (aplicarJurosEm === 'total') {
            const montanteComJuros = valorBaseTotal + juros;
            valorBaseParcela = montanteComJuros / num;
            valorBaseTotal = montanteComJuros;
          } else if (aplicarJurosEm === 'parcela') {
            valorBaseParcela = valorBaseParcela + juros;
          }
        }
      }
    }

    // Processamento de Datas
    let baseDate = new Date();
    if (dataPrimeiraParcela && dataPrimeiraParcela.length === 10) {
      const parts = dataPrimeiraParcela.split('/');
      baseDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }

    setInstallments(prev => {
      const newInsts: InstallmentItem[] = [];
      for (let i = 0; i < num; i++) {
        // Preserva formatação manual do usuário se existir no array antigo
        const existing = prev[i];
        
        let parcelDateStr = "";
        if (existing && existing.date) {
           parcelDateStr = existing.date;
        } else {
           const d = new Date(baseDate);
           d.setMonth(d.getMonth() + i);
           const dd = String(d.getDate()).padStart(2, '0');
           const mm = String(d.getMonth() + 1).padStart(2, '0');
           const yy = d.getFullYear();
           parcelDateStr = `${dd}/${mm}/${yy}`;
        }

        newInsts.push({
          installmentNumber: i + 1,
          date: parcelDateStr,
          value: valorBaseParcela,
          formattedValue: valorBaseParcela.toFixed(2).replace('.', ',')
        });
      }
      return newInsts;
    });

  }, [numeroParcelas, dataPrimeiraParcela, valorTotal, tipoRateio, aplicarJuros, tipoJuros, valorJuros, aplicarJurosEm, open]);

  const handleInstallmentDateChange = (index: number, newDate: string) => {
    setInstallments(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], date: newDate };
      return copy;
    });
  };

  const handleSalvar = () => {
    // Se a primeira data estiver nula no input mas a grid já existe, adotamos a primeira da Grid
    const primeiraDataReal = dataPrimeiraParcela || (installments.length > 0 ? installments[0].date : '');
    onSave({
      numeroParcelas,
      dataPrimeiraParcela: primeiraDataReal,
      aplicarJuros,
      tipoJuros,
      valorJuros: valorJuros.replace(',', '.'),
      aplicarJurosEm,
      tipoRateio,
      installments,
    });
    onClose();
  };

  const formatTaxa = (value: string): string => {
    let clean = value.replace(/[^0-9,]/g, '');
    const parts = clean.split(',');
    if (parts.length > 2) clean = parts[0] + ',' + parts.slice(1).join('');
    if (parts.length === 2 && parts[1].length > 3) clean = parts[0] + ',' + parts[1].substring(0, 3);
    return clean;
  };

  const formatOnBlur = (value: string): string => {
    if (!value) return '';
    const num = parseFloat(value.replace(',', '.'));
    if (isNaN(num)) return '';
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 3 });
  };

  const totalFormatadoMatriz = installments.reduce((acc, curr) => acc + curr.value, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.5, pt: 2, borderBottom: '1px solid #e0e0e0' }}>
        <span style={{ fontSize: '16px', fontWeight: 600, color: '#1D3557' }}>Configuração Avançada de Parcelamento</span>
      </DialogTitle>

      <DialogContent sx={{ pt: 2, pb: 1 }}>
        
        {/* Lógica de Rateio */}
        <Box sx={{ mb: 2, p: 1.5, backgroundColor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
           <Typography variant="subtitle2" sx={{ color: '#1e293b', mb: 0.5, fontWeight: 600, fontSize: '13px' }}>Tipo de Rateio</Typography>
           <RadioGroup 
             row 
             value={tipoRateio} 
             onChange={(e) => setTipoRateio(e.target.value as 'dividir' | 'multiplicar')}
             sx={{ '& .MuiFormControlLabel-root': { mb: -0.5, mt: -0.5 } }}
           >
             <FormControlLabel 
               value="dividir" 
               control={<Radio size="small" sx={{color: '#B59363', '&.Mui-checked': {color: '#B59363'}}} />} 
               label={<Typography sx={{fontSize: '13px', color: '#475569'}}>Dividir valor total (Ex: R$ 1.000 ÷ 4 = R$ 250/mês)</Typography>} 
             />
             <FormControlLabel 
               value="multiplicar" 
               control={<Radio size="small" sx={{color: '#B59363', '&.Mui-checked': {color: '#B59363'}}} />} 
               label={<Typography sx={{fontSize: '13px', color: '#475569'}}>Multiplicar parcelas (Ex: R$ 1.000 × 4 = R$ 4.000)</Typography>} 
             />
           </RadioGroup>
        </Box>

        {/* Primeira linha: Número de parcelas e Data */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 1 }}>
          <TextField
            variant="standard"
            label="Número de parcelas *"
            type="number"
            value={numeroParcelas}
            onChange={(e) => {
              const val = e.target.value;
              if (parseInt(val) > 120) return; // Limite arquitetural para não travar a UI (10 anos)
              setNumeroParcelas(val);
            }}
            fullWidth
            sx={{ '& .MuiInputLabel-root': { color: '#1D3557' }, '& .MuiInput-underline:after': { borderBottomColor: '#B59363' } }}
            inputProps={{ min: 1, max: 120 }}
          />
          <DateInput
            label="Data 1ª parcela *"
            value={dataPrimeiraParcela}
            onChange={setDataPrimeiraParcela}
          />
        </Box>

        {/* Checkbox de juros */}
        <Box sx={{ mb: 0.5 }}>
          <FormControlLabel
            control={<Checkbox size="small" checked={aplicarJuros} onChange={(e) => setAplicarJuros(e.target.checked)} sx={{ color: '#B59363', '&.Mui-checked': { color: '#B59363' } }} />}
            label="Aplicar juros"
            sx={{ '& .MuiFormControlLabel-label': { color: '#1D3557', fontSize: '13px', fontWeight: 500 } }}
          />
        </Box>

        {/* Campos de juros */}
        {aplicarJuros && (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, mb: 2, p: 1.5, backgroundColor: '#fff8f1', borderRadius: 2, border: '1px solid #ffedd5' }}>
            <FormControl variant="standard" fullWidth>
              <InputLabel sx={{ color: '#1D3557', fontSize: '14px' }} shrink={true}>Tipo de juros</InputLabel>
              <Select value={tipoJuros} onChange={(e) => setTipoJuros(e.target.value as 'percentual' | 'valor')} sx={{ fontSize: '14px' }}>
                <MenuItem value="percentual" sx={{ fontSize: '14px' }}>Percentual (%)</MenuItem>
                <MenuItem value="valor" sx={{ fontSize: '14px' }}>Valor fixo (R$)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              variant="standard"
              label={tipoJuros === 'percentual' ? 'Taxa (%)' : 'Valor (R$)'}
              value={valorJuros}
              onChange={(e) => setValorJuros(formatTaxa(e.target.value))}
              onBlur={() => setValorJuros(formatOnBlur(valorJuros))}
              fullWidth
              sx={{ '& .MuiInputLabel-root': { color: '#666', fontSize: '14px' }, '& .MuiInputBase-input': { fontSize: '14px' } }}
              placeholder="0,000"
            />

            <FormControl variant="standard" fullWidth>
              <InputLabel sx={{ color: '#1D3557', fontSize: '14px' }} shrink={true}>Aplicar juros em</InputLabel>
              <Select value={aplicarJurosEm} onChange={(e) => setAplicarJurosEm(e.target.value as 'total' | 'parcela' | 'atraso')} sx={{ fontSize: '14px' }}>
                <MenuItem value="total" sx={{ fontSize: '14px' }}>Montante Total</MenuItem>
                <MenuItem value="parcela" sx={{ fontSize: '14px' }}>Cada Parcela</MenuItem>
                <MenuItem value="atraso" sx={{ fontSize: '14px' }}>Apenas Atraso</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}

        {/* Grid Dinâmico Escalonado de Parcelas Geradas */}
        {installments.length > 0 && (
          <Box sx={{ mt: 2, mb: 0 }}>
             <Typography variant="subtitle2" sx={{ color: '#1e293b', mb: 1, fontWeight: 600, borderBottom: '1px solid #e2e8f0', pb: 0.5, fontSize: '13px' }}>
                Previsão de Vencimentos (Editável)
             </Typography>
             
             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: '25vh', overflowY: 'auto', pr: 0.5,
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-thumb': { backgroundColor: '#cbd5e1', borderRadius: '4px' }
             }}>
                {installments.map((inst, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 0.5, backgroundColor: '#f8fafc', borderRadius: 1.5, border: '1px solid #f1f5f9' }}>
                     <Typography sx={{ fontWeight: 700, color: '#94a3b8', minWidth: '35px', fontSize: '13px', pl: 1 }}>
                        {inst.installmentNumber}ª
                     </Typography>
                     <Box sx={{ flex: 1 }}>
                        <DateInput 
                           label="" 
                           value={inst.date}
                           onChange={(newVal) => handleInstallmentDateChange(index, newVal)}
                        />
                     </Box>
                     <Typography sx={{ fontWeight: 600, color: '#1D3557', minWidth: '95px', textAlign: 'right', fontSize: '13px', pr: 1 }}>
                        R$ {inst.formattedValue}
                     </Typography>
                  </Box>
                ))}
             </Box>
             
             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, p: 1.5, backgroundColor: '#1D3557', borderRadius: 2, color: 'white' }}>
                 <Typography sx={{ fontSize: '13px', opacity: 0.9 }}>Valor Base Consolidado:</Typography>
                 <Typography sx={{ fontSize: '16px', fontWeight: 700 }}>{totalFormatadoMatriz}</Typography>
             </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <IButtonPrime icon={<LogOut className="h-4 w-4" />} variant="red" title="Sair" onClick={onClose} />
        <IButtonPrime icon={<Save className="h-4 w-4" />} variant="gold" title="Confirmar Grade" onClick={handleSalvar} disabled={!numeroParcelas || installments.length === 0} />
      </DialogActions>
    </Dialog>
  );
}
