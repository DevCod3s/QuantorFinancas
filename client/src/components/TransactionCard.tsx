/**
 * @fileoverview Card de transações para lançamentos financeiros
 * Componente responsável por criar e editar transações (receitas/despesas)
 * com formulário completo em formato de card elevado
 * 
 * @author Sistema Quantor
 * @version 1.0.0
 * @since Janeiro 2025
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Button,
  Box
} from '@mui/material';
import { X, Check, CheckCheck, Paperclip, Plus, HelpCircle } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";

interface TransactionCardProps {
  open: boolean;
  onClose: () => void;
  onSave: (transaction: any) => void;
}

/**
 * Card para criação de novas transações financeiras
 * Layout baseado na imagem de referência com campos organizados em grid
 */
export function TransactionCard({ open, onClose, onSave }: TransactionCardProps) {
  const [tipo, setTipo] = useState('Nova receita');
  const [valor, setValor] = useState('0,00');
  const [data, setData] = useState('25/07/2025');
  const [repeticao, setRepeticao] = useState('');
  const [descricao, setDescricao] = useState('');
  const [conta, setConta] = useState('');
  const [categoria, setCategoria] = useState('');
  const [contato, setContato] = useState('');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [tags, setTags] = useState('');

  // Buscar contas cadastradas no sistema
  const { data: accounts = [] } = useQuery<any[]>({
    queryKey: ['/api/chart-accounts'],
    enabled: open
  });

  // Buscar relacionamentos cadastrados (mock por enquanto - será implementado)
  const relationships = [
    { id: 1, name: 'Cliente ABC Ltda' },
    { id: 2, name: 'Fornecedor XYZ S.A.' },
    { id: 3, name: 'João Silva' },
    { id: 4, name: 'Empresa DEF' }
  ];

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
      valor: parseFloat(valor.replace(/[R$\s.,]/g, '').replace(',', '.')) / 100,
      data,
      repeticao,
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

  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1300,
        p: 2
      }}
      onClick={onClose}
    >
      <Card
        onClick={(e) => e.stopPropagation()}
        sx={{
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          borderRadius: 3,
          border: '1px solid #e0e0e0'
        }}
      >
        {/* Cabeçalho */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, borderBottom: '1px solid #e0e0e0' }}>
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
                  sx: { zIndex: 1400 }
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
        </Box>

        <CardContent sx={{ p: 4, space: 3 }}>
          {/* Primeira linha: Valor, Data, Repetição */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3, mb: 4 }}>
            <TextField
              variant="standard"
              label="Valor (R$)"
              value={valor}
              onChange={handleValorChange}
              fullWidth
              required
              sx={{ '& .MuiInputLabel-root': { color: '#666' } }}
            />
            
            <TextField
              variant="standard"
              label="Dados"
              type="date"
              value="2025-07-25"
              onChange={(e) => setData(e.target.value)}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiInputLabel-root': { color: '#666' } }}
            />
            
            <Box sx={{ display: 'flex', alignItems: 'end', gap: 1 }}>
              <FormControl variant="standard" fullWidth>
                <InputLabel sx={{ color: '#666' }} shrink={!!repeticao || undefined}>Repetição</InputLabel>
                <Select
                  value={repeticao}
                  onChange={(e) => setRepeticao(e.target.value)}
                  MenuProps={{
                    PaperProps: {
                      sx: { zIndex: 1400 }
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
            </Box>
          </Box>

          {/* Segunda linha: Descrição, Conta */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 4 }}>
            <TextField
              variant="standard"
              label="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              fullWidth
              sx={{ '& .MuiInputLabel-root': { color: '#666' } }}
            />
            
            <FormControl variant="standard" fullWidth>
              <InputLabel sx={{ color: '#666' }} shrink={!!conta || undefined}>Conta</InputLabel>
              <Select
                value={conta}
                onChange={(e) => setConta(e.target.value)}
                MenuProps={{
                  PaperProps: {
                    sx: { zIndex: 1400 }
                  }
                }}
              >
                {accounts.map((account: any) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.code} - {account.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Terceira linha: Categoria, Contato */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 4 }}>
            <TextField
              variant="standard"
              label="Categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              fullWidth
              required
              sx={{ '& .MuiInputLabel-root': { color: '#666' } }}
            />
            
            <FormControl variant="standard" fullWidth>
              <InputLabel sx={{ color: '#666' }} shrink={!!contato || undefined}>Contato</InputLabel>
              <Select
                value={contato}
                onChange={(e) => setContato(e.target.value)}
                MenuProps={{
                  PaperProps: {
                    sx: { zIndex: 1400 }
                  }
                }}
              >
                {relationships.map((relationship) => (
                  <MenuItem key={relationship.id} value={relationship.id}>
                    {relationship.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Quarta linha: Número do documento */}
          <Box sx={{ mb: 4 }}>
            <TextField
              variant="standard"
              label="Número do documento"
              value={numeroDocumento}
              onChange={(e) => setNumeroDocumento(e.target.value)}
              fullWidth
              sx={{ 
                '& .MuiInputLabel-root': { color: '#666' },
                '& .MuiInput-root': { 
                  '&::after': { 
                    content: '"0 / 60"',
                    position: 'absolute',
                    right: 0,
                    bottom: -20,
                    fontSize: '12px',
                    color: '#999'
                  }
                }
              }}
            />
          </Box>

          {/* Quinta linha: Observações */}
          <Box sx={{ mb: 4 }}>
            <TextField
              variant="standard"
              label="Observações"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              fullWidth
              multiline
              rows={3}
              sx={{ 
                '& .MuiInputLabel-root': { color: '#666' },
                '& .MuiInput-root': { 
                  '&::after': { 
                    content: '"0 / 400"',
                    position: 'absolute',
                    right: 0,
                    bottom: -20,
                    fontSize: '12px',
                    color: '#999'
                  }
                }
              }}
            />
          </Box>

          {/* Sexta linha: Etiquetas */}
          <Box sx={{ mb: 4 }}>
            <TextField
              variant="standard"
              label="Etiquetas"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              fullWidth
              sx={{ '& .MuiInputLabel-root': { color: '#666' } }}
            />
          </Box>

          {/* Botões de ação */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton 
                sx={{ 
                  backgroundColor: '#4caf50',
                  color: 'white',
                  '&:hover': { backgroundColor: '#45a049' }
                }}
                onClick={handleSave}
              >
                <Check className="h-4 w-4" />
              </IconButton>
              <IconButton 
                sx={{ 
                  backgroundColor: '#2196f3',
                  color: 'white',
                  '&:hover': { backgroundColor: '#1976d2' }
                }}
              >
                <CheckCheck className="h-4 w-4" />
              </IconButton>
              <IconButton 
                sx={{ 
                  backgroundColor: '#607d8b',
                  color: 'white',
                  '&:hover': { backgroundColor: '#546e7a' }
                }}
              >
                <Paperclip className="h-4 w-4" />
              </IconButton>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleSave}
                sx={{
                  backgroundColor: '#90a4ae',
                  color: 'white',
                  '&:hover': { backgroundColor: '#78909c' },
                  textTransform: 'none'
                }}
              >
                Salvar
              </Button>
              <IconButton
                sx={{
                  backgroundColor: '#607d8b',
                  color: 'white',
                  '&:hover': { backgroundColor: '#546e7a' }
                }}
              >
                <Plus className="h-4 w-4" />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}