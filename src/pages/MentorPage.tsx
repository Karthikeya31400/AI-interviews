import React, { useState } from 'react';
import { 
  Send, 
  BrainCircuit, 
  Sparkles, 
  Lightbulb, 
  Compass, 
  Target,
  Loader2
} from 'lucide-react';
import { aiService } from '../services/aiService';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

export function MentorPage() {
  const [messages, setMessages] = useState<any[]>([
    { role: 'assistant', content: "Hello! I'm your AI Career Mentor. I can help with career paths, salary negotiation tips, or explaining complex technical concepts. What's on your mind today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user' as 'model' | 'user',
        text: m.content
      }));
      const response = await aiService.careerMentorChat(chatHistory, input);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "How do I negotiate a higher salary?",
    "Explain React Server Components.",
    "Switching from HR to Tech role.",
    "Best practices for LinkedIn networking."
  ];

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-12rem)] flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
             Career Mentor
             <div className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 text-[10px] uppercase font-black tracking-widest border border-purple-500/20">Alpha</div>
          </h1>
          <p className="text-slate-400 font-medium">Your 24/7 personal guide for career growth and professional advice.</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-0">
        {/* Chat Area */}
        <div className="lg:col-span-3 glass rounded-[2rem] flex flex-col overflow-hidden bg-black/40">
           <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
              {messages.map((msg, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    msg.role === 'assistant' ? 'bg-purple-600 text-white' : 'bg-white/10 text-slate-400'
                  }`}>
                    {msg.role === 'assistant' ? <BrainCircuit className="w-6 h-6" /> : <Compass className="w-6 h-6" />}
                  </div>
                  <div className={`p-5 rounded-2xl text-sm leading-relaxed max-w-[85%] ${
                    msg.role === 'assistant' ? 'bg-white/5 border border-white/5 text-slate-200' : 'bg-purple-600/20 border border-purple-500/30 text-white'
                  }`}>
                    <div className="prose prose-invert prose-sm">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                 <div className="flex gap-4 animate-pulse">
                    <div className="w-10 h-10 rounded-2xl bg-purple-600/50 flex items-center justify-center shrink-0">
                       <BrainCircuit className="w-6 h-6 text-white" />
                    </div>
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5 w-1/2 flex items-center gap-3">
                       <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                       <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Mentor is formulating advice...</span>
                    </div>
                 </div>
              )}
           </div>

           <div className="p-6 bg-black/40 border-t border-white/5">
              <div className="relative">
                 <input 
                   type="text" 
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                   placeholder="Ask me anything about your career..."
                   className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-6 pr-16 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all font-medium"
                 />
                 <button 
                   onClick={handleSend}
                   disabled={!input.trim() || isLoading}
                   className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center hover:bg-purple-500 transition-colors disabled:opacity-30"
                 >
                   <Send className="w-5 h-5" />
                 </button>
              </div>
           </div>
        </div>

        {/* Sidebar context */}
        <div className="space-y-6">
           <div className="glass p-8 rounded-3xl">
              <h3 className="font-bold flex items-center gap-3 mb-6 text-sm uppercase tracking-widest text-slate-500">
                Try Asking
              </h3>
              <div className="space-y-3">
                 {suggestions.map((s, i) => (
                   <button 
                     key={i} 
                     onClick={() => setInput(s)}
                     className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/30 hover:bg-white/10 transition-all text-xs font-medium text-slate-400 hover:text-white"
                   >
                     {s}
                   </button>
                 ))}
              </div>
           </div>

           <div className="glass p-8 rounded-3xl bg-gradient-to-br from-purple-500/10 to-transparent">
              <Sparkles className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="font-bold mb-2">Knowledge Base</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">Our mentor is trained on thousands of successful career transitions and expert industry insights.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
