/**
 * @fileoverview Etapa 2 do cadastro de relacionamento - Geração de Contrato
 * 
 * Segunda etapa do wizard que permite gerar contratos automaticamente usando IA.
 * Implementa funcionalidades avançadas de personalização e geração inteligente.
 * 
 * Funcionalidades:
 * - Opção de gerar contrato ou pular etapa
 * - Upload de modelo personalizado
 * - Campos de configuração do contrato
 * - Cadastro dinâmico de segmentos
 * - Preview em tempo real
 * - Integração com IA para geração
 * 
 * @author Equipe Quantor
 * @version 1.0.0
 */

import React, { useState, useRef } from "react";
import { 
  Card,
  CardContent,
  CardHeader,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Button as MuiButton,
  Typography,
  Box,
  Grid,
  Divider,
  Chip,
  Paper,
  IconButton
} from "@mui/material";
import { 
  Upload, 
  Plus, 
  FileText, 
  Eye, 
  Download, 
  Wand2, 
  Calendar,
  CreditCard,
  DollarSign,
  Building2,
  AlertCircle
} from "lucide-react";
import { useContractGenerator } from "../../hooks/useContractGenerator";

/**
 * Interface para dados do formulário da Etapa 2
 */
interface Step2FormData {
  generateContract: boolean; // Se vai gerar contrato
  segment: string; // Segmento selecionado
  customSegment: string; // Segmento personalizado
  startDate: string; // Data inicial
  validityPeriod: string; // Prazo de validade
  paymentMethods: string[]; // Formas de pagamento
  hasAdhesion: boolean; // Tem adesão
  adhesionValue: number; // Valor da adesão
  monthlyValue: number; // Valor mensal
  customTemplate: string; // Template personalizado
  templateFile?: File; // Arquivo do template
}

/**
 * Props do componente Step2ContractGeneration
 */
interface Step2ContractGenerationProps {
  onDataChange: (data: Step2FormData, isValid: boolean) => void; // Callback para mudança de dados
  initialData?: Partial<Step2FormData>; // Dados iniciais
  relationshipData?: any; // Dados da etapa 1
}

/**
 * Segmentos predefinidos
 */
const predefinedSegments = [
  { value: 'tecnologia', text: 'Tecnologia e Software' },
  { value: 'consultoria', text: 'Consultoria Empresarial' },
  { value: 'marketing', text: 'Marketing e Publicidade' },
  { value: 'educacao', text: 'Educação e Treinamento' },
  { value: 'saude', text: 'Saúde e Bem-estar' },
  { value: 'financeiro', text: 'Serviços Financeiros' },
  { value: 'comercio', text: 'Comércio e Varejo' },
  { value: 'industria', text: 'Indústria e Manufatura' },
  { value: 'servicos', text: 'Serviços Gerais' },
  { value: 'outro', text: 'Outro (especificar)' }
];

/**
 * Formas de pagamento disponíveis
 */
const paymentOptions = [
  { id: 'pix', label: 'PIX' },
  { id: 'cartao', label: 'Cartão de Crédito/Débito' },
  { id: 'boleto', label: 'Boleto Bancário' },
  { id: 'transferencia', label: 'Transferência Bancária' },
  { id: 'dinheiro', label: 'Dinheiro' },
  { id: 'cheque', label: 'Cheque' }
];

/**
 * Componente Step2ContractGeneration
 */
export default function Step2ContractGeneration({ 
  onDataChange, 
  initialData = {},
  relationshipData 
}: Step2ContractGenerationProps) {
  // Estado do formulário
  const [formData, setFormData] = useState<Step2FormData>({
    generateContract: false,
    segment: '',
    customSegment: '',
    startDate: '',
    validityPeriod: '',
    paymentMethods: [],
    hasAdhesion: false,
    adhesionValue: 0,
    monthlyValue: 0,
    customTemplate: '',
    ...initialData
  });

  // Estados auxiliares
  const [showCustomSegment, setShowCustomSegment] = useState(false);
  const [showTemplateUpload, setShowTemplateUpload] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Referências
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Hook para geração de contratos
  const { isGenerating, generatedContract, generateContract, clearContract } = useContractGenerator();

  /**
   * Atualiza dados do formulário
   */
  const updateFormData = (updates: Partial<Step2FormData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    
    // Etapa 2 sempre válida - usuário pode pular geração de contrato
    const isValid = true;
    
    onDataChange(newData, isValid);
  };

  /**
   * Manipula mudança de checkbox de gerar contrato
   */
  const handleGenerateContractChange = (checked: boolean) => {
    updateFormData({ generateContract: checked });
    if (!checked) {
      clearContract();
      setShowPreview(false);
    }
  };

  /**
   * Manipula mudança no segmento
   */
  const handleSegmentChange = (value: string) => {
    setShowCustomSegment(value === 'outro');
    updateFormData({ segment: value, customSegment: value === 'outro' ? formData.customSegment : '' });
  };

  /**
   * Adiciona novo segmento personalizado
   */
  const handleAddCustomSegment = () => {
    if (formData.customSegment.trim()) {
      // Aqui poderia salvar no sistema para uso futuro
      updateFormData({ segment: formData.customSegment });
      setShowCustomSegment(false);
    }
  };

  /**
   * Manipula seleção de formas de pagamento
   */
  const handlePaymentMethodChange = (method: string, checked: boolean) => {
    const updatedMethods = checked
      ? [...formData.paymentMethods, method]
      : formData.paymentMethods.filter(m => m !== method);
    
    updateFormData({ paymentMethods: updatedMethods });
  };

  /**
   * Manipula upload de template
   */
  const handleTemplateUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        updateFormData({ 
          customTemplate: content,
          templateFile: file 
        });
      };
      reader.readAsText(file);
    }
  };

  /**
   * Estados para controlar valores monetários formatados
   */
  const [formattedMonthlyValue, setFormattedMonthlyValue] = useState('');
  const [formattedAdhesionValue, setFormattedAdhesionValue] = useState('');

  /**
   * Formata valor monetário em tempo real
   */
  const formatCurrency = (value: string): string => {
    // Remove tudo que não é número
    const numericValue = value.replace(/\D/g, '');
    
    if (!numericValue) return '';
    
    // Converte para número e divide por 100 para ter centavos
    const number = parseFloat(numericValue) / 100;
    
    // Formata para moeda brasileira
    return number.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    });
  };

  /**
   * Manipula mudança no valor monetário mensal
   */
  const handleMonthlyValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    
    // Remove caracteres não numéricos
    const numericOnly = inputValue.replace(/\D/g, '');
    
    if (!numericOnly) {
      setFormattedMonthlyValue('');
      updateFormData({ monthlyValue: 0 });
      return;
    }
    
    // Converte para número (centavos) e depois para valor real
    const numericValue = parseFloat(numericOnly) / 100;
    
    // Formata para exibição
    const formatted = formatCurrency(numericOnly);
    setFormattedMonthlyValue(formatted);
    
    // Salva o valor numérico
    updateFormData({ monthlyValue: numericValue });
  };

  /**
   * Manipula mudança no valor de adesão
   */
  const handleAdhesionValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    
    // Remove caracteres não numéricos
    const numericOnly = inputValue.replace(/\D/g, '');
    
    if (!numericOnly) {
      setFormattedAdhesionValue('');
      updateFormData({ adhesionValue: 0 });
      return;
    }
    
    // Converte para número (centavos) e depois para valor real
    const numericValue = parseFloat(numericOnly) / 100;
    
    // Formata para exibição
    const formatted = formatCurrency(numericOnly);
    setFormattedAdhesionValue(formatted);
    
    // Salva o valor numérico
    updateFormData({ adhesionValue: numericValue });
  };

  /**
   * Gera preview do contrato
   */
  const handleGeneratePreview = async () => {
    const contractData = {
      segment: formData.segment || formData.customSegment,
      startDate: formData.startDate,
      validityPeriod: formData.validityPeriod,
      paymentMethods: formData.paymentMethods,
      hasAdhesion: formData.hasAdhesion,
      adhesionValue: formData.adhesionValue,
      monthlyValue: formData.monthlyValue,
      relationshipData,
      customTemplate: formData.customTemplate
    };

    const result = await generateContract(contractData);
    if (result.success) {
      setShowPreview(true);
    }
  };

  /**
   * Não renderizar nada se não for gerar contrato
   */
  if (!formData.generateContract) {
    return (
      <Card sx={{ maxWidth: 800, mx: 'auto', boxShadow: 3 }}>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <FileText size={64} style={{ color: '#9CA3AF', margin: '0 auto 24px' }} />
          <Typography variant="h5" gutterBottom color="text.primary" fontWeight={500}>
            Geração de Contrato (Opcional)
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
            Você pode gerar um contrato profissional automaticamente usando IA especializada ou pular esta etapa.
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
            <MuiButton
              variant="contained"
              size="large"
              onClick={() => handleGenerateContractChange(true)}
              startIcon={<Wand2 size={20} />}
              sx={{ 
                px: 4, 
                py: 1.5,
                bgcolor: '#2563eb',
                '&:hover': { bgcolor: '#1d4ed8' }
              }}
            >
              Gerar Contrato com IA
            </MuiButton>
            
            <Typography variant="caption" color="text.secondary">
              ou prosseguir para a próxima etapa
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ maxWidth: 1000, mx: 'auto', boxShadow: 3 }}>
      <CardHeader
        avatar={<FileText size={24} style={{ color: '#2563eb' }} />}
        title={
          <Typography variant="h6" fontWeight={600} color="text.primary">
            Configuração do Contrato
          </Typography>
        }
        action={
          <MuiButton
            variant="outlined"
            size="small"
            onClick={() => handleGenerateContractChange(false)}
            sx={{ color: 'text.secondary', borderColor: 'grey.300' }}
          >
            Pular Etapa
          </MuiButton>
        }
        sx={{ pb: 1 }}
      />
      <Divider />
      
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
          
          {/* Coluna Esquerda - Configurações */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              {/* Template Personalizado */}
              <Paper sx={{ p: 3, backgroundColor: '#f8fafc' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showTemplateUpload}
                      onChange={(e) => setShowTemplateUpload(e.target.checked)}
                      sx={{ color: '#2563eb' }}
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight={500}>
                      Usar template personalizado
                    </Typography>
                  }
                  sx={{ mb: 2 }}
                />
                
                {showTemplateUpload && (
                  <Paper 
                    sx={{ 
                      border: '2px dashed #d1d5db', 
                      backgroundColor: 'white',
                      p: 3, 
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': { borderColor: '#9ca3af' }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={32} style={{ color: '#9ca3af', marginBottom: 16 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Importe seu modelo de contrato
                    </Typography>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.doc,.docx,.html"
                      onChange={handleTemplateUpload}
                      style={{ display: 'none' }}
                    />
                    <MuiButton
                      variant="outlined"
                      size="small"
                      sx={{ mt: 1 }}
                    >
                      Selecionar Arquivo
                    </MuiButton>
                    {formData.templateFile && (
                      <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1 }}>
                        ✓ {formData.templateFile.name}
                      </Typography>
                    )}
                  </Paper>
                )}
              </Paper>

              {/* Segmento de Negócio */}
              <Paper sx={{ p: 3, backgroundColor: '#f8fafc' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Building2 size={20} style={{ color: '#6b7280' }} />
                  <Typography variant="body2" fontWeight={500}>
                    Segmento de Negócio *
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => setShowCustomSegment(true)}
                    sx={{ p: 0.5 }}
                  >
                    <Plus size={16} />
                  </IconButton>
                </Box>
                
                {!showCustomSegment ? (
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Selecione o segmento</InputLabel>
                    <Select
                      value={formData.segment}
                      onChange={(e) => handleSegmentChange(e.target.value)}
                      label="Selecione o segmento"
                    >
                      {predefinedSegments.map((segment) => (
                        <MenuItem key={segment.value} value={segment.value}>
                          {segment.text}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Novo segmento"
                      variant="outlined"
                      value={formData.customSegment}
                      onChange={(e) => updateFormData({ customSegment: e.target.value })}
                    />
                    <MuiButton
                      variant="contained"
                      onClick={handleAddCustomSegment}
                      sx={{ minWidth: 100 }}
                    >
                      Adicionar
                    </MuiButton>
                  </Box>
                )}
              </Paper>

              {/* Datas e Valor */}
              <Paper sx={{ p: 3, backgroundColor: '#f8fafc' }}>
                {/* Data Inicial e Prazo de Validade - Lado a lado */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      type="date"
                      fullWidth
                      label="Data Inicial"
                      variant="outlined"
                      value={formData.startDate}
                      onChange={(e) => updateFormData({ startDate: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      required
                      sx={{
                        '& .MuiInputLabel-root': {
                          color: '#6b7280',
                          fontWeight: 500
                        }
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      label="Prazo de Validade"
                      placeholder="Ex: 12 meses"
                      variant="outlined"
                      value={formData.validityPeriod}
                      onChange={(e) => updateFormData({ validityPeriod: e.target.value })}
                      required
                      sx={{
                        '& .MuiInputLabel-root': {
                          color: '#6b7280',
                          fontWeight: 500
                        }
                      }}
                    />
                  </Box>
                </Box>
                  
                {/* Valor Mensal */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <DollarSign size={20} style={{ color: '#6b7280' }} />
                    <Typography variant="body2" fontWeight={500}>
                      Valor Mensal *
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="R$ 0,00"
                    value={formattedMonthlyValue}
                    onChange={handleMonthlyValueChange}
                    sx={{
                      '& .MuiOutlinedInput-input': {
                        fontSize: '1rem',
                        fontWeight: 500
                      }
                    }}
                  />
                </Box>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.hasAdhesion}
                      onChange={(e) => {
                        const hasAdhesion = e.target.checked;
                        updateFormData({ hasAdhesion });
                        if (!hasAdhesion) {
                          setFormattedAdhesionValue('');
                          updateFormData({ adhesionValue: 0 });
                        }
                      }}
                    />
                  }
                  label="Contrato possui taxa de adesão"
                  sx={{ mt: 2 }}
                />

                {/* Campo de Valor de Adesão - Condicional */}
                {formData.hasAdhesion && (
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <DollarSign size={20} style={{ color: '#6b7280' }} />
                      <Typography variant="body2" fontWeight={500}>
                        Valor da Taxa de Adesão *
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="R$ 0,00"
                      value={formattedAdhesionValue}
                      onChange={handleAdhesionValueChange}
                      sx={{
                        '& .MuiOutlinedInput-input': {
                          fontSize: '1rem',
                          fontWeight: 500
                        }
                      }}
                    />
                  </Box>
                )}
              </Paper>
            </Box>
          </Box>

          {/* Coluna Direita - Formas de Pagamento */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              {/* Formas de Pagamento */}
              <Paper sx={{ p: 3, backgroundColor: '#f8fafc' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <CreditCard size={20} style={{ color: '#6b7280' }} />
                  <Typography variant="body2" fontWeight={500}>
                    Formas de Pagamento *
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  {paymentOptions.map((option) => (
                    <Box key={option.id}>
                      <Paper 
                        sx={{ 
                          p: 2, 
                          cursor: 'pointer',
                          border: formData.paymentMethods.includes(option.id) ? '2px solid #2563eb' : '1px solid #e5e7eb',
                          '&:hover': { borderColor: '#2563eb' }
                        }}
                        onClick={() => handlePaymentMethodChange(option.id, !formData.paymentMethods.includes(option.id))}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.paymentMethods.includes(option.id)}
                              onChange={(e) => handlePaymentMethodChange(option.id, e.target.checked)}
                            />
                          }
                          label={
                            <Typography variant="body2">
                              {option.label}
                            </Typography>
                          }
                        />
                      </Paper>
                    </Box>
                  ))}
                </Box>
              </Paper>

              {/* Botões de Ação */}
              <Paper sx={{ p: 3, backgroundColor: '#f8fafc' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <MuiButton
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleGeneratePreview}
                    disabled={isGenerating || (!formData.segment && !formData.customSegment)}
                    startIcon={isGenerating ? null : <Eye size={20} />}
                    sx={{ 
                      bgcolor: '#16a34a',
                      '&:hover': { bgcolor: '#15803d' },
                      py: 1.5
                    }}
                  >
                    {isGenerating ? (
                      <>
                        <Box 
                          sx={{ 
                            width: 20, 
                            height: 20, 
                            border: '2px solid white',
                            borderTop: '2px solid transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            mr: 1,
                            '@keyframes spin': {
                              '0%': { transform: 'rotate(0deg)' },
                              '100%': { transform: 'rotate(360deg)' }
                            }
                          }} 
                        />
                        Gerando Contrato...
                      </>
                    ) : (
                      'Gerar Preview'
                    )}
                  </MuiButton>

                  {generatedContract && (
                    <MuiButton
                      variant="outlined"
                      fullWidth
                      onClick={() => setShowPreview(!showPreview)}
                      startIcon={<FileText size={20} />}
                    >
                      {showPreview ? 'Ocultar' : 'Visualizar'} Contrato
                    </MuiButton>
                  )}
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>

        {/* Preview do Contrato */}
        {showPreview && generatedContract && (
          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e5e7eb' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Preview do Contrato
              </Typography>
              <MuiButton 
                variant="outlined" 
                size="small"
                startIcon={<Download size={16} />}
              >
                Baixar PDF
              </MuiButton>
            </Box>
            
            <Paper 
              sx={{ 
                p: 4, 
                maxHeight: 400, 
                overflow: 'auto',
                border: '1px solid #e5e7eb'
              }}
              dangerouslySetInnerHTML={{ __html: generatedContract }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}