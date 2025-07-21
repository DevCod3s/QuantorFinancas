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
import { Plus, Edit, Trash2, Search, Filter, Eye, TrendingUp, TrendingDown, DollarSign, CreditCard, Building, Target, Activity, FileText, Clock, CheckCircle, Calendar, Settings, ChevronLeft, ChevronRight, Save, X, ChevronDown, ChevronRight as ChevronRightIcon } from "lucide-react";

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
// import { useSuccessDialog, useErrorDialog } from '../components/ui/dialog-hooks';
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
    tipo: '',
    nome: '',
    categoria: '',
    subcategoria: '',
    incluirComo: ''
  });
  
  const queryClient = useQueryClient();
  // const { showSuccess } = useSuccessDialog();
  // const { showError } = useErrorDialog();
  
  // Funções temporárias para success/error
  const showSuccess = (message: string) => alert(`Sucesso: ${message}`);
  const showError = (message: string) => alert(`Erro: ${message}`);

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
    if (!formData.tipo) {
      showError('Tipo da conta é obrigatório');
      return;
    }

    const accountData = {
      name: formData.nome,
      type: formData.tipo,
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
    if (!formData.tipo) {
      showError('Tipo da conta é obrigatório');
      return;
    }

    const accountData = {
      name: formData.nome,
      type: formData.tipo,
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
                setChartAccountModalOpen(true);
              }
            }}
            className="group relative w-11 h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 active:shadow-md"
            title={activeTab === "centro-custo" ? "Adicionar ao Plano de Contas" : "Nova Transação"}
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
            Nova Transação
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
                  <div className="space-y-6">
                    {/* Resumo À Pagar */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="border-l-4 border-l-orange-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">
                            Total À Pagar
                          </CardTitle>
                          <Clock className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-orange-600">R$ 2.850,00</div>
                          <p className="text-xs text-gray-500">
                            8 contas pendentes
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border-l-4 border-l-red-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">
                            Vencidas
                          </CardTitle>
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-red-600">R$ 340,00</div>
                          <p className="text-xs text-gray-500">
                            2 contas em atraso
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border-l-4 border-l-yellow-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">
                            Próximos 7 Dias
                          </CardTitle>
                          <Target className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-yellow-600">R$ 1.200,00</div>
                          <p className="text-xs text-gray-500">
                            3 contas vencem em breve
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Lista de contas à pagar */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Contas À Pagar</CardTitle>
                        <CardDescription>
                          Suas obrigações financeiras pendentes
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <div>
                                <p className="font-medium text-sm">Cartão de Crédito</p>
                                <p className="text-xs text-red-600 font-medium">Vencido em 10/01/2025</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-red-600 font-bold">R$ 280,00</span>
                              <p className="text-xs text-gray-500">Parcela 3/12</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                              <div>
                                <p className="font-medium text-sm">Aluguel</p>
                                <p className="text-xs text-yellow-600 font-medium">Vence em 20/01/2025</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-yellow-600 font-bold">R$ 1.200,00</span>
                              <p className="text-xs text-gray-500">Mensal</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                              <div>
                                <p className="font-medium text-sm">Conta de Luz</p>
                                <p className="text-xs text-orange-600 font-medium">Vence em 25/01/2025</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-orange-600 font-bold">R$ 185,50</span>
                              <p className="text-xs text-gray-500">Janeiro/2025</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                              <div>
                                <p className="font-medium text-sm">Internet</p>
                                <p className="text-xs text-gray-500">Vence em 28/01/2025</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-gray-600 font-bold">R$ 89,90</span>
                              <p className="text-xs text-gray-500">Mensal</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )
              },
              {
                value: "a-receber",
                label: "À Receber",
                icon: <CheckCircle className="h-4 w-4" />,
                content: (
                  <div className="space-y-6">
                    {/* Resumo À Receber */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="border-l-4 border-l-green-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">
                            Total À Receber
                          </CardTitle>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-600">R$ 4.200,00</div>
                          <p className="text-xs text-gray-500">
                            5 recebimentos programados
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">
                            Este Mês
                          </CardTitle>
                          <DollarSign className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-blue-600">R$ 3.500,00</div>
                          <p className="text-xs text-gray-500">
                            Salário + freelances
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border-l-4 border-l-purple-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">
                            Próximos 30 Dias
                          </CardTitle>
                          <TrendingUp className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-purple-600">R$ 700,00</div>
                          <p className="text-xs text-gray-500">
                            Receitas programadas
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Lista de valores à receber */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Valores À Receber</CardTitle>
                        <CardDescription>
                          Receitas e entradas programadas
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <div>
                                <p className="font-medium text-sm">Salário</p>
                                <p className="text-xs text-green-600 font-medium">Receber em 15/01/2025</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-green-600 font-bold">R$ 3.500,00</span>
                              <p className="text-xs text-gray-500">Mensal</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <div>
                                <p className="font-medium text-sm">Projeto Freelance</p>
                                <p className="text-xs text-blue-600 font-medium">Receber em 22/01/2025</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-blue-600 font-bold">R$ 450,00</span>
                              <p className="text-xs text-gray-500">Parcela 2/3</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                              <div>
                                <p className="font-medium text-sm">Rendimento Poupança</p>
                                <p className="text-xs text-purple-600 font-medium">Receber em 30/01/2025</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-purple-600 font-bold">R$ 25,30</span>
                              <p className="text-xs text-gray-500">0,65% a.m.</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                              <div>
                                <p className="font-medium text-sm">Cashback Cartão</p>
                                <p className="text-xs text-orange-600 font-medium">Receber em 05/02/2025</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-orange-600 font-bold">R$ 28,40</span>
                              <p className="text-xs text-gray-500">1,5% compras</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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
                content: <ChartOfAccountsContent isModalOpen={chartAccountModalOpen} setIsModalOpen={setChartAccountModalOpen} />
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
    </div>
  );
}

/**
 * Componente para gerenciamento do Plano de Contas
 * Inclui modal de cadastro, lista hierárquica e funcionalidades completas
 */
function ChartOfAccountsContent({ isModalOpen, setIsModalOpen }: { isModalOpen: boolean, setIsModalOpen: (open: boolean) => void }) {
  const [chartTree, setChartTree] = useState<ChartOfAccountsTree>(new ChartOfAccountsTree(SAMPLE_CHART_OF_ACCOUNTS));
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set([1, 2])); // Expande categorias principais por padrão
  
  // Estados do modal
  const [chartAccountModalOpen, setChartAccountModalOpen] = useState(false);
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
  const { data: chartAccounts = [], isLoading: isLoadingAccounts, refetch } = useQuery({
    queryKey: ['/api/chart-accounts'],
    enabled: true
  });

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
      if (!response.ok) throw new Error('Falha ao excluir conta');
      return response.json();
    },
    onSuccess: () => {
      refetch();
    },
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
      tipo: '',
      categoria: '',
      subcategoria: '',
      incluirComo: ''
    });
    setChartAccountModalOpen(true);
  };

  const openEditModal = (account: any) => {
    setModalMode('edit');
    setSelectedAccount(account);
    setFormData({
      nome: account.name || '',
      tipo: account.type || '',
      categoria: account.category || '',
      subcategoria: account.subcategory || '',
      incluirComo: account.parentId || ''
    });
    setChartAccountModalOpen(true);
  };

  const openViewModal = (account: any) => {
    setModalMode('view');
    setSelectedAccount(account);
    setFormData({
      nome: account.name || '',
      tipo: account.type || '',
      categoria: account.category || '',
      subcategoria: account.subcategory || '',
      incluirComo: account.parentId || ''
    });
    setChartAccountModalOpen(true);
  };

  const handleSaveAccount = async () => {
    const accountData = {
      name: formData.nome,
      type: formData.tipo,
      category: formData.categoria,
      subcategory: formData.subcategoria,
      parentId: formData.incluirComo || null,
    };

    try {
      if (modalMode === 'create') {
        await createAccountMutation.mutateAsync(accountData);
      } else if (modalMode === 'edit' && selectedAccount) {
        await updateAccountMutation.mutateAsync({ id: selectedAccount.id, ...accountData });
      }
      setChartAccountModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar conta:', error);
    }
  };

  const handleSaveAndContinue = async () => {
    await handleSaveAccount();
    // Limpar formulário mas manter modal aberto
    setFormData({
      nome: '',
      tipo: '',
      categoria: '',
      subcategoria: '',
      incluirComo: ''
    });
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (confirm('Tem certeza que deseja excluir esta conta?')) {
      try {
        await deleteAccountMutation.mutateAsync(accountId);
      } catch (error) {
        console.error('Erro ao excluir conta:', error);
      }
    }
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
    setChartAccountModalOpen(false);
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

      {/* Resumo das categorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Receitas</p>
                <p className="text-xs text-gray-500">6 contas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Despesas</p>
                <p className="text-xs text-gray-500">6 contas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Total de Contas</p>
                <p className="text-xs text-gray-500">12 ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Níveis</p>
                <p className="text-xs text-gray-500">3 níveis máx.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de contas em tabela */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Estrutura do Plano de Contas
          </CardTitle>
          <CardDescription>
            Visualização hierárquica das contas organizadas por categoria
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[640px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b sticky top-0">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-2">
                      Código
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </th>
                  <th className="text-left p-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-2">
                      Nome da Conta
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </th>
                  <th className="text-left p-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-2">
                      Tipo
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </th>
                  <th className="text-left p-4 font-medium text-gray-700">
                    Nível
                  </th>
                  <th className="text-left p-4 font-medium text-gray-700">
                    Hierarquia
                  </th>
                  <th className="text-left p-4 font-medium text-gray-700">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoadingAccounts ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      Carregando contas...
                    </td>
                  </tr>
                ) : chartAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      Nenhuma conta cadastrada. Clique no botão "+" para criar a primeira conta.
                    </td>
                  </tr>
                ) : (
                  chartAccounts.map((account: any, index: number) => (
                    <tr key={account.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <span className="font-mono text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {account.code || `${account.type.toUpperCase()}-${String(index + 1).padStart(3, '0')}`}
                        </span>
                      </td>
                      <td className="p-4">
                        <div style={{ paddingLeft: `${(account.level || 1) * 20}px` }} className="flex items-center gap-2">
                          {(account.level || 1) > 1 && (
                            <div className="text-gray-400">
                              {'└─ '.repeat(1)}
                            </div>
                          )}
                          <span className="font-medium text-gray-900">{account.name}</span>
                        </div>
                        {account.description && (
                          <p className="text-sm text-gray-500 mt-1" style={{ paddingLeft: `${(account.level || 1) * 20}px` }}>
                            {account.description}
                          </p>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          account.type === 'receita' ? 'bg-green-100 text-green-800' :
                          account.type === 'despesa' ? 'bg-red-100 text-red-800' :
                          account.type === 'ativo' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-600">
                          Nível {account.level || 1}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-500">
                          {account.parentId ? `Filha de: ${chartAccounts.find((c: any) => c.id === account.parentId)?.name || 'N/A'}` : 'Conta raiz'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => openEditModal(account)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                            title="Editar conta"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => openViewModal(account)}
                            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                            title="Visualizar conta"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteAccount(account)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
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
        </CardContent>
      </Card>

      {/* Botão flutuante para adicionar nova conta */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={openCreateModal}
          className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center group overflow-hidden relative"
          title="Nova Conta"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Plus className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90 relative z-10" />
          <div className="absolute inset-0 rounded-full bg-blue-400/30 scale-0 group-active:scale-150 transition-transform duration-200"></div>
        </button>
      </div>

      {/* Modal de cadastro */}
      {chartAccountModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-gray-100 rounded-lg shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100" 
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Cabeçalho do modal */}
            <div className="flex items-center justify-between p-6 pb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {modalMode === 'create' ? 'Nova Conta' : 
                 modalMode === 'edit' ? 'Editar Conta' : 
                 'Visualizar Conta'}
              </h2>
              <button
                onClick={() => setChartAccountModalOpen(false)}
                className="w-6 h-6 text-white bg-black rounded transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Conteúdo do modal */}
            <div className="px-6 pb-6 space-y-4">
              {/* Campo Tipo */}
              <div className="relative">
                <select
                  className={`w-full pt-6 pb-2 px-3 bg-white rounded-md text-base outline-none appearance-none peer transition-all duration-200 ${
                    formData.tipo ? 'border border-blue-500 shadow-md' : 'border-0 shadow-md focus:border focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-500 ${modalMode === 'view' ? 'pointer-events-none bg-gray-50' : ''}`}
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  disabled={modalMode === 'view'}
                >
                  <option value="">&nbsp;</option>
                  <option value="receita">Receita</option>
                  <option value="despesa">Despesa</option>
                  <option value="ativo">Ativo</option>
                  <option value="passivo">Passivo</option>
                </select>
                <label className={`absolute left-3 bg-white px-1 text-sm transition-all duration-200 pointer-events-none ${
                  formData.tipo ? '-top-2 text-xs text-blue-600' : 'top-3 text-gray-500'
                } peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600`}>
                  Tipo
                </label>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Campo Nome */}
              <div className="relative">
                <input
                  type="text"
                  className={`w-full pt-6 pb-2 px-3 bg-white rounded-md text-base outline-none placeholder-transparent peer transition-all duration-200 ${
                    formData.nome ? 'border border-blue-500 shadow-md' : 'border-0 shadow-md focus:border focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-500 ${modalMode === 'view' ? 'bg-gray-50' : ''}`}
                  placeholder=" "
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  readOnly={modalMode === 'view'}
                />
                <label className={`absolute left-3 bg-white px-1 text-sm transition-all duration-200 pointer-events-none ${
                  formData.nome ? '-top-2 text-xs text-blue-600' : 'top-3 text-gray-500'
                } peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600`}>
                  Nome <span className="text-red-500">*</span>
                </label>
              </div>

              {/* Campo Categoria */}
              <div className="relative">
                <select
                  className={`w-full pt-6 pb-2 px-3 bg-white rounded-md text-base outline-none appearance-none peer transition-all duration-200 ${
                    formData.categoria ? 'border border-blue-500 shadow-md' : 'border-0 shadow-md focus:border focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-500`}
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value, subcategoria: '' })}
                >
                  <option value="">&nbsp;</option>
                  {categoriasPrincipais.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <label className={`absolute left-3 bg-white px-1 text-sm transition-all duration-200 pointer-events-none ${
                  formData.categoria ? '-top-2 text-xs text-blue-600' : 'top-3 text-gray-500'
                } peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600`}>
                  Categoria <span className="text-red-500">*</span>
                </label>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Campo Subcategoria */}
              <div className="relative">
                <select
                  className={`w-full pt-6 pb-2 px-3 bg-white rounded-md text-base outline-none appearance-none peer transition-all duration-200 ${
                    formData.subcategoria ? 'border border-blue-500 shadow-md' : 'border-0 shadow-md focus:border focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-sm`}
                  value={formData.subcategoria}
                  onChange={(e) => setFormData({ ...formData, subcategoria: e.target.value })}
                  disabled={!formData.categoria}
                >
                  <option value="">&nbsp;</option>
                  {getSubcategorias().map(subcat => (
                    <option key={subcat.id} value={subcat.name}>{subcat.name}</option>
                  ))}
                </select>
                <label className={`absolute left-3 bg-white px-1 text-sm transition-all duration-200 pointer-events-none ${
                  formData.subcategoria ? '-top-2 text-xs text-blue-600' : 'top-3 text-gray-500'
                } peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600`}>
                  Subcategoria de
                </label>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Campo Incluir como filha de */}
              <div className="relative">
                <select
                  className={`w-full pt-6 pb-2 px-3 bg-white rounded-md text-base outline-none appearance-none peer transition-all duration-200 ${
                    formData.incluirComo ? 'border border-blue-500 shadow-md' : 'border-0 shadow-md focus:border focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-500`}
                  value={formData.incluirComo}
                  onChange={(e) => setFormData({ ...formData, incluirComo: e.target.value })}
                >
                  <option value="">&nbsp;</option>
                  {chartTree.getFlattenedNodes()
                    .filter(node => chartTree.canHaveChildren(node))
                    .map(node => (
                      <option key={node.id} value={node.id}>
                        {node.code} - {node.name}
                      </option>
                    ))
                  }
                </select>
                <label className={`absolute left-3 bg-white px-1 text-sm transition-all duration-200 pointer-events-none ${
                  formData.incluirComo ? '-top-2 text-xs text-blue-600' : 'top-3 text-gray-500'
                } peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600`}>
                  Incluir como filha de
                </label>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Rodapé do modal */}
            <div className="flex items-center justify-end gap-3 px-6 pb-6">
              {modalMode === 'view' ? (
                <button
                  onClick={() => setChartAccountModalOpen(false)}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
                >
                  Fechar
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSaveAccount}
                    disabled={!formData.nome || createAccountMutation.isPending || updateAccountMutation.isPending}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white rounded text-sm transition-colors"
                  >
                    {createAccountMutation.isPending || updateAccountMutation.isPending ? 'Salvando...' : 'Salvar'}
                  </button>
                  {modalMode === 'create' && (
                    <button
                      onClick={handleSaveAndContinue}
                      disabled={!formData.nome || createAccountMutation.isPending}
                      className="px-3 py-2 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 text-white rounded text-sm transition-colors flex items-center justify-center"
                      title="Salvar e continuar"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}