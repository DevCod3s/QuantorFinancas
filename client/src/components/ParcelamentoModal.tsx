/**
 * Modal de configuração de parcelamento
 * Abre ao clicar no ícone de engrenagem quando "Parcelado" está selecionado
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
  IconButton,
} from '@mui/material';
import { X, Save, LogOut } from 'lucide-react';
import { DateInput } from './DateInput';
import { IButtonPrime } from '@/components/ui/i-ButtonPrime';

interface ParcelamentoConfig {
  numeroParcelas: string;
  dataPrimeiraParcela: string;
  aplicarJuros: boolean;
  tipoJuros: 'percentual' | 'valor';
  valorJuros: string;
  aplicarJurosEm: 'total' | 'parcela' | 'atraso';
}

interface ParcelamentoModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (config: ParcelamentoConfig) => void;
  initialConfig?: ParcelamentoConfig;
  valorTotal: string;
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

  // Atualiza estados quando initialConfig mudar
  useEffect(() => {
    if (initialConfig) {
      setNumeroParcelas(initialConfig.numeroParcelas || '');
      setDataPrimeiraParcela(initialConfig.dataPrimeiraParcela || '');
      setAplicarJuros(initialConfig.aplicarJuros || false);
      setTipoJuros(initialConfig.tipoJuros || 'percentual');
      setValorJuros(toDisplay(initialConfig.valorJuros));
      setAplicarJurosEm(initialConfig.aplicarJurosEm || 'total');
    }
  }, [initialConfig]);

  // Calcula valor da parcela
  const calcularValorParcela = (): string => {
    const valorNumerico = parseFloat(valorTotal.replace(/[R$\s.,]/g, '')) / 100;
    const numParcelas = parseInt(numeroParcelas) || 1;

    if (!valorNumerico || !numParcelas) return '0,00';

    let valorFinal = valorNumerico;

    if (aplicarJuros && valorJuros) {
      const juros = parseFloat(valorJuros.replace(',', '.'));

      if (tipoJuros === 'percentual') {
        if (aplicarJurosEm === 'total') {
          valorFinal = valorNumerico * (1 + juros / 100);
        } else {
          // Juros por parcela
          const valorParcela = valorNumerico / numParcelas;
          return (valorParcela * (1 + juros / 100)).toFixed(2).replace('.', ',');
        }
      } else {
        if (aplicarJurosEm === 'total') {
          valorFinal = valorNumerico + juros;
        } else {
          const valorParcela = valorNumerico / numParcelas;
          return (valorParcela + juros).toFixed(2).replace('.', ',');
        }
      }
    }

    return (valorFinal / numParcelas).toFixed(2).replace('.', ',');
  };

  const handleSalvar = () => {
    onSave({
      numeroParcelas,
      dataPrimeiraParcela,
      aplicarJuros,
      tipoJuros,
      valorJuros: valorJuros.replace(',', '.'),
      aplicarJurosEm,
    });
    onClose();
  };

  // Formatação PT-BR para campos de taxa (vírgula, 3 casas decimais)
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

  const valorParcela = calcularValorParcela();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pb: 2,
        borderBottom: '1px solid #e0e0e0'
      }}>
        <span style={{ fontSize: '18px', fontWeight: 600, color: '#1D3557' }}>Configurar Parcelamento</span>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Primeira linha: Número de parcelas e Data */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 3 }}>
          <TextField
            variant="standard"
            label="Número de parcelas *"
            type="number"
            value={numeroParcelas}
            onChange={(e) => setNumeroParcelas(e.target.value)}
            fullWidth
            sx={{
              '& .MuiInputLabel-root': { color: '#1D3557' },
              '& .MuiInput-underline:after': { borderBottomColor: '#B59363' }
            }}
            inputProps={{ min: 1 }}
          />
          <DateInput
            label="Data 1ª parcela *"
            value={dataPrimeiraParcela}
            onChange={setDataPrimeiraParcela}
          />
        </Box>

        {/* Checkbox de juros */}
        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={aplicarJuros}
                onChange={(e) => setAplicarJuros(e.target.checked)}
                sx={{ color: '#B59363', '&.Mui-checked': { color: '#B59363' } }}
              />
            }
            label="Aplicar juros"
            sx={{ '& .MuiFormControlLabel-label': { color: '#1D3557', fontSize: '14px' } }}
          />
        </Box>

        {/* Campos de juros (aparece só quando checkbox está marcado) */}
        {aplicarJuros && (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
            <FormControl variant="standard" fullWidth>
              <InputLabel sx={{ color: '#1D3557' }} shrink={!!tipoJuros || undefined}>
                Tipo de juros
              </InputLabel>
              <Select
                value={tipoJuros}
                onChange={(e) => setTipoJuros(e.target.value as 'percentual' | 'valor')}
              >
                <MenuItem value="percentual">Percentual (%)</MenuItem>
                <MenuItem value="valor">Valor fixo (R$)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              variant="standard"
              label={tipoJuros === 'percentual' ? 'Taxa (%)' : 'Valor (R$)'}
              type="text"
              value={valorJuros}
              onChange={(e) => setValorJuros(formatTaxa(e.target.value))}
              onBlur={() => setValorJuros(formatOnBlur(valorJuros))}
              fullWidth
              sx={{ '& .MuiInputLabel-root': { color: '#666' } }}
              placeholder="0,000"
              inputProps={{ inputMode: 'decimal' }}
            />

            <FormControl variant="standard" fullWidth>
              <InputLabel sx={{ color: '#1D3557' }} shrink={!!aplicarJurosEm || undefined}>
                Aplicar juros em
              </InputLabel>
              <Select
                value={aplicarJurosEm}
                onChange={(e) => setAplicarJurosEm(e.target.value as 'total' | 'parcela' | 'atraso')}
              >
                <MenuItem value="total">Valor total</MenuItem>
                <MenuItem value="parcela">Cada parcela</MenuItem>
                <MenuItem value="atraso">Parcelas em Atraso</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}

        {/* Preview do parcelamento */}
        {numeroParcelas && valorParcela !== '0,00' && (
          <Box sx={{
            p: 2,
            backgroundColor: '#f5f5f5',
            borderRadius: 1,
            border: '1px solid #e0e0e0'
          }}>
            <Box sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>
              Resumo do parcelamento
            </Box>
            <Box sx={{ fontSize: '15px', fontWeight: 600, color: '#333' }}>
              {numeroParcelas}x de R$ {valorParcela}
            </Box>
            {aplicarJuros && (
              <Box sx={{ fontSize: '12px', color: '#999', mt: 0.5 }}>
                {tipoJuros === 'percentual'
                  ? `Juros de ${valorJuros}% ${aplicarJurosEm === 'total' ? 'no total' :
                    aplicarJurosEm === 'parcela' ? 'por parcela' :
                      'em parcelas em atraso'
                  }`
                  : `Juros de R$ ${valorJuros} ${aplicarJurosEm === 'total' ? 'no total' :
                    aplicarJurosEm === 'parcela' ? 'por parcela' :
                      'em parcelas em atraso'
                  }`
                }
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <IButtonPrime
          icon={<Save className="h-4 w-4" />}
          variant="gold"
          title="Salvar"
          onClick={handleSalvar}
          disabled={!numeroParcelas || !dataPrimeiraParcela}
        />
        <IButtonPrime
          icon={<LogOut className="h-4 w-4" />}
          variant="red"
          title="Sair"
          onClick={onClose}
        />
      </DialogActions>
    </Dialog>
  );
}
