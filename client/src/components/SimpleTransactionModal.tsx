import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from 'lucide-react';
import { DateInput } from './DateInput';

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
  const [numeroParcelas, setNumeroParcelas] = useState('2');
  const [descricao, setDescricao] = useState('');
  const [conta, setConta] = useState('');

  const handleSave = () => {
    if (!tipo || !valor || !conta) {
      alert('Preencha os campos obrigatórios: Tipo, Valor e Conta');
      return;
    }

    // Calcula valor por parcela
    const valorNum = parseFloat(valor.replace(',', '.')) || 0;
    const numParc = parseInt(numeroParcelas) || 1;
    const valorParc = numParc > 0 ? (valorNum / numParc) : valorNum;

    const transactionData = {
      tipo,
      valor: valorNum,
      data,
      repeticao,
      numeroParcelas: repeticao === 'Parcelado' ? parseInt(numeroParcelas) : undefined,
      valorParcela: repeticao === 'Parcelado' ? valorParc : undefined,
      descricao,
      conta,
      valorNumerico: valorNum
    };

    onSave(transactionData);
    onClose();

    // Limpar formulário
    setTipo('');
    setValor('');
    setData(new Date().toISOString().split('T')[0]);
    setRepeticao('Única');
    setNumeroParcelas('2');
    setDescricao('');
    setConta('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogTitle className="flex items-center justify-between">
          <span>Novo Lançamento</span>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-4 w-4" />
          </button>
        </DialogTitle>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Tipo *</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Única">Única</option>
                <option value="Parcelado">Parcelado</option>
                <option value="Recorrente">Recorrente</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Conta *</label>
              <select
                value={conta}
                onChange={(e) => setConta(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          {/* Campos condicionais de parcelamento */}
          {repeticao === 'Parcelado' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nº de Parcelas *</label>
                <Input
                  type="number"
                  value={numeroParcelas}
                  onChange={(e) => setNumeroParcelas(e.target.value)}
                  min={2}
                  max={360}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Valor por Parcela</label>
                <Input
                  readOnly
                  value={(() => {
                    const v = parseFloat(valor.replace(',', '.')) || 0;
                    const n = parseInt(numeroParcelas) || 1;
                    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v / n);
                  })()}
                  className="bg-gray-50 text-blue-600 font-medium"
                />
              </div>
            </div>
          )}

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

          <div className="flex justify-start gap-2 pt-4">
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              Salvar
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}