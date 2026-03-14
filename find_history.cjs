const fs = require('fs');
const path = require('path');
const dirs = [
  'C:\\Users\\devel\\AppData\\Roaming\\Code\\User\\History',
  'C:\\Users\\devel\\AppData\\Roaming\\Cursor\\User\\History'
];

function walk(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    try {
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        walk(file, results);
      } else {
        if (stat.mtime.getDate() === 14 && stat.mtime.getMonth() === 2 && stat.mtime.getFullYear() === 2026) {
          results.push({ file: file, time: stat.mtimeMs, size: stat.size, mtime: stat.mtime });
        }
      }
    } catch(e) {}
  });
  return results;
}

let allFiles = [];
dirs.forEach(d => {
  allFiles = allFiles.concat(walk(d));
});

allFiles.sort((a,b) => b.time - a.time);
const out = allFiles.map(f => `${f.mtime.toLocaleString('pt-BR')} - ${Math.round(f.size/1024)}KB - ${f.file}`).join('\n');
fs.writeFileSync('C:\\Users\\devel\\OneDrive\\Empresa\\Cod3s Tecnologia\\Development\\Code\\QuantorFinancas\\history_results.txt', out);
console.log(`Encontrados ${allFiles.length} arquivos hoje.`);
