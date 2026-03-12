
import { db } from "./server/db";
import { relationships } from "./shared/schema";
import { sql } from "drizzle-orm";

async function debugData() {
  console.log("--- DEBUG DE DADOS DE RELACIONAMENTOS ---");
  
  const allRel = await db.select().from(relationships).limit(10);
  console.log(`Total de relacionamentos (amostra de 10): ${allRel.length}`);
  
  allRel.forEach(r => {
    console.log(`ID: ${r.id}, UserID: ${r.userId}, Nome: ${r.socialName}, Cidade: ${r.city}, Estado: ${r.state}, CEP: ${r.zipCode}`);
  });

  const countPerUser = await db.select({ 
    userId: relationships.userId, 
    count: sql<number>`count(*)` 
  }).from(relationships).groupBy(relationships.userId);
  
  console.log("Distribuição por Usuário:");
  console.table(countPerUser);

  process.exit(0);
}

debugData().catch(err => {
  console.error(err);
  process.exit(1);
});
