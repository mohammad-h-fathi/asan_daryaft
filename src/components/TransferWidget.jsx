import React, { useState } from 'react';
import { ArrowLeftRight, Clock, ShieldCheck, CheckCircle2, AlertCircle, Sparkles, Wallet, Zap } from 'lucide-react';
import { supportedAssets, privacyDelayOptions, pancakeSwapService } from '../services/pancakeSwapService.js';
import { evmService } from '../services/evmService.js';
import { orderEngine } from '../services/orderEngine.js';
import { CryptoIcon } from './CryptoIcon.jsx';

export const TransferWidget = ({ onOrderCreated }) => {
  const [mode, setMode] = useState('DYNAMIC'); // 'DYNAMIC' | 'STATIC'
  const [sourceAssetId, setSourceAssetId] = useState('BNB');
  const [targetAssetId, setTargetAssetId] = useState('USDT');
  const [sourceAmount, setSourceAmount] = useState('1.5');
  const [destinationWalletB, setDestinationWalletB] = useState('');
  const [privacyDelayId, setPrivacyDelayId] = useState('15m');
  const [walletError, setWalletError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const quote = pancakeSwapService.calculateQuote({
    sourceAssetId,
    targetAssetId,
    sourceAmount
  });

  const handleWalletBChange = (val) => {
    setDestinationWalletB(val);
    if (!val.trim()) {
      setWalletError('');
    } else if (!evmService.isValidEVMAddress(val)) {
      setWalletError('آدرس وارد شده یک آدرس معتبر در شبکه EVM نیست.');
    } else {
      setWalletError('');
    }
  };

  const handleSwapDirection = () => {
    const temp = sourceAssetId;
    setSourceAssetId(targetAssetId);
    setTargetAssetId(temp);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!destinationWalletB || !evmService.isValidEVMAddress(destinationWalletB)) {
      setWalletError('لطفاً یک آدرس کیف پول معتبر EVM وارد کنید.');
      return;
    }

    setIsSubmitting(true);

    try {
      const createdOrder = await orderEngine.createOrder({
        sourceAssetId,
        targetAssetId,
        sourceAmount,
        destinationWalletB,
        privacyDelayId,
        mode
      });

      setIsSubmitting(false);
      if (onOrderCreated) onOrderCreated(createdOrder);
    } catch (err) {
      setIsSubmitting(false);
      alert('خطا در ثبت سفارش');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto py-8 px-4">
      
      {/* Title */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>میکسر صرافی PancakeSwap V3 & تاخیر حریم خصوصی</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
          انتقال ناشناس و پاک‌سازی تراکنش‌ها
        </h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          انتقال ارز از <span className="text-white font-semibold">Wallet A</span> به آدرس موقت <span className="text-emerald-400 font-mono font-semibold">Wallet X</span>، تبادل در DEX به استخر <span className="text-purple-400 font-mono font-semibold">Wallet Z</span> و واریز به <span className="text-cyan-400 font-mono font-semibold">Wallet B</span>
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl mb-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setMode('DYNAMIC')}
          className={`flex-1 py-2 px-3 rounded-lg transition-all text-center ${
            mode === 'DYNAMIC' ? 'bg-slate-800 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>تراکنش پویا (تک تراکنشی)</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setMode('STATIC')}
          className={`flex-1 py-2 px-3 rounded-lg transition-all text-center ${
            mode === 'STATIC' ? 'bg-slate-800 text-emerald-400 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <Wallet className="w-3.5 h-3.5" />
            <span>کیف پول واسط ثابت (ماهانه/حقوق)</span>
          </div>
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
        
        <form onSubmit={handleSubmitOrder} className="space-y-4 text-right">
          
          {/* Asset Inputs */}
          <div className="space-y-3">
            
            {/* Source */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>واریز ارز مبدا (Wallet A)</span>
                <span className="font-mono text-slate-400">${quote.sourceUsdValue.toFixed(2)} USD</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <input
                  type="number"
                  step="any"
                  value={sourceAmount}
                  onChange={(e) => setSourceAmount(e.target.value)}
                  className="w-full bg-transparent text-xl font-bold text-white focus:outline-none font-mono"
                  placeholder="0.0"
                />
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1">
                  <CryptoIcon symbol={sourceAssetId} />
                  <select
                    value={sourceAssetId}
                    onChange={(e) => setSourceAssetId(e.target.value)}
                    className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
                  >
                    {supportedAssets.map(asset => (
                      <option key={asset.id} value={asset.id} className="bg-slate-900 text-white">
                        {asset.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center -my-2 relative z-20">
              <button
                type="button"
                onClick={handleSwapDirection}
                className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 flex items-center justify-center hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-md"
                title="جابجایی جهت تبادل"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Target */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>دریافتی نهایی پاک‌شده (Wallet B)</span>
                <span className="font-mono text-slate-400">نرخ: {quote.exchangeRate.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xl font-bold text-emerald-400 font-mono">
                  ≈ {quote.estimatedOutputTargetAmount.toFixed(4)}
                </span>
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1">
                  <CryptoIcon symbol={targetAssetId} />
                  <select
                    value={targetAssetId}
                    onChange={(e) => setTargetAssetId(e.target.value)}
                    className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
                  >
                    {supportedAssets.map(asset => (
                      <option key={asset.id} value={asset.id} className="bg-slate-900 text-white">
                        {asset.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* Destination Wallet B */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-300">
              آدرس کیف پول مقصد پاک‌شده (Wallet B) <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={destinationWalletB}
                onChange={(e) => handleWalletBChange(e.target.value)}
                placeholder="0x... آدرس کیف پول EVM مقصد"
                className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono ${
                  walletError ? 'border-red-500' : ''
                }`}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                {evmService.isValidEVMAddress(destinationWalletB) ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
              </div>
            </div>
            {walletError && <p className="text-[11px] text-red-400 mt-1">{walletError}</p>}
          </div>

          {/* Privacy Time-Lock Selector */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>زمان‌بندی تاخیر حریم خصوصی (Privacy Delay)</span>
              <span className="text-[11px] text-purple-300">شکستن زمانبندی آن‌چین</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {privacyDelayOptions.map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setPrivacyDelayId(option.id)}
                  className={`py-2 px-1.5 rounded-lg border text-xs font-semibold text-center transition-all ${
                    privacyDelayId === option.id
                      ? 'bg-slate-800 border-emerald-500 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Fee Summary */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">سطح کارمزد پویا:</span>
              <span className="badge badge-amber text-xs">{quote.feeTier.tierBadge}</span>
            </div>
            <div className="text-slate-300 font-mono">
              سود پلتفرم: ${quote.platformFeeUsd.toFixed(2)} USD
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20"
          >
            {isSubmitting ? (
              <span>در حال ایجاد آدرس واریز موقت...</span>
            ) : (
              <span>{mode === 'STATIC' ? 'ایجاد آدرس ثابت دائمی Wallet X' : 'تولید آدرس واریز موقت (Wallet X) و شروع پاکسازی'}</span>
            )}
          </button>

        </form>
      </div>

    </div>
  );
};
