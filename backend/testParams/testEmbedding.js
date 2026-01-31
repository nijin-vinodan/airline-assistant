const { AzureOpenAIEmbeddings } = require("@langchain/openai");
const dotenv = require("dotenv");
const path = require("path");

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function printSampleEmbedding() {
    try {
        console.log("Generating sample embedding...");

        const embeddings = new AzureOpenAIEmbeddings({
            azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
            azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_INSTANCE_NAME,
            azureOpenAIApiDeploymentName: process.env.AZURE_EMBEDDING_DEPLOYMENT_NAME,
            azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
        });

        const text = "Baggage Allowance";
        const vector = await embeddings.embedQuery(text);

        console.log(`\nText: "${text}"`);
        console.log(`Vector Length: ${vector.length}`);
        console.log("First 10 dimensions of the vector:");
        console.log(vector.slice(0, 10));
        console.log("...");

    } catch (error) {
        console.error("Error generating embedding:", error);
    }
}

printSampleEmbedding();
