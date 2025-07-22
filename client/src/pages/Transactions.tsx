/**
 * @fileoverview Página de Transações (Finanças) - Sistema Quantor
 * 
 * Este componente implementa a página principal de finanças com sistema de abas:
 * - Visão Geral: Dashboard com gráficos e métricas financeiras
 * - Movimentações: Controle de transações à pagar e à receber
 * - Contas: Gestão de contas bancárias e cartões
 * - Centro de Custo: Plano de contas hierárquico
 * 
 * @author Sistema Quantor
 * @version 2.0.0
 * @since Janeiro 2025
 */

import { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Building,
  Target,
  Eye,
  Activity,
  ChevronLeft,
  ChevronRight,
  Settings,
  Calendar,
  FileText,
  Edit,
  Trash2,
  ChevronDown,
  X,
} from "lucide-react";
import { SubTabs } from "@/components/SubTabs";
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

interface Transaction {
  id: string;
  description: string;
  amount: string;
  type: "income" | "expense";
  category: string;
  date: string;
}

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

        <TabsContent value="centro-custo" className="space-y-6">
          <SubTabs
            defaultValue="plano-contas"
            tabs={[
              {
                value: "plano-contas",
                label: "Plano de Contas",
                icon: <FileText className="h-4 w-4" />,
                content: <ChartOfAccountsContent />
              },
              {
                value: "demonstrativo-resultados",
                label: "Demonstrativo de Resultados",
                icon: <Activity className="h-4 w-4" />,
                content: (
                  <div className="space-y-6">
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

      {/* Modal de cadastro - Movido para o componente principal */}
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
                    formData.tipo ? 'shadow-md border border-blue-500' : 'shadow-md border-0 focus:shadow-md focus:border focus:border-blue-500'
                  } ${modalMode === 'view' ? 'pointer-events-none bg-gray-50' : ''}`}
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
                <label className="absolute -top-2 left-3 bg-white px-1 text-xs transition-all duration-200 pointer-events-none text-gray-500 peer-focus:text-blue-600">
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
                    formData.nome ? 'shadow-md border border-blue-500' : 'shadow-md border-0 focus:shadow-md focus:border focus:border-blue-500'
                  } ${modalMode === 'view' ? 'bg-gray-50' : ''}`}
                  placeholder=" "
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  readOnly={modalMode === 'view'}
                />
                <label className="absolute -top-2 left-3 bg-white px-1 text-xs transition-all duration-200 pointer-events-none text-gray-500 peer-focus:text-blue-600">
                  Nome <span className="text-red-500">*</span>
                </label>
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

/**
 * Componente para gerenciamento do Plano de Contas
 * Layout limpo esperando nova estrutura
 */
function ChartOfAccountsContent() {
  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Plano de Contas</h3>
        <p className="text-sm text-gray-600">
          Organize suas contas em estrutura hierárquica
        </p>
      </div>

      {/* Área limpa aguardando novo layout */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-sm text-gray-500 mb-2">Layout limpo</p>
          <p className="text-xs text-gray-400">
            Aguardando nova estrutura baseada na sua imagem
          </p>
        </div>
      </div>
    </div>
  );
}