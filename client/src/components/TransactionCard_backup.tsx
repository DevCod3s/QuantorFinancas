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
  Dialog,
  DialogContent,
  Typography,
} from '@mui/material';
import { X, Check, CheckCheck, Paperclip, Plus, HelpCircle, CreditCard, Users, Building2, BookOpen, Settings } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import CpfCnpjInput from "./CpfCnpjInput";
import CustomInput, { CustomSelect } from "./CustomInput";

interface TransactionCardProps {
  open: boolean;
  onClose: () => void;
  onSave: (transaction: any) => void;
}

/**
 * Card para criação de novas transações financeiras
 * Layout baseado na imagem de referência com campos organizados em grid
 */
export function TransactionCard({ open, onClose, onSave }: TransactionCardProps) {
  const [tipo, setTipo] = useState('Nova receita');
  const [valor, setValor] = useState('0,00');
  const [data, setData] = useState('25/07/2025');
  const [repeticao, setRepeticao] = useState('Única');
  const [periodicidade, setPeriodicidade] = useState('Mensal');
  const [intervaloRepeticao, setIntervaloRepeticao] = useState('1');
  const [descricao, setDescricao] = useState('');
  const [conta, setConta] = useState('');
  const [categoria, setCategoria] = useState('');
  const [contato, setContato] = useState('');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [tags, setTags] = useState('');
  
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

  // Função para buscar dados de CNPJ (mesma lógica do wizard)
  const fetchCNPJData = async (cnpj: string) => {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
      if (response.ok) {
        const data = await response.json();
        
        // Processar CEP
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
        
        // Se CEP válido mas dados incompletos, buscar via ViaCEP
        const hasCompleteAddress = data.logradouro && data.bairro && data.municipio;
        if (cleanCep.length === 8 && !hasCompleteAddress) {
          await fetchCEPData(cleanCep);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar CNPJ:', error);
    }
  };

  // Função para buscar dados de CEP (mesma lógica do wizard)
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

  // Função para tratar mudança no CEP (mesma lógica do wizard)
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
    
    // Se CEP completo, buscar endereço
    if (limitedNumbers.length === 8) {
      fetchCEPData(limitedNumbers);
    }
  };

  // Função para buscar dados de relacionamentos
  const { data: relationships = [] } = useQuery({
    queryKey: ['/api/relationships'],
    queryFn: () => fetch('/api/relationships').then(res => res.json())
  });

  // Função para buscar dados de contas bancárias  
  const { data: bankAccounts = [] } = useQuery({
    queryKey: ['/api/bank-accounts'],
    queryFn: () => fetch('/api/bank-accounts').then(res => res.json())
  });

  // Função para buscar dados do plano de contas
  const { data: chartOfAccounts = [] } = useQuery({
    queryKey: ['/api/chart-accounts'],
    queryFn: () => fetch('/api/chart-accounts').then(res => res.json())
  });

  // Filtragem de contas por tipo (receita ou despesa)
  const filteredChartOfAccounts = chartOfAccounts.filter((account: any) => {
    if (tipo.includes('receita')) return account.type === 'RECEITA';
    if (tipo.includes('despesa')) return account.type === 'DESPESA';
    return true;
  });

  // Formatação de valor monetário
  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Remove tudo exceto números
    value = value.replace(/\D/g, '');
    // Converte para número e divide por 100 para casas decimais
    const number = parseInt(value) / 100;
    // Formata como moeda brasileira
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
    const transaction = {
      tipo,
      valor: parseFloat(valor.replace(/[R$\s.,]/g, '').replace(',', '.')) / 100,
      data,
      repeticao,
      periodicidade: repeticao === 'Recorrente' ? periodicidade : undefined,
      intervaloRepeticao: repeticao === 'Recorrente' ? parseInt(intervaloRepeticao) : undefined,
      descricao,
      conta,
      categoria,
      contato,
      numeroDocumento,
      observacoes,
      tags
    };
    
    onSave(transaction);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
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
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
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
          <IconButton onClick={onClose} sx={{ color: '#666' }}>
            <X className="h-5 w-5" />
          </IconButton>
        </div>

        <CardContent sx={{ p: 3 }}>
          {/* Campos de valor e data */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
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
            <TextField
              variant="standard"
              label="Data"
              value={data}
              onChange={(e) => setData(e.target.value)}
              fullWidth
              sx={{ '& .MuiInputLabel-root': { color: '#666' } }}
            />
          </Box>

          {/* Campos de repetição */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, mb: 3 }}>
            <FormControl variant="standard" fullWidth>
              <InputLabel sx={{ color: '#666' }} shrink={!!repeticao || undefined}>
                Repetição
              </InputLabel>
              <Select
                value={repeticao}
                onChange={(e) => setRepeticao(e.target.value)}
              >
                <MenuItem value="Única">Única</MenuItem>
                <MenuItem value="Fixa">Fixa</MenuItem>
                <MenuItem value="Recorrente">Recorrente</MenuItem>
              </Select>
            </FormControl>
            
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

          {/* Campo de descrição */}
          <Box sx={{ mb: 3 }}>
            <TextField
              variant="standard"
              label="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              fullWidth
              sx={{ '& .MuiInputLabel-root': { color: '#666' } }}
            />
          </Box>

          {/* Campos de conta e categoria */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
            <div className="flex items-end gap-2">
              <FormControl variant="standard" sx={{ width: '85%' }}>
                <InputLabel sx={{ color: '#666' }} shrink={!!conta || undefined}>
                  Conta bancária
                </InputLabel>
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
                onClick={() => {/* Função para adicionar conta bancária */}}
              >
                <CreditCard className="h-4 w-4" />
              </IconButton>
            </div>

            <div className="flex items-end gap-2">
              <FormControl variant="standard" sx={{ width: '85%' }}>
                <InputLabel sx={{ color: '#666' }} shrink={!!categoria || undefined}>
                  Categoria
                </InputLabel>
                <Select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                >
                  <MenuItem value="vendas">Vendas</MenuItem>
                  <MenuItem value="servicos">Serviços</MenuItem>
                  <MenuItem value="investimentos">Investimentos</MenuItem>
                </Select>
              </FormControl>
              <IconButton 
                size="small" 
                sx={{ mb: 0.5, color: '#1976d2' }}
                onClick={() => {/* Função para adicionar categoria */}}
              >
                <Settings className="h-4 w-4" />
              </IconButton>
            </div>
          </div>

          {/* Campos de contato e documento */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="flex items-end gap-2">
              <FormControl variant="standard" sx={{ width: '85%' }}>
                <InputLabel sx={{ color: '#666' }} shrink={!!contato || undefined}>
                  Relacionamento
                </InputLabel>
                <Select
                  value={contato}
                  onChange={(e) => setContato(e.target.value)}
                >
                  {relationships.map((rel: any) => (
                    <MenuItem key={rel.id} value={rel.id}>
                      {rel.name}
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
            </div>

            <TextField
              variant="standard"
              label="Número do documento"
              value={numeroDocumento}
              onChange={(e) => setNumeroDocumento(e.target.value)}
              fullWidth
              sx={{ '& .MuiInputLabel-root': { color: '#666' } }}
            />
          </div>

          <div className="space-y-4">
            <TextField
              variant="standard"
              label="Observações"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              fullWidth
              multiline
              maxRows={5}
              sx={{ '& .MuiInputLabel-root': { color: '#666' } }}
            />
            
            <div className="flex items-end gap-2">
              <FormControl variant="standard" sx={{ width: '85%' }}>
                <InputLabel sx={{ color: '#666' }} shrink={!!tags || undefined}>Plano de Contas</InputLabel>
                <Select
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  MenuProps={{
                    PaperProps: {
                      sx: { zIndex: 1400 }
                    }
                  }}
                >
                  {filteredChartOfAccounts.map((account: any) => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.code} - {account.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <IconButton 
                size="small" 
                sx={{ mb: 0.5, color: '#1976d2' }}
                onClick={() => {/* Função para adicionar plano de contas */}}
              >
                <BookOpen className="h-4 w-4" />
              </IconButton>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex items-center justify-between pt-8">
            <div className="flex gap-2">
              <IconButton 
                sx={{ 
                  backgroundColor: '#4caf50',
                  color: 'white',
                  '&:hover': { backgroundColor: '#45a049' }
                }}
                onClick={handleSave}
              >
                <Check className="h-4 w-4" />
              </IconButton>
              <IconButton 
                sx={{ 
                  backgroundColor: '#2196f3',
                  color: 'white',
                  '&:hover': { backgroundColor: '#1976d2' }
                }}
              >
                <CheckCheck className="h-4 w-4" />
              </IconButton>
              <IconButton 
                sx={{ 
                  backgroundColor: '#607d8b',
                  color: 'white',
                  '&:hover': { backgroundColor: '#546e7a' }
                }}
              >
                <Paperclip className="h-4 w-4" />
              </IconButton>
            </div>
            
            <div className="flex gap-4">
              <Button
                variant="contained"
                onClick={handleSave}
                sx={{
                  backgroundColor: '#90a4ae',
                  color: 'white',
                  '&:hover': { backgroundColor: '#78909c' },
                  textTransform: 'none'
                }}
              >
                Salvar
              </Button>
              <IconButton
                sx={{
                  backgroundColor: '#607d8b',
                  color: 'white',
                  '&:hover': { backgroundColor: '#546e7a' }
                }}
              >
                <Plus className="h-4 w-4" />
              </IconButton>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Modal de Adicionar Contato usando componentes customizados */}
      <Dialog 
        open={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent className="p-0 overflow-hidden" onClick={(e) => e.stopPropagation()}>
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
                        
                        // Auto-preenchimento se CNPJ válido
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
                  
                  {/* Primeira linha - CEP, Logradouro, Número */}
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

                  {/* Segunda linha - Complemento, Bairro, Estado */}
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

                  {/* Terceira linha - Cidade */}
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
                  <button
                    type="button"
                    onClick={() => setContactModalOpen(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      console.log('Salvando contato:', contactFormData);
                      // Reset form
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
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium"
                  >
                    Salvar Contato
                  </button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}