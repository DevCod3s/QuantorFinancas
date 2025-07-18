import { Request, Response } from "express";
import { storage } from "./storage";
import bcrypt from "bcryptjs";

// Para desenvolvimento, vamos usar um usuário padrão
const DEFAULT_USER = {
  id: "test-user-1",
  email: "teste@exemplo.com",
  name: "Usuário Teste",
  avatar: "https://via.placeholder.com/150",
};

// Usuário mestre
const MASTER_USER = {
  email: "master@quantor.com",
  name: "Cod3s",
  username: "Cod3s",
  password: "Jr@C0d3$",
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
    
    // Verificar se o usuário mestre existe
    let masterUser = await storage.getUserByUsername(MASTER_USER.username.toLowerCase());
    if (masterUser) {
      console.log("Master user already exists");
    } else {
      console.log("Master user not found in database");
    }
    
    console.log("Auth initialized successfully with default user and master user");
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

// Função para login com username/password
export async function loginWithCredentials(username: string, password: string) {
  try {
    // Buscar usuário por username (case-insensitive)
    const user = await storage.getUserByUsername(username.toLowerCase());
    
    if (!user || !user.password) {
      return null;
    }
    
    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return null;
    }
    
    // Retornar usuário sem a senha
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
}

export function logout(req: Request, res: Response) {
  (req as any).session.destroy((err: any) => {
    if (err) {
      console.error("Session destroy error:", err);
    }
    // Limpar cookie de sessão
    res.clearCookie('connect.sid');
    res.redirect("/");
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
  try {
    const user = getUser(req);
    if (user) {
      (req as any).user = user;
    }
    next();
  } catch (error) {
    console.error("Error in addUser middleware:", error);
    next();
  }
}