import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  UserCheck, 
  Search, 
  MoreVertical,
  Mail,
  Activity,
  AlertCircle
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { motion } from 'motion/react';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: number;
}

export function AdminPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const userList = await dataService.getAllUsers();
      setUsers(userList);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      await dataService.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.uid === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2 flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 shadow-inner">
                <Shield className="w-6 h-6" />
             </div>
             Security & Admin
          </h1>
          <p className="text-slate-400 font-medium">Manage user access, system roles, and platform health.</p>
        </div>

        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5">
           <Activity className="w-4 h-4 text-green-400 ml-2" />
           <div className="text-xs font-black uppercase tracking-widest text-slate-400 mr-4">System Online</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="lg:col-span-1 space-y-6">
            <div className="glass p-8 rounded-[2rem]">
               <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6">Overview</h3>
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <span className="text-slate-400 text-sm font-medium">Total Users</span>
                     <span className="text-white font-black">{users.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-slate-400 text-sm font-medium">Admins</span>
                     <span className="text-white font-black">{users.filter(u => u.role === 'ADMIN').length}</span>
                  </div>
                   <div className="flex items-center justify-between text-brand-secondary">
                     <span className="font-medium text-sm">Active Now</span>
                     <span className="font-black">4</span>
                  </div>
               </div>
            </div>

            <div className="glass p-8 rounded-[2rem] border-l-4 border-yellow-500/50">
               <div className="flex items-center gap-3 mb-4 text-yellow-500">
                  <AlertCircle className="w-5 h-5" />
                  <h3 className="font-bold">System Load</h3>
               </div>
               <p className="text-[10px] text-slate-500 leading-relaxed font-medium">API endpoint latency is currently elevated by 12% in the US-East region.</p>
            </div>
         </div>

         <div className="lg:col-span-3 space-y-6">
            <div className="glass rounded-[2rem] overflow-hidden">
               <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
                  <div className="relative flex-1 max-w-md">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                     <input 
                       type="text" 
                       placeholder="Search users by name or email..."
                       className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all font-medium"
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                     />
                  </div>
                  <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black font-black text-xs hover:scale-105 transition-all">
                     Export Data
                  </button>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="text-[10px] uppercase tracking-widest text-slate-500 font-black border-b border-white/5">
                           <th className="px-8 py-6">User</th>
                           <th className="px-8 py-6">Role</th>
                           <th className="px-8 py-6">Joined</th>
                           <th className="px-8 py-6 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {loading ? (
                          <tr><td colSpan={4} className="p-12 text-center text-slate-500">Searching global user directory...</td></tr>
                        ) : filteredUsers.map((user) => (
                          <tr key={user.uid} className="hover:bg-white/[0.02] transition-colors group">
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 font-black uppercase shadow-inner">
                                      {user.displayName?.[0] || user.email?.[0] || '?'}
                                   </div>
                                   <div>
                                      <div className="text-sm font-bold text-white">{user.displayName || 'Anonymous'}</div>
                                      <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                         <Mail className="w-3 h-3" /> {user.email}
                                      </div>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-6">
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                  user.role === 'ADMIN' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                                }`}>
                                   {user.role}
                                </span>
                             </td>
                             <td className="px-8 py-6">
                                <div className="text-sm text-slate-400 font-medium">
                                   {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Dec 2023'}
                                </div>
                             </td>
                             <td className="px-8 py-6 text-right">
                                <button 
                                  onClick={() => toggleRole(user.uid, user.role)}
                                  className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-white"
                                >
                                   <UserCheck className="w-5 h-5" />
                                </button>
                             </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
