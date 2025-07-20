/**
 * @fileoverview Página de Login do sistema Quantor
 * 
 * Interface de autenticação com design moderno de 3 cards:
 * - Card central suspenso para login/cadastro
 * - Barra progressiva lateral com ícones
 * - Sistema híbrido: Replit Auth + login local (usuário master)
 * - Navegação entre campos com tecla Enter
 * - Inputs com sombras em vez de bordas
 * - Interface em português brasileiro
 * 
 * @author Equipe Quantor
 * @version 1.0.0
 */

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CustomInput from "@/components/CustomInput";
import { ArrowRight, User, UserPlus, Info, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import quantorLogo from "@assets/Simbolo_New_1752793618491.png";

// Tipos para controle das seções ativas
type ActiveSection = 'login' | 'signup' | 'about';

export function Login() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('login');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Refs para os inputs do login
  const usernameLoginRef = useRef<HTMLInputElement>(null);
  const passwordLoginRef = useRef<HTMLInputElement>(null);

  // Refs para os inputs do cadastro
  const usernameSignupRef = useRef<HTMLInputElement>(null);
  const emailSignupRef = useRef<HTMLInputElement>(null);
  const passwordSignupRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const handleLogin = async () => {
    if (activeSection === 'login') {
      setIsLoading(true);
      setError('');
      
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Login bem-sucedido, redirecionar para dashboard
          window.location.href = "/";
        } else {
          setError(data.error || 'Erro ao fazer login');
        }
      } catch (error) {
        setError('Erro de conexão');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Para signup e about, usar o comportamento anterior
      window.location.href = "/api/login";
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Função para lidar com Enter nos inputs do login
  const handleLoginKeyPress = (e: React.KeyboardEvent, currentField: 'username' | 'password') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentField === 'username') {
        passwordLoginRef.current?.focus();
      } else if (currentField === 'password') {
        handleLogin();
      }
    }
  };

  // Função para lidar com Enter nos inputs do cadastro
  const handleSignupKeyPress = (e: React.KeyboardEvent, currentField: 'username' | 'email' | 'password' | 'confirmPassword') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      switch (currentField) {
        case 'username':
          emailSignupRef.current?.focus();
          break;
        case 'email':
          passwordSignupRef.current?.focus();
          break;
        case 'password':
          confirmPasswordRef.current?.focus();
          break;
        case 'confirmPassword':
          handleLogin(); // Submete o formulário
          break;
      }
    }
  };

  const renderRightCard = () => {
    switch (activeSection) {
      case 'login':
        return (
          <div className="w-full max-w-sm">
            <div className="mb-6">
              <h3 className="text-blue-600 font-semibold mb-2">Entrar</h3>
              <p className="text-gray-500 text-sm">na sua conta para acessar o sistema e explorar as ferramentas.</p>
            </div>
            
            <div className="space-y-4">
              <CustomInput
                ref={usernameLoginRef}
                type="text"
                id="username-login"
                label="Usuário *"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    passwordLoginRef.current?.focus();
                  }
                }}
              />
              
              <CustomInput
                ref={passwordLoginRef}
                type="password"
                id="password-login"
                label="Senha *"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleLogin();
                  }
                }}
              />
              
              {error && (
                <div className="text-red-500 text-sm text-center">
                  {error}
                </div>
              )}
              
              <div className="flex justify-center mt-6">
                <Button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50"
                >
                  <svg 
                    className="w-5 h-5 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <span className="text-gray-500 text-sm">Não tem uma conta? </span>
              <button 
                onClick={() => setActiveSection('signup')}
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                Cadastrar-se
              </button>
            </div>
          </div>
        );
        
      case 'signup':
        return (
          <div className="w-full max-w-sm">
            <div className="mb-6">
              <h3 className="text-blue-600 font-semibold mb-2">Cadastrar</h3>
              <p className="text-gray-500 text-sm">Crie sua conta para começar a usar a gestão financeira.</p>
            </div>
            
            <div className="space-y-4">
              <Input
                ref={usernameSignupRef}
                type="text"
                placeholder="Nome de usuário"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                onKeyPress={(e) => handleSignupKeyPress(e, 'username')}
                className="border-0 rounded-md shadow-md focus:shadow-lg focus:ring-0 focus:border-0 bg-white"
              />
              
              <Input
                ref={emailSignupRef}
                type="email"
                placeholder="seu.email@gmail.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onKeyPress={(e) => handleSignupKeyPress(e, 'email')}
                className="border-0 rounded-md shadow-md focus:shadow-lg focus:ring-0 focus:border-0 bg-white"
              />
              
              <Input
                ref={passwordSignupRef}
                type="password"
                placeholder="Senha"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onKeyPress={(e) => handleSignupKeyPress(e, 'password')}
                className="border-0 rounded-md shadow-md focus:shadow-lg focus:ring-0 focus:border-0 bg-white"
              />
              
              <Input
                ref={confirmPasswordRef}
                type="password"
                placeholder="Confirmar senha"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                onKeyPress={(e) => handleSignupKeyPress(e, 'confirmPassword')}
                className="border-0 rounded-md shadow-md focus:shadow-lg focus:ring-0 focus:border-0 bg-white"
              />
              
              <div className="flex justify-center mt-6">
                <Button
                  onClick={handleLogin}
                  className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <svg 
                    className="w-5 h-5 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <span className="text-gray-500 text-sm">Já tem uma conta? </span>
              <button 
                onClick={() => setActiveSection('login')}
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                Entrar
              </button>
            </div>
          </div>
        );
        
      case 'about':
        return (
          <div className="w-full max-w-sm">
            <div className="mb-6">
              <h3 className="text-blue-600 font-semibold mb-2">Sobre</h3>
              <p className="text-gray-500 text-sm">Saiba mais sobre nosso sistema de gestão financeira.</p>
            </div>
            
            <div className="space-y-4 text-sm text-gray-600">
              <p>
                O Quantor é um sistema inteligente de gestão financeira projetado para 
                simplificar o controle das suas finanças pessoais e empresariais.
              </p>
              
              <p>
                Com recursos avançados de categorização, relatórios detalhados e 
                assistente IA, você terá total controle sobre receitas, despesas e orçamentos.
              </p>
              
              <p>
                Nossa plataforma oferece insights valiosos para tomada de decisões 
                financeiras mais inteligentes e eficazes.
              </p>
            </div>
            
            <div className="mt-6 text-center">
              <button 
                onClick={() => setActiveSection('login')}
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                Começar agora
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="flex items-center relative">
        
        {/* Card esquerdo com barra progressiva */}
        <div className="w-32 h-[480px] bg-gray-50 rounded-l-3xl shadow-lg flex flex-col items-center py-8 relative">
          
          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <img src={quantorLogo} alt="Quantor" className="w-14 h-14 mb-2" />
            <span className="text-gray-700 text-sm font-bold tracking-wide">
              QUANTOR
            </span>
          </div>
          
          {/* Barra progressiva na borda absoluta esquerda do card alinhada com ícones */}
          {activeSection === 'login' && (
            <div className="absolute left-0 top-[165px] w-1 h-6 bg-gray-300 rounded-r overflow-hidden">
              <div className="w-full bg-blue-600 h-full animate-[slideUp_0.8s_ease-out] origin-bottom"></div>
            </div>
          )}
          {activeSection === 'signup' && (
            <div className="absolute left-0 top-[237px] w-1 h-6 bg-gray-300 rounded-r overflow-hidden">
              <div className="w-full bg-blue-600 h-full animate-[slideUp_0.8s_ease-out] origin-bottom"></div>
            </div>
          )}
          {activeSection === 'about' && (
            <div className="absolute left-0 top-[309px] w-1 h-6 bg-gray-300 rounded-r overflow-hidden">
              <div className="w-full bg-blue-600 h-full animate-[slideUp_0.8s_ease-out] origin-bottom"></div>
            </div>
          )}

          {/* Container dos ícones */}
          <div className="flex flex-col space-y-8 relative">
            
            <button
              onClick={() => setActiveSection('login')}
              className={`p-3 rounded-lg transition-colors ${
                activeSection === 'login' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <User className="w-6 h-6" />
            </button>
            
            <button
              onClick={() => setActiveSection('signup')}
              className={`p-3 rounded-lg transition-colors ${
                activeSection === 'signup' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <UserPlus className="w-6 h-6" />
            </button>
            
            <button
              onClick={() => setActiveSection('about')}
              className={`p-3 rounded-lg transition-colors ${
                activeSection === 'about' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Info className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Card central azul - SUSPENSO com sombreamento */}
        <div className="w-[500px] h-[520px] bg-gradient-to-br from-blue-600 to-blue-700 flex flex-col justify-center items-center text-white shadow-2xl z-10 relative -mx-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-light mb-4">Bem-vindo ao Quantor.</h1>
            <p className="text-blue-200 text-lg mb-2">Sistema inteligente de</p>
            <p className="text-blue-200 text-lg">gestão financeira</p>
          </div>
          
          {/* Ícones sociais */}
          <div className="flex space-x-6 absolute bottom-8">
            <Facebook className="w-5 h-5 text-blue-200 hover:text-white cursor-pointer transition-colors" />
            <Instagram className="w-5 h-5 text-blue-200 hover:text-white cursor-pointer transition-colors" />
            <Twitter className="w-5 h-5 text-blue-200 hover:text-white cursor-pointer transition-colors" />
            <Linkedin className="w-5 h-5 text-blue-200 hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>
        
        {/* Card direito */}
        <div className="w-96 h-[480px] bg-white rounded-r-3xl shadow-lg flex flex-col justify-center items-center p-12">
          {renderRightCard()}
        </div>
        
        {/* CSS para animação de preenchimento */}
        <style>{`
          @keyframes slideUp {
            0% { 
              transform: scaleY(0);
            }
            100% { 
              transform: scaleY(1);
            }
          }
        `}</style>
        
      </div>
    </div>
  );
}