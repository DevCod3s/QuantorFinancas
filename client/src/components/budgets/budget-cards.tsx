import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useBudgets, useDeleteBudget } from "@/hooks/use-budgets";
import { useQuery } from "@tanstack/react-query";
import { Budget, Transaction } from "@/types";
import BudgetForm from "./budget-form";

export default function BudgetCards() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>();

  const { data: budgets, isLoading } = useBudgets();
  const { data: transactions } = useQuery({
    queryKey: ["/api/transactions"],
    queryFn: async (): Promise<Transaction[]> => {
      const response = await fetch("/api/transactions", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
  });

  const deleteBudget = useDeleteBudget();

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(typeof value === 'string' ? parseFloat(value) : value);
  };

  const calculateBudgetUsage = (budget: Budget) => {
    if (!transactions) return { spent: 0, percentage: 0, remaining: 0 };

    const budgetStart = new Date(budget.startDate);
    const budgetEnd = new Date(budget.endDate);
    const budgetedAmount = parseFloat(budget.budgetedAmount);

    // Filtrar transações dentro do período do orçamento e mesma categoria
    const relevantTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return (
        transaction.type === 'despesa' &&
        transaction.categoryId === budget.categoryId &&
        transactionDate >= budgetStart &&
        transactionDate <= budgetEnd
      );
    });

    const spent = relevantTransactions.reduce((total, transaction) => {
      return total + parseFloat(transaction.amount);
    }, 0);

    const percentage = budgetedAmount > 0 ? (spent / budgetedAmount) * 100 : 0;
    const remaining = budgetedAmount - spent;

    return { spent, percentage, remaining };
  };

  const getBudgetStatus = (percentage: number) => {
    if (percentage <= 70) return { status: 'Em dia', color: 'text-secondary' };
    if (percentage <= 100) return { status: 'Atenção', color: 'text-accent' };
    return { status: 'Excedido', color: 'text-destructive' };
  };

  const getProgressColor = (percentage: number) => {
    if (percentage <= 70) return 'bg-secondary';
    if (percentage <= 100) return 'bg-accent';
    return 'bg-destructive';
  };

  const getCategoryIcon = (categoryName: string) => {
    const iconMap: { [key: string]: string } = {
      'alimentação': 'fas fa-utensils',
      'transporte': 'fas fa-car',
      'moradia': 'fas fa-home',
      'lazer': 'fas fa-gamepad',
      'saúde': 'fas fa-heartbeat',
      'educação': 'fas fa-graduation-cap',
      'vestuário': 'fas fa-tshirt',
      'outros': 'fas fa-circle',
    };
    
    const key = categoryName.toLowerCase();
    return iconMap[key] || 'fas fa-circle';
  };

  const getCategoryColor = (categoryName: string) => {
    const colorMap: { [key: string]: string } = {
      'alimentação': 'text-red-600 bg-red-50',
      'transporte': 'text-blue-600 bg-blue-50',
      'moradia': 'text-green-600 bg-green-50',
      'lazer': 'text-purple-600 bg-purple-50',
      'saúde': 'text-pink-600 bg-pink-50',
      'educação': 'text-indigo-600 bg-indigo-50',
      'vestuário': 'text-yellow-600 bg-yellow-50',
      'outros': 'text-gray-600 bg-gray-50',
    };
    
    const key = categoryName.toLowerCase();
    return colorMap[key] || 'text-gray-600 bg-gray-50';
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este orçamento?')) {
      await deleteBudget.mutateAsync(id);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBudget(undefined);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="w-6 h-6" />
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-2 w-full mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-16" />
                  <div className="flex space-x-2">
                    <Skeleton className="w-6 h-6" />
                    <Skeleton className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Orçamentos</h2>
          <p className="text-muted-foreground mt-1">Defina e acompanhe seus orçamentos mensais e anuais</p>
        </div>
        <Button 
          onClick={() => setIsFormOpen(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <i className="fas fa-plus mr-2"></i>
          Novo Orçamento
        </Button>
      </div>
      {/* Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets && budgets.length > 0 ? (
          budgets.map((budget: any) => {
            const { spent, percentage, remaining } = calculateBudgetUsage(budget);
            const { status, color } = getBudgetStatus(percentage);
            const progressColor = getProgressColor(percentage);
            const categoryName = budget.category?.name || 'Categoria não definida';
            const categoryIcon = getCategoryIcon(categoryName);
            const categoryColors = getCategoryColor(categoryName);

            return (
              <Card key={budget.id} className="card-hover border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${categoryColors}`}>
                        <i className={`${categoryIcon}`}></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{categoryName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {budget.period === 'mensal' ? 'Mensal' : 'Anual'} • {new Date(budget.startDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground p-1"
                    >
                      <i className="fas fa-ellipsis-v"></i>
                    </Button>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">
                        Gasto: {formatCurrency(spent)}
                      </span>
                      <span className="text-muted-foreground">
                        Orçado: {formatCurrency(budget.budgetedAmount)}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className="h-2 mb-2"
                    />
                    <p className={`text-sm ${percentage <= 100 ? 'text-secondary' : 'text-destructive'}`}>
                      {percentage.toFixed(1)}% utilizado • {formatCurrency(Math.abs(remaining))} {remaining >= 0 ? 'restante' : 'excedente'}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${color}`}>
                      Status: {status}
                    </span>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(budget)}
                        className="text-primary hover:text-primary/80 p-1"
                      >
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(budget.id)}
                        className="text-destructive hover:text-destructive/80 p-1"
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-wallet text-muted-foreground text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum orçamento criado</h3>
            <p className="text-muted-foreground mb-4">
              Comece criando seu primeiro orçamento para acompanhar seus gastos.
            </p>
            <Button 
              onClick={() => setIsFormOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <i className="fas fa-plus mr-2"></i>
              Criar Primeiro Orçamento
            </Button>
          </div>
        )}
      </div>

      <BudgetForm
        open={isFormOpen}
        onClose={handleCloseForm}
        budget={editingBudget}
      />
    </div>
  );
}
