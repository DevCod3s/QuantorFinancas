/**
 * @fileoverview Modal de transações para lançamentos financeiros
 * Componente responsável por criar e editar transações (receitas/despesas)
 * com formulário completo e integração com Material-UI
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
  MenuItem
} from '@mui/material';
import { X } from 'lucide-react';

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (transaction: any) => void;
}

/**
 * Modal para criação de novas transações financeiras
 * Permite registro de receitas e despesas com campos completos
 */
export function TransactionModal({ open, onClose, onSave }: TransactionModalProps) {
  const [tipo, setTipo] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');
  const [repeticao, setRepeticao] = useState('');
  const [descricao, setDescricao] = useState('');
  const [conta, setConta] = useState('');

  const handleSave = () => {
    const transaction = {
      tipo,
      valor: parseFloat(valor),
      data,
      repeticao,
      descricao,
      conta
    };
    
    onSave(transaction);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTipo('');
    setValor('');
    setData('');
    setRepeticao('');
    setDescricao('');
    setConta('');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{ 
        zIndex: 9999,
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }
      }}
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: '600px',
          maxHeight: '90vh',
          overflow: 'visible'
        }
      }}
    >
      {/* Cabeçalho com X para fechar */}
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-800">
          Novo Lançamento
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Conteúdo do modal */}
      <div className="p-6 space-y-6">
        {/* Tipo */}
        <FormControl variant="standard" fullWidth>
          <InputLabel id="tipo-label">Tipo</InputLabel>
          <Select
            labelId="tipo-label"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <MenuItem value="receita">Receita</MenuItem>
            <MenuItem value="despesa">Despesa</MenuItem>
          </Select>
        </FormControl>

        {/* Valor */}
        <TextField
          variant="standard"
          label="Valor"
          type="number"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: <span style={{ marginRight: 8, color: '#666' }}>R$</span>
          }}
        />

        {/* Data */}
        <TextField
          variant="standard"
          label="Data"
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
        />

        {/* Repetição */}
        <FormControl variant="standard" fullWidth>
          <InputLabel id="repeticao-label">Repetição</InputLabel>
          <Select
            labelId="repeticao-label"
            value={repeticao}
            onChange={(e) => setRepeticao(e.target.value)}
          >
            <MenuItem value="unica">Única</MenuItem>
            <MenuItem value="mensal">Mensal</MenuItem>
            <MenuItem value="semanal">Semanal</MenuItem>
            <MenuItem value="anual">Anual</MenuItem>
          </Select>
        </FormControl>

        {/* Descrição */}
        <TextField
          variant="standard"
          label="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          fullWidth
          multiline
          rows={2}
        />

        {/* Conta */}
        <FormControl variant="standard" fullWidth>
          <InputLabel id="conta-label">Conta</InputLabel>
          <Select
            labelId="conta-label"
            value={conta}
            onChange={(e) => setConta(e.target.value)}
          >
            <MenuItem value="conta-corrente">Conta Corrente</MenuItem>
            <MenuItem value="poupanca">Poupança</MenuItem>
            <MenuItem value="cartao-credito">Cartão de Crédito</MenuItem>
          </Select>
        </FormControl>
      </div>

      {/* Botões */}
      <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={!tipo || !valor || !data}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded transition-colors"
        >
          Salvar
        </button>
      </div>
    </Dialog>
  );
}