import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Autocomplete
} from '@mui/material';
import { Save, LogOut } from 'lucide-react';
import { DateInput } from './DateInput';
import { IButtonPrime } from './ui/i-ButtonPrime';
import { localDateStr } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";

interface TransactionTransferModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (transferData: any) => Promise<void>;
  bankAccounts: any[];
}

export function TransactionTransferModal({ open, onClose, onSave, bankAccounts }: TransactionTransferModalProps) {
  const { toast } = useToast();
  
  const [valor, setValor] = useState('');
  const [data, setData] = useState(localDateStr());
  const [sourceAccount, setSourceAccount] = useState('');
  const [destinationAccount, setDestinationAccount] = useState('');
  const [descricao, setDescricao] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formatação de moeda brasileira para input
  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/\D/g, '');
    const number = parseInt(value) / 100;
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

  const handleSave = async () => {
    if (!valor || !sourceAccount || !destinationAccount || !descricao || !data) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos da transferência.",
        variant: "destructive",
      });
      return;
    }

    if (sourceAccount === destinationAccount) {
      toast({
        title: "Contas iguais",
        description: "A conta de origem e destino não podem ser as mesmas.",
        variant: "destructive",
      });
      return;
    }

    // Convert valor formatado (ex: R$ 1.500,00) para numero decimal
    const valorNumerico = parseFloat(valor.replace(/[R$\s.]/g, '').replace(',', '.'));
    
    if (valorNumerico <= 0) {
      toast({
        title: "Valor inválido",
        description: "A transferência precisa ter um valor maior que zero.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      amount: valorNumerico,
      date: data,
      sourceAccountId: parseInt(sourceAccount),
      destinationAccountId: parseInt(destinationAccount),
      description: descricao
    };

    setIsSubmitting(true);
    try {
      await onSave(payload);
      
      // Limpar campos
      setValor('');
      setSourceAccount('');
      setDestinationAccount('');
      setDescricao('');
      setData(localDateStr());
      
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
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
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
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
        <h2 className="text-lg font-bold text-gray-900">Nova Transferência</h2>
      </Box>

      {/* Conteúdo */}
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
          <TextField
            variant="standard"
            label="Valor (R$)"
            value={valor}
            onChange={handleValorChange}
            fullWidth
            required
            sx={{ '& .MuiInputLabel-root': { color: '#666' } }}
          />
          <DateInput
            label="Data de Transferência"
            value={data}
            onChange={setData}
            required
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
          <FormControl variant="standard" fullWidth required>
            <InputLabel sx={{ color: '#1D3557' }}>Conta Origem</InputLabel>
            <Autocomplete
              options={bankAccounts}
              getOptionLabel={(acc: any) => `${acc.name || 'Conta'} (${acc.bank || 'Banco'} - Cc: ${acc.accountNumber || 'S/N'})`}
              value={bankAccounts.find((a: any) => a.id.toString() === sourceAccount.toString()) || null}
              onChange={(_, newValue: any) => setSourceAccount(newValue ? newValue.id.toString() : '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  sx={{ '& .MuiInput-underline:after': { borderBottomColor: '#B59363' } }}
                />
              )}
              componentsProps={{ paper: { sx: { zIndex: 1400 } } }}
            />
          </FormControl>

          <FormControl variant="standard" fullWidth required>
            <InputLabel sx={{ color: '#1D3557' }}>Conta Destino</InputLabel>
            <Autocomplete
              options={bankAccounts}
              getOptionLabel={(acc: any) => `${acc.name || 'Conta'} (${acc.bank || 'Banco'} - Cc: ${acc.accountNumber || 'S/N'})`}
              value={bankAccounts.find((a: any) => a.id.toString() === destinationAccount.toString()) || null}
              onChange={(_, newValue: any) => setDestinationAccount(newValue ? newValue.id.toString() : '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  sx={{ '& .MuiInput-underline:after': { borderBottomColor: '#B59363' } }}
                />
              )}
              componentsProps={{ paper: { sx: { zIndex: 1400 } } }}
            />
          </FormControl>
        </Box>

        <Box sx={{ mb: 2 }}>
          <TextField
            variant="standard"
            label="Descrição / Histórico"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            fullWidth
            required
            sx={{
              '& .MuiInputLabel-root': { color: '#1D3557' },
              '& .MuiInput-underline:after': { borderBottomColor: '#B59363' }
            }}
          />
        </Box>
      </CardContent>

      {/* Botões inferiores */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', p: 3, pt: 2, borderTop: '1px solid #e0e0e0', gap: 1 }}>
        <IButtonPrime
          icon={<Save className="h-4 w-4" />}
          variant="gold"
          title={isSubmitting ? "Salvando..." : "Salvar"}
          onClick={handleSave}
          disabled={!valor || !sourceAccount || !destinationAccount || isSubmitting}
        />
        <IButtonPrime
          icon={<LogOut className="h-4 w-4" />}
          variant="red"
          title="Sair"
          onClick={onClose}
          disabled={isSubmitting}
        />
      </Box>
      </Card>
    </Box>
  );
}
