import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Landing() {
  const { isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-chart-line text-white text-2xl animate-pulse"></i>
          </div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center relative overflow-hidden">
      {/* Background Circle */}
      <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-br from-slate-400 via-slate-600 to-slate-800 rounded-full transform translate-x-48 -translate-y-48"></div>
      
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between px-8 relative z-10">
        {/* Left Panel - Login Form */}
        <div className="w-1/2 max-w-md">
          <div className="bg-white rounded-lg p-8 shadow-lg">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-12 h-12 border-2 border-slate-400 rounded-full mx-auto mb-4"></div>
              <h2 className="text-lg text-slate-600 font-normal">Acesse Sua Conta Financeira</h2>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email Address:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="abc@xyz.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-slate-500 text-sm"
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-slate-500 text-sm"
                />
              </div>

              {/* Remember me and Forgot password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-gray-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="mr-2"
                  />
                  Remember me
                </label>
                <a href="#" className="text-slate-600 hover:text-slate-800">
                  Forgot password?
                </a>
              </div>

              {/* Login Button */}
              <button
                onClick={() => window.location.href = '/api/login'}
                className="w-full bg-gradient-to-r from-slate-500 to-slate-700 text-white py-2.5 rounded text-sm font-medium hover:from-slate-600 hover:to-slate-800 transition-all duration-200"
              >
                Log in
              </button>

              {/* Divider */}
              <div className="text-center text-gray-500 text-sm my-4">
                or connect with
              </div>

              {/* Social Login */}
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={() => window.location.href = '/api/login'}
                  className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  <i className="fab fa-facebook-f text-white text-sm"></i>
                </button>
                <button 
                  onClick={() => window.location.href = '/api/login'}
                  className="w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <i className="fab fa-google text-red-500 text-sm"></i>
                </button>
              </div>

              {/* Sign up link */}
              <div className="text-center text-sm text-gray-600 mt-6">
                Não tem uma conta?{" "}
                <a href="#" className="text-slate-600 hover:text-slate-800 font-medium">
                  Cadastre-se
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Circle with Financial Content */}
        <div className="w-1/2 flex justify-end">
          <div className="w-80 h-80 bg-gradient-to-br from-slate-400 via-slate-600 to-slate-800 rounded-full flex flex-col items-center justify-center text-white p-8 relative">
            <h1 className="text-4xl font-bold mb-4 text-center">Quantor</h1>
            <p className="text-sm text-center leading-relaxed opacity-90">
              Transforme sua gestão financeira com inteligência artificial. 
              Controle suas finanças, monitore investimentos e receba 
              conselhos personalizados para alcançar seus objetivos financeiros.
            </p>
            <div className="mt-6 flex items-center space-x-3">
              <button className="bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm border border-white/30">
                Saiba Mais
              </button>
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                <i className="fas fa-play text-white text-xs"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}