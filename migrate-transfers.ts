import { db } from "./server/db";
import { transactions } from "./shared/schema";
import { eq, and, or, ilike } from "drizzle-orm";

async function main() {
  console.log("Migrando antigas transferencias...");
  
  // Buscar despesas que contenham 'transfer' na descricao
  const antigasDespesas = await db.select().from(transactions).where(
    and(
      eq(transactions.type, "expense"),
      or(
        ilike(transactions.description, "%transfer%"),
        ilike(transactions.description, "%transf%")
      )
    )
  );
  
  console.log(`Encontradas ${antigasDespesas.length} despesas que parecem transferencias.`);
  for (const t of antigasDespesas) {
    await db.update(transactions).set({ type: "transfer-out" }).where(eq(transactions.id, t.id));
    console.log(`Atualizada despesa ID ${t.id} para transfer-out.`);
  }

  const antigasReceitas = await db.select().from(transactions).where(
    and(
      eq(transactions.type, "income"),
      or(
        ilike(transactions.description, "%transfer%"),
        ilike(transactions.description, "%transf%")
      )
    )
  );

  console.log(`Encontradas ${antigasReceitas.length} receitas que parecem transferencias.`);
  for (const t of antigasReceitas) {
    await db.update(transactions).set({ type: "transfer-in" }).where(eq(transactions.id, t.id));
    console.log(`Atualizada receita ID ${t.id} para transfer-in.`);
  }
  
  console.log("Migracao concluida.");
  process.exit(0);
}

main().catch(console.error);
