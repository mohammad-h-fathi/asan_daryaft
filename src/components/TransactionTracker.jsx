import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Clock, Copy, QrCode, ExternalLink, ArrowRight, ShieldCheck, 
  Layers, PlayCircle, Sparkles
} from 'lucide-react';
import { orderEngine, ORDER_STATES } from '../services/orderEngine.js';
import { evmService } from '../services/evmService.js';
import { QRCodeSVG } from 'qrcode.react';

export const TransactionTracker = ({ activeOrder, onNewOrderClick }) => {
  const [currentOrder, setCurrentOrder] = useState(activeOrder);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [countdown, setCountdown] = useState(12);

  useEffect(() => {
    setCurrentOrder(activeOrder);
  }, [activeOrder]);

  useEffect(() => {
    let timer;
    if (currentOrder && currentOrder.status === ORDER_STATES.PRIVACY_DELAY.id) {
      setCountdown(12);
      timer = setInterval(() => {
        setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentOrder?.status]);

  if (!currentOrder) {
    return (
      <div className="w-full max-w-2xl mx-auto py-12 text-center">
        <div className="glass-card p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-slate-400 mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">سفارش فعالی جهت پیگیری انتخاب نشده است</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            برای مشاهده مراحل پاکسازی و واریزی، لطفاً یک سفارش جدید ثبت کنید.
          </p>
          <button onClick={onNewOrderClick} className="btn-emerald text-xs mt-2 py-2.5 px-5">
            <Sparkles className="w-4 h-4" />
            <span>ثبت سفارش جدید</span>
          </button>
        </div>
      </div>
    );
  }

  const handleCopyWalletX = () => {
    navigator.clipboard.writeText(currentOrder.walletX);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateDeposit = () => {
    setIsSimulating(true);
    orderEngine.simulateDepositReceived(currentOrder.orderId, (updatedOrder) => {
      setCurrentOrder({ ...updatedOrder });
      if (updatedOrder.status === ORDER_STATES.COMPLETED.id) {
        setIsSimulating(false);
      }
    });
  };

  const stepsList = [
    { num: 1, id: 'WAITING_DEPOSIT', title: 'واریز به Wallet X', desc: 'دریافت ارز در آدرس موقت' },
    { num: 2, id: 'DEPOSIT_CONFIRMED', title: 'تایید بلاکچین', desc: 'تایید واریز توسط RPC' },
    { num: 3, id: 'SWAPPING_DEX', title: 'تبديل پنکیک‌اسواپ', desc: 'انتقال به استخر واسط Z' },
    { num: 4, id: 'PRIVACY_DELAY', title: 'تاخیر حریم خصوصی', desc: 'شکستن زمانبندی آن‌چین' },
    { num: 5, id: 'PAYOUT_TRANSFERRING', title: 'واریز به Wallet B', desc: 'انتقال نهایی از Z به B' },
    { num: 6, id: 'COMPLETED', title: 'تکمیل شد', desc: 'پاکسازی کاملاً موفق' }
  ];

  const getStepNum = (st) => {
    switch (st) {
      case 'WAITING_DEPOSIT': return 1;
      case 'DEPOSIT_CONFIRMED': return 2;
      case 'SWAPPING_DEX': return 3;
      case 'PRIVACY_DELAY': return 4;
      case 'PAYOUT_TRANSFERRING': return 5;
      case 'COMPLETED': return 6;
      default: return 1;
    }
  };

  const activeNum = getStepNum(currentOrder.status);

  return (
    <div className="w-full max-w-4xl mx-auto py-6 space-y-5">
      
      {/* Top Header Card */}
      <div className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-bold text-white font-mono">{currentOrder.orderId}</h2>
            <span className={`badge-pill badge-${currentOrder.status === 'COMPLETED' ? 'emerald' : 'amber'}`}>
              {ORDER_STATES[currentOrder.status]?.labelFa || currentOrder.status}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            زمان ثبت سفارش: {new Date(currentOrder.createdAt).toLocaleTimeString('fa-IR')}
          </p>
        </div>

        <button onClick={onNewOrderClick} className="btn-glass text-xs py-2 px-4">
          <ArrowRight className="w-4 h-4 ml-1" />
          <span>ثبت سفارش جدید</span>
        </button>
      </div>

      {/* Deposit Action Box */}
      {currentOrder.status === ORDER_STATES.WAITING_DEPOSIT.id && (
        <div className="glass-card p-6 border-emerald-500/40 bg-gradient-to-b from-emerald-500/5 to-transparent relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="space-y-3 flex-1 text-right">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <Clock className="w-4 h-4 animate-spin" />
                <span>گام اول: واریز ارز به آدرس موقت اختصاصی (Wallet X)</span>
              </div>
              
              <h3 className="text-lg font-bold text-white">
                لطفاً دقیقاً <span className="text-emerald-400 font-mono text-xl">{currentOrder.sourceAmount} {currentOrder.sourceAssetId}</span> به آدرس زیر واریز کنید:
              </h3>

              {/* Address Box */}
              <div className="bg-slate-950 p-4 rounded-xl border border-white/10 flex items-center justify-between gap-2">
                <span className="font-mono text-sm text-emerald-300 break-all select-all font-semibold">
                  {currentOrder.walletX}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={handleCopyWalletX} className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors" title="کپی آدرس">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button onClick={() => setShowQR(!showQR)} className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors" title="نمایش QR Code">
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {copied && <p className="text-xs text-emerald-400 font-semibold">✓ آدرس کیف پول X کپی شد!</p>}
            </div>

            {/* Simulation Button */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <button
                onClick={handleSimulateDeposit}
                disabled={isSimulating}
                className="btn-emerald py-3.5 px-6 shadow-emerald-500/20"
              >
                <PlayCircle className="w-5 h-5" />
                <span>شبیه‌سازی واریز کاربر به X</span>
              </button>
              <span className="text-[11px] text-slate-500">یا واریز واقعی بر روی BSC EVM</span>
            </div>

          </div>

          {/* QR Code Drawer */}
          {showQR && (
            <div className="mt-6 pt-6 border-t border-white/10 flex flex-col items-center justify-center bg-slate-950/80 p-4 rounded-2xl">
              <div className="p-3 bg-white rounded-xl shadow-lg mb-2">
                <QRCodeSVG value={currentOrder.walletX} size={150} />
              </div>
              <span className="text-xs text-slate-400 font-mono">اسکن جهت واریز به Wallet X</span>
            </div>
          )}
        </div>
      )}

      {/* Step Timeline Pipeline */}
      <div className="glass-card p-6 space-y-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>مراحل عملیات پاکسازی و تبادل آن‌چین</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {stepsList.map(step => {
            const isDone = activeNum > step.num;
            const isCurr = activeNum === step.num;

            return (
              <div
                key={step.num}
                className={`p-4 rounded-2xl border text-right transition-all relative overflow-hidden ${
                  isCurr
                    ? 'bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/10 glow-active-step'
                    : isDone
                    ? 'bg-slate-900/80 border-slate-800 text-slate-300'
                    : 'bg-slate-950 border-slate-900 opacity-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isDone ? 'bg-emerald-500 text-slate-950' : isCurr ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isDone ? '✓' : step.num}
                  </span>
                  {isCurr && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>}
                </div>
                <h4 className="text-xs font-bold text-white mb-1">{step.title}</h4>
                <p className="text-[11px] text-slate-400 leading-tight">{step.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Delay Countdown */}
        {currentOrder.status === ORDER_STATES.PRIVACY_DELAY.id && (
          <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-purple-400 animate-pulse" />
              <div>
                <h4 className="text-sm font-bold text-purple-300">در حال اجرای زمان‌بندی تاخیر حریم خصوصی...</h4>
                <p className="text-xs text-slate-400">تراکنش در صف انتقال به Wallet B نگهداری می‌شود</p>
              </div>
            </div>
            <div className="text-2xl font-black font-mono text-purple-300 bg-slate-950 px-4 py-2 rounded-xl border border-purple-500/30">
              00:{countdown < 10 ? `0${countdown}` : countdown}
            </div>
          </div>
        )}
      </div>

      {/* Explorer Hashes Card */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-white border-b border-white/10 pb-3">هش تراکنش‌های آن‌چین (BscScan Explorer)</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-1.5 font-medium">۱. تراکنش واریز (A ➔ X):</span>
            {currentOrder.txHashDeposit ? (
              <a href={`https://bscscan.com/tx/${currentOrder.txHashDeposit}`} target="_blank" rel="noreferrer" className="font-mono text-emerald-400 hover:underline flex items-center gap-1 font-semibold">
                <span>{evmService.truncateAddress(currentOrder.txHashDeposit)}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : <span className="text-slate-600 font-mono">در انتظار واریز...</span>}
          </div>

          <div>
            <span className="text-slate-400 block mb-1.5 font-medium">۲. تبادل در پنکیک‌اسواپ (X ➔ Z):</span>
            {currentOrder.txHashSwap ? (
              <a href={`https://bscscan.com/tx/${currentOrder.txHashSwap}`} target="_blank" rel="noreferrer" className="font-mono text-purple-400 hover:underline flex items-center gap-1 font-semibold">
                <span>{evmService.truncateAddress(currentOrder.txHashSwap)}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : <span className="text-slate-600 font-mono">در انتظار اجرای تبادل...</span>}
          </div>

          <div>
            <span className="text-slate-400 block mb-1.5 font-medium">۳. واریز نهایی پاک‌شده (Z ➔ B):</span>
            {currentOrder.txHashPayout ? (
              <a href={`https://bscscan.com/tx/${currentOrder.txHashPayout}`} target="_blank" rel="noreferrer" className="font-mono text-cyan-400 hover:underline flex items-center gap-1 font-semibold">
                <span>{evmService.truncateAddress(currentOrder.txHashPayout)}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : <span className="text-slate-600 font-mono">در انتظار اتمام تاخیر...</span>}
          </div>
        </div>
      </div>

    </div>
  );
};
