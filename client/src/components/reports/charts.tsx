import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FloatingSelect } from "@/components/ui/floating-input";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardData, Transaction } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
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
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function ReportsCharts() {
  const { toast } = useToast();
  const [periodFilter, setPeriodFilter] = useState('month');
  const [reportType, setReportType] = useState('summary');

  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
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

  const { data: transactions, isLoading: isTransactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
    queryFn: async (): Promise<Transaction[]> => {
      try {
        const response = await fetch("/api/transactions", {
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

  const generateYearlyComparison = () => {
    if (!transactions) return { labels: [], datasets: [] };

    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    
    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];

    const currentYearData = Array(12).fill(0);
    const lastYearData = Array(12).fill(0);

    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const year = date.getFullYear();
      const month = date.getMonth();
      const amount = parseFloat(transaction.amount);

      if (transaction.type === 'receita') {
        if (year === currentYear) {
          currentYearData[month] += amount;
        } else if (year === lastYear) {
          lastYearData[month] += amount;
        }
      }
    });

    return {
      labels: months,
      datasets: [
        {
          label: lastYear.toString(),
          data: lastYearData,
          borderColor: 'hsl(215, 16%, 47%)',
          backgroundColor: 'hsla(215, 16%, 47%, 0.1)',
          tension: 0.4,
        },
        {
          label: currentYear.toString(),
          data: currentYearData,
          borderColor: 'hsl(210, 65%, 23%)',
          backgroundColor: 'hsla(210, 65%, 23%, 0.1)',
          tension: 0.4,
        },
      ],
    };
  };

  const generateCategoryAnalysis = () => {
    if (!transactions) return [];

    const categoryTotals: { [key: string]: { total: number; count: number; change: number } } = {};

    // Get current month transactions
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear && t.type === 'despesa';
    });

    const lastMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear && t.type === 'despesa';
    });

    // Calculate current month totals
    currentMonthTransactions.forEach(transaction => {
      const categoryName = transaction.category?.name || 'Outros';
      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = { total: 0, count: 0, change: 0 };
      }
      categoryTotals[categoryName].total += parseFloat(transaction.amount);
      categoryTotals[categoryName].count += 1;
    });

    // Calculate changes from last month
    const lastMonthTotals: { [key: string]: number } = {};
    lastMonthTransactions.forEach(transaction => {
      const categoryName = transaction.category?.name || 'Outros';
      if (!lastMonthTotals[categoryName]) {
        lastMonthTotals[categoryName] = 0;
      }
      lastMonthTotals[categoryName] += parseFloat(transaction.amount);
    });

    Object.keys(categoryTotals).forEach(category => {
      const currentTotal = categoryTotals[category].total;
      const lastTotal = lastMonthTotals[category] || 0;
      categoryTotals[category].change = lastTotal > 0 ? ((currentTotal - lastTotal) / lastTotal) * 100 : 0;
    });

    return Object.entries(categoryTotals)
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        change: data.change,
        percentage: 0, // Will be calculated after sorting
      }))
      .sort((a, b) => b.total - a.total)
      .map((item, index, array) => {
        const totalSpending = array.reduce((sum, i) => sum + i.total, 0);
        return {
          ...item,
          percentage: totalSpending > 0 ? (item.total / totalSpending) * 100 : 0,
        };
      });
  };

  const isLoading = isDashboardLoading || isTransactionsLoading;

  // Chart data
  const incomeExpenseData = {
    labels: dashboardData?.monthlyTrends?.map(item => item.month) || [],
    datasets: [
      {
        label: 'Receitas',
        data: dashboardData?.monthlyTrends?.map(item => item.income) || [],
        backgroundColor: 'hsl(158, 64%, 40%)',
      },
      {
        label: 'Despesas',
        data: dashboardData?.monthlyTrends?.map(item => item.expenses) || [],
        backgroundColor: 'hsl(0, 84%, 60%)',
      },
    ],
  };

  const spendingPatternsData = {
    labels: dashboardData?.expensesByCategory?.map(item => item.category) || [],
    datasets: [
      {
        data: dashboardData?.expensesByCategory?.map(item => item.amount) || [],
        backgroundColor: dashboardData?.expensesByCategory?.map(item => item.color) || [],
        borderWidth: 0,
      },
    ],
  };

  const yearlyComparisonData = generateYearlyComparison();
  const categoryAnalysis = generateCategoryAnalysis();

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

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array(2).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Relatórios Financeiros</h2>
        <p className="text-muted-foreground mt-1">Análises detalhadas do seu comportamento financeiro</p>
      </div>

      {/* Report Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FloatingSelect
              label="Período"
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
            >
              <option value="month">Este mês</option>
              <option value="quarter">Últimos 3 meses</option>
              <option value="year">Este ano</option>
              <option value="custom">Período customizado</option>
            </FloatingSelect>
            
            <FloatingSelect
              label="Tipo de Relatório"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="summary">Resumo Geral</option>
              <option value="categories">Por Categoria</option>
              <option value="trends">Tendências</option>
              <option value="comparison">Comparativo</option>
            </FloatingSelect>
            
            <Button className="bg-primary hover:bg-primary/90 h-12">
              <i className="fas fa-download mr-2"></i>
              Exportar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Receitas vs Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {dashboardData?.monthlyTrends && dashboardData.monthlyTrends.length > 0 ? (
                <Bar data={incomeExpenseData} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Dados insuficientes para o gráfico
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Spending Patterns */}
        <Card>
          <CardHeader>
            <CardTitle>Padrões de Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryAnalysis.length > 0 ? (
                categoryAnalysis.slice(0, 4).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <i className="fas fa-circle text-muted-foreground"></i>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.category}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.percentage.toFixed(1)}% do total
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {formatCurrency(item.total)}
                      </p>
                      <p className={`text-sm ${item.change >= 0 ? 'text-destructive' : 'text-secondary'}`}>
                        {item.change >= 0 ? '+' : ''}{item.change.toFixed(1)}% vs mês anterior
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum dado de categoria disponível
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spending by Category Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Gastos por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {dashboardData?.expensesByCategory && dashboardData.expensesByCategory.length > 0 ? (
              <Doughnut data={spendingPatternsData} options={doughnutOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Nenhum dado de despesa por categoria disponível
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Comparativo Anual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {yearlyComparisonData.labels.length > 0 ? (
              <Line data={yearlyComparisonData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Dados insuficientes para comparação anual
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
