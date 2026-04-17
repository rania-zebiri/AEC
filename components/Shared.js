const ZoneBadge = ({ zone }) => {
    const zoneConfig = {
        '0': { color: 'text-zone-0', border: 'border-zone-0', bg: 'bg-zone-0', label: '0' },
        'I': { color: 'text-zone-1', border: 'border-zone-1', bg: 'bg-zone-1', label: 'I' },
        'IIa': { color: 'text-zone-2', border: 'border-zone-2', bg: 'bg-zone-2', label: 'IIa' },
        'IIb': { color: 'text-zone-3', border: 'border-zone-3', bg: 'bg-zone-3', label: 'IIb' },
        'III': { color: 'text-zone-4', border: 'border-zone-4', bg: 'bg-zone-4', label: 'III' }
    };
    
    const config = zoneConfig[zone] || zoneConfig['0'];
    
    return (
        <span className={`inline-flex items-center h-[22px] px-2 rounded-[4px] font-mono text-[11px] font-medium border-l-2 ${config.border} ${config.color} ${config.bg} bg-opacity-15`}>
            [ {config.label} ]
        </span>
    );
};

const TrendArrow = ({ value }) => {
    const isPositive = value >= 0;
    const colorClass = isPositive ? 'text-green' : 'text-red';
    const icon = isPositive ? '▲' : '▼';
    
    return (
        <span className={`font-mono text-[11px] ${colorClass} ml-2`}>
            {icon} {formatPercent(value)}
        </span>
    );
};

const DZDArmount = ({ value, isLoss = false, overLimit = false }) => {
    const colorClass = isLoss ? 'text-red' : 'text-cloud';
    const underlineClass = overLimit ? 'border-b border-red border-dashed' : '';
    
    return (
        <span className={`font-mono ${colorClass} ${underlineClass} text-right inline-block`}>
            {formatDZD(value)}
        </span>
    );
};

const AlertBanner = ({ title, message, severity = 'warning', onDismiss }) => {
    const severityColors = {
        info: 'border-blue text-blue',
        warning: 'border-amber text-amber',
        critical: 'border-red text-red'
    };
    
    const color = severityColors[severity] || severityColors.info;
    
    return (
        <div className={`w-full bg-graphite border-l-[4px] ${color} p-3 flex items-start justify-between mb-8 shadow-sm rounded-r-[6px]`}>
            <div className="flex items-start">
                <div className={`icon-triangle-alert text-lg mt-0.5 mr-3 ${color.split(' ')[1]}`}></div>
                <div>
                    <h4 className="font-mono text-sm font-semibold text-pure mb-1">{title}</h4>
                    <p className="font-sans text-sm text-cloud">{message}</p>
                </div>
            </div>
            {onDismiss && (
                <button onClick={onDismiss} className="text-fog hover:text-pure ml-4">
                    <div className="icon-x text-lg"></div>
                </button>
            )}
        </div>
    );
};