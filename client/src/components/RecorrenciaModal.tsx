/**
 * Modal de configuração de recorrência
 * Abre ao clicar no ícone de engrenagem quando "Recorrente" está selecionado
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
  Typography,
  Box,
  Divider,
  RadioGroup,
  Radio,
} from '@mui/material';
import { Save, LogOut } from 'lucide-react';
import { DateInput } from './DateInput';
import { IButtonPrime } from '@/components/ui/i-ButtonPrime';

export interface RecorrenciaConfig {
  periodicidade: string;
  intervalo: string;
  hasEndDate: boolean;
  dataTermino: string;
  aplicarEncargos: boolean;
  jurosMes: string;
  moraDia: string;
  tipoEncargo: 'percentual' | 'valor';
  aplicarMultaEm: 'atrasados' | 'todos' | 'ambos';
}

interface RecorrenciaModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (config: RecorrenciaConfig) => void;
  initialConfig?: RecorrenciaConfig;
}

export function RecorrenciaModal({
  open,
  onClose,
  onSave,
  initialConfig,
}: RecorrenciaModalProps) {
  const [periodicidade, setPeriodicidade] = useState(initialConfig?.periodicidade || 'Mensal');
  const [intervalo, setIntervalo] = useState(initialConfig?.intervalo || '1');
  const [hasEndDate, setHasEndDate] = useState(initialConfig?.hasEndDate || false);
  const [dataTermino, setDataTermino] = useState(initialConfig?.dataTermino || '');
  const [aplicarEncargos, setAplicarEncargos] = useState(initialConfig?.aplicarEncargos || false);
  const [jurosMes, setJurosMes] = useState(initialConfig?.jurosMes || '');
  const [moraDia, setMoraDia] = useState(initialConfig?.moraDia || '');
  const [tipoEncargo, setTipoEncargo] = useState<'percentual' | 'valor'>(initialConfig?.tipoEncargo || 'percentual');
  const [aplicarMultaEm, setAplicarMultaEm] = useState<'atrasados' | 'todos' | 'ambos'>(initialConfig?.aplicarMultaEm || 'atrasados');

  useEffect(() => {
    if (initialConfig) {
      setPeriodicidade(initialConfig.periodicidade || 'Mensal');
      setIntervalo(initialConfig.intervalo || '1');
      setHasEndDate(initialConfig.hasEndDate || false);
      setDataTermino(initialConfig.dataTermino || '');
      setAplicarEncargos(initialConfig.aplicarEncargos || false);
      setJurosMes(initialConfig.jurosMes || '');
      setMoraDia(initialConfig.moraDia || '');
      setTipoEncargo(initialConfig.tipoEncargo || 'percentual');
      setAplicarMultaEm(initialConfig.aplicarMultaEm || 'atrasados');
    }
  }, [initialConfig]);

  const handleSalvar = () => {
    onSave({
      periodicidade,
      intervalo,
      hasEndDate,
      dataTermino,
      aplicarEncargos,
      jurosMes,
      moraDia,
      tipoEncargo,
      aplicarMultaEm,
    });
    onClose();
  };

  const labelEncargo = tipoEncargo === 'percentual' ? '%' : 'R$';

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
        <span style={{ fontSize: '18px', fontWeight: 600, color: '#1D3557' }}>Configurar Recorrência</span>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Periodicidade e Intervalo */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 3 }}>
          <FormControl variant="standard" fullWidth>
            <InputLabel sx={{ color: '#1D3557' }} shrink={!!periodicidade || undefined}>
              Periodicidade *
            </InputLabel>
            <Select
              value={periodicidade}
              onChange={(e) => setPeriodicidade(e.target.value)}
              sx={{ '&:after': { borderBottomColor: '#B59363' } }}
            >
              <MenuItem value="Diário">Diário</MenuItem>
              <MenuItem value="Semanal">Semanal</MenuItem>
              <MenuItem value="Mensal">Mensal</MenuItem>
              <MenuItem value="Trimestral">Trimestral</MenuItem>
              <MenuItem value="Semestral">Semestral</MenuItem>
              <MenuItem value="Anual">Anual</MenuItem>
            </Select>
          </FormControl>

          <TextField
            variant="standard"
            label="Intervalo *"
            type="number"
            value={intervalo}
            onChange={(e) => setIntervalo(e.target.value)}
            fullWidth
            sx={{
              '& .MuiInputLabel-root': { color: '#1D3557' },
              '& .MuiInput-underline:after': { borderBottomColor: '#B59363' }
            }}
            inputProps={{ min: 1 }}
          />
        </Box>

        {/* Data de término */}
        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={hasEndDate}
                onChange={(e) => setHasEndDate(e.target.checked)}
                sx={{ color: '#B59363', '&.Mui-checked': { color: '#B59363' } }}
              />
            }
            label="Definir data de término"
            sx={{ '& .MuiFormControlLabel-label': { color: '#1D3557', fontSize: '14px' } }}
          />
        </Box>

        {hasEndDate && (
          <Box sx={{ mb: 3 }}>
            <DateInput
              label="Data de término *"
              value={dataTermino}
              onChange={setDataTermino}
            />
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Seção de Encargos */}
        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={aplicarEncargos}
                onChange={(e) => setAplicarEncargos(e.target.checked)}
                sx={{ color: '#B59363', '&.Mui-checked': { color: '#B59363' } }}
              />
            }
            label="Aplicar juros e mora"
            sx={{ '& .MuiFormControlLabel-label': { color: '#1D3557', fontSize: '14px', fontWeight: 500 } }}
          />
        </Box>

        {aplicarEncargos && (
          <>
            {/* Tipo de cálculo + Juros + Mora — tudo na mesma linha */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 2, mb: 3 }}>
              <FormControl variant="standard" fullWidth>
                <InputLabel sx={{ color: '#1D3557' }} shrink>Tipo de cálculo</InputLabel>
                <Select
                  value={tipoEncargo}
                  onChange={(e) => setTipoEncargo(e.target.value as 'percentual' | 'valor')}
                  sx={{ '&:after': { borderBottomColor: '#B59363' } }}
                >
                  <MenuItem value="percentual">Percentual (%)</MenuItem>
                  <MenuItem value="valor">Valor fixo (R$)</MenuItem>
                </Select>
              </FormControl>
              <TextField
                variant="standard"
                label={`Juros ao mês (${labelEncargo})`}
                type="number"
                value={jurosMes}
                onChange={(e) => setJurosMes(e.target.value)}
                fullWidth
                sx={{
                  '& .MuiInputLabel-root': { color: '#1D3557', fontSize: '13px' },
                  '& .MuiInput-underline:after': { borderBottomColor: '#B59363' },
                  '& .MuiInput-input': { fontSize: '14px' }
                }}
                inputProps={{ min: 0, step: '0.01' }}
              />
              <TextField
                variant="standard"
                label={`Mora ao dia (${labelEncargo})`}
                type="number"
                value={moraDia}
                onChange={(e) => setMoraDia(e.target.value)}
                fullWidth
                sx={{
                  '& .MuiInputLabel-root': { color: '#1D3557', fontSize: '13px' },
                  '& .MuiInput-underline:after': { borderBottomColor: '#B59363' },
                  '& .MuiInput-input': { fontSize: '14px' }
                }}
                inputProps={{ min: 0, step: '0.01' }}
              />
            </Box>

            {/* Aplicar multa em */}
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: '13px', color: '#1D3557', mb: 1, fontWeight: 500 }}>
                Aplicar multa em
              </Typography>
              <RadioGroup
                value={aplicarMultaEm}
                onChange={(e) => setAplicarMultaEm(e.target.value as 'atrasados' | 'todos' | 'ambos')}
              >
                <FormControlLabel
                  value="atrasados"
                  control={<Radio size="small" sx={{ color: '#B59363', '&.Mui-checked': { color: '#B59363' } }} />}
                  label={<Typography sx={{ fontSize: '13px', color: '#555' }}>Somente documentos atrasados</Typography>}
                />
                <FormControlLabel
                  value="todos"
                  control={<Radio size="small" sx={{ color: '#B59363', '&.Mui-checked': { color: '#B59363' } }} />}
                  label={<Typography sx={{ fontSize: '13px', color: '#555' }}>Todos os meses</Typography>}
                />
                <FormControlLabel
                  value="ambos"
                  control={<Radio size="small" sx={{ color: '#B59363', '&.Mui-checked': { color: '#B59363' } }} />}
                  label={<Typography sx={{ fontSize: '13px', color: '#555' }}>Ambos (atrasados + todos os meses)</Typography>}
                />
              </RadioGroup>
            </Box>
          </>
        )}

        {/* Preview da recorrência */}
        <Box sx={{
          p: 2,
          backgroundColor: '#f5f5f5',
          borderRadius: 1,
          border: '1px solid #e0e0e0'
        }}>
          <Box sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>
            Resumo da recorrência
          </Box>
          <Box sx={{ fontSize: '15px', fontWeight: 600, color: '#333' }}>
            {periodicidade} — a cada {intervalo} {parseInt(intervalo) > 1 ? 'períodos' : 'período'}
          </Box>
          {hasEndDate && dataTermino && (
            <Box sx={{ fontSize: '12px', color: '#999', mt: 0.5 }}>
              Até {dataTermino.split('-').reverse().join('/')}
            </Box>
          )}
          {aplicarEncargos && (jurosMes || moraDia) && (
            <Box sx={{ fontSize: '12px', color: '#999', mt: 0.5 }}>
              {jurosMes && `Juros: ${jurosMes}${labelEncargo}/mês`}
              {jurosMes && moraDia && ' · '}
              {moraDia && `Mora: ${moraDia}${labelEncargo}/dia`}
              {' · '}
              {aplicarMultaEm === 'atrasados' ? 'Em atrasados' : aplicarMultaEm === 'todos' ? 'Todos os meses' : 'Atrasados + Todos'}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <IButtonPrime
          icon={<Save className="h-4 w-4" />}
          variant="gold"
          title="Salvar"
          onClick={handleSalvar}
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
