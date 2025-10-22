import React, { useState, useMemo } from 'react';
import type { SavedStrategy } from '../types';
import { SavedStrategyCard } from './SavedStrategyCard';

interface SavedStrategiesViewProps {
  strategies: SavedStrategy[];
  onLoad: (strategy: SavedStrategy) => void;
  onDelete: (strategyId: string) => void;
}

type SortKey = 'savedAt' | 'strategyName' | 'confidenceScore' | 'winRate' | 'netProfit';

export const SavedStrategiesView: React.FC<SavedStrategiesViewProps> = ({ strategies, onLoad, onDelete }) => {
    const [sortKey, setSortKey] = useState<SortKey>('savedAt');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const getBestMetric = (strategy: SavedStrategy, metric: 'winRate' | 'netProfit') => {
        const history = [strategy.backtestHighlights, ...strategy.backtestHistory.map(h => h.metrics)];
        const values = history.map(h => parseFloat(h[metric]));
        if (values.length === 0) return -Infinity;
        return Math.max(...values);
    };

    const sortedStrategies = useMemo(() => {
        return [...strategies].sort((a, b) => {
            let valA, valB;
            switch(sortKey) {
                case 'winRate':
                    valA = getBestMetric(a, 'winRate');
                    valB = getBestMetric(b, 'winRate');
                    break;
                case 'netProfit':
                    valA = getBestMetric(a, 'netProfit');
                    valB = getBestMetric(b, 'netProfit');
                    break;
                case 'strategyName':
                    valA = a.strategyName.toLowerCase();
                    valB = b.strategyName.toLowerCase();
                    break;
                default:
                    valA = a[sortKey];
                    valB = b[sortKey];
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [strategies, sortKey, sortDirection]);

    if (strategies.length === 0) {
        return (
            <div className="text-center text-gray-500 m-auto">
                <h3 className="text-xl font-bold text-gray-300">No Saved Strategies</h3>
                <p>Generate and save a strategy to see it here.</p>
            </div>
        );
    }
    
    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortKey(e.target.value as SortKey);
    };

    const toggleSortDirection = () => {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    };

  return (
    <div className="animate-fade-in pr-2">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-200">My Strategy Library</h2>
             <div className="flex items-center gap-2">
                <label htmlFor="sort-select" className="text-sm text-gray-400">Sort by:</label>
                <select 
                    id="sort-select" 
                    value={sortKey} 
                    onChange={handleSortChange}
                    className="p-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                    <option value="savedAt">Date Saved</option>
                    <option value="strategyName">Name</option>
                    <option value="confidenceScore">AI Confidence</option>
                    <option value="winRate">Best Win Rate</option>
                    <option value="netProfit">Best Net Profit</option>
                </select>
                <button onClick={toggleSortDirection} className="p-2 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                </button>
            </div>
        </div>
      <div className="space-y-4">
        {sortedStrategies.map(strategy => (
          <SavedStrategyCard
            key={strategy.id}
            strategy={strategy}
            onLoad={onLoad}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};
