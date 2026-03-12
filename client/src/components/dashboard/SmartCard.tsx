import { useState, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map as MapIcon, BarChart3, LayoutGrid, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SmartCardProps {
  title: string;
  children: ReactNode;
  viewType: 'map' | 'chart' | 'details' | 'geographic_chart';
  onViewChange: (type: any) => void;
  footer?: ReactNode;
  filters?: ReactNode;
  chartFilter?: 'state' | 'city';
  onChartFilterChange?: (filter: 'state' | 'city') => void;
  relationshipFilter?: 'cliente' | 'fornecedor' | 'outros' | 'todos';
  onRelationshipFilterChange?: (filter: 'cliente' | 'fornecedor' | 'outros' | 'todos') => void;
}

export function SmartCard({ 
  title, 
  children, 
  viewType, 
  onViewChange, 
  footer,
  filters,
  chartFilter,
  onChartFilterChange,
  relationshipFilter,
  onRelationshipFilterChange
}: SmartCardProps) {
  return (
    <Card className="w-full bg-white border-none shadow-2xl overflow-hidden rounded-[2.5rem]">
      <CardHeader className="p-8 pb-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#B59363]/10 rounded-2xl flex items-center justify-center text-[#B59363] shadow-inner">
              {viewType === 'map' ? <MapIcon size={24} /> : <BarChart3 size={24} />}
            </div>
            <div>
              <CardTitle className="text-2xl font-black text-[#4D4E48] tracking-tight uppercase">
                {title}
              </CardTitle>
              <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-0.5">Visão Inteligente</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {onRelationshipFilterChange && (
              <div className="flex bg-gray-100 p-1 rounded-xl mr-2 border border-gray-200/50">
                {['todos', 'cliente', 'fornecedor', 'outros'].map((segment) => (
                  <button
                    key={segment}
                    onClick={() => onRelationshipFilterChange(segment as any)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${relationshipFilter === segment ? 'bg-white shadow-sm text-[#B59363]' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {segment === 'todos' ? 'Todos' : segment === 'cliente' ? 'Clientes' : segment === 'fornecedor' ? 'Fornec.' : 'Outros'}
                  </button>
                ))}
              </div>
            )}

            {viewType === 'chart' && onChartFilterChange && (
              <div className="flex bg-gray-100 p-1 rounded-xl mr-4 border border-gray-200/50">
                <button
                  onClick={() => onChartFilterChange('state')}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${chartFilter === 'state' ? 'bg-white shadow-sm text-[#B59363]' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Estados
                </button>
                <button
                  onClick={() => onChartFilterChange('city')}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${chartFilter === 'city' ? 'bg-white shadow-sm text-[#B59363]' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Cidades
                </button>
              </div>
            )}

            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
              <button
                onClick={() => onViewChange('map')}
                className={`p-2.5 rounded-lg transition-all ${viewType === 'map' ? 'bg-white shadow-md text-[#B59363]' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <MapIcon size={20} />
              </button>
              <button
                onClick={() => onViewChange('chart')}
                className={`p-2.5 rounded-lg transition-all ${viewType === 'chart' ? 'bg-white shadow-md text-[#B59363]' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <BarChart3 size={20} />
              </button>
            </div>
          </div>
        </div>

        {filters && (
          <div className="pt-2 animate-in fade-in duration-500">
            {filters}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewType + (chartFilter || '')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative h-[300px] w-full"
          >
             {children}
          </motion.div>
        </AnimatePresence>

        {footer && (
          <div className="p-8 pt-0 mt-4">
            <div className="pt-8 border-t border-gray-50">
              {footer}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
