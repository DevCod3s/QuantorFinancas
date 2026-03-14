import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { transactions } from './shared/schema';
import { eq, and } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function main() {
  console.log("Buscando transações com valor ~320.00...");
  
  // Como numeric/decimal pode vir de diferentes formas, vamos pegar as que estão perto de 320.
  const found = await db.select().from(transactions).where(
    and(
      eq(transactions.amount, "320.00")
    )
  );

  console.log(`Encontradas: ${found.length}`);
  
  if (found.length === 0) {
    console.log("Nenhuma transação exata de 320.00. Tentando sem os centavos de string...");
    const all = await db.select().from(transactions);
    const matched = all.filter(t => parseFloat(t.amount as string) === 320);
    console.log(`Encontradas pelo filtro: ${matched.length}`);
    matched.forEach(t => console.log(`ID: ${t.id}, Desc: ${t.description}, Status: ${t.status}, Type: ${t.type}`));
    
    // Se achou apenas 1, vamos reverter
    if (matched.length === 1) {
      const target = matched[0];
      console.log(`Revertendo transação ID ${target.id}...`);
      await db.update(transactions)
        .set({ status: 'pendente' })
        .where(eq(transactions.id, target.id));
      console.log("Reversão concluída com sucesso.");
    } else if (matched.length > 1) {
      console.log("Múltiplas transações encontradas. Por favor, seja mais específico.");
    }
  } else {
    found.forEach(t => console.log(`ID: ${t.id}, Desc: ${t.description}, Status: ${t.status}, Type: ${t.type}`));
    
    if (found.length === 1) {
      const target = found[0];
      console.log(`Revertendo transação ID ${target.id}...`);
      await db.update(transactions)
        .set({ status: 'pendente' })
        .where(eq(transactions.id, target.id));
      console.log("Reversão concluída com sucesso.");
    } else {
      console.log("Múltiplas transações encontradas. Por favor, restrinja a busca.");
    }
  }
}

main().catch(console.error);
