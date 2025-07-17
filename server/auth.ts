import { Request, Response } from "express";
import { storage } from "./storage";

// Para desenvolvimento, vamos usar um usuário padrão
const DEFAULT_USER = {
  id: "test-user-1",
  email: "teste@exemplo.com",
  name: "Usuário Teste",
  avatar: "https://via.placeholder.com/150",
};

export async function initializeAuth() {
  try {
    // Verificar se o usuário padrão existe, se não, criar
    let user = await storage.getUserByEmail(DEFAULT_USER.email);
    if (!user) {
      user = await storage.createUser({
        email: DEFAULT_USER.email,
        name: DEFAULT_USER.name,
        avatar: DEFAULT_USER.avatar,
      });
    }
    console.log("Auth initialized successfully with default user");
  } catch (error) {
    console.error("Failed to initialize auth:", error);
  }
}

export function getLoginUrl() {
  // Para desenvolvimento, retornar URL de callback direto
  return "/api/auth/callback";
}

export async function handleCallback(req: Request, res: Response) {
  try {
    // Buscar usuário padrão no banco
    const user = await storage.getUserByEmail(DEFAULT_USER.email);
    
    if (!user) {
      throw new Error("Default user not found");
    }

    // Salvar usuário na sessão
    (req as any).session.user = user;
    
    res.redirect("/");
  } catch (error) {
    console.error("Auth callback error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}

export function logout(req: Request, res: Response) {
  (req as any).session.destroy((err: any) => {
    if (err) {
      console.error("Session destroy error:", err);
    }
    // Limpar cookie de sessão
    res.clearCookie('connect.sid');
    res.redirect("/login");
  });
}

export function getUser(req: Request) {
  return (req as any).session?.user || null;
}

// Middleware para verificar autenticação
export function requireAuth(req: Request, res: Response, next: any) {
  const user = getUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  (req as any).user = user;
  next();
}

// Middleware para adicionar usuário ao request se disponível
export function addUser(req: Request, res: Response, next: any) {
  const user = getUser(req);
  if (user) {
    (req as any).user = user;
  }
  next();
}