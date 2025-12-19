import pkg from 'pg';
const { Client } = pkg;
const c = 'postgresql://admin:Jr@D3vC0d3$T1@157.173.98.135:5432/quantor_db';
(async()=>{
  const client = new Client({ connectionString: c });
  try{
    await client.connect();
    await client.query('BEGIN');
    // Verificar existência
    const test = await client.query('SELECT id,email FROM users WHERE id=1');
    const master = await client.query("SELECT id,email FROM users WHERE email=$1", ['suporte@cod3s.com.br']);
    console.log('Before:', test.rows, master.rows);
    if(master.rows.length===0){
      throw new Error('Master user not found');
    }
    // Deletar usuário de teste se existir
    if(test.rows.length>0){
      await client.query('DELETE FROM users WHERE id=1');
      console.log('Deleted user id=1');
    }
    // Agora atribuir id 1 ao usuário master
    const masterId = master.rows[0].id;
    if(masterId===1){
      console.log('Master already has id 1');
    } else {
      // Atualizar possíveis chaves estrangeiras: atribuir novo id onde referenciam o id antigo
      // Encontrar todas as restrições de chave estrangeira referenciando users(id)
      const fkRes = await client.query(`
        SELECT tc.table_name, kcu.column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND ccu.table_name = 'users' AND ccu.column_name = 'id';
      `);
      // Para cada tabela que referencia, atualizar linhas
      for(const row of fkRes.rows){
        const t = row.table_name;
        const col = row.column_name;
        console.log(`Updating references in ${t}.${col}`);
        await client.query(`UPDATE ${t} SET ${col} = 1 WHERE ${col} = $1`, [masterId]);
      }
      // Por fim, atualizar o id do usuário
      await client.query('UPDATE users SET id = 1 WHERE id = $1', [masterId]);
      console.log(`Updated user id ${masterId} -> 1`);
    }
    // Reiniciar sequência
    await client.query("SELECT setval(pg_get_serial_sequence('users','id'), (SELECT COALESCE(MAX(id),1) FROM users))");
    await client.query('COMMIT');
    const final = await client.query('SELECT id,email,name,username,created_at FROM users ORDER BY id');
    console.log('After:', JSON.stringify(final.rows,null,2));
    await client.end();
  }catch(e){
    console.error('Error:', e);
    try{await client.query('ROLLBACK')}catch{};
    await client.end();
    process.exit(1);
  }
})();
