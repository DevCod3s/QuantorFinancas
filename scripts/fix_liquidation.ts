import { db } from "../server/db";
import { transactions } from "../shared/schema";
import { eq, isNull, and } from "drizzle-orm";

async function run() {
  try {
    const today = new Date();
    
    // Find liquidations with null liquidationDate AND status 'pago' AND amount '2208.17'
    const txsToFix = await db.select().from(transactions).where(
      and(
        eq(transactions.status, 'pago'),
        isNull(transactions.liquidationDate),
        eq(transactions.amount, '2208.17')
      )
    );
    
    let count = 0;
    for (const t of txsToFix) {
      // Verifica se a data do vencimento original era 10/03/2026
      if (t.date && new Date(t.date).toISOString().startsWith('2026-03-10')) {
        const updateDate = new Date(); // Hoje
        await db.update(transactions)
          .set({ liquidationDate: updateDate })
          .where(eq(transactions.id, t.id));
        console.log(`Updated transaction ${t.id} - ${t.description} with today's date.`);
        count++;
      }
    }
    
    console.log(`Fixed ${count} transaction(s).`);
  } catch (error) {
    console.error('Error running script:', error);
  } finally {
    process.exit(0);
  }
}

run();
