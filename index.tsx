import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

// --- CONFIGURATION ---
// We use 2.0-flash because your system recognized it earlier.
const MODEL_NAME = 'gemini-2.0-flash'; 

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const messagesEndRef = useRef(null);

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

    // Look for the API key in all possible secret locations
    const apiKey = import.meta.env.VITE_API_KEY || 
                   import.meta.env.VITE_GEMINI_API_KEY || 
                   process.env.NEXT_PUBLIC_API_KEY || "";
    
    if (!apiKey) {
      alert("API Key not found. Please add VITE_API_KEY to your Vercel Environment Variables.");
      return;
    }

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setIsLoading(true);

    try {
      // Build the URL carefully to avoid network resolve errors
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: userText }] }],
          system_instruction: {
            parts: [{ text: "You are Grace, a friendly Christian Counselor. Keep responses to 3-5 sentences. Warm, wise, and encouraging tone. End with a gentle question." }]
          },
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
        })
      });

      const data = await response.json();

      if (data.error) {
        console.error("Google API Error:", data.error);
        throw new Error(data.error.message);
      }
      
      const aiText = data.candidates[0].content.parts[0].text;
      setMessages(prev => [...prev, { role: 'model', content: aiText }]);

    } catch (error) {
      console.error("Connection Error:", error);
      let friendlyError = "I'm having a little trouble connecting. Let's try again in a moment.";
      
      if (error.message.includes("429")) {
        friendlyError = "Google's servers are a bit busy right now. Please wait one minute and try again.";
      } else if (error.message.includes("404")) {
        friendlyError = "I couldn't find the AI model. We might need to update the model name.";
      }

      setMessages(prev => [...prev, { role: 'model', content: friendlyError }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- VIEW 1: WELCOME SCREEN ---
  if (!isStarted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#FFFBF5', textAlign: 'center', fontFamily: 'sans-serif', padding: '20px' }}>
        <div style={{ padding: '40px', backgroundColor: 'white', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', maxWidth: '450px' }}>
          <div style={{ fontSize: '80px', marginBottom: '10px' }}>☕</div>
          <h1 style={{ color: '#4E342E', margin: '0' }}>Grace Counseling</h1>
          <p style={{ color: '#8D6E63', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '12px', marginBottom: '30px' }}>Warmth • Wisdom • Prayer</p>
          <h2 style={{ color: '#3E2723', marginBottom: '15px' }}>Welcome Home</h2>
          <p style={{ color: '#5D4037', lineHeight: '1.6', marginBottom: '30px' }}>I'm Grace. I'm here to listen and walk with you. Let's take it one step at a time together.</p>
          <button onClick={handleStartSession} style={{ backgroundColor: '#FF7043', color: 'white', padding: '15px 50px', borderRadius: '30px', border: 'none', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold', width: '100%', boxShadow: '0 4px 15px rgba(255,112,67,0.3)' }}>
            Start Session 💬
          </button>
          <p style={{ marginTop: '40px', fontStyle: 'italic', color: '#A1887F', fontSize: '13px' }}>"Come to me, all you who are weary and burdened, and I will give you rest." — Matthew 11:28</p>
        </div>
      </div>
    );
  }

  // --- VIEW 2: CHAT SCREEN ---
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#FFFBF5', fontFamily: 'sans-serif' }}>
      <header style={{ padding: '15px 20px', borderBottom: '1px solid #EDE7F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>🧡</span>
          <span style={{ fontWeight: 'bold', color: '#4E342E' }}>Grace Counseling</span>
        </div>
        <button onClick={() => window.location.reload()} style={{ background: 'none', border: 'none', color: '#8D6E63', cursor: 'pointer', fontWeight: '600' }}>End Session</button>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '20px' }}>
            <div style={{ maxWidth: '85%', padding: '15px 20px', borderRadius: '20px', backgroundColor: msg.role === 'user' ? '#FF7043' : 'white', color: msg.role === 'user' ? 'white' : '#3E2723', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', lineHeight: '1.5' }}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && <div style={{ color: '#A1887F', fontStyle: 'italic', fontSize: '14px', marginLeft: '10px' }}>Grace is thinking...</div>}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} style={{ padding: '20px', display: 'flex', gap: '12px', backgroundColor: 'white', borderTop: '1px solid #EDE7F6' }}>
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Tell me what's on your heart..." 
          style={{ flex: 1, padding: '14px 20px', borderRadius: '30px', border: '1px solid #E0E0E0', outline: 'none', fontSize: '16px' }} 
        />
        <button type="submit" disabled={isLoading} style={{ backgroundColor: '#FF7043', color: 'white', border: 'none', padding: '0 30px', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}>
          Send
        </button>
      </form>
    </div>
  );
};

// --- START THE ENGINE ---
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
