import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);
await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS aplicar_multa_em TEXT`;
console.log('Coluna aplicar_multa_em adicionada!');
