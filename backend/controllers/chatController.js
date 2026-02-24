const Chat = require('../models/Chat');
const routerAgent = require('../agents/routerAgent');
const costService = require('../services/costService');
const guardrailService = require('../services/guardrailService');

const getHistory = async (req, res) => {
    try {
        const chats = await Chat.find({ userId: req.user._id }).sort({ updatedAt: -1 });
        res.json(chats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};

const getChatBySessionId = async (req, res) => {
    try {
        const chat = await Chat.findOne({ userId: req.user._id, sessionId: req.params.sessionId });
        if (chat) {
            res.json(chat);
        } else {
            res.status(404).json({ error: 'Chat not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch chat' });
    }
};

const handleChat = async (req, res) => {
    try {
        const { messages, sessionId, stream } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Invalid message format' });
        }

        if (stream) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            // Flush headers to establish the stream immediately
            res.flushHeaders?.();
        }

        // GUARDRAIL CHECK
        const guardrailResult = await guardrailService.validateInput(messages);
        if (!guardrailResult.valid) {
            // Log the blocked attempt if needed
            // Return early
            const guardedResponse = {
                message: guardrailResult.message,
                sessionCost: costService.getSessionCost(sessionId) // Return existing cost
            };
            if (stream) {
                res.write(`data: ${JSON.stringify({ done: true, ...guardedResponse })}\n\n`);
                return res.end();
            }
            return res.json(guardedResponse);
        }

        const onChunk = stream ? (chunk) => res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`) : null;

        const response = await routerAgent.handle(messages, sessionId, req.user._id, onChunk);

        // OUTPUT GUARDRAIL CHECK
        const outputSafety = guardrailService.validateOutput(response.content || response); // response might be string or object
        if (!outputSafety.safe) {
            const blockedResponse = {
                message: "I cannot display this response due to safety policies.",
                sessionCost: costService.getSessionCost(sessionId)
            };
            if (stream) {
                res.write(`data: ${JSON.stringify({ done: true, ...blockedResponse })}\n\n`);
                return res.end();
            }
            return res.json(blockedResponse);
        }

        const sessionCost = costService.getSessionCost(sessionId);

        // Save to DB
        let chat = await Chat.findOne({ userId: req.user._id, sessionId });

        let assistantContent = response;
        if (response && typeof response === 'object' && response.content) {
            assistantContent = response.content;
        }

        const finalMessages = [...messages, { role: 'assistant', content: assistantContent }];

        if (chat) {
            chat.messages = finalMessages;
            chat.totalCost = sessionCost;
            await chat.save();
        } else {
            await Chat.create({
                userId: req.user._id,
                sessionId,
                messages: finalMessages,
                totalCost: sessionCost
            });
        }

        if (stream) {
            res.write(`data: ${JSON.stringify({ done: true, message: response, sessionCost })}\n\n`);
            res.end();
        } else {
            res.json({
                message: response,
                sessionCost: sessionCost
            });
        }

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    getHistory,
    getChatBySessionId,
    handleChat
};
