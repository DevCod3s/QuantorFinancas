import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Target, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Budget } from "@shared/schema";

interface BudgetWithUsage extends Budget {
  used: number;
  percentage: number;
  categoryName: string;
}

export function Budgets() {
  const { data: budgets = [], isLoading } = useQuery<BudgetWithUsage[]>({
    queryKey: ["/api/budgets"],
  });

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(amount));
  };

  const getBudgetStatus = (percentage: number) => {
    if (percentage >= 100) return { color: 'red', icon: AlertTriangle, text: 'Excedido' };
    if (percentage >= 80) return { color: 'yellow', icon: AlertTriangle, text: 'Atenção' };
    return { color: 'green', icon: CheckCircle, text: 'No prazo' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orçamentos</h1>
          <p className="mt-1 text-sm text-gray-600">
            Controle seus gastos por categoria
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Orçamento
        </Button>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Orçamentos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgets.length}</div>
            <p className="text-xs text-muted-foreground">
              Categorias com orçamento definido
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Em Risco</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {budgets.filter(b => b.percentage >= 80 && b.percentage < 100).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Orçamentos próximos do limite
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Excedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {budgets.filter(b => b.percentage >= 100).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Orçamentos ultrapassados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget List */}
      <Card>
        <CardHeader>
          <CardTitle>Seus Orçamentos</CardTitle>
          <CardDescription>
            Acompanhe o progresso de cada categoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : budgets.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum orçamento definido</p>
              <p className="text-sm text-gray-400">
                Crie seu primeiro orçamento para começar a controlar seus gastos
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {budgets.map((budget) => {
                const status = getBudgetStatus(budget.percentage);
                const StatusIcon = status.icon;
                
                return (
                  <div
                    key={budget.id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{budget.categoryName}</h3>
                        <Badge 
                          variant={status.color === 'red' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.text}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {formatCurrency(budget.used.toString())} / {formatCurrency(budget.amount)}
                        </span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Progress 
                        value={Math.min(budget.percentage, 100)} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{budget.percentage.toFixed(1)}% utilizado</span>
                        <span>
                          {budget.period === 'monthly' ? 'Mensal' : 'Anual'} • 
                          {budget.month ? ` ${budget.month}` : ''}/{budget.year}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}