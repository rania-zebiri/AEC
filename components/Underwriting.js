const MOCK_WILAYAS = [
    { id: 16, name: 'Algiers', zone: 'III', cap: 1000000000, used: 850000000 },
    { id: 9, name: 'Blida', zone: 'III', cap: 500000000, used: 350000000 },
    { id: 42, name: 'Tipaza', zone: 'III', cap: 300000000, used: 250000000 },
    { id: 31, name: 'Oran', zone: 'IIa', cap: 2000000000, used: 850000000 },
    { id: 30, name: 'Ouargla', zone: 'IIb', cap: 1500000000, used: 500000000 },
    { id: 1, name: 'Adrar', zone: '0', cap: 500000000, used: 50000000 },
];

const MOCK_QUEUE = [
    { id: 'REQ-1042', date: '2026-04-16', client: 'EURL Construction Alpha', wilaya: '16 - Algiers', nature: 'Commercial', capital: 450000000, status: 'Pending Review' },
    { id: 'REQ-1041', date: '2026-04-15', client: 'Sarl MedFoods', wilaya: '09 - Blida', nature: 'Industrial', capital: 120000000, status: 'Under Review' },
    { id: 'REQ-1038', date: '2026-04-14', client: 'Promotion Immobiliere Z', wilaya: '31 - Oran', nature: 'Residential', capital: 85000000, status: 'Pending Review' },
];

const Underwriting = () => {
    const [activeTab, setActiveTab] = React.useState('new');

    // Form State
    const [clientName, setClientName] = React.useState('');
    const [wilayaId, setWilayaId] = React.useState('');
    const [commune, setCommune] = React.useState('');
    const [nature, setNature] = React.useState('Commercial');
    const [buildingType, setBuildingType] = React.useState('Modern RC');
    const [year, setYear] = React.useState('2015');
    const [capital, setCapital] = React.useState('');
    const [surface, setSurface] = React.useState('');
    const [inspection, setInspection] = React.useState(false);
    const [notes, setNotes] = React.useState('');

    // Derived State
    const wilayaData = React.useMemo(() => MOCK_WILAYAS.find(w => w.id === Number(wilayaId)), [wilayaId]);
    const numCapital = Number(capital) || 0;

    // Auto-calculations
    const calcMetrics = React.useMemo(() => {
        let vuln = 0.5; // Base

        // Building type mod
        if (buildingType === 'Old RC') vuln += 0.2;
        if (buildingType === 'Traditional Stone') vuln += 0.4;
        if (buildingType === 'Steel') vuln -= 0.1;
        if (buildingType === 'Other') vuln += 0.1;

        // Nature mod
        if (nature === 'Residential') vuln -= 0.1;
        if (nature === 'Industrial') vuln += 0.2;

        // Year mod
        if (Number(year) < 2003) vuln += 0.2;

        vuln = Math.max(0.1, Math.min(vuln, 1.0));

        // Zone base score
        const zoneScores = { 'III': 40, 'IIb': 30, 'IIa': 20, 'I': 10, '0': 0 };
        let zScore = wilayaData ? (zoneScores[wilayaData.zone] || 0) : 0;

        let riskScore = zScore + (vuln * 50);
        if (inspection) riskScore -= 10;

        riskScore = Math.round(Math.max(0, Math.min(riskScore, 100)));

        return { vuln: vuln.toFixed(2), riskScore };
    }, [wilayaData, buildingType, nature, year, inspection]);

    // Decision Logic
    const decision = React.useMemo(() => {
        if (!clientName || !wilayaData || numCapital === 0) {
            return { state: 'incomplete' };
        }

        const available = wilayaData.cap - wilayaData.used;

        if (numCapital > available) {
            return {
                state: 'rejected',
                reason: `Requested capital exceeds remaining retention capacity for ${wilayaData.name}.`,
                details: { requested: numCapital, available, deficit: numCapital - available }
            };
        }

        if (calcMetrics.riskScore > 75 || (!inspection && numCapital > 200000000) || wilayaData.zone === 'III') {
            const conditions = [];
            if (calcMetrics.riskScore > 75) conditions.push("High risk score requires senior management sign-off.");
            if (!inspection && numCapital > 200000000) conditions.push("Mandatory preventive inspection report within 30 days.");
            if (wilayaData.zone === 'III') conditions.push("Zone III earthquake premium surcharge applied (+15%).");

            return {
                state: 'conditional',
                conditions,
                premium: Math.round(numCapital * 0.0025 * 1.15)
            };
        }

        return {
            state: 'acceptable',
            premium: Math.round(numCapital * 0.0025)
        };
    }, [clientName, wilayaData, numCapital, calcMetrics, inspection]);

    const handleClear = () => {
        setClientName(''); setWilayaId(''); setCommune(''); setNature('Commercial');
        setBuildingType('Modern RC'); setYear('2015'); setCapital(''); setSurface('');
        setInspection(false); setNotes('');
    };

    return (
        <div className="relative h-[calc(100vh-56px)] -mx-8 -my-8 flex flex-col bg-slate" data-name="underwriting-page" data-file="components/Underwriting.js">

            {/* Top Tabs Header */}
            <div className="h-[64px] bg-carbon border-b border-ash px-8 flex items-center gap-8 shrink-0">
                <button
                    className={`h-full flex items-center font-mono text-[14px] font-semibold border-b-[2px] transition-colors ${activeTab === 'new' ? 'border-teal text-pure' : 'border-transparent text-fog hover:text-cloud'}`}
                    onClick={() => setActiveTab('new')}
                >
                    <div className="icon-file-plus mr-2 text-lg"></div>
                    New Contract Request
                </button>
                <button
                    className={`h-full flex items-center font-mono text-[14px] font-semibold border-b-[2px] transition-colors ${activeTab === 'queue' ? 'border-teal text-pure' : 'border-transparent text-fog hover:text-cloud'}`}
                    onClick={() => setActiveTab('queue')}
                >
                    <div className="icon-list mr-2 text-lg"></div>
                    Pending Queue <span className="ml-2 bg-ash text-cloud px-2 py-0.5 rounded text-[11px]">{MOCK_QUEUE.length}</span>
                </button>
            </div>

            {/* Tab Content: New Request */}
            {activeTab === 'new' && (
                <div className="flex-1 flex overflow-hidden">

                    {/* Left Panel: Form */}
                    <div className="w-full lg:w-[60%] flex flex-col overflow-y-auto border-r border-ash">
                        <div className="p-8 max-w-[800px] w-full mx-auto space-y-8">

                            <div>
                                <h1 className="text-[24px] font-mono font-medium text-pure mb-2">Contract Data Entry</h1>
                                <p className="font-sans text-sm text-fog">Fill in the primary exposure metrics. The decision engine will calculate risk automatically.</p>
                            </div>

                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="label-text">Client / Entity Name</label>
                                        <input type="text" className="input-field" placeholder="e.g. EURL Construction Alpha" value={clientName} onChange={e => setClientName(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="label-text">Wilaya</label>
                                        <div className="relative">
                                            <select className="input-field appearance-none cursor-pointer" value={wilayaId} onChange={e => setWilayaId(e.target.value)}>
                                                <option value="">Select wilaya...</option>
                                                {MOCK_WILAYAS.map(w => <option key={w.id} value={w.id}>{w.id.toString().padStart(2,'0')} - {w.name}</option>)}
                                            </select>
                                            <div className="icon-chevron-down absolute right-3 top-2.5 text-fog pointer-events-none text-sm"></div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label-text">Commune</label>
                                        <input type="text" className="input-field" placeholder="Enter commune" value={commune} onChange={e => setCommune(e.target.value)} />
                                    </div>
                                </div>

                                <div className="w-full h-px bg-ash"></div>

                                {/* Asset Info */}
                                <div>
                                    <label className="label-text mb-3">Risk Nature</label>
                                    <div className="flex bg-graphite rounded-[6px] p-1 border border-ash w-full max-w-[400px]">
                                        {['Residential', 'Commercial', 'Industrial'].map(type => (
                                            <button
                                                key={type}
                                                className={`flex-1 py-1.5 flex items-center justify-center gap-2 text-sm font-sans font-semibold rounded-[4px] transition-colors ${nature === type ? 'bg-ash text-pure shadow-sm' : 'text-fog hover:text-cloud'}`}
                                                onClick={() => setNature(type)}
                                            >
                                                <div className={`icon-${type === 'Residential' ? 'house' : type === 'Commercial' ? 'building-2' : 'factory'}`}></div>
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="label-text">Building Structure Type</label>
                                        <div className="relative">
                                            <select className="input-field appearance-none cursor-pointer" value={buildingType} onChange={e => setBuildingType(e.target.value)}>
                                                <option>Modern RC</option>
                                                <option>Old RC</option>
                                                <option>Steel</option>
                                                <option>Traditional Stone</option>
                                                <option>Other</option>
                                            </select>
                                            <div className="icon-chevron-down absolute right-3 top-2.5 text-fog pointer-events-none text-sm"></div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label-text">Year of Construction</label>
                                        <input type="number" className="input-field" placeholder="YYYY" value={year} onChange={e => setYear(e.target.value)} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="label-text">Insured Capital (DZD)</label>
                                        <input type="number" className="input-field font-mono text-lg h-[48px]" placeholder="0" value={capital} onChange={e => setCapital(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="label-text">Total Surface Area (m²)</label>
                                        <input type="number" className="input-field h-[48px]" placeholder="0" value={surface} onChange={e => setSurface(e.target.value)} />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-graphite rounded-[6px] border border-ash">
                                    <div>
                                        <div className="font-sans font-semibold text-pure text-sm">Preventive Inspection Completed?</div>
                                        <div className="font-sans text-xs text-fog mt-0.5">Valid engineering report provided by client</div>
                                    </div>
                                    <button
                                        className={`relative w-12 h-6 rounded-full transition-colors ${inspection ? 'bg-blue' : 'bg-ash'}`}
                                        onClick={() => setInspection(!inspection)}
                                    >
                                        <span className={`absolute top-1 left-1 w-4 h-4 bg-pure rounded-full transition-transform ${inspection ? 'translate-x-6' : 'translate-x-0'}`}></span>
                                    </button>
                                </div>

                                <div>
                                    <label className="label-text">Additional Notes (Optional)</label>
                                    <textarea className="input-field h-[80px] py-2 resize-none" placeholder="Any specific site conditions or notes..." value={notes} onChange={e => setNotes(e.target.value)}></textarea>
                                </div>
                            </div>

                            {/* Auto-Calculated Summary Box */}
                            <div className="p-5 bg-carbon border border-ash rounded-[8px] shadow-sm mt-8">
                                <h3 className="font-mono text-sm uppercase text-fog font-semibold mb-4">Auto-Calculated Risk Metrics</h3>
                                <div className="grid grid-cols-3 gap-6">
                                    <div>
                                        <div className="font-sans text-[12px] text-fog mb-1">Assigned Zone</div>
                                        {wilayaData ? (
                                            <ZoneBadge zone={wilayaData.zone} />
                                        ) : (
                                            <span className="font-mono text-sm text-ash">-</span>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-sans text-[12px] text-fog mb-1">Vuln. Factor</div>
                                        <div className="font-mono text-lg text-pure">{calcMetrics.vuln}</div>
                                    </div>
                                    <div>
                                        <div className="font-sans text-[12px] text-fog mb-1">Base Risk Score</div>
                                        <div className={`font-mono text-lg font-bold ${calcMetrics.riskScore > 75 ? 'text-red' : calcMetrics.riskScore > 50 ? 'text-amber' : 'text-green'}`}>
                                            {calcMetrics.riskScore} <span className="text-sm font-normal text-fog">/ 100</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button className="btn-primary flex-1 shadow-md">Submit for Review</button>
                                <button className="btn-outline px-6" onClick={handleClear}>Clear Form</button>
                            </div>

                            {/* Spacer */}
                            <div className="h-12"></div>

                        </div>
                    </div>

                    {/* Right Panel: Live Decision */}
                    <div className="w-full lg:w-[40%] bg-slate relative p-8">
                        <div className="sticky top-8">
                            <h2 className="font-mono text-[16px] text-pure font-semibold uppercase tracking-wider mb-6">Underwriting Decision Engine</h2>

                            {decision.state === 'incomplete' && (
                                <div className="border-2 border-dashed border-ash rounded-[12px] h-[300px] flex flex-col items-center justify-center text-center p-8 bg-carbon/20">
                                    <div className="icon-file-text text-4xl text-fog opacity-50 mb-4"></div>
                                    <p className="font-sans text-sm text-fog max-w-[250px]">Continue filling the required form fields to see the real-time underwriting decision.</p>
                                </div>
                            )}

                            {decision.state === 'acceptable' && (
                                <div className="border border-green shadow-[0_0_30px_rgba(46,160,67,0.15)] rounded-[12px] bg-carbon relative overflow-hidden animate-in fade-in zoom-in duration-300">
                                    <div className="h-2 w-full bg-green"></div>
                                    <div className="p-8 text-center border-b border-ash">
                                        <div className="w-16 h-16 rounded-full bg-green/10 flex items-center justify-center mx-auto mb-4">
                                            <div className="icon-check text-4xl text-green"></div>
                                        </div>
                                        <h3 className="font-mono text-[28px] font-bold text-green tracking-wide">ACCEPTED</h3>
                                        <p className="font-sans text-sm text-cloud mt-2">Contract meets all retention and risk criteria.</p>
                                    </div>
                                    <div className="p-6 bg-graphite space-y-4 text-left">
                                        <div className="flex justify-between items-center border-b border-ash/50 pb-3">
                                            <span className="font-sans text-sm text-fog">Suggested Premium</span>
                                            <span className="font-mono text-lg text-pure font-bold"><DZDArmount value={decision.premium} /></span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-ash/50 pb-3">
                                            <span className="font-sans text-sm text-fog">Capacity Remaining</span>
                                            <span className="font-mono text-[15px] text-cloud"><DZDArmount value={wilayaData.cap - wilayaData.used - numCapital} /></span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-sans text-sm text-fog">Workflow</span>
                                            <span className="font-sans text-[13px] font-semibold text-blue bg-blue/10 px-2 py-1 rounded">Auto-Approvable</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {decision.state === 'conditional' && (
                                <div className="border border-amber shadow-[0_0_30px_rgba(210,153,34,0.15)] rounded-[12px] bg-carbon relative overflow-hidden animate-in fade-in zoom-in duration-300">
                                    <div className="h-2 w-full bg-amber"></div>
                                    <div className="p-8 text-center border-b border-ash">
                                        <div className="w-16 h-16 rounded-full bg-amber/10 flex items-center justify-center mx-auto mb-4">
                                            <div className="icon-triangle-alert text-4xl text-amber"></div>
                                        </div>
                                        <h3 className="font-mono text-[28px] font-bold text-amber tracking-wide">CONDITIONAL</h3>
                                        <p className="font-sans text-sm text-cloud mt-2">Accepted pending the following conditions.</p>
                                    </div>
                                    <div className="p-6 bg-graphite space-y-4 text-left">
                                        <div>
                                            <div className="font-sans text-[12px] font-semibold uppercase text-fog mb-3 tracking-wider">Required Conditions</div>
                                            <ul className="space-y-2">
                                                {decision.conditions.map((cond, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 font-sans text-sm text-cloud">
                                                        <div className="icon-info text-amber shrink-0 mt-0.5"></div>
                                                        {cond}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-ash/50 pt-4 mt-2">
                                            <span className="font-sans text-sm text-fog">Adjusted Premium</span>
                                            <span className="font-mono text-lg text-pure font-bold"><DZDArmount value={decision.premium} /></span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {decision.state === 'rejected' && (
                                <div className="border border-red shadow-[0_0_30px_rgba(218,54,51,0.15)] rounded-[12px] bg-carbon relative overflow-hidden animate-in fade-in zoom-in duration-300">
                                    <div className="h-2 w-full bg-red"></div>
                                    <div className="p-8 text-center border-b border-ash">
                                        <div className="w-16 h-16 rounded-full bg-red/10 flex items-center justify-center mx-auto mb-4">
                                            <div className="icon-x text-4xl text-red"></div>
                                        </div>
                                        <h3 className="font-mono text-[28px] font-bold text-red tracking-wide">REJECTED</h3>
                                        <p className="font-sans text-sm text-red mt-2">{decision.reason}</p>
                                    </div>
                                    <div className="p-6 bg-graphite space-y-4 text-left">
                                        <div className="grid grid-cols-2 gap-4 mb-2">
                                            <div className="bg-carbon p-3 border border-ash rounded-[6px]">
                                                <div className="font-sans text-[11px] text-fog uppercase mb-1">Available Cap</div>
                                                <div className="font-mono text-[14px] text-pure"><DZDArmount value={decision.details.available} /></div>
                                            </div>
                                            <div className="bg-carbon p-3 border border-red/30 rounded-[6px]">
                                                <div className="font-sans text-[11px] text-fog uppercase mb-1">Deficit</div>
                                                <div className="font-mono text-[14px] text-red font-bold"><DZDArmount value={decision.details.deficit} /></div>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-ash/50">
                                            <div className="font-sans text-[12px] font-semibold uppercase text-fog mb-3 tracking-wider">Alternative Actions</div>
                                            <div className="flex flex-col gap-2">
                                                <button className="w-full bg-carbon border border-ash hover:bg-ash hover:text-pure font-sans text-sm text-cloud py-2 rounded transition-colors text-left px-4 flex justify-between items-center group">
                                                    Accept Partial Limit
                                                    <span className="font-mono text-[11px] bg-graphite group-hover:bg-carbon px-2 py-0.5 rounded text-pure"><DZDArmount value={decision.details.available} /></span>
                                                </button>
                                                <button className="w-full bg-carbon border border-ash hover:bg-ash hover:text-pure font-sans text-sm text-cloud py-2 rounded transition-colors text-left px-4 flex justify-between items-center">
                                                    Route to Reinsurance Fac.
                                                    <div className="icon-arrow-right text-fog"></div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            )}

            {/* Tab Content: Queue */}
            {activeTab === 'queue' && (
                <div className="flex-1 overflow-auto p-8 animate-in fade-in duration-200">
                    <div className="max-w-[1200px] mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-mono text-xl text-pure">Pending Underwriting Queue</h2>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="icon-search absolute left-3 top-2.5 text-fog text-sm"></div>
                                    <input type="text" placeholder="Search ID or client..." className="input-field pl-9 w-[250px]" />
                                </div>
                                <button className="btn-outline">
                                    <div className="icon-list-filter mr-2 text-sm"></div> Filter
                                </button>
                            </div>
                        </div>

                        <div className="card overflow-hidden">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="bg-graphite border-b border-ash">
                                    <tr>
                                        <th className="px-6 py-3 font-sans text-[12px] font-semibold text-fog">Req ID</th>
                                        <th className="px-4 py-3 font-sans text-[12px] font-semibold text-fog">Date</th>
                                        <th className="px-4 py-3 font-sans text-[12px] font-semibold text-fog">Client Entity</th>
                                        <th className="px-4 py-3 font-sans text-[12px] font-semibold text-fog">Location</th>
                                        <th className="px-4 py-3 font-sans text-[12px] font-semibold text-fog text-right">Requested Capital</th>
                                        <th className="px-4 py-3 font-sans text-[12px] font-semibold text-fog">Status</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-ash">
                                    {MOCK_QUEUE.map((req) => (
                                        <tr key={req.id} className="hover:bg-carbon/30 transition-colors">
                                            <td className="px-6 py-4 font-mono text-[13px] text-cloud">{req.id}</td>
                                            <td className="px-4 py-4 font-mono text-[12px] text-fog">{req.date}</td>
                                            <td className="px-4 py-4 font-sans text-[14px] font-medium text-pure">{req.client}</td>
                                            <td className="px-4 py-4 font-sans text-[13px] text-cloud">{req.wilaya}</td>
                                            <td className="px-4 py-4 font-mono text-[14px] text-pure text-right"><DZDArmount value={req.capital} /></td>
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-[4px] text-[11px] font-sans font-bold uppercase tracking-wider ${
                                                    req.status === 'Under Review' ? 'bg-blue/20 text-blue' : 'bg-ash text-cloud'
                                                }`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <button className="text-sm font-sans font-medium text-teal hover:text-teal/80 transition-colors">Review →</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {MOCK_QUEUE.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-8 text-center text-fog font-sans">No pending requests in the queue.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};