/**
 * @fileoverview Schema do banco de dados para o sistema Quantor
 * 
 * Define todas as tabelas e relacionamentos do PostgreSQL usando Drizzle ORM.
 * Inclui schemas de validação com Zod para garantir integridade dos dados.
 * 
 * Estrutura do banco:
 * - Users: Gerenciamento de usuários e autenticação
 * - Categories: Categorização de receitas e despesas
 * - Transactions: Registro de movimentações financeiras
 * - Budgets: Planejamento e controle orçamentário
 * - AI Interactions: Histórico de conversas com assistente IA
 * - Sessions: Gerenciamento de sessões para autenticação
 * 
 * @author Equipe Quantor
 * @version 1.0.0
 */

// Importações do Drizzle ORM para definição de schemas
import { pgTable, text, serial, timestamp, decimal, boolean, integer, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Importações para validação de dados
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Tabela de usuários
 * 
 * Armazena informações dos usuários do sistema.
 * Suporta tanto autenticação via Replit Auth quanto login local.
 * 
 * Campos:
 * - id: Chave primária auto-incrementada
 * - email: Email único do usuário (obrigatório)
 * - name: Nome completo do usuário
 * - username: Nome de usuário único (opcional para Replit Auth)
 * - password: Senha criptografada (opcional para Replit Auth)
 * - avatar: URL da foto do perfil
 * - createdAt: Data de criação do registro
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  username: text("username").unique(),
  password: text("password"), // Criptografada com bcrypt
  avatar: text("avatar"),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Tabela de Formas de Pagamento
 */
export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Tabela de categorias
 * 
 * Define categorias personalizáveis para classificação de transações.
 * Cada usuário pode criar suas próprias categorias.
 * 
 * Campos:
 * - id: Chave primária auto-incrementada
 * - userId: Referência ao usuário proprietário
 * - name: Nome da categoria (ex: "Alimentação", "Salário")
 * - color: Cor hexadecimal para identificação visual
 * - type: Tipo da categoria ('income' para receitas, 'expense' para despesas)
 * - createdAt: Data de criação da categoria
 */
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  color: text("color").notNull().default("#4D4E48"), // Cinza da Marca (era #0ea5e9)
  type: text("type").notNull(), // 'income' | 'expense'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Tabela de transações
 * 
 * Registra todas as movimentações financeiras do usuário.
 * Cada transação é associada a uma categoria para análise.
 * 
 * Campos:
 * - id: Chave primária auto-incrementada
 * - userId: Referência ao usuário proprietário
 * - categoryId: Referência à categoria da transação
 * - amount: Valor da transação (decimal com 2 casas, até 99.999.999,99)
 * - description: Descrição detalhada da transação
 * - type: Tipo da transação ('income' | 'expense')
 * - date: Data da transação (definida pelo usuário)
 * - createdAt: Data de criação do registro
 */
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  categoryId: integer("category_id").references(() => categories.id),
  chartAccountId: integer("chart_account_id").references(() => chartOfAccounts.id),
  bankAccountId: integer("bank_account_id").references(() => bankAccounts.id),
  paymentMethodId: integer("payment_method_id").references(() => paymentMethods.id),
  relationshipId: integer("relationship_id").references(() => relationships.id),
  productServiceId: integer("product_service_id").references(() => productsServices.id), // Produto/Serviço vinculado (receitas)
  businessCategoryId: integer("business_category_id").references(() => businessCategories.id), // Categoria de Negócio (DRE gerencial)
  businessSubcategoryId: integer("business_subcategory_id").references(() => businessSubcategories.id), // Subcategoria de Negócio
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // Máx: 99.999.999,99
  description: text("description").notNull(),
  type: text("type").notNull(), // 'income' | 'expense'
  status: text("status").notNull().default("pago"), // 'pago' | 'pendente'
  date: timestamp("date").notNull(), // Data da transação
  liquidationDate: timestamp("liquidation_date"), // Data em que foi realmente pago/recebido
  // Campos de repetição/parcelamento
  repeticao: text("repeticao").default("Única"), // 'Única' | 'Parcelado' | 'Recorrente'
  periodicidade: text("periodicidade"), // 'Diário' | 'Semanal' | 'Mensal' | 'Anual'
  intervalo: integer("intervalo").default(1),
  dataTermino: timestamp("data_termino"), // Data para parar a recorrência
  numeroParcelas: integer("numero_parcelas"), // Total de parcelas (ex: 12)
  parcelaAtual: integer("parcela_atual"), // Parcela atual (ex: 1 de 12)
  parcelamentoId: text("parcelamento_id"), // UUID para agrupar parcelas
  recorrenciaId: text("recorrencia_id"), // UUID para agrupar recorrências
  transferId: text("transfer_id"), // UUID para agrupar entradas e saídas de transferência
  // Campos de juros/encargos (parcelamento)
  aplicarJuros: boolean("aplicar_juros").default(false),
  tipoJuros: text("tipo_juros"), // 'percentual' | 'valor'
  valorJuros: decimal("valor_juros", { precision: 10, scale: 4 }), // Taxa de juros (% a.m. ou valor fixo)
  aplicarJurosEm: text("aplicar_juros_em"), // 'total' | 'parcela' | 'atraso'
  // Campos de encargos (recorrência)
  aplicarEncargos: boolean("aplicar_encargos").default(false),
  jurosMes: decimal("juros_mes", { precision: 10, scale: 4 }), // Juros ao mês (%)
  moraDia: decimal("mora_dia", { precision: 10, scale: 4 }), // Mora por dia (%)
  tipoEncargo: text("tipo_encargo"), // 'percentual' | 'valor'
  aplicarMultaEm: text("aplicar_multa_em"), // 'atrasados' | 'todos' | 'ambos'
  createdAt: timestamp("created_at").defaultNow().notNull(), // Data de criação
});

/**
 * Tabela de orçamentos
 * 
 * Define metas de gastos por categoria e período.
 * Permite controle e planejamento financeiro.
 * 
 * Campos:
 * - id: Chave primária auto-incrementada
 * - userId: Referência ao usuário proprietário
 * - categoryId: Categoria do orçamento (opcional para orçamento geral)
 * - budgetedAmount: Valor orçado para o período
 * - period: Tipo do período ('monthly', 'quarterly', 'yearly')
 * - startDate: Data de início do período
 * - endDate: Data de fim do período
 * - createdAt: Data de criação do orçamento
 */
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  categoryId: integer("category_id").references(() => categories.id), // NULL = orçamento geral
  budgetedAmount: decimal("budgeted_amount", { precision: 10, scale: 2 }).notNull(),
  period: text("period").notNull(), // 'monthly' | 'quarterly' | 'yearly'
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * Tabela de interações com IA
 * 
 * Armazena histórico de conversas com o assistente financeiro.
 * Permite continuidade nas conversas e análise de padrões.
 * 
 * Campos:
 * - id: Chave primária auto-incrementada
 * - userId: Referência ao usuário proprietário
 * - message: Mensagem enviada pelo usuário
 * - response: Resposta gerada pela IA
 * - context: Contexto financeiro em JSON (dashboard, transações recentes)
 * - createdAt: Data da interação
 */
export const aiInteractions = pgTable("ai_interactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  message: text("message").notNull(), // Pergunta do usuário
  response: text("response").notNull(), // Resposta da IA
  context: text("context"), // JSON com dados financeiros do momento
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Tabela de sessões
 * 
 * Gerencia sessões de usuários para autenticação.
 * Obrigatória para integração com Replit Auth.
 * 
 * Campos:
 * - sid: ID único da sessão (chave primária)
 * - sess: Dados da sessão serializados
 * - expire: Data de expiração da sessão
 */
export const sessions = pgTable("sessions", {
  sid: text("sid").primaryKey(),
  sess: text("sess").notNull(), // Dados serializados da sessão
  expire: timestamp("expire").notNull(), // Data de expiração
});

/**
 * =============================================================================
 * SCHEMAS DE VALIDAÇÃO COM ZOD
 * =============================================================================
 * 
 * Os schemas abaixo são gerados automaticamente a partir das tabelas Drizzle
 * e são utilizados para validar dados de entrada nas APIs e formulários.
 * 
 * Padrão de nomenclatura:
 * - insertSchema: Para criação de novos registros
 * - selectSchema: Para tipagem de dados retornados do banco
 * - updateSchema: Para atualização de registros existentes
 */

/**
 * Schema de inserção para usuários
 * 
 * Remove campos auto-gerados (id, createdAt) da validação.
 * Usado em: Registro de novos usuários, importação de dados.
 */
export const insertUserSchema = createInsertSchema(users).omit({
  id: true, // Auto-incrementado pelo banco
  createdAt: true, // Definido automaticamente
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
  createdAt: true,
});

/**
 * Schema de inserção para categorias
 * 
 * Remove campos auto-gerados da validação.
 * Usado em: Criação de novas categorias pelo usuário.
 */
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true, // Auto-incrementado pelo banco
  createdAt: true, // Definido automaticamente
});

/**
 * Schema de inserção para transações
 * 
 * Remove campos auto-gerados da validação.
 * Usado em: Criação de receitas e despesas pelo usuário.
 */
export const insertTransactionSchema = createInsertSchema(transactions, {
  amount: z.coerce.string(),
  date: z.coerce.date(),
  liquidationDate: z.coerce.date().optional().nullable(),
  dataTermino: z.coerce.date().optional().nullable(),
  valorJuros: z.coerce.string().optional().nullable(),
  jurosMes: z.coerce.string().optional().nullable(),
  moraDia: z.coerce.string().optional().nullable(),
}).omit({
  id: true, // Auto-incrementado pelo banco
  createdAt: true, // Definido automaticamente
});

/**
 * Schema de inserção para orçamentos
 * 
 * Remove campos auto-gerados da validação.
 * Usado em: Criação de metas de gastos por categoria.
 */
export const insertBudgetSchema = createInsertSchema(budgets, {
  budgetedAmount: z.coerce.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).omit({
  id: true, // Auto-incrementado pelo banco
  createdAt: true, // Definido automaticamente
});

/**
 * Schema de inserção para interações com IA
 * 
 * Remove campos auto-gerados da validação.
 * Usado em: Salvamento de conversas com assistente IA.
 */
export const insertAiInteractionSchema = createInsertSchema(aiInteractions).omit({
  id: true, // Auto-incrementado pelo banco
  createdAt: true, // Definido automaticamente
});

/**
 * =============================================================================
 * TIPOS TYPESCRIPT
 * =============================================================================
 * 
 * Tipos inferidos automaticamente das tabelas Drizzle para garantir
 * type-safety em todo o sistema.
 */

// Tipos para dados selecionados do banco (incluem todos os campos)
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Budget = typeof budgets.$inferSelect;
export type AiInteraction = typeof aiInteractions.$inferSelect;
export type Session = typeof sessions.$inferSelect;

// Tipos para inserção de dados (sem campos auto-gerados)
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type InsertAiInteraction = z.infer<typeof insertAiInteractionSchema>;

/**
 * Tabela de relacionamentos (clientes, fornecedores, outros)
 * 
 * Armazena dados de pessoas físicas e jurídicas relacionadas ao negócio.
 * Suporta diferentes tipos de relacionamento e documentos (CPF/CNPJ).
 */
export const relationships = pgTable("relationships", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'cliente' | 'fornecedor' | 'outros'
  documentType: text("document_type").notNull(), // 'CPF' | 'CNPJ'
  document: text("document").notNull(),
  socialName: text("social_name").notNull(),
  fantasyName: text("fantasy_name"),
  email: text("email"), // Novo campo adicionado para edição inteligente
  stateRegistration: text("state_registration"),
  birthDate: date("birth_date"),
  zipCode: text("zip_code").notNull(),
  street: text("street").notNull(),
  number: text("number").notNull(),
  complement: text("complement"),
  neighborhood: text("neighborhood").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  status: text("status").notNull().default("ativo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schema de inserção para relacionamentos
export const insertRelationshipSchema = createInsertSchema(relationships).omit({
  id: true,
  createdAt: true,
});

// Tipos para relacionamentos
export type Relationship = typeof relationships.$inferSelect;
export type InsertRelationship = z.infer<typeof insertRelationshipSchema>;

/**
 * Tabela do plano de contas
 * 
 * Estrutura hierárquica para organização contábil com até 3 níveis.
 * Permite organização flexível de contas de receitas e despesas.
 */
export const chartOfAccounts = pgTable("chart_of_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  parentId: integer("parent_id"), // Auto-referência para hierarquia será definida após a declaração
  code: text("code").notNull(), // Código da conta (ex: 1.1.001)
  name: text("name").notNull(), // Nome da conta
  type: text("type").notNull(), // 'receita' | 'despesa' | 'ativo' | 'passivo'
  category: text("category"), // Categoria pai (nível 1)
  subcategory: text("subcategory"), // Subcategoria (nível 2)
  level: integer("level").notNull().default(1), // Nível na hierarquia (1, 2 ou 3)
  isActive: boolean("is_active").notNull().default(true),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schema de inserção para plano de contas
export const insertChartOfAccountsSchema = createInsertSchema(chartOfAccounts).omit({
  id: true,
  createdAt: true,
});

// Tipos para plano de contas
export type ChartOfAccount = typeof chartOfAccounts.$inferSelect;
export type InsertChartOfAccount = z.infer<typeof insertChartOfAccountsSchema>;

/**
 * Tabela de contas bancárias
 * 
 * Armazena informações das contas bancárias para controle financeiro.
 * Permite cadastro de diferentes tipos de contas com dados completos.
 * 
 * Campos baseados na imagem de referência fornecida:
 * - Data do saldo inicial e saldo atual
 * - Tipo de conta (Corrente, Poupança, etc.)
 * - Dados bancários completos (banco, agência, conta)
 * - Informações de contato e limites
 */
export const bankAccounts = pgTable("bank_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  initialBalanceDate: date("initial_balance_date").notNull(), // Data do saldo inicial
  currentBalance: decimal("current_balance", { precision: 15, scale: 2 }).notNull(), // Saldo em R$
  balanceType: text("balance_type").notNull().default("credor"), // 'credor' | 'devedor'
  accountType: text("account_type").notNull().default("conta_corrente"), // Tipo (Conta Corrente, Poupança, etc.)
  name: text("name").notNull(), // Nome da conta
  currency: text("currency").notNull().default("BRL"), // Moeda (Real R$)
  bank: text("bank").notNull(), // Banco
  agency: text("agency"), // Agência
  accountNumber: text("account_number"), // Conta
  creditLimit: decimal("credit_limit", { precision: 15, scale: 2 }), // Limite (R$)
  contactName: text("contact_name"), // Contato
  contactPhone: text("contact_phone"), // Telefone
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schema de inserção para contas bancárias
export const insertBankAccountSchema = createInsertSchema(bankAccounts, {
  currentBalance: z.coerce.string(),
  creditLimit: z.coerce.string().optional().nullable(),
  initialBalanceDate: z.coerce.date(),
}).omit({
  id: true,
  createdAt: true,
});

// Tipos para contas bancárias
export type BankAccount = typeof bankAccounts.$inferSelect;
export type InsertBankAccount = z.infer<typeof insertBankAccountSchema>;

/**
 * Tabela de bancos customizados criados pelo usuário
 * 
 * Permite que usuários salvem novos bancos localmente
 */
export const customBanks = pgTable("custom_banks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  code: text("code").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schema de inserção para bancos customizados
export const insertCustomBankSchema = createInsertSchema(customBanks).omit({
  id: true,
  createdAt: true,
});

// Tipos para bancos customizados
export type CustomBank = typeof customBanks.$inferSelect;
export type InsertCustomBank = z.infer<typeof insertCustomBankSchema>;

/**
 * Tabela de categorias do negócio (Unidade de Negócios)
 */
export const businessCategories = pgTable("business_categories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: text("type").notNull().default("income"), // 'income' ou 'expense'
  appliedTo: text("applied_to").notNull().default("both"), // 'products' | 'services' | 'both'
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const businessSubcategories = pgTable("business_subcategories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  categoryId: integer("category_id").notNull().references(() => businessCategories.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  type: text("type").notNull().default("income"), // herdado ou independente 'income' / 'expense'
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const businessCategoriesRelations = relations(businessCategories, ({ many, one }) => ({
  user: one(users, {
    fields: [businessCategories.userId],
    references: [users.id],
  }),
  subcategories: many(businessSubcategories)
}));

export const businessSubcategoriesRelations = relations(businessSubcategories, ({ one }) => ({
  user: one(users, {
    fields: [businessSubcategories.userId],
    references: [users.id],
  }),
  category: one(businessCategories, {
    fields: [businessSubcategories.categoryId],
    references: [businessCategories.id]
  })
}));

export const insertBusinessCategorySchema = createInsertSchema(businessCategories).omit({
  id: true,
  userId: true
});
export const insertBusinessSubcategorySchema = createInsertSchema(businessSubcategories).omit({
  id: true,
  userId: true
});

export type BusinessCategory = typeof businessCategories.$inferSelect;
export type InsertBusinessCategory = z.infer<typeof insertBusinessCategorySchema>;

export type BusinessSubcategory = typeof businessSubcategories.$inferSelect;
export type InsertBusinessSubcategory = z.infer<typeof insertBusinessSubcategorySchema>;

/**
 * Tabela de Produtos e Serviços
 * 
 * Permite o cadastro e gestão do catálogo de itens do negócio.
 * Suporta precificação, controle básico e categorização fiscal (NCM).
 */
export const productsServices = pgTable("products_services", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  sku: text("sku"), // Código interno do produto
  type: text("type").notNull().default("product"), // 'product' | 'service'
  unit: text("unit").notNull().default("un"), // 'un', 'kg', 'm', 'hora', etc.
  categoryId: integer("category_id").references(() => businessCategories.id), // Categoria da Unidade de Negócio
  subcategoryId: integer("subcategory_id").references(() => businessSubcategories.id), // Subcategoria da Unidade de Negócio
  salePrice: decimal("sale_price", { precision: 15, scale: 2 }).notNull().default("0"),
  costPrice: decimal("cost_price", { precision: 15, scale: 2 }).default("0"),
  ncm: text("ncm"), // Código NCM para produtos
  status: text("status").notNull().default("active"), // 'active' | 'inactive'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schema de inserção para produtos e serviços
export const insertProductServiceSchema = createInsertSchema(productsServices, {
  salePrice: z.coerce.string(),
  costPrice: z.coerce.string().optional().nullable(),
}).omit({
  id: true,
  createdAt: true,
});

// Tipos para produtos e serviços
export type ProductService = typeof productsServices.$inferSelect;
export type InsertProductService = z.infer<typeof insertProductServiceSchema>;

/**
 * Tabela de Unidades de Produto
 * 
 * Permite cadastrar siglas e descrições para unidades de medida (ex: UN, KG, PCT).
 */
export const productUnits = pgTable("product_units", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(), // Descrição (ex: Pacote)
  abbreviation: text("abbreviation").notNull(), // Sigla (ex: PCT)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schema de inserção para unidades
export const insertProductUnitSchema = createInsertSchema(productUnits).omit({
  id: true,
  createdAt: true,
});

// Tipos para unidades
export type ProductUnit = typeof productUnits.$inferSelect;
export type InsertProductUnit = z.infer<typeof insertProductUnitSchema>;