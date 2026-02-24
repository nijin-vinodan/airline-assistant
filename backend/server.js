require('dotenv').config();
const express = require('express');
require('./instrumentation');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Airline Chatbot Backend is up and running' });
});

const authRouter = require('./routers/authRouter');
const chatRouter = require('./routers/chatRouter');

app.use('/api/auth', authRouter);
app.use('/api', chatRouter);

app.listen(port, () => {
    console.log("Here");
    console.log(`Server is running on port ${port}`);

    // Initialize RAG Vector Store on Startup
    const ragService = require('./services/ragService');
    ragService.initializeVectorStore().catch(err => {
        console.error("Failed to initialize RAG Vector Store on startup:", err);
    });
});
