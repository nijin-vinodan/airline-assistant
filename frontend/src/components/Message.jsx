import React from 'react';

const Message = ({ role, content }) => {
    return (
        <div className={`message ${role}`}>
            <div className="message-bubble">
                {content.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                ))}
            </div>
        </div>
    );
};

export default Message;
