const fs = require('fs');
const path = require('path');

// Pricing per 1k tokens (in USD)
// Source: Azure OpenAI Service Pricing / OpenAI Pricing
// These are rough estimates for standard pay-as-you-go rates.
const PRICING = {
    'gpt-4o': {
        input: 0.005,
        output: 0.015
    },
    'gpt-3.5-turbo': {
        input: 0.0005,
        output: 0.0015
    },
    // Adding a default for unknown models to avoid crashes, assuming a safe high-ish tier or logging 0
    'default': {
        input: 0.0,
        output: 0.0
    }
};

// In-memory storage for session costs
const sessionCosts = {};

const calculateCost = (modelName, inputTokens, outputTokens) => {
    // Normalize model name mostly for Azure deployments which might have custom names
    // For now, we do a simple includes check or exact match. 
    // In a real app, map deployment names to base model pricing.
    let modelKey = 'default';

    if (modelName.includes('gpt-4o')) {
        modelKey = 'gpt-4o';
    } else if (modelName.includes('gpt-3.5') || modelName.includes('gpt-35')) {
        modelKey = 'gpt-3.5-turbo';
    }

    const rates = PRICING[modelKey];
    const inputCost = (inputTokens / 1000) * rates.input;
    const outputCost = (outputTokens / 1000) * rates.output;
    const totalCost = inputCost + outputCost;

    return {
        model: modelKey,
        inputCost,
        outputCost,
        totalCost
    };
};

const accumulateCost = (sessionId, costData) => {
    if (!sessionId) return costData;

    if (!sessionCosts[sessionId]) {
        sessionCosts[sessionId] = 0;
    }

    sessionCosts[sessionId] += costData.totalCost;
    return {
        ...costData,
        sessionTotal: sessionCosts[sessionId]
    };
};

const getSessionCost = (sessionId) => {
    if (!sessionId || !sessionCosts[sessionId]) return 0;
    return sessionCosts[sessionId];
};

const logCost = (costData) => {
    const timestamp = new Date().toISOString();
    let logMsg = `💰 Cost: $${costData.totalCost.toFixed(6)} (${costData.model})`;

    if (costData.sessionTotal !== undefined) {
        logMsg += ` | Session Total: $${costData.sessionTotal.toFixed(6)}`;
    }

    console.log(logMsg);

    // Optional: Log to a file
    /*
    const logFilePath = path.join(__dirname, '../logs/cost.log');
    const logEntry = `[${timestamp}] ${logMsg}`;
    fs.appendFile(logFilePath, logEntry + '\n', (err) => {
        if (err) console.error('Failed to write cost log:', err);
    });
    */
};

module.exports = {
    calculateCost,
    accumulateCost,
    getSessionCost,
    logCost
};
