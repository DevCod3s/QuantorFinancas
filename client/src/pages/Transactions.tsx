import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Search, Filter, Eye, TrendingUp, TrendingDown, DollarSign, CreditCard, Building, Target, Activity, FileText, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubTabs } from "@/components/SubTabs";
import { Transaction } from "@shared/schema";

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
                    {/* Cards de resumo */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="border-l-4 border-l-green-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">
                            Receitas do Mês
                          </CardTitle>
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-600">R$ 5.420,00</div>
                          <p className="text-xs text-gray-500">
                            +12% em relação ao mês anterior
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border-l-4 border-l-red-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">
                            Despesas do Mês
                          </CardTitle>
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-red-600">R$ 3.280,00</div>
                          <p className="text-xs text-gray-500">
                            -8% em relação ao mês anterior
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">
                            Saldo Atual
                          </CardTitle>
                          <DollarSign className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-blue-600">R$ 2.140,00</div>
                          <p className="text-xs text-gray-500">
                            Saldo disponível
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Gráfico de fluxo de caixa */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Fluxo de Caixa Mensal</CardTitle>
                        <CardDescription>
                          Acompanhe as entradas e saídas de dinheiro
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 text-gray-500">
                          Gráfico de fluxo de caixa será implementado aqui
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )
              },
              {
                value: "lancamentos",
                label: "Lançamentos",
                icon: <FileText className="h-4 w-4" />,
                content: (
                  <div className="space-y-6">
                    {/* Resumo de lançamentos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Últimos Lançamentos</CardTitle>
                          <CardDescription>
                            Transações recentes registradas
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <div>
                                  <p className="font-medium text-sm">Salário</p>
                                  <p className="text-xs text-gray-500">15/01/2025</p>
                                </div>
                              </div>
                              <span className="text-green-600 font-medium">+R$ 3.500,00</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <div>
                                  <p className="font-medium text-sm">Aluguel</p>
                                  <p className="text-xs text-gray-500">10/01/2025</p>
                                </div>
                              </div>
                              <span className="text-red-600 font-medium">-R$ 1.200,00</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <div>
                                  <p className="font-medium text-sm">Supermercado</p>
                                  <p className="text-xs text-gray-500">08/01/2025</p>
                                </div>
                              </div>
                              <span className="text-red-600 font-medium">-R$ 285,50</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Estatísticas do Mês</CardTitle>
                          <CardDescription>
                            Resumo das movimentações
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Total de Lançamentos</span>
                              <span className="font-semibold">24 transações</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Média Diária</span>
                              <span className="font-semibold">R$ 142,30</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Maior Entrada</span>
                              <span className="font-semibold text-green-600">R$ 3.500,00</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Maior Saída</span>
                              <span className="font-semibold text-red-600">R$ 1.200,00</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Botão de ação */}
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Novo Lançamento
                          </Button>
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