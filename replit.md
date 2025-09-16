# Quantor - Sistema de Gestão Financeira com IA

## Overview
Quantor is a modern web-based financial management system integrated with artificial intelligence. The application empowers users to manage income, expenses, and budgets, and receive personalized financial advice through a specialized AI assistant. Its vision is to provide a comprehensive, intuitive platform for personal and business financial control, leveraging AI for smart insights and automated contract generation.

## User Preferences
Preferred communication style: Simple, everyday language.
**SEMPRE COMUNICAR EM PORTUGUÊS BRASILEIRO** - Toda interação deve ser em português do Brasil para facilitar o entendimento.
Extremely detail-oriented with visual precision - requires exact alignment and positioning for UI elements.
**CRITÉRIO OBRIGATÓRIO**: Ser extremamente atento nas criações - verificar sempre se a implementação está exatamente conforme solicitado, sem conflitos, modais duplicados ou elementos indesejados. Revisar cuidadosamente antes de apresentar qualquer resultado.

## System Architecture
Quantor's architecture is built on a robust and scalable stack, emphasizing modern web technologies and a clear separation of concerns.

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **UI Library**: Shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with a custom design system
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter
- **Forms**: React Hook Form with Zod validation
- **UI/UX Decisions**:
    - Responsive design for desktop and mobile
    - Floating labels in forms
    - Smooth animations and transitions
    - Theme system with CSS variables
    - Reusable components
    - Custom login screen with a 3-card layout, suspended central card, progressive side bar aligned with icons, shadow-based inputs, and "Enter" key navigation.
    - Professional tab system with animated progress bars (e.g., "Finanças," "Negócios," "Relacionamentos").
    - Advanced Chart.js visualizations for financial data (line, bar, doughnut charts).
    - Modern, circular Floating Action Buttons (FABs) with sophisticated gradients, hover effects, and ripple animations.
    - Professional data tables with sorting, pagination, status icons, and action buttons.
    - Multi-step wizard for relationship creation with integrated AI.
    - Hierarchical Chart of Accounts with 4 functional levels (main category, subcategory, sub-subcategory, specific account).
    - Professional payment/receivable tables with detailed information and action buttons.
    - Standardized Material-UI components for forms and modals.

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database ORM**: Drizzle ORM
- **Database**: PostgreSQL (via Neon serverless)
- **Authentication**: Replit Auth with OpenID Connect, supporting local username/password and bcrypt for passwords.
- **Session Management**: Express sessions with PostgreSQL store.
- **AI Integration**: OpenAI GPT-4o for financial assistant and contract generation.

### Key Features
- **Authentication System**: Hybrid Replit Auth + local auth, with middleware for all API routes and session management.
- **Financial Management Core**: Dashboard, CRUD for transactions, customizable categories, budget creation/monitoring, visual reports with Chart.js.
- **AI Financial Assistant**: Chat interface with GPT-4o, personalized advice in Brazilian Portuguese, and historical interaction saving.
- **Data Flow**: Secure data flow with `userId` filtering for financial operations; AI interactions leverage current financial context for specialized prompts.
- **Deployment Strategy**: Vite for frontend, esbuild for server, static file serving via Express, PostgreSQL for session store.

## External Dependencies
- **Database**: `@neondatabase/serverless`, `drizzle-orm`
- **Frontend Core**: `@tanstack/react-query`, `wouter`
- **UI Libraries**: `@radix-ui/` (various components), `tailwindcss`, `class-variance-authority`, `chart.js`
- **Authentication & Security**: `openid-client`, `passport`, `express-session`, `connect-pg-simple`
- **AI Integration**: `openai` (for GPT-4o)

## Recent Updates

- **Modal de Contato Implementado no TransactionCard** (Janeiro 2025)
    • **Componentes Customizados**: Integração completa com CustomInput, CustomSelect, e CpfCnpjInput
    • **Auto-preenchimento**: Busca automática de dados CNPJ via BrasilAPI e CEP via ViaCEP
    • **Layout Profissional**: Modal em 3 colunas com sombreamento conforme design fornecido
    • **Bug de Evento Corrigido**: Resolvido problema que fechava modal ao clicar nos campos
    • **Funcionalidade Completa**: Modal de contato funcional sem afetar formulário principal de transação

- **Otimização Completa do Wizard de Relacionamento**: Melhorias na navegação e nomenclatura (Janeiro 2025)
    • **Botões Duplicados Corrigidos**: Eliminados dois botões "Anterior" e "Voltar" duplicados na etapa 2
    • **Lógica Inteligente**: Botão único que funciona como "Voltar" na etapa 1 e "Anterior" nas demais
    • **Nome da Etapa Atualizado**: Mudança de "Detalhes do Projeto" para "Gerar Contrato"
    • **Navegação Sempre Habilitada**: Botão "Próximo" sempre ativo na etapa 2 - usuário pode pular geração
    • **Validação Flexível**: Etapa 2 sempre válida permitindo fluxo contínuo sem obrigatoriedade
    • **UX Aprimorada**: Interface mais intuitiva com navegação fluida e sem bloqueios desnecessários