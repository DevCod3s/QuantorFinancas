import http from 'http';

http.get('http://127.0.0.1:5000/api/debug-tx', (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    try {
      const txs = JSON.parse(data);
      console.log("Response:", JSON.stringify(txs, null, 2));
    } catch (err) {
      console.error(err);
    }
  });
}).on('error', err => console.error(err));



