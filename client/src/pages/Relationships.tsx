import { useState, useEffect, useRef } from "react";
import { Plus, Users, Building, Phone, Mail, MapPin, User, CheckCircle, XCircle, AlertCircle, Ban, Edit, Eye, Trash2, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Dados demonstrativos para clientes
const clientesDemoData = [
  {
    id: 3,
    razaoSocial: "46.761.162/0001-43",
    razaoSocialCompleta: "COD3S TECNOLOGIA LTDA",
    nomeFantasia: "Antonio Neptuno das Chagas Junior",
    tipo: "Pessoa Jurídica",
    dataCadastro: "26/05/2025",
    status: "Ativo"
  },
  {
    id: 4,
    razaoSocial: "811.176.801-00",
    razaoSocialCompleta: "Antonio Neptuno das Chagas Junior",
    nomeFantasia: "-",
    tipo: "Pessoa Física",
    dataCadastro: "13/06/2025", 
    status: "Ativo"
  },
  {
    id: 5,
    razaoSocial: "31.087.926/0001-90",
    razaoSocialCompleta: "CM SOLUTI LTDA",
    nomeFantasia: "-",
    tipo: "Pessoa Jurídica",
    dataCadastro: "15/06/2025",
    status: "Ativo"
  },
  {
    id: 6,
    razaoSocial: "01.298.382/0001-44",
    razaoSocialCompleta: "GUIMARAES BORGES COMERCIO DE DERIVADOS DE PETROLEO LTDA",
    nomeFantasia: "-",
    tipo: "Pessoa Jurídica",
    dataCadastro: "01/07/2025",
    status: "Inativo"
  },
  {
    id: 7,
    razaoSocial: "01.298.382/0003-06",
    razaoSocialCompleta: "GUIMARAES BORGES COMERCIO DE DERIVADOS DE PETROLEO LTDA",
    nomeFantasia: "-",
    tipo: "Pessoa Jurídica",
    dataCadastro: "01/07/2025",
    status: "Bloqueado"
  },
  {
    id: 8,
    razaoSocial: "34.659.184/0001-18",
    razaoSocialCompleta: "AUTO POSTO GREEN PARK LTDA",
    nomeFantasia: "-",
    tipo: "Pessoa Jurídica",
    dataCadastro: "01/07/2025",
    status: "Cancelado"
  }
];

// Dados demonstrativos para fornecedores
const fornecedoresDemoData = [
  {
    id: 1,
    razaoSocial: "12.345.678/0001-90",
    razaoSocialCompleta: "EMPRESA FORNECEDORA DE MATERIAIS LTDA",
    nomeFantasia: "FORNECEDORA MATERIAIS",
    tipo: "Pessoa Jurídica",
    dataCadastro: "12/01/2025",
    status: "Ativo"
  },
  {
    id: 2,
    razaoSocial: "98.765.432/0001-10",
    razaoSocialCompleta: "DISTRIBUIDORA DE EQUIPAMENTOS SA",
    nomeFantasia: "DISTRIBUIDORA TECH",
    tipo: "Pessoa Jurídica",
    dataCadastro: "15/01/2025",
    status: "Ativo"
  },
  {
    id: 3,
    razaoSocial: "555.666.777-88",
    razaoSocialCompleta: "João Silva Santos",
    nomeFantasia: "Prestador Autônomo",
    tipo: "Pessoa Física",
    dataCadastro: "20/01/2025",
    status: "Inativo"
  }
];

// Dados demonstrativos para outros relacionamentos
const outrosRelacionamentosDemoData = [
  {
    id: 1,
    razaoSocial: "11.222.333/0001-44",
    razaoSocialCompleta: "PARCEIROS COMERCIAIS LTDA",
    nomeFantasia: "PARCEIROS COM",
    tipo: "Pessoa Jurídica",
    dataCadastro: "05/01/2025",
    status: "Ativo"
  },
  {
    id: 2,
    razaoSocial: "444.555.666-77",
    razaoSocialCompleta: "Maria Fernanda Costa",
    nomeFantasia: "Consultora Freelancer",
    tipo: "Pessoa Física",
    dataCadastro: "10/01/2025",
    status: "Bloqueado"
  }
];

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

        <TabsContent value="clientes" className="space-y-6">
          {/* Card com lista de clientes */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-0">
              {/* Cabeçalho da tabela */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <span>#</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <span>Razão Social | Nome</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome Fantasia
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <span>Tipo</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <span>Data</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <span>Status</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clientesDemoData.map((cliente, index) => {
                      const { icon: StatusIcon, color: statusColor } = getStatusIcon(cliente.status);
                      return (
                        <tr key={cliente.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {cliente.id}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">{cliente.razaoSocial}</div>
                              <div className="text-gray-500 text-xs">{cliente.razaoSocialCompleta}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {cliente.nomeFantasia}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              cliente.tipo === 'Pessoa Física' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {cliente.tipo === 'Pessoa Física' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {cliente.dataCadastro}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <StatusIcon className={`h-4 w-4 ${statusColor}`} />
                              <span className={`text-sm font-medium ${statusColor}`}>
                                {cliente.status}
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
                  <span className="text-sm text-gray-700">Mostrando</span>
                  <select className="border border-gray-300 rounded px-2 py-1 text-sm" defaultValue="10">
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                  </select>
                  <span className="text-sm text-gray-700">de {clientesDemoData.length} resultados</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                    Anterior
                  </button>
                  <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                    1
                  </button>
                  <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                    2
                  </button>
                  <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                    3
                  </button>
                  <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                    Próxima
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fornecedores" className="space-y-6">
          {/* Card com lista de fornecedores */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <span>#</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <span>Razão Social | Nome</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome Fantasia
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <span>Tipo</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <span>Data</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <span>Status</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {fornecedoresDemoData.map((fornecedor, index) => {
                      const { icon: StatusIcon, color: statusColor } = getStatusIcon(fornecedor.status);
                      return (
                        <tr key={fornecedor.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {fornecedor.id}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">{fornecedor.razaoSocial}</div>
                              <div className="text-gray-500 text-xs">{fornecedor.razaoSocialCompleta}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {fornecedor.nomeFantasia}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              fornecedor.tipo === 'Pessoa Física' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {fornecedor.tipo === 'Pessoa Física' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {fornecedor.dataCadastro}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <StatusIcon className={`h-4 w-4 ${statusColor}`} />
                              <span className={`text-sm font-medium ${statusColor}`}>
                                {fornecedor.status}
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
                  <span className="text-sm text-gray-700">Mostrando</span>
                  <select className="border border-gray-300 rounded px-2 py-1 text-sm" defaultValue="10">
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                  </select>
                  <span className="text-sm text-gray-700">de {fornecedoresDemoData.length} resultados</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                    Anterior
                  </button>
                  <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                    1
                  </button>
                  <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                    Próxima
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outros" className="space-y-6">
          {/* Card com lista de outros relacionamentos */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <span>#</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <span>Razão Social | Nome</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome Fantasia
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <span>Tipo</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <span>Data</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <span>Status</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {outrosRelacionamentosDemoData.map((relacionamento, index) => {
                      const { icon: StatusIcon, color: statusColor } = getStatusIcon(relacionamento.status);
                      return (
                        <tr key={relacionamento.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {relacionamento.id}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">{relacionamento.razaoSocial}</div>
                              <div className="text-gray-500 text-xs">{relacionamento.razaoSocialCompleta}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {relacionamento.nomeFantasia}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              relacionamento.tipo === 'Pessoa Física' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {relacionamento.tipo === 'Pessoa Física' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {relacionamento.dataCadastro}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <StatusIcon className={`h-4 w-4 ${statusColor}`} />
                              <span className={`text-sm font-medium ${statusColor}`}>
                                {relacionamento.status}
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
                  <span className="text-sm text-gray-700">Mostrando</span>
                  <select className="border border-gray-300 rounded px-2 py-1 text-sm" defaultValue="10">
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                  </select>
                  <span className="text-sm text-gray-700">de {outrosRelacionamentosDemoData.length} resultados</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                    Anterior
                  </button>
                  <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                    1
                  </button>
                  <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                    Próxima
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}