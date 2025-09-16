export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  userId: string;
  name: string;
  type: 'receita' | 'despesa';
  icon: string;
  color: string;
  createdAt: string;
}

export interface ChartAccount {
  id: number;
  userId: string;
  parentId?: number;
  code: string;
  name: string;
  type: string;
  category?: string;
  subcategory?: string;
  level: number;
  isActive: boolean;
  description?: string;
}

export interface Transaction {
  id: number;
  userId: string;
  type: 'receita' | 'despesa';
  amount: string;
  date: string;
  categoryId?: number;
  chartAccountId?: number;
  description: string;
  notes?: string;
  createdAt: string;
  category?: Category;
}

export interface Budget {
  id: number;
  userId: string;
  categoryId: number;
  budgetedAmount: string;
  period: 'mensal' | 'anual';
  startDate: string;
  endDate: string;
  createdAt: string;
  category?: Category;
}

export interface AiInteraction {
  id: number;
  userId: string;
  message: string;
  response: string;
  createdAt: string;
}

export interface DashboardData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  recentTransactions: Transaction[];
  expensesByCategory: Array<{
    category: string;
    amount: number;
    color: string;
  }>;
  monthlyTrends: Array<{
    month: string;
    income: number;
    expenses: number;
  }>;
}

export interface TabType {
  id: string;
  label: string;
  icon: string;
}

export const TABS: TabType[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-home' },
  { id: 'transactions', label: 'Transações', icon: 'fas fa-exchange-alt' },
  { id: 'budgets', label: 'Orçamentos', icon: 'fas fa-wallet' },
  { id: 'reports', label: 'Relatórios', icon: 'fas fa-chart-bar' },
  { id: 'ai-assistant', label: 'Assistente IA', icon: 'fas fa-robot' },
];
