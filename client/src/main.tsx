import { createRoot } from "react-dom/client";
// import App from "./App";
import "./index.css";

// Teste simples para verificar se está carregando corretamente
const root = document.getElementById("root")!;
root.innerHTML = `
  <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f5f5f5;">
    <div style="text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <h1 style="color: #2563eb; font-size: 3rem; margin: 0; font-family: Arial, sans-serif;">QUANTOR</h1>
      <p style="color: #666; margin: 1rem 0; font-size: 1.2rem;">Sistema de Gestão Financeira</p>
      <p style="color: #888; font-size: 0.9rem;">Teste de carregamento: ${new Date().toLocaleString()}</p>
      <button 
        onclick="location.href='/api/login'" 
        style="background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 6px; font-size: 1rem; cursor: pointer; margin-top: 1rem;"
      >
        Fazer Login
      </button>
    </div>
  </div>
`;

// createRoot(document.getElementById("root")!).render(<App />);
