import React from 'react';
import { 
  Search, 
  Bell, 
  UserCircle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Topbar() {
  const { user } = useAuth();

  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="h-16 border-b border-white/5 bg-[var(--color-dark-sidebar)]/50 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
      <h1 className="text-lg font-semibold text-slate-200">Dashboard Overview</h1>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 glass px-3 py-1.5 rounded-full border-white/5">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-xs font-medium text-slate-300">AI Coach Online</span>
        </div>

        <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full border-2 border-[var(--color-dark-surface)]"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-white/10">
          <div className="text-right flex flex-col">
            <span className="text-sm font-semibold text-white">{user?.displayName || 'User'}</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Pro Member</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-500 p-[1px] shadow-lg">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold overflow-hidden">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                getInitials(user?.displayName || null)
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
