import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';
import { memo } from 'react';

interface GeographicChartProps {
  data: Array<{ name: string; count: number }>;
  type: 'state' | 'city';
}

const COLORS = ['#E63946', '#4D4E48', '#B59363', '#94A3B8', '#1F2937', '#6B7280'];

export const GeographicChart = memo(({ data, type }: GeographicChartProps) => {
  // Ordenar dados por contagem decrescente
  const sortedData = [...data].sort((a, b) => b.count - a.count).slice(0, 10);

  return (
    <div className="w-full h-[300px] p-6">
      <div className="mb-4">
        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">
          {type === 'state' ? 'Distribuição por Estado' : 'Distribuição por Cidade'}
        </h3>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#4D4E48', fontSize: 10, fontWeight: 800 }}
            width={80}
          />
          <Tooltip
            cursor={{ fill: 'transparent' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-3 shadow-2xl rounded-xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      {payload[0].payload.name}
                    </p>
                    <p className="text-lg font-black text-[#B59363]">
                      {payload[0].value} <span className="text-[10px] text-gray-400">Clientes</span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar 
            dataKey="count" 
            radius={[0, 10, 10, 0]} 
            barSize={20}
          >
            {sortedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={index === 0 ? '#B59363' : '#4D4E48'} 
                fillOpacity={1 - (index * 0.1)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

GeographicChart.displayName = 'GeographicChart';
