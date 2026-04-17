// components/Report.js
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

const MOCK_KPIS = [
  { id: 'exp', label: 'Total Exposure', prev: 13300000000, curr: 14800000000, unit: 'DZD', higherIsWorse: true },
  { id: 'z3', label: 'Zone III Share', prev: 33.8, curr: 38.0, unit: '%', higherIsWorse: true },
  { id: 'pml', label: 'PML (M6.5)', prev: 2500000000, curr: 3200000000, unit: 'DZD', higherIsWorse: true },
  { id: 'bal', label: 'Balance Index', prev: 66, curr: 62, unit: 'pts', higherIsWorse: false },
  { id: 'hot', label: 'Active Hotspots', prev: 1, curr: 3, unit: '', higherIsWorse: true },
  { id: 'new', label: 'New Contracts', prev: 12, curr: 18, unit: '', higherIsWorse: false },
  { id: 'rej', label: 'Rejected Contracts', prev: 2, curr: 1, unit: '', higherIsWorse: false },
];

const MOCK_NEW_CONTRACTS = [
  { id: 'POL-16-042', date: '2026-03-05', client: 'EURL Construction Alpha', wilaya: 'Algiers', zone: 'III', capital: 450000000, score: 82 },
  { id: 'POL-09-015', date: '2026-03-12', client: 'Sarl MedFoods', wilaya: 'Blida', zone: 'III', capital: 120000000, score: 75 },
  { id: 'POL-31-028', date: '2026-03-18', client: 'Promotion Immobiliere Z', wilaya: 'Oran', zone: 'IIa', capital: 85000000, score: 58 },
  { id: 'POL-42-009', date: '2026-03-22', client: 'Tipaza Coastal Dev', wilaya: 'Tipaza', zone: 'III', capital: 280000000, score: 88 },
  { id: 'POL-16-043', date: '2026-03-28', client: 'Tech Hub Algiers', wilaya: 'Algiers', zone: 'III', capital: 310000000, score: 79 },
];

const SUMMARY_TEXTS = {
  'fr': "Par rapport à Février 2026, l'exposition totale du portefeuille a augmenté de 1,5 milliard DZD (+11,2%), tirée principalement par 5 nouveaux contrats acceptés en Zone III (Alger, Blida). Le PML pour un événement M6.5 de référence a augmenté de 700 millions DZD. L'indice d'équilibre du portefeuille a diminué de 66 à 62, signalant une surconcentration. Une révision immédiate de la gestion des risques et des traités de réassurance est recommandée.",
  'ar': "مقارنة بشهر فبراير 2026، زاد إجمالي التعرض للمحفظة بمقدار 1.5 مليار دينار جزائري (+11.2٪)، مدفوعًا بشكل أساسي بـ 5 عقود جديدة تم قبولها في المنطقة الثالثة (الجزائر، البليدة). زاد الحد الأقصى للخسارة المحتملة (PML) لحدث بقوة 6.5 بمقدار 700 مليون دينار جزائري. انخفض مؤشر توازن المحفظة من 66 إلى 62، مما يشير إلى تركز مفرط. يوصى بمراجعة فورية لإدارة المخاطر واتفاقيات إعادة التأمين."
};

// Coordonnées précises des hotspots en Algérie
const HOTSPOTS_PREV = [
  { name: 'Algiers', lat: 36.7538, lng: 3.0588, zone: 'III' }
];

const HOTSPOTS_CURR = [
  { name: 'Algiers', lat: 36.7538, lng: 3.0588, zone: 'III' },
  { name: 'Blida', lat: 36.4701, lng: 2.8277, zone: 'III' },
  { name: 'Tipaza', lat: 36.5897, lng: 2.4475, zone: 'III' }
];

// Configuration des limites de l'Algérie
const ALGERIA_CENTER = { lat: 28.0, lng: 2.5 };
const ALGERIA_ZOOM = 5.2;

const Report = () => {
  const [summaryLang, setSummaryLang] = useState('fr');
  const [selectedMonth, setSelectedMonth] = useState('2026-03');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  const prevMapRef = useRef(null);
  const currMapRef = useRef(null);
  const prevMapInstance = useRef(null);
  const currMapInstance = useRef(null);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc'
    });
  };

  const sortedContracts = React.useMemo(() => {
    let sortable = [...MOCK_NEW_CONTRACTS];
    sortable.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortable;
  }, [sortConfig]);

  // Initialisation des cartes - SANS ANIMATION
  useEffect(() => {
    if (typeof L === 'undefined') {
      console.error('Leaflet not loaded');
      return;
    }

    // Carte Previous Month
    if (prevMapRef.current && !prevMapInstance.current) {
      const prevMap = L.map(prevMapRef.current).setView([ALGERIA_CENTER.lat, ALGERIA_CENTER.lng], ALGERIA_ZOOM);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CartoDB',
        maxZoom: 8,
        minZoom: 4
      }).addTo(prevMap);

      // Ajouter le hotspot d'Algiers (sans animation)
      HOTSPOTS_PREV.forEach(hotspot => {
        L.circleMarker([hotspot.lat, hotspot.lng], {
          radius: 12,
          fillColor: '#DA3633',
          fillOpacity: 0.85,
          color: '#FFFFFF',
          weight: 2,
          opacity: 0.9
        }).addTo(prevMap).bindTooltip(hotspot.name, { sticky: true });
      });

      prevMapInstance.current = prevMap;
      setTimeout(() => prevMap.invalidateSize(), 100);
    }

    // Carte Current Month - SANS ANIMATION
    if (currMapRef.current && !currMapInstance.current) {
      const currMap = L.map(currMapRef.current).setView([ALGERIA_CENTER.lat, ALGERIA_CENTER.lng], ALGERIA_ZOOM);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CartoDB',
        maxZoom: 8,
        minZoom: 4
      }).addTo(currMap);

      // Ajouter les hotspots (sans animation)
      HOTSPOTS_CURR.forEach(hotspot => {
        L.circleMarker([hotspot.lat, hotspot.lng], {
          radius: 12,
          fillColor: '#DA3633',
          fillOpacity: 0.85,
          color: '#FFFFFF',
          weight: 2,
          opacity: 0.9
        }).addTo(currMap).bindTooltip(hotspot.name, { sticky: true });
      });

      currMapInstance.current = currMap;
      setTimeout(() => currMap.invalidateSize(), 100);
    }

    return () => {
      if (prevMapInstance.current) {
        prevMapInstance.current.remove();
        prevMapInstance.current = null;
      }
      if (currMapInstance.current) {
        currMapInstance.current.remove();
        currMapInstance.current = null;
      }
    };
  }, []);

  // Chart
  useEffect(() => {
    const ctx = document.getElementById('reportExposureChart');
    let chart;

    if (ctx) {
      chart = new ChartJS(ctx, {
        type: 'line',
        data: {
          labels: ['Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar'],
          datasets: [
            {
              label: 'Exposition Totale (B DZD)',
              data: [11.2, 11.5, 11.8, 12.0, 12.1, 12.5, 12.8, 13.0, 13.2, 13.3, 13.3, 14.8],
              borderColor: '#39D0D8',
              backgroundColor: 'transparent',
              tension: 0.3,
              borderWidth: 2,
              pointRadius: 3,
              pointBackgroundColor: '#39D0D8'
            },
            {
              label: 'Exposition Zone III (B DZD)',
              data: [3.5, 3.6, 3.8, 3.9, 4.0, 4.2, 4.3, 4.4, 4.5, 4.5, 4.5, 5.6],
              borderColor: '#DA3633',
              backgroundColor: 'transparent',
              borderDash: [5, 5],
              tension: 0.3,
              borderWidth: 2,
              pointRadius: 3,
              pointBackgroundColor: '#DA3633'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          scales: {
            y: { grid: { color: '#30363D' }, ticks: { color: '#8B949E', callback: (value) => value + 'B' } },
            x: { grid: { display: false }, ticks: { color: '#8B949E' } }
          },
          plugins: {
            legend: { position: 'bottom', labels: { color: '#C9D1D9', usePointStyle: true, boxWidth: 8 } },
            tooltip: { backgroundColor: '#161B22', titleColor: '#F0F6FC', bodyColor: '#C9D1D9', borderColor: '#30363D', borderWidth: 1 }
          }
        }
      });
    }

    return () => { if (chart) chart.destroy(); };
  }, []);

  const formatValue = (val, unit) => {
    if (unit === 'DZD') return <DZDArmount value={val} />;
    if (unit === '%') return val.toFixed(1) + '%';
    return val;
  };

  const getStatusIcon = (prev, curr, higherIsWorse) => {
    const diff = curr - prev;
    if (diff === 0) return <i className="lucide-minus text-fog" title="Stable"></i>;
    const isBetter = higherIsWorse ? diff < 0 : diff > 0;
    if (isBetter) {
      return <i className="lucide-arrow-down text-green" title="Improved"></i>;
    } else {
      return <i className="lucide-arrow-up text-red" title="Worsened"></i>;
    }
  };

  return (
    <div className="min-h-screen bg-slate pb-16" data-name="report-page" data-file="components/Report.js">

      {/* Action Bar (Sticky) */}
      <div className="sticky top-[56px] z-30 bg-slate/90 backdrop-blur border-b border-ash py-4 px-8 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-[24px] font-mono font-medium text-pure leading-none mb-1">Exposure Report</h1>
            <p className="font-sans text-sm text-fog">Generated automatically on 01/04/2026</p>
          </div>
          <div className="h-8 w-px bg-ash"></div>
          <div className="relative">
            <select
              className="bg-carbon border border-ash text-pure font-sans text-sm rounded-[6px] h-[36px] pl-3 pr-8 appearance-none focus:border-teal outline-none"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="2026-03">March 2026</option>
              <option value="2026-02">February 2026</option>
              <option value="2026-01">January 2026</option>
            </select>
            <i className="lucide-chevron-down absolute right-2.5 top-2 text-fog text-sm pointer-events-none"></i>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="btn-outline bg-carbon shadow-sm flex items-center gap-2">
            <i className="lucide-columns text-sm"></i> Compare Months
          </button>
          <button className="btn-primary shadow-md flex items-center gap-2">
            <i className="lucide-file-down text-sm"></i> Export PDF
          </button>
        </div>
      </div>

      {/* Document Container */}
      <div className="max-w-[1000px] mx-auto bg-[#10141b] rounded-[12px] border border-ash shadow-2xl p-10">

        {/* 1. Executive Summary */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6 border-b border-ash pb-2">
            <h2 className="font-mono text-[18px] font-semibold text-pure uppercase tracking-wider flex items-center gap-3">
              <i className="lucide-file-text text-teal"></i>
              Executive Summary
            </h2>
            <div className="flex bg-graphite rounded-[4px] p-0.5 border border-ash">
              <button
                className={`px-3 py-1 text-[11px] font-sans font-bold uppercase rounded-[2px] transition-colors ${summaryLang === 'fr' ? 'bg-ash text-pure shadow-sm' : 'text-fog hover:text-cloud'}`}
                onClick={() => setSummaryLang('fr')}
              >FR</button>
              <button
                className={`px-3 py-1 text-[11px] font-sans font-bold uppercase rounded-[2px] transition-colors ${summaryLang === 'ar' ? 'bg-ash text-pure shadow-sm' : 'text-fog hover:text-cloud'}`}
                onClick={() => setSummaryLang('ar')}
              >AR</button>
            </div>
          </div>

          <div className="bg-graphite/50 border-l-[4px] border-amber rounded-r-[8px] p-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-amber/5 to-transparent pointer-events-none"></div>
            <p className={`font-sans text-[15px] leading-relaxed text-cloud ${summaryLang === 'ar' ? 'text-right text-[16px]' : ''}`} dir={summaryLang === 'ar' ? 'rtl' : 'ltr'}>
              {SUMMARY_TEXTS[summaryLang]}
            </p>
          </div>
        </div>

        {/* 2. Key Indicator Comparison */}
        <div className="mb-12">
          <h2 className="font-mono text-[18px] font-semibold text-pure border-b border-ash pb-2 mb-6 uppercase tracking-wider flex items-center gap-3">
            <i className="lucide-chart-bar text-teal"></i>
            Key Indicators (Current vs Previous)
          </h2>

          <div className="border border-ash rounded-[8px] overflow-hidden bg-carbon">
            <table className="w-full text-left">
              <thead className="bg-graphite border-b border-ash">
                <tr>
                  <th className="px-6 py-3 font-sans text-[12px] font-semibold text-fog uppercase">Indicator</th>
                  <th className="px-6 py-3 font-sans text-[12px] font-semibold text-fog uppercase text-right">Prev Month</th>
                  <th className="px-6 py-3 font-sans text-[12px] font-semibold text-fog uppercase text-right">Curr Month</th>
                  <th className="px-6 py-3 font-sans text-[12px] font-semibold text-fog uppercase text-right">Change</th>
                  <th className="px-6 py-3 font-sans text-[12px] font-semibold text-fog uppercase text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ash">
                {MOCK_KPIS.map(kpi => {
                  const diff = kpi.curr - kpi.prev;
                  const pct = kpi.prev !== 0 ? (diff / kpi.prev) * 100 : 0;
                  const diffStr = diff > 0 ? '+' : '';

                  return (
                    <tr key={kpi.id} className="hover:bg-graphite/30 transition-colors">
                      <td className="px-6 py-4 font-sans text-sm text-pure font-medium">{kpi.label}</td>
                      <td className="px-6 py-4 font-mono text-[13px] text-cloud text-right">{formatValue(kpi.prev, kpi.unit)}</td>
                      <td className="px-6 py-4 font-mono text-[13px] text-pure font-bold text-right">{formatValue(kpi.curr, kpi.unit)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-mono text-[13px] text-cloud">{diffStr}{formatValue(diff, kpi.unit)}</div>
                        {kpi.unit !== '%' && kpi.unit !== 'pts' && kpi.unit !== '' && (
                          <div className="font-mono text-[10px] text-fog">{diffStr}{pct.toFixed(1)}%</div>
                        )}
                      </td>
                      <td className="px-6 py-4 flex justify-center items-center">
                        {getStatusIcon(kpi.prev, kpi.curr, kpi.higherIsWorse)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Exposure Chart */}
        <div className="mb-12">
          <h2 className="font-mono text-[18px] font-semibold text-pure border-b border-ash pb-2 mb-6 uppercase tracking-wider flex items-center gap-3">
            <i className="lucide-line-chart text-teal"></i>
            12-Month Exposure Trend
          </h2>
          <div className="bg-carbon border border-ash rounded-[8px] p-6 h-[350px]">
            <canvas id="reportExposureChart"></canvas>
          </div>
        </div>

        {/* 4. Changes in Risk Concentration - AVEC POINTS STATIQUES */}
        <div className="mb-12">
          <h2 className="font-mono text-[18px] font-semibold text-pure border-b border-ash pb-2 mb-6 uppercase tracking-wider flex items-center gap-3">
            <i className="lucide-map text-teal"></i>
            Concentration Shift (Hotspots)
          </h2>
          <div className="grid grid-cols-2 gap-6">

            {/* Previous Month Map */}
            <div className="bg-carbon border border-ash rounded-[8px] overflow-hidden flex flex-col">
              <div className="bg-graphite px-4 py-2 border-b border-ash flex justify-between items-center">
                <span className="font-sans text-sm font-semibold text-fog">Previous Month (Feb 2026)</span>
                <span className="font-mono text-[11px] bg-red/20 text-red px-2 py-0.5 rounded">1 Hotspot</span>
              </div>
              <div
                ref={prevMapRef}
                className="h-[220px] w-full bg-[#0a0d12]"
                style={{ minHeight: '220px' }}
              ></div>
              <div className="p-3 bg-graphite border-t border-ash text-xs font-sans text-cloud">
                Algiers was the only wilaya exceeding retention limits.
              </div>
            </div>

            {/* Current Month Map */}
            <div className="bg-carbon border border-ash rounded-[8px] overflow-hidden flex flex-col relative">
              <div className="absolute inset-0 border-2 border-amber/30 rounded-[8px] pointer-events-none z-10"></div>
              <div className="bg-graphite px-4 py-2 border-b border-ash flex justify-between items-center">
                <span className="font-sans text-sm font-semibold text-pure">Current Month (Mar 2026)</span>
                <span className="font-mono text-[11px] bg-red text-pure px-2 py-0.5 rounded">3 Hotspots</span>
              </div>
              <div
                ref={currMapRef}
                className="h-[220px] w-full bg-[#0a0d12]"
                style={{ minHeight: '220px' }}
              ></div>
              <div className="p-3 bg-graphite border-t border-ash text-xs font-sans text-amber">
                <strong>Alert:</strong> Blida and Tipaza have newly breached retention limits this month.
              </div>
            </div>

          </div>
        </div>

        {/* 5. New Contracts */}
        <div className="mb-12">
          <h2 className="font-mono text-[18px] font-semibold text-pure border-b border-ash pb-2 mb-6 uppercase tracking-wider flex items-center gap-3">
            <i className="lucide-file-plus text-teal"></i>
            New Major Contracts Added
          </h2>
          <div className="border border-ash rounded-[8px] overflow-hidden bg-carbon">
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-graphite border-b border-ash">
                  <tr>
                    <th className="px-4 py-3 font-sans text-[12px] font-semibold text-fog cursor-pointer hover:text-pure" onClick={() => handleSort('date')}>
                      Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-3 font-sans text-[12px] font-semibold text-fog cursor-pointer hover:text-pure" onClick={() => handleSort('client')}>
                      Client {sortConfig.key === 'client' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-3 font-sans text-[12px] font-semibold text-fog">Wilaya / Zone</th>
                    <th className="px-4 py-3 font-sans text-[12px] font-semibold text-fog text-right cursor-pointer hover:text-pure" onClick={() => handleSort('capital')}>
                      Capital (DZD) {sortConfig.key === 'capital' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-3 font-sans text-[12px] font-semibold text-fog text-center">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ash">
                  {sortedContracts.map(c => (
                    <tr key={c.id} className="hover:bg-graphite/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-[12px] text-cloud">{c.date}</td>
                      <td className="px-4 py-3 font-sans text-[13px] text-pure">{c.client}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-sans text-[13px] text-cloud">{c.wilaya}</span>
                          <ZoneBadge zone={c.zone} />
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[13px] text-cloud text-right"><DZDArmount value={c.capital} /></td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-mono text-[12px] font-bold ${c.score > 75 ? 'text-red' : c.score > 50 ? 'text-amber' : 'text-green'}`}>{c.score}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 6. Recommendations */}
        <div className="mb-0">
          <h2 className="font-mono text-[18px] font-semibold text-pure border-b border-ash pb-2 mb-6 uppercase tracking-wider flex items-center gap-3">
            <i className="lucide-lightbulb text-amber"></i>
            Strategic Recommendations
          </h2>
          <div className="bg-graphite border border-ash rounded-[8px] p-6 space-y-4">

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-red/10 border border-red/30 flex items-center justify-center shrink-0 mt-0.5">
                <span className="font-mono font-bold text-red text-sm">1</span>
              </div>
              <div>
                <h4 className="font-sans text-[15px] font-bold text-pure mb-1">Halt New Underwriting in Zone III</h4>
                <p className="font-sans text-[13px] text-cloud leading-relaxed">
                  The addition of 5 major contracts in Algiers and Blida has pushed the PML near treaty limits. Suspend auto-approvals for Zone III commercial/industrial risks exceeding 50M DZD.
                </p>
              </div>
            </div>

            <div className="w-full h-px bg-ash/50"></div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue/10 border border-blue/30 flex items-center justify-center shrink-0 mt-0.5">
                <span className="font-mono font-bold text-blue text-sm">2</span>
              </div>
              <div>
                <h4 className="font-sans text-[15px] font-bold text-pure mb-1">Initiate Reinsurance Facultative Placement</h4>
                <p className="font-sans text-[13px] text-cloud leading-relaxed">
                  For existing high-risk contracts (Score &gt; 80) renewing next month, seek facultative reinsurance support to bleed off excess concentration in the central region.
                </p>
              </div>
            </div>

            <div className="w-full h-px bg-ash/50"></div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-green/10 border border-green/30 flex items-center justify-center shrink-0 mt-0.5">
                <span className="font-mono font-bold text-green text-sm">3</span>
              </div>
              <div>
                <h4 className="font-sans text-[15px] font-bold text-pure mb-1">Pivot Sales to South/West Regions</h4>
                <p className="font-sans text-[13px] text-cloud leading-relaxed">
                  Utilize the Opportunities Map to direct regional managers in Zones 0 and I (e.g., Adrar, El Oued) to aggressively acquire new SME business to restore the Balance Index.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

      <style>{`
        .custom-tooltip {
          background: #161B22 !important;
          border: 1px solid #30363D !important;
          border-radius: 6px !important;
        }
        .leaflet-container {
          background: #0a0d12 !important;
        }
      `}</style>
    </div>
  );
};