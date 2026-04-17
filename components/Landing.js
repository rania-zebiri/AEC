const FEATURES = [
    "Real-time exposure tracking per wilaya",
    "PML Monte Carlo simulation engine",
    "Automated ACAPS regulatory reporting",
    "RPA 99 Zone classification mapping",
    "Underwriting capacity limits & checks",
    "Building vulnerability auto-scoring",
    "Live CRAAG seismic API integration",
    "Portfolio Balance Index calculation",
    "Reinsurance treaty net loss modeling",
    "Contract-level geographical drill-down",
    "Zone III over-concentration alerts",
    "Historical risk trend visualization",
    "Interactive GIS chloropleth mapping",
    "Multi-language (FR/AR) document export",
    "Role-based access (Manager/Underwriter)",
    "Comprehensive system audit logging",
    "Customizable warning thresholds",
    "What-if scenario & impact builder",
    "Bulk portfolio data import (CSV/Excel)",
    "Actionable strategic recommendations"
];

const Landing = () => {
    return (
        <div className="min-h-screen bg-slate text-cloud relative selection:bg-teal/30 selection:text-teal" data-name="landing-page" data-file="components/Landing.js">
            
            {/* Global Noise Overlay */}
            <div className="fixed inset-0 noise-bg z-50"></div>

            {/* Minimal Header */}
            <header className="absolute top-0 left-0 w-full px-8 py-6 z-40 flex justify-between items-center">
                <div className="font-mono text-2xl font-bold tracking-tighter text-pure flex items-center gap-2">
                    <div className="icon-activity text-teal"></div>
                    TREMOR
                </div>
                <div className="flex gap-6 items-center">
                    <a href="index.html" className="font-sans text-sm text-fog hover:text-pure transition-colors">Sign In</a>
                    <a href="#contact" className="btn-outline h-[36px] px-4 text-sm hidden md:flex">Request Demo</a>
                </div>
            </header>

            {/* SECTION 1 - HERO */}
            <section className="relative w-full min-h-screen flex items-center overflow-hidden pt-20">
                {/* Background splits */}
                <div className="absolute inset-0 flex">
                    <div className="w-full md:w-[55%] bg-slate relative z-10"></div>
                    <div className="hidden md:block w-[45%] bg-[#0A0D12] relative border-l border-ash/30">
                        {/* Map Container */}
                        <div className="absolute inset-0 map-rotate origin-center opacity-70">
                            <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Algeria_location_map.svg/1024px-Algeria_location_map.svg.png')] bg-contain bg-no-repeat bg-center opacity-20 filter grayscale invert"></div>
                            
                            {/* Hotspot Pulses */}
                            <div className="absolute top-[30%] left-[45%] w-3 h-3 bg-red rounded-full shadow-[0_0_20px_rgba(218,54,51,1)]">
                                <div className="animate-ping absolute inset-0 rounded-full bg-red opacity-75"></div>
                            </div>
                            <div className="absolute top-[28%] left-[52%] w-2 h-2 bg-amber rounded-full shadow-[0_0_15px_rgba(210,153,34,1)]"></div>
                            <div className="absolute top-[45%] left-[65%] w-2 h-2 bg-green rounded-full shadow-[0_0_15px_rgba(46,160,67,1)]"></div>
                            
                            {/* Floating Map Cards */}
                            <div className="absolute top-[32%] left-[25%] bg-carbon/90 backdrop-blur border border-red/40 rounded-[6px] p-3 shadow-modal max-w-[240px] transform -rotate-2">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="font-sans text-[12px] font-bold text-pure">Tipaza</div>
                                    <div className="font-mono text-[10px] bg-red/20 text-red px-1.5 py-0.5 rounded">⚠ Hotspot</div>
                                </div>
                                <div className="font-mono text-[11px] text-fog">Zone III</div>
                                <div className="mt-2 pt-2 border-t border-ash/50 flex justify-between">
                                    <div>
                                        <div className="text-[9px] font-sans text-fog uppercase">Exposure</div>
                                        <div className="font-mono text-[13px] text-red font-bold">2.5B DZD</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[9px] font-sans text-fog uppercase">Capacity</div>
                                        <div className="font-mono text-[13px] text-cloud">1.0B DZD</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="absolute top-[15%] left-[55%] bg-carbon/90 backdrop-blur border border-ash rounded-[6px] p-3 shadow-modal transform rotate-1">
                                <div className="text-[9px] font-sans text-fog uppercase mb-1">PML Est. (Algiers Basin M6.5)</div>
                                <div className="font-mono text-[16px] text-pure">3.2B DZD</div>
                            </div>
                        </div>
                        {/* Right side fade gradients */}
                        <div className="absolute inset-0 bg-gradient-to-r from-slate via-transparent to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate via-transparent to-slate opacity-80"></div>
                    </div>
                </div>

                <div className="max-w-[1440px] w-full mx-auto px-8 relative z-20 flex">
                    <div className="w-full md:w-[55%] pr-0 md:pr-12 lg:pr-24">
                        <div className="font-mono text-[13px] font-semibold text-teal tracking-widest uppercase mb-6 flex items-center gap-3">
                            <span className="w-8 h-px bg-teal"></span>
                            Seismic Risk Intelligence — Algeria
                        </div>
                        
                        <h1 className="text-[48px] lg:text-[64px] font-mono font-medium text-pure leading-[1.1] mb-6">
                            You cannot manage <br/>
                            <span className="text-fog">what you cannot see.</span>
                        </h1>
                        
                        <p className="font-sans text-[18px] lg:text-[20px] text-cloud leading-relaxed max-w-[480px] mb-10">
                            TREMOR gives Algerian insurance companies a real-time view of their seismic exposure — by wilaya, by zone, by contract — before the next earthquake decides for you.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 mb-16">
                            <a href="#contact" className="btn-primary">Request a Demo <div className="icon-arrow-right ml-2"></div></a>
                            <a href="#solution" className="btn-outline">See How It Works</a>
                        </div>

                        {/* Social Proof */}
                        <div className="pt-8 border-t border-ash max-w-[480px]">
                            <p className="font-sans text-[12px] text-fog mb-4 uppercase tracking-wider">Trusted by insurers managing over 40 billion DZD in exposure</p>
                            <div className="flex gap-8 items-center opacity-40 grayscale">
                                <div className="font-mono text-xl font-bold">ALLIANCE</div>
                                <div className="font-mono text-xl font-bold">TRUST</div>
                                <div className="font-mono text-xl font-bold">CAAT</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Seismic Wave SVG Bottom Divider */}
                <div className="absolute bottom-0 left-0 w-full h-[120px] overflow-hidden z-10 pointer-events-none">
                    <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full h-full text-teal opacity-20">
                        <path d="M0,60 L50,60 L60,20 L70,100 L80,40 L90,80 L100,60 L250,60 L260,10 L270,110 L280,30 L290,90 L300,60 L500,60 L510,0 L520,120 L530,20 L540,100 L550,60 L800,60 L810,40 L820,80 L830,60 L1100,60 L1110,10 L1120,110 L1130,30 L1140,90 L1150,60 L1440,60" 
                              fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                    </svg>
                </div>
            </section>

            {/* SECTION 2 - THE PROBLEM */}
            <section className="py-24 px-8 bg-slate relative">
                <div className="max-w-[1000px] mx-auto text-center">
                    <div className="font-mono text-[13px] font-semibold text-teal tracking-widest uppercase mb-4">The Problem</div>
                    <h2 className="text-[32px] md:text-[40px] font-mono text-pure leading-tight mb-16 max-w-[800px] mx-auto">
                        Right now, your portfolio is a spreadsheet. An earthquake doesn't care about spreadsheets.
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                        {/* Problem Card 1 */}
                        <div className="bg-graphite border border-ash rounded-[8px] p-6 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-red transition-all duration-300 group-hover:w-1.5"></div>
                            <div className="w-10 h-10 rounded bg-red/10 flex items-center justify-center mb-5">
                                <div className="icon-folder-search text-red text-xl"></div>
                            </div>
                            <h3 className="font-sans text-[18px] font-bold text-pure mb-3">Blind Accumulation</h3>
                            <p className="font-sans text-sm text-fog leading-relaxed">
                                You have contracts across 48 wilayas. Do you know which ones are over your retention limit right now?
                            </p>
                        </div>
                        
                        {/* Problem Card 2 */}
                        <div className="bg-graphite border border-ash rounded-[8px] p-6 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-amber transition-all duration-300 group-hover:w-1.5"></div>
                            <div className="w-10 h-10 rounded bg-amber/10 flex items-center justify-center mb-5">
                                <div className="icon-clock text-amber text-xl"></div>
                            </div>
                            <h3 className="font-sans text-[18px] font-bold text-pure mb-3">Manual Reports Take Days</h3>
                            <p className="font-sans text-sm text-fog leading-relaxed">
                                When ACAPS asks for your seismic exposure report, your team spends 3 days collecting data manually.
                            </p>
                        </div>

                        {/* Problem Card 3 */}
                        <div className="bg-graphite border border-ash rounded-[8px] p-6 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-red transition-all duration-300 group-hover:w-1.5"></div>
                            <div className="w-10 h-10 rounded bg-red/10 flex items-center justify-center mb-5">
                                <div className="icon-activity text-red text-xl"></div>
                            </div>
                            <h3 className="font-sans text-[18px] font-bold text-pure mb-3">Earthquakes Don't Wait</h3>
                            <p className="font-sans text-sm text-fog leading-relaxed">
                                When a tremor hits at 3AM, how long before you know which contracts are affected and your estimated loss?
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 3 - THE SOLUTION */}
            <section id="solution" className="py-24 px-8 bg-[#0B0E14] border-y border-ash">
                <div className="max-w-[1200px] mx-auto">
                    <div className="text-center mb-24">
                        <div className="font-mono text-[13px] font-semibold text-teal tracking-widest uppercase mb-4">The Solution</div>
                        <h2 className="text-[32px] md:text-[40px] font-mono text-pure">
                            Everything you need to see, decide, and act.
                        </h2>
                    </div>

                    <div className="space-y-32">
                        {/* Feature 1 */}
                        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                            <div className="w-full md:w-1/2">
                                <div className="bg-slate border border-ash rounded-[12px] p-2 shadow-glow">
                                    <div className="bg-carbon rounded-[8px] border border-ash aspect-[4/3] relative overflow-hidden flex flex-col">
                                        {/* Mockup Header */}
                                        <div className="h-8 border-b border-ash bg-graphite flex items-center px-4 gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red"></div>
                                            <div className="w-2 h-2 rounded-full bg-amber"></div>
                                            <div className="w-2 h-2 rounded-full bg-green"></div>
                                        </div>
                                        <div className="flex-1 bg-[#0A0D12] relative overflow-hidden flex items-center justify-center">
                                            <div className="absolute inset-0 opacity-40 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Algeria_location_map.svg/500px-Algeria_location_map.svg.png')] bg-contain bg-no-repeat bg-center"></div>
                                            <div className="w-32 h-24 bg-carbon/90 border border-teal rounded p-2 shadow-modal z-10 mr-12 text-[8px] font-sans text-fog">
                                                <div className="text-pure font-bold mb-1">Blida (Zone III)</div>
                                                <div className="h-1 w-full bg-ash mb-1"><div className="h-full bg-red w-[85%]"></div></div>
                                                <div>Cap: 85% used</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full md:w-1/2">
                                <div className="font-mono text-[11px] font-bold text-teal bg-teal/10 px-2 py-1 rounded inline-block mb-4">FEATURE 01 — GIS RISK MAP</div>
                                <h3 className="text-[28px] font-mono text-pure mb-4 leading-tight">See every dinar on the map.</h3>
                                <p className="font-sans text-[16px] text-fog leading-relaxed mb-6">
                                    Every contract placed on an interactive map of Algeria. Colored by seismic zone. Click any wilaya and instantly see your total exposure, top contracts, and retention status.
                                </p>
                                <ul className="space-y-3 font-sans text-sm text-cloud">
                                    <li className="flex items-center gap-3"><span className="w-4 h-px bg-teal"></span> Real-time chloropleth by RPA zone</li>
                                    <li className="flex items-center gap-3"><span className="w-4 h-px bg-teal"></span> One-click wilaya exposure detail</li>
                                    <li className="flex items-center gap-3"><span className="w-4 h-px bg-teal"></span> Hotspot pulse indicators</li>
                                </ul>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-20">
                            <div className="w-full md:w-1/2">
                                <div className="bg-slate border border-ash rounded-[12px] p-2 shadow-glow">
                                    <div className="bg-carbon rounded-[8px] border border-ash aspect-[4/3] relative overflow-hidden flex p-4 gap-4">
                                        <div className="w-1/3 border-r border-ash pr-4 flex flex-col gap-4">
                                            <div className="h-2 w-16 bg-ash rounded"></div>
                                            <div className="h-1 w-full bg-teal rounded"></div>
                                            <div className="h-8 w-full border border-ash rounded mt-auto"></div>
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center gap-4">
                                            <div className="text-[10px] text-fog uppercase tracking-wider">Gross Loss Est.</div>
                                            <div className="text-3xl font-mono text-red">3.2B DZD</div>
                                            <div className="h-24 w-full bg-graphite border border-ash rounded flex items-end p-2 gap-1">
                                                <div className="flex-1 bg-teal/20 h-[20%]"></div>
                                                <div className="flex-1 bg-teal/40 h-[40%]"></div>
                                                <div className="flex-1 bg-teal h-[80%]"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full md:w-1/2">
                                <div className="font-mono text-[11px] font-bold text-teal bg-teal/10 px-2 py-1 rounded inline-block mb-4">FEATURE 02 — PML SIMULATOR</div>
                                <h3 className="text-[28px] font-mono text-pure mb-4 leading-tight">Run earthquake scenarios before they run you.</h3>
                                <p className="font-sans text-[16px] text-fog leading-relaxed mb-6">
                                    Select a zone, choose a magnitude, and TREMOR calculates your Probable Maximum Loss in DZD — including reinsurance recovery and net company exposure — in under 2 seconds.
                                </p>
                                <ul className="space-y-3 font-sans text-sm text-cloud">
                                    <li className="flex items-center gap-3"><span className="w-4 h-px bg-teal"></span> Magnitude 4.0 → 8.0 scenarios</li>
                                    <li className="flex items-center gap-3"><span className="w-4 h-px bg-teal"></span> Contract-level loss breakdown</li>
                                    <li className="flex items-center gap-3"><span className="w-4 h-px bg-teal"></span> Reinsurance netting calculation</li>
                                </ul>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                            <div className="w-full md:w-1/2">
                                <div className="bg-slate border border-ash rounded-[12px] p-2 shadow-glow">
                                    <div className="bg-carbon rounded-[8px] border border-ash aspect-[4/3] relative overflow-hidden flex flex-col p-4">
                                        <div className="flex-1 border border-ash rounded bg-graphite p-4 flex gap-4">
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3 w-32 bg-ash rounded"></div>
                                                <div className="h-3 w-48 bg-carbon rounded"></div>
                                                <div className="h-3 w-24 bg-carbon rounded"></div>
                                            </div>
                                            <div className="w-[120px] bg-carbon border border-red/30 rounded p-3 flex flex-col items-center justify-center text-center">
                                                <div className="w-6 h-6 rounded-full bg-red/10 flex items-center justify-center mb-2">
                                                    <div className="icon-x text-red text-[12px]"></div>
                                                </div>
                                                <div className="text-[10px] font-mono font-bold text-red mb-1">REJECTED</div>
                                                <div className="text-[7px] text-fog leading-tight">Exceeds Zone III retention limits</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full md:w-1/2">
                                <div className="font-mono text-[11px] font-bold text-teal bg-teal/10 px-2 py-1 rounded inline-block mb-4">FEATURE 03 — UNDERWRITING ASSISTANT</div>
                                <h3 className="text-[28px] font-mono text-pure mb-4 leading-tight">Accept or reject in 10 seconds, not 3 days.</h3>
                                <p className="font-sans text-[16px] text-fog leading-relaxed mb-6">
                                    When a broker submits a new contract, TREMOR checks the remaining retention capacity in that zone and gives an instant decision: Accept, Reject, or Accept with conditions.
                                </p>
                                <ul className="space-y-3 font-sans text-sm text-cloud">
                                    <li className="flex items-center gap-3"><span className="w-4 h-px bg-teal"></span> Automated capacity check per zone</li>
                                    <li className="flex items-center gap-3"><span className="w-4 h-px bg-teal"></span> Vulnerability auto-scoring by building type</li>
                                    <li className="flex items-center gap-3"><span className="w-4 h-px bg-teal"></span> Conditions and premium suggestions included</li>
                                </ul>
                            </div>
                        </div>

                        {/* Feature 4 */}
                        <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-20">
                            <div className="w-full md:w-1/2">
                                <div className="bg-slate border border-ash rounded-[12px] p-2 shadow-glow">
                                    <div className="bg-carbon rounded-[8px] border border-ash aspect-[4/3] relative overflow-hidden flex items-center justify-center p-4">
                                        <div className="w-3/4 h-full bg-pure rounded shadow-paper flex flex-col p-4">
                                            <div className="h-2 w-24 bg-slate/20 rounded mb-4"></div>
                                            <div className="h-4 w-48 bg-slate/80 rounded mx-auto mb-6"></div>
                                            <div className="space-y-2 mb-4">
                                                <div className="h-1.5 w-full bg-slate/20 rounded"></div>
                                                <div className="h-1.5 w-full bg-slate/20 rounded"></div>
                                                <div className="h-1.5 w-3/4 bg-slate/20 rounded"></div>
                                            </div>
                                            <div className="w-full h-12 border border-slate/20 mt-auto flex">
                                                <div className="w-1/3 border-r border-slate/20"></div>
                                                <div className="flex-1"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full md:w-1/2">
                                <div className="font-mono text-[11px] font-bold text-teal bg-teal/10 px-2 py-1 rounded inline-block mb-4">FEATURE 04 — REGULATORY REPORTING</div>
                                <h3 className="text-[28px] font-mono text-pure mb-4 leading-tight">ACAPS report. One click. Ten seconds.</h3>
                                <p className="font-sans text-[16px] text-fog leading-relaxed mb-6">
                                    The regulator visits. Your employee clicks one button. A complete, formatted French or Arabic-language seismic exposure report is ready to print. No manual data collection, no weekend overtime.
                                </p>
                                <ul className="space-y-3 font-sans text-sm text-cloud">
                                    <li className="flex items-center gap-3"><span className="w-4 h-px bg-teal"></span> ACAPS-compliant format</li>
                                    <li className="flex items-center gap-3"><span className="w-4 h-px bg-teal"></span> Arabic or French output</li>
                                    <li className="flex items-center gap-3"><span className="w-4 h-px bg-teal"></span> Always reflects live portfolio data</li>
                                </ul>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* SECTION 4 - METRICS / PROOF */}
            <section className="py-24 px-8 bg-slate border-b border-ash relative">
                <div className="max-w-[1000px] mx-auto text-center">
                    <h3 className="font-sans text-sm text-fog uppercase tracking-widest mb-16">Built for Algerian insurance realities</h3>
                    
                    <div className="flex flex-col md:flex-row justify-center gap-12 md:gap-24 mb-20">
                        <div>
                            <div className="font-mono text-[56px] font-light text-teal leading-none mb-2">48</div>
                            <div className="font-sans text-[15px] text-fog">Wilayas mapped with RPA data</div>
                        </div>
                        <div>
                            <div className="font-mono text-[56px] font-light text-teal leading-none mb-2">&lt; 2s</div>
                            <div className="font-sans text-[15px] text-fog">Average PML simulation time</div>
                        </div>
                        <div>
                            <div className="font-mono text-[56px] font-light text-teal leading-none mb-2">5</div>
                            <div className="font-sans text-[15px] text-fog">Seismic zones classified</div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-teal/20 mb-16 max-w-[400px] mx-auto"></div>

                    <div className="max-w-[700px] mx-auto">
                        <p className="font-sans text-[22px] md:text-[26px] text-pure italic leading-relaxed mb-6">
                            "Risk accumulation is invisible until it is catastrophic. The question is not whether an earthquake will happen — it is whether you will be ready when it does."
                        </p>
                        <div className="font-sans text-sm text-fog uppercase tracking-widest">— Risk Manager, Major Algerian Insurer</div>
                    </div>
                </div>
            </section>

            {/* SECTION 5 - FULL FEATURE LIST */}
            <section className="py-24 px-8 bg-[#0B0E14]">
                <div className="max-w-[1000px] mx-auto">
                    <div className="text-center mb-16">
                        <div className="font-mono text-[13px] font-semibold text-teal tracking-widest uppercase mb-4">ALL 20 FEATURES</div>
                        <h2 className="text-[32px] font-mono text-pure">Nothing is missing.</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4">
                        {FEATURES.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-4 py-3 border-b border-ash/50 group">
                                <div className="font-mono text-[13px] text-teal w-6 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">{(idx + 1).toString().padStart(2, '0')}</div>
                                <div className="font-sans text-[15px] text-cloud group-hover:text-pure transition-colors">{feature}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 6 - HOW IT WORKS */}
            <section className="py-24 px-8 bg-slate border-y border-ash">
                <div className="max-w-[1000px] mx-auto">
                    <div className="text-center mb-20">
                        <div className="font-mono text-[13px] font-semibold text-teal tracking-widest uppercase mb-4">ONBOARDING</div>
                        <h2 className="text-[32px] font-mono text-pure">Up and running in one week.</h2>
                    </div>

                    <div className="flex flex-col md:flex-row relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-px bg-ash z-0"></div>

                        {/* Step 1 */}
                        <div className="flex-1 relative z-10 flex flex-col items-center text-center px-4 mb-12 md:mb-0">
                            <div className="w-14 h-14 rounded-full bg-slate border-[2px] border-teal flex items-center justify-center font-mono text-xl text-teal mb-6 shadow-[0_0_15px_rgba(57,208,216,0.2)]">1</div>
                            <h3 className="font-sans text-[18px] font-bold text-pure mb-3">Import</h3>
                            <p className="font-sans text-sm text-fog leading-relaxed">
                                Upload your existing portfolio data (Excel or CSV). TREMOR maps every contract to its RPA zone automatically.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="flex-1 relative z-10 flex flex-col items-center text-center px-4 mb-12 md:mb-0">
                            <div className="w-14 h-14 rounded-full bg-carbon border-[2px] border-ash flex items-center justify-center font-mono text-xl text-cloud mb-6">2</div>
                            <h3 className="font-sans text-[18px] font-bold text-pure mb-3">Configure</h3>
                            <p className="font-sans text-sm text-fog leading-relaxed">
                                Set your retention capacity by zone. Connect the CRAAG seismic API. Invite your team.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="flex-1 relative z-10 flex flex-col items-center text-center px-4">
                            <div className="w-14 h-14 rounded-full bg-carbon border-[2px] border-ash flex items-center justify-center font-mono text-xl text-cloud mb-6">3</div>
                            <h3 className="font-sans text-[18px] font-bold text-pure mb-3">Operate</h3>
                            <p className="font-sans text-sm text-fog leading-relaxed">
                                From day one, see your full risk picture. Run simulations. Generate reports. Make better decisions.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 7 - CTA / CONTACT */}
            <section id="contact" className="py-24 px-8 bg-[#0A0D12]">
                <div className="max-w-[640px] mx-auto bg-carbon border border-ash rounded-[12px] p-8 md:p-12 shadow-modal text-center">
                    <h2 className="text-[32px] md:text-[36px] font-mono text-pure leading-tight mb-4">
                        Ready to see your portfolio clearly?
                    </h2>
                    <p className="font-sans text-[16px] text-cloud mb-10">
                        TREMOR is available for Algerian insurance companies. Contact us to schedule a demonstration with your actual portfolio data.
                    </p>

                    <form className="space-y-4 text-left" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="font-sans text-[12px] text-fog mb-1 block">Company Name</label>
                                <input type="text" className="input-field bg-[#0A0D12]" placeholder="e.g. SAA, CAAT, CASH" required />
                            </div>
                            <div>
                                <label className="font-sans text-[12px] text-fog mb-1 block">Your Name</label>
                                <input type="text" className="input-field bg-[#0A0D12]" placeholder="Full name" required />
                            </div>
                        </div>
                        <div>
                            <label className="font-sans text-[12px] text-fog mb-1 block">Professional Email</label>
                            <input type="email" className="input-field bg-[#0A0D12]" placeholder="name@company.dz" required />
                        </div>
                        <div>
                            <label className="font-sans text-[12px] text-fog mb-1 block">Phone Number (Optional)</label>
                            <input type="tel" className="input-field bg-[#0A0D12]" placeholder="+213..." />
                        </div>
                        
                        <div className="pt-4">
                            <button type="submit" className="btn-primary w-full h-[52px] text-[16px]">Request a Demo <div className="icon-arrow-right ml-2"></div></button>
                        </div>
                    </form>

                    <div className="mt-8 pt-8 border-t border-ash">
                        <p className="font-sans text-[13px] text-fog">
                            Or email us directly at <a href="mailto:contact@tremor-risk.dz" className="text-teal hover:underline">contact@tremor-risk.dz</a>
                        </p>
                    </div>
                </div>
            </section>

            {/* SECTION 8 - FOOTER */}
            <footer className="bg-slate border-t border-ash py-12 px-8">
                <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 border-b border-ash/50 pb-12">
                    {/* Brand */}
                    <div>
                        <div className="font-mono text-xl font-bold tracking-tighter text-pure flex items-center gap-2 mb-4">
                            <div className="icon-activity text-teal"></div>
                            TREMOR
                        </div>
                        <p className="font-sans text-sm text-fog mb-6">Seismic Risk Intelligence for Algeria.</p>
                        <div className="flex gap-3">
                            <div className="flex items-center gap-2 px-3 py-1 bg-graphite border border-ash rounded-[4px] font-sans text-[10px] text-cloud font-semibold uppercase tracking-wider">
                                <div className="icon-radio-tower text-teal"></div> CRAAG Connected
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-graphite border border-ash rounded-[4px] font-sans text-[10px] text-cloud font-semibold uppercase tracking-wider">
                                <div className="icon-shield-check text-blue"></div> RPA 99 Ready
                            </div>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-mono text-[14px] font-bold text-pure mb-4 uppercase tracking-wider">Product</h4>
                        <ul className="space-y-3 font-sans text-sm text-fog">
                            <li><a href="index.html" className="hover:text-teal transition-colors">Dashboard Preview</a></li>
                            <li><a href="#solution" className="hover:text-teal transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-teal transition-colors">Pricing Structure</a></li>
                            <li><a href="#contact" className="hover:text-teal transition-colors">Contact Sales</a></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-mono text-[14px] font-bold text-pure mb-4 uppercase tracking-wider">Legal</h4>
                        <ul className="space-y-3 font-sans text-sm text-fog">
                            <li><a href="#" className="hover:text-pure transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-pure transition-colors">Terms of Use</a></li>
                            <li><a href="#" className="hover:text-pure transition-colors">Data Residency (Algeria)</a></li>
                            <li><a href="#" className="hover:text-pure transition-colors">ACAPS Compliance Statement</a></li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="font-sans text-[12px] text-fog">© 2026 TREMOR Risk Systems. All rights reserved.</p>
                    <p className="font-sans text-[12px] text-fog flex items-center gap-2">
                        Made in Algeria 🇩🇿
                    </p>
                </div>
            </footer>

        </div>
    );
};