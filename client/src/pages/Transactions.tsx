import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Search, Filter, Eye, TrendingUp, TrendingDown, DollarSign, CreditCard, Building, Target, Activity, FileText, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubTabs } from "@/components/SubTabs";
import { Transaction } from "@shared/schema";
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finanças</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gerencie suas finanças de forma inteligente e organizada
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nova Transação
        </Button>
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
                          <CardTitle className="text-lg font-semibold">Fluxo de caixa</CardTitle>
                          <CardDescription className="text-sm text-gray-500">Evolução mensal</CardDescription>
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
                    {/* Card 1: Seletor de Data de Referência */}
                    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                        <div className="flex items-center justify-between">
                          <button className="p-2 hover:bg-white rounded-full transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <CardTitle className="text-lg font-semibold text-gray-800">junho 2025</CardTitle>
                          <button className="p-2 hover:bg-white rounded-full transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <input type="checkbox" checked className="text-pink-500" readOnly />
                              <span className="text-sm text-gray-600">Considerar lançamentos pendentes</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input type="checkbox" className="text-gray-400" />
                              <span className="text-sm text-gray-600">Não considerar transferências internas</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-gray-100 rounded">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                              </svg>
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Card 2: Lançamentos Diários */}
                    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold">Demonstrativo Diário</CardTitle>
                        <CardDescription className="text-sm text-gray-500">Saldo em 31 jul</CardDescription>
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

                    {/* Card 3: Gráfico Resultado de Caixa */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Centro de Custo - Pessoal */}
            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-lg">Pessoal</CardTitle>
                </div>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600 mb-2">R$ 2.450,00</div>
                <p className="text-sm text-gray-500 mb-4">Gastos pessoais este mês</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Orçamento:</span>
                  <span>R$ 3.000,00</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{width: '82%'}}></div>
                </div>
              </CardContent>
            </Card>

            {/* Centro de Custo - Casa */}
            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-lg">Casa</CardTitle>
                </div>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 mb-2">R$ 1.850,00</div>
                <p className="text-sm text-gray-500 mb-4">Despesas da casa este mês</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Orçamento:</span>
                  <span>R$ 2.200,00</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '84%'}}></div>
                </div>
              </CardContent>
            </Card>

            {/* Centro de Custo - Trabalho */}
            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">Trabalho</CardTitle>
                </div>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 mb-2">R$ 680,00</div>
                <p className="text-sm text-gray-500 mb-4">Gastos profissionais este mês</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Orçamento:</span>
                  <span>R$ 800,00</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '85%'}}></div>
                </div>
              </CardContent>
            </Card>

            {/* Centro de Custo - Lazer */}
            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <CardTitle className="text-lg">Lazer</CardTitle>
                </div>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 mb-2">R$ 420,00</div>
                <p className="text-sm text-gray-500 mb-4">Entretenimento este mês</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Orçamento:</span>
                  <span>R$ 600,00</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{width: '70%'}}></div>
                </div>
              </CardContent>
            </Card>

            {/* Centro de Custo - Educação */}
            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-indigo-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-indigo-600" />
                  <CardTitle className="text-lg">Educação</CardTitle>
                </div>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-600 mb-2">R$ 320,00</div>
                <p className="text-sm text-gray-500 mb-4">Cursos e livros este mês</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Orçamento:</span>
                  <span>R$ 500,00</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{width: '64%'}}></div>
                </div>
              </CardContent>
            </Card>

            {/* Botão para adicionar novo centro de custo */}
            <Card className="border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Plus className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Novo Centro de Custo</h3>
                <p className="text-sm text-gray-500 text-center mb-4">
                  Organize seus gastos por categorias personalizadas
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Centro
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Resumo dos Centros de Custo */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo dos Centros de Custo</CardTitle>
              <CardDescription>
                Acompanhe o desempenho de cada centro de custo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="font-medium">Pessoal</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">82% do orçamento</span>
                    <span className="font-bold text-purple-600">R$ 2.450,00</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="font-medium">Casa</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">84% do orçamento</span>
                    <span className="font-bold text-green-600">R$ 1.850,00</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="font-medium">Trabalho</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">85% do orçamento</span>
                    <span className="font-bold text-blue-600">R$ 680,00</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="font-medium">Lazer</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">70% do orçamento</span>
                    <span className="font-bold text-orange-600">R$ 420,00</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                    <span className="font-medium">Educação</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">64% do orçamento</span>
                    <span className="font-bold text-indigo-600">R$ 320,00</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}