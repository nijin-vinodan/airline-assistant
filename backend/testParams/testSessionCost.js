const llmService = require('../services/llmService');
const costService = require('../services/costService');

const runTest = async () => {
    const sessionId = "test-session-" + Date.now();
    console.log(`-> Starting Session Cost Test (Session ID: ${sessionId})`);

    // First Call
    console.log("\n-> Call 1: Say 'Hi'");
    const messages1 = [{ role: 'user', content: 'Say Hi' }];
    await llmService.getCompletion(messages1, 'gpt-4o', false, sessionId);

    // Second Call
    console.log("\n-> Call 2: Say 'Bye'");
    const messages2 = [{ role: 'user', content: 'Say Bye' }];
    await llmService.getCompletion(messages2, 'gpt-4o', false, sessionId);

    console.log("\n-> CHECK CONSOLE ABOVE:");
    console.log("   - You should see 'Session Total' in the logs.");
    console.log("   - The Session Total for Call 2 should be higher than Call 1.");
};

runTest();
