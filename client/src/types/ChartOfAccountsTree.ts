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
  { id: 1, type: "receita", name: "Receitas Operacionais", level: 1, userId: 1, code: '1', isActive: true, createdAt: new Date(), parentId: null, category: null, subcategory: null, description: null },
  { id: 2, type: "receita", name: "Serviços Contábeis", parentId: 1, level: 2, userId: 1, code: '1.1', isActive: true, createdAt: new Date(), category: null, subcategory: null, description: null },
  { id: 3, type: "receita", name: "Honorários Mensais", parentId: 2, level: 3, userId: 1, code: '1.1.001', isActive: true, createdAt: new Date(), category: null, subcategory: null, description: null },
  { id: 4, type: "receita", name: "Consultoria", parentId: 2, level: 3, userId: 1, code: '1.1.002', isActive: true, createdAt: new Date(), category: null, subcategory: null, description: null },
  { id: 5, type: "despesa", name: "Despesas Operacionais", level: 1, userId: 1, code: '2', isActive: true, createdAt: new Date(), parentId: null, category: null, subcategory: null, description: null },
  { id: 6, type: "despesa", name: "Pessoal", parentId: 5, level: 2, userId: 1, code: '2.1', isActive: true, createdAt: new Date(), category: null, subcategory: null, description: null },
  { id: 7, type: "despesa", name: "Salários", parentId: 6, level: 3, userId: 1, code: '2.1.001', isActive: true, createdAt: new Date(), category: null, subcategory: null, description: null },
  { id: 8, type: "despesa", name: "Encargos Sociais", parentId: 6, level: 3, userId: 1, code: '2.1.002', isActive: true, createdAt: new Date(), category: null, subcategory: null, description: null },
  { id: 9, type: "despesa", name: "Administrativas", parentId: 5, level: 2, userId: 1, code: '2.2', isActive: true, createdAt: new Date(), category: null, subcategory: null, description: null },
  { id: 10, type: "despesa", name: "Aluguel", parentId: 9, level: 3, userId: 1, code: '2.2.001', isActive: true, createdAt: new Date(), category: null, subcategory: null, description: null },
  { id: 11, type: "despesa", name: "Energia Elétrica", parentId: 9, level: 3, userId: 1, code: '2.2.002', isActive: true, createdAt: new Date(), category: null, subcategory: null, description: null },
  { id: 12, type: "despesa", name: "Internet e Telefonia", parentId: 9, level: 3, userId: 1, code: '2.2.003', isActive: true, createdAt: new Date(), category: null, subcategory: null, description: null },
  { id: 13, type: "despesa", name: "Impostos e Taxas", level: 1, userId: 1, code: '3', isActive: true, createdAt: new Date(), parentId: null, category: null, subcategory: null, description: null },
  { id: 14, type: "despesa", name: "Simples Nacional", parentId: 13, level: 2, userId: 1, code: '3.1', isActive: true, createdAt: new Date(), category: null, subcategory: null, description: null },
  { id: 15, type: "despesa", name: "ISS", parentId: 13, level: 2, userId: 1, code: '3.2', isActive: true, createdAt: new Date(), category: null, subcategory: null, description: null },
  { id: 16, type: "despesa", name: "Despesas Financeiras", level: 1, userId: 1, code: '4', isActive: true, createdAt: new Date(), parentId: null, category: null, subcategory: null, description: null },
  { id: 17, type: "despesa", name: "Tarifas Bancárias", parentId: 16, level: 2, userId: 1, code: '4.1', isActive: true, createdAt: new Date(), category: null, subcategory: null, description: null }
];