const { Client } = require('pg');
const c = 'postgresql://admin:Jr@D3vC0d3$T1@157.173.98.135:5432/quantor_db';
(async () => {
  try {
    const client = new Client({ connectionString: c });
    await client.connect();
    const res = await client.query('SELECT id, email, name, username, created_at FROM users ORDER BY id LIMIT 50');
    console.log(JSON.stringify(res.rows, null, 2));
    await client.end();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
