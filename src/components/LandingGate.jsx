import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Sparkles, CheckCircle2, AlertCircle, RefreshCw, EyeOff, Key } from 'lucide-react';
import { AltchaWidget } from './AltchaWidget.jsx';

const API_BASE = 'http://localhost:8000/api';

const DISPOSABLE_DOMAINS = [
  'mailinator.com', 'tempmail.com', 'temp-mail.org', '10minutemail.com', 
  'guerrillamail.com', 'dispostable.com', 'trashmail.com', 'yopmail.com', 
  'getnada.com', 'fakeinbox.com', 'sharklasers.com', 'throwawaymail.com'
];

export const LandingGate = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [altchaPayload, setAltchaPayload] = useState('');
  const [altchaReset, setAltchaReset] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailWarning, setEmailWarning] = useState('');

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

      setSuccess(data.message || 'ورود با موفقیت انجام شد.');
      localStorage.setItem('miloosh_auth_token', data.token);
      localStorage.setItem('miloosh_user_email', data.user.email);

      setTimeout(() => {
        setIsSubmitting(false);
        if (onAuthSuccess) onAuthSuccess(data.user);
      }, 800);

    } catch (err) {
      setIsSubmitting(false);
      setError(err.message);
      setAltchaReset(prev => prev + 1);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4">
      
      {/* Centered Flex Layout */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
        
        {/* Right Hero Column */}
        <div className="flex-1 space-y-6 text-right">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>پلتفرم تخصصی پاکسازی و انتقال محرمانه EVM</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            پاکسازی آن‌چین تراکنش‌ها و <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              انتقال امن ارز دیجیتال
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            پروتکل میلوش کلین‌پِی به شما اجازه می‌دهد دارایی‌های خود را از <span className="text-white font-semibold">Wallet A</span> به آدرس موقت اختصاصی <span className="text-emerald-400 font-mono font-semibold">Wallet X</span> واریز کنید، در DEX تبادل کرده و سپس با تاخیر زمان‌بندی به <span className="text-cyan-400 font-mono font-semibold">Wallet B</span> منتقل نمایید.
          </p>

          {/* Feature Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-right">
            
            <div className="bg-slate-900/80 border border-white/10 p-3.5 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <EyeOff className="w-4 h-4" />
                <span>شکستن ردپای آن‌چین</span>
              </div>
              <p className="text-[11px] text-slate-400">قطع کامل لینک مستقیم بین کیف پول A و B</p>
            </div>

            <div className="bg-slate-900/80 border border-white/10 p-3.5 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold">
                <RefreshCw className="w-4 h-4" />
                <span>میکسر صرافی PancakeSwap</span>
              </div>
              <p className="text-[11px] text-slate-400">تبدیل ارزها در استخر واسط Z پیش از واریز</p>
            </div>

            <div className="bg-slate-900/80 border border-white/10 p-3.5 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                <Key className="w-4 h-4" />
                <span>آدرس موقت یا ثابت</span>
              </div>
              <p className="text-[11px] text-slate-400">تولید آدرس موقت تک‌بار مصرف یا اختصاصی ماهانه</p>
            </div>

            <div className="bg-slate-900/80 border border-white/10 p-3.5 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>حفاظت ALTCHA PoW</span>
              </div>
              <p className="text-[11px] text-slate-400">اثبات کار الگوریتمی برای جلوگیری از بات‌ها</p>
            </div>

          </div>

        </div>

        {/* Left Auth Form Card */}
        <div className="w-full sm:w-[420px] shrink-0">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            
            {/* Header Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-4 text-sm font-bold">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setEmailWarning(''); }}
                  className={`pb-1 border-b-2 transition-colors ${
                    mode === 'login' ? 'border-emerald-500 text-white font-black' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ورود به سیستم
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); setEmailWarning(''); }}
                  className={`pb-1 border-b-2 transition-colors ${
                    mode === 'register' ? 'border-emerald-500 text-white font-black' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ثبت‌نام حساب جدید
                </button>
              </div>

              <span className="badge badge-emerald text-[10px]">ورود الزامی</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-right">
              
              {/* Email */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">
                  ایمیل معتبر کاربر <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono text-left"
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

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono text-left"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* ALTCHA PoW Captcha Widget */}
              <div className="pt-1">
                <AltchaWidget
                  onVerified={(payload) => setAltchaPayload(payload)}
                  resetTrigger={altchaReset}
                />
              </div>

              {/* Feedback messages */}
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
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span>در حال تایید و ورود...</span>
                ) : mode === 'login' ? (
                  <span>ورود به حساب و بازکردن پنل</span>
                ) : (
                  <span>ایجاد حساب جدید</span>
                )}
              </button>

            </form>

          </div>
        </div>

      </div>

    </div>
  );
};
