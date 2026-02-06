const llmService = require('../services/llmService');

const runTest = async () => {
    console.log("-> Testing Cost Tracking with llmService...");

    const messages = [
        { role: 'user', content: 'Say hello in a concise way.' } // Short input to save tokens/time
    ];

    try {
        console.log("-> Calling getCompletion...");
        const response = await llmService.getCompletion(messages, 'gpt-4o');
        console.log(`-> Response: ${response}`);
        console.log("-> CHECK CONSOLE ABOVE FOR '💰 Cost for this request' LOG");
    } catch (e) {
        console.error("Test Failed:", e);
    }
};

runTest();
