const mockApi = require('../services/mockApi');
const promptService = require('../services/promptService');
const agentRunner = require('../services/agentRunner');

const tools = [
    {
        type: "function",
        function: {
            name: "search_flights",
            description: "Search for flights to find a Flight ID before booking",
            parameters: {
                type: "object",
                properties: {
                    from: { type: "string", description: "Departure city (e.g., New York)" },
                    to: { type: "string", description: "Arrival city (e.g., London)" },
                },
                required: ["from", "to"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "book_flight",
            description: "Book a flight for a passenger",
            parameters: {
                type: "object",
                properties: {
                    flightId: { type: "string", description: "The Flight ID (e.g., FL001)" },
                    passengerName: { type: "string", description: "Name of the passenger" },
                },
                required: ["flightId", "passengerName"],
            },
        },
    },
];

const handle = async (messages) => {
    console.log("-> Handing over to Booking Agent");

    const systemPrompt = promptService.render('booking');

    const toolImplementations = {
        search_flights: async (args) => {
            return await mockApi.searchFlights(args.from, args.to);
        },
        book_flight: async (args) => {
            return await mockApi.bookFlight(args.flightId, args.passengerName);
        }
    };

    return await agentRunner.run(messages, tools, toolImplementations, systemPrompt);
};

module.exports = { handle };
