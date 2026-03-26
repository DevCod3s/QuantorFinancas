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
import Anthropic from '@anthropic-ai/sdk';
import crypto from "crypto";
import fs from "fs";
import path from "path";
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
import { insertCategorySchema, insertTransactionSchema, insertBudgetSchema, insertRelationshipSchema, insertChartOfAccountsSchema, insertProductServiceSchema, insertProductUnitSchema, transactions } from "@shared/schema";
import * as schema from "@shared/schema";
import { z } from "zod";
import { db } from "./db";
import { eq, and, or, ilike, desc, isNull } from "drizzle-orm";

/**
 * Parseia uma string de data para Date local (Brasília)
 * Evita que "YYYY-MM-DD" seja interpretado como UTC midnight
 */
function parseLocalDate(dateStr: string | Date): Date {
  if (dateStr instanceof Date) return dateStr;
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(dateStr + 'T12:00:00');
  }
  return new Date(dateStr);
}

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

// ==========================================
// PRODUCT UNITS ROUTES
// ==========================================
router.get("/product-units", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id?.toString();
    const units = await storage.getProductUnitsByUserId(userId);
    res.json(units);
  } catch (error: any) {
    console.error("Erro ao buscar unidades de produto:", error.message || error);
    res.status(500).json({ error: "Erro ao buscar unidades de produto" });
  }
});

router.post("/product-units", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const validatedData = schema.insertProductUnitSchema.parse({
      ...req.body,
      userId,
    });
    const unit = await storage.createProductUnit(validatedData);
    res.status(201).json(unit);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error("Erro de validação em unidade de produto:", error.errors);
      res.status(400).json({ error: "Dados inválidos", details: error.errors });
    } else {
      console.error("Erro ao criar unidade de produto:", error.message || error);
      res.status(500).json({ error: "Falhou ao criar unidade de produto" });
    }
  }
});


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

router.get("/dashboard/geographic", requireAuth, async (req: any, res) => {
  try {
    const stats = await storage.getGeographicStats(req.user.id);
    res.json(stats);
  } catch (error) {
    console.error("Erro ao buscar estatísticas geográficas:", error);
    res.status(500).json({ error: "Falhou ao buscar dados geográficos" });
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

// Payment Methods
router.get("/payment-methods", requireAuth, async (req: any, res) => {
  try {
    const methods = await storage.getPaymentMethodsByUserId(req.user.id);
    res.json(methods);
  } catch (error) {
    console.error("Erro ao buscar formas de pagamento:", error);
    res.status(500).json({ error: "Falhou ao buscar formas de pagamento" });
  }
});

router.post("/payment-methods", requireAuth, async (req: any, res) => {
  try {
    const validatedData = schema.insertPaymentMethodSchema.parse({
      ...req.body,
      userId: req.user.id,
    });
    const method = await storage.createPaymentMethod(validatedData);
    res.status(201).json(method);
  } catch (error) {
    console.error("Erro ao criar forma de pagamento:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Dados inválidos", details: error.errors });
    } else {
      res.status(500).json({ error: "Falhou ao criar forma de pagamento" });
    }
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
    const { repeticao, numeroParcelas, periodicidade, intervalo, dataTermino, aplicarJuros, tipoJuros, valorJuros, aplicarJurosEm, aplicarEncargos, jurosMes, moraDia, tipoEncargo, aplicarMultaEm, tipoRateio, installmentsList, ...rest } = req.body;

    // Se for parcelado, gerar múltiplas transações baseadas na Matriz enviada pelo Front
    if (repeticao === 'Parcelado' && numeroParcelas && parseInt(numeroParcelas) > 1) {
      const totalParcelas = parseInt(numeroParcelas);
      const parcelamentoId = crypto.randomUUID();
      const criadas: any[] = [];

      for (let i = 0; i < totalParcelas; i++) {
        let valorDestaParcela = 0;
        let dataParcela = new Date();

        if (installmentsList && installmentsList[i]) {
          valorDestaParcela = parseFloat(installmentsList[i].value);
          // O front envia date formatado como DD/MM/YYYY
          if (typeof installmentsList[i].date === 'string' && installmentsList[i].date.includes('/')) {
            const [d, m, y] = installmentsList[i].date.split('/');
            dataParcela = new Date(parseInt(y), parseInt(m) - 1, parseInt(d), 12, 0, 0); // Preserva o dia inteiro sem afetar UTC timezone no DB
          } else {
             dataParcela = parseLocalDate(installmentsList[i].date || rest.date);
          }
        } else {
          // Fallback legacy behavior
          const valorTotalFallback = parseFloat(rest.amount);
          const valorParcelaFallback = Math.round((valorTotalFallback / totalParcelas) * 100) / 100;
          const valorUltimaParcelaFallback = Math.round((valorTotalFallback - valorParcelaFallback * (totalParcelas - 1)) * 100) / 100;
          valorDestaParcela = i === totalParcelas - 1 ? valorUltimaParcelaFallback : valorParcelaFallback;
          
          dataParcela = parseLocalDate(rest.date);
          const multiplicador = parseInt(intervalo) || 1;
          const iteracaoTotal = i * multiplicador;

          if (periodicidade === 'Diário') {
            dataParcela.setDate(dataParcela.getDate() + iteracaoTotal);
          } else if (periodicidade === 'Semanal') {
            dataParcela.setDate(dataParcela.getDate() + (iteracaoTotal * 7));
          } else if (periodicidade === 'Quinzenal') {
            dataParcela.setDate(dataParcela.getDate() + (iteracaoTotal * 15));
          } else if (periodicidade === 'Mensal' || !periodicidade) {
            dataParcela.setMonth(dataParcela.getMonth() + iteracaoTotal);
          } else if (periodicidade === 'Bimestral') {
            dataParcela.setMonth(dataParcela.getMonth() + (iteracaoTotal * 2));
          } else if (periodicidade === 'Trimestral') {
            dataParcela.setMonth(dataParcela.getMonth() + (iteracaoTotal * 3));
          } else if (periodicidade === 'Semestral') {
            dataParcela.setMonth(dataParcela.getMonth() + (iteracaoTotal * 6));
          } else if (periodicidade === 'Anual') {
            dataParcela.setFullYear(dataParcela.getFullYear() + iteracaoTotal);
          }
        }

        const descricaoParcela = `${rest.description || 'Parcelamento'} (${i + 1}/${totalParcelas})`;

        const validatedData = insertTransactionSchema.parse({
          ...rest,
          userId: req.user.id,
          amount: valorDestaParcela.toString(),
          description: descricaoParcela,
          date: new Date(dataParcela),
          // Apenas a primeira parcela herda o status 'pago' e data de liquidação. As demais são sempre pendentes.
          status: i === 0 && rest.status === 'pago' ? 'pago' : 'pendente',
          liquidationDate: i === 0 && rest.status === 'pago' && rest.liquidationDate 
            ? parseLocalDate(rest.liquidationDate) 
            : undefined,
          repeticao: 'Parcelado',
          numeroParcelas: totalParcelas,
          parcelaAtual: i + 1,
          parcelamentoId,
          aplicarJuros: aplicarJuros || false,
          tipoJuros: tipoJuros || null,
          valorJuros: valorJuros ? valorJuros.toString() : null,
          aplicarJurosEm: aplicarJurosEm || null,
        });

        const transaction = await storage.createTransaction(validatedData);
        criadas.push(transaction);
      }

      return res.status(201).json({
        message: `${totalParcelas} parcelas criadas com sucesso`,
        parcelamentoId,
        parcelas: criadas,
      });
    }

    // Se for recorrente, gerar projeções (ex: próximos 24 meses ou até dataTermino)
    if (repeticao === 'Recorrente') {
      const recurrencyId = crypto.randomUUID();
      const dataBase = parseLocalDate(rest.date);
      const limitDate = dataTermino ? parseLocalDate(dataTermino) : new Date(new Date().setFullYear(new Date().getFullYear() + 2)); // 2 anos de projeção por padrão
      const period = periodicidade || 'Mensal';
      const interval = parseInt(intervalo || '1');
      const criadas: any[] = [];

      let currentDate = new Date(dataBase);
      let count = 0;
      const MAX_OCCURRENCES = 300; // Limite de segurança

      while (currentDate <= limitDate && count < MAX_OCCURRENCES) {
        const validatedData = insertTransactionSchema.parse({
          ...rest,
          userId: req.user.id,
          amount: rest.amount.toString(),
          date: new Date(currentDate),
          liquidationDate: rest.liquidationDate ? parseLocalDate(rest.liquidationDate) : undefined,
          repeticao: 'Recorrente',
          periodicidade: period,
          intervalo: interval,
          dataTermino: dataTermino ? parseLocalDate(dataTermino) : null,
          status: 'pendente',
          recorrenciaId: recurrencyId,
          aplicarEncargos: aplicarEncargos || false,
          jurosMes: jurosMes ? jurosMes.toString() : null,
          moraDia: moraDia ? moraDia.toString() : null,
          tipoEncargo: tipoEncargo || null,
          aplicarMultaEm: aplicarMultaEm || null,
        });

        const transaction = await storage.createTransaction(validatedData);
        criadas.push(transaction);

        // Incrementar a data para a próxima ocorrência
        const nextDate = new Date(currentDate);
        if (period === 'Diário') nextDate.setDate(nextDate.getDate() + interval);
        else if (period === 'Semanal') nextDate.setDate(nextDate.getDate() + (interval * 7));
        else if (period === 'Mensal') nextDate.setMonth(nextDate.getMonth() + interval);
        else if (period === 'Anual') nextDate.setFullYear(nextDate.getFullYear() + interval);
        
        currentDate = nextDate;
        count++;
      }

      return res.status(201).json({
        message: `${criadas.length} lançamentos recorrentes criados com sucesso`,
        recorrenciaId: recurrencyId,
        lancamentos: criadas,
      });
    }

    // Transação única (padrão)
    const validatedData = insertTransactionSchema.parse({
      ...req.body,
      userId: req.user.id,
      repeticao: repeticao || 'Única',
      amount: req.body.amount?.toString(),
      date: req.body.date ? parseLocalDate(req.body.date) : new Date(),
      liquidationDate: req.body.liquidationDate ? parseLocalDate(req.body.liquidationDate) : undefined,
      aplicarJuros: aplicarJuros || false,
      tipoJuros: tipoJuros || null,
      valorJuros: valorJuros ? valorJuros.toString() : null,
      aplicarJurosEm: aplicarJurosEm || null,
      aplicarEncargos: aplicarEncargos || false,
      jurosMes: jurosMes ? jurosMes.toString() : null,
      moraDia: moraDia ? moraDia.toString() : null,
      tipoEncargo: tipoEncargo || null,
      aplicarMultaEm: aplicarMultaEm || null,
    });
    const transaction = await storage.createTransaction(validatedData);
    res.status(201).json(transaction);
  } catch (error: any) {
    const errorLog = `[${new Date().toISOString()}] ERROR POST /transactions: ${error.message || error}\nStack: ${error.stack}\nBody: ${JSON.stringify(req.body, null, 2)}\n\n`;
    try {
      fs.appendFileSync("C:\\Users\\devel\\debug_logs.txt", errorLog);
    } catch (e) {
      console.error("Falhou ao escrever log em arquivo:", e);
    }
    
    console.error("DEBUG - Erro detalhado no POST /transactions:");
    console.error(error);
    if (error instanceof z.ZodError) {
      console.error("Erro de validação ao criar transação:", JSON.stringify(error.errors, null, 2));
      res.status(400).json({ error: "Dados inválidos", details: error.errors });
    } else {
      console.error("Erro ao criar transação:", error.message || error);
      res.status(500).json({ 
        error: "Falhou ao criar transação", 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
      });
    }
  }
});

router.post("/transactions/transfer", requireAuth, async (req: any, res) => {
  try {
    const { sourceAccountId, destinationAccountId, amount, date, description, liquidationDate } = req.body;
    
    // Quick validation
    if (!sourceAccountId || !destinationAccountId || !amount || !date || !description) {
      return res.status(400).json({ error: "Campos obrigatórios faltando na transferência" });
    }

    const transactions = await storage.createTransfer({
      userId: req.user.id,
      sourceAccountId: parseInt(sourceAccountId),
      destinationAccountId: parseInt(destinationAccountId),
      amount: amount.toString(),
      description,
      date: parseLocalDate(date),
      liquidationDate: liquidationDate ? parseLocalDate(liquidationDate) : null,
    });

    res.status(201).json(transactions);
  } catch (error: any) {
    console.error("Erro ao criar transferência:", error);
    res.status(500).json({ error: "Falhou ao criar transferência", message: error.message });
  }
});

router.put("/transactions/:id", requireAuth, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const updateMode = (req.query.mode as 'single' | 'future' | 'all') || 'single';
    const updateData = { ...req.body };
    if (updateData.amount !== undefined) updateData.amount = updateData.amount?.toString();
    if (updateData.date !== undefined) updateData.date = updateData.date ? parseLocalDate(updateData.date) : undefined;
    if (updateData.liquidationDate !== undefined) updateData.liquidationDate = updateData.liquidationDate ? parseLocalDate(updateData.liquidationDate) : null;
    if (updateData.valorJuros !== undefined) updateData.valorJuros = updateData.valorJuros != null ? updateData.valorJuros.toString() : null;
    if (updateData.jurosMes !== undefined) updateData.jurosMes = updateData.jurosMes != null ? updateData.jurosMes.toString() : null;
    if (updateData.moraDia !== undefined) updateData.moraDia = updateData.moraDia != null ? updateData.moraDia.toString() : null;
    
    const validatedData = insertTransactionSchema.partial().parse(updateData);
    const transaction = await storage.updateTransaction(id, validatedData, updateMode);
    res.json(transaction);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error("Erro de validação ao atualizar transação:", error.errors);
      res.status(400).json({ error: "Dados inválidos", details: error.errors });
    } else {
      console.error("Erro ao atualizar transação:", error.message || error);
      res.status(500).json({ error: "Falhou ao atualizar transação" });
    }
  }
});

router.delete("/transactions/:id", requireAuth, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleteMode = (req.query.mode as 'single' | 'future' | 'all') || 'single';
    await storage.deleteTransaction(id, deleteMode);
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao excluir transação:", error);
    res.status(500).json({ error: "Falhou ao excluir transação" });
  }
});

// ROUTE TEMPORARIA PARA MIGRAÇÃO DE TRANSFERÊNCIAS ANTIGAS
router.get("/migrate-old-transfers", async (req: any, res) => {
  try {
    // Buscar despesas que contenham 'transfer' na descricao ou categoria
    const antigasDespesas = await db.select().from(transactions).where(
      and(
        eq(transactions.type, "expense"),
        or(
          ilike(transactions.description, "%transfer%"),
          ilike(transactions.description, "%transf%")
        )
      )
    );
    
    let updatedExpenses = 0;
    for (const t of antigasDespesas) {
      await db.update(transactions).set({ type: "transfer-out" }).where(eq(transactions.id, t.id));
      updatedExpenses++;
    }

    const antigasReceitas = await db.select().from(transactions).where(
      and(
        eq(transactions.type, "income"),
        or(
          ilike(transactions.description, "%transfer%"),
          ilike(transactions.description, "%transf%")
        )
      )
    );

    let updatedIncomes = 0;
    for (const t of antigasReceitas) {
      await db.update(transactions).set({ type: "transfer-in" }).where(eq(transactions.id, t.id));
      updatedIncomes++;
    }

    res.json({ success: true, message: `Migração concluída. Despesas atualizadas: ${updatedExpenses}. Receitas atualizadas: ${updatedIncomes}.` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
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
router.get("/bank-accounts", requireAuth, async (req: any, res) => {
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

// ==========================================
// CUSTOM BANKS ROUTES
// ==========================================

/**
 * GET /api/custom-banks
 * Retorna os bancos personalizados criados pelo usuário
 */
router.get("/custom-banks", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id?.toString();
    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const customBanks = await storage.getCustomBanksByUserId(userId);
    res.json(customBanks);
  } catch (error) {
    console.error("Erro ao buscar bancos personalizados:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * POST /api/custom-banks
 * Cadastra um novo banco personalizado para o usuário
 */
router.post("/custom-banks", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id?.toString();
    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const validatedData = schema.insertCustomBankSchema.parse({
      ...req.body,
      userId: parseInt(userId),
    });

    const newBank = await storage.createCustomBank(validatedData);
    res.status(201).json(newBank);
  } catch (error) {
    console.error("Erro ao criar banco personalizado:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Dados inválidos", details: error.errors });
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// ==========================================
// BUSINESS CATEGORIES ROUTES
// ==========================================

/**
 * GET /api/business-categories
 * Retorna as categorias de negócio do usuário
 */
router.get("/business-categories", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id?.toString();
    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const categories = await storage.getBusinessCategoriesByUserId(userId);
    res.json(categories);
  } catch (error) {
    console.error("Erro ao buscar categorias de negócio:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * POST /api/business-categories
 * Cadastra uma nova categoria de negócio
 */
router.post("/business-categories", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user?.id?.toString();
    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    console.log("Recebendo payload para criar categoria:", req.body);

    // Verificação de duplicidade por nome
    const existing = await storage.getBusinessCategoryByName(req.body.name, parseInt(userId));
    if (existing) {
      return res.status(400).json({ error: "Já existe uma categoria com este nome." });
    }

    const validatedData = schema.insertBusinessCategorySchema.parse({
      ...req.body,
      userId: parseInt(userId),
    });

    const newCategory = await storage.createBusinessCategory({
      ...validatedData,
      userId: parseInt(userId)
    });
    res.status(201).json(newCategory);
  } catch (error) {
    console.error("ERRO DETALHADO ao criar categoria:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Dados inválidos", details: error.errors });
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * PUT /api/business-categories/:id
 * Atualiza uma categoria de negócio
 */
router.put("/business-categories/:id", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user?.id?.toString();
    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const categoryId = parseInt(req.params.id);
    if (isNaN(categoryId)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    // A validação permite passar um id e userId para atualização, ou faz merge seguro
    const updatedCategory = await storage.updateBusinessCategory(categoryId, userId, req.body);
    res.json(updatedCategory);
  } catch (error) {
    console.error("Erro ao atualizar categoria de negócio:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * DELETE /api/business-categories/:id
 * Exclui uma categoria de negócio
 */
router.delete("/business-categories/:id", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user?.id?.toString();
    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const categoryId = parseInt(req.params.id);
    if (isNaN(categoryId)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    await storage.deleteBusinessCategory(categoryId, userId);
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao excluir categoria de negócio:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * GET /api/business-subcategories
 * Busca subcategorias pertencentes ao usuário logado
 */
router.get("/business-subcategories", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id?.toString();
    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const subcategories = await storage.getBusinessSubcategoriesByUserId(userId);
    res.json(subcategories);
  } catch (error) {
    console.error("Erro ao buscar subcategorias de negócio:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * POST /api/business-subcategories
 * Cadastra uma nova subcategoria vinculada a uma categoria
 */
router.post("/business-subcategories", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user?.id?.toString();
    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    console.log("Recebendo payload para criar subcategoria:", req.body);

    // Verificação de duplicidade por nome
    const existing = await storage.getBusinessSubcategoryByName(req.body.name, parseInt(userId));
    if (existing) {
      return res.status(400).json({ error: "Já existe uma subcategoria com este nome." });
    }

    const validatedData = schema.insertBusinessSubcategorySchema.parse({
      ...req.body,
      userId: parseInt(userId),
    });

    const newSubcategory = await storage.createBusinessSubcategory({
      ...validatedData,
      userId: parseInt(userId)
    });
    res.status(201).json(newSubcategory);
  } catch (error) {
    console.error("ERRO DETALHADO ao criar subcategoria de negócio:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Dados inválidos", details: error.errors });
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * PUT /api/business-subcategories/:id
 * Atualiza uma subcategoria de negócio
 */
router.put("/business-subcategories/:id", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user?.id?.toString();
    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const subcategoryId = parseInt(req.params.id);
    if (isNaN(subcategoryId)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const updatedSubcategory = await storage.updateBusinessSubcategory(subcategoryId, userId, req.body);
    res.json(updatedSubcategory);
  } catch (error) {
    console.error("Erro ao atualizar subcategoria de negócio:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * DELETE /api/business-subcategories/:id
 * Exclui uma subcategoria de negócio
 */
router.delete("/business-subcategories/:id", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user?.id?.toString();
    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const subcategoryId = parseInt(req.params.id);
    if (isNaN(subcategoryId)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    await storage.deleteBusinessSubcategory(subcategoryId, userId);
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao excluir subcategoria de negócio:", error);
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
 * GET /api/relationships/check-document/:document
 * Verifica se um CPF ou CNPJ já está cadastrado
 */
router.get("/relationships/check-document/:document", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id?.toString();
    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const document = req.params.document;
    const relationship = await storage.getRelationshipByDocument(document, userId);

    if (relationship) {
      res.json({ exists: true, relationship: { id: relationship.id, name: relationship.socialName || relationship.fantasyName } });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error("Erro ao verificar documento do relacionamento:", error);
    res.status(500).json({ error: "Erro interno do servidor ao verificar documento" });
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
    if (!account || account.userId !== parseInt(userId)) {
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
      userId: parseInt(userId)
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
    if (!existing || existing.userId !== parseInt(userId)) {
      return res.status(404).json({ error: "Conta não encontrada" });
    }

    // Validar dados de entrada
    const validatedData = insertChartOfAccountsSchema.parse({
      ...req.body,
      userId: parseInt(userId)
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
    if (!existing || existing.userId !== parseInt(userId)) {
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
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const cleanCurrency = (val: any) => {
      if (typeof val === 'number') return val.toString();
      if (typeof val !== 'string') return "0";
      
      // Se já for um formato numérico puro (ex: "1000.50"), retorna como está
      if (/^-?\d+(\.\d+)?$/.test(val.trim())) {
        return val.trim();
      }

      const clean = val.replace(/[R$\s.]/g, '').replace(',', '.').trim();
      const parsed = parseFloat(clean);
      return isNaN(parsed) ? "0" : parsed.toString();
    };

    const sanitizedBody = {
      ...req.body,
      currentBalance: cleanCurrency(req.body.currentBalance),
      creditLimit: req.body.creditLimit !== undefined ? cleanCurrency(req.body.creditLimit) : null,
      userId: Number(userId)
    };

    // Validar dados usando schema Zod
    const bankAccountData = schema.insertBankAccountSchema.parse(sanitizedBody);

    const newBankAccount = await storage.createBankAccount(bankAccountData);
    res.status(201).json(newBankAccount);
  } catch (error: any) {
    // Log seguro para evitar crash do inspect em objetos complexos
    console.error("Erro ao criar conta bancária:", error?.message || error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: error.errors
      });
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.put("/bank-accounts/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
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

    const cleanCurrency = (val: any) => {
      if (typeof val === 'number') return val.toString();
      if (typeof val !== 'string') return "0";
      
      // Se já for um formato numérico puro (ex: "1000.50"), retorna como está
      if (/^-?\d+(\.\d+)?$/.test(val.trim())) {
        return val.trim();
      }

      const clean = val.replace(/[R$\s.]/g, '').replace(',', '.').trim();
      const parsed = parseFloat(clean);
      return isNaN(parsed) ? "0" : parsed.toString();
    };

    const sanitizedBody = {
      ...req.body,
      currentBalance: req.body.currentBalance !== undefined ? cleanCurrency(req.body.currentBalance) : undefined,
      creditLimit: req.body.creditLimit !== undefined ? cleanCurrency(req.body.creditLimit) : undefined,
      userId: userId
    };

    // Validar dados usando schema Zod
    const bankAccountData = schema.insertBankAccountSchema.partial().parse(sanitizedBody);

    const updatedBankAccount = await storage.updateBankAccount(id, bankAccountData);
    if (!updatedBankAccount) {
      return res.status(404).json({ error: "Conta bancária não encontrada" });
    }
    res.json(updatedBankAccount);
  } catch (error: any) {
    console.error("Erro ao atualizar conta bancária:", error?.message || error);
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
    const userId = req.user?.id;
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
  } catch (error: any) {
    console.error("Erro ao deletar conta bancária:", error?.message || error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * PATCH /api/relationships/:id/type
 * Endpoint temporário para corrigir tipo de relacionamento
 */
router.patch("/relationships/:id/type", requireAuth, async (req, res) => {
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

    // Atualizar tipo
    await storage.updateRelationship(parseInt(id), { type });

    res.json({ success: true, message: `Tipo atualizado para ${type}` });
  } catch (error) {
    console.error("Erro ao atualizar tipo:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});


// ==========================================
// PRODUCTS & SERVICES ROUTES
// ==========================================

/**
 * GET /api/products-services
 * Retorna todos os produtos e serviços do usuário
 */
router.get("/products-services", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id?.toString();
    const items = await storage.getProductsServicesByUserId(userId);
    res.json(items);
  } catch (error) {
    console.error("Erro ao buscar produtos/serviços:", error);
    res.status(500).json({ error: "Erro ao buscar produtos e serviços" });
  }
});

/**
 * POST /api/products-services
 * Cria um novo produto ou serviço
 */
router.post("/products-services", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const validatedData = schema.insertProductServiceSchema.parse({
      ...req.body,
      userId,
    });
    const item = await storage.createProductService(validatedData);
    res.status(201).json(item);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error("Erro de validação em produto/serviço:", error.errors);
      res.status(400).json({ error: "Dados inválidos", details: error.errors });
    } else {
      console.error("Erro ao criar produto/serviço:", error.message || error);
      res.status(500).json({ error: "Falhou ao criar produto/serviço" });
    }
  }
});

/**
 * PUT /api/products-services/:id
 * Atualiza um produto ou serviço existente
 */
router.put("/products-services/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = schema.insertProductServiceSchema.partial().parse(req.body);
    const item = await storage.updateProductService(id, validatedData);
    res.json(item);
  } catch (error: any) {
    console.error("Erro ao atualizar produto/serviço:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Dados inválidos", details: error.errors });
    } else {
      res.status(500).json({ error: "Falhou ao atualizar produto/serviço" });
    }
  }
});

/**
 * DELETE /api/products-services/:id
 * Remove um produto ou serviço
 */
router.delete("/products-services/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteProductService(id);
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao excluir produto/serviço:", error);
    res.status(500).json({ error: "Falhou ao excluir produto/serviço" });
  }
});

// Unidades removidas daqui e movidas para o topo das rotas de dados


router.get("/debug-server-logs", async (req, res) => {
  try {
    const logPath = "C:\\Users\\devel\\debug_logs.txt";
    if (fs.existsSync(logPath)) {
      const content = fs.readFileSync(logPath, "utf-8");
      res.send(`<h1>Logs do Servidor</h1><pre>${content}</pre>`);
    } else {
      res.send("<h1>Arquivo de log não encontrado.</h1><p>Tente realizar uma transação primeiro.</p>");
    }
  } catch (err) {
    res.status(500).send("Erro ao ler log");
  }
});

// ==========================================
// Rota da Inteligência Artificial (Plano de Contas)
// ==========================================
router.post("/ai/generate-chart-of-accounts", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { levels, classifyTransactions } = req.body || {};

    // Validar parâmetro de níveis (2-4 ou 'auto')
    const maxLevels = levels === 'auto' || !levels ? null : Math.min(Math.max(Number(levels) || 2, 2), 4);

    // 1. Coleta das transações do usuário (Contexto Proposto)
    // Limite superior de transações recentes para evitar extrapolar limite de tokens e de tempo 
    const limit = 150;
    const userTransactions = await db
      .select({
        id: schema.transactions.id,
        description: schema.transactions.description,
        type: schema.transactions.type,
        amount: schema.transactions.amount,
        date: schema.transactions.date,
      })
      .from(schema.transactions)
      .where(eq(schema.transactions.userId, userId))
      .orderBy(desc(schema.transactions.date))
      .limit(limit);

    if (!userTransactions || userTransactions.length === 0) {
      return res.status(400).json({ error: "Você precisa ter transações cadastradas para a IA montar seu perfil." });
    }

    const transactionsContext = userTransactions.map(t => ({
      id: t.id,
      description: t.description || 'Sem descrição',
      type: t.type,
      amount: t.amount,
      date: t.date ? new Date(t.date).toISOString().split('T')[0] : null
    }));

    // 2. Acionamento do Agente LLM (Especialista Contábil)
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(503).json({ 
        error: "A chave de API do Anthropic (Claude) não foi configurada. Para ativar a Inteligência Artificial, adicione ANTHROPIC_API_KEY ao arquivo .env no diretório raiz do QuantorFinancas."
      });
    }
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY?.trim() });

    // Instrução de níveis hierárquicos baseada na escolha do usuário
    const levelsInstruction = maxLevels
      ? `A estrutura DEVE ter EXATAMENTE ${maxLevels} níveis hierárquicos (de level 1 até level ${maxLevels}). Não crie contas com level maior que ${maxLevels}.`
      : `Analise a complexidade e diversidade das transações fornecidas e defina AUTOMATICAMENTE a melhor quantidade de níveis hierárquicos (entre 2 e 4). Use mais níveis se houver muita diversidade de categorias, menos se for uma empresa simples.`;

    // Instrução de mapeamento de transações baseada na opção do usuário
    const classifyInstruction = classifyTransactions
      ? `5. INCLUA um array 'transactionMappings' no JSON. Para CADA transação fornecida, mapeie para a conta mais específica do plano usando o campo 'id' da transação e o 'tempId' da conta. Formato: { "transactionId": <id>, "chartAccountTempId": "<tempId>" }. Classifique TODAS as transações.`
      : `5. Não inclua nenhum array 'transactionMappings'. Retorne SOMENTE o 'chartOfAccounts'.`;

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: classifyTransactions ? 8192 : 4096,
      system: `Você é uma Especialista em Gestão Contábil DRE de alto nível.
Seu trabalho é analisar os tipos e descrições das transações fornecidas e criar um Plano de Contas PERFEITO e EXAUSTIVO para a empresa, totalmente focado no DRE.
Você DEVE retornar APENAS um JSON puro, sem marcarções markdown, sem texto antes ou depois. Formato exigido:
{
  "chartOfAccounts": [
    { "tempId": "temp1", "code": "1", "name": "Receitas", "type": "receita", "level": 1, "description": "Receitas operacionais" },
    { "tempId": "temp1_1", "code": "1.1", "name": "Vendas de Produtos", "type": "receita", "level": 2, "parentTempId": "temp1", "description": "" },
    { "tempId": "temp2", "code": "2", "name": "Despesas", "type": "despesa", "level": 1, "description": "" },
    { "tempId": "temp2_1", "code": "2.1", "name": "Custos Operacionais", "type": "despesa", "level": 2, "parentTempId": "temp2", "description": "" }
  ]${classifyTransactions ? `,
  "transactionMappings": [
    { "transactionId": 1, "chartAccountTempId": "temp1_1" }
  ]` : ''}
}

Regras IMPORTANTES:
1. ${levelsInstruction}
2. O campo 'type' SÓ pode ser: 'receita', 'despesa', 'ativo' ou 'passivo'.
3. 'tempId' deve ser uma string única.
4. 'parentTempId' referencia o 'tempId' de uma conta-pai existente (não use em level 1).
${classifyInstruction}
6. Não invente dados. Retorne SOMENTE o JSON válido.
7. Crie subcategorias específicas baseadas nas descrições reais das transações (não genéricas).`,
      messages: [
        {
          role: "user",
          content: `As transações conhecidas da empresa são estas:\n\n${JSON.stringify(transactionsContext)}`
        }
      ]
    });

    const textBlock = response.content.find(block => block.type === 'text');
    const aiResponse = textBlock && 'text' in textBlock ? textBlock.text : null;
    
    if (!aiResponse) throw new Error("A Inteligência Artificial não retornou o formato JSON esperado.");
    
    // Limpa blocos de markdown que o modelo pode incluir (```json ... ```)
    const cleanedResponse = aiResponse
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim();
    
    const parsedData = JSON.parse(cleanedResponse);

    if (!parsedData.chartOfAccounts || !Array.isArray(parsedData.chartOfAccounts)) {
      throw new Error("Formato do Payload da IA não retornou o array chartOfAccounts.");
    }

    // 3. Persistência em Lote (Database Transaction Drizzle)
    // 3.1) Limpar mapeamentos anteriores no sistema
    await db.update(schema.transactions)
      .set({ chartAccountId: null })
      .where(eq(schema.transactions.userId, userId));
      
    // 3.2) Destruir plano de contas anterior (FK já limpo acima para evitar violações)
    await db.delete(schema.chartOfAccounts)
      .where(eq(schema.chartOfAccounts.userId, userId));

    // 3.3) Processamento de níveis (level 1 => level 2 => level 3...) para o pai nascer antes
    const sortedAccounts = [...parsedData.chartOfAccounts].sort((a: any, b: any) => a.level - b.level);
    const tempIdToRealIdMap = new Map();

    for (const acc of sortedAccounts) {
      let parentId = null;
      if (acc.parentTempId && tempIdToRealIdMap.has(acc.parentTempId)) {
        parentId = tempIdToRealIdMap.get(acc.parentTempId);
      }

      const [inserted] = await db.insert(schema.chartOfAccounts).values({
        userId: userId,
        name: acc.name,
        description: acc.description || null,
        type: acc.type,
        code: acc.code,
        parentId: parentId,
        level: acc.level,
        isActive: true
      }).returning({ id: schema.chartOfAccounts.id });

      tempIdToRealIdMap.set(acc.tempId, inserted.id);
    }

    // 3.4) Mapeamento opcional de transações (se a IA retornar transactionMappings)
    if (parsedData.transactionMappings && Array.isArray(parsedData.transactionMappings)) {
      for (const mapping of parsedData.transactionMappings) {
        const targetId = tempIdToRealIdMap.get(mapping.chartAccountTempId);
        if (targetId && mapping.transactionId) {
          await db.update(schema.transactions)
            .set({ chartAccountId: targetId })
            .where(
              and(
                eq(schema.transactions.id, mapping.transactionId),
                eq(schema.transactions.userId, userId)
              )
            );
        }
      }
    }

    res.json({ success: true, message: "A Máquina aprendeu de suas finanças e estruturou um plano DRE profissional com todas as categorias já linkadas entre si e aos lançamentos!" });
  } catch (error) {
    console.error("Erro drástico no workflow de IA (Chart of accounts):", error);
    res.status(500).json({ error: "Ops, a magia da inteligência artificial falhou ou quebrou regras lógicas. Consulte o log do terminal." });
  }
});
router.post("/ai/suggest-category", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { description, amount, type } = req.body;

    if (!description) {
      return res.status(400).json({ error: "Descrição é obrigatória para sugestão." });
    }

    // 1. Buscar Plano de Contas do usuário
    const userChart = await db
      .select()
      .from(schema.chartOfAccounts)
      .where(and(
        eq(schema.chartOfAccounts.userId, userId),
        eq(schema.chartOfAccounts.isActive, true)
      ));

    if (!userChart || userChart.length === 0) {
      return res.status(400).json({ error: "Plano de contas não encontrado. Gere um primeiro." });
    }

    // Filtra por tipo se fornecido
    const filteredChart = type 
      ? userChart.filter(acc => acc.type === type || acc.level === 1) 
      : userChart;

    // 2. Acionamento do Agente LLM
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(503).json({ error: "IA não configurada (.env)" });
    }
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY.trim() });
    
    const chartData = filteredChart.map(c => ({ id: c.id, code: c.code, name: c.name, type: c.type, level: c.level }));
    
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      system: `Você é um assistente contábil. Sua tarefa é sugerir o campo "id" (numérico) da conta mais adequada do Plano de Contas para uma transação.
IMPORTANTE: Sempre prefira contas de nível mais específico (level 2 ou 3) ao invés de categorias genéricas de nível 1.
O campo "id" é o identificador numérico do banco de dados, NÃO confunda com o campo "code" (que é texto como "2.1").
Retorne APENAS o JSON puro sem markdown: { "suggestedId": <number do campo id>, "reason": "breve explicação" }`,
      messages: [
        {
          role: "user",
          content: `Transação:
Descrição: ${description}
Valor: ${amount}
Tipo: ${type}

Plano de Contas disponível (use o campo "id" para suggestedId):
${JSON.stringify(chartData)}

Qual o "id" da conta mais adequada?`
        }
      ]
    });

    const textBlock = response.content.find(block => block.type === 'text');
    const aiResponse = textBlock && 'text' in textBlock ? textBlock.text : null;
    
    if (!aiResponse) throw new Error("Sem resposta da IA");
    
    const cleaned = aiResponse.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    const result = JSON.parse(cleaned);

    // Valida que o suggestedId é um ID real que existe no plano de contas
    const suggestedId = Number(result.suggestedId);
    const validAccount = userChart.find(c => c.id === suggestedId);
    if (!validAccount) {
      // Fallback: tenta encontrar por code caso a IA tenha confundido id com code
      const byCode = userChart.find(c => String(c.code) === String(result.suggestedId));
      if (byCode) {
        result.suggestedId = byCode.id;
      } else {
        console.warn("IA sugeriu ID inválido:", result.suggestedId, "IDs disponíveis:", userChart.map(c => c.id));
      }
    }

    res.json(result);
  } catch (error) {
    console.error("Erro na sugestão de categoria IA:", error);
    res.status(500).json({ error: "Falha na sugestão da IA" });
  }
});

// ==========================================
// Classificação em Lote de Transações via IA
// ==========================================
router.post("/ai/batch-classify-transactions", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;

    // 1. Buscar Plano de Contas do usuário
    const userChart = await db
      .select()
      .from(schema.chartOfAccounts)
      .where(and(
        eq(schema.chartOfAccounts.userId, userId),
        eq(schema.chartOfAccounts.isActive, true)
      ));

    if (!userChart || userChart.length === 0) {
      return res.status(400).json({ error: "Plano de Contas não encontrado. Gere um primeiro." });
    }

    // 2. Buscar transações sem classificação
    const unclassifiedTxs = await db
      .select({
        id: schema.transactions.id,
        description: schema.transactions.description,
        type: schema.transactions.type,
        amount: schema.transactions.amount,
        date: schema.transactions.date,
      })
      .from(schema.transactions)
      .where(and(
        eq(schema.transactions.userId, userId),
        isNull(schema.transactions.chartAccountId)
      ))
      .orderBy(desc(schema.transactions.date))
      .limit(200);

    if (!unclassifiedTxs || unclassifiedTxs.length === 0) {
      return res.json({ success: true, classified: 0, message: "Todas as transações já estão classificadas!" });
    }

    // 3. Montar contextos
    const chartData = userChart.map(c => ({ id: c.id, code: c.code, name: c.name, type: c.type, level: c.level }));
    const txsContext = unclassifiedTxs.map(t => ({
      id: t.id,
      description: t.description || 'Sem descrição',
      type: t.type,
      amount: t.amount,
      date: t.date ? new Date(t.date).toISOString().split('T')[0] : null
    }));

    // 4. Acionamento do Agente LLM
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(503).json({ error: "IA não configurada (.env)" });
    }
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY.trim() });

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 8192,
      system: `Você é um assistente contábil especialista em classificação de transações financeiras.
Sua tarefa é mapear CADA transação para a conta mais específica do Plano de Contas fornecido.
SEMPRE prefira contas de nível mais específico (level 2, 3 ou 4) ao invés de categorias genéricas de nível 1.
Transações do tipo 'income' devem ser mapeadas para contas do tipo 'receita'.
Transações do tipo 'expense' devem ser mapeadas para contas do tipo 'despesa'.
Retorne APENAS um JSON puro sem markdown: { "mappings": [ { "transactionId": <number>, "chartAccountId": <number> } ] }
Classifique TODAS as transações fornecidas. Use o campo "id" do Plano de Contas (NÃO confunda com "code").`,
      messages: [
        {
          role: "user",
          content: `Plano de Contas (use o campo "id" para chartAccountId):\n${JSON.stringify(chartData)}\n\nTransações para classificar:\n${JSON.stringify(txsContext)}`
        }
      ]
    });

    const textBlock = response.content.find(block => block.type === 'text');
    const aiResponse = textBlock && 'text' in textBlock ? textBlock.text : null;

    if (!aiResponse) throw new Error("Sem resposta da IA");

    const cleaned = aiResponse.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    const result = JSON.parse(cleaned);

    // 5. Aplicar mapeamentos
    let classified = 0;
    const validIds = new Set(userChart.map(c => c.id));

    if (result.mappings && Array.isArray(result.mappings)) {
      for (const mapping of result.mappings) {
        const chartId = Number(mapping.chartAccountId);
        const txId = Number(mapping.transactionId);

        if (validIds.has(chartId) && txId) {
          await db.update(schema.transactions)
            .set({ chartAccountId: chartId })
            .where(
              and(
                eq(schema.transactions.id, txId),
                eq(schema.transactions.userId, userId)
              )
            );
          classified++;
        }
      }
    }

    res.json({
      success: true,
      classified,
      total: unclassifiedTxs.length,
      message: `${classified} de ${unclassifiedTxs.length} transações foram classificadas com sucesso!`
    });
  } catch (error) {
    console.error("Erro na classificação em lote:", error);
    res.status(500).json({ error: "Falha na classificação em lote da IA. Verifique o log do terminal." });
  }
});

router.get("/debug-txs", async (req, res) => {
  try {
    const dbTxs = await db.query.transactions.findMany({
      orderBy: (tx, { desc }) => [desc(tx.id)],
      limit: 15
    });
    res.json(dbTxs);
  } catch(e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
