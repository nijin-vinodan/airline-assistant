// Mock data for flights
const flights = [
    { id: 'FL001', from: 'New York', to: 'London', price: 500, departure: '10:00', arrival: '22:00' },
    { id: 'FL002', from: 'London', to: 'New York', price: 450, departure: '14:00', arrival: '18:00' },
    { id: 'FL003', from: 'New York', to: 'Paris', price: 600, departure: '18:00', arrival: '06:00' },
    { id: 'FL004', from: 'Paris', to: 'New York', price: 550, departure: '11:00', arrival: '15:00' },
    { id: 'FL005', from: 'Tokyo', to: 'San Francisco', price: 1200, departure: '09:00', arrival: '02:00' },
];

const mockApi = {
    searchFlights: async (from, to) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log(`[Mock API] Searching flights from ${from} to ${to} `);

        return flights.filter(f =>
            f.from.toLowerCase().includes(from.toLowerCase()) &&
            f.to.toLowerCase().includes(to.toLowerCase())
            // Date filtering removed as requested
        );
    },

    bookFlight: async (flightId, passengerName) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const flight = flights.find(f => f.id === flightId);
        if (flight) {
            console.log(`[Mock API] Booking confirmed for ${passengerName} on ${flightId}`);
            return { status: 'confirmed', ticketId: `TICKET-${Math.floor(Math.random() * 10000)}`, flight };
        }
        return { status: 'failed', reason: 'Flight not found' };
    }
};

module.exports = mockApi;
