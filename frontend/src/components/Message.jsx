import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Message = ({ role, content }) => {
    return (
        <div className={`message ${role}`}>
            <div className="message-bubble">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
};

export default Message;
