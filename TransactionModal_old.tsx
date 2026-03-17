/**
 * @fileoverview Modal de transa├º├Áes para lan├ºamentos financeiros
 * Componente respons├ível por criar e editar transa├º├Áes (receitas/despesas)
 * com formul├írio completo seguindo layout da imagem de refer├¬ncia
 * 
 * @author Sistema Quantor
 * @version 1.0.0
 * @since Janeiro 2025
 */

import React, { useState } from 'react';
import {
  Dialog,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import { X, Check, CheckCheck, Paperclip, Plus, HelpCircle } from 'lucide-react';
import { DateInput } from './DateInput';

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (transaction: any) => void;
}

/**
 * Modal para cria├º├úo de novas transa├º├Áes financeiras
 * Layout baseado na imagem de refer├¬ncia com campos organizados em grid
 */
export function TransactionModal({ open, onClose, onSave }: TransactionModalProps) {
  const [tipo, setTipo] = useState('Nova receita');
  const [valor, setValor] = useState('0,00');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]); // Formato ISO: YYYY-MM-DD
  const [repeticao, setRepeticao] = useState('├Ünica');
  const [periodicidade, setPeriodicidade] = useState('mensal');
  const [intervaloRepeticao, setIntervaloRepeticao] = useState('1');
  const [numeroParcelas, setNumeroParcelas] = useState('2');
  const [descricao, setDescricao] = useState('');
  const [conta, setConta] = useState('');
  const [categoria, setCategoria] = useState('');
  const [contato, setContato] = useState('');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [tags, setTags] = useState('');

  // Fun├º├úo para formata├º├úo de moeda brasileira
  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Remove tudo exceto n├║meros
    value = value.replace(/\D/g, '');
    // Converte para n├║mero e divide por 100 para casas decimais
    const number = parseInt(value) / 100;
    // Formata como moeda brasileira
    if (value === '') {
      setValor('');
    } else {
      const formatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2
      }).format(number);
      setValor(formatted);
    }
  };

  // Calcula valor por parcela
  const valorNumerico = parseFloat(valor.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
  const numParcelas = parseInt(numeroParcelas) || 1;
  const valorPorParcela = numParcelas > 0 ? (valorNumerico / numParcelas) : valorNumerico;
  const valorPorParcelaFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(valorPorParcela);

  const handleSave = () => {
    const transaction = {
      tipo,
      valor: parseFloat(valor.replace(',', '.')),
      data,
      repeticao,
      periodicidade: repeticao === 'Recorrente' ? periodicidade : undefined,
      intervaloRepeticao: repeticao === 'Recorrente' ? parseInt(intervaloRepeticao) : undefined,
      numeroParcelas: repeticao === 'Parcelado' ? parseInt(numeroParcelas) : undefined,
      valorParcela: repeticao === 'Parcelado' ? valorPorParcela : undefined,
      descricao,
      conta,
      categoria,
      contato,
      numeroDocumento,
      observacoes,
      tags
    };

    onSave(transaction);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        zIndex: 1300,
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }
      }}
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '600px',
          maxHeight: '90vh',
          overflow: 'visible'
        }
      }}
    >
      {/* Cabe├ºalho */}
      <div className="flex items-center justify-between p-4 border-b">
        <FormControl variant="standard" sx={{ minWidth: 150 }}>
          <Select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            sx={{
              fontSize: '16px',
              fontWeight: 500,
              '&:before': { borderBottom: 'none' },
              '&:after': { borderBottom: 'none' },
              '&:hover:not(.Mui-disabled):before': { borderBottom: 'none' }
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  zIndex: 1400
                }
              },
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'left',
              },
              transformOrigin: {
                vertical: 'top',
                horizontal: 'left',
              }
            }}
          >
            <MenuItem value="Nova receita">Nova receita</MenuItem>
            <MenuItem value="Nova despesa">Nova despesa</MenuItem>
          </Select>
        </FormControl>

        <IconButton onClick={onClose} size="small">
          <X className="h-5 w-5 text-gray-400" />
        </IconButton>
      </div>

      {/* Conte├║do do modal */}
      <div className="p-6 space-y-6">
        {/* Primeira linha: Valor, Data, Repeti├º├úo */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <TextField
              variant="standard"
              label="Valor (R$)"
              value={valor}
              onChange={handleValorChange}
              fullWidth
              required
              sx={{ '& .MuiInputLabel-root': { color: '#666' } }}
            />
          </div>

          <DateInput
            label="Data"
            value={data}
            onChange={setData}
            required
          />

          <div className="flex items-end gap-2">
            <FormControl variant="standard" fullWidth>
              <InputLabel sx={{ color: '#666' }} shrink={!!repeticao || undefined}>Repeti├º├úo</InputLabel>
              <Select
                value={repeticao}
                onChange={(e) => setRepeticao(e.target.value)}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      zIndex: 1400
                    }
                  },
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                  }
                }}
              >
                <MenuItem value="├Ünica">├Ünica</MenuItem>
                <MenuItem value="Parcelado">Parcelado</MenuItem>
                <MenuItem value="Recorrente">Recorrente</MenuItem>
              </Select>
            </FormControl>
            <IconButton size="small" sx={{ mb: 0.5 }}>
              <HelpCircle className="h-4 w-4 text-gray-400" />
            </IconButton>
          </div>
        </div>

        {/* Campos condicionais de parcelamento - aparecem quando "Parcelado" ├® selecionado */}
        {repeticao === 'Parcelado' && (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <TextField
                variant="standard"
                label="N┬║ de Parcelas"
                type="number"
                value={numeroParcelas}
                onChange={(e) => setNumeroParcelas(e.target.value)}
                fullWidth
                required
                inputProps={{ min: 2, max: 360 }}
                sx={{ '& .MuiInputLabel-root': { color: '#666' } }}
              />
            </div>

            <div>
              <TextField
                variant="standard"
                label="Valor por Parcela"
                value={valorPorParcelaFormatado}
                fullWidth
                InputProps={{ readOnly: true }}
                sx={{
                  '& .MuiInputLabel-root': { color: '#666' },
                  '& .MuiInput-input': { color: '#1976d2', fontWeight: 500 }
                }}
              />
            </div>

            <div className="flex items-end">
              <span className="text-sm text-gray-500 pb-1">
                Total: {valor || 'R$ 0,00'}
              </span>
            </div>
          </div>
        )}

        {/* Campos condicionais de recorr├¬ncia - aparecem quando "Recorrente" ├® selecionado */}
        {repeticao === 'Recorrente' && (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <FormControl variant="standard" fullWidth>
                <InputLabel sx={{ color: '#666' }} shrink={!!periodicidade || undefined}>
                  Periodicidade *
                </InputLabel>
                <Select
                  value={periodicidade}
                  onChange={(e) => setPeriodicidade(e.target.value)}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        zIndex: 1400
                      }
                    },
                    anchorOrigin: {
                      vertical: 'bottom',
                      horizontal: 'left',
                    },
                    transformOrigin: {
                      vertical: 'top',
                      horizontal: 'left',
                    }
                  }}
                >
                  <MenuItem value="diario">Di├írio</MenuItem>
                  <MenuItem value="semanal">Semanal</MenuItem>
                  <MenuItem value="mensal">Mensal</MenuItem>
                  <MenuItem value="trimestral">Trimestral</MenuItem>
                  <MenuItem value="semestral">Semestral</MenuItem>
                  <MenuItem value="anual">Anual</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div>
              <TextField
                variant="standard"
                label="Repete-se a cada * meses"
                type="number"
                value={intervaloRepeticao}
                onChange={(e) => setIntervaloRepeticao(e.target.value)}
                fullWidth
                required
                inputProps={{ min: 1, max: 99 }}
                sx={{ '& .MuiInputLabel-root': { color: '#666' } }}
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors border border-blue-200 hover:border-blue-300"
              >
                Personalizar ÔÜÖ
              </button>
            </div>
          </div>
        )}

        {/* Segunda linha: Descri├º├úo, Conta */}
        <div className="grid grid-cols-2 gap-4">
          <TextField
            variant="standard"
            label="Descri├º├úo"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            fullWidth
            sx={{ '& .MuiInputLabel-root': { color: '#666' } }}
          />

          <TextField
            variant="standard"
            label="Conta"
            value={conta}
            onChange={(e) => setConta(e.target.value)}
            fullWidth
            required
            sx={{ '& .MuiInputLabel-root': { color: '#666' } }}
          />
        </div>

        {/* Terceira linha: Categoria, Contato */}
        <div className="grid grid-cols-2 gap-4">
          <TextField
            variant="standard"
            label="Categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            fullWidth
            required
            sx={{ '& .MuiInputLabel-root': { color: '#666' } }}
          />

          <TextField
            variant="standard"
            label="Contato"
            value={contato}
            onChange={(e) => setContato(e.target.value)}
            fullWidth
            sx={{ '& .MuiInputLabel-root': { color: '#666' } }}
          />
        </div>

        {/* Quarta linha: N├║mero de documento */}
        <div className="relative">
          <TextField
            variant="standard"
            label="N├║mero de documento"
            value={numeroDocumento}
            onChange={(e) => setNumeroDocumento(e.target.value)}
            fullWidth
            sx={{ '& .MuiInputLabel-root': { color: '#666' } }}
          />
          <div className="absolute right-0 bottom-0 text-xs text-gray-400">
            {numeroDocumento.length} / 60
          </div>
        </div>

        {/* Quinta linha: Observa├º├Áes */}
        <div className="relative">
          <TextField
            variant="standard"
            label="Observa├º├Áes"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value.slice(0, 400))}
            fullWidth
            multiline
            rows={3}
            sx={{ '& .MuiInputLabel-root': { color: '#666' } }}
          />
          <div className="absolute right-0 bottom-0 text-xs text-gray-400">
            {observacoes.length} / 400
          </div>
        </div>

        {/* Sexta linha: Tags */}
        <TextField
          variant="standard"
          label="Tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          fullWidth
          sx={{ '& .MuiInputLabel-root': { color: '#666' } }}
        />
      </div>

      {/* Bot├Áes inferiores */}
      <div className="flex items-center justify-between p-4 border-t bg-gray-50">
        <div className="flex items-center gap-2">
          <IconButton
            size="small"
            sx={{
              backgroundColor: '#22c55e',
              color: 'white',
              '&:hover': { backgroundColor: '#16a34a' },
              width: 32,
              height: 32
            }}
          >
            <Check className="h-4 w-4" />
          </IconButton>

          <IconButton
            size="small"
            sx={{
              backgroundColor: '#64748b',
              color: 'white',
              '&:hover': { backgroundColor: '#475569' },
              width: 32,
              height: 32
            }}
          >
            <CheckCheck className="h-4 w-4" />
          </IconButton>

          <IconButton
            size="small"
            sx={{
              backgroundColor: '#64748b',
              color: 'white',
              '&:hover': { backgroundColor: '#475569' },
              width: 32,
              height: 32
            }}
          >
            <Paperclip className="h-4 w-4" />
          </IconButton>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={!valor || !conta || !categoria}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded text-sm transition-colors"
          >
            Salvar
          </button>

          <IconButton
            size="small"
            sx={{
              backgroundColor: '#64748b',
              color: 'white',
              '&:hover': { backgroundColor: '#475569' },
              width: 32,
              height: 32
            }}
          >
            <Plus className="h-4 w-4" />
          </IconButton>
        </div>
      </div>
    </Dialog>
  );
}
