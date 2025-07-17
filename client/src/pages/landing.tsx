import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Landing() {
  const { isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row min-h-[600px]">
          {/* Left Panel - Gradient Background */}
          <div className="flex-1 relative overflow-hidden md:min-h-[600px] min-h-[200px]">
            {/* Financial gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 via-indigo-800/30 to-slate-600/40"></div>
              {/* Geometric pattern overlay */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 left-20 w-32 h-32 border border-white/20 rounded-lg rotate-12"></div>
                <div className="absolute bottom-32 left-16 w-24 h-24 border border-white/15 rounded-full"></div>
                <div className="absolute top-1/2 left-1/3 w-16 h-16 border border-white/10 rounded-lg -rotate-12"></div>
              </div>
            </div>
            
            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-center items-center text-white p-12">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto">
                  <i className="fas fa-chart-line text-white text-2xl"></i>
                </div>
                <h1 className="text-4xl font-bold tracking-wide">QUANTOR</h1>
                <p className="text-xl text-white/80 max-w-xs">
                  Gestão Financeira Inteligente com IA
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel - Login Form */}
          <div className="flex-1 bg-white dark:bg-slate-800 p-6 md:p-12 flex flex-col justify-center">
            <div className="w-full max-w-sm mx-auto space-y-8">
              {/* Logo and Title */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-chart-line text-white text-2xl"></i>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">LOGIN</h2>
              </div>

              {/* Login Form */}
              <div className="space-y-6">
                <div className="floating-input">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=" "
                    className="peer"
                  />
                  <label htmlFor="email">
                    <i className="fas fa-envelope mr-2 text-slate-500"></i>
                    Email
                  </label>
                </div>

                <div className="floating-input">
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=" "
                    className="peer"
                  />
                  <label htmlFor="password">
                    <i className="fas fa-lock mr-2 text-slate-500"></i>
                    Password
                  </label>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="remember"
                      className="rounded border-slate-300 text-slate-600 focus:ring-slate-500"
                    />
                    <label htmlFor="remember" className="ml-2 text-sm text-slate-600 dark:text-slate-300">
                      Lembrar
                    </label>
                  </div>
                  <a href="#" className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white">
                    Esqueci Password?
                  </a>
                </div>

                <button
                  onClick={() => window.location.href = '/api/login'}
                  className="w-full bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg"
                >
                  LOGIN
                </button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-slate-800 text-slate-500">Or Login with</span>
                </div>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => window.location.href = '/api/login'}
                  className="flex items-center justify-center px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <i className="fab fa-google mr-2 text-red-500"></i>
                  Google
                </button>
                <button 
                  onClick={() => window.location.href = '/api/login'}
                  className="flex items-center justify-center px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <i className="fab fa-facebook mr-2 text-blue-600"></i>
                  Facebook
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}