import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function run() {
  await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS aplicar_juros BOOLEAN DEFAULT false`;
  await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS tipo_juros TEXT`;
  await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS valor_juros DECIMAL(10,4)`;
  await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS aplicar_juros_em TEXT`;
  await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS aplicar_encargos BOOLEAN DEFAULT false`;
  await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS juros_mes DECIMAL(10,4)`;
  await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS mora_dia DECIMAL(10,4)`;
  await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS tipo_encargo TEXT`;
  
  // Verificar
  const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'transactions' AND column_name IN ('aplicar_juros', 'tipo_juros', 'valor_juros', 'aplicar_juros_em', 'aplicar_encargos', 'juros_mes', 'mora_dia', 'tipo_encargo') ORDER BY column_name`;
  console.log('Colunas adicionadas:', cols.map(c => c.column_name));
}

run().catch(e => console.error(e));
