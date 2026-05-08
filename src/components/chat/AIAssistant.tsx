import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, AlertTriangle, Sparkles, Trash2 } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { selectCurrentISS, selectAvgSpeed, selectMaxSpeed } from '../../store/appStore';
import { AIService } from '../../services/aiService';
import type { AIMessage, DashboardContext } from '../../services/aiService';

export const AIAssistant: React.FC = () => {
  const addMessage = useAppStore((s) => s.addMessage);
  const clearMessages = useAppStore((s) => s.clearMessages);
  const messages = useAppStore((s) => s.messages);

  const currentISS = useAppStore(selectCurrentISS);
  const avgSpeed = useAppStore(selectAvgSpeed);
  const maxSpeed = useAppStore(selectMaxSpeed);
  const trajectory = useAppStore((s) => s.trajectory);
  const astronauts = useAppStore((s) => s.astronauts);
  const astronautCount = useAppStore((s) => s.astronautCount);
  const articles = useAppStore((s) => s.articles);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Seed welcome message once
  useEffect(() => {
    if (messages.length === 0) {
      addMessage({
        id: 'welcome',
        role: 'assistant',
        content: "🛰️ Welcome, Commander. I'm **NOVA** — your Space Intelligence AI. I only respond using live dashboard data. Ask me about the ISS, crew, speed, or news!",
        timestamp: Date.now(),
      });
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const buildContext = useCallback((): DashboardContext => ({
    issLat: currentISS?.latitude,
    issLon: currentISS?.longitude,
    issSpeed: currentISS?.speed,
    issTimestamp: currentISS?.timestamp,
    trajectoryCount: trajectory.length,
    astronautCount,
    astronauts,
    avgSpeed,
    maxSpeed,
    recentNews: articles.slice(0, 8).map((a) => ({
      title: a.title,
      news_site: a.news_site,
      published_at: a.published_at,
    })),
  }), [currentISS, trajectory.length, astronautCount, astronauts, avgSpeed, maxSpeed, articles]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: AIMessage = { id: Date.now().toString(), role: 'user', content: text, timestamp: Date.now() };
    addMessage(userMsg);
    setInput('');
    setIsTyping(true);

    try {
      const ctx = buildContext();
      const response = await AIService.generateResponse(text, ctx);
      addMessage({ id: (Date.now() + 1).toString(), role: 'assistant', content: response, timestamp: Date.now() });
    } catch {
      addMessage({ id: (Date.now() + 1).toString(), role: 'assistant', content: 'I only know dashboard data.', timestamp: Date.now() });
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, addMessage, buildContext]);

  return (
    <div className="w-full flex flex-col h-[640px] bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50 bg-slate-900/60">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-900" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wider">NOVA AI</h3>
            <p className="text-[10px] text-slate-500">Dashboard-Restricted Intelligence</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] text-amber-400 font-medium">Restricted</span>
          </div>
          <button
            onClick={clearMessages}
            title="Clear history"
            className="p-1.5 text-slate-600 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] flex items-end space-x-2 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-purple-500/20' : 'bg-cyan-500/20'}`}>
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-purple-400" /> : <Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-purple-500/20 border border-purple-500/20 text-purple-100 rounded-br-sm'
                    : 'bg-slate-800/70 border border-slate-700/50 text-slate-300 rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end space-x-2">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="px-4 py-3 bg-slate-800/70 border border-slate-700/50 rounded-2xl rounded-bl-sm">
              <div className="flex space-x-1">
                {[0, 150, 300].map((delay) => (
                  <span key={delay} className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-slate-700/50 bg-slate-900/60">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about ISS, crew, speed, news..."
            className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!input.trim() || isTyping}
            className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-500/30 rounded-xl text-cyan-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </form>
        <p className="text-[10px] text-slate-600 mt-1.5 text-center">NOVA only uses live dashboard data · responses are not AI-generated</p>
      </div>
    </div>
  );
};
