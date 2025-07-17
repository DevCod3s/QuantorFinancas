import {
  users,
  categories,
  transactions,
  budgets,
  aiInteractions,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Transaction,
  type InsertTransaction,
  type TransactionWithCategory,
  type Budget,
  type InsertBudget,
  type BudgetWithCategory,
  type AiInteraction,
  type InsertAiInteraction,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql, gte, lte, sum } from "drizzle-orm";

export interface IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Category operations
  getCategories(userId: string): Promise<Category[]>;
  getCategoryById(id: number, userId: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>, userId: string): Promise<Category | undefined>;
  deleteCategory(id: number, userId: string): Promise<boolean>;

  // Transaction operations
  getTransactions(userId: string, limit?: number, offset?: number): Promise<TransactionWithCategory[]>;
  getTransactionById(id: number, userId: string): Promise<TransactionWithCategory | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>, userId: string): Promise<Transaction | undefined>;
  deleteTransaction(id: number, userId: string): Promise<boolean>;
  getTransactionsByDateRange(userId: string, startDate: string, endDate: string): Promise<TransactionWithCategory[]>;
  getTransactionsByCategory(userId: string, categoryId: number): Promise<TransactionWithCategory[]>;

  // Budget operations
  getBudgets(userId: string): Promise<BudgetWithCategory[]>;
  getBudgetById(id: number, userId: string): Promise<BudgetWithCategory | undefined>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: number, budget: Partial<InsertBudget>, userId: string): Promise<Budget | undefined>;
  deleteBudget(id: number, userId: string): Promise<boolean>;
  getBudgetsByPeriod(userId: string, period: string): Promise<BudgetWithCategory[]>;

  // AI interaction operations
  getAiInteractions(userId: string, limit?: number): Promise<AiInteraction[]>;
  createAiInteraction(interaction: InsertAiInteraction): Promise<AiInteraction>;

  // Dashboard operations
  getDashboardData(userId: string): Promise<{
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlySavings: number;
    recentTransactions: TransactionWithCategory[];
    expensesByCategory: Array<{ category: string; amount: number; color: string }>;
    monthlyTrends: Array<{ month: string; income: number; expenses: number }>;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Category operations
  async getCategories(userId: string): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.userId, userId)).orderBy(asc(categories.name));
  }

  async getCategoryById(id: number, userId: string): Promise<Category | undefined> {
    const [category] = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>, userId: string): Promise<Category | undefined> {
    const [updatedCategory] = await db
      .update(categories)
      .set(category)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  // Transaction operations
  async getTransactions(userId: string, limit = 50, offset = 0): Promise<TransactionWithCategory[]> {
    const results = await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        type: transactions.type,
        amount: transactions.amount,
        date: transactions.date,
        categoryId: transactions.categoryId,
        description: transactions.description,
        notes: transactions.notes,
        createdAt: transactions.createdAt,
        category: categories,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date), desc(transactions.createdAt))
      .limit(limit)
      .offset(offset);
    
    return results.map(result => ({
      ...result,
      category: result.category || undefined
    }));
  }

  async getTransactionById(id: number, userId: string): Promise<TransactionWithCategory | undefined> {
    const [transaction] = await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        type: transactions.type,
        amount: transactions.amount,
        date: transactions.date,
        categoryId: transactions.categoryId,
        description: transactions.description,
        notes: transactions.notes,
        createdAt: transactions.createdAt,
        category: categories,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
    
    if (!transaction) return undefined;
    
    return {
      ...transaction,
      category: transaction.category || undefined
    };
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  async updateTransaction(id: number, transaction: Partial<InsertTransaction>, userId: string): Promise<Transaction | undefined> {
    const [updatedTransaction] = await db
      .update(transactions)
      .set(transaction)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .returning();
    return updatedTransaction;
  }

  async deleteTransaction(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  async getTransactionsByDateRange(userId: string, startDate: string, endDate: string): Promise<TransactionWithCategory[]> {
    const results = await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        type: transactions.type,
        amount: transactions.amount,
        date: transactions.date,
        categoryId: transactions.categoryId,
        description: transactions.description,
        notes: transactions.notes,
        createdAt: transactions.createdAt,
        category: categories,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      )
      .orderBy(desc(transactions.date));
      
    return results.map(result => ({
      ...result,
      category: result.category || undefined
    }));
  }

  async getTransactionsByCategory(userId: string, categoryId: number): Promise<TransactionWithCategory[]> {
    const results = await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        type: transactions.type,
        amount: transactions.amount,
        date: transactions.date,
        categoryId: transactions.categoryId,
        description: transactions.description,
        notes: transactions.notes,
        createdAt: transactions.createdAt,
        category: categories,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(eq(transactions.userId, userId), eq(transactions.categoryId, categoryId)))
      .orderBy(desc(transactions.date));
      
    return results.map(result => ({
      ...result,
      category: result.category || undefined
    }));
  }

  // Budget operations
  async getBudgets(userId: string): Promise<BudgetWithCategory[]> {
    const results = await db
      .select({
        id: budgets.id,
        userId: budgets.userId,
        categoryId: budgets.categoryId,
        budgetedAmount: budgets.budgetedAmount,
        period: budgets.period,
        startDate: budgets.startDate,
        endDate: budgets.endDate,
        createdAt: budgets.createdAt,
        category: categories,
      })
      .from(budgets)
      .leftJoin(categories, eq(budgets.categoryId, categories.id))
      .where(eq(budgets.userId, userId))
      .orderBy(desc(budgets.createdAt));
      
    return results.map(result => ({
      ...result,
      category: result.category || undefined
    }));
  }

  async getBudgetById(id: number, userId: string): Promise<BudgetWithCategory | undefined> {
    const [budget] = await db
      .select({
        id: budgets.id,
        userId: budgets.userId,
        categoryId: budgets.categoryId,
        budgetedAmount: budgets.budgetedAmount,
        period: budgets.period,
        startDate: budgets.startDate,
        endDate: budgets.endDate,
        createdAt: budgets.createdAt,
        category: categories,
      })
      .from(budgets)
      .leftJoin(categories, eq(budgets.categoryId, categories.id))
      .where(and(eq(budgets.id, id), eq(budgets.userId, userId)));
      
    if (!budget) return undefined;
    
    return {
      ...budget,
      category: budget.category || undefined
    };
  }

  async createBudget(budget: InsertBudget): Promise<Budget> {
    const [newBudget] = await db.insert(budgets).values(budget).returning();
    return newBudget;
  }

  async updateBudget(id: number, budget: Partial<InsertBudget>, userId: string): Promise<Budget | undefined> {
    const [updatedBudget] = await db
      .update(budgets)
      .set(budget)
      .where(and(eq(budgets.id, id), eq(budgets.userId, userId)))
      .returning();
    return updatedBudget;
  }

  async deleteBudget(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(budgets)
      .where(and(eq(budgets.id, id), eq(budgets.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  async getBudgetsByPeriod(userId: string, period: string): Promise<BudgetWithCategory[]> {
    const results = await db
      .select({
        id: budgets.id,
        userId: budgets.userId,
        categoryId: budgets.categoryId,
        budgetedAmount: budgets.budgetedAmount,
        period: budgets.period,
        startDate: budgets.startDate,
        endDate: budgets.endDate,
        createdAt: budgets.createdAt,
        category: categories,
      })
      .from(budgets)
      .leftJoin(categories, eq(budgets.categoryId, categories.id))
      .where(and(eq(budgets.userId, userId), eq(budgets.period, period)))
      .orderBy(desc(budgets.createdAt));
      
    return results.map(result => ({
      ...result,
      category: result.category || undefined
    }));
  }

  // AI interaction operations
  async getAiInteractions(userId: string, limit = 50): Promise<AiInteraction[]> {
    return await db
      .select()
      .from(aiInteractions)
      .where(eq(aiInteractions.userId, userId))
      .orderBy(desc(aiInteractions.createdAt))
      .limit(limit);
  }

  async createAiInteraction(interaction: InsertAiInteraction): Promise<AiInteraction> {
    const [newInteraction] = await db.insert(aiInteractions).values(interaction).returning();
    return newInteraction;
  }

  // Dashboard operations
  async getDashboardData(userId: string): Promise<{
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlySavings: number;
    recentTransactions: TransactionWithCategory[];
    expensesByCategory: Array<{ category: string; amount: number; color: string }>;
    monthlyTrends: Array<{ month: string; income: number; expenses: number }>;
  }> {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const startOfMonth = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
    const endOfMonth = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];

    // Get current month transactions
    const monthlyTransactions = await this.getTransactionsByDateRange(userId, startOfMonth, endOfMonth);

    // Calculate monthly income and expenses
    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    // Get all transactions for total balance
    const allTransactions = await this.getTransactions(userId, 1000);
    const totalBalance = allTransactions.reduce((sum, t) => {
      return sum + (t.type === 'receita' ? parseFloat(t.amount) : -parseFloat(t.amount));
    }, 0);

    // Get recent transactions
    const recentTransactions = await this.getTransactions(userId, 5);

    // Get expenses by category
    const expensesByCategory = monthlyTransactions
      .filter(t => t.type === 'despesa')
      .reduce((acc, t) => {
        const categoryName = t.category?.name || 'Outros';
        const categoryColor = t.category?.color || '#6B7280';
        const existing = acc.find(item => item.category === categoryName);
        if (existing) {
          existing.amount += parseFloat(t.amount);
        } else {
          acc.push({
            category: categoryName,
            amount: parseFloat(t.amount),
            color: categoryColor,
          });
        }
        return acc;
      }, [] as Array<{ category: string; amount: number; color: string }>);

    // Get monthly trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1 - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthStart = `${year}-${month.toString().padStart(2, '0')}-01`;
      const monthEnd = new Date(year, month, 0).toISOString().split('T')[0];

      const monthTransactions = await this.getTransactionsByDateRange(userId, monthStart, monthEnd);
      const income = monthTransactions
        .filter(t => t.type === 'receita')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const expenses = monthTransactions
        .filter(t => t.type === 'despesa')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      monthlyTrends.push({
        month: date.toLocaleDateString('pt-BR', { month: 'short' }),
        income,
        expenses,
      });
    }

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      monthlySavings: monthlyIncome - monthlyExpenses,
      recentTransactions,
      expensesByCategory,
      monthlyTrends,
    };
  }
}

export const storage = new DatabaseStorage();
