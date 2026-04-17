const Dashboard = () => {
    const totalExposure = 14500000000;
    const pml = 3200000000;
    
    // Top 5 Risky Contracts
    const topContracts = [
        { id: 1, name: 'Sonatrach Hassi Messaoud', wilaya: 'Ouargla', zone: 'IIb', value: 850000000, risk: 85 },
        { id: 2, name: 'Port of Algiers', wilaya: 'Algiers', zone: 'III', value: 420000000, risk: 92 },
        { id: 3, name: 'Cevital Bejaia Complex', wilaya: 'Bejaia', zone: 'III', value: 380000000, risk: 88 },
        { id: 4, name: 'Sonelgaz Boufarik', wilaya: 'Blida', zone: 'III', value: 210000000, risk: 78 },
        { id: 5, name: 'Oran Olympic Stadium', wilaya: 'Oran', zone: 'IIa', value: 150000000, risk: 65 }
    ];

    // CRAAG Events
    const recentEvents = [
        { id: 1, time: '2 hours ago', location: 'Chlef', mag: 4.2, affected: 145 },
        { id: 2, time: 'Yesterday', location: 'Tipaza', mag: 3.1, affected: 12 },
        { id: 3, time: '3 days ago', location: 'Mascara', mag: 2.8, affected: 0 }
    ];

    React.useEffect(() => {
        // Initialize charts
        const ctxDonut = document.getElementById('zoneDonutChart');
        const ctxLine = document.getElementById('exposureTrendChart');
        let donutChart, lineChart;

        if (ctxDonut) {
            donutChart = new ChartJS(ctxDonut, {
                type: 'doughnut',
                data: {
                    labels: ['Zone 0', 'Zone I', 'Zone IIa', 'Zone IIb', 'Zone III'],
                    datasets: [{
                        data: [15, 20, 25, 10, 30],
                        backgroundColor: ['#2EA043', '#A3A020', '#D29922', '#E3622A', '#DA3633'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '75%',
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }

        if (ctxLine) {
            lineChart = new ChartJS(ctxLine, {
                type: 'line',
                data: {
                    labels: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
                    datasets: [{
                        data: [13.2, 13.5, 13.8, 14.1, 14.3, 14.5],
                        borderColor: '#39D0D8',
                        tension: 0.4,
                        pointRadius: 0,
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { display: false },
                        y: { display: false }
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
        <div data-name="dashboard-page" data-file="components/Dashboard.js">
            <h1 className="text-[36px] font-mono font-normal leading-[1.15] mb-8">Dashboard</h1>
            
            {/* Top KPI Strip */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <div className="card p-5 flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="icon-chart-pie text-fog"></div>
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
                        <div className="icon-target text-fog"></div>
                        <span className="font-sans text-sm font-bold text-fog uppercase">Zone III Conc.</span>
                    </div>
                    <div>
                        <div className="font-mono text-[20px] font-medium text-red">30%</div>
                        <TrendArrow value={1.5} />
                    </div>
                </div>

                <div className="card p-5 flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="icon-activity text-fog"></div>
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
                        <div className="icon-scale text-fog"></div>
                        <span className="font-sans text-sm font-bold text-fog uppercase">Balance Index</span>
                    </div>
                    <div>
                        <div className="font-mono text-[20px] font-medium text-amber">72 / 100</div>
                        <span className="font-mono text-[11px] text-cloud ml-2">Needs Review</span>
                    </div>
                </div>

                <div className="card p-5 flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="icon-flame text-fog"></div>
                        <span className="font-sans text-sm font-bold text-fog uppercase">Active Hotspots</span>
                    </div>
                    <div>
                        <div className="font-mono text-[20px] font-medium text-pure">
                            <span className="bg-red bg-opacity-20 text-red px-2 py-0.5 rounded mr-2">3</span>
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
                        <button className="w-full mt-4 text-center text-sm font-sans text-fog hover:text-teal transition-colors">View all 10 →</button>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                       {/* Mini-Map Preview Interactive */}
                        <div className="card p-6 flex flex-col h-[240px]">
                           <h3 className="font-mono text-[18px] font-semibold mb-4">Live Seismic Map</h3>
                           <div id="mini-map" className="flex-1 bg-graphite border border-ash rounded-[6px] overflow-hidden">
                               {/* Leaflet va injecter la carte ici */}
                           </div>
                           <button onClick={() => setPage('map')} className="text-right mt-3 text-sm font-sans text-fog hover:text-teal transition-colors">
                               Open Full Screen Map →
                           </button>
                        </div>

                        {/* Monthly Exposure Change */}
                        <div className="card p-6 flex flex-col h-[240px]">
                            <h3 className="font-mono text-[18px] font-semibold mb-4">Exposure Trend</h3>
                            <div className="flex-1 relative mb-2">
                                <canvas id="exposureTrendChart"></canvas>
                            </div>
                            <div className="flex justify-between items-end border-t border-ash pt-3">
                                <div>
                                    <div className="font-sans text-sm text-fog">Current vs Last Month</div>
                                    <div className="font-mono text-[18px] text-pure">+200 000 000 DZD</div>
                                </div>
                                <TrendArrow value={1.4} />
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
                                <canvas id="zoneDonutChart"></canvas>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="font-mono text-[11px] text-fog">TOTAL</span>
                                    <span className="font-mono text-[14px] font-bold text-pure">14.5B</span>
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col gap-2">
                                {[
                                    { z: 'III', c: 'bg-[#DA3633]', pct: 30 },
                                    { z: 'IIa', c: 'bg-[#D29922]', pct: 25 },
                                    { z: 'I', c: 'bg-[#A3A020]', pct: 20 },
                                    { z: '0', c: 'bg-[#2EA043]', pct: 15 },
                                    { z: 'IIb', c: 'bg-[#E3622A]', pct: 10 },
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
                    <div className="card p-6">
                        <h3 className="font-mono text-[18px] font-semibold mb-4">Quick Actions</h3>
                        <div className="flex flex-col gap-3">
                            <button className="btn-primary w-full justify-start pl-4 group">
                                <div className="icon-activity mr-3 text-pure/70 group-hover:text-pure transition-colors"></div>
                                Run PML Simulation
                            </button>
                            <button className="h-[40px] rounded-[6px] bg-graphite border border-ash text-pure font-sans font-semibold flex items-center px-4 hover:bg-ash hover:border-fog transition-colors group">
                                <div className="icon-file-text mr-3 text-fog group-hover:text-pure transition-colors"></div>
                                Generate ACAPS Report
                            </button>
                            <button className="h-[40px] rounded-[6px] bg-graphite border border-ash text-pure font-sans font-semibold flex items-center px-4 hover:bg-ash hover:border-fog transition-colors group justify-between">
                                <div className="flex items-center">
                                    <div className="icon-clipboard-list mr-3 text-fog group-hover:text-pure transition-colors"></div>
                                    View Underwriting Queue
                                </div>
                                <span className="bg-blue text-pure text-[11px] font-mono px-2 py-0.5 rounded">14 pending</span>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};