import React, { useState } from 'react';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import { Plus, ArrowDownCircle, ArrowUpCircle, ArrowRightLeft } from 'lucide-react';

interface MultiActionButtonProps {
  onAction: (action: 'income' | 'expense' | 'transfer') => void;
}

export function MultiActionButton({ onAction }: MultiActionButtonProps) {
  const [open, setOpen] = useState(false);

  // Ações do SpeedDial
  const actions = [
    { 
      icon: <ArrowRightLeft className="w-5 h-5 text-gray-700" />, 
      name: 'Transferência', 
      action: 'transfer',
      tooltipTitle: 'Nova Transferência'
    },
    { 
      icon: <ArrowUpCircle className="w-5 h-5 text-green-600" />, 
      name: 'Receita', 
      action: 'income',
      tooltipTitle: 'Nova Receita'
    },
    { 
      icon: <ArrowDownCircle className="w-5 h-5 text-red-600" />, 
      name: 'Despesa', 
      action: 'expense',
      tooltipTitle: 'Nova Despesa'
    },
  ];

  return (
    <div className="relative z-50">
      <SpeedDial
        ariaLabel="Novo Lançamento"
        direction="down"
        icon={
          <SpeedDialIcon 
            icon={<Plus className="h-6 w-6 text-white" />} 
            openIcon={<Plus className="h-6 w-6 text-white rotate-45 transform transition-transform" />} 
          />
        }
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open}
        FabProps={{
          sx: {
            bgcolor: '#4D4E48', // Cor principal do botão
            '&:hover': {
              bgcolor: '#2a2a2a', // Hover escuro
            },
            width: 56,
            height: 56,
            boxShadow: '0 6px 20px -6px rgba(0, 0, 0, 0.4)',
          }
        }}
        sx={{
          position: 'absolute',
          top: -12, // Ajuste para alinhar com o topo do elemento pai e expandir para baixo
          right: 0,
          '& .MuiSpeedDialAction-fab': {
            bgcolor: '#ffffff',
            border: '1px solid #f3f4f6',
            '&:hover': {
              bgcolor: '#f9fafb',
            }
          }
        }}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.tooltipTitle}
            onClick={() => {
              onAction(action.action as 'income' | 'expense' | 'transfer');
              setOpen(false);
            }}
            FabProps={{
              sx: {
                width: 48,
                height: 48,
                boxShadow: '0 4px 12px -4px rgba(0,0,0,0.2)',
              }
            }}
          />
        ))}
      </SpeedDial>
    </div>
  );
}
