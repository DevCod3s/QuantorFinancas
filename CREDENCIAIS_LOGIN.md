# 🔐 CREDENCIAIS DE ACESSO - QUANTOR FINANÇAS

## ✅ Sistema Configurado com Neon DB

**Data:** 04 de Fevereiro de 2026  
**Status:** 🟢 Online e Operacional

---

## 👤 USUÁRIO MASTER (ADMINISTRADOR)

### Credenciais de Login:

**Usuário:** `cod3s` *(case-insensitive: Cod3s, COD3S, etc.)*  
**Senha:** `Jr@C0d3$`

**Email:** master@quantor.com  
**Nome:** Cod3s  
**Tipo:** Administrador (isAdmin: true)  
**ID no banco:** 2

---

## 🌐 Como Acessar

1. **Servidor Local**
   - URL: http://localhost:3000
   - Certifique-se que o servidor está rodando: `npm run dev`

2. **Tela de Login**
   - Clique no ícone de usuário na barra lateral esquerda
   - Ou acesse diretamente: http://localhost:3000/login

3. **Preencher Formulário**
   - Campo "Usuário": digite `cod3s`
   - Campo "Senha": digite `Jr@C0d3$`
   - Clique no botão azul com seta →

---

## ⚠️ Resolução do "Erro de Conexão"

Se aparecer "Erro de conexão", verifique:

### ✅ 1. Servidor está rodando?
```bash
# Verificar se está rodando
Get-Process -Name node -ErrorAction SilentlyContinue

# Se não estiver, iniciar:
npm run dev
```

### ✅ 2. Porta 3000 está disponível?
```bash
# Verificar se porta está em uso
netstat -ano | findstr :3000

# Se estiver ocupada, matar o processo ou mudar a porta no .env
```

### ✅ 3. Banco de dados está acessível?
```bash
# Testar conexão com Neon DB
node scripts/validate_neon_db.mjs
```

### ✅ 4. Cache do navegador
- Limpe o cache: `Ctrl + Shift + Delete`
- Ou use aba anônima: `Ctrl + Shift + N`

---

## 🧪 Testar Login via Terminal

Se quiser testar a API diretamente:

```powershell
# Windows PowerShell
$body = @{
    username = "cod3s"
    password = "Jr@C0d3`$"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

**Resposta esperada:**
```json
{
  "success": true,
  "user": {
    "id": 2,
    "email": "master@quantor.com",
    "name": "Cod3s",
    "username": "cod3s",
    "is_admin": true
  }
}
```

---

## 📋 Outros Usuários no Sistema

### Usuário de Teste (Desenvolvimento)
**Email:** teste@exemplo.com  
**Nome:** Usuário Teste  
**ID:** 1  
**Nota:** Não possui username/senha (apenas para Replit Auth)

---

## 🔧 Comandos Úteis

```bash
# Iniciar servidor
npm run dev

# Ver usuários no banco
node scripts/check_users_simple.mjs

# Validar estrutura do banco
node scripts/validate_neon_db.mjs

# Recriar usuário master (se necessário)
node scripts/create_master_user_neon.mjs
```

---

## 📊 Status do Sistema

✅ Banco de dados: **Neon DB** (PostgreSQL 17.7 Serverless)  
✅ Região: **US East 1** (AWS)  
✅ Servidor: **Porta 3000** (localhost)  
✅ Autenticação: **Configurada e funcional**  
✅ Usuário Master: **Criado e ativo**

---

## 🆘 Suporte

Se o problema persistir:

1. Verifique os logs do servidor no terminal
2. Abra o console do navegador (F12) para ver erros JavaScript
3. Confirme que a URL está correta: `http://localhost:3000/login`
4. Reinicie completamente o servidor

**Tudo deve estar funcionando agora! 🎉**
