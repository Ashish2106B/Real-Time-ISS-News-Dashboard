import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, AlertTriangle, Sparkles, Trash2 } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { AIService } from '../../services/aiService';
import type { AIMessage, DashboardContext } from '../../services/aiService';

export const AIAssistant: React.FC = () => {
  const addMessage = useAppStore((s) => s.addMessage);
  const clearMessages = useAppStore((s) => s.clearMessages);
  const messages = useAppStore((s) => s.messages);

  const trajectory = useAppStore((s) => s.trajectory) || [];
  const astronauts = useAppStore((s) => s.astronauts);
  const astronautCount = useAppStore((s) => s.astronautCount);
  const articles = useAppStore((s) => s.articles);

  const currentISS = useMemo(() => 
    trajectory.length > 0 ? trajectory[trajectory.length - 1] : null,
    [trajectory]
  );

  const avgSpeed = useMemo(() => {
    const valid = trajectory.filter(p => p.speed > 0);
    return valid.length ? valid.reduce((s, p) => s + p.speed, 0) / valid.length : 0;
  }, [trajectory]);

  const maxSpeed = useMemo(() => 
    trajectory.reduce((max, p) => Math.max(max, p.speed), 0),
    [trajectory]
  );

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
    <div className="w-full flex flex-col h-[640px] glass-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)] bg-[var(--card-bg)]">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[var(--card-bg-solid)]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-wider">NOVA AI</h3>
            <p className="text-[10px] text-[var(--text-muted)]">Dashboard-Restricted Intelligence</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            <span className="text-[10px] text-amber-500 font-medium">Restricted</span>
          </div>
          <button
            onClick={clearMessages}
            title="Clear history"
            className="p-1.5 text-[var(--text-muted)] hover:text-red-500 transition-colors"
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
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-cyan-500/10 border border-cyan-500/20'}`}>
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-purple-500" /> : <Sparkles className="w-3.5 h-3.5 text-cyan-500" />}
                </div>
                <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line border ${
                  msg.role === 'user'
                    ? 'bg-purple-500/10 border-purple-500/20 text-[var(--text-primary)] rounded-br-sm'
                    : 'bg-[var(--card-bg)] border-[var(--border-color)] text-[var(--text-primary)] rounded-bl-sm shadow-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end space-x-2">
            <div className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            </div>
            <div className="px-4 py-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl rounded-bl-sm shadow-sm flex items-center space-x-3">
              <span className="text-[10px] text-cyan-500 font-medium tracking-tight uppercase animate-pulse">Analysing Dashboard Data...</span>
              <div className="flex space-x-1">
                {[0, 150, 300].map((delay) => (
                  <span key={delay} className="w-1 h-1 bg-cyan-500/60 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-[var(--border-color)] bg-[var(--card-bg)]">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about ISS, crew, speed, news..."
            className="flex-1 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all shadow-inner"
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!input.trim() || isTyping}
            className="p-2.5 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 hover:from-cyan-500/20 hover:to-purple-500/20 border border-cyan-500/30 rounded-xl text-cyan-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </form>
        <p className="text-[10px] text-[var(--text-muted)] mt-1.5 text-center italic">NOVA only uses live dashboard data · restricted responses</p>
      </div>
    </div>
  );
};
