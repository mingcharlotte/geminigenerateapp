import React, { useState, useEffect, useRef } from 'react';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const messagesEndRef = useRef(null);

  // --- Configuration ---
  const MODEL_NAME = 'gemini-1.5-flash'; 
  const SYSTEM_PROMPT = "You are Grace, a friendly Christian Counselor. Your tone is casual, warm, and deeply encouraging. Keep responses to 3-5 sentences. Always end with a gentle question.";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartSession = () => {
    setIsStarted(true);
    setMessages([{
      role: 'model',
      content: "Welcome home. I'm Grace. I'm here to listen and walk with you. How are you feeling today?",
    }]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const userText = input.trim();
    if (!userText || isLoading) return;

    // 1. Get the API Key from Vercel
    const apiKey = import.meta.env.VITE_API_KEY || process.env.NEXT_PUBLIC_API_KEY || "";
    
    if (!apiKey) {
      alert("API Key not found in Vercel settings.");
      return;
    }

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setIsLoading(true);

    try {
      // 2. The "Fetch" Method (No library needed!)
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [{ parts: [{ text: userText }] }]
          })
        }
      );

      const data = await response.json();
      const aiText = data.candidates[0].content.parts[0].text;
      
      setMessages(prev => [...prev, { role: 'model', content: aiText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "I'm having a little trouble connecting. Let's try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isStarted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#FFFBF5', textAlign: 'center', fontFamily: 'sans-serif', padding: '20px' }}>
        <div style={{ fontSize: '80px' }}>☕</div>
        <h1 style={{ color: '#4E342E' }}>Grace Counseling</h1>
        <p style={{ color: '#8D6E63', letterSpacing: '2px' }}>WARMTH • WISDOM • PRAYER</p>
        <h2 style={{ marginTop: '30px' }}>Welcome Home</h2>
        <p style={{ maxWidth: '400px', color: '#5D4037', lineHeight: '1.6' }}>I'm Grace. I'm here to listen and walk with you. Let's take it one step at a time together.</p>
        <button onClick={handleStartSession} style={{ backgroundColor: '#FF7043', color: 'white', padding: '15px 40px', borderRadius: '30px', border: 'none', fontSize: '18px', cursor: 'pointer', marginTop: '20px' }}>
          Start Session 💬
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
        <button type="submit" disabled={isLoading} style={{ backgroundColor: '#FF7043', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer' }}>Send</button>
      </form>
    </div>
  );
};

export default App;
