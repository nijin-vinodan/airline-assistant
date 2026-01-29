import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your Airline Assistant. I can help you find flights, book tickets, or answer questions about our policies. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();

      if (data.message) {
        setMessages([...newMessages, { role: 'assistant', content: data.message }]);
      } else {
        console.error("No message in response", data);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages([...newMessages, { role: 'assistant', content: "Sorry, I am having trouble connecting to the server." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="app-container">
      <div className="chat-container">
        <header className="chat-header">
          <h1>✈️ SkyHigh Airlines</h1>
          <span className="status-dot"></span>
        </header>

        <div className="messages-area">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <div className="message-bubble">
                {msg.content.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
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
      </div>
    </div>
  );
}

export default App;
