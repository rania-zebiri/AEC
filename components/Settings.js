const TABS = [
    { id: 'retention', label: 'Retention Parameters', icon: 'shield' },
    { id: 'zones', label: 'Zone Classification', icon: 'map' },
    { id: 'vulnerability', label: 'Vulnerability Factors', icon: 'building' },
    { id: 'alerts', label: 'Alert Thresholds', icon: 'bell' },
    { id: 'integration', label: 'CRAAG Integration', icon: 'plug' },
    { id: 'reports', label: 'Report Templates', icon: 'file-text' },
    { id: 'users', label: 'User Management', icon: 'users' },
    { id: 'audit', label: 'Audit Log', icon: 'history' },
];

const MOCK_USERS = [
    { id: 1, name: 'Karim Benali', email: 'k.benali@company.dz', role: 'Manager', status: 'Active', lastLogin: '2 hours ago' },
    { id: 2, name: 'Nadia Merzoug', email: 'n.merzoug@company.dz', role: 'Underwriter', status: 'Active', lastLogin: '1 day ago' },
    { id: 3, name: 'Yacine Taleb', email: 'y.taleb@company.dz', role: 'Analyst', status: 'Active', lastLogin: '3 days ago' },
    { id: 4, name: 'Amine Haddad', email: 'a.haddad@company.dz', role: 'Read-only', status: 'Inactive', lastLogin: '2 months ago' },
];

const MOCK_AUDIT = [
    { id: 1, time: '2026-04-16 14:22', user: 'Karim Benali', action: 'Update Threshold', target: 'Alert % changed to 75%' },
    { id: 2, time: '2026-04-16 09:15', user: 'Nadia Merzoug', action: 'Approve Contract', target: 'POL-16-042' },
    { id: 3, time: '2026-04-15 16:45', user: 'System', action: 'CRAAG Sync', target: 'Imported 3 events' },
    { id: 4, time: '2026-04-14 11:30', user: 'Yacine Taleb', action: 'Run Simulation', target: 'M6.5 Algiers' },
    { id: 5, time: '2026-04-12 08:00', user: 'Karim Benali', action: 'Add User', target: 'Amine Haddad' },
];

const MOCK_ZONES = [
    { id: 16, name: 'Algiers', defaultZone: 'III', override: 'III' },
    { id: 9, name: 'Blida', defaultZone: 'III', override: 'III' },
    { id: 31, name: 'Oran', defaultZone: 'IIa', override: 'IIb' },
    { id: 30, name: 'Ouargla', defaultZone: 'IIb', override: 'IIb' },
    { id: 1, name: 'Adrar', defaultZone: '0', override: '0' },
];

const Settings = () => {
    const [activeTab, setActiveTab] = React.useState('retention');
    const [saved, setSaved] = React.useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="h-[calc(100vh-56px)] -mx-8 -my-8 flex bg-slate" data-name="settings-page" data-file="components/Settings.js">
            
            {/* Left Sidebar Tabs */}
            <div className="w-[280px] bg-carbon border-r border-ash flex flex-col shrink-0">
                <div className="p-6 border-b border-ash shrink-0">
                    <h1 className="text-[20px] font-mono font-medium text-pure m-0">System Settings</h1>
                </div>
                
                <div className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-3">
                        {TABS.map(tab => (
                            <li key={tab.id}>
                                <button 
                                    className={`w-full flex items-center h-[40px] px-3 rounded-[6px] transition-colors group text-left ${activeTab === tab.id ? 'bg-graphite text-pure font-semibold' : 'text-fog hover:bg-graphite hover:text-cloud'}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <div className={`icon-${tab.icon} text-[18px] mr-3 ${activeTab === tab.id ? 'text-teal' : 'text-fog group-hover:text-cloud'}`}></div>
                                    <span className="font-sans text-[14px]">{tab.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate">
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-[800px]">
                        
                        {/* Retention Parameters */}
                        {activeTab === 'retention' && (
                            <div className="animate-in fade-in duration-300">
                                <h2 className="font-mono text-[22px] font-medium text-pure mb-2">Retention Parameters</h2>
                                <p className="font-sans text-sm text-fog mb-8">Define the maximum acceptable insured capital limits before triggering alerts or requiring reinsurance.</p>
                                
                                <div className="card overflow-hidden">
                                    <div className="p-5 border-b border-ash bg-graphite flex justify-between items-center">
                                        <h3 className="font-mono text-[14px] font-semibold text-pure uppercase tracking-wider">Global & Per-Zone Limits</h3>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <div>
                                            <label className="label-text">Global Portfolio Limit (DZD)</label>
                                            <input type="number" className="input-field font-mono text-lg max-w-[300px]" defaultValue="50000000000" />
                                        </div>
                                        
                                        <table className="w-full text-left mt-6">
                                            <thead>
                                                <tr>
                                                    <th className="pb-3 font-sans text-[12px] font-semibold text-fog uppercase">RPA Zone</th>
                                                    <th className="pb-3 font-sans text-[12px] font-semibold text-fog uppercase">Max Capacity (DZD)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-ash">
                                                {['III', 'IIb', 'IIa', 'I', '0'].map(z => (
                                                    <tr key={z}>
                                                        <td className="py-3"><ZoneBadge zone={z} /></td>
                                                        <td className="py-3">
                                                            <input type="number" className="input-field font-mono max-w-[250px]" defaultValue={z === 'III' ? '1000000000' : z === 'IIb' ? '1500000000' : '2000000000'} />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Zone Classification */}
                        {activeTab === 'zones' && (
                            <div className="animate-in fade-in duration-300">
                                <h2 className="font-mono text-[22px] font-medium text-pure mb-2">Zone Classification Mapping</h2>
                                <p className="font-sans text-sm text-fog mb-8">Map wilayas to their respective RPA seismic zones. You can override the default classification if needed.</p>
                                
                                <div className="card overflow-hidden">
                                    <table className="w-full text-left whitespace-nowrap">
                                        <thead className="bg-graphite border-b border-ash">
                                            <tr>
                                                <th className="px-6 py-3 font-sans text-[12px] font-semibold text-fog w-20">Code</th>
                                                <th className="px-4 py-3 font-sans text-[12px] font-semibold text-fog">Wilaya</th>
                                                <th className="px-4 py-3 font-sans text-[12px] font-semibold text-fog">Default Zone</th>
                                                <th className="px-4 py-3 font-sans text-[12px] font-semibold text-fog">Override Zone</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-ash">
                                            {MOCK_ZONES.map(z => (
                                                <tr key={z.id}>
                                                    <td className="px-6 py-3 font-mono text-[13px] text-cloud">{z.id.toString().padStart(2, '0')}</td>
                                                    <td className="px-4 py-3 font-sans text-[14px] text-pure">{z.name}</td>
                                                    <td className="px-4 py-3"><ZoneBadge zone={z.defaultZone} /></td>
                                                    <td className="px-4 py-3">
                                                        <select className="bg-carbon border border-ash rounded px-2 py-1 text-sm font-sans text-cloud focus:border-teal outline-none" defaultValue={z.override}>
                                                            <option value="III">Zone III</option>
                                                            <option value="IIb">Zone IIb</option>
                                                            <option value="IIa">Zone IIa</option>
                                                            <option value="I">Zone I</option>
                                                            <option value="0">Zone 0</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Vulnerability Factors */}
                        {activeTab === 'vulnerability' && (
                            <div className="animate-in fade-in duration-300">
                                <h2 className="font-mono text-[22px] font-medium text-pure mb-2">Vulnerability Factors</h2>
                                <p className="font-sans text-sm text-fog mb-8">Set the base vulnerability modifiers used by the underwriting decision engine.</p>
                                
                                <div className="card overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-graphite border-b border-ash">
                                            <tr>
                                                <th className="px-6 py-3 font-sans text-[12px] font-semibold text-fog">Building Type</th>
                                                <th className="px-4 py-3 font-sans text-[12px] font-semibold text-fog">Base Factor</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-ash">
                                            {[
                                                { t: 'Modern RC', f: '0.50' },
                                                { t: 'Old RC (< 2003)', f: '0.70' },
                                                { t: 'Steel Frame', f: '0.40' },
                                                { t: 'Traditional Stone/Masonry', f: '0.90' },
                                            ].map(item => (
                                                <tr key={item.t}>
                                                    <td className="px-6 py-4 font-sans text-[14px] text-pure">{item.t}</td>
                                                    <td className="px-4 py-3">
                                                        <input type="number" step="0.05" className="input-field font-mono max-w-[100px]" defaultValue={item.f} />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Alert Thresholds */}
                        {activeTab === 'alerts' && (
                            <div className="animate-in fade-in duration-300">
                                <h2 className="font-mono text-[22px] font-medium text-pure mb-2">Alert Thresholds</h2>
                                <p className="font-sans text-sm text-fog mb-8">Configure at what percentage of capacity utilization warnings and critical alerts are triggered.</p>
                                
                                <div className="card p-6 space-y-8">
                                    <div>
                                        <label className="flex justify-between items-center mb-2">
                                            <span className="font-sans text-sm font-semibold text-amber flex items-center gap-2"><div className="icon-triangle-alert"></div> Warning Threshold</span>
                                            <span className="font-mono text-pure">75%</span>
                                        </label>
                                        <input type="range" min="50" max="90" defaultValue="75" className="w-full" />
                                        <p className="text-[11px] text-fog mt-2">Triggers early warning flags in the portfolio dashboard.</p>
                                    </div>
                                    
                                    <div>
                                        <label className="flex justify-between items-center mb-2">
                                            <span className="font-sans text-sm font-semibold text-red flex items-center gap-2"><div className="icon-flame"></div> Hotspot Threshold</span>
                                            <span className="font-mono text-pure">100%</span>
                                        </label>
                                        <input type="range" min="80" max="150" defaultValue="100" className="w-full" />
                                        <p className="text-[11px] text-fog mt-2">Classifies a wilaya as a critical hotspot. Auto-rejects standard underwriting requests if exceeded.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CRAAG Integration */}
                        {activeTab === 'integration' && (
                            <div className="animate-in fade-in duration-300">
                                <h2 className="font-mono text-[22px] font-medium text-pure mb-2">CRAAG Data Integration</h2>
                                <p className="font-sans text-sm text-fog mb-8">Manage the live data feed connection from the Algerian Center of Astronomy, Astrophysics and Geophysics.</p>
                                
                                <div className="card p-6 flex items-start gap-6">
                                    <div className="w-16 h-16 rounded-full bg-graphite border border-ash flex items-center justify-center shrink-0">
                                        <div className="icon-radio-tower text-2xl text-teal"></div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-sans text-[16px] font-bold text-pure">CRAAG Live Feed API</h3>
                                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-green/10 border border-green/20 text-green font-sans text-[11px] font-bold uppercase">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse"></span>
                                                Connected
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 my-4 font-sans text-sm text-cloud">
                                            <div><span className="text-fog">Last Sync:</span> <span className="font-mono ml-1">Today, 08:15 AM</span></div>
                                            <div><span className="text-fog">Events (30d):</span> <span className="font-mono ml-1">14</span></div>
                                            <div className="col-span-2"><span className="text-fog">Endpoint URL:</span> <span className="font-mono ml-1">https://api.craag.dz/v1/seismic-events</span></div>
                                        </div>
                                        <div className="flex gap-3 mt-6">
                                            <button className="btn-outline text-sm h-[36px]">Test Connection</button>
                                            <button className="btn-outline text-sm h-[36px]">Force Sync Now</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Report Templates */}
                        {activeTab === 'reports' && (
                            <div className="animate-in fade-in duration-300">
                                <h2 className="font-mono text-[22px] font-medium text-pure mb-2">Report Templates</h2>
                                <p className="font-sans text-sm text-fog mb-8">Configure defaults for generated ACAPS reports and internal PDF exports.</p>
                                
                                <div className="card p-6 space-y-6">
                                    <div>
                                        <label className="label-text">Company Logo</label>
                                        <div className="flex items-center gap-4">
                                            <div className="w-20 h-20 bg-graphite border border-ash rounded-[6px] flex items-center justify-center font-sans text-[10px] text-fog">LOGO</div>
                                            <button className="btn-outline h-[36px] text-sm">Upload New Image</button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label-text">Default Language</label>
                                        <select className="input-field max-w-[200px]">
                                            <option>French</option>
                                            <option>Arabic</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label-text">Default Signatory Name</label>
                                        <input type="text" className="input-field max-w-[300px]" defaultValue="Chief Risk Officer" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* User Management */}
                        {activeTab === 'users' && (
                            <div className="animate-in fade-in duration-300">
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="font-mono text-[22px] font-medium text-pure">User Management</h2>
                                    <button className="btn-primary text-sm h-[36px]"><div className="icon-user-plus mr-2 text-[14px]"></div> Add User</button>
                                </div>
                                <p className="font-sans text-sm text-fog mb-8">Manage team access and role-based permissions.</p>
                                
                                <div className="card overflow-hidden">
                                    <table className="w-full text-left whitespace-nowrap">
                                        <thead className="bg-graphite border-b border-ash">
                                            <tr>
                                                <th className="px-6 py-3 font-sans text-[12px] font-semibold text-fog">Name / Email</th>
                                                <th className="px-4 py-3 font-sans text-[12px] font-semibold text-fog">Role</th>
                                                <th className="px-4 py-3 font-sans text-[12px] font-semibold text-fog">Status</th>
                                                <th className="px-4 py-3 font-sans text-[12px] font-semibold text-fog">Last Login</th>
                                                <th className="px-4 py-3"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-ash">
                                            {MOCK_USERS.map(u => (
                                                <tr key={u.id} className="hover:bg-graphite/30 transition-colors">
                                                    <td className="px-6 py-3">
                                                        <div className="font-sans text-[14px] font-medium text-pure">{u.name}</div>
                                                        <div className="font-sans text-[12px] text-fog">{u.email}</div>
                                                    </td>
                                                    <td className="px-4 py-3 font-sans text-[13px] text-cloud">{u.role}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-sans font-bold uppercase ${u.status === 'Active' ? 'bg-green/10 text-green' : 'bg-ash text-fog'}`}>{u.status}</span>
                                                    </td>
                                                    <td className="px-4 py-3 font-sans text-[13px] text-fog">{u.lastLogin}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button className="text-fog hover:text-pure transition-colors p-1"><div className="icon-more-vertical text-[16px]"></div></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Audit Log */}
                        {activeTab === 'audit' && (
                            <div className="animate-in fade-in duration-300">
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="font-mono text-[22px] font-medium text-pure">Audit Log</h2>
                                    <button className="btn-outline text-sm h-[32px]"><div className="icon-download mr-2 text-[14px]"></div> Export CSV</button>
                                </div>
                                <p className="font-sans text-sm text-fog mb-8">Record of all critical system events and user actions.</p>
                                
                                <div className="card overflow-hidden">
                                    <table className="w-full text-left whitespace-nowrap">
                                        <thead className="bg-graphite border-b border-ash">
                                            <tr>
                                                <th className="px-6 py-3 font-sans text-[12px] font-semibold text-fog">Timestamp</th>
                                                <th className="px-4 py-3 font-sans text-[12px] font-semibold text-fog">User</th>
                                                <th className="px-4 py-3 font-sans text-[12px] font-semibold text-fog">Action</th>
                                                <th className="px-4 py-3 font-sans text-[12px] font-semibold text-fog">Target / Details</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-ash">
                                            {MOCK_AUDIT.map(a => (
                                                <tr key={a.id} className="hover:bg-graphite/30 transition-colors">
                                                    <td className="px-6 py-3 font-mono text-[12px] text-fog">{a.time}</td>
                                                    <td className="px-4 py-3 font-sans text-[13px] text-cloud">{a.user}</td>
                                                    <td className="px-4 py-3 font-sans text-[13px] font-medium text-pure">{a.action}</td>
                                                    <td className="px-4 py-3 font-sans text-[13px] text-fog truncate max-w-[200px]">{a.target}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* Sticky Footer for Save Actions (Not needed for Audit/Users) */}
                {!['audit', 'users'].includes(activeTab) && (
                    <div className="h-[72px] bg-carbon border-t border-ash px-8 flex items-center justify-end gap-4 shrink-0">
                        {saved && <span className="font-sans text-sm text-green flex items-center gap-2 animate-in fade-in"><div className="icon-check"></div> Settings saved</span>}
                        <button className="btn-outline">Cancel</button>
                        <button className="btn-primary" onClick={handleSave}>Save Changes</button>
                    </div>
                )}

            </div>
        </div>
    );
};