/**
 * @fileoverview Modal para criação de novos lançamentos financeiros
 * Componente funcional baseado no layout de referência 
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
  Box
} from '@mui/material';
import { X, Check } from 'lucide-react';

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function TransactionModal({ open, onClose, onSave }: TransactionModalProps) {
  const [tipo, setTipo] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [repeticao, setRepeticao] = useState('Única');
  const [descricao, setDescricao] = useState('');
  const [conta, setConta] = useState('');

  const contasBancarias = [
    'Banco Inter',
    'Banco do Brasil', 
    'Caixa Econômica',
    'Nubank',
    'Santander'
  ];

  const handleSave = () => {
    if (!tipo || !valor || !conta) {
      alert('Preencha os campos obrigatórios: Tipo, Valor e Conta');
      return;
    }

    const transactionData = {
      tipo,
      valor: parseFloat(valor.replace(',', '.')),
      data,
      repeticao,
      descricao,
      conta,
      valorNumerico: parseFloat(valor.replace(',', '.'))
    };

    onSave(transactionData);
    onClose();
    
    // Reset form
    setTipo('');
    setValor('');
    setData(new Date().toISOString().split('T')[0]);
    setRepeticao('Única');
    setDescricao('');
    setConta('');
  };

  // Debug log
  console.log('TransactionModal render - open:', open);

  // Force render test
  if (open) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          minWidth: '500px',
          maxHeight: '80vh',
          overflow: 'auto'
        }}>
          <h2>Novo Lançamento (Teste)</h2>
          <p>Se você está vendo isso, o estado está funcionando!</p>
          <button onClick={onClose} style={{
            padding: '10px 20px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{ zIndex: 9999 }}
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '500px'
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
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
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
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                required
                placeholder="0,00"
              />
            </Box>
            
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField
                fullWidth
                variant="standard"
                label="Data"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <FormControl fullWidth variant="standard">
                <InputLabel>Repetição</InputLabel>
                <Select
                  value={repeticao}
                  onChange={(e) => setRepeticao(e.target.value)}
                  label="Repetição"
                >
                  <MenuItem value="Única">Única</MenuItem>
                  <MenuItem value="Parcelada">Parcelada</MenuItem>
                  <MenuItem value="Recorrente">Recorrente</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Segunda linha: Descrição */}
          <Box>
            <TextField
              fullWidth
              variant="standard"
              label="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value.slice(0, 30))}
              helperText={`${descricao.length}/30 caracteres`}
              placeholder="Descrição do lançamento..."
            />
          </Box>

          {/* Terceira linha: Conta */}
          <Box>
            <FormControl fullWidth variant="standard" required>
              <InputLabel>Conta</InputLabel>
              <Select
                value={conta}
                onChange={(e) => setConta(e.target.value)}
                label="Conta"
              >
                {contasBancarias.map((banco) => (
                  <MenuItem key={banco} value={banco}>
                    {banco}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
            onClick={onClose}
            sx={{
              borderColor: '#666',
              color: '#666',
              '&:hover': {
                borderColor: '#333',
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              },
              borderRadius: '50px',
              px: 3
            }}
          >
            Cancelar
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}