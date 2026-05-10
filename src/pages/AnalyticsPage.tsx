import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  Award,
  Zap,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Search,
  Calendar,
  Loader2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';

const interviewData = [
  { name: 'Jan', technical: 65, behavioral: 45, hr: 80 },
  { name: 'Feb', technical: 75, behavioral: 55, hr: 85 },
  { name: 'Mar', technical: 70, behavioral: 65, hr: 82 },
  { name: 'Apr', technical: 85, behavioral: 75, hr: 90 },
  { name: 'May', technical: 82, behavioral: 80, hr: 88 },
  { name: 'Jun', technical: 92, behavioral: 85, hr: 95 },
];

const categoryData = [
  { name: 'Technical', value: 45, color: '#8b5cf6' },
  { name: 'Clarity', value: 30, color: '#06b6d4' },
  { name: 'Impact', value: 25, color: '#10b981' },
];

const skillProgress = [
  { skill: 'Communication', score: 85, trend: '+12%' },
  { skill: 'Problem Solving', score: 92, trend: '+5%' },
  { skill: 'System Design', score: 78, trend: '+20%' },
  { skill: 'Leadership', score: 65, trend: '+8%' },
];

export function AnalyticsPage() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const [intv, anls] = await Promise.all([
          dataService.getInterviews(user.uid),
          dataService.getResumeAnalyses(user.uid)
        ]);
        setInterviews(intv);
        setAnalyses(anls);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  // Derived stats
  const avgScore = interviews.length > 0 
    ? Math.round(interviews.reduce((acc, curr) => acc + curr.score, 0) / interviews.length) 
    : 0;
  
  const latestAnalysis = analyses[0]?.analysis;
  const atsScore = latestAnalysis?.atsScore || 0;

  const chartData = interviews.slice(0, 6).reverse().map(i => ({
    name: new Date(i.createdAt).toLocaleDateString(undefined, { month: 'short' }),
    score: i.score,
    technical: i.type === 'Technical' ? i.score : 0,
    behavioral: i.type === 'Behavioral' ? i.score : 0
  }));

  if (loading) {
     return (
       <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
         <div className="text-center">
           <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
           <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Aggregating Insights...</p>
         </div>
       </div>
     );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2 flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <BarChart3 className="w-6 h-6" />
             </div>
             Performance Intelligence
          </h1>
          <p className="text-slate-400 font-medium">Data-driven insights into your growth, interview readiness, and skill gaps.</p>
        </div>

        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
           <Calendar className="w-4 h-4 text-slate-500" />
           <span className="text-xs font-black uppercase tracking-widest text-slate-400">Last 6 Months</span>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Avg score', value: `${avgScore}%`, trend: '+4.2%', icon: TrendingUp, color: 'text-green-400' },
           { label: 'Interviews', value: interviews.length.toString(), trend: 'Total', icon: Users, color: 'text-purple-400' },
           { label: 'Readiness', value: `${atsScore}/100`, trend: 'High', icon: Target, iconColor: 'text-cyan-400' },
           { label: 'Milestones', value: (interviews.length > 0 ? 3 : 0).toString(), trend: 'Reached', icon: Award, color: 'text-yellow-400' }
         ].map((stat, i) => (
           <motion.div 
             key={i}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             className="glass p-8 rounded-[2rem] flex flex-col justify-between"
           >
              <div className="flex items-center justify-between mb-6">
                 <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                    <stat.icon className="w-5 h-5" />
                 </div>
                 <div className={`text-[10px] font-black uppercase tracking-widest ${stat.color || 'text-slate-500'}`}>{stat.trend}</div>
              </div>
              <div>
                 <div className="text-3xl font-black mb-1">{stat.value}</div>
                 <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
              </div>
           </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Main Chart */}
         <div className="lg:col-span-2 glass p-10 rounded-[2.5rem] relative overflow-hidden">
            <div className="flex items-center justify-between mb-10">
               <div>
                  <h3 className="text-xl font-black">Performance Trends</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Growth trajectories across different interview formats.</p>
               </div>
               <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                     <span className="text-[10px] font-black text-slate-500 uppercase">Technical</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                     <span className="text-[10px] font-black text-slate-500 uppercase">Behavioral</span>
                  </div>
               </div>
            </div>

            <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                     <defs>
                        <linearGradient id="colorTechnical" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorBehavioral" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                     <XAxis 
                        dataKey="name" 
                        stroke="#475569" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fontWeight: 800 }}
                     />
                     <YAxis 
                        stroke="#475569" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fontWeight: 800 }}
                     />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}
                     />
                     <Area 
                        type="monotone" 
                        dataKey="technical" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorTechnical)" 
                     />
                     <Area 
                        type="monotone" 
                        dataKey="behavioral" 
                        stroke="#06b6d4" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorBehavioral)" 
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Pie Chart / Skill Map */}
         <div className="glass p-10 rounded-[2.5rem]">
            <h3 className="text-xl font-black mb-2">Category Distribution</h3>
            <p className="text-xs text-slate-500 font-medium mb-10 text-center">Breakdown of evaluation focus points.</p>
            
            <div className="h-64 w-full flex items-center justify-center">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                     >
                        {categoryData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Pie>
                     <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute flex flex-col items-center">
                  <div className="text-xs font-black text-slate-500 uppercase">Score</div>
                  <div className="text-3xl font-black">{atsScore}</div>
               </div>
            </div>

            <div className="space-y-4 mt-8">
               {categoryData.map((cat, i) => (
                 <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
                       <span className="text-xs font-bold text-slate-300">{cat.name}</span>
                    </div>
                    <span className="text-xs font-black text-slate-500">{cat.value}%</span>
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* Skill Strengths */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="glass p-10 rounded-[2.5rem]">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3">
               <Zap className="w-5 h-5 text-yellow-400" />
               Skill Progression
            </h3>
            <div className="space-y-8">
               {skillProgress.map((item, i) => (
                 <div key={i} className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
                       <span className="text-slate-400">{item.skill}</span>
                       <div className="flex items-center gap-3">
                          <span className="text-white">{item.score}%</span>
                          <span className="text-green-400 text-[10px]">{item.trend}</span>
                       </div>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         whileInView={{ width: `${item.score}%` }}
                         className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                       ></motion.div>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="glass p-10 rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:scale-[1.6] group-hover:rotate-6 transition-transform duration-700">
               <Award className="w-48 h-48 text-cyan-400" />
            </div>
            
            <h3 className="text-xl font-black mb-2">Diagnostic Summary</h3>
            <p className="text-xs text-slate-500 font-medium mb-8">AI-generated overview of your current professional profile.</p>
            
            <div className="space-y-6 relative z-10">
               <div className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                  <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-2">Core Advantage</div>
                  <p className="text-sm text-slate-200 font-medium leading-relaxed italic">
                    {latestAnalysis?.feedback || "Start by uploading your resume for a diagnostic report."}
                  </p>
               </div>

               <div className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                  <div className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-2">Growth Vector</div>
                  <p className="text-sm text-slate-200 font-medium leading-relaxed italic">
                    {latestAnalysis?.improvements?.[0] || "Practice mock interviews to identify your strengths and weaknesses."}
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
