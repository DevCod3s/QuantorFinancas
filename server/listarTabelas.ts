import dotenv from 'dotenv';
dotenv.config();
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function listarTabelas() {
  try {
    const res = await pool.query(`SELECT table_schema, table_name FROM information_schema.tables WHERE table_type = 'BASE TABLE' AND table_schema NOT IN ('pg_catalog', 'information_schema') ORDER BY table_schema, table_name;`);
    console.log('Tabelas encontradas:');
    res.rows.forEach(row => {
      console.log(`${row.table_schema}.${row.table_name}`);
    });
  } catch (err) {
    console.error('Erro ao listar tabelas:', err);
  } finally {
    await pool.end();
  }
}

listarTabelas();
