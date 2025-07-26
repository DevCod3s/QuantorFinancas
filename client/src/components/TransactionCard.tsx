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
import { X, Check, CheckCheck, Paperclip, Plus, HelpCircle, CreditCard, Users, Building2, BookOpen } from 'lucide-react';
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

  // Buscar contas bancárias cadastradas no sistema
  const { data: bankAccounts = [] } = useQuery<any[]>({
    queryKey: ['/api/bank-accounts'],
    enabled: open
  });

  // Buscar relacionamentos cadastrados no sistema  
  const { data: relationships = [] } = useQuery<any[]>({
    queryKey: ['/api/relationships'],
    enabled: open
  });

  // Buscar categorias de negócios
  const { data: businessCategories = [] } = useQuery<any[]>({
    queryKey: ['/api/categories'],
    enabled: open
  });

  // Buscar plano de contas filtrado por tipo
  const { data: chartOfAccounts = [] } = useQuery<any[]>({
    queryKey: ['/api/chart-accounts'],
    enabled: open
  });

  // Filtrar plano de contas baseado no tipo selecionado
  const filteredChartOfAccounts = chartOfAccounts.filter((account: any) => {
    if (tipo === 'Nova receita') {
      return account.name?.toLowerCase().includes('receita') || account.type === 'income';
    } else if (tipo === 'Nova despesa') {
      return account.name?.toLowerCase().includes('despesa') || account.type === 'expense';
    }
    return true;
  });

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
            
            <Box sx={{ display: 'flex', alignItems: 'end', gap: 1 }}>
              <FormControl variant="standard" sx={{ flexGrow: 1 }}>
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
                  {bankAccounts.map((account: any) => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.bank} - {account.accountNumber}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {bankAccounts.length === 0 && (
                <IconButton 
                  size="small" 
                  sx={{ mb: 0.5, color: '#1976d2' }}
                  onClick={() => {/* Função para adicionar conta bancária */}}
                >
                  <CreditCard className="h-4 w-4" />
                </IconButton>
              )}
            </Box>
          </Box>

          {/* Terceira linha: Categoria, Contato */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'end', gap: 1 }}>
              <FormControl variant="standard" sx={{ flexGrow: 1 }}>
                <InputLabel sx={{ color: '#666' }} shrink={!!categoria || undefined}>Categoria</InputLabel>
                <Select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  MenuProps={{
                    PaperProps: {
                      sx: { zIndex: 1400 }
                    }
                  }}
                >
                  {businessCategories.map((category: any) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {businessCategories.length === 0 && (
                <IconButton 
                  size="small" 
                  sx={{ mb: 0.5, color: '#1976d2' }}
                  onClick={() => {/* Função para adicionar categoria */}}
                >
                  <Building2 className="h-4 w-4" />
                </IconButton>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'end', gap: 1 }}>
              <FormControl variant="standard" sx={{ flexGrow: 1 }}>
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
                  {relationships.map((relationship: any) => (
                    <MenuItem key={relationship.id} value={relationship.id}>
                      {relationship.name || relationship.companyName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {relationships.length === 0 && (
                <IconButton 
                  size="small" 
                  sx={{ mb: 0.5, color: '#1976d2' }}
                  onClick={() => {/* Função para adicionar relacionamento */}}
                >
                  <Users className="h-4 w-4" />
                </IconButton>
              )}
            </Box>
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

          {/* Sexta linha: Plano de Contas */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'end', gap: 1 }}>
              <FormControl variant="standard" sx={{ flexGrow: 1 }}>
                <InputLabel sx={{ color: '#666' }} shrink={!!tags || undefined}>Plano de Contas</InputLabel>
                <Select
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  MenuProps={{
                    PaperProps: {
                      sx: { zIndex: 1400 }
                    }
                  }}
                >
                  {filteredChartOfAccounts.map((account: any) => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.code} - {account.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {filteredChartOfAccounts.length === 0 && (
                <IconButton 
                  size="small" 
                  sx={{ mb: 0.5, color: '#1976d2' }}
                  onClick={() => {/* Função para adicionar plano de contas */}}
                >
                  <BookOpen className="h-4 w-4" />
                </IconButton>
              )}
            </Box>
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