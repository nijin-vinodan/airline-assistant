import React from 'react';

const ChatInput = ({ input, setInput, sendMessage, loading }) => {
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    return (
        <div className="input-area">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={loading}
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()}>
                Send
            </button>
        </div>
    );
};

export default ChatInput;
