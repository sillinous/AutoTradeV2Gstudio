import { GoogleGenAI, Type } from "@google/genai";
import type { UserInput, Strategy, DynamicBacktestResult, BacktestInput, PineScriptVersion } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        strategyName: { type: Type.STRING, description: "A creative and descriptive name for the trading strategy." },
        description: { type: Type.STRING, description: "A detailed explanation of the strategy, its logic, indicators used, and entry/exit conditions." },
        generationRationale: { type: Type.STRING, description: "A concise explanation of *why* this specific strategy was designed, directly linking the user's preferences (style, market, risk) to the chosen indicators and logic. Explain the thought process." },
        tradingStyle: { type: Type.STRING, description: "The trading style this strategy is best suited for." },
        market: { type: Type.STRING, description: "The market this strategy is designed for." },
        riskTolerance: { type: Type.STRING, description: "The risk tolerance level this strategy is aligned with." },
        pineScriptVersion: { type: Type.STRING, description: "The version of Pine Script used (e.g., 'v5', 'v6')." },
        parameters: {
            type: Type.OBJECT,
            description: "An object containing key-value pairs of the strategy's parameters (e.g., RSI period, MACD fast length).",
            properties: {
                indicator_period: { type: Type.INTEGER, description: "Example: Period for an indicator like RSI or Moving Average."},
                stop_loss_percent: { type: Type.NUMBER, description: "Example: Stop loss percentage."},
                take_profit_ratio: { type: Type.NUMBER, description: "Example: Risk-to-reward ratio for take profit."},
            }
        },
        pineScript: { type: Type.STRING, description: "The complete, functional Pine Script code for implementing this strategy on TradingView." },
        confidenceScore: { type: Type.NUMBER, description: "A score from 0.0 to 1.0 indicating the AI's confidence in the strategy's potential effectiveness based on common principles." },
        backtestHighlights: {
            type: Type.OBJECT,
            description: "Simulated key performance indicators from a hypothetical backtest.",
            properties: {
                netProfit: { type: Type.STRING, description: "Hypothetical net profit as a percentage." },
                totalTrades: { type: Type.INTEGER, description: "Hypothetical number of trades in the backtest period." },
                winRate: { type: Type.STRING, description: "Hypothetical win rate as a percentage." },
                profitFactor: { type: Type.NUMBER, description: "Hypothetical profit factor (gross profit / gross loss)." },
                maxDrawdown: { type: Type.STRING, description: "Hypothetical maximum drawdown as a percentage." },
            }
        },
        logicBreakdown: {
            type: Type.ARRAY,
            description: "A mandatory, step-by-step breakdown of the strategy's logic for visualization. Must contain between 3 to 6 sequential steps, each representing a distinct logical operation (condition, action, entry, or exit).",
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, description: "The type of logic step: 'condition' (for checks), 'action' (for calculations), 'entry' (for buy/long signals), or 'exit' (for sell/close signals)." },
                    description: { type: Type.STRING, description: "A concise description of this single step." }
                },
                required: ["type", "description"]
            }
        }
    },
    required: ["strategyName", "description", "pineScript", "confidenceScore", "backtestHighlights", "parameters", "tradingStyle", "market", "riskTolerance", "logicBreakdown", "generationRationale", "pineScriptVersion"]
};

const dynamicBacktestSchema = {
    type: Type.OBJECT,
    properties: {
        input: {
            type: Type.OBJECT,
            properties: {
                asset: { type: Type.STRING },
                timeframe: { type: Type.STRING },
                startDate: { type: Type.STRING },
                endDate: { type: Type.STRING },
            },
            required: ["asset", "timeframe"],
        },
        metrics: {
            type: Type.OBJECT,
            description: "Key performance indicators from the simulated backtest.",
            properties: {
                netProfit: { type: Type.STRING, description: "Net profit as a percentage." },
                totalTrades: { type: Type.INTEGER, description: "Number of trades in the backtest period." },
                winRate: { type: Type.STRING, description: "Win rate as a percentage." },
                profitFactor: { type: Type.NUMBER, description: "Profit factor (gross profit / gross loss)." },
                maxDrawdown: { type: Type.STRING, description: "Maximum drawdown as a percentage." },
            },
            required: ["netProfit", "totalTrades", "winRate", "profitFactor", "maxDrawdown"]
        },
        analysis: {
            type: Type.OBJECT,
            description: "A qualitative analysis of the backtest results.",
            properties: {
                strengths: { type: Type.STRING, description: "The primary strengths of the strategy observed in this backtest." },
                weaknesses: { type: Type.STRING, description: "The primary weaknesses or scenarios where the strategy underperformed." },
                suggestion: { type: Type.STRING, description: "A concrete suggestion for improving the strategy based on the results." }
            },
            required: ["strengths", "weaknesses", "suggestion"]
        },
        chartData: {
            type: Type.ARRAY,
            description: "An array of 150-200 OHLC data points for charting within the specified date range.",
            items: {
                type: Type.OBJECT,
                properties: {
                    time: { type: Type.STRING, description: "The timestamp for the candle in 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:MM:SSZ' format." },
                    open: { type: Type.NUMBER },
                    high: { type: Type.NUMBER },
                    low: { type: Type.NUMBER },
                    close: { type: Type.NUMBER },
                },
                required: ["time", "open", "high", "low", "close"]
            }
        },
        trades: {
            type: Type.ARRAY,
            description: "An array of trade executions to be plotted on the chart.",
            items: {
                type: Type.OBJECT,
                properties: {
                    time: { type: Type.STRING, description: "The timestamp of the trade in 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:MM:SSZ' format." },
                    type: { type: Type.STRING, description: "'buy' or 'sell'." },
                    price: { type: Type.NUMBER },
                },
                required: ["time", "type", "price"]
            }
        },
        updatedPineScript: {
            type: Type.STRING,
            description: "The original Pine Script, modified to hardcode the exact asset, timeframe, and date range of this specific backtest. This script is ready for direct use on TradingView."
        }
    },
    required: ["metrics", "analysis", "chartData", "trades", "input", "updatedPineScript"]
};


export const generateTradingStrategy = async (userInput: UserInput): Promise<Strategy> => {
  const { tradingStyle, market, riskTolerance, capital, pineScriptVersion } = userInput;

  const prompt = `
    Act as an expert quantitative analyst and trading strategy developer. Your task is to design a novel and effective trading strategy based on the user's preferences.

    User Preferences:
    - Trading Style: ${tradingStyle}
    - Market: ${market}
    - Risk Tolerance: ${riskTolerance}
    - Desired Pine Script Version: ${pineScriptVersion}
    - Initial Capital (for context): $${capital}

    Instructions:
    1.  **Generation Rationale (Critical):** First, explain *why* you are choosing the upcoming strategy. Connect the user's preferences directly to your design choices. For example, "For a ${riskTolerance} risk profile in the volatile ${market} market, a trend-following strategy with a momentum filter is appropriate because...". This rationale is the most important part of the explanation.
    2.  **Strategy Design:** Create a detailed trading strategy.
        -   Clearly define the entry and exit signals.
        -   Specify the technical indicators used (e.g., RSI, MACD, Bollinger Bands, custom logic) and their settings.
        -   Incorporate risk management rules appropriate for the specified risk tolerance (e.g., stop-loss placement, take-profit levels, position sizing).
    3.  **Logic Breakdown (Mandatory Visualization Data):** This is a critical step for generating a visual flowchart of the strategy's logic. You MUST provide a 'logicBreakdown' array containing 3 to 6 sequential objects. Each object represents a single, distinct step in the strategy's execution flow and must have two properties: 'type' and 'description'.
        -   'type' MUST be one of the following strings: 'condition', 'action', 'entry', 'exit'.
        -   'description' MUST be a clear, concise explanation of that specific step.
        -   Example of a valid structure: \`[{"type": "condition", "description": "RSI(14) crosses below 30"}, {"type": "entry", "description": "Enter a long position on the next candle open"}]\`
    4.  **Pine Script:** Write a complete, syntactically correct Pine Script ${pineScriptVersion} code that implements this strategy. The script should be ready to be copy-pasted into TradingView. It must include strategy settings, plotting of signals, and backtesting range.
    5.  **Backtest Simulation:** Provide a set of plausible, hypothetical backtest results. These should be realistic and reflect the potential performance of such a strategy, considering the market and risk level.
    6.  **Confidence Score:** Assign a confidence score representing your assessment of the strategy's robustness and potential success.
    7.  **Output Format:** Return the entire response as a single JSON object matching the provided schema. Do not include any markdown formatting like \`\`\`json.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.8,
      },
    });

    const jsonText = response.text.trim();
    const strategyData = JSON.parse(jsonText);

    if (!strategyData.parameters) strategyData.parameters = {};
    if (!strategyData.logicBreakdown) strategyData.logicBreakdown = [];


    return strategyData as Strategy;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error("Failed to get a valid response from the AI model.");
  }
};

export const optimizeStrategy = async (strategy: Strategy): Promise<Strategy> => {
  const { strategyName, description, pineScript, parameters, tradingStyle, market, riskTolerance, pineScriptVersion } = strategy;

  const prompt = `
    Act as an expert quantitative analyst and trading strategy developer. You are tasked with analyzing and optimizing an existing trading strategy.

    Original Strategy to Optimize:
    - Name: ${strategyName}
    - Trading Style: ${tradingStyle}
    - Market: ${market}
    - Risk Tolerance: ${riskTolerance}
    - Pine Script Version: ${pineScriptVersion}
    - Description: ${description}
    - Parameters: ${JSON.stringify(parameters)}
    - Pine Script:
    \`\`\`pinescript
    ${pineScript}
    \`\`\`

    Instructions:
    1.  **Analyze and Improve:** Critically analyze the provided strategy. Identify potential weaknesses such as poor risk management, lagging indicators in volatile markets, or susceptibility to false signals. Propose and implement specific, concrete improvements. Examples of improvements include:
        -   Adjusting indicator periods (e.g., changing an RSI period from 14 to 12).
        -   Adding a confirmation indicator (e.g., adding a volume check or a moving average crossover as a filter).
        -   Refining entry/exit logic for better precision.
        -   Improving the stop-loss or take-profit mechanism (e.g., using ATR-based stops).
    2.  **Generate Optimized Strategy:** Create a new, improved version of the strategy.
    3.  **Generation Rationale (Critical):** In the 'generationRationale' field, you MUST provide a detailed explanation of the changes you made. Clearly state what you changed, why you changed it, and how it is expected to improve the strategy's performance. For example, "I changed the RSI period from 14 to 11 to make it more responsive to short-term price action, suitable for day-trading. I also added a 200-period EMA filter to ensure trades are only taken in the direction of the long-term trend, reducing false signals during choppy periods."
    4.  **New Name:** Give the new strategy a name that indicates it's an optimized version, such as "${strategyName} v2" or "${strategyName} (Optimized)".
    5.  **Output Format:** Return the entire response as a single JSON object matching the provided schema. The output MUST be a complete strategy object, including the new pineScript in ${pineScriptVersion}, new parameters, new logicBreakdown, etc. Do not include any markdown formatting.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema, // Re-use the existing schema
        temperature: 0.7,
      },
    });

    const jsonText = response.text.trim();
    const strategyData = JSON.parse(jsonText);

    if (!strategyData.parameters) strategyData.parameters = {};
    if (!strategyData.logicBreakdown) strategyData.logicBreakdown = [];

    return strategyData as Strategy;
  } catch (error) {
    console.error("Gemini API call for optimization failed:", error);
    throw new Error("Failed to get a valid optimized strategy from the AI model.");
  }
};

export const runBacktest = async (pineScript: string, pineScriptVersion: PineScriptVersion, input: BacktestInput): Promise<DynamicBacktestResult> => {
    const { asset, timeframe, startDate, endDate } = input;

    const dateRangePrompt = startDate && endDate 
        ? `The backtest must be strictly performed between ${startDate} and ${endDate}.`
        : `The backtest period should be a recent and relevant period for this timeframe (e.g., last 3 months for daily, last 3 days for 15-minute).`;

    const prompt = `
        Act as a world-class backtesting engine for TradingView Pine Script strategies.

        You are given a Pine Script ${pineScriptVersion} strategy and specific backtesting parameters. Your task is to perform a realistic, hypothetical backtest and provide quantitative metrics, qualitative analysis, and chartable data.

        Backtest Parameters:
        - Asset/Ticker: ${asset}
        - Timeframe: ${timeframe}
        - Backtest Period: ${dateRangePrompt}

        Original Strategy Pine Script (${pineScriptVersion}):
        \`\`\`pinescript
        ${pineScript}
        \`\`\`

        Instructions:
        1.  **Set Input Context:** In the final JSON, include an 'input' object that contains the asset, timeframe, and start/end dates used for this backtest.
        2.  **Generate Chart Data:** First, create a realistic time-series dataset of 150-200 OHLC (Open, High, Low, Close) data points for the specified asset and timeframe within the defined backtest period.
        3.  **Simulate Backtest & Generate Trades:** Analyze the script's logic and simulate its performance on the generated chart data. Assume standard market conditions, commissions, and slippage. Based on this simulation, create a list of all executed trades.
        4.  **Calculate Metrics:** Compute the standard performance metrics based on the trades.
        5.  **Perform Analysis:** Based on the strategy's logic and the simulated results, provide a concise analysis.
        6.  **Generate Updated Pine Script:** This is a critical step. Modify the original Pine Script (${pineScriptVersion}) to create a new version specifically for this backtest scenario. Hardcode the backtest parameters directly into the 'strategy()' function call. The 'tickerid' should be set to '${asset}', 'timeframe' to '${timeframe}', and if dates were provided, set the backtest window using 'time > timestamp(${startDate}) and time < timestamp(${endDate})' logic in the entry conditions or wherever appropriate. The goal is a self-contained script that perfectly replicates this specific backtest on TradingView.
        7.  **Output Format:** Return the entire response as a single JSON object matching the provided schema. Timestamps in 'chartData' and 'trades' must be valid 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:MM:SSZ' format strings and chronologically sorted. Do not include any markdown formatting like \`\`\`json.
    `;

    try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-pro",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: dynamicBacktestSchema,
            temperature: 0.5,
          },
        });

        const jsonText = response.text.trim();
        const backtestData = JSON.parse(jsonText);

        return backtestData as DynamicBacktestResult;
    } catch (error) {
        console.error("Gemini API call for backtest failed:", error);
        throw new Error("Failed to get a valid backtest result from the AI model.");
    }
};