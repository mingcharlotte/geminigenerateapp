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
        systemInstruction: "You are Gr
