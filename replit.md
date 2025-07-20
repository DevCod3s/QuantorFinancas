# Quantor - Sistema de Gestão Financeira com IA

## Overview

Quantor é um sistema web moderno de gestão financeira integrado com inteligência artificial. A aplicação permite que usuários gerenciem receitas, despesas, orçamentos e recebam conselhos financeiros personalizados através de um assistente IA especializado.

## User Preferences

Preferred communication style: Simple, everyday language.
Always communicate in Portuguese.
Extremely detail-oriented with visual precision - requires exact alignment and positioning for UI elements.

## System Architecture

### Frontend Architecture
- **Framework**: React 18+ com TypeScript
- **Build Tool**: Vite para desenvolvimento rápido e hot reload
- **UI Library**: Shadcn/ui com Radix UI primitives
- **Styling**: Tailwind CSS com design system customizado
- **State Management**: TanStack Query (React Query) para gerenciamento de estado servidor
- **Routing**: Wouter para roteamento client-side
- **Forms**: React Hook Form com validação Zod

### Backend Architecture
- **Runtime**: Node.js com Express.js
- **Language**: TypeScript
- **Database ORM**: Drizzle ORM
- **Database**: PostgreSQL (via Neon serverless)
- **Authentication**: Replit Auth com OpenID Connect
- **Session Management**: Express sessions com PostgreSQL store
- **AI Integration**: OpenAI GPT-4o para assistente financeiro

### Database Design
O sistema utiliza PostgreSQL com as seguintes entidades principais:
- **Users**: Informações dos usuários (obrigatório para Replit Auth)
- **Categories**: Categorias de receitas e despesas personalizáveis
- **Transactions**: Registro de transações financeiras
- **Budgets**: Orçamentos por categoria e período
- **AI Interactions**: Histórico de conversas com o assistente IA
- **Sessions**: Gerenciamento de sessões (obrigatório para Replit Auth)

## Key Components

### Authentication System
- Sistema híbrido: Replit Auth + autenticação local com username/password
- Middleware de autenticação obrigatório para todas as rotas da API
- Gerenciamento de sessões com PostgreSQL
- Usuário mestre configurado: Cod3s / Jr@C0d3$ (case-insensitive)
- Autenticação bcrypt para senhas
- Redirecionamento automático para login quando não autenticado

### Financial Management Core
- **Dashboard**: Visão geral com métricas, gráficos e tendências
- **Transactions**: CRUD completo para receitas e despesas
- **Categories**: Sistema de categorização customizável
- **Budgets**: Criação e monitoramento de orçamentos por período
- **Reports**: Relatórios visuais com Chart.js

### AI Financial Assistant
- Chat interface para interação com GPT-4o
- Contexto financeiro automático baseado nos dados do usuário
- Conselhos personalizados em português brasileiro
- Histórico de interações salvo no banco

### UI/UX Features
- Design responsivo para desktop e mobile
- Floating labels nos formulários
- Animações suaves e transições
- Theme system com CSS variables
- Componentes reutilizáveis com Shadcn/ui
- **Tela de Login Customizada**: Layout de 3 cards com card central suspenso, barra progressiva lateral alinhada com ícones, inputs com sombras em vez de bordas, navegação com Enter entre campos, interface em português brasileiro (Janeiro 2025)

## Data Flow

### Authentication Flow
1. Usuário acessa a aplicação
2. Middleware verifica autenticação via Replit Auth
3. Se não autenticado, redireciona para `/api/login`
4. Após login, dados do usuário são obtidos via `/api/auth/user`

### Financial Data Flow
1. Dashboard carrega dados via `/api/dashboard`
2. Transações são gerenciadas via endpoints CRUD em `/api/transactions`
3. Categorias e orçamentos seguem padrão similar
4. Todas as operações são filtradas por `userId` para segurança

### AI Interaction Flow
1. Usuário envia mensagem via chat interface
2. Sistema coleta contexto financeiro atual (dashboard, transações, orçamentos)
3. Dados são enviados para OpenAI GPT-4o com prompt especializado
4. Resposta é salva no banco e exibida ao usuário

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: Conexão com PostgreSQL serverless
- **drizzle-orm**: ORM type-safe para TypeSQL
- **@tanstack/react-query**: Gerenciamento de estado servidor
- **wouter**: Roteamento React minimalista

### UI Dependencies
- **@radix-ui/**: Componentes acessíveis (accordion, dialog, etc.)
- **tailwindcss**: Framework CSS utility-first
- **class-variance-authority**: Gerenciamento de variantes CSS
- **chart.js**: Biblioteca de gráficos

### Authentication & Security
- **openid-client**: Cliente OpenID Connect para Replit Auth
- **passport**: Middleware de autenticação
- **express-session**: Gerenciamento de sessões
- **connect-pg-simple**: Store PostgreSQL para sessões

### AI Integration
- **openai**: Cliente oficial OpenAI para GPT-4o

## Deployment Strategy

### Development Environment
- Vite dev server com HMR
- Express server com middleware de desenvolvimento
- Automatic database migrations com Drizzle
- Environment variables para configuração

### Production Build
- Vite build para frontend estático
- esbuild para bundle do servidor
- Servir arquivos estáticos via Express
- PostgreSQL como store de sessões

### Environment Variables Required
- `DATABASE_URL`: String de conexão PostgreSQL
- `OPENAI_API_KEY`: Chave da API OpenAI
- `SESSION_SECRET`: Segredo para sessões
- `REPLIT_DOMAINS`: Domínios autorizados (Replit Auth)
- `ISSUER_URL`: URL do issuer OpenID (Replit Auth)

### Key Architectural Decisions

1. **Drizzle ORM**: Escolhido por type-safety, performance e simplicidade sobre ORMs mais pesados
2. **Shadcn/ui**: Fornece componentes acessíveis e customizáveis sem lock-in
3. **TanStack Query**: Gerencia cache, sincronização e estado servidor de forma eficiente
4. **Replit Auth**: Integração nativa com a plataforma de deployment
5. **OpenAI GPT-4o**: Modelo mais recente para assistente IA com melhor compreensão contextual
6. **PostgreSQL**: Banco robusto para dados financeiros com suporte a JSON para flexibilidade

## Recent Changes (Janeiro 2025)

- **Sidebar Renovada**: Implementado design baseado na Vizta com gradiente azul, botão de colapsar/expandir, logo laranja e animações suaves
- **Login com Enter**: Navegação fluida entre campos usando tecla Enter, com submit automático no último campo
- **Interface em Português**: Toda interface traduzida para português brasileiro mantendo "Quantor" em inglês
- **UX Aprimorada**: Foco automático entre campos, validação em tempo real e experiência sem mouse
- **Sistema de Abas Finanças**: Menu "Transações" renomeado para "Finanças" com 4 abas profissionais: Visão Geral, Movimentações, Contas e Centro de Custo
- **Centro de Custo**: Nova aba com categorização de gastos (Pessoal, Casa, Trabalho, Lazer, Educação), barras de progresso visuais e resumo consolidado
- **Sistema de Sub-abas Inteligente**: Implementado sub-abas dentro das seções principais com barra de progressão animada
  - **Visão Geral**: Sub-abas "Fluxo de Caixa" e "Lançamentos" (apenas para análise, sem funcionalidade de lançamento)
  - **Movimentações**: Sub-abas "À Pagar" e "À Receber" com dados organizados por status
  - **Barra de Progressão**: Animação de preenchimento progressivo da esquerda para direita em todas as sub-abas
  - **Componente Reutilizável**: SubTabs.tsx criado para manter consistência e reutilização
- **Gráficos Avançados no Fluxo de Caixa**: Implementação completa de dashboards visuais com Chart.js
  - **Gráfico de Linha**: Evolução temporal do fluxo de caixa com múltiplas séries de dados
  - **Saldos de Caixa**: Interface com checkboxes e gráfico de barras do resultado mensal
  - **Gráficos Rosca**: Distribuição percentual de despesas e receitas por categoria
  - **Layout Responsivo**: Grid 2x2 otimizado para desktop e mobile
  - **Dados Realistas**: Baseados em referência visual fornecida pelo usuário
- **Sistema de Lançamentos Analíticos**: Sub-aba "Lançamentos" com cards demonstrativos
  - **Card Demonstrativo**: Tabela detalhada com entradas, saídas, resultado e saldo diário
  - **Card Gráfico**: Resultado de caixa em barras coloridas (verde/vermelho) por período
  - **Design Elevado**: Cards suspensos com sombreamento e transições hover elegantes
  - **Dados Estruturados**: Layout tabular organizado baseado em referência visual específica
- **Controles Temporais Avançados**: Sistema unificado de navegação temporal em ambas sub-abas
  - **Navegação por Setas**: Botões esquerda/direita para navegar entre meses
  - **Seletor de Calendário**: Popover com calendário completo para seleção de ano, mês e dia
  - **Filtros de Período**: Dropdown com opções Semanal, Mensal, Trimestral, Semestral, Anual e Personalizar
  - **Interface Consistente**: Controles padronizados nos headers dos cards "Fluxo de Caixa" e "Demonstrativo Diário"
  - **Estado Sincronizado**: Mudanças de período refletem em todo o conteúdo da sub-aba
- **Menu Negócios**: Substituição do menu "Categorias" por "Negócios" com ícone Building2
  - **Contexto Empresarial**: Ajustado todo o conteúdo da página para foco em gestão de categorias empresariais
  - **Terminologia Atualizada**: "Receitas do Negócio" e "Despesas do Negócio" para melhor contexto empresarial
  - **Interface Consistente**: Mantida funcionalidade existente com nova identidade visual e textual
  - **Botão de Ação**: "Nova Categoria de Negócio" em vez de "Nova Categoria"
- **Layout por Abas na Página Negócios**: Reestruturação completa seguindo padrão da página Finanças
  - **Sistema de Abas Profissional**: 2 abas principais com barra de progressão animada
  - **Aba Unidade de Negócios**: Placeholder clean com ícone Building2 e descrição informativa
  - **Aba Produtos & Serviços**: Placeholder clean com ícone Package e descrição informativa
  - **Consistência Visual**: Mesma estrutura de código, animações e estilos da página Finanças
  - **Preparação Futura**: Interface estruturada para desenvolvimento posterior do conteúdo específico
  - **UX Profissional**: Placeholders elegantes com bordas pontilhadas e tipografia hierárquica
- **Reestruturação do Menu de Navegação**: Otimização e adição de nova seção
  - **Remoção de Seções**: Eliminadas opções "Orçamentos" e "Relatórios" do menu principal
  - **Nova Seção Relacionamentos**: Adicionada abaixo do Dashboard com ícone Users
  - **Página Relacionamentos**: Criada com sistema de 3 abas (Clientes, Fornecedores, Outros)
  - **Layout Consistente**: Seguindo mesmo padrão visual das outras páginas com barra de progressão
  - **Menu Simplificado**: Dashboard → Relacionamentos → Finanças → Negócios → Assistente IA
  - **Rotas Atualizadas**: Removidas rotas /budgets e /reports, adicionada rota /relationships
- **Botões de Ação Modernos**: Redesign completo dos botões de adição com UX aprimorada
  - **Design Circular Compacto**: Botões FAB perfeitamente redondos de 44x44px (w-11 h-11)
  - **Formato 100% Arredondado**: rounded-full para círculo perfeito sem bordas retas
  - **Gradiente Sofisticado**: From-blue-600 to-blue-700 com hover state aprimorado
  - **Efeitos Interativos**: Hover scale(1.05), active scale(0.95) com efeito de afundar
  - **Animações Suaves**: Rotação do ícone plus (90°) no hover com transition 300ms
  - **Ícone Redimensionado**: Plus icon h-5 w-5 proporcionalmente ajustado
  - **Ripple Effect**: Efeito de ondulação circular no clique com escala e opacidade
  - **Tooltip Inteligente**: Aparecem no hover com seta e posicionamento responsivo
  - **Sombras Compactas**: Box-shadow otimizada para tamanho menor (0 6px 20px -6px)
  - **Brilho Interior**: Gradiente interno circular que aparece no hover
  - **Consistência Global**: Aplicado em todas as páginas (Relacionamentos, Negócios, Finanças)
- **Sistema de Listas Profissionais**: Implementação completa de tabelas de dados com UX moderna
  - **Estrutura de Tabela Padronizada**: Colunas ID, Razão Social/Nome, Nome Fantasia, Tipo, Data Cadastro, Status, Ações
  - **Cards Elevados**: Tabelas envolvidas em cards com shadow-lg e hover:shadow-xl para efeito profissional
  - **Ícones de Status**: CheckCircle (verde) para Ativo, XCircle (cinza) para Inativo, Ban (vermelho) para Bloqueado, AlertCircle (laranja) para Cancelado
  - **Badges de Tipo**: Pessoa Física (azul) e Pessoa Jurídica (roxo) com design rounded-full
  - **Botões de Ação**: Edit (azul), Eye (verde), Trash2 (vermelho) com hover states suaves
  - **Cabeçalhos Ordenáveis**: ArrowUpDown icons em colunas selecionáveis para indicar ordenação
  - **Paginação Completa**: Controles de itens por página e navegação entre páginas
  - **Dados Demonstrativos**: 6 registros para Clientes, 3 para Fornecedores, 2 para Outros Relacionamentos
  - **Hover Effects**: Linhas da tabela com hover:bg-gray-50 para feedback visual
  - **Responsive Design**: overflow-x-auto para adaptação mobile
  - **Aplicação Unificada**: Mesmo padrão implementado nas 3 abas (Clientes, Fornecedores, Outros)