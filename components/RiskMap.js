// components/RiskMap.js - Version avec boutons 100% fonctionnels sur la carte
const { useState, useEffect, useRef } = React;

const WILAYAS = [
  { name: "Alger", lat: 36.7538, lng: 3.0588, risk: 3, population: 2800000, zone: "III", contracts: 420, hotspots: 3, insuredCapital: 5800000000, retentionUsed: 78 },
  { name: "Oran", lat: 35.6969, lng: -0.6331, risk: 2, population: 1600000, zone: "IIa", contracts: 210, hotspots: 1, insuredCapital: 3200000000, retentionUsed: 45 },
  { name: "Constantine", lat: 36.3650, lng: 6.6147, risk: 3, population: 950000, zone: "III", contracts: 180, hotspots: 2, insuredCapital: 2800000000, retentionUsed: 62 },
  { name: "Annaba", lat: 36.9027, lng: 7.7552, risk: 2, population: 640000, zone: "IIb", contracts: 120, hotspots: 1, insuredCapital: 1900000000, retentionUsed: 38 },
  { name: "Tizi Ouzou", lat: 36.7151, lng: 4.0494, risk: 4, population: 750000, zone: "III", contracts: 95, hotspots: 4, insuredCapital: 1500000000, retentionUsed: 85 },
  { name: "Bejaia", lat: 36.7558, lng: 5.0843, risk: 3, population: 620000, zone: "III", contracts: 88, hotspots: 2, insuredCapital: 1400000000, retentionUsed: 58 },
  { name: "Blida", lat: 36.4701, lng: 2.8277, risk: 3, population: 550000, zone: "II", contracts: 76, hotspots: 1, insuredCapital: 1200000000, retentionUsed: 52 },
  { name: "Setif", lat: 36.1911, lng: 5.4097, risk: 2, population: 980000, zone: "IIa", contracts: 145, hotspots: 1, insuredCapital: 2200000000, retentionUsed: 48 },
  { name: "Chlef", lat: 36.1649, lng: 1.3347, risk: 4, population: 450000, zone: "III", contracts: 82, hotspots: 3, insuredCapital: 1100000000, retentionUsed: 72 },
  { name: "Boumerdes", lat: 36.7667, lng: 3.4667, risk: 4, population: 480000, zone: "III", contracts: 92, hotspots: 4, insuredCapital: 1300000000, retentionUsed: 88 },
  { name: "Tipaza", lat: 36.5897, lng: 2.4475, risk: 3, population: 350000, zone: "IIb", contracts: 54, hotspots: 1, insuredCapital: 850000000, retentionUsed: 42 },
  { name: "Medea", lat: 36.2675, lng: 2.7500, risk: 2, population: 420000, zone: "IIa", contracts: 48, hotspots: 0, insuredCapital: 720000000, retentionUsed: 28 },
  { name: "Batna", lat: 35.5558, lng: 6.1741, risk: 2, population: 580000, zone: "IIa", contracts: 72, hotspots: 0, insuredCapital: 980000000, retentionUsed: 32 },
  { name: "Mostaganem", lat: 35.9333, lng: 0.0833, risk: 2, population: 460000, zone: "IIa", contracts: 56, hotspots: 0, insuredCapital: 820000000, retentionUsed: 30 },
  { name: "Jijel", lat: 36.8167, lng: 5.7667, risk: 4, population: 380000, zone: "III", contracts: 71, hotspots: 2, insuredCapital: 1050000000, retentionUsed: 68 },
  { name: "Skikda", lat: 36.8667, lng: 6.9000, risk: 3, population: 400000, zone: "IIb", contracts: 63, hotspots: 1, insuredCapital: 920000000, retentionUsed: 45 }
];

const RISK_ZONES = {
  4: { label: "Zone III", sublabel: "High risk", color: "#DA3633", gradient: "rgba(218,54,51,0.6)" },
  3: { label: "Zone IIb", sublabel: "High-mod", color: "#E3622A", gradient: "rgba(227,98,42,0.5)" },
  2: { label: "Zone IIa", sublabel: "Moderate", color: "#D29922", gradient: "rgba(210,153,34,0.4)" },
  1: { label: "Zone I", sublabel: "Low risk", color: "#A3A020", gradient: "rgba(163,160,32,0.3)" },
  0: { label: "Zone 0", sublabel: "Negligible", color: "#2EA043", gradient: "rgba(46,160,67,0.2)" }
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
  const circlesRef = useRef([]);      // Pour les cercles des zones
  const contractMarkersRef = useRef([]); // Pour les marqueurs des contrats
  const hotspotMarkersRef = useRef([]);  // Pour les marqueurs des hotspots

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

    const map = L.map(mapContainerRef.current, {
      center: [28.0, 2.5],
      zoom: 5.2,
      zoomControl: false,
      fadeAnimation: true,
      zoomAnimation: true
    });

    let tileUrl, attribution;
    if (mapLayer === "dark") {
      tileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
      attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CartoDB';
    } else if (mapLayer === "satellite") {
      tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      attribution = 'Tiles &copy; Esri';
    } else {
      tileUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
      attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CartoDB';
    }

    L.tileLayer(tileUrl, { attribution: attribution, maxZoom: 12, minZoom: 4 }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.scale({ metric: true, imperial: false, position: 'bottomleft' }).addTo(map);

    const algeriaBounds = L.latLngBounds([[18.0, -8.5], [37.5, 12.0]]);
    map.setMaxBounds(algeriaBounds);
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

  // Fonction pour créer/mettre à jour les cercles des zones (Show Zones Fill)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Supprimer les anciens cercles
    circlesRef.current.forEach(circle => {
      if (circle) map.removeLayer(circle);
    });
    circlesRef.current = [];

    WILAYAS.forEach((wilaya) => {
      const zone = RISK_ZONES[wilaya.risk];
      let color;
      if (colorBy === "risk") {
        const intensity = wilaya.risk / 4;
        color = `rgba(218, 54, 51, ${0.3 + intensity * 0.6})`;
      } else {
        color = zone.color;
      }

      const radius = 15000 + (wilaya.population / 3000000) * 30000;

      const circle = L.circle([wilaya.lat, wilaya.lng], {
        radius: Math.min(radius, 45000),
        fillColor: color,
        fillOpacity: showZonesFill ? 0.55 : 0.15,  // ← ICI : Show Zones Fill contrôle l'opacité
        color: zone.color,
        weight: 2.5,
        opacity: 0.85,
        className: 'risk-circle',
        smoothFactor: 1
      }).addTo(map);

      // Tooltip toujours présent
      let tooltipHtml = `
        <div class="custom-tooltip-content">
          <div class="tooltip-title" style="color: ${zone.color};">${wilaya.name}</div>
          <div class="tooltip-risk">${zone.label}</div>
          <div class="tooltip-pop">${(wilaya.population / 1000000).toFixed(1)}M hab.</div>
      `;
      if (showContracts) {
        tooltipHtml += `<div class="tooltip-contracts">📄 ${wilaya.contracts} contrats</div>`;
      }
      if (showHotspots) {
        tooltipHtml += `<div class="tooltip-hotspots">🔥 ${wilaya.hotspots} hotspots</div>`;
      }
      tooltipHtml += `</div>`;

      circle.bindTooltip(tooltipHtml, { sticky: true, className: "custom-tooltip" });

      circle.on("mouseover", () => setHoveredWilaya(wilaya));
      circle.on("mouseout", () => setHoveredWilaya(null));
      circle.on("click", () => {
        setSelectedWilaya(wilaya);
        map.flyTo([wilaya.lat, wilaya.lng], 8, { duration: 1.2 });
      });

      circlesRef.current.push(circle);
    });
  }, [mapInstanceRef.current, showZonesFill, colorBy, showContracts, showHotspots]);

  // Fonction pour créer/mettre à jour les marqueurs des contrats (Show Contracts)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Supprimer les anciens marqueurs de contrats
    contractMarkersRef.current.forEach(marker => {
      if (marker) map.removeLayer(marker);
    });
    contractMarkersRef.current = [];

    if (!showContracts) return; // ← ICI : Show Contracts contrôle l'affichage

    // Créer des marqueurs pour chaque contrat (plusieurs par wilaya)
    WILAYAS.forEach((wilaya) => {
      const contractCount = Math.min(wilaya.contracts, 8); // Max 8 pour ne pas surcharger
      for (let i = 0; i < contractCount; i++) {
        // Offset aléatoire pour répartir les marqueurs autour du centre
        const angle = (i / contractCount) * Math.PI * 2;
        const offsetLat = (Math.cos(angle) * 0.05) * (wilaya.contracts / 100);
        const offsetLng = (Math.sin(angle) * 0.05) * (wilaya.contracts / 100);

        const contractMarker = L.marker([wilaya.lat + offsetLat, wilaya.lng + offsetLng], {
          icon: L.divIcon({
            html: `<div class="contract-marker" style="background-color: ${RISK_ZONES[wilaya.risk].color}">📄</div>`,
            className: 'custom-div-icon',
            iconSize: [24, 24]
          })
        }).addTo(map);

        contractMarker.bindTooltip(`${wilaya.name}: Contract #${i + 1}<br>Capital: ${(wilaya.insuredCapital / wilaya.contracts / 1000000).toFixed(1)}M DZD`, {
          sticky: true,
          className: 'contract-tooltip'
        });

        contractMarkersRef.current.push(contractMarker);
      }
    });
  }, [mapInstanceRef.current, showContracts]);

  // Fonction pour créer/mettre à jour les marqueurs des hotspots (Show Hotspots)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Supprimer les anciens marqueurs de hotspots
    hotspotMarkersRef.current.forEach(marker => {
      if (marker) map.removeLayer(marker);
    });
    hotspotMarkersRef.current = [];

    if (!showHotspots) return; // ← ICI : Show Hotspots contrôle l'affichage

    // Créer des marqueurs pour chaque hotspot
    WILAYAS.forEach((wilaya) => {
      for (let i = 0; i < wilaya.hotspots; i++) {
        const angle = (i / wilaya.hotspots) * Math.PI * 2;
        const offsetLat = Math.cos(angle) * 0.03;
        const offsetLng = Math.sin(angle) * 0.03;

        const hotspotMarker = L.marker([wilaya.lat + offsetLat, wilaya.lng + offsetLng], {
          icon: L.divIcon({
            html: `<div class="hotspot-marker pulse-marker">🔥</div>`,
            className: 'custom-div-icon',
            iconSize: [20, 20]
          })
        }).addTo(map);

        hotspotMarker.bindTooltip(`${wilaya.name}: Hotspot #${i + 1}<br>Risk level: ${RISK_ZONES[wilaya.risk].label}`, {
          sticky: true,
          className: 'hotspot-tooltip'
        });

        hotspotMarkersRef.current.push(hotspotMarker);
      }
    });
  }, [mapInstanceRef.current, showHotspots]);

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

      {/* Carte */}
      <div
        ref={mapContainerRef}
        className="w-full"
        style={{ height: "calc(100vh - 64px)", zIndex: 0, position: "relative" }}
      ></div>

      {/* Interface overlay */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, pointerEvents: "none" }}>

        {/* Panneau MAP LAYERS - TOUS LES BOUTONS FONCTIONNELS SUR LA CARTE */}
        <div className="absolute top-4 right-4" style={{ pointerEvents: "auto" }}>
          <div className="bg-carbon/90 backdrop-blur-md rounded-xl shadow-2xl border border-ash/50 w-64 overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-teal/10 to-transparent border-b border-ash/50">
              <h3 className="font-mono text-sm font-semibold text-pure">MAP LAYERS</h3>
            </div>
            <div className="p-3 space-y-3">

              {/* ✅ Show Contracts - Affiche des marqueurs 📄 sur la carte */}
              <label className="flex items-center gap-2 text-sm text-cloud cursor-pointer hover:text-pure transition-colors">
                <input
                  type="checkbox"
                  checked={showContracts}
                  onChange={(e) => setShowContracts(e.target.checked)}
                  className="rounded border-ash bg-graphite"
                />
                <span>Show Contracts</span>
                {showContracts && <span className="text-teal text-xs ml-auto">● visible</span>}
              </label>

              {/* ✅ Show Hotspots - Affiche des marqueurs 🔥 avec animation sur la carte */}
              <label className="flex items-center gap-2 text-sm text-cloud cursor-pointer hover:text-pure transition-colors">
                <input
                  type="checkbox"
                  checked={showHotspots}
                  onChange={(e) => setShowHotspots(e.target.checked)}
                  className="rounded border-ash bg-graphite"
                />
                <span>Show Hotspots</span>
                {showHotspots && <span className="text-red text-xs ml-auto animate-pulse">● actif</span>}
              </label>

              {/* ✅ Show Zones Fill - Contrôle le remplissage des cercles */}
              <label className="flex items-center gap-2 text-sm text-cloud cursor-pointer hover:text-pure transition-colors">
                <input
                  type="checkbox"
                  checked={showZonesFill}
                  onChange={(e) => setShowZonesFill(e.target.checked)}
                  className="rounded border-ash bg-graphite"
                />
                <span>Show Zones Fill</span>
                {showZonesFill ? (
                  <span className="text-teal text-xs ml-auto">● rempli</span>
                ) : (
                  <span className="text-fog text-xs ml-auto">○ contour</span>
                )}
              </label>

              <div className="pt-2 border-t border-ash/50">
                <div className="text-fog text-xs mb-1">Color by:</div>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-sm text-cloud cursor-pointer hover:text-pure transition-colors">
                    <input
                      type="radio"
                      name="colorBy"
                      value="zone"
                      checked={colorBy === "zone"}
                      onChange={(e) => setColorBy(e.target.value)}
                    />
                    <span>Zone Code</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-cloud cursor-pointer hover:text-pure transition-colors">
                    <input
                      type="radio"
                      name="colorBy"
                      value="risk"
                      checked={colorBy === "risk"}
                      onChange={(e) => setColorBy(e.target.value)}
                    />
                    <span>Risk Level</span>
                  </label>
                </div>
              </div>

              <div>
                <div className="text-fog text-xs mb-1">Jump to wilaya...</div>
                <select
                  value={selectedJumpWilaya}
                  onChange={(e) => setSelectedJumpWilaya(e.target.value)}
                  className="w-full bg-graphite border border-ash rounded-lg px-2 py-1 text-sm text-cloud"
                >
                  <option value="">Select a wilaya</option>
                  {WILAYAS.map(w => <option key={w.name} value={w.name}>{w.name}</option>)}
                </select>
              </div>
            </div>

            <div className="px-3 py-2 border-t border-ash/50 flex gap-2">
              <button onClick={() => setMapLayer("light")} className={`flex-1 text-xs px-2 py-1 rounded-lg transition-all ${mapLayer === "light" ? "bg-teal text-pure shadow-lg" : "bg-graphite text-fog hover:text-cloud"}`}>Light</button>
              <button onClick={() => setMapLayer("dark")} className={`flex-1 text-xs px-2 py-1 rounded-lg transition-all ${mapLayer === "dark" ? "bg-teal text-pure shadow-lg" : "bg-graphite text-fog hover:text-cloud"}`}>Dark</button>
              <button onClick={() => setMapLayer("satellite")} className={`flex-1 text-xs px-2 py-1 rounded-lg transition-all ${mapLayer === "satellite" ? "bg-teal text-pure shadow-lg" : "bg-graphite text-fog hover:text-cloud"}`}>Sat</button>
            </div>
          </div>
        </div>

        {/* Panneau RPA ZONE CLASS */}
        <div className="absolute top-4 left-4" style={{ pointerEvents: "auto" }}>
          <div className="bg-carbon/90 backdrop-blur-md rounded-xl shadow-2xl border border-ash/50 w-64 overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-teal/10 to-transparent border-b border-ash/50">
              <h3 className="font-mono text-sm font-semibold text-pure">RPA ZONE CLASS</h3>
            </div>
            <div className="p-3 space-y-2">
              {Object.entries(RISK_ZONES).reverse().map(([risk, data]) => (
                <div key={risk} className="flex items-center justify-between text-xs group">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: data.color }}></div>
                    <span className="text-cloud group-hover:text-pure transition-colors">{data.label}</span>
                  </div>
                  <span className="text-fog text-[10px]">{data.sublabel}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panneau EXPOSURE OVERVIEW */}
        <div className="absolute bottom-4 left-4" style={{ pointerEvents: "auto" }}>
          <div className="bg-carbon/90 backdrop-blur-md rounded-xl shadow-2xl border border-ash/50 p-4 min-w-[260px]">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-mono text-sm font-semibold text-pure">EXPOSURE OVERVIEW</h3>
              <div className="text-teal text-xs font-mono bg-teal/10 px-2 py-0.5 rounded-full">{WILAYAS.length}</div>
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
            <button className="w-full mt-3 bg-gradient-to-r from-teal to-blue-600 hover:from-teal/90 hover:to-blue-700 text-pure font-sans font-semibold rounded-lg py-2 text-sm transition-all">View All Contracts</button>
          </div>
        </div>

        {/* Alerte */}
        <div className="absolute bottom-4 right-4" style={{ pointerEvents: "auto" }}>
          <div className="bg-red/20 backdrop-blur-md border border-red/30 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red rounded-full animate-pulse"></div>
              <span className="text-sm text-cloud">3 wilayas exceed retention</span>
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={() => { const highRisk = WILAYAS.filter(w => w.risk >= 3); if (highRisk.length) handleRunPML(highRisk[0]); }} className="text-teal text-xs hover:underline">Run PML</button>
              <button className="text-fog text-xs hover:underline">☆ Watch</button>
            </div>
          </div>
        </div>

        {/* Tooltip hover */}
        {hoveredWilaya && (
          <div className="absolute top-20 left-72" style={{ pointerEvents: "none" }}>
            <div className="bg-carbon/95 backdrop-blur-md border-l-4 rounded-r-xl px-3 py-1.5 shadow-2xl" style={{ borderLeftColor: RISK_ZONES[hoveredWilaya.risk].color }}>
              <span className="font-mono text-sm text-pure">{hoveredWilaya.name}</span>
              <span className="text-fog text-xs ml-2">[{RISK_ZONES[hoveredWilaya.risk].label}]</span>
            </div>
          </div>
        )}
      </div>

      {/* MODAL WILAYA - inchangé */}
      {selectedWilaya && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-20" style={{ pointerEvents: "auto" }} onClick={() => setSelectedWilaya(null)}>
          <div className="bg-gradient-to-br from-carbon to-graphite rounded-2xl shadow-2xl w-[420px] border border-ash/50" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 pt-5 pb-3 border-b border-ash/50">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-mono text-xl font-bold text-pure">
                    {selectedWilaya.name} <span className="text-fog text-base">[{RISK_ZONES[selectedWilaya.risk].label}]</span>
                  </h2>
                  <p className="text-fog text-xs mt-1">Wilaya Code: {WILAYAS.indexOf(selectedWilaya) + 1}</p>
                </div>
                <button onClick={() => setSelectedWilaya(null)} className="w-8 h-8 flex items-center justify-center bg-graphite hover:bg-ash rounded-full transition-colors">✕</button>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-mono text-sm font-semibold text-pure mb-3">EXPOSURE OVERVIEW</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-ash/30">
                  <span className="text-fog text-sm">Total Insured Capital</span>
                  <span className="text-cloud font-mono text-sm font-semibold">{selectedWilaya.insuredCapital.toLocaleString()} DZD</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-ash/30">
                  <span className="text-fog text-sm">Active Contracts</span>
                  <span className="text-cloud font-mono text-sm font-semibold">{selectedWilaya.contracts}</span>
                </div>
                <div className="py-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-fog text-sm">Retention Capacity Used</span>
                    <span className={`font-mono text-sm font-bold ${selectedWilaya.retentionUsed > 80 ? 'text-red' : 'text-amber'}`}>{selectedWilaya.retentionUsed}%</span>
                  </div>
                  <div className="w-full bg-graphite rounded-full h-2 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${selectedWilaya.retentionUsed > 80 ? 'bg-red' : 'bg-amber'}`} style={{ width: `${selectedWilaya.retentionUsed}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => handleRunPML(selectedWilaya)} className="flex-1 bg-blue/20 hover:bg-blue/30 border border-blue/50 text-teal font-mono text-sm py-2 rounded-lg transition-all">Run PML</button>
                <button className="flex-1 bg-graphite hover:bg-ash border border-ash text-cloud font-mono text-sm py-2 rounded-lg transition-all">☆ Watch</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-tooltip {
          background: #1a1f2e !important;
          border: 1px solid rgba(57, 208, 216, 0.3) !important;
          border-radius: 12px !important;
          padding: 8px 12px !important;
        }
        .contract-marker, .hotspot-marker {
          font-size: 14px;
          text-align: center;
          line-height: 1;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          cursor: pointer;
          transition: transform 0.2s;
        }
        .contract-marker {
          background: rgba(0,0,0,0.6);
          border-radius: 50%;
          padding: 4px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }
        .hotspot-marker {
          font-size: 16px;
          filter: drop-shadow(0 0 4px rgba(218,54,51,0.8));
        }
        .contract-marker:hover, .hotspot-marker:hover {
          transform: scale(1.2);
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); text-shadow: 0 0 8px rgba(218,54,51,0.8); }
        }
        .pulse-marker {
          animation: pulse 1s ease-in-out infinite;
          display: inline-block;
        }
        .risk-circle {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .risk-circle:hover {
          stroke-width: 3;
          filter: drop-shadow(0 0 8px rgba(57,208,216,0.5));
        }
      `}</style>
    </div>
  );
};