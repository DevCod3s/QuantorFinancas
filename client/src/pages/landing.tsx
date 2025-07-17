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
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex">
        {/* Left Panel - Gradient */}
        <div className="w-1/2 relative bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 flex flex-col justify-center items-center text-white">
          {/* Diagonal overlay effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-indigo-700/40 to-slate-800/50"></div>
          
          {/* Content */}
          <div className="relative z-10 text-center space-y-8">
            <div className="space-y-4">
              <button className="bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-full font-medium tracking-wide border border-white/30">
                LOGIN
              </button>
              <div>
                <button className="text-white/80 px-8 py-3 rounded-full font-medium tracking-wide">
                  SIGNUP
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-1/2 bg-white p-12 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            {/* Logo */}
            <div className="text-center mb-8">
              {/* Geometric logo similar to image */}
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <svg viewBox="0 0 64 64" className="w-full h-full">
                  <path
                    d="M16 16 L48 16 L48 48 L32 32 L16 48 Z"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M24 24 L40 24 L40 40 L32 32 L24 40 Z"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-700 tracking-wide">LOGIN</h1>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* Email Field */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <i className="fas fa-user text-sm"></i>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full pl-10 pr-4 py-3 border-b-2 border-gray-200 focus:border-slate-600 outline-none bg-transparent text-gray-700 placeholder-gray-400"
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <i className="fas fa-lock text-sm"></i>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-10 pr-4 py-3 border-b-2 border-gray-200 focus:border-slate-600 outline-none bg-transparent text-gray-700 placeholder-gray-400"
                />
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <a href="#" className="text-slate-600 text-sm hover:text-slate-800">
                  Forgot Password?
                </a>
              </div>

              {/* Login Button */}
              <button
                onClick={() => window.location.href = '/api/login'}
                className="w-full bg-slate-700 hover:bg-slate-800 text-white py-3 px-6 rounded-full font-medium tracking-wide transition-all duration-200"
              >
                LOGIN
              </button>

              {/* Divider */}
              <div className="text-center text-gray-400 text-sm my-6">
                Or Login with
              </div>

              {/* Social Login */}
              <div className="flex space-x-4">
                <button 
                  onClick={() => window.location.href = '/api/login'}
                  className="flex-1 flex items-center justify-center py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <i className="fab fa-google text-red-500 mr-2"></i>
                  <span className="text-gray-600 text-sm">Google</span>
                </button>
                <button 
                  onClick={() => window.location.href = '/api/login'}
                  className="flex-1 flex items-center justify-center py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <i className="fab fa-facebook text-blue-600 mr-2"></i>
                  <span className="text-gray-600 text-sm">Facebook</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}