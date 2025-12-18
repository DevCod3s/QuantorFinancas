import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('❌ Erro no pool de conexões PostgreSQL:', err);
});

pool.on('connect', () => {
  console.log('✅ Conectado ao PostgreSQL 17 - Contabo!');
});

export const db = drizzle({ client: pool, schema });

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Encerrando conexões do pool...');
  await pool.end();
  process.exit(0);
});