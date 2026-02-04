import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/generative-ai";
import { Heart, Send, MessageCircle, BookOpen, Coffee, RefreshCw, LogOut } from 'lucide-react';

// --- Configuration ---
// We use gemini-2.0-flash as it is the most modern version found in your environment
const MODEL_NAME = 'models/gemini-2.0-flash';

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

  // --- THE CORE AI SETUP ---
  const initChat = async () => {
    try {
      // 1. Securely load the API Key
      const apiKey = import.meta.env.VITE_API_KEY || 
                     import.meta.env.VITE_GEMINI_API_KEY || 
                     process.env.NEXT_PUBLIC_API_KEY || "";
      
      if (!apiKey) {
        console.error("API Key is missing. Please set VITE_API_KEY in Vercel.");
        return null;
      }

      const ai = new GoogleGenAI(apiKey);
      const model = ai.getGenerativeModel({ 
        model: MODEL_NAME,
        systemInstruction: "You are Grace, a friendly Christian Counselor. Your tone is casual, warm, and deeply encouraging—like talking over a cup of coffee. Keep responses to 3-5 sentences. Always end with a gentle question."
      });

      const chat = model.startChat({
        history: [],
        generationConfig: { maxOutputTokens: 200 }
      });

      // --- THE TRANSLATION PATCH ---
      // This fixes the 'sendMessage is not a function' error
      if (chat.send_message) {
        chat.sendMessage = chat.send_message.bind(chat);
      }

      setChatSession(chat);
      return chat;
    } catch (error) {
      console.error("Failed to initialize chat:", error);
      return null;
    }
  };

  const handleStartSession = async () => {
    setIsLoading(true);
    const session = await initChat();
    if (session) {
      setIsStarted(true);
      // Initial greeting
      setMessages([{
        role: 'model',
        content: "Welcome home. I'm Grace. I'm here to listen and walk with you. How are you feeling today?",
        timestamp: new Date()
      }]);
    } else {
      alert("Could not start session. Please check your API Key in Vercel settings.");
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
      // The patch above ensures sendMessage works here
      const result = await chatSession.sendMessage(userMessage);
      const response = await result.response;
      setMessages(prev => [...prev, { role: 'model', content: response.text(), timestamp: new Date() }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, { role: 'model', content: "I'm sorry, I'm having a little trouble connecting. Let's try again in a moment.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- UI: WELCOME SCREEN ---
  if (!isStarted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#FFFBF5', padding: '20px', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ fontSize: '80px' }}>☕</div>
          <h1 style={{ color: '#4E342E', marginBottom: '10px' }}>Grace Counseling</h1>
          <p style={{ color: '#8D6E63', letterSpacing: '2px', marginBottom: '30px' }}>WARMTH • WISDOM • PRAYER</p>
          <h2 style={{ fontSize: '28px', color: '#3E2723' }}>Welcome Home</h2>
          <p style={{ color: '#5D4037', lineHeight: '1.6', marginBottom: '40px' }}>
            I'm Grace. I'm here to listen and walk with you. Let's take it one step at a time together.
          </p>
          <button 
            onClick={handleStartSession}
            disabled={isLoading}
            style={{ backgroundColor: '#FF7043', color: 'white', padding: '15px 40px', borderRadius: '30px', border: 'none', fontSize: '18px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(255,112,67,0.3)' }}
          >
            {isLoading ? "Connecting..." : "Start Session 💬"}
          </button>
          <p style={{ marginTop: '50px', fontStyle: 'italic', color: '#A1887F', fontSize: '14px' }}>
            "Come to me, all you who are weary and burdened, and I will give you rest." — Matthew 11:28
          </p>
        </div>
      </div>
    );
  }

  // --- UI: CHAT SCREEN ---
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#FFFBF5', fontFamily: 'sans-serif' }}>
      <header style={{ padding: '15px 20px', borderBottom: '1px solid #EDE7F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>🧡</span>
          <span style={{ fontWeight: 'bold', color: '#4E342E' }}>Grace Counseling</span>
        </div>
        <button onClick={() => window.location.reload()} style={{ background: 'none', border: 'none', color: '#8D6E63', cursor: 'pointer' }}>End Session</button>
      </header>

      <main style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '20px' }}>
            <div style={{ maxWidth: '80%', padding: '15px', borderRadius: '20px', backgroundColor: msg.role === 'user' ? '#FF7043' : 'white', color: msg.role === 'user' ? 'white' : '#3E2723', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && <div style={{ color: '#A1887F', fontStyle: 'italic' }}>Grace is thinking...</div>}
        <div ref={messagesEndRef} />
      </main>

      <form onSubmit={handleSendMessage} style={{ padding: '20px', backgroundColor: 'white', borderTop: '1px solid #EDE7F6', display: 'flex', gap: '10px' }}>
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type what's on your heart..."
          style={{ flex: 1, padding: '12px 20px', borderRadius: '25px', border: '1px solid #E0E0E0', outline: 'none' }}
        />
        <button type="submit" style={{ backgroundColor: '#FF7043', color: 'white', border: 'none', width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer' }}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default App;
