// components/RiskMap.js - Version avec redirection vers pml.html
const { useState, useEffect, useRef } = React;

// Données des wilayas
const WILAYAS = [
  { name: "Alger", lat: 36.7538, lng: 3.0588, risk: 3, population: 2800000, zone: "III", contracts: 420, hotspots: 3, insuredCapital: 5800000000, retentionUsed: 78 },
  { name: "Oran", lat: 35.6969, lng: -0.6331, risk: 2, population: 1600000, zone: "IIa", contracts: 210, hotspots: 1, insuredCapital: 3200000000, retentionUsed: 45 },
  { name: "Constantine", lat: 36.3650, lng: 6.6147, risk: 3, population: 950000, zone: "III", contracts: 180, hotspots: 2, insuredCapital: 2800000000, retentionUsed: 62 },
  { name: "Annaba", lat: 36.9027, lng: 7.7552, risk: 2, population: 640000, zone: "IIb", contracts: 120, hotspots: 1, insuredCapital: 1900000000, retentionUsed: 38 },
  { name: "Tizi Ouzou", lat: 36.7151, lng: 4.0494, risk: 4, population: 750000, zone: "III", contracts: 95, hotspots: 4, insuredCapital: 1500000000, retentionUsed: 85 },
  { name: "Bejaia", lat: 36.7558, lng: 5.0843, risk: 3, population: 620000, zone: "III", contracts: 88, hotspots: 2, insuredCapital: 1400000000, retentionUsed: 58 },
  { name: "Blida", lat: 36.4701, lng: 2.8277, risk: 3, population: 550000, zone: "II", contracts: 76, hotspots: 1, insuredCapital: 1200000000, retentionUsed: 52 },
  { name: "Setif", lat: 36.1911, lng: 5.4097, risk: 2, population: 980000, zone: "IIa", contracts: 145, hotspots: 1, insuredCapital: 2200000000, retentionUsed: 48 },
  { name: "Biskra", lat: 34.8501, lng: 5.7281, risk: 1, population: 540000, zone: "I", contracts: 45, hotspots: 0, insuredCapital: 680000000, retentionUsed: 22 },
  { name: "Tlemcen", lat: 34.8828, lng: -1.3151, risk: 2, population: 490000, zone: "IIa", contracts: 67, hotspots: 0, insuredCapital: 950000000, retentionUsed: 35 },
  { name: "Chlef", lat: 36.1649, lng: 1.3347, risk: 4, population: 450000, zone: "III", contracts: 82, hotspots: 3, insuredCapital: 1100000000, retentionUsed: 72 },
  { name: "Boumerdes", lat: 36.7667, lng: 3.4667, risk: 4, population: 480000, zone: "III", contracts: 92, hotspots: 4, insuredCapital: 1300000000, retentionUsed: 88 },
  { name: "Tipaza", lat: 36.5897, lng: 2.4475, risk: 3, population: 350000, zone: "IIb", contracts: 54, hotspots: 1, insuredCapital: 850000000, retentionUsed: 42 },
  { name: "Medea", lat: 36.2675, lng: 2.7500, risk: 2, population: 420000, zone: "IIa", contracts: 48, hotspots: 0, insuredCapital: 720000000, retentionUsed: 28 },
  { name: "Batna", lat: 35.5558, lng: 6.1741, risk: 2, population: 580000, zone: "IIa", contracts: 72, hotspots: 0, insuredCapital: 980000000, retentionUsed: 32 },
  { name: "Ouargla", lat: 31.9500, lng: 5.3167, risk: 0, population: 350000, zone: "0", contracts: 23, hotspots: 0, insuredCapital: 6800000000, retentionUsed: 92 },
  { name: "Tamanrasset", lat: 22.7850, lng: 5.5228, risk: 0, population: 200000, zone: "0", contracts: 12, hotspots: 0, insuredCapital: 320000000, retentionUsed: 15 },
  { name: "Ghardaia", lat: 32.4839, lng: 3.6735, risk: 0, population: 280000, zone: "0", contracts: 18, hotspots: 0, insuredCapital: 480000000, retentionUsed: 18 },
  { name: "Djelfa", lat: 34.6700, lng: 3.2500, risk: 1, population: 490000, zone: "I", contracts: 34, hotspots: 0, insuredCapital: 560000000, retentionUsed: 25 },
  { name: "Mostaganem", lat: 35.9333, lng: 0.0833, risk: 2, population: 460000, zone: "IIa", contracts: 56, hotspots: 0, insuredCapital: 820000000, retentionUsed: 30 },
  { name: "Jijel", lat: 36.8167, lng: 5.7667, risk: 4, population: 380000, zone: "III", contracts: 71, hotspots: 2, insuredCapital: 1050000000, retentionUsed: 68 },
  { name: "Skikda", lat: 36.8667, lng: 6.9000, risk: 3, population: 400000, zone: "IIb", contracts: 63, hotspots: 1, insuredCapital: 920000000, retentionUsed: 45 }
];

const RISK_ZONES = {
  4: { label: "Zone III", sublabel: "High risk", color: "#DA3633" },
  3: { label: "Zone IIb", sublabel: "High-mod", color: "#E3622A" },
  2: { label: "Zone IIa", sublabel: "Moderate", color: "#D29922" },
  1: { label: "Zone I", sublabel: "Low risk", color: "#A3A020" },
  0: { label: "Zone 0", sublabel: "Negligible", color: "#2EA043" }
};

const RiskMap = () => {
  const [selectedWilaya, setSelectedWilaya] = useState(null);
  const [hoveredWilaya, setHoveredWilaya] = useState(null);
  const [mapLayer, setMapLayer] = useState("light");
  const [showZonesFill, setShowZonesFill] = useState(true);
  const [showContracts, setShowContracts] = useState(false);
  const [showHotspots, setShowHotspots] = useState(false);
  const [colorBy, setColorBy] = useState("zone");
  const [selectedJumpWilaya, setSelectedJumpWilaya] = useState("");

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const contractsMarkersRef = useRef([]);
  const hotspotsMarkersRef = useRef([]);

  // Fonction Run PML - Redirige vers pml.html
  const handleRunPML = (wilaya) => {
    const params = new URLSearchParams({
      wilaya: wilaya.name,
      zone: RISK_ZONES[wilaya.risk].label,
      population: wilaya.population,
      contracts: wilaya.contracts,
      insuredCapital: wilaya.insuredCapital,
      retentionUsed: wilaya.retentionUsed,
      risk: wilaya.risk,
      lat: wilaya.lat,
      lng: wilaya.lng
    });
    window.location.href = `pml.html?${params.toString()}`;
  };

  // Initialisation de la carte
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current).setView([28.0, 2.5], 5);

    let tileUrl;
    if (mapLayer === "dark") {
      tileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    } else if (mapLayer === "satellite") {
      tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    } else {
      tileUrl = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
    }

    L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxZoom: 12,
      minZoom: 4
    }).addTo(map);

    const algeriaBounds = L.latLngBounds([[18.5, -8.0], [37.5, 12.0]]);
    map.fitBounds(algeriaBounds);

    mapInstanceRef.current = map;

    const handleResize = () => {
      if (mapInstanceRef.current) setTimeout(() => mapInstanceRef.current.invalidateSize(), 100);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapLayer]);

  const getColor = (wilaya) => {
    if (colorBy === "risk") {
      const intensity = wilaya.risk / 4;
      return `rgb(218, 54, 51, ${0.3 + intensity * 0.5})`;
    }
    return RISK_ZONES[wilaya.risk].color;
  };

  // Ajout des cercles
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    markersRef.current.forEach(marker => {
      if (marker) map.removeLayer(marker);
    });
    markersRef.current = [];

    WILAYAS.forEach((wilaya) => {
      const zone = RISK_ZONES[wilaya.risk];
      const color = getColor(wilaya);
      const radius = 12000 + (wilaya.population / 3000000) * 28000;

      const circle = L.circle([wilaya.lat, wilaya.lng], {
        radius: Math.min(radius, 40000),
        fillColor: color,
        fillOpacity: showZonesFill ? 0.55 : 0.15,
        color: zone.color,
        weight: 2,
        opacity: 0.85
      }).addTo(map);

      circle.bindTooltip(`
        <div style="font-family: 'DM Mono', monospace; padding: 4px;">
          <strong style="color: #fff;">${wilaya.name}</strong><br/>
          <span style="color: ${zone.color}">${zone.label}</span><br/>
          <span style="color: #aaa; font-size: 11px;">${(wilaya.population / 1000000).toFixed(1)}M hab.</span>
          ${showContracts ? `<span style="color: #39D0D8; font-size: 11px;"><br/>📄 ${wilaya.contracts} contrats</span>` : ''}
          ${showHotspots ? `<span style="color: #DA3633; font-size: 11px;"><br/>🔥 ${wilaya.hotspots} hotspots</span>` : ''}
        </div>
      `, { sticky: true, className: "custom-tooltip" });

      circle.on("mouseover", () => setHoveredWilaya(wilaya));
      circle.on("mouseout", () => setHoveredWilaya(null));
      circle.on("click", () => setSelectedWilaya(wilaya));

      markersRef.current.push(circle);
    });

  }, [mapInstanceRef.current, showZonesFill, colorBy, showContracts, showHotspots]);

  // Ajout des marqueurs de contrats
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    contractsMarkersRef.current.forEach(marker => { if (marker) map.removeLayer(marker); });
    contractsMarkersRef.current = [];

    if (showContracts) {
      WILAYAS.forEach((wilaya) => {
        if (wilaya.contracts > 0) {
          const count = Math.min(Math.ceil(wilaya.contracts / 50), 5);
          for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const offsetLat = (Math.cos(angle) * 0.05) * (wilaya.contracts / 200);
            const offsetLng = (Math.sin(angle) * 0.05) * (wilaya.contracts / 200);
            const marker = L.circleMarker([wilaya.lat + offsetLat, wilaya.lng + offsetLng], {
              radius: 4 + (wilaya.contracts / 100),
              fillColor: "#39D0D8",
              fillOpacity: 0.8,
              color: "#39D0D8",
              weight: 1,
              opacity: 0.6
            }).addTo(map);
            marker.bindTooltip(`${wilaya.name}: ${wilaya.contracts} contrats`);
            contractsMarkersRef.current.push(marker);
          }
        }
      });
    }
  }, [showContracts, mapInstanceRef.current]);

  // Ajout des hotspots
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    hotspotsMarkersRef.current.forEach(marker => { if (marker) map.removeLayer(marker); });
    hotspotsMarkersRef.current = [];

    if (showHotspots) {
      WILAYAS.forEach((wilaya) => {
        if (wilaya.hotspots > 0) {
          const marker = L.circleMarker([wilaya.lat, wilaya.lng], {
            radius: 12 + (wilaya.hotspots * 3),
            fillColor: "#DA3633",
            fillOpacity: 0.4,
            color: "#DA3633",
            weight: 2,
            opacity: 0.8,
            className: "pulse-marker"
          }).addTo(map);
          marker.bindTooltip(`⚠️ ${wilaya.name}: ${wilaya.hotspots} zones à risque`);
          hotspotsMarkersRef.current.push(marker);
        }
      });
    }
  }, [showHotspots, mapInstanceRef.current]);

  // Jump to wilaya
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedJumpWilaya) return;
    const wilaya = WILAYAS.find(w => w.name === selectedJumpWilaya);
    if (wilaya) {
      mapInstanceRef.current.flyTo([wilaya.lat, wilaya.lng], 8, { duration: 1.5 });
      setSelectedJumpWilaya("");
    }
  }, [selectedJumpWilaya]);

  return (
    <div className="relative w-full" style={{ minHeight: "calc(100vh - 64px)" }}>

      {/* Carte en arrière-plan */}
      <div
        ref={mapContainerRef}
        className="w-full"
        style={{ height: "calc(100vh - 64px)", zIndex: 0, position: "relative" }}
      ></div>

      {/* Composants par-dessus la carte */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, pointerEvents: "none" }}>

        {/* Panneau RPA ZONE CLASS */}
        <div className="absolute top-4 left-4" style={{ pointerEvents: "auto" }}>
          <div className="bg-carbon rounded-lg shadow-card border border-ash w-64">
            <div className="px-4 py-3 border-b border-ash">
              <h3 className="font-mono text-sm font-semibold text-pure">RPA ZONE CLASS</h3>
            </div>
            <div className="p-3 space-y-2">
              {Object.entries(RISK_ZONES).reverse().map(([risk, data]) => (
                <div key={risk} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }}></div>
                    <span className="text-cloud">{data.label}</span>
                  </div>
                  <span className="text-fog text-[10px]">{data.sublabel}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panneau MAP LAYERS */}
        <div className="absolute top-4 right-4" style={{ pointerEvents: "auto" }}>
          <div className="bg-carbon rounded-lg shadow-card border border-ash w-56">
            <div className="px-4 py-3 border-b border-ash">
              <h3 className="font-mono text-sm font-semibold text-pure">MAP LAYERS</h3>
            </div>
            <div className="p-3 space-y-2">
              <label className="flex items-center gap-2 text-sm text-cloud cursor-pointer hover:text-pure">
                <input type="checkbox" checked={showContracts} onChange={(e) => setShowContracts(e.target.checked)} className="rounded" />
                <span>Show Contracts</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-cloud cursor-pointer hover:text-pure">
                <input type="checkbox" checked={showHotspots} onChange={(e) => setShowHotspots(e.target.checked)} className="rounded" />
                <span>Show Hotspots</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-cloud cursor-pointer hover:text-pure">
                <input type="checkbox" checked={showZonesFill} onChange={(e) => setShowZonesFill(e.target.checked)} className="rounded" />
                <span>Show Zones Fill</span>
              </label>
              <div className="pt-2 border-t border-ash">
                <div className="text-fog text-xs mb-1">Color by:</div>
                <select value={colorBy} onChange={(e) => setColorBy(e.target.value)} className="input-field text-sm h-8">
                  <option value="zone">Zone Code</option>
                  <option value="risk">Risk Level</option>
                </select>
              </div>
              <div>
                <div className="text-fog text-xs mb-1">Jump to wilaya...</div>
                <select value={selectedJumpWilaya} onChange={(e) => setSelectedJumpWilaya(e.target.value)} className="input-field text-sm h-8">
                  <option value="">Sélectionner une wilaya</option>
                  {WILAYAS.map(w => <option key={w.name} value={w.name}>{w.name}</option>)}
                </select>
              </div>
            </div>
            <div className="px-3 py-2 border-t border-ash flex gap-2">
              <button onClick={() => setMapLayer("light")} className={`text-xs px-2 py-1 rounded ${mapLayer === "light" ? "bg-blue text-pure" : "text-fog hover:text-cloud"}`}>Light</button>
              <button onClick={() => setMapLayer("dark")} className={`text-xs px-2 py-1 rounded ${mapLayer === "dark" ? "bg-blue text-pure" : "text-fog hover:text-cloud"}`}>Dark</button>
              <button onClick={() => setMapLayer("satellite")} className={`text-xs px-2 py-1 rounded ${mapLayer === "satellite" ? "bg-blue text-pure" : "text-fog hover:text-cloud"}`}>Sat</button>
            </div>
          </div>
        </div>

        {/* Panneau EXPOSURE OVERVIEW global */}
        <div className="absolute bottom-4 left-4" style={{ pointerEvents: "auto" }}>
          <div className="bg-carbon rounded-lg shadow-card border border-ash p-4 min-w-[260px]">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-mono text-sm font-semibold text-pure">EXPOSURE OVERVIEW</h3>
              <div className="text-teal text-xs font-mono">{WILAYAS.length}</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-fog">Total Insured Capital</span>
                <span className="text-cloud font-mono">2 100 000 000 DZD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-fog">Active Contracts</span>
                <span className="text-cloud font-mono">{WILAYAS.reduce((sum, w) => sum + w.contracts, 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-fog">Retention Capacity Used</span>
                <span className="text-amber font-mono">62%</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-ash">
              <div className="text-fog text-xs mb-2">RISK NATURE BREAKDOWN</div>
              <div className="flex gap-2 text-xs">
                <span className="bg-red/20 text-red px-2 py-1 rounded">High: 42%</span>
                <span className="bg-amber/20 text-amber px-2 py-1 rounded">Mod: 35%</span>
                <span className="bg-green/20 text-green px-2 py-1 rounded">Low: 23%</span>
              </div>
            </div>
            <button className="btn-primary w-full mt-3 text-sm h-9">View All Contracts</button>
          </div>
        </div>

        {/* Alerte - 3 wilayas exceed retention */}
        <div className="absolute bottom-4 right-4" style={{ pointerEvents: "auto" }}>
          <div className="bg-red/20 backdrop-blur-sm border border-red/30 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <i className="lucide-alert-triangle text-red text-sm"></i>
              <span className="text-sm text-cloud">3 wilayas exceed retention</span>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  const highRisk = WILAYAS.filter(w => w.risk >= 3);
                  if (highRisk.length) handleRunPML(highRisk[0]);
                }}
                className="text-teal text-xs hover:underline"
              >
                Run PML
              </button>
              <button className="text-fog text-xs hover:underline">☆ Watch</button>
            </div>
          </div>
        </div>

        {/* Tooltip hover */}
        {hoveredWilaya && (
          <div className="absolute top-20 left-72" style={{ pointerEvents: "none" }}>
            <div className="bg-carbon border-l-4 rounded-r-lg px-3 py-1.5 shadow-card" style={{ borderLeftColor: RISK_ZONES[hoveredWilaya.risk].color }}>
              <span className="font-mono text-sm text-pure">{hoveredWilaya.name}</span>
              <span className="text-fog text-xs ml-2">[{RISK_ZONES[hoveredWilaya.risk].label}]</span>
            </div>
          </div>
        )}

      </div>

      {/* MODAL WILAYA */}
      {selectedWilaya && (
        <div className="fixed inset-0 bg-overlay flex items-center justify-center z-20" style={{ pointerEvents: "auto" }} onClick={() => setSelectedWilaya(null)}>
          <div className="bg-carbon rounded-lg shadow-modal w-[420px] border border-ash" onClick={(e) => e.stopPropagation()}>

            <div className="px-5 pt-5 pb-3 border-b border-ash">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-mono text-xl font-bold text-pure">
                    {selectedWilaya.name} <span className="text-fog text-base">[{RISK_ZONES[selectedWilaya.risk].label}]</span>
                  </h2>
                  <p className="text-fog text-xs mt-1">Wilaya Code: {WILAYAS.indexOf(selectedWilaya) + 1}</p>
                </div>
                <button onClick={() => setSelectedWilaya(null)} className="text-fog hover:text-pure">
                  <i className="lucide-x"></i>
                </button>
              </div>
            </div>

            <div className="p-5">
              <h3 className="font-mono text-sm font-semibold text-pure mb-3">EXPOSURE OVERVIEW</h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-fog text-sm">Total Insured Capital</span>
                  <span className="text-cloud font-mono text-sm">
                    {selectedWilaya.insuredCapital.toLocaleString()} DZD
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-fog text-sm">Active Contracts</span>
                  <span className="text-cloud font-mono text-sm">{selectedWilaya.contracts}</span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-fog text-sm">Retention Capacity Used</span>
                    <span className={`font-mono text-sm ${selectedWilaya.retentionUsed > 80 ? 'text-red' : 'text-amber'}`}>
                      {selectedWilaya.retentionUsed}%
                    </span>
                  </div>
                  <div className="w-full bg-graphite rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${selectedWilaya.retentionUsed > 80 ? 'bg-red' : 'bg-amber'}`}
                      style={{ width: `${selectedWilaya.retentionUsed}%` }}
                    ></div>
                  </div>
                  {selectedWilaya.retentionUsed > 80 && (
                    <div className="mt-2 flex items-center gap-1 text-red text-xs">
                      <i className="lucide-alert-triangle w-3 h-3"></i>
                      <span>⚠️ Over-concentration alert active</span>
                    </div>
                  )}
                </div>
              </div>

              <button className="btn-primary w-full mt-4 text-sm h-9">
                View All Contracts
              </button>

              {/* Boutons Run PML et Watch - AVEC REDIRECTION */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleRunPML(selectedWilaya)}
                  className="flex-1 bg-blue/20 hover:bg-blue/30 border border-blue/50 text-teal font-mono text-sm py-2 rounded transition-colors"
                >
                  Run PML
                </button>
                <button className="flex-1 bg-graphite hover:bg-ash border border-ash text-cloud font-mono text-sm py-2 rounded transition-colors">
                  ☆ Watch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-tooltip {
          background: #161B22 !important;
          border: 1px solid #30363D !important;
          border-radius: 6px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .pulse-marker {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};