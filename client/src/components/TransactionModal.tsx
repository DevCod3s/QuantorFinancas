/**
 * @fileoverview Modal de transações para lançamentos financeiros
 * Componente responsável por criar e editar transações (receitas/despesas)
 * com formulário completo seguindo layout da imagem de referência
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
import { X, Check, CheckCheck, Paperclip, Plus, HelpCircle, Save, LogOut } from 'lucide-react';
import { DateInput } from './DateInput';
import { IButtonPrime } from './ui/i-ButtonPrime';
import { localDateStr } from '@/lib/utils';

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (transaction: any) => void;
  initialType?: 'Nova receita' | 'Nova despesa';
}

/**
 * Modal para criação de novas transações financeiras
 * Layout baseado na imagem de referência com campos organizados em grid
 */
export function TransactionModal({ open, onClose, onSave, initialType = 'Nova receita' }: TransactionModalProps) {
  const [tipo, setTipo] = useState(initialType);

  // Keep type updated if initialType changes
  React.useEffect(() => {
    if (open) {
      setTipo(initialType);
    }
  }, [open, initialType]);
  const [valor, setValor] = useState('0,00');
  const [data, setData] = useState(localDateStr()); // Formato ISO: YYYY-MM-DD
  const [repeticao, setRepeticao] = useState('Única');
  const [periodicidade, setPeriodicidade] = useState('mensal');
  const [intervaloRepeticao, setIntervaloRepeticao] = useState('1');
  const [descricao, setDescricao] = useState('');
  const [conta, setConta] = useState('');
  const [categoria, setCategoria] = useState('');
  const [contato, setContato] = useState('');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [tags, setTags] = useState('');

  // Função para formatação de moeda brasileira
  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Remove tudo exceto números
    value = value.replace(/\D/g, '');
    // Converte para número e divide por 100 para casas decimais
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

  const handleSave = () => {
    const transaction = {
      tipo,
      valor: parseFloat(valor.replace(',', '.')),
      data,
      repeticao,
      periodicidade: repeticao === 'Recorrente' ? periodicidade : undefined,
      intervaloRepeticao: repeticao === 'Recorrente' ? parseInt(intervaloRepeticao) : undefined,
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
      {/* Cabeçalho */}
      <div className="flex items-center justify-between p-4 border-b">
        <FormControl variant="standard" sx={{
          minWidth: 150,
          '& .MuiSelect-select': { color: '#1D3557', fontWeight: 'bold' }
        }}>
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
      </div>

      {/* Conteúdo do modal */}
      <div className="p-6 space-y-6">
        {/* Primeira linha: Valor, Data, Repetição */}
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
              <InputLabel sx={{ color: '#1D3557' }} shrink={!!repeticao || undefined}>Repetição</InputLabel>
              <Select
                value={repeticao}
                onChange={(e) => setRepeticao(e.target.value)}
                sx={{
                  '&:after': { borderBottomColor: '#B59363' }
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
                <MenuItem value="Única">Única</MenuItem>
                <MenuItem value="Parcelado">Parcelado</MenuItem>
                <MenuItem value="Recorrente">Recorrente</MenuItem>
              </Select>
            </FormControl>
            <IconButton size="small" sx={{ mb: 0.5 }}>
              <HelpCircle className="h-4 w-4 text-gray-400" />
            </IconButton>
          </div>
        </div>

        {/* Campos condicionais de recorrência - aparecem quando "Recorrente" é selecionado */}
        {repeticao === 'Recorrente' && (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <FormControl variant="standard" fullWidth>
                <InputLabel sx={{ color: '#1D3557' }} shrink={!!periodicidade || undefined}>
                  Periodicidade *
                </InputLabel>
                <Select
                  value={periodicidade}
                  onChange={(e) => setPeriodicidade(e.target.value)}
                  sx={{
                    '&:after': { borderBottomColor: '#B59363' }
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
                  <MenuItem value="diario">Diário</MenuItem>
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
                sx={{
                  '& .MuiInputLabel-root': { color: '#1D3557' },
                  '& .MuiInput-underline:after': { borderBottomColor: '#B59363' }
                }}
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                className="px-4 py-2 text-sm text-[#B59363] hover:text-white hover:bg-[#B59363] rounded transition-colors border border-[#B59363] hover:border-[#B59363]"
              >
                Personalizar ⚙
              </button>
            </div>
          </div>
        )}

        {/* Segunda linha: Descrição, Conta */}
        <div className="grid grid-cols-2 gap-4">
          <TextField
            variant="standard"
            label="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            fullWidth
            sx={{
              '& .MuiInputLabel-root': { color: '#1D3557' },
              '& .MuiInput-underline:after': { borderBottomColor: '#B59363' }
            }}
          />

          <TextField
            variant="standard"
            label="Conta"
            value={conta}
            onChange={(e) => setConta(e.target.value)}
            fullWidth
            required
            sx={{
              '& .MuiInputLabel-root': { color: '#1D3557' },
              '& .MuiInput-underline:after': { borderBottomColor: '#B59363' }
            }}
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
            sx={{
              '& .MuiInputLabel-root': { color: '#1D3557' },
              '& .MuiInput-underline:after': { borderBottomColor: '#B59363' }
            }}
          />

          <TextField
            variant="standard"
            label="Contato"
            value={contato}
            onChange={(e) => setContato(e.target.value)}
            fullWidth
            sx={{
              '& .MuiInputLabel-root': { color: '#1D3557' },
              '& .MuiInput-underline:after': { borderBottomColor: '#B59363' }
            }}
          />
        </div>

        {/* Quarta linha: Número de documento */}
        <div className="relative">
          <TextField
            variant="standard"
            label="Número de documento"
            value={numeroDocumento}
            onChange={(e) => setNumeroDocumento(e.target.value)}
            fullWidth
            sx={{
              '& .MuiInputLabel-root': { color: '#1D3557' },
              '& .MuiInput-underline:after': { borderBottomColor: '#B59363' }
            }}
          />
          <div className="absolute right-0 bottom-0 text-xs text-gray-400">
            {numeroDocumento.length} / 60
          </div>
        </div>

        {/* Quinta linha: Observações */}
        <div className="relative">
          <TextField
            variant="standard"
            label="Observações"
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

      {/* Botões inferiores */}
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
          <IButtonPrime
            icon={<Save className="h-4 w-4" />}
            variant="gold"
            title="Salvar"
            onClick={handleSave}
            disabled={!valor || !conta || !categoria}
          />

          <IButtonPrime
            icon={<LogOut className="h-4 w-4" />}
            variant="red"
            title="Sair"
            onClick={onClose}
          />
        </div>
      </div>
    </Dialog>
  );
}