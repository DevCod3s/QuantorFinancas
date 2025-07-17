import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { FloatingInput, FloatingSelect, FloatingTextarea } from "@/components/ui/floating-input";
import { useCreateTransaction, useUpdateTransaction } from "@/hooks/use-transactions";
import { useQuery } from "@tanstack/react-query";
import { Transaction, Category } from "@/types";

const transactionSchema = z.object({
  type: z.enum(['receita', 'despesa']),
  amount: z.string().min(1, 'Valor é obrigatório'),
  date: z.string().min(1, 'Data é obrigatória'),
  categoryId: z.number().optional(),
  description: z.string().min(1, 'Descrição é obrigatória'),
  notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  transaction?: Transaction;
}

export default function TransactionForm({ open, onClose, transaction }: TransactionFormProps) {
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
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

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transaction?.type || 'despesa',
      amount: transaction?.amount || '',
      date: transaction?.date || new Date().toISOString().split('T')[0],
      categoryId: transaction?.categoryId || undefined,
      description: transaction?.description || '',
      notes: transaction?.notes || '',
    },
  });

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true);
    try {
      if (transaction) {
        await updateTransaction.mutateAsync({
          id: transaction.id,
          ...data,
        });
      } else {
        await createTransaction.mutateAsync(data);
      }
      onClose();
      form.reset();
    } catch (error) {
      console.error('Error submitting transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedType = form.watch('type');
  const filteredCategories = categories?.filter(cat => cat.type === selectedType) || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {transaction ? 'Editar Transação' : 'Nova Transação'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FloatingInput
                      label="Descrição"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FloatingSelect
                        label="Tipo"
                        {...field}
                      >
                        <option value="">Selecionar</option>
                        <option value="receita">Receita</option>
                        <option value="despesa">Despesa</option>
                      </FloatingSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FloatingInput
                        label="Valor (R$)"
                        type="number"
                        step="0.01"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FloatingSelect
                      label="Categoria"
                      {...field}
                      value={field.value?.toString() || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    >
                      <option value="">Selecionar categoria</option>
                      {filteredCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </FloatingSelect>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FloatingInput
                      label="Data"
                      type="date"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FloatingTextarea
                      label="Observações (opcional)"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
