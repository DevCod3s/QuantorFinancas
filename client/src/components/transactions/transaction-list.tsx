import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FloatingInput, FloatingSelect } from "@/components/ui/floating-input";
import { useTransactions, useDeleteTransaction } from "@/hooks/use-transactions";
import { useQuery } from "@tanstack/react-query";
import { Transaction, Category } from "@/types";
import TransactionForm from "./transaction-form";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function TransactionList() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: transactions, isLoading } = useTransactions();
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async (): Promise<Category[]> => {
      const response = await fetch("/api/categories", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
  });

  const deleteTransaction = useDeleteTransaction();

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(value));
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      await deleteTransaction.mutateAsync(id);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTransaction(undefined);
  };

  const filteredTransactions = transactions?.filter((transaction: Transaction) => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || transaction.categoryId?.toString() === categoryFilter;
    const matchesType = !typeFilter || transaction.type === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  }) || [];

  // Redefinir página atual para 1 quando os filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, typeFilter]);

  // Limitar página atual quando total de páginas diminui
  useEffect(() => {
    const filteredCount = filteredTransactions.length;
    const newTotalPages = Math.ceil(filteredCount / itemsPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  }, [filteredTransactions.length, currentPage, itemsPerPage]);

  // Paginação
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getCategoryBadgeColor = (type: string) => {
    return type === 'receita' ? 'bg-secondary/10 text-secondary' : 'bg-destructive/10 text-destructive';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Gerenciar Transações</h2>
          <p className="text-muted-foreground mt-1">Adicione, edite e organize suas receitas e despesas</p>
        </div>
        <Button 
          onClick={() => setIsFormOpen(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <i className="fas fa-plus mr-2"></i>
          Nova Transação
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FloatingInput
              label="Pesquisar transação"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FloatingSelect
              label="Categoria"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Todas as categorias</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </FloatingSelect>
            <FloatingSelect
              label="Tipo"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">Todos os tipos</option>
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </FloatingSelect>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Descrição</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Categoria</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Data</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Valor</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((transaction: Transaction) => (
                    <tr key={transaction.id} className="hover:bg-muted/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            transaction.type === 'receita' ? 'bg-secondary/10' : 'bg-destructive/10'
                          }`}>
                            <i className={`fas ${
                              transaction.category?.icon || 'fa-circle'
                            } ${transaction.type === 'receita' ? 'text-secondary' : 'text-destructive'} text-sm`}></i>
                          </div>
                          <span className="font-medium text-foreground">{transaction.description}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge className={getCategoryBadgeColor(transaction.type)}>
                          {transaction.category?.name || 'Sem categoria'}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`font-semibold ${
                          transaction.type === 'receita' ? 'text-secondary' : 'text-destructive'
                        }`}>
                          {transaction.type === 'receita' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(transaction)}
                            className="text-primary hover:text-primary/80"
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(transaction.id)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      Nenhuma transação encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Paginação */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600" data-testid="text-pagination-info">
                  Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filteredTransactions.length)} a{" "}
                  {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} de {filteredTransactions.length} registros
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  data-testid="button-previous-page"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <span className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded font-medium">
                  {currentPage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  data-testid="button-next-page"
                >
                  Próxima
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <TransactionForm
        open={isFormOpen}
        onClose={handleCloseForm}
        transaction={editingTransaction}
      />
    </div>
  );
}
