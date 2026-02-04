import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Configuration ---
const MODEL_NAME = 'gemini-1.5-flash'; 

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [chatSession, setChatSession] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initChat = async () => {
    try {
      const apiKey = import.meta.env.VITE_API_KEY || 
                     import.meta.env.VITE_GEMINI_API_KEY || 
                     process.env.NEXT_PUBLIC_API_KEY || "";
      
      if (!apiKey) return null;

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: MODEL_NAME,
        systemInstruction: "You are Grace, a friendly Christian Counselor. Your tone is casual, warm, and deeply encouraging. Keep responses to 3-5 sentences. Always end with a gentle question."
      });

      const chat = model.startChat({ history: [] });

      // Patch for older library versions
      if (chat.send_message) { chat.sendMessage = chat.send_message.bind(chat); }

      setChatSession(chat);
      return chat;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const handleStartSession = async () => {
    setIsLoading(true);
    const session = await initChat();
    if (session) {
      setIsStarted(true);
      setMessages([{
        role: 'model',
        content: "Welcome home. I'm Grace. I'm here to listen and walk with you. How are you feeling today?",
        timestamp: new Date()
      }]);
    } else {
      alert("API Key not found. Please check Vercel Environment Variables.");
    }
    setIsLoading(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !chatSession || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const result = await chatSession.sendMessage(userMessage);
      const response = await result.response;
      setMessages(prev => [...prev, { role: 'model', content: response.text(), timestamp: new Date() }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "I'm having a little trouble connecting. Let's try again.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isStarted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#FFFBF5', padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: '80px' }}>☕</div>
        <h1 style={{ color: '#4E342E' }}>Grace Counseling</h1>
        <p style={{ color: '#8D6E63', letterSpacing: '2px' }}>WARMTH • WISDOM • PRAYER</p>
        <h2 style={{ marginTop: '30px' }}>Welcome Home</h2>
        <p style={{ maxWidth: '400px', lineHeight: '1.6', color: '#5D4037' }}>I'm Grace. I'm here to listen and walk with you. Let's take it one step at a time together.</p>
        <button onClick={handleStartSession} style={{ backgroundColor: '#FF7043', color: 'white', padding: '15px 40px', borderRadius: '30px', border: 'none', fontSize: '18px', cursor: 'pointer', marginTop: '20px' }}>
          {isLoading ? "Connecting..." : "Start Session 💬"}
        </button>
        <p style={{ marginTop: '50px', fontStyle: 'italic', color: '#A1887F' }}>"Come to me, all you who are weary and burdened, and I will give you rest." — Matthew 11:28</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#FFFBF5', fontFamily: 'sans-serif' }}>
      <header style={{ padding: '15px', borderBottom: '1px solid #EDE7F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 'bold', color: '#4E342E' }}>🧡 Grace Counseling</span>
        <button onClick={() => window.location.reload()} style={{ background: 'none', border: 'none', color: '#8D6E63', cursor: 'pointer' }}>End</button>
      </header>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '15px' }}>
            <div style={{ maxWidth: '80%', padding: '12px', borderRadius: '15px', backgroundColor: msg.role === 'user' ? '#FF7043' : 'white', color: msg.role === 'user' ? 'white' : '#3E2723', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && <div style={{ color: '#A1887F', fontStyle: 'italic' }}>Grace is thinking...</div>}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} style={{ padding: '20px', display: 'flex', gap: '10px', backgroundColor: 'white' }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type here..." style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #DDD' }} />
        <button type="submit" style={{ backgroundColor: '#FF7043', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px' }}>Send</button>
      </form>
    </div>
  );
};

export default App;
