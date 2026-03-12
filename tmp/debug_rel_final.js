
import pkg from 'pg';
const { Pool } = pkg;

async function debugData() {
  const pool = new Pool({
    connectionString: "postgresql://quantor_db:npg_9Pi8ZmWQDMdy@ep-proud-meadow-ai8v9vgo-pooler.c-4.us-east-1.aws.neon.tech/quantor?sslmode=require",
  });

  const client = await pool.connect();
  try {
    console.log("--- Mapeamento de Usuários ---");
    const usersRes = await client.query('SELECT id, username, name FROM users');
    usersRes.rows.forEach(u => console.log(`ID: ${u.id} | Username: ${u.username} | Name: ${u.name}`));

    console.log("\n--- Mapeamento de Relacionamentos ---");
    const relRes = await client.query('SELECT id, user_id, type, social_name, city, state FROM relationships');
    console.log(`Total: ${relRes.rowCount}`);
    relRes.rows.forEach(r => {
      console.log(`RelID: ${r.id} | UserID: ${r.user_id} | Type: ${r.type} | Name: ${r.social_name} | City: ${r.city} | State: ${r.state}`);
    });

    console.log("\n--- Transações ---");
    const trRes = await client.query('SELECT count(*) FROM transactions');
    console.log(`Total Transações: ${trRes.rows[0].count}`);

  } finally {
    client.release();
    await pool.end();
  }
}

debugData().catch(console.error);
