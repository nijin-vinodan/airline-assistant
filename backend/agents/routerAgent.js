const llmService = require('../services/llmService');
const searchAgent = require('./searchAgent');
const bookingAgent = require('./bookingAgent');
const faqAgent = require('./faqAgent');
const promptService = require('../services/promptService');

const handle = async (messages, sessionId = null, userId = null, onChunk = null) => {
    console.log("-> Router Agent Analysis...");

    const lastUserMessage = messages[messages.length - 1].content;

    // Classification Step
    // We need to pass the recent conversation history so the router understands context (e.g., answering a question)
    const recentHistory = messages
        .slice(-5) // Look at last 5 messages
        .map(m => `${m.role.toUpperCase()}: ${m.content}`)
        .join('\n');

    const classificationPrompt = [
        { role: "system", content: promptService.render('router', { history: recentHistory }) },
        { role: "user", content: lastUserMessage }
    ];

    // Request JSON mode for robustness
    const response = await llmService.getCompletion(classificationPrompt, 'gpt-4o', true, sessionId, userId);

    let cleanIntents = ['GENERAL'];
    let generalResponse = "I'm not sure how to help with that.";

    try {
        const parsed = JSON.parse(response);
        cleanIntents = (parsed.intents && Array.isArray(parsed.intents)) ? parsed.intents.map(i => i.toUpperCase()) : ['GENERAL'];
        generalResponse = parsed.response;
        console.log(`-> Router Logic: ${parsed.reasoning}`);
    } catch (e) {
        console.error("Router JSON Parse Error:", e);
        // Fallback
        cleanIntents = ['GENERAL'];
        generalResponse = response; // Best effort
    }

    console.log(`-> Intents Detected: ${cleanIntents.join(', ')}`);

    // Handoff Logic
    let responses = [];

    for (const intent of cleanIntents) {
        switch (intent) {
            case 'SEARCH':
                responses.push(await searchAgent.handle(messages, sessionId, userId, onChunk));
                break;
            case 'BOOKING':
                responses.push(await bookingAgent.handle(messages, sessionId, userId, onChunk));
                break;
            case 'FAQ':
                responses.push(await faqAgent.handle(messages, sessionId, userId, onChunk));
                break;
            case 'GENERAL':
                if (cleanIntents.length === 1) {
                    // Only use general response if it's the ONLY intent
                    const text = generalResponse || "Hello! How can I help you with your flights today?";
                    if (onChunk) {
                        // We already generated this during the classification step, so just stream it out
                        // We can simulate streaming or just send it as one chunk if we don't want to re-invoke
                        const words = text.split(' ');
                        for (let i = 0; i < words.length; i++) {
                            onChunk(words[i] + (i < words.length - 1 ? ' ' : ''));
                        }
                    }
                    responses.push(text);
                }
                break;
            default:
                break;
        }
    }

    return responses.join('\n\n');
};

module.exports = { handle };
