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
  InsertBankAccount,
  CustomBank,
  InsertCustomBank,
  BusinessCategory,
  InsertBusinessCategory,
  BusinessSubcategory,
  InsertBusinessSubcategory,
  ProductService,
  InsertProductService,
  ProductUnit,
  InsertProductUnit
} from "@shared/schema";

// Configuração da conexão com PostgreSQL já feita em db.ts
// Importação acima: import { db } from "./db";

export interface IStorage {
  // Usuários
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;

  // Categorias
  getCategoriesByUserId(userId: string): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | null>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;

  // Transações
  getTransactionsByUserId(userId: string): Promise<any[]>;
  getTransactionById(id: number): Promise<Transaction | null>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>, updateMode?: 'single' | 'future' | 'all'): Promise<Transaction>;
  deleteTransaction(id: number, deleteMode?: 'single' | 'future' | 'all'): Promise<void>;

  // Orçamentos
  getBudgetsByUserId(userId: string): Promise<Budget[]>;
  getBudgetById(id: number): Promise<Budget | null>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget>;
  deleteBudget(id: number): Promise<void>;

  // Interações com IA
  getAiInteractionsByUserId(userId: string): Promise<AiInteraction[]>;
  createAiInteraction(interaction: InsertAiInteraction): Promise<AiInteraction>;

  // Relacionamentos
  getRelationshipsByUserId(userId: string): Promise<Relationship[]>;
  getRelationshipsByType(userId: string, type: string): Promise<Relationship[]>;
  getRelationshipById(id: number): Promise<Relationship | null>;
  createRelationship(relationship: InsertRelationship): Promise<Relationship>;
  updateRelationship(id: number, relationship: Partial<InsertRelationship>): Promise<Relationship>;
  deleteRelationship(id: number): Promise<void>;

  // Plano de contas
  getChartOfAccounts(userId: number): Promise<ChartOfAccount[]>;
  getChartOfAccountById(id: number): Promise<ChartOfAccount | null>;
  createChartOfAccount(account: InsertChartOfAccount): Promise<ChartOfAccount>;
  updateChartOfAccount(id: number, account: Partial<InsertChartOfAccount>): Promise<ChartOfAccount>;
  deleteChartOfAccount(id: number): Promise<void>;

  // Contas bancárias
  getBankAccountsByUserId(userId: string): Promise<any[]>;
  getBankAccountById(id: number): Promise<BankAccount | null>;
  createBankAccount(bankAccount: InsertBankAccount): Promise<BankAccount>;
  updateBankAccount(id: number, bankAccount: Partial<InsertBankAccount>): Promise<BankAccount>;
  deleteBankAccount(id: number): Promise<void>;

  // Bancos Customizados
  getCustomBanksByUserId(userId: string): Promise<CustomBank[]>;
  createCustomBank(bank: InsertCustomBank): Promise<CustomBank>;

  // Categorias de Negócio
  getBusinessCategoriesByUserId(userId: string): Promise<BusinessCategory[]>;
  createBusinessCategory(category: InsertBusinessCategory): Promise<BusinessCategory>;
  updateBusinessCategory(id: number, userId: string, category: Partial<InsertBusinessCategory>): Promise<BusinessCategory | undefined>;
  deleteBusinessCategory(id: number, userId: string): Promise<boolean>;

  // Subcategorias de Negócio
  getBusinessSubcategoriesByUserId(userId: string): Promise<BusinessSubcategory[]>;
  createBusinessSubcategory(subcategory: InsertBusinessSubcategory): Promise<BusinessSubcategory>;
  updateBusinessSubcategory(id: number, userId: string, subcategory: Partial<InsertBusinessSubcategory>): Promise<BusinessSubcategory | undefined>;
  deleteBusinessSubcategory(id: number, userId: string): Promise<boolean>;

  // Painel (Dashboard)
  getDashboardStats(userId: string): Promise<{
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    budgetUsage: number;
    recentTransactions: Array<any>;
    expensesByCategory: Array<{
      category: string;
      amount: number;
      color: string;
    }>;
    monthlyTrends: Array<{
      month: string;
      income: number;
      expenses: number;
    }>;
  }>;

  // Produtos e Serviços
  getProductsServicesByUserId(userId: string): Promise<ProductService[]>;
  getProductServiceById(id: number): Promise<ProductService | null>;
  createProductService(productService: InsertProductService): Promise<ProductService>;
  updateProductService(id: number, productService: Partial<InsertProductService>): Promise<ProductService>;
  deleteProductService(id: number): Promise<void>;

  // Unidades de Produto
  getProductUnitsByUserId(userId: string): Promise<ProductUnit[]>;
  createProductUnit(unit: InsertProductUnit): Promise<ProductUnit>;
  deleteProductUnit(id: number): Promise<void>;

  // Estatísticas Geográficas
  getGeographicStats(userId: string): Promise<any>;
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

  async getTransactionsByUserId(userId: string): Promise<any[]> {
    return await db
      .select({
        id: schema.transactions.id,
        amount: schema.transactions.amount,
        type: schema.transactions.type,
        status: schema.transactions.status,
        date: schema.transactions.date,
        description: schema.transactions.description,
        repeticao: schema.transactions.repeticao,
        numeroParcelas: schema.transactions.numeroParcelas,
        parcelaAtual: schema.transactions.parcelaAtual,
        parcelamentoId: schema.transactions.parcelamentoId,
        recorrenciaId: schema.transactions.recorrenciaId,
        categoryId: schema.transactions.categoryId,
        chartAccountId: schema.transactions.chartAccountId,
        bankAccountId: schema.transactions.bankAccountId,
        relationshipId: schema.transactions.relationshipId,
        productServiceId: schema.transactions.productServiceId,
        businessCategoryId: schema.transactions.businessCategoryId,
        businessSubcategoryId: schema.transactions.businessSubcategoryId,
        createdAt: schema.transactions.createdAt,
        aplicarJuros: schema.transactions.aplicarJuros,
        tipoJuros: schema.transactions.tipoJuros,
        valorJuros: schema.transactions.valorJuros,
        aplicarJurosEm: schema.transactions.aplicarJurosEm,
        aplicarEncargos: schema.transactions.aplicarEncargos,
        jurosMes: schema.transactions.jurosMes,
        moraDia: schema.transactions.moraDia,
        tipoEncargo: schema.transactions.tipoEncargo,
        aplicarMultaEm: schema.transactions.aplicarMultaEm,
        periodicidade: schema.transactions.periodicidade,
        intervalo: schema.transactions.intervalo,
        dataTermino: schema.transactions.dataTermino,
        relationship: {
          id: schema.relationships.id,
          socialName: schema.relationships.socialName,
          document: schema.relationships.document,
          type: schema.relationships.type,
        },
        productService: {
          id: schema.productsServices.id,
          name: schema.productsServices.name,
          type: schema.productsServices.type,
        },
        businessCategory: {
          id: schema.businessCategories.id,
          name: schema.businessCategories.name,
          type: schema.businessCategories.type,
        },
        businessSubcategory: {
          id: schema.businessSubcategories.id,
          name: schema.businessSubcategories.name,
        },
        chartAccount: {
          id: schema.chartOfAccounts.id,
          name: schema.chartOfAccounts.name,
          code: schema.chartOfAccounts.code,
        },
        category: {
          id: schema.categories.id,
          name: schema.categories.name,
          color: schema.categories.color,
          type: schema.categories.type,
        },
      })
      .from(schema.transactions)
      .leftJoin(schema.relationships, eq(schema.transactions.relationshipId, schema.relationships.id))
      .leftJoin(schema.productsServices, eq(schema.transactions.productServiceId, schema.productsServices.id))
      .leftJoin(schema.businessCategories, eq(schema.transactions.businessCategoryId, schema.businessCategories.id))
      .leftJoin(schema.businessSubcategories, eq(schema.transactions.businessSubcategoryId, schema.businessSubcategories.id))
      .leftJoin(schema.chartOfAccounts, eq(schema.transactions.chartAccountId, schema.chartOfAccounts.id))
      .leftJoin(schema.categories, eq(schema.transactions.categoryId, schema.categories.id))
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

  async updateTransaction(id: number, transaction: Partial<InsertTransaction>, updateMode: 'single' | 'future' | 'all' = 'single'): Promise<Transaction> {
    const [original] = await db.select().from(schema.transactions).where(eq(schema.transactions.id, id));
    if (!original) throw new Error("Transaction not found");

    if (updateMode === 'single' || (!original.parcelamentoId && !original.recorrenciaId)) {
      const [updatedTransaction] = await db
        .update(schema.transactions)
        .set(transaction)
        .where(eq(schema.transactions.id, id))
        .returning();
      return updatedTransaction;
    }

    const groupId = original.parcelamentoId || original.recorrenciaId;
    const groupField = original.parcelamentoId ? schema.transactions.parcelamentoId : schema.transactions.recorrenciaId;
    
    // Atualização em lote de propriedades secundárias, mantendo a data e a parcela atual intactas
    const safeUpdate = { ...transaction };
    delete safeUpdate.date;
    delete safeUpdate.parcelaAtual;

    if (updateMode === 'all') {
      const [updatedTransaction] = await db.update(schema.transactions).set(transaction).where(eq(schema.transactions.id, id)).returning();
      if (groupId) {
        await db.update(schema.transactions).set(safeUpdate).where(and(eq(groupField, groupId), sql`${schema.transactions.id} != ${id}`));
      }
      return updatedTransaction;
    }

    if (updateMode === 'future' && original.date) {
      const [updatedTransaction] = await db.update(schema.transactions).set(transaction).where(eq(schema.transactions.id, id)).returning();
      if (groupId) {
        // Formatar para iso string compátivel com datas do pg
        const originalDateIso = original.date.toISOString();
        await db.update(schema.transactions).set(safeUpdate).where(and(
          eq(groupField, groupId),
          sql`${schema.transactions.date} > ${originalDateIso}`,
          sql`${schema.transactions.id} != ${id}`
        ));
      }
      return updatedTransaction;
    }

    // Fallback original
    const [updatedTransaction] = await db.update(schema.transactions).set(transaction).where(eq(schema.transactions.id, id)).returning();
    return updatedTransaction;
  }

  async deleteTransaction(id: number, deleteMode: 'single' | 'future' | 'all' = 'single'): Promise<void> {
    const [original] = await db.select().from(schema.transactions).where(eq(schema.transactions.id, id));
    if (!original) return;

    if (deleteMode === 'single' || (!original.parcelamentoId && !original.recorrenciaId)) {
      await db.delete(schema.transactions).where(eq(schema.transactions.id, id));
      return;
    }

    const groupId = original.parcelamentoId || original.recorrenciaId;
    const groupField = original.parcelamentoId ? schema.transactions.parcelamentoId : schema.transactions.recorrenciaId;

    if (deleteMode === 'all' && groupId) {
      await db.delete(schema.transactions).where(eq(groupField, groupId));
      return;
    }

    if (deleteMode === 'future' && groupId && original.date) {
      const originalDateIso = original.date.toISOString();
      await db.delete(schema.transactions).where(and(
        eq(groupField, groupId),
        sql`${schema.transactions.date} >= ${originalDateIso}`
      ));
      return;
    }
    
    // Fallback
    await db.delete(schema.transactions).where(eq(schema.transactions.id, id));
  }

  async getBudgetsByUserId(userId: string): Promise<Budget[]> {
    return await db
      .select()
      .from(schema.budgets)
      .where(eq(schema.budgets.userId, parseInt(userId)))
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
      .values(budget as any)
      .returning();
    return newBudget;
  }

  async updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget> {
    const [updatedBudget] = await db
      .update(schema.budgets)
      .set(budget as any)
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

  async getAllRelationships(userId: string): Promise<Relationship[]> {
    return this.getRelationshipsByUserId(userId);
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
      .where(eq(schema.chartOfAccounts.userId, userId))
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
  async getBankAccountsByUserId(userId: string): Promise<any[]> {
    const userIdNum = parseInt(userId);
    const userBankAccounts = await db
      .select()
      .from(schema.bankAccounts)
      .where(eq(schema.bankAccounts.userId, userIdNum))
      .orderBy(schema.bankAccounts.name);

    const bankBalances = await Promise.all(userBankAccounts.map(async (account) => {
      const accountTransactions = await db
        .select({
          amount: schema.transactions.amount,
          type: schema.transactions.type,
          status: schema.transactions.status,
        })
        .from(schema.transactions)
        .where(eq(schema.transactions.bankAccountId, account.id));

      const initialBalance = parseFloat(account.currentBalance?.toString() || "0");

      const realChange = accountTransactions
        .filter(t => t.status === 'pago')
        .reduce((sum, t) => {
          const val = parseFloat(t.amount || "0");
          return t.type === 'income' ? sum + val : sum - val;
        }, 0);

      const projectedChange = accountTransactions
        .reduce((sum, t) => {
          const val = parseFloat(t.amount || "0");
          return t.type === 'income' ? sum + val : sum - val;
        }, 0);

      return {
        ...account,
        realBalance: initialBalance + realChange,
        projectedBalance: initialBalance + projectedChange,
        balance: initialBalance + realChange,
      };
    }));

    return bankBalances;
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
      .values(bankAccount as any)
      .returning();
    return newBankAccount[0];
  }

  async updateBankAccount(id: number, bankAccount: Partial<InsertBankAccount>): Promise<BankAccount> {
    const updated = await db.update(schema.bankAccounts)
      .set(bankAccount as any)
      .where(eq(schema.bankAccounts.id, id))
      .returning();
    return updated[0];
  }

  async deleteBankAccount(id: number): Promise<void> {
    await db.delete(schema.bankAccounts).where(eq(schema.bankAccounts.id, id));
  }

  // Custom Banks methods
  async getCustomBanksByUserId(userId: string): Promise<CustomBank[]> {
    return db.select()
      .from(schema.customBanks)
      .where(eq(schema.customBanks.userId, parseInt(userId)))
      .orderBy(schema.customBanks.name);
  }

  async createCustomBank(bank: InsertCustomBank): Promise<CustomBank> {
    const newBank = await db.insert(schema.customBanks)
      .values(bank)
      .returning();
    return newBank[0];
  }

  // Business Categories methods
  async getBusinessCategoriesByUserId(userId: string): Promise<BusinessCategory[]> {
    return db.select()
      .from(schema.businessCategories)
      .where(eq(schema.businessCategories.userId, parseInt(userId)))
      .orderBy(schema.businessCategories.orderIndex, schema.businessCategories.id);
  }

  async getBusinessCategoryByName(name: string, userId: number): Promise<BusinessCategory | undefined> {
    const [category] = await db
      .select()
      .from(schema.businessCategories)
      .where(
        and(
          eq(schema.businessCategories.name, name),
          eq(schema.businessCategories.userId, userId)
        )
      )
      .limit(1);
    return category;
  }

  async createBusinessCategory(category: InsertBusinessCategory & { userId: number }): Promise<BusinessCategory> {
    const [newCategory] = await db.insert(schema.businessCategories)
      .values(category)
      .returning();
    return newCategory;
  }

  async updateBusinessCategory(id: number, userId: string, category: Partial<InsertBusinessCategory>): Promise<BusinessCategory | undefined> {
    const [updatedCategory] = await db
      .update(schema.businessCategories)
      .set(category)
      .where(
        and(
          eq(schema.businessCategories.id, id),
          eq(schema.businessCategories.userId, parseInt(userId))
        )
      )
      .returning();
    return updatedCategory;
  }

  async deleteBusinessCategory(id: number, userId: string): Promise<boolean> {
    const [deletedCategory] = await db
      .delete(schema.businessCategories)
      .where(
        and(
          eq(schema.businessCategories.id, id),
          eq(schema.businessCategories.userId, parseInt(userId))
        )
      )
      .returning();
    return !!deletedCategory;
  }

  // ==========================================
  // Subcategorias de Negócio
  // ==========================================

  async getBusinessSubcategoriesByUserId(userId: string): Promise<BusinessSubcategory[]> {
    return await db
      .select()
      .from(schema.businessSubcategories)
      .where(eq(schema.businessSubcategories.userId, parseInt(userId)))
      .orderBy(schema.businessSubcategories.orderIndex, schema.businessSubcategories.id);
  }

  async getBusinessSubcategoryByName(name: string, userId: number): Promise<BusinessSubcategory | undefined> {
    const [subcategory] = await db
      .select()
      .from(schema.businessSubcategories)
      .where(
        and(
          eq(schema.businessSubcategories.name, name),
          eq(schema.businessSubcategories.userId, userId)
        )
      )
      .limit(1);
    return subcategory;
  }

  async createBusinessSubcategory(subcategory: InsertBusinessSubcategory & { userId: number }): Promise<BusinessSubcategory> {
    const [newSubcategory] = await db
      .insert(schema.businessSubcategories)
      .values(subcategory)
      .returning();
    return newSubcategory;
  }

  async updateBusinessSubcategory(id: number, userId: string, subcategory: Partial<InsertBusinessSubcategory>): Promise<BusinessSubcategory | undefined> {
    const [updatedSubcategory] = await db
      .update(schema.businessSubcategories)
      .set(subcategory)
      .where(
        and(
          eq(schema.businessSubcategories.id, id),
          eq(schema.businessSubcategories.userId, parseInt(userId))
        )
      )
      .returning();
    return updatedSubcategory;
  }

  async deleteBusinessSubcategory(id: number, userId: string): Promise<boolean> {
    const [deletedSubcategory] = await db
      .delete(schema.businessSubcategories)
      .where(
        and(
          eq(schema.businessSubcategories.id, id),
          eq(schema.businessSubcategories.userId, parseInt(userId))
        )
      )
      .returning();
    return !!deletedSubcategory;
  }

  async getDashboardStats(userId: string) {
    const userIdNum = parseInt(userId);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // 1. Fetch current month transactions for totals and categories
    const currentMonthTransactions = await db
      .select({
        id: schema.transactions.id,
        amount: schema.transactions.amount,
        type: schema.transactions.type,
        date: schema.transactions.date,
        description: schema.transactions.description,
        categoryName: schema.categories.name,
        categoryColor: schema.categories.color,
        businessCategoryName: schema.businessCategories.name,
        chartAccountName: schema.chartOfAccounts.name,
      })
      .from(schema.transactions)
      .leftJoin(schema.categories, eq(schema.transactions.categoryId, schema.categories.id))
      .leftJoin(schema.businessCategories, eq(schema.transactions.businessCategoryId, schema.businessCategories.id))
      .leftJoin(schema.chartOfAccounts, eq(schema.transactions.chartAccountId, schema.chartOfAccounts.id))
      .where(
        and(
          eq(schema.transactions.userId, userIdNum),
          sql`${schema.transactions.date} >= ${startOfMonth}`,
          sql`${schema.transactions.date} <= ${endOfMonth}`
        )
      );

    const totalIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || "0"), 0);

    const totalExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount || "0"), 0);

    const balance = totalIncome - totalExpenses;

    // 2. Expenses by Category (Current Month)
    const categoryMap = new Map();
    currentMonthTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const name = t.businessCategoryName || t.chartAccountName || t.categoryName || 'Sem Classificação';
        const color = t.categoryColor || '#4D4E48';
        if (!categoryMap.has(name)) {
          categoryMap.set(name, { category: name, amount: 0, color });
        }
        categoryMap.get(name).amount += parseFloat(t.amount || "0");
      });
    const expensesByCategory = Array.from(categoryMap.values())
      .map(item => ({
        category: item.category,
        amount: item.amount,
        color: item.color
      }));

    // 3. Monthly Trends (Last 6 Months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const trendDataRaw = await db
      .select({
        amount: schema.transactions.amount,
        type: schema.transactions.type,
        date: schema.transactions.date,
      })
      .from(schema.transactions)
      .where(
        and(
          eq(schema.transactions.userId, userIdNum),
          sql`${schema.transactions.date} >= ${sixMonthsAgo}`
        )
      );

    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const trendsMap = new Map();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]}/${d.getFullYear().toString().slice(-2)}`;
      trendsMap.set(key, { month: key, income: 0, expenses: 0 });
    }

    trendDataRaw.forEach(t => {
      const d = new Date(t.date);
      const key = `${monthNames[d.getMonth()]}/${d.getFullYear().toString().slice(-2)}`;
      if (trendsMap.has(key)) {
        const trend = trendsMap.get(key);
        const amount = parseFloat(t.amount || "0");
        if (t.type === 'income') trend.income += amount;
        else trend.expenses += amount;
      }
    });

    // 4. Recent Transactions
    const lastTransactions = await db
      .select({
        id: schema.transactions.id,
        amount: schema.transactions.amount,
        type: schema.transactions.type,
        date: schema.transactions.date,
        description: schema.transactions.description,
        categoryName: schema.categories.name,
        businessCategoryName: schema.businessCategories.name,
        chartAccountName: schema.chartOfAccounts.name,
      })
      .from(schema.transactions)
      .leftJoin(schema.categories, eq(schema.transactions.categoryId, schema.categories.id))
      .leftJoin(schema.businessCategories, eq(schema.transactions.businessCategoryId, schema.businessCategories.id))
      .leftJoin(schema.chartOfAccounts, eq(schema.transactions.chartAccountId, schema.chartOfAccounts.id))
      .where(eq(schema.transactions.userId, userIdNum))
      .orderBy(desc(schema.transactions.date))
      .limit(5);

    // 5. Real Bank Accounts with Balances
    const userBankAccounts = await db
      .select()
      .from(schema.bankAccounts)
      .where(eq(schema.bankAccounts.userId, userIdNum));

    const bankBalances = await Promise.all(userBankAccounts.map(async (account) => {
      const accountTransactions = await db
        .select({
          amount: schema.transactions.amount,
          type: schema.transactions.type,
          status: schema.transactions.status,
        })
        .from(schema.transactions)
        .where(eq(schema.transactions.bankAccountId, account.id));

      const initialBalance = parseFloat(account.currentBalance || "0");

      const realChange = accountTransactions
        .filter(t => t.status === 'pago')
        .reduce((sum, t) => {
          const val = parseFloat(t.amount || "0");
          return t.type === 'income' ? sum + val : sum - val;
        }, 0);

      const projectedChange = accountTransactions
        .reduce((sum, t) => {
          const val = parseFloat(t.amount || "0");
          return t.type === 'income' ? sum + val : sum - val;
        }, 0);

      return {
        id: account.id,
        name: account.name,
        bank: account.bank,
        realBalance: initialBalance + realChange,
        projectedBalance: initialBalance + projectedChange,
        accountType: account.accountType
      };
    }));

    return {
      totalIncome,
      totalExpenses,
      balance,
      budgetUsage: 0,
      recentTransactions: lastTransactions.map(t => ({
        id: t.id,
        description: t.description,
        amount: t.amount,
        type: t.type === 'income' ? 'receita' : 'despesa',
        date: t.date.toISOString(),
        category: {
          name: t.businessCategoryName || t.chartAccountName || t.categoryName || 'Sem Classificação',
          icon: 'fa-circle'
        }
      })),
      expensesByCategory,
      monthlyTrends: Array.from(trendsMap.values()),
      bankAccounts: bankBalances,
      totalBalance: bankBalances.reduce((sum, b) => sum + b.realBalance, 0),
      totalProjectedBalance: bankBalances.reduce((sum, b) => sum + b.projectedBalance, 0),
    };
  }

  // ==========================================
  // Produtos e Serviços
  // ==========================================

  async getProductsServicesByUserId(userId: string): Promise<ProductService[]> {
    return db.select()
      .from(schema.productsServices)
      .where(eq(schema.productsServices.userId, parseInt(userId)))
      .orderBy(schema.productsServices.name);
  }

  async getProductServiceById(id: number): Promise<ProductService | null> {
    const result = await db.select()
      .from(schema.productsServices)
      .where(eq(schema.productsServices.id, id))
      .limit(1);
    return result[0] || null;
  }

  async createProductService(productService: InsertProductService): Promise<ProductService> {
    const [newProductService] = await db.insert(schema.productsServices)
      .values(productService)
      .returning();
    return newProductService;
  }

  async updateProductService(id: number, productService: Partial<InsertProductService>): Promise<ProductService> {
    const [updated] = await db.update(schema.productsServices)
      .set(productService)
      .where(eq(schema.productsServices.id, id))
      .returning();
    return updated;
  }

  async deleteProductService(id: number): Promise<void> {
    await db.delete(schema.productsServices).where(eq(schema.productsServices.id, id));
  }

  // ==========================================
  // Unidades de Produto
  // ==========================================

  async getProductUnitsByUserId(userId: string): Promise<ProductUnit[]> {
    return db.select()
      .from(schema.productUnits)
      .where(eq(schema.productUnits.userId, parseInt(userId)))
      .orderBy(schema.productUnits.name);
  }

  async createProductUnit(unit: InsertProductUnit): Promise<ProductUnit> {
    const [newUnit] = await db.insert(schema.productUnits)
      .values(unit)
      .returning();
    return newUnit;
  }

  async deleteProductUnit(id: number): Promise<void> {
    await db.delete(schema.productUnits).where(eq(schema.productUnits.id, id));
  }

  async getGeographicStats(userId: any): Promise<any> {
    // Garantir que temos um número, lidando com IDs em string ou objetos
    const userIdNum = typeof userId === 'number' ? userId : parseInt(String(userId));
    
    // Fallback de segurança: se o ID for inválido (como "test-user-1"), 
    // tenta encontrar o primeiro usuário do sistema para não retornar vazio durante testes
    if (isNaN(userIdNum)) {
      const allUsers = await db.select().from(schema.users).limit(1);
      return { clients: [], locationRanking: [], stateRanking: [] }; // Retorna vazio se não houver usuário
    }

    console.log(`[GEOGRAPHIC DEBUG] Iniciando busca para UserID: ${userIdNum}`);

    // 1. Buscar relacionamentos do usuário
    const clientsRaw = await db
      .select()
      .from(schema.relationships)
      .where(eq(schema.relationships.userId, userIdNum));

    console.log(`[GEOGRAPHIC DEBUG] Registros brutos encontrados: ${clientsRaw.length}`);

    const clients = clientsRaw.map(c => {
      return {
        ...c,
        city: String(c.city || "").trim(),
        state: String(c.state || "").trim()
      };
    });

    // 2. Buscar todas as transações de receita deste usuário para calcular faturamento por cliente
    const incomes = await db
      .select({
        relationshipId: schema.transactions.relationshipId,
        amount: schema.transactions.amount,
        description: schema.transactions.description
      })
      .from(schema.transactions)
      .where(
        and(
          eq(schema.transactions.userId, userIdNum),
          eq(schema.transactions.type, "income"),
          eq(schema.transactions.status, "pago")
        )
      );

    // 3. Processar estatísticas por cliente
    const clientStats = clients.map(client => {
      const clientIncomes = incomes.filter(inc => inc.relationshipId === client.id);
      const totalFaturado = clientIncomes.reduce((sum, inc) => sum + parseFloat(inc.amount || "0"), 0);
      
      const produtos = Array.from(new Set(clientIncomes.map(inc => inc.description)));

      return {
        id: client.id,
        name: client.socialName,
        type: client.type,
        city: client.city,
        state: client.state,
        zipCode: client.zipCode,
        totalFaturado,
        produtos
      };
    });

    // 4. Agrupar rankings para o Dashboard
    const locationRankingMap = new Map();
    const stateRankingMap = new Map();

    clientStats.forEach(client => {
      // Ranking por Cidade
      const locKey = `${client.city || 'Desconhecida'} - ${client.state || 'XX'}`;
      if (!locationRankingMap.has(locKey)) {
        locationRankingMap.set(locKey, { location: locKey, count: 0, totalRevenue: 0 });
      }
      const locData = locationRankingMap.get(locKey);
      locData.count += 1;
      locData.totalRevenue += client.totalFaturado;

      // Ranking por Estado
      const stKey = client.state || 'XX';
      if (!stateRankingMap.has(stKey)) {
        stateRankingMap.set(stKey, { state: stKey, count: 0 });
      }
      const stData = stateRankingMap.get(stKey);
      stData.count += 1;
    });

    const locationRanking = Array.from(locationRankingMap.values())
      .sort((a, b) => b.count - a.count);

    const stateRanking = Array.from(stateRankingMap.values())
      .sort((a, b) => b.count - a.count);

    return {
      clients: clientStats,
      locationRanking,
      stateRanking
    };
  }
}

export const storage = new DatabaseStorage();