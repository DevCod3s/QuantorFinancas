/**
 * @fileoverview Componente de Sub-abas para o sistema Quantor
 * 
 * Componente reutilizável que implementa sub-abas com barra de progressão animada.
 * Usado nas páginas que precisam de navegação secundária dentro das abas principais.
 * 
 * Funcionalidades:
 * - Barra de progressão que se move entre as sub-abas
 * - Animação suave de preenchimento da esquerda para direita
 * - Suporte a ícones opcionais nas abas
 * - Classes CSS personalizáveis
 * - Compatível com sistema de design Shadcn/ui
 * - Auto-atualização da posição da barra com base na aba ativa
 * 
 * Uso atual:
 * - Página Finanças: "Fluxo de Caixa" e "Lançamentos" na aba Visão Geral
 * - Página Finanças: "À Pagar" e "À Receber" na aba Movimentações
 * 
 * @author Equipe Quantor
 * @version 1.0.0
 */

import { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Interface para definição de uma sub-aba
 */
interface SubTab {
  value: string; // Valor único da aba
  label: string; // Texto exibido na aba
  icon?: React.ReactNode; // Ícone opcional
  content: React.ReactNode; // Conteúdo da aba
}

/**
 * Props do componente SubTabs
 */
interface SubTabsProps {
  tabs: SubTab[]; // Array de sub-abas
  defaultValue: string; // Valor da aba ativa por padrão
  className?: string; // Classes CSS adicionais
}

export function SubTabs({ tabs, defaultValue, className = "" }: SubTabsProps) {
  const [activeSubTab, setActiveSubTab] = useState(defaultValue);
  const subTabListRef = useRef<HTMLDivElement>(null);

  // Calcula a posição e largura da barra de progressão das sub-abas
  useEffect(() => {
    const updateSubProgressBar = () => {
      if (!subTabListRef.current) return;
      
      const activeTabElement = subTabListRef.current.querySelector(`[data-state="active"]`) as HTMLElement;
      if (activeTabElement) {
        const tabListRect = subTabListRef.current.getBoundingClientRect();
        const activeTabRect = activeTabElement.getBoundingClientRect();
        
        const leftOffset = activeTabRect.left - tabListRect.left;
        const width = activeTabRect.width;
        
        // Aplica a posição através de CSS custom properties
        const progressBar = subTabListRef.current.querySelector('.sub-progress-bar') as HTMLElement;
        if (progressBar) {
          // Define a posição e largura final
          progressBar.style.setProperty('--sub-progress-left', `${leftOffset}px`);
          progressBar.style.setProperty('--sub-progress-width', `${width}px`);
          
          // Remove animação anterior e força reset
          progressBar.style.animation = 'none';
          progressBar.offsetHeight; // Força repaint
          
          // Aplica nova animação
          progressBar.style.animation = 'subProgressFill 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards';
        }
      }
    };

    // Delay para garantir que o DOM foi atualizado
    const timer = setTimeout(updateSubProgressBar, 50);
    return () => clearTimeout(timer);
  }, [activeSubTab]);

  return (
    <Tabs
      value={activeSubTab}
      onValueChange={setActiveSubTab}
      className={`w-full ${className}`}
    >
      <div className="relative bg-gray-50 rounded-lg p-1" ref={subTabListRef}>
        <TabsList className="grid w-full bg-transparent p-0 h-auto gap-1" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-medium px-4 py-2 transition-all relative overflow-hidden text-sm"
            >
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {/* Barra de progressão inteligente para sub-abas */}
        <div className="absolute bottom-1 left-1 right-1 h-0.5 overflow-hidden">
          <div 
            className="sub-progress-bar absolute bottom-0 h-full bg-blue-500 rounded-full"
            style={{
              left: 'var(--sub-progress-left, 0px)',
              width: '0px',
              transformOrigin: 'left center'
            }}
          />
        </div>
      </div>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="mt-6">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}