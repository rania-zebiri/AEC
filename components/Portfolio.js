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
    const [isPivotOpen, setIsPivotOpen] = React.useState(true);
    const [expandedWilayas, setExpandedWilayas] = React.useState(new Set([16, 9]));
    const [pivotMode, setPivotMode] = React.useState('dzd'); // 'dzd' or 'count'

    const toggleWilaya = (id) => {
        const next = new Set(expandedWilayas);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedWilayas(next);
    };

    const getNatureIcon = (nature) => {
        const map = {
            'Residential': 'house',
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
        const map = { '0': 'bg-zone-0', 'I': 'bg-zone-1', 'IIa': 'bg-zone-2', 'IIb': 'bg-zone-3', 'III': 'bg-zone-4' };
        return map[zone] || 'bg-zone-0';
    };

    // Calculate Matrix for Pivot
    const pivotData = React.useMemo(() => {
        const matrix = {};
        let maxValue = 0;
        
        MOCK_DATA.forEach(w => {
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
    }, [pivotMode]);

    return (
        <div className="relative h-[calc(100vh-56px)] -mx-8 -my-8 flex bg-slate overflow-hidden" data-name="portfolio-page" data-file="components/Portfolio.js">
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                
                {/* Sticky Top Filter Bar */}
                <div className="h-16 bg-carbon border-b border-ash flex items-center justify-between px-6 z-10 shrink-0">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center text-fog mr-2">
                            <div className="icon-list-filter text-lg mr-2"></div>
                            <span className="font-mono text-sm uppercase tracking-wide font-semibold text-pure">Filters</span>
                        </div>
                        
                        <div className="relative w-48">
                            <select className="input-field appearance-none cursor-pointer">
                                <option value="">All Wilayas</option>
                                <option value="16">16 - Algiers</option>
                                <option value="09">09 - Blida</option>
                                <option value="31">31 - Oran</option>
                            </select>
                            <div className="icon-chevron-down absolute right-3 top-2.5 text-fog pointer-events-none text-sm"></div>
                        </div>

                        <div className="relative w-48">
                            <select className="input-field appearance-none cursor-pointer">
                                <option value="">All Risk Natures</option>
                                <option value="Residential">Residential</option>
                                <option value="Commercial">Commercial</option>
                                <option value="Industrial">Industrial</option>
                            </select>
                            <div className="icon-chevron-down absolute right-3 top-2.5 text-fog pointer-events-none text-sm"></div>
                        </div>

                        <div className="relative w-48">
                            <select className="input-field appearance-none cursor-pointer">
                                <option value="">All Zones</option>
                                <option value="III">Zone III</option>
                                <option value="IIb">Zone IIb</option>
                                <option value="IIa">Zone IIa</option>
                            </select>
                            <div className="icon-chevron-down absolute right-3 top-2.5 text-fog pointer-events-none text-sm"></div>
                        </div>

                        <button className="h-[36px] px-4 bg-blue hover:bg-opacity-90 text-pure font-sans text-sm font-semibold rounded-[6px] transition-colors ml-2">
                            Apply
                        </button>
                        <button className="h-[36px] px-4 text-fog hover:text-pure font-sans text-sm transition-colors">
                            Reset
                        </button>
                    </div>

                    <div className="text-right">
                        <div className="font-sans text-sm text-cloud"><span className="text-pure font-semibold">142</span> contracts</div>
                        <div className="font-mono text-xs text-fog">28.4B DZD total</div>
                    </div>
                    
                    {/* Toggle Pivot Button (if closed) */}
                    {!isPivotOpen && (
                        <button 
                            onClick={() => setIsPivotOpen(true)}
                            className="ml-6 h-[36px] px-3 border border-ash rounded-[6px] text-fog hover:text-pure hover:border-fog flex items-center transition-colors"
                        >
                            <div className="icon-panel-right mr-2"></div>
                            Heatmap
                        </button>
                    )}
                </div>

                {/* Scrollable Center */}
                <div className="flex-1 overflow-auto p-6 space-y-6">
                    
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="card p-5">
                            <div className="font-sans text-sm font-bold text-fog uppercase mb-1">Total Filtered Exposure</div>
                            <div className="font-mono text-[24px] font-medium text-pure"><DZDArmount value={14800000000} /></div>
                        </div>
                        <div className="card p-5">
                            <div className="font-sans text-sm font-bold text-fog uppercase mb-1">Segment Count</div>
                            <div className="font-mono text-[24px] font-medium text-pure">142 <span className="text-sm text-fog font-sans font-normal ml-1">contracts</span></div>
                        </div>
                        <div className="card p-5">
                            <div className="font-sans text-sm font-bold text-fog uppercase mb-1">Zone III Share</div>
                            <div className="flex items-center gap-3">
                                <div className="font-mono text-[24px] font-medium text-red">38%</div>
                                <div className="h-2 flex-1 bg-carbon rounded-full overflow-hidden">
                                    <div className="h-full bg-red w-[38%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="card overflow-hidden">
                        {MOCK_DATA.map((wilaya) => {
                            const isExpanded = expandedWilayas.has(wilaya.wilayaId);
                            
                            return (
                                <div key={wilaya.wilayaId} className="border-b border-ash last:border-0">
                                    {/* Group Header */}
                                    <div 
                                        className="h-[48px] bg-graphite flex items-center px-4 cursor-pointer hover:bg-ash/50 transition-colors relative select-none"
                                        onClick={() => toggleWilaya(wilaya.wilayaId)}
                                    >
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${getZoneColorClass(wilaya.zone)}`}></div>
                                        
                                        <div className={`icon-chevron-${isExpanded ? 'down' : 'right'} text-fog mr-3 transition-transform`}></div>
                                        
                                        <div className="flex-1 flex items-center gap-4">
                                            <span className="font-mono text-pure font-medium w-32">{wilaya.wilayaId.toString().padStart(2,'0')} - {wilaya.wilayaName}</span>
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
                                                <thead className="bg-carbon/50 border-b border-ash">
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
                                                                    <div className={`icon-${getNatureIcon(contract.nature)} mr-2 text-fog`}></div>
                                                                    {contract.nature}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 font-sans text-sm text-fog">{contract.type}</td>
                                                            <td className="px-4 py-3 font-mono text-sm text-cloud text-right"><DZDArmount value={contract.value} /></td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <span className="font-mono text-xs text-fog w-6 text-right">{contract.vuln.toFixed(1)}</span>
                                                                    <div className="w-16 h-1.5 bg-graphite rounded-full overflow-hidden">
                                                                        <div className="h-full bg-amber" style={{width: `${contract.vuln * 100}%`}}></div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 font-mono text-sm font-bold text-right">
                                                                <span className={getScoreColor(contract.score)}>{contract.score}</span>
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                <button className="text-fog hover:text-pure transition-colors p-1">
                                                                    <div className="icon-ellipsis"></div>
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
                        })}
                    </div>
                    
                </div>

                {/* Sticky Bottom Summary Bar */}
                <div className="h-12 bg-carbon border-t border-ash flex items-center justify-between px-6 z-10 shrink-0">
                    <div className="flex items-center gap-8">
                        <div className="font-sans text-sm text-fog">Grand Total: <span className="font-mono text-pure ml-2 text-[15px]"><DZDArmount value={14800000000} /></span></div>
                        <div className="w-px h-4 bg-ash"></div>
                        <div className="font-sans text-sm text-fog">Wilayas: <span className="text-pure font-mono ml-1">3</span></div>
                        <div className="w-px h-4 bg-ash"></div>
                        <div className="font-sans text-sm text-fog">Highest Risk: <span className="text-red font-semibold ml-1">Algiers</span></div>
                    </div>
                    <button className="h-[28px] px-3 bg-graphite border border-ash hover:bg-ash hover:text-pure rounded-[4px] text-xs font-sans font-medium text-cloud flex items-center transition-colors">
                        <div className="icon-download mr-2 text-[14px]"></div>
                        Export CSV
                    </button>
                </div>

            </div>

            {/* Right Pivot Panel (Collapsible) */}
            <div className={`w-[320px] bg-carbon border-l border-ash flex flex-col shrink-0 transition-all duration-300 transform origin-right ${isPivotOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 absolute right-0 top-0 bottom-0 pointer-events-none'}`}>
                
                <div className="h-16 border-b border-ash flex items-center justify-between px-4 shrink-0">
                    <h2 className="font-mono text-sm font-semibold text-pure uppercase tracking-wide">Capital Heatmap</h2>
                    <button onClick={() => setIsPivotOpen(false)} className="text-fog hover:text-pure p-1 rounded transition-colors">
                        <div className="icon-panel-right-close text-lg"></div>
                    </button>
                </div>
                
                <div className="p-4 border-b border-ash bg-graphite shrink-0">
                    <div className="flex bg-carbon rounded-[4px] p-1 border border-ash">
                        <button 
                            onClick={() => setPivotMode('dzd')}
                            className={`flex-1 py-1 text-xs font-sans font-semibold rounded-[2px] transition-colors ${pivotMode === 'dzd' ? 'bg-ash text-pure shadow-sm' : 'text-fog hover:text-cloud'}`}
                        >
                            Show DZD
                        </button>
                        <button 
                            onClick={() => setPivotMode('count')}
                            className={`flex-1 py-1 text-xs font-sans font-semibold rounded-[2px] transition-colors ${pivotMode === 'count' ? 'bg-ash text-pure shadow-sm' : 'text-fog hover:text-cloud'}`}
                        >
                            Show Count
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr>
                                <th className="py-2 font-mono text-fog font-medium">Wilaya</th>
                                <th className="py-2 text-center font-sans text-fog font-medium" title="Residential"><div className="icon-house mx-auto text-sm"></div></th>
                                <th className="py-2 text-center font-sans text-fog font-medium" title="Commercial"><div className="icon-building-2 mx-auto text-sm"></div></th>
                                <th className="py-2 text-center font-sans text-fog font-medium" title="Industrial"><div className="icon-factory mx-auto text-sm"></div></th>
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
                                                <div 
                                                    className="w-full h-8 flex items-center justify-center rounded-[4px] transition-colors"
                                                    style={{
                                                        backgroundColor: val > 0 ? `rgba(218, 54, 51, ${Math.max(0.1, intensity * 0.8)})` : 'transparent',
                                                        color: intensity > 0.5 ? '#fff' : '#C9D1D9',
                                                        border: val === 0 ? '1px dashed #30363D' : 'none'
                                                    }}
                                                >
                                                    {displayVal}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    <div className="mt-8 pt-4 border-t border-ash">
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