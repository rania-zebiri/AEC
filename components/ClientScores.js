const MOCK_CLIENTS = [
    {
        id: 'POL-16-001', name: 'Port of Algiers', wilaya: '16 - Algiers', zone: 'III',
        nature: 'Industrial', buildingType: 'Infrastructure', capital: 420000000,
        score: 92, trend: 5, lastReview: '2025-04-10',
        components: { loc: 40, bldg: 25, prev: 15, val: 12 },
        history: [75, 87, 92],
        recommendation: 'Consider rejection or heavy reinsurance. High concentration in Zone III.',
        premiumChange: '+18%'
    },
    {
        id: 'POL-09-001', name: 'Sonelgaz Boufarik', wilaya: '09 - Blida', zone: 'III',
        nature: 'Industrial', buildingType: 'Power Plant', capital: 210000000,
        score: 78, trend: -2, lastReview: '2025-06-22',
        components: { loc: 40, bldg: 18, prev: 5, val: 15 },
        history: [85, 80, 78],
        recommendation: 'Renew with premium increase. Improving preventive measures noted.',
        premiumChange: '+5%'
    },
    {
        id: 'POL-31-001', name: 'Oran Olympic Stadium', wilaya: '31 - Oran', zone: 'IIa',
        nature: 'Commercial', buildingType: 'Sports Arena', capital: 150000000,
        score: 55, trend: 0, lastReview: '2025-11-05',
        components: { loc: 20, bldg: 15, prev: 10, val: 10 },
        history: [55, 55, 55],
        recommendation: 'Renew standard. Stable risk profile.',
        premiumChange: '0%'
    },
    {
        id: 'POL-16-003', name: 'Bab Ezzouar Complex', wilaya: '16 - Algiers', zone: 'III',
        nature: 'Residential', buildingType: 'Multi-family', capital: 95000000,
        score: 45, trend: -12, lastReview: '2026-01-12',
        components: { loc: 40, bldg: -5, prev: 0, val: 10 },
        history: [62, 57, 45],
        recommendation: 'Renew standard. Recent seismic retrofitting significantly reduced vulnerability.',
        premiumChange: '-4%'
    },
    {
        id: 'POL-01-002', name: 'Adrar Solar Farm', wilaya: '01 - Adrar', zone: '0',
        nature: 'Industrial', buildingType: 'Infrastructure', capital: 85000000,
        score: 15, trend: 1, lastReview: '2026-02-28',
        components: { loc: 0, bldg: 5, prev: 5, val: 5 },
        history: [14, 14, 15],
        recommendation: 'Renew standard. Negligible seismic risk.',
        premiumChange: '0%'
    },
    {
        id: 'POL-42-011', name: 'Tipaza Coastal Resort', wilaya: '42 - Tipaza', zone: 'III',
        nature: 'Commercial', buildingType: 'Hospitality', capital: 180000000,
        score: 82, trend: 8, lastReview: '2025-08-14',
        components: { loc: 40, bldg: 20, prev: 12, val: 10 },
        history: [65, 74, 82],
        recommendation: 'Renew with premium increase. Aging structure in high-risk zone.',
        premiumChange: '+12%'
    }
];

const ClientScores = () => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedZone, setSelectedZone] = React.useState('');
    const [selectedNature, setSelectedNature] = React.useState('');
    const [scoreRange, setScoreRange] = React.useState(100);
    const [sortBy, setSortBy] = React.useState('score_desc');
    const [selectedClient, setSelectedClient] = React.useState(null);

    const getScoreColor = (score) => {
        if (score > 60) return { bg: 'bg-red/10', border: 'border-red', text: 'text-red' };
        if (score >= 30) return { bg: 'bg-amber/10', border: 'border-amber', text: 'text-amber' };
        return { bg: 'bg-green/10', border: 'border-green', text: 'text-green' };
    };

    const getTrendDisplay = (trend) => {
        if (trend === 0) return <span className="text-fog font-mono flex items-center gap-1"><div className="icon-minus"></div> 0</span>;
        if (trend > 0) return <span className="text-red font-mono flex items-center gap-1"><div className="icon-trending-up"></div> +{trend}</span>;
        return <span className="text-green font-mono flex items-center gap-1"><div className="icon-trending-down"></div> {trend}</span>;
    };

    const filteredClients = React.useMemo(() => {
        return MOCK_CLIENTS.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  c.wilaya.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesZone = selectedZone ? c.zone === selectedZone : true;
            const matchesNature = selectedNature ? c.nature === selectedNature : true;
            const matchesScore = c.score <= scoreRange;
            return matchesSearch && matchesZone && matchesNature && matchesScore;
        }).sort((a, b) => {
            if (sortBy === 'score_desc') return b.score - a.score;
            if (sortBy === 'score_asc') return a.score - b.score;
            if (sortBy === 'capital_desc') return b.capital - a.capital;
            if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
            return 0;
        });
    }, [searchTerm, selectedZone, selectedNature, scoreRange, sortBy]);

    return (
        <div className="relative min-h-[calc(100vh-56px)] -mx-8 -my-8 bg-slate overflow-hidden flex" data-name="client-scores-page" data-file="components/ClientScores.js">
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                
                {/* Header / Search Section */}
                <div className="p-8 border-b border-ash bg-carbon shrink-0">
                    <div className="max-w-[800px] mx-auto text-center mb-8">
                        <h1 className="text-[32px] font-mono font-medium leading-none text-pure mb-3">Client Risk Scores</h1>
                        <p className="font-sans text-fog mb-8">Evaluate exposure and vulnerability at the individual contract level.</p>
                        
                        <div className="relative max-w-[600px] mx-auto shadow-card-hover rounded-[8px]">
                            <div className="icon-search absolute left-4 top-4 text-fog text-xl"></div>
                            <input 
                                type="text" 
                                className="w-full bg-graphite border-2 border-ash focus:border-teal rounded-[8px] h-[56px] pl-12 pr-4 text-pure font-sans text-lg outline-none transition-colors placeholder-fog"
                                placeholder="Search by client name, ID, or wilaya..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Filter Strip */}
                    <div className="max-w-[1000px] mx-auto flex flex-wrap items-end justify-between gap-4 bg-graphite p-4 rounded-[8px] border border-ash">
                        <div className="flex items-center gap-4 flex-1">
                            <div>
                                <label className="block font-sans text-[11px] font-semibold uppercase text-fog mb-1">Zone</label>
                                <select className="input-field w-[120px]" value={selectedZone} onChange={e => setSelectedZone(e.target.value)}>
                                    <option value="">All Zones</option>
                                    <option value="III">Zone III</option>
                                    <option value="IIb">Zone IIb</option>
                                    <option value="IIa">Zone IIa</option>
                                    <option value="I">Zone I</option>
                                    <option value="0">Zone 0</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-sans text-[11px] font-semibold uppercase text-fog mb-1">Risk Nature</label>
                                <select className="input-field w-[140px]" value={selectedNature} onChange={e => setSelectedNature(e.target.value)}>
                                    <option value="">All Natures</option>
                                    <option value="Residential">Residential</option>
                                    <option value="Commercial">Commercial</option>
                                    <option value="Industrial">Industrial</option>
                                </select>
                            </div>
                            <div className="flex-1 min-w-[150px] max-w-[200px]">
                                <label className="flex justify-between font-sans text-[11px] font-semibold uppercase text-fog mb-1">
                                    <span>Max Score</span>
                                    <span className="text-pure">{scoreRange}</span>
                                </label>
                                <input type="range" min="0" max="100" value={scoreRange} onChange={e => setScoreRange(e.target.value)} className="mt-2" />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block font-sans text-[11px] font-semibold uppercase text-fog mb-1">Sort By</label>
                            <select className="input-field w-[160px]" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                                <option value="score_desc">Score (High to Low)</option>
                                <option value="score_asc">Score (Low to High)</option>
                                <option value="capital_desc">Capital (Highest)</option>
                                <option value="name_asc">Name (A-Z)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results List */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate">
                    <div className="max-w-[1000px] mx-auto space-y-4">
                        <div className="font-sans text-sm text-fog mb-2">{filteredClients.length} results found</div>
                        
                        {filteredClients.map(client => {
                            const colors = getScoreColor(client.score);
                            
                            return (
                                <div key={client.id} className="card p-4 flex items-center gap-6 hover:bg-graphite/50 transition-colors">
                                    
                                    {/* Score Circle */}
                                    <div className={`shrink-0 w-16 h-16 rounded-full border-4 flex flex-col items-center justify-center ${colors.bg} ${colors.border}`}>
                                        <span className={`font-mono text-xl font-bold leading-none ${colors.text}`}>{client.score}</span>
                                    </div>
                                    
                                    {/* Core Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1.5">
                                            <h3 className="font-sans text-lg font-bold text-pure truncate">{client.name}</h3>
                                            <span className="font-mono text-[11px] text-fog px-2 py-0.5 bg-carbon rounded border border-ash">{client.id}</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="icon-map-pin text-fog text-[14px]"></div>
                                                <span className="font-sans text-cloud">{client.wilaya}</span>
                                                <ZoneBadge zone={client.zone} />
                                            </div>
                                            <div className="w-1 h-1 rounded-full bg-ash"></div>
                                            <div className="font-sans text-cloud flex items-center gap-1.5">
                                                <div className={`icon-${client.nature === 'Residential' ? 'house' : client.nature === 'Commercial' ? 'building-2' : 'factory'} text-fog text-[14px]`}></div>
                                                {client.nature} ({client.buildingType})
                                            </div>
                                            <div className="w-1 h-1 rounded-full bg-ash"></div>
                                            <div className="font-mono text-pure">
                                                <DZDArmount value={client.capital} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action & Trend */}
                                    <div className="shrink-0 flex flex-col items-end gap-3 w-[120px]">
                                        <div className="text-[12px] text-fog flex items-center gap-2">
                                            Trend: {getTrendDisplay(client.trend)}
                                        </div>
                                        <button 
                                            className="w-full btn-outline h-[32px] text-sm hover:border-teal hover:text-teal"
                                            onClick={() => setSelectedClient(client)}
                                        >
                                            View Profile
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        
                        {filteredClients.length === 0 && (
                            <div className="text-center py-12 bg-carbon/50 rounded-[8px] border-2 border-dashed border-ash">
                                <div className="icon-search text-4xl text-fog opacity-50 mb-3"></div>
                                <p className="font-sans text-cloud">No clients match the current search or filters.</p>
                                <button className="mt-4 text-teal hover:underline text-sm font-sans" onClick={() => {setSearchTerm(''); setScoreRange(100); setSelectedZone(''); setSelectedNature('');}}>Clear Filters</button>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Slide-in Detail Panel */}
            <div className={`absolute top-0 right-0 w-[480px] h-full bg-carbon border-l border-ash shadow-modal transition-transform duration-300 ease-in-out z-30 flex flex-col ${selectedClient ? 'translate-x-0' : 'translate-x-full'}`}>
                
                {selectedClient && (
                    <>
                        <div className="p-6 border-b border-ash bg-graphite flex items-start justify-between shrink-0">
                            <div>
                                <h2 className="font-mono text-[22px] font-semibold text-pure mb-1">{selectedClient.name}</h2>
                                <div className="flex items-center gap-3 font-sans text-sm text-fog">
                                    <span className="font-mono">{selectedClient.id}</span>
                                    <span>•</span>
                                    <span>Last Review: {selectedClient.lastReview}</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedClient(null)} className="p-2 rounded bg-carbon hover:bg-ash text-fog hover:text-pure transition-colors">
                                <div className="icon-x text-lg"></div>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            
                            {/* Score Breakdown */}
                            <div>
                                <h3 className="font-sans text-[12px] font-semibold uppercase text-fog tracking-wider mb-4">Risk Score Breakdown</h3>
                                
                                <div className="flex items-end justify-between mb-2">
                                    <div className={`font-mono text-3xl font-bold ${getScoreColor(selectedClient.score).text}`}>
                                        {selectedClient.score} <span className="text-sm text-fog font-normal">/ 100</span>
                                    </div>
                                    <div className="font-sans text-sm text-fog mb-1">
                                        Trend: {getTrendDisplay(selectedClient.trend)}
                                    </div>
                                </div>

                                {/* Stacked Bar */}
                                <div className="h-4 w-full bg-slate rounded-full overflow-hidden flex border border-ash mb-4">
                                    <div className="h-full bg-red/80" style={{ width: `${Math.max(0, selectedClient.components.loc)}%` }} title="Location"></div>
                                    <div className="h-full bg-amber/80 border-l border-carbon" style={{ width: `${Math.max(0, selectedClient.components.bldg)}%` }} title="Building"></div>
                                    <div className="h-full bg-blue/80 border-l border-carbon" style={{ width: `${Math.max(0, selectedClient.components.prev)}%` }} title="Preventive"></div>
                                    <div className="h-full bg-fog/80 border-l border-carbon" style={{ width: `${Math.max(0, selectedClient.components.val)}%` }} title="Value"></div>
                                </div>

                                <div className="grid grid-cols-2 gap-y-3 font-sans text-sm text-cloud">
                                    <div className="flex items-center justify-between pr-4"><span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red/80"></div>Location</span> <span className="font-mono">{selectedClient.components.loc}</span></div>
                                    <div className="flex items-center justify-between pr-4"><span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-amber/80"></div>Building Type</span> <span className="font-mono">{selectedClient.components.bldg}</span></div>
                                    <div className="flex items-center justify-between pr-4"><span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-blue/80"></div>Preventive</span> <span className="font-mono">{selectedClient.components.prev}</span></div>
                                    <div className="flex items-center justify-between pr-4"><span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-fog/80"></div>Contract Value</span> <span className="font-mono">{selectedClient.components.val}</span></div>
                                </div>
                            </div>

                            {/* Contract Details Grid */}
                            <div>
                                <h3 className="font-sans text-[12px] font-semibold uppercase text-fog tracking-wider mb-4">Contract Details</h3>
                                <div className="bg-graphite rounded-[8px] border border-ash p-4 grid grid-cols-2 gap-x-4 gap-y-4">
                                    <div>
                                        <div className="font-sans text-[11px] text-fog uppercase mb-1">Wilaya & Zone</div>
                                        <div className="font-sans text-sm text-pure">{selectedClient.wilaya} (<span className="font-mono">Zone {selectedClient.zone}</span>)</div>
                                    </div>
                                    <div>
                                        <div className="font-sans text-[11px] text-fog uppercase mb-1">Insured Capital</div>
                                        <div className="font-mono text-sm text-pure"><DZDArmount value={selectedClient.capital} /></div>
                                    </div>
                                    <div>
                                        <div className="font-sans text-[11px] text-fog uppercase mb-1">Risk Nature</div>
                                        <div className="font-sans text-sm text-pure">{selectedClient.nature}</div>
                                    </div>
                                    <div>
                                        <div className="font-sans text-[11px] text-fog uppercase mb-1">Building Class</div>
                                        <div className="font-sans text-sm text-pure">{selectedClient.buildingType}</div>
                                    </div>
                                </div>
                            </div>

                            {/* History Sparkline */}
                            <div>
                                <h3 className="font-sans text-[12px] font-semibold uppercase text-fog tracking-wider mb-4">Score History (Last 3 Renewals)</h3>
                                <div className="flex items-end gap-2 h-24 bg-graphite border border-ash rounded-[8px] p-4 pt-8">
                                    {selectedClient.history.map((h, i) => {
                                        const hColor = getScoreColor(h);
                                        return (
                                            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                                                <div className="absolute -top-6 font-mono text-[11px] text-fog opacity-0 group-hover:opacity-100 transition-opacity">{h}</div>
                                                <div className={`w-full max-w-[40px] rounded-t-sm transition-all duration-500 ${hColor.bg.replace('/10', '/60')} border-t ${hColor.border}`} style={{ height: `${h}%` }}></div>
                                                <div className="mt-2 font-mono text-[10px] text-fog text-center border-t border-ash/50 w-full pt-1">T-{2-i}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Recommendation */}
                            <div className={`p-4 rounded-[8px] border ${selectedClient.score > 60 ? 'bg-red/5 border-red/30' : selectedClient.score > 30 ? 'bg-amber/5 border-amber/30' : 'bg-green/5 border-green/30'}`}>
                                <h3 className={`font-sans text-[12px] font-bold uppercase tracking-wider mb-2 ${selectedClient.score > 60 ? 'text-red' : selectedClient.score > 30 ? 'text-amber' : 'text-green'}`}>Renewal Recommendation</h3>
                                <p className="font-sans text-sm text-cloud mb-3">{selectedClient.recommendation}</p>
                                <div className="flex items-center justify-between border-t border-ash/50 pt-3">
                                    <span className="font-sans text-sm text-fog">Suggested Premium Change:</span>
                                    <span className={`font-mono font-bold ${selectedClient.premiumChange.startsWith('+') ? 'text-red' : selectedClient.premiumChange === '0%' ? 'text-pure' : 'text-green'}`}>{selectedClient.premiumChange}</span>
                                </div>
                            </div>

                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 border-t border-ash bg-carbon shrink-0 flex gap-3">
                            <button className="flex-1 btn-outline bg-graphite flex items-center justify-center gap-2">
                                <div className="icon-flag text-amber text-sm"></div> Flag
                            </button>
                            <button className="flex-1 btn-outline bg-graphite flex items-center justify-center gap-2">
                                <div className="icon-message-square text-sm"></div> Note
                            </button>
                            <button className="flex-1 btn-primary bg-teal hover:bg-teal/80 text-carbon shadow-[0_0_15px_rgba(57,208,216,0.2)]">
                                Renew
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Backdrop overlay for small screens (optional, but good for focus) */}
            {selectedClient && (
                <div 
                    className="absolute inset-0 bg-slate/20 backdrop-blur-[1px] z-20 transition-opacity"
                    onClick={() => setSelectedClient(null)}
                ></div>
            )}
            
        </div>
    );
};