import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

/**
 * Native SHA-256 helper function using Web Crypto API
 */
async function sha256Hex(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const AltchaWidget = ({ onVerified, resetTrigger }) => {
  const [status, setStatus] = useState('idle'); // 'idle' | 'solving' | 'verified' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const solveChallenge = async () => {
    setStatus('solving');
    setErrorMessage('');

    try {
      // 1. Fetch challenge from Django backend
      const res = await fetch(`${API_BASE}/auth/altcha-challenge/`);
      if (!res.ok) throw new Error('نمیتوان چالش امنیتی را از سرور دریافت کرد.');

      const challengeData = await res.json();
      const { algorithm, challenge, salt, signature, maxnumber } = challengeData;

      // 2. Solve PoW in browser thread
      let foundNumber = null;
      const limit = maxnumber || 50000;

      for (let n = 0; n < limit; n++) {
        const testHash = await sha256Hex(`${salt}${n}`);
        if (testHash === challenge) {
          foundNumber = n;
          break;
        }
      }

      if (foundNumber === null) {
        throw new Error('چالش امنیتی حل نشد.');
      }

      // 3. Construct b64 payload
      const payloadObj = {
        algorithm,
        challenge,
        salt,
        signature,
        number: foundNumber
      };

      const payloadB64 = btoa(JSON.stringify(payloadObj));
      setStatus('verified');
      if (onVerified) onVerified(payloadB64);

    } catch (err) {
      console.error('Altcha solver error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'خطا در حل چالش امنیتی');
      if (onVerified) onVerified('');
    }
  };

  useEffect(() => {
    solveChallenge();
  }, [resetTrigger]);

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-xs">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
          status === 'verified'
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            : status === 'solving'
            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
            : 'bg-red-500/10 text-red-400 border border-red-500/30'
        }`}>
          {status === 'solving' && <Loader2 className="w-4 h-4 animate-spin" />}
          {status === 'verified' && <CheckCircle2 className="w-4 h-4" />}
          {status === 'error' && <AlertCircle className="w-4 h-4" />}
        </div>

        <div>
          <div className="font-semibold text-slate-200">
            {status === 'solving' && 'در حال حل چالش امنیتی (PoW)...'}
            {status === 'verified' && 'چالش امنیتی تایید شد'}
            {status === 'error' && 'خطا در چالش امنیتی'}
          </div>
          <div className="text-[11px] text-slate-400">
            {status === 'verified' && 'تایید سیستم ضدهک ALTCHA'}
            {status === 'solving' && 'محاسبه الگوریتم SHA-256'}
            {status === 'error' && errorMessage}
          </div>
        </div>
      </div>

      {status === 'error' && (
        <button
          type="button"
          onClick={solveChallenge}
          className="text-xs text-cyan-400 hover:underline font-semibold"
        >
          تلاش مجدد
        </button>
      )}

      {status === 'verified' && (
        <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">
          ALTCHA PoW
        </span>
      )}
    </div>
  );
};
