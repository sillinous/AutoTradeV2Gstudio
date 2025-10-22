import React, { useState, useCallback, useEffect } from 'react';
import { StrategyForm } from './components/StrategyForm';
import { StrategyResult } from './components/StrategyResult';
import { LoadingSpinner } from './components/LoadingSpinner';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { FolderIcon } from './components/icons/FolderIcon';
import { SavedStrategiesView } from './components/SavedStrategiesView';
import { generateTradingStrategy, optimizeStrategy } from './services/geminiService';
import type { Strategy, UserInput, SavedStrategy, DynamicBacktestResult } from './types';
import { v4 as uuidv4 } from 'uuid';


type View = 'generator' | 'saved';

const App: React.FC = () => {
  const [userInput, setUserInput] = useState<UserInput>({
    tradingStyle: 'DayTrading',
    market: 'Crypto',
    riskTolerance: 'Medium',
    capital: 10000,
    pineScriptVersion: 'v5',
  });
  const [currentStrategy, setCurrentStrategy] = useState<Strategy | SavedStrategy | null>(null);
  const [savedStrategies, setSavedStrategies] = useState<SavedStrategy[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('generator');

  useEffect(() => {
    try {
      const storedStrategies = localStorage.getItem('tradingStrategies');
      if (storedStrategies) {
        setSavedStrategies(JSON.parse(storedStrategies));
      }
    } catch (e) {
      console.error("Failed to load strategies from localStorage", e);
      setSavedStrategies([]);
    }
  }, []);

  const persistStrategies = (strategies: SavedStrategy[]) => {
      try {
        localStorage.setItem('tradingStrategies', JSON.stringify(strategies));
      } catch (e) {
        console.error("Failed to save strategies to localStorage", e);
      }
  };

  const handleFormSubmit = useCallback(async (input: UserInput) => {
    setIsGenerating(true);
    setError(null);
    setCurrentStrategy(null);
    try {
      const result = await generateTradingStrategy(input);
      setCurrentStrategy(result);
    } catch (err) {
      console.error('Error generating strategy:', err);
      setError('Failed to generate trading strategy. Please check your connection and API key, then try again.');
    } finally {
      setIsGenerating(false);
    }
  }, []);
  
  const handleSaveStrategy = (strategyToSave: Strategy | SavedStrategy, customName: string) => {
    if ('id' in strategyToSave) return;
    
    const newSavedStrategy: SavedStrategy = {
        ...strategyToSave,
        strategyName: customName,
        id: uuidv4(),
        savedAt: new Date().toISOString(),
        backtestHistory: [],
    };

    const updatedStrategies = [...savedStrategies, newSavedStrategy];
    setSavedStrategies(updatedStrategies);
    persistStrategies(updatedStrategies);
    setCurrentStrategy(newSavedStrategy);
  };

  const handleDeleteStrategy = (strategyId: string) => {
    const updatedStrategies = savedStrategies.filter(s => s.id !== strategyId);
    setSavedStrategies(updatedStrategies);
    persistStrategies(updatedStrategies);
    if (currentStrategy && 'id' in currentStrategy && currentStrategy.id === strategyId) {
        setCurrentStrategy(null);
    }
  };
  
  const handleLoadStrategy = (strategy: SavedStrategy) => {
    setCurrentStrategy(strategy);
    setCurrentView('generator');
  }

  const handleAddBacktestResult = (result: DynamicBacktestResult) => {
    if (currentStrategy && 'id' in currentStrategy) {
        const updatedStrategies = savedStrategies.map(s => {
            if (s.id === currentStrategy.id) {
                return {
                    ...s,
                    backtestHistory: [result, ...s.backtestHistory]
                };
            }
            return s;
        });
        setSavedStrategies(updatedStrategies);
        persistStrategies(updatedStrategies);
        setCurrentStrategy(prev => prev ? {...prev, backtestHistory: [result, ...(prev as SavedStrategy).backtestHistory]} : null);
    }
  };
  
    const handleOptimizeStrategy = async (strategyToOptimize: Strategy | SavedStrategy) => {
        setIsOptimizing(true);
        setError(null);
        try {
            const optimizedStrategy = await optimizeStrategy(strategyToOptimize);
            setCurrentStrategy(optimizedStrategy);
        } catch (err) {
            console.error('Error optimizing strategy:', err);
            setError('Failed to optimize the strategy. Please try again.');
        } finally {
            setIsOptimizing(false);
        }
    };

  const isCurrentStrategySaved = currentStrategy ? 'id' in currentStrategy && savedStrategies.some(s => s.id === currentStrategy.id) : false;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <div className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300 flex items-center justify-center gap-3">
            <SparklesIcon className="w-10 h-10" />
            Autonomous Trading Strategy Generator
          </h1>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            Leverage AI to design, analyze, and manage high-performance trading strategies.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <StrategyForm
              userInput={userInput}
              setUserInput={setUserInput}
              onSubmit={handleFormSubmit}
              isLoading={isGenerating}
            />
          </div>

          <div className="lg:col-span-2 bg-gray-800/50 rounded-2xl p-6 border border-gray-700 shadow-2xl min-h-[600px] flex flex-col">
            <div className="flex border-b border-gray-700 mb-4">
              <TabButton
                icon={<SparklesIcon className="w-5 h-5" />}
                label="Generator"
                isActive={currentView === 'generator'}
                onClick={() => setCurrentView('generator')}
              />
              <TabButton
                icon={<FolderIcon className="w-5 h-5" />}
                label="My Strategies"
                isActive={currentView === 'saved'}
                onClick={() => setCurrentView('saved')}
                count={savedStrategies.length}
              />
            </div>
            
            <div className="flex-grow overflow-y-auto">
                {currentView === 'generator' && (
                    <>
                        {isGenerating && <LoadingSpinner />}
                        {error && (
                          <div className="m-auto text-center">
                            <p className="text-red-400 font-semibold">An Error Occurred</p>
                            <p className="text-gray-400 mt-2">{error}</p>
                          </div>
                        )}
                        {!isGenerating && !error && !currentStrategy && (
                          <div className="m-auto text-center text-gray-500">
                            <h2 className="text-2xl font-bold text-gray-300 mb-2">Welcome to the Strategy Hub</h2>
                            <p>Configure your preferences and generate a new strategy to get started.</p>
                          </div>
                        )}
                        {currentStrategy && <StrategyResult 
                            strategy={currentStrategy} 
                            onSave={handleSaveStrategy} 
                            isSaved={isCurrentStrategySaved} 
                            onBacktestComplete={handleAddBacktestResult}
                            onOptimize={handleOptimizeStrategy}
                            isOptimizing={isOptimizing}
                        />}
                    </>
                )}
                {currentView === 'saved' && (
                    <SavedStrategiesView 
                        strategies={savedStrategies}
                        onLoad={handleLoadStrategy}
                        onDelete={handleDeleteStrategy}
                    />
                )}
            </div>
          </div>
        </main>
        <footer className="text-center mt-12 text-gray-500 text-sm">
            <p>Generated strategies are for informational purposes only and do not constitute financial advice.</p>
            <p>&copy; 2024 Autonomous Trading Systems Inc. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

const TabButton: React.FC<{icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void, count?: number}> = ({ icon, label, isActive, onClick, count }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors duration-200 border-b-2 ${
            isActive
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-gray-400 hover:text-gray-200'
        }`}
    >
        {icon}
        {label}
        {typeof count !== 'undefined' && (
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-teal-400/20 text-teal-300' : 'bg-gray-600 text-gray-200'}`}>
                {count}
            </span>
        )}
    </button>
);


export default App;