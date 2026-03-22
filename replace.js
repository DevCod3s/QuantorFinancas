const fs = require('fs');
let content = fs.readFileSync('client/src/components/TransactionLiquidateModal.tsx', 'utf8');

const target = `<CustomSelect
                label="Conta Bancária Origem/Destino *"
                value={bankAccountId}
                onChange={(e: any) => setBankAccountId(e.target.value)}
                required
              >
                <option value="" disabled>Selecione uma conta</option>
                {bankAccounts.map((account) => (
                  <option key={account.id} value={account.id.toString()}>
                    {account.name}
                  </option>
                ))}
              </CustomSelect>`;
              
const replacement = `<Autocomplete
                options={bankAccounts}
                getOptionLabel={(account) => \`\${account.name || 'Conta'} (\${account.bank || 'Banco'} - Cc: \${account.accountNumber || 'S/N'})\`}
                value={(bankAccounts || []).find((a) => a.id.toString() === bankAccountId.toString()) || null}
                onChange={(_, newValue) => setBankAccountId(newValue ? newValue.id.toString() : '')}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Conta Bancária Origem/Destino *" 
                    required 
                    variant="standard"
                    sx={{
                      '& .MuiInputLabel-root': { color: '#1D3557' },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#B59363' },
                      '& .MuiInput-underline:after': { borderBottomColor: '#B59363' },
                      '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#1D3557' },
                      '& .MuiInputBase-input': { color: '#1D3557', fontWeight: 500 }
                    }}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
                componentsProps={{ paper: { sx: { zIndex: 1400 } } }}
              />`;

// normalize newlines
const normalize = (str) => str.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
content = normalize(content);
const targetNorm = normalize(target);

content = content.replace(targetNorm, replacement);
fs.writeFileSync('client/src/components/TransactionLiquidateModal.tsx', content);
console.log("Replaced successfully!");
