const MOCK_CONTRACTS = [
    { id: 1, rank: 1, name: 'Sonatrach Complex A', wilaya: 'Ouargla', cap: 850000000, vuln: 0.85 },
    { id: 2, rank: 2, name: 'Port of Algiers', wilaya: 'Algiers', cap: 420000000, vuln: 0.92 },
    { id: 3, rank: 3, name: 'Cevital Refinery', wilaya: 'Bejaia', cap: 380000000, vuln: 0.78 },
    { id: 4, rank: 4, name: 'Air Algérie HQ', wilaya: 'Algiers', cap: 250000000, vuln: 0.65 },
    { id: 5, rank: 5, name: 'Sonelgaz Boufarik', wilaya: 'Blida', cap: 210000000, vuln: 0.70 },
    { id: 6, rank: 6, name: 'Oran Stadium', wilaya: 'Oran', cap: 150000000, vuln: 0.60 },
    { id: 7, rank: 7, name: 'Bab Ezzouar Mall', wilaya: 'Algiers', cap: 120000000, vuln: 0.55 },
    { id: 8, rank: 8, name: 'Renault Plant', wilaya: 'Oran', cap: 310000000, vuln: 0.45 },
    { id: 9, rank: 9, name: 'Hotel El Aurassi', wilaya: 'Algiers', cap: 95000000, vuln: 0.82 },
    { id: 10, rank: 10, name: 'Tipaza Resort', wilaya: 'Tipaza', cap: 85000000, vuln: 0.68 },
];

const PmlSimulator = () => {
    // Simulator State
    const [status, setStatus] = React.useState('idle'); // idle, running, completed
    const [zone, setZone] = React.useState('All Algeria');
    const [magnitude, setMagnitude] = React.useState(6.5);
    const [epicenter, setEpicenter] = React.useState({ x: 55, y: 15 });
    const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);
    const [hasReinsurance, setHasReinsurance] = React.useState(true);
    const [reinsuranceLimit, setReinsuranceLimit] = React.useState(1000000000);
    
    const [history, setHistory] = React.useState([]);
    const [results, setResults] = React.useState(null);

    const handleMapClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setEpicenter({ x, y });
    };

    const runSimulation = () => {
        setStatus('running');
        
        // Simulate API delay
        setTimeout(() => {
            // Generate mock results based on magnitude
            const multiplier = Math.pow((magnitude - 3), 2.5) / 15; // Exponential curve
            const grossLoss = Math.round(1500000000 * multiplier);
            const netLoss = hasReinsurance ? Math.min(grossLoss, reinsuranceLimit) : grossLoss;
            const recovered = grossLoss - netLoss;
            
            const newResult = {
                id: Date.now(),
                zone,
                magnitude,
                grossLoss,
                netLoss,
                recovered,
                resLoss: grossLoss * 0.4,
                comLoss: grossLoss * 0.35,
                indLoss: grossLoss * 0.25,
                contracts: MOCK_CONTRACTS.map(c => ({
                    ...c,
                    loss: Math.round(c.cap * c.vuln * (multiplier * 0.5))
                })).sort((a,b) => b.loss - a.loss)
            };
            
            setResults(newResult);
            setHistory(prev => [newResult, ...prev].slice(0, 5));
            setStatus('completed');
        }, 1500);
    };

    // Chart Initialization
    React.useEffect(() => {
        if (status !== 'completed') return;
        
        const breakdownCtx = document.getElementById('breakdownChart');
        const timelineCtx = document.getElementById('timelineChart');
        let bdChart, tlChart;
        
        if (breakdownCtx) {
            bdChart = new ChartJS(breakdownCtx, {
                type: 'bar',
                data: {
                    labels: ['Loss by Nature'],
                    datasets: [
                        { label: 'Residential', data: [results.resLoss], backgroundColor: '#1F6FEB' },
                        { label: 'Commercial', data: [results.comLoss], backgroundColor: '#D29922' },
                        { label: 'Industrial', data: [results.indLoss], backgroundColor: '#DA3633' }
                    ]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { stacked: true, display: false },
                        y: { stacked: true, display: false }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        }
        
        if (timelineCtx) {
            tlChart = new ChartJS(timelineCtx, {
                type: 'line',
                data: {
                    labels: ['M4.0', 'M5.0', 'M6.0', 'M6.5', 'M7.0', 'M8.0'],
                    datasets: [{
                        label: 'Projected Loss Curve',
                        data: [0.1, 0.5, 1.5, 3.2, 6.8, 14.5], // static mock curve
                        borderColor: '#39D0D8',
                        backgroundColor: 'rgba(57,208,216,0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { grid: { color: '#30363D' }, ticks: { color: '#8B949E' } },
                        x: { grid: { display: false }, ticks: { color: '#8B949E' } }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        }
        
        return () => {
            if (bdChart) bdChart.destroy();
            if (tlChart) tlChart.destroy();
        };
    }, [status, results]);

    return (
        <div className="relative h-[calc(100vh-56px)] -mx-8 -my-8 flex bg-slate overflow-hidden" data-name="pml-page" data-file="components/PmlSimulator.js">
            
            {/* Left Panel: Scenario Builder */}
            <div className="w-[420px] bg-carbon border-r border-ash flex flex-col shrink-0 relative z-10 shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
                <div className="p-6 border-b border-ash shrink-0 bg-graphite/50">
                    <h1 className="text-[20px] font-mono font-medium text-pure m-0 flex items-center gap-3">
                        <div className="icon-activity text-teal"></div>
                        Configure Scenario
                    </h1>
                    <p className="font-sans text-[13px] text-fog mt-2">Set parameters to calculate probable maximum loss (PML) across the portfolio.</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    
                    {/* Target Zone */}
                    <div>
                        <label className="label-text">Target Zone</label>
                        <div className="relative">
                            <select 
                                className="input-field appearance-none cursor-pointer"
                                value={zone}
                                onChange={(e) => setZone(e.target.value)}
                            >
                                <option>All Algeria</option>
                                <option>Algiers (Zone III)</option>
                                <option>Blida (Zone III)</option>
                                <option>Oran (Zone IIa)</option>
                                <option>Chlef (Zone III)</option>
                            </select>
                            <div className="icon-chevron-down absolute right-3 top-2.5 text-fog pointer-events-none text-sm"></div>
                        </div>
                    </div>

                    {/* Magnitude */}
                    <div>
                        <label className="label-text flex justify-between">
                            <span>Earthquake Magnitude</span>
                            <span className="font-mono text-pure">M{magnitude.toFixed(1)}</span>
                        </label>
                        <input 
                            type="range" min="4.0" max="8.0" step="0.1" 
                            value={magnitude} 
                            onChange={(e) => setMagnitude(parseFloat(e.target.value))}
                        />
                        <div className="flex justify-between mt-3">
                            {['5.0', '6.0', '6.5', '7.0'].map(m => (
                                <button 
                                    key={m}
                                    onClick={() => setMagnitude(parseFloat(m))}
                                    className="px-3 py-1 bg-graphite border border-ash rounded text-[12px] font-mono text-cloud hover:text-pure hover:border-fog transition-colors"
                                >
                                    M{m}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Epicenter Map */}
                    <div>
                        <label className="label-text">Epicenter Location (Click to set)</label>
                        <div 
                            className="relative h-[160px] bg-graphite rounded-[6px] border border-ash cursor-crosshair overflow-hidden group"
                            onClick={handleMapClick}
                        >
                            <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Algeria_location_map.svg/500px-Algeria_location_map.svg.png')] bg-contain bg-no-repeat bg-center opacity-30 group-hover:opacity-50 transition-opacity"></div>
                            
                            {/* Epicenter Marker */}
                            <div 
                                className="absolute w-3 h-3 bg-red rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10 shadow-[0_0_10px_rgba(218,54,51,0.8)]"
                                style={{ left: `${epicenter.x}%`, top: `${epicenter.y}%` }}
                            >
                                <span className="animate-ping absolute inset-0 rounded-full bg-red opacity-75"></span>
                            </div>
                            
                            {/* Radius Rings */}
                            <div 
                                className="absolute w-[80px] h-[80px] border border-red/40 bg-red/10 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                style={{ left: `${epicenter.x}%`, top: `${epicenter.y}%`, width: `${magnitude * 15}px`, height: `${magnitude * 15}px` }}
                            ></div>
                        </div>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="label-text">Scenario Date</label>
                        <input 
                            type="date" 
                            className="input-field" 
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    {/* Reinsurance Toggle */}
                    <div className="bg-graphite p-4 rounded-[6px] border border-ash">
                        <div className="flex items-center justify-between mb-2">
                            <label className="font-sans text-[13px] font-semibold text-pure m-0">Include Reinsurance</label>
                            <button 
                                className={`relative w-10 h-5 rounded-full transition-colors ${hasReinsurance ? 'bg-blue' : 'bg-ash'}`}
                                onClick={() => setHasReinsurance(!hasReinsurance)}
                            >
                                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-pure rounded-full transition-transform ${hasReinsurance ? 'translate-x-5' : 'translate-x-0'}`}></span>
                            </button>
                        </div>
                        {hasReinsurance && (
                            <div className="mt-3 pt-3 border-t border-ash/50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <label className="label-text text-[11px]">Net Retention Limit (DZD)</label>
                                <input 
                                    type="number" 
                                    className="input-field text-right font-mono" 
                                    value={reinsuranceLimit}
                                    onChange={(e) => setReinsuranceLimit(Number(e.target.value))}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-ash bg-carbon shrink-0">
                    <button 
                        className="w-full bg-blue hover:bg-opacity-90 text-pure font-sans text-[16px] font-semibold rounded-[6px] h-[48px] flex items-center justify-center transition-colors shadow-[0_4px_14px_rgba(31,111,235,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={runSimulation}
                        disabled={status === 'running'}
                    >
                        {status === 'running' ? (
                            <div className="flex items-center">
                                <div className="icon-loader animate-spin mr-2"></div>
                                Calculating...
                            </div>
                        ) : (
                            <span>Run Simulation <div className="icon-arrow-right inline-block ml-1"></div></span>
                        )}
                    </button>
                    <div className="text-center mt-3 font-sans text-[11px] text-fog">Estimated run time: &lt;2 seconds</div>
                </div>
            </div>

            {/* Right Panel: Results */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate relative">
                
                {status === 'idle' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                        <div className="w-[400px] h-[300px] border-2 border-dashed border-ash rounded-[12px] flex flex-col items-center justify-center bg-carbon/30">
                            <div className="w-16 h-16 rounded-full bg-graphite flex items-center justify-center mb-4">
                                <div className="icon-activity text-fog text-2xl"></div>
                            </div>
                            <h3 className="font-mono text-[18px] text-pure mb-2">Ready to Simulate</h3>
                            <p className="font-sans text-sm text-fog text-center max-w-xs">Configure the earthquake parameters on the left and run the scenario to generate PML results.</p>
                        </div>
                    </div>
                )}

                {status === 'running' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-20 bg-slate/80 backdrop-blur-sm">
                        <div className="w-16 h-16 border-4 border-ash border-t-blue rounded-full animate-spin mb-6"></div>
                        <h3 className="font-mono text-[20px] text-pure animate-pulse">Running Monte Carlo simulation...</h3>
                        <p className="font-mono text-sm text-fog mt-2">Processing 10,000 localized events</p>
                    </div>
                )}

                {status === 'completed' && results && (
                    <div className="flex-1 overflow-y-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        
                        {/* Header Box */}
                        <div className="card p-8 mb-8 border-l-[4px] border-red">
                            <div className="font-sans text-sm text-fog font-bold uppercase tracking-wider mb-2">Expected Gross Loss</div>
                            <div className="font-mono text-[56px] leading-none text-red font-light mb-6">
                                <DZDArmount value={results.grossLoss} />
                            </div>
                            
                            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-ash">
                                <div>
                                    <div className="font-sans text-[12px] text-fog uppercase mb-1">Scenario Parameters</div>
                                    <div className="font-mono text-sm text-pure">{results.zone} | M{results.magnitude.toFixed(1)}</div>
                                </div>
                                <div>
                                    <div className="font-sans text-[12px] text-fog uppercase mb-1">Reinsurance Recovery</div>
                                    <div className="font-mono text-[18px] text-green"><DZDArmount value={results.recovered} /></div>
                                </div>
                                <div>
                                    <div className="font-sans text-[12px] text-fog uppercase mb-1">Net Company Loss</div>
                                    <div className="font-mono text-[18px] text-pure"><DZDArmount value={results.netLoss} overLimit={results.netLoss >= reinsuranceLimit} /></div>
                                </div>
                            </div>
                        </div>

                        {/* Assessment / Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            
                            {/* Breakdown & Assessment */}
                            <div className="flex flex-col gap-6">
                                {/* Verdict Box */}
                                <div className={`p-4 rounded-[6px] border flex items-start gap-4 ${results.netLoss >= reinsuranceLimit ? 'bg-red/10 border-red/30' : 'bg-green/10 border-green/30'}`}>
                                    <div className={`mt-0.5 text-xl ${results.netLoss >= reinsuranceLimit ? 'icon-triangle-alert text-red' : 'icon-shield-check text-green'}`}></div>
                                    <div>
                                        <h4 className={`font-mono text-[16px] font-semibold mb-1 ${results.netLoss >= reinsuranceLimit ? 'text-red' : 'text-green'}`}>
                                            {results.netLoss >= reinsuranceLimit ? 'Net Retention Exceeded' : 'Within Acceptable Limits'}
                                        </h4>
                                        <p className="font-sans text-sm text-cloud">
                                            {results.netLoss >= reinsuranceLimit 
                                                ? `This scenario produces a net loss that breaches the defined retention limit of ${formatDZD(reinsuranceLimit)}. Reinsurance treaty review is highly recommended.` 
                                                : `The expected net loss is contained within the current treaty limit of ${formatDZD(reinsuranceLimit)}. No immediate structural changes required.`}
                                        </p>
                                    </div>
                                </div>

                                {/* Stacked Bar Chart */}
                                <div className="card p-6 flex-1">
                                    <h3 className="font-mono text-sm uppercase text-fog font-semibold mb-4">Loss Breakdown by Nature</h3>
                                    <div className="h-12 w-full mb-4 relative">
                                        <canvas id="breakdownChart"></canvas>
                                    </div>
                                    <div className="flex justify-between font-sans text-[12px]">
                                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue"></div><span className="text-cloud">Res (<DZDArmount value={results.resLoss}/>)</span></div>
                                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber"></div><span className="text-cloud">Com (<DZDArmount value={results.comLoss}/>)</span></div>
                                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red"></div><span className="text-cloud">Ind (<DZDArmount value={results.indLoss}/>)</span></div>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline Chart */}
                            <div className="card p-6 flex flex-col">
                                <h3 className="font-mono text-sm uppercase text-fog font-semibold mb-4">Loss Sensitivity Curve</h3>
                                <div className="flex-1 relative min-h-[200px]">
                                    <canvas id="timelineChart"></canvas>
                                </div>
                            </div>
                        </div>

                        {/* Top Affected Contracts Table */}
                        <div className="card overflow-hidden">
                            <div className="p-4 border-b border-ash bg-carbon flex justify-between items-center">
                                <h3 className="font-mono text-[16px] font-semibold text-pure">Top Affected Contracts</h3>
                                <button className="text-sm font-sans text-fog hover:text-pure transition-colors">Export Details</button>
                            </div>
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="bg-graphite border-b border-ash">
                                    <tr>
                                        <th className="px-4 py-2 font-sans text-[12px] font-semibold text-fog w-16">Rank</th>
                                        <th className="px-4 py-2 font-sans text-[12px] font-semibold text-fog">Contract Name</th>
                                        <th className="px-4 py-2 font-sans text-[12px] font-semibold text-fog">Wilaya</th>
                                        <th className="px-4 py-2 font-sans text-[12px] font-semibold text-fog text-center">Vuln</th>
                                        <th className="px-4 py-2 font-sans text-[12px] font-semibold text-fog text-right">Expected Loss (DZD)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-ash">
                                    {results.contracts.slice(0,10).map((c, i) => (
                                        <tr key={c.id} className="hover:bg-graphite transition-colors">
                                            <td className="px-4 py-3 font-mono text-[12px] text-fog">#{i+1}</td>
                                            <td className="px-4 py-3 font-sans text-[14px] text-pure font-medium">{c.name}</td>
                                            <td className="px-4 py-3 font-sans text-[13px] text-cloud">{c.wilaya}</td>
                                            <td className="px-4 py-3 text-center font-mono text-[12px] text-amber">{c.vuln.toFixed(2)}</td>
                                            <td className="px-4 py-3 font-mono text-[14px] text-red font-medium text-right"><DZDArmount value={c.loss} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                    </div>
                )}

                {/* Scenario History Bottom Strip */}
                {history.length > 0 && (
                    <div className="h-[72px] bg-carbon border-t border-ash px-6 flex items-center shrink-0 overflow-x-auto scrollbar-hide z-10">
                        <div className="font-mono text-[11px] font-bold uppercase text-fog mr-6 shrink-0">Recent Scenarios</div>
                        <div className="flex gap-4">
                            {history.map(item => (
                                <button 
                                    key={item.id}
                                    className={`px-4 py-2 rounded border flex items-center gap-4 text-left min-w-[240px] transition-colors shrink-0
                                        ${item.id === results?.id ? 'bg-graphite border-teal' : 'bg-transparent border-ash hover:border-fog'}
                                    `}
                                    onClick={() => setResults(item)}
                                >
                                    <div>
                                        <div className="font-sans text-[12px] text-pure font-semibold leading-tight">{item.zone}</div>
                                        <div className="font-mono text-[11px] text-fog">M{item.magnitude.toFixed(1)}</div>
                                    </div>
                                    <div className="font-mono text-[13px] text-red ml-auto"><DZDArmount value={item.grossLoss} /></div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
            </div>
            
        </div>
    );
};