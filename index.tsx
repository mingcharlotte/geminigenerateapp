import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const messagesEndRef = useRef(null);

  // --- THE "SURVIVAL" LIST ---
  // The app will try these one by one until one works!
  const MODELS_TO_TRY = [
    'gemini-3-flash-preview', 
    'gemini-2.0-flash', 
    'gemini-1.5-pro',
    'gemini-pro'
  ];

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

    const apiKey = import.meta.env.VITE_API_KEY || 
                   process.env.NEXT_PUBLIC_API_KEY || "";
    
    if (!apiKey) {
      alert("API Key missing! Add VITE_API_KEY to Vercel Settings.");
      return;
    }

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setIsLoading(true);

    // --- AUTOMATIC FALLBACK SYSTEM ---
    let success = false;
    for (const modelName of MODELS_TO_TRY) {
      if (success) break;
      
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: userText }] }],
            system_instruction: {
              parts: [{ text: "You are Grace, a friendly Christian Counselor. 3-5 sentences max. End with a question." }]
            }
          })
        });

        const data = await response.json();

        if (!data.error) {
          const aiText = data.candidates[0].content.parts[0].text;
          setMessages(prev => [...prev, { role: 'model', content: aiText }]);
          console.log(`✅ Success using model: ${modelName}`);
          success = true;
        } else {
          console.log(`❌ ${modelName} failed: ${data.error.message}`);
        }
      } catch (err) {
        console.log(`⚠️ Skipping ${modelName} due to connection error.`);
      }
    }

    if (!success) {
      setMessages(prev => [...prev, { role: 'model', content: "I'm having a little trouble connecting to my brain. Please wait a moment and try again." }]);
    }
    setIsLoading(false);
  };

  // --- UI RENDER (WELCOME & CHAT) ---
  if (!isStarted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#FFFBF5', textAlign: 'center', fontFamily: 'sans-serif', padding: '20px' }}>
        <div style={{ padding: '40px', backgroundColor: 'white', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', maxWidth: '450px' }}>
          <div style={{ fontSize: '80px' }}>☕</div>
          <h1 style={{ color: '#4E342E' }}>Grace Counseling</h1>
          <h2 style={{ color: '#3E2723' }}>Welcome Home</h2>
          <button onClick={handleStartSession} style={{ backgroundColor: '#FF7043', color: 'white', padding: '15px 50px', borderRadius: '30px', border: 'none', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>
            Start Session 💬
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#FFFBF5', fontFamily: 'sans-serif' }}>
      <header style={{ padding: '15px', borderBottom: '1px solid #EDE7F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white' }}>
        <span style={{ fontWeight: 'bold' }}>🧡 Grace Counseling</span>
        <button onClick={() => window.location.reload()} style={{ background: 'none', border: 'none', color: '#8D6E63', cursor: 'pointer' }}>End</button>
      </header>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '20px' }}>
            <div style={{ maxWidth: '85%', padding: '15px', borderRadius: '20px', backgroundColor: msg.role === 'user' ? '#FF7043' : 'white', color: msg.role === 'user' ? 'white' : '#3E2723', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && <div style={{ color: '#A1887F', fontStyle: 'italic' }}>Grace is thinking...</div>}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} style={{ padding: '20px', display: 'flex', gap: '12px', backgroundColor: 'white' }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type here..." style={{ flex: 1, padding: '14px', borderRadius: '30px', border: '1px solid #E0E0E0' }} />
        <button type="submit" style={{ backgroundColor: '#FF7043', color: 'white', border: 'none', padding: '0 30px', borderRadius: '30px', fontWeight: 'bold' }}>Send</button>
      </form>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
