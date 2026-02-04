import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

const MASTER_USER = {
  email: "master@quantor.com",
  name: "Cod3s",
  username: "cod3s", // Lowercase para consistência
  password: "Jr@C0d3$",
};

async function createMasterUser() {
  console.log('🔧 Criando usuário master...\n');
  
  // Verificar se já existe
  const existing = await sql`SELECT * FROM users WHERE username = ${MASTER_USER.username}`;
  
  if (existing.length > 0) {
    console.log('⚠️  Usuário master já existe!');
    console.log(`   ID: ${existing[0].id}`);
    console.log(`   Email: ${existing[0].email}`);
    console.log(`   Username: ${existing[0].username}`);
    return;
  }
  
  // Criptografar senha
  const hashedPassword = await bcrypt.hash(MASTER_USER.password, 10);
  
  // Criar usuário
  const result = await sql`
    INSERT INTO users (email, name, username, password, is_admin)
    VALUES (
      ${MASTER_USER.email},
      ${MASTER_USER.name},
      ${MASTER_USER.username},
      ${hashedPassword},
      true
    )
    RETURNING id, email, name, username, is_admin
  `;
  
  console.log('✅ Usuário master criado com sucesso!\n');
  console.log('📋 Detalhes:');
  console.log(`   ID: ${result[0].id}`);
  console.log(`   Email: ${result[0].email}`);
  console.log(`   Name: ${result[0].name}`);
  console.log(`   Username: ${result[0].username}`);
  console.log(`   Admin: ${result[0].is_admin}`);
  console.log('\n🔐 Credenciais de acesso:');
  console.log(`   Usuário: ${MASTER_USER.username}`);
  console.log(`   Senha: ${MASTER_USER.password}`);
}

createMasterUser().catch(console.error);
