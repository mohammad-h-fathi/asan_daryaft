import React, { useState } from 'react';
import { X, Mail, Lock, AlertCircle, CheckCircle2, LogIn, UserPlus } from 'lucide-react';
import { AltchaWidget } from './AltchaWidget.jsx';

const API_BASE = 'http://localhost:8000/api';

const DISPOSABLE_DOMAINS = [
  'mailinator.com', 'tempmail.com', 'temp-mail.org', '10minutemail.com', 
  'guerrillamail.com', 'dispostable.com', 'trashmail.com', 'yopmail.com', 
  'getnada.com', 'fakeinbox.com', 'sharklasers.com', 'throwawaymail.com'
];

export const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [altchaPayload, setAltchaPayload] = useState('');
  const [altchaReset, setAltchaReset] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailWarning, setEmailWarning] = useState('');

  if (!isOpen) return null;

  const handleEmailChange = (val) => {
    setEmail(val);
    const domain = val.trim().toLowerCase().split('@')[1];
    if (domain && DISPOSABLE_DOMAINS.includes(domain)) {
      setEmailWarning('ایمیل‌های موقت و یک‌بار مصرف مجاز نیستند.');
    } else {
      setEmailWarning('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('لطفاً ایمیل و رمز عبور را وارد کنید.');
      return;
    }

    if (!altchaPayload) {
      setError('لطفاً منتظر تایید چالش امنیتی ALTCHA بمانید.');
      return;
    }

    if (emailWarning) {
      setError(emailWarning);
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = mode === 'register' ? `${API_BASE}/auth/register/` : `${API_BASE}/auth/login/`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          altcha_payload: altchaPayload
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          throw new Error('تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً ۱ دقیقه دیگر تلاش کنید (محدودیت Rate Limit).');
        }
        throw new Error(data.error || 'خطا در ثبت نام / ورود.');
      }

      setSuccess(data.message || 'عملیات با موفقیت انجام شد.');
      localStorage.setItem('miloosh_auth_token', data.token);
      localStorage.setItem('miloosh_user_email', data.user.email);

      setTimeout(() => {
        setIsSubmitting(false);
        if (onAuthSuccess) onAuthSuccess(data.user);
        onClose();
      }, 1000);

    } catch (err) {
      setIsSubmitting(false);
      setError(err.message);
      setAltchaReset(prev => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setMode('login'); setError(''); setEmailWarning(''); }}
              className={`text-base font-bold transition-colors ${
                mode === 'login' ? 'text-white border-b-2 border-emerald-500 pb-1' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ورود به حساب
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); setEmailWarning(''); }}
              className={`text-base font-bold transition-colors ${
                mode === 'register' ? 'text-white border-b-2 border-emerald-500 pb-1' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ثبت نام حساب جدید
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              آدرس ایمیل معتبر <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none font-mono text-left"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            {emailWarning && (
              <p className="text-[11px] text-amber-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{emailWarning}</span>
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              رمز عبور <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none font-mono text-left"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            {mode === 'register' && (
              <p className="text-[11px] text-slate-400">حداقل ۸ کاراکتر وارد کنید.</p>
            )}
          </div>

          {/* ALTCHA PoW Captcha Widget */}
          <div className="pt-1">
            <AltchaWidget
              onVerified={(payload) => setAltchaPayload(payload)}
              resetTrigger={altchaReset}
            />
          </div>

          {/* Error / Success Feedback */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !altchaPayload || !!emailWarning}
            className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>در حال پردازش...</span>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>ورود به حساب کاربری</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>ایجاد حساب جدید</span>
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};
