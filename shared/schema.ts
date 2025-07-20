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
  color: text("color").notNull().default("#0ea5e9"), // Azul padrão
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
  categoryId: integer("category_id").notNull().references(() => categories.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // Máx: 99.999.999,99
  description: text("description").notNull(),
  type: text("type").notNull(), // 'income' | 'expense'
  date: timestamp("date").notNull(), // Data da transação
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
  userId: text("user_id").notNull().references(() => users.id),
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
export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true, // Auto-incrementado pelo banco
  createdAt: true, // Definido automaticamente
});

/**
 * Schema de inserção para orçamentos
 * 
 * Remove campos auto-gerados da validação.
 * Usado em: Criação de metas de gastos por categoria.
 */
export const insertBudgetSchema = createInsertSchema(budgets).omit({
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
export type Transaction = typeof transactions.$inferSelect;
export type Budget = typeof budgets.$inferSelect;
export type AiInteraction = typeof aiInteractions.$inferSelect;
export type Session = typeof sessions.$inferSelect;

// Tipos para inserção de dados (sem campos auto-gerados)
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
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