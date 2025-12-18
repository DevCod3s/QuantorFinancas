/**
 * @fileoverview Servidor principal do sistema Quantor
 * 
 * Configura e inicia o servidor Express com todas as dependências necessárias:
 * - Servidor HTTP com middleware de sessões PostgreSQL
 * - Integração com Vite para desenvolvimento
 * - Rotas de API com autenticação
 * - Logging de requisições
 * - Inicialização automática do sistema de auth
 * - Servir arquivos estáticos em produção
 * 
 * Funcionalidades:
 * - Express com JSON parsing
 * - Sessions store com PostgreSQL via connect-pg-simple
 * - Middleware de autenticação automático
 * - Logging detalhado de APIs com duração e resposta
 * - Setup dual: desenvolvimento (Vite) + produção (estático)
 * - Inicialização de usuários padrão
 * 
 * @author Equipe Quantor
 * @version 1.0.0
 */

// Carregar variáveis de ambiente do arquivo .env
import 'dotenv/config';

// Importações do Express e HTTP
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";

// Importações para manipulação de paths
import path from "path";
import { fileURLToPath } from "url";

// Importações para sessões e banco
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import pkg from "pg";
const { Pool } = pkg;

// Importações internas do projeto
import apiRoutes from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeAuth, addUser } from "./auth";

// Configuração de paths para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure session store
const pgSession = ConnectPgSimple(session);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(
  session({
    store: new pgSession({
      pool: pool,
      tableName: "sessions",
    }),
    secret: process.env.SESSION_SECRET || "your-secret-key-here",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  })
);

// Add user to request if available
app.use(addUser);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize authentication
  await initializeAuth();
  
  // Rota para página de login
  app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/login.html'));
  });
  
  // Configure API routes
  app.use("/api", apiRoutes);
  
  const server = createServer(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
