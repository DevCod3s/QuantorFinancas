/**
 * @fileoverview Rotas da API do sistema Quantor
 * 
 * Define todas as rotas HTTP para:
 * - Autenticação (Replit Auth + login local)
 * - Dashboard e métricas financeiras
 * - CRUD de categorias, transações e orçamentos
 * - Integração com assistente IA
 * 
 * Todas as rotas (exceto autenticação) exigem usuário autenticado.
 * Dados são isolados por usuário para segurança.
 * 
 * @author Equipe Quantor
 * @version 1.0.0
 */

// Importações do Express para roteamento
import { Router } from "express";

// Camada de persistência de dados
import { storage } from "./storage";

// Schemas de validação
import { insertCategorySchema, insertTransactionSchema, insertBudgetSchema } from "@shared/schema";
import { z } from "zod";

// Sistema de autenticação
import { getLoginUrl, handleCallback, logout, requireAuth as authMiddleware, loginWithCredentials } from "./auth";

// OpenAI para geração de contratos
import OpenAI from "openai";

// Criação do roteador Express
const router = Router();

/**
 * Middleware de autenticação personalizado
 * 
 * Verifica se o usuário está autenticado antes de permitir acesso às rotas.
 * Retorna erro 401 se não autenticado.
 * 
 * @param req - Request do Express com propriedade user
 * @param res - Response do Express
 * @param next - Função next do Express
 */
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

/**
 * =============================================================================
 * ROTAS DE AUTENTICAÇÃO
 * =============================================================================
 */

/**
 * GET /api/login
 * 
 * Inicia processo de login via Replit Auth.
 * Redireciona para URL de autenticação do Replit.
 */
router.get("/login", (req, res) => {
  try {
    const loginUrl = getLoginUrl();
    res.redirect(loginUrl);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to initialize login" });
  }
});

/**
 * GET /api/auth/callback
 * 
 * Callback do Replit Auth após autenticação.
 * Processado pelo middleware de autenticação.
 */
router.get("/auth/callback", handleCallback);

/**
 * GET /api/logout
 * 
 * Realiza logout do usuário e limpa sessão.
 */
router.get("/logout", logout);

/**
 * GET /api/auth/user
 * 
 * Retorna dados do usuário autenticado.
 * Utilizado pelo hook useAuth para verificar autenticação.
 */
router.get("/auth/user", (req: any, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

/**
 * POST /api/auth/login
 * 
 * Login com credenciais locais (username/password).
 * Alternativa ao Replit Auth para usuários master.
 * 
 * Body: { username: string, password: string }
 */
router.post("/auth/login", async (req: any, res) => {
  try {
    const { username, password } = req.body;
    
    // Validação de campos obrigatórios
    if (!username || !password) {
      return res.status(400).json({ error: "Username e senha são obrigatórios" });
    }
    
    // Tentativa de autenticação
    const user = await loginWithCredentials(username, password);
    
    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }
    
    // Salva usuário na sessão
    req.session.user = user;
    
    res.json({ success: true, user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * =============================================================================
 * ROTAS DE DADOS
 * =============================================================================
 */

/**
 * GET /api/dashboard
 * 
 * Retorna métricas consolidadas para o dashboard.
 * Inclui: receitas totais, despesas totais, saldo, transações recentes.
 * 
 * Requer: Usuário autenticado
 */
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

/**
 * Rota para geração de contratos com IA
 * 
 * POST /api/generate-contract
 * Gera contratos profissionais usando OpenAI GPT-4o
 * 
 * @param req.body.prompt - Prompt para geração do contrato
 * @param req.body.contractData - Dados do contrato
 * @returns JSON com contrato gerado em HTML
 */
router.post("/generate-contract", requireAuth, async (req, res) => {
  try {
    const { prompt, contractData } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt é obrigatório" });
    }

    // Inicializar cliente OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Gerar contrato usando OpenAI GPT-4o
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Modelo mais recente da OpenAI
      messages: [
        {
          role: "system",
          content: "Você é um especialista em elaboração de contratos comerciais brasileiros. Sempre retorne contratos em HTML formatado com CSS inline para impressão."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.3, // Baixa criatividade para maior precisão jurídica
    });

    const generatedContract = completion.choices[0].message.content;

    if (!generatedContract) {
      return res.status(500).json({ error: "Falha na geração do contrato" });
    }

    res.json({
      contract: generatedContract,
      success: true
    });

  } catch (error) {
    console.error("Erro na geração de contrato:", error);
    res.status(500).json({ 
      error: "Erro interno do servidor",
      success: false
    });
  }
});

export default router;