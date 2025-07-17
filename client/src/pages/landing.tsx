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
    <div className="min-h-screen bg-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex h-[500px]">
        {/* Left Panel - Gradient */}
        <div className="w-1/2 bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 flex flex-col justify-center items-center text-white relative">
          <div className="text-center space-y-6">
            <div className="space-y-3">
              <div>
                <div className="bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-medium tracking-wider border border-white/30 inline-block">
                  LOGIN
                </div>
              </div>
              <div>
                <div className="text-white/70 px-6 py-2 rounded-full text-sm font-medium tracking-wider inline-block">
                  SIGNUP
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-1/2 bg-white px-12 py-8 flex flex-col justify-center">
          <div className="max-w-xs mx-auto w-full">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-medium text-slate-600 tracking-wide mb-8">LOGIN</h1>
            </div>

            {/* Form */}
            <div className="space-y-5">
              {/* Email Field */}
              <div className="relative">
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <i className="fas fa-user text-sm"></i>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full pl-8 pr-4 py-3 border-0 border-b border-gray-300 focus:border-slate-500 outline-none bg-transparent text-gray-700 placeholder-gray-400 text-sm"
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <i className="fas fa-lock text-sm"></i>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-8 pr-4 py-3 border-0 border-b border-gray-300 focus:border-slate-500 outline-none bg-transparent text-gray-700 placeholder-gray-400 text-sm"
                />
              </div>

              {/* Forgot Password */}
              <div className="text-right pt-2">
                <a href="#" className="text-slate-500 text-xs hover:text-slate-700">
                  Forgot Password?
                </a>
              </div>

              {/* Login Button */}
              <div className="pt-4">
                <button
                  onClick={() => window.location.href = '/api/login'}
                  className="bg-slate-600 hover:bg-slate-700 text-white py-2.5 px-8 rounded-full text-sm font-medium tracking-wide transition-all duration-200 float-right"
                >
                  LOGIN
                </button>
                <div className="clear-both"></div>
              </div>

              {/* Divider */}
              <div className="text-center text-gray-400 text-xs pt-6 pb-4">
                Or Login with
              </div>

              {/* Social Login */}
              <div className="flex space-x-3">
                <button 
                  onClick={() => window.location.href = '/api/login'}
                  className="flex items-center justify-center py-2.5 px-3 border border-gray-200 rounded text-xs hover:bg-gray-50 transition-colors"
                >
                  <i className="fab fa-google text-red-500 mr-1.5 text-sm"></i>
                  <span className="text-gray-600">Google</span>
                </button>
                <button 
                  onClick={() => window.location.href = '/api/login'}
                  className="flex items-center justify-center py-2.5 px-3 border border-gray-200 rounded text-xs hover:bg-gray-50 transition-colors"
                >
                  <i className="fab fa-facebook text-blue-600 mr-1.5 text-sm"></i>
                  <span className="text-gray-600">Facebook</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}