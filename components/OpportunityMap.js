// components/OpportunityMap.js - Version avec uniquement les wilayas à opportunité
const { useState, useEffect, useRef } = React;

const DZDArmount = ({ value }) => {
  const formatDZD = (val) => {
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}B DZD`;
    if (val >= 1000000) return `${(val / 1000000).toFixed(0)}M DZD`;
    return `${val.toLocaleString()} DZD`;
  };
  return <span>{formatDZD(value)}</span>;
};

const ZoneBadge = ({ zone }) => {
  const colors = {
    'III': 'bg-red/20 text-red',
    'IIb': 'bg-[#E3622A]/20 text-[#E3622A]',
    'IIa': 'bg-[#D29922]/20 text-[#D29922]',
    'I': 'bg-[#A3A020]/20 text-[#A3A020]',
    '0': 'bg-green/20 text-green'
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${colors[zone] || 'bg-ash text-fog'}`}>
      Zone {zone}
    </span>
  );
};

// Coordonnées GPS précises pour l'Algérie - Wilayas avec opportunités (score >= 40)
const MOCK_WILAYAS_OPP = [
  { id: 1, name: 'Adrar', zone: '0', lat: 27.8667, lng: -0.2833, score: 95, cap: 500000000, used: 120000000, popGrowth: '+3.2%', compCount: 2, reason: 'Zone 0 + 3.2% pop. growth + only 120M insured', products: ['SME Multi-risk', 'Agricultural', 'Solar Farm Coverage'] },
  { id: 8, name: 'Béchar', zone: '0', lat: 31.6167, lng: -2.2167, score: 88, cap: 400000000, used: 80000000, popGrowth: '+2.8%', compCount: 3, reason: 'Safe zone + new industrial zone development', products: ['Industrial Fire', 'Contractor All Risks'] },
  { id: 11, name: 'Tamanrasset', zone: '0', lat: 22.7850, lng: 5.5228, score: 82, cap: 300000000, used: 45000000, popGrowth: '+2.5%', compCount: 1, reason: 'Virtually untapped market + border trade expansion', products: ['Commercial Property', 'Transit/Cargo'] },
  { id: 39, name: 'El Oued', zone: 'I', lat: 33.3667, lng: 6.8667, score: 75, cap: 600000000, used: 250000000, popGrowth: '+4.1%', compCount: 4, reason: 'High agricultural growth + low seismic risk', products: ['Agribusiness Multi-risk', 'Cold Storage Coverage'] },
  { id: 30, name: 'Ouargla', zone: 'IIb', lat: 31.9500, lng: 5.3167, score: 62, cap: 1500000000, used: 500000000, popGrowth: '+2.0%', compCount: 6, reason: 'Strong oil/gas sector but moderate risk and competition', products: ['Energy Sector Niche Products'] },
  { id: 31, name: 'Oran', zone: 'IIa', lat: 35.6969, lng: -0.6331, score: 40, cap: 2000000000, used: 850000000, popGrowth: '+1.5%', compCount: 12, reason: 'High competition and moderate risk offset growth', products: ['Selective Commercial Only'] },
  // Wilayas sans opportunité (score < 40) ne sont PAS incluses
];

// Filtrer pour n'avoir que les wilayas avec opportunité
const OPPORTUNITY_WILAYAS = MOCK_WILAYAS_OPP;

const getMarkerColor = (score) => {
  if (score >= 80) return '#10B981';  // Vert clair - Haute opportunité
  if (score >= 60) return '#059669';  // Vert moyen
  if (score >= 40) return '#047857';  // Vert foncé
  return '#4B5563';
};

const getMarkerSize = (score) => {
  if (score >= 80) return 14;
  if (score >= 60) return 12;
  if (score >= 40) return 10;
  return 8;
};

const OpportunityMap = () => {
  const [selectedWilaya, setSelectedWilaya] = useState(null);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const sortedOpportunities = [...OPPORTUNITY_WILAYAS].sort((a, b) => b.score - a.score).slice(0, 5);

  // Initialisation de la carte et ajout des marqueurs
  useEffect(() => {
    const initMap = () => {
      if (typeof L === 'undefined') {
        console.error('Leaflet not loaded');
        return;
      }

      if (!mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current).setView([28.0, 2.5], 5.2);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CartoDB',
        maxZoom: 10,
        minZoom: 4
      }).addTo(map);

      const algeriaBounds = L.latLngBounds([
        [18.0, -8.5],
        [37.5, 12.0]
      ]);
      map.setMaxBounds(algeriaBounds);
      map.fitBounds(algeriaBounds);

      // Ajouter uniquement les marqueurs des wilayas à opportunité
      OPPORTUNITY_WILAYAS.forEach(w => {
        const color = getMarkerColor(w.score);
        const radius = getMarkerSize(w.score);

        const marker = L.circleMarker([w.lat, w.lng], {
          radius: radius,
          fillColor: color,
          fillOpacity: 0.85,
          color: '#FFFFFF',
          weight: 2,
          opacity: 0.9
        }).addTo(map);

        marker.bindTooltip(`
          <div style="font-family: monospace; padding: 4px;">
            <strong style="color: ${color};">${w.name}</strong><br/>
            <span style="color: #ccc;">Score: ${w.score}</span><br/>
            <span style="color: #888;">Zone ${w.zone}</span>
          </div>
        `, { sticky: true, className: 'custom-tooltip' });

        marker.on('click', () => {
          setSelectedWilaya(w);
          map.setView([w.lat, w.lng], 7);
        });
      });

      mapInstanceRef.current = map;

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 200);
    };

    setTimeout(initMap, 100);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-56px)] overflow-hidden -mx-8 -my-8">

      {/* Carte Leaflet */}
      <div
        ref={mapContainerRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 0, minHeight: '500px' }}
      ></div>

      {/* Overlay léger */}
      <div
        className="absolute inset-0 bg-black/10 pointer-events-none"
        style={{ zIndex: 1 }}
      ></div>

      {/* UI Components */}
      <div
        className="absolute inset-0"
        style={{ zIndex: 2, pointerEvents: 'none' }}
      >

        {/* Panneau Legend - Top Left */}
        <div
          className="absolute top-6 left-6 bg-carbon/90 backdrop-blur-sm rounded-lg border border-ash p-5 w-[320px]"
          style={{ pointerEvents: 'auto' }}
        >
          <h3 className="font-mono text-[16px] font-semibold text-pure mb-2 flex items-center gap-2">
            <i className="lucide-target text-emerald-500 text-lg"></i>
            Market Opportunity Score
          </h3>
          <p className="font-sans text-[12px] text-fog mb-4">Identifies optimal regions for sales expansion based on minimal seismic risk and high market potential.</p>

          <div className="mb-4">
            <div className="flex justify-between font-mono text-[10px] text-cloud mb-1">
              <span>Low/Avoid</span>
              <span>High Potential</span>
            </div>
            <div className="h-3 w-full rounded-full bg-gradient-to-r from-gray-600 via-emerald-700 to-emerald-400"></div>
          </div>

          <div className="bg-graphite/50 rounded-[6px] p-3">
            <div className="font-sans text-[11px] font-semibold text-fog uppercase mb-2">Score Formula Elements</div>
            <ul className="space-y-1.5 font-sans text-[12px] text-cloud">
              <li className="flex items-center gap-2"><i className="lucide-check text-emerald-500 text-sm"></i> Safe Zone Classification (0, I)</li>
              <li className="flex items-center gap-2"><i className="lucide-check text-emerald-500 text-sm"></i> Low Current Concentration</li>
              <li className="flex items-center gap-2"><i className="lucide-check text-emerald-500 text-sm"></i> High Population/Econ Growth</li>
            </ul>
          </div>
        </div>

        {/* Panneau Top 5 - Top Right */}
        <div
          className="absolute top-6 right-6 bg-carbon/90 backdrop-blur-sm rounded-lg border border-ash w-[380px] flex flex-col max-h-[calc(100vh-120px)]"
          style={{ pointerEvents: 'auto' }}
        >
          <div className="p-4 border-b border-ash">
            <h3 className="font-mono text-[15px] font-semibold text-pure uppercase flex items-center gap-2">
              <i className="lucide-trending-up text-emerald-500 text-lg"></i>
              Top 5 Growth Markets
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {sortedOpportunities.map((w, idx) => (
              <div
                key={w.id}
                className="bg-graphite rounded-[6px] p-3 hover:border-emerald-500/50 transition-all cursor-pointer border border-ash"
                onClick={() => {
                  setSelectedWilaya(w);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView([w.lat, w.lng], 7);
                  }
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-900 text-emerald-400 flex items-center justify-center font-mono text-[12px] font-bold">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="font-sans text-[14px] font-semibold text-pure">{w.name}</div>
                      <div className="font-sans text-[11px] text-fog">Zone {w.zone}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[16px] font-bold text-emerald-400">{w.score}</div>
                    <div className="font-sans text-[10px] text-fog uppercase">Score</div>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-carbon rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-emerald-500" style={{width: `${w.score}%`}}></div>
                </div>

                <p className="font-sans text-[12px] text-cloud leading-snug">
                  {w.reason}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-ash">
            <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-pure font-sans font-semibold rounded-[6px] h-[36px] transition-colors text-sm">
              View Full Opportunity Report
            </button>
          </div>
        </div>

        {/* Boutons Zoom */}
        <div
          className="absolute bottom-8 left-6 flex flex-col gap-2"
          style={{ pointerEvents: 'auto' }}
        >
          <div className="bg-carbon/90 backdrop-blur-sm rounded-lg border border-ash flex flex-col p-1">
            <button
              onClick={() => mapInstanceRef.current && mapInstanceRef.current.zoomIn()}
              className="w-8 h-8 flex items-center justify-center text-fog hover:text-pure hover:bg-ash rounded transition-colors"
            >
              <i className="lucide-plus text-sm"></i>
            </button>
            <div className="w-6 mx-auto border-t border-ash/50 my-0.5"></div>
            <button
              onClick={() => mapInstanceRef.current && mapInstanceRef.current.zoomOut()}
              className="w-8 h-8 flex items-center justify-center text-fog hover:text-pure hover:bg-ash rounded transition-colors"
            >
              <i className="lucide-minus text-sm"></i>
            </button>
          </div>
        </div>

        {/* Drawer - Right */}
        <div
          className={`fixed top-0 right-0 h-full w-[480px] bg-carbon border-l border-ash shadow-modal transition-transform duration-300 flex flex-col
            ${selectedWilaya ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ pointerEvents: 'auto', zIndex: 30 }}
        >
          {selectedWilaya && (
            <>
              <div className="p-6 border-b border-ash relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-sans text-[11px] font-semibold text-emerald-500 uppercase mb-1">Market Profile</div>
                    <h2 className="font-mono text-[28px] font-medium text-pure mb-1">{selectedWilaya.name}</h2>
                    <p className="font-sans text-sm text-fog">Wilaya Code: {selectedWilaya.id.toString().padStart(2, '0')}</p>
                  </div>
                  <button onClick={() => setSelectedWilaya(null)} className="w-8 h-8 flex items-center justify-center bg-carbon hover:bg-ash border border-ash rounded-full text-fog hover:text-pure transition-colors">
                    <i className="lucide-x text-lg"></i>
                  </button>
                </div>

                <div className="mt-6 flex items-center gap-6">
                  <div>
                    <div className="font-sans text-[11px] text-fog uppercase mb-1">Opp Score</div>
                    <div className={`font-mono text-3xl font-bold ${selectedWilaya.score >= 60 ? 'text-emerald-400' : 'text-amber'}`}>{selectedWilaya.score}</div>
                  </div>
                  <div className="h-10 w-px bg-ash"></div>
                  <div>
                    <div className="font-sans text-[11px] text-fog uppercase mb-1">Zone Safety</div>
                    <div className="flex items-center gap-2">
                      <ZoneBadge zone={selectedWilaya.zone} />
                      <span className="font-sans text-sm text-cloud">{['0', 'I'].includes(selectedWilaya.zone) ? 'Optimal' : 'High Risk'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate">
                <div>
                  <h3 className="font-mono text-[14px] font-semibold text-pure mb-4 uppercase">Key Market Indicators</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-graphite p-4 rounded-[6px] border border-ash">
                      <i className="lucide-users text-fog mb-2 text-lg block"></i>
                      <div className="font-sans text-[12px] text-fog mb-1">Population Growth</div>
                      <div className="font-mono text-[18px] text-emerald-400">{selectedWilaya.popGrowth}</div>
                    </div>
                    <div className="bg-graphite p-4 rounded-[6px] border border-ash">
                      <i className="lucide-building-2 text-fog mb-2 text-lg block"></i>
                      <div className="font-sans text-[12px] text-fog mb-1">Est. Competitors</div>
                      <div className="font-mono text-[18px] text-pure">{selectedWilaya.compCount} <span className="text-sm text-fog font-sans font-normal">agencies</span></div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-mono text-[14px] font-semibold text-pure mb-4 uppercase">Capacity Utilization</h3>
                  <div className="bg-graphite p-5 rounded-[6px] border border-ash">
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <div className="font-sans text-[12px] text-fog mb-1">Currently Insured</div>
                        <div className="font-mono text-[18px] text-pure"><DZDArmount value={selectedWilaya.used} /></div>
                      </div>
                      <div className="text-right">
                        <div className="font-sans text-[12px] text-fog mb-1">Max Capacity</div>
                        <div className="font-mono text-sm text-cloud"><DZDArmount value={selectedWilaya.cap} /></div>
                      </div>
                    </div>

                    <div className="h-3 w-full bg-carbon rounded-full overflow-hidden mt-3">
                      <div className="h-full bg-emerald-500" style={{width: `${(selectedWilaya.used / selectedWilaya.cap) * 100}%`}}></div>
                    </div>

                    <div className="mt-3 flex justify-between items-center">
                      <span className="font-sans text-[12px] text-emerald-400 font-semibold">
                        <DZDArmount value={selectedWilaya.cap - selectedWilaya.used} /> available
                      </span>
                      <span className="font-mono text-[12px] text-fog">{((selectedWilaya.used / selectedWilaya.cap) * 100).toFixed(1)}% used</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-mono text-[14px] font-semibold text-pure mb-4 uppercase">Recommendations</h3>
                  <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-[8px] p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <i className="lucide-lightbulb text-emerald-400 mt-1 text-lg"></i>
                      <p className="font-sans text-sm text-cloud leading-relaxed">
                        {selectedWilaya.reason}
                      </p>
                    </div>
                    <div className="border-t border-emerald-500/20 pt-4">
                      <div className="font-sans text-[11px] font-semibold uppercase text-emerald-400/80 mb-3">Recommended Products</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedWilaya.products.map((prod, i) => (
                          <span key={i} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-sans text-[12px] rounded-full">
                            {prod}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-ash bg-carbon flex flex-col gap-3">
                <button className="h-[44px] bg-emerald-600 hover:bg-emerald-500 text-pure font-sans font-semibold rounded-[6px] flex items-center justify-center gap-2 transition-colors">
                  <i className="lucide-file-down text-sm"></i>
                  Generate Sales Brief (PDF)
                </button>
                <button className="h-[40px] rounded-[6px] bg-graphite border border-ash text-cloud font-sans font-medium text-sm hover:bg-ash hover:text-pure transition-colors flex items-center justify-center gap-2">
                  <i className="lucide-mail text-sm"></i> Email Local Agency Network
                </button>
              </div>
            </>
          )}
        </div>

      </div>

      <style>{`
        .custom-tooltip {
          background: #161B22 !important;
          border: 1px solid #30363D !important;
          border-radius: 6px !important;
        }
        .leaflet-container {
          height: 100% !important;
          width: 100% !important;
        }
      `}</style>
    </div>
  );
};