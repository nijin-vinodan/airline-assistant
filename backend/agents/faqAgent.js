const llmService = require('../services/llmService');
const promptService = require('../services/promptService');

const handle = async (messages, sessionId = null) => {
    console.log("-> Handing over to FAQ Agent (RAG)");

    // Retrieve policies
    // Retrieve policies (extract query from last message content)
    const lastMessage = messages[messages.length - 1];
    const query = lastMessage ? lastMessage.content : "";
    const policies = await llmService.getPolicyContext(query);

    const agentMessages = [
        { role: "system", content: promptService.render('faq', { policy_text: policies }) },
        ...messages
    ];

    const response = await llmService.getCompletion(agentMessages, 'gpt-4o', false, sessionId);
    return response;
};

module.exports = { handle };
