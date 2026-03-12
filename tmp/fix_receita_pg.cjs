const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function fixReceita() {
    try {
        console.log("Iniciando correção da conta Receitas...");

        // 1. Encontrar o ID da conta "Receitas"
        const findRes = await pool.query("SELECT id, name FROM chart_of_accounts WHERE name ILIKE '%receita%' LIMIT 1");
        if (findRes.rows.length === 0) {
            console.log("Conta 'Receitas' não encontrada.");
            return;
        }

        const accountId = findRes.rows[0].id;
        console.log(`Conta encontrada: ID=${accountId}, Nome='${findRes.rows[0].name}'`);

        // 2. Atualizar a conta
        const updateRes = await pool.query(`
      UPDATE chart_of_accounts 
      SET 
        level = 1, 
        code = '1', 
        parent_id = NULL,
        type = 'receita',
        category = 'Receitas',
        subcategory = NULL
      WHERE id = $1
    `, [accountId]);

        console.log(`Conta atualizada com sucesso! Linhas afetadas: ${updateRes.rowCount}`);

    } catch (err) {
        console.error("Erro ao corrigir conta:", err);
    } finally {
        await pool.end();
    }
}

fixReceita();
