import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { X, Save, LogOut } from 'lucide-react';
import { DateInput } from './DateInput';
import { IButtonPrime } from './ui/i-ButtonPrime';

interface SimpleTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function SimpleTransactionModal({ open, onClose, onSave }: SimpleTransactionModalProps) {
  const [tipo, setTipo] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [repeticao, setRepeticao] = useState('Única');
  const [descricao, setDescricao] = useState('');
  const [conta, setConta] = useState('');

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

    // Limpar formulário
    setTipo('');
    setValor('');
    setData(new Date().toISOString().split('T')[0]);
    setRepeticao('Única');
    setDescricao('');
    setConta('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogTitle>
          <span className="text-xl font-bold text-[#1D3557]">Novo Lançamento</span>
        </DialogTitle>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Tipo *</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B59363]"
              >
                <option value="">Selecione...</option>
                <option value="Receita">Receita</option>
                <option value="Despesa">Despesa</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Valor (R$) *</label>
              <Input
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
              />
            </div>

            <div>
              <DateInput
                label="Data"
                value={data}
                onChange={setData}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Repetição</label>
              <select
                value={repeticao}
                onChange={(e) => setRepeticao(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B59363]"
              >
                <option value="Única">Única</option>
                <option value="Parcelada">Parcelada</option>
                <option value="Recorrente">Recorrente</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Conta *</label>
              <select
                value={conta}
                onChange={(e) => setConta(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B59363]"
              >
                <option value="">Selecione...</option>
                <option value="Banco Inter">Banco Inter</option>
                <option value="Banco do Brasil">Banco do Brasil</option>
                <option value="Caixa Econômica">Caixa Econômica</option>
                <option value="Nubank">Nubank</option>
                <option value="Santander">Santander</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Descrição</label>
            <Input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value.slice(0, 30))}
              placeholder="Descrição do lançamento..."
              maxLength={30}
            />
            <div className="text-xs text-gray-500 mt-1">{descricao.length}/30</div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <IButtonPrime
              icon={<Save className="h-4 w-4" />}
              variant="gold"
              title="Salvar"
              onClick={handleSave}
            />
            <IButtonPrime
              icon={<LogOut className="h-4 w-4" />}
              variant="red"
              title="Sair"
              onClick={onClose}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}