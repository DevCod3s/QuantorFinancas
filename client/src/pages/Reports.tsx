import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Calendar, TrendingUp, PieChart, Landmark } from "lucide-react";
import { getBankBranding, BankLogoWithFallback } from "@/lib/bankBranding";

export function Reports() {
  const [period, setPeriod] = useState<"month" | "year">("month");

  const { data: reportData, isLoading } = useQuery({
    queryKey: ["/api/reports", period],
  });

  const { data: bankAccounts } = useQuery<any[]>({
    queryKey: ["/api/bank-accounts"],
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="mt-1 text-sm text-gray-600">
            Análise detalhada das suas finanças
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={period === "month" ? "default" : "outline"}
            onClick={() => setPeriod("month")}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Mensal
          </Button>
          <Button
            variant={period === "year" ? "default" : "outline"}
            onClick={() => setPeriod("year")}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Anual
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Report Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245</div>
            <p className="text-xs text-muted-foreground">
              +12% em relação ao período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Maior Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ 5.200</div>
            <p className="text-xs text-muted-foreground">
              Salário - 15/11/2024
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Maior Despesa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">R$ 1.200</div>
            <p className="text-xs text-muted-foreground">
              Aluguel - 05/11/2024
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Categoria Principal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#B59363]">Moradia</div>
            <p className="text-xs text-muted-foreground">
              32% do total de despesas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Evolução Mensal
            </CardTitle>
            <CardDescription>
              Receitas vs Despesas ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Gráfico de evolução</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribuição por Categoria
            </CardTitle>
            <CardDescription>
              Proporção de gastos por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Gráfico de pizza</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Principais Categorias</CardTitle>
          <CardDescription>
            Categorias com maior movimentação no período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "Moradia", amount: "R$ 1.800", percentage: 32, color: "#ef4444" },
              { name: "Alimentação", amount: "R$ 980", percentage: 18, color: "#f97316" },
              { name: "Transporte", amount: "R$ 650", percentage: 12, color: "#eab308" },
              { name: "Lazer", amount: "R$ 420", percentage: 8, color: "#22c55e" },
              { name: "Saúde", amount: "R$ 350", percentage: 6, color: "#4D4E48" },
            ].map((category) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-medium">{category.amount}</div>
                    <div className="text-sm text-gray-500">{category.percentage}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contas Bancárias */}
      {bankAccounts && bankAccounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5" />
              Contas Bancárias
            </CardTitle>
            <CardDescription>
              Visão geral das suas contas com identificação por instituição
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bankAccounts.map((account: any) => {
                const brand = getBankBranding(account.bank);
                const balance = account.balance ?? parseFloat(account.currentBalance || '0');
                return (
                  <div
                    key={account.id}
                    className="rounded-xl overflow-hidden shadow-md border border-gray-100"
                  >
                    {/* Header com cor do banco */}
                    <div
                      className="px-4 py-3 flex items-center gap-3"
                      style={{ background: `linear-gradient(135deg, ${brand.gradientFrom}, ${brand.gradientTo})` }}
                    >
                      <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                        <BankLogoWithFallback bankCode={account.bank} customLogoUrl={account.customLogoUrl} size={28} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-bold text-sm truncate">{account.name}</div>
                        <div className="text-white/70 text-[10px] uppercase tracking-wider">
                          {account.accountType === 'conta_corrente' ? 'Conta Corrente' :
                            account.accountType === 'conta_poupanca' ? 'Conta Poupança' :
                              account.accountType === 'conta_investimento' ? 'Investimento' : 'Conta'}
                          {account.agency && ` • AG ${account.agency}`}
                          {account.accountNumber && ` • CC ${account.accountNumber}`}
                        </div>
                      </div>
                    </div>
                    {/* Conteúdo */}
                    <div className="px-4 py-3 bg-white">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Saldo Atual</span>
                        <span className={`text-sm font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {formatCurrency(balance)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}