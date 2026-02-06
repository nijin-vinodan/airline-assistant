const mockApi = require('../services/mockApi');
const promptService = require('../services/promptService');
const agentRunner = require('../services/agentRunner');
const toolsRegistry = require('../tools');

const handle = async (messages, sessionId = null) => {
    console.log("-> Handing over to Booking Agent");

    const systemPrompt = promptService.render('booking');

    // Load tools from registry
    const requiredTools = ['search_flights', 'book_flight'];
    const tools = toolsRegistry.getTools(requiredTools);
    const toolImplementations = toolsRegistry.getImplementations(requiredTools);

    return await agentRunner.run(messages, tools, toolImplementations, systemPrompt, sessionId);
};

module.exports = { handle };
