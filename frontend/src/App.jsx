import React, { useState, useEffect } from 'react';
import './App.css';
import ChatHeader from './components/ChatHeader';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import Auth from './components/Auth';
import { chatWithAssistantStream, fetchHistory, getAuthToken, setAuthToken } from './services/apiService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your Airline Assistant. I can help you find flights, book tickets, or answer questions about our policies. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      setIsAuthenticated(true);
      loadHistory();
    } else {
      setSessionId('session-' + Math.random().toString(36).substr(2, 9));
    }
  }, []);

  const loadHistory = async () => {
    try {
      const histories = await fetchHistory();
      if (histories && histories.length > 0) {
        const latest = histories[0];
        setSessionId(latest.sessionId);
        if (latest.messages && latest.messages.length > 0) {
          // Filter out tool messages for a cleaner user view if desired, but we can just set them
          setMessages(latest.messages);
        }
        setTotalCost(latest.totalCost || 0);
      } else {
        setSessionId('session-' + Math.random().toString(36).substr(2, 9));
      }
    } catch (error) {
      console.error("Error loading history:", error);
      handleLogout(); // clear invalid token
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setIsAuthenticated(false);
    setUser(null);
    setMessages([
      { role: 'assistant', content: 'Hello! I am your Airline Assistant. How can I help you today?' }
    ]);
    setSessionId('session-' + Math.random().toString(36).substr(2, 9));
    setTotalCost(0);
  };

  const handleAuthSuccess = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    loadHistory();
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];

    // Add empty assistant message that will be populated via stream
    setMessages([...newMessages, { role: 'assistant', content: '' }]);
    setInput('');
    setLoading(true);

    try {
      const targetMessageIndex = newMessages.length; // index of the assistant message we just added

      const handleChunk = (textChunk) => {
        setMessages(prevMessages => {
          const updated = [...prevMessages];
          if (updated[targetMessageIndex]) {
            updated[targetMessageIndex] = {
              ...updated[targetMessageIndex],
              content: updated[targetMessageIndex].content + textChunk
            };
          }
          return updated;
        });
      };

      const finalData = await chatWithAssistantStream(newMessages, sessionId, handleChunk);

      if (finalData) {
        setMessages(prevMessages => {
          const updated = [...prevMessages];
          if (updated[targetMessageIndex]) {
            // Update completely with final processed response just in case the stream missed something or finished
            updated[targetMessageIndex] = {
              ...updated[targetMessageIndex],
              content: typeof finalData.message === 'string' ? finalData.message : (finalData.message?.content || updated[targetMessageIndex].content)
            };
          }
          return updated;
        });
        if (finalData.sessionCost !== undefined) {
          setTotalCost(finalData.sessionCost);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // fallback in case stream fails midway or initial request fails
      setMessages(prev => {
        const updated = [...prev];
        const targetIdx = updated.length - 1;
        if (updated[targetIdx] && updated[targetIdx].content === '') {
          updated[targetIdx] = { role: 'assistant', content: "Sorry, I am having trouble connecting to the server." };
        }
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="app-container">
      <div className="chat-container">
        <div style={{ textAlign: 'right', padding: '10px 20px', background: 'rgba(255, 255, 255, 0.5)' }}>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#007AFF',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontWeight: '600',
              padding: 0
            }}
          >
            Log Out
          </button>
        </div>
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
