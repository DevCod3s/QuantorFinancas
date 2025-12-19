import pkg from 'pg';
const { Client } = pkg;
const conn = 'postgresql://admin:Jr@D3vC0d3$T1@157.173.98.135:5432/quantor_db';
(async()=>{
  const client = new Client({ connectionString: conn });
  try{
    await client.connect();
    await client.query("UPDATE users SET is_admin = true WHERE id = 1");
    const res = await client.query('SELECT id,email,username,is_admin FROM users ORDER BY id');
    console.log(JSON.stringify(res.rows,null,2));
    await client.end();
  }catch(e){
    console.error(e);
    process.exit(1);
  }
})();
