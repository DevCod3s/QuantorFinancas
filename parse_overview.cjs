const fs = require('fs');
const txt = fs.readFileSync('C:\\Users\\devel\\.gemini\\antigravity\\brain\\040731d0-3bfc-439a-91ac-f9769f3f0837\\.system_generated\\logs\\overview.txt', 'utf8');
const search = "actions={(item: any) => (";
let lastIdx = txt.lastIndexOf(search);
let count = 0;
while (lastIdx !== -1 && count < 15) {
  let endIdx = txt.indexOf(")}", lastIdx);
  if (endIdx !== -1) {
    let snippet = txt.substring(lastIdx, endIdx + 2);
    // Ignore as que tentamos hoje agora pouco
    if (!snippet.includes("Download") && !snippet.includes("Link")) {
       console.log("--- FOUND MATCH " + count + " ---");
       console.log(snippet);
    }
  }
  lastIdx = txt.lastIndexOf(search, lastIdx - 1);
  count++;
}
