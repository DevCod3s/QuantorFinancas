/**
 * @fileoverview Etapa 4 do cadastro de relacionamento - Finalização
 * Versão Material-UI melhorada com layout profissional
 */

import React, { useState, useEffect } from "react";
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Divider,
  TextField,
  FormControlLabel,
  Checkbox,
  Button as MuiButton,
  Chip,
  Avatar,
  Alert,
  AlertTitle,
  LinearProgress,
  IconButton
} from "@mui/material";
import { 
  CheckCircle2, 
  Download, 
  FileText, 
  Hash, 
  Calendar,
  User,
  Building2,
  CreditCard,
  Mail,
  Phone,
  Save,
  RefreshCw,
  Settings,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

interface Step4FormData {
  uniqueCode: string;
  contactEmail: string;
  contactPhone: string;
  notifications: {
    email: boolean;
    sms: boolean;
  };
  finalNotes: string;
  confirmations: {
    dataAccuracy: boolean;
    termsAccepted: boolean;
    documentationReviewed: boolean;
  };
}

interface Step4FinalPRDProps {
  onDataChange: (data: Step4FormData, isValid: boolean) => void;
  initialData?: Partial<Step4FormData>;
  relationshipData?: any;
  contractData?: any;
  reviewData?: any;
}

export default function Step4FinalPRD({ 
  onDataChange, 
  initialData = {},
  relationshipData,
  contractData,
  reviewData
}: Step4FinalPRDProps) {
  const [formData, setFormData] = useState<Step4FormData>({
    uniqueCode: '',
    contactEmail: '',
    contactPhone: '',
    notifications: {
      email: true,
      sms: false
    },
    finalNotes: '',
    confirmations: {
      dataAccuracy: false,
      termsAccepted: false,
      documentationReviewed: false
    },
    ...initialData
  });

  const generateUniqueCode = () => {
    const prefix = relationshipData?.document?.length > 11 ? 'PJ' : 'PF';
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${randomNum}`;
  };

  const updateFormData = (updates: Partial<Step4FormData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    
    const isValid = Object.values(newData.confirmations).every(Boolean);
    onDataChange(newData, isValid);
  };

  useEffect(() => {
    if (!formData.uniqueCode) {
      updateFormData({ uniqueCode: generateUniqueCode() });
    }
  }, []);

  const getCompletionPercentage = () => {
    let completed = 0;
    let total = 3; // 3 confirmações obrigatórias
    
    if (Object.values(formData.confirmations).every(Boolean)) completed += 3;
    
    return (completed / total) * 100;
  };

  const isFormValid = () => {
    return Object.values(formData.confirmations).every(Boolean);
  };

  return (
    <Box sx={{ maxWidth: '1400px', mx: 'auto', p: 3 }}>
      {/* Header de Finalização */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)', color: 'white' }}>
        <CardContent sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
              <CheckCircle2 size={24} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={600}>
                Finalização do Relacionamento
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Confirme todos os dados e finalize o cadastro do relacionamento
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
        {/* Coluna Principal - Código e Configurações */}
        <Box sx={{ flex: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Código Único Gerado */}
            <Card elevation={3} sx={{ bgcolor: 'success.50', borderLeft: '4px solid', borderColor: 'success.main' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Hash size={20} color="#2e7d32" />
                  <Typography variant="h6" fontWeight={600} color="success.dark">
                    Código do Relacionamento
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography 
                    variant="h4" 
                    fontFamily="monospace" 
                    fontWeight={700}
                    sx={{ 
                      bgcolor: 'white', 
                      px: 2, 
                      py: 1, 
                      borderRadius: 1,
                      border: '2px solid',
                      borderColor: 'success.main',
                      color: 'success.dark'
                    }}
                  >
                    {formData.uniqueCode}
                  </Typography>
                  <IconButton 
                    onClick={() => updateFormData({ uniqueCode: generateUniqueCode() })}
                    color="success"
                    title="Gerar novo código"
                  >
                    <RefreshCw />
                  </IconButton>
                </Box>
                <Typography variant="body2" color="success.dark">
                  Este código será usado para identificar o relacionamento no sistema
                </Typography>
              </CardContent>
            </Card>

            {/* Progresso de Completude */}
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Progresso de Completude
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Completude geral
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {Math.round(getCompletionPercentage())}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={getCompletionPercentage()} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <CheckCircle size={24} color="#2e7d32" />
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Dados Básicos
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    {contractData?.generateContract ? (
                      <CheckCircle size={24} color="#2e7d32" />
                    ) : (
                      <CheckCircle size={24} color="#9e9e9e" />
                    )}
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Contrato
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    {reviewData?.reviewApproved ? (
                      <CheckCircle size={24} color="#2e7d32" />
                    ) : (
                      <CheckCircle size={24} color="#9e9e9e" />
                    )}
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Revisão
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Contato e Notificações */}
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Settings size={20} color="#1976d2" />
                  <Typography variant="h6" fontWeight={600}>
                    Contato e Notificações
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
                  <TextField
                    fullWidth
                    label="E-mail de Contato"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => updateFormData({ contactEmail: e.target.value })}
                    placeholder="email@empresa.com"
                    InputProps={{
                      startAdornment: <Mail size={20} color="#666" style={{ marginRight: 8 }} />
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Telefone de Contato"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => updateFormData({ contactPhone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    InputProps={{
                      startAdornment: <Phone size={20} color="#666" style={{ marginRight: 8 }} />
                    }}
                  />
                </Box>

                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  Preferências de Notificação
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.notifications.email}
                        onChange={(e) => updateFormData({
                          notifications: { ...formData.notifications, email: e.target.checked }
                        })}
                        color="primary"
                      />
                    }
                    label="Notificações por e-mail"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.notifications.sms}
                        onChange={(e) => updateFormData({
                          notifications: { ...formData.notifications, sms: e.target.checked }
                        })}
                        color="primary"
                      />
                    }
                    label="Notificações por SMS"
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Status de Documentos */}
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <FileText size={20} color="#1976d2" />
                  <Typography variant="h6" fontWeight={600}>
                    Documentos Gerados
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle size={16} color="#2e7d32" />
                      <Typography variant="body2">Contrato Principal</Typography>
                    </Box>
                    <IconButton size="small" color="primary">
                      <Download size={16} />
                    </IconButton>
                  </Box>
                  
                  {contractData?.hasAdhesion && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle size={16} color="#2e7d32" />
                        <Typography variant="body2">Termo de Adesão</Typography>
                      </Box>
                      <IconButton size="small" color="primary">
                        <Download size={16} />
                      </IconButton>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle size={16} color="#2e7d32" />
                      <Typography variant="body2">Ficha Cadastral</Typography>
                    </Box>
                    <IconButton size="small" color="primary">
                      <Download size={16} />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Coluna Lateral - Confirmação Final */}
        <Box sx={{ flex: 1, minWidth: '350px' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Resumo Executivo */}
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Resumo Executivo
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <User size={16} />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {relationshipData?.socialName || 'Nome não informado'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {relationshipData?.document || 'Documento não informado'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {contractData?.generateContract && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'info.main' }}>
                        <CreditCard size={16} />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          R$ {contractData?.monthlyValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Valor mensal do contrato
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                      <Calendar size={16} />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {new Date().toLocaleDateString('pt-BR')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Data de criação
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Observações Finais */}
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Observações Finais
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Observações sobre o relacionamento"
                  value={formData.finalNotes}
                  onChange={(e) => updateFormData({ finalNotes: e.target.value })}
                  placeholder="Digite observações finais sobre o relacionamento..."
                  variant="outlined"
                />
              </CardContent>
            </Card>

            {/* Confirmações Obrigatórias */}
            <Card elevation={3} sx={{ borderLeft: '4px solid', borderColor: 'warning.main' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'warning.dark' }}>
                  Confirmações Obrigatórias
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.confirmations.dataAccuracy}
                        onChange={(e) => updateFormData({
                          confirmations: { ...formData.confirmations, dataAccuracy: e.target.checked }
                        })}
                        color="warning"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        Confirmo que todas as informações fornecidas são precisas e corretas
                      </Typography>
                    }
                  />
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.confirmations.termsAccepted}
                        onChange={(e) => updateFormData({
                          confirmations: { ...formData.confirmations, termsAccepted: e.target.checked }
                        })}
                        color="warning"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        Li e aceito os termos e condições do relacionamento comercial
                      </Typography>
                    }
                  />
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.confirmations.documentationReviewed}
                        onChange={(e) => updateFormData({
                          confirmations: { ...formData.confirmations, documentationReviewed: e.target.checked }
                        })}
                        color="warning"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        Revisei toda a documentação gerada e aprovo seu conteúdo
                      </Typography>
                    }
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Status de Finalização */}
            <Alert 
              severity={isFormValid() ? 'success' : 'warning'}
              icon={isFormValid() ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
            >
              <AlertTitle>
                {isFormValid() ? 'Pronto para Finalização' : 'Confirmações Pendentes'}
              </AlertTitle>
              {isFormValid() 
                ? 'Todas as confirmações foram aceitas. O relacionamento pode ser finalizado.'
                : 'Complete todas as confirmações obrigatórias para finalizar o relacionamento.'
              }
            </Alert>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}