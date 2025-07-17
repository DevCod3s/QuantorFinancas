import { Router } from "express";
import { storage } from "./storage";
import { insertCategorySchema, insertTransactionSchema, insertBudgetSchema } from "@shared/schema";
import { z } from "zod";
import { getLoginUrl, handleCallback, logout, requireAuth as authMiddleware } from "./auth";

const router = Router();

// Authentication middleware
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

// Auth routes
router.get("/login", (req, res) => {
  try {
    const loginUrl = getLoginUrl();
    res.redirect(loginUrl);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to initialize login" });
  }
});

router.get("/auth/callback", handleCallback);

router.get("/logout", logout);

router.get("/auth/user", (req: any, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

// Dashboard
router.get("/dashboard", requireAuth, async (req: any, res) => {
  try {
    const stats = await storage.getDashboardStats(req.user.id);
    res.json(stats);
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

// Categories
router.get("/categories", requireAuth, async (req: any, res) => {
  try {
    const categories = await storage.getCategoriesByUserId(req.user.id);
    res.json(categories);
  } catch (error) {
    console.error("Categories error:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

router.post("/categories", requireAuth, async (req: any, res) => {
  try {
    const validatedData = insertCategorySchema.parse({
      ...req.body,
      userId: req.user.id,
    });
    const category = await storage.createCategory(validatedData);
    res.status(201).json(category);
  } catch (error) {
    console.error("Create category error:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Failed to create category" });
    }
  }
});

router.put("/categories/:id", requireAuth, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertCategorySchema.partial().parse(req.body);
    const category = await storage.updateCategory(id, validatedData);
    res.json(category);
  } catch (error) {
    console.error("Update category error:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Failed to update category" });
    }
  }
});

router.delete("/categories/:id", requireAuth, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteCategory(id);
    res.status(204).send();
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ error: "Failed to delete category" });
  }
});

// Transactions
router.get("/transactions", requireAuth, async (req: any, res) => {
  try {
    const transactions = await storage.getTransactionsByUserId(req.user.id);
    res.json(transactions);
  } catch (error) {
    console.error("Transactions error:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

router.post("/transactions", requireAuth, async (req: any, res) => {
  try {
    const validatedData = insertTransactionSchema.parse({
      ...req.body,
      userId: req.user.id,
    });
    const transaction = await storage.createTransaction(validatedData);
    res.status(201).json(transaction);
  } catch (error) {
    console.error("Create transaction error:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Failed to create transaction" });
    }
  }
});

router.put("/transactions/:id", requireAuth, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertTransactionSchema.partial().parse(req.body);
    const transaction = await storage.updateTransaction(id, validatedData);
    res.json(transaction);
  } catch (error) {
    console.error("Update transaction error:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Failed to update transaction" });
    }
  }
});

router.delete("/transactions/:id", requireAuth, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteTransaction(id);
    res.status(204).send();
  } catch (error) {
    console.error("Delete transaction error:", error);
    res.status(500).json({ error: "Failed to delete transaction" });
  }
});

// Budgets
router.get("/budgets", requireAuth, async (req: any, res) => {
  try {
    const budgets = await storage.getBudgetsByUserId(req.user.id);
    res.json(budgets);
  } catch (error) {
    console.error("Budgets error:", error);
    res.status(500).json({ error: "Failed to fetch budgets" });
  }
});

router.post("/budgets", requireAuth, async (req: any, res) => {
  try {
    const validatedData = insertBudgetSchema.parse({
      ...req.body,
      userId: req.user.id,
    });
    const budget = await storage.createBudget(validatedData);
    res.status(201).json(budget);
  } catch (error) {
    console.error("Create budget error:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Failed to create budget" });
    }
  }
});

router.put("/budgets/:id", requireAuth, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertBudgetSchema.partial().parse(req.body);
    const budget = await storage.updateBudget(id, validatedData);
    res.json(budget);
  } catch (error) {
    console.error("Update budget error:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Failed to update budget" });
    }
  }
});

router.delete("/budgets/:id", requireAuth, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteBudget(id);
    res.status(204).send();
  } catch (error) {
    console.error("Delete budget error:", error);
    res.status(500).json({ error: "Failed to delete budget" });
  }
});

// Reports
router.get("/reports", requireAuth, async (req: any, res) => {
  try {
    // Placeholder for reports data
    res.json({ message: "Reports endpoint - to be implemented" });
  } catch (error) {
    console.error("Reports error:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

export default router;