// components/PmlSimulator.js - Version avec graphique corrigé
const { useState, useEffect, useRef } = React;

const DZDArmount = ({ value }) => {
  const formatDZD = (val) => {
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}B DZD`;
    if (val >= 1000000) return `${(val / 1000000).toFixed(0)}M DZD`;
    return `${val.toLocaleString()} DZD`;
  };
  return <span>{formatDZD(value)}</span>;
};

// Calcul de la distance entre deux points (en km)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
};

const MOCK_CONTRACTS = [
  { id: 1, rank: 1, name: 'Sonatrach Complex A', wilaya: 'Ouargla', lat: 31.95, lng: 5.3167, cap: 850000000, vuln: 0.85 },
  { id: 2, rank: 2, name: 'Port of Algiers', wilaya: 'Algiers', lat: 36.7538, lng: 3.0588, cap: 420000000, vuln: 0.92 },
  { id: 3, rank: 3, name: 'Cevital Refinery', wilaya: 'Bejaia', lat: 36.7558, lng: 5.0843, cap: 380000000, vuln: 0.78 },
  { id: 4, rank: 4, name: 'Air Algérie HQ', wilaya: 'Algiers', lat: 36.7538, lng: 3.0588, cap: 250000000, vuln: 0.65 },
  { id: 5, rank: 5, name: 'Sonelgaz Boufarik', wilaya: 'Blida', lat: 36.4701, lng: 2.8277, cap: 210000000, vuln: 0.70 },
  { id: 6, rank: 6, name: 'Oran Stadium', wilaya: 'Oran', lat: 35.6969, lng: -0.6331, cap: 150000000, vuln: 0.60 },
  { id: 7, rank: 7, name: 'Bab Ezzouar Mall', wilaya: 'Algiers', lat: 36.7538, lng: 3.0588, cap: 120000000, vuln: 0.55 },
  { id: 8, rank: 8, name: 'Renault Plant', wilaya: 'Oran', lat: 35.6969, lng: -0.6331, cap: 310000000, vuln: 0.45 },
  { id: 9, rank: 9, name: 'Hotel El Aurassi', wilaya: 'Algiers', lat: 36.7538, lng: 3.0588, cap: 95000000, vuln: 0.82 },
  { id: 10, rank: 10, name: 'Tipaza Resort', wilaya: 'Tipaza', lat: 36.5897, lng: 2.4475, cap: 85000000, vuln: 0.68 },
];

const WILAYA_COORDS = {
  'Algiers': { lat: 36.7538, lng: 3.0588 },
  'Blida': { lat: 36.4701, lng: 2.8277 },
  'Oran': { lat: 35.6969, lng: -0.6331 },
  'Bejaia': { lat: 36.7558, lng: 5.0843 },
  'Ouargla': { lat: 31.9500, lng: 5.3167 },
  'Tipaza': { lat: 36.5897, lng: 2.4475 },
  'Constantine': { lat: 36.3650, lng: 6.6147 },
  'Annaba': { lat: 36.9027, lng: 7.7552 },
  'Tizi Ouzou': { lat: 36.7151, lng: 4.0494 },
  'Chlef': { lat: 36.1649, lng: 1.3347 },
  'Boumerdes': { lat: 36.7667, lng: 3.4667 },
  'Setif': { lat: 36.1911, lng: 5.4097 }
};

const PmlSimulator = () => {
  const [status, setStatus] = useState('idle');
  const [zone, setZone] = useState('All Algeria');
  const [magnitude, setMagnitude] = useState(6.5);
  const [epicenter, setEpicenter] = useState({ lat: 36.7538, lng: 3.0588, name: 'Algiers' });
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hasReinsurance, setHasReinsurance] = useState(true);
  const [reinsuranceLimit, setReinsuranceLimit] = useState(1000000000);
  const [history, setHistory] = useState([]);
  const [results, setResults] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [chartInitialized, setChartInitialized] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const chartRef = useRef(null);

  // Initialisation de la carte
  useEffect(() => {
    if (typeof L === 'undefined') {
      console.error('Leaflet not loaded');
      return;
    }

    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current).setView([28.0, 2.5], 5.5);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxZoom: 10,
      minZoom: 4
    }).addTo(map);

    mapInstanceRef.current = map;
    setMapReady(true);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Ajouter les marqueurs
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    Object.entries(WILAYA_COORDS).forEach(([name, coords]) => {
      const marker = L.circleMarker([coords.lat, coords.lng], {
        radius: 8,
        fillColor: '#1F6FEB',
        fillOpacity: 0.8,
        color: '#1F6FEB',
        weight: 2,
        className: 'wilaya-marker'
      }).addTo(map);

      marker.bindTooltip(`<strong>${name}</strong><br/>Click to set epicenter`, { sticky: true });

      marker.on('click', () => {
        setEpicenter({ lat: coords.lat, lng: coords.lng, name });
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-carbon text-teal px-4 py-2 rounded-lg text-sm z-50 animate-fade-in';
        toast.innerHTML = `📍 Epicenter set to <strong>${name}</strong>`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
      });
    });

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      setEpicenter({ lat, lng, name: `Custom (${lat.toFixed(2)}, ${lng.toFixed(2)})` });
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-carbon text-teal px-4 py-2 rounded-lg text-sm z-50 animate-fade-in';
      toast.innerHTML = `📍 Epicenter set to custom location`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    });
  }, [mapReady]);

  // Mettre à jour l'épicentre sur la carte
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (window.currentEpicenterMarker) {
      mapInstanceRef.current.removeLayer(window.currentEpicenterMarker);
    }
    if (window.currentRadiusCircle) {
      mapInstanceRef.current.removeLayer(window.currentRadiusCircle);
    }

    window.currentEpicenterMarker = L.circleMarker([epicenter.lat, epicenter.lng], {
      radius: 12,
      fillColor: '#DA3633',
      fillOpacity: 0.9,
      color: '#DA3633',
      weight: 3,
      className: 'pulse-marker'
    }).addTo(mapInstanceRef.current);

    window.currentEpicenterMarker.bindTooltip(`<strong>Epicenter</strong><br/>${epicenter.name}`, { sticky: true });

    const radius = Math.max(20000, magnitude * 25000);
    window.currentRadiusCircle = L.circle([epicenter.lat, epicenter.lng], {
      radius: radius,
      fillColor: '#DA3633',
      fillOpacity: 0.15,
      color: '#DA3633',
      weight: 1.5,
      opacity: 0.6
    }).addTo(mapInstanceRef.current);

    mapInstanceRef.current.setView([epicenter.lat, epicenter.lng], 7);
  }, [epicenter, magnitude]);

  const runSimulation = () => {
    setStatus('running');

    setTimeout(() => {
      let totalGrossLoss = 0;
      const updatedContracts = MOCK_CONTRACTS.map(contract => {
        const distance = calculateDistance(epicenter.lat, epicenter.lng, contract.lat, contract.lng);
        const attenuation = Math.max(0.1, Math.exp(-distance / (magnitude * 25)));
        const lossRatio = Math.min(0.95, attenuation * contract.vuln * (magnitude / 5.5));
        const loss = Math.round(contract.cap * lossRatio);
        totalGrossLoss += loss;
        return { ...contract, loss, distance };
      }).sort((a, b) => b.loss - a.loss);

      const grossLoss = totalGrossLoss;
      const netLoss = hasReinsurance ? Math.min(grossLoss, reinsuranceLimit) : grossLoss;
      const recovered = grossLoss - netLoss;

      const resLoss = updatedContracts.filter(c => c.name.includes('Resort') || c.name.includes('Hotel')).reduce((sum, c) => sum + c.loss, 0);
      const comLoss = updatedContracts.filter(c => c.name.includes('Mall') || c.name.includes('HQ') || c.name.includes('Stadium')).reduce((sum, c) => sum + c.loss, 0);
      const indLoss = updatedContracts.filter(c => c.name.includes('Complex') || c.name.includes('Refinery') || c.name.includes('Plant')).reduce((sum, c) => sum + c.loss, 0);

      const newResult = {
        id: Date.now(),
        zone,
        magnitude,
        epicenter,
        grossLoss,
        netLoss,
        recovered,
        resLoss: resLoss || Math.round(grossLoss * 0.4),
        comLoss: comLoss || Math.round(grossLoss * 0.35),
        indLoss: indLoss || Math.round(grossLoss * 0.25),
        contracts: updatedContracts
      };

      setResults(newResult);
      setHistory(prev => [newResult, ...prev].slice(0, 5));
      setStatus('completed');
      setChartInitialized(false); // Réinitialiser pour recréer le graphique
    }, 1500);
  };

  // Créer le graphique - CORRIGÉ
  useEffect(() => {
    if (status !== 'completed' || !results || chartInitialized) return;

    // S'assurer que le canvas existe
    const canvas = document.getElementById('timelineChart');
    if (!canvas) {
      console.error('Canvas not found');
      return;
    }

    // Forcer une petite attente pour que le DOM soit prêt
    const timer = setTimeout(() => {
      try {
        if (chartRef.current) {
          chartRef.current.destroy();
        }

        const ctx = canvas.getContext('2d');

        // Données pour la courbe de sensibilité
        const magnitudes = [4.0, 5.0, 6.0, 6.5, 7.0, 8.0];
        const sensitivityData = magnitudes.map(m => {
          const factor = Math.pow((m - 3), 2) / 25;
          return Number(((results.grossLoss / 1000000000) * Math.min(factor, 1.5)).toFixed(1));
        });

        chartRef.current = new ChartJS(ctx, {
          type: 'line',
          data: {
            labels: ['M4.0', 'M5.0', 'M6.0', 'M6.5', 'M7.0', 'M8.0'],
            datasets: [{
              label: 'Expected Loss',
              data: sensitivityData,
              borderColor: '#39D0D8',
              backgroundColor: 'rgba(57,208,216,0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointRadius: 5,
              pointBackgroundColor: '#39D0D8',
              pointBorderColor: '#0D1117',
              pointBorderWidth: 1.5,
              pointHoverRadius: 7
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => `Expected Loss: ${ctx.raw}B DZD`
                }
              }
            },
            scales: {
              y: {
                grid: { color: '#30363D' },
                ticks: { color: '#8B949E', stepSize: 2, callback: (v) => v + 'B' },
                title: { display: true, text: 'Loss (Billion DZD)', color: '#8B949E', font: { size: 9 } }
              },
              x: {
                grid: { display: false },
                ticks: { color: '#8B949E', font: { size: 10 } },
                title: { display: true, text: 'Magnitude', color: '#8B949E', font: { size: 9 } }
              }
            }
          }
        });

        setChartInitialized(true);
      } catch (error) {
        console.error('Chart error:', error);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [status, results, chartInitialized]);

  return (
    <div className="h-[calc(100vh-56px)] flex bg-slate overflow-hidden">

      {/* Left Panel */}
      <div className="w-[380px] bg-carbon border-r border-ash flex flex-col shrink-0">
        <div className="p-5 border-b border-ash">
          <h1 className="text-lg font-mono font-medium text-pure flex items-center gap-2">
            <i className="lucide-activity text-teal"></i>
            Configure Scenario
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          <div>
            <label className="text-[10px] text-fog font-semibold uppercase block mb-1">Target Zone</label>
            <select className="input-field h-9 text-sm" value={zone} onChange={(e) => setZone(e.target.value)}>
              <option>All Algeria</option>
              <option>Algiers (Zone III)</option>
              <option>Blida (Zone III)</option>
              <option>Oran (Zone IIa)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-fog font-semibold uppercase block mb-1 flex justify-between">
              <span>Earthquake Magnitude</span>
              <span className="font-mono text-pure">M{magnitude.toFixed(1)}</span>
            </label>
            <input type="range" min="4.0" max="8.0" step="0.1" value={magnitude} onChange={(e) => setMagnitude(parseFloat(e.target.value))} className="w-full" />
            <div className="flex gap-2 mt-2">
              {['5.0', '6.0', '6.5', '7.0'].map(m => (
                <button key={m} onClick={() => setMagnitude(parseFloat(m))} className="flex-1 py-1 bg-graphite border border-ash rounded text-[10px] text-cloud hover:text-pure">{m}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-fog font-semibold uppercase block mb-1 flex justify-between">
              <span>EPICENTER LOCATION</span>
              <span className="text-teal text-[9px] truncate max-w-[150px]">{epicenter.name}</span>
            </label>
            <div
              ref={mapContainerRef}
              className="w-full h-[240px] rounded-md overflow-hidden border border-ash cursor-crosshair bg-graphite relative"
            >
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] px-2 py-0.5 rounded z-10 pointer-events-none">
                💡 Click on map or blue markers
              </div>
            </div>
            <div className="mt-2 flex justify-between text-[9px] text-fog">
              <span>📍 Click anywhere on map</span>
              <span>🔵 Click on blue markers</span>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-fog font-semibold uppercase block mb-1">SCENARIO DATE</label>
            <input type="date" className="input-field h-9 text-sm" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="bg-graphite p-3 rounded-md border border-ash">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-pure">Include Reinsurance</span>
              <button className={`relative w-9 h-5 rounded-full transition-colors ${hasReinsurance ? 'bg-blue' : 'bg-ash'}`} onClick={() => setHasReinsurance(!hasReinsurance)}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-pure rounded-full transition-transform ${hasReinsurance ? 'translate-x-4' : 'translate-x-0'}`}></span>
              </button>
            </div>
            {hasReinsurance && (
              <div className="mt-3 pt-3 border-t border-ash/50">
                <label className="text-[9px] text-fog font-semibold uppercase block mb-1">Net Retention Limit (DZD)</label>
                <input type="number" className="input-field h-9 text-sm text-right font-mono" value={reinsuranceLimit} onChange={(e) => setReinsuranceLimit(Number(e.target.value))} />
              </div>
            )}
          </div>
        </div>

        <div className="p-5 border-t border-ash">
          <button className="w-full bg-blue hover:bg-opacity-90 text-pure font-semibold rounded-md h-11 transition-all" onClick={runSimulation} disabled={status === 'running'}>
            {status === 'running' ? 'Calculating...' : 'Run Simulation'}
          </button>
        </div>
      </div>

      {/* Right Panel - Results */}
      <div className="flex-1 flex flex-col bg-slate relative overflow-y-auto">

        {status === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <i className="lucide-activity text-fog text-4xl mb-3 block"></i>
              <h3 className="font-mono text-lg text-pure">Ready to Simulate</h3>
              <p className="text-sm text-fog">1. Click on map to set epicenter<br />2. Adjust magnitude<br />3. Run simulation</p>
            </div>
          </div>
        )}

        {status === 'running' && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate/80 backdrop-blur-sm z-20">
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-ash border-t-blue rounded-full animate-spin mx-auto mb-3"></div>
              <h3 className="font-mono text-lg text-pure">Running simulation...</h3>
              <p className="text-xs text-fog mt-1">Calculating losses based on distance from epicenter</p>
            </div>
          </div>
        )}

        {status === 'completed' && results && (
          <div className="p-6 space-y-6">

            {/* Header Box */}
            <div className="card p-6 border-l-4 border-red">
              <div className="text-[11px] text-fog font-bold uppercase tracking-wider mb-1">Expected Gross Loss</div>
              <div className="font-mono text-[48px] leading-none text-red font-light mb-4">
                <DZDArmount value={results.grossLoss} />
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-ash">
                <div>
                  <div className="text-[10px] text-fog uppercase mb-0.5">Scenario Parameters</div>
                  <div className="font-mono text-sm text-pure">{results.zone} | M{results.magnitude.toFixed(1)}</div>
                  <div className="font-sans text-[10px] text-fog mt-0.5 truncate max-w-[120px]">{results.epicenter.name}</div>
                </div>
                <div>
                  <div className="text-[10px] text-fog uppercase mb-0.5">Reinsurance Recovery</div>
                  <div className="font-mono text-xl text-green"><DZDArmount value={results.recovered} /></div>
                </div>
                <div>
                  <div className="text-[10px] text-fog uppercase mb-0.5">Net Company Loss</div>
                  <div className={`font-mono text-xl ${results.netLoss >= reinsuranceLimit ? 'text-red' : 'text-pure'}`}>
                    <DZDArmount value={results.netLoss} />
                  </div>
                </div>
              </div>
            </div>

            {/* Assessment Box */}
            <div className={`p-5 rounded-lg border ${results.netLoss >= reinsuranceLimit ? 'bg-red/10 border-red/30' : 'bg-green/10 border-green/30'}`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${results.netLoss >= reinsuranceLimit ? 'bg-red/20' : 'bg-green/20'}`}>
                  <i className={`text-xl ${results.netLoss >= reinsuranceLimit ? 'lucide-alert-triangle text-red' : 'lucide-shield-check text-green'}`}></i>
                </div>
                <div className="flex-1">
                  <h4 className={`font-mono text-base font-bold mb-2 ${results.netLoss >= reinsuranceLimit ? 'text-red' : 'text-green'}`}>
                    {results.netLoss >= reinsuranceLimit ? 'Net Retention Exceeded' : 'Within Acceptable Limits'}
                  </h4>
                  <p className="font-sans text-sm text-cloud leading-relaxed">
                    {results.netLoss >= reinsuranceLimit
                      ? `This scenario produces a net loss that breaches the defined retention limit of ${reinsuranceLimit.toLocaleString()} DZD. Reinsurance treaty review is highly recommended.`
                      : `The expected net loss is contained within the current treaty limit of ${reinsuranceLimit.toLocaleString()} DZD. No immediate structural changes required.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-6">

              {/* Loss Breakdown by Nature Card */}
              <div className="card p-5">
                <h3 className="font-mono text-base uppercase text-fog font-semibold mb-5">LOSS BREAKDOWN BY NATURE</h3>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue"></div>
                      <span className="font-sans text-xs font-semibold text-fog uppercase">Residential</span>
                    </div>
                    <span className="font-mono text-sm font-bold text-pure"><DZDArmount value={results.resLoss} /></span>
                  </div>
                  <div className="w-full h-2 bg-graphite rounded-full overflow-hidden">
                    <div className="h-full bg-blue rounded-full" style={{ width: `${Math.min(100, (results.resLoss / results.grossLoss) * 100)}%` }}></div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber"></div>
                      <span className="font-sans text-xs font-semibold text-fog uppercase">Commercial</span>
                    </div>
                    <span className="font-mono text-sm font-bold text-pure"><DZDArmount value={results.comLoss} /></span>
                  </div>
                  <div className="w-full h-2 bg-graphite rounded-full overflow-hidden">
                    <div className="h-full bg-amber rounded-full" style={{ width: `${Math.min(100, (results.comLoss / results.grossLoss) * 100)}%` }}></div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red"></div>
                      <span className="font-sans text-xs font-semibold text-fog uppercase">Industrial</span>
                    </div>
                    <span className="font-mono text-sm font-bold text-pure"><DZDArmount value={results.indLoss} /></span>
                  </div>
                  <div className="w-full h-2 bg-graphite rounded-full overflow-hidden">
                    <div className="h-full bg-red rounded-full" style={{ width: `${Math.min(100, (results.indLoss / results.grossLoss) * 100)}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Loss Sensitivity Curve Card - AVEC CANVAS BIEN DIMENSIONNÉ */}
              <div className="card p-5">
                <h3 className="font-mono text-base uppercase text-fog font-semibold mb-4">LOSS SENSITIVITY CURVE</h3>
                <div className="h-[220px] w-full relative">
                  <canvas
                    id="timelineChart"
                    style={{ width: '100%', height: '100%', display: 'block' }}
                  ></canvas>
                </div>
                <div className="mt-3 text-center text-[10px] text-fog">
                  X-axis: Magnitude | Y-axis: Loss (Billion DZD)
                </div>
              </div>
            </div>

            {/* Top Affected Contracts Table */}
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-ash bg-carbon flex justify-between items-center">
                <h3 className="font-mono text-sm font-semibold text-pure">Top Affected Contracts</h3>
                <button className="text-xs font-sans text-fog hover:text-pure transition-colors">Export Details</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-graphite border-b border-ash">
                    <tr>
                      <th className="px-4 py-2 text-[11px] font-semibold text-fog w-12">Rank</th>
                      <th className="px-4 py-2 text-[11px] font-semibold text-fog">Contract Name</th>
                      <th className="px-4 py-2 text-[11px] font-semibold text-fog">Wilaya</th>
                      <th className="px-4 py-2 text-[11px] font-semibold text-fog text-center">Distance (km)</th>
                      <th className="px-4 py-2 text-[11px] font-semibold text-fog text-right">Expected Loss</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ash">
                    {results.contracts.slice(0, 8).map((c, i) => (
                      <tr key={c.id} className="hover:bg-graphite transition-colors">
                        <td className="px-4 py-3 text-[11px] font-mono text-fog">#{i+1}</td>
                        <td className="px-4 py-3 text-sm font-sans text-pure font-medium">{c.name}</td>
                        <td className="px-4 py-3 text-xs font-sans text-cloud">{c.wilaya}</td>
                        <td className="px-4 py-3 text-center text-[11px] font-mono text-amber">{c.distance} km</td>
                        <td className="px-4 py-3 text-right text-sm font-mono text-red font-medium"><DZDArmount value={c.loss} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* History Bar */}
        {history.length > 0 && (
          <div className="h-14 bg-carbon border-t border-ash px-4 flex items-center gap-3 overflow-x-auto shrink-0">
            <span className="text-[10px] font-mono font-bold uppercase text-fog shrink-0">Recent Scenarios</span>
            {history.map(item => (
              <button
                key={item.id}
                className={`px-3 py-1.5 rounded border flex items-center gap-3 text-left shrink-0 transition-colors
                  ${item.id === results?.id ? 'bg-graphite border-teal' : 'bg-transparent border-ash hover:border-fog'}
                `}
                onClick={() => setResults(item)}
              >
                <div>
                  <div className="text-[11px] font-sans text-pure font-semibold">{item.zone}</div>
                  <div className="text-[10px] font-mono text-fog">M{item.magnitude.toFixed(1)}</div>
                </div>
                <div className="text-sm font-mono text-red ml-2"><DZDArmount value={item.grossLoss} /></div>
              </button>
            ))}
          </div>
        )}

      </div>

      <style>{`
        @keyframes pulse { 0%,100% { transform: scale(1); opacity: 0.9; } 50% { transform: scale(1.2); opacity: 0.5; } }
        .pulse-marker { animation: pulse 1.5s ease-in-out infinite; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        .wilaya-marker { transition: all 0.2s ease; cursor: pointer; }
        .wilaya-marker:hover { fill-opacity: 1; r: 10; }
      `}</style>
    </div>
  );
};