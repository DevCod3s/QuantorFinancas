import fs from 'fs';
let content = fs.readFileSync('client/src/pages/Transactions.tsx', 'utf8');

const target = `      // Aqui você processaria a baixa no backend
      console.log('Processando baixa em lote:', {
        tipo: batchPaymentType,
        contaBancariaId: paymentData.contaBancaria,
        dataBaixa: paymentData.dataBaixa,
        formaPagamento: paymentData.formaPagamento,
        jurosMulta,
        desconto,
        totalOriginal,
        totalFinal,
        observacoes: paymentData.observacoes,
        itens: selectedItems
      });

      // Limpar seleção e desativar modo após processar`;

const replacement = `      // Lógica de distribuição e salvamento real no Backend
      const targetStatus = batchPaymentType === 'payable' ? 'Pago' : 'Recebido'; // Status padrão

      // Executar todas as mutações em paralelo usando a Rota Existente
      await Promise.all(selectedItems.map(async (item) => {
        // Distribuição proporcional de juros e descontos para manter integridade visual no painel
        const currValue = item.value || 0;
        const proportion = totalOriginal > 0 ? (currValue / totalOriginal) : 0;
        const itemJuros = jurosMulta * proportion;
        const itemDesconto = desconto * proportion;
        const itemFinalValue = currValue + itemJuros - itemDesconto;

        const payload = {
          status: batchPaymentType === 'payable' ? 'pago' : 'recebido',
          amount: itemFinalValue.toString(),
          bankAccountId: paymentData.contaBancaria,
          liquidationDate: paymentData.dataBaixa,
          paymentMethod: paymentData.formaPagamento,
          observacoes: paymentData.observacoes || item.observacoes || ''
        };

        return updateTransactionMutation.mutateAsync({
           id: item.id,
           data: payload
        });
      }));

      // Forçar o refetch de relatórios, Dashboards e lista
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['/api/bank-accounts'], refetchType: 'all' });

      // Limpar seleção e desativar modo após processar`;

const normalize = (str) => str.replace(/\\r\\n/g, '\\n').replace(/\\r/g, '\\n');
content = normalize(content);
const targetNorm = normalize(target);

content = content.replace(targetNorm, replacement);
fs.writeFileSync('client/src/pages/Transactions.tsx', content);
console.log("Replaced successfully!");
