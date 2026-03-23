import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useRelationshipManager } from "@/hooks/useRelationshipManager";
import CustomInput, { CustomSelect } from "../CustomInput";
import { IButtonPrime } from "../ui/i-ButtonPrime";
import { Building, User, ShieldAlert, Save, X } from "lucide-react";

interface EditRelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  onSuccess: () => void;
}

export default function EditRelationshipModal({ isOpen, onClose, data, onSuccess }: EditRelationshipModalProps) {
  const { updateRelationship, isLoading } = useRelationshipManager();

  const [formData, setFormData] = useState({
    type: "cliente",
    email: "",
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: ""
  });

  useEffect(() => {
    if (data && isOpen) {
      setFormData({
        type: data.type || "cliente",
        email: data.email || "",
        zipCode: data.zipcode || data.zip_code || data.zipCode || "",
        street: data.street || "",
        number: data.number || "",
        complement: data.complement || "",
        neighborhood: data.neighborhood || "",
        city: data.city || "",
        state: data.state || ""
      });
    }
  }, [data, isOpen]);

  const handleZipCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 5) {
      value = value.replace(/^(\d{5})(\d)/, '$1-$2');
    }
    setFormData(prev => ({ ...prev, zipCode: value }));
    
    if (value.replace(/\D/g, '').length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${value.replace(/\D/g, '')}/json/`);
        const result = await response.json();
        if (!result.erro) {
          setFormData(prev => ({
            ...prev,
            street: result.logradouro,
            neighborhood: result.bairro,
            city: result.localidade,
            state: result.uf
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP", error);
      }
    }
  };

  const handleSave = async () => {
    if (!data?.id) return;
    try {
      const payload: any = {
        type: formData.type,
        email: formData.email,
        zipCode: formData.zipCode,
        street: formData.street,
        number: formData.number,
        complement: formData.complement,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        socialName: data?.socialname || data?.social_name || data?.socialName || '',
        documentType: data?.documenttype || data?.document_type || data?.documentType || 'CPF',
        document: data?.document || '',
        stateRegistration: data?.stateregistration || data?.state_registration || data?.stateRegistration || ''
      };
      
      const success = await updateRelationship(data.id, payload, formData.type as 'cliente' | 'fornecedor' | 'outros');
      
      if (success) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Erro ao atualizar relacionamento", error);
    }
  };

  const documentType = data?.documenttype || data?.document_type || data?.documentType || "CPF";
  const document = data?.document || "";
  const name = data?.socialname || data?.social_name || data?.socialName || data?.fantasyname || "";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-white/95 backdrop-blur-sm shadow-2xl border-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#4D4E48] to-[#B59363]"></div>
        
        <DialogHeader className="pt-4 pb-2 border-b">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-gray-800">
            {documentType === 'CNPJ' ? <Building className="h-6 w-6 text-[#B59363]" /> : <User className="h-6 w-6 text-[#B59363]" />}
            Editar Relacionamento
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Modifique informações de contato e endereço. Dados sensíveis de identificação estão bloqueados para proteger contratos assinados.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Dados Bloqueados/Contexto */}
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 flex gap-4 items-start relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
              <ShieldAlert className="w-32 h-32" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Identificação Protegida</p>
              <h3 className="text-lg font-bold text-gray-800 leading-tight">{name}</h3>
              <p className="text-sm text-gray-500 font-mono mt-1">{documentType}: {document}</p>
            </div>
            <div className="bg-gray-200/50 text-gray-600 px-3 py-1 rounded-full text-xs font-medium self-center cursor-not-allowed">
              Somente Leitura
            </div>
          </div>

          {/* Dados Permitidos */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 sm:col-span-6">
              <CustomSelect
                label="Tipo de Relacionamento"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="cliente">Cliente</option>
                <option value="fornecedor">Fornecedor</option>
                <option value="outros">Outros/Parceiro</option>
              </CustomSelect>
            </div>
            
            <div className="col-span-12 sm:col-span-6">
              <CustomInput
                label="E-mail"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="col-span-12 sm:col-span-4">
              <CustomInput
                label="CEP"
                value={formData.zipCode}
                onChange={handleZipCodeChange}
                placeholder="00000-000"
                maxLength={9}
              />
            </div>

            <div className="col-span-12 sm:col-span-8">
              <CustomInput
                label="Logradouro"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                placeholder="Rua, Avenida..."
              />
            </div>

            <div className="col-span-12 sm:col-span-3">
              <CustomInput
                label="Número"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="123"
              />
            </div>

            <div className="col-span-12 sm:col-span-4">
              <CustomInput
                label="Complemento"
                value={formData.complement}
                onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                placeholder="Sala, Apto, Bloco..."
              />
            </div>

            <div className="col-span-12 sm:col-span-5">
              <CustomInput
                label="Bairro"
                value={formData.neighborhood}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                placeholder="Centro"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="bg-gray-50 p-4 -m-6 mt-2 border-t flex justify-end gap-2">
          <IButtonPrime 
            icon={<X className="w-5 h-5" />} 
            variant="red" 
            title="Cancelar (Sair)" 
            onClick={onClose} 
          />
          <IButtonPrime 
            icon={<Save className="w-5 h-5" />} 
            variant="gold" 
            title="Salvar Alterações" 
            onClick={handleSave} 
            disabled={isLoading}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
