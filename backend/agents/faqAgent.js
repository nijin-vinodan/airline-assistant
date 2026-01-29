const llmService = require('../services/llmService');
const promptService = require('../services/promptService');

const handle = async (messages) => {
    console.log("-> Handing over to FAQ Agent (RAG)");

    // Retrieve policies
    const policies = llmService.getPolicyContext();

    const agentMessages = [
        { role: "system", content: promptService.render('faq', { policy_text: policies }) },
        ...messages
    ];

    const response = await llmService.getCompletion(agentMessages);
    return response;
};

module.exports = { handle };
