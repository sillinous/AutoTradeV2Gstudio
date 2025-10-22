import React, { useState, useMemo } from 'react';
import type { Strategy, SavedStrategy, DynamicBacktestResult } from '../types';
import { SaveIcon } from './icons/SaveIcon';
import { WandIcon } from './icons/WandIcon';
import { BacktestRunner } from './BacktestRunner';
import { BacktestResultDisplay } from './BacktestResultDisplay';
import { CodeBlock } from './CodeBlock';
import { CodeIcon } from './icons/CodeIcon';
import { StrategyLogicVisualizer } from './StrategyLogicVisualizer';
import { createTradingViewUrl } from '../utils/tradingView';
import { BrainIcon } from './icons/BrainIcon';

interface StrategyResultProps {
  strategy: Strategy | SavedStrategy;
  onSave: (strategy: Strategy | SavedStrategy, customName: string) => void;
  isSaved: boolean;
  onBacktestComplete: (result: DynamicBacktestResult) => void;
  onOptimize: (strategy: Strategy | SavedStrategy) => void;
  isOptimizing: boolean;
}

const ParameterDisplay: React.FC<{ params: { [key: string]: string | number } }> = ({ params }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
        {Object.entries(params).map(([key, value]) => (
            <div key={key} className="bg-gray-900/50 p-2 rounded text-xs">
                <span className="font-semibold text-gray-400 capitalize">{key.replace(/_/g, ' ')}: </span>
                <span className="text-gray-200">{value.toString()}</span>
            </div>
        ))}
    </div>
);

const HistoricalBacktest: React.FC<{ test: DynamicBacktestResult }> = ({ test }) => {
    const [showScript, setShowScript] = useState(false);
    const tradingViewUrl = createTradingViewUrl(test.input);
    
    return (
        <div className="p-4 bg-gray-900/40 border border-gray-700 rounded-xl">
            <div className="flex justify-between items-center mb-2">
                 <div>
                    <h4 className="text-lg font-semibold text-gray-200">
                        Backtest: <span className="text-teal-300">{test.input.asset}</span> ({test.input.timeframe})
                    </h4>
                    <p className="text-xs text-gray-400">
                        Ran from {test.input.startDate || 'N/A'} to {test.input.endDate || 'N/A'}
                    </p>
                 </div>
                <button
                    onClick={() => setShowScript(!showScript)}
                    className="flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300 transition-colors font-semibold"
                    title="View Optimized Pine Script for this specific backtest"
                >
                    <CodeIcon className="w-5 h-5" />
                    {showScript ? 'Hide' : 'View'} Optimized Script
                </button>
            </div>
            <div className="mt-4">
              <BacktestResultDisplay result={test.metrics} />
            </div>
            {showScript && (
                <div className="mt-4">
                    <h5 className="text-sm font-semibold text-gray-300 mb-2">Optimized Pine Script for this scenario:</h5>
                    <CodeBlock 
                        code={test.updatedPineScript}
                        tradingViewUrl={tradingViewUrl}
                    />
                </div>
            )}
        </div>
    );
};

const HighlightedRationale: React.FC<{ text: string; keywords: string[] }> = ({ text, keywords }) => {
    if (!text || keywords.length === 0) {
        return <p className="text-gray-300 text-sm">{text}</p>;
    }
    const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
    const parts = text.split(regex);

    return (
        <p className="text-gray-300 text-sm leading-relaxed">
            {parts.map((part, i) => {
                const isKeyword = keywords.some(keyword => keyword.toLowerCase() === part.toLowerCase());
                if (isKeyword) {
                    return (
                        <span key={i} className="text-teal-300 font-semibold bg-teal-500/10 px-1.5 py-0.5 rounded-md">
                            {part}
                        </span>
                    );
                }
                return part;
            })}
        </p>
    );
};


export const StrategyResult: React.FC<StrategyResultProps> = ({ strategy, onSave, isSaved, onBacktestComplete, onOptimize, isOptimizing }) => {
  const confidenceColor = useMemo(() => {
    if (strategy.confidenceScore >= 0.8) return 'text-green-400';
    if (strategy.confidenceScore >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  }, [strategy.confidenceScore]);
  
  const handleSaveClick = () => {
    const customName = window.prompt("Enter a name for this strategy:", strategy.strategyName);
    if (customName) {
        onSave(strategy, customName);
    }
  };

  const savedStrategy = 'id' in strategy ? strategy as SavedStrategy : null;
  
  const rationaleKeywords = useMemo(() => [
      strategy.tradingStyle, 
      strategy.market, 
      strategy.riskTolerance
  ], [strategy]);

  return (
    <div className="flex flex-col h-full overflow-y-auto pr-2 animate-fade-in">
      <div className="flex-grow">
        <div className="flex justify-between items-start">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">{strategy.strategyName}</h2>
            <div className="flex items-center gap-2 flex-shrink-0">
                 <button
                    onClick={() => onOptimize(strategy)}
                    disabled={isOptimizing}
                    className="flex items-center gap-2 text-sm font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 text-white"
                 >
                    <WandIcon className="w-5 h-5" />
                    {isOptimizing ? 'Optimizing...' : 'Optimize'}
                 </button>
                 <button
                    onClick={handleSaveClick}
                    disabled={isSaved || isOptimizing}
                    className="flex items-center gap-2 text-sm font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700 text-gray-200 disabled:text-gray-400"
                 >
                    <SaveIcon className="w-5 h-5" />
                    {isSaved ? 'Saved' : 'Save Strategy'}
                 </button>
            </div>
        </div>
        <div className="flex items-center gap-4 text-sm mt-2 text-gray-400 mb-6">
            <span>Style: <span className="font-semibold text-gray-200">{strategy.tradingStyle}</span></span>
            <span>Market: <span className="font-semibold text-gray-200">{strategy.market}</span></span>
            <span>Risk: <span className="font-semibold text-gray-200">{strategy.riskTolerance}</span></span>
            <span>Version: <span className="font-semibold text-gray-200">{strategy.pineScriptVersion.toUpperCase()}</span></span>
             <div className="ml-auto">
                <span className="font-semibold">AI Confidence:</span>
                <span className={`ml-2 font-bold text-lg ${confidenceColor}`}>
                    {(strategy.confidenceScore * 100).toFixed(0)}%
                </span>
            </div>
        </div>

        <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-700 mb-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-2 flex items-center gap-2">
                <BrainIcon className="w-6 h-6 text-teal-300" />
                AI's Rationale
            </h3>
            <HighlightedRationale text={strategy.generationRationale} keywords={rationaleKeywords} />
        </div>


        <p className="text-gray-300 mb-6">{strategy.description}</p>
        
        {strategy.logicBreakdown && strategy.logicBreakdown.length > 0 && (
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-200 mb-4">Strategy Logic Flow</h3>
                <StrategyLogicVisualizer steps={strategy.logicBreakdown} />
            </div>
        )}

        <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Strategy Parameters</h3>
            <ParameterDisplay params={strategy.parameters} />
        </div>
        
        <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Initial Simulated Backtest</h3>
            <BacktestResultDisplay result={strategy.backtestHighlights} />
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-2">Base Pine Script {strategy.pineScriptVersion.toUpperCase()} for TradingView</h3>
          <CodeBlock code={strategy.pineScript} />
        </div>

        <BacktestRunner 
            pineScript={strategy.pineScript} 
            pineScriptVersion={strategy.pineScriptVersion}
            onBacktestComplete={onBacktestComplete} 
        />
        
        {savedStrategy && savedStrategy.backtestHistory.length > 0 && (
            <div className="mt-8">
                <h3 className="text-xl font-bold text-teal-300 mb-4">Saved Backtest History</h3>
                <div className="space-y-4">
                    {savedStrategy.backtestHistory.map((test, index) => (
                        <HistoricalBacktest key={index} test={test} />
                    ))}
                </div>
            </div>
        )}

      </div>
    </div>
  );
};