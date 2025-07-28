/**
 * @fileoverview Página principal de Finanças do sistema Quantor
 * Implementa sistema de abas completo para gestão financeira com modal de contas bancárias
 * @version 2.0
 * @author Sistema Quantor
 * @date Janeiro 2025
 */

import React, { useState } from 'react';
import { Plus, X, Save, Edit, Eye, Trash2, ArrowUpDown } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

// Componente da aba Visão Geral
const OverviewSection = () => {
  return (
    <div className="space-y-6">
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Visão Geral Financeira</h3>
        <p className="text-gray-600">Dashboard com métricas e relatórios será implementado aqui</p>
      </div>
    </div>
  );
};

// Componente da aba Movimentações
const MovementsSection = () => {
  return (
    <div className="space-y-6">
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Movimentações Financeiras</h3>
        <p className="text-gray-600">Transações e lançamentos serão exibidos aqui</p>
      </div>
    </div>
  );
};

// Componente da aba Contas
const AccountsSection = ({ onOpenBankAccountModal }: { onOpenBankAccountModal: () => void }) => {
  return (
    <div className="space-y-6">
      {/* Header com botão + */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Contas Bancárias</h3>
          <p className="text-sm text-gray-600">Gerencie suas contas bancárias</p>
        </div>
        
        {/* Botão + para abrir modal */}
        <button
          onClick={onOpenBankAccountModal}
          className="w-11 h-11 bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
                     active:scale-95 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 
                     flex items-center justify-center group"
          title="Adicionar nova conta bancária"
        >
          <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      {/* Lista de contas */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6">
          <p className="text-gray-500 text-center">Nenhuma conta bancária cadastrada</p>
        </div>
      </div>
    </div>
  );
};

// Componente da aba Centro de Custo
const CostCenterSection = () => {
  return (
    <div className="space-y-6">
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Centro de Custo</h3>
        <p className="text-gray-600">Categorização de gastos será implementada aqui</p>
      </div>
    </div>
  );
};

// Componente principal da página Transactions
export function Transactions() {
  // Estados do componente principal
  const [activeTab, setActiveTab] = useState('contas'); // Começar na aba contas para testar
  const [bankAccountModalOpen, setBankAccountModalOpen] = useState(false);
  const [bankAccountData, setBankAccountData] = useState({
    initialBalanceDate: new Date().toISOString().split('T')[0],
    currentBalance: '',
    balanceType: 'credor',
    accountType: 'conta_corrente',
    name: '',
    currency: 'BRL',
    bank: '',
    agency: '',
    accountNumber: '',
    creditLimit: '',
    contactName: '',
    contactPhone: ''
  });

  const queryClient = useQueryClient();
  
  // Query para contas bancárias
  const { data: bankAccounts, refetch: refetchBankAccounts } = useQuery({
    queryKey: ['/api/bank-accounts'],
    enabled: true
  });

  // Mutation para criar conta bancária
  const createBankAccountMutation = useMutation({
    mutationFn: (bankAccountData: any) => 
      fetch('/api/bank-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bankAccountData),
      }).then(res => res.json()),
    onSuccess: () => {
      setBankAccountModalOpen(false);
      refetchBankAccounts();
      queryClient.invalidateQueries({ queryKey: ['/api/bank-accounts'] });
      // Resetar dados do formulário
      setBankAccountData({
        initialBalanceDate: new Date().toISOString().split('T')[0],
        currentBalance: '',
        balanceType: 'credor',
        accountType: 'conta_corrente',
        name: '',
        currency: 'BRL',
        bank: '',
        agency: '',
        accountNumber: '',
        creditLimit: '',
        contactName: '',
        contactPhone: ''
      });
    }
  });

  // Função para salvar conta bancária
  const handleBankAccountSave = async () => {
    if (!bankAccountData.name) {
      alert('Nome é obrigatório');
      return;
    }
    
    if (!bankAccountData.currentBalance) {
      alert('Saldo inicial é obrigatório');
      return;
    }
    
    if (!bankAccountData.bank) {
      alert('Banco é obrigatório');
      return;
    }

    try {
      await createBankAccountMutation.mutateAsync(bankAccountData);
    } catch (error) {
      console.error('Erro ao salvar conta bancária:', error);
      alert('Erro ao salvar conta bancária');
    }
  };

  // Retorno da função principal TransactionsPage
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Finanças</h1>
        <p className="text-gray-600 mt-1">Gestão financeira completa</p>
      </div>

      {/* Abas principais */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {['visao-geral', 'movimentacoes', 'contas', 'centro-custo'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'visao-geral' && 'Visão Geral'}
              {tab === 'movimentacoes' && 'Movimentações'}
              {tab === 'contas' && 'Contas'}
              {tab === 'centro-custo' && 'Centro de Custo'}
            </button>
          ))}
        </nav>
      </div>

      {/* Conteúdo baseado na aba ativa */}
      {activeTab === 'visao-geral' && <OverviewSection />}
      {activeTab === 'movimentacoes' && <MovementsSection />}
      {activeTab === 'contas' && (
        <AccountsSection 
          onOpenBankAccountModal={() => setBankAccountModalOpen(true)}
        />
      )}
      {activeTab === 'centro-custo' && <CostCenterSection />}

      {/* Modal de conta bancária */}
      {bankAccountModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header do modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Nova Conta Bancária</h2>
              <button
                onClick={() => setBankAccountModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Conteúdo do modal com todos os campos */}
            <div className="p-6 space-y-6">
              {/* Primeira linha: Data do Saldo Inicial e Saldo Atual */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data do Saldo Inicial
                  </label>
                  <input
                    type="date"
                    value={bankAccountData.initialBalanceDate}
                    onChange={(e) => setBankAccountData({ ...bankAccountData, initialBalanceDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Saldo Atual *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={bankAccountData.currentBalance}
                    onChange={(e) => setBankAccountData({ ...bankAccountData, currentBalance: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0,00"
                  />
                </div>
              </div>

              {/* Segunda linha: Tipo de Saldo e Tipo de Conta */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Saldo
                  </label>
                  <select
                    value={bankAccountData.balanceType}
                    onChange={(e) => setBankAccountData({ ...bankAccountData, balanceType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="credor">Credor</option>
                    <option value="devedor">Devedor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Conta
                  </label>
                  <select
                    value={bankAccountData.accountType}
                    onChange={(e) => setBankAccountData({ ...bankAccountData, accountType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="conta_corrente">Conta Corrente</option>
                    <option value="poupanca">Poupança</option>
                    <option value="investimento">Investimento</option>
                  </select>
                </div>
              </div>

              {/* Terceira linha: Nome da Conta e Moeda */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Conta *
                  </label>
                  <input
                    type="text"
                    value={bankAccountData.name}
                    onChange={(e) => setBankAccountData({ ...bankAccountData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Conta Corrente Principal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Moeda
                  </label>
                  <select
                    value={bankAccountData.currency}
                    onChange={(e) => setBankAccountData({ ...bankAccountData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BRL">Real (R$)</option>
                    <option value="USD">Dólar (US$)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
              </div>

              {/* Quarta linha: Banco e Agência */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banco *
                  </label>
                  <input
                    type="text"
                    value={bankAccountData.bank}
                    onChange={(e) => setBankAccountData({ ...bankAccountData, bank: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Banco do Brasil"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agência
                  </label>
                  <input
                    type="text"
                    value={bankAccountData.agency}
                    onChange={(e) => setBankAccountData({ ...bankAccountData, agency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 1234-5"
                  />
                </div>
              </div>

              {/* Quinta linha: Número da Conta e Limite de Crédito */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número da Conta
                  </label>
                  <input
                    type="text"
                    value={bankAccountData.accountNumber}
                    onChange={(e) => setBankAccountData({ ...bankAccountData, accountNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 12345-6"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Limite de Crédito
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={bankAccountData.creditLimit}
                    onChange={(e) => setBankAccountData({ ...bankAccountData, creditLimit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0,00"
                  />
                </div>
              </div>

              {/* Sexta linha: Contato e Telefone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contato
                  </label>
                  <input
                    type="text"
                    value={bankAccountData.contactName}
                    onChange={(e) => setBankAccountData({ ...bankAccountData, contactName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome do contato"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={bankAccountData.contactPhone}
                    onChange={(e) => setBankAccountData({ ...bankAccountData, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
            </div>

            {/* Footer com botão Salvar */}
            <div className="flex justify-end items-center p-6 border-t border-gray-200">
              <button
                onClick={handleBankAccountSave}
                disabled={!bankAccountData.name || !bankAccountData.currentBalance || !bankAccountData.bank || createBankAccountMutation.isPending}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded text-sm transition-colors"
              >
                {createBankAccountMutation.isPending ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}