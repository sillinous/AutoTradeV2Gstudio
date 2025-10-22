import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, Time } from 'lightweight-charts';
import type { OHLCData, Trade } from '../types';

interface MarketChartProps {
    data: OHLCData[];
    trades: Trade[];
    asset: string;
    timeframe: string;
}

// Lightweight Charts expects time in UTC timestamp or 'YYYY-MM-DD' format.
// This function handles both full ISO strings and date-only strings.
const formatTime = (time: string): Time => {
    const date = new Date(time);
    // getTime() returns milliseconds, but the library needs seconds for numeric timestamps.
    return Math.floor(date.getTime() / 1000) as Time;
};

export const MarketChart: React.FC<MarketChartProps> = ({ data, trades, asset, timeframe }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
    const resizeObserver = useRef<ResizeObserver | null>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        chartRef.current = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: '#111827' }, // bg-gray-900
                textColor: '#D1D5DB', // text-gray-300
            },
            grid: {
                vertLines: { color: '#374151' }, // gray-700
                horzLines: { color: '#374151' }, // gray-700
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            }
        });

        const candlestickSeries = chartRef.current.addCandlestickSeries({
            upColor: '#22c55e', // green-500
            downColor: '#ef4444', // red-500
            borderDownColor: '#ef4444',
            borderUpColor: '#22c55e',
            wickDownColor: '#ef4444',
            wickUpColor: '#22c55e',
        });
        
        const formattedData = data.map(d => ({
            ...d,
            time: formatTime(d.time)
        }));
        candlestickSeries.setData(formattedData);

        const tradeMarkers = trades.map(trade => ({
            time: formatTime(trade.time),
            position: trade.type === 'buy' ? 'belowBar' : 'aboveBar',
            color: trade.type === 'buy' ? '#22c55e' : '#ef4444',
            shape: trade.type === 'buy' ? 'arrowUp' : 'arrowDown',
            text: trade.type === 'buy' ? `Buy @ ${trade.price.toFixed(2)}` : `Sell @ ${trade.price.toFixed(2)}`,
        }));
        candlestickSeries.setMarkers(tradeMarkers);

        chartRef.current.timeScale().fitContent();

        // Handle resizing
        resizeObserver.current = new ResizeObserver(entries => {
            if (entries[0].contentRect.width) {
                chartRef.current?.applyOptions({ width: entries[0].contentRect.width });
            }
        });
        resizeObserver.current.observe(chartContainerRef.current);

        return () => {
            resizeObserver.current?.disconnect();
            chartRef.current?.remove();
        };

    }, [data, trades]);

    return <div ref={chartContainerRef} className="w-full h-full" />;
};