import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  Code2, 
  BrainCircuit, 
  LineChart, 
  Settings, 
  ShieldCheck,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: MessageSquare, label: 'AI Interview', path: '/interview' },
  { icon: FileText, label: 'Resume Analyzer', path: '/resume' },
  { icon: Code2, label: 'Coding Practice', path: '/coding' },
  { icon: BrainCircuit, label: 'AI Mentor', path: '/mentor' },
  { icon: LineChart, label: 'Analytics', path: '/analytics' },
];

const secondaryItems = [
  { icon: Settings, label: 'Settings', path: '/settings' },
  { icon: ShieldCheck, label: 'Admin', path: '/admin' },
];

export function Sidebar() {
  const { signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <aside className="w-64 border-r border-white/5 bg-[var(--color-dark-sidebar)] flex flex-col h-screen fixed left-0 top-0 z-50 p-6 space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg accent-gradient flex items-center justify-center font-bold text-white shadow-lg">
          AI
        </div>
        <span className="text-xl font-bold tracking-tight text-white">AI Interview</span>
      </div>

      <nav className="flex-1 space-y-1">
        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-2 mb-4">
          Main Menu
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-slate-400 hover:text-white hover:bg-white/5",
              isActive && "bg-white/5 text-brand-secondary font-medium shadow-[0_0_20px_rgba(6,182,212,0.1)]"
            )}
          >
            <item.icon className={cn("w-5 h-5", item.path.includes('/dashboard') && "text-brand-secondary")} />
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}

        <div className="pt-8 text-[10px] uppercase tracking-widest text-slate-500 font-bold px-2 mb-4">
          System
        </div>
        
        <NavLink
          to="/settings"
          className={({ isActive }) => cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-slate-400 hover:text-white",
            isActive && "bg-white/5 text-white"
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Settings</span>
        </NavLink>

        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-slate-400 hover:text-white",
              isActive && "bg-white/5 text-white"
            )}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-medium">Admin Panel</span>
          </NavLink>
        )}
      </nav>

      <div className="mt-auto p-4 glass rounded-2xl">
        <div className="text-xs text-slate-400 uppercase tracking-widest mb-2 font-bold">Current Plan</div>
        <div className="font-semibold text-white mb-1 text-sm">Pro Beta Access</div>
        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
          <div className="bg-brand-secondary h-full w-3/4 rounded-full"></div>
        </div>
        <div className="text-[10px] text-slate-500 mt-2 font-medium">18 / 25 Interviews used</div>
      </div>
      
      <div className="pt-4 border-t border-white/5">
        <button 
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>
    </aside>
  );
}
