/**
 * @fileoverview Página de gestão de negócios do sistema Quantor
 * 
 * Anteriormente "Categorias", foi reestruturada para focar em gestão empresarial.
 * Funcionalidades implementadas:
 * - Sistema de 2 abas com barra de progressão animada
 * - Aba "Unidade de Negócios": Placeholder para futuras funcionalidades
 * - Aba "Produtos & Serviços": Placeholder para catálogo de produtos
 * - Botão de ação moderno circular com efeitos visuais
 * - Design profissional com placeholders elegantes
 * - Estrutura preparada para desenvolvimento futuro
 * - Consistência visual com outras páginas do sistema
 * 
 * @author Equipe Quantor
 * @version 1.0.0
 */

// Importações React
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useSuccessDialog } from "@/components/ui/success-dialog";
import { useErrorDialog } from "@/components/ui/error-dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Importações de ícones
import { Plus, Edit, Trash2, Palette, Building2, Package, Users, Save, LogOut, Lock, Layers, Tag } from "lucide-react";

// Importações de componentes UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { TabelaItens } from "@/components/ui/TabelaItens";

// Importações de tipos e modais
import { Category, BusinessCategory, BusinessSubcategory } from "@shared/schema";
import { DynamicModal } from "@/components/DynamicModal";

export function Categories() {
  const queryClient = useQueryClient();
  const { showSuccess, SuccessDialog } = useSuccessDialog();
  const { showError, ErrorDialog } = useErrorDialog();
  const { showConfirm, ConfirmDialog } = useConfirmDialog();

  const [activeTab, setActiveTab] = useState("unidade-negocios");
  const [activeSubTab, setActiveSubTab] = useState("categoria");

  const [progressWidth, setProgressWidth] = useState(0);
  const tabListRef = useRef<HTMLDivElement>(null);
  const subTabListRef = useRef<HTMLDivElement>(null);

  // Estados do Modal - Categoria
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryData, setCategoryData] = useState({ name: '', type: 'expense', orderIndex: '' });
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);

  // Estados do Modal - Subcategoria
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [subcategoryData, setSubcategoryData] = useState({ name: '', categoryId: '', type: 'expense', orderIndex: '' });
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<number | null>(null);

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: businessCategories = [] } = useQuery<BusinessCategory[]>({
    queryKey: ["/api/business-categories"],
  });

  useEffect(() => {
    if (businessCategories.length > 0) {
      console.log("DEBUG: Categorias carregadas:", businessCategories);
    }
  }, [businessCategories]);

  const createBusinessCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/business-categories', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/business-categories'] });
      showSuccess('Categoria salva!', 'A categoria foi criada com sucesso.');
    },
    onError: () => {
      showError('Erro', 'Não foi possível salvar a categoria.');
    }
  });

  const updateBusinessCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('PUT', `/api/business-categories/${editingCategoryId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/business-categories'] });
      showSuccess('Categoria atualizada!', 'A categoria foi alterada com sucesso.');
    },
    onError: () => {
      showError('Erro', 'Não foi possível atualizar a categoria.');
    }
  });

  const deleteBusinessCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/business-categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/business-categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/business-subcategories'] }); // Cascata
      showSuccess('Categoria excluída!', 'A categoria e suas subcategorias foram removidas.');
    },
    onError: () => {
      showError('Erro', 'Não foi possível excluir a categoria.');
    }
  });

  const handleSaveCategory = (data: any, resetForm?: () => void) => {
    if (!data.name || !data.type) return;

    const payload = {
      name: data.name,
      type: data.type,
      orderIndex: data.orderIndex ? parseInt(data.orderIndex) : 0
    };

    if (editingCategoryId) {
      updateBusinessCategoryMutation.mutate(payload, {
        onSuccess: () => {
          if (resetForm) resetForm();
          else setIsCategoryModalOpen(false);
        }
      });
    } else {
      createBusinessCategoryMutation.mutate(payload, {
        onSuccess: () => {
          if (resetForm) resetForm();
          else setIsCategoryModalOpen(false);
        }
      });
    }
  };

  const handleEditCategory = (category: BusinessCategory) => {
    setEditingCategoryId(category.id);
    setCategoryData({
      name: category.name,
      type: category.type,
      orderIndex: category.orderIndex.toString()
    });
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = (category: BusinessCategory) => {
    // Alerta Arquitetural: Regra B de Exclusão "Cascata com Trava de Produto"
    // No futuro, adicionar a checagem: if (categoryHasProducts) { showError("Bloqueado"); return; }

    const qtySubcategories = businessSubcategories.filter(sub => sub.categoryId === category.id).length;
    const cascadeWarning = qtySubcategories > 0
      ? ` ATENÇÃO: Ela possui ${qtySubcategories} subcategoria(s) associada(s) que TAMBÉM serão excluídas em cascata irrevogavelmente.`
      : '';

    showConfirm(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir a categoria "${category.name}"?${cascadeWarning}`,
      () => deleteBusinessCategoryMutation.mutate(category.id),
      "Excluir",
      "Cancelar"
    );
  };

  const { data: businessSubcategories = [] } = useQuery<BusinessSubcategory[]>({
    queryKey: ["/api/business-subcategories"],
  });

  const createBusinessSubcategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/business-subcategories', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/business-subcategories'] });
      showSuccess('Subcategoria salva!', 'A subcategoria foi criada com sucesso.');
    },
    onError: () => {
      showError('Erro', 'Não foi possível salvar a subcategoria.');
    }
  });

  const updateBusinessSubcategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('PUT', `/api/business-subcategories/${editingSubcategoryId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/business-subcategories'] });
      showSuccess('Subcategoria atualizada!', 'A subcategoria foi alterada com sucesso.');
    },
    onError: () => {
      showError('Erro', 'Não foi possível atualizar a subcategoria.');
    }
  });

  const deleteBusinessSubcategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/business-subcategories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/business-subcategories'] });
      showSuccess('Subcategoria excluída!', 'A subcategoria foi removida com sucesso.');
    },
    onError: () => {
      showError('Erro', 'Não foi possível excluir a subcategoria.');
    }
  });

  const handleSaveSubcategory = (data: any, resetForm?: () => void) => {
    const parentCategory = businessCategories.find(c => c.id === parseInt(data.categoryId));
    const payload = {
      name: data.name,
      categoryId: parseInt(data.categoryId),
      type: parentCategory ? parentCategory.type : 'expense',
      orderIndex: data.orderIndex ? parseInt(data.orderIndex) : 0
    };

    if (editingSubcategoryId) {
      updateBusinessSubcategoryMutation.mutate(payload, {
        onSuccess: () => {
          if (resetForm) resetForm();
          else setIsSubcategoryModalOpen(false);
        }
      });
    } else {
      createBusinessSubcategoryMutation.mutate(payload, {
        onSuccess: () => {
          if (resetForm) resetForm();
          else setIsSubcategoryModalOpen(false);
        }
      });
    }
  };

  const handleEditSubcategory = (subcategory: BusinessSubcategory) => {
    setEditingSubcategoryId(subcategory.id);
    setSubcategoryData({
      name: subcategory.name,
      categoryId: subcategory.categoryId.toString(),
      type: subcategory.type,
      orderIndex: subcategory.orderIndex.toString()
    });
    setIsSubcategoryModalOpen(true);
  };

  const handleDeleteSubcategory = (subcategory: BusinessSubcategory) => {
    // Alerta Arquitetural: Regra B de Exclusão "com Trava de Produto"
    // No futuro, adicionar a checagem com produtos associados à subcategoria: if (subcategoryHasProducts) { showError("Bloqueado"); return; }

    showConfirm(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir a subcategoria "${subcategory.name}"?`,
      () => deleteBusinessSubcategoryMutation.mutate(subcategory.id),
      "Excluir",
      "Cancelar"
    );
  };

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

  // Calcula a posição e largura da barra de progressão das SubAbas
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

    const timer = setTimeout(updateSubProgressBar, 50);
    return () => clearTimeout(timer);
  }, [activeSubTab]);

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
        <div className="relative">
          <button
            onClick={() => {
              if (activeTab === 'unidade-negocios') {
                if (activeSubTab === 'categoria') {
                  setEditingCategoryId(null);
                  setCategoryData({ name: '', type: 'expense', orderIndex: '' });
                  setIsCategoryModalOpen(true);
                } else {
                  setEditingSubcategoryId(null);
                  setSubcategoryData({ name: '', categoryId: '', type: 'expense', orderIndex: '' });
                  setIsSubcategoryModalOpen(true);
                }
              }
            }}
            className="group relative w-11 h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 active:shadow-md"
            title="Novo Item de Negócio"
            style={{
              boxShadow: '0 6px 20px -6px rgba(59, 130, 246, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
            }}
          >
            {/* Efeito de brilho interno */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Ícone Plus com animação */}
            <Plus className="h-5 w-5 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 group-hover:rotate-90 transition-transform duration-300 ease-out" />

            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-active:scale-100 group-active:opacity-30 transition-all duration-150 ease-out"></div>
            </div>
          </button>

          {/* Tooltip */}
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
            Novo Item de Negócio
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
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
          <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
            <div className="relative mb-6" ref={subTabListRef}>
              <TabsList className="grid w-full grid-cols-2 lg:w-fit lg:grid-cols-2 bg-gray-100 p-1 rounded-lg relative">
                <TabsTrigger
                  value="categoria"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 border-none font-medium px-6 py-2 transition-all relative overflow-hidden"
                >
                  <Layers className="h-4 w-4 mr-2" />
                  Categorias
                </TabsTrigger>
                <TabsTrigger
                  value="subcategoria"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 border-none font-medium px-6 py-2 transition-all relative overflow-hidden"
                >
                  <Tag className="h-4 w-4 mr-2" />
                  Subcategorias
                </TabsTrigger>
              </TabsList>

              {/* Barra de progressão animada da SubAba */}
              <div className="absolute bottom-1 left-1 right-1 h-0.5 overflow-hidden">
                <div
                  className="sub-progress-bar absolute bottom-0 h-full bg-blue-600 rounded-full"
                  style={{
                    left: 'var(--progress-left, 0px)',
                    width: '0px',
                    transformOrigin: 'left center'
                  }}
                />
              </div>
            </div>

            <TabsContent value="categoria" className="space-y-4">
              <TabelaItens
                data={businessCategories}
                initialPerPage={10}
                columns={[
                  { label: "ID", key: "id", align: "center", width: "80px", sortable: true, render: (cat) => <span className="font-mono text-gray-500">#{cat.id}</span> },
                  { label: "Nome da Categoria", key: "name", sortable: true, render: (cat) => <span className="font-medium">{cat.name}</span> },
                  {
                    label: "Tipo",
                    key: "type",
                    width: "120px",
                    render: (cat) => (
                      <Badge
                        variant="outline"
                        className={cat.type === 'income' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}
                      >
                        {cat.type === 'income' ? 'Receita' : 'Despesa'}
                      </Badge>
                    )
                  },
                  {
                    label: "Data de Criação",
                    key: "createdAt",
                    align: "center",
                    width: "180px",
                    sortable: true,
                    render: (cat) => cat.createdAt ? format(new Date(cat.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : <span className="text-gray-400 italic">Sem data</span>
                  }
                ]}
                actions={[
                  { icon: Edit, color: "text-blue-600", title: "Editar", onClick: handleEditCategory },
                  { icon: Trash2, color: "text-red-600", title: "Excluir", onClick: handleDeleteCategory }
                ]}
                emptyMessage="Você ainda não cadastrou nenhuma Categoria de Negócio. Clique no botão de adição acima para começar."
                emptyIcon={Building2}
              />
            </TabsContent>

            <TabsContent value="subcategoria" className="space-y-4">
              <TabelaItens
                data={businessSubcategories}
                initialPerPage={10}
                columns={[
                  { label: "ID", key: "id", align: "center", width: "80px", sortable: true, render: (sub) => <span className="font-mono text-gray-500">#{sub.id}</span> },
                  { label: "Nome da Subcategoria", key: "name", sortable: true, render: (sub) => <span className="font-medium">{sub.name}</span> },
                  {
                    label: "Categoria Pai",
                    key: "categoryId",
                    render: (sub) => {
                      const parentCategory = businessCategories.find(c => c.id === sub.categoryId);
                      return parentCategory ? parentCategory.name : 'Desconhecida';
                    }
                  },
                  {
                    label: "Data de Criação",
                    key: "createdAt",
                    align: "center",
                    width: "180px",
                    sortable: true,
                    render: (sub) => sub.createdAt ? format(new Date(sub.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : <span className="text-gray-400 italic">Sem data</span>
                  }
                ]}
                actions={[
                  { icon: Edit, color: "text-blue-600", title: "Editar", onClick: handleEditSubcategory },
                  { icon: Trash2, color: "text-red-600", title: "Excluir", onClick: handleDeleteSubcategory }
                ]}
                emptyMessage="Você ainda não cadastrou nenhuma Subcategoria. Lembre-se, elas precisam ser associadas a uma Categoria pai."
                emptyIcon={Package}
              />
            </TabsContent>
          </Tabs>
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

      {/* Modal de Criação de Categoria Dinâmico */}
      <DynamicModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategoryId ? "Editar Categoria" : "Nova Categoria"}
        icon={<Layers className="w-5 h-5 text-blue-600" />}
        data={editingCategoryId ? { ...categoryData, id: `#${editingCategoryId}` } : { ...categoryData, id: 'Gerado Auto' }}
        fields={[
          [
            {
              name: 'id',
              label: 'Id Categoria',
              type: 'text',
              colSpan: 4,
              disabled: true,
              endIcon: <Lock className="h-4 w-4 text-gray-400" />
            },
            {
              name: 'name',
              label: 'Nome *',
              type: 'text',
              colSpan: 8,
              autoFocus: true,
              helperText: (data) => !data.name ? 'Campo obrigatório' : ''
            }
          ],
          [
            {
              name: 'orderIndex',
              label: 'Ordem',
              type: 'text',
              colSpan: 4,
              transform: (val: string) => val.replace(/\D/g, '')
            },
            {
              name: 'type',
              label: 'Tipo',
              type: 'select',
              colSpan: 8,
              options: [
                { value: 'income', label: 'Receita' },
                { value: 'expense', label: 'Despesa' }
              ]
            }
          ]
        ]}
        onSave={handleSaveCategory}
      />

      {/* Modal de Subcategorias */}
      <DynamicModal
        isOpen={isSubcategoryModalOpen}
        onClose={() => {
          setIsSubcategoryModalOpen(false);
          setEditingSubcategoryId(null);
          setSubcategoryData({} as any);
        }}
        title={editingSubcategoryId ? "Editar Subcategoria" : "Nova Subcategoria"}
        icon={<Tag className="w-5 h-5 text-blue-600" />}
        data={editingSubcategoryId ? { ...subcategoryData, id: `#${editingSubcategoryId}` } : { ...subcategoryData, id: 'Gerado Auto' }}
        fields={[
          [
            {
              name: 'id',
              label: 'Id Subcategoria',
              type: 'text',
              colSpan: 4,
              disabled: true,
              endIcon: <Lock className="h-4 w-4 text-gray-400" />
            },
            {
              name: 'orderIndex',
              label: 'Ordem',
              type: 'text',
              colSpan: 8,
              transform: (val: string) => val.replace(/\D/g, '')
            }
          ],
          [
            {
              name: 'categoryId',
              label: 'Categoria Pai *',
              type: 'select',
              colSpan: 4,
              options: businessCategories.map((c) => ({ value: c.id.toString(), label: c.name })),
              helperText: (data) => !data.categoryId ? 'Selecione uma categoria pai' : ''
            },
            {
              name: 'name',
              label: 'Nome *',
              type: 'text',
              colSpan: 8,
              autoFocus: true,
              helperText: (data) => !data.name ? 'Campo obrigatório' : ''
            }
          ]
        ]}
        onSave={handleSaveSubcategory}
      />

      {/* Dialogs de Sistema */}
      <ConfirmDialog />
      <SuccessDialog />
      <ErrorDialog />
    </div>
  );
}