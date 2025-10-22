import React, { useState } from 'react';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';

interface CodeBlockProps {
    code: string;
    tradingViewUrl?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, tradingViewUrl }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative bg-gray-900 rounded-lg">
            <div className="absolute top-2 right-2 flex items-center gap-2">
                {tradingViewUrl && (
                     <a
                        href={tradingViewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors text-gray-300 text-xs font-semibold"
                        title="Open this asset and timeframe on TradingView"
                    >
                        <ExternalLinkIcon className="w-4 h-4" />
                        TradingView
                    </a>
                )}
                <button
                    onClick={handleCopy}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors text-gray-300"
                    aria-label="Copy Pine Script"
                >
                    {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <ClipboardIcon className="w-5 h-5" />}
                </button>
            </div>
            <pre className="p-4 pt-12 text-sm text-gray-200 overflow-x-auto rounded-lg max-h-60">
                <code>{code}</code>
            </pre>
        </div>
    );
};
