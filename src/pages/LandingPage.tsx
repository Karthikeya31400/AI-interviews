import React from 'react';
import { 
  ArrowRight, 
  BrainCircuit, 
  CheckCircle2, 
  Cpu, 
  History, 
  Layout, 
  LineChart, 
  Users,
  Zap,
  MessageSquare,
  FileText,
  Code2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export function LandingPage() {
  const [showDemo, setShowDemo] = React.useState(false);

  return (
    <div className="bg-[var(--color-dark-surface)] min-h-screen overflow-x-hidden scroll-smooth">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass py-4 px-8 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg accent-gradient flex items-center justify-center font-bold text-white shadow-lg">AI</div>
          <span className="font-display font-bold text-2xl tracking-tight">AI Interview</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Login</Link>
          <Link to="/signup" className="accent-gradient text-white px-8 py-2.5 rounded-xl text-sm font-black transition-all shadow-xl hover:scale-105 active:scale-95">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-8 flex flex-col items-center text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-purple-500/10 via-cyan-500/5 to-transparent blur-3xl -z-10 opacity-50 pointer-events-none"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-brand-secondary mb-8"
        >
          <Zap className="w-4 h-4 fill-current" />
          Powered by Gemini 3.1 Pro
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-display font-black leading-[0.85] tracking-tighter mb-8"
        >
          PRACTICE <span className="gradient-text">SMARTER</span>.<br />
          CRACK INTERVIEWS.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 font-medium"
        >
          Master your dream job interview with AI-powered mock simulations, real-time feedback, and personalized career roadmaps.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col md:flex-row items-center gap-4"
        >
          <Link to="/signup" className="group bg-white text-black px-12 py-5 rounded-2xl font-black flex items-center gap-3 hover:scale-105 transition-all shadow-2xl">
            Start Free Practice
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button 
            onClick={() => setShowDemo(true)}
            className="px-12 py-5 rounded-2xl font-black border border-white/10 hover:bg-white/5 transition-all"
          >
            Watch Demo
          </button>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 40 }}
          viewport={{ once: true }}
          className="mt-20 w-full max-w-5xl rounded-2xl overflow-hidden border border-white/10 shadow-2xl glass p-2"
        >
          <div className="bg-slate-900 rounded-xl overflow-hidden aspect-video relative group cursor-pointer" onClick={() => setShowDemo(true)}>
             <img 
               src="https://picsum.photos/seed/interface/1200/800?dark" 
               alt="AI Interview Dashboard" 
               className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
               referrerPolicy="no-referrer"
             />
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="p-8 text-center">
                   <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <ArrowRight className="w-10 h-10 text-white" />
                   </div>
                   <div className="text-4xl font-bold mb-4">Interactive AI Cockpit</div>
                   <p className="text-slate-400">Experience the world's most advanced interview simulator.</p>
                </div>
             </div>
          </div>
        </motion.div>
      </section>

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/90 backdrop-blur-xl">
           <div className="relative w-full max-w-5xl aspect-video glass rounded-3xl overflow-hidden shadow-2xl">
              <button 
                onClick={() => setShowDemo(false)}
                className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                ✕
              </button>
              <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                 <div className="text-center">
                    <BrainCircuit className="w-24 h-24 text-purple-400 mx-auto mb-8 animate-pulse" />
                    <h2 className="text-3xl font-black mb-4">AI Interview Simulation Demo</h2>
                    <p className="text-slate-400 max-w-md mx-auto">This would be a high-fidelity video showcasing the platform's features in action.</p>
                    <button 
                      onClick={() => setShowDemo(false)}
                      className="mt-8 px-8 py-3 rounded-xl accent-gradient font-black"
                    >
                      Close Preview
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Stats */}
      <section className="py-20 px-8 border-y border-white/5 bg-slate-900/30">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Successful Placements', val: '50k+' },
            { label: 'AI Interviews Conducted', val: '1.2M' },
            { label: 'Skills Improved', val: '85%' },
            { label: 'Rating on ProductHunt', val: '4.9/5' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl font-display font-black text-white mb-2">{stat.val}</div>
              <div className="text-xs uppercase tracking-widest font-bold text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-center">
            <h2 className="text-4xl md:text-5xl font-black mb-6">ALL YOU NEED TO <span className="text-purple-400">GET HIRED.</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Our comprehensive suite of AI tools covers the entire preparation lifecycle.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: MessageSquare,
                title: 'Mock Interviews',
                desc: 'Realistic chat and voice simulations across HR, Tech, and Behavioral rounds.',
                color: 'text-purple-400'
              },
              {
                icon: FileText,
                title: 'Resume Optimizer',
                desc: 'Upload your resume and get instant ATS scores and improvement suggestions.',
                color: 'text-cyan-400'
              },
              {
                icon: Code2,
                title: 'Coding Sprints',
                desc: 'Solve DSA challenges in a professional IDE with real-time AI hints.',
                color: 'text-green-400'
              },
              {
                icon: BrainCircuit,
                title: 'AI Career Mentor',
                desc: 'Get 24/7 guidance on career paths, salary negotiation, and learning.',
                color: 'text-orange-400'
              },
              {
                icon: LineChart,
                title: 'Skill Analytics',
                desc: 'Track your growth with detailed competency maps and progress charts.',
                color: 'text-pink-400'
              },
              {
                icon: History,
                title: 'Session Replays',
                desc: 'Analyze your previous attempts to perfect your communication style.',
                color: 'text-blue-400'
              }
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-[2rem] glass group border-transparent hover:border-white/10 transition-all">
                <div className={cn("w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", f.color)}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-4">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-32 px-8 bg-slate-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-12 leading-tight">YOUR JOURNEY TO THE <span className="gradient-text">NEXT LEVEL</span>.</h2>
              <div className="space-y-12">
                {[
                  { step: '01', title: 'Upload & Analyze', desc: 'Sync your resume or LinkedIn profile. Our AI identifies skill gaps and performance targets based on your dream roles.' },
                  { step: '02', title: 'Targeted Practice', desc: 'Engage in conversational AI interviews tailored to specific companies like Google, Meta, or Stripe.' },
                  { step: '03', title: 'Real-time Alpha', desc: 'Get instant feedback on your answers, body language (via camera), and technical accuracy.' }
                ].map((step, i) => (
                  <div key={i} className="flex gap-8 group">
                    <div className="text-4xl font-black text-white/10 group-hover:text-brand-secondary transition-colors transition-duration-500">{step.step}</div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-2 glass rounded-[2.5rem] relative">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
               <img 
                 src="https://picsum.photos/seed/process/800/800" 
                 alt="Process visualization" 
                 className="rounded-[2rem] w-full"
                 referrerPolicy="no-referrer"
               />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6">TRANSPARENT <span className="text-cyan-400">PRICING</span>.</h2>
            <p className="text-slate-400">Scale your preparation according to your needs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                plan: 'Free Starter', 
                price: '$0', 
                desc: 'Perfect for exploring the platform.',
                features: ['3 AI Mock Interviews', 'Basic Resume Score', 'Community Support', 'Web Access Only'],
                cta: 'Get Started',
                active: false
              },
              { 
                plan: 'Pro Alpha', 
                price: '$29', 
                desc: 'Everything you need to crack FAANG.',
                features: ['Unlimited Interviews', 'AI Detailed Feedback', 'Resume Rewrite AI', 'Custom Career Roadmap'],
                cta: 'Start Pro Free Trial',
                active: true
              },
              { 
                plan: 'Enterprise', 
                price: 'Custom', 
                desc: 'For universities and placement cells.',
                features: ['Placements Dashboard', 'LMS Integration', 'Custom Branding', 'Priority API Access'],
                cta: 'Contact Sales',
                active: false
              }
            ].map((p, i) => (
              <div key={i} className={cn(
                "p-10 rounded-[2.5rem] flex flex-col relative overflow-hidden",
                p.active ? "accent-gradient text-white shadow-2xl scale-105 z-10" : "glass border-white/5"
              )}>
                {p.active && <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase">Most Popular</div>}
                <div className="text-xs font-black uppercase tracking-widest mb-2 opacity-60 text-current">{p.plan}</div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black">{p.price}</span>
                  {p.price !== 'Custom' && <span className="text-sm opacity-60">/mo</span>}
                </div>
                <p className={cn("text-xs mb-8 opacity-80", p.active ? "text-white" : "text-slate-400")}>{p.desc}</p>
                
                <div className="space-y-4 mb-10 flex-1">
                  {p.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className={cn("w-4 h-4", p.active ? "text-white" : "text-brand-secondary")} />
                      <span className="font-medium opacity-90">{f}</span>
                    </div>
                  ))}
                </div>

                <Link 
                  to="/signup" 
                  className={cn(
                    "w-full py-4 rounded-2xl font-black text-sm text-center transition-all",
                    p.active ? "bg-white text-purple-600 shadow-xl" : "border border-white/10 hover:bg-white/5"
                  )}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-8">
        <div className="max-w-5xl mx-auto glass rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/20 blur-3xl -z-10"></div>
          
          <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">READY TO <span className="gradient-text">CRACK</span> YOUR NEXT INTERVIEW?</h2>
          <p className="text-slate-300 text-lg mb-12 max-w-xl mx-auto font-medium">Join 50,000+ candidates who have landed their dream roles using our platform.</p>
          
          <Link to="/signup" className="inline-flex bg-white text-black px-12 py-5 rounded-2xl font-black text-lg shadow-2xl hover:scale-105 transition-all">
            Get Started Now - It's Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <div className="w-8 h-8 rounded-lg accent-gradient flex items-center justify-center font-bold text-white text-xs">AI</div>
            <span className="font-display font-bold">AI Interview</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500 font-medium">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <div className="text-slate-600 text-xs font-bold uppercase tracking-widest">
            © 2026 AI-INT. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </div>
  );
}
