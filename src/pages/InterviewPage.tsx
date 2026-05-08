import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Send, 
  ArrowLeft, 
  BrainCircuit, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Trophy,
  MessageSquare,
  Upload,
  Volume2,
  VolumeX,
  Activity
} from 'lucide-react';
import * as pdfjs from 'pdfjs-dist';
import { aiService } from '../services/aiService';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { doc, getDocFromServer, setDoc, collection } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { cn } from '../lib/utils';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    score?: number;
    feedback?: string;
    clarity?: number;
  };
}

export function InterviewPage() {
  const [step, setStep] = useState<'setup' | 'interview' | 'evaluation'>('setup');
  const [position, setPosition] = useState('');
  const [type, setType] = useState<'HR' | 'Technical' | 'Behavioral'>('Technical');
  const [mode, setMode] = useState<'standard' | 'resume'>('standard');
  const [resumeText, setResumeText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [lastConfidence, setLastConfidence] = useState(0);
  const [useVoice, setUseVoice] = useState(true);
  const [autoSubmit, setAutoSubmit] = useState(false);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setLastConfidence(0);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const results = event.results;
        const lastResult = results[results.length - 1];
        if (lastResult.isFinal) {
          const transcript = lastResult[0].transcript;
          const confidence = lastResult[0].confidence;
          setLastConfidence(confidence);
          setInput(prev => prev + (prev.endsWith(' ') || !prev ? '' : ' ') + transcript);
          
          // Auto-submit only if requested and we have some content
          // We add a slight delay to allow for more continuous speech if needed
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'network') {
          alert('Network error in speech recognition. Please check your connection.');
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  // Auto-submit logic for voice
  useEffect(() => {
    let timeout: any;
    if (autoSubmit && input.trim() && !isLoading && isListening) {
      timeout = setTimeout(() => {
        handleSend();
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      }, 10000); // 10 seconds of silence
    }
    return () => clearTimeout(timeout);
  }, [autoSubmit, input, isLoading, isListening]);

  const totalQuestions = 10;
  const questionCount = messages.filter(m => m.role === 'assistant').length;

  const isComplete = questionCount >= totalQuestions;

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Improved sorting for accuracy: Sort items by Y coordinate (top to bottom) then X (left to right)
      const sortedItems = (textContent.items as any[]).sort((a: any, b: any) => {
        if (Math.abs(b.transform[5] - a.transform[5]) > 5) {
          return b.transform[5] - a.transform[5];
        }
        return a.transform[4] - b.transform[4];
      });

      let lastY = -1;
      let pageText = '';
      
      for (const item of sortedItems) {
        if (lastY !== -1 && Math.abs(item.transform[5] - lastY) > 5) {
          pageText += '\n';
        } else if (lastY !== -1) {
          pageText += ' ';
        }
        pageText += item.str;
        lastY = item.transform[5];
      }
      
      fullText += pageText + '\n\n';
    }
    
    return fullText;
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
       alert("Please upload a PDF file.");
       return;
    }

    setIsUploadingResume(true);
    setResumeFileName(file.name);
    try {
      const text = await extractTextFromPDF(file);
      setResumeText(text);
    } catch (error) {
      console.error(error);
      alert("Failed to read PDF. Make sure it's not password protected.");
      setResumeFileName(null);
    } finally {
      setIsUploadingResume(false);
    }
  };

  useEffect(() => {
    // If resume mode, try to fetch the most recent resume analysis
    if (mode === 'resume') {
       // Logic to fetch user's last resume text if exists 
       // For now, we'll assume it might be in local storage or we can prompt
    }
  }, [mode]);

  const speak = (text: string) => {
    if (!useVoice) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Some browsers require a user interaction to start synthesis
    // or might have issues if spoken too quickly after another.
    setTimeout(() => {
      synth.speak(utterance);
    }, 100);
  };

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert("Your browser does not support voice input or it's not initialized.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Speech recognition start failed:', error);
        // Sometimes it might already be started or in a weird state
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current.start(), 100);
      }
    }
  };

  const startInterview = async () => {
    if (!position) return;
    setIsLoading(true);
    try {
      const qs = await aiService.generateInterviewQuestions(type, position, totalQuestions);
      const firstMessage = `Welcome to your ${type} interview for the ${position} position ${mode === 'resume' ? 'based on your resume' : ''}. I'm your AI interviewer. Let's start with the first question:\n\n**${qs[0]}**`;
      setMessages([{ 
        role: 'assistant', 
        content: firstMessage 
      }]);
      setStep('interview');
      // Speak the first question
      speak(firstMessage);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg: ChatMessage = { 
      role: 'user', 
      content: input,
      metadata: { clarity: Math.round(lastConfidence * 100) || 85 }
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await aiService.interviewChat(
        messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', text: m.content })),
        input,
        position,
        type,
        mode === 'resume' ? resumeText : undefined
      );
      
      const assistantMsg: ChatMessage = { 
        role: 'assistant', 
        content: isComplete ? "Thank you for completing the interview. I've gathered enough information to provide an evaluation." : result.question,
        metadata: {
          score: result.score,
          feedback: result.feedback
        }
      };
      setMessages(prev => [...prev, assistantMsg]);
      speak(assistantMsg.content);

      if (isComplete) {
        setTimeout(() => endAndEvaluate(), 2000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const endAndEvaluate = async () => {
    setIsLoading(true);
    try {
      const result = await aiService.analyzeInterviewPerformance(
        messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', text: m.content })),
        position
      );
      setEvaluation(result);
      setStep('evaluation');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)]">
      <AnimatePresence mode="wait">
        {step === 'setup' && (
          <motion.div 
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-full flex flex-col justify-center"
          >
            <div className="glass rounded-[2rem] p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 mx-auto mb-8 shadow-[0_0_30px_rgba(124,58,237,0.2)]">
                <BrainCircuit className="w-8 h-8" />
              </div>
              <h1 className="text-4xl font-black mb-4">Set up your Interview</h1>
              <p className="text-slate-400 mb-12">Configure your target role and interview type for a tailored simulation.</p>

              <div className="space-y-6 text-left max-w-md mx-auto">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Target Position</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Senior Frontend Developer"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Interview Mode</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'standard', label: 'Standard', desc: 'Generic AI questions' },
                      { id: 'resume', label: 'Resume-Based', desc: 'Personalized to you' }
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setMode(m.id as any)}
                        className={cn(
                          "p-4 rounded-xl border transition-all text-left",
                          mode === m.id 
                            ? "bg-purple-600/10 border-purple-500 text-white" 
                            : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                        )}
                      >
                        <div className="font-bold text-sm mb-1">{m.label}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-tighter">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {mode === 'resume' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Resume Source (PDF)</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3",
                        resumeFileName ? "border-green-500/30 bg-green-500/5" : "border-white/10 hover:border-white/20 hover:bg-white/5"
                      )}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleResumeUpload} 
                        className="hidden" 
                        accept=".pdf" 
                      />
                      {isUploadingResume ? (
                        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                      ) : resumeFileName ? (
                        <>
                          <CheckCircle2 className="w-8 h-8 text-green-400" />
                          <div className="text-center">
                            <div className="text-sm font-bold text-white mb-1">{resumeFileName}</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase">Click to replace</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                             <Upload className="w-6 h-6" />
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-white mb-1">Upload Resume</div>
                            <p className="text-[10px] text-slate-500 leading-relaxed max-w-[150px]">Questions will be tailored to your experiences.</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <button 
                  onClick={startInterview}
                  disabled={!position || isLoading}
                  className="w-full bg-white text-black py-4 rounded-xl font-black text-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Start Simulation"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'interview' && (
          <motion.div 
            key="interview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-full bg-black/20 rounded-[2rem] border border-white/5 overflow-hidden"
          >
            {/* Interview Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-4">
                <button onClick={() => setStep('setup')} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                   <h2 className="font-bold">{type} Interview</h2>
                   <div className="flex items-center gap-3">
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{position}</p>
                      <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                      <p className="text-[10px] text-purple-400 font-black uppercase tracking-widest">Question {questionCount + (isLoading ? 1 : 0)}</p>
                   </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setUseVoice(!useVoice)}
                  className={cn(
                    "p-2 rounded-lg transition-colors border",
                    useVoice ? "bg-purple-500/10 border-purple-500/20 text-purple-400" : "bg-white/5 border-white/10 text-slate-500"
                  )}
                  title={useVoice ? "Mute Interviewer" : "Unmute Interviewer"}
                >
                  {useVoice ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
                <button 
                  onClick={endAndEvaluate}
                  className="bg-red-500/10 text-red-400 px-4 py-2 rounded-lg text-xs font-bold border border-red-500/20 hover:bg-red-500/20 transition-all"
                >
                  End Session
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
              {messages.map((msg, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={cn(
                    "flex gap-4 max-w-[80%]",
                    msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shrink-0",
                    msg.role === 'assistant' ? "bg-purple-500/20 text-purple-400" : "bg-white/10 text-white"
                  )}>
                    {msg.role === 'assistant' ? <BrainCircuit className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                  </div>
                  <div className="space-y-2">
                    <div className={cn(
                      "p-4 rounded-2xl text-sm leading-relaxed relative group",
                      msg.role === 'assistant' ? "bg-white/5 text-slate-200" : "bg-purple-600 text-white"
                    )}>
                      {msg.role === 'assistant' && msg.metadata?.score !== undefined && (
                        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/5">
                           <div className={cn(
                             "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest",
                             msg.metadata.score > 80 ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-500"
                           )}>
                              Last Answer: {msg.metadata.score}%
                           </div>
                           <p className="text-[10px] text-slate-500 font-medium italic truncate">{msg.metadata.feedback}</p>
                        </div>
                      )}
                      <div className="markdown-body prose prose-invert prose-sm">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                      
                      {msg.role === 'user' && msg.metadata?.clarity !== undefined && (
                        <div className="mt-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-tighter opacity-50">
                           <Activity className="w-3 h-3" />
                           Voice Clarity: {msg.metadata.clarity}%
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                 <div className="flex gap-4 max-w-[80%] opacity-50">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center animate-pulse">
                       <BrainCircuit className="w-5 h-5" />
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 flex items-center gap-2">
                       <Loader2 className="w-4 h-4 animate-spin" />
                       <span className="text-xs font-medium italic">Interviewer is thinking...</span>
                    </div>
                 </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-black/40 border-t border-white/5">
              <div className="flex items-center gap-4 mb-4 px-2">
                 <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="autoSubmit" 
                      checked={autoSubmit}
                      onChange={(e) => setAutoSubmit(e.target.checked)}
                      className="w-3 h-3 rounded bg-white/5 border-white/10"
                    />
                    <label htmlFor="autoSubmit" className="text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer">Auto-Submit Voice</label>
                 </div>
                 <div className="w-px h-3 bg-white/10"></div>
                 <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Question {questionCount} of {totalQuestions}
                 </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={toggleVoice}
                  className={cn(
                    "w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center transition-all",
                    isListening ? "bg-red-500/20 text-red-500 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse" : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Mic className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your response here..."
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium text-sm transition-all pr-12"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-purple-400 hover:text-white transition-colors disabled:opacity-30"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'evaluation' && evaluation && (
           <motion.div 
             key="evaluation"
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="glass rounded-[2rem] p-12 overflow-y-auto no-scrollbar"
           >
              <div className="text-center mb-12">
                 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-400 text-xs font-bold mb-6">
                    <CheckCircle2 className="w-4 h-4" />
                    Interview Completed
                 </div>
                 <h1 className="text-4xl font-black mb-4">Post-Session Evaluation</h1>
                 <p className="text-slate-400">Here's how you performed across different dimensions.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                 <div className="p-8 rounded-3xl bg-white/5 border border-white/10 text-center">
                    <div className="text-xs uppercase tracking-widest font-black text-slate-500 mb-2">Clarity</div>
                    <div className="text-4xl font-black gradient-text">{evaluation.communicationClarity.match(/\d+/) || '8'}/10</div>
                 </div>
                 <div className="p-8 rounded-3xl bg-white/5 border border-white/10 text-center">
                    <div className="text-xs uppercase tracking-widest font-black text-slate-500 mb-2">Accuracy</div>
                    <div className="text-4xl font-black gradient-text">{evaluation.technicalAccuracy}/10</div>
                 </div>
                 <div className="md:col-span-2 p-8 rounded-3xl bg-white/5 border border-white/10">
                    <h3 className="font-bold mb-2 flex items-center gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-purple-400" />
                      Filler Words & Pacing
                    </h3>
                    <p className="text-slate-300 text-xs leading-relaxed">{evaluation.fillerWordUsage}</p>
                    <div className="mt-4 pt-4 border-t border-white/5">
                       <h3 className="font-bold mb-2 text-sm">Response Length</h3>
                       <p className="text-slate-300 text-xs leading-relaxed">{evaluation.averageResponseLength}</p>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                 <div className="p-8 rounded-3xl bg-green-500/5 border border-green-500/10">
                    <h3 className="font-black text-xs uppercase tracking-widest text-green-400 mb-6 flex items-center gap-2">
                       <CheckCircle2 className="w-4 h-4" />
                       Key Strengths
                    </h3>
                    <ul className="space-y-4">
                       {evaluation.keyStrengths.map((s: string, i: number) => (
                         <li key={i} className="flex gap-3 text-sm text-slate-300">
                            <span className="text-green-500 font-bold">•</span>
                            {s}
                         </li>
                       ))}
                    </ul>
                 </div>
                 <div className="p-8 rounded-3xl bg-red-500/5 border border-red-500/10">
                    <h3 className="font-black text-xs uppercase tracking-widest text-red-400 mb-6 flex items-center gap-2">
                       <AlertCircle className="w-4 h-4" />
                       Areas for Improvement
                    </h3>
                    <ul className="space-y-4">
                       {evaluation.improvements.map((s: string, i: number) => (
                         <li key={i} className="flex gap-3 text-sm text-slate-300">
                            <span className="text-red-500 font-bold">•</span>
                            {s}
                         </li>
                       ))}
                    </ul>
                 </div>
              </div>

              <div className="p-8 rounded-3xl bg-purple-600/10 border border-purple-500/20 text-center mb-12">
                  <div className="text-xs uppercase tracking-widest font-black text-slate-500 mb-2">Final Verdict</div>
                  <div className={cn(
                    "text-3xl font-black",
                    evaluation.overallVerdict.includes('Hired') ? "text-green-400" : "text-yellow-400"
                  )}>
                    {evaluation.overallVerdict}
                  </div>
              </div>

              <div className="mt-12 flex gap-4">
                 <button 
                  onClick={() => setStep('setup')}
                  className="flex-1 py-4 rounded-xl border border-white/10 text-sm font-bold hover:bg-white/5 transition-all"
                 >
                    Practice Again
                 </button>
                 <button 
                  onClick={() => navigate('/analytics')}
                  className="flex-1 py-4 rounded-xl bg-white text-black text-sm font-black hover:scale-105 transition-all"
                 >
                    View Full Statistics
                 </button>
              </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
