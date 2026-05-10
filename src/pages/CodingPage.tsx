import React, { useState } from 'react';
import { 
  Code2, 
  Terminal, 
  Play, 
  CheckCircle2, 
  BrainCircuit, 
  ChevronRight,
  ShieldAlert,
  Ghost,
  X,
  Sparkles,
  Command,
  Loader2,
  Trophy
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { aiService } from '../services/aiService';

export function CodingPage() {
  const [selectedTopic, setSelectedTopic] = useState('Arrays');
  const [selectedProblem, setSelectedProblem] = useState<any>(null);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('function solution(nums, target) {\n  // Write your code here\n}');
  const [aiLoading, setAiLoading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [optimizedSolution, setOptimizedSolution] = useState<string | null>(null);
  
  const topics = ['Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming'];
  const languages = [
    { id: 'javascript', label: 'JavaScript' },
    { id: 'typescript', label: 'TypeScript' },
    { id: 'python', label: 'Python' },
    { id: 'java', label: 'Java' },
    { id: 'cpp', label: 'C++' }
  ];

  const problems = [
    { title: 'Two Sum', difficulty: 'Easy', status: 'Solved' },
    { title: 'Container With Most Water', difficulty: 'Medium', status: 'Attempted' },
    { title: 'Trapping Rain Water', difficulty: 'Hard', status: 'Todo' },
    { title: 'Group Anagrams', difficulty: 'Medium', status: 'Solved' },
  ];

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    if (selectedProblem) {
       // Reset code template for new language
       handleSolve({ ...selectedProblem }, lang);
    }
  };

  const handleSolve = (prob: any, lang: string = language) => {
    setSelectedProblem(prob);
    setHint(null);
    setResults(null);
    setOptimizedSolution(null);
    
    // Simple template logic
    const safeTitle = prob.title.replace(/\s+/g, '');
    let template = '';
    
    switch(lang) {
      case 'python':
        template = `def ${safeTitle.toLowerCase()}(nums, target):\n    # Write your code here\n    pass`;
        break;
      case 'java':
        template = `class Solution {\n    public int[] ${safeTitle.toLowerCase()}(int[] nums, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n}`;
        break;
      case 'cpp':
        template = `class Solution {\npublic:\n    vector<int> ${safeTitle.toLowerCase()}(vector<int>& nums, int target) {\n        // Write your code here\n        return {};\n    }\n};`;
        break;
      default:
        template = `function ${safeTitle}(nums, target) {\n  // Write your code here\n}`;
    }
    setCode(template);
  };

  const handleSubmit = async () => {
    if (!selectedProblem) return;
    setAiLoading(true);
    setResults(null);
    
    try {
       const prompt = `Act as an expert competitive programmer and code reviewer. 
       Evaluate the following ${language} code for the problem "${selectedProblem.title}" in the topic "${selectedTopic}".
       
       Problem Context:
       ${selectedProblem.description || "Two Sum: Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target."}
       
       Candidate Code:
       ${code}
       
       Respond ONLY in JSON format with:
       - passed: boolean (if the logic seems correct)
       - feedback: string (brief assessment)
       - complexity: string (time and space complexity of the code)
       - isOptimized: boolean (if it uses the most efficient approach)
       - optimizedExplanation: string (why the current approach is or isn't optimized)
       - optimizedCode: string (provide the most optimal version if isOptimized is false, else same code)
       `;

       const response = await aiService.careerMentorChat([], prompt);
       // Clean JSON from potential markdown tags
       const cleanJson = response.replace(/```json|```/g, '').trim();
       const data = JSON.parse(cleanJson);
       
       setResults(data);
       if (!data.isOptimized) {
          setOptimizedSolution(data.optimizedCode);
       }
    } catch (error) {
       console.error(error);
       alert('Error evaluating code. Please try again.');
    } finally {
       setAiLoading(false);
    }
  };

  const getAiHint = async () => {
    if (!selectedProblem) return;
    setAiLoading(true);
    try {
      const description = selectedProblem.description || "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.";
      const response = await aiService.getCodingHint(
        selectedProblem.title,
        selectedTopic,
        description,
        code,
        language
      );
      setHint(response);
    } catch (error) {
      console.error(error);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black mb-2">Coding Sprints</h1>
        <p className="text-slate-400 font-medium">Master Data Structures & Algorithms with real-time AI guidance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Topics */}
        <div className="glass rounded-3xl p-6 h-fit sticky top-24">
           <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 px-2">Topics</h3>
           <div className="space-y-1">
             {topics.map(topic => (
               <button
                 key={topic}
                 onClick={() => setSelectedTopic(topic)}
                 className={cn(
                   "w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between group",
                   selectedTopic === topic ? "bg-purple-600 text-white shadow-lg" : "text-slate-400 hover:bg-white/5 hover:text-white"
                 )}
               >
                 {topic}
                 <ChevronRight className={cn("w-4 h-4 transition-transform", selectedTopic === topic ? "rotate-90" : "group-hover:translate-x-1")} />
               </button>
             ))}
           </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass p-8 rounded-3xl flex items-center gap-6 group cursor-pointer hover:border-purple-500/30 transition-all">
                 <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <Play className="w-7 h-7 fill-current" />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold mb-1">Interactive Editor</h3>
                    <p className="text-sm text-slate-500 font-medium leading-tight">Write, test, and debug code in our integrated IDE.</p>
                 </div>
              </div>
              <div className="glass p-8 rounded-3xl flex items-center gap-6 group cursor-pointer hover:border-cyan-500/30 transition-all">
                 <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0">
                    <BrainCircuit className="w-7 h-7" />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold mb-1">AI Debugger</h3>
                    <p className="text-sm text-slate-500 font-medium leading-tight">Get step-by-step hints and complexity analysis.</p>
                 </div>
              </div>
           </div>

           <div className="glass rounded-[2rem] overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                 <h2 className="font-bold flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-purple-400" />
                    Challenge Set: {selectedTopic}
                 </h2>
                 <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">4 Problems</span>
                 </div>
              </div>
              <div className="divide-y divide-white/5">
                 {problems.map((prob, i) => (
                   <div key={i} className="p-6 flex items-center justify-between group hover:bg-white/5 transition-all cursor-pointer">
                      <div className="flex items-center gap-4">
                         <div className={cn(
                           "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                           prob.status === 'Solved' ? "bg-green-500/10 text-green-500" : "bg-white/5 text-slate-600"
                         )}>
                            {prob.status === 'Solved' ? <CheckCircle2 className="w-5 h-5" /> : <Code2 className="w-5 h-5" />}
                         </div>
                         <div>
                            <div className="font-bold group-hover:text-purple-400 transition-colors">{prob.title}</div>
                            <div className="flex items-center gap-3">
                               <span className={cn(
                                 "text-[10px] font-black uppercase tracking-widest",
                                 prob.difficulty === 'Easy' ? "text-emerald-500" : prob.difficulty === 'Medium' ? "text-yellow-500" : "text-red-500"
                               )}>{prob.difficulty}</span>
                               <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                               <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{prob.status}</span>
                            </div>
                         </div>
                      </div>
                      <button 
                        onClick={() => handleSolve(prob)}
                        className="px-6 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold hover:bg-white text-black transition-all"
                      >
                         Solve Now
                      </button>
                   </div>
                 ))}
              </div>
           </div>

           <div className="rounded-3xl p-12 bg-white/5 border border-white/10 text-center relative overflow-hidden">
              <Ghost className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5" />
              <h3 className="text-2xl font-black mb-4">Elite Prep Beta</h3>
              <p className="text-slate-400 max-w-lg mx-auto mb-8 font-medium">Coming soon: System Design simulations and Company-specific question sets from top tech firms.</p>
              <button className="px-8 py-3 rounded-full bg-purple-600/20 text-purple-400 font-bold text-sm border border-purple-500/30">
                Subscribe for Updates
              </button>
           </div>
        </div>
      </div>

      {/* Code Editor Modal Mock */}
      <AnimatePresence>
        {selectedProblem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProblem(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl h-full bg-[#11141D] rounded-[2rem] border border-white/10 shadow-3xl overflow-hidden flex flex-col"
            >
              {/* Editor Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600 rounded-lg">
                      <Code2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">{selectedProblem.title}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{selectedTopic} • {selectedProblem.difficulty}</p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-4 text-xs font-bold text-slate-500">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                       <Command className="w-3 h-3" />
                       Node.js v20
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedProblem(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Editor Body */}
              <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                {/* Left: Problem Description */}
                <div className="w-full md:w-1/3 border-r border-white/5 p-8 overflow-y-auto no-scrollbar">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Description</h4>
                  <div className="prose prose-invert prose-sm">
                    <p className="text-slate-300 leading-relaxed font-medium">
                      Given an array of integers <code className="text-purple-400">nums</code> and an integer <code className="text-purple-400">target</code>, return indices of the two numbers such that they add up to <code className="text-purple-400">target</code>.
                    </p>
                    <p className="text-slate-300 leading-relaxed font-medium mt-4">
                      You may assume that each input would have exactly one solution, and you may not use the same element twice.
                    </p>
                    <h5 className="text-white mt-8 mb-4">Examples</h5>
                    <div className="bg-black/40 p-4 rounded-xl space-y-2 border border-white/5">
                      <div className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Input</div>
                      <code className="text-xs block text-slate-300">nums = [2,7,11,15], target = 9</code>
                      <div className="text-[10px] font-black tracking-widest text-slate-500 uppercase mt-4">Output</div>
                      <code className="text-xs block text-slate-300">[0,1]</code>
                    </div>
                  </div>
                </div>

                {/* Right: Code Area */}
                <div className="flex-1 flex flex-col bg-black/20">
                  <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                    <div className="flex gap-4">
                       <select 
                         value={language}
                         onChange={(e) => handleLanguageChange(e.target.value)}
                         className="bg-transparent text-xs font-black uppercase tracking-widest text-purple-400 focus:outline-none cursor-pointer"
                       >
                         {languages.map(l => <option key={l.id} value={l.id} className="bg-slate-900 border-none">{l.label}</option>)}
                       </select>
                       <button className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">notes.txt</button>
                    </div>
                    <div className="flex items-center gap-3">
                       <button 
                         onClick={getAiHint}
                         disabled={aiLoading}
                         className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-cyan-600/10 text-cyan-400 text-xs font-black hover:bg-cyan-600/20 transition-all disabled:opacity-50"
                       >
                          {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                          AI Hint
                       </button>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col relative">
                    <textarea 
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="flex-1 bg-transparent p-8 font-mono text-sm resize-none focus:outline-none text-slate-300 leading-relaxed"
                    />

                    {/* Results Overlay */}
                    <AnimatePresence>
                      {results && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute inset-0 bg-slate-900/90 backdrop-blur-md p-10 overflow-y-auto no-scrollbar z-20"
                        >
                           <div className="flex justify-between items-start mb-8">
                              <div>
                                <h4 className={cn(
                                  "text-2xl font-black mb-2",
                                  results.passed ? "text-green-400" : "text-red-400"
                                )}>
                                  {results.passed ? "Accepted" : "Wrong Answer / Failed"}
                                </h4>
                                <p className="text-slate-400 font-medium text-sm">{results.feedback}</p>
                              </div>
                              <button onClick={() => setResults(null)} className="p-2 hover:bg-white/10 rounded-full">
                                <X className="w-6 h-6" />
                              </button>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-6">
                                 <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Complexity</div>
                                    <div className="p-4 bg-white/5 rounded-xl text-sm font-mono text-purple-300 border border-white/5">
                                       {results.complexity}
                                    </div>
                                 </div>
                                 {optimizedSolution && (
                                   <div>
                                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Refined Logic</div>
                                      <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                        {results.optimizedExplanation}
                                      </p>
                                   </div>
                                 )}
                              </div>

                              {optimizedSolution && (
                                <div>
                                   <div className="text-[10px] font-black uppercase tracking-widest text-green-400 mb-2 flex items-center gap-2">
                                      <Trophy className="w-3 h-3" />
                                      Optimized Solution
                                   </div>
                                   <pre className="p-6 bg-black/40 rounded-xl text-[10px] font-mono text-slate-300 border border-green-500/10 overflow-x-auto">
                                      <code>{optimizedSolution}</code>
                                   </pre>
                                </div>
                              )}
                           </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {hint && !results && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-4 right-4 max-w-xs p-4 rounded-xl bg-cyan-900/80 backdrop-blur-md border border-cyan-500/30 shadow-2xl"
                        >
                           <div className="flex justify-between items-start mb-2">
                              <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400">AI Thinking</div>
                              <button onClick={() => setHint(null)} className="text-cyan-400 hover:text-white transition-colors">
                                <X className="w-3 h-3" />
                              </button>
                           </div>
                           <p className="text-xs text-white leading-relaxed font-medium">{hint}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="p-6 bg-black/40 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                       <Terminal className="w-4 h-4" />
                       Console Output: Ready
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={handleSubmit}
                        disabled={aiLoading}
                        className="px-6 py-2 rounded-xl border border-white/10 text-xs font-bold hover:bg-white/5 transition-all flex items-center gap-2"
                      >
                        {aiLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                        Run Tests
                      </button>
                      <button 
                        onClick={handleSubmit}
                        disabled={aiLoading}
                        className="px-8 py-2 rounded-xl bg-purple-600 text-white text-xs font-black shadow-lg shadow-purple-500/20 hover:scale-105 transition-all flex items-center gap-2"
                      >
                         {aiLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                        Submit Solution
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

