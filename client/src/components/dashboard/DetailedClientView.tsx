import { motion } from "framer-motion";
import { ChevronLeft, ShoppingBag, TrendingUp, Calendar, MapPin, Package } from "lucide-react";

interface DetailedClientViewProps {
  client: any;
  onBack: () => void;
}

export function DetailedClientView({ client, onBack }: DetailedClientViewProps) {
  return (
    <div className="space-y-6">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-[#B59363] hover:text-[#a38459] transition-colors font-medium group"
      >
        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Voltar para o Painel
      </button>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Info Card */}
        <div className="flex-1 bg-gray-50 rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#B59363] shadow-sm">
              <Package size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#4D4E48]">{client.name}</h3>
              <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                <MapPin size={14} />
                {client.city} - {client.state}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100">
              <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Total Faturado</div>
              <div className="text-xl font-bold text-[#B59363]">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.totalFaturado)}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100">
              <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Relacionamento</div>
              <div className="text-xl font-bold text-gray-700">Ativo</div>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag size={18} className="text-[#B59363]" />
            <h4 className="font-bold text-[#4D4E48]">Produtos e Serviços</h4>
          </div>
          
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {client.produtos && client.produtos.length > 0 ? (
              client.produtos.map((item: string, idx: number) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={idx}
                  className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between hover:border-[#B59363]/30 transition-colors shadow-sm"
                >
                  <span className="text-gray-700 font-medium">{item}</span>
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#B59363]">
                    <TrendingUp size={16} />
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-2xl border border-dashed">
                Nenhum produto registrado
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
