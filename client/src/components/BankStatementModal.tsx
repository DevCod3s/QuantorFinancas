import { useState, useMemo } from "react";
import { X, TrendingUp, TrendingDown, ArrowUpDown, Calendar, Search, Receipt, ArrowLeftRight, LogOut } from "lucide-react";
import { IButtonPrime } from "@/components/ui/i-ButtonPrime";
import { getBankBranding, BankLogoWithFallback } from "@/lib/bankBranding";
import { format, isWithinInterval, startOfDay, endOfDay, startOfMonth, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

interface BankStatementModalProps {
  open: boolean;
  onClose: () => void;
  account: any;
  transactions: any[];
  formatCurrency: (value: string) => string;
  formatCurrencyNumber: (value: number) => string;
}

type FilterType = 'todos' | 'income' | 'expense' | 'transfer';

export function BankStatementModal({
  open,
  onClose,
  account,
  transactions,
  formatCurrency,
  formatCurrencyNumber,
}: BankStatementModalProps) {
  const [filterType, setFilterType] = useState<FilterType>('todos');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Período efetivo: usa filtros do usuário ou mês atual como padrão
  const effectiveDateFrom = useMemo(() => {
    if (dateFrom) return dateFrom;
    const firstOfMonth = startOfMonth(new Date());
    return format(firstOfMonth, 'yyyy-MM-dd');
  }, [dateFrom]);

  const effectiveDateTo = useMemo(() => {
    if (dateTo) return dateTo;
    return format(new Date(), 'yyyy-MM-dd');
  }, [dateTo]);

  // Filtra transações da conta selecionada
  const accountTransactions = useMemo(() => {
    if (!account) return [];
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    let filtered = transactions.filter(
      (t: any) =>
        t.bankAccountId === account.id &&
        t.status === 'pago' &&
        new Date(t.date) <= today
    );

    // Filtro por tipo
    if (filterType === 'income') {
      filtered = filtered.filter((t: any) => t.type === 'income' || t.type === 'transfer-in');
    } else if (filterType === 'expense') {
      filtered = filtered.filter((t: any) => t.type === 'expense' || t.type === 'transfer-out');
    } else if (filterType === 'transfer') {
      filtered = filtered.filter((t: any) => t.type === 'transfer-in' || t.type === 'transfer-out');
    }

    // Filtro por busca
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((t: any) =>
        (t.description || '').toLowerCase().includes(term) ||
        (t.relationship?.socialName || '').toLowerCase().includes(term) ||
        (t.chartAccount?.name || '').toLowerCase().includes(term) ||
        (t.category?.name || '').toLowerCase().includes(term)
      );
    }

    // Filtro por período efetivo (sempre aplica — mês atual ou manual)
    const from = startOfDay(new Date(effectiveDateFrom + 'T00:00:00'));
    filtered = filtered.filter((t: any) => new Date(t.date) >= from);

    const to = endOfDay(new Date(effectiveDateTo + 'T00:00:00'));
    filtered = filtered.filter((t: any) => new Date(t.date) <= to);

    // Ordena por data (mais recente primeiro)
    filtered.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return filtered;
  }, [transactions, account?.id, filterType, effectiveDateFrom, effectiveDateTo, searchTerm]);

  // ── Saldo real da conta (calculado pelo servidor — fonte da verdade) ──
  const serverBalance = parseFloat(account?.balance ?? account?.realBalance ?? '0');

  // Todas as transações pagas desta conta, ordenadas cronologicamente
  const allAccountTxSorted = useMemo(() => {
    if (!account) return [];
    return transactions
      .filter((t: any) => t.bankAccountId === account.id && t.status === 'pago')
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions, account]);

  // Calcula saldo progressivo DE TRÁS PRA FRENTE a partir do saldo do servidor
  const transactionsWithBalance = useMemo(() => {
    if (!account) return [];

    const balanceMap = new Map<number, number>();
    let bal = serverBalance;

    // Percorre do mais recente para o mais antigo, desfazendo cada transação
    for (let i = allAccountTxSorted.length - 1; i >= 0; i--) {
      const t = allAccountTxSorted[i];
      balanceMap.set(t.id, bal); // saldo APÓS esta transação
      const amount = parseFloat(t.amount || '0');
      if (t.type === 'income' || t.type === 'transfer-in') {
        bal -= amount; // desfaz entrada
      } else {
        bal += amount; // desfaz saída
      }
    }

    const withBalance = accountTransactions.map((t: any) => ({
      ...t,
      runningBalance: balanceMap.get(t.id) ?? 0,
    }));

    // Ordenação
    if (sortField) {
      withBalance.sort((a: any, b: any) => {
        let aVal: any, bVal: any;
        switch (sortField) {
          case 'date': aVal = a.date || ''; bVal = b.date || ''; break;
          case 'description': aVal = (a.description || '').toLowerCase(); bVal = (b.description || '').toLowerCase(); break;
          case 'category': aVal = (a.chartAccount?.name || a.category?.name || '').toLowerCase(); bVal = (b.chartAccount?.name || b.category?.name || '').toLowerCase(); break;
          case 'relationship': aVal = (a.relationship?.socialName || '').toLowerCase(); bVal = (b.relationship?.socialName || '').toLowerCase(); break;
          case 'type': aVal = a.type || ''; bVal = b.type || ''; break;
          case 'amount': aVal = parseFloat(a.amount || '0'); bVal = parseFloat(b.amount || '0'); break;
          case 'balance': aVal = a.runningBalance; bVal = b.runningBalance; break;
          default: return 0;
        }
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return withBalance;
  }, [accountTransactions, allAccountTxSorted, account, serverBalance, sortField, sortDirection]);

  // Totais
  const totalEntradas = accountTransactions
    .filter((t: any) => t.type === 'income' || t.type === 'transfer-in')
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount || '0'), 0);
  const totalSaidas = accountTransactions
    .filter((t: any) => t.type === 'expense' || t.type === 'transfer-out')
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount || '0'), 0);
  const totalTransferencias = accountTransactions
    .filter((t: any) => t.type === 'transfer-in' || t.type === 'transfer-out')
    .length;

  // Saldo inicial e final do período (baseado no saldo do servidor)
  const { saldoInicioPeriodo, saldoAtual } = useMemo(() => {
    if (!account) return { saldoInicioPeriodo: 0, saldoAtual: 0 };

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const periodStart = startOfDay(new Date(effectiveDateFrom + 'T00:00:00'));
    const periodEnd = endOfDay(new Date(effectiveDateTo + 'T00:00:00'));

    // Se o período termina hoje ou depois, o saldo final = saldo do servidor (fonte da verdade)
    // Porque o servidor já calculou currentBalance + TODAS as tx pagas (incluindo futuras)
    let balanceEndOfPeriod: number;

    if (periodEnd >= today) {
      // Período inclui hoje: saldo final = saldo real do servidor
      balanceEndOfPeriod = serverBalance;
    } else {
      // Período histórico: subtrair transações DEPOIS do final do período
      let deltaAfterPeriod = 0;
      for (const t of allAccountTxSorted) {
        if (new Date(t.date) > periodEnd) {
          const amount = parseFloat(t.amount || '0');
          if (t.type === 'income' || t.type === 'transfer-in') {
            deltaAfterPeriod += amount;
          } else {
            deltaAfterPeriod -= amount;
          }
        }
      }
      balanceEndOfPeriod = serverBalance - deltaAfterPeriod;
    }

    // Movimentação DENTRO do período (apenas tx visíveis, sem filtro de tipo/busca)
    let periodMovement = 0;
    for (const t of allAccountTxSorted) {
      const tDate = new Date(t.date);
      if (tDate < periodStart || tDate > periodEnd) continue;
      const amount = parseFloat(t.amount || '0');
      if (t.type === 'income' || t.type === 'transfer-in') {
        periodMovement += amount;
      } else {
        periodMovement -= amount;
      }
    }

    // Saldo início do período = saldo final - movimentação do período
    const balanceBeforePeriod = balanceEndOfPeriod - periodMovement;

    return { saldoInicioPeriodo: balanceBeforePeriod, saldoAtual: balanceEndOfPeriod };
  }, [allAccountTxSorted, serverBalance, effectiveDateFrom, effectiveDateTo]);

  const filterButtons: { value: FilterType; label: string; icon: any; activeColor: string }[] = [
    { value: 'todos', label: 'Todos', icon: ArrowUpDown, activeColor: 'text-[#1D3557] bg-[#1D3557]/10' },
    { value: 'income', label: 'Entradas', icon: TrendingUp, activeColor: 'text-emerald-600 bg-emerald-50' },
    { value: 'expense', label: 'Saídas', icon: TrendingDown, activeColor: 'text-red-600 bg-red-50' },
    { value: 'transfer', label: 'Transferências', icon: ArrowLeftRight, activeColor: 'text-blue-600 bg-blue-50' },
  ];

  if (!open || !account) return null;

  const bankBrand = getBankBranding(account.bank);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden relative z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ background: `linear-gradient(to right, ${bankBrand.gradientFrom}, ${bankBrand.gradientTo})` }}>
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <BankLogoWithFallback bankCode={account.bank} customLogoUrl={account.customLogoUrl} size={32} className="rounded" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Extrato Bancário
              </h2>
              <p className="text-sm text-white/70 mt-0.5">
                {account.name}
                {account.bank && ` • ${account.bank}`}
                {account.agency && ` • AG ${account.agency}`}
                {account.accountNumber && ` • CC ${account.accountNumber}`}
              </p>
            </div>
          </div>
          <IButtonPrime
            icon={<LogOut className="h-4 w-4" />}
            variant="red"
            title="Sair"
            onClick={onClose}
          />
        </div>

        {/* Barra de filtros */}
        <div className="px-6 py-4 border-b bg-gray-50/80 space-y-3">
          {/* Linha 1: Tipo + Busca */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Filtro por tipo */}
            <div className="flex items-center gap-1 bg-white rounded-lg shadow-sm border p-1">
              {filterButtons.map((btn) => {
                const Icon = btn.icon;
                return (
                  <button
                    key={btn.value}
                    onClick={() => setFilterType(btn.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                      filterType === btn.value
                        ? btn.activeColor
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {btn.label}
                  </button>
                );
              })}
            </div>

            {/* Campo de busca */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por descrição, cliente, categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1D3557]/20 focus:border-[#1D3557]/40 transition-all"
              />
            </div>
          </div>

          {/* Linha 2: Filtros de data */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border px-3 py-1.5">
              <Calendar className="h-4 w-4 text-[#B59363]" />
              <span className="text-xs font-medium text-gray-500">Período:</span>
              <input
                type="date"
                value={dateFrom || effectiveDateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className={`text-xs border-0 bg-transparent focus:outline-none w-[120px] ${dateFrom ? 'text-gray-700' : 'text-gray-400'}`}
              />
              <span className="text-xs text-gray-400">até</span>
              <input
                type="date"
                value={dateTo || effectiveDateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className={`text-xs border-0 bg-transparent focus:outline-none w-[120px] ${dateTo ? 'text-gray-700' : 'text-gray-400'}`}
              />
            </div>

            {/* Limpar filtros */}
            {(dateFrom || dateTo || filterType !== 'todos' || searchTerm) && (
              <button
                onClick={() => {
                  setDateFrom('');
                  setDateTo('');
                  setFilterType('todos');
                  setSearchTerm('');
                }}
                className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
              >
                Limpar filtros
              </button>
            )}

            {/* Resumo */}
            <div className="ml-auto flex items-center gap-4 text-xs">
              <span className="text-gray-500">
                {accountTransactions.length} lançamento{accountTransactions.length !== 1 ? 's' : ''}
              </span>
              <span className="text-emerald-600 font-semibold">
                +{formatCurrencyNumber(totalEntradas)}
              </span>
              <span className="text-red-600 font-semibold">
                -{formatCurrencyNumber(totalSaidas)}
              </span>
            </div>
          </div>
        </div>

        {/* Tabela de transações */}
        <div className="flex-1 overflow-y-auto">
          <div className="bg-white">
            {/* Header da tabela */}
            <div className="grid grid-cols-12 gap-3 px-6 py-3 border-b bg-gray-50/50 text-[11px] font-semibold text-gray-500 uppercase tracking-wider sticky top-0 z-10">
              <div className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-gray-700 transition-colors select-none" onClick={() => handleSort('date')}>
                <span>Data</span>
                <ArrowUpDown className={`h-3 w-3 ${sortField === 'date' ? 'text-[#1D3557]' : ''}`} />
              </div>
              <div className="col-span-3 flex items-center gap-1 cursor-pointer hover:text-gray-700 transition-colors select-none" onClick={() => handleSort('description')}>
                <span>Descrição</span>
                <ArrowUpDown className={`h-3 w-3 ${sortField === 'description' ? 'text-[#1D3557]' : ''}`} />
              </div>
              <div className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-gray-700 transition-colors select-none" onClick={() => handleSort('category')}>
                <span>Categoria</span>
                <ArrowUpDown className={`h-3 w-3 ${sortField === 'category' ? 'text-[#1D3557]' : ''}`} />
              </div>
              <div className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-gray-700 transition-colors select-none" onClick={() => handleSort('relationship')}>
                <span>Cliente / Fornecedor</span>
                <ArrowUpDown className={`h-3 w-3 ${sortField === 'relationship' ? 'text-[#1D3557]' : ''}`} />
              </div>
              <div className="col-span-1 flex items-center justify-center gap-1 cursor-pointer hover:text-gray-700 transition-colors select-none" onClick={() => handleSort('type')}>
                <span>Tipo</span>
                <ArrowUpDown className={`h-3 w-3 ${sortField === 'type' ? 'text-[#1D3557]' : ''}`} />
              </div>
              <div className="col-span-1 flex items-center justify-end gap-1 cursor-pointer hover:text-gray-700 transition-colors select-none" onClick={() => handleSort('amount')}>
                <span>Valor</span>
                <ArrowUpDown className={`h-3 w-3 ${sortField === 'amount' ? 'text-[#1D3557]' : ''}`} />
              </div>
              <div className="col-span-1 flex items-center justify-end gap-1 cursor-pointer hover:text-gray-700 transition-colors select-none" onClick={() => handleSort('balance')}>
                <span>Saldo</span>
                <ArrowUpDown className={`h-3 w-3 ${sortField === 'balance' ? 'text-[#1D3557]' : ''}`} />
              </div>
            </div>

            {/* Linhas */}
            <div className="divide-y">
              <AnimatePresence mode="popLayout">
                {transactionsWithBalance.length > 0 ? (
                  transactionsWithBalance.map((t: any, i: number) => (
                    <motion.div
                      key={t.id || i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15, delay: Math.min(i * 0.02, 0.3) }}
                      className="grid grid-cols-12 gap-3 px-6 py-3 text-sm hover:bg-gray-50/50 transition-colors items-center group"
                    >
                      {/* Data */}
                      <div className="col-span-2 text-gray-600 text-xs">
                        {t.date
                          ? format(new Date(t.date), "dd/MM/yyyy", { locale: ptBR })
                          : '-'}
                      </div>

                      {/* Descrição */}
                      <div className="col-span-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            t.type === 'income' ? 'bg-emerald-500' 
                            : t.type === 'transfer-in' ? 'bg-blue-500' 
                            : t.type === 'transfer-out' ? 'bg-blue-500' 
                            : 'bg-red-500'
                          }`}></div>
                          <span className="font-medium text-gray-900 truncate text-xs" title={t.description || ''}>
                            {(t.type === 'transfer-in' || t.type === 'transfer-out') ? '↔ ' : ''}{t.description || '-'}
                          </span>
                        </div>
                      </div>

                      {/* Categoria */}
                      <div className="col-span-2 text-xs text-gray-500 truncate" title={t.chartAccount?.name || t.category?.name || ''}>
                        {(t.type === 'transfer-in' || t.type === 'transfer-out') 
                          ? <span className="inline-flex items-center gap-1 text-blue-600"><ArrowLeftRight className="h-3 w-3" />Transferência</span>
                          : (t.chartAccount?.name || t.category?.name || t.businessCategory?.name || '-')}
                      </div>

                      {/* Cliente/Fornecedor */}
                      <div className="col-span-2 text-xs text-gray-500 truncate" title={t.relationship?.socialName || ''}>
                        {t.relationship?.socialName || '-'}
                      </div>

                      {/* Tipo */}
                      <div className="col-span-1 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          t.type === 'transfer-in' ? 'bg-blue-50 text-blue-700'
                          : t.type === 'transfer-out' ? 'bg-blue-50 text-blue-700'
                          : t.type === 'income' ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                        }`}>
                          {t.type === 'transfer-in' ? 'Transf. ↓'
                          : t.type === 'transfer-out' ? 'Transf. ↑'
                          : t.type === 'income' ? 'Receita'
                          : 'Despesa'}
                        </span>
                      </div>

                      {/* Valor */}
                      <div className={`col-span-1 text-right text-xs font-semibold ${
                        (t.type === 'income' || t.type === 'transfer-in') ? 'text-emerald-600' 
                        : (t.type === 'transfer-out') ? 'text-blue-600' 
                        : 'text-red-600'
                      }`}>
                        {(t.type === 'income' || t.type === 'transfer-in') ? '+' : '-'}{formatCurrency(t.amount || '0')}
                      </div>

                      {/* Saldo */}
                      <div className={`col-span-1 text-right text-xs font-medium ${
                        t.runningBalance >= 0 ? 'text-gray-700' : 'text-red-600'
                      }`}>
                        {formatCurrencyNumber(t.runningBalance)}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-16 text-center">
                    <Receipt className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 font-medium">Nenhuma movimentação encontrada</p>
                    <p className="text-xs text-gray-300 mt-1">Tente ajustar os filtros de busca</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Rodapé com totais */}
        <div className="px-6 py-4 border-t bg-gray-50/80 space-y-2">
          {/* Linha 1: Saldo inicial e saldo final do período */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              <span className="text-gray-500">Saldo inicial:</span>
              <span className={`font-bold ${saldoInicioPeriodo >= 0 ? 'text-gray-700' : 'text-red-600'}`}>
                {formatCurrencyNumber(saldoInicioPeriodo)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#1D3557]"></div>
              <span className="text-gray-500">Saldo atual:</span>
              <span className={`font-bold ${saldoAtual >= 0 ? 'text-[#1D3557]' : 'text-red-600'}`}>
                {formatCurrencyNumber(saldoAtual)}
              </span>
            </div>
          </div>
          {/* Linha 2: Entradas, saídas, transferências, movimento do período */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5 text-sm flex-wrap">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-gray-500 text-xs">Entradas:</span>
                <span className="font-bold text-emerald-600 text-xs">+{formatCurrencyNumber(totalEntradas)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                <span className="text-gray-500 text-xs">Saídas:</span>
                <span className="font-bold text-red-600 text-xs">-{formatCurrencyNumber(totalSaidas)}</span>
              </div>
              {totalTransferencias > 0 && (
                <div className="flex items-center gap-1.5">
                  <ArrowLeftRight className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-gray-500 text-xs">Transferências:</span>
                  <span className="font-bold text-blue-600 text-xs">{totalTransferencias}</span>
                </div>
              )}
              <div className="h-4 w-px bg-gray-300"></div>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500 text-xs">Movimento:</span>
                <span className={`font-bold text-xs ${totalEntradas - totalSaidas >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatCurrencyNumber(totalEntradas - totalSaidas)}
                </span>
              </div>
            </div>
            <IButtonPrime
              icon={<LogOut className="h-4 w-4" />}
              variant="red"
              title="Sair"
              onClick={onClose}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
