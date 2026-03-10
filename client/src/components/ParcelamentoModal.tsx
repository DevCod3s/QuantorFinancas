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
  const [numeroParcelas, setNumeroParcelas] = useState(initialConfig?.numeroParcelas || '');
  const [dataPrimeiraParcela, setDataPrimeiraParcela] = useState(initialConfig?.dataPrimeiraParcela || '');
  const [aplicarJuros, setAplicarJuros] = useState(initialConfig?.aplicarJuros || false);
  const [tipoJuros, setTipoJuros] = useState<'percentual' | 'valor'>(initialConfig?.tipoJuros || 'percentual');
  const [valorJuros, setValorJuros] = useState(initialConfig?.valorJuros || '');
  const [aplicarJurosEm, setAplicarJurosEm] = useState<'total' | 'parcela' | 'atraso'>(initialConfig?.aplicarJurosEm || 'total');

  // Atualiza estados quando initialConfig mudar
  useEffect(() => {
    if (initialConfig) {
      setNumeroParcelas(initialConfig.numeroParcelas || '');
      setDataPrimeiraParcela(initialConfig.dataPrimeiraParcela || '');
      setAplicarJuros(initialConfig.aplicarJuros || false);
      setTipoJuros(initialConfig.tipoJuros || 'percentual');
      setValorJuros(initialConfig.valorJuros || '');
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
      const juros = parseFloat(valorJuros);
      
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
      valorJuros,
      aplicarJurosEm,
    });
    onClose();
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
        <span style={{ fontSize: '18px', fontWeight: 600 }}>Configurar Parcelamento</span>
        <IconButton onClick={onClose} size="small">
          <X className="h-5 w-5" />
        </IconButton>
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
            sx={{ '& .MuiInputLabel-root': { color: '#666' } }}
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
                sx={{ color: '#666' }}
              />
            }
            label="Aplicar juros"
            sx={{ '& .MuiFormControlLabel-label': { color: '#666', fontSize: '14px' } }}
          />
        </Box>

        {/* Campos de juros (aparece só quando checkbox está marcado) */}
        {aplicarJuros && (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
            <FormControl variant="standard" fullWidth>
              <InputLabel sx={{ color: '#666' }} shrink={!!tipoJuros || undefined}>
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
              type="number"
              value={valorJuros}
              onChange={(e) => setValorJuros(e.target.value)}
              fullWidth
              sx={{ '& .MuiInputLabel-root': { color: '#666' } }}
              inputProps={{ min: 0, step: tipoJuros === 'percentual' ? '0.01' : '0.01' }}
            />

            <FormControl variant="standard" fullWidth>
              <InputLabel sx={{ color: '#666' }} shrink={!!aplicarJurosEm || undefined}>
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
                  ? `Juros de ${valorJuros}% ${
                      aplicarJurosEm === 'total' ? 'no total' : 
                      aplicarJurosEm === 'parcela' ? 'por parcela' : 
                      'em parcelas em atraso'
                    }`
                  : `Juros de R$ ${valorJuros} ${
                      aplicarJurosEm === 'total' ? 'no total' : 
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
          icon={<LogOut className="h-4 w-4" />}
          variant="red"
          title="Cancelar"
          onClick={onClose}
        />
        <IButtonPrime
          icon={<Save className="h-4 w-4" />}
          variant="blue"
          title="Salvar"
          onClick={handleSalvar}
          disabled={!numeroParcelas || !dataPrimeiraParcela}
        />
      </DialogActions>
    </Dialog>
  );
}
