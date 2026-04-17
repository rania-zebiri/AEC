// components/Dashboard.js
const { useState, useEffect, useRef } = React;

// Helper pour formater DZD
const DZDArmount = ({ value }) => {
  const formatDZD = (val) => {
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}B DZD`;
    if (val >= 1000000) return `${(val / 1000000).toFixed(0)}M DZD`;
    return `${val.toLocaleString()} DZD`;
  };
  return <span>{formatDZD(value)}</span>;
};

const TrendArrow = ({ value }) => {
  const isPositive = value >= 0;
  return (
    <div className={`flex items-center gap-1 ${isPositive ? 'text-green' : 'text-red'}`}>
      <i className={`lucide-${isPositive ? 'trending-up' : 'trending-down'} text-xs`}></i>
      <span className="font-mono text-[13px]">{Math.abs(value)}%</span>
      <span className="font-sans text-[11px] text-fog ml-1">vs last month</span>
    </div>
  );
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
      {zone}
    </span>
  );
};

const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const miniMapRef = useRef(null);
  const miniMapInstanceRef = useRef(null);

  const totalExposure = 14500000000;
  const pml = 3200000000;

  // Données mensuelles réelles
  const monthlyData = [13.2, 13.5, 13.8, 14.1, 14.3, 14.5];
  const previousMonth = monthlyData[monthlyData.length - 2];
  const currentMonth = monthlyData[monthlyData.length - 1];
  const difference = currentMonth - previousMonth;
  const percentageChange = ((difference / previousMonth) * 100).toFixed(1);

  // Top 5 Risky Contracts
  const topContracts = [
    { id: 1, name: 'Sonatrach Hassi Messaoud', wilaya: 'Ouargla', zone: 'IIb', value: 850000000, risk: 85 },
    { id: 2, name: 'Port of Algiers', wilaya: 'Algiers', zone: 'III', value: 420000000, risk: 92 },
    { id: 3, name: 'Cevital Bejaia Complex', wilaya: 'Bejaia', zone: 'III', value: 380000000, risk: 88 },
    { id: 4, name: 'Sonelgaz Boufarik', wilaya: 'Blida', zone: 'III', value: 210000000, risk: 78 },
    { id: 5, name: 'Sonatrach Hassi R\'Mel', wilaya: 'Laghouat', zone: 'I', value: 150000000, risk: 45 }
  ];

  // CRAAG Events
  const recentEvents = [
    { id: 1, time: '2 hours ago', location: 'Chlef', mag: 4.2, affected: 145 },
    { id: 2, time: 'Yesterday', location: 'Tipaza', mag: 3.1, affected: 12 },
    { id: 3, time: '3 days ago', location: 'Mascara', mag: 2.8, affected: 0 }
  ];

  const navigateTo = (page, href) => {
    if (href) {
      window.location.href = href;
    } else {
      setCurrentPage(page);
    }
  };

  // Mini-map
  useEffect(() => {
    if (!miniMapRef.current || miniMapInstanceRef.current) return;

    const map = L.map(miniMapRef.current).setView([28.0, 2.5], 4.5);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxZoom: 8,
      minZoom: 4
    }).addTo(map);

    const wilayas = [
      { name: "Alger", lat: 36.7538, lng: 3.0588, risk: 3 },
      { name: "Oran", lat: 35.6969, lng: -0.6331, risk: 2 },
      { name: "Constantine", lat: 36.3650, lng: 6.6147, risk: 3 },
      { name: "Ouargla", lat: 31.9500, lng: 5.3167, risk: 0 }
    ];

    wilayas.forEach(w => {
      const color = w.risk >= 3 ? "#DA3633" : w.risk >= 2 ? "#D29922" : "#2EA043";
      L.circle([w.lat, w.lng], {
        radius: 20000,
        fillColor: color,
        fillOpacity: 0.5,
        color: color,
        weight: 1.5
      }).addTo(map);
    });

    miniMapInstanceRef.current = map;

    return () => {
      if (miniMapInstanceRef.current) {
        miniMapInstanceRef.current.remove();
        miniMapInstanceRef.current = null;
      }
    };
  }, []);

  // Charts
  useEffect(() => {
    const ctxDonut = document.getElementById('zoneDonutChart');
    const ctxLine = document.getElementById('exposureTrendChart');
    let donutChart, lineChart;

    if (ctxDonut) {
      donutChart = new ChartJS(ctxDonut, {
        type: 'doughnut',
        data: {
          labels: ['Zone III', 'Zone IIb', 'Zone IIa', 'Zone I', 'Zone 0'],
          datasets: [{
            data: [30, 10, 25, 20, 15],
            backgroundColor: ['#DA3633', '#E3622A', '#D29922', '#A3A020', '#2EA043'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
          }
        }
      });
    }

    if (ctxLine) {
      lineChart = new ChartJS(ctxLine, {
        type: 'line',
        data: {
          labels: ['Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr'],
          datasets: [{
            data: monthlyData,
            borderColor: '#39D0D8',
            backgroundColor: 'rgba(57, 208, 216, 0.05)',
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: '#39D0D8',
            pointBorderColor: '#0D1117',
            pointBorderWidth: 1,
            borderWidth: 2,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => `${context.raw}B DZD`
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#8B949E', font: { size: 10 } }
            },
            y: {
              grid: { color: '#21262D' },
              ticks: {
                color: '#8B949E',
                font: { size: 10 },
                callback: (value) => `${value}B`
              }
            }
          }
        }
      });
    }

    return () => {
      if (donutChart) donutChart.destroy();
      if (lineChart) lineChart.destroy();
    };
  }, []);

  return (
    <div data-name="dashboard-page" data-file="components/Dashboard.js" className="p-6">
      <h1 className="text-[36px] font-mono font-normal leading-[1.15] mb-8">Dashboard</h1>

      {/* Top KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="card p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <i className="lucide-chart-pie text-fog text-sm"></i>
            <span className="font-sans text-sm font-bold text-fog uppercase">Total Exposure</span>
          </div>
          <div>
            <div className="font-mono text-[20px] font-medium text-pure">
              <DZDArmount value={totalExposure} />
            </div>
            <TrendArrow value={4.2} />
          </div>
        </div>

        <div className="card p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <i className="lucide-target text-fog text-sm"></i>
            <span className="font-sans text-sm font-bold text-fog uppercase">Zone III Conc.</span>
          </div>
          <div>
            <div className="font-mono text-[20px] font-medium text-red">30%</div>
            <TrendArrow value={1.5} />
          </div>
        </div>

        <div className="card p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <i className="lucide-activity text-fog text-sm"></i>
            <span className="font-sans text-sm font-bold text-fog uppercase">PML (M6.5)</span>
          </div>
          <div>
            <div className="font-mono text-[20px] font-medium text-pure">
              <DZDArmount value={pml} />
            </div>
            <TrendArrow value={-2.1} />
          </div>
        </div>

        <div className="card p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <i className="lucide-scale text-fog text-sm"></i>
            <span className="font-sans text-sm font-bold text-fog uppercase">Balance Index</span>
          </div>
          <div>
            <div className="font-mono text-[20px] font-medium text-amber">72 / 100</div>
            <span className="font-mono text-[11px] text-cloud ml-2">Needs Review</span>
          </div>
        </div>

        <div className="card p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <i className="lucide-flame text-fog text-sm"></i>
            <span className="font-sans text-sm font-bold text-fog uppercase">Active Hotspots</span>
          </div>
          <div>
            <div className="font-mono text-[20px] font-medium text-pure">
              <span className="bg-red/20 text-red px-2 py-0.5 rounded mr-2">3</span>
              Wilayas
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (60%) */}
        <div className="lg:col-span-7 flex flex-col gap-8">

          {/* Top 5 Risky Contracts */}
          <div className="card p-6">
            <h3 className="font-mono text-[18px] font-semibold mb-4">Top 5 Risky Contracts</h3>
            <div className="flex flex-col gap-2">
              {topContracts.map((contract, index) => (
                <div key={contract.id} className="flex items-center justify-between p-3 bg-graphite rounded-[6px] border border-ash hover:border-teal transition-colors group">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-2xl text-fog font-light w-6">{(index + 1).toString().padStart(2, '0')}</span>
                    <div>
                      <div className="font-sans font-semibold text-pure mb-1 group-hover:text-teal transition-colors">{contract.name}</div>
                      <div className="flex items-center gap-2">
                        <span className="font-sans text-[12px] text-cloud">{contract.wilaya}</span>
                        <ZoneBadge zone={contract.zone} />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="mb-1"><DZDArmount value={contract.value} /></div>
                    <div className="w-24 h-2 bg-ash rounded-full overflow-hidden inline-block">
                      <div className="h-full bg-red" style={{width: `${contract.risk}%`}}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigateTo('portfolio', 'portfolio.html')}
              className="w-full mt-4 text-center text-sm font-sans text-fog hover:text-teal transition-colors"
            >
              View all 10 →
            </button>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Mini-Map Preview */}
            <div className="card p-6 flex flex-col h-[260px]">
              <h3 className="font-mono text-[18px] font-semibold mb-4">Live Seismic Map</h3>
              <div
                ref={miniMapRef}
                className="flex-1 bg-graphite border border-ash rounded-[6px] overflow-hidden cursor-pointer"
                onClick={() => navigateTo('map', 'map.html')}
              ></div>
              <button
                onClick={() => navigateTo('map', 'map.html')}
                className="text-right mt-3 text-sm font-sans text-fog hover:text-teal transition-colors"
              >
                Open Full Screen Map →
              </button>
            </div>

            {/* Exposure Trend - Taille réduite pour bien tenir dans le card */}
            <div className="card p-6 flex flex-col h-[260px]">
              <h3 className="font-mono text-[18px] font-semibold mb-4">Exposure Trend</h3>
              <div className="flex-1 relative mb-3">
                <canvas id="exposureTrendChart" style={{ height: '90px', width: '100%' }}></canvas>
              </div>
              <div className="border-t border-ash pt-3">
                <div className="font-sans text-[10px] text-fog uppercase tracking-wider mb-1.5">Current vs Last Month</div>
                <div>
                  <div className="font-mono text-[22px] font-bold text-teal leading-tight">+200 000</div>
                  <div className="flex items-baseline justify-between mt-0.5">
                    <span className="font-mono text-[18px] font-bold text-teal">000 DZD</span>
                    <div className="flex items-center gap-0.5 text-green">
                      <i className="lucide-trending-up text-[10px]"></i>
                      <span className="font-mono text-[11px] font-semibold">+1.4%</span>
                      <span className="font-sans text-[9px] text-fog ml-0.5">vs last month</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (40%) */}
        <div className="lg:col-span-5 flex flex-col gap-8">

          {/* CRAAG Feed */}
          <div className="card border border-red/30 shadow-[0_0_15px_rgba(218,54,51,0.15)] relative overflow-hidden">
            <div className="h-[48px] bg-red/10 border-b border-red/30 flex items-center px-4">
              <div className="relative flex h-3 w-3 mr-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red"></span>
              </div>
              <h3 className="font-mono text-[16px] font-semibold text-red">Recent Seismic Activity</h3>
            </div>
            <div className="p-4 flex flex-col gap-3">
              {recentEvents.map(event => (
                <div key={event.id} className="bg-graphite p-3 rounded-[6px] border border-ash flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-sans font-semibold text-pure">{event.location}</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${event.mag >= 4 ? 'bg-red text-pure' : 'bg-amber text-carbon'}`}>M{event.mag.toFixed(1)}</span>
                    </div>
                    <div className="font-sans text-[12px] text-fog">{event.time}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[14px] text-cloud">{event.affected}</div>
                    <div className="font-sans text-[11px] text-fog">Affected Contracts</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Zone Distribution */}
          <div className="card p-6">
            <h3 className="font-mono text-[18px] font-semibold mb-4">Exposure by Zone</h3>
            <div className="flex items-center justify-between gap-6 h-[180px]">
              <div className="relative w-[140px] h-[140px]">
                <canvas id="zoneDonutChart" style={{ width: '140px', height: '140px' }}></canvas>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="font-mono text-[11px] text-fog">TOTAL</span>
                  <span className="font-mono text-[14px] font-bold text-pure">14.5B</span>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                {[
                  { z: 'III', c: 'bg-[#DA3633]', pct: 30 },
                  { z: 'IIb', c: 'bg-[#E3622A]', pct: 10 },
                  { z: 'IIa', c: 'bg-[#D29922]', pct: 25 },
                  { z: 'I', c: 'bg-[#A3A020]', pct: 20 },
                  { z: '0', c: 'bg-[#2EA043]', pct: 15 },
                ].map(item => (
                  <div key={item.z} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.c}`}></div>
                      <span className="font-sans text-cloud">Zone {item.z}</span>
                    </div>
                    <span className="font-mono text-pure">{item.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-5">
            <h3 className="font-mono text-[16px] font-semibold mb-3">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigateTo('pml', 'pml.html')}
                className="btn-primary w-full justify-start pl-3 group flex items-center gap-2 h-[36px] text-sm"
              >
                <i className="lucide-activity text-pure/70 group-hover:text-pure transition-colors text-xs"></i>
                Run PML Simulation
              </button>
              <button
                onClick={() => navigateTo('map', 'map.html')}
                className="h-[36px] rounded-[6px] bg-graphite border border-ash text-pure font-sans font-medium flex items-center px-3 hover:bg-ash hover:border-fog transition-colors group w-full text-sm"
              >
                <i className="lucide-map text-fog group-hover:text-pure transition-colors text-xs mr-2"></i>
                Open Full Screen Map
                <span className="ml-auto text-fog text-[11px]">→</span>
              </button>
              <button
                onClick={() => navigateTo('acaps', 'acaps.html')}
                className="h-[36px] rounded-[6px] bg-graphite border border-ash text-pure font-sans font-medium flex items-center px-3 hover:bg-ash hover:border-fog transition-colors group w-full text-sm"
              >
                <i className="lucide-file-text text-fog group-hover:text-pure transition-colors text-xs mr-2"></i>
                Generate ACAPS Report
              </button>
              <button
                onClick={() => navigateTo('underwriting', 'underwriting.html')}
                className="h-[36px] rounded-[6px] bg-graphite border border-ash text-pure font-sans font-medium flex items-center px-3 hover:bg-ash hover:border-fog transition-colors group w-full justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <i className="lucide-clipboard-list text-fog group-hover:text-pure transition-colors text-xs"></i>
                  View Underwriting Queue
                </div>
                <span className="bg-blue text-pure text-[10px] font-mono px-2 py-0.5 rounded">14</span>
              </button>
            </div>
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