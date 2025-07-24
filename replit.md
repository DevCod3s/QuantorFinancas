# Quantor - Sistema de Gestão Financeira com IA

## Overview

Quantor é um sistema web moderno de gestão financeira integrado com inteligência artificial. A aplicação permite que usuários gerenciem receitas, despesas, orçamentos e recebam conselhos financeiros personalizados através de um assistente IA especializado.

## User Preferences

Preferred communication style: Simple, everyday language.
Always communicate in Portuguese.
Extremely detail-oriented with visual precision - requires exact alignment and positioning for UI elements.
**CRITÉRIO OBRIGATÓRIO**: Ser extremamente atento nas criações - verificar sempre se a implementação está exatamente conforme solicitado, sem conflitos, modais duplicados ou elementos indesejados. Revisar cuidadosamente antes de apresentar qualquer resultado.

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

- **Sistema de Notificações Visuais**: Implementação completa de dialogs de feedback para operações do usuário (Janeiro 2025)
  - **Dialog de Sucesso**: Design verde baseado em imagem de referência com ícone de balão de mensagem e check
  - **Dialog de Erro**: Design vermelho com ícone de alerta triangular, seguindo mesmo padrão visual
  - **Auto-close Inteligente**: Countdown de 3 segundos com possibilidade de fechamento manual
  - **Acessibilidade**: DialogTitle e DialogDescription invisíveis para leitores de tela
  - **Integração Funcional**: Hooks personalizados (useSuccessDialog, useErrorDialog) para facilitar uso
  - **Cenários Implementados**: Validação de exclusão (status ativo), formulários incompletos, operações bem-sucedidas
  - **Proporções Corretas**: Tamanho adequado baseado nas imagens de referência fornecidas
  - **Consistência Visual**: Ambos dialogs seguem mesmo padrão de design e animações
- **Documentação Abrangente do Código**: Implementação completa de comentários detalhados em todo o sistema (Janeiro 2025)
  - **Padrão JSDoc**: Todos os arquivos principais com cabeçalhos @fileoverview detalhados
  - **Comentários Funcionais**: Explicação de cada função, interface e componente importante
  - **Arquitetura Documentada**: Descrição clara da estrutura e responsabilidades de cada módulo
  - **Tipos Comentados**: Interfaces TypeScript com comentários explicativos em cada propriedade
  - **Fluxos de Dados**: Documentação dos fluxos de autenticação, dados e interações com IA
  - **Boas Práticas**: Código preparado para colaboração em equipe com padrões profissionais
  - **Histórico de Versão**: Sistema de versionamento e autoria implementado
  - **Contexto de Negócio**: Explicação do propósito e uso de cada componente no sistema
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
- **Sistema de Paginação e Ordenação Funcional**: Implementação completa de controles interativos (Janeiro 2025)
  - **Paginação Dinâmica**: Controles funcionais com seletor de itens por página (5, 10, 20)
  - **Navegação por Páginas**: Botões Anterior/Próxima com estados desabilitados apropriados
  - **Numeração Automática**: Páginas renderizadas dinamicamente baseadas no total de registros
  - **Página Atual Destacada**: Botão da página ativa com cor azul e hover effects
  - **Cabeçalhos Clicáveis**: Ordenação por Razão Social, Tipo, Data Cadastro e Status
  - **Ordenação Inteligente**: Tratamento diferenciado para datas (conversão DD/MM/YYYY) e texto (case-insensitive)
  - **Estados de Ordenação**: Alternância ASC/DESC ao clicar no mesmo campo
  - **Dados Processados**: Pipeline completo (ordenação → paginação) aplicado em todas as abas
  - **Controles Responsivos**: Feedback visual hover nos cabeçalhos e transições suaves
  - **Altura Calibrada**: max-h-[640px] para mostrar até 10 registros sem scroll, mais que isso ativa scroll vertical
- **Sistema de Cadastro de Relacionamentos por Etapas**: Wizard completo de 4 etapas com IA integrada (Janeiro 2025)
  - **Stepper Visual**: Design fiel à imagem de referência com círculos numerados e progressão animada
  - **Etapa 1 - Informações Básicas**: Input CPF/CNPJ com formatação automática, validação e auto-preenchimento
  - **Etapa 2 - Geração de Contrato**: IA especializada (OpenAI GPT-4o) para contratos profissionais por segmento
  - **Etapa 3 - Revisão PRD**: Sistema de aprovação com solicitação de modificações
  - **Etapa 4 - Finalização**: Confirmação final com códigos únicos e configurações de notificação
  - **Navegação Automática**: Entre campos sem necessidade de tecla Enter
  - **Upload de Templates**: Modelos personalizados de contrato
  - **Segmentos Dinâmicos**: Cadastro de novos segmentos através de ícone +
  - **Preview em Tempo Real**: Visualização do contrato gerado pela IA
  - **API Backend**: Endpoint /generate-contract com OpenAI integrado
  - **Validação Completa**: Estados de validação em cada etapa com feedback visual
- **Plano de Contas Hierárquico Completo**: Sistema de categorização empresarial com 4 níveis funcionais (Janeiro 2025)
  - **Modal "Nova categoria"**: Design baseado em imagem de referência com botão X para cancelar
  - **Campo Nome Único Obrigatório**: Simplificação onde apenas Nome é requerido para criar categoria nível 1
  - **Hierarquia Automática**: Códigos gerados automaticamente (1.Receita, 2.Despesa, 3.4.5.Novos tipos)
  - **Dropdowns Dinâmicos**: Listas baseadas apenas em dados salvos no banco PostgreSQL
  - **Botão "Salvar e Continuar"**: Funcionalidade que limpa campos mas mantém modal aberto
  - **Estrutura 4 Níveis Funcionais**: 
    • Só Nome → Nível 1 (Categoria principal)
    • Nome + Categoria → Nível 2 (Subcategoria)  
    • Nome + Categoria + Subcategoria de → Nível 3 (Sub-subcategoria)
    • Nome + Categoria + Subcategoria de + Incluir como filha de → Nível 4 (Conta específica)
  - **Listas Inteligentes**: "Subcategoria de" mostra nível 2, "Incluir como filha de" mostra nível 2
  - **Lógica Hierárquica Correta**: Implementação definitiva com filtros precisos nos dropdowns
  - **CRUD Completo**: Criar, editar, visualizar e excluir contas com persistência PostgreSQL
  - **Campos Material-UI**: Modal com componentes padronizados (Janeiro 2025)
    • Campo "Nome": TextField variant="standard"
    • Campos dropdown: FormControl/Select/MenuItem variant="standard" com labelId
    • Categoria, Subcategoria de, Incluir como filha de seguem padrão Material-UI oficial
- **Estrutura Hierárquica Definitiva**: Sistema de 4 níveis com códigos corretos implementado (Janeiro 2025)
    • Nível 1 (tipos principais): códigos 1, 2, 3...
    • Nível 2 (categorias): códigos 1.1, 1.2, 2.1...
    • Nível 3 (subcategorias): códigos 1.2.1, 1.2.2...
    • Nível 4 (contas específicas): códigos 1.2.3.1, 1.2.3.2...
    • Campo "Incluir como filha de" preenchido = SEMPRE nível 4
    • Geração automática baseada em contagem de filhos por pai
    • Lógica implementada em handleSaveAccount e handleSaveAndContinue
- **Interface Completa e Funcional das Abas À Pagar/À Receber**: Sistema profissional totalmente implementado (Janeiro 2025)
  - **Fonte Reduzida**: text-xs conforme imagem de referência para melhor densidade de informação
  - **Ordenação Funcional**: Sistema completo de sorting por todos os campos (Razão Social, Vencimento, Produto, Tipo, Status, Valor)
  - **Paginação Funcional**: Controles completamente operacionais com navegação Anterior/Próxima e numeração de páginas
  - **Dados Dinâmicos**: Sistema mockado com dados reais renderizados via map() com estados controlados
  - **Botões de Ação Funcionais**: Todos os ícones (Edit, Eye, Download, Trash2) com onClick handlers implementados
  - **Card de Paginação Separado**: Completamente independente da tabela principal conforme layout de referência
  - **Estados Sincronizados**: Ordenação e paginação funcionando em conjunto com cálculos corretos
  - **CNPJ nas Razões Sociais**: Campo adicional abaixo de cada razão social com documento da empresa
  - **UX Completa**: Hover effects, cursor pointer nos cabeçalhos, estados disabled apropriados
  - **Layout Compacto**: Espaçamento reduzido (py-2 px-3) e ícones menores (h-3 w-3) para densidade visual otimizada
- **Problemas Técnicos Não Resolvidos**: Questões pendentes no wizard de relacionamentos (Janeiro 2025)
    • Campo CEP: Formatação funciona internamente (console mostra 9 caracteres) mas interface limita visualmente
    • API CNPJ: Funcionando com Brasil API, preenchimento automático operacional
    • Warning React.Fragment: Props inválidas no StepperWizard (não crítico)
    • CEP aceita 8 dígitos internamente mas problema de exibição visual persistente
    • Console logs confirmam processamento correto: digitalLength:8, totalLength:9
    • Múltiplas tentativas de correção: maxLength aumentado, navegação automática removida, logs adicionados