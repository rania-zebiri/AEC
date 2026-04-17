// components/Portfolio.js
const { useState, useMemo } = React;

// Helper pour formater DZD
const DZDArmount = ({ value }) => {
  const formatDZD = (val) => {
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}B DZD`;
    if (val >= 1000000) return `${(val / 1000000).toFixed(0)}M DZD`;
    return `${val.toLocaleString()} DZD`;
  };
  return <span>{formatDZD(value)}</span>;
};

// Zone Badge Component
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

// Données mock
const MOCK_DATA = [
  {
    wilayaId: 16, wilayaName: 'Algiers', zone: 'III', totalValue: 8500000000, contractCount: 3,
    contracts: [
      { id: 'POL-16-001', client: 'Port of Algiers', nature: 'Industrial', type: 'Infrastructure', zone: 'III', value: 420000000, vuln: 0.8, score: 92 },
      { id: 'POL-16-002', client: 'Air Algérie HQ', nature: 'Commercial', type: 'High-rise', zone: 'III', value: 150000000, vuln: 0.6, score: 75 },
      { id: 'POL-16-003', client: 'Bab Ezzouar Complex', nature: 'Residential', type: 'Multi-family', zone: 'III', value: 95000000, vuln: 0.4, score: 55 },
    ]
  },
  {
    wilayaId: 9, wilayaName: 'Blida', zone: 'III', totalValue: 2100000000, contractCount: 2,
    contracts: [
      { id: 'POL-09-001', client: 'Sonelgaz Boufarik', nature: 'Industrial', type: 'Power Plant', zone: 'III', value: 210000000, vuln: 0.7, score: 78 },
      { id: 'POL-09-002', client: 'Club des Pins', nature: 'Commercial', type: 'Hospitality', zone: 'III', value: 85000000, vuln: 0.5, score: 62 },
    ]
  },
  {
    wilayaId: 31, wilayaName: 'Oran', zone: 'IIa', totalValue: 4200000000, contractCount: 3,
    contracts: [
      { id: 'POL-31-001', client: 'Oran Olympic Stadium', nature: 'Commercial', type: 'Sports Arena', zone: 'IIa', value: 150000000, vuln: 0.6, score: 65 },
      { id: 'POL-31-002', client: 'Renault Assembly', nature: 'Industrial', type: 'Manufacturing', zone: 'IIa', value: 310000000, vuln: 0.5, score: 58 },
      { id: 'POL-31-003', client: 'Belgaid Towers', nature: 'Residential', type: 'High-rise', zone: 'IIa', value: 120000000, vuln: 0.3, score: 40 },
    ]
  }
];

const Portfolio = () => {
  const [isPivotOpen, setIsPivotOpen] = useState(true);
  const [expandedWilayas, setExpandedWilayas] = useState(new Set([16, 9]));
  const [pivotMode, setPivotMode] = useState('dzd');

  // État des filtres
  const [filters, setFilters] = useState({
    wilaya: 'All Wilayas',
    riskNature: 'All Risk Natures',
    zone: 'All Zones'
  });

  // Données filtrées
  const [filteredData, setFilteredData] = useState(MOCK_DATA);

  const toggleWilaya = (id) => {
    const next = new Set(expandedWilayas);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedWilayas(next);
  };

  const getNatureIcon = (nature) => {
    const map = {
      'Residential': 'home',
      'Commercial': 'building-2',
      'Industrial': 'factory'
    };
    return map[nature] || 'file';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-red';
    if (score >= 60) return 'text-amber';
    return 'text-green';
  };

  const getZoneColorClass = (zone) => {
    const map = {
      '0': 'bg-zone-0',
      'I': 'bg-zone-1',
      'IIa': 'bg-zone-2',
      'IIb': 'bg-zone-3',
      'III': 'bg-zone-4'
    };
    return map[zone] || 'bg-zone-0';
  };

  // Fonction Apply filters
  const applyFilters = () => {
    let filtered = [...MOCK_DATA];

    if (filters.wilaya !== 'All Wilayas') {
      const wilayaId = parseInt(filters.wilaya.split(' - ')[0]);
      filtered = filtered.filter(w => w.wilayaId === wilayaId);
    }

    if (filters.riskNature !== 'All Risk Natures') {
      filtered = filtered.map(wilaya => ({
        ...wilaya,
        contracts: wilaya.contracts.filter(c => c.nature === filters.riskNature),
        totalValue: wilaya.contracts.filter(c => c.nature === filters.riskNature).reduce((sum, c) => sum + c.value, 0)
      })).filter(w => w.contracts.length > 0);
    }

    if (filters.zone !== 'All Zones') {
      const zoneCode = filters.zone.replace('Zone ', '');
      filtered = filtered.map(wilaya => ({
        ...wilaya,
        contracts: wilaya.contracts.filter(c => c.zone === zoneCode),
        totalValue: wilaya.contracts.filter(c => c.zone === zoneCode).reduce((sum, c) => sum + c.value, 0)
      })).filter(w => w.contracts.length > 0);
    }

    setFilteredData(filtered);
  };

  // Fonction Reset filters
  const resetFilters = () => {
    setFilters({
      wilaya: 'All Wilayas',
      riskNature: 'All Risk Natures',
      zone: 'All Zones'
    });
    setFilteredData(MOCK_DATA);
  };

  // Fonction Export CSV
  const exportCSV = () => {
    let csvContent = "Contract ID,Client,Wilaya,Zone,Nature,Type,Insured Capital (DZD),Vulnerability Factor,Risk Score\n";

    filteredData.forEach(wilaya => {
      wilaya.contracts.forEach(contract => {
        csvContent += `${contract.id},${contract.client},${wilaya.wilayaName},${contract.zone},${contract.nature},${contract.type},${contract.value},${contract.vuln},${contract.score}\n`;
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'portfolio_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pivotData = useMemo(() => {
    const matrix = {};
    let maxValue = 0;

    filteredData.forEach(w => {
      matrix[w.wilayaName] = { Residential: 0, Commercial: 0, Industrial: 0, _total: 0 };
      w.contracts.forEach(c => {
        const val = pivotMode === 'dzd' ? c.value : 1;
        matrix[w.wilayaName][c.nature] += val;
        matrix[w.wilayaName]._total += val;
        if (matrix[w.wilayaName][c.nature] > maxValue) {
          maxValue = matrix[w.wilayaName][c.nature];
        }
      });
    });
    return { matrix, maxValue };
  }, [pivotMode, filteredData]);

  const totalExposure = filteredData.reduce((sum, w) => sum + w.totalValue, 0);
  const totalContracts = filteredData.reduce((sum, w) => sum + w.contracts.length, 0);
  const zone3Share = filteredData.filter(w => w.zone === 'III').length > 0 ? 38 : 25;

  return (
    <div className="h-[calc(100vh-56px)] flex bg-slate overflow-hidden">

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Filter Bar */}
        <div className="bg-carbon border-b border-ash px-6 py-4 z-10 shrink-0">

          {/* Ligne 1: Titre FILTERS */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <i className="lucide-sliders-horizontal text-fog text-sm"></i>
              <span className="font-mono text-sm uppercase tracking-wide font-semibold text-pure">FILTERS</span>
            </div>
            <div className="text-right">
              <div className="font-sans text-xs text-fog">Total Exposure</div>
              <div className="font-mono text-lg font-semibold text-teal"><DZDArmount value={totalExposure} /></div>
            </div>
          </div>

          {/* Ligne 2: 3 selects */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <select
                value={filters.wilaya}
                onChange={(e) => setFilters({...filters, wilaya: e.target.value})}
                className="input-field w-full h-9 text-sm cursor-pointer"
              >
                <option>All Wilayas</option>
                <option>16 - Algiers</option>
                <option>09 - Blida</option>
                <option>31 - Oran</option>
              </select>
            </div>
            <div>
              <select
                value={filters.riskNature}
                onChange={(e) => setFilters({...filters, riskNature: e.target.value})}
                className="input-field w-full h-9 text-sm cursor-pointer"
              >
                <option>All Risk Natures</option>
                <option>Residential</option>
                <option>Commercial</option>
                <option>Industrial</option>
              </select>
            </div>
            <div>
              <select
                value={filters.zone}
                onChange={(e) => setFilters({...filters, zone: e.target.value})}
                className="input-field w-full h-9 text-sm cursor-pointer"
              >
                <option>All Zones</option>
                <option>Zone III</option>
                <option>Zone IIb</option>
                <option>Zone IIa</option>
                <option>Zone I</option>
                <option>Zone 0</option>
              </select>
            </div>
          </div>

          {/* Ligne 3: Apply / Reset + Stats */}
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <button
                onClick={applyFilters}
                className="h-[34px] px-5 bg-blue hover:bg-opacity-90 text-pure font-sans text-sm font-semibold rounded-[6px] transition-colors"
              >
                Apply
              </button>
              <button
                onClick={resetFilters}
                className="h-[34px] px-5 bg-graphite border border-ash hover:bg-ash text-cloud hover:text-pure font-sans text-sm font-medium rounded-[6px] transition-colors"
              >
                Reset
              </button>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="font-sans text-xs text-fog">contracts</div>
                <div className="font-mono text-base font-semibold text-pure">{totalContracts}</div>
              </div>
              <div className="text-right">
                <div className="font-sans text-xs text-fog">total</div>
                <div className="font-mono text-base font-semibold text-pure"><DZDArmount value={totalExposure} /></div>
              </div>
              {!isPivotOpen && (
                <button
                  onClick={() => setIsPivotOpen(true)}
                  className="h-[34px] px-3 border border-ash rounded-[6px] text-fog hover:text-pure hover:border-fog flex items-center gap-2 text-sm transition-colors"
                >
                  <i className="lucide-panel-right text-sm"></i>
                  Heatmap
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 p-6 pb-0">
          <div className="card p-4">
            <div className="font-sans text-xs font-bold text-fog uppercase tracking-wider mb-1">TOTAL FILTERED EXPOSURE</div>
            <div className="font-mono text-2xl font-semibold text-pure"><DZDArmount value={totalExposure} /></div>
          </div>
          <div className="card p-4">
            <div className="font-sans text-xs font-bold text-fog uppercase tracking-wider mb-1">SEGMENT COUNT</div>
            <div className="font-mono text-2xl font-semibold text-pure">{totalContracts} <span className="text-sm text-fog font-sans font-normal ml-1">contracts</span></div>
          </div>
          <div className="card p-4">
            <div className="font-sans text-xs font-bold text-fog uppercase tracking-wider mb-1">ZONE III SHARE</div>
            <div className="flex items-center gap-3">
              <div className="font-mono text-2xl font-semibold text-red">{zone3Share}%</div>
              <div className="h-2 flex-1 bg-carbon rounded-full overflow-hidden">
                <div className="h-full bg-red w-[38%] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Toggle DZD/Count */}
        <div className="flex justify-end px-6 pt-4">
          <div className="flex bg-graphite rounded-md p-0.5 border border-ash">
            <button
              onClick={() => setPivotMode('dzd')}
              className={`px-4 py-1.5 text-xs font-mono font-semibold rounded transition-all ${pivotMode === 'dzd' ? 'bg-blue text-pure shadow-sm' : 'text-fog hover:text-cloud'}`}
            >
              Show DZD
            </button>
            <button
              onClick={() => setPivotMode('count')}
              className={`px-4 py-1.5 text-xs font-mono font-semibold rounded transition-all ${pivotMode === 'count' ? 'bg-blue text-pure shadow-sm' : 'text-fog hover:text-cloud'}`}
            >
              Show Count
            </button>
          </div>
        </div>

        {/* Data Table avec scroll */}
        <div className="flex-1 overflow-y-auto p-6 pt-4 min-h-0">
          <div className="card overflow-hidden">
            {filteredData.length === 0 ? (
              <div className="text-center py-12">
                <i className="lucide-inbox text-fog text-4xl mb-3 block"></i>
                <p className="text-fog">No contracts match your filters</p>
                <button onClick={resetFilters} className="text-teal text-sm mt-2 hover:underline">Reset filters</button>
              </div>
            ) : (
              filteredData.map((wilaya) => {
                const isExpanded = expandedWilayas.has(wilaya.wilayaId);

                return (
                  <div key={wilaya.wilayaId} className="border-b border-ash last:border-0">
                    {/* Group Header */}
                    <div
                      className="h-[48px] bg-graphite flex items-center px-4 cursor-pointer hover:bg-ash/50 transition-colors relative select-none"
                      onClick={() => toggleWilaya(wilaya.wilayaId)}
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${getZoneColorClass(wilaya.zone)}`}></div>

                      <i className={`lucide-chevron-${isExpanded ? 'down' : 'right'} text-fog mr-3 transition-transform text-sm`}></i>

                      <div className="flex-1 flex items-center gap-4">
                        <span className="font-mono text-pure font-medium w-32">{wilaya.wilayaId.toString().padStart(2, '0')} - {wilaya.wilayaName}</span>
                        <ZoneBadge zone={wilaya.zone} />
                      </div>

                      <div className="flex items-center gap-8 text-right">
                        <div className="font-sans text-sm text-fog">{wilaya.contracts.length} contracts</div>
                        <div className="font-mono text-sm text-pure w-32"><DZDArmount value={wilaya.totalValue} /></div>
                      </div>
                    </div>

                    {/* Expanded Rows */}
                    {isExpanded && (
                      <div className="bg-slate overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                          <thead className="bg-carbon/50 border-b border-ash sticky top-0">
                            <tr>
                              <th className="px-6 py-2 font-sans text-xs font-semibold text-fog">Contract ID</th>
                              <th className="px-4 py-2 font-sans text-xs font-semibold text-fog">Client / Asset Name</th>
                              <th className="px-4 py-2 font-sans text-xs font-semibold text-fog">Risk Nature</th>
                              <th className="px-4 py-2 font-sans text-xs font-semibold text-fog">Type</th>
                              <th className="px-4 py-2 font-sans text-xs font-semibold text-fog text-right">Insured Capital (DZD)</th>
                              <th className="px-4 py-2 font-sans text-xs font-semibold text-fog text-center">Vuln. Factor</th>
                              <th className="px-4 py-2 font-sans text-xs font-semibold text-fog text-right">Risk Score</th>
                              <th className="px-4 py-2"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-ash/50">
                            {wilaya.contracts.map(contract => (
                              <tr key={contract.id} className="hover:bg-carbon/30 transition-colors group">
                                <td className="px-6 py-3 font-mono text-xs text-fog">{contract.id}</td>
                                <td className="px-4 py-3 font-sans text-sm text-pure font-medium group-hover:text-teal transition-colors">{contract.client}</td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center text-cloud text-sm font-sans">
                                    <i className={`lucide-${getNatureIcon(contract.nature)} mr-2 text-fog text-xs`}></i>
                                    {contract.nature}
                                  </div>
                                </td>
                                <td className="px-4 py-3 font-sans text-sm text-fog">{contract.type}</td>
                                <td className="px-4 py-3 font-mono text-sm text-cloud text-right"><DZDArmount value={contract.value} /></td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-center gap-2">
                                    <span className="font-mono text-xs text-fog w-6 text-right">{contract.vuln.toFixed(1)}</span>
                                    <div className="w-16 h-1.5 bg-graphite rounded-full overflow-hidden">
                                      <div className="h-full bg-amber" style={{ width: `${contract.vuln * 100}%` }}></div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 font-mono text-sm font-bold text-right">
                                  <span className={getScoreColor(contract.score)}>{contract.score}</span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <button className="text-fog hover:text-pure transition-colors p-1">
                                    <i className="lucide-more-horizontal text-sm"></i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Bottom Summary Bar avec Export CSV fonctionnel */}
        <div className="h-12 bg-carbon border-t border-ash flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-6">
            <div className="font-sans text-sm text-fog">Grand Total: <span className="font-mono text-pure ml-2"><DZDArmount value={totalExposure} /></span></div>
            <div className="w-px h-4 bg-ash"></div>
            <div className="font-sans text-sm text-fog">Wilayas: <span className="text-pure font-mono ml-1">{filteredData.length}</span></div>
            <div className="w-px h-4 bg-ash"></div>
            <div className="font-sans text-sm text-fog">Highest Risk: <span className="text-red font-semibold ml-1">
              {filteredData.length > 0 ? filteredData.reduce((max, w) => Math.max(max, Math.max(...w.contracts.map(c => c.score))), 0) >= 80 ? 'Algiers' : 'Oran' : '-'}
            </span></div>
          </div>
          <button
            onClick={exportCSV}
            className="h-[28px] px-3 bg-graphite border border-ash hover:bg-ash hover:text-pure rounded-[4px] text-xs font-sans font-medium text-cloud flex items-center gap-1.5 transition-colors"
          >
            <i className="lucide-download text-[12px]"></i>
            Export CSV
          </button>
        </div>

      </div>

      {/* Right Pivot Panel */}
      <div className={`w-[320px] bg-carbon border-l border-ash flex flex-col shrink-0 transition-all duration-300 ${isPivotOpen ? 'translate-x-0' : 'translate-x-full hidden'}`}>
        <div className="h-14 border-b border-ash flex items-center justify-between px-4 shrink-0">
          <h2 className="font-mono text-sm font-semibold text-pure uppercase tracking-wide">Capital Heatmap</h2>
          <button onClick={() => setIsPivotOpen(false)} className="text-fog hover:text-pure p-1 rounded transition-colors">
            <i className="lucide-panel-right-close text-lg"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr>
                <th className="py-2 font-mono text-fog font-medium">Wilaya</th>
                <th className="py-2 text-center font-sans text-fog font-medium"><i className="lucide-home mx-auto text-sm"></i></th>
                <th className="py-2 text-center font-sans text-fog font-medium"><i className="lucide-building-2 mx-auto text-sm"></i></th>
                <th className="py-2 text-center font-sans text-fog font-medium"><i className="lucide-factory mx-auto text-sm"></i></th>
              </tr>
            </thead>
            <tbody className="font-mono text-cloud">
              {Object.entries(pivotData.matrix).map(([wilaya, cols]) => (
                <tr key={wilaya} className="border-t border-ash/50">
                  <td className="py-3 pr-2 truncate max-w-[80px]" title={wilaya}>{wilaya}</td>
                  {['Residential', 'Commercial', 'Industrial'].map(nature => {
                    const val = cols[nature];
                    const intensity = pivotData.maxValue > 0 ? val / pivotData.maxValue : 0;
                    const displayVal = val === 0 ? '-' : (pivotMode === 'dzd' ? (val / 1000000000).toFixed(1) + 'B' : val);
                    return (
                      <td key={nature} className="p-1">
                        <div className="w-full h-8 flex items-center justify-center rounded-[4px] transition-colors"
                          style={{
                            backgroundColor: val > 0 ? `rgba(218, 54, 51, ${Math.max(0.1, intensity * 0.8)})` : 'transparent',
                            color: intensity > 0.5 ? '#fff' : '#C9D1D9',
                            border: val === 0 ? '1px dashed #30363D' : 'none'
                          }}>
                          {displayVal}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 pt-4 border-t border-ash">
            <div className="font-sans text-xs text-fog mb-2">Color Intensity Scale</div>
            <div className="h-2 w-full rounded-full bg-gradient-to-r from-[rgba(218,54,51,0.1)] to-[rgba(218,54,51,0.8)]"></div>
            <div className="flex justify-between mt-1 font-mono text-[10px] text-fog">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};