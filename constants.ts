import type { TradingStyle, Market, RiskTolerance, PineScriptVersion } from './types';

export const TRADING_STYLES: TradingStyle[] = ['DayTrading', 'SwingTrading', 'Scalping', 'PositionTrading', 'HFT'];
export const MARKETS: Market[] = ['Crypto', 'Stocks', 'Forex', 'Commodities'];
export const RISK_TOLERANCES: RiskTolerance[] = ['Low', 'Medium', 'High', 'Aggressive'];
export const PINESCRIPT_VERSIONS: PineScriptVersion[] = ['v5', 'v6'];
export const BACKTEST_TIMEFRAMES: string[] = ['1m', '3m', '5m', '15m', '30m', '45m', '1h', '2h', '3h', '4h', '1d', '1W', '1M'];