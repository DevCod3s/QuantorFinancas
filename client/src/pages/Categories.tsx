import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Palette, Building2, Package, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Category } from "@shared/schema";

export function Categories() {
  const [activeTab, setActiveTab] = useState("unidade-negocios");
  const [progressWidth, setProgressWidth] = useState(0);
  const tabListRef = useRef<HTMLDivElement>(null);

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Calcula a posição e largura da barra de progressão
  useEffect(() => {
    const updateProgressBar = () => {
      if (!tabListRef.current) return;
      
      const activeTabElement = tabListRef.current.querySelector(`[data-state="active"]`) as HTMLElement;
      if (activeTabElement) {
        const tabListRect = tabListRef.current.getBoundingClientRect();
        const activeTabRect = activeTabElement.getBoundingClientRect();
        
        const leftOffset = activeTabRect.left - tabListRect.left;
        const width = activeTabRect.width;
        
        // Define a posição e largura da barra
        setProgressWidth(width);
        
        // Aplica a posição através de CSS custom properties
        const progressBar = tabListRef.current.querySelector('.progress-bar') as HTMLElement;
        if (progressBar) {
          // Define a posição e largura final
          progressBar.style.setProperty('--progress-left', `${leftOffset}px`);
          progressBar.style.setProperty('--progress-width', `${width}px`);
          
          // Remove animação anterior e força reset
          progressBar.style.animation = 'none';
          progressBar.offsetHeight; // Força repaint
          
          // Aplica nova animação
          progressBar.style.animation = 'progressFill 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards';
        }
      }
    };

    // Delay para garantir que o DOM foi atualizado
    const timer = setTimeout(updateProgressBar, 50);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const incomeCategories = categories.filter(cat => cat.type === 'income');
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Negócios</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gerencie e organize todas as áreas do seu negócio de forma eficiente
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Item de Negócio
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="relative" ref={tabListRef}>
          <TabsList className="grid w-full grid-cols-2 lg:w-fit lg:grid-cols-2 bg-gray-100 p-1 rounded-lg relative">
            <TabsTrigger 
              value="unidade-negocios" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-medium px-6 py-2 transition-all relative overflow-hidden"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Unidade de Negócios
            </TabsTrigger>
            <TabsTrigger 
              value="produtos-servicos"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-medium px-6 py-2 transition-all relative overflow-hidden"
            >
              <Package className="h-4 w-4 mr-2" />
              Produtos & Serviços
            </TabsTrigger>
          </TabsList>
          
          {/* Barra de progressão inteligente e animada */}
          <div className="absolute bottom-1 left-1 right-1 h-0.5 overflow-hidden">
            <div 
              className="progress-bar absolute bottom-0 h-full bg-blue-600 rounded-full"
              style={{
                left: 'var(--progress-left, 0px)',
                width: '0px',
                transformOrigin: 'left center'
              }}
            />
          </div>
        </div>

        <TabsContent value="unidade-negocios" className="space-y-6">
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unidade de Negócios</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Esta seção será desenvolvida em breve. Aqui você poderá gerenciar suas diferentes unidades de negócio de forma organizada.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="produtos-servicos" className="space-y-6">
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Produtos & Serviços</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Esta seção será desenvolvida em breve. Aqui você poderá cadastrar e gerenciar todos os seus produtos e serviços.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}