const formatDZD = (value) => {
    return new Intl.NumberFormat('fr-DZ', {
        useGrouping: true,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value).replace(/,/g, ' ') + ' DZD';
};

const formatPercent = (value) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
};