import React from 'react';
import type { BacktestResult } from '../types';

const StatCard: React.FC<{ label: string; value: string | number; className?: string }> = ({ label, value, className = '' }) => (
    <div className={`bg-gray-700/50 p-4 rounded-lg text-center ${className}`}>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-xl font-bold text-teal-300">{value}</p>
    </div>
);

interface BacktestResultDisplayProps {
    result: BacktestResult;
}

export const BacktestResultDisplay: React.FC<BacktestResultDisplayProps> = ({ result }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
           <StatCard label="Net Profit" value={result.netProfit} />
           <StatCard label="Win Rate" value={result.winRate} />
           <StatCard label="Profit Factor" value={result.profitFactor} />
           <StatCard label="Max Drawdown" value={result.maxDrawdown} />
           <StatCard label="Total Trades" value={result.totalTrades} />
        </div>
    );
};
