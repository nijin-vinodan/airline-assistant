const llmService = require('../services/llmService');

async function testChat() {
    console.log("Starting Chat Test...");
    const messages = [
        { role: 'user', content: 'Hello! Are you working?' }
    ];

    try {
        console.log("Sending request to LLM...");
        const response = await llmService.getCompletion(messages);
        console.log("\n--- Response ---");
        console.log(response);
        console.log("----------------\n");
    } catch (error) {
        console.error("Chat Test Failed:", error);
    }
}

testChat();
