import React from 'react';
import type { LogicStep, LogicStepType } from '../types';
import { ConditionIcon } from './icons/ConditionIcon';
import { ActionIcon } from './icons/ActionIcon';
import { EntryIcon } from './icons/EntryIcon';
import { ExitIcon } from './icons/ExitIcon';
import { ArrowDownIcon } from './icons/ArrowDownIcon';

const iconMap: Record<LogicStepType, { icon: React.FC<React.SVGProps<SVGSVGElement>>; color: string; }> = {
    condition: { icon: ConditionIcon, color: 'border-sky-500' },
    action: { icon: ActionIcon, color: 'border-purple-500' },
    entry: { icon: EntryIcon, color: 'border-green-500' },
    exit: { icon: ExitIcon, color: 'border-red-500' },
};

const LogicStepCard: React.FC<{ step: LogicStep }> = ({ step }) => {
    const { icon: Icon, color } = iconMap[step.type] || iconMap.action;

    return (
        <div className={`bg-gray-800/60 p-4 rounded-lg border-l-4 ${color} flex items-start gap-4`}>
            <div className={`p-2 rounded-full bg-gray-700`}>
                <Icon className="w-6 h-6 text-gray-300" />
            </div>
            <div>
                <h4 className="font-bold text-gray-200 capitalize">{step.type}</h4>
                <p className="text-gray-300 text-sm">{step.description}</p>
            </div>
        </div>
    );
};

interface StrategyLogicVisualizerProps {
    steps: LogicStep[];
}

export const StrategyLogicVisualizer: React.FC<StrategyLogicVisualizerProps> = ({ steps }) => {
    return (
        <div className="space-y-2">
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    <LogicStepCard step={step} />
                    {index < steps.length - 1 && (
                        <div className="flex justify-center">
                            <ArrowDownIcon className="w-5 h-5 text-gray-600" />
                        </div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};
