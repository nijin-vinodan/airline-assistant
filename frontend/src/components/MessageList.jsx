import React, { useRef, useEffect } from 'react';
import Message from './Message';

const MessageList = ({ messages, loading }) => {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    return (
        <div className="messages-area">
            {messages.map((msg, index) => (
                <Message key={index} role={msg.role} content={msg.content} />
            ))}
            {loading && (
                <div className="message assistant">
                    <div className="message-bubble typing">
                        <span>.</span><span>.</span><span>.</span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageList;
