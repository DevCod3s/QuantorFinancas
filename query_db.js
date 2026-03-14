import pg from 'pg';
import fs from 'fs';
const { Client } = pg;

async function run() {
  const client = new Client({
    connectionString: "postgresql://quantor_db:npg_9Pi8ZmWQDMdy@ep-proud-meadow-ai8v9vgo-pooler.c-4.us-east-1.aws.neon.tech/quantor?sslmode=require"
  });
  await client.connect();
  try {
    const res = await client.query("SELECT id, description, amount, repeticao, recorrencia_id, parcelamento_id FROM transactions WHERE amount = 2160.00 ORDER BY id DESC LIMIT 10");
    fs.writeFileSync('output.json', JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
