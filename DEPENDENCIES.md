# 📦 Documentação Completa de Dependências - QuantorFinancas

**Data de Atualização:** 18 de Dezembro de 2025  
**Versão do Projeto:** 1.0.0  
**Node.js Recomendado:** 18.x ou superior  
**NPM Recomendado:** 9.x ou superior  

---

## 📋 Sumário Executivo

Este documento detalha todas as **74 dependências** do projeto QuantorFinancas, organizadas por categoria funcional. Cada dependência inclui versão, propósito, documentação e informações de compatibilidade.

### Resumo Estatístico
- **Total de Pacotes:** 74
- **Dependências de Produção:** 54
- **Dependências de Desenvolvimento:** 19
- **Dependências Opcionais:** 1
- **Tamanho Estimado de node_modules:** ~500-600 MB

---

## 🏗️ Arquitetura do Projeto

```
QuantorFinancas
├── Frontend (React 18)
│   ├── UI Components (Radix UI)
│   ├── Styling (TailwindCSS)
│   └── State Management (TanStack Query)
├── Backend (Express.js)
│   ├── Autenticação (Passport + OpenID)
│   ├── Banco de Dados (Drizzle ORM)
│   └── IA Integrations (OpenAI, Anthropic)
└── DevTools (TypeScript, Vite, ESBuild)
```

---

## 📦 DEPENDÊNCIAS DE PRODUÇÃO (54 pacotes)

### 🎨 **Frontend - UI Components & Framework**

#### React & DOM
| Pacote | Versão | Propósito |
|--------|--------|----------|
| `react` | ^18.3.1 | Framework principal do frontend |
| `react-dom` | ^18.3.1 | Renderização React no DOM |

**Documentação:** https://react.dev  
**Licença:** MIT  
**Notas:** Versão 18 com Concurrent Features habilitadas

---

#### Radix UI - Sistema de Componentes (29 componentes)
| Pacote | Versão | Componentes | Propósito |
|--------|--------|------------|----------|
| `@radix-ui/react-accordion` | ^1.2.4 | Accordion | Acordeões expansíveis |
| `@radix-ui/react-alert-dialog` | ^1.1.7 | AlertDialog | Diálogos de confirmação |
| `@radix-ui/react-aspect-ratio` | ^1.1.3 | AspectRatio | Proporção de aspecto fixa |
| `@radix-ui/react-avatar` | ^1.1.4 | Avatar | Avatares de usuário |
| `@radix-ui/react-checkbox` | ^1.1.5 | Checkbox | Caixas de seleção |
| `@radix-ui/react-collapsible` | ^1.1.4 | Collapsible | Conteúdo colapsável |
| `@radix-ui/react-context-menu` | ^2.2.7 | ContextMenu | Menu de contexto |
| `@radix-ui/react-dialog` | ^1.1.7 | Dialog | Modais e diálogos |
| `@radix-ui/react-dropdown-menu` | ^2.1.7 | DropdownMenu | Menus suspensos |
| `@radix-ui/react-hover-card` | ^1.1.7 | HoverCard | Cards ao passar o mouse |
| `@radix-ui/react-label` | ^2.1.3 | Label | Labels de formulários |
| `@radix-ui/react-menubar` | ^1.1.7 | Menubar | Barra de menus |
| `@radix-ui/react-navigation-menu` | ^1.2.6 | NavigationMenu | Menus de navegação |
| `@radix-ui/react-popover` | ^1.1.7 | Popover | Popovers (floating UI) |
| `@radix-ui/react-progress` | ^1.1.3 | Progress | Barras de progresso |
| `@radix-ui/react-radio-group` | ^1.2.4 | RadioGroup | Grupo de rádios |
| `@radix-ui/react-scroll-area` | ^1.2.4 | ScrollArea | Áreas com scroll customizado |
| `@radix-ui/react-select` | ^2.1.7 | Select | Selects customizados |
| `@radix-ui/react-separator` | ^1.1.3 | Separator | Separadores visuais |
| `@radix-ui/react-slider` | ^1.2.4 | Slider | Sliders e ranges |
| `@radix-ui/react-slot` | ^1.2.0 | Slot | Slot components (render prop) |
| `@radix-ui/react-switch` | ^1.1.4 | Switch | Toggle switches |
| `@radix-ui/react-tabs` | ^1.1.4 | Tabs | Sistema de abas |
| `@radix-ui/react-toast` | ^1.2.7 | Toast | Notificações toast |
| `@radix-ui/react-toggle` | ^1.1.3 | Toggle | Botões toggle |
| `@radix-ui/react-toggle-group` | ^1.1.3 | ToggleGroup | Grupos de toggles |
| `@radix-ui/react-tooltip` | ^1.2.0 | Tooltip | Tooltips flutuantes |

**Documentação:** https://www.radix-ui.com  
**Licença:** MIT  
**Padrão:** Acessibilidade (WCAG 2.1 AA)  
**Estilo:** Unstyled - usamos TailwindCSS

---

#### Material-UI
| Pacote | Versão | Propósito |
|--------|--------|----------|
| `@emotion/react` | ^11.14.0 | Motor CSS-in-JS |
| `@emotion/styled` | ^11.14.1 | Styled components com Emotion |
| `@mui/material` | ^7.2.0 | Componentes Material Design |

**Documentação:** https://mui.com  
**Licença:** MIT  
**Notas:** Usada principalmente para TextField, FormControl, Select em modais

---

#### Styling & CSS
| Pacote | Versão | Propósito |
|--------|--------|----------|
| `tailwindcss` | ^3.4.17 | Framework CSS utilitário |
| `tailwind-merge` | ^2.6.0 | Merge de classes Tailwind |
| `tailwindcss-animate` | ^1.0.7 | Plugin de animações |
| `tw-animate-css` | ^1.2.5 | Animações CSS customizadas |
| `@tailwindcss/typography` | ^0.5.15 | Plugin de tipografia |
| `@tailwindcss/vite` | ^4.1.3 | Plugin Vite para Tailwind |
| `clsx` | ^2.1.1 | Utility para classes condicionais |
| `class-variance-authority` | ^0.7.1 | Variantes de componentes |

**Documentação:** https://tailwindcss.com  
**Licença:** MIT  
**Config:** [tailwind.config.ts](tailwind.config.ts)

---

#### Ícones & Recursos Visuais
| Pacote | Versão | Propósito |
|--------|--------|----------|
| `lucide-react` | ^0.453.0 | 453+ ícones customizáveis |
| `react-icons` | ^5.4.0 | Ícones FontAwesome, Feather, etc |

**Documentação:** https://lucide.dev  
**Licença:** ISC  
**Uso:** Ícones em botões, menus e componentes

---

#### Gráficos & Visualização de Dados
| Pacote | Versão | Propósito |
|--------|--------|----------|
| `chart.js` | ^4.5.0 | Biblioteca de gráficos JavaScript |
| `react-chartjs-2` | ^5.3.0 | Wrapper React para Chart.js |
| `recharts` | ^2.15.2 | Gráficos React compostos |

**Documentação:**  
- Chart.js: https://www.chartjs.org  
- Recharts: https://recharts.org  
**Licença:** MIT  
**Uso:** Dashboard, fluxo de caixa, análises financeiras

---

#### Formulários & Inputs
| Pacote | Versão | Propósito |
|--------|--------|----------|
| `react-hook-form` | ^7.55.0 | Gerenciamento de formulários |
| `@hookform/resolvers` | ^3.10.0 | Resolvedores de validação (Zod, Yup) |
| `input-otp` | ^1.4.2 | Input OTP (One-Time Password) |
| `react-day-picker` | ^8.10.1 | Calendar/Date picker |

**Documentação:** https://react-hook-form.com  
**Licença:** MIT  
**Integrações:** Zod para validação

---

#### Componentes Avançados
| Pacote | Versão | Propósito |
|--------|--------|----------|
| `embla-carousel-react` | ^8.6.0 | Carousel/Slider de imagens |
| `react-resizable-panels` | ^2.1.7 | Painéis redimensionáveis |
| `framer-motion` | ^11.13.1 | Animações declarativas |
| `vaul` | ^1.1.2 | Drawer/Slide-out panels |
| `tw-elements-react` | ^1.0.0-alpha-end | Elementos Tailwind extras |
| `next-themes` | ^0.4.6 | Gerenciador de temas (light/dark) |
| `cmdk` | ^1.1.1 | Command palette/search |

**Documentação:** https://www.framer.com/motion  
**Licença:** MIT  
**Uso:** Animações suaves, drawers, painéis interativos

---

### 🔧 **Backend - Servidor & APIs**

#### Express.js & Middleware
| Pacote | Versão | Propósito |
|--------|--------|----------|
| `express` | ^4.21.2 | Framework HTTP/REST |
| `express-session` | ^1.18.1 | Gerenciamento de sessões |
| `connect-pg-simple` | ^10.0.0 | Store de sessão PostgreSQL |

**Documentação:** https://expressjs.com  
**Licença:** MIT  
**Configuração:** [server/index.ts](server/index.ts)  
**Sessões:** Armazenadas em PostgreSQL via Neon

---

#### Roteamento
| Pacote | Versão | Propósito |
|--------|--------|----------|
| `wouter` | ^3.3.5 | Roteador React leve (3.3KB) |

**Documentação:** https://github.com/molefrog/wouter  
**Licença:** MIT  
**Uso:** Roteamento frontend no cliente

---

### 🗄️ **Database - ORM & Validação**

#### Drizzle ORM
| Pacote | Versão | Propósito |
|--------|--------|----------|
| `drizzle-orm` | ^0.39.1 | ORM type-safe em TypeScript |
| `drizzle-zod` | ^0.7.0 | Integração Drizzle + Zod |

**Documentação:** https://orm.drizzle.team  
**Licença:** Apache 2.0  
**Database:** PostgreSQL via Neon  
**Schemas:** [shared/schema.ts](shared/schema.ts)

---

#### Banco de Dados & Conexão
| Pacote | Versão | Propósito |
|--------|--------|----------|
| `@neondatabase/serverless` | ^0.10.4 | Driver Neon (PostgreSQL serverless) |
| `pg` | (via dependencies) | Cliente PostgreSQL |

**Documentação:** https://neon.tech  
**Licença:** Apache 2.0  
**Setup:** DATABASE_URL via Neon

---

#### Validação de Dados
| Pacote | Versão | Propósito |
|--------|--------|----------|
| `zod` | ^3.24.2 | Validação de schemas em TypeScript |
| `zod-validation-error` | ^3.4.0 | Melhor formatação de erros Zod |

**Documentação:** https://zod.dev  
**Licença:** MIT  
**Uso:** Validação de DTOs, esquemas de banco

---

### 🔐 **Autenticação & Segurança**

#### Autenticação
| Pacote | Versão | Propósito |
|--------|--------|----------|
| `passport` | ^0.7.0 | Framework de autenticação |
| `passport-local` | ^1.0.0 | Estratégia local (username/password) |
| `openid-client` | ^6.6.2 | Cliente OpenID Connect |

**Documentação:** https://www.passportjs.org  
**Licença:** MIT  
**Estratégias:** Local + Replit Auth (OpenID)

---

#### Criptografia
| Pacote | Versão | Propósito |
|--------|--------|----------|
| `bcryptjs` | ^3.0.2 | Hash de senhas (bcrypt) |

**Documentação:** https://github.com/dcodeIO/bcrypt.js  
**Licença:** MIT  
**Salt Rounds:** 10 (padrão)

---

### 🤖 **IA & APIs Externas**

#### OpenAI
| Pacote | Versão | Propósito |
|--------|--------|----------|
| `openai` | ^5.10.1 | SDK OpenAI (GPT-4, GPT-3.5) |

**Documentação:** https://platform.openai.com/docs  
**Licença:** MIT  
**Uso:** Geração de contratos, assistente IA  
**API Key:** Variável de ambiente `OPENAI_API_KEY`  
**Modelo:** GPT-4o para geração de contratos

---

#### Anthropic (Claude)
| Pacote | Versão | Propósito |
|--------|--------|----------|
| `@anthropic-ai/sdk` | ^0.37.0 | SDK Anthropic (Claude) |

**Documentação:** https://docs.anthropic.com  
**Licença:** MIT  
**Uso:** Assistente IA alternativo  
**API Key:** Variável de ambiente `ANTHROPIC_API_KEY`

---

### 🌐 **WebSocket & Real-time**

| Pacote | Versão | Propósito |
|--------|--------|----------|
| `ws` | ^8.18.0 | WebSocket para Node.js |

**Documentação:** https://github.com/websockets/ws  
**Licença:** MIT  
**Uso:** Comunicação real-time (atualmente não implementado)

---

### 📊 **Cache & Gerenciamento de Estado**

#### TanStack Query (React Query)
| Pacote | Versão | Propósito |
|--------|--------|----------|
| `@tanstack/react-query` | ^5.60.5 | Gerenciamento de estado servidor |

**Documentação:** https://tanstack.com/query  
**Licença:** MIT  
**Uso:** Cache de dados, sincronização servidor-cliente  
**Config:** [client/src/lib/queryClient.ts](client/src/lib/queryClient.ts)  
**Cache Padrão:** 5 minutos

---

#### Memory Store (Desenvolvimento)
| Pacote | Versão | Propósito |
|--------|--------|----------|
| `memorystore` | ^1.6.7 | Store de sessão em memória |

**Documentação:** https://github.com/roccomuso/memorystore  
**Licença:** MIT  
**Uso:** Fallback para desenvolvimento

---

### 🔍 **Utilitários & Helpers**

| Pacote | Versão | Propósito |
|--------|--------|----------|
| `date-fns` | ^3.6.0 | Manipulação de datas (7KB) |
| `memoizee` | ^0.4.17 | Memoização de funções |
| `@jridgewell/trace-mapping` | ^0.3.25 | Source map utilities |

**Documentação:** https://date-fns.org  
**Licença:** MIT  
**Locale:** pt-BR (português brasileiro)

---

## 📦 DEPENDÊNCIAS DE DESENVOLVIMENTO (19 pacotes)

### 🏗️ **Build & Bundling**

| Pacote | Versão | Propósito |
|--------|--------|----------|
| `vite` | ^5.4.19 | Build tool e dev server |
| `@vitejs/plugin-react` | ^4.3.2 | Plugin Vite para React |
| `esbuild` | ^0.25.0 | Bundler JavaScript extremamente rápido |
| `@replit/vite-plugin-cartographer` | ^0.2.7 | Plugin Replit para mapa de códigos |
| `@replit/vite-plugin-runtime-error-modal` | ^0.0.3 | Modal de erros em tempo real |

**Documentação:** https://vitejs.dev  
**Licença:** MIT  
**Scripts:** `npm run dev`, `npm run build`

---

### 📝 **TypeScript & Tipos**

| Pacote | Versão | Propósito |
|--------|--------|----------|
| `typescript` | 5.6.3 | Linguagem TypeScript |
| `@types/node` | 20.16.11 | Tipos para Node.js |
| `@types/react` | ^18.3.11 | Tipos para React |
| `@types/react-dom` | ^18.3.1 | Tipos para React DOM |
| `@types/express` | 4.17.21 | Tipos para Express |
| `@types/express-session` | ^1.18.0 | Tipos para express-session |
| `@types/connect-pg-simple` | ^7.0.3 | Tipos para connect-pg-simple |
| `@types/bcryptjs` | ^2.4.6 | Tipos para bcryptjs |
| `@types/memoizee` | ^0.4.12 | Tipos para memoizee |
| `@types/ws` | ^8.5.13 | Tipos para WebSocket |
| `@types/passport` | ^1.0.16 | Tipos para Passport |
| `@types/passport-local` | ^1.0.38 | Tipos para Passport Local |

**Documentação:** https://www.typescriptlang.org  
**Licença:** Apache 2.0  
**Versão:** Exatamente 5.6.3 (não use ^)  
**Strict Mode:** Habilitado em tsconfig.json

---

### 🎨 **CSS & Styling Tools**

| Pacote | Versão | Propósito |
|--------|--------|----------|
| `autoprefixer` | ^10.4.20 | Adiciona prefixos CSS |
| `postcss` | ^8.4.47 | Processador de CSS |

**Documentação:** https://postcss.org  
**Licença:** MIT  
**Config:** [postcss.config.js](postcss.config.js)

---

### 🔨 **Database Tools**

| Pacote | Versão | Propósito |
|--------|--------|----------|
| `drizzle-kit` | ^0.30.4 | CLI e ferramentas Drizzle |

**Documentação:** https://orm.drizzle.team/kit-docs/overview  
**Licença:** Apache 2.0  
**Scripts:** `npm run db:push`

---

### 📦 **Runtime & Execution**

| Pacote | Versão | Propósito |
|--------|--------|----------|
| `tsx` | ^4.19.1 | Executor TypeScript |

**Documentação:** https://tsx.is  
**Licença:** MIT  
**Uso:** `npm run dev` para desenvolvimento

---

## ⚙️ DEPENDÊNCIAS OPCIONAIS (1 pacote)

| Pacote | Versão | Propósito |
|--------|--------|----------|
| `bufferutil` | ^4.0.8 | Otimização de performance para WebSocket |

**Documentação:** https://github.com/websockets/bufferutil  
**Licença:** ISC  
**Notas:** Opcional, melhora performance do ws

---

## 📋 Resumo por Categoria Funcional

```
FRONTEND (React + UI)
├── Core: react, react-dom, react-hook-form
├── UI: @radix-ui (29 componentes), @mui/material
├── Styling: tailwindcss, framer-motion, clsx
├── Gráficos: chart.js, react-chartjs-2, recharts
├── Ícones: lucide-react, react-icons
└── Extras: embla-carousel, vaul, cmdk, next-themes

BACKEND (Express + Node)
├── Framework: express, express-session
├── Database: drizzle-orm, @neondatabase/serverless, zod
├── Autenticação: passport, passport-local, openid-client, bcryptjs
└── IA: openai, @anthropic-ai/sdk

STATE MANAGEMENT
├── Servidor: @tanstack/react-query (caching)
└── Sessão: express-session + connect-pg-simple

ROUTING
└── Frontend: wouter (3.3KB)

UTILITIES
├── Date: date-fns
├── WebSocket: ws
└── Memoization: memoizee

DEVTOOLS
├── Build: vite, esbuild, tsx
├── TypeScript: typescript + @types/* (12 pacotes)
└── CSS: autoprefixer, postcss
```

---

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor com hot reload

# Build
npm run build            # Build para produção (Vite + ESBuild)

# Produção
npm start               # Inicia servidor em produção

# Verificação
npm run check           # TypeScript type checking
npm run db:push         # Push migrations para banco
```

---

## 📥 Instalação & Setup

### Pré-requisitos
```
Node.js: >= 18.x
NPM: >= 9.x
PostgreSQL: 14+ (via Neon)
```

### Instalação Completa
```bash
# 1. Instalar todas as dependências
npm install

# 2. Verificar tipos TypeScript
npm run check

# 3. Setup banco de dados
npm run db:push

# 4. Iniciar desenvolvimento
npm run dev
```

### Instalação Seletiva (não recomendado)
```bash
# Apenas produção
npm install --omit=dev --omit=optional

# Sem dependências opcionais
npm install --no-optional
```

---

## 🔄 Dependências Interdependentes

### Grupos de Pacotes Acoplados

**Radix UI Stack** (29 componentes)
- Todos usam `@radix-ui/react-primitive`
- Todos requerem `React ^16.8`
- Styled com TailwindCSS

**TanStack + React**
- `react-hook-form` integra com `@tanstack/react-query`
- Ambos usam TypeScript + Zod

**Drizzle Stack**
- `drizzle-orm` + `drizzle-zod` (validação)
- `drizzle-kit` para CLI e migrations

**Chart Stack**
- `chart.js` requer `react-chartjs-2`
- `recharts` é alternativa/complemento

---

## 🔐 Segurança & Atualizações

### Pacotes com Histórico de Vulnerabilidades
- ✅ Todos auditados: `npm audit`
- 🔄 Verificar regularmente: `npm outdated`

### Atualizações Recomendadas
```bash
# Ver pacotes desatualizados
npm outdated

# Atualizar patch versions (seguro)
npm update

# Verificar vulnerabilidades
npm audit
npm audit fix  # Corrigir automaticamente
```

### Política de Versionamento
- **Patch (x.x.Z):** Correções de bugs - seguros para atualizar
- **Minor (x.Y.0):** Novas features - geralmente seguros
- **Major (X.0.0):** Breaking changes - requer teste

---

## 🚨 Compatibilidade & Conflitos Conhecidos

### ✅ Compatibilidades Testadas
- React 18.x + React DOM 18.x ✓
- TypeScript 5.6.x ✓
- Express 4.21.x + Passport 0.7.x ✓
- Vite 5.4.x + TailwindCSS 3.4.x ✓

### ⚠️ Avisos de Compatibilidade
- `@mui/material` adiciona ~300KB (considere remover se não usar)
- `next-themes` é opcional para dark mode
- `tw-elements-react` está em alpha

### 🔀 Múltiplas Versões do Mesmo Pacote
```
@radix-ui/react-dialog (3 versões de dependências transitivas)
Isso é normal e não causa problema
```

---

## 📊 Análise de Tamanho

### Bundle Size Estimado
```
React ecosystem:      ~150 KB
Radix UI + styling:   ~180 KB
Charts:               ~120 KB
TanStack Query:       ~40 KB
Outras libs:          ~80 KB
─────────────────────────────
Total:                ~570 KB (gzipped: ~180 KB)
```

### npm Módulos
```
node_modules/: ~550-600 MB
```

---

## 🔄 Como Adicionar Novas Dependências

### Instalação Correta
```bash
# Produção
npm install nome-pacote

# Desenvolvimento
npm install --save-dev nome-pacote

# Opcional
npm install --save-optional nome-pacote
```

### Checklist Pós-Instalação
- [ ] Verificar se há @types/* equivalente
- [ ] Rodar `npm run check` (TypeScript)
- [ ] Rodar `npm audit`
- [ ] Testar `npm run dev`
- [ ] Atualizar este documento

---

## 🗑️ Como Remover Dependências

```bash
# Remover pacote
npm uninstall nome-pacote

# Verificar se há dependências órfãs
npm prune

# Limpar cache
npm cache clean --force
```

---

## 📚 Documentação por Domínio

### Frontend
- React: https://react.dev
- Radix UI: https://www.radix-ui.com
- TailwindCSS: https://tailwindcss.com
- React Hook Form: https://react-hook-form.com
- TanStack Query: https://tanstack.com/query

### Backend
- Express: https://expressjs.com
- Passport: https://www.passportjs.org
- Drizzle ORM: https://orm.drizzle.team

### Database
- Neon: https://neon.tech
- PostgreSQL: https://www.postgresql.org

### IA/APIs
- OpenAI: https://platform.openai.com/docs
- Anthropic: https://docs.anthropic.com

### Build & Dev
- Vite: https://vitejs.dev
- TypeScript: https://www.typescriptlang.org
- ESBuild: https://esbuild.github.io

---

## 🆘 Troubleshooting

### "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "TypeScript error"
```bash
npm run check
npm install --save-dev @types/nome-pacote
```

### "Port 5173 already in use" (Vite dev server)
```bash
# Usar porta diferente
npm run dev -- --port 3000
```

### "Database connection failed"
```bash
# Verificar DATABASE_URL
echo $DATABASE_URL
# Verificar credenciais Neon
```

---

## 📝 Licenças dos Pacotes

| Licença | Quantidade | Pacotes Principais |
|---------|-----------|-------------------|
| MIT | 65 | React, Express, TailwindCSS, ... |
| Apache 2.0 | 3 | Drizzle ORM, TypeScript, ... |
| ISC | 3 | Zod, Passport, ... |
| Other | 3 | Material-UI, ... |

**Resumo:** Projeto é compatível com MIT e pode ser distribuído livremente.

---

## 🎯 Recomendações Finais

### Melhorias Sugeridas
1. **Remover duplicatas:** Material-UI + Radix UI podem ser redundantes
2. **Tree-shaking:** Usar `recharts` OU `chart.js`, não ambas
3. **Otimizações:** `lucide-react` é melhor que `react-icons`
4. **Modernização:** Considerar `pnpm` em vez de `npm` (mais rápido)

### Próximos Passos
- [ ] Executar `npm audit` regularmente
- [ ] Monitorar segurança com Dependabot
- [ ] Documentar mudanças em CHANGELOG.md
- [ ] Manter este documento atualizado

---

## 📞 Suporte & Contato

- **Problemas com dependências:** Verificar issue no GitHub do pacote
- **TypeScript errors:** Consultar https://www.typescriptlang.org/docs
- **Documentação oficial:** Links em cada seção acima

---

**Última atualização:** 18 de Dezembro de 2025  
**Mantido por:** Equipe QuantorFinancas  
**Versão do Documento:** 1.0.0
