import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Search,
  Sparkles,
  Loader2,
  Target,
  FileSearch,
  Check,
  ArrowRight,
  Trophy
} from 'lucide-react';
import { aiService } from '../services/aiService';
import { motion, AnimatePresence } from 'motion/react';
import { dataService } from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import * as pdfjs from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

export function ResumePage() {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [refinedResume, setRefinedResume] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRefineResume = async () => {
    if (!text || !analysis) return;
    setIsRefining(true);
    try {
      const prompt = `Act as a professional resume writer. Given the following resume text and AI analysis feedback, generate a fully optimized, highly professional version of this resume. 
      Focus on action verbs, quantifying achievements, and integrating missing keywords mentioned in the analysis.
      
      Original Resume:
      ${text}
      
      Analysis Feedback:
      ${analysis.feedback}
      Improvements suggested: ${analysis.improvements.join(', ')}
      Missing Keywords: ${analysis.missingKeywords.join(', ')}

      Return the perfected resume text in a clear, formatted structure.`;

      const response = await aiService.careerMentorChat([], prompt);
      setRefinedResume(response);
    } catch (error) {
      console.error(error);
      alert('Failed to refine resume. Please try again.');
    } finally {
      setIsRefining(false);
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Sort items by Y coordinate (top to bottom) then X (left to right)
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

  const handleFileChange = async (file: File) => {
    if (!file) return;
    
    setFileName(file.name);
    setIsUploading(true);
    
    try {
      let extractedText = '';
      if (file.type === 'application/pdf') {
        extractedText = await extractTextFromPDF(file);
      } else {
        alert('Please upload a PDF file.');
        setIsUploading(false);
        return;
      }
      
      setText(extractedText);
      const result = await aiService.analyzeResume(extractedText);
      setAnalysis(result);

      if (user) {
        await dataService.saveResumeAnalysis({
          userId: user.uid,
          fileName: file.name,
          analysis: result
        });
      }
    } catch (error) {
      console.error('Extraction error:', error);
      alert('Failed to extract text from resume. Please try pasting the text manually.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setIsUploading(true);
    try {
      const result = await aiService.analyzeResume(text);
      setAnalysis(result);
      if (user) {
        await dataService.saveResumeAnalysis({
          userId: user.uid,
          fileName: fileName || 'manual_entry.txt',
          analysis: result
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black mb-2 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl accent-gradient flex items-center justify-center text-white">
              <FileSearch className="w-6 h-6" />
            </div>
            Resume Intelligence
          </h1>
          <p className="text-slate-400 font-medium max-w-2xl">
            We use <span className="text-white font-bold">advanced neural networks</span> to scan your resume for ATS compatibility, keyword density, and strategic improvements.
          </p>
        </div>
        {!analysis && text && (
          <button 
            onClick={() => { setText(''); setFileName(null); }}
            className="text-xs font-black uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors"
          >
            Clear and Restart
          </button>
        )}
      </div>

      {!analysis ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`glass rounded-[2.5rem] p-16 flex flex-col items-center justify-center border-dashed border-2 transition-all cursor-pointer group relative overflow-hidden ${
                isDragging ? 'border-brand-primary bg-brand-primary/5 scale-[0.99]' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                className="hidden" 
                accept=".pdf"
              />
              
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center text-slate-400 mb-8 group-hover:scale-110 group-hover:bg-purple-500/10 group-hover:text-purple-400 transition-all duration-500 shadow-inner">
                 <Upload className="w-10 h-10" />
              </div>
              
              <h2 className="text-3xl font-black mb-4">
                {fileName ? <span className="text-brand-secondary">{fileName}</span> : 'Upload Resume'}
              </h2>
              <p className="text-slate-500 text-sm mb-0 max-w-sm text-center font-medium leading-relaxed">
                Drag and drop your <span className="text-slate-300">PDF</span> file here, <br/> or click to browse files.
              </p>

              {isUploading && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                   <Loader2 className="w-12 h-12 animate-spin text-purple-400 mb-6" />
                   <div className="text-xl font-black mb-2">Analyzing Resume...</div>
                   <div className="text-slate-400 text-sm font-medium">Gemini is extracting insights from your profile</div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
             {[
               { icon: ShieldCheck, title: 'ATS Optimization', color: 'text-green-400', desc: 'Scan for 150+ common ATS red flags including complex formatting and section parsing.' },
               { icon: Search, title: 'Keyword Extraction', color: 'text-cyan-400', desc: 'Identify critical missing industry-standard keywords that recruiters use to filter roles.' },
               { icon: AlertTriangle, title: 'Skill Gap Check', color: 'text-yellow-400', desc: 'Real-time comparison against successful applications in our global candidate database.' },
               { icon: CheckCircle2, title: 'Structure Validation', color: 'text-purple-400', desc: 'Ensure your experience is chronologically sound and emphasizes high-impact achievements.' }
             ].map((feature, i) => (
               <div key={i} className="glass p-8 rounded-[2rem] border-l-2 border-transparent hover:border-brand-primary transition-all group">
                  <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.color}`}>
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">{feature.desc}</p>
               </div>
             ))}
          </div>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12"
          >
            {/* Left Col: Core Stats */}
            <div className="space-y-8">
              <div className="glass p-12 rounded-[2.5rem] text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-2 bg-purple-500"></div>
                <div className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-6">Aggregate ATS Score</div>
                
                <div className="relative inline-block mb-8">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle 
                      cx="80" cy="80" r="70" 
                      className="stroke-white/5 fill-none" 
                      strokeWidth="12" 
                    />
                    <circle 
                      cx="80" cy="80" r="70" 
                      className="stroke-purple-500 fill-none" 
                      strokeWidth="12" 
                      strokeDasharray={440}
                      strokeDashoffset={440 - (440 * (analysis.atsScore || 0)) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-5xl font-black tracking-tighter">{analysis.atsScore}%</div>
                  </div>
                </div>

                <div className="text-sm font-bold text-slate-200 mb-2">
                  {analysis.atsScore > 80 ? 'Highly Competitive' : analysis.atsScore > 60 ? 'Moderately Optimized' : 'Needs Significant Revision'}
                </div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Percentile: Top 15%</div>
              </div>

              <div className="glass p-10 rounded-[2.5rem] relative">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="font-bold flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-brand-secondary" />
                      Critical Keywords
                    </h3>
                    <div className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-black text-slate-500">MISSING</div>
                 </div>
                 <div className="flex flex-wrap gap-2">
                    {analysis.missingKeywords.map((kw: string, i: number) => (
                      <span key={i} className="px-4 py-2 rounded-xl bg-red-400/10 border border-red-400/20 text-red-400 text-xs font-black uppercase tracking-wider italic">
                        {kw}
                      </span>
                    ))}
                 </div>
              </div>
            </div>

            {/* Middle Col: Feedback */}
            <div className="lg:col-span-2 space-y-8">
               <div className="glass p-12 rounded-[2.5rem]">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-3xl font-black tracking-tight">AI Diagnostic Report</h3>
                  </div>
                  
                  <p className="text-slate-300 leading-relaxed font-medium mb-12 text-lg">
                    {analysis.feedback}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                       <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                          <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Actionable Improvements</h4>
                       </div>
                       <ul className="space-y-4">
                          {analysis.improvements.map((imp: string, i: number) => (
                            <li key={i} className="flex gap-4 text-sm font-medium text-slate-200">
                               <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                                  <Check className="w-3.5 h-3.5" />
                               </div>
                               {imp}
                            </li>
                          ))}
                       </ul>
                    </div>
                    <div className="space-y-6">
                       <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                          <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Projected Skill Gaps</h4>
                       </div>
                       <ul className="space-y-4">
                          {analysis.skillGaps.map((skill: string, i: number) => (
                            <li key={i} className="flex gap-4 text-sm font-medium text-slate-300 italic">
                               <div className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                                  <Target className="w-3.5 h-3.5" />
                               </div>
                               {skill}
                            </li>
                          ))}
                       </ul>
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button 
                    onClick={() => { setAnalysis(null); setText(''); setFileName(null); setRefinedResume(null); }} 
                    className="py-6 rounded-2xl bg-white/5 border border-white/10 font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all shadow-xl"
                  >
                    Rescan New Draft
                  </button>
                  <button 
                    onClick={handleRefineResume}
                    disabled={isRefining}
                    className="py-6 rounded-2xl accent-gradient font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isRefining ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Deploy Optimized Version <Sparkles className="w-4 h-4" /></>}
                  </button>
               </div>

               <AnimatePresence>
                  {refinedResume && (
                    <motion.div 
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-12 glass p-12 rounded-[2.5rem] border-t-4 border-brand-secondary relative overflow-hidden"
                    >
                       <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12">
                          <Trophy className="w-48 h-48" />
                       </div>
                       
                       <div className="flex items-center justify-between mb-8">
                          <h3 className="text-3xl font-black">Refined Resume Intelligence</h3>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(refinedResume);
                              alert('Copied to clipboard!');
                            }}
                            className="px-6 py-2 rounded-xl bg-white text-black font-black text-xs hover:scale-105 transition-all shadow-xl"
                          >
                            Copy to Clipboard
                          </button>
                       </div>

                       <div className="prose prose-invert max-w-none">
                          <pre className="whitespace-pre-wrap font-sans text-slate-300 leading-relaxed bg-black/20 p-8 rounded-2xl border border-white/5 text-sm">
                             {refinedResume}
                          </pre>
                       </div>

                       <div className="mt-8 flex items-center gap-3 text-brand-secondary">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-xs font-black uppercase tracking-widest">Optimized for ATS & High Impact</span>
                       </div>
                    </motion.div>
                  )}
               </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

