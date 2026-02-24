const apiUrl = import.meta.env.BACKEND_API_URL || 'http://localhost:5000';

export const getAuthToken = () => localStorage.getItem('token');
export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem('token', token);
    } else {
        localStorage.removeItem('token');
    }
};

const getHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const loginUser = async (email, password) => {
    const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
    }
    return response.json();
};

export const registerUser = async (email, password) => {
    const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
    }
    return response.json();
};

export const fetchHistory = async () => {
    const response = await fetch(`${apiUrl}/api/history`, {
        headers: getHeaders(),
    });
    if (!response.ok) {
        throw new Error('Failed to fetch history');
    }
    return response.json();
};

export const chatWithAssistant = async (messages, sessionId) => {
    const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: getHeaders(),
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

export const chatWithAssistantStream = async (messages, sessionId, onChunk) => {
    const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
            messages,
            sessionId,
            stream: true
        }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let done = false;
    let finalData = null;
    let buffer = '';

    while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            // Keep the last partial line in the buffer
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const dataStr = line.substring(6).trim();
                        if (!dataStr) continue;
                        const parsed = JSON.parse(dataStr);
                        if (parsed.text) {
                            onChunk(parsed.text);
                        }
                        if (parsed.done) {
                            finalData = parsed;
                        }
                    } catch (e) {
                        console.error("Error parsing stream chunk", e, line);
                    }
                }
            }
        }
    }

    return finalData;
};
