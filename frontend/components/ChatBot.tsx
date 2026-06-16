'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Trash2, Bot, Loader2 } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { useUserStore } from '@/store/userStore';

const AI_API = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8000';

const QUICK_REPLIES = [
  "What's my size?",
  "Colour advice",
  "Track my order",
  "Try-on help",
  "Returns"
];

export default function ChatBot() {
  const { messages, isOpen, isLoading, toggleChat, addMessage, setLoading, clearChat } = useChatStore();
  const { user } = useUserStore();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const detectLanguage = (text: string) => {
    // Basic Urdu character range detection
    const urduRegex = /[\u0600-\u06FF]/;
    return urduRegex.test(text) ? 'urdu' : 'english';
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage = text.trim();
    setInput('');
    addMessage({ role: 'user', content: userMessage });
    setLoading(true);

    try {
      const language = detectLanguage(userMessage);
      const res = await fetch(`${AI_API}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          user_id: user?.id || 'anonymous',
          language
        }),
      });

      if (!res.ok) throw new Error('Failed to get response');
      const data = await res.json();
      addMessage({ role: 'assistant', content: data.reply });
    } catch (err) {
      console.error(err);
      addMessage({ role: 'assistant', content: "I'm sorry, I'm having trouble connecting right now. Please try again later." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* Floating Button */}
      <motion.button
        onClick={toggleChat}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ 
          scale: [1, 1.08, 1],
        }}
        transition={{ 
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
        className="w-14 h-14 bg-gold text-white rounded-full shadow-2xl flex items-center justify-center relative group"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {messages.length === 0 && !isOpen && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-ping" />
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
            <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="absolute bottom-20 right-0 w-[380px] max-w-[calc(100vw-24px)] md:max-w-[calc(100vw-48px)] h-[520px] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-100 dark:border-gray-800"
          >
            {/* Header */}
            <div className="bg-bg-dark text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">StyleAI Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={clearChat} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={toggleChat} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950">
              {messages.length === 0 && (
                <div className="text-center py-10 space-y-4">
                  <Bot className="w-12 h-12 text-gold/20 mx-auto" />
                  <p className="text-sm text-gray-400 px-8">Hello! I&apos;m your StyleAI assistant. How can I help you today?</p>
                </div>
              )}
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-gold text-white rounded-tr-none shadow-lg' 
                      : 'bg-white dark:bg-gray-800 text-text-primary dark:text-white rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-700'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center border border-gray-100 dark:border-gray-700">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 bg-gold rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-gold rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-gold rounded-full" />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input & Quick Replies */}
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 space-y-4">
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {QUICK_REPLIES.map(reply => (
                  <button
                    key={reply}
                    onClick={() => handleSend(reply)}
                    className="whitespace-nowrap px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full text-xs font-semibold hover:border-gold hover:text-gold transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about fashion..."
                  className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 bg-gold text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gold-light transition-colors"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
