import React, { useState } from 'react';
import { api } from '../api';
import { User, Role } from '../types';
import { Shield, Sparkles, UserCheck, Lock, Mail, ChevronRight, UserPlus, LogIn } from 'lucide-react';

interface LoginProps {
  onAuthSuccess: (user: User) => void;
}

export default function Login({ onAuthSuccess }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('Member');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        if (!email || !password) {
          throw new Error('Please enter both your email and password');
        }
        const data = await api.login(email, password);
        onAuthSuccess(data.user);
      } else {
        if (!name || !email || !password) {
          throw new Error('Please fill in all registration fields');
        }
        const data = await api.register(name, email, password, role);
        onAuthSuccess(data.user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setError(null);
    setLoading(true);
    try {
      const data = await api.login(demoEmail, 'password123');
      onAuthSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-radial from-slate-900 to-slate-950 px-4 py-12 font-sans text-slate-100">
      <div className="w-full max-w-md">
        
        {/* Core Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400 mb-4 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-indigo-200 to-slate-100 bg-clip-text text-transparent">
            Team Task Manager
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Secure collaborative platform with role-based access
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 p-8 shadow-2xl transition-all">
          
          {/* Tab Switcher */}
          <div className="flex bg-slate-950/85 p-1 rounded-xl mb-6 border border-slate-800/40">
            <button
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                isLogin 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                !isLogin 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Create Account
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-xs text-rose-300 mb-6 flex items-start gap-2.5">
              <span className="shrink-0 w-2 h-2 rounded-full bg-rose-500 mt-1" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 pl-0.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-slate-950 border border-slate-800/80 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 pl-0.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-950 border border-slate-800/80 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 pl-0.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800/80 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 pl-0.5">
                  Assigned Team Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('Member')}
                    className={`flex items-center justify-center gap-2.5 py-3 rounded-xl border text-sm font-medium transition-all ${
                      role === 'Member'
                        ? 'bg-slate-800/40 border-indigo-500/80 text-indigo-300 ring-2 ring-indigo-500/10'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-950/60'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${role === 'Member' ? 'bg-indigo-400' : 'bg-slate-600'}`} />
                    Member
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('Admin')}
                    className={`flex items-center justify-center gap-2.5 py-3 rounded-xl border text-sm font-medium transition-all ${
                      role === 'Admin'
                        ? 'bg-slate-800/40 border-indigo-500/80 text-indigo-300 ring-2 ring-indigo-500/10'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-950/60'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${role === 'Admin' ? 'bg-indigo-400' : 'bg-slate-600'}`} />
                    Admin
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 italic">
                  * Admins can create and delete projects/tasks. Members update status trackers only.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium rounded-xl py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-4 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10"
            >
              {loading ? 'Authenticating...' : isLogin ? 'Sign In Securely' : 'Complete Signup'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Demo Quick login banner */}
        <div className="mt-6 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5 text-center">
          <div className="flex items-center justify-center gap-2 text-indigo-400 text-xs font-semibold mb-3">
            <Sparkles className="w-4 h-4" />
            <span>QUICK ACCESS DEMO ACCOUNTS</span>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <button
              disabled={loading}
              onClick={() => handleQuickLogin('alice@example.com')}
              className="flex flex-col items-center p-3 bg-slate-950/60 hover:bg-slate-950/90 border border-slate-800/80 hover:border-slate-700 rounded-xl transition-all cursor-pointer text-left"
            >
              <span className="text-xs font-bold text-slate-200">Alice (Admin)</span>
              <span className="text-[10px] text-slate-500 mt-0.5">alice@example.com</span>
            </button>
            <button
              disabled={loading}
              onClick={() => handleQuickLogin('charlie@example.com')}
              className="flex flex-col items-center p-3 bg-slate-950/60 hover:bg-slate-950/90 border border-slate-800/80 hover:border-slate-700 rounded-xl transition-all cursor-pointer text-left"
            >
              <span className="text-xs font-bold text-slate-200">Charlie (Member)</span>
              <span className="text-[10px] text-slate-500 mt-0.5">charlie@example.com</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-500 mt-2.5">
            Default password for all accounts is <code className="text-slate-400 bg-slate-950 px-1 py-0.5 rounded">password123</code>
          </p>
        </div>

      </div>
    </div>
  );
}
