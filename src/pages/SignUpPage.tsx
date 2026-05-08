import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Mail, Lock, Loader2, ArrowRight, User } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';

export function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { signInWithGoogle, user, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('The registration popup was closed. Please try again.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. If you are in a preview, try opening the app in a new tab.');
      } else {
        setError(err.message || 'Failed to sign in with Google');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-dark-surface)] p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-10 md:p-12 rounded-[2.5rem] w-full max-w-md shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-2xl accent-gradient flex items-center justify-center font-black text-white mx-auto mb-4 text-xl shadow-lg shadow-purple-500/20">
            AI
          </div>
          <h1 className="text-3xl font-black mb-2 tracking-tight">Create Account</h1>
          <p className="text-slate-500 font-medium">Join 50k+ candidates building their future.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold p-4 rounded-xl mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4 mb-8">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all font-medium"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-2xl accent-gradient text-white font-black text-sm hover:scale-[1.02] shadow-xl shadow-purple-500/20 transition-all flex items-center justify-center gap-2 group"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                Create Account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="relative flex items-center justify-center py-4 mb-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
          <span className="relative bg-[#161B2B] px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Or sign up with</span>
        </div>

        <button 
          onClick={handleGoogleLogin}
          type="button"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 glass py-4 rounded-2xl font-bold hover:bg-white/10 transition-all border-white/10"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          Google Account
        </button>

        <div className="mt-10 text-center text-sm font-medium text-slate-500">
          Already have an account? <Link to="/login" className="text-brand-secondary font-black hover:text-white transition-colors">Sign in</Link>
        </div>
      </motion.div>
    </div>
  );
}
