import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, User, UserPlus, Info, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import quantorLogo from "@assets/Simbolo_New_1752793618491.png";

type ActiveSection = 'login' | 'signup' | 'about';

export function Login() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderRightCard = () => {
    switch (activeSection) {
      case 'login':
        return (
          <div className="w-full max-w-sm">
            <div className="mb-6">
              <h3 className="text-blue-600 font-semibold mb-2">Login</h3>
              <p className="text-gray-500 text-sm">to your account to browse through projects and explore our tools.</p>
            </div>
            
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="edison.andreal@gmail.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="border-0 rounded-md shadow-md focus:shadow-lg focus:ring-0 focus:border-0 bg-white"
              />
              
              <Input
                type="password"
                placeholder="PASSWORD"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
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
              <span className="text-gray-500 text-sm">Don't have an account? </span>
              <button 
                onClick={() => setActiveSection('signup')}
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                Sign up
              </button>
            </div>
          </div>
        );
        
      case 'signup':
        return (
          <div className="w-full max-w-sm">
            <div className="mb-6">
              <h3 className="text-blue-600 font-semibold mb-2">Sign up</h3>
              <p className="text-gray-500 text-sm">Create your account to get started with financial management.</p>
            </div>
            
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Nome completo"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="border-0 rounded-md shadow-md focus:shadow-lg focus:ring-0 focus:border-0 bg-white"
              />
              
              <Input
                type="email"
                placeholder="seu.email@gmail.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="border-0 rounded-md shadow-md focus:shadow-lg focus:ring-0 focus:border-0 bg-white"
              />
              
              <Input
                type="password"
                placeholder="SENHA"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="border-0 rounded-md shadow-md focus:shadow-lg focus:ring-0 focus:border-0 bg-white"
              />
              
              <Input
                type="password"
                placeholder="CONFIRMAR SENHA"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
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
              <span className="text-gray-500 text-sm">Already have an account? </span>
              <button 
                onClick={() => setActiveSection('login')}
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                Login
              </button>
            </div>
          </div>
        );
        
      case 'about':
        return (
          <div className="w-full max-w-sm">
            <div className="mb-6">
              <h3 className="text-blue-600 font-semibold mb-2">About</h3>
              <p className="text-gray-500 text-sm">Learn more about our financial management system.</p>
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
          <div className="flex flex-col items-center mb-12">
            <img src={quantorLogo} alt="Quantor" className="w-12 h-12 mb-3" />
            <span className="text-gray-700 text-sm font-bold tracking-wide">
              QUANTOR
            </span>
          </div>
          
          {/* Barra progressiva na borda absoluta esquerda do card */}
          {activeSection === 'login' && (
            <div className="absolute left-0 top-[155px] w-1 h-6 bg-blue-600 rounded-r">
              <div className="w-full h-0 bg-blue-600 animate-[fillUp_0.8s_ease-out_forwards]"></div>
            </div>
          )}
          {activeSection === 'signup' && (
            <div className="absolute left-0 top-[227px] w-1 h-6 bg-blue-600 rounded-r">
              <div className="w-full h-0 bg-blue-600 animate-[fillUp_0.8s_ease-out_forwards]"></div>
            </div>
          )}
          {activeSection === 'about' && (
            <div className="absolute left-0 top-[299px] w-1 h-6 bg-blue-600 rounded-r">
              <div className="w-full h-0 bg-blue-600 animate-[fillUp_0.8s_ease-out_forwards]"></div>
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
            <h1 className="text-4xl font-light mb-4">Welcome to Quantor.</h1>
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
          @keyframes fillUp {
            from { height: 0%; }
            to { height: 100%; }
          }
        `}</style>
        
      </div>
    </div>
  );
}