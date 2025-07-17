import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardData } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function DashboardOverview() {
  const { toast } = useToast();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
    queryFn: async (): Promise<DashboardData> => {
      try {
        const response = await fetch("/api/dashboard", {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error(`${response.status}: ${response.statusText}`);
        }
        return response.json();
      } catch (error) {
        if (isUnauthorizedError(error as Error)) {
          toast({
            title: "Não autorizado",
            description: "Você foi desconectado. Redirecionando...",
            variant: "destructive",
          });
          setTimeout(() => {
            window.location.href = "/api/login";
          }, 500);
          return null;
        }
        throw error;
      }
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getVariationColor = (value: number) => {
    return value >= 0 ? 'text-secondary' : 'text-destructive';
  };

  const expenseChartData = {
    labels: dashboardData?.expensesByCategory?.map(item => item.category) || [],
    datasets: [
      {
        data: dashboardData?.expensesByCategory?.map(item => item.amount) || [],
        backgroundColor: dashboardData?.expensesByCategory?.map(item => item.color) || [],
        borderWidth: 0,
      },
    ],
  };

  const trendChartData = {
    labels: dashboardData?.monthlyTrends?.map(item => item.month) || [],
    datasets: [
      {
        label: 'Receitas',
        data: dashboardData?.monthlyTrends?.map(item => item.income) || [],
        borderColor: 'hsl(158, 64%, 40%)',
        backgroundColor: 'hsla(158, 64%, 40%, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Despesas',
        data: dashboardData?.monthlyTrends?.map(item => item.expenses) || [],
        borderColor: 'hsl(0, 84%, 60%)',
        backgroundColor: 'hsla(0, 84%, 60%, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          },
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i} className="card-hover">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Erro ao carregar dados do dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-hover border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Saldo Total</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(dashboardData.totalBalance)}
                </p>
                <p className={`text-sm mt-1 ${getVariationColor(dashboardData.totalBalance)}`}>
                  <i className="fas fa-arrow-up text-xs mr-1"></i>
                  {dashboardData.totalBalance >= 0 ? 'Positivo' : 'Negativo'}
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-wallet text-secondary text-lg"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Receitas do Mês</p>
                <p className="text-2xl font-bold text-secondary">
                  {formatCurrency(dashboardData.monthlyIncome)}
                </p>
                <p className="text-sm text-secondary mt-1">
                  <i className="fas fa-arrow-down text-xs mr-1"></i>
                  Entrada
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-arrow-down text-secondary text-lg"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Despesas do Mês</p>
                <p className="text-2xl font-bold text-destructive">
                  {formatCurrency(dashboardData.monthlyExpenses)}
                </p>
                <p className="text-sm text-destructive mt-1">
                  <i className="fas fa-arrow-up text-xs mr-1"></i>
                  Saída
                </p>
              </div>
              <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-arrow-up text-destructive text-lg"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Economia do Mês</p>
                <p className="text-2xl font-bold text-accent">
                  {formatCurrency(dashboardData.monthlySavings)}
                </p>
                <p className={`text-sm mt-1 ${getVariationColor(dashboardData.monthlySavings)}`}>
                  <i className={`fas ${dashboardData.monthlySavings >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'} text-xs mr-1`}></i>
                  {dashboardData.monthlySavings >= 0 ? 'Economia' : 'Déficit'}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-piggy-bank text-accent text-lg"></i>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Categories Chart */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Despesas por Categoria</span>
              <select className="text-sm border border-input rounded-lg px-3 py-1">
                <option>Este mês</option>
                <option>Últimos 3 meses</option>
                <option>Este ano</option>
              </select>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {dashboardData.expensesByCategory.length > 0 ? (
                <Doughnut data={expenseChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Nenhuma despesa encontrada
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend Chart */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Tendência Mensal</span>
              <div className="flex space-x-2">
                <span className="flex items-center text-sm">
                  <div className="w-3 h-3 bg-secondary rounded-full mr-2"></div>
                  Receitas
                </span>
                <span className="flex items-center text-sm">
                  <div className="w-3 h-3 bg-destructive rounded-full mr-2"></div>
                  Despesas
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Line data={trendChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transações Recentes</span>
            <button className="text-primary hover:text-primary/80 text-sm font-medium">
              Ver todas
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.recentTransactions.length > 0 ? (
              dashboardData.recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      transaction.type === 'receita' ? 'bg-secondary/10' : 'bg-destructive/10'
                    }`}>
                      <i className={`fas ${
                        transaction.category?.icon || 'fa-circle'
                      } ${transaction.type === 'receita' ? 'text-secondary' : 'text-destructive'}`}></i>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.category?.name || 'Sem categoria'} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'receita' ? 'text-secondary' : 'text-destructive'
                    }`}>
                      {transaction.type === 'receita' ? '+' : '-'}{formatCurrency(parseFloat(transaction.amount))}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.type === 'receita' ? 'Receita' : 'Despesa'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma transação encontrada
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
