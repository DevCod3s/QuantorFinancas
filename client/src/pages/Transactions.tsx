import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Search, Filter, Eye, TrendingUp, TrendingDown, DollarSign, CreditCard, Building, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Transaction } from "@shared/schema";

export function Transactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [activeTab, setActiveTab] = useState("visao-geral");

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
        <div className="relative">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4 bg-gray-100 p-1 rounded-lg">
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
          
          {/* Barra de progressão animada */}
          <div className="absolute bottom-0 left-1 right-1 h-0.5 bg-transparent">
            <div 
              className={`h-full bg-blue-600 transition-all duration-500 ease-in-out rounded-full ${
                activeTab === "visao-geral" ? "w-1/4 translate-x-0" :
                activeTab === "movimentacoes" ? "w-1/4 translate-x-full" :
                activeTab === "contas" ? "w-1/4 translate-x-[200%]" :
                activeTab === "centro-custo" ? "w-1/4 translate-x-[300%]" : "w-0"
              }`}
              style={{
                transformOrigin: "left center"
              }}
            />
          </div>
        </div>

        <TabsContent value="visao-geral" className="space-y-6">
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

          {/* Gráfico de gastos por categoria */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo Financeiro</CardTitle>
              <CardDescription>
                Visão geral das suas finanças este mês
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Gráfico de gastos por categoria será implementado aqui
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movimentacoes" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar transações..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filterType === "all" ? "default" : "outline"}
                    onClick={() => setFilterType("all")}
                    size="sm"
                  >
                    Todas
                  </Button>
                  <Button
                    variant={filterType === "income" ? "default" : "outline"}
                    onClick={() => setFilterType("income")}
                    size="sm"
                  >
                    Receitas
                  </Button>
                  <Button
                    variant={filterType === "expense" ? "default" : "outline"}
                    onClick={() => setFilterType("expense")}
                    size="sm"
                  >
                    Despesas
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <Card>
            <CardHeader>
              <CardTitle>Suas Movimentações</CardTitle>
              <CardDescription>
                Lista de todas as suas transações financeiras
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Nenhuma movimentação encontrada</p>
                  <p className="text-sm text-gray-400">Adicione sua primeira transação para começar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${
                          transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`font-bold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
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