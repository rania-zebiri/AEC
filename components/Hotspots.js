// components/Hotspots.js
const { useState, useEffect } = React;

// Helper pour formater DZD
const DZDArmount = ({ value }) => {
  const formatDZD = (val) => {
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}B DZD`;
    if (val >= 1000000) return `${(val / 1000000).toFixed(0)}M DZD`;
    return `${val.toLocaleString()} DZD`;
  };
  return <span>{formatDZD(value)}</span>;
};

// Zone Badge Component - taille réduite
const ZoneBadge = ({ zone }) => {
  const colors = {
    'III': 'bg-red/20 text-red',
    'IIb': 'bg-[#E3622A]/20 text-[#E3622A]',
    'IIa': 'bg-[#D29922]/20 text-[#D29922]',
    'I': 'bg-[#A3A020]/20 text-[#A3A020]',
    '0': 'bg-green/20 text-green'
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${colors[zone] || 'bg-ash text-fog'}`}>
      {zone}
    </span>
  );
};

// Liste complète des wilayas avec leurs pourcentages
const ALL_SAFE_WILAYAS = [
  { id: 1, name: 'Adrar', val: '12%' },
  { id: 2, name: 'Chlef', val: '45%' },
  { id: 3, name: 'Laghouat', val: '8%' },
  { id: 4, name: 'Oum El Bouaghi', val: '15%' },
  { id: 5, name: 'Batna', val: '32%' },
  { id: 6, name: 'Béjaïa', val: '65%' },
  { id: 7, name: 'Biskra', val: '22%' },
  { id: 8, name: 'Béchar', val: '5%' },
  { id: 9, name: 'Blida', val: '82%' },
  { id: 10, name: 'Bouira', val: '18%' },
  { id: 11, name: 'Tamanrasset', val: '3%' },
  { id: 12, name: 'Tébessa', val: '28%' },
  { id: 13, name: 'Tlemcen', val: '35%' },
  { id: 14, name: 'Tiaret', val: '42%' },
  { id: 15, name: 'Tizi Ouzou', val: '78%' },
  { id: 16, name: 'Alger', val: '95%' },
  { id: 17, name: 'Djelfa', val: '25%' },
  { id: 18, name: 'Jijel', val: '55%' },
  { id: 19, name: 'Sétif', val: '38%' },
  { id: 20, name: 'Saïda', val: '20%' },
  { id: 21, name: 'Skikda', val: '48%' },
  { id: 22, name: 'Sidi Bel Abbès', val: '30%' },
  { id: 23, name: 'Annaba', val: '52%' },
  { id: 24, name: 'Guelma', val: '26%' },
  { id: 25, name: 'Constantine', val: '58%' },
  { id: 26, name: 'Médéa', val: '35%' },
  { id: 27, name: 'Mostaganem', val: '40%' },
  { id: 28, name: 'M\'Sila', val: '18%' },
  { id: 29, name: 'Mascara', val: '33%' },
  { id: 30, name: 'Ouargla', val: '12%' },
  { id: 31, name: 'Oran', val: '85%' },
  { id: 32, name: 'El Bayadh', val: '8%' },
  { id: 33, name: 'Illizi', val: '2%' },
  { id: 34, name: 'Bordj Bou Arréridj', val: '28%' },
  { id: 35, name: 'Boumerdès', val: '72%' },
  { id: 36, name: 'El Tarf', val: '20%' },
  { id: 37, name: 'Tindouf', val: '1%' },
  { id: 38, name: 'Tissemsilt', val: '15%' },
  { id: 39, name: 'El Oued', val: '6%' },
  { id: 40, name: 'Khenchela', val: '24%' },
  { id: 41, name: 'Souk Ahras', val: '22%' },
  { id: 42, name: 'Tipaza', val: '74%' },
  { id: 43, name: 'Mila', val: '30%' },
  { id: 44, name: 'Aïn Defla', val: '35%' },
  { id: 45, name: 'Naâma', val: '10%' },
  { id: 46, name: 'Aïn Témouchent', val: '25%' },
  { id: 47, name: 'Ghardaïa', val: '15%' },
  { id: 48, name: 'Relizane', val: '28%' }
];

const SORTED_SAFE_WILAYAS = [...ALL_SAFE_WILAYAS].sort((a, b) => {
  const valA = parseFloat(a.val);
  const valB = parseFloat(b.val);
  return valA - valB;
});

const MOCK_HOTSPOTS = [
  {
    id: 16, name: 'Algiers', zone: 'III',
    capacity: 1000000000, exposure: 2500000000,
    res: 1200000000, com: 800000000, ind: 500000000,
    score: 95
  },
  {
    id: 9, name: 'Blida', zone: 'III',
    capacity: 500000000, exposure: 650000000,
    res: 400000000, com: 150000000, ind: 100000000,
    score: 82
  }
];

const MOCK_WARNINGS = [
  {
    id: 31, name: 'Oran', zone: 'IIa',
    capacity: 1000000000, exposure: 850000000,
    res: 400000000, com: 300000000, ind: 150000000,
    score: 68
  },
  {
    id: 42, name: 'Tipaza', zone: 'III',
    capacity: 300000000, exposure: 270000000,
    res: 200000000, com: 50000000, ind: 20000000,
    score: 74
  }
];

// GaugeBar - taille réduite
const GaugeBar = ({ capacity, exposure, type = 'hotspot' }) => {
  const maxVal = Math.max(capacity, exposure);
  const capPct = (capacity / maxVal) * 100;
  const expPct = (exposure / maxVal) * 100;
  const color = type === 'hotspot' ? 'bg-red' : 'bg-amber';
  const isOver = exposure > capacity;

  return (
    <div className="w-full">
      <div className="flex justify-between font-mono text-[9px] mb-0.5">
        <span className="text-fog">Capacity: {(capacity/1000000000).toFixed(1)}B</span>
        <span className={isOver ? 'text-red font-bold' : 'text-amber'}>Insured: {(exposure/1000000000).toFixed(1)}B</span>
      </div>
      <div className="relative h-2 bg-graphite rounded-full overflow-hidden border border-ash">
        <div className={`absolute top-0 left-0 h-full ${color} opacity-80`} style={{ width: `${expPct}%` }}></div>
        <div className="absolute top-0 bottom-0 border-r-2 border-pure z-10" style={{ left: `${capPct}%` }}></div>
        {isOver && (
          <div className="absolute top-0 bottom-0 right-0 opacity-40" style={{ left: `${capPct}%`, backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.5) 4px, rgba(0,0,0,0.5) 8px)' }}></div>
        )}
      </div>
    </div>
  );
};

const Hotspots = () => {
  const [safeExpanded, setSafeExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredWilayas = SORTED_SAFE_WILAYAS.filter(w =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const ctx = document.getElementById('retentionDonut');
    let chart;

    if (ctx) {
      chart = new ChartJS(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Safe (<75%)', 'Warning (>75%)', 'Hotspot (>100%)'],
          datasets: [{
            data: [47, 2, 2],
            backgroundColor: ['#2EA043', '#D29922', '#DA3633'],
            borderWidth: 0,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const labels = ['Safe (<75%)', 'Warning (>75%)', 'Hotspot (>100%)'];
                  return `${labels[context.dataIndex]}: ${context.raw} wilayas`;
                }
              }
            }
          }
        }
      });
    }

    return () => { if (chart) chart.destroy(); };
  }, []);

  return (
    <div className="h-[calc(100vh-56px)] flex bg-slate overflow-hidden">

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* Hero Alert Header - TAILLE RÉDUITE */}
        <div className="bg-red/10 border-b border-red/30 px-6 py-4 shrink-0 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-red/10 to-transparent pointer-events-none"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <i className="lucide-alert-triangle text-2xl text-red"></i>
                <h1 className="text-[22px] font-mono font-medium text-pure m-0 leading-none">Concentration Hotspots</h1>
              </div>
              <p className="font-sans text-[12px] text-cloud max-w-2xl mt-1">Wilayas where currently insured capital significantly exceeds the defined retention capacity thresholds. Immediate action recommended.</p>
            </div>

            <div className="bg-carbon/80 backdrop-blur border border-ash p-3 rounded-[6px] shadow-sm flex items-center gap-3">
              <i className="lucide-info text-fog text-base"></i>
              <div>
                <div className="font-sans text-[9px] text-fog uppercase tracking-wider font-semibold mb-0.5">Global Retention Capacity</div>
                <div className="font-mono text-sm text-pure">1,000,000,000 DZD</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Padding Wrapper */}
        <div className="p-6 space-y-6">

          {/* CRITICAL HOTSPOTS - TAILLE RÉDUITE */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {MOCK_HOTSPOTS.map(w => {
              const excessAmount = w.exposure - w.capacity;
              const excessPct = ((excessAmount / w.capacity) * 100).toFixed(1);

              return (
                <div key={w.id} className="card border border-red overflow-hidden relative group">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red"></div>
                  <div className="p-4 pl-6">

                    {/* En-tête réduit */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <h2 className="font-mono text-[18px] font-semibold text-pure">{w.name}</h2>
                          <ZoneBadge zone={w.zone} />
                        </div>
                        <div className="font-sans text-[10px] text-fog">Wilaya Code: {w.id.toString().padStart(2, '0')}</div>
                      </div>
                      <div className="bg-red/20 text-red border border-red/30 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                        <div className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red"></span>
                        </div>
                        <span className="font-sans text-[9px] font-bold tracking-wider uppercase">Hotspot</span>
                      </div>
                    </div>

                    {/* Gauge Bar réduit */}
                    <div className="mb-4">
                      <GaugeBar capacity={w.capacity} exposure={w.exposure} type="hotspot" />
                    </div>

                    {/* Excess Exposure réduit */}
                    <div className="bg-red/5 border border-red/20 rounded-[6px] p-3 mb-4 text-center">
                      <div className="font-sans text-[9px] text-red/80 font-bold uppercase mb-0.5">Excess Exposure</div>
                      <div className="font-mono text-[20px] text-red font-medium">
                        <DZDArmount value={excessAmount} />
                      </div>
                      <div className="font-mono text-[10px] text-red/70 mt-0.5">+{excessPct}% over capacity</div>
                    </div>

                    {/* Stats réduites */}
                    <div className="grid grid-cols-3 gap-3 mb-4 border-t border-ash pt-3">
                      <div>
                        <div className="font-sans text-[9px] text-fog mb-0.5">Residential</div>
                        <div className="font-mono text-[11px] text-cloud"><DZDArmount value={w.res} /></div>
                      </div>
                      <div>
                        <div className="font-sans text-[9px] text-fog mb-0.5">Commercial</div>
                        <div className="font-mono text-[11px] text-cloud"><DZDArmount value={w.com} /></div>
                      </div>
                      <div>
                        <div className="font-sans text-[9px] text-fog mb-0.5">Industrial</div>
                        <div className="font-mono text-[11px] text-cloud"><DZDArmount value={w.ind} /></div>
                      </div>
                    </div>

                    {/* Boutons réduits */}
                    <div className="flex gap-2">
                      <button className="flex-1 bg-red hover:bg-red/80 text-pure font-sans font-semibold rounded-[6px] transition-colors h-7 text-[10px]">
                        Block New Contracts
                      </button>
                      <button className="flex-1 bg-graphite border border-ash hover:bg-ash hover:border-fog text-cloud hover:text-pure font-sans font-semibold rounded-[6px] transition-colors h-7 text-[10px]">
                        Suggest Reinsurance
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* WARNING ZONE - TAILLE RÉDUITE */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <i className="lucide-alert-triangle text-amber text-base"></i>
              <h3 className="font-mono text-[14px] text-pure">Approaching Threshold (&gt;75%)</h3>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {MOCK_WARNINGS.map(w => {
                const usedPct = ((w.exposure / w.capacity) * 100).toFixed(1);

                return (
                  <div key={w.id} className="card border border-amber/50 p-4 pl-5 relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber"></div>

                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-mono text-[16px] font-semibold text-pure">{w.name}</h4>
                        <ZoneBadge zone={w.zone} />
                      </div>
                      <div className="font-mono text-[14px] text-amber font-bold">{usedPct}% used</div>
                    </div>

                    <GaugeBar capacity={w.capacity} exposure={w.exposure} type="warning" />

                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-ash/50">
                      <div className="font-sans text-[11px] text-fog">Risk Score: <span className="font-mono text-pure">{w.score}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SAFE SUMMARY */}
          <div className="border border-ash rounded-[8px] bg-carbon overflow-hidden">
            <button
              className="w-full p-3 flex items-center justify-between hover:bg-graphite transition-colors"
              onClick={() => setSafeExpanded(!safeExpanded)}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green/10 flex items-center justify-center text-green">
                  <i className="lucide-shield-check text-sm"></i>
                </div>
                <span className="font-sans text-[13px] font-medium text-pure">{ALL_SAFE_WILAYAS.length} wilayas within safe limits (&lt;75% capacity)</span>
              </div>
              <i className={`lucide-chevron-down text-fog transition-transform text-xs ${safeExpanded ? 'rotate-180' : ''}`}></i>
            </button>

            {safeExpanded && (
              <div className="p-3 border-t border-ash bg-graphite">
                <div className="mb-3 relative">
                  <i className="lucide-search absolute left-2.5 top-1/2 -translate-y-1/2 text-fog text-[11px]"></i>
                  <input
                    type="text"
                    placeholder="Search wilaya..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-8 h-8 text-xs w-full"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto pr-1">
                  {filteredWilayas.map(w => (
                    <div key={w.id} className="flex justify-between items-center bg-carbon p-1.5 rounded border border-ash/50 hover:border-green/30 transition-colors">
                      <span className="font-sans text-[11px] text-cloud">{w.name}</span>
                      <span className={`font-mono text-[11px] font-semibold ${parseFloat(w.val) < 30 ? 'text-green' : parseFloat(w.val) < 60 ? 'text-amber' : 'text-orange'}`}>
                        {w.val}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-2 border-t border-ash/50 text-center">
                  <span className="text-[10px] text-fog">
                    Showing {filteredWilayas.length} of {ALL_SAFE_WILAYAS.length} wilayas
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Right Panel - Global Summary - TAILLE RÉDUITE */}
      <div className="w-[280px] border-l border-ash bg-carbon flex flex-col shrink-0">
        <div className="h-14 border-b border-ash flex items-center px-5 shrink-0">
          <h2 className="font-mono text-xs font-semibold text-pure uppercase tracking-wide">Global Summary</h2>
        </div>

        <div className="p-5 flex-1 overflow-y-auto">

          <div className="relative w-full aspect-square mb-6">
            <canvas id="retentionDonut"></canvas>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-mono text-[28px] font-bold text-pure leading-none">51</span>
              <span className="font-sans text-[9px] text-fog uppercase tracking-wider mt-0.5">Total Wilayas</span>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green"></div><span className="font-sans text-[11px] text-cloud">Safe (&lt;75%)</span></div>
              <span className="font-mono text-sm text-pure">{ALL_SAFE_WILAYAS.length}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber"></div><span className="font-sans text-[11px] text-cloud">Warning (&gt;75%)</span></div>
              <span className="font-mono text-sm text-pure">2</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red"></div><span className="font-sans text-[11px] text-cloud">Hotspot (&gt;100%)</span></div>
              <span className="font-mono text-sm text-pure">2</span>
            </div>
          </div>

          <div className="bg-blue/10 border border-blue/30 rounded-[6px] p-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue"></div>
            <div className="flex items-center gap-1.5 mb-2">
              <i className="lucide-wand-sparkles text-blue text-xs"></i>
              <h3 className="font-sans text-[9px] font-bold text-blue uppercase tracking-wide">System Recommendation</h3>
            </div>
            <p className="font-sans text-[11px] text-cloud leading-relaxed">
              Suspend new major risk policies in <strong className="text-pure">Algiers</strong> and <strong className="text-pure">Blida</strong>. Redirect sales priorities to Zone 0 and Zone I wilayas.
            </p>
            <button className="mt-3 w-full bg-blue/20 hover:bg-blue/30 text-blue font-sans text-[11px] font-semibold py-1.5 rounded transition-colors border border-blue/40">
              Apply Auto-Rules
            </button>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        .animate-ping {
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};