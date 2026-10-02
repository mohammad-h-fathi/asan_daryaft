import React, { useState } from 'react';
import { ShieldCheck, User, LogOut, RefreshCw, Layers, Wallet, BarChart2 } from 'lucide-react';
import { evmService } from '../services/evmService.js';

export const Header = ({ activeTab, setActiveTab, user, onOpenAuthModal, onLogout }) => {
  const [selectedNetwork, setSelectedNetwork] = useState(evmService.supportedNetworks[0]);

  return (
    <header className="w-full border-b border-slate-800 bg-slate-950/90 sticky top-0 z-40">
      <div className="w-full max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('create')}>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-tight">
              میلوش <span className="text-emerald-400">کلین‌پِی</span>
            </h1>
            <span className="text-[10px] font-mono text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded">EVM</span>
          </div>
        </div>

        {/* Center Tabs (Visible when logged in) */}
        {user && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'create' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              ایجاد انتقال جدید
            </button>

            <button
              onClick={() => setActiveTab('tracker')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'tracker' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              پیگیری تراکنش
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'history' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              تاریخچه سفارشات
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'admin' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              آمار سیستم
            </button>
          </nav>
        )}

        {/* Right Section: Network & Auth */}
        <div className="flex items-center gap-3">
          
          <select
            value={selectedNetwork.id}
            onChange={(e) => setSelectedNetwork(evmService.supportedNetworks.find(n => n.id === e.target.value))}
            className="hidden sm:block bg-slate-900 border border-slate-800 text-xs font-semibold rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none cursor-pointer"
          >
            {evmService.supportedNetworks.map(net => (
              <option key={net.id} value={net.id} className="bg-slate-900 text-slate-200">
                {net.shortName} ({net.dex})
              </option>
            ))}
          </select>

          {user ? (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono text-slate-200">{user.email}</span>
              <button
                onClick={onLogout}
                className="text-slate-400 hover:text-red-400 mr-1 transition-colors"
                title="خروج از حساب"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md shadow-emerald-500/10 flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>ورود / ثبت‌نام</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
