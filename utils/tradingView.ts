export const formatTimeframeForTradingView = (timeframe: string): string => {
    const unit = timeframe.slice(-1);
    const value = parseInt(timeframe.slice(0, -1), 10);

    // It's possible for timeframe to be just 'D', 'W', 'M'.
    if (isNaN(value) && timeframe.length === 1) {
        return timeframe.toUpperCase();
    }

    switch (unit) {
        case 'm':
            return value.toString();
        case 'h':
            return (value * 60).toString();
        case 'd':
            return 'D';
        case 'W':
            return 'W';
        case 'M':
            return 'M';
        default:
            return timeframe; // fallback
    }
};

interface TradingViewURLParams {
    asset: string;
    timeframe: string;
    startDate?: string;
    endDate?: string;
}

export const createTradingViewUrl = ({ asset, timeframe, startDate, endDate }: TradingViewURLParams): string => {
    const baseUrl = `https://www.tradingview.com/chart/`;
    const params = new URLSearchParams();
    
    params.set('symbol', asset);
    params.set('interval', formatTimeframeForTradingView(timeframe));

    if (startDate && endDate) {
        // Convert YYYY-MM-DD to UNIX timestamp in seconds
        const fromTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
        const toTimestamp = Math.floor(new Date(endDate).getTime() / 1000);
        params.set('from', fromTimestamp.toString());
        params.set('to', toTimestamp.toString());
    }
    
    return `${baseUrl}?${params.toString()}`;
};