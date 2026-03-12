/**
 * @fileoverview Card de transações para lançamentos financeiros
 * Componente responsável por criar e editar transações (receitas/despesas)
 * com formulário completo em formato de card elevado
 * 
 * @author Sistema Quantor
 * @version 1.0.0
 * @since Janeiro 2025
 */

import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Button,
  Box,
  Dialog,
  DialogContent,
  Checkbox,
  FormControlLabel,
  Typography,
} from '@mui/material';
import { X, Check, CheckCheck, Paperclip, Plus, CreditCard, Users, BookOpen, Settings, Tag, Save, LogOut } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import CpfCnpjInput from "./CpfCnpjInput";
import CustomInput, { CustomSelect } from "./CustomInput";
import { DateInput } from "./DateInput";
import { IButtonPrime } from "@/components/ui/i-ButtonPrime";
import { ParcelamentoModal } from "./ParcelamentoModal";

interface TransactionCardProps {
  open: boolean;
  onClose: () => void;
  onSave: (transaction: any) => void;
  entryType?: 'payable' | 'receivable'; // Novo prop para definir tipo de lançamento
}

/**
 * Card para criação de novas transações financeiras
 * Layout baseado na imagem de referência com campos organizados em grid
 */
export function TransactionCard({ open, onClose, onSave, entryType }: TransactionCardProps) {
  // Define o tipo inicial baseado no entryType
  const tipoInicial = entryType === 'payable' ? 'Nova despesa' : entryType === 'receivable' ? 'Nova receita' : 'Nova receita';
  const [tipo, setTipo] = useState(tipoInicial);

  // Atualiza tipo quando entryType muda
  React.useEffect(() => {
    if (entryType) {
      setTipo(entryType === 'payable' ? 'Nova despesa' : 'Nova receita');
    }
  }, [entryType]);
  const [valor, setValor] = useState('0,00');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [repeticao, setRepeticao] = useState('Única');
  const [periodicidade, setPeriodicidade] = useState('Mensal');
  const [intervaloRepeticao, setIntervaloRepeticao] = useState('1');
  const [descricao, setDescricao] = useState('');
  const [conta, setConta] = useState('');
  const [categoria, setCategoria] = useState('');
  const [subcategoria, setSubcategoria] = useState('');
  const [contato, setContato] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [isPaid, setIsPaid] = useState(false); // Inicia como pendente (false)
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [tags, setTags] = useState('');

  // Estados para parcelamento
  const [parcelamentoModalOpen, setParcelamentoModalOpen] = useState(false);
  const [numeroParcelas, setNumeroParcelas] = useState('');
  const [dataPrimeiraParcela, setDataPrimeiraParcela] = useState('');
  const [aplicarJuros, setAplicarJuros] = useState(false);
  const [tipoJuros, setTipoJuros] = useState<'percentual' | 'valor'>('percentual');
  const [valorJuros, setValorJuros] = useState('');
  const [aplicarJurosEm, setAplicarJurosEm] = useState<'total' | 'parcela' | 'atraso'>('total');
  const [valorParcela, setValorParcela] = useState('0,00');

  // Estados para modal de adicionar contato
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactFormData, setContactFormData] = useState({
    tipoRelacionamento: '',
    cpfCnpj: '',
    razaoSocial: '',
    inscricaoEstadual: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: ''
  });

  // Função para buscar dados de CNPJ
  const fetchCNPJData = async (cnpj: string) => {
    const cleanCnpj = cnpj.replace(/\D/g, '');

    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
      if (response.ok) {
        const data = await response.json();

        const cep = data.cep || '';
        const cleanCep = cep.replace(/\D/g, '');
        const formattedCep = cleanCep.length === 8 ?
          `${cleanCep.slice(0, 5)}-${cleanCep.slice(5)}` : '';

        setContactFormData(prev => ({
          ...prev,
          razaoSocial: data.razao_social || data.nome || '',
          cep: formattedCep,
          logradouro: data.logradouro || '',
          numero: data.numero || '',
          complemento: data.complemento || '',
          bairro: data.bairro || '',
          cidade: data.municipio || data.cidade || '',
          estado: data.uf || data.estado || ''
        }));

        const hasCompleteAddress = data.logradouro && data.bairro && data.municipio;
        if (cleanCep.length === 8 && !hasCompleteAddress) {
          await fetchCEPData(cleanCep);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar CNPJ:', error);
    }
  };

  // Função para buscar dados de CEP
  const fetchCEPData = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      if (response.ok) {
        const data = await response.json();
        if (!data.erro) {
          setContactFormData(prev => ({
            ...prev,
            logradouro: data.logradouro || prev.logradouro,
            bairro: data.bairro || prev.bairro,
            cidade: data.localidade || prev.cidade,
            estado: data.uf || prev.estado
          }));
        }
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    }
  };

  // Função para tratar mudança no CEP
  const handleCEPChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    const numbersOnly = rawValue.replace(/\D/g, '');
    const limitedNumbers = numbersOnly.substring(0, 8);

    let formatted = limitedNumbers;
    if (limitedNumbers.length > 5) {
      formatted = `${limitedNumbers.substring(0, 5)}-${limitedNumbers.substring(5)}`;
    }

    setContactFormData(prev => ({
      ...prev,
      cep: formatted
    }));

    if (limitedNumbers.length === 8) {
      fetchCEPData(limitedNumbers);
    }
  };

  // Buscar dados de relacionamentos
  const { data: relationships = [] } = useQuery({
    queryKey: ['/api/relationships'],
    queryFn: () => fetch('/api/relationships', { credentials: 'include' }).then(res => res.json())
  });

  // Buscar dados de contas bancárias  
  const { data: bankAccounts = [] } = useQuery({
    queryKey: ['/api/bank-accounts'],
    queryFn: () => fetch('/api/bank-accounts', { credentials: 'include' }).then(res => res.json())
  });

  // Buscar dados do plano de contas
  const { data: chartOfAccounts = [] } = useQuery({
    queryKey: ['/api/chart-accounts'],
    queryFn: () => fetch('/api/chart-accounts', { credentials: 'include' }).then(res => res.json())
  });

  // Filtragem de categorias (Nível 1) do Plano de Contas por tipo
  const filteredCategories = chartOfAccounts.filter((account: any) => {
    if (account.level !== 1) return false;

    if (tipo.includes('receita')) {
      const accountType = account.type?.toLowerCase();
      return accountType === 'receita' || accountType === 'receitas';
    }
    if (tipo.includes('despesa')) {
      const accountType = account.type?.toLowerCase();
      return accountType === 'despesa' || accountType === 'despesas';
    }
    return true;
  });

  // Filtragem de subcategorias (Nível 2) do Plano de Contas
  const filteredSubcategories = chartOfAccounts.filter((account: any) => {
    return account.level === 2 && account.parentId === parseInt(categoria);
  });

  // Cálculo do valor da parcela
  React.useEffect(() => {
    if (repeticao !== 'Parcelado' || !valor || !numeroParcelas) {
      setValorParcela('0,00');
      return;
    }

    const valorNumerico = parseFloat(valor.replace(/[R$\s.]/g, '').replace(',', '.'));
    const parcelas = parseInt(numeroParcelas);

    if (isNaN(valorNumerico) || isNaN(parcelas) || parcelas === 0) {
      setValorParcela('0,00');
      return;
    }

    let valorFinal = valorNumerico;

    // Aplicar juros se necessário
    if (aplicarJuros && valorJuros) {
      const juros = parseFloat(valorJuros.replace(/[R$\s.]/g, '').replace(',', '.'));

      if (tipoJuros === 'percentual') {
        // Juros em percentual
        if (aplicarJurosEm === 'total') {
          // Juros sobre o total
          valorFinal = valorNumerico * (1 + juros / 100);
        } else {
          // Juros em cada parcela
          const valorPorParcela = valorNumerico / parcelas;
          const parcelaComJuros = valorPorParcela * (1 + juros / 100);
          setValorParcela(parcelaComJuros.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
          return;
        }
      } else {
        // Juros em valor fixo (R$)
        if (aplicarJurosEm === 'total') {
          // Juros fixos sobre o total
          valorFinal = valorNumerico + juros;
        } else {
          // Juros fixos em cada parcela
          const valorPorParcela = valorNumerico / parcelas;
          const parcelaComJuros = valorPorParcela + juros;
          setValorParcela(parcelaComJuros.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
          return;
        }
      }
    }

    const valorPorParcela = valorFinal / parcelas;
    setValorParcela(valorPorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  }, [repeticao, valor, numeroParcelas, aplicarJuros, tipoJuros, valorJuros, aplicarJurosEm]);

  // Formatação de valor monetário
  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/\D/g, '');
    const number = parseInt(value) / 100;
    if (value === '') {
      setValor('');
    } else {
      const formatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2
      }).format(number);
      setValor(formatted);
    }
  };

  const handleSave = () => {
    // Lógica inteligente de status
    let finalStatus = 'pendente';
    if (isPaid) {
      finalStatus = 'pago';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const transactionDate = new Date(data);
      transactionDate.setHours(0, 0, 0, 0);

      if (transactionDate < today) {
        finalStatus = 'vencido';
      } else {
        finalStatus = 'pendente';
      }
    }

    const transaction = {
      tipo,
      valor: parseFloat(valor.replace(/[R$\s.,]/g, '').replace(',', '.')) / 100,
      data,
      repeticao,
      periodicidade: repeticao === 'Recorrente' ? periodicidade : undefined,
      intervaloRepeticao: repeticao === 'Recorrente' ? parseInt(intervaloRepeticao) : undefined,
      descricao,
      conta,
      chartAccountId: subcategoria || categoria, // Salva o ID da subcategoria se houver, senão o da categoria
      contato,
      numeroDocumento,
      observacoes,
      tags,
      status: finalStatus
    };

    onSave(transaction);
    onClose();
  };

  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1300,
        p: 2
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <Card
        onClick={(e) => e.stopPropagation()}
        sx={{
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          borderRadius: 3,
          border: '1px solid #e0e0e0'
        }}
      >
        {/* Cabeçalho */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, borderBottom: '1px solid #e0e0e0' }}>
          <FormControl variant="standard" sx={{ minWidth: 150 }}>
            <Select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              sx={{
                fontSize: '16px',
                fontWeight: 500,
                '&:before': { borderBottom: 'none' },
                '&:after': { borderBottom: 'none' },
                '&:hover:not(.Mui-disabled):before': { borderBottom: 'none' }
              }}
            >
              <MenuItem value="Nova receita">Nova receita</MenuItem>
              <MenuItem value="Nova despesa">Nova despesa</MenuItem>
              <MenuItem value="Transferência">Transferência</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <TextField
              variant="standard"
              label="Valor"
              value={valor}
              onChange={handleValorChange}
              fullWidth
              sx={{
                '& .MuiInput-root': { fontSize: '16px' },
                '& .MuiInputLabel-root': { color: '#666' }
              }}
            />
            <DateInput
              label="Data"
              value={data}
              onChange={setData}
            />
          </Box>


          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'end', gap: 1 }}>
              <FormControl variant="standard" sx={{ width: repeticao === 'Parcelado' ? '85%' : '100%' }}>
                <InputLabel sx={{ color: '#666' }} shrink={!!repeticao || undefined}>
                  Repetição
                </InputLabel>
                <Select
                  value={repeticao}
                  onChange={(e) => setRepeticao(e.target.value)}
                >
                  <MenuItem value="Única">Única</MenuItem>
                  <MenuItem value="Parcelado">Parcelado</MenuItem>
                  <MenuItem value="Recorrente">Recorrente</MenuItem>
                </Select>
              </FormControl>
              {repeticao === 'Parcelado' && (
                <IconButton
                  size="small"
                  sx={{ mb: 0.5, color: '#1976d2' }}
                  title="Configurar parcelamento"
                  onClick={() => setParcelamentoModalOpen(true)}
                >
                  <Settings className="h-4 w-4" />
                </IconButton>
              )}
            </Box>

            {repeticao === 'Recorrente' && (
              <>
                <FormControl variant="standard" fullWidth>
                  <InputLabel sx={{ color: '#666' }} shrink={!!periodicidade || undefined}>
                    Periodicidade
                  </InputLabel>
                  <Select
                    value={periodicidade}
                    onChange={(e) => setPeriodicidade(e.target.value)}
                  >
                    <MenuItem value="Diário">Diário</MenuItem>
                    <MenuItem value="Semanal">Semanal</MenuItem>
                    <MenuItem value="Mensal">Mensal</MenuItem>
                    <MenuItem value="Anual">Anual</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  variant="standard"
                  label="Intervalo"
                  value={intervaloRepeticao}
                  onChange={(e) => setIntervaloRepeticao(e.target.value)}
                  fullWidth
                  sx={{ '& .MuiInputLabel-root': { color: '#666' } }}
                />
              </>
            )}
          </Box>

          <TextField
            variant="standard"
            label="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            fullWidth
            sx={{ '& .MuiInputLabel-root': { color: '#666' }, mb: 2 }}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'end', gap: 1 }}>
              <FormControl variant="standard" sx={{ width: '85%' }}>
                <InputLabel sx={{ color: '#666' }} shrink={!!conta || undefined}>Conta bancária</InputLabel>
                <Select
                  value={conta}
                  onChange={(e) => setConta(e.target.value)}
                >
                  {bankAccounts.map((account: any) => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.bank} - {account.accountNumber}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <IconButton
                size="small"
                sx={{ mb: 0.5, color: '#1976d2' }}
              >
                <CreditCard className="h-4 w-4" />
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'end', gap: 1 }}>
              <FormControl variant="standard" sx={{ width: '85%' }}>
                <InputLabel sx={{ color: '#666' }} shrink={!!categoria || undefined}>Categoria</InputLabel>
                <Select
                  value={categoria}
                  onChange={(e) => {
                    setCategoria(e.target.value);
                    setSubcategoria('');
                  }}
                >
                  {filteredCategories.map((cat: any) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.code} - {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <IconButton
                size="small"
                sx={{ mb: 0.5, color: '#1976d2' }}
              >
                <Plus className="h-4 w-4" />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'end', gap: 1 }}>
              <FormControl variant="standard" sx={{ width: '85%' }}>
                <InputLabel sx={{ color: '#666' }} shrink={!!contato || undefined}>Relacionamento</InputLabel>
                <Select
                  value={contato}
                  onChange={(e) => setContato(e.target.value)}
                >
                  {relationships.map((rel: any) => (
                    <MenuItem key={rel.id} value={rel.id}>
                      {rel.fantasyName || rel.socialName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <IconButton
                size="small"
                sx={{ mb: 0.5, color: '#1976d2' }}
                onClick={() => setContactModalOpen(true)}
              >
                <Users className="h-4 w-4" />
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'end', gap: 1 }}>
              <FormControl variant="standard" sx={{ width: '85%' }}>
                <InputLabel sx={{ color: '#666' }} shrink={!!subcategoria || undefined}>Subcategoria</InputLabel>
                <Select
                  value={subcategoria}
                  onChange={(e) => setSubcategoria(e.target.value)}
                >
                  {filteredSubcategories.map((subcat: any) => (
                    <MenuItem key={subcat.id} value={subcat.id}>
                      {subcat.code} - {subcat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <IconButton
                size="small"
                sx={{ mb: 0.5, color: '#1976d2' }}
              >
                <Plus className="h-4 w-4" />
              </IconButton>
            </Box>
          </Box>

          <TextField
            variant="standard"
            label="Observações"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            fullWidth
            multiline
            maxRows={5}
            sx={{ '& .MuiInputLabel-root': { color: '#666' }, mb: 2 }}
          />


          {/* Botões de ação */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IButtonPrime
                icon={<Paperclip className="h-4 w-4" />}
                variant="gold"
                title="Anexar arquivo"
                className="!p-2"
                onClick={() => console.log('Anexos')}
              />
              <IButtonPrime
                icon={isPaid ? <CheckCheck className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                variant="gold"
                title={isPaid ? "Marcado como Pago" : "Marcar como Pago"}
                className={cn(
                  "!p-2",
                  isPaid ? "text-green-600 hover:bg-green-50/50" : ""
                )}
                onClick={() => setIsPaid(!isPaid)}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <IButtonPrime
                icon={<LogOut className="h-4 w-4" />}
                variant="red"
                title="Sair"
                className="!p-2"
                onClick={onClose}
              />
              <IButtonPrime
                icon={<Save className="h-4 w-4" />}
                variant="gold"
                title="Salvar"
                className="!p-2"
                onClick={handleSave}
              />
              <IButtonPrime
                icon={<Plus className="h-4 w-4" />}
                variant="gold"
                title="Adicionar novo"
                className="!p-2"
                onClick={() => console.log('Novo')}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Modal de Adicionar Contato */}
      <Dialog
        open={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent className="p-0 overflow-hidden">
          <div className="bg-gray-50 p-6 min-h-[600px]">
            <div className="max-w-4xl mx-auto rounded-xl shadow-2xl bg-white">
              <div className="p-6 space-y-6">
                {/* Seção: Tipo de relacionamento */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Tipo de relacionamento
                  </h3>

                  <div className="max-w-md flex items-end gap-2">
                    <div className="flex-1">
                      <CustomSelect
                        id="relationship-type"
                        label="Tipo de relacionamento *"
                        value={contactFormData.tipoRelacionamento}
                        onChange={(e) => setContactFormData(prev => ({
                          ...prev,
                          tipoRelacionamento: e.target.value
                        }))}
                      >
                        <option value="">Selecione...</option>
                        <option value="cliente">Cliente</option>
                        <option value="fornecedor">Fornecedor</option>
                        <option value="funcionario">Funcionário</option>
                        <option value="parceiro">Parceiro</option>
                        <option value="outros">Outros</option>
                      </CustomSelect>
                    </div>

                    <button
                      type="button"
                      className="w-10 h-10 border-2 border-blue-500 text-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center rounded-md"
                      title="Adicionar novo tipo"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Seção: Informação básica */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Informação básica
                  </h3>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <CpfCnpjInput
                      value={contactFormData.cpfCnpj}
                      onChange={(value, isValid, type) => {
                        setContactFormData(prev => ({
                          ...prev,
                          cpfCnpj: value
                        }));

                        if (isValid && type === 'CNPJ') {
                          fetchCNPJData(value);
                        }
                      }}
                      label="CPF/CNPJ *"
                    />
                    <CustomInput
                      label="Razão social *"
                      value={contactFormData.razaoSocial}
                      onChange={(e) => setContactFormData(prev => ({
                        ...prev,
                        razaoSocial: e.target.value
                      }))}
                    />
                    <CustomInput
                      label="Inscrição estadual *"
                      value={contactFormData.inscricaoEstadual}
                      onChange={(e) => setContactFormData(prev => ({
                        ...prev,
                        inscricaoEstadual: e.target.value
                      }))}
                    />
                  </div>
                </div>

                {/* Seção: Localização */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Localização
                  </h3>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <CustomInput
                      label="CEP *"
                      value={contactFormData.cep}
                      onChange={handleCEPChange}
                    />
                    <CustomInput
                      label="Logradouro *"
                      value={contactFormData.logradouro}
                      onChange={(e) => setContactFormData(prev => ({
                        ...prev,
                        logradouro: e.target.value
                      }))}
                    />
                    <CustomInput
                      label="Número *"
                      value={contactFormData.numero}
                      onChange={(e) => setContactFormData(prev => ({
                        ...prev,
                        numero: e.target.value
                      }))}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <CustomInput
                      label="Complemento"
                      value={contactFormData.complemento}
                      onChange={(e) => setContactFormData(prev => ({
                        ...prev,
                        complemento: e.target.value
                      }))}
                    />
                    <CustomInput
                      label="Bairro *"
                      value={contactFormData.bairro}
                      onChange={(e) => setContactFormData(prev => ({
                        ...prev,
                        bairro: e.target.value
                      }))}
                    />
                    <CustomSelect
                      label="Estado *"
                      value={contactFormData.estado}
                      onChange={(e) => setContactFormData(prev => ({
                        ...prev,
                        estado: e.target.value
                      }))}
                    >
                      <option value="">Selecione...</option>
                      <option value="SP">São Paulo</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="RS">Rio Grande do Sul</option>
                      <option value="PR">Paraná</option>
                      <option value="SC">Santa Catarina</option>
                      <option value="GO">Goiás</option>
                      <option value="MT">Mato Grosso</option>
                      <option value="MS">Mato Grosso do Sul</option>
                      <option value="BA">Bahia</option>
                      <option value="PE">Pernambuco</option>
                      <option value="CE">Ceará</option>
                    </CustomSelect>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <CustomInput
                      label="Cidade *"
                      value={contactFormData.cidade}
                      onChange={(e) => setContactFormData(prev => ({
                        ...prev,
                        cidade: e.target.value
                      }))}
                    />
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                  <IButtonPrime
                    icon={<LogOut className="h-4 w-4" />}
                    variant="red"
                    title="Cancelar"
                    onClick={() => setContactModalOpen(false)}
                  />
                  <IButtonPrime
                    icon={<Save className="h-4 w-4" />}
                    variant="gold"
                    title="Salvar"
                    onClick={() => {
                      console.log('Salvando contato:', contactFormData);
                      setContactFormData({
                        tipoRelacionamento: '',
                        cpfCnpj: '',
                        razaoSocial: '',
                        inscricaoEstadual: '',
                        cep: '',
                        logradouro: '',
                        numero: '',
                        complemento: '',
                        bairro: '',
                        cidade: '',
                        estado: ''
                      });
                      setContactModalOpen(false);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Configuração de Parcelamento */}
      <ParcelamentoModal
        open={parcelamentoModalOpen}
        onClose={() => setParcelamentoModalOpen(false)}
        onSave={(config) => {
          setNumeroParcelas(config.numeroParcelas);
          setDataPrimeiraParcela(config.dataPrimeiraParcela);
          setAplicarJuros(config.aplicarJuros);
          setTipoJuros(config.tipoJuros);
          setValorJuros(config.valorJuros);
          setAplicarJurosEm(config.aplicarJurosEm);
        }}
        initialConfig={{
          numeroParcelas,
          dataPrimeiraParcela,
          aplicarJuros,
          tipoJuros,
          valorJuros,
          aplicarJurosEm,
        }}
        valorTotal={valor}
      />
    </Box >
  );
}