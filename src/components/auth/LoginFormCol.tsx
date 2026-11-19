import React from 'react';
import {
  ArrowLeft,
  Sparkles,
  AlertCircle,
  X,
  CheckCircle2,
  User,
  Lock,
  Eye,
  EyeOff,
  Building2,
  KeyRound,
  PhoneCall,
} from 'lucide-react';
import { AppUser } from '../../types/customs';

interface LoginFormColProps {
  onCancel?: () => void;
  users: AppUser[];
  selectedRolePill: string | null;
  onSelectDemoUser: (user: AppUser) => void;
  errorMessage: string | null;
  setErrorMessage: (msg: string | null) => void;
  successUser: AppUser | null;
  usernameOrEmail: string;
  setUsernameOrEmail: (u: string) => void;
  password: string;
  setPassword: (p: string) => void;
  showPassword: boolean;
  setShowPassword: (sp: boolean) => void;
  selectedBranch: 'all' | 'naqaa_basra' | 'sawt_aljanoob';
  setSelectedBranch: (b: 'all' | 'naqaa_basra' | 'sawt_aljanoob') => void;
  rememberMe: boolean;
  setRememberMe: (r: boolean) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onOpenForgot: () => void;
  onOpenSupport: () => void;
}

export const LoginFormCol: React.FC<LoginFormColProps> = ({
  onCancel,
  users,
  selectedRolePill,
  onSelectDemoUser,
  errorMessage,
  setErrorMessage,
  successUser,
  usernameOrEmail,
  setUsernameOrEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  selectedBranch,
  setSelectedBranch,
  rememberMe,
  setRememberMe,
  isLoading,
  onSubmit,
  onOpenForgot,
  onOpenSupport,
}) => {
  return (
    <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between bg-slate-900/95 relative">
      <div>
        {/* Header / Nav Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-300">بوابة الدخول الآمن</span>
          </div>

          {onCancel && (
            <button
              onClick={onCancel}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition px-2.5 py-1 rounded-lg hover:bg-slate-800"
            >
              <span>العودة للنظام</span>
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
            </button>
          )}
        </div>

        {/* Title & Welcome */}
        <div className="mb-6">
          <h2 className="text-2xl font-black text-white tracking-tight">تسجيل الدخول</h2>
          <p className="text-xs text-slate-400 mt-1">
            أدخل بيانات اعتماد حسابك للوصول إلى لوحة التحكم والعمليات الكمركية
          </p>
        </div>

        {/* Demo Fast-Login Pills */}
        <div className="mb-6 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              حسابات الاختبار التجريبية السريعة:
            </span>
            <span className="text-[10px] text-slate-500">نقرة واحدة للتعبئة</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {users.slice(0, 4).map((u) => {
              const isSelected = selectedRolePill === u.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => onSelectDemoUser(u)}
                  className={`p-2 rounded-xl text-right transition border text-[11px] flex flex-col items-start gap-1 ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold shadow-xs'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                  title={`اسم المستخدم: ${u.username} | كلمة المرور: ${u.password}`}
                >
                  <span className="text-base leading-none">{u.avatar}</span>
                  <span className="truncate w-full font-bold text-[11px]">{u.name}</span>
                  <span className="text-[9px] text-emerald-400 truncate w-full">@{u.username}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Success Banner */}
        {successUser && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2.5 animate-in fade-in zoom-in-95">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <strong className="block text-white font-bold">تم تسجيل الدخول بنجاح!</strong>
              <span>مرحباً بك ({successUser.name})، جاري تحميل لوحة التحكم...</span>
            </div>
          </div>
        )}

        {/* The Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          
          {/* Username or Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block text-right">
              اسم المستخدم أو البريد الإلكتروني <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={usernameOrEmail}
                onChange={(e) => {
                  setUsernameOrEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="admin أو اسم المستخدم الخاص بك"
                className="w-full pl-3.5 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition text-right"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300 text-right">
                كلمة المرور <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={onOpenForgot}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline transition"
              >
                نسيت كلمة المرور؟
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition text-right"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 hover:text-slate-300 transition"
                title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Branch Selection & Remember Me */}
          <div className="pt-1 space-y-3">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                الجهة والفرع الافتراضي:
              </span>
              <select
                value={selectedBranch}
                onChange={(e: any) => setSelectedBranch(e.target.value)}
                className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-emerald-500 font-sans"
              >
                <option value="all">كافة الشركات (موحد)</option>
                <option value="naqaa_basra">شركة نقاء البصرة</option>
                <option value="sawt_aljanoob">شركة صوت الجنوب</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded-sm border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-950 accent-emerald-500 cursor-pointer"
              />
              <span>تذكر تسجيل دخولي على هذا الجهاز لمدة 30 يوماً</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !!successUser}
            className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>جاري التحقق من بيانات الدخول...</span>
              </>
            ) : successUser ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>تم التحقق بنجاح!</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>تسجيل الدخول إلى النظام</span>
              </>
            )}
          </button>

        </form>
      </div>

      {/* Bottom Support & Help */}
      <div className="pt-6 border-t border-slate-800 text-center text-xs text-slate-400 space-y-2 mt-6">
        <div className="flex items-center justify-center gap-4 text-[11px]">
          <button
            type="button"
            onClick={onOpenSupport}
            className="text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition"
          >
            <PhoneCall className="w-3 h-3 text-emerald-400" />
            <span>المساعدة والدعم الفني</span>
          </button>
          <span className="text-slate-700">•</span>
          <span className="text-slate-500">نظام مشفر ومؤمن</span>
        </div>
      </div>
    </div>
  );
};
