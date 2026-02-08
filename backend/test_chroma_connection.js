
const { ChromaClient } = require("chromadb");

async function testConnection() {
    try {
        console.log("Attempting to connect to ChromaDB at http://localhost:8000...");
        const client = new ChromaClient({ path: "http://localhost:8000" });
        const version = await client.version();
        console.log("Connection successful! ChromaDB Version:", version);

        const heartbeat = await client.heartbeat();
        console.log("Heartbeat:", heartbeat);
    } catch (error) {
        console.error("Connection failed:", error);
        process.exit(1);
    }
}

testConnection();
