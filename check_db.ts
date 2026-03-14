import { db } from './server/db';
import { transactions } from './shared/schema';

async function check() {
  const all = await db.select().from(transactions).limit(10);
  console.log(JSON.stringify(all.map(t => ({
    id: t.id,
    desc: t.description,
    recorrencia: t.recorrenciaId,
    parcelamento: t.parcelamentoId,
    repeticao: t.repeticao
  })), null, 2));
  process.exit(0);
}

check().catch(console.error);
