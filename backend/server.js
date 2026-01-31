const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Airline Chatbot Backend is running' });
});

const routerAgent = require('./agents/routerAgent');

app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Invalid message format' });
        }

        const response = await routerAgent.handle(messages);
        res.json({ message: response });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);

    // Initialize RAG Vector Store on Startup
    const ragService = require('./services/ragService');
    ragService.initializeVectorStore().catch(err => {
        console.error("Failed to initialize RAG Vector Store on startup:", err);
    });
});
