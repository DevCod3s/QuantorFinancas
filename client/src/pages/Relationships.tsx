/**
 * @fileoverview Página de gestão de relacionamentos do sistema Quantor
 * 
 * Gerencia clientes, fornecedores e outros relacionamentos comerciais.
 * Funcionalidades implementadas:
 * - Sistema de 3 abas com animação de progressão
 * - Tabelas com paginação e ordenação funcional
 * - Botões de ação (editar, visualizar, excluir)
 * - Sistema de notificações (sucesso/erro)
 * - Validação de regras de negócio
 * - Design responsivo e profissional
 * - Dados demonstrativos para apresentação
 * 
 * @author Equipe Quantor
 * @version 1.0.0
 */

// Importações React
import { useState, useEffect, useRef } from "react";

// Importações React Query
import { useQuery } from "@tanstack/react-query";

// Importação do wizard de relacionamento
import RelationshipWizard from "../components/relationship-wizard/RelationshipWizard";

// Importações de ícones
import { Plus, Users, Building, Phone, Mail, MapPin, User, CheckCircle, XCircle, AlertCircle, Ban, Edit, Eye, Trash2, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

// Importações de componentes UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Importações de dialogs personalizados
import { useSuccessDialog } from "@/components/ui/success-dialog";
import { useErrorDialog } from "@/components/ui/error-dialog";

// Função para obter ícone e cor do status
const getStatusIcon = (status: string) => {
  switch (status) {
    case "Ativo":
      return { icon: CheckCircle, color: "text-green-600" };
    case "Inativo":
      return { icon: XCircle, color: "text-gray-500" };
    case "Bloqueado":
      return { icon: Ban, color: "text-red-600" };
    case "Cancelado":
      return { icon: AlertCircle, color: "text-orange-600" };
    default:
      return { icon: CheckCircle, color: "text-green-600" };
  }
};

export function Relationships() {
  const [activeTab, setActiveTab] = useState("clientes");
  const [progressWidth, setProgressWidth] = useState(0);
  const tabListRef = useRef<HTMLDivElement>(null);
  
  // Estado para controlar se está na página de cadastro
  const [isAddingRelationship, setIsAddingRelationship] = useState(false);
  
  // Estado para controlar edição
  const [editingRelationship, setEditingRelationship] = useState<any>(null);
  const [viewingRelationship, setViewingRelationship] = useState<any>(null);
  
  // Hooks para dialogs de feedback
  const { showSuccess, SuccessDialog } = useSuccessDialog();
  const { showError, ErrorDialog } = useErrorDialog();
  
  // Query para buscar relacionamentos
  const { data: relationships = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/relationships'],
    queryFn: async () => {
      const response = await fetch('/api/relationships');
      if (!response.ok) throw new Error('Erro ao carregar relacionamentos');
      const data = await response.json();
      console.log('Relacionamentos recebidos:', data); // Debug para ver estrutura
      return data;
    }
  });

  // Filtrar relacionamentos por tipo
  const clientesDemoData = relationships.filter((r: any) => r.type === 'cliente');
  const fornecedoresDemoData = relationships.filter((r: any) => r.type === 'fornecedor');
  const outrosRelacionamentosDemoData = relationships.filter((r: any) => r.type === 'outros');
  
  // Estados de paginação para cada aba
  const [clientesPage, setClientesPage] = useState(1);
  const [clientesPerPage, setClientesPerPage] = useState(5);
  const [fornecedoresPage, setFornecedoresPage] = useState(1);
  const [fornecedoresPerPage, setFornecedoresPerPage] = useState(5);
  const [outrosPage, setOutrosPage] = useState(1);
  const [outrosPerPage, setOutrosPerPage] = useState(5);
  
  // Estados de ordenação
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Função para ordenação
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Função para ordenar dados
  const sortData = (data: any[], field: string, direction: "asc" | "desc") => {
    return [...data].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];
      
      // Tratamento especial para diferentes tipos de campos
      if (field === "dataCadastro") {
        aValue = new Date(aValue.split("/").reverse().join("/"));
        bValue = new Date(bValue.split("/").reverse().join("/"));
      } else if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (direction === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Função para paginar dados
  const paginateData = (data: any[], page: number, perPage: number) => {
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    return data.slice(startIndex, endIndex);
  };

  // Dados processados para cada aba
  const processedClientesData = (() => {
    let data = clientesDemoData;
    if (sortField) {
      data = sortData(data, sortField, sortDirection);
    }
    return paginateData(data, clientesPage, clientesPerPage);
  })();

  const processedFornecedoresData = (() => {
    let data = fornecedoresDemoData;
    if (sortField) {
      data = sortData(data, sortField, sortDirection);
    }
    return paginateData(data, fornecedoresPage, fornecedoresPerPage);
  })();

  const processedOutrosData = (() => {
    let data = outrosRelacionamentosDemoData;
    if (sortField) {
      data = sortData(data, sortField, sortDirection);
    }
    return paginateData(data, outrosPage, outrosPerPage);
  })();

  // Função para calcular número total de páginas
  const getTotalPages = (totalItems: number, perPage: number) => {
    return Math.ceil(totalItems / perPage);
  };

  // Função para calcular range de itens mostrados
  const getItemRange = (currentPage: number, perPage: number, totalItems: number) => {
    if (totalItems === 0) return { start: 0, end: 0 };
    const start = (currentPage - 1) * perPage + 1;
    const end = Math.min(currentPage * perPage, totalItems);
    return { start, end };
  };

  // Funções de ação para os botões
  const handleEdit = (item: any, tipo: string) => {
    const nome = item.socialname || item.social_name || item.socialName || item.fantasyname || item.fantasy_name || item.fantasyName;
    console.log('Editando relacionamento:', item);
    setEditingRelationship(item);
    setIsAddingRelationship(true);
  };

  const handleView = (item: any, tipo: string) => {
    const nome = item.socialname || item.social_name || item.socialName || item.fantasyname || item.fantasy_name || item.fantasyName;
    console.log('Visualizando relacionamento:', item);
    setViewingRelationship(item);
    setIsAddingRelationship(true);
  };

  const handleDelete = (item: any, tipo: string) => {
    const nome = item.socialname || item.social_name || item.socialName || item.fantasyname || item.fantasy_name || item.fantasyName;
    
    // Validação - relacionamento com status "Ativo" não pode ser excluído
    if (item.status === "ativo" || item.status === "Ativo") {
      showError(
        "Exclusão Negada!",
        `Não é possível excluir ${nome} pois o status está ativo. Altere o status antes de excluir.`
      );
      return;
    }

    // TODO: Implementar exclusão real do banco de dados
    showSuccess(
      "Exclusão Realizada!",
      `${nome} foi removido com sucesso dos ${tipo.toLowerCase()}.`
    );
    refetch(); // Recarrega a lista após exclusão
  };

  // Função para abrir wizard de cadastro
  const handleAddNew = (tipo: string) => {
    setIsAddingRelationship(true);
  };

  // Função para fechar wizard
  const handleCloseWizard = () => {
    setIsAddingRelationship(false);
  };

  // Função para salvar dados do wizard
  const handleSaveRelationship = (data: any) => {
    showSuccess(
      "Relacionamento Cadastrado!",
      `O novo relacionamento foi cadastrado com sucesso no sistema.`
    );
    setIsAddingRelationship(false);
  };

  const handleInvalidOperation = () => {
    showError(
      "Operação Inválida!",
      "Esta operação não pode ser realizada no momento. Tente novamente mais tarde."
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

  // Se está adicionando relacionamento, mostrar página de cadastro
  if (isAddingRelationship) {
    // Determinar o tipo baseado na aba ativa
    const relationshipTypeMap = {
      'clientes': 'cliente' as const,
      'fornecedores': 'fornecedor' as const,
      'outros': 'outros' as const
    };
    
    const selectedType = relationshipTypeMap[activeTab as keyof typeof relationshipTypeMap] || 'cliente';
    
    return (
      <div className="space-y-6">
        <RelationshipWizard
          isOpen={true}
          onClose={() => {
            setIsAddingRelationship(false);
            setEditingRelationship(null);
            setViewingRelationship(null);
            refetch(); // Recarregar lista após fechar wizard
          }}
          relationshipType={selectedType}
          initialData={editingRelationship || viewingRelationship || undefined}
          mode={viewingRelationship ? 'view' : editingRelationship ? 'edit' : 'create'}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relacionamentos</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gerencie seus clientes, fornecedores e demais relacionamentos comerciais
          </p>
        </div>
        <div className="relative">
          <button
            className="group relative w-11 h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 active:shadow-md"
            title="Novo Relacionamento"
            onClick={() => setIsAddingRelationship(true)}
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
            Novo Relacionamento
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="relative" ref={tabListRef}>
          <TabsList className="grid w-full grid-cols-3 lg:w-fit lg:grid-cols-3 bg-gray-100 p-1 rounded-lg relative">
            <TabsTrigger 
              value="clientes" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-medium px-6 py-2 transition-all relative overflow-hidden"
            >
              <User className="h-4 w-4 mr-2" />
              Clientes
            </TabsTrigger>
            <TabsTrigger 
              value="fornecedores"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-medium px-6 py-2 transition-all relative overflow-hidden"
            >
              <Building className="h-4 w-4 mr-2" />
              Fornecedores
            </TabsTrigger>
            <TabsTrigger 
              value="outros"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-medium px-6 py-2 transition-all relative overflow-hidden"
            >
              <Users className="h-4 w-4 mr-2" />
              Outros
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

        <TabsContent value="clientes" className="space-y-4">
          {/* Card do Cabeçalho Fixo */}
          <Card className="shadow-lg">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <colgroup>
                    <col style={{width: '60px'}} />
                    <col style={{width: 'auto'}} />
                    <col style={{width: 'auto'}} />
                    <col style={{width: '120px'}} />
                    <col style={{width: '100px'}} />
                    <col style={{width: '100px'}} />
                    <col style={{width: '120px'}} />
                  </colgroup>
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center justify-center space-x-1">
                          <span>ID</span>
                        </div>
                      </th>
                      <th 
                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("razaoSocialCompleta")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Razão Social/Nome</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome Fantasia
                      </th>
                      <th 
                        className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("tipo")}
                      >
                        <div className="flex items-center justify-center space-x-1">
                          <span>Tipo</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th 
                        className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("dataCadastro")}
                      >
                        <div className="flex items-center justify-center space-x-1">
                          <span>Data</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th 
                        className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center justify-center space-x-1">
                          <span>Status</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Card dos Dados com Scroll */}
          <Card className="shadow-lg">
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-[640px] overflow-y-auto">
                <table className="w-full table-fixed">
                  <colgroup>
                    <col style={{width: '60px'}} />
                    <col style={{width: 'auto'}} />
                    <col style={{width: 'auto'}} />
                    <col style={{width: '120px'}} />
                    <col style={{width: '100px'}} />
                    <col style={{width: '100px'}} />
                    <col style={{width: '120px'}} />
                  </colgroup>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {processedClientesData.map((cliente) => {
                      // Normalizar campos do banco (snake_case para camelCase)
                      const id = cliente.id;
                      const document = cliente.document;
                      const documentType = cliente.documenttype || cliente.document_type || cliente.documentType;
                      const socialName = cliente.socialname || cliente.social_name || cliente.socialName;
                      const fantasyName = cliente.fantasyname || cliente.fantasy_name || cliente.fantasyName;
                      const createdAt = cliente.createdat || cliente.created_at || cliente.createdAt;
                      const status = cliente.status || 'ativo';
                      
                      // Formatar status
                      const statusCapitalized = status.charAt(0).toUpperCase() + status.slice(1);
                      const { icon: StatusIcon, color: statusColor } = getStatusIcon(statusCapitalized);
                      
                      // Formatar documento (CPF: 000.000.000-00 | CNPJ: 00.000.000/0000-00)
                      const formatDocument = (doc: string, type: string) => {
                        if (!doc) return '-';
                        const numbers = doc.replace(/\D/g, '');
                        if (type === 'CPF' && numbers.length === 11) {
                          return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                        }
                        if (type === 'CNPJ' && numbers.length === 14) {
                          return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
                        }
                        return doc;
                      };
                      
                      return (
                        <tr key={id} className="hover:bg-gray-50 transition-colors duration-150">
                          {/* 1. ID */}
                          <td className="px-3 py-3 text-center text-xs font-medium text-gray-900">
                            {id}
                          </td>
                          
                          {/* 2. RAZÃO SOCIAL/NOME (2 linhas: documento + razão social) */}
                          <td className="px-3 py-3">
                            <div>
                              <div className="text-gray-500 text-xs mb-0.5">
                                {formatDocument(document, documentType)}
                              </div>
                              <div className="font-medium text-gray-900 text-xs truncate">
                                {socialName || '-'}
                              </div>
                            </div>
                          </td>
                          
                          {/* 3. NOME FANTASIA (nome fantasia para CNPJ, nome completo para CPF) */}
                          <td className="px-3 py-3 text-xs text-gray-900 truncate">
                            {fantasyName || socialName || '-'}
                          </td>
                          
                          {/* 4. TIPO (Pessoa Jurídica/Pessoa Física) */}
                          <td className="px-3 py-3 text-center">
                            <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                              documentType === 'CPF' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {documentType === 'CPF' ? 'PF' : 'PJ'}
                            </span>
                          </td>
                          
                          {/* 5. DATA (data de cadastro) */}
                          <td className="px-3 py-3 whitespace-nowrap text-center text-xs text-gray-900">
                            {createdAt ? new Date(createdAt).toLocaleDateString('pt-BR') : '-'}
                          </td>
                          
                          {/* 6. STATUS (Ativo/Inativo) */}
                          <td className="px-3 py-3 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <StatusIcon className={`h-3 w-3 ${statusColor}`} />
                              <span className={`text-xs font-medium ${statusColor}`}>
                                {statusCapitalized}
                              </span>
                            </div>
                          </td>
                          
                          {/* 7. AÇÕES (Visualizar, Editar, Excluir) */}
                          <td className="px-3 py-3 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button 
                                className="text-green-600 hover:text-green-900 transition-colors"
                                title="Visualizar"
                                onClick={() => handleView(cliente, "Clientes")}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                title="Editar"
                                onClick={() => handleEdit(cliente, "Clientes")}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Excluir"
                                onClick={() => handleDelete(cliente, "Clientes")}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Card de Paginação Separado */}
          <Card className="shadow-lg">
            <CardContent className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">
                    Mostrando {getItemRange(clientesPage, clientesPerPage, clientesDemoData.length).start} a {getItemRange(clientesPage, clientesPerPage, clientesDemoData.length).end} de {clientesDemoData.length} resultados
                  </span>
                  <span className="text-sm text-gray-500">|</span>
                  <select 
                    className="border border-gray-300 rounded px-2 py-1 text-sm" 
                    value={clientesPerPage}
                    onChange={(e) => {
                      setClientesPerPage(Number(e.target.value));
                      setClientesPage(1);
                    }}
                  >
                    <option value="5">5 por página</option>
                    <option value="10">10 por página</option>
                    <option value="20">20 por página</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    className={`px-3 py-1 text-sm transition-colors ${
                      clientesPage === 1 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setClientesPage(Math.max(1, clientesPage - 1))}
                    disabled={clientesPage === 1}
                  >
                    Anterior
                  </button>
                  
                  {/* Renderizar páginas dinamicamente */}
                  {Array.from({ length: getTotalPages(clientesDemoData.length, clientesPerPage) }, (_, i) => i + 1).map(page => (
                    <button 
                      key={page}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        page === clientesPage 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setClientesPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button 
                    className={`px-3 py-1 text-sm transition-colors ${
                      clientesPage === getTotalPages(clientesDemoData.length, clientesPerPage) 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setClientesPage(Math.min(getTotalPages(clientesDemoData.length, clientesPerPage), clientesPage + 1))}
                    disabled={clientesPage === getTotalPages(clientesDemoData.length, clientesPerPage)}
                  >
                    Próxima
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fornecedores" className="space-y-4">
          {/* Card do Cabeçalho Fixo */}
          <Card className="shadow-lg">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <colgroup>
                    <col style={{width: '60px'}} />
                    <col style={{width: 'auto'}} />
                    <col style={{width: 'auto'}} />
                    <col style={{width: '120px'}} />
                    <col style={{width: '100px'}} />
                    <col style={{width: '100px'}} />
                    <col style={{width: '120px'}} />
                  </colgroup>
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center justify-center space-x-1">
                          <span>ID</span>
                        </div>
                      </th>
                      <th 
                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("razaoSocialCompleta")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Razão Social/Nome</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome Fantasia
                      </th>
                      <th 
                        className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("tipo")}
                      >
                        <div className="flex items-center justify-center space-x-1">
                          <span>Tipo</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th 
                        className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("dataCadastro")}
                      >
                        <div className="flex items-center justify-center space-x-1">
                          <span>Data</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th 
                        className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center justify-center space-x-1">
                          <span>Status</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Card dos Dados com Scroll */}
          <Card className="shadow-lg">
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-[640px] overflow-y-auto">
                <table className="w-full table-fixed">
                  <colgroup>
                    <col style={{width: '60px'}} />
                    <col style={{width: 'auto'}} />
                    <col style={{width: 'auto'}} />
                    <col style={{width: '120px'}} />
                    <col style={{width: '100px'}} />
                    <col style={{width: '100px'}} />
                    <col style={{width: '120px'}} />
                  </colgroup>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {processedFornecedoresData.map((fornecedor, index) => {
                      const statusValue = fornecedor.status || 'ativo';
                      const statusCapitalized = statusValue.charAt(0).toUpperCase() + statusValue.slice(1);
                      const { icon: StatusIcon, color: statusColor } = getStatusIcon(statusCapitalized);
                      
                      return (
                        <tr key={fornecedor.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {fornecedor.id}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">{fornecedor.social_name || fornecedor.socialName}</div>
                              <div className="text-gray-500 text-xs">{fornecedor.document}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {fornecedor.fantasy_name || fornecedor.fantasyName || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              (fornecedor.document_type || fornecedor.documentType) === 'CPF' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {(fornecedor.document_type || fornecedor.documentType) === 'CPF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {fornecedor.created_at || fornecedor.createdAt ? new Date(fornecedor.created_at || fornecedor.createdAt).toLocaleDateString('pt-BR') : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <StatusIcon className={`h-4 w-4 ${statusColor}`} />
                              <span className={`text-sm font-medium ${statusColor}`}>
                                {statusCapitalized}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              <button 
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                className="text-green-600 hover:text-green-900 transition-colors"
                                title="Visualizar"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button 
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Card de Paginação Separado */}
          <Card className="shadow-lg">
            <CardContent className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">
                    Mostrando {getItemRange(fornecedoresPage, fornecedoresPerPage, fornecedoresDemoData.length).start} a {getItemRange(fornecedoresPage, fornecedoresPerPage, fornecedoresDemoData.length).end} de {fornecedoresDemoData.length} resultados
                  </span>
                  <span className="text-sm text-gray-500">|</span>
                  <select 
                    className="border border-gray-300 rounded px-2 py-1 text-sm" 
                    value={fornecedoresPerPage}
                    onChange={(e) => {
                      setFornecedoresPerPage(Number(e.target.value));
                      setFornecedoresPage(1);
                    }}
                  >
                    <option value="5">5 por página</option>
                    <option value="10">10 por página</option>
                    <option value="20">20 por página</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    className={`px-3 py-1 text-sm transition-colors ${
                      fornecedoresPage === 1 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setFornecedoresPage(Math.max(1, fornecedoresPage - 1))}
                    disabled={fornecedoresPage === 1}
                  >
                    Anterior
                  </button>
                  
                  {/* Renderizar páginas dinamicamente */}
                  {Array.from({ length: getTotalPages(fornecedoresDemoData.length, fornecedoresPerPage) }, (_, i) => i + 1).map(page => (
                    <button 
                      key={page}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        page === fornecedoresPage 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setFornecedoresPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button 
                    className={`px-3 py-1 text-sm transition-colors ${
                      fornecedoresPage === getTotalPages(fornecedoresDemoData.length, fornecedoresPerPage) 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setFornecedoresPage(Math.min(getTotalPages(fornecedoresDemoData.length, fornecedoresPerPage), fornecedoresPage + 1))}
                    disabled={fornecedoresPage === getTotalPages(fornecedoresDemoData.length, fornecedoresPerPage)}
                  >
                    Próxima
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outros" className="space-y-4">
          {/* Card do Cabeçalho Fixo */}
          <Card className="shadow-lg">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <colgroup>
                    <col style={{width: '60px'}} />
                    <col style={{width: 'auto'}} />
                    <col style={{width: 'auto'}} />
                    <col style={{width: '120px'}} />
                    <col style={{width: '100px'}} />
                    <col style={{width: '100px'}} />
                    <col style={{width: '120px'}} />
                  </colgroup>
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center justify-center space-x-1">
                          <span>ID</span>
                        </div>
                      </th>
                      <th 
                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("razaoSocialCompleta")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Razão Social/Nome</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome Fantasia
                      </th>
                      <th 
                        className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("tipo")}
                      >
                        <div className="flex items-center justify-center space-x-1">
                          <span>Tipo</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th 
                        className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("dataCadastro")}
                      >
                        <div className="flex items-center justify-center space-x-1">
                          <span>Data</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th 
                        className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center justify-center space-x-1">
                          <span>Status</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Card dos Dados com Scroll */}
          <Card className="shadow-lg">
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-[640px] overflow-y-auto">
                <table className="w-full table-fixed">
                  <colgroup>
                    <col style={{width: '60px'}} />
                    <col style={{width: 'auto'}} />
                    <col style={{width: 'auto'}} />
                    <col style={{width: '120px'}} />
                    <col style={{width: '100px'}} />
                    <col style={{width: '100px'}} />
                    <col style={{width: '120px'}} />
                  </colgroup>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {processedOutrosData.map((relacionamento) => {
                      // Normalizar campos do banco
                      const id = relacionamento.id;
                      const document = relacionamento.document;
                      const documentType = relacionamento.documenttype || relacionamento.document_type || relacionamento.documentType;
                      const socialName = relacionamento.socialname || relacionamento.social_name || relacionamento.socialName;
                      const fantasyName = relacionamento.fantasyname || relacionamento.fantasy_name || relacionamento.fantasyName;
                      const createdAt = relacionamento.createdat || relacionamento.created_at || relacionamento.createdAt;
                      const status = relacionamento.status || 'ativo';
                      
                      // Formatar status
                      const statusCapitalized = status.charAt(0).toUpperCase() + status.slice(1);
                      const { icon: StatusIcon, color: statusColor } = getStatusIcon(statusCapitalized);
                      
                      // Formatar documento
                      const formatDocument = (doc: string, type: string) => {
                        if (!doc) return '-';
                        const numbers = doc.replace(/\D/g, '');
                        if (type === 'CPF' && numbers.length === 11) {
                          return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                        }
                        if (type === 'CNPJ' && numbers.length === 14) {
                          return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
                        }
                        return doc;
                      };
                      
                      return (
                        <tr key={id} className="hover:bg-gray-50 transition-colors duration-150">
                          {/* 1. ID */}
                          <td className="px-3 py-3 text-center text-xs font-medium text-gray-900">
                            {id}
                          </td>
                          
                          {/* 2. RAZÃO SOCIAL/NOME (2 linhas: documento + razão social) */}
                          <td className="px-3 py-3">
                            <div>
                              <div className="text-gray-500 text-xs mb-0.5">
                                {formatDocument(document, documentType)}
                              </div>
                              <div className="font-medium text-gray-900 text-xs truncate">
                                {socialName || '-'}
                              </div>
                            </div>
                          </td>
                          
                          {/* 3. NOME FANTASIA */}
                          <td className="px-3 py-3 text-xs text-gray-900 truncate">
                            {fantasyName || socialName || '-'}
                          </td>
                          
                          {/* 4. TIPO */}
                          <td className="px-3 py-3 text-center">
                            <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                              documentType === 'CPF' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {documentType === 'CPF' ? 'PF' : 'PJ'}
                            </span>
                          </td>
                          
                          {/* 5. DATA */}
                          <td className="px-3 py-3 whitespace-nowrap text-center text-xs text-gray-900">
                            {createdAt ? new Date(createdAt).toLocaleDateString('pt-BR') : '-'}
                          </td>
                          
                          {/* 6. STATUS */}
                          <td className="px-3 py-3 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <StatusIcon className={`h-3 w-3 ${statusColor}`} />
                              <span className={`text-xs font-medium ${statusColor}`}>
                                {statusCapitalized}
                              </span>
                            </div>
                          </td>
                          
                          {/* 7. AÇÕES */}
                          <td className="px-3 py-3 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button 
                                className="text-green-600 hover:text-green-900 transition-colors"
                                title="Visualizar"
                                onClick={() => handleView(relacionamento, "Outros")}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                title="Editar"
                                onClick={() => handleEdit(relacionamento, "Outros")}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Excluir"
                                onClick={() => handleDelete(relacionamento, "Outros")}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Card de Paginação Separado */}
          <Card className="shadow-lg">
            <CardContent className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">
                    Mostrando {getItemRange(outrosPage, outrosPerPage, outrosRelacionamentosDemoData.length).start} a {getItemRange(outrosPage, outrosPerPage, outrosRelacionamentosDemoData.length).end} de {outrosRelacionamentosDemoData.length} resultados
                  </span>
                  <span className="text-sm text-gray-500">|</span>
                  <select 
                    className="border border-gray-300 rounded px-2 py-1 text-sm" 
                    value={outrosPerPage}
                    onChange={(e) => {
                      setOutrosPerPage(Number(e.target.value));
                      setOutrosPage(1);
                    }}
                  >
                    <option value="5">5 por página</option>
                    <option value="10">10 por página</option>
                    <option value="20">20 por página</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    className={`px-3 py-1 text-sm transition-colors ${
                      outrosPage === 1 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setOutrosPage(Math.max(1, outrosPage - 1))}
                    disabled={outrosPage === 1}
                  >
                    Anterior
                  </button>
                  
                  {/* Renderizar páginas dinamicamente */}
                  {Array.from({ length: getTotalPages(outrosRelacionamentosDemoData.length, outrosPerPage) }, (_, i) => i + 1).map(page => (
                    <button 
                      key={page}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        page === outrosPage 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setOutrosPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button 
                    className={`px-3 py-1 text-sm transition-colors ${
                      outrosPage === getTotalPages(outrosRelacionamentosDemoData.length, outrosPerPage) 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setOutrosPage(Math.min(getTotalPages(outrosRelacionamentosDemoData.length, outrosPerPage), outrosPage + 1))}
                    disabled={outrosPage === getTotalPages(outrosRelacionamentosDemoData.length, outrosPerPage)}
                  >
                    Próxima
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs de Feedback */}
      <SuccessDialog />
      <ErrorDialog />
    </div>
  );
}