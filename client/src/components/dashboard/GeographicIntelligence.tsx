import { useState, useMemo, useEffect } from "react";
import { 
  ComposableMap, 
  Geographies, 
  Geography, 
  Marker
} from "react-simple-maps";
import { geoPath } from "d3-geo";
import { scaleLinear } from "d3-scale";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, TrendingUp, Users, MapPin, Search } from "lucide-react";
import { Card } from "@/components/ui/card";

// URLs de GeoJSON do IBGE
const BR_STATES_URL = "https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=application/json&qualidade=minima&intrarregiao=UF";
const getStateUrl = (uf: string) => `https://servicodados.ibge.gov.br/api/v3/malhas/estados/${uf}?formato=application/json&qualidade=minima&intrarregiao=municipio`;

// Mock de Coordenadas para cidades principais
const cityCoords: Record<string, [number, number]> = {
  "RIO VERDE-GO": [-50.9201, -17.7915],
  "SAO PAULO-SP": [-46.6333, -23.5505],
  "RIO DE JANEIRO-RJ": [-43.1729, -22.9068],
  "BRASILIA-DF": [-47.9292, -15.7801],
  "GOIANIA-GO": [-49.2648, -16.6869],
  "CURITIBA-PR": [-49.2733, -25.4284],
  "BELO HORIZONTE-MG": [-43.9345, -19.9167],
  "CAIAPONIA-GO": [-51.8103, -16.9567],
  "SALVADOR-BA": [-38.5014, -12.9714],
  "FORTALEZA-CE": [-38.5433, -3.7172],
  "PRESIDENTE PRUDENTE-SP": [-51.3856, -22.1225],
};

const getCoordinates = (city: string, state: string): [number, number] => {
  const key = `${city.toUpperCase().trim()}-${state.toUpperCase().trim()}`;
  if (cityCoords[key]) return cityCoords[key];
  
  // Fallback determinístico baseado no nome (apenas para exibição se não houver no mapa)
  const hash = city.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return [-47.9 + (hash % 10) * 0.5, -15.7 + (hash % 5) * 0.5];
};

interface GeographicIntelligenceProps {
  clients: any[];
}

export function GeographicIntelligence({ clients = [] }: GeographicIntelligenceProps) {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [focusedCity, setFocusedCity] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [filterType, setFilterType] = useState<'todos' | 'cliente' | 'fornecedor' | 'outros'>('todos');
  const [stateGeo, setStateGeo] = useState<any>(null);

  // Filtragem de dados
  const filteredClients = useMemo(() => {
    let list = clients;
    if (filterType !== 'todos') {
      list = list.filter(c => String(c.type || "").toLowerCase() === filterType.toLowerCase());
    }
    if (selectedState) {
      list = list.filter(c => c.state === selectedState);
    }
    return list;
  }, [clients, filterType, selectedState]);

  // Ranking de cidades
  const cityRanking = useMemo(() => {
    const counts: Record<string, { count: number; state: string }> = {};
    filteredClients.forEach(c => {
      const key = `${c.city} - ${c.state}`;
      if (!counts[key]) counts[key] = { count: 0, state: c.state };
      counts[key].count++;
    });
    return Object.entries(counts)
      .map(([name, data]) => ({ name, count: data.count, state: data.state }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredClients]);

  // Estatísticas por estado para cor no mapa nacional - Respeitando o filtro
  const stateStats = useMemo(() => {
    const counts: Record<string, number> = {};
    const list = filterType === 'todos' ? clients : clients.filter(c => String(c.type || "").toLowerCase() === filterType.toLowerCase());
    list.forEach(c => {
      if (c.state) counts[c.state] = (counts[c.state] || 0) + 1;
    });
    return counts;
  }, [clients, filterType]);

  const maxCount = Math.max(...Object.values(stateStats), 1);
  const colorScale = scaleLinear<string>()
    .domain([0, maxCount])
    .range(["#F8FAFC", "#B59363"]);

  // Carregar GeoJSON do estado selecionado
  useEffect(() => {
    if (selectedState) {
      fetch(getStateUrl(selectedState))
        .then(res => res.json())
        .then(data => setStateGeo(data))
        .catch(() => setStateGeo(null));
    } else {
      setStateGeo(null);
    }
  }, [selectedState]);

  return (
    <Card className="w-full bg-white border-none shadow-2xl overflow-hidden rounded-[2.5rem]">
      <style dangerouslySetInnerHTML={{ __html: `
        .luxury-map-shadow {
          filter: drop-shadow(0 10px 15px rgba(0, 0, 0, 0.15));
        }
      `}} />
      
      {/* Header */}
      <div className="p-8 pb-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#B59363]/10 rounded-2xl flex items-center justify-center text-[#B59363]">
            <MapPin size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#4D4E48] tracking-tight uppercase">
              Inteligência Geográfica - {filterType === 'todos' ? 'Total' : filterType === 'cliente' ? 'Clientes' : filterType === 'fornecedor' ? 'Fornecedores' : 'Outros'}
            </h2>
            <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-0.5">Visão Inteligente</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-50/50 p-1 rounded-2xl relative border border-gray-100">
            {['todos', 'cliente', 'fornecedor', 'outros'].map((segment) => (
              <button
                key={segment}
                onClick={() => setFilterType(segment as any)}
                className={`relative px-4 py-2 text-[10px] font-black uppercase tracking-tight transition-all duration-300 ${filterType === segment ? 'text-[#B59363]' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <span className="relative">
                  {segment === 'todos' ? 'Todos' : segment === 'cliente' ? 'Clientes' : segment === 'fornecedor' ? 'Fornecedores' : 'Outros'}
                  {filterType === segment && (
                    <motion.div
                      initial={{ scaleX: 0, originX: 0 }}
                      animate={{ scaleX: 1 }}
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#B59363] rounded-full"
                      transition={{ 
                        duration: 1.5, 
                        ease: "easeOut" 
                      }}
                    />
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area - 2 Columns */}
      <div className="p-4 pt-2 flex flex-col lg:flex-row gap-6">
        {/* Left Column: Map */}
        <div className="relative h-[300px] flex-1 flex items-center justify-center bg-gray-50/20 rounded-2xl border border-gray-100/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedState ? 'state' : 'national'}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full"
            >
              {selectedState && (
                <button 
                  onClick={() => {
                    if (focusedCity) {
                      setFocusedCity(null);
                    } else {
                      setSelectedState(null);
                    }
                  }}
                  className="absolute top-3 left-3 z-10 flex items-center gap-2 text-[9px] font-black text-[#B59363] hover:text-[#1d3557] transition-all bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-gray-100"
                >
                  <ChevronLeft size={12} />
                  {focusedCity ? 'VOLTAR PARA ESTADO' : 'VOLTAR'}
                </button>
              )}

              {/* Overlay de Detalhes do Cliente */}
              <AnimatePresence>
                {selectedClient && (
                  <motion.div
                    initial={{ opacity: 0, x: 20, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.9 }}
                    className="absolute top-3 right-3 z-20 w-64 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-[#B59363]/20 overflow-hidden"
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Detalhes do Cliente</span>
                        </div>
                        <button 
                          onClick={() => setSelectedClient(null)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <ChevronLeft size={14} className="rotate-180" />
                        </button>
                      </div>

                      <h4 className="text-sm font-black text-[#4D4E48] leading-tight mb-1">{selectedClient.name}</h4>
                      <div className="flex items-center gap-1.5 mb-4">
                        <MapPin size={10} className="text-[#B59363]" />
                        <span className="text-[10px] text-gray-400 font-bold uppercase">{selectedClient.city} - {selectedClient.state}</span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter mb-1.5">Faturamento Total</p>
                          <div className="bg-[#B59363]/5 p-2.5 rounded-xl border border-[#B59363]/10">
                            <span className="text-lg font-black text-[#B59363]">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedClient.totalFaturado || 0)}
                            </span>
                          </div>
                        </div>

                        <div>
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter mb-1.5">Produtos / Serviços</p>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedClient.produtos && selectedClient.produtos.length > 0 ? (
                              selectedClient.produtos.map((p: string, idx: number) => (
                                <span key={idx} className="px-2 py-1 bg-gray-50 text-[9px] font-bold text-gray-500 rounded-md border border-gray-100">
                                  {p}
                                </span>
                              ))
                            ) : (
                              <span className="text-[9px] text-gray-400 italic">Nenhum produto vinculado</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

                <ComposableMap
                  projection="geoMercator"
                  projectionConfig={{
                    scale: focusedCity ? 15000 : (selectedState ? 1100 : 650),
                    center: focusedCity 
                      ? getCoordinates(focusedCity.split(' - ')[0], focusedCity.split(' - ')[1]) 
                      : (selectedState ? [0, 0] : [-55, -15]),
                  }}
                  className="w-full h-full outline-none luxury-map-shadow"
                >
                  {!selectedState ? (
                    // Visão Brasil
                    <>
                      <Geographies geography={BR_STATES_URL}>
                        {({ geographies }: { geographies: any[] }) =>
                          geographies.map((geo) => {
                            const uf = geo.properties.sigla;
                            return (
                              <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                onClick={() => setSelectedState(uf)}
                                style={{
                                  default: { 
                                    fill: colorScale(stateStats[uf] || 0), 
                                    stroke: "#1d3557", 
                                    strokeWidth: 0.6,
                                    strokeOpacity: 0.4,
                                    outline: "none"
                                  },
                                  hover: { 
                                    fill: "#B59363", 
                                    cursor: "pointer",
                                    outline: "none"
                                  },
                                  pressed: { outline: "none" }
                                }}
                              />
                            );
                          })
                        }
                      </Geographies>
                      {/* Pontos pulsantes na visão nacional - Respeitando o filtro */}
                      {Object.entries(stateStats).filter(([_, count]) => count > 0).map(([uf, _], idx) => {
                        const stateItem = clients.find(c => 
                          c.state === uf && 
                          (filterType === 'todos' || String(c.type || "").toLowerCase() === filterType.toLowerCase())
                        );
                        if (!stateItem) return null;
                        const coords = getCoordinates(stateItem.city, stateItem.state);
                        return (
                          <Marker key={`national-${uf}-${idx}`} coordinates={coords}>
                            <g>
                              <circle r={10} fill="#B59363" fillOpacity={0.6}>
                                <animate attributeName="r" from="10" to="50" dur="2s" begin="0s" repeatCount="indefinite" />
                                <animate attributeName="opacity" from="0.6" to="0" dur="2s" begin="0s" repeatCount="indefinite" />
                              </circle>
                              <circle r={10} fill="#B59363" fillOpacity={0.3}>
                                <animate attributeName="r" from="10" to="30" dur="1.5s" begin="0.5s" repeatCount="indefinite" />
                                <animate attributeName="opacity" from="0.3" to="0" dur="1.5s" begin="0.5s" repeatCount="indefinite" />
                              </circle>
                              <circle r={5} fill="#B59363" stroke="#fff" strokeWidth={2} className="shadow-lg" />
                            </g>
                          </Marker>
                        );
                      })}
                    </>
                  ) : (
                    // Visão Estado / Cidade
                    <>
                      {stateGeo && (
                        <Geographies geography={stateGeo}>
                          {({ geographies }: { geographies: any[] }) =>
                            geographies.map((geo) => (
                              <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                style={{
                                  default: { fill: "#F8FAFC", stroke: "#1d3557", strokeWidth: 0.4, strokeOpacity: 0.3, outline: "none" },
                                  hover: { fill: "#F1F5F9", outline: "none" },
                                  pressed: { outline: "none" }
                                }}
                              />
                            ))
                          }
                        </Geographies>
                      )}
                      
                      {/* Marcadores das cidades no estado selecionado */}
                      {filteredClients
                        .filter(client => !focusedCity || `${client.city} - ${client.state}` === focusedCity)
                        .map((client, idx) => {
                          const baseCoords = getCoordinates(client.city, client.state);
                          
                          // Dispersão (Jitter) apenas se estivermos em visão de foco na cidade
                          let coords = baseCoords;
                          if (focusedCity) {
                            const jitterAmount = 0.15; // Deslocamento drástico para espalhamento total
                            // Usar um padrão determinístico baseado no ID para espalhar os pontos
                            const angle = (idx * 137.5) * (Math.PI / 180);
                            const radius = (1.2 + Math.sqrt(idx)) * jitterAmount;
                            coords = [
                              baseCoords[0] + Math.cos(angle) * radius,
                              baseCoords[1] + Math.sin(angle) * radius
                            ];
                          }

                          return (
                            <Marker 
                              key={`${client.id}-${idx}`} 
                              coordinates={coords}
                              onClick={() => setSelectedClient(client)}
                            >
                              <g style={{ cursor: 'pointer' }}>
                                <circle r={focusedCity ? 12 : 8} fill="#B59363" fillOpacity={0.7}>
                                  <animate attributeName="r" from={focusedCity ? "12" : "8"} to={focusedCity ? "50" : "35"} dur="2s" begin="0s" repeatCount="indefinite" />
                                  <animate attributeName="opacity" from="0.7" to="0" dur="2s" begin="0s" repeatCount="indefinite" />
                                </circle>
                                <circle r={focusedCity ? 6 : 4} fill="#B59363" stroke="#fff" strokeWidth={1.5} />
                              </g>
                            </Marker>
                          );
                        })}
                    </>
                  )}
                </ComposableMap>



            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Column: Ranking */}
        <div className="w-full lg:w-[280px] flex flex-col lg:pr-4">
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-[#1d3557]" />
            <h3 className="text-[11px] font-black text-[#1d3557] tracking-widest uppercase">
              Ranking de {filterType === 'todos' ? 'Geral' : filterType === 'cliente' ? 'Clientes' : filterType === 'fornecedor' ? 'Fornecedores' : 'Outros'}
            </h3>
          </div>
          
          <div className="flex flex-col gap-2">
            {cityRanking.map((item, idx) => (
              <button 
                key={idx}
                onClick={() => {
                  setFocusedCity(item.name);
                  setSelectedState(item.state);
                }}
                className="flex items-center justify-between p-2 pl-4 pr-3 bg-gray-50/50 rounded-xl hover:bg-[#1d3557]/5 hover:translate-x-1 transition-all group border-none outline-none text-left w-full"
              >
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-[#1d3557] uppercase truncate max-w-[130px]">{item.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] text-[#B59363] font-black group-hover:scale-105 transition-transform origin-left">
                      {item.count}
                    </span>
                    <span className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">
                      {filterType === 'todos' ? 'Registros' : filterType === 'cliente' ? 'Clientes' : filterType === 'fornecedor' ? 'Fornecedores' : 'Outros'}
                    </span>
                  </div>
                </div>
                <div className="w-8 h-8 bg-[#B59363]/5 rounded-lg flex items-center justify-center group-hover:bg-[#B59363]/10 transition-colors">
                  <TrendingUp size={14} className="text-[#B59363]" />
                </div>
              </button>
            ))}
            {cityRanking.length === 0 && (
              <div className="py-6 text-center text-gray-400 italic text-[9px] font-medium bg-gray-50/30 rounded-xl border border-dashed border-[#1d3557]/10">
                Aguardando dados...
              </div>
            )}
          </div>

          <div className="mt-auto pt-3 border-t border-gray-100/50">
            <div className="flex items-center justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest">
              <span>Total no período</span>
              <span className="text-[#B59363]">
                {filteredClients.length} {filterType === 'todos' ? 'Registros' : filterType === 'cliente' ? 'Clientes' : filterType === 'fornecedor' ? 'Fornecedores' : 'Outros'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
