const Chat = require('../models/Chat');
const summaryAgent = require('../agents/summaryAgent');

// How many messages total before we trigger a summarization
const MAX_UNSUMMARIZED_MESSAGES = 10;
// How many recent messages to ALWAYS keep exact context of (overlap)
// e.g., if we have 12 unsummarized, we summarize 8 of them, and leave the last 4 unsummarized for exact context.
const KEEP_RECENT_MESSAGES = 4;

const memoryService = {
    manageMemory: async (sessionId, userId) => {
        try {
            const chat = await Chat.findOne({ userId, sessionId });
            if (!chat || !chat.messages) return;

            const unsummarizedCount = chat.messages.length - chat.summarizedCount;

            if (unsummarizedCount > MAX_UNSUMMARIZED_MESSAGES) {
                console.log(`[Memory Service] Triggering summarization for session ${sessionId}...`);

                // Identify the exact batch we want to summarize
                // We start from where we left off (chat.summarizedCount)
                // And we take unsummarizedCount - KEEP_RECENT_MESSAGES messages to summarize this round
                const messagesToSummarizeCount = unsummarizedCount - KEEP_RECENT_MESSAGES;

                const startIndex = chat.summarizedCount;
                const endIndex = startIndex + messagesToSummarizeCount;

                const batchToSummarize = chat.messages.slice(startIndex, endIndex);

                // Call the LLM to rewrite the summary
                const newSummary = await summaryAgent.summarize(chat.summary, batchToSummarize);

                // Update the DB
                chat.summary = newSummary;
                chat.summarizedCount = endIndex;
                await chat.save();

                console.log(`[Memory Service] Successfully summarized ${messagesToSummarizeCount} messages for session ${sessionId}.`);
            }
        } catch (error) {
            console.error("[Memory Service] Error during memory management:", error);
        }
    }
};

module.exports = memoryService;
