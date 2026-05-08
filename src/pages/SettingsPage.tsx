import React, { useState } from 'react';
import { 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Smartphone,
  Globe,
  Palette,
  Check,
  Camera,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export function SettingsPage() {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaved, setIsSaved] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'security', label: 'Privacy', icon: Shield },
  ];

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-4xl font-black mb-2 flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400">
              <SettingsIcon className="w-6 h-6" />
           </div>
           Account Settings
        </h1>
        <p className="text-slate-400 font-medium">Personalize your AI Interview experience and managed connected platforms.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
         {/* Navigation */}
         <div className="lg:col-span-1 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${
                  activeTab === tab.id 
                  ? 'bg-white text-black shadow-xl scale-[1.02]' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}

            <div className="pt-6 border-t border-white/5 mt-4">
               <button
                 type="button"
                 onClick={handleSignOut}
                 className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-bold text-sm text-red-400 hover:bg-red-500/10"
               >
                 <LogOut className="w-4 h-4" />
                 Log Out
               </button>
            </div>
         </div>

         {/* Content */}
         <div className="lg:col-span-3">
            <div className="glass rounded-[2.5rem] p-12">
               {activeTab === 'profile' && (
                 <motion.div 
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="space-y-10"
                 >
                    <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
                       <div className="relative group cursor-pointer text-center md:text-left">
                          <div className="w-32 h-32 rounded-[2.5rem] bg-purple-500/10 flex items-center justify-center text-purple-400 overflow-hidden shadow-inner border-2 border-white/10 group-hover:border-purple-500/50 transition-all">
                             {user?.photoURL ? (
                               <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                             ) : (
                               <span className="text-4xl font-black uppercase">{user?.email?.[0] || '?'}</span>
                             )}
                          </div>
                          <div className="absolute -bottom-2 -right-2 p-3 bg-white text-black rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                             <Camera className="w-4 h-4" />
                          </div>
                       </div>
                       
                       <div className="flex-1 space-y-6 w-full text-center md:text-left">
                          <div>
                             <h3 className="text-2xl font-black text-white">{profile?.displayName || 'Candidate'}</h3>
                             <p className="text-slate-400 font-medium text-sm">{user?.email}</p>
                          </div>
                          <div className="flex flex-wrap justify-center md:justify-start gap-4">
                             <span className="px-3 py-1 rounded-lg bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest border border-green-500/20">
                               Verified Account
                             </span>
                             <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                               profile?.role === 'ADMIN' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                             }`}>
                               System {profile?.role}
                             </span>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Full Name</label>
                          <input 
                            type="text" 
                            defaultValue={profile?.displayName || ''}
                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Display Role</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Senior Frontend Engineer"
                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
                          />
                       </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex justify-end">
                       <button 
                         onClick={handleSave}
                         className="px-10 py-4 bg-white text-black rounded-2xl font-black text-sm flex items-center gap-2 hover:scale-[1.02] shadow-xl transition-all"
                       >
                          {isSaved ? <><Check className="w-4 h-4" /> Changes Saved</> : 'Update Profile'}
                       </button>
                    </div>
                 </motion.div>
               )}

               {activeTab === 'preferences' && (
                 <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                    <h3 className="text-xl font-black mb-6">User Interface</h3>
                    <div className="space-y-6">
                       <div className="flex items-center justify-between p-6 glass rounded-2xl">
                          <div className="flex items-center gap-4">
                             <Globe className="w-5 h-5 text-brand-secondary" />
                             <div>
                                <div className="text-sm font-bold">Automatic Dark Mode</div>
                                <div className="text-xs text-slate-500 font-medium">Transition UI based on your local system time.</div>
                             </div>
                          </div>
                          <div className="w-12 h-6 bg-brand-secondary rounded-full relative cursor-pointer shadow-inner">
                             <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full"></div>
                          </div>
                       </div>

                        <div className="flex items-center justify-between p-6 glass rounded-2xl">
                          <div className="flex items-center gap-4">
                             <Smartphone className="w-5 h-5 text-purple-400" />
                             <div>
                                <div className="text-sm font-bold">AI Sound Effects</div>
                                <div className="text-xs text-slate-500 font-medium">Haptic-like audio feedback for navigation.</div>
                             </div>
                          </div>
                          <div className="w-12 h-6 bg-white/10 rounded-full relative cursor-pointer shadow-inner">
                             <div className="absolute top-1 left-1 w-4 h-4 bg-slate-500 rounded-full"></div>
                          </div>
                       </div>
                    </div>
                 </motion.div>
               )}

               {activeTab !== 'profile' && activeTab !== 'preferences' && (
                 <div className="text-center py-20">
                    <div className="text-slate-500 text-sm font-medium mb-2">Module Offline</div>
                    <div className="text-xs text-slate-600 uppercase tracking-widest font-black">Coming to v2.4 Beta</div>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
