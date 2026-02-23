export const chatWithAssistant = async (messages, sessionId) => {
    // Fallback to localhost:5000 if env variable is not set
    // Note: Vite requires env variables to be prefixed with VITE_ to be exposed to the client
    const apiUrl = import.meta.env.BACKEND_API_URL || 'http://localhost:5000';

    const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messages,
            sessionId,
        }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
};
