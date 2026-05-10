import React, { useEffect, useState } from 'react';
import { 
  ArrowUpRight, 
  Clock, 
  History, 
  MessageSquare, 
  Trophy, 
  Zap,
  TrendingUp,
  Target,
  BrainCircuit,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { cn } from '../lib/utils';

const data = [
  { name: 'Mon', score: 65 },
  { name: 'Tue', score: 68 },
  { name: 'Wed', score: 75 },
  { name: 'Thu', score: 72 },
  { name: 'Fri', score: 82 },
  { name: 'Sat', score: 88 },
  { name: 'Sun', score: 92 },
];

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumeAnalysis, setResumeAnalysis] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      setLoading(true);
      try {
        const [sessions, analyses] = await Promise.all([
          dataService.getInterviews(user.uid),
          dataService.getResumeAnalyses(user.uid)
        ]);
        setRecentSessions(sessions.slice(0, 5));
        if (analyses.length > 0) {
          setResumeAnalysis(analyses[0].analysis);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const atsScore = resumeAnalysis?.atsScore || 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            Welcome back, {user?.displayName?.split(' ')[0] || 'Explorer'}! 👋
          </h1>
          <p className="text-slate-400 font-medium leading-relaxed">
            Ready to ace your next interview? You have <span className="text-white font-bold">{recentSessions.length} recent sessions</span>.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-white/5 px-4 py-2 rounded-full border border-white/5">
          <Clock className="w-3 h-3 text-brand-secondary" />
          Last active: {recentSessions[0] ? new Date(recentSessions[0].createdAt).toLocaleDateString() : 'Just now'}
        </div>
      </div>

      {/* Hero Banner from Theme */}
      <div className="p-8 rounded-[2rem] accent-gradient flex items-center justify-between overflow-hidden relative shadow-2xl glow-purple">
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Ready for your next big break?</h2>
          <p className="text-white/80 max-w-sm font-medium">Practice your behavioral interview skills with our AI coach and get instant feedback.</p>
          <button 
            onClick={() => navigate('/interview')}
            className="mt-6 bg-white text-purple-600 px-8 py-3 rounded-xl font-black text-sm shadow-xl hover:scale-105 transition-all"
          >
            Start Mock Interview
          </button>
        </div>
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
          <BrainCircuit className="w-64 h-64" />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Column */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* Skill Mastery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass p-8 rounded-[2rem]">
               <div className="flex justify-between items-start mb-8">
                  <h3 className="text-lg font-bold">Skill Mastery</h3>
                  <span className="text-[10px] text-brand-secondary font-black uppercase tracking-widest bg-brand-secondary/10 px-2 py-1 rounded">Live Data</span>
               </div>
               <div className="space-y-6">
                  {[
                    { label: 'Problem Solving', val: 92, color: 'bg-cyan-400' },
                    { label: 'Communication', val: 78, color: 'bg-purple-500' },
                    { label: 'Technical Core', val: 85, color: 'bg-blue-500' },
                  ].map((skill, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                         <span>{skill.label}</span>
                         <span className="text-white">{skill.val}%</span>
                       </div>
                       <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${skill.val}%` }}
                            className={`h-full ${skill.color} rounded-full`}
                          />
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="glass p-8 rounded-[2rem]">
               <h3 className="text-lg font-bold mb-6">Recent Sessions</h3>
               <div className="space-y-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                       <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                    </div>
                  ) : recentSessions.length > 0 ? (
                    recentSessions.map((session, i) => (
                      <div key={i} className="flex items-center p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-white/10 transition-all cursor-pointer">
                         <div className={cn(
                           "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shadow-inner",
                           session.score > 80 ? "bg-emerald-500/10 text-emerald-400" : "bg-orange-500/10 text-orange-400"
                         )}>
                            {session.score}
                         </div>
                         <div className="ml-4">
                            <div className="text-sm font-bold text-white group-hover:text-brand-secondary transition-colors truncate max-w-[150px]">{session.position}</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                               {new Date(session.createdAt).toLocaleDateString()} • {session.type}
                            </div>
                         </div>
                         <ArrowUpRight className="ml-auto w-4 h-4 text-slate-600 group-hover:text-white transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                       <p className="text-xs text-slate-500 font-bold uppercase">No sessions found</p>
                    </div>
                  )}
               </div>
            </div>
          </div>

          {/* Activity Chart Integration */}
          <div className="glass rounded-[2rem] p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-bold">Preparation Velocity</h2>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Questions Attempted per day</p>
              </div>
              <div className="flex items-center gap-2 bg-brand-secondary/10 text-brand-secondary px-3 py-1 rounded-full text-xs font-bold">
                <TrendingUp className="w-3 h-3" />
                +12.5%
              </div>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0D111C', border: '1px solid #ffffff10', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#06B6D4" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="glass p-8 rounded-[2rem] flex flex-col items-center justify-center min-h-[400px]">
             <div className="flex items-center gap-2 mb-8 self-start">
                <div className="w-2 h-2 rounded-full bg-brand-secondary animate-pulse"></div>
                <h3 className="font-bold text-sm uppercase tracking-widest text-slate-400">Resume Health</h3>
             </div>
             
             <div className="relative flex items-center justify-center mb-8">
                <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
                   <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
                   <motion.circle 
                     initial={{ strokeDashoffset: 264 }}
                     animate={{ strokeDashoffset: 264 - (264 * (atsScore / 100)) }}
                     cx="50" cy="50" r="42" fill="none" stroke="#06B6D4" strokeWidth="8" 
                     strokeDasharray="264" strokeLinecap="round"
                   />
                </svg>
                <div className="absolute text-center">
                   <span className="text-5xl font-black block">{atsScore}</span>
                   <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">ATS Score</span>
                </div>
             </div>
             
             <div className="w-full space-y-3 mb-8">
                <div className="p-4 rounded-2xl bg-white/5 border-l-4 border-yellow-500 flex justify-between items-center">
                   <div>
                      <div className="text-xs font-black uppercase tracking-widest text-white mb-0.5">
                         {resumeAnalysis?.missingKeywords?.length || 0} Skills Missing
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                         {resumeAnalysis?.missingKeywords?.slice(0, 3).join(', ') || "No missing critical skills found."}
                      </div>
                   </div>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border-l-4 border-emerald-500">
                   <div className="text-xs font-black uppercase tracking-widest text-white mb-0.5">Achievements Found</div>
                   <div className="text-[10px] text-slate-500 font-medium italic">Impact metrics correctly identified</div>
                </div>
             </div>

             <button 
                onClick={() => navigate('/resume')}
                className="w-full py-4 glass rounded-2xl font-black text-sm hover:bg-white/10 transition-all border-white/5"
              >
                Optimize Resume
             </button>
          </div>

          <div className="glass p-8 rounded-[2rem]">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                   <Target className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="font-bold text-white">Daily Sprint</h3>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Solve for +50 XP</span>
                </div>
             </div>
             <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">Describe a complex technical challenge you solved and the impact it had.</p>
             <button 
                onClick={() => navigate('/coding')}
                className="w-full py-4 rounded-2xl accent-gradient text-white font-black text-sm hover:scale-[1.02] shadow-lg shadow-purple-500/20 transition-all"
             >
                Practice Now
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
