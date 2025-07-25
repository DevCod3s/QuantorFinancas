import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from 'lucide-react';

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
    
    // Reset form
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
        <DialogTitle className="flex items-center justify-between">
          <span>Novo Lançamento</span>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-4 w-4" />
          </button>
        </DialogTitle>
        
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="tipo">Tipo *</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Receita">Receita</SelectItem>
                  <SelectItem value="Despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="valor">Valor (R$) *</Label>
              <Input
                id="valor"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
              />
            </div>
            
            <div>
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="repeticao">Repetição</Label>
              <Select value={repeticao} onValueChange={setRepeticao}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Única">Única</SelectItem>
                  <SelectItem value="Parcelada">Parcelada</SelectItem>
                  <SelectItem value="Recorrente">Recorrente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="conta">Conta *</Label>
              <Select value={conta} onValueChange={setConta}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Banco Inter">Banco Inter</SelectItem>
                  <SelectItem value="Banco do Brasil">Banco do Brasil</SelectItem>
                  <SelectItem value="Caixa Econômica">Caixa Econômica</SelectItem>
                  <SelectItem value="Nubank">Nubank</SelectItem>
                  <SelectItem value="Santander">Santander</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
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