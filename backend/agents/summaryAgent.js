const llmService = require('../services/llmService');
const promptService = require('../services/promptService');

const summarize = async (existingSummary, newMessagesObj) => {
    try {
        // Format messages as text
        const newMessagesText = newMessagesObj.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

        const promptText = promptService.render('summary', {
            existing_summary: existingSummary || "None",
            new_messages: newMessagesText
        });

        const agentMessages = [
            { role: "system", content: promptText }
        ];

        // We can use gpt-4o or a cheaper model if you want
        console.log("-> Summary Agent digesting messages...");
        const response = await llmService.getCompletion(agentMessages, 'gpt-4o', false, null, null);
        return response.trim();
    } catch (error) {
        console.error("Summary Agent Error:", error);
        return existingSummary; // Fallback to existing on failure
    }
};

module.exports = { summarize };
