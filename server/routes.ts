import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateFinancialAdvice } from "./openai";
import {
  insertCategorySchema,
  insertTransactionSchema,
  insertBudgetSchema,
  insertAiInteractionSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Erro ao buscar usuário" });
    }
  });

  // Dashboard route
  app.get('/api/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const dashboardData = await storage.getDashboardData(userId);
      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Erro ao buscar dados do dashboard" });
    }
  });

  // Category routes
  app.get('/api/categories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const categories = await storage.getCategories(userId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Erro ao buscar categorias" });
    }
  });

  app.post('/api/categories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const categoryData = insertCategorySchema.parse({
        ...req.body,
        userId,
      });
      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Erro ao criar categoria" });
    }
  });

  app.put('/api/categories/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const categoryId = parseInt(req.params.id);
      const categoryData = req.body;
      const category = await storage.updateCategory(categoryId, categoryData, userId);
      if (!category) {
        return res.status(404).json({ message: "Categoria não encontrada" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Erro ao atualizar categoria" });
    }
  });

  app.delete('/api/categories/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const categoryId = parseInt(req.params.id);
      const deleted = await storage.deleteCategory(categoryId, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Categoria não encontrada" });
      }
      res.json({ message: "Categoria excluída com sucesso" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Erro ao excluir categoria" });
    }
  });

  // Transaction routes
  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { limit = 50, offset = 0 } = req.query;
      const transactions = await storage.getTransactions(userId, parseInt(limit), parseInt(offset));
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Erro ao buscar transações" });
    }
  });

  app.post('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactionData = insertTransactionSchema.parse({
        ...req.body,
        userId,
      });
      const transaction = await storage.createTransaction(transactionData);
      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ message: "Erro ao criar transação" });
    }
  });

  app.put('/api/transactions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactionId = parseInt(req.params.id);
      const transactionData = req.body;
      const transaction = await storage.updateTransaction(transactionId, transactionData, userId);
      if (!transaction) {
        return res.status(404).json({ message: "Transação não encontrada" });
      }
      res.json(transaction);
    } catch (error) {
      console.error("Error updating transaction:", error);
      res.status(500).json({ message: "Erro ao atualizar transação" });
    }
  });

  app.delete('/api/transactions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactionId = parseInt(req.params.id);
      const deleted = await storage.deleteTransaction(transactionId, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Transação não encontrada" });
      }
      res.json({ message: "Transação excluída com sucesso" });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      res.status(500).json({ message: "Erro ao excluir transação" });
    }
  });

  // Budget routes
  app.get('/api/budgets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const budgets = await storage.getBudgets(userId);
      res.json(budgets);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      res.status(500).json({ message: "Erro ao buscar orçamentos" });
    }
  });

  app.post('/api/budgets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const budgetData = insertBudgetSchema.parse({
        ...req.body,
        userId,
      });
      const budget = await storage.createBudget(budgetData);
      res.json(budget);
    } catch (error) {
      console.error("Error creating budget:", error);
      res.status(500).json({ message: "Erro ao criar orçamento" });
    }
  });

  app.put('/api/budgets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const budgetId = parseInt(req.params.id);
      const budgetData = req.body;
      const budget = await storage.updateBudget(budgetId, budgetData, userId);
      if (!budget) {
        return res.status(404).json({ message: "Orçamento não encontrado" });
      }
      res.json(budget);
    } catch (error) {
      console.error("Error updating budget:", error);
      res.status(500).json({ message: "Erro ao atualizar orçamento" });
    }
  });

  app.delete('/api/budgets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const budgetId = parseInt(req.params.id);
      const deleted = await storage.deleteBudget(budgetId, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Orçamento não encontrado" });
      }
      res.json({ message: "Orçamento excluído com sucesso" });
    } catch (error) {
      console.error("Error deleting budget:", error);
      res.status(500).json({ message: "Erro ao excluir orçamento" });
    }
  });

  // AI assistant routes
  app.get('/api/ai/interactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { limit = 50 } = req.query;
      const interactions = await storage.getAiInteractions(userId, parseInt(limit));
      res.json(interactions);
    } catch (error) {
      console.error("Error fetching AI interactions:", error);
      res.status(500).json({ message: "Erro ao buscar interações da IA" });
    }
  });

  app.post('/api/ai/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ message: "Mensagem é obrigatória" });
      }

      // Get user's financial data for context
      const dashboardData = await storage.getDashboardData(userId);
      const transactions = await storage.getTransactions(userId, 100);
      const budgets = await storage.getBudgets(userId);

      // Generate AI response
      const aiResponse = await generateFinancialAdvice(message, {
        dashboardData,
        transactions,
        budgets,
      });

      // Save interaction
      const interaction = await storage.createAiInteraction({
        userId,
        message,
        response: aiResponse,
      });

      res.json({
        message: aiResponse,
        interaction,
      });
    } catch (error) {
      console.error("Error processing AI chat:", error);
      res.status(500).json({ message: "Erro ao processar chat com IA" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
