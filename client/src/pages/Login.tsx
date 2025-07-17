import { Button } from "@/components/ui/button";

export function Login() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Quantor</h1>
          <p className="text-gray-600 mb-8">Gestão Financeira Inteligente</p>
          
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Fazer Login</h2>
            
            <div className="space-y-4">
              <div className="text-gray-600 text-sm">
                Para acessar o sistema, clique no botão abaixo:
              </div>
              
              <Button 
                onClick={handleLogin}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Entrar no Sistema
              </Button>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Sistema de desenvolvimento - Usuário padrão será carregado
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}