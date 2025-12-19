import pkg from 'pg';
import bcrypt from 'bcryptjs';
const { Client } = pkg;
const connectionString = 'postgresql://admin:Jr@D3vC0d3$T1@157.173.98.135:5432/quantor_db';
const email = 'suporte@cod3s.com.br';
const name = 'Cod3s';
const username = 'Cod3s';
const rawPassword = '5pt@C0d3$T1';
(async () => {
  try {
    const client = new Client({ connectionString });
    await client.connect();
    // Verificar se o usuário já existe
    const exists = await client.query('SELECT id FROM users WHERE email=$1 OR username=$2', [email, username]);
    if (exists.rows.length > 0) {
      console.log('User already exists:', exists.rows);
      await client.end();
      process.exit(0);
    }
    const hashed = await bcrypt.hash(rawPassword, 10);
    const res = await client.query(
      'INSERT INTO users (email, name, username, password, created_at) VALUES ($1,$2,$3,$4,NOW()) RETURNING id, email, name, username, created_at',
      [email, name, username, hashed]
    );
    console.log('Created user:', JSON.stringify(res.rows[0], null, 2));
    await client.end();
  } catch (e) {
    console.error('Error creating master user:', e);
    process.exit(1);
  }
})();
