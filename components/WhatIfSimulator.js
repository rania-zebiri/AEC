const MOCK_SCENARIOS = [
    {
        id: 'sc-1',
        name: 'New Mega-Project in Algiers',
        date: '2026-04-16',
        status: 'computed',
        selected: false,
        type: 'new_contract',
        params: {
            wilaya: '16 - Algiers',
            nature: 'Commercial',
            type: 'High-rise',
            value: 2500000000
        },
        results: {
            exposureChange: 2500000000,
            exposurePct: 17.2,
            pmlChange: 850000000,
            pmlPct: 26.5,
            balanceOld: 72,
            balanceNew: 58,
            narrative: "Accepting this contract increases Zone III concentration by 4.2% and reduces Balance Index from 72 to 58. Significant reinsurance required."
        }
    },
    {
        id: 'sc-2',
        name: 'Winter Earthquake Scenario',
        date: '2026-04-15',
        status: 'draft',
        selected: false,
        type: 'earthquake',
        params: {
            zone: 'Zone IIa (Oran)',
            magnitude: 6.2,
            date: '2026-12-15',
            damage: 45
        },
        results: null
    }
];

const CompareModal = ({ scenarios, onClose }) => {
    if (!scenarios || scenarios.length < 2) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate/80 backdrop-blur-sm p-8 animate-in fade-in duration-200">
            <div className="bg-carbon border border-ash rounded-[12px] shadow-modal w-full max-w-[1200px] flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-6 border-b border-ash flex items-center justify-between">
                    <h2 className="font-mono text-xl text-pure flex items-center gap-3">
                        <div className="icon-columns text-teal"></div>
                        Compare Scenarios
                    </h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded bg-graphite hover:bg-ash text-fog hover:text-pure transition-colors">
                        <div className="icon-x text-lg"></div>
                    </button>
                </div>

                {/* Compare Grid */}
                <div className="flex-1 overflow-x-auto p-6">
                    <div className="flex gap-6 min-w-max">
                        {scenarios.map((sc, idx) => (
                            <div key={sc.id} className="w-[350px] shrink-0 border border-ash rounded-[8px] bg-graphite flex flex-col">
                                <div className="p-4 border-b border-ash bg-carbon/50">
                                    <div className="font-mono text-sm text-fog mb-1">Scenario {idx + 1}</div>
                                    <div className="font-sans text-lg font-semibold text-pure truncate" title={sc.name}>{sc.name}</div>
                                    <div className="inline-block px-2 py-0.5 bg-blue/10 text-blue border border-blue/20 rounded text-[11px] font-sans font-bold uppercase mt-2">
                                        {sc.type.replace('_', ' ')}
                                    </div>
                                </div>
                                
                                <div className="p-4 flex-1 space-y-6">
                                    {sc.status === 'draft' ? (
                                        <div className="h-full flex flex-col items-center justify-center text-fog py-12">
                                            <div className="icon-calculator text-3xl mb-3 opacity-50"></div>
                                            <p className="font-sans text-sm text-center">This scenario is a draft. Calculate impact to compare results.</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <div className="font-sans text-[12px] text-fog uppercase font-semibold mb-2">Exposure Impact</div>
                                                <div className={`font-mono text-xl ${sc.results.exposureChange > 0 ? 'text-amber' : 'text-green'}`}>
                                                    {sc.results.exposureChange > 0 ? '+' : ''}<DZDArmount value={sc.results.exposureChange} />
                                                </div>
                                                <div className="font-mono text-[11px] text-cloud mt-1">{sc.results.exposureChange > 0 ? '+' : ''}{sc.results.exposurePct}% to portfolio</div>
                                            </div>

                                            <div>
                                                <div className="font-sans text-[12px] text-fog uppercase font-semibold mb-2">PML Impact</div>
                                                <div className={`font-mono text-xl ${sc.results.pmlChange > 0 ? 'text-red' : 'text-green'}`}>
                                                    {sc.results.pmlChange > 0 ? '+' : ''}<DZDArmount value={sc.results.pmlChange} />
                                                </div>
                                                <div className="font-mono text-[11px] text-cloud mt-1">{sc.results.pmlChange > 0 ? '+' : ''}{sc.results.pmlPct}% to PML</div>
                                            </div>

                                            <div>
                                                <div className="font-sans text-[12px] text-fog uppercase font-semibold mb-2">Balance Index</div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-mono text-lg text-fog line-through">{sc.results.balanceOld}</span>
                                                    <div className="icon-arrow-right text-fog text-sm"></div>
                                                    <span className={`font-mono text-xl font-bold ${sc.results.balanceNew < sc.results.balanceOld ? 'text-red' : 'text-green'}`}>{sc.results.balanceNew}</span>
                                                </div>
                                            </div>

                                            <div className="p-3 bg-carbon rounded-[6px] border border-ash/50 text-sm font-sans text-cloud leading-relaxed">
                                                {sc.results.narrative}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-ash bg-carbon flex justify-end gap-3">
                    <button className="btn-outline" onClick={onClose}>Close Comparison</button>
                    <button className="btn-primary flex items-center gap-2">
                        <div className="icon-download text-sm"></div>
                        Export Comparison Matrix
                    </button>
                </div>
            </div>
        </div>
    );
};

const WhatIfSimulator = () => {
    const [scenarios, setScenarios] = React.useState(MOCK_SCENARIOS);
    const [isComparing, setIsComparing] = React.useState(false);
    
    const selectedCount = scenarios.filter(s => s.selected).length;

    const handleAddScenario = () => {
        const newScenario = {
            id: `sc-${Date.now()}`,
            name: `Untitled Scenario ${scenarios.length + 1}`,
            date: new Date().toISOString().split('T')[0],
            status: 'draft',
            selected: false,
            type: 'new_contract',
            params: { wilaya: '', nature: '', type: '', value: 0 },
            results: null
        };
        setScenarios([newScenario, ...scenarios]);
    };

    const handleUpdateScenario = (id, field, value) => {
        setScenarios(scenarios.map(s => 
            s.id === id ? { ...s, [field]: value, status: field === 'type' || field === 'params' ? 'draft' : s.status } : s
        ));
    };

    const handleUpdateParam = (id, paramField, value) => {
        setScenarios(scenarios.map(s => {
            if (s.id === id) {
                return { ...s, params: { ...s.params, [paramField]: value }, status: 'draft' };
            }
            return s;
        }));
    };

    const handleToggleSelect = (id) => {
        setScenarios(scenarios.map(s => s.id === id ? { ...s, selected: !s.selected } : s));
    };

    const handleDelete = (id) => {
        setScenarios(scenarios.filter(s => s.id !== id));
    };

    const handleCompute = (id) => {
        // Simulate computation
        setScenarios(scenarios.map(s => {
            if (s.id === id) {
                return { ...s, status: 'computing' };
            }
            return s;
        }));
        
        setTimeout(() => {
            setScenarios(scenarios.map(s => {
                if (s.id === id) {
                    const isBad = s.type === 'new_contract';
                    return {
                        ...s,
                        status: 'computed',
                        results: {
                            exposureChange: isBad ? 1500000000 : -500000000,
                            exposurePct: isBad ? 12.5 : -4.2,
                            pmlChange: isBad ? 450000000 : 120000000,
                            pmlPct: isBad ? 15.0 : 4.1,
                            balanceOld: 72,
                            balanceNew: isBad ? 61 : 75,
                            narrative: isBad 
                                ? "Accepting this scenario increases high-risk concentration. Reinsurance treaty limits may be breached in Zone III."
                                : "This scenario improves overall portfolio balance and reduces Zone III exposure dependency."
                        }
                    };
                }
                return s;
            }));
        }, 1500);
    };

    return (
        <div className="min-h-[calc(100vh-120px)] w-full flex flex-col items-center pb-12" data-name="what-if-page" data-file="components/WhatIfSimulator.js">
            
            {/* Top Bar Container */}
            <div className="w-full max-w-[900px] flex items-center justify-between mb-8 sticky top-[56px] z-20 bg-slate/90 backdrop-blur py-4">
                <div>
                    <h1 className="text-[32px] font-mono font-medium leading-none text-pure mb-2">What-If Scenarios</h1>
                    <p className="font-sans text-fog">Simulate future conditions before making decisions.</p>
                </div>
                <div className="flex gap-3 items-center">
                    {selectedCount >= 2 && (
                        <button 
                            className="h-[40px] px-4 rounded-[6px] bg-teal text-carbon font-sans font-bold flex items-center gap-2 animate-in slide-in-from-right-4 shadow-[0_0_15px_rgba(57,208,216,0.3)] hover:bg-teal/90 transition-colors"
                            onClick={() => setIsComparing(true)}
                        >
                            <div className="icon-columns text-sm"></div>
                            Compare {selectedCount} Selected
                        </button>
                    )}
                    <button onClick={handleAddScenario} className="btn-primary">
                        <div className="icon-file-plus mr-2 text-sm"></div>
                        New Scenario
                    </button>
                </div>
            </div>

            {/* Notebook Content */}
            <div className="w-full max-w-[900px] space-y-6">
                
                {scenarios.length === 0 && (
                    <div className="border-2 border-dashed border-ash rounded-[12px] p-12 flex flex-col items-center justify-center text-fog bg-carbon/20">
                        <div className="icon-flask-conical text-4xl mb-4 opacity-50"></div>
                        <h3 className="font-mono text-lg text-pure mb-2">No active scenarios</h3>
                        <p className="font-sans text-sm text-center max-w-md mb-6">Create a new hypothetical scenario to analyze the potential impact on your portfolio exposure and PML.</p>
                        <button onClick={handleAddScenario} className="btn-outline">Create First Scenario</button>
                    </div>
                )}

                {scenarios.map((scenario) => (
                    <div key={scenario.id} className={`card border-l-[4px] overflow-hidden transition-all duration-300 ${scenario.selected ? 'border-l-teal shadow-card-hover ring-1 ring-teal/20' : 'border-l-ash hover:border-l-fog'}`}>
                        
                        {/* Scenario Header */}
                        <div className="bg-graphite border-b border-ash p-4 flex items-center gap-4">
                            <label className="relative flex items-center cursor-pointer group p-1">
                                <input 
                                    type="checkbox" 
                                    className="peer sr-only" 
                                    checked={scenario.selected}
                                    onChange={() => handleToggleSelect(scenario.id)}
                                />
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${scenario.selected ? 'bg-teal border-teal text-carbon' : 'bg-carbon border-ash text-transparent group-hover:border-fog'}`}>
                                    <div className="icon-check text-[14px]"></div>
                                </div>
                            </label>
                            
                            <div className="flex-1 min-w-0">
                                <input 
                                    type="text" 
                                    className="bg-transparent border-b border-transparent hover:border-ash focus:border-teal outline-none font-mono text-lg text-pure font-semibold w-full transition-colors"
                                    value={scenario.name}
                                    onChange={(e) => handleUpdateScenario(scenario.id, 'name', e.target.value)}
                                />
                                <div className="font-sans text-[11px] text-fog mt-1">Created: {scenario.date}</div>
                            </div>
                            
                            <div className="flex items-center gap-4 shrink-0">
                                <div className={`px-2.5 py-1 rounded-[4px] text-[11px] font-sans font-bold uppercase tracking-wider ${
                                    scenario.status === 'draft' ? 'bg-ash text-cloud' : 
                                    scenario.status === 'computing' ? 'bg-blue/20 text-blue' : 
                                    'bg-green/20 text-green'
                                }`}>
                                    {scenario.status === 'computing' ? 'Computing...' : scenario.status}
                                </div>
                                <button onClick={() => handleDelete(scenario.id)} className="text-fog hover:text-red transition-colors p-2 rounded hover:bg-carbon">
                                    <div className="icon-trash text-sm"></div>
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            
                            {/* Parameters Editor */}
                            <div className="flex items-start gap-8">
                                <div className="w-1/3 shrink-0">
                                    <label className="label-text">Scenario Type</label>
                                    <div className="relative mb-6">
                                        <select 
                                            className="input-field appearance-none cursor-pointer font-medium"
                                            value={scenario.type}
                                            onChange={(e) => handleUpdateScenario(scenario.id, 'type', e.target.value)}
                                        >
                                            <option value="new_contract">New Contract / Asset</option>
                                            <option value="earthquake">Earthquake Event</option>
                                            <option value="policy_change">Policy Condition Change</option>
                                            <option value="market_shift">Market Value Shift</option>
                                        </select>
                                        <div className="icon-chevron-down absolute right-3 top-2.5 text-fog pointer-events-none text-sm"></div>
                                    </div>
                                    
                                    <button 
                                        className="w-full bg-carbon border border-ash hover:bg-ash text-cloud hover:text-pure font-sans text-sm font-semibold h-[44px] rounded-[6px] flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                                        onClick={() => handleCompute(scenario.id)}
                                        disabled={scenario.status === 'computed' || scenario.status === 'computing'}
                                    >
                                        {scenario.status === 'computing' ? (
                                            <><div className="icon-loader animate-spin mr-2"></div> Running...</>
                                        ) : (
                                            <>Calculate Impact <div className="icon-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></div></>
                                        )}
                                    </button>
                                </div>
                                
                                <div className="w-px bg-ash self-stretch"></div>

                                <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-4">
                                    {scenario.type === 'new_contract' && (
                                        <>
                                            <div>
                                                <label className="label-text">Target Wilaya</label>
                                                <select 
                                                    className="input-field appearance-none"
                                                    value={scenario.params.wilaya}
                                                    onChange={(e) => handleUpdateParam(scenario.id, 'wilaya', e.target.value)}
                                                >
                                                    <option value="">Select wilaya...</option>
                                                    <option>16 - Algiers (Zone III)</option>
                                                    <option>09 - Blida (Zone III)</option>
                                                    <option>31 - Oran (Zone IIa)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="label-text">Capital Insured (DZD)</label>
                                                <input 
                                                    type="number" 
                                                    className="input-field font-mono"
                                                    placeholder="0"
                                                    value={scenario.params.value}
                                                    onChange={(e) => handleUpdateParam(scenario.id, 'value', Number(e.target.value))}
                                                />
                                            </div>
                                            <div>
                                                <label className="label-text">Risk Nature</label>
                                                <select 
                                                    className="input-field appearance-none"
                                                    value={scenario.params.nature}
                                                    onChange={(e) => handleUpdateParam(scenario.id, 'nature', e.target.value)}
                                                >
                                                    <option>Residential</option>
                                                    <option>Commercial</option>
                                                    <option>Industrial</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="label-text">Building Type</label>
                                                <select 
                                                    className="input-field appearance-none"
                                                    value={scenario.params.type}
                                                    onChange={(e) => handleUpdateParam(scenario.id, 'type', e.target.value)}
                                                >
                                                    <option>Standard / Low-rise</option>
                                                    <option>High-rise (>5 floors)</option>
                                                    <option>Infrastructure</option>
                                                    <option>Industrial Complex</option>
                                                </select>
                                            </div>
                                        </>
                                    )}

                                    {scenario.type === 'earthquake' && (
                                        <>
                                            <div>
                                                <label className="label-text">Epicenter Zone</label>
                                                <select className="input-field appearance-none"><option>Zone III (Algiers/Blida)</option><option>Zone IIb</option></select>
                                            </div>
                                            <div>
                                                <label className="label-text">Magnitude (Mw)</label>
                                                <input type="number" step="0.1" className="input-field font-mono" placeholder="6.5" />
                                            </div>
                                            <div>
                                                <label className="label-text">Event Date</label>
                                                <input type="date" className="input-field" />
                                            </div>
                                            <div>
                                                <label className="label-text">Avg. Damage Factor (%)</label>
                                                <input type="number" className="input-field font-mono" placeholder="45" />
                                            </div>
                                        </>
                                    )}
                                    
                                    {(scenario.type === 'policy_change' || scenario.type === 'market_shift') && (
                                        <div className="col-span-2 text-fog font-sans text-sm py-4 italic">
                                            Parameter fields for this scenario type are simulated in this demo.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Results Section (Animated Reveal) */}
                            {scenario.status === 'computed' && scenario.results && (
                                <div className="mt-8 pt-8 border-t border-ash animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="flex gap-6">
                                        
                                        <div className="w-[300px] shrink-0 space-y-4">
                                            <div className="bg-graphite p-4 rounded-[6px] border border-ash">
                                                <div className="font-sans text-[12px] font-semibold text-fog uppercase tracking-wider mb-1">Exposure Change</div>
                                                <div className={`font-mono text-[24px] ${scenario.results.exposureChange > 0 ? 'text-amber' : 'text-green'}`}>
                                                    {scenario.results.exposureChange > 0 ? '+' : ''}<DZDArmount value={scenario.results.exposureChange} />
                                                </div>
                                            </div>
                                            
                                            <div className="bg-graphite p-4 rounded-[6px] border border-ash">
                                                <div className="font-sans text-[12px] font-semibold text-fog uppercase tracking-wider mb-1">PML Impact</div>
                                                <div className={`font-mono text-[24px] ${scenario.results.pmlChange > 0 ? 'text-red' : 'text-green'}`}>
                                                    {scenario.results.pmlChange > 0 ? '+' : ''}<DZDArmount value={scenario.results.pmlChange} />
                                                </div>
                                            </div>
                                            
                                            <div className="bg-graphite p-4 rounded-[6px] border border-ash flex justify-between items-center">
                                                <div>
                                                    <div className="font-sans text-[12px] font-semibold text-fog uppercase tracking-wider mb-1">Balance Index</div>
                                                    <div className="font-mono text-[24px] text-pure">{scenario.results.balanceNew} <span className="text-sm text-fog line-through ml-2">{scenario.results.balanceOld}</span></div>
                                                </div>
                                                <div className={`text-2xl ${scenario.results.balanceNew < scenario.results.balanceOld ? 'icon-trending-down text-red' : 'icon-trending-up text-green'}`}></div>
                                            </div>
                                        </div>

                                        <div className="flex-1 flex flex-col">
                                            <div className="flex-1 bg-blue/10 border border-blue/30 rounded-[6px] p-5 text-cloud font-sans text-[15px] leading-relaxed">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="icon-wand-sparkles text-blue text-sm"></div>
                                                    <span className="font-bold text-blue uppercase tracking-wider text-[12px]">Impact Narrative</span>
                                                </div>
                                                {scenario.results.narrative}
                                            </div>
                                            
                                            <div className="flex justify-end gap-3 mt-6">
                                                <button className="h-[36px] px-4 font-sans text-sm font-medium text-fog hover:text-pure hover:bg-graphite rounded transition-colors flex items-center gap-2">
                                                    <div className="icon-save text-sm"></div> Save as Report
                                                </button>
                                                <button className="h-[36px] px-4 font-sans text-sm font-medium text-red hover:bg-red/10 rounded border border-red/30 transition-colors">
                                                    Discard Scenario
                                                </button>
                                                {scenario.type === 'new_contract' && (
                                                    <button className="h-[36px] px-6 font-sans text-sm font-bold text-carbon bg-green hover:bg-green/90 rounded transition-colors shadow-sm">
                                                        Accept Contract
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                ))}
            </div>

            {isComparing && (
                <CompareModal 
                    scenarios={scenarios.filter(s => s.selected)} 
                    onClose={() => setIsComparing(false)} 
                />
            )}

        </div>
    );
};