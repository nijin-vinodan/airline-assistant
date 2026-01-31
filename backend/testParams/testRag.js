const ragService = require('../services/ragService.js');

async function test() {
    console.log("Starting RAG Test...");
    try {
        await ragService.initializeVectorStore();
        console.log("Store initialized.");

        const query = "What is the baggage allowance?";
        console.log(`Querying: "${query}"`);
        const result = await ragService.retrieveDocuments(query);

        console.log("\n--- Result ---");
        console.log(result);
        console.log("--------------\n");
    } catch (e) {
        console.error("Test Failed:", e);
    }
}

test();
