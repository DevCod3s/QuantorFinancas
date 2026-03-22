import { db } from './server/db';
import { transactions } from './shared/schema';
import { eq } from 'drizzle-orm';

async function fixBug() {
  console.log("Iniciando correção de banco de dados...");
  
  const updated = await db.update(transactions)
    .set({ status: 'pago' })
    .where(eq(transactions.status, 'Recebido'))
    .returning();
    
  console.log(`Corrigidas ${updated.length} transações que ficaram presas na interface.`);
  process.exit(0);
}

fixBug().catch(e => {
  console.error(e);
  process.exit(1);
});
