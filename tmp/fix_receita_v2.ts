import { db } from "../server/db";
import { chartOfAccounts } from "../shared/schema";
import { eq } from "drizzle-orm";

async function fixAccount() {
    console.log("Buscando conta 'Receitas'...");

    const accounts = await db.select().from(chartOfAccounts);
    // console.log("Contas encontradas:", JSON.stringify(accounts, null, 2));

    const receitaAccount = accounts.find(acc => acc.name.toLowerCase().includes("receita"));

    if (receitaAccount) {
        console.log("Conta encontrada:", receitaAccount);

        // Aplicar correção
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

        // Verificar se há outras contas que precisam ser ajustadas
        // Por exemplo, se "Receitas" era filha de alguém, talvez esse pai esteja sobrando ou algo assim.
        // Mas o objetivo principal é subir ela para o nível 1.
    } else {
        console.log("Conta 'Receitas' não encontrada.");
    }
}

fixAccount().catch(console.error);
