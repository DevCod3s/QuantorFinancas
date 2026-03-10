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

import logoOfficial from "@/assets/images/logo.svg";

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
        console.error('Erro de login:', error);
        setError('Erro de conexão com o servidor. Verifique se o servidor está rodando.');
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
              <h3 className="font-semibold mb-2" style={{ color: '#B59363' }}>Entrar</h3>
              <p className="text-sm" style={{ color: '#4D4E48' }}>na sua conta para acessar o sistema e explorar as ferramentas.</p>
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
                  className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50"
                  style={{ backgroundColor: '#B59363' }}
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
              <span className="text-sm" style={{ color: '#4D4E48' }}>Não tem uma conta? </span>
              <button
                onClick={() => setActiveSection('signup')}
                className="text-sm font-medium hover:underline"
                style={{ color: '#B59363' }}
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
              <h3 className="font-semibold mb-2" style={{ color: '#B59363' }}>Cadastrar</h3>
              <p className="text-sm" style={{ color: '#4D4E48' }}>Crie sua conta para começar a usar a gestão financeira.</p>
            </div>

            <div className="space-y-4">
              <CustomInput
                ref={usernameSignupRef}
                type="text"
                id="username-signup"
                label="Nome de usuário *"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    emailSignupRef.current?.focus();
                  }
                }}
              />

              <CustomInput
                ref={emailSignupRef}
                type="email"
                id="email-signup"
                label="E-mail *"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    passwordSignupRef.current?.focus();
                  }
                }}
              />

              <CustomInput
                ref={passwordSignupRef}
                type="password"
                id="password-signup"
                label="Senha *"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    confirmPasswordRef.current?.focus();
                  }
                }}
              />

              <CustomInput
                ref={confirmPasswordRef}
                type="password"
                id="confirm-password-signup"
                label="Confirmar senha *"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleLogin();
                  }
                }}
              />

              <div className="flex justify-center mt-6">
                <Button
                  onClick={handleLogin}
                  className="gap-2 whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-primary-foreground px-4 py-2 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 pt-[4px] pb-[4px] mt-[6px] mb-[6px]"
                  style={{ backgroundColor: '#B59363' }}
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
              <span className="text-sm" style={{ color: '#4D4E48' }}>Já tem uma conta? </span>
              <button
                onClick={() => setActiveSection('login')}
                className="text-sm font-medium hover:underline"
                style={{ color: '#B59363' }}
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
              <h3 className="font-semibold mb-2" style={{ color: '#B59363' }}>Sobre</h3>
              <p className="text-sm" style={{ color: '#4D4E48' }}>Saiba mais sobre nosso sistema de gestão financeira.</p>
            </div>

            <div className="space-y-4 text-sm" style={{ color: '#4D4E48' }}>
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
                className="text-sm font-medium hover:underline"
                style={{ color: '#B59363' }}
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
          <div className="flex flex-col items-center mb-12">
            <img src={logoOfficial} alt="Quantor" className="w-24 h-auto" />
          </div>

          {/* Barra progressiva na borda absoluta esquerda do card alinhada com ícones */}
          {activeSection === 'login' && (
            <div className="absolute left-0 top-[165px] w-1 h-6 bg-gray-300 rounded-r overflow-hidden">
              <div className="w-full h-full animate-[slideUp_0.8s_ease-out] origin-bottom" style={{ backgroundColor: '#B59363' }}></div>
            </div>
          )}
          {activeSection === 'signup' && (
            <div className="absolute left-0 top-[237px] w-1 h-6 bg-gray-300 rounded-r overflow-hidden">
              <div className="w-full h-full animate-[slideUp_0.8s_ease-out] origin-bottom" style={{ backgroundColor: '#B59363' }}></div>
            </div>
          )}
          {activeSection === 'about' && (
            <div className="absolute left-0 top-[309px] w-1 h-6 bg-gray-300 rounded-r overflow-hidden">
              <div className="w-full h-full animate-[slideUp_0.8s_ease-out] origin-bottom" style={{ backgroundColor: '#B59363' }}></div>
            </div>
          )}

          {/* Container dos ícones */}
          <div className="flex flex-col space-y-8 relative">

            <button
              onClick={() => setActiveSection('login')}
              className="p-3 rounded-lg transition-colors"
              style={{ color: activeSection === 'login' ? '#B59363' : '#d1d5db' }}
            >
              <User className="w-6 h-6" />
            </button>

            <button
              onClick={() => setActiveSection('signup')}
              className="p-3 rounded-lg transition-colors pt-[10px] pb-[10px] mt-[23px] mb-[23px]"
              style={{ color: activeSection === 'signup' ? '#B59363' : '#d1d5db' }}
            >
              <UserPlus className="w-6 h-6" />
            </button>

            <button
              onClick={() => setActiveSection('about')}
              className="p-3 rounded-lg transition-colors pt-[12px] pb-[12px] pl-[10px] pr-[10px] mt-[22px] mb-[22px]"
              style={{ color: activeSection === 'about' ? '#B59363' : '#d1d5db' }}
            >
              <Info className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Card central com textura - SUSPENSO com sombreamento */}
        <div
          className="w-[500px] h-[520px] flex flex-col justify-center items-center text-white shadow-2xl z-10 relative -mx-4 overflow-hidden"
          style={{
            backgroundColor: '#1a1a1a',
            backgroundImage: `
              linear-gradient(45deg, #222 25%, transparent 25%), 
              linear-gradient(-45deg, #222 25%, transparent 25%), 
              linear-gradient(45deg, transparent 75%, #222 75%), 
              linear-gradient(-45deg, transparent 75%, #222 75%)
            `,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
          }}
        >
          <div className="text-center mb-16 relative z-10">
            <h1 className="text-4xl font-light mb-4" style={{ color: '#B59363' }}>Bem-vindo ao Quantor.</h1>
            <p className="text-lg mb-1" style={{ color: '#E6E7E8' }}>Sistema inteligente de</p>
            <p className="text-lg" style={{ color: '#E6E7E8' }}>gestão financeira</p>
          </div>

          {/* Ícones sociais */}
          <div className="flex space-x-6 absolute bottom-8 z-10">
            <Facebook className="w-5 h-5 cursor-pointer transition-all duration-200 hover:scale-110" style={{ color: '#B59363' }} />
            <Instagram className="w-5 h-5 cursor-pointer transition-all duration-200 hover:scale-110" style={{ color: '#B59363' }} />
            <Twitter className="w-5 h-5 cursor-pointer transition-all duration-200 hover:scale-110" style={{ color: '#B59363' }} />
            <Linkedin className="w-5 h-5 cursor-pointer transition-all duration-200 hover:scale-110" style={{ color: '#B59363' }} />
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