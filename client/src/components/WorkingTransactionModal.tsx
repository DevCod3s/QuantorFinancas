import { useState } from 'react';
import { X } from 'lucide-react';

interface WorkingTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function WorkingTransactionModal({ open, onClose, onSave }: WorkingTransactionModalProps) {
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

  if (!open) return null;

  return (
    <>
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">Novo Lançamento</h2>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Row 1: Tipo, Valor, Data */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo *
                </label>
                <select 
                  value={tipo} 
                  onChange={(e) => setTipo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione...</option>
                  <option value="Receita">Receita</option>
                  <option value="Despesa">Despesa</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor (R$) *
                </label>
                <input
                  type="text"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="0,00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data
                </label>
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            {/* Row 2: Repetição, Conta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Repetição
                </label>
                <select 
                  value={repeticao} 
                  onChange={(e) => setRepeticao(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Única">Única</option>
                  <option value="Parcelada">Parcelada</option>
                  <option value="Recorrente">Recorrente</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conta *
                </label>
                <select 
                  value={conta} 
                  onChange={(e) => setConta(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            
            {/* Row 3: Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <input
                type="text"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value.slice(0, 30))}
                placeholder="Descrição do lançamento..."
                maxLength={30}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="text-xs text-gray-500 mt-1">{descricao.length}/30</div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex justify-start gap-3 p-6 pt-4 border-t bg-gray-50">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors font-medium"
            >
              Salvar
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}