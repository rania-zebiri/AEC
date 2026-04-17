const MOCK_WILAYAS_OPP = [
    { id: 1, name: 'Adrar', zone: '0', top: '65%', left: '40%', score: 95, cap: 500000000, used: 120000000, popGrowth: '+3.2%', compCount: 2, reason: 'Zone 0 + 3.2% pop. growth + only 120M insured', products: ['SME Multi-risk', 'Agricultural', 'Solar Farm Coverage'] },
    { id: 8, name: 'Béchar', zone: '0', top: '50%', left: '25%', score: 88, cap: 400000000, used: 80000000, popGrowth: '+2.8%', compCount: 3, reason: 'Safe zone + new industrial zone development', products: ['Industrial Fire', 'Contractor All Risks'] },
    { id: 11, name: 'Tamanrasset', zone: '0', top: '85%', left: '60%', score: 82, cap: 300000000, used: 45000000, popGrowth: '+2.5%', compCount: 1, reason: 'Virtually untapped market + border trade expansion', products: ['Commercial Property', 'Transit/Cargo'] },
    { id: 39, name: 'El Oued', zone: 'I', top: '45%', left: '75%', score: 75, cap: 600000000, used: 250000000, popGrowth: '+4.1%', compCount: 4, reason: 'High agricultural growth + low seismic risk', products: ['Agribusiness Multi-risk', 'Cold Storage Coverage'] },
    { id: 30, name: 'Ouargla', zone: 'IIb', top: '60%', left: '65%', score: 62, cap: 1500000000, used: 500000000, popGrowth: '+2.0%', compCount: 6, reason: 'Strong oil/gas sector but moderate risk and competition', products: ['Energy Sector Niche Products'] },
    { id: 31, name: 'Oran', zone: 'IIa', top: '22%', left: '30%', score: 40, cap: 2000000000, used: 850000000, popGrowth: '+1.5%', compCount: 12, reason: 'High competition and moderate risk offset growth', products: ['Selective Commercial Only'] },
    { id: 9, name: 'Blida', zone: 'III', top: '18%', left: '53%', score: 15, cap: 500000000, used: 350000000, popGrowth: '+1.8%', compCount: 10, reason: 'High risk + nearing retention limit. Avoid.', products: ['None / Restrict New Business'] },
    { id: 16, name: 'Algiers', zone: 'III', top: '15%', left: '55%', score: 8, cap: 1000000000, used: 850000000, popGrowth: '+1.2%', compCount: 15, reason: 'Over-concentrated. Extremely high seismic risk.', products: ['None / Restrict New Business'] },
];

const OpportunityMap = () => {
    const [selectedWilaya, setSelectedWilaya] = React.useState(null);

    const getOpportunityColor = (score) => {
        if (score >= 80) return 'bg-emerald-500 border-emerald-400';
        if (score >= 60) return 'bg-emerald-600 border-emerald-500';
        if (score >= 40) return 'bg-emerald-700 border-emerald-600';
        if (score >= 20) return 'bg-emerald-900 border-emerald-800';
        return 'bg-transparent border-ash text-fog'; // Avoid
    };

    const sortedOpportunities = [...MOCK_WILAYAS_OPP].sort((a, b) => b.score - a.score).slice(0, 5);

    return (
        <div className="relative w-full h-[calc(100vh-56px)] bg-[#05080c] overflow-hidden -mx-8 -my-8" data-name="opportunity-map" data-file="components/OpportunityMap.js">
            
            {/* Map Canvas Background (Simulated) */}
            <div className="absolute inset-0 opacity-30 mix-blend-screen bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Algeria_location_map.svg/1024px-Algeria_location_map.svg.png')] bg-contain bg-no-repeat bg-center filter grayscale"></div>
            
            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPjxwYXRoIGQ9Ik0wIDQwaDQwTTAgMFY0MCIvPjwvZz48L3N2Zz4=')] opacity-20 pointer-events-none"></div>

            {/* Interactive Wilaya Markers */}
            {MOCK_WILAYAS_OPP.map(w => {
                const isSelected = selectedWilaya?.id === w.id;
                const colorClasses = getOpportunityColor(w.score);
                const isHighOpp = w.score >= 80;
                
                return (
                    <div 
                        key={w.id}
                        className="absolute group cursor-pointer transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center transition-all duration-300"
                        style={{ top: w.top, left: w.left, zIndex: isSelected ? 10 : (isHighOpp ? 5 : 1) }}
                        onClick={() => setSelectedWilaya(w)}
                    >
                        {isHighOpp && (
                            <div className="absolute inset-0 m-auto flex items-center justify-center">
                                <span className="animate-ping absolute inline-flex h-[60px] w-[60px] rounded-full bg-emerald-500 opacity-20"></span>
                            </div>
                        )}
                        
                        <div className={`w-[40px] h-[40px] rounded-full flex items-center justify-center border-[2px] backdrop-blur-sm transition-all duration-200
                            ${isSelected ? 'border-emerald-300 scale-125 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'hover:scale-110'}
                            ${colorClasses} bg-opacity-80
                        `}>
                            <span className={`font-mono text-[10px] font-bold ${w.score < 20 ? 'text-fog' : 'text-pure'} mix-blend-overlay`}>{w.id}</span>
                        </div>
                        
                        <div className={`mt-2 px-2 py-1 rounded bg-carbon/90 border backdrop-blur-sm shadow-card pointer-events-none transition-opacity
                            ${isSelected ? 'opacity-100 border-emerald-500' : 'opacity-0 group-hover:opacity-100 border-ash'}
                        `}>
                            <div className="font-sans text-[12px] font-semibold text-pure whitespace-nowrap">{w.name} <span className="text-emerald-400 ml-1">{w.score}</span></div>
                        </div>
                    </div>
                );
            })}

            {/* Floating Top-Left Panel — Legend */}
            <div className="absolute top-6 left-6 glass-panel p-5 w-[320px] z-20">
                <h3 className="font-mono text-[16px] font-semibold text-pure mb-2 flex items-center gap-2">
                    <div className="icon-target text-emerald-500"></div>
                    Market Opportunity Score
                </h3>
                <p className="font-sans text-[12px] text-fog mb-4 leading-tight">Identifies optimal regions for sales expansion based on minimal seismic risk and high market potential.</p>
                
                <div className="mb-4">
                    <div className="flex justify-between font-mono text-[10px] text-cloud mb-1">
                        <span>Low/Avoid</span>
                        <span>High Potential</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-gradient-to-r from-slate-800 via-emerald-700 to-emerald-400 border border-ash"></div>
                </div>

                <div className="bg-graphite/50 border border-ash/50 rounded-[6px] p-3">
                    <div className="font-sans text-[11px] font-semibold text-fog uppercase tracking-wider mb-2">Score Formula Elements</div>
                    <ul className="space-y-1.5 font-sans text-[12px] text-cloud">
                        <li className="flex items-center gap-2"><div className="icon-check text-emerald-500 text-sm"></div> Safe Zone Classification (0, I)</li>
                        <li className="flex items-center gap-2"><div className="icon-check text-emerald-500 text-sm"></div> Low Current Concentration</li>
                        <li className="flex items-center gap-2"><div className="icon-check text-emerald-500 text-sm"></div> High Population/Econ Growth</li>
                    </ul>
                </div>
            </div>

            {/* Floating Top-Right Panel — Top 5 Opportunities */}
            <div className="absolute top-6 right-6 glass-panel p-0 w-[380px] z-20 flex flex-col max-h-[calc(100vh-120px)]">
                <div className="p-4 border-b border-ash bg-carbon/50 flex items-center justify-between">
                    <h3 className="font-mono text-[15px] font-semibold text-pure uppercase tracking-wider flex items-center gap-2">
                        <div className="icon-trending-up text-emerald-500"></div>
                        Top 5 Growth Markets
                    </h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {sortedOpportunities.map((w, idx) => (
                        <div key={w.id} className="bg-graphite border border-ash rounded-[6px] p-3 hover:border-emerald-500/50 transition-colors cursor-pointer" onClick={() => setSelectedWilaya(w)}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-emerald-900 text-emerald-400 flex items-center justify-center font-mono text-[12px] font-bold border border-emerald-700">
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
                
                <div className="p-4 border-t border-ash bg-carbon/50">
                    <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-pure font-sans font-semibold rounded-[6px] h-[36px] flex items-center justify-center transition-colors text-sm shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        View Full Opportunity Report
                    </button>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-8 left-6 z-20 flex flex-col gap-2">
                <div className="glass-panel flex flex-col p-1">
                    <button className="w-8 h-8 flex items-center justify-center text-fog hover:text-pure hover:bg-ash rounded transition-colors">
                        <div className="icon-plus text-sm"></div>
                    </button>
                    <div className="w-6 mx-auto border-t border-ash/50 my-0.5"></div>
                    <button className="w-8 h-8 flex items-center justify-center text-fog hover:text-pure hover:bg-ash rounded transition-colors">
                        <div className="icon-minus text-sm"></div>
                    </button>
                </div>
            </div>

            {/* Bottom Center Toggle */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
                <a href="map.html" className="glass-panel px-6 py-3 flex items-center gap-3 hover:bg-graphite transition-colors group">
                    <div className="icon-map text-fog group-hover:text-pure transition-colors"></div>
                    <span className="font-sans text-sm font-semibold text-pure">Switch to Risk View</span>
                    <div className="icon-arrow-right text-fog text-sm group-hover:translate-x-1 transition-transform"></div>
                </a>
            </div>

            {/* Right Drawer */}
            <div className={`absolute top-0 right-0 h-full w-[480px] bg-carbon border-l border-ash shadow-modal transition-transform duration-300 z-30 flex flex-col
                ${selectedWilaya ? 'translate-x-0' : 'translate-x-full'}`}>
                
                {selectedWilaya && (
                    <>
                        {/* Drawer Header */}
                        <div className="p-6 border-b border-ash relative bg-gradient-to-br from-carbon to-graphite">
                            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-sans text-[11px] font-semibold text-emerald-500 uppercase tracking-wider mb-1">Market Profile</div>
                                    <h2 className="font-mono text-[28px] font-medium text-pure mb-1">{selectedWilaya.name}</h2>
                                    <p className="font-sans text-sm text-fog">Wilaya Code: {selectedWilaya.id.toString().padStart(2, '0')}</p>
                                </div>
                                <button onClick={() => setSelectedWilaya(null)} className="w-8 h-8 flex items-center justify-center bg-carbon hover:bg-ash border border-ash rounded-full text-fog hover:text-pure transition-colors">
                                    <div className="icon-x text-lg"></div>
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

                        {/* Drawer Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide bg-slate">
                            
                            {/* Key Market Indicators */}
                            <div>
                                <h3 className="font-mono text-[14px] font-semibold text-pure mb-4 uppercase tracking-wider">Key Market Indicators</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-graphite p-4 rounded-[6px] border border-ash">
                                        <div className="icon-users text-fog mb-2 text-lg"></div>
                                        <div className="font-sans text-[12px] text-fog mb-1">Population Growth</div>
                                        <div className="font-mono text-[18px] text-emerald-400">{selectedWilaya.popGrowth}</div>
                                    </div>
                                    <div className="bg-graphite p-4 rounded-[6px] border border-ash">
                                        <div className="icon-building text-fog mb-2 text-lg"></div>
                                        <div className="font-sans text-[12px] text-fog mb-1">Est. Competitors</div>
                                        <div className="font-mono text-[18px] text-pure">{selectedWilaya.compCount} <span className="text-sm text-fog font-sans font-normal">agencies</span></div>
                                    </div>
                                </div>
                            </div>

                            {/* Capacity Utilization */}
                            <div>
                                <h3 className="font-mono text-[14px] font-semibold text-pure mb-4 uppercase tracking-wider">Capacity Utilization</h3>
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
                                    
                                    <div className="h-3 w-full bg-carbon rounded-full overflow-hidden border border-ash mt-3">
                                        <div className="h-full bg-emerald-500" style={{width: `${(selectedWilaya.used / selectedWilaya.cap) * 100}%`}}></div>
                                    </div>
                                    
                                    <div className="mt-3 flex justify-between items-center">
                                        <span className="font-sans text-[12px] text-emerald-400 font-semibold">
                                            <DZDArmount value={selectedWilaya.cap - selectedWilaya.used} /> available for growth
                                        </span>
                                        <span className="font-mono text-[12px] text-fog">{((selectedWilaya.used / selectedWilaya.cap) * 100).toFixed(1)}% utilized</span>
                                    </div>
                                </div>
                            </div>

                            {/* Strategic Recommendations */}
                            <div>
                                <h3 className="font-mono text-[14px] font-semibold text-pure mb-4 uppercase tracking-wider">Strategic Recommendations</h3>
                                <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-[8px] p-5">
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="icon-lightbulb text-emerald-400 mt-1"></div>
                                        <p className="font-sans text-sm text-cloud leading-relaxed">
                                            {selectedWilaya.reason}. Focus sales efforts on commercial and mid-market industrial clients to rapidly build premium base without triggering PML limits.
                                        </p>
                                    </div>
                                    
                                    <div className="border-t border-emerald-500/20 pt-4">
                                        <div className="font-sans text-[11px] font-semibold uppercase text-emerald-400/80 tracking-wider mb-3">Recommended Products for {selectedWilaya.name}</div>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedWilaya.products.map((prod, i) => (
                                                <span key={i} className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-sans text-[12px] rounded-full">
                                                    {prod}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Drawer Footer Actions */}
                        <div className="p-4 border-t border-ash bg-carbon flex flex-col gap-3 shrink-0">
                            <button className="h-[44px] bg-emerald-600 hover:bg-emerald-500 text-pure font-sans font-semibold rounded-[6px] flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                <div className="icon-file-down text-sm"></div>
                                Generate Sales Brief (PDF)
                            </button>
                            <button className="h-[40px] rounded-[6px] bg-graphite border border-ash text-cloud font-sans font-medium text-sm hover:bg-ash hover:text-pure transition-colors flex items-center justify-center gap-2">
                                <div className="icon-mail text-sm"></div> Email Local Agency Network
                            </button>
                        </div>
                    </>
                )}
            </div>

        </div>
    );
};