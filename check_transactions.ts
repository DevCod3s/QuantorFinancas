
import 'dotenv/config';
import pkg from "pg";
const { Pool } = pkg;

async function check() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const recent = await pool.query('SELECT id, date, description, amount FROM transactions WHERE user_id = 2 ORDER BY id DESC LIMIT 20;');
    console.log("=== TRANSAÇÕES RECENTES (USUÁRIO 2) ===");
    console.table(recent.rows);

    const uCount = await pool.query('SELECT id, email, username FROM users;');
    console.table(uCount.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

check();
