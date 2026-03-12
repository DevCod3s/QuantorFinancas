import { useEffect, useRef, useState, memo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface GeographicViewProps {
  clients: any[];
  onClientClick: (client: any) => void;
  focusedLocation: string | null;
}

// Mapa de coordenadas ampliado para cobrir as principais regiões e as cidades do usuário
const locationToCoords: Record<string, [number, number]> = {
  "Rio Verde - GO": [-17.7915, -50.9201],
  "São Paulo - SP": [-23.5505, -46.6333],
  "Rio de Janeiro - RJ": [-22.9068, -43.1729],
  "Belo Horizonte - MG": [-19.9167, -43.9345],
  "Curitiba - PR": [-25.4284, -49.2733],
  "Porto Alegre - RS": [-30.0346, -51.2177],
  "Salvador - BA": [-12.9714, -38.5014],
  "Fortaleza - CE": [-3.7172, -38.5433],
  "Recife - PE": [-8.0578, -34.8778],
  "Brasília - DF": [-15.7801, -47.9292],
  "Goiânia - GO": [-16.6869, -49.2648],
  "Cuiabá - MT": [-15.6014, -56.0979],
  "Campo Grande - MS": [-20.4697, -54.6201],
  "Manaus - AM": [-3.1190, -60.0217],
  "Belém - PA": [-1.4550, -48.4902],
};

const BRAZIL_GEOJSON_URL = "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson";

const getDeterminsticJitter = (id: number, seed: number) => {
  const x = Math.sin((id || 0) + seed) * 10000;
  return (x - Math.floor(x)) - 0.5;
};

export const GeographicView = memo(({ clients, onClientClick, focusedLocation }: GeographicViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const geoJsonLayer = useRef<L.GeoJSON | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch(BRAZIL_GEOJSON_URL)
      .then(res => {
        if (!res.ok) throw new Error("Falha ao carregar mapa");
        return res.json();
      })
      .then(data => { if (active) setGeoData(data); })
      .catch(err => { if (active) setError("Conexão interrompida."); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !geoData) return;

    if (!leafletMap.current) {
      try {
        leafletMap.current = L.map(mapRef.current, {
          center: [-15.7801, -47.9292],
          zoom: 5,
          scrollWheelZoom: true,
          zoomControl: false,
          attributionControl: false,
        });

        geoJsonLayer.current = L.geoJSON(geoData, {
          style: { 
            fillColor: '#E2E8F0', 
            weight: 1, 
            color: '#94A3B8', 
            fillOpacity: 1, 
            className: 'luxury-map-shape' 
          }
        }).addTo(leafletMap.current);

        markersLayer.current = L.layerGroup().addTo(leafletMap.current);

        if (geoJsonLayer.current) {
          if (clients && clients.length > 0) {
            const coordMapUpper = Object.keys(locationToCoords).reduce((acc, key) => {
              acc[key.toUpperCase()] = locationToCoords[key];
              return acc;
            }, {} as Record<string, [number, number]>);

            const validCoords = clients
              .map(c => {
                const lookupKey = `${(c.city || "").toUpperCase()} - ${(c.state || "").toUpperCase()}`;
                return coordMapUpper[lookupKey];
              })
              .filter(coord => !!coord);
            
            if (validCoords.length > 0) {
              const bounds = L.latLngBounds(validCoords as L.LatLngExpression[]);
              leafletMap.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
              console.log(`[DEBUG GeographicView] Zoom regional aplicado em ${validCoords.length} pontos.`);
            } else {
              leafletMap.current.fitBounds(geoJsonLayer.current.getBounds(), { padding: [30, 30] });
            }
          } else {
            leafletMap.current.fitBounds(geoJsonLayer.current.getBounds(), { padding: [30, 30] });
          }
        }
      } catch (e) {
        console.error("Erro Leaflet:", e);
        return;
      }
    }

    const stateCounts: Record<string, number> = {};
    clients.forEach(c => { if (c.state) stateCounts[c.state] = (stateCounts[c.state] || 0) + 1; });
    const maxCount = Math.max(...Object.values(stateCounts), 1);

    if (geoJsonLayer.current) {
      geoJsonLayer.current.setStyle((feature) => {
        const sigla = feature?.properties?.sigla || feature?.properties?.name;
        const count = stateCounts[sigla] || 0;
        const density = count / maxCount;
        
        // Estética Luxury: Degradê de cinza para destaque em branco/vermelho
        let color = '#FFFFFF';
        if (count > 0) {
          if (density === 1) color = '#F3F4F6'; // Destaque suave
          else if (density > 0) color = '#FAFAFA';
        }
        return { fillColor: color };
      });
    }

    if (markersLayer.current) {
      markersLayer.current.clearLayers();
      console.log(`[DEBUG GeographicView] Renderizando ${clients?.length || 0} marcadores.`);
      
      clients.forEach(client => {
        // Correção de Case-Sensitivity: RIO VERDE vs Rio Verde
        const cityUpper = (client.city || "").toUpperCase();
        const stateUpper = (client.state || "").toUpperCase();
        const lookupKey = `${cityUpper} - ${stateUpper}`;
        
        // Criar um mapa de busca em caixa alta para garantir match
        const coordMapUpper = Object.keys(locationToCoords).reduce((acc, key) => {
          acc[key.toUpperCase()] = locationToCoords[key];
          return acc;
        }, {} as Record<string, [number, number]>);

        const coords = coordMapUpper[lookupKey] || [-15.7801, -47.9292];
        
        // Marcador Premium com Efeito Pulsante (Glow)
        const luxuryIcon = L.divIcon({
          className: 'luxury-marker',
          html: `
            <div class="marker-container">
              <div class="marker-pulse"></div>
              <div class="marker-core"></div>
            </div>
          `,
          iconSize: [24, 24], 
          iconAnchor: [12, 12]
        });

        const marker = L.marker([
          coords[0] + getDeterminsticJitter(client.id, 0.1) * 0.4, 
          coords[1] + getDeterminsticJitter(client.id, 0.2) * 0.4
        ], { icon: luxuryIcon });
        
        const popupContent = document.createElement('div');
        popupContent.className = 'luxury-bi-popup';
        popupContent.innerHTML = `
          <div class="popup-header">
            <span class="status-dot"></span>
            <h4>${client.name || 'Cliente'}</h4>
          </div>
          <div class="popup-body">
            <p><i class="map-pin"></i> ${client.city || ''}, ${client.state || ''}</p>
            <div class="revenue-badge">
              ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.totalFaturado || 0)}
            </div>
          </div>
          <button id="det-${client.id}" class="popup-action">DETALHES COMPLETOS</button>
        `;
        
        marker.bindPopup(popupContent, { closeButton: false, className: 'premium-popup-wrap' });
        marker.on('popupopen', () => {
          const btn = document.getElementById(`det-${client.id}`);
          if (btn) btn.onclick = () => onClientClick(client);
        });
        markersLayer.current?.addLayer(marker);
      });
    }

    if (focusedLocation && locationToCoords[focusedLocation] && leafletMap.current) {
      leafletMap.current.flyTo(locationToCoords[focusedLocation], 8, { duration: 2 });
    }

  }, [geoData, clients, focusedLocation, onClientClick]);

  if (error) return null;

  return (
    <div className="relative w-full h-full group">
      
      <style dangerouslySetInnerHTML={{ __html: `
        .luxury-map-shape { 
          filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.3));
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .leaflet-container { 
          background-color: transparent !important; 
          cursor: crosshair !important;
        }
        
        /* Marcador Estilo Deck.gl / PowerBI Luxury */
        .marker-container { position: relative; width: 24px; height: 24px; }
        .marker-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          background: rgba(181, 147, 99, 0.4);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        .marker-core {
          position: absolute;
          top: 25%;
          left: 25%;
          width: 50%;
          height: 50%;
          background: #B59363;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 10px rgba(181, 147, 99, 0.5);
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          70% { transform: scale(3); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }

        /* Popup Estilo Premium */
        .premium-popup-wrap .leaflet-popup-content-wrapper {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(12px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 0; overflow: hidden;
          box-shadow: 0 30px 60px rgba(0,0,0,0.25);
        }
        .luxury-bi-popup { padding: 16px; min-width: 220px; }
        .popup-header { display: flex; items-center; gap: 10px; margin-bottom: 12px; }
        .status-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 8px rgba(34, 197, 94, 0.5); }
        .popup-header h4 { font-weight: 800; color: #111827; margin: 0; font-size: 14px; letter-spacing: -0.02em; }
        .popup-body p { margin: 0; font-size: 11px; color: #6b7280; font-weight: 600; display: flex; align-items: center; gap: 4px; }
        .revenue-badge { 
          margin-top: 12px; font-size: 16px; font-weight: 900; color: #4D4E48; 
          background: #f3f4f6; padding: 6px 12px; border-radius: 10px; display: inline-block;
          border: 1px solid rgba(0,0,0,0.05);
        }
        .popup-action {
          width: 100%; margin-top: 16px; padding: 10px; 
          background: #111827; color: white; border: none; border-radius: 10px;
          font-size: 10px; font-weight: 800; letter-spacing: 1px; cursor: pointer;
          transition: all 0.2s ease;
        }
        .popup-action:hover { background: #E63946; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(230, 57, 70, 0.3); }
      `}} />
      <div ref={mapRef} className="w-full h-[300px] overflow-hidden" style={{ isolation: 'isolate', background: '#B9BDBE' }} />
    </div>
  );
});

GeographicView.displayName = 'GeographicView';
