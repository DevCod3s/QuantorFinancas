/**
 * @fileoverview Modal para criação de novos lançamentos financeiros
 * Componente baseado no layout de referência com Material UI
 * Suporta criação de receitas (À Receber) e despesas (À Pagar)
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Box,
  Typography,
  InputAdornment
} from '@mui/material';
import { X, Calendar, Check, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function TransactionModal({ open, onClose, onSave }: TransactionModalProps) {
  const [formData, setFormData] = useState({
    tipo: '', // 'Receita' ou 'Despesa'
    valor: '',
    data: new Date().toLocaleDateString('pt-BR'),
    repeticao: 'Única',
    descricao: '',
    conta: '',
    categoria: '',
    contato: '',
    numeroDocumento: '',
    observacoes: '',
    tags: ''
  });

  // Mock de contas bancárias - depois será integrado com dados reais
  const contasBancarias = [
    'Banco Inter',
    'Banco do Brasil',
    'Caixa Econômica',
    'Nubank',
    'Santander'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCurrency = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Converte para formato de moeda brasileira
    const formatted = (parseFloat(numbers) / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    return numbers ? formatted : '0,00';
  };

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const formattedValue = formatCurrency(value);
    handleInputChange('valor', formattedValue);
  };

  const handleSave = () => {
    if (!formData.tipo || !formData.valor || !formData.conta) {
      alert('Preencha os campos obrigatórios: Tipo, Valor e Conta');
      return;
    }

    const transactionData = {
      ...formData,
      // Converter valor formatado para número
      valorNumerico: parseFloat(formData.valor.replace(/\./g, '').replace(',', '.'))
    };

    onSave(transactionData);
    onClose();
    
    // Reset form
    setFormData({
      tipo: '',
      valor: '',
      data: new Date().toLocaleDateString('pt-BR'),
      repeticao: 'Única',
      descricao: '',
      conta: '',
      categoria: '',
      contato: '',
      numeroDocumento: '',
      observacoes: '',
      tags: ''
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '600px'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 2
      }}>
        <FormControl variant="standard" sx={{ minWidth: 200 }}>
          <InputLabel>Novo lançamento</InputLabel>
          <Select
            value={formData.tipo}
            onChange={(e) => handleInputChange('tipo', e.target.value)}
            label="Novo lançamento"
          >
            <MenuItem value="Receita">Receita</MenuItem>
            <MenuItem value="Despesa">Despesa</MenuItem>
          </Select>
        </FormControl>
        
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Primeira linha: Valor, Data, Repetição */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField
                fullWidth
                variant="standard"
                label="Valor (R$)"
                value={formData.valor}
                onChange={handleValueChange}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
              />
            </Box>
            
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField
                fullWidth
                variant="standard"
                label="Data"
                value={formData.data}
                onChange={(e) => handleInputChange('data', e.target.value)}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Calendar size={18} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <FormControl fullWidth variant="standard">
                <InputLabel>Repetição</InputLabel>
                <Select
                  value={formData.repeticao}
                  onChange={(e) => handleInputChange('repeticao', e.target.value)}
                  label="Repetição"
                >
                  <MenuItem value="Única">Única</MenuItem>
                  <MenuItem value="Parcelada">Parcelada</MenuItem>
                  <MenuItem value="Recorrente">Recorrente</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Segunda linha: Descrição, Conta */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: '250px' }}>
              <TextField
                fullWidth
                variant="standard"
                label="Descrição"
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value.slice(0, 30))}
                inputProps={{ maxLength: 30 }}
                helperText={`${formData.descricao.length}/30`}
              />
            </Box>
            
            <Box sx={{ flex: 1, minWidth: '250px' }}>
              <FormControl fullWidth variant="standard" required>
                <InputLabel>Conta</InputLabel>
                <Select
                  value={formData.conta}
                  onChange={(e) => handleInputChange('conta', e.target.value)}
                  label="Conta"
                >
                  {contasBancarias.map((conta) => (
                    <MenuItem key={conta} value={conta}>
                      {conta}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Terceira linha: Categoria, Contato */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: '250px' }}>
              <TextField
                fullWidth
                variant="standard"
                label="Categoria"
                value={formData.categoria}
                onChange={(e) => handleInputChange('categoria', e.target.value)}
                disabled
                helperText="Campo será implementado posteriormente"
              />
            </Box>
            
            <Box sx={{ flex: 1, minWidth: '250px' }}>
              <TextField
                fullWidth
                variant="standard"
                label="Contato"
                value={formData.contato}
                onChange={(e) => handleInputChange('contato', e.target.value)}
                disabled
                helperText="Campo será implementado posteriormente"
              />
            </Box>
          </Box>

          {/* Quarta linha: Número de documento */}
          <Box>
            <TextField
              fullWidth
              variant="standard"
              label="Número de documento"
              value={formData.numeroDocumento}
              onChange={(e) => handleInputChange('numeroDocumento', e.target.value)}
              disabled
              helperText="0 / 60 - Campo será implementado posteriormente"
            />
          </Box>

          {/* Quinta linha: Observações */}
          <Box>
            <TextField
              fullWidth
              variant="standard"
              label="Observações"
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              multiline
              rows={2}
              disabled
              helperText="0 / 400 - Campo será implementado posteriormente"
            />
          </Box>

          {/* Sexta linha: Tags */}
          <Box>
            <TextField
              fullWidth
              variant="standard"
              label="Tags"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              disabled
              helperText="Campo será implementado posteriormente"
            />
          </Box>
        </Box>

        {/* Botões de ação */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-start', 
          gap: 2, 
          mt: 4,
          pt: 2
        }}>
          <Button
            variant="contained"
            startIcon={<Check size={16} />}
            onClick={handleSave}
            sx={{
              backgroundColor: '#4caf50',
              '&:hover': {
                backgroundColor: '#45a049'
              },
              borderRadius: '50px',
              px: 3
            }}
          >
            Salvar
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Plus size={16} />}
            onClick={() => {
              handleSave();
              // Manter modal aberto para novo lançamento
            }}
            sx={{
              borderColor: '#2196f3',
              color: '#2196f3',
              '&:hover': {
                borderColor: '#1976d2',
                backgroundColor: 'rgba(33, 150, 243, 0.04)'
              },
              borderRadius: '50px',
              px: 3
            }}
          >
            Salvar e Continuar
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}