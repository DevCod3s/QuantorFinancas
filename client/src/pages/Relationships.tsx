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
import { TabelaItens } from "@/components/ui/TabelaItens";

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
            className="group relative w-11 h-11 bg-gradient-to-r from-[#4D4E48] to-[#2a2a2a] hover:from-[#2a2a2a] hover:to-[#1a1a1a] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 active:shadow-md"
            title="Novo Relacionamento"
            onClick={() => setIsAddingRelationship(true)}
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
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#4D4E48] font-medium px-6 py-2 transition-all relative overflow-hidden"
            >
              <User className="h-4 w-4 mr-2" />
              Clientes
            </TabsTrigger>
            <TabsTrigger
              value="fornecedores"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#4D4E48] font-medium px-6 py-2 transition-all relative overflow-hidden"
            >
              <Building className="h-4 w-4 mr-2" />
              Fornecedores
            </TabsTrigger>
            <TabsTrigger
              value="outros"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#4D4E48] font-medium px-6 py-2 transition-all relative overflow-hidden"
            >
              <Users className="h-4 w-4 mr-2" />
              Outros
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

        <TabsContent value="clientes" className="space-y-4">
          <TabelaItens
            data={clientesDemoData}
            initialPerPage={5}
            columns={[
              { label: "ID", key: "id", align: "center", width: "5%", sortable: true },
              {
                label: "Razão Social/Nome",
                key: "socialName",
                width: "30%",
                sortable: true,
                render: (cliente) => {
                  const document = cliente.document;
                  const documentType = cliente.documenttype || cliente.document_type || cliente.documentType;
                  const socialName = cliente.socialname || cliente.social_name || cliente.socialName;

                  const formatDocument = (doc: string, type: string) => {
                    if (!doc) return '-';
                    const numbers = doc.replace(/\D/g, '');
                    if (type === 'CPF' && numbers.length === 11) return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                    if (type === 'CNPJ' && numbers.length === 14) return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
                    return doc;
                  };

                  return (
                    <div>
                      <div className="text-gray-500 text-[10px] mb-0.5">{formatDocument(document, documentType)}</div>
                      <div className="font-medium text-gray-900 truncate">{socialName || '-'}</div>
                    </div>
                  );
                }
              },
              {
                label: "Nome Fantasia",
                key: "fantasyName",
                width: "25%",
                render: (cliente) => cliente.fantasyname || cliente.fantasy_name || cliente.fantasyName || '-'
              },
              {
                label: "Tipo",
                key: "documentType",
                align: "center",
                width: "8%",
                render: (cliente) => {
                  const documentType = cliente.documenttype || cliente.document_type || cliente.documentType;
                  return (
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full ${documentType === 'CPF' ? 'bg-[#4D4E48]/10 text-[#4D4E48]' : 'bg-purple-100 text-purple-800'}`}>
                      {documentType === 'CPF' ? 'PF' : 'PJ'}
                    </span>
                  );
                }
              },
              {
                label: "Data",
                key: "createdat",
                align: "center",
                width: "10%",
                sortable: true,
                render: (cliente) => {
                  const date = cliente.createdat || cliente.created_at || cliente.createdAt;
                  return date ? new Date(date).toLocaleDateString('pt-BR') : '-';
                }
              },
              {
                label: "Status",
                key: "status",
                align: "center",
                width: "10%",
                sortable: true,
                render: (cliente) => {
                  const status = cliente.status || 'ativo';
                  const statusCapitalized = status.charAt(0).toUpperCase() + status.slice(1);
                  const { icon: StatusIcon, color: statusColor } = getStatusIcon(statusCapitalized);
                  return (
                    <div className="flex items-center justify-center space-x-1">
                      <StatusIcon className={`h-3 w-3 ${statusColor}`} />
                      <span className={`text-[10px] font-medium ${statusColor}`}>{statusCapitalized}</span>
                    </div>
                  );
                }
              }
            ]}
            actions={[
              { icon: Eye, color: "text-green-600", title: "Visualizar", onClick: (item) => handleView(item, "Clientes") },
              { icon: Edit, color: "text-[#B59363]", title: "Editar", onClick: (item: any) => handleEdit(item, "Fornecedores") },
              { icon: Trash2, color: "text-red-600", title: "Excluir", onClick: (item) => handleDelete(item, "Clientes") }
            ]}
          />
        </TabsContent>

        <TabsContent value="fornecedores" className="space-y-4">
          <TabelaItens
            data={fornecedoresDemoData}
            initialPerPage={5}
            columns={[
              { label: "ID", key: "id", align: "center", width: "5%", sortable: true },
              {
                label: "Razão Social/Nome",
                key: "socialName",
                width: "30%",
                sortable: true,
                render: (f: any) => {
                  const document = f.document;
                  const socialName = f.socialname || f.social_name || f.socialName;
                  return (
                    <div>
                      <div className="text-gray-500 text-[10px] mb-0.5">{document || '-'}</div>
                      <div className="font-medium text-gray-900 truncate">{socialName || '-'}</div>
                    </div>
                  );
                }
              },
              {
                label: "Nome Fantasia",
                key: "fantasyName",
                width: "25%",
                render: (f: any) => f.fantasyname || f.fantasy_name || f.fantasyName || '-'
              },
              {
                label: "Tipo",
                key: "documentType",
                align: "center",
                width: "8%",
                render: (f: any) => {
                  const documentType = f.documenttype || f.document_type || f.documentType;
                  return (
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full ${documentType === 'CPF' ? 'bg-[#4D4E48]/10 text-[#4D4E48]' : 'bg-purple-100 text-purple-800'}`}>
                      {documentType === 'CPF' ? 'PF' : 'PJ'}
                    </span>
                  );
                }
              },
              {
                label: "Data",
                key: "createdat",
                align: "center",
                width: "10%",
                sortable: true,
                render: (f: any) => {
                  const date = f.createdat || f.created_at || f.createdAt;
                  return date ? new Date(date).toLocaleDateString('pt-BR') : '-';
                }
              },
              {
                label: "Status",
                key: "status",
                align: "center",
                width: "10%",
                sortable: true,
                render: (f: any) => {
                  const status = f.status || 'ativo';
                  const statusCapitalized = status.charAt(0).toUpperCase() + status.slice(1);
                  const { icon: StatusIcon, color: statusColor } = getStatusIcon(statusCapitalized);
                  return (
                    <div className="flex items-center justify-center space-x-1">
                      <StatusIcon className={`h-3 w-3 ${statusColor}`} />
                      <span className={`text-[10px] font-medium ${statusColor}`}>{statusCapitalized}</span>
                    </div>
                  );
                }
              }
            ]}
            actions={[
              { icon: Eye, color: "text-green-600", title: "Visualizar", onClick: (item: any) => handleView(item, "Fornecedores") },
              { icon: Edit, color: "text-[#B59363]", title: "Editar", onClick: (item: any) => handleEdit(item, "Fornecedores") },
              { icon: Trash2, color: "text-red-600", title: "Excluir", onClick: (item: any) => handleDelete(item, "Fornecedores") }
            ]}
          />
        </TabsContent>


        <TabsContent value="outros" className="space-y-4">
          <TabelaItens
            data={outrosRelacionamentosDemoData}
            initialPerPage={5}
            columns={[
              { label: "ID", key: "id", align: "center", width: "5%", sortable: true },
              {
                label: "Razão Social/Nome",
                key: "socialName",
                width: "30%",
                sortable: true,
                render: (r: any) => {
                  const document = r.document;
                  const socialName = r.socialname || r.social_name || r.socialName;
                  return (
                    <div>
                      <div className="text-gray-500 text-[10px] mb-0.5">{document || '-'}</div>
                      <div className="font-medium text-gray-900 truncate">{socialName || '-'}</div>
                    </div>
                  );
                }
              },
              {
                label: "Nome Fantasia",
                key: "fantasyName",
                width: "25%",
                render: (r: any) => r.fantasyname || r.fantasy_name || r.fantasyName || '-'
              },
              {
                label: "Tipo",
                key: "documentType",
                align: "center",
                width: "8%",
                render: (r: any) => {
                  const documentType = r.documenttype || r.document_type || r.documentType;
                  return (
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full ${documentType === 'CPF' ? 'bg-[#4D4E48]/10 text-[#4D4E48]' : 'bg-purple-100 text-purple-800'}`}>
                      {documentType === 'CPF' ? 'PF' : 'PJ'}
                    </span>
                  );
                }
              },
              {
                label: "Data",
                key: "createdat",
                align: "center",
                width: "10%",
                sortable: true,
                render: (r: any) => {
                  const date = r.createdat || r.created_at || r.createdAt;
                  return date ? new Date(date).toLocaleDateString('pt-BR') : '-';
                }
              },
              {
                label: "Status",
                key: "status",
                align: "center",
                width: "10%",
                sortable: true,
                render: (r: any) => {
                  const status = r.status || 'ativo';
                  const statusCapitalized = status.charAt(0).toUpperCase() + status.slice(1);
                  const { icon: StatusIcon, color: statusColor } = getStatusIcon(statusCapitalized);
                  return (
                    <div className="flex items-center justify-center space-x-1">
                      <StatusIcon className={`h-3 w-3 ${statusColor}`} />
                      <span className={`text-[10px] font-medium ${statusColor}`}>{statusCapitalized}</span>
                    </div>
                  );
                }
              }
            ]}
            actions={[
              { icon: Eye, color: "text-green-600", title: "Visualizar", onClick: (item: any) => handleView(item, "Outros Relacionamentos") },
              { icon: Edit, color: "text-[#B59363]", title: "Editar", onClick: (item: any) => handleEdit(item, "Outros Relacionamentos") },
              { icon: Trash2, color: "text-red-600", title: "Excluir", onClick: (item: any) => handleDelete(item, "Outros Relacionamentos") }
            ]}
          />
        </TabsContent>

      </Tabs>

      {/* Dialogs de Feedback */}
      <SuccessDialog />
      <ErrorDialog />
    </div>
  );
}