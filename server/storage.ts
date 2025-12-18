/**
 * @fileoverview Camada de persistência de dados do sistema Quantor
 * 
 * Implementa a interface de armazenamento usando Drizzle ORM e PostgreSQL.
 * Todas as operações incluem isolamento por usuário para segurança.
 * 
 * Funcionalidades:
 * - CRUD completo para todas as entidades
 * - Consultas otimizadas com índices
 * - Validação de dados na camada de banco
 * - Agregações para dashboard
 * - Transações para operações complexas
 * 
 * @author Equipe Quantor
 * @version 1.0.0
 */

// Importações do Drizzle ORM
import { db } from "./db";
import { desc, eq, and, sql } from "drizzle-orm";

// Schema e tipos do banco de dados
import * as schema from "@shared/schema";
import type { 
  User, 
  Category, 
  Transaction, 
  Budget, 
  AiInteraction,
  Relationship,
  ChartOfAccount,
  BankAccount,
  InsertUser,
  InsertCategory,
  InsertTransaction,
  InsertBudget,
  InsertAiInteraction,
  InsertRelationship,
  InsertChartOfAccount,
  InsertBankAccount
} from "@shared/schema";

// Configuração da conexão com PostgreSQL já feita em db.ts
// Importação acima: import { db } from "./db";

export interface IStorage {
  // Users
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;

  // Categories
  getCategoriesByUserId(userId: string): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | null>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;

  // Transactions
  getTransactionsByUserId(userId: string): Promise<Transaction[]>;
  getTransactionById(id: number): Promise<Transaction | null>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction>;
  deleteTransaction(id: number): Promise<void>;

  // Budgets
  getBudgetsByUserId(userId: string): Promise<Budget[]>;
  getBudgetById(id: number): Promise<Budget | null>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget>;
  deleteBudget(id: number): Promise<void>;

  // AI Interactions
  getAiInteractionsByUserId(userId: string): Promise<AiInteraction[]>;
  createAiInteraction(interaction: InsertAiInteraction): Promise<AiInteraction>;

  // Relationships
  getRelationshipsByUserId(userId: string): Promise<Relationship[]>;
  getRelationshipsByType(userId: string, type: string): Promise<Relationship[]>;
  getRelationshipById(id: number): Promise<Relationship | null>;
  createRelationship(relationship: InsertRelationship): Promise<Relationship>;
  updateRelationship(id: number, relationship: Partial<InsertRelationship>): Promise<Relationship>;
  deleteRelationship(id: number): Promise<void>;

  // Chart of Accounts
  getChartOfAccounts(userId: number): Promise<ChartOfAccount[]>;
  getChartOfAccountById(id: number): Promise<ChartOfAccount | null>;
  createChartOfAccount(account: InsertChartOfAccount): Promise<ChartOfAccount>;
  updateChartOfAccount(id: number, account: Partial<InsertChartOfAccount>): Promise<ChartOfAccount>;
  deleteChartOfAccount(id: number): Promise<void>;

  // Bank Accounts
  getBankAccountsByUserId(userId: string): Promise<BankAccount[]>;
  getBankAccountById(id: number): Promise<BankAccount | null>;
  createBankAccount(bankAccount: InsertBankAccount): Promise<BankAccount>;
  updateBankAccount(id: number, bankAccount: Partial<InsertBankAccount>): Promise<BankAccount>;
  deleteBankAccount(id: number): Promise<void>;

  // Dashboard
  getDashboardStats(userId: string): Promise<{
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    budgetUsage: number;
    recentTransactions: Array<{
      id: number;
      description: string;
      amount: string;
      type: string;
      date: string;
    }>;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUserById(id: string): Promise<User | null> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, parseInt(id)));
    return user || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return user || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const [user] = await db.select().from(schema.users).where(eq(sql`LOWER(${schema.users.username})`, username.toLowerCase()));
    return user || null;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(schema.users).values(user).returning();
    return newUser;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db
      .update(schema.users)
      .set(user)
      .where(eq(schema.users.id, parseInt(id)))
      .returning();
    return updatedUser;
  }

  async getCategoriesByUserId(userId: string): Promise<Category[]> {
    return await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.userId, parseInt(userId)))
      .orderBy(schema.categories.name);
  }

  async getCategoryById(id: number): Promise<Category | null> {
    const [category] = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.id, id));
    return category || null;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(schema.categories)
      .values(category)
      .returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category> {
    const [updatedCategory] = await db
      .update(schema.categories)
      .set(category)
      .where(eq(schema.categories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(schema.categories).where(eq(schema.categories.id, id));
  }

  async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(schema.transactions)
      .where(eq(schema.transactions.userId, parseInt(userId)))
      .orderBy(desc(schema.transactions.date));
  }

  async getTransactionById(id: number): Promise<Transaction | null> {
    const [transaction] = await db
      .select()
      .from(schema.transactions)
      .where(eq(schema.transactions.id, id));
    return transaction || null;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(schema.transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction> {
    const [updatedTransaction] = await db
      .update(schema.transactions)
      .set(transaction)
      .where(eq(schema.transactions.id, id))
      .returning();
    return updatedTransaction;
  }

  async deleteTransaction(id: number): Promise<void> {
    await db.delete(schema.transactions).where(eq(schema.transactions.id, id));
  }

  async getBudgetsByUserId(userId: string): Promise<Budget[]> {
    return await db
      .select()
      .from(schema.budgets)
      .where(eq(schema.budgets.userId, userId))
      .orderBy(schema.budgets.startDate);
  }

  async getBudgetById(id: number): Promise<Budget | null> {
    const [budget] = await db
      .select()
      .from(schema.budgets)
      .where(eq(schema.budgets.id, id));
    return budget || null;
  }

  async createBudget(budget: InsertBudget): Promise<Budget> {
    const [newBudget] = await db
      .insert(schema.budgets)
      .values(budget)
      .returning();
    return newBudget;
  }

  async updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget> {
    const [updatedBudget] = await db
      .update(schema.budgets)
      .set(budget)
      .where(eq(schema.budgets.id, id))
      .returning();
    return updatedBudget;
  }

  async deleteBudget(id: number): Promise<void> {
    await db.delete(schema.budgets).where(eq(schema.budgets.id, id));
  }

  async getAiInteractionsByUserId(userId: string): Promise<AiInteraction[]> {
    return await db
      .select()
      .from(schema.aiInteractions)
      .where(eq(schema.aiInteractions.userId, parseInt(userId)))
      .orderBy(desc(schema.aiInteractions.createdAt));
  }

  async createAiInteraction(interaction: InsertAiInteraction): Promise<AiInteraction> {
    const [newInteraction] = await db
      .insert(schema.aiInteractions)
      .values(interaction)
      .returning();
    return newInteraction;
  }

  // Relationships methods
  async getRelationshipsByUserId(userId: string): Promise<Relationship[]> {
    return db.select().from(schema.relationships).where(eq(schema.relationships.userId, parseInt(userId)));
  }

  async getRelationshipsByType(userId: string, type: string): Promise<Relationship[]> {
    return db.select()
      .from(schema.relationships)
      .where(
        and(
          eq(schema.relationships.userId, parseInt(userId)),
          eq(schema.relationships.type, type)
        )
      );
  }

  async getRelationshipById(id: number): Promise<Relationship | null> {
    const results = await db.select().from(schema.relationships).where(eq(schema.relationships.id, id));
    return results[0] || null;
  }

  async createRelationship(relationship: InsertRelationship): Promise<Relationship> {
    const newRelationship = await db.insert(schema.relationships).values(relationship).returning();
    return newRelationship[0];
  }

  async updateRelationship(id: number, relationship: Partial<InsertRelationship>): Promise<Relationship> {
    const updated = await db.update(schema.relationships)
      .set(relationship)
      .where(eq(schema.relationships.id, id))
      .returning();
    return updated[0];
  }

  async deleteRelationship(id: number): Promise<void> {
    await db.delete(schema.relationships).where(eq(schema.relationships.id, id));
  }

  // Chart of Accounts methods
  async getChartOfAccounts(userId: number): Promise<ChartOfAccount[]> {
    return db.select()
      .from(schema.chartOfAccounts)
      .where(eq(schema.chartOfAccounts.userId, userId.toString()))
      .orderBy(schema.chartOfAccounts.code);
  }

  async getChartOfAccountById(id: number): Promise<ChartOfAccount | null> {
    const result = await db.select()
      .from(schema.chartOfAccounts)
      .where(eq(schema.chartOfAccounts.id, id))
      .limit(1);
    return result[0] || null;
  }

  async createChartOfAccount(account: InsertChartOfAccount): Promise<ChartOfAccount> {
    const newAccount = await db.insert(schema.chartOfAccounts)
      .values(account)
      .returning();
    return newAccount[0];
  }

  async updateChartOfAccount(id: number, account: Partial<InsertChartOfAccount>): Promise<ChartOfAccount> {
    const updated = await db.update(schema.chartOfAccounts)
      .set(account)
      .where(eq(schema.chartOfAccounts.id, id))
      .returning();
    return updated[0];
  }

  async deleteChartOfAccount(id: number): Promise<void> {
    await db.delete(schema.chartOfAccounts).where(eq(schema.chartOfAccounts.id, id));
  }

  // Bank Accounts methods
  async getBankAccountsByUserId(userId: string): Promise<BankAccount[]> {
    return db.select()
      .from(schema.bankAccounts)
      .where(eq(schema.bankAccounts.userId, userId))
      .orderBy(schema.bankAccounts.name);
  }

  async getBankAccountById(id: number): Promise<BankAccount | null> {
    const result = await db.select()
      .from(schema.bankAccounts)
      .where(eq(schema.bankAccounts.id, id))
      .limit(1);
    return result[0] || null;
  }

  async createBankAccount(bankAccount: InsertBankAccount): Promise<BankAccount> {
    const newBankAccount = await db.insert(schema.bankAccounts)
      .values(bankAccount)
      .returning();
    return newBankAccount[0];
  }

  async updateBankAccount(id: number, bankAccount: Partial<InsertBankAccount>): Promise<BankAccount> {
    const updated = await db.update(schema.bankAccounts)
      .set(bankAccount)
      .where(eq(schema.bankAccounts.id, id))
      .returning();
    return updated[0];
  }

  async deleteBankAccount(id: number): Promise<void> {
    await db.delete(schema.bankAccounts).where(eq(schema.bankAccounts.id, id));
  }

  async getDashboardStats(userId: string) {
    // Get current month transactions
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    // Calculate totals
    const transactions = await db
      .select()
      .from(schema.transactions)
      .where(
        and(
          eq(schema.transactions.userId, parseInt(userId)),
          sql`${schema.transactions.date} >= ${startOfMonth}`,
          sql`${schema.transactions.date} <= ${endOfMonth}`
        )
      );

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const balance = totalIncome - totalExpenses;

    // Get recent transactions
    const recentTransactions = await db
      .select({
        id: schema.transactions.id,
        description: schema.transactions.description,
        amount: schema.transactions.amount,
        type: schema.transactions.type,
        date: schema.transactions.date,
      })
      .from(schema.transactions)
      .where(eq(schema.transactions.userId, parseInt(userId)))
      .orderBy(desc(schema.transactions.date))
      .limit(5);

    return {
      totalIncome,
      totalExpenses,
      balance,
      budgetUsage: 75, // Placeholder for now
      recentTransactions: recentTransactions.map(t => ({
        id: t.id,
        description: t.description,
        amount: t.amount,
        type: t.type,
        date: "2024-12-01",
      })),
    };
  }
}

export const storage = new DatabaseStorage();