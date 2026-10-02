import React, { useState, useEffect } from 'react';
import { orderEngine, ORDER_STATES } from '../services/orderEngine.js';
import { evmService } from '../services/evmService.js';
import { Search, Wallet, ArrowRight, ArrowLeft } from 'lucide-react';

export const TransactionHistory = ({ onSelectOrder, onNewOrderClick }) => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    setOrders(orderEngine.getOrders());
  }, []);

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.destinationWalletB.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.walletX.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-full max-w-5xl mx-auto py-6 space-y-5">
      
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <span>تاریخچه سفارشات پاکسازی</span>
          </h2>
          <p className="text-xs text-slate-400">فهرست تمامی سفارشات پویا و کیف پول‌های ثابت کاربر</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو با شناسه سفارش یا آدرس B..."
              className="glass-input text-xs pl-8 py-2 w-48 sm:w-64 rounded-xl"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-white/10 text-xs font-semibold rounded-xl px-3 py-2 text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL">همه وضعیت‌ها</option>
            <option value="WAITING_DEPOSIT">منتظر واریز</option>
            <option value="COMPLETED">تکمیل شده</option>
          </select>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="glass-card overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3 text-xs">
            <p className="text-sm font-semibold">هیچ سفارشی مطابق با جستجوی شما یافت نشد.</p>
            <button onClick={onNewOrderClick} className="btn-emerald text-xs py-2 px-4">
              ثبت اولین سفارش پاکسازی
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 border-b border-white/10 text-slate-400 font-semibold uppercase">
                <tr>
                  <th className="p-4">شناسه سفارش</th>
                  <th className="p-4">حالت</th>
                  <th className="p-4">ارز و مقدار</th>
                  <th className="p-4">آدرس موقت Wallet X</th>
                  <th className="p-4">آدرس مقصد Wallet B</th>
                  <th className="p-4">کارمزد پلتفرم</th>
                  <th className="p-4">وضعیت</th>
                  <th className="p-4 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {filteredOrders.map(order => (
                  <tr key={order.orderId} className="hover:bg-white/[0.03] transition-colors">
                    
                    <td className="p-4 font-mono font-bold text-white">
                      {order.orderId}
                    </td>

                    <td className="p-4">
                      <span className={`badge-pill ${order.mode === 'STATIC' ? 'badge-purple' : 'badge-cyan'}`}>
                        {order.mode === 'STATIC' ? 'ثابت دائمی' : 'پویا تک‌بار'}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-emerald-400 font-mono">
                        {order.sourceAmount} {order.sourceAssetId} ➔ {order.estimatedOutput?.toFixed(2)} {order.targetAssetId}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        ${order.sourceUsdValue?.toFixed(2)} USD
                      </div>
                    </td>

                    <td className="p-4 font-mono text-slate-300">
                      {evmService.truncateAddress(order.walletX)}
                    </td>

                    <td className="p-4 font-mono text-cyan-400">
                      {evmService.truncateAddress(order.destinationWalletB)}
                    </td>

                    <td className="p-4 font-mono text-amber-400">
                      ${order.platformFeeUsd?.toFixed(2)} ({order.feeTier?.tierBadge})
                    </td>

                    <td className="p-4">
                      <span className={`badge-pill badge-${order.status === 'COMPLETED' ? 'emerald' : 'amber'}`}>
                        {ORDER_STATES[order.status]?.labelFa || order.status}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() => onSelectOrder(order)}
                        className="btn-glass text-xs py-1.5 px-3"
                      >
                        <span>پیگیری</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
