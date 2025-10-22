import React, { useState } from 'react';
import { runBacktest } from '../services/geminiService';
import type { BacktestInput, DynamicBacktestResult, PineScriptVersion } from '../types';
import { BACKTEST_TIMEFRAMES } from '../constants';
import { LoadingSpinner } from './LoadingSpinner';
import { BacktestResultDisplay } from './BacktestResultDisplay';
import { MarketChart } from './MarketChart';
import { CodeBlock } from './CodeBlock';
import { BeakerIcon } from './icons/BeakerIcon';
import { createTradingViewUrl } from '../utils/tradingView';


interface BacktestRunnerProps {
    pineScript: string;
    pineScriptVersion: PineScriptVersion;
    onBacktestComplete: (result: DynamicBacktestResult) => void;
}

const AnalysisCard: React.FC<{ title: string; content: string; color: string }> = ({ title, content, color }) => (
    <div className="bg-gray-900/50 p-4 rounded-lg">
        <h4 className={`text-md font-semibold mb-2 ${color}`}>{title}</h4>
        <p className="text-sm text-gray-300">{content}</p>
    </div>
);

export const BacktestRunner: React.FC<BacktestRunnerProps> = ({ pineScript, pineScriptVersion, onBacktestComplete }) => {
    const [backtestInput, setBacktestInput] = useState<BacktestInput>({
        asset: 'BTCUSDT',
        timeframe: '1h',
        startDate: '',
        endDate: '',
    });
    const [result, setResult] = useState<DynamicBacktestResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setBacktestInput(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const backtestResult = await runBacktest(pineScript, pineScriptVersion, backtestInput);
            setResult(backtestResult);
            onBacktestComplete(backtestResult);
        } catch (err) {
            console.error('Backtest failed:', err);
            setError('The AI failed to run the backtest. This might be a temporary issue. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const commonInputClasses = "w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors";
    const commonLabelClasses = "block mb-2 text-sm font-medium text-gray-300";

    return (
        <div className="mt-8 p-6 bg-gray-900/40 border border-gray-700 rounded-2xl">
            <h3 className="text-xl font-bold text-teal-300 flex items-center gap-2 mb-4">
                <BeakerIcon className="w-6 h-6" />
                Dynamic Backtesting Sandbox
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div className="lg:col-span-1">
                    <label htmlFor="asset" className={commonLabelClasses}>Asset/Ticker</label>
                    <input
                        type="text"
                        id="asset"
                        name="asset"
                        value={backtestInput.asset}
                        onChange={handleInputChange}
                        className={commonInputClasses}
                        placeholder="e.g., ETHUSDT"
                    />
                </div>
                 <div className="lg:col-span-1">
                    <label htmlFor="timeframe" className={commonLabelClasses}>Timeframe</label>
                    <select id="timeframe" name="timeframe" value={backtestInput.timeframe} onChange={handleInputChange} className={commonInputClasses}>
                        {BACKTEST_TIMEFRAMES.map(tf => <option key={tf} value={tf}>{tf}</option>)}
                    </select>
                </div>
                <div className="lg:col-span-1">
                    <label htmlFor="startDate" className={commonLabelClasses}>Start Date</label>
                    <input type="date" id="startDate" name="startDate" value={backtestInput.startDate} onChange={handleInputChange} className={commonInputClasses} />
                </div>
                <div className="lg:col-span-1">
                    <label htmlFor="endDate" className={commonLabelClasses}>End Date</label>
                    <input type="date" id="endDate" name="endDate" value={backtestInput.endDate} onChange={handleInputChange} className={commonInputClasses} />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 focus:outline-none focus:ring-4 focus:ring-teal-500/50 lg:col-span-1"
                >
                    {isLoading ? 'Simulating...' : 'Run Backtest'}
                </button>
            </form>

            <div className="mt-6 min-h-[100px]">
                {isLoading && <div className="h-[200px] relative"><LoadingSpinner /></div>}
                {error && <p className="text-center text-red-400">{error}</p>}
                {result && (
                    <div className="space-y-6 animate-fade-in">
                        {result.chartData && result.chartData.length > 0 && (
                            <div>
                                <h4 className="text-lg font-semibold text-gray-200 mb-4">
                                    Visual Backtest Chart
                                </h4>
                                <div className="h-[400px] bg-gray-900/50 rounded-lg p-2">
                                    <MarketChart
                                        data={result.chartData}
                                        trades={result.trades}
                                        asset={backtestInput.asset}
                                        timeframe={backtestInput.timeframe}
                                    />
                                </div>
                            </div>
                        )}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                               <h4 className="text-lg font-semibold text-gray-200">
                                Backtest Results for <span className="text-teal-300">{backtestInput.asset}</span>
                               </h4>
                            </div>
                            <BacktestResultDisplay result={result.metrics} />
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-gray-200 mb-4">AI-Generated Analysis</h4>
                            <div className="grid md:grid-cols-3 gap-4">
                                <AnalysisCard title="Strengths" content={result.analysis.strengths} color="text-green-400" />
                                <AnalysisCard title="Weaknesses" content={result.analysis.weaknesses} color="text-yellow-400" />
                                <AnalysisCard title="Suggestion" content={result.analysis.suggestion} color="text-sky-400" />
                            </div>
                        </div>
                         <div>
                            <h4 className="text-lg font-semibold text-gray-200 mb-2">Optimized Pine Script for This Scenario</h4>
                            <p className="text-xs text-gray-400 mb-2">This script has been generated with the exact parameters of the backtest above for easy deployment.</p>
                            <CodeBlock 
                                code={result.updatedPineScript}
                                tradingViewUrl={createTradingViewUrl(result.input)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};