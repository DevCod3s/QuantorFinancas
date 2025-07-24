/**
 * @fileoverview Página de gestão financeira do sistema Quantor
 * 
 * Renomeada de "Transações" para "Finanças" com funcionalidades avançadas:
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
import { Plus, Edit, Trash2, Search, Filter, Eye, TrendingUp, TrendingDown, DollarSign, CreditCard, Building, Target, Activity, FileText, Clock, CheckCircle, Calendar, Settings, ChevronLeft, ChevronRight, Save, X, ChevronDown, ChevronRight as ChevronRightIcon, ArrowUpDown, Download, AlertTriangle, Building2 } from "lucide-react";

// Importações Material-UI
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';

// Importações de componentes UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubTabs } from "@/components/SubTabs";

// Importações de tipos
import { Transaction } from "@shared/schema";
import { ChartOfAccountsTree, ChartOfAccountNode, SAMPLE_CHART_OF_ACCOUNTS } from "@/types/ChartOfAccountsTree";
import { FloatingInput, FloatingSelect } from "@/components/ui/floating-input";
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

export function Transactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [activeTab, setActiveTab] = useState("visao-geral");
  const [progressWidth, setProgressWidth] = useState(0);
  const tabListRef = useRef<HTMLDivElement>(null);
  const [currentMonth, setCurrentMonth] = useState("julho 2025");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filterPeriod, setFilterPeriod] = useState("Mensal");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [chartAccountModalOpen, setChartAccountModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    subcategoria: '',
    incluirComo: ''
  });
  
  const queryClient = useQueryClient();
  
  // Importar dialogs personalizados
  const { showSuccess, SuccessDialog: SuccessDialogComponent } = useSuccessDialog();
  const { showError, ErrorDialog: ErrorDialogComponent } = useErrorDialog();
  const { showConfirm, ConfirmDialog: ConfirmDialogComponent } = useConfirmDialog();
  
  // Estados para controle de ordenação e paginação
  const [payablesSortField, setPayablesSortField] = useState<string>('');
  const [payablesSortDirection, setPayablesSortDirection] = useState<'asc' | 'desc'>('asc');
  const [payablesCurrentPage, setPayablesCurrentPage] = useState(1);
  const [payablesItemsPerPage] = useState(10);
  
  const [receivablesSortField, setReceivablesSortField] = useState<string>('');
  const [receivablesSortDirection, setReceivablesSortDirection] = useState<'asc' | 'desc'>('asc');
  const [receivablesCurrentPage, setReceivablesCurrentPage] = useState(1);
  const [receivablesItemsPerPage] = useState(10);
  
  // Dados mockados para À Pagar
  const payablesData = [
    { id: 1, company: 'Banco Santander', cnpj: '90.400.888/0001-42', dueDate: '10/01/2025', product: 'Cartão de Crédito', type: 'Parcela', status: 'Vencida', value: 280.00 },
    { id: 2, company: 'Imobiliária Santos', cnpj: '12.345.678/0001-90', dueDate: '05/02/2025', product: 'Aluguel Comercial', type: 'Mensal', status: 'Pendente', value: 1200.00 },
    { id: 3, company: 'Caixa Econômica Federal', cnpj: '00.360.305/0001-04', dueDate: '15/02/2025', product: 'Financiamento Imóvel', type: 'Parcela', status: 'Em dia', value: 485.00 },
    { id: 4, company: 'Companhia Energética de GO', cnpj: '01.628.539/0001-73', dueDate: '20/02/2025', product: 'Energia Elétrica', type: 'Mensal', status: 'Em dia', value: 125.00 },
    { id: 5, company: 'Telefonia Ltda', cnpj: '98.765.432/0001-10', dueDate: '22/02/2025', product: 'Telefone Comercial', type: 'Mensal', status: 'Em dia', value: 75.00 }
  ];
  
  // Dados mockados para À Receber
  const receivablesData = [
    { id: 1, company: 'Empresa ABC Ltda', cnpj: '33.222.111/0001-55', dueDate: '15/01/2025', product: 'Salário', type: 'Mensal', status: 'Confirmado', value: 3500.00 },
    { id: 2, company: 'Cliente XYZ Ltda', cnpj: '44.555.666/0001-77', dueDate: '22/01/2025', product: 'Projeto Freelance', type: 'Parcela', status: 'Pendente', value: 450.00 },
    { id: 3, company: 'Banco do Brasil', cnpj: '00.000.000/0001-91', dueDate: '30/01/2025', product: 'Rendimento Poupança', type: 'Rendimento', status: 'Automático', value: 25.30 },
    { id: 4, company: 'Nubank', cnpj: '18.236.120/0001-58', dueDate: '05/02/2025', product: 'Cashback Cartão', type: 'Cashback', status: 'Automático', value: 28.40 }
  ];
  
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
        aVal = new Date(aVal.split('/').reverse().join('-'));
        bVal = new Date(bVal.split('/').reverse().join('-'));
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

  // Mutation para criar conta
  const createAccountMutation = useMutation({
    mutationFn: (accountData: any) => 
      fetch('/api/chart-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountData)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chart-accounts'] });
      showSuccess('Conta criada com sucesso!');
      setChartAccountModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      showError(error.message || 'Erro ao criar conta');
    }
  });

  // Mutation para atualizar conta
  const updateAccountMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      fetch(`/api/chart-accounts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chart-accounts'] });
      showSuccess('Conta atualizada com sucesso!');
      setChartAccountModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      showError(error.message || 'Erro ao atualizar conta');
    }
  });

  // Mutation para excluir conta
  const deleteAccountMutation = useMutation({
    mutationFn: (id: number) => 
      fetch(`/api/chart-accounts/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chart-accounts'] });
      showSuccess('Conta excluída com sucesso!');
    },
    onError: (error: any) => {
      showError(error.message || 'Erro ao excluir conta');
    }
  });

  // Funções auxiliares para gerenciar o modal
  const resetForm = () => {
    setFormData({
      tipo: '',
      nome: '',
      categoria: '',
      subcategoria: '',
      incluirComo: ''
    });
    setEditingAccount(null);
    setModalMode('create');
  };

  const openCreateModal = () => {
    resetForm();
    setModalMode('create');
    setChartAccountModalOpen(true);
  };

  const openEditModal = (account: any) => {
    setFormData({
      tipo: account.type || '',
      nome: account.name || '',
      categoria: account.category || '',
      subcategoria: account.subcategory || '',
      incluirComo: account.parentId ? account.parentId.toString() : ''
    });
    setEditingAccount(account);
    setModalMode('edit');
    setChartAccountModalOpen(true);
  };

  const openViewModal = (account: any) => {
    setFormData({
      tipo: account.type || '',
      nome: account.name || '',
      categoria: account.category || '',
      subcategoria: account.subcategory || '',
      incluirComo: account.parentId ? account.parentId.toString() : ''
    });
    setEditingAccount(account);
    setModalMode('view');
    setChartAccountModalOpen(true);
  };

  const handleDeleteAccount = (account: any) => {
    if (window.confirm(`Tem certeza que deseja excluir a conta "${account.name}"?`)) {
      deleteAccountMutation.mutate(account.id);
    }
  };

  // Função para salvar conta (criar ou editar)
  const handleSaveAccount = () => {
    // Validação básica
    if (!formData.nome.trim()) {
      showError('Nome da conta é obrigatório');
      return;
    }
    if (!formData.categoria) {
      showError('Tipo da conta é obrigatório');
      return;
    }

    const accountData = {
      name: formData.nome,
      type: formData.categoria,
      category: formData.categoria || null,
      subcategory: formData.subcategoria || null,
      parentId: formData.incluirComo ? parseInt(formData.incluirComo) : null,
      level: 1, // Será calculado pelo backend
      code: '', // Será gerado pelo backend
    };

    if (modalMode === 'edit' && editingAccount) {
      updateAccountMutation.mutate({
        id: editingAccount.id,
        data: accountData
      });
    } else {
      createAccountMutation.mutate(accountData);
    }
  };

  // Função para salvar e continuar (criar mais uma conta)
  const handleSaveAndContinue = () => {
    // Validação básica
    if (!formData.nome.trim()) {
      showError('Nome da conta é obrigatório');
      return;
    }
    if (!formData.categoria) {
      showError('Tipo da conta é obrigatório');
      return;
    }

    const accountData = {
      name: formData.nome,
      type: formData.categoria,
      category: formData.categoria || null,
      subcategory: formData.subcategoria || null,
      parentId: formData.incluirComo ? parseInt(formData.incluirComo) : null,
      level: 1, // Será calculado pelo backend
      code: '', // Será gerado pelo backend
    };

    // Criar mutation que não fecha o modal
    const createAndContinueMutation = {
      mutationFn: (data: any) => 
        fetch('/api/chart-accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).then(res => res.json()),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/chart-accounts'] });
        showSuccess('Conta criada com sucesso! Você pode continuar criando mais contas.');
        // Limpar apenas o nome, manter outras seleções
        setFormData({
          ...formData,
          nome: ''
        });
      },
      onError: (error: any) => {
        showError(error.message || 'Erro ao criar conta');
      }
    };

    // Simular a mutation
    createAndContinueMutation.mutationFn(accountData)
      .then(createAndContinueMutation.onSuccess)
      .catch(createAndContinueMutation.onError);
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
          // Define a posição e largura final
          progressBar.style.setProperty('--progress-left', `${leftOffset}px`);
          progressBar.style.setProperty('--progress-width', `${width}px`);
          
          // Remove animação anterior e força reset
          progressBar.style.animation = 'none';
          progressBar.offsetHeight; // Força repaint
          
          // Aplica nova animação
          progressBar.style.animation = 'progressFill 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards';
        }
      }
    };

    // Delay para garantir que o DOM foi atualizado
    const timer = setTimeout(updateProgressBar, 50);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || transaction.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(amount));
  };

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
              if (activeTab === "centro-custo") {
                openCreateModal();
              }
            }}
            className="group relative w-11 h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 active:shadow-md"
            title={activeTab === "centro-custo" ? "Nova Conta - Plano de Contas" : "Adicionar Novo"}
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
            {activeTab === "centro-custo" ? "Nova Conta - Plano de Contas" : "Adicionar Novo"}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="relative" ref={tabListRef}>
          <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4 bg-gray-100 p-1 rounded-lg relative">
            <TabsTrigger 
              value="visao-geral" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-medium px-6 py-2 transition-all relative overflow-hidden"
            >
              <Eye className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger 
              value="movimentacoes"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-medium px-6 py-2 transition-all relative overflow-hidden"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Movimentações
            </TabsTrigger>
            <TabsTrigger 
              value="contas"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-medium px-6 py-2 transition-all relative overflow-hidden"
            >
              <Building className="h-4 w-4 mr-2" />
              Contas
            </TabsTrigger>
            <TabsTrigger 
              value="centro-custo"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-medium px-6 py-2 transition-all relative overflow-hidden"
            >
              <Target className="h-4 w-4 mr-2" />
              Centro de Custo
            </TabsTrigger>
          </TabsList>
          
          {/* Barra de progressão inteligente e animada */}
          <div className="absolute bottom-1 left-1 right-1 h-0.5 overflow-hidden">
            <div 
              className="progress-bar absolute bottom-0 h-full bg-blue-600 rounded-full"
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
                    {/* Grid de cards com gráficos */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Card Fluxo de Caixa */}
                      <Card className="col-span-1 lg:col-span-2">
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
                                    className={filterPeriod === 'Semanal' ? 'bg-blue-50 text-blue-600' : ''}
                                  >
                                    Semanal
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleFilterChange('Mensal')}
                                    className={filterPeriod === 'Mensal' ? 'bg-blue-50 text-blue-600' : ''}
                                  >
                                    Mensal
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleFilterChange('Trimestral')}
                                    className={filterPeriod === 'Trimestral' ? 'bg-blue-50 text-blue-600' : ''}
                                  >
                                    Trimestral
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleFilterChange('Semestral')}
                                    className={filterPeriod === 'Semestral' ? 'bg-blue-50 text-blue-600' : ''}
                                  >
                                    Semestral
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleFilterChange('Anual')}
                                    className={filterPeriod === 'Anual' ? 'bg-blue-50 text-blue-600' : ''}
                                  >
                                    Anual
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleFilterChange('Personalizar')}
                                    className={filterPeriod === 'Personalizar' ? 'bg-blue-50 text-blue-600' : ''}
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
                                labels: ['04 Jul', '06 Jul', '08 Jul', '10 Jul', '12 Jul', '14 Jul', '16 Jul', '18 Jul', '20 Jul', '22 Jul', '24 Jul', '26 Jul', '28 Jul', '30 Jul'],
                                datasets: [
                                  {
                                    label: 'Banco Inter',
                                    data: [1000, 2500, 2800, 1500, 2200, 2800, 3500, 3200, 2800, 3200, 3500, 3800, 2500, 2264.77],
                                    borderColor: '#3b82f6',
                                    backgroundColor: 'transparent',
                                    tension: 0.4,
                                    pointRadius: 3,
                                  },
                                  {
                                    label: 'Bancos | Pessoa Física',
                                    data: [500, 800, 600, 900, 750, 650, 850, 700, 950, 800, 900, 850, 750, 59.88],
                                    borderColor: '#10b981',
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
                                      callback: function(value) {
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
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span>Banco Inter</span>
                              </div>
                              <span className="font-medium">2.264,77</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span>Bancos | Pessoa Física</span>
                              </div>
                              <span className="font-medium">59,88</span>
                            </div>
                            <div className="flex items-center justify-between text-sm font-semibold border-t pt-2">
                              <span>Total</span>
                              <span>R$ 2.324,65</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Card Saldos de Caixa */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg font-semibold">Saldos de caixa</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <input type="checkbox" checked className="text-blue-600" readOnly />
                                <span className="text-sm">Banco Inter</span>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">640,00</div>
                                <div className="text-xs text-gray-500">2.264,77</div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <input type="checkbox" checked className="text-orange-600" readOnly />
                                <span className="text-sm">Bancos | Pessoa Física</span>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">59,88</div>
                                <div className="text-xs text-gray-500">-</div>
                              </div>
                            </div>
                            <div className="border-t pt-3">
                              <div className="flex items-center justify-between font-semibold">
                                <span>Total</span>
                                <div className="text-right">
                                  <div>699,88</div>
                                  <div className="text-xs font-normal text-gray-500">2.264,65</div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Gráfico de resultado do mês */}
                            <div className="mt-6">
                              <h4 className="text-sm font-medium mb-2">Resultado do mês</h4>
                              <p className="text-xs text-gray-500 mb-4">Despesas projetadas</p>
                              <div className="h-32">
                                <Bar
                                  data={{
                                    labels: ['Receitas', 'Despesas'],
                                    datasets: [{
                                      data: [11105.00, 9242.27],
                                      backgroundColor: ['#10b981', '#ef4444'],
                                      borderRadius: 4,
                                    }]
                                  }}
                                  options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                      legend: {
                                        display: false
                                      }
                                    },
                                    scales: {
                                      y: {
                                        display: false
                                      },
                                      x: {
                                        display: false
                                      }
                                    }
                                  }}
                                />
                              </div>
                              <div className="mt-3 space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span>Receitas</span>
                                  </div>
                                  <span className="font-medium">11.105,00</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <span>Despesas</span>
                                  </div>
                                  <span className="font-medium">9.242,27</span>
                                </div>
                                <div className="flex items-center justify-between text-sm font-semibold border-t pt-2">
                                  <span>Resultado</span>
                                  <span className="text-green-600">R$ 1.862,73</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Card Despesas por Categoria */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg font-semibold">Despesas por categoria</CardTitle>
                          <CardDescription className="text-sm text-gray-500">Gastos projetados</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-48">
                            <Doughnut
                              data={{
                                labels: ['Fornecedores', 'Pessoas', 'Prestador de Serviço', 'Residencial', 'Pessoal/Saúde e Bem-estar', 'Diversos'],
                                datasets: [{
                                  data: [73.24, 10.84, 7.97, 5.06, 1.93, 0.97],
                                  backgroundColor: [
                                    '#3b82f6',
                                    '#10b981', 
                                    '#f59e0b',
                                    '#ef4444',
                                    '#8b5cf6',
                                    '#6b7280'
                                  ],
                                  borderWidth: 0,
                                }]
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                cutout: '60%',
                                plugins: {
                                  legend: {
                                    display: false
                                  }
                                }
                              }}
                            />
                          </div>
                          <div className="mt-4 space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span>Fornecedores</span>
                                <span className="text-gray-500">73,24%</span>
                              </div>
                              <span className="font-medium text-red-600">-R$ 6.769,50</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span>Pessoas</span>
                                <span className="text-gray-500">10,84%</span>
                              </div>
                              <span className="font-medium text-red-600">-R$ 1.002,33</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <span>Prestador de Serviço</span>
                                <span className="text-gray-500">7,97%</span>
                              </div>
                              <span className="font-medium text-red-600">-R$ 700,00</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span>Residencial</span>
                                <span className="text-gray-500">5,06%</span>
                              </div>
                              <span className="font-medium text-red-600">-R$ 587,74</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                <span>Pessoal | Saúde e Bem-estar</span>
                                <span className="text-gray-500">1,93%</span>
                              </div>
                              <span className="font-medium text-red-600">-R$ 178,70</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                                <span>Diversos</span>
                                <span className="text-gray-500">0,97%</span>
                              </div>
                              <span className="font-medium text-red-600">-R$ 90,00</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Card Receitas por Categoria */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg font-semibold">Receitas por Categoria</CardTitle>
                          <CardDescription className="text-sm text-gray-500">Entradas projetadas</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-48">
                            <Doughnut
                              data={{
                                labels: ['Vendas', 'Serviços', 'Freelances', 'Investimentos', 'Outros'],
                                datasets: [{
                                  data: [65.5, 20.3, 8.7, 3.8, 1.7],
                                  backgroundColor: [
                                    '#10b981',
                                    '#3b82f6', 
                                    '#f59e0b',
                                    '#8b5cf6',
                                    '#6b7280'
                                  ],
                                  borderWidth: 0,
                                }]
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                cutout: '60%',
                                plugins: {
                                  legend: {
                                    display: false
                                  }
                                }
                              }}
                            />
                          </div>
                          <div className="mt-4 space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span>Vendas</span>
                                <span className="text-gray-500">65,5%</span>
                              </div>
                              <span className="font-medium text-green-600">+R$ 7.273,78</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span>Serviços</span>
                                <span className="text-gray-500">20,3%</span>
                              </div>
                              <span className="font-medium text-green-600">+R$ 2.254,32</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <span>Freelances</span>
                                <span className="text-gray-500">8,7%</span>
                              </div>
                              <span className="font-medium text-green-600">+R$ 966,14</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                <span>Investimentos</span>
                                <span className="text-gray-500">3,8%</span>
                              </div>
                              <span className="font-medium text-green-600">+R$ 421,99</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                                <span>Outros</span>
                                <span className="text-gray-500">1,7%</span>
                              </div>
                              <span className="font-medium text-green-600">+R$ 188,77</span>
                            </div>
                          </div>
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
                    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
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
                                  className={filterPeriod === 'Semanal' ? 'bg-blue-50 text-blue-600' : ''}
                                >
                                  Semanal
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleFilterChange('Mensal')}
                                  className={filterPeriod === 'Mensal' ? 'bg-blue-50 text-blue-600' : ''}
                                >
                                  Mensal
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleFilterChange('Trimestral')}
                                  className={filterPeriod === 'Trimestral' ? 'bg-blue-50 text-blue-600' : ''}
                                >
                                  Trimestral
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleFilterChange('Semestral')}
                                  className={filterPeriod === 'Semestral' ? 'bg-blue-50 text-blue-600' : ''}
                                >
                                  Semestral
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleFilterChange('Anual')}
                                  className={filterPeriod === 'Anual' ? 'bg-blue-50 text-blue-600' : ''}
                                >
                                  Anual
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleFilterChange('Personalizar')}
                                  className={filterPeriod === 'Personalizar' ? 'bg-blue-50 text-blue-600' : ''}
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
                            <div className="grid grid-cols-6 gap-4 text-sm items-center">
                              <div className="flex items-center gap-2">
                                <input type="checkbox" checked className="text-blue-500" readOnly />
                                <span>Banco Inter</span>
                              </div>
                              <div></div>
                              <div></div>
                              <div></div>
                              <div className="text-right font-medium">2.264,77</div>
                              <div className="text-right text-green-600 font-medium">860,92</div>
                            </div>
                            <div className="grid grid-cols-6 gap-4 text-sm items-center">
                              <div className="flex items-center gap-2">
                                <input type="checkbox" checked className="text-orange-500" readOnly />
                                <span>Bancos | Pessoa Física</span>
                              </div>
                              <div></div>
                              <div></div>
                              <div></div>
                              <div className="text-right font-medium">59,88</div>
                              <div className="text-right text-green-600 font-medium">2.779,92</div>
                            </div>
                            <div className="grid grid-cols-6 gap-4 text-sm items-center border-t pt-2 font-semibold">
                              <div>Total</div>
                              <div></div>
                              <div></div>
                              <div></div>
                              <div className="text-right">2.324,65</div>
                              <div></div>
                            </div>
                          </div>

                          {/* Lançamentos por data */}
                          <div className="space-y-1 mt-6">
                            {[
                              { date: "05/07/2025", entrada: "2.315,00", saida: "0,00", resultado: "2.315,00", saldo: "" },
                              { date: "07/07/2025", entrada: "0,00", saida: "35,00", resultado: "-35,00", saldo: "2.740,92" },
                              { date: "08/07/2025", entrada: "0,00", saida: "141,34", resultado: "-141,34", saldo: "2.399,58" },
                              { date: "10/07/2025", entrada: "2.826,00", saida: "2.142,50", resultado: "407,50", saldo: "2.807,08" },
                              { date: "11/07/2025", entrada: "0,00", saida: "1.307,28", resultado: "-1.307,28", saldo: "1.499,80" },
                              { date: "14/07/2025", entrada: "370,00", saida: "99,00", resultado: "271,00", saldo: "1.770,80" },
                              { date: "15/07/2025", entrada: "1.449,00", saida: "0,00", resultado: "1.449,00", saldo: "3.219,80" },
                              { date: "17/07/2025", entrada: "865,00", saida: "1.137,74", resultado: "-267,74", saldo: "953,14" },
                              { date: "20/07/2025", entrada: "1.069,00", saida: "0,00", resultado: "1.069,00", saldo: "2.023,14" },
                              { date: "21/07/2025", entrada: "1.200,00", saida: "0,00", resultado: "1.200,00", saldo: "3.223,14" },
                              { date: "25/07/2025", entrada: "0,00", saida: "2.176,49", resultado: "-2.176,49", saldo: "1.024,65" },
                              { date: "26/07/2025", entrada: "1.300,00", saida: "0,00", resultado: "1.300,00", saldo: "2.324,65" }
                            ].map((item, index) => (
                              <div key={index} className="grid grid-cols-6 gap-4 text-sm py-1 hover:bg-gray-50 rounded">
                                <div className="text-gray-700">{item.date}</div>
                                <div className="text-center text-green-600">{item.entrada !== "0,00" ? item.entrada : ""}</div>
                                <div className="text-center text-red-600">{item.saida !== "0,00" ? item.saida : ""}</div>
                                <div className={`text-center font-medium ${item.resultado.startsWith("-") ? "text-red-600" : "text-green-600"}`}>
                                  {item.resultado}
                                </div>
                                <div className="text-right font-medium">{item.saldo}</div>
                                <div></div>
                              </div>
                            ))}
                            
                            {/* Total */}
                            <div className="grid grid-cols-6 gap-4 text-sm py-2 border-t font-semibold bg-gray-50 rounded">
                              <div>Total</div>
                              <div className="text-center text-green-600">11.195,00</div>
                              <div className="text-center text-red-600">9.241,27</div>
                              <div className="text-center text-green-600">1.953,73</div>
                              <div></div>
                              <div></div>
                            </div>
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
                              labels: ['05/07', '07/07', '08/07', '10/07', '11/07', '14/07', '15/07', '17/07', '20/07', '21/07', '25/07', '26/07'],
                              datasets: [{
                                data: [2315, -35, -141.34, 407.5, -1307.28, 271, 1449, -267.74, 1069, 1200, -2176.49, 1300],
                                backgroundColor: function(context: any) {
                                  const value = context.parsed.y;
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
                                    label: function(context) {
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
                                    callback: function(value) {
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
        </TabsContent>

        <TabsContent value="movimentacoes" className="space-y-6">
          <SubTabs
            defaultValue="a-pagar"
            tabs={[
              {
                value: "a-pagar",
                label: "À Pagar",
                icon: <Clock className="h-4 w-4" />,
                content: (
                  <div className="flex gap-6">
                    {/* Coluna esquerda - Cards pequenos */}
                    <div className="w-80 flex-shrink-0 space-y-6">
                      {/* Card 1 - Resultado no período */}
                      <Card className="shadow-lg">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base font-semibold">Resultado no período</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-left gap-2">
                              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                              <span className="text-xs text-gray-700">À pagar</span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-bold text-red-600">-2.850,23</span>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-left gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-gray-700">À receber</span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-bold text-green-600">4.830,00</span>
                            </div>
                          </div>
                          
                          <div className="border-t pt-3 mt-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-left gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-xs text-gray-700 font-medium">Resultado</span>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-bold text-blue-600">1.979,77</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Card 2 - Bancos e saldos */}
                      <Card className="shadow-lg">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold">Contas</CardTitle>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-xs text-gray-500">Banco Inter</span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <input type="checkbox" checked className="text-blue-500" readOnly />
                                <span className="text-xs text-gray-700">Banco Inter</span>
                              </div>
                              <span className="text-xs font-medium">2.264,77</span>
                            </div>
                            <div className="text-right">
                              <span className="text-green-600 font-bold">860,92</span>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <input type="checkbox" checked className="text-orange-500" readOnly />
                                <span className="text-xs text-gray-700">Bancos | Pessoa Física</span>
                              </div>
                              <span className="text-xs font-medium">59,88</span>
                            </div>
                            <div className="text-right">
                              <span className="text-green-600 font-bold">2.779,92</span>
                            </div>
                          </div>
                          
                          <div className="border-t pt-3 mt-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-700 font-medium">Total</span>
                              <span className="text-xs font-bold">2.324,65</span>
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
                        <CardContent>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left py-2 px-3 font-medium text-gray-600 cursor-pointer hover:bg-gray-50 text-xs" onClick={() => handlePayablesSort('company')}>
                                    <div className="flex items-center gap-1">
                                      Razão Social
                                      <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                  </th>
                                  <th className="text-left py-2 px-3 font-medium text-gray-600 cursor-pointer hover:bg-gray-50 text-xs" onClick={() => handlePayablesSort('dueDate')}>
                                    <div className="flex items-center gap-1">
                                      Vencimento
                                      <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                  </th>
                                  <th className="text-left py-2 px-3 font-medium text-gray-600 cursor-pointer hover:bg-gray-50 text-xs" onClick={() => handlePayablesSort('product')}>
                                    <div className="flex items-center gap-1">
                                      Produto
                                      <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                  </th>
                                  <th className="text-left py-2 px-3 font-medium text-gray-600 cursor-pointer hover:bg-gray-50 text-xs" onClick={() => handlePayablesSort('type')}>
                                    <div className="flex items-center gap-1">
                                      Tipo
                                      <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                  </th>
                                  <th className="text-left py-2 px-3 font-medium text-gray-600 cursor-pointer hover:bg-gray-50 text-xs" onClick={() => handlePayablesSort('status')}>
                                    <div className="flex items-center gap-1">
                                      Status
                                      <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                  </th>
                                  <th className="text-right py-2 px-3 font-medium text-gray-600 cursor-pointer hover:bg-gray-50 text-xs" onClick={() => handlePayablesSort('value')}>
                                    <div className="flex items-center justify-end gap-1">
                                      Valor
                                      <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                  </th>
                                  <th className="text-center py-2 px-3 font-medium text-gray-600 text-xs">Ações</th>
                                </tr>
                              </thead>
                              <tbody>
                                {paginatedPayables.map((item) => (
                                  <tr key={item.id} className="border-b hover:bg-gray-50">
                                    <td className="py-2 px-3">
                                      <div>
                                        <div className="font-medium text-xs">{item.company}</div>
                                        <div className="text-xs text-gray-500">{item.cnpj}</div>
                                      </div>
                                    </td>
                                    <td className="py-2 px-3 text-xs">{item.dueDate}</td>
                                    <td className="py-2 px-3 text-xs">{item.product}</td>
                                    <td className="py-2 px-3">
                                      <span className={`px-2 py-1 rounded-full text-xs ${
                                        item.type === 'Parcela' ? 'bg-blue-100 text-blue-800' : 
                                        item.type === 'Mensal' ? 'bg-green-100 text-green-800' : 
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {item.type}
                                      </span>
                                    </td>
                                    <td className="py-2 px-3">
                                      <span className={`px-2 py-1 rounded-full text-xs ${
                                        item.status === 'Vencida' ? 'bg-red-100 text-red-800' : 
                                        item.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800' : 
                                        item.status === 'Em dia' ? 'bg-green-100 text-green-800' : 
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {item.status}
                                      </span>
                                    </td>
                                    <td className={`py-2 px-3 text-right font-medium text-xs ${
                                      item.status === 'Vencida' ? 'text-red-600' : 'text-gray-900'
                                    }`}>
                                      R$ {item.value.toFixed(2).replace('.', ',')}
                                    </td>
                                    <td className="py-2 px-3">
                                      <div className="flex items-center justify-center gap-1">
                                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Editar" onClick={() => console.log('Edit', item.id)}>
                                          <Edit className="h-3 w-3" />
                                        </button>
                                        <button className="p-1 text-green-600 hover:bg-green-50 rounded" title="Visualizar" onClick={() => console.log('View', item.id)}>
                                          <Eye className="h-3 w-3" />
                                        </button>
                                        <button className="p-1 text-purple-600 hover:bg-purple-50 rounded" title="Baixar Documento" onClick={() => console.log('Download', item.id)}>
                                          <Download className="h-3 w-3" />
                                        </button>
                                        <button className="p-1 text-red-600 hover:bg-red-50 rounded" title="Excluir" onClick={() => console.log('Delete', item.id)}>
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Card de paginação separado */}
                      <Card className="shadow-lg mt-6">
                        <CardContent className="py-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className="text-xs text-gray-600">
                                Mostrando {((payablesCurrentPage - 1) * payablesItemsPerPage) + 1} a {Math.min(payablesCurrentPage * payablesItemsPerPage, sortedPayables.length)} de {sortedPayables.length} resultados
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs h-7"
                                disabled={payablesCurrentPage === 1}
                                onClick={() => setPayablesCurrentPage(prev => Math.max(1, prev - 1))}
                              >
                                Anterior
                              </Button>
                              {Array.from({ length: payablesTotalPages }, (_, i) => i + 1).map((page) => (
                                <Button 
                                  key={page}
                                  variant={page === payablesCurrentPage ? "default" : "outline"} 
                                  size="sm" 
                                  className={`text-xs h-7 w-7 ${page === payablesCurrentPage ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                                  onClick={() => setPayablesCurrentPage(page)}
                                >
                                  {page}
                                </Button>
                              ))}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs h-7"
                                disabled={payablesCurrentPage === payablesTotalPages}
                                onClick={() => setPayablesCurrentPage(prev => Math.min(payablesTotalPages, prev + 1))}
                              >
                                Próxima
                              </Button>
                            </div>
                          </div>
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
                      {/* Card 1 - Resultado no período */}
                      <Card className="shadow-lg">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base font-semibold">Resultado no período</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-left gap-2">
                              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                              <span className="text-xs text-gray-700">À pagar</span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-bold text-red-600">-2.850,23</span>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-left gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-gray-700">À receber</span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-bold text-green-600">4.830,00</span>
                            </div>
                          </div>
                          
                          <div className="border-t pt-3 mt-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-left gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-xs text-gray-700 font-medium">Resultado</span>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-bold text-blue-600">1.979,77</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Card 2 - Bancos e saldos */}
                      <Card className="shadow-lg">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold">Contas</CardTitle>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-xs text-gray-500">Banco Inter</span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <input type="checkbox" checked className="text-blue-500" readOnly />
                                <span className="text-xs text-gray-700">Banco Inter</span>
                              </div>
                              <span className="text-xs font-medium">2.264,77</span>
                            </div>
                            <div className="text-right">
                              <span className="text-green-600 font-bold">860,92</span>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <input type="checkbox" checked className="text-orange-500" readOnly />
                                <span className="text-xs text-gray-700">Bancos | Pessoa Física</span>
                              </div>
                              <span className="text-xs font-medium">59,88</span>
                            </div>
                            <div className="text-right">
                              <span className="text-green-600 font-bold">2.779,92</span>
                            </div>
                          </div>
                          
                          <div className="border-t pt-3 mt-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-700 font-medium">Total</span>
                              <span className="text-xs font-bold">2.324,65</span>
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
                        <CardContent>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left py-2 px-3 font-medium text-gray-600 cursor-pointer hover:bg-gray-50 text-xs" onClick={() => handleReceivablesSort('company')}>
                                    <div className="flex items-center gap-1">
                                      Razão Social
                                      <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                  </th>
                                  <th className="text-left py-2 px-3 font-medium text-gray-600 cursor-pointer hover:bg-gray-50 text-xs" onClick={() => handleReceivablesSort('dueDate')}>
                                    <div className="flex items-center gap-1">
                                      Vencimento
                                      <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                  </th>
                                  <th className="text-left py-2 px-3 font-medium text-gray-600 cursor-pointer hover:bg-gray-50 text-xs" onClick={() => handleReceivablesSort('product')}>
                                    <div className="flex items-center gap-1">
                                      Produto
                                      <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                  </th>
                                  <th className="text-left py-2 px-3 font-medium text-gray-600 cursor-pointer hover:bg-gray-50 text-xs" onClick={() => handleReceivablesSort('type')}>
                                    <div className="flex items-center gap-1">
                                      Tipo
                                      <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                  </th>
                                  <th className="text-left py-2 px-3 font-medium text-gray-600 cursor-pointer hover:bg-gray-50 text-xs" onClick={() => handleReceivablesSort('status')}>
                                    <div className="flex items-center gap-1">
                                      Status
                                      <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                  </th>
                                  <th className="text-right py-2 px-3 font-medium text-gray-600 cursor-pointer hover:bg-gray-50 text-xs" onClick={() => handleReceivablesSort('value')}>
                                    <div className="flex items-center justify-end gap-1">
                                      Valor
                                      <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                  </th>
                                  <th className="text-center py-2 px-3 font-medium text-gray-600 text-xs">Ações</th>
                                </tr>
                              </thead>
                              <tbody>
                                {paginatedReceivables.map((item) => (
                                  <tr key={item.id} className="border-b hover:bg-gray-50">
                                    <td className="py-2 px-3">
                                      <div>
                                        <div className="font-medium text-xs">{item.company}</div>
                                        <div className="text-xs text-gray-500">{item.cnpj}</div>
                                      </div>
                                    </td>
                                    <td className="py-2 px-3 text-xs">{item.dueDate}</td>
                                    <td className="py-2 px-3 text-xs">{item.product}</td>
                                    <td className="py-2 px-3">
                                      <span className={`px-2 py-1 rounded-full text-xs ${
                                        item.type === 'Mensal' ? 'bg-green-100 text-green-800' : 
                                        item.type === 'Parcela' ? 'bg-blue-100 text-blue-800' : 
                                        item.type === 'Rendimento' ? 'bg-purple-100 text-purple-800' : 
                                        item.type === 'Cashback' ? 'bg-orange-100 text-orange-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {item.type}
                                      </span>
                                    </td>
                                    <td className="py-2 px-3">
                                      <span className={`px-2 py-1 rounded-full text-xs ${
                                        item.status === 'Confirmado' ? 'bg-green-100 text-green-800' : 
                                        item.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800' : 
                                        item.status === 'Automático' ? 'bg-green-100 text-green-800' : 
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {item.status}
                                      </span>
                                    </td>
                                    <td className={`py-2 px-3 text-right font-medium text-xs ${
                                      item.status === 'Confirmado' ? 'text-green-600' : 'text-gray-900'
                                    }`}>
                                      R$ {item.value.toFixed(2).replace('.', ',')}
                                    </td>
                                    <td className="py-2 px-3">
                                      <div className="flex items-center justify-center gap-1">
                                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Editar" onClick={() => console.log('Edit', item.id)}>
                                          <Edit className="h-3 w-3" />
                                        </button>
                                        <button className="p-1 text-green-600 hover:bg-green-50 rounded" title="Visualizar" onClick={() => console.log('View', item.id)}>
                                          <Eye className="h-3 w-3" />
                                        </button>
                                        <button className="p-1 text-purple-600 hover:bg-purple-50 rounded" title="Baixar Documento" onClick={() => console.log('Download', item.id)}>
                                          <Download className="h-3 w-3" />
                                        </button>
                                        <button className="p-1 text-red-600 hover:bg-red-50 rounded" title="Excluir" onClick={() => console.log('Delete', item.id)}>
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Card de paginação separado */}
                      <Card className="shadow-lg mt-6">
                        <CardContent className="py-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className="text-xs text-gray-600">
                                Mostrando {((receivablesCurrentPage - 1) * receivablesItemsPerPage) + 1} a {Math.min(receivablesCurrentPage * receivablesItemsPerPage, sortedReceivables.length)} de {sortedReceivables.length} resultados
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs h-7"
                                disabled={receivablesCurrentPage === 1}
                                onClick={() => setReceivablesCurrentPage(prev => Math.max(1, prev - 1))}
                              >
                                Anterior
                              </Button>
                              {Array.from({ length: receivablesTotalPages }, (_, i) => i + 1).map((page) => (
                                <Button 
                                  key={page}
                                  variant={page === receivablesCurrentPage ? "default" : "outline"} 
                                  size="sm" 
                                  className={`text-xs h-7 w-7 ${page === receivablesCurrentPage ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                                  onClick={() => setReceivablesCurrentPage(page)}
                                >
                                  {page}
                                </Button>
                              ))}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs h-7"
                                disabled={receivablesCurrentPage === receivablesTotalPages}
                                onClick={() => setReceivablesCurrentPage(prev => Math.min(receivablesTotalPages, prev + 1))}
                              >
                                Próxima
                              </Button>
                            </div>
                          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Conta Corrente */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">Conta Corrente</CardTitle>
                </div>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 mb-2">R$ 1.850,00</div>
                <p className="text-sm text-gray-500 mb-4">Banco do Brasil - AG 1234</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Última movimentação:</span>
                  <span>Hoje</span>
                </div>
              </CardContent>
            </Card>

            {/* Poupança */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-lg">Poupança</CardTitle>
                </div>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 mb-2">R$ 5.280,00</div>
                <p className="text-sm text-gray-500 mb-4">Caixa Econômica - AG 0123</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rendimento mensal:</span>
                  <span className="text-green-600">+0,5%</span>
                </div>
              </CardContent>
            </Card>

            {/* Cartão de Crédito */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-orange-600" />
                  <CardTitle className="text-lg">Cartão de Crédito</CardTitle>
                </div>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 mb-2">R$ 890,00</div>
                <p className="text-sm text-gray-500 mb-4">Nubank - Final 1234</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Limite disponível:</span>
                  <span>R$ 4.110,00</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Botão para adicionar nova conta */}
          <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Plus className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Adicionar Nova Conta</h3>
              <p className="text-sm text-gray-500 text-center mb-4">
                Conecte suas contas bancárias e cartões para um controle completo
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Conta
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="centro-custo" className="space-y-6">
          <SubTabs
            defaultValue="plano-contas"
            tabs={[
              {
                value: "plano-contas",
                label: "Plano de Contas",
                icon: <FileText className="h-4 w-4" />,
                content: <ChartOfAccountsContent 
                  isModalOpen={chartAccountModalOpen} 
                  setIsModalOpen={setChartAccountModalOpen}
                  showSuccess={showSuccess}
                  showError={showError}
                  showConfirm={showConfirm}
                />
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
      </Tabs>

      {/* Dialogs personalizados no componente principal */}
      <SuccessDialogComponent />
      <ErrorDialogComponent />
      <ConfirmDialogComponent />
    </div>
  );
}

/**
 * Componente para gerenciamento do Plano de Contas
 * Inclui modal de cadastro, lista hierárquica e funcionalidades completas
 */
function ChartOfAccountsContent({ 
  isModalOpen, 
  setIsModalOpen,
  showSuccess,
  showError,
  showConfirm 
}: { 
  isModalOpen: boolean, 
  setIsModalOpen: (open: boolean) => void,
  showSuccess: (title: string, message: string) => void,
  showError: (title: string, message: string) => void,
  showConfirm: (title: string, message: string, onConfirm: () => void) => void
}) {
  const [chartTree, setChartTree] = useState<ChartOfAccountsTree>(new ChartOfAccountsTree(SAMPLE_CHART_OF_ACCOUNTS));
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set([1, 2])); // Expande categorias principais por padrão
  
  // Estados do modal - usando props do componente pai
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

  // Query para buscar contas
  const { data: chartAccountsData, isLoading: isLoadingAccounts, refetch } = useQuery({
    queryKey: ['/api/chart-accounts'],
    enabled: true
  });

  // Garantir que chartAccounts seja sempre um array
  const chartAccounts = Array.isArray(chartAccountsData) ? chartAccountsData : [];

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
      refetch();
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
      refetch();
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
      refetch();
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
      nome: '',
      categoria: '',
      subcategoria: '',
      incluirComo: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (account: any) => {
    // Verificar se a conta ainda existe antes de abrir modal de edição
    const existingAccount = chartAccountsData?.find(acc => acc.id === account.id);
    if (!existingAccount) {
      showError("Conta não encontrada", "Esta conta pode ter sido excluída. Atualizando a lista...");
      refetch();
      return;
    }
    
    setModalMode('edit');
    setSelectedAccount(account);
    setFormData({
      nome: account.name || '',
      categoria: account.type || '',
      subcategoria: account.subcategory || '',
      incluirComo: account.parentId || ''
    });
    setIsModalOpen(true);
  };

  const openViewModal = (account: any) => {
    setModalMode('view');
    setSelectedAccount(account);
    setFormData({
      nome: account.name || '',
      categoria: account.type || '',
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

    // GERAÇÃO DE CÓDIGO HIERÁRQUICO CORRETO
    const generateHierarchicalCode = () => {
      if (level === 1) {
        // Nível 1: Códigos 1, 2, 3, 4...
        const level1Codes = chartAccountsData?.filter(acc => acc.level === 1).map(acc => parseInt(acc.code)) || [];
        const maxCode = level1Codes.length > 0 ? Math.max(...level1Codes) : 0;
        return (maxCode + 1).toString();
      }
      
      if (level === 2) {
        // Nível 2: Códigos 1.1, 1.2, 2.1, 2.2...
        const parentAccount = chartAccountsData?.find(acc => acc.name === formData.categoria && acc.level === 1);
        const parentCode = parentAccount ? parentAccount.code : '1';
        
        const sameParentCount = chartAccountsData?.filter(acc => 
          acc.parentId === parentAccount?.id && acc.level === 2
        ).length || 0;
        
        return `${parentCode}.${sameParentCount + 1}`;
      }
      
      if (level === 3) {
        // Nível 3: Códigos 1.2.1, 1.2.2, 2.1.1...
        const parentAccount = chartAccountsData?.find(acc => acc.name === formData.subcategoria && acc.level === 2);
        const parentCode = parentAccount ? parentAccount.code : '1.1';
        
        const sameParentCount = chartAccountsData?.filter(acc => 
          acc.parentId === parentAccount?.id && acc.level === 3
        ).length || 0;
        
        return `${parentCode}.${sameParentCount + 1}`;
      }
      
      if (level === 4) {
        // Nível 4: Códigos 1.2.3.1, 1.2.3.2...
        const parentAccount = chartAccountsData?.find(acc => acc.name === formData.incluirComo && acc.level === 3);
        const parentCode = parentAccount ? parentAccount.code : '1.1.1';
        
        const sameParentCount = chartAccountsData?.filter(acc => 
          acc.parentId === parentAccount?.id && acc.level === 4
        ).length || 0;
        
        return `${parentCode}.${sameParentCount + 1}`;
      }
      
      return '1';
    };

    // LÓGICA HIERÁRQUICA CORRETA DO PLANO DE CONTAS
    let level = 1;
    let parentId = null;
    let category = null;
    let subcategory = null;
    let type = formData.nome.toLowerCase();

    // LÓGICA HIERÁRQUICA DEFINITIVA - BASEADA NOS CAMPOS PREENCHIDOS
    if (formData.incluirComo) {
      // NÍVEL 4: Se "Incluir como filha de" está preenchido = SEMPRE NÍVEL 4
      level = 4;
      const parentAccount = chartAccountsData?.find(acc => 
        acc.name === formData.incluirComo && acc.level === 3
      );
      parentId = parentAccount ? parentAccount.id : null;
      category = formData.nome;
      subcategory = formData.nome;
      type = parentAccount ? parentAccount.type : (formData.categoria || formData.nome.toLowerCase());
    } else if (formData.subcategoria) {
      // NÍVEL 3: Se "Subcategoria de" está preenchido (sem Incluir como filha de)
      level = 3;
      const parentAccount = chartAccountsData?.find(acc => 
        acc.name === formData.subcategoria && acc.level === 2
      );
      parentId = parentAccount ? parentAccount.id : null;
      category = formData.nome;
      subcategory = formData.nome;
      type = parentAccount ? parentAccount.type : (formData.categoria || formData.nome.toLowerCase());
    } else if (formData.categoria) {
      // NÍVEL 2: Se só "Categoria" está preenchida
      level = 2;
      const parentAccount = chartAccountsData?.find(acc => 
        acc.name === formData.categoria && acc.level === 1
      );
      parentId = parentAccount ? parentAccount.id : null;
      category = formData.nome;
      type = parentAccount ? parentAccount.type : formData.categoria;
    } else {
      // NÍVEL 1: Só "Nome" preenchido
      level = 1;
      parentId = null;
      category = formData.nome;
      type = formData.nome.toLowerCase();
    }

    const accountData = {
      userId: "2",
      parentId: parentId,
      code: generateHierarchicalCode(),
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
        nome: '',
        categoria: '',
        subcategoria: '',
        incluirComo: ''
      });
      setSelectedAccount(null);
      setModalMode('create');
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

    // Mesma lógica do handleSaveAccount mas sem fechar modal
    // MESMA LÓGICA DE GERAÇÃO DE CÓDIGO HIERÁRQUICO 
    const generateHierarchicalCode = () => {
      if (level === 1) {
        // Nível 1: Códigos 1, 2, 3, 4...
        const level1Codes = chartAccountsData?.filter(acc => acc.level === 1).map(acc => parseInt(acc.code)) || [];
        const maxCode = level1Codes.length > 0 ? Math.max(...level1Codes) : 0;
        return (maxCode + 1).toString();
      }
      
      if (level === 2) {
        // Nível 2: Códigos 1.1, 1.2, 2.1, 2.2...
        const parentAccount = chartAccountsData?.find(acc => acc.name === formData.categoria && acc.level === 1);
        const parentCode = parentAccount ? parentAccount.code : '1';
        
        const sameParentCount = chartAccountsData?.filter(acc => 
          acc.parentId === parentAccount?.id && acc.level === 2
        ).length || 0;
        
        return `${parentCode}.${sameParentCount + 1}`;
      }
      
      if (level === 3) {
        // Nível 3: Códigos 1.2.1, 1.2.2, 2.1.1...
        const parentAccount = chartAccountsData?.find(acc => acc.name === formData.subcategoria && acc.level === 2);
        const parentCode = parentAccount ? parentAccount.code : '1.1';
        
        const sameParentCount = chartAccountsData?.filter(acc => 
          acc.parentId === parentAccount?.id && acc.level === 3
        ).length || 0;
        
        return `${parentCode}.${sameParentCount + 1}`;
      }
      
      if (level === 4) {
        // Nível 4: Códigos 1.2.3.1, 1.2.3.2...
        const parentAccount = chartAccountsData?.find(acc => acc.name === formData.incluirComo && acc.level === 3);
        const parentCode = parentAccount ? parentAccount.code : '1.1.1';
        
        const sameParentCount = chartAccountsData?.filter(acc => 
          acc.parentId === parentAccount?.id && acc.level === 4
        ).length || 0;
        
        return `${parentCode}.${sameParentCount + 1}`;
      }
      
      return '1';
    };

    // Determinar nível e parentId para Salvar e Continuar - MESMA LÓGICA DO SALVAR
    let level = 1;
    let parentId = null;
    let category = null;
    let subcategory = null;
    let type = formData.nome.toLowerCase();

    // MESMA LÓGICA DEFINITIVA - BASEADA NOS CAMPOS PREENCHIDOS
    if (formData.incluirComo) {
      // NÍVEL 4: Se "Incluir como filha de" está preenchido = SEMPRE NÍVEL 4
      level = 4;
      const parentAccount = chartAccountsData?.find(acc => 
        acc.name === formData.incluirComo && acc.level === 3
      );
      parentId = parentAccount ? parentAccount.id : null;
      category = formData.nome;
      subcategory = formData.nome;
      type = parentAccount ? parentAccount.type : (formData.categoria || formData.nome.toLowerCase());
    } else if (formData.subcategoria) {
      // NÍVEL 3: Se "Subcategoria de" está preenchido (sem Incluir como filha de)
      level = 3;
      const parentAccount = chartAccountsData?.find(acc => 
        acc.name === formData.subcategoria && acc.level === 2
      );
      parentId = parentAccount ? parentAccount.id : null;
      category = formData.nome;
      subcategory = formData.nome;
      type = parentAccount ? parentAccount.type : (formData.categoria || formData.nome.toLowerCase());
    } else if (formData.categoria) {
      // NÍVEL 2: Se só "Categoria" está preenchida
      level = 2;
      const parentAccount = chartAccountsData?.find(acc => 
        acc.name === formData.categoria && acc.level === 1
      );
      parentId = parentAccount ? parentAccount.id : null;
      category = formData.nome;
      type = parentAccount ? parentAccount.type : formData.categoria;
    } else {
      // NÍVEL 1: Só "Nome" preenchido
      level = 1;
      parentId = null;
      category = formData.nome;
      type = formData.nome.toLowerCase();
    }



    const accountData = {
      userId: "2",
      parentId: parentId,
      code: generateHierarchicalCode(),
      name: formData.nome,
      type: type,
      category: category,
      subcategory: subcategory,
      level: level,
      isActive: true,
      description: null
    };

    try {
      await createAccountMutation.mutateAsync(accountData);
      // Limpar formulário mas manter modal aberto (apenas para Salvar e Continuar)
      setFormData({
        nome: '',
        categoria: '',
        subcategoria: '',
        incluirComo: ''
      });
      // Garantir que continua no modo create
      setModalMode('create');
      setSelectedAccount(null);
    } catch (error) {
      console.error('Erro ao salvar e continuar:', error);
      showError("Erro ao salvar", "Não foi possível salvar a conta. Verifique os dados e tente novamente.");
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    showConfirm(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir esta conta?",
      async () => {
        try {
          await deleteAccountMutation.mutateAsync(accountId);
        } catch (error) {
          console.error('Erro ao excluir conta:', error);
        }
      }
    );
  };;

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
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-1">
                    # 
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-1">
                    Código
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-1">
                    Nome da Conta
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-1">
                    Tipo
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors">
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
              ) : chartAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nenhuma conta cadastrada. Clique no botão "+" para criar a primeira conta.
                  </td>
                </tr>
              ) : (
                chartAccounts.map((account: any, index: number) => (
                  <tr key={account.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
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
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        account.type === 'receita' ? 'bg-green-100 text-green-800' :
                        account.type === 'despesa' ? 'bg-red-100 text-red-800' :
                        account.type === 'ativo' ? 'bg-blue-100 text-blue-800' :
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
                          className="text-blue-600 hover:text-blue-900 p-1.5 hover:bg-blue-100 rounded transition-colors"
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
                          className="text-red-600 hover:text-red-900 p-1.5 hover:bg-red-100 rounded transition-colors"
                          title="Excluir conta"
                        >
                          <Trash2 className="h-4 w-4" />
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
        {chartAccounts.length > 0 && (
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
                Mostrando 1 a {Math.min(10, chartAccounts.length)} de {chartAccounts.length} resultados
              </div>
              
              <div className="flex items-center gap-1">
                <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled>
                  Anterior
                </button>
                <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">
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
            <div className="flex items-center justify-between p-6 pb-4">
              <h2 className="text-lg font-semibold text-gray-800">Nova categoria</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-6 h-6 text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
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
                    {chartAccountsData?.filter(acc => acc.level === 1)
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
                  {chartAccountsData?.filter(acc => acc.level === 2)
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
                  {chartAccountsData?.filter(acc => acc.level === 3)
                    .map(acc => (
                      <MenuItem key={acc.id} value={acc.name}>
                        {acc.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </div>

            {/* Botões - posicionados conforme a imagem */}
            <div className="flex justify-end items-center gap-2 p-6 pt-8">
              <button
                onClick={() => handleSave(false)}
                disabled={!formData.nome || createAccountMutation.isPending}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded text-sm transition-colors flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Salvar
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={!formData.nome || createAccountMutation.isPending}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded text-sm transition-colors flex items-center justify-center"
                title="Salvar e continuar adicionando"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}