import React from 'react';
import type { SavedStrategy } from '../types';
import { TrashIcon } from './icons/TrashIcon';

interface SavedStrategyCardProps {
    strategy: SavedStrategy;
    onLoad: (strategy: SavedStrategy) => void;
    onDelete: (strategyId: string) => void;
}

const Stat: React.FC<{ label: string; value: string | number; className?: string }> = ({ label, value, className = '' }) => (
    <div className="text-center">
        <p className="text-xs text-gray-400">{label}</p>
        <p className={`text-sm font-semibold ${className}`}>{value}</p>
    </div>
);


export const SavedStrategyCard: React.FC<SavedStrategyCardProps> = ({ strategy, onLoad, onDelete }) => {
    
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card's onClick from firing
        if (window.confirm(`Are you sure you want to delete "${strategy.strategyName}"?`)) {
            onDelete(strategy.id);
        }
    };

    return (
        <div 
            className="bg-gray-800/60 p-4 rounded-lg border border-gray-700 hover:border-teal-500/50 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            onClick={() => onLoad(strategy)}
        >
            <div className="flex-grow">
                <h3 className="font-bold text-teal-300 text-lg">{strategy.strategyName}</h3>
                <p className="text-xs text-gray-500 mb-2">Saved on: {new Date(strategy.savedAt).toLocaleDateString()}</p>
                <div className="flex items-center gap-3 text-xs">
                    <span className="bg-gray-700 px-2 py-1 rounded">Style: {strategy.tradingStyle}</span>
                    <span className="bg-gray-700 px-2 py-1 rounded">Market: {strategy.market}</span>
                </div>
            </div>
            <div className="w-full sm:w-auto flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-gray-700 pt-4 sm:pt-0 sm:pl-4 mt-4 sm:mt-0">
                <Stat label="AI Confidence" value={`${(strategy.confidenceScore * 100).toFixed(0)}%`} className="text-blue-300" />
                <Stat label="Win Rate" value={strategy.backtestHighlights.winRate} className="text-green-400" />
                <Stat label="Net Profit" value={strategy.backtestHighlights.netProfit} className="text-green-400" />
                <button 
                    onClick={handleDelete}
                    className="p-2 rounded-full text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                    aria-label="Delete strategy"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
