
const { Pool } = require('pg');

async function debugData() {
  const pool = new Pool({
    connectionString: "postgresql://quantor_db:npg_9Pi8ZmWQDMdy@ep-proud-meadow-ai8v9vgo-pooler.c-4.us-east-1.aws.neon.tech/quantor?sslmode=require",
  });

  const client = await pool.connect();
  try {
    console.log("--- DIAGNÓSTICO DE DADOS NO NEON ---");
    
    // 1. Ver usuários
    const usersRes = await client.query('SELECT id, username FROM users');
    console.log("Usuários no sistema:");
    console.table(usersRes.rows);

    // 2. Ver relacionamentos
    const relRes = await client.query('SELECT id, user_id, social_name, city, state, zip_code FROM relationships');
    console.log(`Total de relacionamentos cadastrados: ${relRes.rowCount}`);
    if (relRes.rowCount > 0) {
      console.log("Amostra de dados:");
      console.table(relRes.rows.slice(0, 10));
    }

    // 3. Ver transações
    const trRes = await client.query('SELECT count(*) FROM transactions');
    console.log(`Total de transações: ${trRes.rows[0].count}`);

  } finally {
    client.release();
    await pool.end();
  }
}

debugData().catch(console.error);
