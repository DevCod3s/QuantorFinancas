const fs = require('fs');
const path = require('path');

const logDir = 'C:\\Users\\devel\\.gemini\\antigravity\\brain\\c7806bfe-4710-4907-8284-dff68f3b9747\\.system_generated\\logs';
if (!fs.existsSync(logDir)) {
  console.log("Pasta de logs não encontrada: " + logDir);
  process.exit(1);
}

const files = fs.readdirSync(logDir);
let bestFile = null;
let maxMatches = 0;

for (const file of files) {
  const fullPath = path.join(logDir, file);
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    // Procurar indicativos de conter o Transactions.tsx antigo
    const matches = (content.match(/handleLiquidateTransaction/g) || []).length +
                    (content.match(/IButtonPrime/g) || []).length;
    
    if (matches > maxMatches) {
      maxMatches = matches;
      bestFile = fullPath;
    }
  } catch (e) {}
}

if (bestFile) {
  console.log("Melhor log encontrado: " + bestFile + " com " + maxMatches + " matches.");
  
  // Vamos extrair o último bloco de "file_content" se existir, ou apenas printar onde está.
  // Como os logs do Gemini podem ter o arquivo inteiro no input do usuário:
  const content = fs.readFileSync(bestFile, 'utf8');
  const tagStart = content.lastIndexOf('<user_file_content path="c:\\Users\\devel\\OneDrive\\Empresa\\Cod3s Tecnologia\\Development\\Code\\QuantorFinancas\\client\\src\\pages\\Transactions.tsx">');
  if (tagStart !== -1) {
     const tagEnd = content.indexOf('</user_file_content>', tagStart);
     if (tagEnd !== -1) {
        const fileContent = content.substring(tagStart + 155, tagEnd);
        fs.writeFileSync('C:\\Users\\devel\\OneDrive\\Empresa\\Cod3s Tecnologia\\Development\\Code\\QuantorFinancas\\client\\src\\pages\\Transactions_Recovered.tsx', fileContent);
        console.log("Arquivo recuperado com sucesso salvo como Transactions_Recovered.tsx!");
     }
  } else {
     console.log("Tag <user_file_content> não encontrada, procurando <file_content> ou outras referências.");
  }
} else {
  console.log("Nenhum log relevante encontrado na conversa anterior.");
}
