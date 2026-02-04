
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { 
  Heart, 
  Send, 
  Moon, 
  Sun, 
  MessageCircle, 
  BookOpen, 
  Coffee,
  RefreshCw,
  LogOut,
  Sparkles
} from 'lucide-react';

// --- Constants & Types ---

const MODEL_NAME = 'gemini-3-flash';

interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

// --- App Component ---

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const initChat = () => {
   const apiKey = import.meta.env.VITE_API_KEY || process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });
    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: `
          You are a friendly Christian Counselor named Grace. 
          Your tone is casual, warm, and deeply encouraging—like talking to a wise, compassionate friend over a cup of coffee.
          
          STRICT CONSTRAINTS:
          1. RESPONSE LENGTH: Limit every response to exactly 3-5 sentences. Be extremely concise.
          2. USER EXPRESSION: Always end your response with a gentle, open-ended question or an invitation for the user to share more of their feelings.
          
          CORE RESPONSIBILITIES (within the 3-5 sentence limit):
          1. PSYCHOLOGICAL INSIGHT: Briefly explain the 'why' behind a feeling (e.g., "Anxiety often comes from our brain trying to protect us from uncertainty").
          2. BIBLICAL WISDOM: Weave in a relevant verse or spiritual truth simply.
          3. PRAYER: Offer a very short (1-sentence) prayer or blessing when appropriate.
          4. SOLUTIONS: Suggest one small, actionable step.
          
          CONVERSATION FLOW:
          - Start: Warm greeting + tiny opening prayer (max 5 sentences total).
          - End: Brief summary + closing blessing (max 5 sentences total).
          - Use casual, empathetic language.
        `,
      },
    });
    setChatSession(chat);
    return chat;
  };

  const handleStartSession = async () => {
    setIsLoading(true);
    const chat = initChat();
    try {
      const response = await chat.sendMessage({ 
        message: "I'm ready to start our counseling session. Please greet me and lead a short opening prayer." 
      });
      
      setMessages([{
        role: 'model',
        content: response.text || "Hello! I'm so glad you're here. Let's start with a quick prayer together.",
        timestamp: new Date()
      }]);
      setIsSessionStarted(true);
    } catch (error) {
      console.error("Error starting session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!chatSession) return;
    setIsLoading(true);
    try {
      const response = await chatSession.sendMessage({ 
        message: "I think I'm ready to wrap up for today. Can we have a closing prayer and a summary?" 
      });
      
      setMessages(prev => [...prev, {
        role: 'model',
        content: response.text || "It's been wonderful talking. May God bless you.",
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error("Error ending session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !chatSession || isLoading) return;

    const userMessage = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const result = await chatSession.sendMessage({ message: userMessage });
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: result.text || "I'm listening, but I'm having a little trouble responding. Could you say that again?",
        timestamp: new Date() 
      }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: "I'm so sorry, I hit a little snag in our connection. Could we try that again? I'm still here for you.",
        timestamp: new Date() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetApp = () => {
    setMessages([]);
    setIsSessionStarted(false);
    setChatSession(null);
  };

  return (
    <div className="min-h-screen bg-[#fdfaf6] text-slate-800 font-sans flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-2xl px-6 py-8 flex items-center justify-between border-b border-orange-100 bg-white shadow-sm rounded-b-3xl">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-2 rounded-full text-orange-600">
            <Heart size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">Grace Counseling</h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Warmth • Wisdom • Prayer</p>
          </div>
        </div>
        {isSessionStarted && (
          <button 
            onClick={resetApp}
            className="text-slate-400 hover:text-orange-500 transition-colors p-2"
            title="Reset Chat"
          >
            <RefreshCw size={20} />
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-2xl px-4 py-6 overflow-hidden flex flex-col">
        {!isSessionStarted ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 space-y-8">
            <div className="relative">
              <div className="absolute -inset-4 bg-orange-200/30 blur-2xl rounded-full animate-pulse"></div>
              <Coffee size={64} className="text-orange-400 relative z-10" />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-slate-900">Welcome Home</h2>
              <p className="text-slate-600 leading-relaxed max-w-md">
                I'm Grace. I'm here to listen and walk with you. Let's take it one step at a time together.
              </p>
            </div>
            <button 
              onClick={handleStartSession}
              disabled={isLoading}
              className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold shadow-lg shadow-orange-200 transition-all flex items-center gap-2 group"
            >
              {isLoading ? (
                <Sparkles className="animate-spin" />
              ) : (
                <>
                  Start Session
                  <MessageCircle size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <p className="text-xs text-slate-400 italic">"Come to me, all you who are weary and burdened, and I will give you rest." — Matthew 11:28</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col bg-white/50 backdrop-blur-sm rounded-3xl overflow-hidden border border-white shadow-inner">
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`max-w-[85%] px-5 py-4 rounded-3xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                    ? 'bg-slate-800 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 border border-orange-50/50 rounded-tl-none'
                  }`}>
                    {msg.content.split('\n').map((line, idx) => (
                      <p key={idx} className={idx > 0 ? 'mt-2' : ''}>
                        {line}
                      </p>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-2 uppercase tracking-tighter">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-slate-400 px-4 py-2 bg-white/50 w-fit rounded-full border border-orange-50">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                  <span className="text-xs font-medium tracking-wide">Listening...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                 <button 
                  onClick={handleEndSession}
                  className="text-[10px] font-bold text-slate-400 hover:text-orange-500 uppercase tracking-widest px-3 py-1 border border-slate-100 rounded-full transition-colors flex items-center gap-1"
                >
                  <LogOut size={12} />
                  End Session
                </button>
              </div>
              <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Tell me how you're feeling..."
                  className="flex-1 bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-orange-200 focus:outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputText.trim()}
                  className="bg-orange-500 text-white p-4 rounded-2xl hover:bg-orange-600 disabled:opacity-50 disabled:bg-slate-300 transition-all shadow-md active:scale-95"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      <footer className="py-6 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-medium">
        Made with love and grace
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
