import { db } from "./server/db";
import { chartOfAccounts } from "./shared/schema";
import { eq } from "drizzle-orm";

async function fixAccount() {
    console.log("Buscando conta 'Receitas'...");

    try {
        const accounts = await db.select().from(chartOfAccounts);
        const receitaAccount = accounts.find(acc => acc.name.toLowerCase().includes("receita"));

        if (receitaAccount) {
            console.log("Conta encontrada:", receitaAccount);

            await db.update(chartOfAccounts)
                .set({
                    level: 1,
                    code: "1",
                    parentId: null,
                    type: "receita",
                    category: "Receitas",
                    subcategory: null
                })
                .where(eq(chartOfAccounts.id, receitaAccount.id));

            console.log("Conta corrigida com sucesso!");
        } else {
            console.log("Conta 'Receitas' não encontrada.");
        }
    } catch (err) {
        console.error("Erro durante a correção:", err);
    }
}

fixAccount().catch(console.error);
