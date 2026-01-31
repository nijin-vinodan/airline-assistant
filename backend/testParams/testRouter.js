const llmService = require('../services/llmService');
const promptService = require('../services/promptService');

async function testRouter() {
    console.log("Starting Router Classification Test...\n");

    const testCases = [
        "I want to fly from New York to London",
        "How much baggage can I carry?",
        "I want to book flight FL123 for John",
        "Hello, how are you?",
        "Show me flights to Paris"
    ];

    for (const userInput of testCases) {
        console.log(`User Input: "${userInput}"`);

        // Mimic routerAgent logic
        const history = "USER: " + userInput; // simplified history
        const prompt = [
            { role: "system", content: promptService.render('router', { history }) },
            { role: "user", content: userInput }
        ];

        try {
            // Force JSON mode
            const response = await llmService.getCompletion(prompt, 'gpt-4o', true);
            const parsed = JSON.parse(response);

            console.log("Reasoning:", parsed.reasoning);
            console.log("Intent:", parsed.intent);
            if (parsed.intent === 'GENERAL') {
                console.log("Response:", parsed.response);
            }
        } catch (e) {
            console.error("Error/Parse Fail:", e);
        }
        console.log("-".repeat(40));
    }
}

testRouter();
