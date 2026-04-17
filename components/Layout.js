const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'earth', path: 'index.html' },
    { id: 'map', label: 'Risk Map', icon: 'map', path: 'map.html' },
    { id: 'portfolio', label: 'Portfolio', icon: 'chart-pie', path: 'portfolio.html' },
    { id: 'hotspots', label: 'Hotspots', icon: 'flame', path: 'hotspots.html' },
    { id: 'pml', label: 'PML Simulator', icon: 'activity', path: 'pml.html' },
    { id: 'what-if', label: 'What-If', icon: 'flask-conical', path: 'what-if.html' },
    { id: 'underwriting', label: 'Underwriting', icon: 'clipboard-list', path: 'underwriting.html' },
    { id: 'client-scores', label: 'Client Scores', icon: 'user-check', path: 'client-scores.html' },
    { id: 'opportunities', label: 'Opportunities', icon: 'trending-up', path: 'opportunities.html' },
    { id: 'report', label: 'Monthly Report', icon: 'calendar', path: 'report.html' },
    { id: 'acaps', label: 'ACAPS Report', icon: 'file-text', path: 'acaps.html' },
    { id: 'settings', label: 'Settings', icon: 'settings', path: 'settings.html' },
];

const Sidebar = ({ currentPath }) => {
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    
    // Check path to highlight active nav
    const activeId = navItems.find(item => currentPath.includes(item.path))?.id || 'dashboard';

    return (
        <div className={`flex flex-col bg-carbon border-r border-ash h-screen sticky top-0 transition-all duration-300 ${isCollapsed ? 'w-[64px]' : 'w-[240px]'}`}>
            {/* Header */}
            <div className="h-[56px] flex items-center justify-between px-4 border-b border-ash">
                {!isCollapsed && <span className="font-mono font-bold text-pure text-lg tracking-tight">SEISMIC<span className="text-teal">RISK</span></span>}
                <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-fog hover:text-pure transition-colors">
                    <div className="icon-menu text-xl"></div>
                </button>
            </div>
            
            {/* Nav Links */}
            <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
                <ul className="space-y-1 px-2">
                    {navItems.map(item => {
                        const isActive = item.id === activeId;
                        return (
                            <li key={item.id}>
                                <a href={item.path} className={`flex items-center h-[40px] px-3 rounded-[6px] transition-colors group ${isActive ? 'bg-graphite text-teal' : 'text-fog hover:bg-graphite hover:text-pure'}`}>
                                    <div className={`icon-${item.icon} text-lg ${isActive ? 'text-teal' : 'text-fog group-hover:text-pure'}`}></div>
                                    {!isCollapsed && <span className="ml-3 font-sans text-[14px] font-medium whitespace-nowrap">{item.label}</span>}
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </div>
            
            {/* Footer / Live Feed */}
            <div className="p-4 border-t border-ash">
                <div className="flex items-center">
                    <div className="relative flex h-3 w-3 mr-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red"></span>
                    </div>
                    {!isCollapsed && (
                        <span className="font-mono text-[11px] text-cloud">CRAAG Feed: Live</span>
                    )}
                </div>
            </div>
        </div>
    );
};

const Layout = ({ children }) => {
    const currentPath = window.location.pathname;
    
    return (
        <div className="flex min-h-screen bg-slate">
            <Sidebar currentPath={currentPath} />
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-[56px] border-b border-ash bg-slate/90 backdrop-blur sticky top-0 z-10 flex items-center px-8">
                    {/* Top nav area placeholder */}
                </header>
                <main className="flex-1 p-8 max-w-[1440px] mx-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
};