import React, { useState } from 'react';
import './App.css';
import ChatHeader from './components/ChatHeader';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';

function App() {
  // Generate a random session ID once on mount
  const [sessionId] = useState(() => 'session-' + Math.random().toString(36).substr(2, 9));

  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your Airline Assistant. I can help you find flights, book tickets, or answer questions about our policies. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [totalCost, setTotalCost] = useState(0);

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
        body: JSON.stringify({
          messages: newMessages,
          sessionId: sessionId
        }),
      });

      const data = await response.json();

      if (data.message) {
        setMessages([...newMessages, { role: 'assistant', content: data.message }]);
      } else {
        console.error("No message in response", data);
      }

      if (data.sessionCost !== undefined) {
        setTotalCost(data.sessionCost);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages([...newMessages, { role: 'assistant', content: "Sorry, I am having trouble connecting to the server." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="chat-container">
        <ChatHeader />
        <MessageList messages={messages} loading={loading} />
        <ChatInput
          input={input}
          setInput={setInput}
          sendMessage={sendMessage}
          loading={loading}
        />
        {totalCost > 0 && (
          <div className="cost-display" style={{ textAlign: 'center', padding: '10px', fontSize: '0.9em', color: '#666' }}>
            Session Cost: ${totalCost.toFixed(6)}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
