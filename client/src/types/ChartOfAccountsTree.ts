/**
 * @fileoverview Classes e interfaces para representar a estrutura em árvore do Plano de Contas
 * 
 * Implementa uma estrutura hierárquica de até 3 níveis para organização contábil:
 * - Nível 1: Categoria principal (ex: Receitas, Despesas)
 * - Nível 2: Subcategoria (ex: Receitas Operacionais, Despesas Administrativas)
 * - Nível 3: Conta específica (ex: Vendas de Produtos, Material de Escritório)
 * 
 * @author Equipe Quantor
 * @version 1.0.0
 */

import { ChartOfAccount } from "@shared/schema";

/**
 * Interface para representar um nó da árvore do plano de contas
 */
export interface ChartOfAccountNode {
  id: number;
  code: string;
  name: string;
  type: 'receita' | 'despesa' | 'ativo' | 'passivo';
  level: number;
  parentId?: number;
  children: ChartOfAccountNode[];
  isActive: boolean;
  description?: string;
  category?: string;
  subcategory?: string;
}

/**
 * Classe para gerenciar a estrutura em árvore do plano de contas
 */
export class ChartOfAccountsTree {
  private nodes: Map<number, ChartOfAccountNode> = new Map();
  private rootNodes: ChartOfAccountNode[] = [];

  /**
   * Constrói a árvore a partir de uma lista de contas
   */
  constructor(accounts: ChartOfAccount[]) {
    this.buildTree(accounts);
  }

  /**
   * Constrói a estrutura em árvore a partir dos dados do banco
   */
  private buildTree(accounts: ChartOfAccount[]): void {
    // Primeiro, cria todos os nós
    accounts.forEach(account => {
      const node: ChartOfAccountNode = {
        id: account.id,
        code: account.code,
        name: account.name,
        type: account.type as 'receita' | 'despesa' | 'ativo' | 'passivo',
        level: account.level,
        parentId: account.parentId || undefined,
        children: [],
        isActive: account.isActive,
        description: account.description || undefined,
        category: account.category || undefined,
        subcategory: account.subcategory || undefined,
      };
      this.nodes.set(account.id, node);
    });

    // Depois, estabelece as relações pai-filho
    this.nodes.forEach(node => {
      if (node.parentId) {
        const parent = this.nodes.get(node.parentId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        this.rootNodes.push(node);
      }
    });

    // Ordena os nós por código
    this.sortNodes();
  }

  /**
   * Ordena os nós por código em cada nível
   */
  private sortNodes(): void {
    const sortByCode = (nodes: ChartOfAccountNode[]) => {
      nodes.sort((a, b) => a.code.localeCompare(b.code));
      nodes.forEach(node => sortByCode(node.children));
    };

    sortByCode(this.rootNodes);
  }

  /**
   * Retorna todos os nós raiz (nível 1)
   */
  getRootNodes(): ChartOfAccountNode[] {
    return this.rootNodes;
  }

  /**
   * Retorna uma lista plana de todos os nós ordenados hierarquicamente
   */
  getFlattenedNodes(): ChartOfAccountNode[] {
    const flattened: ChartOfAccountNode[] = [];
    
    const addNode = (node: ChartOfAccountNode) => {
      flattened.push(node);
      node.children.forEach(child => addNode(child));
    };

    this.rootNodes.forEach(root => addNode(root));
    return flattened;
  }

  /**
   * Encontra um nó pelo ID
   */
  findNodeById(id: number): ChartOfAccountNode | undefined {
    return this.nodes.get(id);
  }

  /**
   * Retorna o caminho completo de um nó (categoria > subcategoria > conta)
   */
  getNodePath(nodeId: number): string {
    const node = this.findNodeById(nodeId);
    if (!node) return '';

    const path: string[] = [];
    let current: ChartOfAccountNode | undefined = node;

    while (current) {
      path.unshift(current.name);
      current = current.parentId ? this.findNodeById(current.parentId) : undefined;
    }

    return path.join(' > ');
  }

  /**
   * Retorna todas as categorias principais (nível 1)
   */
  getCategories(): ChartOfAccountNode[] {
    return this.rootNodes.filter(node => node.level === 1);
  }

  /**
   * Retorna subcategorias de uma categoria específica (nível 2)
   */
  getSubcategories(categoryId: number): ChartOfAccountNode[] {
    const category = this.findNodeById(categoryId);
    return category ? category.children.filter(node => node.level === 2) : [];
  }

  /**
   * Retorna contas específicas de uma subcategoria (nível 3)
   */
  getAccounts(subcategoryId: number): ChartOfAccountNode[] {
    const subcategory = this.findNodeById(subcategoryId);
    return subcategory ? subcategory.children.filter(node => node.level === 3) : [];
  }

  /**
   * Calcula a indentação visual baseada no nível do nó
   */
  getIndentationLevel(node: ChartOfAccountNode): number {
    return (node.level - 1) * 20; // 20px de indentação por nível
  }

  /**
   * Verifica se um nó pode ter filhos (máximo 3 níveis)
   */
  canHaveChildren(node: ChartOfAccountNode): boolean {
    return node.level < 3;
  }

  /**
   * Gera o próximo código disponível para um novo nó
   */
  generateNextCode(parentId?: number): string {
    if (!parentId) {
      // Código para nível 1
      const rootCodes = this.rootNodes.map(node => parseInt(node.code.split('.')[0]));
      const maxCode = rootCodes.length > 0 ? Math.max(...rootCodes) : 0;
      return (maxCode + 1).toString();
    }

    const parent = this.findNodeById(parentId);
    if (!parent) return '1';

    if (parent.level === 1) {
      // Código para nível 2
      const childCodes = parent.children.map(child => parseInt(child.code.split('.')[1]));
      const maxCode = childCodes.length > 0 ? Math.max(...childCodes) : 0;
      return `${parent.code}.${maxCode + 1}`;
    }

    if (parent.level === 2) {
      // Código para nível 3
      const childCodes = parent.children.map(child => parseInt(child.code.split('.')[2]));
      const maxCode = childCodes.length > 0 ? Math.max(...childCodes) : 0;
      return `${parent.code}.${(maxCode + 1).toString().padStart(3, '0')}`;
    }

    return '1';
  }
}

/**
 * Dados de exemplo para demonstração
 */
export const SAMPLE_CHART_OF_ACCOUNTS: ChartOfAccount[] = [
  // Nível 1 - Categorias principais
  { id: 1, userId: '1', parentId: null, code: '1', name: 'Receitas', type: 'receita', level: 1, isActive: true, category: 'Receitas', subcategory: null, description: 'Todas as receitas da empresa', createdAt: new Date() },
  { id: 2, userId: '1', parentId: null, code: '2', name: 'Despesas', type: 'despesa', level: 1, isActive: true, category: 'Despesas', subcategory: null, description: 'Todas as despesas da empresa', createdAt: new Date() },
  
  // Nível 2 - Subcategorias
  { id: 3, userId: '1', parentId: 1, code: '1.1', name: 'Receitas Operacionais', type: 'receita', level: 2, isActive: true, category: 'Receitas', subcategory: 'Receitas Operacionais', description: 'Receitas da atividade principal', createdAt: new Date() },
  { id: 4, userId: '1', parentId: 1, code: '1.2', name: 'Receitas Não Operacionais', type: 'receita', level: 2, isActive: true, category: 'Receitas', subcategory: 'Receitas Não Operacionais', description: 'Receitas de outras atividades', createdAt: new Date() },
  { id: 5, userId: '1', parentId: 2, code: '2.1', name: 'Despesas Administrativas', type: 'despesa', level: 2, isActive: true, category: 'Despesas', subcategory: 'Despesas Administrativas', description: 'Gastos administrativos', createdAt: new Date() },
  { id: 6, userId: '1', parentId: 2, code: '2.2', name: 'Despesas Operacionais', type: 'despesa', level: 2, isActive: true, category: 'Despesas', subcategory: 'Despesas Operacionais', description: 'Gastos operacionais', createdAt: new Date() },
  
  // Nível 3 - Contas específicas
  { id: 7, userId: '1', parentId: 3, code: '1.1.001', name: 'Vendas de Produtos', type: 'receita', level: 3, isActive: true, category: 'Receitas', subcategory: 'Receitas Operacionais', description: 'Receita com vendas de produtos', createdAt: new Date() },
  { id: 8, userId: '1', parentId: 3, code: '1.1.002', name: 'Prestação de Serviços', type: 'receita', level: 3, isActive: true, category: 'Receitas', subcategory: 'Receitas Operacionais', description: 'Receita com serviços prestados', createdAt: new Date() },
  { id: 9, userId: '1', parentId: 4, code: '1.2.001', name: 'Rendimentos Financeiros', type: 'receita', level: 3, isActive: true, category: 'Receitas', subcategory: 'Receitas Não Operacionais', description: 'Juros e rendimentos', createdAt: new Date() },
  { id: 10, userId: '1', parentId: 5, code: '2.1.001', name: 'Material de Escritório', type: 'despesa', level: 3, isActive: true, category: 'Despesas', subcategory: 'Despesas Administrativas', description: 'Gastos com material de escritório', createdAt: new Date() },
  { id: 11, userId: '1', parentId: 5, code: '2.1.002', name: 'Salários e Encargos', type: 'despesa', level: 3, isActive: true, category: 'Despesas', subcategory: 'Despesas Administrativas', description: 'Folha de pagamento', createdAt: new Date() },
  { id: 12, userId: '1', parentId: 6, code: '2.2.001', name: 'Energia Elétrica', type: 'despesa', level: 3, isActive: true, category: 'Despesas', subcategory: 'Despesas Operacionais', description: 'Conta de energia elétrica', createdAt: new Date() },
];