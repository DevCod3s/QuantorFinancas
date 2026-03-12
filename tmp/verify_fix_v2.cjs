const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function verifyAccounts() {
    try {
        const res = await pool.query("SELECT id, name, code, level, parent_id FROM chart_of_accounts WHERE level = 1 ORDER BY code");
        console.log("CONTAS_NIVEL_1_START");
        res.rows.forEach(row => {
            console.log(`ID: ${row.id} | NOME: ${row.name} | CODE: ${row.code} | LEVEL: ${row.level} | PARENT: ${row.parent_id}`);
        });
        console.log("CONTAS_NIVEL_1_END");

        const children = await pool.query("SELECT id, name, code, level FROM chart_of_accounts WHERE parent_id = 15");
        console.log("FILHAS_RECEITAS_START");
        children.rows.forEach(row => {
            console.log(`ID: ${row.id} | NOME: ${row.name} | CODE: ${row.code} | LEVEL: ${row.level}`);
        });
        console.log("FILHAS_RECEITAS_END");

    } catch (err) {
        console.error("Erro ao verificar contas:", err);
    } finally {
        await pool.end();
    }
}

verifyAccounts();
