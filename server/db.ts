import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Neon serverless driver - ideal para edge computing e serverless
const sql = neon(process.env.DATABASE_URL);

// Drizzle ORM com driver Neon HTTP
export const db = drizzle(sql, { schema });

console.log('✅ Conectado ao Neon DB - PostgreSQL Serverless!');

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Encerrando conexão com Neon DB...');
  process.exit(0);
});