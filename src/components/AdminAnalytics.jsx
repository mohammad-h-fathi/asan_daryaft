import React, { useState, useEffect } from 'react';
import { orderEngine } from '../services/orderEngine.js';
import { BarChart2, TrendingUp, DollarSign, ShieldCheck, Activity, Cpu, Layers } from 'lucide-react';

export const AdminAnalytics = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    setOrders(orderEngine.getOrders());
  }, []);

  const totalVolumeUsd = orders.reduce((sum, o) => sum + (o.sourceUsdValue || 0), 0);
  const totalCommissionUsd = orders.reduce((sum, o) => sum + (o.platformFeeUsd || 0), 0);
  const activeOrdersCount = orders.filter(o => o.status !== 'COMPLETED').length;
  const completedOrdersCount = orders.filter(o => o.status === 'COMPLETED').length;

  return (
    <div className="w-full max-w-5xl mx-auto py-6 space-y-5">
      
      {/* Header */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
          <BarChart2 className="w-5 h-5 text-emerald-400" />
          <span>داشبورد درآمد کارمزد و آمار سیستم پلتفرم</span>
        </h2>
        <p className="text-xs text-slate-400">گزارش لحظه‌ای از حجم کل تراکنش‌های پردازش‌شده، سود کارمزد پویا و سلامت استخرهای واسط Z</p>
      </div>

      {/* Grid Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Volume */}
        <div className="glass-card p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">حجم کل پاکسازی‌کننده</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-tight">
            ${totalVolumeUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-emerald-400 font-semibold">مجموع واریزی‌های آن‌چین</p>
        </div>

        {/* Platform Revenue */}
        <div className="glass-card p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">سود حاصل از کارمزد پویا</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono tracking-tight">
            ${totalCommissionUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-amber-300 font-semibold">درآمد خالص پلتفرم میلوش</p>
        </div>

        {/* Active Orders */}
        <div className="glass-card p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">سفارشات فعال در صف</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-300 font-mono tracking-tight">
            {activeOrdersCount}
          </div>
          <p className="text-[11px] text-purple-400 font-semibold">در حال تبادل DEX یا تاخیر حریم خصوصی</p>
        </div>

        {/* Completed */}
        <div className="glass-card p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">تراکنش‌های تکمیل شده</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400 font-mono tracking-tight">
            {completedOrdersCount}
          </div>
          <p className="text-[11px] text-cyan-400 font-semibold">واریز موفق به Wallet B</p>
        </div>

      </div>

      {/* Dynamic Fee Tiers Breakdown */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span>سطوح کارمزد پویا (Dynamic Commission Tiers)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-white/10 space-y-1">
            <span className="badge-pill badge-cyan text-xs">سطح ۱: تراکنش خرد</span>
            <h4 className="text-base font-bold text-white mt-1">۱.۰٪ کارمزد</h4>
            <p className="text-slate-400">برای واریزی‌های کمتر از ۵۰۰ دلار</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 space-y-1">
            <span className="badge-pill badge-amber text-xs">سطح ۲: تراکنش متوسط</span>
            <h4 className="text-base font-bold text-amber-300 mt-1">۰.۷۵٪ کارمزد</h4>
            <p className="text-slate-400">برای واریزی‌های ۵۰۰ تا ۵,۰۰۰ دلار</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-1">
            <span className="badge-pill badge-emerald text-xs">سطح ۳: تراکنش عمده</span>
            <h4 className="text-base font-bold text-emerald-300 mt-1">۰.۵۰٪ کارمزد</h4>
            <p className="text-slate-400">برای واریزی‌های بیش از ۵,۰۰۰ دلار</p>
          </div>
        </div>
      </div>

    </div>
  );
};
