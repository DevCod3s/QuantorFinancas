const { execSync } = require('child_process');
const fs = require('fs');
try {
  const content = execSync('git show HEAD@{yesterday}:client/src/pages/Transactions.tsx', { encoding: 'utf-8' });
  fs.writeFileSync('old_tx_node.tsx', content);
  console.log('Success');
} catch (e) {
  try {
    const content = execSync('git show HEAD~10:client/src/pages/Transactions.tsx', { encoding: 'utf-8' });
    fs.writeFileSync('old_tx_node.tsx', content);
    console.log('Success with fallback');
  } catch (err) {
    console.error(err);
  }
}
