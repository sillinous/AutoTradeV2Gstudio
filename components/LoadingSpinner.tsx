import React, { useState, useEffect } from 'react';
import { CheckIcon } from './icons/CheckIcon';

const generationSteps = [
    "Analyzing user preferences...",
    "Evaluating market conditions...",
    "Selecting optimal indicators...",
    "Designing core strategy logic...",
    "Calibrating risk parameters...",
    "Generating Pine Script v5 code...",
    "Simulating hypothetical backtest...",
    "Finalizing analysis...",
];

export const LoadingSpinner: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep(prevStep => {
                // Stop interval when all steps are done
                if (prevStep >= generationSteps.length - 1) {
                    clearInterval(interval);
                    return prevStep;
                }
                return prevStep + 1;
            });
        }, 1500); // Change step every 1.5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full m-auto">
            <svg
                className="animate-spin h-10 w-10 text-teal-400 mb-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                ></circle>
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
            </svg>
            <h2 className="text-xl font-semibold text-gray-300 mb-4">AI Agents at Work...</h2>
            <div className="w-full max-w-sm text-left">
                 <ul className="space-y-2">
                    {generationSteps.map((step, index) => (
                        <li key={index} className={`flex items-center gap-3 transition-opacity duration-500 ${index <= currentStep ? 'opacity-100' : 'opacity-40'}`}>
                           {index < currentStep ? (
                                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-green-500/20">
                                    <CheckIcon className="w-4 h-4 text-green-400" />
                                </span>
                           ) : (
                                <span className={`w-5 h-5 flex items-center justify-center rounded-full ${index === currentStep ? 'bg-teal-500/20 animate-pulse' : 'bg-gray-700'}`}>
                                     <span className={`w-2 h-2 rounded-full ${index === currentStep ? 'bg-teal-400' : 'bg-gray-500'}`}></span>
                                </span>
                           )}
                           <span className={`text-sm ${index < currentStep ? 'text-gray-400' : 'text-gray-200 font-medium'}`}>
                                {step}
                           </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};