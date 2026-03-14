import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { transactions } from './shared/schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function main() {
  console.log("Revertendo liquidação da transação ID 110...");
  
  await db.update(transactions)
    .set({ status: 'pendente', bankAccountId: null })
    .where(eq(transactions.id, 110));
    
  console.log("Reversão concluída com sucesso! Status alterado para pendente e conta desvinculada.");
}

main().catch(console.error);
