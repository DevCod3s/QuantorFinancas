
import pkg from 'pg';
const { Pool } = pkg;

async function checkSchema() {
  const pool = new Pool({
    connectionString: "postgresql://quantor_db:npg_9Pi8ZmWQDMdy@ep-proud-meadow-ai8v9vgo-pooler.c-4.us-east-1.aws.neon.tech/quantor?sslmode=require",
  });

  const client = await pool.connect();
  try {
    console.log("--- Verificando Colunas de Transactions ---");
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'transactions'
    `);
    console.table(res.rows);

    console.log("\n--- Verificando Relacionamentos do Usuário 2 ---");
    const rels = await client.query('SELECT count(*) FROM relationships WHERE user_id = 2');
    console.log(`Relacionamentos encontrados: ${rels.rows[0].count}`);

  } finally {
    client.release();
    await pool.end();
  }
}

checkSchema().catch(console.error);
