const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function verifyAccounts() {
    try {
        const res = await pool.query("SELECT id, name, code, level, parent_id FROM chart_of_accounts WHERE level = 1 ORDER BY code");
        console.log("Contas de Nível 1:");
        console.table(res.rows);

        // Verificar se há contas que eram filhas de Receita mas agora estão órfãs ou erradas
        // No entanto, se o usuário só queria subir a Receita, talvez as filhas devam continuar filhas dela.
        // O ID da Receita é 15 (vimos no log anterior).
        const children = await pool.query("SELECT id, name, code, level FROM chart_of_accounts WHERE parent_id = 15");
        console.log("Filhas da conta Receitas:");
        console.table(children.rows);

    } catch (err) {
        console.error("Erro ao verificar contas:", err);
    } finally {
        await pool.end();
    }
}

verifyAccounts();
