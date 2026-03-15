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
import { Plus, Edit, Trash2, Palette, Building2, Package, Users, Save, LogOut, Lock, Layers, Tag, Wrench, Search, Box } from "lucide-react";

// Importações de componentes UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { TabelaItens } from "@/components/ui/TabelaItens";
import { IButtonPrime } from "@/components/ui/i-ButtonPrime";

// Importações de tipos e modais
import { Category, BusinessCategory, BusinessSubcategory, ProductUnit, ProductService } from "@shared/schema";
import { DynamicModal, DynamicField, FieldType } from "@/components/DynamicModal";

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

  // Estados de Produtos e Serviços
  const [searchTerm, setSearchTerm] = useState("");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productModalMode, setProductModalMode] = useState<'create' | 'edit'>('create');
  const [editingProduct, setEditingProduct] = useState<ProductService | null>(null);

  // Estados de Unidades
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [unitData, setUnitData] = useState({ name: '', abbreviation: '' });

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: businessCategories = [] } = useQuery<BusinessCategory[]>({
    queryKey: ["/api/business-categories"],
  });

  const { data: products = [], isLoading: isLoadingProducts } = useQuery<ProductService[]>({
    queryKey: ["/api/products-services"],
  });

  const { data: productUnits = [] } = useQuery<ProductUnit[]>({
    queryKey: ["/api/product-units"],
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
    onError: (error: any) => {
      showError('Erro ao Salvar', typeof error === 'string' ? error : (error.message || 'Não foi possível salvar a categoria.'));
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
      appliedTo: data.appliedTo || 'both',
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

  // Mutações de Produtos e Serviços
  const saveProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const method = productModalMode === 'edit' ? 'PUT' : 'POST';
      const url = productModalMode === 'edit' ? `/api/products-services/${editingProduct?.id}` : '/api/products-services';
      return apiRequest(method, url, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products-services"] });
      showSuccess(
        productModalMode === 'edit' ? "Item atualizado!" : "Item cadastrado!",
        "O catálogo foi atualizado com sucesso."
      );
      setIsProductModalOpen(false);
    },
    onError: (error: any) => {
      showError("Erro ao salvar", error.message || "Ocorreu um problema ao salvar o item.");
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/products-services/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products-services"] });
      showSuccess("Excluído!", "O item foi removido do catálogo.");
    },
    onError: (error: any) => {
      showError("Erro ao excluir", error.message || "Ocorreu um problema ao excluir o item.");
    }
  });

  const handleEditProduct = (item: ProductService) => {
    setProductModalMode('edit');
    setEditingProduct(item);
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = (item: ProductService) => {
    showConfirm(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir "${item.name}"? Esta ação não pode ser desfeita.`,
      () => deleteProductMutation.mutate(item.id)
    );
  };

  const createUnitMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/product-units', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-units'] });
      showSuccess('Unidade salva!', 'A nova unidade de medida foi cadastrada.');
      setIsUnitModalOpen(false);
    },
    onError: (error: any) => {
      console.error("DEBUG: Erro na mutação de unidades:", error);
      showError('Erro', error.message || 'Não foi possível salvar a unidade.');
    }
  });

  const handleSaveUnit = (data: any) => {
    if (!data.name || !data.abbreviation) return;
    createUnitMutation.mutate(data);
  };

  const filteredProducts = products.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Definição dos campos do modal de produtos
  const productModalFields: DynamicField[][] = [
    [
      {
        name: 'type',
        label: 'Tipo de Cadastro',
        type: 'radio' as FieldType,
        colSpan: 12,
        options: [
          { value: 'product', label: 'Produto' },
          { value: 'service', label: 'Serviço' }
        ],
        onChangeOverride: (val, currentData, setFormData) => {
          setFormData({
            ...currentData,
            type: val,
            unit: val === 'product' ? 'un' : 'hora',
            sku: val === 'service' ? '' : currentData.sku,
            ncm: val === 'service' ? '' : currentData.ncm,
          });
        }
      }
    ],
    [
      {
        name: 'name',
        label: 'Nome do Item',
        type: 'text' as FieldType,
        colSpan: 8,
        required: true,
        placeholder: 'Ex: Camiseta Branca G ou Consultoria Técnica'
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select' as FieldType,
        colSpan: 4,
        options: [
          { value: 'active', label: 'Ativo' },
          { value: 'inactive', label: 'Inativo' }
        ]
      }
    ],
    [
      {
        name: 'description',
        label: 'Descrição Detalhada',
        type: 'text' as FieldType,
        colSpan: 12,
        placeholder: 'Opcional: Detalhes adicionais sobre o produto ou serviço'
      }
    ],
    [
      {
        name: 'sku',
        label: 'SKU / Código',
        type: 'text' as FieldType,
        colSpan: 6,
        placeholder: 'Código interno',
        hidden: (data) => data.type === 'service'
      },
      {
        name: 'ncm',
        label: 'NCM/SH',
        type: 'text' as FieldType,
        colSpan: 6,
        placeholder: '8 dígitos',
        hidden: (data) => data.type === 'service'
      }
    ],
    [
      {
        name: 'unit',
        label: 'Unidade',
        type: 'select' as FieldType,
        colSpan: 4,
        options: productUnits || [],
        getOptionLabel: (opt: any) => `${opt.abbreviation} - ${opt.name}`,
        getOptionValue: (opt: any) => opt.abbreviation,
        iconAction: {
          icon: <Plus size={18} />,
          title: 'Cadastrar nova unidade',
          onClick: () => {
            setUnitData({ name: '', abbreviation: '' });
            setIsUnitModalOpen(true);
          }
        }
      },
      {
        name: 'salePrice',
        label: 'Preço de Venda',
        type: 'currency' as FieldType,
        colSpan: 4,
        required: true
      },
      {
        name: 'costPrice',
        label: 'Preço de Custo',
        type: 'currency' as FieldType,
        colSpan: 4
      }
    ],
    [
      {
        name: 'categoryId',
        label: 'Categoria',
        type: 'select' as FieldType,
        colSpan: 6,
        options: (currentData: any) => {
          const itemType = currentData.type === 'product' ? 'products' : 'services';
          return businessCategories
            .filter(cat => cat.appliedTo === itemType || cat.appliedTo === 'both')
            .map(cat => ({ value: cat.id.toString(), label: cat.name }));
        },
        onChangeOverride: (val, currentData, setFormData) => {
          setFormData({
            ...currentData,
            categoryId: val,
            subcategoryId: '' // Limpa subcategoria ao trocar categoria
          });
        }
      },
      {
        name: 'subcategoryId',
        label: 'Subcategoria',
        type: 'select' as FieldType,
        colSpan: 6,
        options: (currentData: any) => {
          if (!currentData.categoryId) return [];
          return businessSubcategories
            .filter(sub => sub.categoryId === parseInt(currentData.categoryId))
            .map(sub => ({ value: sub.id.toString(), label: sub.name }));
        },
        disabled: (data) => !data.categoryId
      }
    ]
  ];

  const productTableColumns = [
    {
      label: 'Item',
      key: 'name',
      render: (item: ProductService) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg text-[#B59363]">
            {item.type === 'product' ? <Package size={18} /> : <Wrench size={18} />}
          </div>
          <div>
            <div className="font-semibold text-[#1D3557]">{item.name}</div>
            <div className="text-xs text-gray-500">{item.sku || 'Sem Código'}</div>
          </div>
        </div>
      )
    },
    {
      label: 'Tipo',
      key: 'type',
      render: (item: ProductService) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.type === 'product' ? 'bg-[#1D3557]/15 text-[#1D3557]' : 'bg-purple-100 text-purple-700'
          }`}>
          {item.type === 'product' ? 'Produto' : 'Serviço'}
        </span>
      )
    },
    {
      label: 'Unidade',
      key: 'unit',
      render: (item: ProductService) => (
        <span className="text-gray-600">{item.unit}</span>
      )
    },
    {
      label: 'Categoria',
      key: 'categoryId',
      render: (item: ProductService) => {
        const cat = businessCategories.find(c => c.id === item.categoryId);
        return <span className="text-gray-600">{cat?.name || '-'}</span>;
      }
    },
    {
      label: 'Subcategoria',
      key: 'subcategoryId',
      render: (item: ProductService) => {
        const sub = businessSubcategories.find(s => s.id === item.subcategoryId);
        return <span className="text-gray-600">{sub?.name || '-'}</span>;
      }
    },
    {
      label: 'Preço Venda',
      key: 'salePrice',
      render: (item: ProductService) => (
        <span className="font-semibold text-[#1D3557]">
          {item.salePrice ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(item.salePrice)) : 'R$ 0,00'}
        </span>
      )
    },
    {
      label: 'Status',
      key: 'status',
      render: (item: ProductService) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
          {item.status === 'active' ? 'Ativo' : 'Inativo'}
        </span>
      )
    }
  ];

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
          <h1 className="text-3xl font-bold text-[#1D3557]">Negócios</h1>
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
              } else if (activeTab === 'produtos-servicos') {
                setProductModalMode('create');
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }
            }}
            className="group relative w-11 h-11 bg-gradient-to-r from-[#4D4E48] to-[#2a2a2a] hover:from-[#2a2a2a] hover:to-[#1a1a1a] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 active:shadow-md"
            title="Novo Item de Negócio"
            style={{
              boxShadow: '0 6px 20px -6px rgba(77, 78, 72, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
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
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#4D4E48] font-medium px-6 py-2 transition-all relative overflow-hidden"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Unidade de Negócios
            </TabsTrigger>
            <TabsTrigger
              value="produtos-servicos"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#4D4E48] font-medium px-6 py-2 transition-all relative overflow-hidden"
            >
              <Package className="h-4 w-4 mr-2" />
              Produtos & Serviços
            </TabsTrigger>
          </TabsList>

          {/* Barra de progressão inteligente e animada */}
          <div className="absolute bottom-1 left-1 right-1 h-0.5 overflow-hidden">
            <div
              className="progress-bar absolute bottom-0 h-full bg-[#B59363] rounded-full"
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
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#4D4E48] border-none font-medium px-6 py-2 transition-all relative overflow-hidden"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Categorias
                </TabsTrigger>
                <TabsTrigger
                  value="subcategoria"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#4D4E48] border-none font-medium px-6 py-2 transition-all relative overflow-hidden"
                >
                  <Tag className="h-4 w-4 mr-2" />
                  Subcategorias
                </TabsTrigger>
              </TabsList>

              {/* Barra de progressão animada da SubAba */}
              <div className="absolute bottom-1 left-1 right-1 h-0.5 overflow-hidden">
                <div
                  className="sub-progress-bar absolute bottom-0 h-full bg-[#B59363] rounded-full"
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
                  { label: "ID", key: "id", align: "center", width: "8%", sortable: true, render: (cat) => <span className="font-mono text-gray-500">#{cat.id}</span> },
                  { label: "Nome da Categoria", key: "name", width: "40%", sortable: true, render: (cat) => <span className="font-medium">{cat.name}</span> },
                  {
                    label: "Tipo",
                    key: "type",
                    align: "center",
                    width: "15%",
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
                    width: "20%",
                    sortable: true,
                    render: (cat) => cat.createdAt ? format(new Date(cat.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : <span className="text-gray-400 italic">Sem data</span>
                  }
                ]}
                actions={[
                  { icon: Edit, color: "text-[#B59363]", title: "Editar", onClick: handleEditCategory },
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
                  { label: "ID", key: "id", align: "center", width: "8%", sortable: true, render: (sub) => <span className="font-mono text-gray-500">#{sub.id}</span> },
                  { label: "Nome da Subcategoria", key: "name", width: "35%", sortable: true, render: (sub) => <span className="font-medium">{sub.name}</span> },
                  {
                    label: "Categoria Pai",
                    key: "categoryId",
                    width: "25%",
                    render: (sub) => {
                      const parentCategory = businessCategories.find(c => c.id === sub.categoryId);
                      return parentCategory ? parentCategory.name : 'Desconhecida';
                    }
                  },
                  {
                    label: "Data de Criação",
                    key: "createdAt",
                    align: "center",
                    width: "20%",
                    sortable: true,
                    render: (sub) => sub.createdAt ? format(new Date(sub.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : <span className="text-gray-400 italic">Sem data</span>
                  }
                ]}
                actions={[
                  { icon: Edit, color: "text-[#B59363]", title: "Editar", onClick: handleEditSubcategory },
                  { icon: Trash2, color: "text-red-600", title: "Excluir", onClick: handleDeleteSubcategory }
                ]}
                emptyMessage="Você ainda não cadastrou nenhuma Subcategoria. Lembre-se, elas precisam ser associadas a uma Categoria pai."
                emptyIcon={Package}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="produtos-servicos" className="space-y-6">
          {/* Busca e Resumo de Produtos */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
              <Search className="text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Pesquisar por nome ou código..."
                className="w-full outline-none text-[#1D3557] font-medium bg-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="bg-[#1D3557] p-4 rounded-xl shadow-sm text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Tag size={20} />
                <span className="font-medium">Total de Itens</span>
              </div>
              <span className="text-2xl font-bold">{products.length}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {isLoadingProducts ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B59363]"></div>
              </div>
            ) : (
              <TabelaItens
                data={filteredProducts}
                columns={productTableColumns}
                emptyMessage="Nenhum item encontrado no catálogo."
                actions={(item) => (
                  <div className="flex justify-end gap-2 pr-4">
                    <IButtonPrime
                      variant="gold"
                      icon={<Edit className="h-4 w-4" />}
                      onClick={() => handleEditProduct(item)}
                      title="Editar"
                    />
                    <IButtonPrime
                      variant="red"
                      icon={<Trash2 className="h-4 w-4" />}
                      onClick={() => handleDeleteProduct(item)}
                      title="Excluir"
                    />
                  </div>
                )}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de Criação de Categoria Dinâmico */}
      <DynamicModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategoryId ? "Editar Categoria" : "Nova Categoria"}
        icon={<Building2 className="w-5 h-5 text-[#B59363]" />}
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
              colSpan: 4,
              options: [
                { value: 'income', label: 'Receita' },
                { value: 'expense', label: 'Despesa' }
              ]
            },
            {
              name: 'appliedTo',
              label: 'Aplicar em',
              type: 'select',
              colSpan: 4,
              options: [
                { value: 'products', label: 'Produtos' },
                { value: 'services', label: 'Serviços' },
                { value: 'both', label: 'Ambos' }
              ]
            }
          ]
        ]}
        onSave={handleSaveCategory}
        hideCloseButton={true}
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
        icon={<Tag className="w-5 h-5 text-[#B59363]" />}
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
              label: 'Categoria *',
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
        hideCloseButton={true}
      />

      {/* Modal de Produtos e Serviços */}
      <DynamicModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={productModalMode === 'create' ? "Novo Item do Catálogo" : "Editar Item"}
        icon={editingProduct?.type === 'service' ? <Wrench className="h-6 w-6 text-[#1D3557]" /> : <Package className="h-6 w-6 text-[#1D3557]" />}
        initialData={editingProduct || { type: 'product', status: 'active', unit: 'un', salePrice: '0', costPrice: '0' }}
        fields={productModalFields}
        onSave={(data) => {
          const cleanPrice = (val: any) => {
            if (!val) return '0';
            if (typeof val === 'number') return val.toString();
            // Remove R$, espaços e pontos de milhar, troca vírgula por ponto
            const cleaned = val.replace(/[R$\s.]/g, '').replace(',', '.').trim();
            return cleaned || '0';
          };

          const payload = {
            ...data,
            salePrice: cleanPrice(data.salePrice),
            costPrice: cleanPrice(data.costPrice),
            categoryId: data.categoryId ? parseInt(data.categoryId) : null,
            subcategoryId: data.subcategoryId ? parseInt(data.subcategoryId) : null
          };

          saveProductMutation.mutate(payload);
        }}
        hideCloseButton={true}
      />

      {/* Modal de Cadastro de Unidades */}
      <DynamicModal
        isOpen={isUnitModalOpen}
        onClose={() => setIsUnitModalOpen(false)}
        title="Nova Unidade de Medida"
        icon={<Box className="h-6 w-6 text-[#1D3557]" />}
        initialData={unitData}
        fields={[
          [
            {
              name: 'name',
              label: 'Descrição da Unidade',
              type: 'text',
              colSpan: 8,
              placeholder: 'Ex: Pacote, Fardo, Caixa',
              required: true,
              autoFocus: true
            },
            {
              name: 'abbreviation',
              label: 'Sigla',
              type: 'text',
              colSpan: 4,
              placeholder: 'Ex: PCT, FD, CX',
              required: true,
              transform: (val) => val.toUpperCase()
            }
          ]
        ]}
        onSave={handleSaveUnit}
        saveButtonText="Salvar Unidade"
        hideCloseButton={true}
      />

      {/* Dialogs de Sistema */}
      <ConfirmDialog />
      <SuccessDialog />
      <ErrorDialog />
    </div>
  );
}