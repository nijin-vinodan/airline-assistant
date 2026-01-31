const mockApi = require('../services/mockApi');
const promptService = require('../services/promptService');
const agentRunner = require('../services/agentRunner');
const toolsRegistry = require('../tools');

const handle = async (messages) => {
    console.log("-> Handing over to Search Agent");

    const systemPrompt = promptService.render('search');

    // Load tools from registry
    const requiredTools = ['search_flights'];
    const tools = toolsRegistry.getTools(requiredTools);
    const toolImplementations = toolsRegistry.getImplementations(requiredTools);

    return await agentRunner.run(messages, tools, toolImplementations, systemPrompt);
};

module.exports = { handle };
