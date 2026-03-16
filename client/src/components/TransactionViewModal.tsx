import { Box, Card, Chip, IconButton, Typography } from "@mui/material";
import { X, User, Calendar, Clock, DollarSign, FileText, Building2, AlertTriangle, Repeat, Layers, TrendingUp, TrendingDown, Tag, Percent, LogOut } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { IButtonPrime } from "./ui/i-ButtonPrime";
import { toLocalDate } from "@/lib/utils";

interface TransactionViewModalProps {
  open: boolean;
  onClose: () => void;
  transaction: any;
  userName?: string;
}

export function TransactionViewModal({ open, onClose, transaction, userName }: TransactionViewModalProps) {
  if (!open || !transaction) return null;

  const amount = parseFloat(transaction.amount);
  const isExpense = transaction.type === 'expense';
  const dueDate = toLocalDate(transaction.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  const isOverdue = transaction.status !== 'pago' && dueDate < today;
  const daysOverdue = isOverdue ? differenceInDays(today, dueDate) : 0;

  // Cálculo de juros com dados reais do banco
  const hasParcelamentoJuros = transaction.aplicarJuros && transaction.valorJuros;
  const hasRecorrenciaEncargos = transaction.aplicarEncargos && (transaction.jurosMes || transaction.moraDia);

  let updatedAmount = amount;
  let jurosAcumulado = 0;
  let moraAcumulada = 0;
  let tipoJurosLabel = '';

  if (isOverdue && hasParcelamentoJuros) {
    const rate = parseFloat(transaction.valorJuros) / 100;
    const isPercent = transaction.tipoJuros === 'percentual';
    if (isPercent) {
      const months = daysOverdue / 30;
      jurosAcumulado = amount * rate * months;
    } else {
      jurosAcumulado = parseFloat(transaction.valorJuros) * (daysOverdue / 30);
    }
    updatedAmount = amount + jurosAcumulado;
    tipoJurosLabel = isPercent
      ? `Juros ${fmtTaxa(transaction.valorJuros)}% a.m.`
      : `Juros R$ ${parseFloat(transaction.valorJuros).toFixed(2).replace('.', ',')}/mês`;
  }

  if (isOverdue && hasRecorrenciaEncargos) {
    const isPercent = transaction.tipoEncargo === 'percentual';
    if (transaction.jurosMes) {
      const rate = parseFloat(transaction.jurosMes);
      const months = daysOverdue / 30;
      jurosAcumulado = isPercent ? amount * (rate / 100) * months : rate * months;
    }
    if (transaction.moraDia) {
      const rateDia = parseFloat(transaction.moraDia);
      moraAcumulada = isPercent ? amount * (rateDia / 100) * daysOverdue : rateDia * daysOverdue;
    }
    updatedAmount = amount + jurosAcumulado + moraAcumulada;
    const parts = [];
    if (transaction.jurosMes) parts.push(`Juros ${fmtTaxa(transaction.jurosMes)}${isPercent ? '% a.m.' : '/mês'}`);
    if (transaction.moraDia) parts.push(`Mora ${fmtTaxa(transaction.moraDia)}${isPercent ? '% a.d.' : '/dia'}`);
    tipoJurosLabel = parts.join(' + ');
  }

  const hasInterest = hasParcelamentoJuros || hasRecorrenciaEncargos;
  const totalEncargos = jurosAcumulado + moraAcumulada;

  const fmtTaxa = (val: string) => {
    const num = parseFloat(val);
    return isNaN(num) ? val : num.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 3 });
  };

  const createdDate = transaction.createdAt ? new Date(transaction.createdAt) : null;

  const fmt = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const accentColor = isExpense ? '#dc2626' : '#16a34a';

  const Field = ({ icon, label, value, color, full }: { icon: React.ReactNode; label: string; value: string | React.ReactNode; color?: string; full?: boolean }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5, gridColumn: full ? '1 / -1' : undefined, minWidth: 0 }}>
      <Box sx={{ color: '#B59363', flexShrink: 0, display: 'flex', alignItems: 'center' }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ color: '#8C8C8C', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.55rem', letterSpacing: '0.5px', lineHeight: 1.2 }}>
          {label}
        </Typography>
        <Typography sx={{ color: color || '#1D3557', fontWeight: 500, fontSize: '0.8rem', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1300, p: 2
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <Card
        onClick={(e) => e.stopPropagation()}
        sx={{
          width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)', borderRadius: 3, border: '1px solid #e0e0e0'
        }}
      >
        {/* Header */}
        <Box sx={{
          background: isExpense
            ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
            : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
          px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isExpense ? <TrendingDown className="h-4 w-4 text-white" /> : <TrendingUp className="h-4 w-4 text-white" />}
            <Typography sx={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>
              {isExpense ? 'Detalhes da Despesa' : 'Detalhes da Receita'}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' } }}>
            <X className="h-4 w-4" />
          </IconButton>
        </Box>

        <Box sx={{ px: 2.5, py: 1.5 }}>
          {/* Badge de atraso */}
          {isOverdue && (
            <Box sx={{
              mb: 1.5, p: 1, borderRadius: 2, backgroundColor: '#fef2f2',
              border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: 0.5
            }}>
              <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
              <Typography sx={{ color: '#dc2626', fontWeight: 600, fontSize: '0.75rem' }}>
                Vencido há {daysOverdue} {daysOverdue === 1 ? 'dia' : 'dias'}
              </Typography>
            </Box>
          )}

          {/* Valores lado a lado */}
          <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 2, mb: 1.5 }}>
            {/* Valor original */}
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ color: '#8C8C8C', fontWeight: 500, textTransform: 'uppercase', fontSize: '0.55rem', letterSpacing: '0.5px' }}>
                Valor do Documento
              </Typography>
              <Typography sx={{ color: accentColor, fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.2 }}>
                {fmt(amount)}
              </Typography>
            </Box>

            {/* Valor atualizado — sempre visível se vencido */}
            {isOverdue && (
              <Box sx={{
                flex: 1, borderRadius: 2, p: 1.5, textAlign: 'right',
                backgroundColor: hasInterest ? '#fffbeb' : '#f8fafc',
                border: `1px solid ${hasInterest ? '#fde68a' : '#e2e8f0'}`
              }}>
                <Typography sx={{ color: hasInterest ? '#92400e' : '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.55rem' }}>
                  Valor Atualizado
                </Typography>
                <Typography sx={{ color: hasInterest ? '#b45309' : '#475569', fontWeight: 700, fontSize: '1.3rem', lineHeight: 1.2 }}>
                  {fmt(updatedAmount)}
                </Typography>
                {hasInterest ? (
                  <Typography sx={{ color: '#92400e', fontSize: '0.65rem', mt: 0.3 }}>
                    {tipoJurosLabel} • Encargos: {fmt(totalEncargos)}
                  </Typography>
                ) : (
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.65rem', mt: 0.3, fontStyle: 'italic' }}>
                    Sem encargos configurados
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          {/* Separador */}
          <Box sx={{ borderTop: '1px solid #e5e7eb', mb: 1.5 }} />

          {/* Grid 2 colunas */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
            <Field icon={<FileText className="h-3.5 w-3.5" />} label="Descrição" value={transaction.description || '—'} full />

            <Field
              icon={<Building2 className="h-3.5 w-3.5" />}
              label="Relacionamento"
              value={transaction.relationship?.socialName || 'Não informado'}
            />
            {transaction.relationship?.document ? (
              <Field icon={<Tag className="h-3.5 w-3.5" />} label="CPF/CNPJ" value={transaction.relationship.document} />
            ) : (
              <Box />
            )}

            <Field
              icon={<Calendar className="h-3.5 w-3.5" />}
              label="Vencimento"
              value={format(toLocalDate(transaction.date), "dd/MM/yyyy", { locale: ptBR })}
              color={isOverdue ? '#dc2626' : undefined}
            />
            <Field
              icon={<DollarSign className="h-3.5 w-3.5" />}
              label="Status"
              value={
                <Chip
                  label={transaction.status === 'pago' ? 'Pago' : isOverdue ? 'Vencido' : 'Pendente'}
                  size="small"
                  sx={{
                    fontWeight: 600, fontSize: '0.65rem', height: '22px',
                    backgroundColor: transaction.status === 'pago' ? '#dcfce7' : isOverdue ? '#fef2f2' : '#fef9c3',
                    color: transaction.status === 'pago' ? '#16a34a' : isOverdue ? '#dc2626' : '#a16207',
                    border: `1px solid ${transaction.status === 'pago' ? '#bbf7d0' : isOverdue ? '#fecaca' : '#fde68a'}`
                  }}
                />
              }
            />

            {transaction.chartAccount && (
              <Field
                icon={<Layers className="h-3.5 w-3.5" />}
                label="Plano de Contas"
                value={`${transaction.chartAccount.code} — ${transaction.chartAccount.name}`}
                full
              />
            )}

            {/* Repetição / Parcelamento */}
            {transaction.repeticao && transaction.repeticao !== 'Única' && (
              <>
                <Field icon={<Repeat className="h-3.5 w-3.5" />} label="Repetição" value={transaction.repeticao} />
                {transaction.repeticao === 'Parcelado' && transaction.numeroParcelas && (
                  <Field icon={<Layers className="h-3.5 w-3.5" />} label="Parcela" value={`${transaction.parcelaAtual || 1} de ${transaction.numeroParcelas}`} />
                )}
                {transaction.repeticao === 'Recorrente' && transaction.periodicidade && (
                  <Field icon={<Repeat className="h-3.5 w-3.5" />} label="Periodicidade" value={transaction.periodicidade} />
                )}
              </>
            )}

            {/* Juros configurados */}
            {hasInterest && (
              <Field
                icon={<Percent className="h-3.5 w-3.5" />}
                label="Encargos Configurados"
                value={tipoJurosLabel}
                full
              />
            )}
          </Box>

          {/* Observações */}
          {transaction.observacoes && (
            <Box sx={{ mt: 1, borderTop: '1px solid #e5e7eb', pt: 1 }}>
              <Field icon={<FileText className="h-3.5 w-3.5" />} label="Observações" value={transaction.observacoes} full />
            </Box>
          )}

          {/* Informações de registro */}
          <Box sx={{ mt: 1, borderTop: '1px solid #e5e7eb', pt: 1 }}>
            <Box sx={{ backgroundColor: '#f8fafc', borderRadius: 2, p: 1.5 }}>
              <Typography sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.55rem', letterSpacing: '0.5px', mb: 0.5 }}>
                Informações do Registro
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 16px' }}>
                <Field icon={<User className="h-3 w-3" />} label="Registrado por" value={userName || 'Usuário do sistema'} />
                {createdDate && (
                  <Field icon={<Clock className="h-3 w-3" />} label="Data do registro" value={format(createdDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} />
                )}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Rodapé */}
        <Box sx={{ px: 2.5, py: 1.5, borderTop: '1px solid #e0e0e0', display: 'flex', justifyContent: 'flex-end' }}>
          <IButtonPrime
            icon={<LogOut className="h-4 w-4" />}
            variant="red"
            title="Sair"
            onClick={onClose}
          />
        </Box>
      </Card>
    </Box>
  );
}
