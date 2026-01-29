const mockApi = require('../services/mockApi');
const promptService = require('../services/promptService');
const agentRunner = require('../services/agentRunner');

const tools = [
    {
        type: "function",
        function: {
            name: "search_flights",
            description: "Search for flights between two cities",
            parameters: {
                type: "object",
                properties: {
                    from: { type: "string", description: "Departure city (e.g., New York)" },
                    to: { type: "string", description: "Arrival city (e.g., London)" }
                },
                required: ["from", "to"],
            },
        },
    },
];

const handle = async (messages) => {
    console.log("-> Handing over to Search Agent");

    const systemPrompt = promptService.render('search');

    const toolImplementations = {
        search_flights: async (args) => {
            return await mockApi.searchFlights(args.from, args.to);
        }
    };

    return await agentRunner.run(messages, tools, toolImplementations, systemPrompt);
};

module.exports = { handle };
