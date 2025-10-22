import React from 'react';
import { TRADING_STYLES, MARKETS, RISK_TOLERANCES, PINESCRIPT_VERSIONS } from '../constants';
import type { UserInput } from '../types';
import { ChartBarIcon } from './icons/ChartBarIcon';

interface StrategyFormProps {
  userInput: UserInput;
  setUserInput: React.Dispatch<React.SetStateAction<UserInput>>;
  onSubmit: (input: UserInput) => void;
  isLoading: boolean;
}

export const StrategyForm: React.FC<StrategyFormProps> = ({ userInput, setUserInput, onSubmit, isLoading }) => {

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInput(prev => ({
      ...prev,
      [name]: e.target.type === 'number' ? parseFloat(value) : value,
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(userInput);
  };

  const commonSelectClasses = "w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors";
  const commonLabelClasses = "block mb-2 text-sm font-medium text-gray-300";

  return (
    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 shadow-2xl">
      <h2 className="text-2xl font-bold mb-6 text-teal-300 flex items-center gap-2">
        <ChartBarIcon className="w-6 h-6" />
        Strategy Configuration
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="tradingStyle" className={commonLabelClasses}>Trading Style</label>
          <select id="tradingStyle" name="tradingStyle" value={userInput.tradingStyle} onChange={handleInputChange} className={commonSelectClasses}>
            {TRADING_STYLES.map(style => <option key={style} value={style}>{style}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="market" className={commonLabelClasses}>Market</label>
          <select id="market" name="market" value={userInput.market} onChange={handleInputChange} className={commonSelectClasses}>
            {MARKETS.map(market => <option key={market} value={market}>{market}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="riskTolerance" className={commonLabelClasses}>Risk Tolerance</label>
          <select id="riskTolerance" name="riskTolerance" value={userInput.riskTolerance} onChange={handleInputChange} className={commonSelectClasses}>
            {RISK_TOLERANCES.map(risk => <option key={risk} value={risk}>{risk}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="pineScriptVersion" className={commonLabelClasses}>Pine Script Version</label>
          <select id="pineScriptVersion" name="pineScriptVersion" value={userInput.pineScriptVersion} onChange={handleInputChange} className={commonSelectClasses}>
            {PINESCRIPT_VERSIONS.map(version => <option key={version} value={version}>{version.toUpperCase()}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="capital" className={commonLabelClasses}>Initial Capital (USD)</label>
          <input
            type="number"
            id="capital"
            name="capital"
            value={userInput.capital}
            onChange={handleInputChange}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            min="100"
            step="100"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transform hover:scale-105"
        >
          {isLoading ? 'Agents are Generating...' : 'Generate Strategy'}
        </button>
      </form>
    </div>
  );
};