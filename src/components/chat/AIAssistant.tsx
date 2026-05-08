import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, AlertTriangle, Sparkles } from 'lucide-react';

interface Message {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

const SPACE_KEYWORDS = [
  'iss', 'space', 'orbit', 'satellite', 'nasa', 'rocket', 'launch', 'astronaut',
  'mars', 'moon', 'jupiter', 'saturn', 'telescope', 'hubble', 'webb', 'star',
  'galaxy', 'nebula', 'comet', 'asteroid', 'spacex', 'mission', 'crew', 'solar',
  'planet', 'cosmos', 'universe', 'gravity', 'trajectory', 'speed', 'altitude',
  'station', 'module', 'docking', 'eva', 'spacewalk', 'velocity', 'apogee',
  'perigee', 'orbital', 'reentry', 'payload', 'booster', 'propulsion', 'telemetry',
  'earth', 'sun', 'venus', 'mercury', 'neptune', 'uranus', 'pluto', 'exoplanet',
  'black hole', 'supernova', 'constellation', 'milky way', 'light year', 'hello',
  'hi', 'hey', 'help', 'what', 'how', 'when', 'where', 'who', 'why', 'can you',
];

const KNOWLEDGE_BASE: Record<string, string> = {
  'iss': 'The International Space Station orbits Earth at approximately 28,000 km/h at an altitude of ~408 km. It completes one orbit every ~92 minutes and has been continuously occupied since November 2000.',
  'speed': 'The ISS travels at about 7.66 km/s (27,600 km/h or 17,100 mph). At this speed, it orbits Earth every 92 minutes, experiencing 16 sunrises and sunsets per day.',
  'orbit': 'The ISS follows a near-circular low Earth orbit (LEO) with an inclination of 51.6°. Its orbital altitude ranges between 330-435 km above Earth\'s surface.',
  'crew': 'The ISS typically hosts 6-7 crew members from various space agencies (NASA, Roscosmos, ESA, JAXA, CSA). Crew rotations happen approximately every 6 months.',
  'nasa': 'NASA (National Aeronautics and Space Administration) is the U.S. agency responsible for space exploration. Key programs include Artemis (Moon), Mars rovers, and the James Webb Space Telescope.',
  'spacex': 'SpaceX, founded by Elon Musk, revolutionized spaceflight with reusable rockets. Their Falcon 9 and Crew Dragon vehicles regularly transport crew and cargo to the ISS.',
  'moon': 'The Moon is Earth\'s only natural satellite, orbiting at ~384,400 km. NASA\'s Artemis program aims to return humans to the lunar surface and establish a sustainable presence.',
  'mars': 'Mars is the fourth planet from the Sun, ~225 million km from Earth. NASA\'s Perseverance rover and Ingenuity helicopter are currently exploring Jezero Crater.',
  'webb': 'The James Webb Space Telescope (JWST), launched Dec 2021, is the most powerful space telescope ever built. It observes in infrared from the L2 Lagrange point, 1.5 million km from Earth.',
  'trajectory': 'A trajectory in space is the path a spacecraft follows. It\'s determined by initial velocity, gravitational influences, and any thrust maneuvers. The ISS trajectory is tracked in real-time on this dashboard.',
  'telemetry': 'Telemetry is the collection of measurements and data at remote points and their automatic transmission for monitoring. ISS telemetry includes position, velocity, altitude, and system health data.',
  'altitude': 'The ISS maintains an orbital altitude of approximately 408 km (253 miles) above Earth. This altitude slowly decreases due to atmospheric drag and is periodically boosted.',
  'satellite': 'A satellite is any object that orbits another object in space. There are approximately 7,500+ active satellites orbiting Earth as of 2024, with thousands more defunct ones.',
  'galaxy': 'A galaxy is a gravitationally bound system of stars, gas, dust, and dark matter. Our Milky Way contains 100-400 billion stars. The observable universe has approximately 2 trillion galaxies.',
  'solar': 'Our Solar System contains 8 planets, dwarf planets, asteroids, comets, and the Sun. It formed ~4.6 billion years ago from a giant molecular cloud.',
};

function generateResponse(input: string): { content: string; isRestricted: boolean } {
  const lower = input.toLowerCase().trim();

  const isSpaceRelated = SPACE_KEYWORDS.some(keyword => lower.includes(keyword));
  
  if (!isSpaceRelated) {
    return {
      content: '🚫 I\'m restricted to space and ISS-related topics only. Try asking about the ISS, orbital mechanics, space missions, or celestial objects!',
      isRestricted: true,
    };
  }

  // Greetings
  if (/^(hello|hi|hey|greetings)/i.test(lower)) {
    return {
      content: '👋 Hello, Commander! I\'m NOVA, your Space Intelligence Assistant. I can answer questions about the ISS, space missions, orbital mechanics, and more. What would you like to know?',
      isRestricted: false,
    };
  }

  // Help
  if (lower.includes('help') || lower.includes('what can you')) {
    return {
      content: '🛰️ I can help with:\n• ISS tracking & telemetry data\n• Orbital mechanics & trajectories\n• Space missions (NASA, SpaceX, ESA)\n• Celestial objects (planets, stars, galaxies)\n• Space technology & history\n\nJust type your question!',
      isRestricted: false,
    };
  }

  // Search knowledge base
  for (const [key, value] of Object.entries(KNOWLEDGE_BASE)) {
    if (lower.includes(key)) {
      return { content: value, isRestricted: false };
    }
  }

  return {
    content: `🔭 That's a great space question! While I have limited knowledge in my current database, here are some related facts:\n\n• The ISS is the largest human-made structure in space\n• It travels at ~28,000 km/h\n• Over 260 individuals from 20 countries have visited it\n\nTry asking about specific topics like "ISS speed", "Mars", "Webb telescope", or "orbital trajectory" for more detailed answers.`,
    isRestricted: false,
  };
}

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: 'assistant',
      content: '🛰️ Welcome, Commander. I\'m **NOVA**, your restricted Space Intelligence Assistant. Ask me anything about the ISS, space missions, or orbital mechanics.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const { content } = generateResponse(trimmed);
      const botMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  return (
    <div className="w-full flex flex-col h-[600px] bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50 bg-slate-900/60">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Bot className="text-cyan-400 w-6 h-6" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-900" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wider">NOVA AI</h3>
            <p className="text-xs text-slate-500">Space Intelligence • Restricted Mode</p>
          </div>
        </div>
        <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          <span className="text-xs text-amber-400 font-medium">Restricted</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] flex items-start space-x-2 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                  msg.role === 'user' ? 'bg-purple-500/20' : 'bg-cyan-500/20'
                }`}>
                  {msg.role === 'user' ? (
                    <User className="w-4 h-4 text-purple-400" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                  )}
                </div>
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-purple-500/20 border border-purple-500/20 text-purple-100'
                    : 'bg-slate-800/60 border border-slate-700/50 text-slate-300'
                }`}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2"
          >
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="px-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-2xl">
              <div className="flex space-x-1">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-slate-700/50 bg-slate-900/60">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about space, ISS, missions..."
            className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!input.trim() || isTyping}
            className="p-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-xl text-cyan-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </form>
      </div>
    </div>
  );
};
