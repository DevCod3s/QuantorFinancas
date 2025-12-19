const { Client } = require('pg');

const client = new Client({
  host: '157.173.98.135',
  user: 'administrador',
  password: 'Jr@D3vC0d3$T1',
  database: 'quantor_db',
  port: 5432,
});

client.connect()
  .then(() => {
    console.log('Conexão bem-sucedida!');
    return client.end();
  })
  .catch(err => {
    console.error('Erro de conexão:', err.message);
  });