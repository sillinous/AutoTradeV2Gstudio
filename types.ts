export type TradingStyle = 'DayTrading' | 'SwingTrading' | 'Scalping' | 'PositionTrading' | 'HFT';
export type Market = 'Crypto' | 'Stocks' | 'Forex' | 'Commodities';
export type RiskTolerance = 'Low' | 'Medium' | 'High' | 'Aggressive';
export type PineScriptVersion = 'v5' | 'v6';

export interface UserInput {
  tradingStyle: TradingStyle;
  market: Market;
  riskTolerance: RiskTolerance;
  capital: number;
  pineScriptVersion: PineScriptVersion;
}

export interface StrategyParameters {
  [key: string]: string | number;
}

export interface BacktestResult {
    netProfit: string;
    totalTrades: number;
    winRate: string;
    profitFactor: number;
    maxDrawdown: string;
}

export type LogicStepType = 'condition' | 'action' | 'entry' | 'exit';

export interface LogicStep {
    type: LogicStepType;
    description: string;
}

export interface Strategy {
  strategyName: string;
  description: string;
  tradingStyle: TradingStyle;
  market: Market;
  riskTolerance: RiskTolerance;
  pineScriptVersion: PineScriptVersion;
  parameters: StrategyParameters;
  pineScript: string;
  confidenceScore: number;
  backtestHighlights: BacktestResult;
  logicBreakdown: LogicStep[];
  generationRationale: string;
}

export interface BacktestInput {
    asset: string;
    timeframe: string;
    startDate?: string;
    endDate?: string;
}

export interface BacktestAnalysis {
    strengths: string;
    weaknesses: string;
    suggestion: string;
}

export interface OHLCData {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
}

export interface Trade {
    time: string;
    type: 'buy' | 'sell';
    price: number;
}

export interface DynamicBacktestResult {
    input: BacktestInput;
    metrics: BacktestResult;
    analysis: BacktestAnalysis;
    chartData: OHLCData[];
    trades: Trade[];
    updatedPineScript: string;
}

export interface SavedStrategy extends Strategy {
    id: string;
    savedAt: string;
    backtestHistory: DynamicBacktestResult[];
}