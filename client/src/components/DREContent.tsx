import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChartOfAccountsTree, ChartOfAccountNode } from "@/types/ChartOfAccountsTree";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { IButtonPrime } from "@/components/ui/i-ButtonPrime";
import { 
  ChevronRight, ChevronDown, TrendingUp, TrendingDown, Activity, 
  Calendar, Settings, ChevronLeft, Coins, Scale, FileDown 
} from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DREContentProps {
  transactions: any[];
  formatCurrencyNumber: (value: number) => string;
}

interface DRELineItem {
  id: number;
  code: string;
  name: string;
  level: number;
  type: string;
  value: number;
  children: DRELineItem[];
  isLeaf: boolean;
}

// Helper para converter string de data para Date local sem fuso
function toLocalDate(dateStr: string | Date): Date {
  if (dateStr instanceof Date) return dateStr;
  if (typeof dateStr === 'string') {
    if (dateStr.includes('T')) {
      const d = new Date(dateStr);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date();
}

export function DREContent({ transactions, formatCurrencyNumber }: DREContentProps) {
  // Estado de controles de período e regime
  const [regimeContabil, setRegimeContabil] = useState<'caixa' | 'competencia'>('competencia');
  const [filterPeriod, setFilterPeriod] = useState<string>('Mensal');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [periodStartDate, setPeriodStartDate] = useState<Date>(startOfMonth(new Date()));
  const [periodEndDate, setPeriodEndDate] = useState<Date>(endOfMonth(new Date()));

  // Query para buscar plano de contas
  const { data: chartAccounts = [] } = useQuery<any[]>({
    queryKey: ['/api/chart-accounts'],
    queryFn: () => fetch('/api/chart-accounts', { credentials: 'include' }).then(res => res.json()),
  });

  // Construir árvore do plano de contas
  const chartTree = useMemo(() => {
    if (!chartAccounts.length) return null;
    return new ChartOfAccountsTree(chartAccounts);
  }, [chartAccounts]);

  // Helper de data efetiva (regime contábil)
  const getEffectiveDate = (t: any): Date => {
    if (regimeContabil === 'caixa' && t.status === 'pago' && t.liquidationDate) {
      return toLocalDate(t.liquidationDate);
    }
    return toLocalDate(t.date);
  };

  // Calcular range de datas
  const getFilterDateRange = (): { start: Date; end: Date } => {
    const refDate = selectedDate || new Date();
    switch (filterPeriod) {
      case 'Mensal': {
        return { start: startOfMonth(refDate), end: endOfMonth(refDate) };
      }
      case 'Anual': {
        return { start: startOfYear(refDate), end: endOfYear(refDate) };
      }
      case 'Semanal': {
        return { start: startOfWeek(refDate, { weekStartsOn: 1 }), end: endOfWeek(refDate, { weekStartsOn: 1 }) };
      }
      case 'Diário': {
        const s = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());
        const e = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate(), 23, 59, 59, 999);
        return { start: s, end: e };
      }
      case 'Período': {
        return { start: periodStartDate, end: periodEndDate };
      }
      default:
        return { start: startOfMonth(refDate), end: endOfMonth(refDate) };
    }
  };

  // Navegação de período
  const navigatePeriod = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => {
      const d = new Date(prev);
      const delta = direction === 'prev' ? -1 : 1;
      switch (filterPeriod) {
        case 'Diário': d.setDate(d.getDate() + delta); break;
        case 'Semanal': d.setDate(d.getDate() + (delta * 7)); break;
        case 'Mensal': d.setMonth(d.getMonth() + delta); break;
        case 'Anual': d.setFullYear(d.getFullYear() + delta); break;
      }
      return d;
    });
  };

  // Título do período
  const displayTitle = useMemo(() => {
    const refDate = selectedDate;
    switch (filterPeriod) {
      case 'Diário': return format(refDate, "dd 'de' MMMM", { locale: ptBR });
      case 'Semanal': {
        const s = startOfWeek(refDate, { weekStartsOn: 1 });
        const e = endOfWeek(refDate, { weekStartsOn: 1 });
        return `${format(s, 'dd/MM')} - ${format(e, 'dd/MM')}`;
      }
      case 'Mensal': return format(refDate, "MMMM 'de' yyyy", { locale: ptBR });
      case 'Anual': return format(refDate, 'yyyy');
      case 'Período': return `${format(periodStartDate, 'dd/MM')} - ${format(periodEndDate, 'dd/MM')}`;
      default: return '';
    }
  }, [selectedDate, filterPeriod, periodStartDate, periodEndDate]);

  // Filtrar transações pelo regime e período
  const filteredTransactions = useMemo(() => {
    const { start, end } = getFilterDateRange();
    
    // Regime de caixa: apenas liquidadas
    const regimeFiltered = regimeContabil === 'caixa'
      ? transactions.filter((t: any) => t.status === 'pago')
      : transactions;

    return regimeFiltered.filter((t: any) => {
      const tDate = getEffectiveDate(t);
      return tDate >= start && tDate <= end;
    });
  }, [transactions, regimeContabil, selectedDate, filterPeriod, periodStartDate, periodEndDate]);

  // Agrupar valores por chartAccountId
  const valuesByChartAccountId = useMemo(() => {
    const map: Record<number, number> = {};
    filteredTransactions.forEach((t: any) => {
      if (!t.chartAccountId) return;
      const amount = parseFloat(t.amount || '0');
      if (!map[t.chartAccountId]) map[t.chartAccountId] = 0;
      map[t.chartAccountId] += amount;
    });
    return map;
  }, [filteredTransactions]);

  // Transações sem conta do plano
  const unclassifiedTransactions = useMemo(() => {
    return filteredTransactions.filter((t: any) => !t.chartAccountId);
  }, [filteredTransactions]);

  const unclassifiedIncome = useMemo(() => {
    return unclassifiedTransactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
  }, [unclassifiedTransactions]);

  const unclassifiedExpense = useMemo(() => {
    return unclassifiedTransactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
  }, [unclassifiedTransactions]);

  // Calcular valor recursivo de um nó (próprio + filhos)
  const getNodeTotal = (node: ChartOfAccountNode): number => {
    let total = valuesByChartAccountId[node.id] || 0;
    node.children.forEach(child => {
      total += getNodeTotal(child);
    });
    return total;
  };

  // Montar DRE hierárquico
  const dreData = useMemo(() => {
    if (!chartTree) return { receitas: [] as ChartOfAccountNode[], despesas: [] as ChartOfAccountNode[], totalReceitas: 0, totalDespesas: 0 };

    const rootNodes = chartTree.getRootNodes();
    const receitas = rootNodes.filter(n => n.type === 'receita');
    const despesas = rootNodes.filter(n => n.type === 'despesa');

    const totalReceitas = receitas.reduce((sum, n) => sum + getNodeTotal(n), 0);
    const totalDespesas = despesas.reduce((sum, n) => sum + getNodeTotal(n), 0);

    return { receitas, despesas, totalReceitas, totalDespesas };
  }, [chartTree, valuesByChartAccountId]);

  // Totais por tipo de transação (todas, incluindo sem plano de contas)
  const totalIncomeAll = useMemo(() => {
    return filteredTransactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
  }, [filteredTransactions]);

  const totalExpenseAll = useMemo(() => {
    return filteredTransactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
  }, [filteredTransactions]);

  // Toggle expansão de nó
  const toggleNode = (id: number) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Expandir/colapsar todos
  const expandAll = () => {
    if (!chartTree) return;
    const allIds = new Set<number>();
    chartTree.getFlattenedNodes().forEach(n => {
      if (n.children.length > 0) allIds.add(n.id);
    });
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  // Renderizar uma linha recursiva do DRE
  const renderNode = (node: ChartOfAccountNode, depth: number = 0): React.ReactNode => {
    const total = getNodeTotal(node);
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isLeaf = !hasChildren;
    const indent = depth * 24;

    // Não mostrar contas com valor 0 em nível folha (mas mostrar nós pai)
    if (isLeaf && total === 0) return null;

    // Verificar se algum filho tem valor
    const hasChildWithValue = hasChildren && node.children.some(child => getNodeTotal(child) !== 0);
    if (hasChildren && !hasChildWithValue && total === 0) return null;

    const isLevel1 = depth === 0;
    const isLevel2 = depth === 1;

    return (
      <div key={node.id}>
        <div
          className={`
            grid grid-cols-12 gap-2 py-2 px-3 items-center transition-colors cursor-pointer
            ${isLevel1 ? 'bg-gray-50 font-semibold border-b border-gray-200' : ''}
            ${isLevel2 ? 'font-medium' : ''}
            ${!isLevel1 ? 'hover:bg-gray-50/50' : ''}
          `}
          style={{ paddingLeft: `${indent + 12}px` }}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          <div className="col-span-1 text-xs text-gray-400 font-mono">
            {node.code}
          </div>
          <div className="col-span-8 flex items-center gap-1.5">
            {hasChildren && (
              <span className="text-gray-400">
                {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </span>
            )}
            {isLeaf && <span className="w-3.5" />}
            <span className={`text-sm ${isLevel1 ? 'text-gray-900' : isLevel2 ? 'text-gray-800' : 'text-gray-600'}`}>
              {node.name}
            </span>
          </div>
          <div className={`col-span-3 text-right text-sm font-mono ${
            total > 0 
              ? (node.type === 'receita' ? 'text-emerald-600' : 'text-red-600') 
              : 'text-gray-400'
          }`}>
            {total > 0 ? formatCurrencyNumber(total) : '-'}
          </div>
        </div>

        {/* Filhos */}
        {hasChildren && isExpanded && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setIsCalendarOpen(false);
    }
  };

  const handleFilterChange = (period: string) => {
    setFilterPeriod(period);
  };

  const resultado = totalIncomeAll - totalExpenseAll;
  const margem = totalIncomeAll > 0 ? (resultado / totalIncomeAll) * 100 : 0;

  const hasChartAccounts = chartAccounts.length > 0;
  const hasData = filteredTransactions.length > 0;

  return (
    <div className="space-y-6">
      {/* Card do DRE */}
      <Card className="shadow-md border-gray-100/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#B59363]" />
                Demonstrativo de Resultados (DRE)
              </CardTitle>
              <CardDescription className="text-sm text-gray-500 mt-1">
                {regimeContabil === 'caixa' ? 'Regime de Caixa' : 'Regime de Competência'}
                {' • '}{displayTitle}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {/* Toggle de Regime Contábil */}
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setRegimeContabil('caixa')}
                  className={`p-2 rounded-lg transition-all duration-300 focus:outline-none ${
                    regimeContabil === 'caixa'
                      ? 'text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] scale-110'
                      : 'text-gray-300 hover:text-gray-400'
                  }`}
                  title="Regime de Caixa"
                >
                  <Coins className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setRegimeContabil('competencia')}
                  className={`p-2 rounded-lg transition-all duration-300 focus:outline-none ${
                    regimeContabil === 'competencia'
                      ? 'text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] scale-110'
                      : 'text-gray-300 hover:text-gray-400'
                  }`}
                  title="Regime de Competência"
                >
                  <Scale className="h-5 w-5" />
                </button>
              </div>

              {/* Navegação de período */}
              <div className="flex items-center gap-1">
                {filterPeriod !== 'Período' && (
                  <button onClick={() => navigatePeriod('prev')} className="p-1 hover:bg-gray-100 rounded transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                )}
                {filterPeriod !== 'Período' && (
                  <span className="text-sm font-medium min-w-[100px] text-center capitalize">
                    {displayTitle}
                  </span>
                )}
                {filterPeriod !== 'Período' && (
                  <button onClick={() => navigatePeriod('next')} className="p-1 hover:bg-gray-100 rounded transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Calendário */}
              {filterPeriod !== 'Período' && (
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                      <Calendar className="h-4 w-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}

              {/* Filtro de período */}
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                    <Settings className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {['Diário', 'Semanal', 'Mensal', 'Anual'].map(p => (
                    <DropdownMenuItem
                      key={p}
                      onClick={() => handleFilterChange(p)}
                      className={filterPeriod === p ? 'bg-[#B59363]/10 text-[#B59363]' : ''}
                    >
                      {p}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Expandir/Colapsar */}
              <div className="flex items-center gap-1 border-l pl-3 ml-1">
                <button
                  onClick={expandAll}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-500 text-xs"
                  title="Expandir tudo"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  onClick={collapseAll}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-500 text-xs"
                  title="Colapsar tudo"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {!hasChartAccounts ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
              <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Plano de Contas não configurado</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Para visualizar o DRE, primeiro configure o Plano de Contas na aba anterior. 
                Você pode criá-lo manualmente ou usar a IA para gerar automaticamente.
              </p>
            </div>
          ) : !hasData ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma movimentação no período</h3>
              <p className="text-sm text-gray-500">
                Não há transações registradas para o período selecionado.
              </p>
            </div>
          ) : (
            <div className="space-y-0 border rounded-lg overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider py-2.5 px-3 bg-gray-50 border-b">
                <div className="col-span-1">Código</div>
                <div className="col-span-8">Conta</div>
                <div className="col-span-3 text-right">Valor (R$)</div>
              </div>

              {/* ═══ RECEITAS ═══ */}
              <div className="border-b">
                {/* Título da seção */}
                <div className="grid grid-cols-12 gap-2 py-3 px-3 bg-emerald-50/50 border-b border-emerald-100">
                  <div className="col-span-9 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-800 uppercase tracking-wide">Receitas</span>
                  </div>
                  <div className="col-span-3 text-right text-sm font-bold text-emerald-600 font-mono">
                    {formatCurrencyNumber(dreData.totalReceitas + unclassifiedIncome)}
                  </div>
                </div>

                {/* Contas de receita */}
                {dreData.receitas.map(node => renderNode(node, 0))}

                {/* Receitas não classificadas */}
                {unclassifiedIncome > 0 && (
                  <div className="grid grid-cols-12 gap-2 py-2 px-3 items-center bg-amber-50/30 border-t border-dashed border-amber-200">
                    <div className="col-span-1 text-xs text-amber-400 font-mono">—</div>
                    <div className="col-span-8 flex items-center gap-1.5">
                      <span className="w-3.5" />
                      <span className="text-sm text-amber-700 italic">Receitas sem classificação</span>
                    </div>
                    <div className="col-span-3 text-right text-sm font-mono text-amber-600">
                      {formatCurrencyNumber(unclassifiedIncome)}
                    </div>
                  </div>
                )}
              </div>

              {/* ═══ DESPESAS ═══ */}
              <div className="border-b">
                {/* Título da seção */}
                <div className="grid grid-cols-12 gap-2 py-3 px-3 bg-red-50/50 border-b border-red-100">
                  <div className="col-span-9 flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-bold text-red-800 uppercase tracking-wide">Despesas</span>
                  </div>
                  <div className="col-span-3 text-right text-sm font-bold text-red-600 font-mono">
                    {formatCurrencyNumber(dreData.totalDespesas + unclassifiedExpense)}
                  </div>
                </div>

                {/* Contas de despesa */}
                {dreData.despesas.map(node => renderNode(node, 0))}

                {/* Despesas não classificadas */}
                {unclassifiedExpense > 0 && (
                  <div className="grid grid-cols-12 gap-2 py-2 px-3 items-center bg-amber-50/30 border-t border-dashed border-amber-200">
                    <div className="col-span-1 text-xs text-amber-400 font-mono">—</div>
                    <div className="col-span-8 flex items-center gap-1.5">
                      <span className="w-3.5" />
                      <span className="text-sm text-amber-700 italic">Despesas sem classificação</span>
                    </div>
                    <div className="col-span-3 text-right text-sm font-mono text-amber-600">
                      {formatCurrencyNumber(unclassifiedExpense)}
                    </div>
                  </div>
                )}
              </div>

              {/* ═══ RESULTADO ═══ */}
              <div className={`grid grid-cols-12 gap-2 py-4 px-3 items-center ${resultado >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                <div className="col-span-1"></div>
                <div className="col-span-5 flex items-center gap-2">
                  <span className={`text-base font-bold uppercase tracking-wide ${resultado >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>
                    Resultado do Exercício
                  </span>
                </div>
                <div className="col-span-3 text-right">
                  {totalIncomeAll > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      resultado >= 0 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {margem >= 0 ? '+' : ''}{margem.toFixed(1)}%
                    </span>
                  )}
                </div>
                <div className={`col-span-3 text-right text-base font-bold font-mono ${resultado >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {resultado >= 0 ? '+' : ''}{formatCurrencyNumber(resultado)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cards resumo */}
      {hasData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-sm border-emerald-100/50">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Receitas</p>
                  <p className="text-xl font-bold text-emerald-600">{formatCurrencyNumber(totalIncomeAll)}</p>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-red-100/50">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Despesas</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrencyNumber(totalExpenseAll)}</p>
                </div>
                <div className="p-2 bg-red-50 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`shadow-sm ${resultado >= 0 ? 'border-emerald-100/50' : 'border-red-100/50'}`}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Resultado Líquido</p>
                  <p className={`text-xl font-bold ${resultado >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {resultado >= 0 ? '+' : ''}{formatCurrencyNumber(resultado)}
                  </p>
                  {totalIncomeAll > 0 && (
                    <p className={`text-xs mt-0.5 ${resultado >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      Margem: {margem.toFixed(1)}%
                    </p>
                  )}
                </div>
                <div className={`p-2 rounded-lg ${resultado >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                  <Activity className={`h-5 w-5 ${resultado >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
