import { db } from "../server/db";
import { chartAccounts } from "../shared/schema";
import { eq, and } from "drizzle-orm";

async function fixAccount() {
    console.log("Buscando conta 'Receitas'...");

    const accounts = await db.select().from(chartAccounts);
    console.log("Contas encontradas:", JSON.stringify(accounts, null, 2));

    const receitaAccount = accounts.find(acc => acc.name.toLowerCase().includes("receita"));

    if (receitaAccount) {
        console.log("Conta encontrada:", receitaAccount);

        // Aplicar correção
        await db.update(chartAccounts)
            .set({
                level: 1,
                code: "1",
                parentId: null,
                type: "receita",
                category: "Receitas"
            })
            .where(eq(chartAccounts.id, receitaAccount.id));

        console.log("Conta corrigida com sucesso!");
    } else {
        console.log("Conta 'Receitas' não encontrada.");
    }
}

fixAccount().catch(console.error);
