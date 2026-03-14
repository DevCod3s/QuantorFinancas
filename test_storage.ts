import { storage } from './server/storage.js';

async function run() {
  try {
    const transactions = await storage.getTransactionsByUserId('1');
    const recorrentes = transactions.filter(t => t.repeticao === 'Recorrente').slice(0, 5);
    console.log(JSON.stringify(recorrentes.map(t => ({
      id: t.id,
      recorrenciaId: t.recorrenciaId,
      parcelamentoId: t.parcelamentoId,
      desc: t.description
    })), null, 2));
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}
run();
