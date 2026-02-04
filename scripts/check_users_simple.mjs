import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function checkUsers() {
  const users = await sql`SELECT id, email, name, username, is_admin FROM users`;
  console.log('\n📋 Usuários cadastrados no banco:\n');
  console.table(users);
}

checkUsers();
