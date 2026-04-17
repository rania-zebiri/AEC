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

const MOCK_USERS = [
    { id: 1, name: 'Karim Benali', email: 'k.benali@gam-assurance.dz', matricule: 'GAM-2020-0042', department: 'Direction Générale', role: 'Viewer', status: 'Active', lastLogin: 'Today, 09:14' },
    { id: 2, name: 'Nadia Merzoug', email: 'n.merzoug@gam-assurance.dz', matricule: 'GAM-2021-0105', department: 'Underwriting', role: 'Underwriter', status: 'Active', lastLogin: '1 day ago' },
    { id: 3, name: 'Yacine Taleb', email: 'y.taleb@gam-assurance.dz', matricule: 'GAM-2018-0021', department: 'Risk Management', role: 'Risk Manager', status: 'Active', lastLogin: '3 days ago' },
    { id: 4, name: 'Amine Haddad', email: 'a.haddad@gam-assurance.dz', matricule: 'GAM-2023-0188', department: 'Actuarial', role: 'Analyst', status: 'Suspended', lastLogin: '2 months ago' },
];

const MOCK_PENDING = [
    { id: 101, name: 'Sofiane Saidi', email: 's.saidi@gam-assurance.dz', matricule: 'GAM-2026-0012', department: 'Underwriting', role: 'Underwriter', submitted: '2 hours ago', reason: 'Need access to assess new commercial property policies in Algiers.' },
    { id: 102, name: 'Leila Kaci', email: 'l.kaci@gam-assurance.dz', matricule: 'GAM-2026-0014', department: 'Claims', role: 'Analyst', submitted: '1 day ago', reason: '' },
];

const RoleBadge = ({ role }) => {
    switch(role) {
        case 'Risk Manager': return <span className="inline-flex px-2 py-0.5 rounded-[4px] text-[12px] font-sans font-medium bg-teal/15 text-teal">{role}</span>;
        case 'Underwriter': return <span className="inline-flex px-2 py-0.5 rounded-[4px] text-[12px] font-sans font-medium bg-blue/15 text-blue">{role}</span>;
        case 'Analyst': return <span className="inline-flex px-2 py-0.5 rounded-[4px] text-[12px] font-sans font-medium bg-amber/15 text-amber">{role}</span>;
        case 'Viewer': return <span className="inline-flex px-2 py-0.5 rounded-[4px] text-[12px] font-sans font-medium bg-ash text-fog">{role}</span>;
        default: return <span className="inline-flex px-2 py-0.5 rounded-[4px] text-[12px] font-sans font-medium bg-ash text-fog">{role}</span>;
    }
};

const Settings = () => {
    const [activeTab, setActiveTab] = React.useState('users'); // Set default to users for easier review
    const [saved, setSaved] = React.useState(false);

    // User Management States
    const [subTab, setSubTab] = React.useState('active');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [usersData, setUsersData] = React.useState(MOCK_USERS);
    const [pendingRequests, setPendingRequests] = React.useState(MOCK_PENDING);

    const [editingRoleUserId, setEditingRoleUserId] = React.useState(null);
    const [editingRoleValue, setEditingRoleValue] = React.useState('');
    const [revokeModalUser, setRevokeModalUser] = React.useState(null);
    const [rejectConfirmId, setRejectConfirmId] = React.useState(null);
    const [approveDiffRoleId, setApproveDiffRoleId] = React.useState(null);
    const [approveDiffRoleValue, setApproveDiffRoleValue] = React.useState('');
    const [openMenuId, setOpenMenuId] = React.useState(null);
    const [toasts, setToasts] = React.useState([]);

    const addToast = (msg) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, msg }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleRevoke = (user) => {
        setUsersData(prev => prev.filter(u => u.id !== user.id));
        setRevokeModalUser(null);
        addToast(`✓ Access revoked for ${user.name}.`);
    };

    const handleSuspend = (id) => {
        setUsersData(prev => prev.map(u => u.id === id ? { ...u, status: 'Suspended' } : u));
        setOpenMenuId(null);
        addToast('✓ Account suspended.');
    };

    const handleChangeRoleConfirm = (id) => {
        setUsersData(prev => prev.map(u => u.id === id ? { ...u, role: editingRoleValue } : u));
        const user = usersData.find(u => u.id === id);
        setEditingRoleUserId(null);
        addToast(`✓ Role updated for ${user.name}.`);
    };

    const handleReject = (id) => {
        setPendingRequests(prev => prev.filter(req => req.id !== id));
        setRejectConfirmId(null);
        addToast('✓ Request rejected.');
    };

    const handleApprove = (req, overrideRole = null) => {
        const finalRole = overrideRole || req.role;
        setUsersData(prev => [{
            id: Date.now(),
            name: req.name,
            email: req.email,
            matricule: req.matricule,
            department: req.department,
            role: finalRole,
            status: 'Active',
            lastLogin: 'Never'
        }, ...prev]);
        setPendingRequests(prev => prev.filter(r => r.id !== req.id));
        setApproveDiffRoleId(null);
        addToast(`✓ ${req.name} approved. Notification email sent.`);
    };

    const filteredUsers = usersData.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.matricule.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredPending = pendingRequests.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.matricule.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-56px)] -mx-8 -my-8 flex bg-slate relative" data-name="settings-page" data-file="components/Settings.js">

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
                    <div className="max-w-[1000px]">

                        {/* Retention Parameters */}
                        {activeTab === 'retention' && (
                            <div className="animate-in fade-in duration-300">
                                <h2 className="font-mono text-[22px] font-medium text-pure mb-2">Retention Parameters</h2>
                                <p className="font-sans text-sm text-fog mb-8">Define the maximum acceptable insured capital limits before triggering alerts or requiring reinsurance.</p>

                                <div className="card overflow-hidden max-w-[800px]">
                                    <div className="p-5 border-b border-ash bg-graphite flex justify-between items-center">
                                        <h3 className="font-mono text-[14px] font-semibold text-pure uppercase tracking-wider">Global & Per-Zone Limits</h3>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <div>
                                            <label className="label-text">Global Portfolio Limit (DZD)</label>
                                            <input type="number" className="input-field font-mono text-lg max-w-[300px]" defaultValue="50000000000" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Zone Classification */}
                        {activeTab === 'zones' && (
                            <div className="animate-in fade-in duration-300">
                                <h2 className="font-mono text-[22px] font-medium text-pure mb-2">Zone Classification Mapping</h2>
                                <p className="font-sans text-sm text-fog mb-8">Map wilayas to their respective RPA seismic zones. You can override the default classification if needed.</p>

                                <div className="card overflow-hidden max-w-[800px]">
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
                                                    <td className="px-4 py-3"><span className="text-fog">{z.defaultZone}</span></td>
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

                        {/* User Management */}
                        {activeTab === 'users' && (
                            <div className="animate-in fade-in duration-300">

                                {/* Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="font-mono text-[28px] font-medium text-pure">User Management</h2>
                                        <p className="font-sans text-[15px] text-fog mt-1">Manage active accounts and review access requests.</p>
                                    </div>
                                    <div className="relative w-[300px]">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-fog"><div className="icon-search text-[16px]"></div></div>
                                        <input
                                            type="text"
                                            placeholder="Search by name, email, or matricule..."
                                            className="bg-graphite border border-ash rounded-[6px] h-[40px] pl-9 pr-3 text-cloud focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal font-sans w-full text-sm"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="flex border-b border-ash mb-6 space-x-8">
                                    <button
                                        className={`pb-3 font-sans text-[15px] font-medium relative transition-colors ${subTab === 'active' ? 'text-teal border-b-2 border-teal' : 'text-fog hover:text-cloud border-b-2 border-transparent'}`}
                                        onClick={() => setSubTab('active')}
                                    >
                                        Active Users
                                    </button>
                                    <button
                                        className={`pb-3 font-sans text-[15px] font-medium relative transition-colors flex items-center ${subTab === 'pending' ? 'text-teal border-b-2 border-teal' : 'text-fog hover:text-cloud border-b-2 border-transparent'}`}
                                        onClick={() => setSubTab('pending')}
                                    >
                                        Pending Requests
                                        {pendingRequests.length > 0 && (
                                            <span className="ml-2 inline-flex items-center justify-center bg-[#DA3633] text-pure text-[11px] font-bold h-[18px] min-w-[18px] px-1.5 rounded-full">
                                                {pendingRequests.length}
                                            </span>
                                        )}
                                    </button>
                                </div>

                                {/* Active Users Content */}
                                {subTab === 'active' && (
                                    <div className="card overflow-hidden">
                                        <table className="w-full text-left whitespace-nowrap">
                                            <thead className="bg-graphite border-b border-ash">
                                                <tr>
                                                    <th className="px-6 py-4 font-sans text-[11px] font-semibold tracking-wider text-fog uppercase">Name</th>
                                                    <th className="px-4 py-4 font-sans text-[11px] font-semibold tracking-wider text-fog uppercase">Matricule</th>
                                                    <th className="px-4 py-4 font-sans text-[11px] font-semibold tracking-wider text-fog uppercase">Department</th>
                                                    <th className="px-4 py-4 font-sans text-[11px] font-semibold tracking-wider text-fog uppercase">Role</th>
                                                    <th className="px-4 py-4 font-sans text-[11px] font-semibold tracking-wider text-fog uppercase">Last Login</th>
                                                    <th className="px-4 py-4 font-sans text-[11px] font-semibold tracking-wider text-fog uppercase">Status</th>
                                                    <th className="px-4 py-4 w-12"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-ash/50">
                                                {filteredUsers.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="7" className="px-6 py-12 text-center">
                                                            <div className="w-12 h-12 rounded-full bg-graphite flex items-center justify-center mx-auto mb-3">
                                                                <div className="icon-user-plus text-xl text-fog"></div>
                                                            </div>
                                                            <div className="font-sans text-[15px] font-medium text-pure mb-1">No active users found.</div>
                                                            <div className="font-sans text-[13px] text-fog">Approved users will appear here.</div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredUsers.map(u => (
                                                        <tr key={u.id} className="hover:bg-graphite/30 transition-colors h-[48px]">
                                                            <td className="px-6 py-3">
                                                                <div className="font-sans text-[14px] font-medium text-pure">{u.name}</div>
                                                                <div className="font-sans text-[12px] text-fog">{u.email}</div>
                                                            </td>
                                                            <td className="px-4 py-3 font-mono text-[13px] text-fog">{u.matricule}</td>
                                                            <td className="px-4 py-3 font-sans text-[13px] text-cloud">{u.department}</td>
                                                            <td className="px-4 py-3">
                                                                {editingRoleUserId === u.id ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <select
                                                                            value={editingRoleValue}
                                                                            onChange={e => setEditingRoleValue(e.target.value)}
                                                                            className="bg-graphite border border-ash rounded-[4px] px-2 py-0.5 text-[12px] font-sans text-cloud focus:outline-none"
                                                                        >
                                                                            <option value="Risk Manager">Risk Manager</option>
                                                                            <option value="Underwriter">Underwriter</option>
                                                                            <option value="Analyst">Analyst</option>
                                                                            <option value="Viewer">Viewer</option>
                                                                        </select>
                                                                        <button onClick={() => handleChangeRoleConfirm(u.id)} className="text-[#2EA043] hover:text-[#2EA043]/80"><div className="icon-check text-sm"></div></button>
                                                                        <button onClick={() => setEditingRoleUserId(null)} className="text-fog hover:text-cloud"><div className="icon-x text-sm"></div></button>
                                                                    </div>
                                                                ) : (
                                                                    <RoleBadge role={u.role} />
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 font-sans text-[12px] text-fog">{u.lastLogin}</td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center">
                                                                    <div className={`w-1.5 h-1.5 rounded-full mr-2 ${u.status === 'Active' ? 'bg-[#2EA043]' : 'bg-fog'}`}></div>
                                                                    <span className={`font-sans text-[12px] font-medium ${u.status === 'Active' ? 'text-[#2EA043]' : 'text-fog'}`}>
                                                                        {u.status}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-right relative">
                                                                <button onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)} className="text-fog hover:text-pure transition-colors p-1 rounded hover:bg-graphite">
                                                                    <div className="icon-ellipsis text-[18px]"></div>
                                                                </button>

                                                                {openMenuId === u.id && (
                                                                    <>
                                                                        <div className="fixed inset-0 z-30" onClick={() => setOpenMenuId(null)}></div>
                                                                        <div className="absolute right-8 top-8 w-40 bg-graphite border border-ash rounded-[6px] shadow-modal py-1 z-40 overflow-hidden">
                                                                            <button onClick={() => { setEditingRoleUserId(u.id); setEditingRoleValue(u.role); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 font-sans text-[13px] text-cloud hover:bg-ash hover:text-pure transition-colors">Change Role</button>
                                                                            <button onClick={() => handleSuspend(u.id)} className="w-full text-left px-4 py-2 font-sans text-[13px] text-cloud hover:bg-ash hover:text-pure transition-colors">Suspend Account</button>
                                                                            <div className="h-px bg-ash my-1"></div>
                                                                            <button onClick={() => { setRevokeModalUser(u); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 font-sans text-[13px] text-[#DA3633] hover:bg-ash transition-colors">Revoke Access</button>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                        {filteredUsers.length > 0 && (
                                            <div className="px-6 py-4 border-t border-ash flex items-center justify-between bg-carbon">
                                                <div className="font-sans text-[12px] text-fog">Showing {filteredUsers.length} of {usersData.length} users</div>
                                                <div className="flex items-center gap-1 font-sans text-[12px] text-fog">
                                                    <button className="px-2 py-1 hover:text-pure disabled:opacity-50">Previous</button>
                                                    <button className="w-6 h-6 rounded flex items-center justify-center bg-graphite text-pure">1</button>
                                                    <button className="px-2 py-1 hover:text-pure disabled:opacity-50">Next</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Pending Requests Content */}
                                {subTab === 'pending' && (
                                    <div className="space-y-4">
                                        {filteredPending.length === 0 ? (
                                            <div className="card p-12 text-center">
                                                <div className="w-12 h-12 rounded-full border border-teal/30 bg-teal/10 flex items-center justify-center mx-auto mb-3">
                                                    <div className="icon-check text-xl text-teal"></div>
                                                </div>
                                                <div className="font-sans text-[15px] font-medium text-pure mb-1">No pending requests.</div>
                                                <div className="font-sans text-[13px] text-fog">New sign-up requests will appear here for your review.</div>
                                            </div>
                                        ) : (
                                            filteredPending.map(req => (
                                                <div key={req.id} className="bg-graphite border border-ash rounded-[8px] p-6 shadow-sm relative overflow-hidden group">

                                                    {/* Card Top Row */}
                                                    <div className="flex items-start justify-between mb-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full border border-teal bg-carbon flex items-center justify-center">
                                                                <div className="icon-user text-teal text-lg"></div>
                                                            </div>
                                                            <div>
                                                                <div className="font-sans text-[16px] font-medium text-pure leading-tight">{req.name}</div>
                                                                <div className="font-sans text-[13px] text-fog">{req.email}</div>
                                                            </div>
                                                        </div>
                                                        <div className="font-sans text-[12px] text-fog">Submitted {req.submitted}</div>
                                                    </div>

                                                    {/* Card Middle Row */}
                                                    <div className="grid grid-cols-[140px_1fr] gap-y-3 font-sans text-[13px] mb-6 pl-[56px]">
                                                        <div className="text-fog">Employee ID:</div>
                                                        <div className="text-cloud font-mono">{req.matricule}</div>

                                                        <div className="text-fog">Department:</div>
                                                        <div className="text-cloud">{req.department}</div>

                                                        <div className="text-fog">Role Requested:</div>
                                                        <div><RoleBadge role={req.role} /></div>

                                                        <div className="text-fog">Reason:</div>
                                                        <div className={`italic ${req.reason ? 'text-cloud' : 'text-fog'}`}>
                                                            {req.reason || 'No reason provided.'}
                                                        </div>
                                                    </div>

                                                    {/* Card Bottom Row - Actions */}
                                                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-ash/50 mt-4">

                                                        {rejectConfirmId === req.id ? (
                                                            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
                                                                <span className="font-sans text-[12px] text-fog mr-2">Are you sure? This will notify the employee.</span>
                                                                <button onClick={() => setRejectConfirmId(null)} className="font-sans text-[13px] text-fog hover:text-pure transition-colors">Cancel</button>
                                                                <button onClick={() => handleReject(req.id)} className="bg-[#DA3633] text-pure font-sans font-medium text-[13px] px-4 h-[32px] rounded-[4px] hover:bg-[#DA3633]/90 transition-colors">Yes, Reject</button>
                                                            </div>
                                                        ) : (
                                                            <button onClick={() => setRejectConfirmId(req.id)} className="font-sans text-[13px] font-medium text-[#DA3633] hover:text-[#DA3633]/80 transition-colors px-3 h-[36px]">Reject</button>
                                                        )}

                                                        {!rejectConfirmId && (
                                                            <>
                                                                <div className="relative">
                                                                    {approveDiffRoleId === req.id ? (
                                                                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                                                                            <select
                                                                                value={approveDiffRoleValue}
                                                                                onChange={e => setApproveDiffRoleValue(e.target.value)}
                                                                                className="bg-carbon border border-ash rounded-[4px] px-3 h-[36px] text-[13px] font-sans text-cloud focus:border-amber focus:outline-none"
                                                                            >
                                                                                <option value="Risk Manager">Risk Manager</option>
                                                                                <option value="Underwriter">Underwriter</option>
                                                                                <option value="Analyst">Analyst</option>
                                                                                <option value="Viewer">Viewer</option>
                                                                            </select>
                                                                            <button onClick={() => handleApprove(req, approveDiffRoleValue)} className="border border-amber text-amber font-sans font-medium text-[13px] px-4 h-[36px] rounded-[6px] hover:bg-amber/10 transition-colors">
                                                                                Approve as {approveDiffRoleValue} <span className="ml-1">→</span>
                                                                            </button>
                                                                            <button onClick={() => setApproveDiffRoleId(null)} className="text-fog hover:text-pure px-2"><div className="icon-x text-sm"></div></button>
                                                                        </div>
                                                                    ) : (
                                                                        <button onClick={() => { setApproveDiffRoleId(req.id); setApproveDiffRoleValue(req.role); }} className="border border-amber text-amber font-sans font-medium text-[13px] px-4 h-[36px] rounded-[6px] hover:bg-amber/10 transition-colors">
                                                                            Approve with different role
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                {approveDiffRoleId !== req.id && (
                                                                    <button onClick={() => handleApprove(req)} className="bg-[#2EA043] text-pure font-sans font-medium text-[13px] px-6 h-[36px] rounded-[6px] hover:bg-[#2EA043]/90 transition-colors shadow-sm">
                                                                        Approve
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>

                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
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

                                <div className="card overflow-hidden max-w-[800px]">
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
                    <div className="h-[72px] bg-carbon border-t border-ash px-8 flex items-center justify-end gap-4 shrink-0 z-10">
                        {saved && <span className="font-sans text-sm text-green flex items-center gap-2 animate-in fade-in"><div className="icon-check"></div> Settings saved</span>}
                        <button className="btn-outline h-[40px]">Cancel</button>
                        <button className="btn-primary h-[40px]" onClick={handleSave}>Save Changes</button>
                    </div>
                )}

            </div>

            {/* Revoke Modal */}
            {revokeModalUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-graphite border border-ash rounded-[8px] shadow-[0_24px_64px_rgba(0,0,0,0.8)] w-full max-w-[480px] p-8 animate-in zoom-in-95 duration-200">
                        <h2 className="font-mono text-[20px] font-medium text-pure mb-3">Revoke access for {revokeModalUser.name}?</h2>
                        <p className="font-sans text-[14px] text-fog mb-8 leading-relaxed">This will immediately sign them out and permanently remove their account. This action cannot be undone.</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setRevokeModalUser(null)} className="font-sans text-[14px] font-medium px-4 h-[40px] border border-ash text-cloud hover:bg-ash hover:text-pure rounded-[6px] transition-colors">Cancel</button>
                            <button onClick={() => handleRevoke(revokeModalUser)} className="bg-[#DA3633] hover:bg-[#DA3633]/90 text-pure font-sans font-medium rounded-[6px] px-6 h-[40px] shadow-sm transition-colors">Yes, Revoke Access</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toasts Container */}
            {toasts.length > 0 && (
                <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
                    {toasts.map(t => (
                        <div key={t.id} className="bg-carbon border border-ash rounded-[6px] shadow-[0_4px_16px_rgba(0,0,0,0.5)] px-4 py-3 font-sans text-[13px] font-medium text-pure flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {t.msg}
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
};