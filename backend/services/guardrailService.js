const llmService = require('./llmService');

const BANNED_PATTERNS = [
    /ignore previous instructions/i,
    /ignore all instructions/i,
    /system prompt/i,
    /you are a h@cker/i,
    /write a script to/i,
    /execute this code/i
];

const BANNED_WORDS = [
    'abuse', 'kill', 'murder', 'suicide', 'bomb', 'terrorist', 'hack'
];

const guardrailService = {
    // 1. Regex/Keyword Safety Check
    checkSafety: (text) => {
        if (!text) return { safe: true };

        // Pattern Check
        for (const pattern of BANNED_PATTERNS) {
            if (pattern.test(text)) {
                console.warn(`[Guardrail] Blocked Input (Pattern): ${text}`);
                return { safe: false, reason: "Security Alert: Input contained restricted patterns." };
            }
        }

        // Keyword Check
        const lowerText = text.toLowerCase();
        for (const word of BANNED_WORDS) {
            if (lowerText.includes(word)) {
                console.warn(`[Guardrail] Blocked Input (Keyword: ${word}): ${text}`);
                return { safe: false, reason: "Safety Alert: Input contained harmful content." };
            }
        }

        return { safe: true };
    },

    // 2. LLM-Based Topic Check
    checkTopic: async (text) => {
        if (!text) return { allowed: true };

        const messages = [
            {
                role: 'system',
                content: `You are a topic guardrail helper. 
                Your job is to check if the user's input is related to: 
                1. Airlines / Flights / Travel / Booking
                2. General greetings (hello, hi, thanks)
                3. Customer support questions (refunds, baggage, policies)

                If the input is completely unrelated (e.g. coding, math, medical advice, politics, creative writing not about travel), return JSON: {"allowed": false, "reason": "Off-topic"}.
                Otherwise, return JSON: {"allowed": true}.
                
                Input: "${text}"`
            }
        ];

        try {
            // Using a separate session or no session to avoid polluting main chat history
            // We use jsonMode = true
            const responseStr = await llmService.getCompletion(messages, 'gpt-4o', true);
            const response = JSON.parse(responseStr);

            if (!response.allowed) {
                console.warn(`[Guardrail] Blocked Topic: ${text}`);
                return { allowed: false, reason: "I can only help with flight and travel-related queries." };
            }

            return { allowed: true };

        } catch (e) {
            console.error("Guardrail Topic Check Failed:", e);
            // Fail open (allow) if guardrail check fails, to avoid disrupting service? 
            // Or fail closed. Let's fail open for now but log it.
            return { allowed: true };
        }
    },

    // Main Validation Entry Point
    validateInput: async (messages) => {
        // We usually check the last user message
        const lastUserMessage = messages.slice().reverse().find(m => m.role === 'user');
        if (!lastUserMessage) return { valid: true };

        const text = lastUserMessage.content;

        // 1. Fast Check
        const safety = guardrailService.checkSafety(text);
        if (!safety.safe) return { valid: false, message: safety.reason };

        // 2. LLM Topic Check
        const topic = await guardrailService.checkTopic(text);
        if (!topic.allowed) return { valid: false, message: topic.reason };

        return { valid: true };
    },

    validateOutput: (text) => {
        return guardrailService.checkSafety(text);
    }
};

module.exports = guardrailService;
