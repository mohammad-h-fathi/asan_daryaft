import React from 'react';

export const CryptoIcon = ({ symbol, size = 20 }) => {
  switch (symbol) {
    case 'BNB':
      return (
        <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-black flex items-center justify-center text-[10px] font-mono shadow-sm">
          BNB
        </span>
      );
    case 'USDT':
      return (
        <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-black flex items-center justify-center text-[10px] font-mono shadow-sm">
          ₮
        </span>
      );
    case 'USDC':
      return (
        <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 text-white font-black flex items-center justify-center text-[10px] font-mono shadow-sm">
          $
        </span>
      );
    case 'CAKE':
      return (
        <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-600 to-orange-400 text-white font-black flex items-center justify-center text-[10px] font-mono shadow-sm">
          🥞
        </span>
      );
    case 'ETH':
      return (
        <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-400 text-white font-black flex items-center justify-center text-[10px] font-mono shadow-sm">
          Ξ
        </span>
      );
    default:
      return (
        <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center text-[10px] font-mono">
          {symbol ? symbol.substring(0, 3) : 'COIN'}
        </span>
      );
  }
};
