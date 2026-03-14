const fs = require('fs');
const path = require('path');

const appData = process.env.APPDATA;
const roamingPaths = [
  path.join(appData, 'Cursor', 'User', 'History'),
  path.join(appData, 'Code', 'User', 'History')
];

let foundFiles = [];

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    try {
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else {
        // Verificar modificações nas últimas 72 horas
        if (Date.now() - stat.mtimeMs < 72 * 60 * 60 * 1000) {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes('handleLiquidateTransaction')) {
            foundFiles.push({ path: fullPath, time: stat.mtimeMs });
          }
        }
      }
    } catch (err) {
      // Ignorar erros de permissão
    }
  }
}

for (const p of roamingPaths) {
  walkDir(p);
}

// Ordenar do mais recente para o mais antigo
foundFiles.sort((a, b) => b.time - a.time);

if (foundFiles.length > 0) {
  console.log("ARQUIVOS ENCONTRADOS:");
  foundFiles.forEach(f => console.log(f.path));
  
  // Salvar o mais recente na pasta do projeto para recuperar e analisar
  const bestFile = foundFiles[0].path;
  const destPath = path.join(process.cwd(), 'Transactions_Recuperado.tsx');
  fs.copyFileSync(bestFile, destPath);
  console.log('O melhor arquivo foi copiado para: ' + destPath);
} else {
  console.log("Nenhum arquivo encontrado com 'handleLiquidateTransaction'.");
}
