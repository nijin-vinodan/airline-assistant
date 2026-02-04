const llmService = require('../services/llmService');
const promptService = require('../services/promptService');
const routerAgent = require('../agents/routerAgent');

// Mock agents to avoid full execution during router testing if we want unit tests
// But for integration testing, we might want real agents.
// For now, let's just test the CLASSIFICATION separately first.

async function testRouterClassification() {
    console.log("Starting Multi-Intent Classification Test...\n");

    const testCases = [
        "I want to fly from New York to London and can I bring my cat?",
        "Book a ticket to Paris and tell me about refund policy.",
        "Hello, show me flights to Tokyo.",
        "What is the baggage limit and I want to book a flight to Dubai.",
        "Just saying hi!",
    ];

    for (const userInput of testCases) {
        console.log(`User Input: "${userInput}"`);

        const history = "USER: " + userInput;
        const prompt = [
            { role: "system", content: promptService.render('router', { history }) },
            { role: "user", content: userInput }
        ];

        try {
            const response = await llmService.getCompletion(prompt, 'gpt-4o', true);
            console.log("Raw Response:", response);
            const parsed = JSON.parse(response);

            console.log("Reasoning:", parsed.reasoning);
            console.log("Intents:", parsed.intents);
            if (parsed.response) {
                console.log("General Response:", parsed.response);
            }
        } catch (e) {
            console.error("Error/Parse Fail:", e);
        }
        console.log("-".repeat(40));
    }
}

testRouterClassification();
