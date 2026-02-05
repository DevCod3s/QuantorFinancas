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
import { Router, Request } from "express";
import type { User } from "@shared/schema";

// Estender tipos do Express para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Camada de persistência de dados
import { storage } from "./storage";

// Schemas de validação
import { insertCategorySchema, insertTransactionSchema, insertBudgetSchema, insertRelationshipSchema, insertChartOfAccountsSchema } from "@shared/schema";
import * as schema from "@shared/schema";
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
    return res.status(401).json({ error: "Não autorizado" });
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
    console.error("Erro de login:", error);
    res.status(500).json({ error: "Falhou ao inicializar login" });
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
    res.status(401).json({ error: "Não autenticado" });
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
    console.error("Erro de login:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * POST /api/auth/register
 * 
 * Cadastro de novo usuário com credenciais locais.
 * Cria usuário, criptografa senha e faz login automático.
 * 
 * Body: { username: string, email: string, name: string, password: string }
 */
router.post("/auth/register", async (req: any, res) => {
  try {
    const { username, email, name, password } = req.body;
    
    // Validação de campos obrigatórios
    if (!username || !email || !name || !password) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }
    
    // Validar comprimento mínimo de senha
    if (password.length < 6) {
      return res.status(400).json({ error: "A senha deve ter no mínimo 6 caracteres" });
    }
    
    // Verificar se username já existe
    const existingUsername = await storage.getUserByUsername(username.toLowerCase());
    if (existingUsername) {
      return res.status(400).json({ error: "Username já está em uso" });
    }
    
    // Verificar se email já existe
    const existingEmail = await storage.getUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: "Email já está cadastrado" });
    }
    
    // Criptografar senha
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Criar usuário
    const newUser = await storage.createUser({
      username: username.toLowerCase(),
      email,
      name,
      password: hashedPassword,
    });
    
    // Remover senha do objeto de resposta
    const { password: _, ...userWithoutPassword } = newUser;
    
    // Salvar usuário na sessão
    req.session.user = userWithoutPassword;
    
    res.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    res.status(500).json({ error: "Erro ao registrar usuário" });
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
    console.error("Erro do painel:", error);
    res.status(500).json({ error: "Falhou ao buscar dados do painel" });
  }
});

// Categories
router.get("/categories", requireAuth, async (req: any, res) => {
  try {
    const categories = await storage.getCategoriesByUserId(req.user.id);
    res.json(categories);
  } catch (error) {
    console.error("Erro de categorias:", error);
    res.status(500).json({ error: "Falhou ao buscar categorias" });
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
    console.error("Erro ao criar categoria:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Falhou ao criar categoria" });
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
    console.error("Erro ao atualizar categoria:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Falhou ao atualizar categoria" });
    }
  }
});

router.delete("/categories/:id", requireAuth, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteCategory(id);
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao excluir categoria:", error);
    res.status(500).json({ error: "Falhou ao excluir categoria" });
  }
});

// Transactions
router.get("/transactions", requireAuth, async (req: any, res) => {
  try {
    const transactions = await storage.getTransactionsByUserId(req.user.id);
    res.json(transactions);
  } catch (error) {
    console.error("Erro de transações:", error);
    res.status(500).json({ error: "Falhou ao buscar transações" });
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
    console.error("Erro ao criar transação:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Falhou ao criar transação" });
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
    console.error("Erro ao atualizar transação:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Falhou ao atualizar transação" });
    }
  }
});

router.delete("/transactions/:id", requireAuth, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteTransaction(id);
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao excluir transação:", error);
    res.status(500).json({ error: "Falhou ao excluir transação" });
  }
});

// Budgets
router.get("/budgets", requireAuth, async (req: any, res) => {
  try {
    const budgets = await storage.getBudgetsByUserId(req.user.id);
    res.json(budgets);
  } catch (error) {
    console.error("Budgets error:", error);
    res.status(500).json({ error: "Falhou ao buscar orçamentos" });
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
      res.status(500).json({ error: "Falhou ao criar orçamento" });
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
      res.status(500).json({ error: "Falhou ao atualizar orçamento" });
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
    res.status(500).json({ error: "Falhou ao excluir orçamento" });
  }
});

// Reports
router.get("/reports", requireAuth, async (req: any, res) => {
  try {
    // Placeholder for reports data
    res.json({ message: "Reports endpoint - to be implemented" });
  } catch (error) {
    console.error("Reports error:", error);
    res.status(500).json({ error: "Falhou ao buscar relatórios" });
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

// ==========================================
// BANK ACCOUNTS ROUTES (Mock - para desenvolvimento)
// ==========================================

/**
 * GET /api/bank-accounts
 * Retorna contas bancárias mock do usuário
 */
router.get("/bank-accounts", requireAuth, async (req, res) => {
  try {
    // Mock de contas bancárias para desenvolvimento
    const mockBankAccounts = [
      { id: 1, bank: 'Banco do Brasil', accountNumber: '12345-6', accountType: 'Corrente' },
      { id: 2, bank: 'Itaú', accountNumber: '98765-4', accountType: 'Poupança' },
      { id: 3, bank: 'Bradesco', accountNumber: '55555-1', accountType: 'Corrente' }
    ];
    
    res.json(mockBankAccounts);
  } catch (error) {
    console.error("Erro ao buscar contas bancárias:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// ==========================================
// RELATIONSHIPS ROUTES
// ==========================================

/**
 * GET /api/relationships
 * Retorna todos os relacionamentos do usuário
 */
router.get("/relationships", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id?.toString();
    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const relationships = await storage.getAllRelationships(userId);
    res.json(relationships);
  } catch (error) {
    console.error("Erro ao buscar relacionamentos:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * GET /api/relationships/:type
 * Retorna relacionamentos por tipo (cliente, fornecedor, outros)
 */
router.get("/relationships/:type", async (req, res) => {
  try {
    const userId = req.user?.id?.toString();
    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const { type } = req.params;
    const relationships = await storage.getRelationshipsByType(userId, type);
    res.json(relationships);
  } catch (error) {
    console.error("Erro ao buscar relacionamentos por tipo:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * POST /api/relationships
 * Cria um novo relacionamento
 */
router.post("/relationships", async (req, res) => {
  try {
    const userId = req.user?.id?.toString();
    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    // Validar dados de entrada
    const validatedData = insertRelationshipSchema.parse({
      ...req.body,
      userId: parseInt(userId),
    });

    const newRelationship = await storage.createRelationship(validatedData);
    res.status(201).json(newRelationship);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Dados inválidos", details: error.errors });
    }
    console.error("Erro ao criar relacionamento:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * PUT /api/relationships/:id
 * Atualiza um relacionamento existente
 */
router.put("/relationships/:id", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    console.log('=== UPDATE RELATIONSHIP DEBUG ===');
    console.log('ID:', id);
    console.log('UserID:', userId);
    console.log('Body recebido:', JSON.stringify(req.body, null, 2));

    // Verificar se o relacionamento existe e pertence ao usuário
    const existing = await storage.getRelationshipById(id);
    console.log('Relacionamento existente:', existing ? 'Encontrado' : 'Não encontrado');
    
    if (!existing || existing.userId !== parseInt(userId)) {
      return res.status(404).json({ error: "Relacionamento não encontrado" });
    }

    // Remover userId do body se existir e adicionar o userId correto
    const { userId: _, ...updateData } = req.body;
    const dataWithUserId = {
      ...updateData,
      userId: parseInt(userId)
    };

    console.log('Dados para atualização:', JSON.stringify(dataWithUserId, null, 2));

    const updatedRelationship = await storage.updateRelationship(id, dataWithUserId);
    
    console.log('Relacionamento atualizado com sucesso');
    res.json(updatedRelationship);
  } catch (error) {
    console.error("Erro ao atualizar relacionamento:", error);
    res.status(500).json({ error: "Erro interno do servidor", details: error instanceof Error ? error.message : String(error) });
  }
});

/**
 * DELETE /api/relationships/:id
 * Remove um relacionamento
 */
router.delete("/relationships/:id", async (req, res) => {
  try {
    const userId = req.user?.id?.toString();
    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    // Verificar se o relacionamento existe e pertence ao usuário
    const existing = await storage.getRelationshipById(id);
    if (!existing || existing.userId !== parseInt(userId)) {
      return res.status(404).json({ error: "Relacionamento não encontrado" });
    }

    await storage.deleteRelationship(id);
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar relacionamento:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * =============================================================================
 * ROTAS DE PLANO DE CONTAS
 * =============================================================================
 */

/**
 * GET /api/chart-accounts
 * Lista todas as contas do plano de contas do usuário
 */
router.get("/chart-accounts", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id?.toString();
    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const accounts = await storage.getChartOfAccounts(parseInt(userId));
    res.json(accounts);
  } catch (error) {
    console.error("Erro ao buscar plano de contas:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * GET /api/chart-accounts/:id
 * Obtém uma conta específica do plano de contas
 */
router.get("/chart-accounts/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id?.toString();
    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const account = await storage.getChartOfAccountById(id);
    if (!account || account.userId !== userId) {
      return res.status(404).json({ error: "Conta não encontrada" });
    }

    res.json(account);
  } catch (error) {
    console.error("Erro ao buscar conta:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * POST /api/chart-accounts
 * Cria uma nova conta no plano de contas
 */
router.post("/chart-accounts", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id?.toString();
    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    // Validar dados de entrada
    const validatedData = insertChartOfAccountsSchema.parse({
      ...req.body,
      userId: userId
    });

    const newAccount = await storage.createChartOfAccount(validatedData);
    res.status(201).json(newAccount);
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Dados inválidos", 
        details: error.errors 
      });
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * PUT /api/chart-accounts/:id
 * Atualiza uma conta existente no plano de contas
 */
router.put("/chart-accounts/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id?.toString();
    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    // Verificar se a conta existe e pertence ao usuário
    const existing = await storage.getChartOfAccountById(id);
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: "Conta não encontrada" });
    }

    // Validar dados de entrada
    const validatedData = insertChartOfAccountsSchema.parse({
      ...req.body,
      userId: userId
    });

    const updatedAccount = await storage.updateChartOfAccount(id, validatedData);
    res.json(updatedAccount);
  } catch (error) {
    console.error("Erro ao atualizar conta:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Dados inválidos", 
        details: error.errors 
      });
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * DELETE /api/chart-accounts/:id
 * Remove uma conta do plano de contas
 */
router.delete("/chart-accounts/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id?.toString();
    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    // Verificar se a conta existe e pertence ao usuário
    const existing = await storage.getChartOfAccountById(id);
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: "Conta não encontrada" });
    }

    await storage.deleteChartOfAccount(id);
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar conta:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * ROTAS PARA CONTAS BANCÁRIAS
 * Gerenciam o CRUD de contas bancárias do usuário
 */

/**
 * GET /api/bank-accounts
 * Lista todas as contas bancárias do usuário autenticado
 */
router.get("/bank-accounts", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id?.toString();
    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const bankAccounts = await storage.getBankAccountsByUserId(userId);
    res.json(bankAccounts);
  } catch (error) {
    console.error("Erro ao buscar contas bancárias:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * GET /api/bank-accounts/:id
 * Busca uma conta bancária específica por ID
 */
router.get("/bank-accounts/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id?.toString();
    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const bankAccount = await storage.getBankAccountById(id);
    if (!bankAccount || bankAccount.userId !== userId) {
      return res.status(404).json({ error: "Conta bancária não encontrada" });
    }

    res.json(bankAccount);
  } catch (error) {
    console.error("Erro ao buscar conta bancária:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * POST /api/bank-accounts
 * Cria uma nova conta bancária
 */
router.post("/bank-accounts", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id?.toString();
    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    // Validar dados usando schema Zod
    const bankAccountData = schema.insertBankAccountSchema.parse({
      ...req.body,
      userId
    });

    const newBankAccount = await storage.createBankAccount(bankAccountData);
    res.status(201).json(newBankAccount);
  } catch (error) {
    console.error("Erro ao criar conta bancária:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Dados inválidos", 
        details: error.errors 
      });
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * PUT /api/bank-accounts/:id
 * Atualiza uma conta bancária existente
 */
router.put("/bank-accounts/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id?.toString();
    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    // Verificar se a conta existe e pertence ao usuário
    const existing = await storage.getBankAccountById(id);
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: "Conta bancária não encontrada" });
    }

    const updateData = schema.insertBankAccountSchema.partial().parse(req.body);
    const updatedBankAccount = await storage.updateBankAccount(id, updateData);
    
    res.json(updatedBankAccount);
  } catch (error) {
    console.error("Erro ao atualizar conta bancária:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Dados inválidos", 
        details: error.errors 
      });
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * DELETE /api/bank-accounts/:id
 * Remove uma conta bancária
 */
router.delete("/bank-accounts/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id?.toString();
    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    // Verificar se a conta existe e pertence ao usuário
    const existing = await storage.getBankAccountById(id);
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: "Conta bancária não encontrada" });
    }

    await storage.deleteBankAccount(id);
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar conta bancária:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * PATCH /api/relationships/:id/type
 * Endpoint temporário para corrigir tipo de relacionamento
 */
router.patch("/api/relationships/:id/type", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    if (!['cliente', 'fornecedor', 'outros'].includes(type)) {
      return res.status(400).json({ error: "Tipo inválido" });
    }

    // Verificar se o relacionamento existe e pertence ao usuário
    const relationships = await storage.getAllRelationships(userId);
    const relationship = relationships.find((r: any) => r.id === parseInt(id));

    if (!relationship) {
      return res.status(404).json({ error: "Relacionamento não encontrado" });
    }

    // Atualizar tipo usando query direta
    await storage.db.update(schema.relationships)
      .set({ type })
      .where(schema.eq(schema.relationships.id, parseInt(id)));

    res.json({ success: true, message: `Tipo atualizado para ${type}` });
  } catch (error) {
    console.error("Erro ao atualizar tipo:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;