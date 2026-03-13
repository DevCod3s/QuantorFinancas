import dotenv from 'dotenv';
dotenv.config();
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkColumns() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'transactions' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    console.log('Colunas da tabela transactions:');
    console.table(res.rows);
  } catch (err) {
    console.error('Erro ao verificar colunas:', err);
  } finally {
    await pool.end();
  }
}

checkColumns();
