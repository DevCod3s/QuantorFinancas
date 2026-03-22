import { insertTransactionSchema } from './shared/schema';

const payloadStr = {
  status: 'Recebido',
  amount: '100',
  bankAccountId: 1,
  liquidationDate: '2024-03-22',
  observacoes: ''
};

const res = insertTransactionSchema.partial().safeParse(payloadStr);
if (!res.success) {
  console.log("ERRO DE VALIDAÇÃO:");
  console.dir(res.error.errors, { depth: null });
} else {
  console.log("VALIDAÇÃO PASSOU COM SUCESSO");
}
