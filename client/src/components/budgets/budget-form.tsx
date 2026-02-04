import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import CustomInput, { CustomSelect } from "@/components/CustomInput";
import { useCreateBudget, useUpdateBudget } from "@/hooks/use-budgets";
import { useQuery } from "@tanstack/react-query";
import { Budget, Category } from "@/types";
import { DateInput } from "../DateInput";

const budgetSchema = z.object({
  categoryId: z.number().min(1, 'Categoria é obrigatória'),
  budgetedAmount: z.string().min(1, 'Valor é obrigatório'),
  period: z.enum(['mensal', 'anual']),
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  endDate: z.string().min(1, 'Data de fim é obrigatória'),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface BudgetFormProps {
  open: boolean;
  onClose: () => void;
  budget?: Budget;
}

export default function BudgetForm({ open, onClose, budget }: BudgetFormProps) {
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Definir datas padrão baseado no mês atual
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const defaultStartDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
  const defaultEndDate = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      categoryId: budget?.categoryId || undefined,
      budgetedAmount: budget?.budgetedAmount || '',
      period: budget?.period || 'mensal',
      startDate: budget?.startDate || defaultStartDate,
      endDate: budget?.endDate || defaultEndDate,
    },
  });

  const onSubmit = async (data: BudgetFormData) => {
    setIsSubmitting(true);
    try {
      if (budget) {
        await updateBudget.mutateAsync({
          id: budget.id,
          ...data,
        });
      } else {
        await createBudget.mutateAsync(data);
      }
      onClose();
      form.reset();
    } catch (error) {
      console.error('Erro ao enviar orçamento:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrar categorias para mostrar apenas categorias de despesa para orçamentos
  const expenseCategories = categories?.filter(cat => cat.type === 'despesa') || [];

  // Atualizar data de término quando o período muda
  const handlePeriodChange = (period: 'mensal' | 'anual') => {
    const startDate = form.getValues('startDate');
    if (startDate) {
      const start = new Date(startDate);
      let endDate: Date;
      
      if (period === 'mensal') {
        endDate = new Date(start.getFullYear(), start.getMonth() + 1, 0);
      } else {
        endDate = new Date(start.getFullYear(), 11, 31);
      }
      
      form.setValue('endDate', endDate.toISOString().split('T')[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {budget ? 'Editar Orçamento' : 'Novo Orçamento'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <CustomSelect
                      id="category-select"
                      label="Categoria *"
                      {...field}
                      value={field.value?.toString() || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    >
                      <option value="">Selecionar categoria</option>
                      {expenseCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </CustomSelect>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="budgetedAmount"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <CustomInput
                      id="budgeted-amount"
                      label="Valor Orçado (R$) *"
                      type="number"
                      step="0.01"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <CustomSelect
                      id="period-select"
                      label="Período *"
                      {...field}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        field.onChange(e.target.value);
                        handlePeriodChange(e.target.value as 'mensal' | 'anual');
                      }}
                    >
                      <option value="">Selecionar período</option>
                      <option value="mensal">Mensal</option>
                      <option value="anual">Anual</option>
                    </CustomSelect>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <DateInput
                        label="Data de Início *"
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          const period = form.getValues('period');
                          if (period) {
                            handlePeriodChange(period);
                          }
                        }}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <DateInput
                        label="Data de Fim *"
                        value={field.value}
                        onChange={field.onChange}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : budget ? 'Atualizar' : 'Criar Orçamento'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
