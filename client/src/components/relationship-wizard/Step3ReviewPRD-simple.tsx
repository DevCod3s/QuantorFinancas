/**
 * @fileoverview Etapa 3 do cadastro de relacionamento - Revisão
 * Versão Material-UI melhorada com layout profissional
 */

import React, { useState } from "react";
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Divider,
  TextField,
  FormControlLabel,
  RadioGroup,
  Radio,
  Chip,
  Avatar,
  Alert,
  AlertTitle
} from "@mui/material";
import { 
  CheckCircle, 
  Eye, 
  FileText, 
  User, 
  AlertTriangle,
  Info,
  CheckCircle2
} from "lucide-react";

interface Step3FormData {
  reviewApproved: boolean;
  notes: string;
  modificationsRequested: boolean;
  modificationNotes: string;
}

interface Step3ReviewPRDProps {
  onDataChange: (data: Step3FormData, isValid: boolean) => void;
  initialData?: Partial<Step3FormData>;
  relationshipData?: any;
  contractData?: any;
}

export default function Step3ReviewPRD({ 
  onDataChange, 
  initialData = {},
  relationshipData,
  contractData
}: Step3ReviewPRDProps) {
  const [formData, setFormData] = useState<Step3FormData>({
    reviewApproved: false,
    notes: '',
    modificationsRequested: false,
    modificationNotes: '',
    ...initialData
  });

  const updateFormData = (updates: Partial<Step3FormData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    const isValid = newData.reviewApproved || newData.modificationsRequested;
    onDataChange(newData, isValid);
  };

  const formatDisplayData = (data: any) => {
    if (!data) return 'Não informado';
    if (typeof data === 'boolean') return data ? 'Sim' : 'Não';
    if (Array.isArray(data)) return data.join(', ');
    return data.toString();
  };

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', p: 3 }}>
      {/* Header da Revisão */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
              <Eye size={24} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={600}>
                Revisão das Informações
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Confira todos os dados antes de prosseguir para a finalização
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Dados Consolidados */}
        <Box sx={{ flex: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Informações Básicas */}
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <User size={20} color="#1976d2" />
                  <Typography variant="h6" fontWeight={600}>
                    Informações Básicas
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      DOCUMENTO
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formatDisplayData(relationshipData?.document)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      RAZÃO SOCIAL
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formatDisplayData(relationshipData?.socialName)}
                    </Typography>
                  </Box>
                  {relationshipData?.fantasyName && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        NOME FANTASIA
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formatDisplayData(relationshipData?.fantasyName)}
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      LOCALIZAÇÃO
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {relationshipData?.city} / {relationshipData?.state}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Informações do Contrato */}
            {contractData?.generateContract && (
              <Card elevation={3}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <FileText size={20} color="#1976d2" />
                    <Typography variant="h6" fontWeight={600}>
                      Informações do Contrato
                    </Typography>
                    <Chip 
                      label="Contrato Configurado" 
                      color="success" 
                      size="small"
                      icon={<CheckCircle2 size={16} />}
                    />
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        SEGMENTO
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formatDisplayData(contractData?.segment || contractData?.customSegment)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        DATA INICIAL
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formatDisplayData(contractData?.startDate)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        PRAZO DE VALIDADE
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formatDisplayData(contractData?.validityPeriod)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        VALOR MENSAL
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="success.main">
                        R$ {contractData?.monthlyValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                    {contractData?.hasAdhesion && contractData?.adhesionValue > 0 && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          TAXA DE ADESÃO
                        </Typography>
                        <Typography variant="body1" fontWeight={600} color="warning.main">
                          R$ {contractData?.adhesionValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, gridColumn: { xs: '1', sm: '1 / -1' } }}>
                      <Typography variant="caption" color="text.secondary">
                        FORMAS DE PAGAMENTO
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {contractData?.paymentMethods?.map((method: string, index: number) => (
                          <Chip 
                            key={index} 
                            label={method} 
                            variant="outlined" 
                            size="small" 
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        </Box>

        {/* Painel de Revisão */}
        <Box sx={{ flex: 1, minWidth: '300px' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Status da Revisão */}
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Status da Revisão
                </Typography>
                
                <RadioGroup
                  name="reviewStatus"
                  value={formData.reviewApproved && !formData.modificationsRequested ? 'approved' : 
                         formData.modificationsRequested ? 'modifications' : ''}
                  onChange={(e) => {
                    if (e.target.value === 'approved') {
                      updateFormData({ reviewApproved: true, modificationsRequested: false });
                    } else if (e.target.value === 'modifications') {
                      updateFormData({ modificationsRequested: true, reviewApproved: false });
                    }
                  }}
                >
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      mb: 2, 
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.1)' },
                      bgcolor: formData.reviewApproved && !formData.modificationsRequested ? 'rgba(76, 175, 80, 0.1)' : 'transparent'
                    }}
                  >
                    <CardContent sx={{ py: 2 }}>
                      <FormControlLabel 
                        value="approved" 
                        control={<Radio color="success" />} 
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircle size={16} color="#2e7d32" />
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                Aprovar Informações
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Todas as informações estão corretas
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </CardContent>
                  </Card>

                  <Card 
                    variant="outlined" 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'rgba(255, 152, 0, 0.1)' },
                      bgcolor: formData.modificationsRequested ? 'rgba(255, 152, 0, 0.1)' : 'transparent'
                    }}
                  >
                    <CardContent sx={{ py: 2 }}>
                      <FormControlLabel 
                        value="modifications" 
                        control={<Radio color="warning" />} 
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AlertTriangle size={16} color="#ed6c02" />
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                Solicitar Modificações
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Algumas informações precisam ser ajustadas
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </CardContent>
                  </Card>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Observações */}
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Observações
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Observações da Revisão"
                  placeholder="Digite suas observações sobre a revisão..."
                  value={formData.notes}
                  onChange={(e) => updateFormData({ notes: e.target.value })}
                  variant="outlined"
                />
              </CardContent>
            </Card>

            {/* Modificações Solicitadas */}
            {formData.modificationsRequested && (
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    Modificações Solicitadas
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Modificações Solicitadas *"
                    placeholder="Descreva as modificações necessárias..."
                    value={formData.modificationNotes}
                    onChange={(e) => updateFormData({ modificationNotes: e.target.value })}
                    variant="outlined"
                    required
                  />
                </CardContent>
              </Card>
            )}

            {/* Status Summary */}
            <Alert 
              severity={
                formData.reviewApproved && !formData.modificationsRequested ? 'success' :
                formData.modificationsRequested ? 'warning' : 'info'
              }
              icon={
                formData.reviewApproved && !formData.modificationsRequested ? <CheckCircle size={20} /> :
                formData.modificationsRequested ? <AlertTriangle size={20} /> : <Info size={20} />
              }
            >
              <AlertTitle>
                {formData.reviewApproved && !formData.modificationsRequested ? 'Pronto para Finalização' :
                 formData.modificationsRequested ? 'Modificações Solicitadas' : 'Aguardando Revisão'}
              </AlertTitle>
              {formData.reviewApproved && !formData.modificationsRequested && 
                'Todas as informações foram aprovadas e você pode prosseguir para a finalização.'}
              {formData.modificationsRequested && 
                'Modificações foram solicitadas. Revise os pontos destacados antes de continuar.'}
              {!formData.reviewApproved && !formData.modificationsRequested && 
                'Selecione uma opção acima para continuar com o processo.'}
            </Alert>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}