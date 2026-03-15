/**
 * @fileoverview Página de gestão financeira do sistema Quantor
 * 
 * Renomeada de "Transações" para "Finanças" com funcionalidades avançadas:
### 4. Correção Visual do Tipo de Conta
Identificamos que a lista estava procurando o campo `account_type`, mas o banco de dados estava entregando `accountType`. Fizemos a padronização para que o tipo (Conta Corrente, Poupança, etc.) apareça corretamente na listagem, assim como o número da conta.
 * - Sistema de 4 abas principais: Visão Geral, Movimentações, Contas, Centro de Custo
 * - Sub-abas inteligentes com barra de progressão animada
 * - Gráficos avançados com Chart.js (linha, rosca, barras)
 * - Controles temporais completos (navegação, calendário, filtros de período)
 * - Dashboard visual de fluxo de caixa
 * - Demonstrativo diário com dados tabulares
 * - Centro de custo com categorização e barras de progresso
 * - Design responsivo e profissional
 * - Dados demonstrativos baseados em referências visuais
 * 
 * @author Equipe Quantor
 * @version 1.0.0
 */

// Importações React
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from '../lib/queryClient';

// Importações de ícones Lucide
import { Plus, Edit, Trash2, Search, Filter, Eye, TrendingUp, TrendingDown, DollarSign, CreditCard, Building, Target, Activity, FileText, Clock, CheckCircle, CheckCheck, Calendar, Settings, ChevronLeft, ChevronRight, Save, X, ChevronDown, ChevronRight as ChevronRightIcon, ArrowUpDown, AlertTriangle, Building2, FolderDown, LogOut, HandCoins, Coins, Link, Layers } from "lucide-react";

// Importações Material-UI
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Autocomplete from '@mui/material/Autocomplete';

// Importações de componentes UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubTabs } from "@/components/SubTabs";
import { DynamicModal, DynamicField } from "@/components/DynamicModal";
import { TabelaItens } from "@/components/ui/TabelaItens";
import { IButtonPrime } from "@/components/ui/i-ButtonPrime";
import { MoneyBagIcon } from "@/components/icons/MoneyBagIcon";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";

// Importações de tipos
import { Transaction } from "@shared/schema";
import { DashboardData } from "@/types";
import { ChartOfAccountsTree, ChartOfAccountNode, SAMPLE_CHART_OF_ACCOUNTS } from "@/types/ChartOfAccountsTree";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSuccessDialog } from "@/components/ui/success-dialog";
import { useErrorDialog } from "@/components/ui/error-dialog";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { TransactionCard } from "@/components/TransactionCard";
import { DateInput } from "@/components/DateInput";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const formatCurrencyValue = (value: string, currencyCode: string) => {
  // Se o valor estiver vazio, apenas retornar vazio
  if (!value) return '';

  // Extrair apenas os números
  const numericString = value.replace(/\D/g, '');
  if (!numericString) return '';

  // Converter para valor em centavos
  const numberValue = parseInt(numericString, 10) / 100;

  // Retornar o valor formatado com o símbolo da moeda correto
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currencyCode,
  }).format(numberValue);
};

const formatCurrencyNumber = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatCurrency = (amount: string | number) => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const BRAZILIAN_BANKS = [
  { code: '001', name: 'Banco do Brasil S.A.' },
  { code: '033', name: 'Banco Santander (Brasil) S.A.' },
  { code: '104', name: 'Caixa Econômica Federal' },
  { code: '237', name: 'Banco Bradesco S.A.' },
  { code: '341', name: 'Itaú Unibanco S.A.' },
  { code: '077', name: 'Banco Inter S.A.' },
  { code: '260', name: 'Nu Pagamentos S.A. (Nubank)' },
  { code: '212', name: 'Banco Original S.A.' },
  { code: '336', name: 'Banco C6 S.A.' },
  { code: '290', name: 'PagSeguro Internet S.A.' },
  { code: '380', name: 'PicPay Serviços S.A.' },
  { code: '332', name: 'Acesso Soluções de Pagamento S.A. (Banco BS2)' },
  { code: '655', name: 'Banco Votorantim S.A. (Neon)' },
  { code: '074', name: 'Banco J. Safra S.A.' },
  { code: '422', name: 'Banco Safra S.A.' },
  { code: '748', name: 'Banco Cooperativo Sicredi S.A.' },
  { code: '756', name: 'Banco Cooperativo do Brasil S.A. (SICOOB)' },
  { code: '047', name: 'Banco do Estado de Sergipe S.A. (Banese)' },
  { code: '021', name: 'Banestes S.A. Banco do Estado do Espírito Santo' },
  { code: '041', name: 'Banco do Estado do Rio Grande do Sul S.A. (Banrisul)' },
  { code: '070', name: 'BRB - Banco de Brasília S.A.' },
  { code: '653', name: 'Banco Indusval S.A.' },
  { code: '604', name: 'Banco Industrial do Brasil S.A.' },
  { code: '389', name: 'Banco Mercantil do Brasil S.A.' },
  { code: '623', name: 'Banco Pan S.A.' },
  { code: '611', name: 'Banco Paulista S.A.' },
  { code: '643', name: 'Banco Pine S.A.' },
  { code: '747', name: 'Banco Rabobank International Brasil S.A.' },
  { code: '633', name: 'Banco Rendimento S.A.' },
  { code: '752', name: 'Banco BNP Paribas Brasil S.A.' },
  { code: '208', name: 'Banco BTG Pactual S.A.' },
  { code: '003', name: 'Banco da Amazônia S.A.' },
  { code: '004', name: 'Banco do Nordeste do Brasil S.A.' },
  { code: '036', name: 'Banco Bradesco BBI S.A.' },
  { code: '121', name: 'Banco Agibank S.A.' },
  { code: '083', name: 'Banco da China Brasil S.A.' },
  { code: '473', name: 'Banco Caixa Geral - Brasil S.A.' },
  { code: '745', name: 'Banco Citibank S.A.' },
  { code: '265', name: 'Banco Fator S.A.' },
  { code: '224', name: 'Banco Fibra S.A.' },
  { code: '612', name: 'Banco Guanabara S.A.' },
  { code: '600', name: 'Banco Luso Brasileiro S.A.' },
  { code: '318', name: 'Banco BMG S.A.' },
  { code: '626', name: 'Banco Ficsa S.A.' },
  { code: '079', name: 'Banco Original do Agronegócio S.A.' },
  { code: '254', name: 'Paraná Banco S.A.' },
  { code: '477', name: 'Citibank N.A.' },
  { code: '999', name: 'Outro Banco' }
].sort((a, b) => parseInt(a.code) - parseInt(b.code));

export function Transactions() {
  const queryClient = useQueryClient();
  const { showSuccess, SuccessDialog } = useSuccessDialog();
  const { showError, ErrorDialog } = useErrorDialog();
  const { showConfirm, ConfirmDialog } = useConfirmDialog();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [activeTab, setActiveTab] = useState("visao-geral");
  const [progressWidth, setProgressWidth] = useState(0);
  const tabListRef = useRef<HTMLDivElement>(null);
  
  // Mês atual dinâmico para não sumir com os dados
  const monthNames = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const todayDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(`${monthNames[todayDate.getMonth()]} ${todayDate.getFullYear()}`);
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filterPeriod, setFilterPeriod] = useState("Mensal");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [chartAccountModalOpen, setChartAccountModalOpen] = useState(false);
  const [bankAccountModalOpen, setBankAccountModalOpen] = useState(false);
  const [editingBankAccount, setEditingBankAccount] = useState<any>(null);
  const [newBankModalOpen, setNewBankModalOpen] = useState(false);
  const [newBankData, setNewBankData] = useState({ code: '', name: '' });
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

  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery<any[]>({
    queryKey: ["/api/transactions"],
    queryFn: () => fetch('/api/transactions', { credentials: 'include' }).then(res => res.json()),
  });

  const { data: bankAccounts = [], isLoading: isLoadingBankAccounts, refetch: refetchBankAccounts } = useQuery<any[]>({
    queryKey: ["/api/bank-accounts"],
    queryFn: () => fetch('/api/bank-accounts', { credentials: 'include' }).then(res => res.json()),
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
      queryClient.invalidateQueries({ queryKey: ['/api/bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      showSuccess('Conta bancária criada com sucesso!', "");
      setBankAccountModalOpen(false);
      resetBankAccountData();
    },
    onError: (error: any) => {
      showError('Erro ao criar conta bancária', error.message || 'Verifique os dados e tente novamente.');
    }
  });

  // Mutation para atualizar conta bancária
  const updateBankAccountMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) =>
      fetch(`/api/bank-accounts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      showSuccess('Conta bancária atualizada com sucesso!', "");
      setBankAccountModalOpen(false);
      setEditingBankAccount(null);
      resetBankAccountData();
    },
    onError: (error: any) => {
      showError('Erro ao atualizar conta bancária', error.message || 'Verifique os dados e tente novamente.');
    }
  });

  // Mutation para excluir conta bancária
  const deleteBankAccountMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/bank-accounts/${id}`, {
        method: 'DELETE',
      }).then(res => res.ok ? res.json() : Promise.reject('Erro ao excluir')),
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['/api/bank-accounts'] });
       queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
       queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
       showSuccess('Conta bancária excluída com sucesso!', "");
    },
    onError: (error: any) => {
       showError('Erro ao excluir conta bancária', error.message || 'Tente novamente mais tarde.');
    }
  });

  const resetBankAccountData = () => {
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
  };

  // Mutation para criar banco customizado
  const createCustomBankMutation = useMutation({
    mutationFn: (bankData: { code: string; name: string }) =>
      fetch('/api/custom-banks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(bankData),
      }).then(async res => {
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Erro ao salvar o banco');
        }
        return res.json();
      }),
    onSuccess: (newBank) => {
      queryClient.invalidateQueries({ queryKey: ['/api/custom-banks'] });
      setBankAccountData(prev => ({ ...prev, bank: newBank.code }));
      showSuccess('Banco cadastrado', 'Novo banco adicionado à lista com sucesso.');
      setNewBankModalOpen(false);
      setNewBankData({ code: '', name: '' });
    },
    onError: (error: any) => {
      showError('Erro ao criar banco', error.message || 'Verifique os dados e tente novamente.');
    }
  });

  // Handler para salvar novo banco na lista
  const handleNewBankSave = (data: any) => {
    if (!data.code || !data.name) {
      showError('Campos obrigatórios', 'O Código do Banco e o Nome da Instituição são obrigatórios.');
      return;
    }

    const cleanedCode = data.code.trim();
    const isDuplicate = banksList.some(b => b.code.trim() === cleanedCode);

    if (isDuplicate) {
      showError('Código Duplicado', 'Já existe um banco cadastrado com esse código.');
      return;
    }

    createCustomBankMutation.mutate({
      code: cleanedCode,
      name: data.name.trim()
    });
  };

  // Handler para salvar conta bancária (Criação ou Edição)
  const handleBankAccountSave = async (data: any) => {
    if (!data.name) {
      showError('Campo obrigatório', 'O nome da conta é obrigatório.');
      return;
    }

    if (!data.currentBalance) {
      showError('Campo obrigatório', 'O saldo inicial é obrigatório.');
      return;
    }

    if (!data.bank) {
      showError('Campo obrigatório', 'O banco é obrigatório.');
      return;
    }

    try {
      // Limpar formatação de valores antes de enviar preservando decimais
      const parseMoeda = (val: any) => {
        if (!val) return '0';
        const str = val.toString();
        // Se já é um número (ou string numérica sem formatação pt-BR), mantemos
        if (/^\d+(\.\d+)?$/.test(str)) return str;
        // Remove R$, espaços e pontos de milhar, troca vírgula por ponto
        return str.replace(/[R$\s.]/g, '').replace(',', '.');
      };

      const cleanedData = {
        ...data,
        currentBalance: parseMoeda(data.currentBalance),
        creditLimit: parseMoeda(data.creditLimit)
      };

      if (editingBankAccount) {
        await updateBankAccountMutation.mutateAsync({ id: editingBankAccount.id, data: cleanedData });
      } else {
        await createBankAccountMutation.mutateAsync(cleanedData);
      }
    } catch (error) {
      console.error('Erro ao salvar conta bancária:', error);
    }
  };





  // Estados para controle de ordenação e paginação
  const [payablesSortField, setPayablesSortField] = useState<string>('');
  const [payablesSortDirection, setPayablesSortDirection] = useState<'asc' | 'desc'>('asc');
  const [payablesCurrentPage, setPayablesCurrentPage] = useState(1);
  const [payablesItemsPerPage] = useState(10);

  const [receivablesSortField, setReceivablesSortField] = useState<string>('');
  const [receivablesSortDirection, setReceivablesSortDirection] = useState<'asc' | 'desc'>('asc');
  const [receivablesCurrentPage, setReceivablesCurrentPage] = useState(1);
  const [receivablesItemsPerPage] = useState(10);

  // Estado para modal de transação
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [activeMovimentacoesSubTab, setActiveMovimentacoesSubTab] = useState<'a-pagar' | 'a-receber'>('a-pagar');
  const [newTransactions, setNewTransactions] = useState<any[]>([]);

  // Estados para seleção múltipla (Baixa em Lote)
  const [selectedPayables, setSelectedPayables] = useState<any[]>([]);
  const [selectedReceivables, setSelectedReceivables] = useState<any[]>([]);
  const [batchPaymentModalOpen, setBatchPaymentModalOpen] = useState(false);
  const [batchPaymentType, setBatchPaymentType] = useState<'payable' | 'receivable'>('payable');
  const [showExpenseSubcategory, setShowExpenseSubcategory] = useState(false);
  const [showIncomeSubcategory, setShowIncomeSubcategory] = useState(false);
  const [showAccountFlow, setShowAccountFlow] = useState(false);
  const [batchModePayables, setBatchModePayables] = useState(false);
  const [batchModeReceivables, setBatchModeReceivables] = useState(false);

  // Filtrar transações por mês, busca e tipo
  const filteredTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    const monthNames = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const tMonthYear = `${monthNames[tDate.getMonth()]} ${tDate.getFullYear()}`;
    const matchesMonth = tMonthYear === currentMonth;

    const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || t.type === filterType;

    return matchesMonth && matchesSearch && matchesFilter;
  });

  // Dados reais para À Pagar
  const payablesData = filteredTransactions
    .filter(t => t.type === 'expense' && t.status !== 'pago')
    .map(t => ({
      id: t.id,
      company: t.relationship?.socialName || 'Diversos',
      cnpj: t.relationship?.document || '-',
      dueDate: format(new Date(t.date), 'dd/MM/yyyy'),
      product: t.description,
      type: t.repeticao,
      status: new Date(t.date) < new Date() ? 'Vencida' : 'Pendente',
      value: parseFloat(t.amount)
    }));

  // Dados reais para À Receber
  const receivablesData = filteredTransactions
    .filter(t => t.type === 'income' && t.status !== 'pago')
    .map(t => ({
      id: t.id,
      company: t.relationship?.socialName || 'Diversos',
      cnpj: t.relationship?.document || '-',
      dueDate: format(new Date(t.date), 'dd/MM/yyyy'),
      product: t.description,
      type: t.repeticao,
      status: new Date(t.date) < new Date() ? 'Vencida' : 'Pendente',
      value: parseFloat(t.amount)
    }));

  // Totais para os cards de resumo
  const totalPayablesMonth = payablesData.reduce((sum, t) => sum + t.value, 0);
  const totalReceivablesMonth = receivablesData.reduce((sum, t) => sum + t.value, 0);
  const resultMonth = totalReceivablesMonth - totalPayablesMonth;

  // AGREGAÇÕES DINÂMICAS PARA CARDS E GRÁFICOS
  // 1. Resumo Diário (para Demonstrativo e Gráfico de Barras)
  const dailySummary = filteredTransactions.reduce((acc: any[], t) => {
    const dateStr = format(new Date(t.date), 'dd/MM/yyyy');
    let day = acc.find(d => d.date === dateStr);

    if (!day) {
      day = {
        date: dateStr,
        dateLabel: format(new Date(t.date), 'dd/MM'),
        entrada: 0,
        saida: 0,
        resultado: 0,
        saldo: 0
      };
      acc.push(day);
    }

    const amount = parseFloat(t.amount || '0');
    if (t.type === 'income') {
      day.entrada += amount;
    } else {
      day.saida += amount;
    }
    day.resultado = day.entrada - day.saida;

    return acc;
  }, []).sort((a, b) => {
    const parseDate = (d: string) => {
      const [day, month, year] = d.split('/').map(Number);
      return new Date(year, month - 1, day).getTime();
    };
    return parseDate(a.date) - parseDate(b.date);
  });

  // Cálculo de Saldo Acumulado (Simulado no período)
  let runningBalance = 0;
  dailySummary.forEach(day => {
    runningBalance += day.resultado;
    day.saldo = runningBalance;
  });

  // Cálculos de Totais para o Demonstrativo Diário
  const totalEntradasDemonstrativo = dailySummary.reduce((sum, d) => sum + d.entrada, 0);
  const totalSaidasDemonstrativo = dailySummary.reduce((sum, d) => sum + d.saida, 0);
  const totalResultadoDemonstrativo = dailySummary.reduce((sum, d) => sum + d.resultado, 0);
  const totalSaldoDemonstrativo = dailySummary.length > 0 ? dailySummary[dailySummary.length - 1].saldo : 0;

  // 2. Agregação por Categoria (para Gráficos de Rosca)
  const getStatsByCategory = (type: 'income' | 'expense') => {
    const data = filteredTransactions.filter(t => t.type === type);
    const total = data.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);

    const categories = data.reduce((acc: any, t) => {
      const cat = t.businessCategory?.name || t.category?.name || 'Geral';
      acc[cat] = (acc[cat] || 0) + parseFloat(t.amount || '0');
      return acc;
    }, {});

    return Object.entries(categories).map(([name, value]: [string, any]) => ({
      name,
      value,
      percent: total > 0 ? (value / total) * 100 : 0
    })).sort((a, b) => b.value - a.value);
  };

  const incomeStats = getStatsByCategory('income');
  const expenseStats = getStatsByCategory('expense');

  // Agregação por Subcategoria
  const getStatsBySubcategory = (type: 'income' | 'expense') => {
    const data = filteredTransactions.filter(t => t.type === type);
    const total = data.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);

    const subcategories = data.reduce((acc: any, t) => {
      const subcat = t.businessSubcategory?.name || 'Geral';
      acc[subcat] = (acc[subcat] || 0) + parseFloat(t.amount || '0');
      return acc;
    }, {});

    return Object.entries(subcategories).map(([name, value]: [string, any]) => ({
      name,
      value,
      percent: total > 0 ? (value / total) * 100 : 0
    })).sort((a, b) => b.value - a.value);
  };

  const incomeSubStats = getStatsBySubcategory('income');
  const expenseSubStats = getStatsBySubcategory('expense');

  // Cores para os gráficos
  const chartColors = ['#10b981', '#1D3557', '#f59e0b', '#8b5cf6', '#6b7280', '#ec4899', '#06b6d4'];

  // Funções de ordenação
  const handlePayablesSort = (field: string) => {
    const direction = payablesSortField === field && payablesSortDirection === 'asc' ? 'desc' : 'asc';
    setPayablesSortField(field);
    setPayablesSortDirection(direction);
  };

  const handleReceivablesSort = (field: string) => {
    const direction = receivablesSortField === field && receivablesSortDirection === 'asc' ? 'desc' : 'asc';
    setReceivablesSortField(field);
    setReceivablesSortDirection(direction);
  };

  // Função para ordenar dados
  const sortData = (data: any[], sortField: string, sortDirection: 'asc' | 'desc') => {
    if (!sortField) return data;

    return [...data].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Tratamento especial para datas
      if (sortField === 'dueDate') {
        aVal = (typeof aVal === 'string' && aVal) ? new Date(aVal.split('/').reverse().join('-')) : new Date(0);
        bVal = (typeof bVal === 'string' && bVal) ? new Date(bVal.split('/').reverse().join('-')) : new Date(0);
      }

      // Tratamento especial para valores
      if (sortField === 'value') {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Dados ordenados e paginados
  const sortedPayables = sortData(payablesData, payablesSortField, payablesSortDirection);
  const paginatedPayables = sortedPayables.slice(
    (payablesCurrentPage - 1) * payablesItemsPerPage,
    payablesCurrentPage * payablesItemsPerPage
  );

  const sortedReceivables = sortData(receivablesData, receivablesSortField, receivablesSortDirection);
  const paginatedReceivables = sortedReceivables.slice(
    (receivablesCurrentPage - 1) * receivablesItemsPerPage,
    receivablesCurrentPage * receivablesItemsPerPage
  );

  // Cálculos de paginação
  const payablesTotalPages = Math.ceil(sortedPayables.length / payablesItemsPerPage);
  const receivablesTotalPages = Math.ceil(sortedReceivables.length / receivablesItemsPerPage);

  // Query para buscar contas do plano de contas
  const { data: chartAccounts = [], isLoading: isLoadingAccounts, refetch: refetchAccounts } = useQuery({
    queryKey: ['/api/chart-accounts'],
    queryFn: () => fetch('/api/chart-accounts').then(res => res.json()),
  });

  // As queries bankAccounts e transactions foram movidas para o topo

  // Query para buscar bancos customizados
  const { data: customBanks = [] } = useQuery({
    queryKey: ['/api/custom-banks'],
    queryFn: () => fetch('/api/custom-banks', { credentials: 'include' }).then(res => res.json()),
  });

  const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
    queryFn: () => fetch('/api/dashboard', { credentials: 'include' }).then(res => res.json()),
  });

  // Movimentação por conta bancária no período filtrado
  const buildAccountFlow = (typeFilter?: 'income' | 'expense') => {
    const flowByAccount: Record<number, { name: string; flow: number }> = {};
    filteredTransactions.forEach(t => {
      if (typeFilter && t.type !== typeFilter) return;
      const accId = t.bankAccountId;
      if (!accId) return;
      const account = dashboardData?.bankAccounts?.find((a: any) => a.id === accId);
      if (!account) return;
      if (!flowByAccount[accId]) {
        flowByAccount[accId] = { name: account.name, flow: 0 };
      }
      const amount = parseFloat(t.amount || '0');
      flowByAccount[accId].flow += amount;
    });
    return Object.entries(flowByAccount).map(([id, data]) => ({
      id: Number(id),
      name: data.name,
      flow: data.flow,
    }));
  };

  const accountFlowStats = buildAccountFlow();
  const accountFlowExpenseStats = buildAccountFlow('expense');
  const accountFlowIncomeStats = buildAccountFlow('income');

  const safeCustomBanks = Array.isArray(customBanks) ? customBanks : [];
  const banksList = Array.from(new Map([...BRAZILIAN_BANKS, ...safeCustomBanks].map(item => [item.code, item])).values())
    .sort((a, b) => parseInt(a.code) - parseInt(b.code));

  // Garantir que chartAccounts seja sempre um array
  const safeChartAccountsData: any[] = Array.isArray(chartAccounts) ? chartAccounts : [];

  // Para compatibilidade com o código de renderização que usa safeChartAccounts
  const safeChartAccounts = safeChartAccountsData;

  // Mutation para liquidar transação (Adicionada manualmente por recuperação)
  const liquidateTransactionMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'pago' }),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      showSuccess('Lançamento liquidado com sucesso!', "");
    },
    onError: (error: any) => {
      showError('Erro ao liquidar lançamento', error.message || 'Tente novamente.');
    }
  });

  const handleLiquidateTransaction = (item: any, type: string) => {
    showConfirm(
      "Liquidar Lançamento",
      "Tem certeza que deseja marcar este lançamento como pago/liquidado?",
      () => liquidateTransactionMutation.mutate(item.id)
    );
  };

  // Mutation para atualizar transação
  const updateTransactionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) =>
      fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      showSuccess('Transação atualizada com sucesso!', "");
      setTransactionModalOpen(false);
      setEditingTransaction(null);
    },
    onError: (error: any) => {
      showError('Erro ao atualizar transação', error.message || 'Verifique os dados e tente novamente.');
    }
  });

  // Mutation para excluir transação
  const deleteTransactionMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      }).then(res => res.ok ? res.json() : Promise.reject('Erro ao excluir')),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      showSuccess('Transação excluída com sucesso!', "");
    },
    onError: (error: any) => {
      showError('Erro ao excluir transação', error.message || 'Tente novamente mais tarde.');
    }
  });

  // Mutation para criar transação
  const createTransactionMutation = useMutation({
    mutationFn: (transactionData: any) =>
      fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(transactionData),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      showSuccess('Transação salva com sucesso!', "");
      setTransactionModalOpen(false);
    },
    onError: (error: any) => {
      showError('Erro ao salvar transação', error.message || 'Verifique os dados e tente novamente.');
    }
  });

  // Função para salvar transação (Criação ou Edição)
  const handleSaveTransaction = async (transactionData: any) => {
    try {
      // Limpar formatação de valores preservando decimais (padrão parseMoeda)
      const parseMoeda = (val: any) => {
        if (!val) return 0;
        const str = val.toString();
        if (/^\d+(\.\d+)?$/.test(str)) return parseFloat(str);
        const cleaned = str.replace(/[R$\s.]/g, '').replace(',', '.');
        return parseFloat(cleaned) || 0;
      };

      const valorNumerico = parseMoeda(transactionData.valor);

      // Mapear os dados do formulário para o formato esperado pelo backend
      const transactionPayload = {
        amount: valorNumerico,
        description: transactionData.descricao || 'Lançamento',
        type: transactionData.tipo.includes('receita') ? 'income' : 'expense',
        date: transactionData.data ? new Date(transactionData.data.split('/').reverse().join('-')).toISOString() : new Date().toISOString(),
        categoryId: null, // Desativado em favor do Plano de Contas (chartAccountId)
        chartAccountId: transactionData.chartAccountId ? parseInt(transactionData.chartAccountId) : null,
        bankAccountId: transactionData.conta ? parseInt(transactionData.conta) : null,
        relationshipId: transactionData.contato ? parseInt(transactionData.contato) : null,
        status: transactionData.status || 'pago',

        // Campos de repetição e parcelamento
        repeticao: transactionData.repeticao || 'Única',
        numeroParcelas: transactionData.numeroParcelas ? parseInt(transactionData.numeroParcelas) : null,
        dataPrimeiraParcela: transactionData.dataPrimeiraParcela || null,
        aplicarJuros: transactionData.aplicarJuros || false,
        tipoJuros: transactionData.tipoJuros || null,
        valorJuros: transactionData.valorJuros ? parseFloat(transactionData.valorJuros) : null,
        aplicarJurosEm: transactionData.aplicarJurosEm || null,
        periodicidade: transactionData.periodicidade || null,

        // Outros campos
        observacoes: transactionData.observacoes || null,
        tags: transactionData.tags || null,
      };

      if (editingTransaction) {
        await updateTransactionMutation.mutateAsync({ 
          id: editingTransaction.id, 
          data: transactionPayload 
        });
      } else {
        await createTransactionMutation.mutateAsync(transactionPayload);
      }
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
    }
  };

  // Função para processar baixa em lote
  const handleBatchPayment = async (paymentData: any) => {
    try {
      const selectedItems = batchPaymentType === 'payable' ? selectedPayables : selectedReceivables;

      // Calcular total com juros e descontos
      const totalOriginal = selectedItems.reduce((sum, item) => sum + item.value, 0);
      const jurosMulta = parseFloat(paymentData.jurosMulta?.replace(/\D/g, '') || '0') / 100;
      const desconto = parseFloat(paymentData.desconto?.replace(/\D/g, '') || '0') / 100;
      const totalFinal = totalOriginal + jurosMulta - desconto;

      // Aqui você processaria a baixa no backend
      console.log('Processando baixa em lote:', {
        tipo: batchPaymentType,
        contaBancariaId: paymentData.contaBancaria,
        dataBaixa: paymentData.dataBaixa,
        formaPagamento: paymentData.formaPagamento,
        jurosMulta,
        desconto,
        totalOriginal,
        totalFinal,
        observacoes: paymentData.observacoes,
        itens: selectedItems
      });

      // Limpar seleção e desativar modo após processar
      if (batchPaymentType === 'payable') {
        setSelectedPayables([]);
        setBatchModePayables(false);
      } else {
        setSelectedReceivables([]);
        setBatchModeReceivables(false);
      }

      setBatchPaymentModalOpen(false);

      showSuccess(
        'Baixa em lote realizada',
        `${selectedItems.length} ${selectedItems.length === 1 ? 'lançamento processado' : 'lançamentos processados'} com sucesso!`
      );
    } catch (error) {
      console.error('Erro ao processar baixa em lote:', error);
      showError('Erro ao processar baixa', 'Ocorreu um erro ao processar a baixa em lote. Tente novamente.');
    }
  };





  // Calcula a posição e largura da barra de progressão
  useEffect(() => {
    const updateProgressBar = () => {
      if (!tabListRef.current) return;

      const activeTabElement = tabListRef.current.querySelector(`[data-state="active"]`) as HTMLElement;
      if (activeTabElement) {
        const tabListRect = tabListRef.current.getBoundingClientRect();
        const activeTabRect = activeTabElement.getBoundingClientRect();

        const leftOffset = activeTabRect.left - tabListRect.left;
        const width = activeTabRect.width;

        // Define a posição e largura da barra
        setProgressWidth(width);

        // Aplica a posição através de CSS custom properties
        const progressBar = tabListRef.current.querySelector('.progress-bar') as HTMLElement;
        if (progressBar) {
          // Aplica a cor do texto ativo e ícone
          activeTabElement.style.color = '#4D4E48';
          const icon = activeTabElement.querySelector('svg');
          if (icon) icon.style.color = '#4D4E48';

          // Define a posição e largura final
          progressBar.style.setProperty('--progress-left', `${leftOffset}px`);
          progressBar.style.setProperty('--progress-width', `${width}px`);

          // Remove animação anterior e força reset
          progressBar.style.animation = 'none';
          progressBar.offsetHeight; // Força repaint

          // Aplica nova animação
          progressBar.style.animation = 'progressFill 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards';
          progressBar.style.backgroundColor = '#B59363';
        }
      }
    };

    // Delay para garantir que o DOM foi atualizado
    const timer = setTimeout(updateProgressBar, 50);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Lógica de transactions e filteredTransactions consolidada no topo

  // Funções para navegação temporal
  const navigateMonth = (direction: 'prev' | 'next') => {
    const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const [monthName, year] = currentMonth.split(' ');
    const currentIndex = months.indexOf(monthName);

    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    let newYear = parseInt(year);

    if (newIndex > 11) {
      newIndex = 0;
      newYear++;
    } else if (newIndex < 0) {
      newIndex = 11;
      newYear--;
    }

    setCurrentMonth(`${months[newIndex]} ${newYear}`);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      const monthName = format(date, 'MMMM yyyy', { locale: ptBR });
      setCurrentMonth(monthName);
      setIsCalendarOpen(false);
    }
  };

  const handleFilterChange = (period: string) => {
    setFilterPeriod(period);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finanças</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gerencie suas finanças de forma inteligente e organizada
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => {
              console.log("Active tab:", activeTab);
              if (activeTab === "centro-custo") {
                // Dispara o modal do Plano de Contas que agora é controlado pelo estado local de ChartOfAccountsContent
                // mas como o botão está no pai, precisamos de um mecanismo.
                // Vou redefinir o setIsModalOpen ou usar o estado que já existe se possível.
                // Como não tenho acesso direto ao estado interno, vou usar uma solução comum:
                // O pai controla o estado de abertura e passa para o filho.
                setChartAccountModalOpen(true);
              } else if (activeTab === "movimentacoes") {
                console.log("Opening transaction modal");
                setTransactionModalOpen(true);
              } else if (activeTab === "contas") {
                console.log("Opening bank account modal, current state:", bankAccountModalOpen);
                setBankAccountModalOpen(true);
                console.log("Bank account modal state set to true");
              }
            }}
            className="group relative w-11 h-11 bg-gradient-to-r from-[#4D4E48] to-[#2a2a2a] hover:from-[#2a2a2a] hover:to-[#1a1a1a] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 active:shadow-md"
            title={
              activeTab === "centro-custo"
                ? "Nova Conta - Plano de Contas"
                : activeTab === "movimentacoes"
                  ? "Novo Lançamento Financeiro"
                  : activeTab === "contas"
                    ? "Nova Conta Bancária"
                    : "Adicionar Novo"
            }
            style={{
              boxShadow: '0 6px 20px -6px rgba(59, 130, 246, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
            }}
          >
            {/* Efeito de brilho interno */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Ícone Plus com animação */}
            <Plus className="h-5 w-5 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 group-hover:rotate-90 transition-transform duration-300 ease-out" />

            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-active:scale-100 group-active:opacity-30 transition-all duration-150 ease-out"></div>
            </div>
          </button>

          {/* Tooltip */}
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
            {
              activeTab === "centro-custo"
                ? "Nova Conta - Plano de Contas"
                : activeTab === "movimentacoes"
                  ? "Novo Lançamento Financeiro"
                  : activeTab === "contas"
                    ? "Nova Conta Bancária"
                    : "Adicionar Novo"
            }
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="relative" ref={tabListRef}>
          <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4 bg-gray-100 p-1 rounded-lg relative">
            <TabsTrigger
              value="visao-geral"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#4D4E48] font-medium px-6 py-2 transition-all relative overflow-hidden"
            >
              <Eye className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger
              value="movimentacoes"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#4D4E48] font-medium px-6 py-2 transition-all relative overflow-hidden"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Movimentações
            </TabsTrigger>
            <TabsTrigger
              value="contas"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#4D4E48] font-medium px-6 py-2 transition-all relative overflow-hidden"
            >
              <Building className="h-4 w-4 mr-2" />
              Contas
            </TabsTrigger>
            <TabsTrigger
              value="centro-custo"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#4D4E48] font-medium px-6 py-2 transition-all relative overflow-hidden"
            >
              <Target className="h-4 w-4 mr-2" />
              Centro de Custo
            </TabsTrigger>
          </TabsList>

          {/* Barra de progressão inteligente e animada */}
          <div className="absolute bottom-1 left-1 right-1 h-0.5 overflow-hidden">
            <div
              className="progress-bar absolute bottom-0 h-full bg-[#B59363] rounded-full"
              style={{
                left: 'var(--progress-left, 0px)',
                width: '0px',
                transformOrigin: 'left center'
              }}
            />
          </div>
        </div>

        <TabsContent value="visao-geral" className="space-y-6">
          <SubTabs
            defaultValue="fluxo-caixa"
            tabs={[
              {
                value: "fluxo-caixa",
                label: "Fluxo de Caixa",
                icon: <Activity className="h-4 w-4" />,
                content: (
                  <div className="space-y-6">
                    {/* Card Fluxo de Caixa */}
                      <Card className="shadow-md border-gray-100/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg font-semibold">Fluxo de caixa</CardTitle>
                              <CardDescription className="text-sm text-gray-500">Evolução mensal</CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                              {/* Navegação de mês */}
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => navigateMonth('prev')}
                                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </button>
                                <span className="text-sm font-medium min-w-[100px] text-center">
                                  {currentMonth}
                                </span>
                                <button
                                  onClick={() => navigateMonth('next')}
                                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </button>
                              </div>

                              {/* Ícone do calendário */}
                              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                <PopoverTrigger asChild>
                                  <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                                    <Calendar className="h-4 w-4" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                  <CalendarComponent
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={handleDateSelect}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>

                              {/* Ícone de engrenagem com dropdown */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                                    <Settings className="h-4 w-4" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                  <DropdownMenuItem
                                    onClick={() => handleFilterChange('Semanal')}
                                    className={filterPeriod === 'Semanal' ? 'bg-[#B59363]/5 text-[#4D4E48]' : ''}
                                  >
                                    Semanal
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleFilterChange('Mensal')}
                                    className={filterPeriod === 'Mensal' ? 'bg-[#B59363]/5 text-[#4D4E48]' : ''}
                                  >
                                    Mensal
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleFilterChange('Trimestral')}
                                    className={filterPeriod === 'Trimestral' ? 'bg-[#B59363]/5 text-[#4D4E48]' : ''}
                                  >
                                    Trimestral
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleFilterChange('Semestral')}
                                    className={filterPeriod === 'Semestral' ? 'bg-[#B59363]/5 text-[#4D4E48]' : ''}
                                  >
                                    Semestral
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleFilterChange('Anual')}
                                    className={filterPeriod === 'Anual' ? 'bg-[#B59363]/5 text-[#4D4E48]' : ''}
                                  >
                                    Anual
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleFilterChange('Personalizar')}
                                    className={filterPeriod === 'Personalizar' ? 'bg-[#B59363]/5 text-[#4D4E48]' : ''}
                                  >
                                    Personalizar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64">
                            <Line
                              data={{
                                labels: dashboardData?.monthlyTrends?.map(item => item.month) || ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                                datasets: [
                                  {
                                    label: 'Receitas',
                                    data: dashboardData?.monthlyTrends?.map(item => item.income) || [0, 0, 0, 0, 0, 0],
                                    borderColor: '#B59363',
                                    backgroundColor: 'transparent',
                                    tension: 0.4,
                                    pointRadius: 3,
                                  },
                                  {
                                    label: 'Despesas',
                                    data: dashboardData?.monthlyTrends?.map(item => item.expenses) || [0, 0, 0, 0, 0, 0],
                                    borderColor: '#ef4444',
                                    backgroundColor: 'transparent',
                                    tension: 0.4,
                                    pointRadius: 3,
                                  }
                                ]
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: {
                                    position: 'bottom' as const,
                                    labels: {
                                      usePointStyle: true,
                                      padding: 20,
                                    }
                                  }
                                },
                                scales: {
                                  y: {
                                    beginAtZero: true,
                                    ticks: {
                                      callback: function (value) {
                                        return 'R$ ' + Number(value).toLocaleString('pt-BR');
                                      }
                                    }
                                  }
                                }
                              }}
                            />
                          </div>
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-[#B59363] rounded-full"></div>
                                <span>Receitas</span>
                              </div>
                              <span className="font-medium text-[#B59363]">{formatCurrency((dashboardData?.monthlyIncome || 0).toString())}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span>Despesas</span>
                              </div>
                              <span className="font-medium text-red-500">{formatCurrency((dashboardData?.monthlyExpenses || 0).toString())}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm font-semibold border-t pt-2">
                              <span>Saldo Acumulado</span>
                              <span className={dashboardData?.balance && dashboardData.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {formatCurrency((dashboardData?.balance || 0).toString())}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                    {/* 3 cards resumo em colunas iguais */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Card Contas - Saldo / Movimentação */}
                      <Card className="shadow-md border-gray-100/50 hover:shadow-lg transition-all duration-300 ease-in-out">
                        <CardHeader className="pb-2 pt-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <CardTitle className="text-sm font-semibold">
                              {showAccountFlow ? 'Movimentação' : 'Saldos em Contas'}
                            </CardTitle>
                            <IButtonPrime
                              icon={<Layers className="h-3.5 w-3.5" />}
                              variant={showAccountFlow ? 'gold' : 'primary'}
                              onClick={() => setShowAccountFlow(!showAccountFlow)}
                              title={showAccountFlow ? 'Ver saldos' : 'Ver movimentação do período'}
                              className="p-1"
                            />
                          </div>
                          <CardDescription className="text-xs text-gray-500">
                            {showAccountFlow ? 'Fluxo do período selecionado' : 'Posição patrimonial acumulada'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 px-4 pb-3">
                          <div className="space-y-1 curtain-enter" key={showAccountFlow ? 'flow' : 'balance'}>
                            {showAccountFlow ? (
                              accountFlowStats.length > 0 ? (
                                accountFlowStats.map((account) => (
                                  <div key={account.id} className="flex items-center justify-between py-0.5 animate-in fade-in duration-300">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-[#B59363] rounded-full"></div>
                                      <span className="text-xs truncate">{account.name}</span>
                                    </div>
                                    <div className={`text-xs font-medium ${account.flow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {account.flow >= 0 ? '+' : ''}{formatCurrency(account.flow.toString())}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-2 text-xs text-gray-500">
                                  Sem movimentações no período
                                </div>
                              )
                            ) : (
                              dashboardData?.bankAccounts && dashboardData.bankAccounts.length > 0 ? (
                                dashboardData.bankAccounts.map((account) => (
                                  <div key={account.id} className="flex items-center justify-between py-0.5 animate-in fade-in duration-300">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-[#B59363] rounded-full"></div>
                                      <span className="text-xs truncate">{account.name}</span>
                                    </div>
                                    <div className={`text-xs font-medium ${account.realBalance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                                      {formatCurrency(account.realBalance.toString())}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-2 text-xs text-gray-500">
                                  Nenhuma conta bancária cadastrada
                                </div>
                              )
                            )}
                            <div className="border-t pt-1 mt-1">
                              <div className="flex items-center justify-between font-semibold text-xs">
                                <span>{showAccountFlow ? 'Total Movimentação' : 'Total Geral'}</span>
                                {(() => {
                                  if (showAccountFlow) {
                                    const totalFlow = accountFlowStats.reduce((sum, acc) => sum + acc.flow, 0);
                                    return (
                                      <span className={totalFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                                        {totalFlow >= 0 ? '+' : ''}{formatCurrency(totalFlow.toString())}
                                      </span>
                                    );
                                  } else {
                                    const totalReal = dashboardData?.bankAccounts?.reduce((sum, acc) => sum + (acc.realBalance || 0), 0) || 0;
                                    return (
                                      <span className={totalReal >= 0 ? 'text-gray-900' : 'text-red-600'}>
                                        {formatCurrency(totalReal.toString())}
                                      </span>
                                    );
                                  }
                                })()}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Card Despesas por Categoria / Subcategoria */}
                      <Card className="shadow-md border-gray-100/50 hover:shadow-lg transition-all duration-300 ease-in-out">
                        <CardHeader className="pb-0 pt-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <CardTitle className="text-sm font-semibold">
                              {showExpenseSubcategory ? 'Despesas por subcategoria' : 'Despesas por categoria'}
                            </CardTitle>
                            <IButtonPrime
                              icon={<Layers className="h-3.5 w-3.5" />}
                              variant={showExpenseSubcategory ? 'gold' : 'primary'}
                              onClick={() => setShowExpenseSubcategory(!showExpenseSubcategory)}
                              title={showExpenseSubcategory ? 'Ver categorias' : 'Ver subcategorias'}
                              className="p-1"
                            />
                          </div>
                          <CardDescription className="text-xs text-gray-500">Gastos projetados</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 px-4 pb-3">
                          {(() => {
                            const currentExpenseStats = showExpenseSubcategory ? expenseSubStats : expenseStats;
                            const totalExpense = currentExpenseStats.reduce((sum, s) => sum + s.value, 0);
                            return (
                              <div className="flex items-center gap-3">
                                <div className="flex-1 min-w-0 curtain-enter" key={showExpenseSubcategory ? 'sub' : 'cat'}>
                                  <div className="space-y-1 text-xs">
                                    {currentExpenseStats.length > 0 ? currentExpenseStats.map((stat, idx) => (
                                      <div key={idx} className="flex items-center gap-1.5 animate-in fade-in duration-300">
                                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: chartColors[idx % chartColors.length] }}></div>
                                        <span className="truncate">{stat.name}</span>
                                        <span className="text-gray-500 flex-shrink-0">{stat.percent.toFixed(1).replace('.', ',')}%</span>
                                      </div>
                                    )) : (
                                      <div className="py-2 text-gray-500">Sem despesas no período</div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col items-center flex-shrink-0">
                                  <div className="w-28 h-28">
                                    <Doughnut
                                      data={{
                                        labels: currentExpenseStats.length > 0 ? currentExpenseStats.map(s => s.name) : ['Nenhuma'],
                                        datasets: [{
                                          data: currentExpenseStats.length > 0 ? currentExpenseStats.map(s => s.percent) : [100],
                                          backgroundColor: currentExpenseStats.length > 0 ? chartColors.slice(0, currentExpenseStats.length) : ['#f3f4f6'],
                                          borderWidth: 0,
                                        }]
                                      }}
                                      options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        cutout: '60%',
                                        plugins: {
                                          legend: { display: false },
                                          tooltip: { enabled: true }
                                        }
                                      }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium text-red-600 mt-1">
                                    -{formatCurrency(totalExpense.toString())}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                        </CardContent>
                      </Card>

                      {/* Card Receitas por Categoria / Subcategoria */}
                      <Card className="shadow-md border-gray-100/50 hover:shadow-lg transition-all duration-300 ease-in-out">
                        <CardHeader className="pb-0 pt-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <CardTitle className="text-sm font-semibold">
                              {showIncomeSubcategory ? 'Receitas por subcategoria' : 'Receitas por Categoria'}
                            </CardTitle>
                            <IButtonPrime
                              icon={<Layers className="h-3.5 w-3.5" />}
                              variant={showIncomeSubcategory ? 'gold' : 'primary'}
                              onClick={() => setShowIncomeSubcategory(!showIncomeSubcategory)}
                              title={showIncomeSubcategory ? 'Ver categorias' : 'Ver subcategorias'}
                              className="p-1"
                            />
                          </div>
                          <CardDescription className="text-xs text-gray-500">Entradas projetadas</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 px-4 pb-3">
                          {(() => {
                            const currentIncomeStats = showIncomeSubcategory ? incomeSubStats : incomeStats;
                            const totalIncome = currentIncomeStats.reduce((sum, s) => sum + s.value, 0);
                            return (
                              <div className="flex items-center gap-3">
                                <div className="flex-1 min-w-0 curtain-enter" key={showIncomeSubcategory ? 'sub' : 'cat'}>
                                  <div className="space-y-1 text-xs">
                                    {currentIncomeStats.length > 0 ? currentIncomeStats.map((stat, idx) => (
                                      <div key={idx} className="flex items-center gap-1.5 animate-in fade-in duration-300">
                                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: chartColors[idx % chartColors.length] }}></div>
                                        <span className="truncate">{stat.name}</span>
                                        <span className="text-gray-500 flex-shrink-0">{stat.percent.toFixed(1).replace('.', ',')}%</span>
                                      </div>
                                    )) : (
                                      <div className="py-2 text-gray-500">Sem receitas no período</div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col items-center flex-shrink-0">
                                  <div className="w-28 h-28">
                                    <Doughnut
                                      data={{
                                        labels: currentIncomeStats.length > 0 ? currentIncomeStats.map(s => s.name) : ['Nenhuma'],
                                        datasets: [{
                                          data: currentIncomeStats.length > 0 ? currentIncomeStats.map(s => s.percent) : [100],
                                          backgroundColor: currentIncomeStats.length > 0 ? chartColors.slice(0, currentIncomeStats.length) : ['#f3f4f6'],
                                          borderWidth: 0,
                                        }]
                                      }}
                                      options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        cutout: '60%',
                                        plugins: {
                                          legend: { display: false },
                                          tooltip: { enabled: true }
                                        }
                                      }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium text-green-600 mt-1">
                                    +{formatCurrency(totalIncome.toString())}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )
              },
              {
                value: "lancamentos",
                label: "Lançamentos",
                icon: <FileText className="h-4 w-4" />,
                content: (
                  <div className="space-y-6">
                    {/* Card Demonstrativo Diário com controles temporais */}
                    <Card className="shadow-md border-gray-100/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg font-semibold">Demonstrativo Diário</CardTitle>
                            <CardDescription className="text-sm text-gray-500">Saldo em 31 jul</CardDescription>
                          </div>
                          <div className="flex items-center gap-3">
                            {/* Navegação de mês */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => navigateMonth('prev')}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </button>
                              <span className="text-sm font-medium min-w-[100px] text-center">
                                {currentMonth}
                              </span>
                              <button
                                onClick={() => navigateMonth('next')}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Ícone do calendário */}
                            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                              <PopoverTrigger asChild>
                                <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                                  <Calendar className="h-4 w-4" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="end">
                                <CalendarComponent
                                  mode="single"
                                  selected={selectedDate}
                                  onSelect={handleDateSelect}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>

                            {/* Ícone de engrenagem com dropdown */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                                  <Settings className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem
                                  onClick={() => handleFilterChange('Semanal')}
                                  className={filterPeriod === 'Semanal' ? 'bg-[#B59363]/10 text-[#B59363]' : ''}
                                >
                                  Semanal
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleFilterChange('Mensal')}
                                  className={filterPeriod === 'Mensal' ? 'bg-[#B59363]/10 text-[#B59363]' : ''}
                                >
                                  Mensal
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleFilterChange('Trimestral')}
                                  className={filterPeriod === 'Trimestral' ? 'bg-[#1D3557]/10 text-[#1D3557]' : ''}
                                >
                                  Trimestral
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleFilterChange('Semestral')}
                                  className={filterPeriod === 'Semestral' ? 'bg-[#1D3557]/10 text-[#1D3557]' : ''}
                                >
                                  Semestral
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleFilterChange('Anual')}
                                  className={filterPeriod === 'Anual' ? 'bg-[#1D3557]/10 text-[#1D3557]' : ''}
                                >
                                  Anual
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleFilterChange('Personalizar')}
                                  className={filterPeriod === 'Personalizar' ? 'bg-[#1D3557]/10 text-[#1D3557]' : ''}
                                >
                                  Personalizar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Header das colunas */}
                          <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-600 border-b pb-2">
                            <div></div>
                            <div className="text-center">Entradas (R$)</div>
                            <div className="text-center">Saídas (R$)</div>
                            <div className="text-center">Resultado (R$)</div>
                            <div className="text-center">Saldo (R$)</div>
                            <div></div>
                          </div>

                          {/* Contas resumo */}
                          <div className="space-y-2">
                            <div className="grid grid-cols-6 gap-4 text-sm items-center border-t pt-2 font-semibold">
                              <div>Total</div>
                              <div className="text-center text-green-600">{formatCurrencyNumber(totalEntradasDemonstrativo)}</div>
                              <div className="text-center text-red-600">{formatCurrencyNumber(totalSaidasDemonstrativo)}</div>
                              <div className={`text-center ${totalResultadoDemonstrativo >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {totalResultadoDemonstrativo >= 0 ? '+' : ''}{formatCurrencyNumber(totalResultadoDemonstrativo)}
                              </div>
                              <div className={`text-right ${totalSaldoDemonstrativo >= 0 ? "text-gray-900" : "text-red-600"}`}>
                                {formatCurrencyNumber(totalSaldoDemonstrativo)}
                              </div>
                              <div></div>
                            </div>
                          </div>

                          {/* Lançamentos por data */}
                          <div className="space-y-1 mt-6">
                            {dailySummary.length > 0 ? dailySummary.map((item, index) => (
                              <div key={index} className="grid grid-cols-6 gap-4 text-sm py-1 hover:bg-gray-100 rounded transition-colors group">
                                <div className="text-gray-700 flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full ${item.resultado >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                  {item.date}
                                </div>
                                <div className="text-center text-green-600">{item.entrada > 0 ? formatCurrencyNumber(item.entrada) : ""}</div>
                                <div className="text-center text-red-600">{item.saida > 0 ? formatCurrencyNumber(item.saida) : ""}</div>
                                <div className={`text-center font-medium ${item.resultado >= 0 ? "text-green-600" : "text-red-600"}`}>
                                  {item.resultado >= 0 ? '+' : ''}{formatCurrencyNumber(item.resultado)}
                                </div>
                                <div className={`text-right font-medium ${item.saldo >= 0 ? "text-gray-900" : "text-red-600"}`}>
                                  {formatCurrencyNumber(item.saldo)}
                                </div>
                                <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button className="p-1 hover:text-[#B59363]">
                                    <Eye className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            )) : (
                              <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                                Nenhum lançamento para o período selecionado
                              </div>
                            )}

                            {/* Total */}
                            {dailySummary.length > 0 && (
                              <div className="grid grid-cols-6 gap-4 text-sm py-2 border-t font-semibold bg-[#B59363]/5 rounded mt-4">
                                <div className="pl-2">Total do Período</div>
                                <div className="text-center text-green-600">{formatCurrencyNumber(dailySummary.reduce((s, i) => s + i.entrada, 0))}</div>
                                <div className="text-center text-red-600">{formatCurrencyNumber(dailySummary.reduce((s, i) => s + i.saida, 0))}</div>
                                <div className={`text-center ${resultMonth >= 0 ? "text-green-600" : "text-red-600"}`}>
                                  {resultMonth >= 0 ? '+' : ''}{formatCurrencyNumber(resultMonth)}
                                </div>
                                <div className="text-right pr-2">Total Final</div>
                                <div></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Card Gráfico Resultado de Caixa */}
                    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold">Resultado de caixa</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <Bar
                            data={{
                              labels: dailySummary.map(d => d.dateLabel),
                              datasets: [{
                                data: dailySummary.map(d => d.resultado),
                                backgroundColor: function (context: any) {
                                  const value = context.parsed?.y ?? 0;
                                  return value >= 0 ? '#10b981' : '#ef4444';
                                },
                                borderRadius: 4,
                                borderSkipped: false,
                              }]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  display: false
                                },
                                tooltip: {
                                  callbacks: {
                                    label: function (context) {
                                      const value = context.parsed.y;
                                      return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                                    }
                                  }
                                }
                              },
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  grid: {
                                    color: '#f3f4f6'
                                  },
                                  ticks: {
                                    callback: function (value) {
                                      return 'R$ ' + Number(value).toLocaleString('pt-BR');
                                    }
                                  }
                                },
                                x: {
                                  grid: {
                                    display: false
                                  }
                                }
                              }
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )
              }
            ]}
          />
        </TabsContent >

        <TabsContent value="movimentacoes" className="space-y-6">
          <SubTabs
            defaultValue="a-pagar"
            onValueChange={(value) => setActiveMovimentacoesSubTab(value as 'a-pagar' | 'a-receber')}
            tabs={[
              {
                value: "a-pagar",
                label: "À Pagar",
                icon: <Clock className="h-4 w-4" />,
                content: (
                  <div className="flex gap-6">
                    {/* Coluna esquerda - Cards pequenos */}
                    <div className="w-80 flex-shrink-0 space-y-6">
                      {/* Card 1 - Resultado do período */}
                      <Card className="shadow-lg">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base font-semibold">Resultado do período</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-700">À pagar</span>
                            <span className="text-sm font-bold text-red-600">-{formatCurrencyNumber(totalPayablesMonth)}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-700">À receber</span>
                            <span className="text-sm font-bold text-green-600">+{formatCurrencyNumber(totalReceivablesMonth)}</span>
                          </div>

                          <div className="border-t pt-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-700 font-medium">Resultado</span>
                              <span className={`text-sm font-bold ${resultMonth >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {resultMonth >= 0 ? '+' : ''}{formatCurrencyNumber(resultMonth)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Card 2 - Bancos e saldos */}
                      <Card className="shadow-lg">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-1.5">
                            <CardTitle className="text-base font-semibold">
                              {showAccountFlow ? 'Movimentação' : 'Contas'}
                            </CardTitle>
                            <IButtonPrime
                              icon={<Layers className="h-3.5 w-3.5" />}
                              variant={showAccountFlow ? 'gold' : 'primary'}
                              onClick={() => setShowAccountFlow(!showAccountFlow)}
                              title={showAccountFlow ? 'Ver saldos' : 'Ver movimentação do período'}
                              className="p-1"
                            />
                          </div>
                          <CardDescription className="text-xs text-gray-500">
                            {showAccountFlow ? 'Fluxo do período selecionado' : 'Total a pagar'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="curtain-enter space-y-3" key={showAccountFlow ? 'flow' : 'balance'}>
                          {showAccountFlow ? (
                            accountFlowExpenseStats.length > 0 ? accountFlowExpenseStats.map((account) => (
                              <div key={account.id} className="flex items-center justify-between group animate-in fade-in duration-300">
                                <div className="flex items-center gap-2">
                                  <input type="checkbox" defaultChecked className="text-[#B59363]" readOnly />
                                  <span className="text-xs text-gray-700 truncate max-w-[120px]" title={account.name}>
                                    {account.name}
                                  </span>
                                </div>
                                <span className="text-xs font-bold text-red-600">
                                  -{formatCurrencyNumber(account.flow)}
                                </span>
                              </div>
                            )) : (
                              <div className="text-center py-2 text-[10px] text-gray-500">Sem movimentações no período</div>
                            )
                          ) : (
                            bankAccounts.length > 0 ? bankAccounts.map((account) => (
                              <div key={account.id} className="flex items-center justify-between group animate-in fade-in duration-300">
                                <div className="flex items-center gap-2">
                                  <input type="checkbox" defaultChecked className="text-[#B59363]" readOnly />
                                  <span className="text-xs text-gray-700 truncate max-w-[120px]" title={account.name}>
                                    {account.name}
                                  </span>
                                </div>
                                <span className={`text-xs font-bold ${account.projectedBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  {formatCurrencyNumber(account.projectedBalance)}
                                </span>
                              </div>
                            )) : (
                              <div className="text-center py-2 text-[10px] text-gray-500">Nenhuma conta</div>
                            )
                          )}

                          <div className="border-t pt-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-700 font-medium">{showAccountFlow ? 'Total Movimentação' : 'Total Geral'}</span>
                              {(() => {
                                if (showAccountFlow) {
                                  const totalFlow = accountFlowExpenseStats.reduce((sum, acc) => sum + acc.flow, 0);
                                  return (
                                    <span className="text-xs font-bold text-red-600">
                                      -{formatCurrencyNumber(totalFlow)}
                                    </span>
                                  );
                                } else {
                                  return (
                                    <span className={`text-xs font-bold ${(dashboardData?.totalBalance || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                      {formatCurrencyNumber(dashboardData?.totalBalance || 0)}
                                    </span>
                                  );
                                }
                              })()}
                            </div>
                          </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Coluna direita - Card principal com tabela */}
                    <div className="flex-1">
                      <Card className="shadow-lg">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg font-semibold">Contas À Pagar</CardTitle>
                              <CardDescription>Suas obrigações financeiras pendentes</CardDescription>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setCurrentMonth(prevMonth => {
                                const [month, year] = prevMonth.split(' ');
                                const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
                                let currentMonthIndex = months.indexOf(month);
                                let currentYear = parseInt(year);
                                currentMonthIndex--;
                                if (currentMonthIndex < 0) {
                                  currentMonthIndex = 11;
                                  currentYear--;
                                }
                                return `${months[currentMonthIndex]} ${currentYear}`;
                              })}>
                                <ChevronLeft className="h-3 w-3" />
                              </Button>

                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 text-xs font-medium text-gray-700 hover:bg-gray-100">
                                    {currentMonth}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                  <CalendarComponent
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => {
                                      setSelectedDate(date);
                                      if (date) {
                                        const monthNames = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
                                        setCurrentMonth(`${monthNames[date.getMonth()]} ${date.getFullYear()}`);
                                      }
                                    }}
                                    locale={ptBR}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>

                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setCurrentMonth(nextMonth => {
                                const [month, year] = nextMonth.split(' ');
                                const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
                                let currentMonthIndex = months.indexOf(month);
                                let currentYear = parseInt(year);
                                currentMonthIndex++;
                                if (currentMonthIndex > 11) {
                                  currentMonthIndex = 0;
                                  currentYear++;
                                }
                                return `${months[currentMonthIndex]} ${currentYear}`;
                              })}>
                                <ChevronRight className="h-3 w-3" />
                              </Button>

                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Calendar className="h-3 w-3" />
                              </Button>

                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Settings className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                          {/* Botão para ativar modo de baixa em lote */}
                          <div className="mb-4 flex justify-end">
                            <IButtonPrime
                              icon={<FolderDown className="h-4 w-4" />}
                              variant="gold"
                              title={batchModePayables ? "Desativar Baixa em Lote" : "Ativar Baixa em Lote"}
                              className={`!px-4 !py-2 ${batchModePayables ? 'ring-2 ring-[#B59363]' : ''}`}
                              onClick={() => {
                                setBatchModePayables(!batchModePayables);
                                if (batchModePayables) {
                                  // Ao desativar, limpa seleção
                                  setSelectedPayables([]);
                                }
                              }}
                            />
                          </div>

                          {batchModePayables && selectedPayables.length > 0 && (
                            <div className="mb-4 flex items-center justify-between bg-[#B59363]/5 border border-[#B59363]/20 rounded-lg p-3">
                              <span className="text-sm font-medium text-[#4D4E48]">
                                {selectedPayables.length} {selectedPayables.length === 1 ? 'item selecionado' : 'itens selecionados'}
                              </span>
                              <IButtonPrime
                                icon={<CheckCheck className="h-4 w-4" />}
                                variant="gold"
                                title="Baixa em Lote"
                                className="!px-4 !py-2"
                                onClick={() => {
                                  setBatchPaymentType('payable');
                                  setBatchPaymentModalOpen(true);
                                }}
                              />
                            </div>
                          )}
                          <TabelaItens
                            data={payablesData}
                            initialPerPage={10}
                            selectable={batchModePayables}
                            selectedItems={selectedPayables}
                            onSelectionChange={setSelectedPayables}
                            columns={[
                              {
                                label: "Razão Social",
                                key: "company",
                                align: "left",
                                width: "22%",
                                sortable: true,
                                render: (item: any) => (
                                  <div>
                                    <div className="font-medium text-xs">{item.company}</div>
                                    <div className="text-xs text-gray-500">{item.cnpj}</div>
                                  </div>
                                )
                              },
                              {
                                label: "Vencimento",
                                key: "dueDate",
                                align: "left",
                                width: "11%",
                                sortable: true
                              },
                              {
                                label: "Produto",
                                key: "product",
                                align: "left",
                                width: "16%",
                                sortable: true
                              },
                              {
                                label: "Tipo",
                                key: "type",
                                align: "center",
                                width: "10%",
                                sortable: true,
                                render: (item: any) => (
                                  <span className={`px-2 py-0.5 rounded-full text-xs whitespace-nowrap ${item.type === 'Parcela' ? 'bg-[#1D3557]/15 text-[#1D3557]' :
                                    item.type === 'Mensal' ? 'bg-green-100 text-green-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                    {item.type}
                                  </span>
                                )
                              },
                              {
                                label: "Status",
                                key: "status",
                                align: "center",
                                width: "10%",
                                sortable: true,
                                render: (item: any) => (
                                  <span className={`px-2 py-0.5 rounded-full text-xs whitespace-nowrap ${item.status === 'Vencida' ? 'bg-red-100 text-red-800' :
                                    item.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800' :
                                      item.status === 'Em dia' ? 'bg-green-100 text-green-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                    {item.status}
                                  </span>
                                )
                              },
                              {
                                label: "Valor",
                                key: "value",
                                align: "right",
                                width: "11%",
                                sortable: true,
                                render: (item: any) => (
                                  <span className={`font-semibold text-xs whitespace-nowrap ${item.status === 'Vencida' ? 'text-red-600' : 'text-gray-900'
                                    }`}>
                                    R$ {item.value.toFixed(2).replace('.', ',')}
                                  </span>
                                )
                              }
                            ]}
                            actions={(item: any) => (
                              <div className="flex items-center justify-center gap-2">
                                <IButtonPrime
                                  icon={<CurrencyExchangeIcon style={{ fontSize: 14 }} />}
                                  variant="gold"
                                  title="Liquidação"
                                  className="!p-2"
                                  onClick={() => handleLiquidateTransaction(item, 'payable')}
                                />
                                <IButtonPrime
                                  icon={<Edit className="h-3.5 w-3.5" />}
                                  variant="neutral"
                                  title="Editar"
                                  className="!p-2"
                                  onClick={() => console.log('Edit', item.id)}
                                />
                                <IButtonPrime
                                  icon={<Eye className="h-3.5 w-3.5" />}
                                  variant="teal"
                                  title="Visualizar"
                                  className="!p-2"
                                  onClick={() => console.log('View', item.id)}
                                />
                                <IButtonPrime
                                  icon={<Trash2 className="h-3.5 w-3.5" />}
                                  variant="red"
                                  title="Excluir"
                                  className="!p-2"
                                  onClick={() => console.log('Delete', item.id)}
                                />
                              </div>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )
              },
              {
                value: "a-receber",
                label: "À Receber",
                icon: <CheckCircle className="h-4 w-4" />,
                content: (
                  <div className="flex gap-6">
                    {/* Coluna esquerda - Cards pequenos */}
                    <div className="w-80 flex-shrink-0 space-y-6">
                      {/* Card 1 - Resultado do período */}
                      <Card className="shadow-lg">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base font-semibold">Resultado do período</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-700">À pagar</span>
                            <span className="text-sm font-bold text-red-600">-2.805,23</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-700">À receber</span>
                            <span className="text-sm font-bold text-green-600">4.430,00</span>
                          </div>

                          <div className="border-t pt-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-700 font-medium">Resultado</span>
                              <span className="text-sm font-bold text-green-600">1.624,77</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Card 2 - Bancos e saldos */}
                      <Card className="shadow-lg">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-1.5">
                            <CardTitle className="text-base font-semibold">
                              {showAccountFlow ? 'Movimentação' : 'Contas'}
                            </CardTitle>
                            <IButtonPrime
                              icon={<Layers className="h-3.5 w-3.5" />}
                              variant={showAccountFlow ? 'gold' : 'primary'}
                              onClick={() => setShowAccountFlow(!showAccountFlow)}
                              title={showAccountFlow ? 'Ver saldos' : 'Ver movimentação do período'}
                              className="p-1"
                            />
                          </div>
                          <CardDescription className="text-xs text-gray-500">
                            {showAccountFlow ? 'Fluxo do período selecionado' : 'Total a receber'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="curtain-enter space-y-3" key={showAccountFlow ? 'flow-r' : 'balance-r'}>
                          {showAccountFlow ? (
                            accountFlowIncomeStats.length > 0 ? accountFlowIncomeStats.map((account) => (
                              <div key={account.id} className="flex items-center justify-between group animate-in fade-in duration-300">
                                <div className="flex items-center gap-2">
                                  <input type="checkbox" defaultChecked className="text-[#B59363]" readOnly />
                                  <span className="text-xs text-gray-700 truncate max-w-[120px]" title={account.name}>
                                    {account.name}
                                  </span>
                                </div>
                                <span className="text-xs font-bold text-green-600">
                                  +{formatCurrencyNumber(account.flow)}
                                </span>
                              </div>
                            )) : (
                              <div className="text-center py-2 text-[10px] text-gray-500">Sem movimentações no período</div>
                            )
                          ) : (
                            bankAccounts.length > 0 ? bankAccounts.map((account) => (
                              <div key={account.id} className="flex items-center justify-between group animate-in fade-in duration-300">
                                <div className="flex items-center gap-2">
                                  <input type="checkbox" defaultChecked className="text-[#B59363]" readOnly />
                                  <span className="text-xs text-gray-700 truncate max-w-[120px]" title={account.name}>
                                    {account.name}
                                  </span>
                                </div>
                                <span className={`text-xs font-bold ${account.projectedBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  {formatCurrencyNumber(account.projectedBalance)}
                                </span>
                              </div>
                            )) : (
                              <div className="text-center py-2 text-[10px] text-gray-500">Nenhuma conta</div>
                            )
                          )}

                          <div className="border-t pt-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-700 font-medium">{showAccountFlow ? 'Total Movimentação' : 'Total Geral'}</span>
                              {(() => {
                                if (showAccountFlow) {
                                  const totalFlow = accountFlowIncomeStats.reduce((sum, acc) => sum + acc.flow, 0);
                                  return (
                                    <span className="text-xs font-bold text-green-600">
                                      +{formatCurrencyNumber(totalFlow)}
                                    </span>
                                  );
                                } else {
                                  return (
                                    <span className={`text-xs font-bold ${(dashboardData?.totalBalance || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                      {formatCurrencyNumber(dashboardData?.totalBalance || 0)}
                                    </span>
                                  );
                                }
                              })()}
                            </div>
                          </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Coluna direita - Card principal com tabela */}
                    <div className="flex-1">
                      <Card className="shadow-lg">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg font-semibold">Valores À Receber</CardTitle>
                              <CardDescription>Receitas e entradas programadas</CardDescription>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setCurrentMonth(prevMonth => {
                                const [month, year] = prevMonth.split(' ');
                                const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
                                let currentMonthIndex = months.indexOf(month);
                                let currentYear = parseInt(year);
                                currentMonthIndex--;
                                if (currentMonthIndex < 0) {
                                  currentMonthIndex = 11;
                                  currentYear--;
                                }
                                return `${months[currentMonthIndex]} ${currentYear}`;
                              })}>
                                <ChevronLeft className="h-3 w-3" />
                              </Button>

                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 text-xs font-medium text-gray-700 hover:bg-gray-100">
                                    {currentMonth}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                  <CalendarComponent
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => {
                                      setSelectedDate(date);
                                      if (date) {
                                        const monthNames = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
                                        setCurrentMonth(`${monthNames[date.getMonth()]} ${date.getFullYear()}`);
                                      }
                                    }}
                                    locale={ptBR}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>

                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setCurrentMonth(nextMonth => {
                                const [month, year] = nextMonth.split(' ');
                                const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
                                let currentMonthIndex = months.indexOf(month);
                                let currentYear = parseInt(year);
                                currentMonthIndex++;
                                if (currentMonthIndex > 11) {
                                  currentMonthIndex = 0;
                                  currentYear++;
                                }
                                return `${months[currentMonthIndex]} ${currentYear}`;
                              })}>
                                <ChevronRight className="h-3 w-3" />
                              </Button>

                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Calendar className="h-3 w-3" />
                              </Button>

                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Settings className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                          {/* Botão para ativar modo de baixa em lote */}
                          <div className="mb-4 flex justify-end">
                            <IButtonPrime
                              icon={<FolderDown className="h-4 w-4" />}
                              variant="gold"
                              title={batchModeReceivables ? "Desativar Baixa em Lote" : "Ativar Baixa em Lote"}
                              className={`!px-4 !py-2 ${batchModeReceivables ? 'ring-2 ring-[#B59363]' : ''}`}
                              onClick={() => {
                                setBatchModeReceivables(!batchModeReceivables);
                                if (batchModeReceivables) {
                                  // Ao desativar, limpa seleção
                                  setSelectedReceivables([]);
                                }
                              }}
                            />
                          </div>

                          {batchModeReceivables && selectedReceivables.length > 0 && (
                            <div className="mb-4 flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                              <span className="text-sm font-medium text-green-900">
                                {selectedReceivables.length} {selectedReceivables.length === 1 ? 'item selecionado' : 'itens selecionados'}
                              </span>
                              <IButtonPrime
                                icon={<CheckCheck className="h-4 w-4" />}
                                variant="gold"
                                title="Baixa em Lote"
                                className="!px-4 !py-2"
                                onClick={() => {
                                  setBatchPaymentType('receivable');
                                  setBatchPaymentModalOpen(true);
                                }}
                              />
                            </div>
                          )}
                          <TabelaItens
                            data={receivablesData}
                            initialPerPage={10}
                            selectable={batchModeReceivables}
                            selectedItems={selectedReceivables}
                            onSelectionChange={setSelectedReceivables}
                            columns={[
                              {
                                label: "Razão Social",
                                key: "company",
                                align: "left",
                                width: "22%",
                                sortable: true,
                                render: (item: any) => (
                                  <div>
                                    <div className="font-medium text-xs">{item.company}</div>
                                    <div className="text-xs text-gray-500">{item.cnpj}</div>
                                  </div>
                                )
                              },
                              {
                                label: "Vencimento",
                                key: "dueDate",
                                align: "left",
                                width: "11%",
                                sortable: true
                              },
                              {
                                label: "Produto",
                                key: "product",
                                align: "left",
                                width: "16%",
                                sortable: true
                              },
                              {
                                label: "Tipo",
                                key: "type",
                                align: "center",
                                width: "10%",
                                sortable: true,
                                render: (item: any) => (
                                  <span className={`px-2 py-0.5 rounded-full text-xs whitespace-nowrap ${item.type === 'Mensal' ? 'bg-green-100 text-green-800' :
                                    item.type === 'Parcela' ? 'bg-[#1D3557]/15 text-[#1D3557]' :
                                      item.type === 'Rendimento' ? 'bg-purple-100 text-purple-800' :
                                        item.type === 'Cashback' ? 'bg-orange-100 text-orange-800' :
                                          'bg-gray-100 text-gray-800'
                                    }`}>
                                    {item.type}
                                  </span>
                                )
                              },
                              {
                                label: "Status",
                                key: "status",
                                align: "center",
                                width: "10%",
                                sortable: true,
                                render: (item: any) => (
                                  <span className={`px-2 py-0.5 rounded-full text-xs whitespace-nowrap ${item.status === 'Confirmado' ? 'bg-green-100 text-green-800' :
                                    item.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800' :
                                      item.status === 'Automático' ? 'bg-green-100 text-green-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                    {item.status}
                                  </span>
                                )
                              },
                              {
                                label: "Valor",
                                key: "value",
                                align: "right",
                                width: "11%",
                                sortable: true,
                                render: (item: any) => (
                                  <span className={`font-semibold text-xs whitespace-nowrap ${item.status === 'Confirmado' ? 'text-green-600' : 'text-gray-900'
                                    }`}>
                                    R$ {item.value.toFixed(2).replace('.', ',')}
                                  </span>
                                )
                              }
                            ]}
                            actions={(item: any) => (
                              <div className="flex items-center justify-center gap-2">
                                <IButtonPrime
                                  icon={<PointOfSaleIcon style={{ fontSize: 14 }} />}
                                  variant="gold"
                                  title="Liquidação"
                                  className="!p-2"
                                  onClick={() => handleLiquidateTransaction(item, 'receivable')}
                                />
                                <IButtonPrime
                                  icon={<Edit className="h-3.5 w-3.5" />}
                                  variant="neutral"
                                  title="Editar"
                                  className="!p-2"
                                  onClick={() => console.log('Edit', item.id)}
                                />
                                <IButtonPrime
                                  icon={<Eye className="h-3.5 w-3.5" />}
                                  variant="teal"
                                  title="Visualizar"
                                  className="!p-2"
                                  onClick={() => console.log('View', item.id)}
                                />
                                <IButtonPrime
                                  icon={<Trash2 className="h-3.5 w-3.5" />}
                                  variant="red"
                                  title="Excluir"
                                  className="!p-2"
                                  onClick={() => console.log('Delete', item.id)}
                                />
                              </div>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )
              }
            ]}
          />
        </TabsContent>

        <TabsContent value="contas" className="space-y-6">

          {/* Tabela de Contas Bancárias */}
          <TabelaItens
            data={bankAccounts || []}
            columns={[
              {
                label: "Banco",
                key: "bank",
                width: "20%",
                render: (account: any) => (
                  <div className="font-medium text-gray-900">
                    {banksList.find(b => b.code === account.bank)?.name ||
                      (account.bank === 'banco_do_brasil' ? 'Banco do Brasil' :
                        account.bank === 'caixa' ? 'Caixa Econômica Federal' :
                          account.bank === 'santander' ? 'Santander' :
                            account.bank === 'itau' ? 'Itaú' :
                              account.bank === 'bradesco' ? 'Bradesco' :
                                account.bank === 'nubank' ? 'Nubank' :
                                  account.bank === 'inter' ? 'Banco Inter' :
                                    account.bank || 'Banco não informado')}
                  </div>
                )
              },
              {
                label: "Nome da Conta Bancária",
                key: "name",
                width: "35%",
                render: (account: any) => (
                  <div>
                     <div className="font-medium text-gray-900">{account.name || 'Nome não informado'}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                      {account.accountType === 'conta_corrente' ? 'Conta Corrente' :
                        account.accountType === 'conta_poupanca' ? 'Conta Poupança' :
                          account.accountType === 'conta_investimento' ? 'Conta de Investimento' :
                            'Tipo não informado'}
                      {account.agency && ` • AG ${account.agency}`}
                      {account.accountNumber && ` • CC ${account.accountNumber}`}
                    </div>
                  </div>
                )
              },
              {
                label: "Data da Criação",
                key: "created_at",
                align: "center",
                width: "15%",
                render: (account: any) => (
                  <span className="text-gray-600">
                    {account.created_at ? new Date(account.created_at).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')}
                  </span>
                )
              },
              {
                label: "Saldo Atual",
                key: "balance",
                align: "right",
                width: "15%",
                render: (account: any) => {
                  const balance = account.balance || 0;
                  return (
                    <span className={`font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  );
                }
              }
            ]}
            actions={(account) => (
              <div className="flex items-center justify-center gap-2">
                <IButtonPrime
                  icon={<Edit className="h-3.5 w-3.5" />}
                  className="!p-2"
                  onClick={() => {
                    setEditingBankAccount(account);
                    // Converter valores numéricos para formato de exibição no modal
                    const formatForModal = (val: any) => {
                      if (val === null || val === undefined) return '';
                      return formatCurrencyValue(val.toString().replace('.', ''), 'BRL');
                    };

                    setBankAccountData({
                      initialBalanceDate: account.initialBalanceDate ? new Date(account.initialBalanceDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                      currentBalance: formatForModal(account.currentBalance),
                      balanceType: account.balanceType || ((account.balance || 0) >= 0 ? 'credor' : 'devedor'),
                      accountType: account.accountType || 'conta_corrente',
                      name: account.name || '',
                      currency: account.currency || 'BRL',
                      bank: account.bank || '',
                      agency: account.agency || '',
                      accountNumber: account.accountNumber || '',
                      creditLimit: formatForModal(account.creditLimit),
                      contactName: account.contactName || '',
                      contactPhone: account.contactPhone || ''
                    });
                    setBankAccountModalOpen(true);
                  }}
                  title="Editar Conta"
                />
                <IButtonPrime
                  icon={<Trash2 className="h-3.5 w-3.5" />}
                  variant="red"
                  className="!p-2"
                  onClick={() => {
                    showConfirm(
                      "Excluir Conta Bancária",
                      `Tem certeza que deseja excluir a conta "${account.name || account.account_name}"? Esta ação não pode ser desfeita.`,
                      () => deleteBankAccountMutation.mutate(account.id)
                    );
                  }}
                  title="Excluir Conta"
                />
              </div>
            )}
            emptyMessage="Nenhuma conta bancária cadastrada."
            emptyIcon={<CreditCard className="h-10 w-10 text-gray-300" />}
          />
        </TabsContent>

        <TabsContent value="centro-custo" className="space-y-6">
          <SubTabs
            defaultValue="plano-contas"
            tabs={[
              {
                value: "plano-contas",
                label: "Plano de Contas",
                icon: <FileText className="h-4 w-4" />,
                content: (
                  <ChartOfAccountsContent
                    isModalOpen={chartAccountModalOpen}
                    setIsModalOpen={setChartAccountModalOpen}
                    chartAccountModalOpen={chartAccountModalOpen}
                    showSuccess={showSuccess}
                    showError={showError}
                    showConfirm={showConfirm}
                    SuccessDialog={SuccessDialog}
                    ErrorDialog={ErrorDialog}
                    ConfirmDialog={ConfirmDialog}
                  />
                )
              },
              {
                value: "demonstrativo-resultados",
                label: "Demonstrativo de Resultados",
                icon: <Activity className="h-4 w-4" />,
                content: (
                  <div className="space-y-6">
                    {/* Conteúdo da aba Demonstrativo de Resultados será desenvolvido posteriormente */}
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Activity className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">Demonstrativo de Resultados</h3>
                        <p className="text-sm text-gray-500 text-center">
                          Conteúdo em desenvolvimento
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )
              }
            ]}
          />
        </TabsContent>
      </Tabs >

      {/* Card de Nova Transação */}
      < TransactionCard
        open={transactionModalOpen}
        onClose={() => {
          console.log("Closing transaction modal");
          setTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        transaction={editingTransaction}
        entryType={activeMovimentacoesSubTab === 'a-pagar' ? 'payable' : 'receivable'}
      />

      < DynamicModal
        isOpen={bankAccountModalOpen}
        onClose={() => {
          setBankAccountModalOpen(false);
          setEditingBankAccount(null);
          resetBankAccountData();
        }}
        title={editingBankAccount ? "Editar Conta Financeira" : "Nova Conta Financeira"}
        initialData={bankAccountData}
        onSave={(data) => {
          setBankAccountData(data);
          handleBankAccountSave(data);
        }}
        isSaveDisabled={(data) => !data.name || !data.currentBalance || !data.bank}
        maxWidth="2xl"
        fields={
          [
            // Primeira linha
            [
              { name: 'initialBalanceDate', label: 'Data do saldo inicial *', type: 'date', colSpan: 3 },
              {
                name: 'currentBalance',
                label: 'Saldo em...',
                type: 'currency',
                colSpan: 3,
                placeholder: '',
                textColorCondition: (data) => data.balanceType === 'devedor' ? '#ef4444' : 'inherit',
                onChangeOverride: (val, currentData, setFormData) => {
                  const formatted = formatCurrencyValue(val, currentData.currency);
                  setFormData((prev: any) => ({ ...prev, currentBalance: formatted }));
                }
              },
              {
                name: 'balanceType',
                label: '',
                type: 'radio',
                colSpan: 6,
                options: [
                  { value: 'credor', label: 'Credor' },
                  { value: 'devedor', label: 'Devedor' }
                ],
                radioStyle: 'colored'
              }
            ],
            // Segunda linha
            [
              {
                name: 'accountType',
                label: 'Tipo',
                type: 'select',
                colSpan: 4,
                options: [
                  { value: 'conta_corrente', label: 'Conta Corrente' },
                  { value: 'conta_poupanca', label: 'Conta Poupança' },
                  { value: 'conta_investimento', label: 'Conta de Investimento' }
                ],
                iconAction: {
                  icon: <CreditCard className="h-5 w-5 mb-1 text-[#4D4E48] hover:text-[#B59363] transition-colors" />,
                  onClick: () => {/* TODO: Implementar modal de novo tipo */ },
                  title: "Cadastrar novo tipo de conta"
                }
              },
              {
                name: 'bank',
                label: 'Banco',
                type: 'autocomplete',
                colSpan: 4,
                options: banksList,
                getOptionLabel: (opt: any) => `${opt.code} - ${opt.name}`,
                getOptionValue: (opt: any) => opt.code,
                iconAction: {
                  icon: <Building2 className="h-5 w-5 mb-1 text-[#4D4E48] hover:text-[#B59363] transition-colors" />,
                  onClick: () => setNewBankModalOpen(true),
                  title: "Cadastrar novo banco"
                }
              },
              {
                name: 'currency',
                label: 'Moeda',
                type: 'select',
                colSpan: 4,
                options: [
                  { value: 'BRL', label: 'Real (R$)' },
                  { value: 'USD', label: 'Dólar (US$)' },
                  { value: 'EUR', label: 'Euro (€)' }
                ],
                onChangeOverride: (val, currentData, setFormData) => {
                  const newBalance = currentData.currentBalance
                    ? formatCurrencyValue(currentData.currentBalance, val)
                    : '';
                  const newCreditLimit = currentData.creditLimit
                    ? formatCurrencyValue(currentData.creditLimit, val)
                    : '';
                  setFormData((prev: any) => ({
                    ...prev,
                    currency: val,
                    currentBalance: newBalance,
                    creditLimit: newCreditLimit
                  }));
                }
              }
            ],
            // Terceira linha
            [
              { name: 'name', label: 'Nome *', type: 'text', colSpan: 12 }
            ],
            // Quarta linha
            [
              { name: 'agency', label: 'Agência', type: 'text', colSpan: 6 },
              { name: 'accountNumber', label: 'Conta', type: 'text', colSpan: 6 }
            ],
            // Quinta linha
            [
              {
                name: 'creditLimit',
                label: (data) => `Limite de crédito (${data.currency === 'USD' ? 'US$' : data.currency === 'EUR' ? '€' : 'R$'})`,
                type: 'currency',
                colSpan: 6,
                onChangeOverride: (val, currentData, setFormData) => {
                  const formatted = formatCurrencyValue(val, currentData.currency);
                  setFormData((prev: any) => ({ ...prev, creditLimit: formatted }));
                }
              },
              { name: 'contactName', label: 'Nome do contato', type: 'text', colSpan: 6 }
            ],
            // Sexta linha
            [
              { name: 'contactPhone', label: 'Telefone do contato', type: 'text', colSpan: 12 }
            ]
          ]}
      />

      {/* Modal de Novo Banco */}
      < DynamicModal
        isOpen={newBankModalOpen}
        onClose={() => {
          setNewBankModalOpen(false);
          setNewBankData({ code: '', name: '' } as any);
        }}
        title="Novo Banco"
        initialData={{ code: '', name: '' }}
        onSave={handleNewBankSave}
        isSaveDisabled={(data) => !data.code || !data.name}
        maxWidth="lg"
        fields={
          [
            [
              {
                name: 'code',
                label: 'Código do Banco *',
                type: 'text',
                colSpan: 6,
                placeholder: 'Ex: 001',
                autoFocus: true,
                transform: (val: string) => val.replace(/\D/g, '')
              },
              {
                name: 'name',
                label: 'Nome da Instituição *',
                type: 'text',
                colSpan: 6,
                placeholder: 'Ex: Banco do Brasil S.A.'
              }
            ]
          ]}
      />

      {/* Modal de Baixa em Lote */}
      < DynamicModal
        isOpen={batchPaymentModalOpen}
        onClose={() => {
          setBatchPaymentModalOpen(false);
          if (batchPaymentType === 'payable') {
            setSelectedPayables([]);
          } else {
            setSelectedReceivables([]);
          }
        }}
        title={(() => {
          const selectedItems = batchPaymentType === 'payable' ? selectedPayables : selectedReceivables;
          const total = selectedItems.reduce((sum, item) => sum + item.value, 0);
          const itemText = selectedItems.length === 1 ? 'item' : 'itens';
          const totalFormatted = `R$ ${total.toFixed(2).replace('.', ',')}`;
          const type = batchPaymentType === 'payable' ? 'Contas à Pagar' : 'Valores à Receber';
          return `Baixa em Lote - ${type} (${selectedItems.length} ${itemText} - ${totalFormatted})`;
        })()}
        initialData={{
          contaBancaria: '',
          dataBaixa: new Date().toISOString().split('T')[0],
          formaPagamento: 'transferencia',
          jurosMulta: '0,00',
          desconto: '0,00',
          observacoes: ''
        }}
        onSave={handleBatchPayment}
        isSaveDisabled={(data) => !data.contaBancaria || !data.dataBaixa}
        maxWidth="lg"
        fields={
          [
            // Primeira linha - Conta e Data
            [
              {
                name: 'contaBancaria',
                label: 'Conta Bancária *',
                type: 'select',
                colSpan: 6,
                options: bankAccounts.map((account: any) => ({
                  value: account.id,
                  label: `${account.bank} - ${account.accountNumber}`
                })),
                iconAction: {
                  icon: <Plus className="h-5 w-5 mb-1 text-[#B59363] hover:text-[#4D4E48] transition-colors" />,
                  onClick: () => setBankAccountModalOpen(true),
                  title: "Adicionar nova conta"
                }
              },
              {
                name: 'dataBaixa',
                label: 'Data da Baixa *',
                type: 'date',
                colSpan: 6
              }
            ],
            // Segunda linha - Forma de Pagamento
            [
              {
                name: 'formaPagamento',
                label: 'Forma de Pagamento/Recebimento',
                type: 'select',
                colSpan: 12,
                options: [
                  { value: 'dinheiro', label: 'Dinheiro' },
                  { value: 'transferencia', label: 'Transferência Bancária' },
                  { value: 'boleto', label: 'Boleto' },
                  { value: 'pix', label: 'PIX' },
                  { value: 'cartao_credito', label: 'Cartão de Crédito' },
                  { value: 'cartao_debito', label: 'Cartão de Débito' },
                  { value: 'cheque', label: 'Cheque' }
                ]
              }
            ],
            // Terceira linha - Juros/Multa e Desconto
            [
              {
                name: 'jurosMulta',
                label: 'Juros/Multa',
                type: 'currency',
                colSpan: 6,
                placeholder: 'R$ 0,00'
              },
              {
                name: 'desconto',
                label: 'Desconto',
                type: 'currency',
                colSpan: 6,
                placeholder: 'R$ 0,00'
              }
            ],
            // Quarta linha - Observações
            [
              {
                name: 'observacoes',
                label: 'Observações',
                type: 'text',
                colSpan: 12,
                placeholder: 'Informações adicionais sobre esta baixa em lote...'
              }
            ]
          ]}
      />

      {/* Dialogs são renderizados pelos hooks personalizados */}
    </div >
  );
}

/**
 * Componente para gerenciamento do Plano de Contas
 * Inclui modal de cadastro, lista hierárquica e funcionalidades completas
 */
function ChartOfAccountsContent({
  isModalOpen: isModalOpenProp,
  setIsModalOpen: setIsModalOpenProp,
  chartAccountModalOpen, // Adicionando prop para sincronizar com botão Plus do pai
  showSuccess,
  showError,
  showConfirm,
  SuccessDialog,
  ErrorDialog,
  ConfirmDialog
}: {
  isModalOpen: boolean,
  setIsModalOpen: (open: boolean) => void,
  chartAccountModalOpen?: boolean,
  showSuccess: (title: string, message: string, options?: { autoClose?: boolean; autoCloseDelay?: number; }) => void,
  showError: (title: string, message: string, options?: { autoClose?: boolean; autoCloseDelay?: number; }) => void,
  showConfirm: (title: string, message: string, onConfirm: () => void) => void,
  SuccessDialog: React.ComponentType,
  ErrorDialog: React.ComponentType,
  ConfirmDialog: React.ComponentType
}) {
  const queryClient = useQueryClient();
  const [chartTree, setChartTree] = useState<ChartOfAccountsTree>(new ChartOfAccountsTree(SAMPLE_CHART_OF_ACCOUNTS));
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set([1, 2])); // Expande categorias principais por padrão

  // Estados do modal - usando props do componente pai
  const isModalOpen = isModalOpenProp || chartAccountModalOpen;
  const setIsModalOpen = (open: boolean) => {
    setIsModalOpenProp(open);
    // Se o pai tiver o estado, atualizamos ele também
    // Nota: Como não temos acesso direto ao setter do pai aqui via props padrão 
    // (a menos que passemos), vamos garantir que o fechamento limpe tudo.
  };

  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedAccount, setSelectedAccount] = useState<any>(null);

  // Estados do formulário
  const [formData, setFormData] = useState({
    tipo: '',
    nome: '',
    categoria: '',
    subcategoria: '',
    incluirComo: ''
  });

  // Estados para ordenação
  const [chartSortField, setChartSortField] = useState<string>('');
  const [chartSortDirection, setChartSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleChartSort = (field: string) => {
    const direction = chartSortField === field && chartSortDirection === 'asc' ? 'desc' : 'asc';
    setChartSortField(field);
    setChartSortDirection(direction);
  };

  // --- FUNÇÕES AUXILIARES UNIFICADAS DO PLANO DE CONTAS ---

  // MAPEAMENTO AUTOMÁTICO DE CATEGORIAS PRINCIPAIS
  const mapearCategoriaParaTipo = (categoria: string): { type: string, code: string } => {
    const categoriaNormalizada = categoria.toLowerCase().trim();

    if (categoriaNormalizada.includes('receita') || categoriaNormalizada.includes('renda')) {
      return { type: 'receita', code: '1' };
    } else if (categoriaNormalizada.includes('despesa') || categoriaNormalizada.includes('gasto') || categoriaNormalizada.includes('custo')) {
      return { type: 'despesa', code: '2' };
    } else if (categoriaNormalizada.includes('ativo')) {
      return { type: 'ativo', code: '3' };
    } else if (categoriaNormalizada.includes('passivo')) {
      return { type: 'passivo', code: '4' };
    } else {
      // Para categorias personalizadas, usar sequência numérica
      const level1Codes = safeChartAccountsData?.filter(acc => acc.level === 1).map(acc => parseInt(acc.code)) || [];
      const maxCode = level1Codes.length > 0 ? Math.max(...level1Codes) : 4; // Começar após os tipos padrão
      return { type: categoria.toLowerCase(), code: (maxCode + 1).toString() };
    }
  };

  // GERAÇÃO DE CÓDIGO HIERÁRQUICO
  const generateHierarchicalCode = (level: number, parentId: number | null) => {
    if (level === 1) {
      // Nível 1: Códigos únicos sequenciais (1, 2, 3, 4...)
      const level1Codes = safeChartAccountsData?.filter(acc => acc.level === 1).map(acc => parseInt(acc.code)) || [];
      const maxCode = level1Codes.length > 0 ? Math.max(...level1Codes) : 0;
      return (maxCode + 1).toString();
    }

    if (parentId) {
      const parentAccount = safeChartAccountsData?.find(acc => acc.id === parentId);
      const parentCode = parentAccount ? parentAccount.code : (level === 2 ? '1' : level === 3 ? '1.1' : '1.1.1');

      // Contar filhos diretos do mesmo pai no mesmo nível
      const childrenCount = safeChartAccountsData?.filter(acc =>
        acc.parentId === parentId && acc.level === level
      ).length || 0;

      return `${parentCode}.${childrenCount + 1}`;
    }

    return '1';
  };

  // Função para ordenar dados
  const sortData = (data: any[], sortField: string, sortDirection: 'asc' | 'desc') => {
    if (!sortField) return data;

    return [...data].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Tratamento especial para datas
      if (sortField === 'dueDate' || sortField === 'date') {
        aVal = aVal ? new Date(aVal.split('/').reverse().join('-')) : new Date(0);
        bVal = bVal ? new Date(bVal.split('/').reverse().join('-')) : new Date(0);
      }

      // Tratamento especial para valores
      if (sortField === 'value' || sortField === 'amount') {
        aVal = parseFloat(aVal || 0);
        bVal = parseFloat(bVal || 0);
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Query para buscar contas
  const { data: chartAccounts, isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['/api/chart-accounts'],
    enabled: true
  });

  // Garantir que chartAccounts seja sempre um array
  const safeChartAccountsData: any[] = Array.isArray(chartAccounts) ? chartAccounts : [];

  // Dados ordenados
  const safeChartAccounts = sortData(safeChartAccountsData, chartSortField, chartSortDirection);

  // Mutation para criar conta
  const createAccountMutation = useMutation({
    mutationFn: async (accountData: any) => {
      const response = await fetch('/api/chart-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountData),
      });
      if (!response.ok) throw new Error('Falha ao criar conta');
      return response.json();
    },
    onSuccess: () => {
      // Forçar atualização completa do cache
      queryClient.invalidateQueries({ queryKey: ['/api/chart-accounts'] });
      queryClient.refetchQueries({ queryKey: ['/api/chart-accounts'] });
    },
  });

  // Mutation para atualizar conta
  const updateAccountMutation = useMutation({
    mutationFn: async ({ id, ...accountData }: any) => {
      const response = await fetch(`/api/chart-accounts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountData),
      });
      if (!response.ok) throw new Error('Falha ao atualizar conta');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chart-accounts'] });
    },
  });

  // Mutation para excluir conta
  const deleteAccountMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/chart-accounts/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(errorData.error || 'Falha ao excluir conta');
      }
      // Para DELETE 204, não há JSON para parsear
      return response.status === 204 ? { success: true } : response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chart-accounts'] });
    },
    onError: (error: any) => {
      showError('Erro ao excluir', error.message || 'Não foi possível excluir a conta. Tente novamente.');
    }
  });

  // Lista de categorias principais para os selects
  const categoriasPrincipais = chartTree.getCategories();

  // Função para obter subcategorias com base na categoria selecionada
  const getSubcategorias = () => {
    if (!formData.categoria) return [];
    const categoria = categoriasPrincipais.find(cat => cat.name === formData.categoria);
    return categoria ? chartTree.getSubcategories(categoria.id) : [];
  };

  // Função para alternar expansão de nós
  const toggleNode = (nodeId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (expandedNodes.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // Funções do modal
  const openCreateModal = () => {
    setModalMode('create');
    setSelectedAccount(null);
    setFormData({
      tipo: '',
      nome: '',
      categoria: '',
      subcategoria: '',
      incluirComo: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (account: any) => {
    // Verificar se a conta ainda existe antes de abrir modal de edição
    const existingAccount = safeChartAccountsData.find(acc => acc.id === account.id);
    if (!existingAccount) {
      showError("Conta não encontrada", "Esta conta pode ter sido excluída. Atualizando a lista...");
      queryClient.invalidateQueries({ queryKey: ['/api/chart-accounts'] });
      return;
    }

    setModalMode('edit');
    setSelectedAccount(existingAccount);

    // Lógica inteligente para popular campos de hierarquia baseado no nível
    setFormData({
      tipo: existingAccount.type || '',
      nome: existingAccount.name || '',
      // Nível 2 tem Categoria (Nível 1)
      categoria: existingAccount.level === 2 ? (safeChartAccountsData.find(acc => acc.id === existingAccount.parentId)?.type || '') : '',
      // Nível 3 tem Subcategoria (Nível 2)
      subcategoria: existingAccount.level === 3 ? (safeChartAccountsData.find(acc => acc.id === existingAccount.parentId)?.name || '') : '',
      // Nível 4 tem Incluir Como (Nível 3)
      incluirComo: existingAccount.level === 4 ? (safeChartAccountsData.find(acc => acc.id === existingAccount.parentId)?.name || '') : ''
    });
    setIsModalOpen(true);
  };

  const openViewModal = (account: any) => {
    setModalMode('view');
    setSelectedAccount(account);
    setFormData({
      tipo: account.type || '',
      nome: account.name || '',
      categoria: account.category || '',
      subcategoria: account.subcategory || '',
      incluirComo: account.parentId || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveAccount = async () => {
    // Validação - apenas Nome é obrigatório
    if (!formData.nome) {
      alert('Nome é obrigatório');
      return;
    }

    // GERAÇÃO DE CÓDIGO HIERÁRQUICO DEFINITIVO
    const generateHierarchicalCode = (targetLevel: number, targetParentId: number | null) => {
      if (targetLevel === 1) {
        // Nível 1: Códigos únicos sequenciais (1, 2, 3, 4...)
        const level1Codes = safeChartAccountsData?.filter(acc => acc.level === 1).map(acc => parseInt(acc.code)) || [];
        const maxCode = level1Codes.length > 0 ? Math.max(...level1Codes) : 0;
        return (maxCode + 1).toString();
      }

      if (targetLevel === 2) {
        // Nível 2: Código_do_pai.sequencial (ex: 3.1, 3.2, 3.3...)
        if (targetParentId) {
          const parentAccount = safeChartAccountsData?.find(acc => acc.id === targetParentId);
          const parentCode = parentAccount ? parentAccount.code : '1';

          // Contar filhos diretos do mesmo pai no nível 2
          const childrenCount = safeChartAccountsData?.filter(acc =>
            acc.parentId === targetParentId && acc.level === 2
          ).length || 0;

          return `${parentCode}.${childrenCount + 1}`;
        }
      }

      if (targetLevel === 3) {
        // Nível 3: Código_do_pai.sequencial (ex: 3.1.1, 3.1.2...)
        if (targetParentId) {
          const parentAccount = safeChartAccountsData?.find(acc => acc.id === targetParentId);
          const parentCode = parentAccount ? parentAccount.code : '1.1';

          const childrenCount = safeChartAccountsData?.filter(acc =>
            acc.parentId === targetParentId && acc.level === 3
          ).length || 0;

          return `${parentCode}.${childrenCount + 1}`;
        }
      }

      if (targetLevel === 4) {
        // Nível 4: Código_do_pai.sequencial (ex: 3.1.1.1, 3.1.1.2...)
        if (targetParentId) {
          const parentAccount = safeChartAccountsData?.find(acc => acc.id === targetParentId);
          const parentCode = parentAccount ? parentAccount.code : '1.1.1';

          const childrenCount = safeChartAccountsData?.filter(acc =>
            acc.parentId === targetParentId && acc.level === 4
          ).length || 0;

          return `${parentCode}.${childrenCount + 1}`;
        }
      }

      return '1';
    };

    // LÓGICA HIERÁRQUICA CORRETA COM AUTO-MAPEAMENTO
    let level: number = 1;
    let parentId: number | null = null;
    let category: string | null = null;
    let subcategory: string | null = null;
    let type: string = formData.nome.toLowerCase();

    // Se for EDIÇÃO e NÃO mudou nenhum campo de hierarquia, preservar nível e pai original
    const isEdit = modalMode === 'edit' && selectedAccount;
    const hierarquiaMudou = isEdit && (
      (selectedAccount.level === 1 && (formData.categoria || formData.subcategoria || formData.incluirComo)) ||
      (selectedAccount.level === 2 && (formData.subcategoria || formData.incluirComo)) ||
      (selectedAccount.level === 3 && (formData.incluirComo))
    );

    if (isEdit && !hierarquiaMudou) {
      level = selectedAccount.level;
      parentId = selectedAccount.parentId;
      category = selectedAccount.category;
      subcategory = selectedAccount.subcategory;
      type = selectedAccount.type;
    } else {
      // Lógica de detecção de nível normal (para novos ou mudança de hierarquia)
      if (formData.incluirComo) {
        level = 4;
        const parentAccount = safeChartAccountsData?.find(acc =>
          acc.name === formData.incluirComo && acc.level === 3
        );
        parentId = parentAccount ? parentAccount.id : null;
        category = formData.nome;
        subcategory = formData.nome;
        type = parentAccount ? parentAccount.type : mapearCategoriaParaTipo(formData.categoria || formData.nome).type;
      } else if (formData.subcategoria) {
        level = 3;
        const parentAccount = safeChartAccountsData?.find(acc =>
          acc.name === formData.subcategoria && acc.level === 2
        );
        parentId = parentAccount ? parentAccount.id : null;
        category = formData.nome;
        subcategory = formData.nome;
        type = parentAccount ? parentAccount.type : mapearCategoriaParaTipo(formData.categoria || formData.nome).type;
      } else if (formData.categoria) {
        level = 2;
        const categoriaMapping = mapearCategoriaParaTipo(formData.categoria);
        let parentAccount = safeChartAccountsData?.find(acc =>
          acc.type === categoriaMapping.type && acc.level === 1
        );
        if (!parentAccount) {
          parentAccount = safeChartAccountsData?.find(acc =>
            acc.name.toLowerCase().includes(formData.categoria.toLowerCase()) && acc.level === 1
          );
        }
        parentId = parentAccount ? parentAccount.id : null;
        type = parentAccount ? parentAccount.type : categoriaMapping.type;
        category = formData.nome;
      } else {
        level = 1;
        parentId = null;
        const categoriaMapping = mapearCategoriaParaTipo(formData.nome);
        category = formData.nome;
        type = categoriaMapping.type;
      }
    }

    // Função para gerar ou preservar código
    const finalCode = (isEdit && !hierarquiaMudou) ? selectedAccount.code : generateHierarchicalCode(level, parentId);

    const accountData = {
      userId: 2,
      parentId: parentId,
      code: finalCode,
      name: formData.nome,
      type: type,
      category: category,
      subcategory: subcategory,
      level: level,
      isActive: true,
      description: null
    };

    try {
      if (modalMode === 'create') {
        await createAccountMutation.mutateAsync(accountData);
      } else if (modalMode === 'edit' && selectedAccount) {
        await updateAccountMutation.mutateAsync({ id: selectedAccount.id, ...accountData });
      }
      setIsModalOpen(false);
      // Resetar formulário e estados
      setFormData({
        tipo: '',
        nome: '',
        categoria: '',
        subcategoria: '',
        incluirComo: ''
      });
      setSelectedAccount(null);
      setModalMode('create');
      showSuccess(modalMode === 'create' ? "Conta criada" : "Conta atualizada", "Operação realizada com sucesso.");
    } catch (error) {
      console.error('Erro ao salvar conta:', error);
      showError("Erro ao salvar", "Não foi possível salvar a conta. Verifique os dados e tente novamente.");
    }
  };

  const handleSaveAndContinue = async () => {
    // Validação - apenas Nome é obrigatório
    if (!formData.nome) {
      alert('Nome é obrigatório');
      return;
    }

    // Usar a mesma lógica de hierarquia (apenas para novas contas)
    const level = 1; // Simplificando redeclaração para evitar erro de lint
    const parentId = null;
    const type = mapearCategoriaParaTipo(formData.nome).type;

    // Lógica completa de detecção (reutilizando a estrutura mas sem redeclarar no mesmo escopo de forma conflitante)
    // Para simplificar e evitar erros de redeclaração, vamos apenas chamar a lógica de criação

    let finalLevel: number = 1;
    let finalParentId: number | null = null;
    let finalType: string = '';
    let finalCategory: string | null = formData.nome;
    let finalSubcategory: string | null = null;

    if (formData.incluirComo) {
      finalLevel = 4;
      const parentAcc = safeChartAccountsData?.find(acc => acc.name === formData.incluirComo && acc.level === 3);
      finalParentId = parentAcc ? parentAcc.id : null;
      finalType = parentAcc ? parentAcc.type : mapearCategoriaParaTipo(formData.nome).type;
    } else if (formData.subcategoria) {
      finalLevel = 3;
      const parentAcc = safeChartAccountsData?.find(acc => acc.name === formData.subcategoria && acc.level === 2);
      finalParentId = parentAcc ? parentAcc.id : null;
      finalType = parentAcc ? parentAcc.type : mapearCategoriaParaTipo(formData.nome).type;
    } else if (formData.categoria) {
      finalLevel = 2;
      const mapping = mapearCategoriaParaTipo(formData.categoria);
      const parentAcc = safeChartAccountsData?.find(acc => acc.type === mapping.type && acc.level === 1);
      finalParentId = parentAcc ? parentAcc.id : null;
      finalType = parentAcc ? parentAcc.type : mapping.type;
    } else {
      finalLevel = 1;
      finalType = mapearCategoriaParaTipo(formData.nome).type;
    }

    const accountData = {
      userId: 2,
      parentId: finalParentId,
      code: generateHierarchicalCode(finalLevel, finalParentId),
      name: formData.nome,
      type: finalType,
      category: finalCategory,
      subcategory: finalSubcategory,
      level: finalLevel,
      isActive: true,
      description: null
    };

    try {
      await createAccountMutation.mutateAsync(accountData);
      setFormData({
        tipo: '',
        nome: '',
        categoria: '',
        subcategoria: '',
        incluirComo: ''
      });
      setModalMode('create');
      setSelectedAccount(null);
      showSuccess("Conta criada", "Você pode continuar adicionando novas contas.");
    } catch (error) {
      console.error('Erro ao salvar e continuar:', error);
      showError("Erro ao salvar", "Verifique os dados e tente novamente.");
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    // Previne cliques duplos verificando se já há uma operação em andamento
    if (deleteAccountMutation.isPending) {
      return;
    }

    showConfirm(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir esta conta?",
      async () => {
        try {
          await deleteAccountMutation.mutateAsync(accountId);
          showSuccess("Conta excluída", "A conta foi excluída com sucesso.");
        } catch (error) {
          console.error('Erro ao excluir conta:', error);
          // O erro já é tratado pela mutation através do onError
        }
      }
    );
  };

  // Função para salvar conta (compatibilidade)
  const handleSave = (continueAdding = false) => {
    if (continueAdding) {
      handleSaveAndContinue();
    } else {
      handleSaveAccount();
    }
  };

  // Função para fechar modal (compatibilidade)
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      tipo: '',
      nome: '',
      categoria: '',
      subcategoria: '',
      incluirComo: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho sem botão duplicado */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Plano de Contas</h3>
        <p className="text-sm text-gray-600">
          Organize suas contas em estrutura hierárquica
        </p>
      </div>



      {/* Lista de contas em tabela - Modelo baseado na imagem */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Cabeçalho da tabela */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Estrutura do Plano de Contas
          </h3>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white border-b border-gray-200">
              <tr>
                <th
                  className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleChartSort('id')}
                >
                  <div className="flex items-center gap-1">
                    #
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleChartSort('code')}
                >
                  <div className="flex items-center gap-1">
                    Código
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleChartSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Nome da Conta
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleChartSort('type')}
                >
                  <div className="flex items-center gap-1">
                    Tipo
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleChartSort('level')}
                >
                  <div className="flex items-center gap-1">
                    Nível
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoadingAccounts ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Carregando contas...
                  </td>
                </tr>
              ) : safeChartAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nenhuma conta cadastrada. Clique no botão "+" para criar a primeira conta.
                  </td>
                </tr>
              ) : (
                safeChartAccounts.map((account: any, index: number) => (
                  <tr key={account.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-[#1D3557]/5 transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {account.code || `${account.type.toUpperCase()}-${String(index + 1).padStart(3, '0')}`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div style={{ paddingLeft: `${(account.level || 1) * 20}px` }} className="flex items-center gap-2">
                        {(account.level || 1) > 1 && (
                          <div className="text-gray-400 text-sm">
                            {'└─ '.repeat(1)}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{account.name}</div>
                          {account.description && (
                            <div className="text-sm text-gray-500">{account.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(account.type === 'receita' || account.type === 'receitas') ? 'bg-[#1D3557]/15 text-[#1D3557]' :
                        (account.type === 'despesa' || account.type === 'despesas') ? 'bg-red-100 text-red-800' :
                          account.type === 'ativo' ? 'bg-[#1D3557]/15 text-[#1D3557]' :
                            'bg-purple-100 text-purple-800'
                        }`}>
                        {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Nível {account.level || 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(account)}
                          className="text-[#B59363] hover:text-[#1D3557] p-1.5 hover:bg-[#B59363]/10 rounded transition-colors"
                          title="Editar conta"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openViewModal(account)}
                          className="text-green-600 hover:text-green-900 p-1.5 hover:bg-green-100 rounded transition-colors"
                          title="Visualizar conta"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(account.id.toString())}
                          disabled={deleteAccountMutation.isPending}
                          className={`p-1.5 rounded transition-colors ${deleteAccountMutation.isPending
                            ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                            : 'text-red-600 hover:text-red-900 hover:bg-red-100'
                            }`}
                          title={deleteAccountMutation.isPending ? "Excluindo..." : "Excluir conta"}
                          data-testid={`button-delete-account-${account.id}`}
                        >
                          <Trash2 className={`h-4 w-4 ${deleteAccountMutation.isPending ? 'animate-pulse' : ''}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé com paginação similar à imagem */}
        {safeChartAccounts.length > 0 && (
          <div className="bg-white px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>

              <div className="text-sm text-gray-700">
                Mostrando 1 a {Math.min(10, safeChartAccounts.length)} de {safeChartAccounts.length} resultados
              </div>

              <div className="flex items-center gap-1">
                <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled>
                  Anterior
                </button>
                <button className="px-3 py-1 text-sm bg-[#B59363] text-white rounded">
                  1
                </button>
                <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
                  Próxima
                </button>
              </div>
            </div>
          </div>
        )}
      </div>



      {/* Modal Nova categoria - Baseado na imagem exata */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-200 rounded-lg w-full max-w-lg mx-4 transform transition-all duration-300 scale-100"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
            {/* Cabeçalho */}
            <div className="flex items-center justify-between p-6 pb-2">
              <h2 className="text-xl font-bold text-[#1D3557]">Nova categoria</h2>
            </div>

            {/* Campos do formulário */}
            <div className="px-6 space-y-6">
              {/* Primeira linha: Categoria e Nome */}
              <div className="grid grid-cols-2 gap-4">
                {/* Campo Categoria com Material-UI */}
                <FormControl variant="standard" fullWidth>
                  <InputLabel id="categoria-label">Categoria</InputLabel>
                  <Select
                    labelId="categoria-label"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    label="Categoria"
                  >
                    <MenuItem value="">
                      <em>Selecione...</em>
                    </MenuItem>
                    {/* Categorias dinâmicas baseadas nos itens salvos nível 1 */}
                    {safeChartAccountsData?.filter(acc => acc.level === 1)
                      .map(acc => (
                        <MenuItem key={acc.id} value={acc.type}>
                          {acc.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>

                {/* Campo Nome com Material-UI */}
                <TextField
                  label="Nome *"
                  variant="standard"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  fullWidth
                  required
                  sx={{
                    '& .MuiInputLabel-root': { color: '#1D3557' },
                    '& .MuiInput-underline:after': { borderBottomColor: '#B59363' }
                  }}
                />
              </div>



              {/* Campo Subcategoria de - linha completa com Material-UI */}
              <FormControl variant="standard" fullWidth>
                <InputLabel id="subcategoria-label">Subcategoria de</InputLabel>
                <Select
                  labelId="subcategoria-label"
                  value={formData.subcategoria}
                  onChange={(e) => setFormData({ ...formData, subcategoria: e.target.value })}
                  label="Subcategoria de"
                >
                  <MenuItem value="">
                    <em>Selecione...</em>
                  </MenuItem>
                  {/* Subcategorias: mostrar itens nível 2 */}
                  {safeChartAccountsData?.filter(acc => acc.level === 2)
                    .map(acc => (
                      <MenuItem key={acc.id} value={acc.name}>
                        {acc.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              {/* Campo Incluir como filha de - linha completa com Material-UI */}
              <FormControl variant="standard" fullWidth>
                <InputLabel id="incluir-como-label">Incluir como filha de</InputLabel>
                <Select
                  labelId="incluir-como-label"
                  value={formData.incluirComo}
                  onChange={(e) => setFormData({ ...formData, incluirComo: e.target.value })}
                  label="Incluir como filha de"
                >
                  <MenuItem value="">
                    <em>Selecione...</em>
                  </MenuItem>
                  {/* Incluir como filha de: mostrar itens nível 3 */}
                  {safeChartAccountsData?.filter(acc => acc.level === 3)
                    .map(acc => (
                      <MenuItem key={acc.id} value={acc.name}>
                        {acc.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </div>

            {/* Botões - posicionados conforme a nova diretiva */}
            <div className="flex justify-end items-center gap-3 p-6 pt-8">
              <IButtonPrime
                icon={<Save className="h-4 w-4" />}
                variant="gold"
                title="Salvar"
                onClick={() => handleSave(false)}
                disabled={!formData.nome || createAccountMutation.isPending}
              />
              <IButtonPrime
                icon={<LogOut className="h-4 w-4" />}
                variant="red"
                title="Sair"
                onClick={() => setIsModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal será renderizado no componente principal */}

      {/* Componentes de Diálogo */}
      <SuccessDialog />
      <ErrorDialog />
      <ConfirmDialog />
    </div>
  );
}

export default Transactions;
