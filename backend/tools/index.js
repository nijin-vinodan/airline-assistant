const mockApi = require('../services/mockApi');

// 1. Tool Schemas (JSON for LLM)
const schemas = {
    search_flights: {
        type: "function",
        function: {
            name: "search_flights",
            description: "Search for flights between two cities",
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
    book_flight: {
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
    }
};

// 2. Tool Implementations (Functions)
const implementations = {
    search_flights: async (args) => {
        return await mockApi.searchFlights(args.from, args.to);
    },
    book_flight: async (args) => {
        return await mockApi.bookFlight(args.flightId, args.passengerName);
    }
};

// Helper to get tools as an array for the agentRunner
const getTools = (toolNames) => {
    return toolNames.map(name => schemas[name]).filter(Boolean);
};

// Helper to get implementation map for agentRunner
const getImplementations = (toolNames) => {
    const subset = {};
    toolNames.forEach(name => {
        if (implementations[name]) {
            subset[name] = implementations[name];
        }
    });
    return subset;
};

module.exports = {
    schemas,
    implementations,
    getTools,
    getImplementations
};
