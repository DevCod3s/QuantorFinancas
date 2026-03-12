
const { Pool } = require('pg');

async function debugData() {
  const pool = new Pool({
    connectionString: "postgres://postgres:postgres@localhost:5432/postgres", // Tentar padrão se ENV falhar, mas o ideal é vir do processo
    // Ou usar a que está no .env se eu conseguir ler.
  });

  const client = await pool.connect();
  try {
    console.log("--- DEBUG DE RELACIONAMENTOS (SQL PURO) ---");
    const res = await client.query('SELECT id, user_id, social_name, city, state, zip_code FROM relationships LIMIT 20');
    console.log(`Encontrados ${res.rowCount} registros.`);
    console.table(res.rows);

    const userCount = await client.query('SELECT user_id, count(*) FROM relationships GROUP BY user_id');
    console.log("Contagem por Usuário:");
    console.table(userCount.rows);

    // Verificar se existem transações de receita ligadas a eles
    const transres = await client.query('SELECT count(*) FROM transactions WHERE type = \'income\'');
    console.log(`Total de transações de receita: ${transres.rows[0].count}`);

  } finally {
    client.release();
    await pool.end();
  }
}

debugData().catch(console.error);
