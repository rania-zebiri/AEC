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

const GaugeBar = ({ capacity, exposure, type = 'hotspot' }) => {
    // For visual representation, we scale the bar such that the maximum value determines the total width.
    const maxVal = Math.max(capacity, exposure);
    const capPct = (capacity / maxVal) * 100;
    const expPct = (exposure / maxVal) * 100;
    
    const color = type === 'hotspot' ? 'bg-red' : 'bg-amber';
    const isOver = exposure > capacity;

    return (
        <div className="w-full">
            <div className="flex justify-between font-mono text-[11px] mb-1">
                <span className="text-fog">Capacity: {(capacity/1000000000).toFixed(1)}B</span>
                <span className={isOver ? 'text-red font-bold' : 'text-amber'}>Insured: {(exposure/1000000000).toFixed(1)}B</span>
            </div>
            <div className="relative h-3 bg-graphite rounded-full overflow-hidden border border-ash">
                {/* Exposure Fill */}
                <div className={`absolute top-0 left-0 h-full ${color} opacity-80`} style={{ width: `${expPct}%` }}></div>
                
                {/* Capacity Marker Line */}
                <div className="absolute top-0 bottom-0 border-r-2 border-pure z-10" style={{ left: `${capPct}%` }}></div>
                
                {/* Overflow Hatch Pattern Overlay (if over capacity) */}
                {isOver && (
                    <div 
                        className="absolute top-0 bottom-0 right-0 opacity-40" 
                        style={{ 
                            left: `${capPct}%`, 
                            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.5) 4px, rgba(0,0,0,0.5) 8px)' 
                        }}
                    ></div>
                )}
            </div>
        </div>
    );
};

const Hotspots = () => {
    const [safeExpanded, setSafeExpanded] = React.useState(false);
    
    React.useEffect(() => {
        const ctx = document.getElementById('retentionDonut');
        let chart;
        
        if (ctx) {
            chart = new ChartJS(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Safe', 'Warning', 'Hotspot'],
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
                        legend: { display: false }
                    }
                }
            });
        }
        
        return () => { if (chart) chart.destroy(); };
    }, []);

    return (
        <div className="relative h-[calc(100vh-56px)] -mx-8 -my-8 flex bg-slate" data-name="hotspots-page" data-file="components/Hotspots.js">
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                
                {/* Hero Alert Header */}
                <div className="bg-red/10 border-b border-red/30 px-8 py-6 shrink-0 relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-red/10 to-transparent pointer-events-none"></div>
                    <div className="flex items-start justify-between relative z-10">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="icon-triangle-alert text-3xl text-red"></div>
                                <h1 className="text-[28px] font-mono font-medium text-pure m-0 leading-none">Concentration Hotspots</h1>
                            </div>
                            <p className="font-sans text-[15px] text-cloud max-w-2xl mt-3">Wilayas where currently insured capital significantly exceeds the defined retention capacity thresholds. Immediate action recommended.</p>
                        </div>
                        
                        <div className="bg-carbon/80 backdrop-blur border border-ash p-4 rounded-[6px] shadow-sm flex items-center gap-4">
                            <div className="icon-info text-fog text-xl"></div>
                            <div>
                                <div className="font-sans text-[11px] text-fog uppercase tracking-wider font-semibold mb-1">Global Retention Capacity</div>
                                <div className="font-mono text-lg text-pure">1,000,000,000 DZD</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Padding Wrapper */}
                <div className="p-8 space-y-8">
                    
                    {/* CRITICAL HOTSPOTS */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {MOCK_HOTSPOTS.map(w => {
                            const excessAmount = w.exposure - w.capacity;
                            const excessPct = ((excessAmount / w.capacity) * 100).toFixed(1);
                            
                            return (
                                <div key={w.id} className="card border border-red overflow-hidden relative group">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red"></div>
                                    <div className="p-6 pl-8">
                                        
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h2 className="font-mono text-[22px] font-semibold text-pure">{w.name}</h2>
                                                    <ZoneBadge zone={w.zone} />
                                                </div>
                                                <div className="font-sans text-[12px] text-fog">Wilaya Code: {w.id.toString().padStart(2, '0')}</div>
                                            </div>
                                            <div className="bg-red/20 text-red border border-red/30 px-3 py-1 rounded-full flex items-center gap-2">
                                                <div className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red"></span>
                                                </div>
                                                <span className="font-sans text-[11px] font-bold tracking-wider uppercase">Hotspot</span>
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <GaugeBar capacity={w.capacity} exposure={w.exposure} type="hotspot" />
                                        </div>

                                        <div className="bg-red/5 border border-red/20 rounded-[6px] p-4 mb-6 text-center">
                                            <div className="font-sans text-[12px] text-red/80 font-bold uppercase mb-1">Excess Exposure</div>
                                            <div className="font-mono text-[24px] text-red font-medium">
                                                <DZDArmount value={excessAmount} />
                                            </div>
                                            <div className="font-mono text-[12px] text-red/70 mt-1">+{excessPct}% over capacity</div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 mb-6 border-t border-ash pt-4">
                                            <div>
                                                <div className="font-sans text-[11px] text-fog mb-1">Residential</div>
                                                <div className="font-mono text-[13px] text-cloud"><DZDArmount value={w.res} /></div>
                                            </div>
                                            <div>
                                                <div className="font-sans text-[11px] text-fog mb-1">Commercial</div>
                                                <div className="font-mono text-[13px] text-cloud"><DZDArmount value={w.com} /></div>
                                            </div>
                                            <div>
                                                <div className="font-sans text-[11px] text-fog mb-1">Industrial</div>
                                                <div className="font-mono text-[13px] text-cloud"><DZDArmount value={w.ind} /></div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button className="btn-primary flex-1 bg-red hover:bg-red/80 shadow-[0_0_15px_rgba(218,54,51,0.2)]">Block New Contracts</button>
                                            <button className="btn-outline flex-1">Suggest Reinsurance</button>
                                        </div>
                                        
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* WARNING ZONE */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="icon-triangle-alert text-amber text-lg"></div>
                            <h3 className="font-mono text-[16px] text-pure">Approaching Threshold (&gt;75%)</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {MOCK_WARNINGS.map(w => {
                                const usedPct = ((w.exposure / w.capacity) * 100).toFixed(1);
                                
                                return (
                                    <div key={w.id} className="card border border-amber/50 p-5 pl-6 relative">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber"></div>
                                        
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-mono text-[18px] font-semibold text-pure">{w.name}</h4>
                                                <ZoneBadge zone={w.zone} />
                                            </div>
                                            <div className="font-mono text-[16px] text-amber font-bold">{usedPct}% used</div>
                                        </div>
                                        
                                        <GaugeBar capacity={w.capacity} exposure={w.exposure} type="warning" />
                                        
                                        <div className="flex justify-between items-center mt-5 pt-4 border-t border-ash/50">
                                            <div className="font-sans text-sm text-fog">Risk Score: <span className="font-mono text-pure">{w.score}</span></div>
                                            <button className="text-sm font-sans font-medium text-amber hover:text-amber/80 transition-colors">View Details →</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* SAFE SUMMARY */}
                    <div className="border border-ash rounded-[8px] bg-carbon overflow-hidden">
                        <button 
                            className="w-full p-4 flex items-center justify-between hover:bg-graphite transition-colors"
                            onClick={() => setSafeExpanded(!safeExpanded)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-green/10 flex items-center justify-center text-green">
                                    <div className="icon-shield-check text-lg"></div>
                                </div>
                                <span className="font-sans font-medium text-pure">47 wilayas within safe limits (&lt;75% capacity)</span>
                            </div>
                            <div className={`icon-chevron-down text-fog transition-transform ${safeExpanded ? 'rotate-180' : ''}`}></div>
                        </button>
                        
                        {safeExpanded && (
                            <div className="p-4 border-t border-ash bg-graphite grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { id: 1, name: 'Adrar', val: '12%' },
                                    { id: 2, name: 'Chlef', val: '45%' },
                                    { id: 3, name: 'Laghouat', val: '8%' },
                                    { id: 4, name: 'Oum El Bouaghi', val: '15%' },
                                    { id: 5, name: 'Batna', val: '32%' },
                                    { id: 6, name: 'Béjaïa', val: '65%' },
                                    { id: 7, name: 'Biskra', val: '22%' },
                                    { id: 8, name: 'Béchar', val: '5%' }
                                ].map(s => (
                                    <div key={s.id} className="flex justify-between items-center bg-carbon p-2 rounded border border-ash/50">
                                        <span className="font-sans text-[12px] text-cloud">{s.name}</span>
                                        <span className="font-mono text-[12px] text-green">{s.val}</span>
                                    </div>
                                ))}
                                <div className="col-span-full text-center mt-2 text-sm text-fog font-sans italic">... and 39 more wilayas.</div>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Right Panel - Global Summary */}
            <div className="w-[300px] border-l border-ash bg-carbon flex flex-col shrink-0">
                <div className="h-16 border-b border-ash flex items-center px-6 shrink-0">
                    <h2 className="font-mono text-sm font-semibold text-pure uppercase tracking-wide">Global Summary</h2>
                </div>
                
                <div className="p-6 flex-1 overflow-y-auto">
                    
                    <div className="relative w-full aspect-square mb-8">
                        <canvas id="retentionDonut"></canvas>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="font-mono text-[32px] font-bold text-pure leading-none">58</span>
                            <span className="font-sans text-[11px] text-fog uppercase tracking-wider mt-1">Total Wilayas</span>
                        </div>
                    </div>
                    
                    <div className="space-y-3 mb-8">
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-green"></div><span className="font-sans text-cloud">Safe</span></div>
                            <span className="font-mono text-pure">47</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-amber"></div><span className="font-sans text-cloud">Warning</span></div>
                            <span className="font-mono text-pure">2</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red"></div><span className="font-sans text-cloud">Hotspot</span></div>
                            <span className="font-mono text-pure">2</span>
                        </div>
                    </div>

                    <div className="bg-blue/10 border border-blue/30 rounded-[6px] p-4 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue"></div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="icon-wand-sparkles text-blue text-sm"></div>
                            <h3 className="font-sans text-[12px] font-bold text-blue uppercase tracking-wide">System Recommendation</h3>
                        </div>
                        <p className="font-sans text-sm text-cloud leading-relaxed">
                            Suspend new major risk policies in <strong className="text-pure">Algiers</strong> and <strong className="text-pure">Blida</strong>. Redirect sales priorities to Zone 0 and Zone I wilayas (e.g., Adrar, Bechar) to balance the national portfolio exposure.
                        </p>
                        <button className="mt-4 w-full bg-blue/20 hover:bg-blue/30 text-blue font-sans text-sm font-semibold py-2 rounded transition-colors border border-blue/40">
                            Apply Auto-Rules
                        </button>
                    </div>

                </div>
            </div>

        </div>
    );
};