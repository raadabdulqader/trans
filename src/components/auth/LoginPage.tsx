'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  Sparkles,
  Anchor,
  Building2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Activity,
  Layers,
  PhoneCall,
  KeyRound,
  Boxes,
  FileCheck2,
  X,
  ExternalLink,
} from 'lucide-react';
import { AppUser } from '../../types/customs';
import { INITIAL_USERS } from '../../utils/initialData';

export interface LoginPageProps {
  users?: AppUser[];
  onLoginSuccess?: (user: AppUser, branch?: string) => void;
  onCancel?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  users = INITIAL_USERS,
  onLoginSuccess,
  onCancel,
}) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<'all' | 'naqaa_basra' | 'sawt_aljanoob'>('all');
  const [selectedRolePill, setSelectedRolePill] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successUser, setSuccessUser] = useState<AppUser | null>(null);

  // Modals
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Quick fill demo user credentials
  const handleSelectDemoUser = (user: AppUser) => {
    setUsernameOrEmail(user.username);
    setPassword(user.password || 'admin123');
    setSelectedRolePill(user.id);
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedIdentifier = usernameOrEmail.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedIdentifier) {
      setErrorMessage('يرجى إدخال اسم المستخدم أو البريد الإلكتروني');
      return;
    }

    if (!trimmedPass) {
      setErrorMessage('يرجى إدخال كلمة المرور');
      return;
    }

    setIsLoading(true);

    // Simulate authenticating against the users list
    setTimeout(() => {
      const foundUser = users.find(
        (u) =>
          u.username.toLowerCase() === trimmedIdentifier ||
          (u.email && u.email.toLowerCase() === trimmedIdentifier)
      );

      if (!foundUser) {
        setIsLoading(false);
        setErrorMessage('اسم المستخدم أو البريد الإلكتروني غير مسجل في النظام');
        return;
      }

      if (foundUser.status === 'suspended') {
        setIsLoading(false);
        setErrorMessage('هذا الحساب معطل حالياً من قبل الإدارة. يرجى مراجعة المدير العام.');
        return;
      }

      if (foundUser.password && foundUser.password !== trimmedPass) {
        setIsLoading(false);
        setErrorMessage('كلمة المرور غير صحيحة، يرجى التحقق وإعادة المحاولة.');
        return;
      }

      // Success
      setIsLoading(false);
      setSuccessUser(foundUser);

      // Store remember preference if requested
      if (typeof window !== 'undefined' && rememberMe) {
        localStorage.setItem('customs_remember_user', foundUser.username);
      }

      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(foundUser, selectedBranch);
        } else {
          // If standalone page without callback, redirect to root
          window.location.href = '/';
        }
      }, 700);
    }, 600);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-center selection:bg-emerald-500 selection:text-slate-950 font-sans relative overflow-hidden" dir="rtl">
      
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[30rem] h-[30rem] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex-1 flex items-center justify-center relative z-10">
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
          
          {/* ============================================================== */}
          {/* COLUMN 1: Visual, Branding & Feature Showcase (Right Side in RTL) */}
          {/* ============================================================== */}
          <div className="lg:col-span-7 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 p-8 sm:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-l border-slate-800 relative overflow-hidden">
            
            {/* Subtle radial light inside column */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Top Brand & Status */}
            <div className="space-y-6 relative z-10">
              
              <div className="flex items-center justify-between">
                {/* Logo & System Brand */}
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
                    <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400">
                      <Anchor className="w-6 h-6 animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-lg font-black text-white tracking-wide">نظام مكتب النجم</h1>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                        v4.2 PRO
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">للتخليص الكمركي والنقل العام والمالية</p>
                  </div>
                </div>

                {/* Ports connectivity badge */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>ميناء أم قصر: <strong className="text-emerald-400 font-semibold">متصل</strong></span>
                </div>
              </div>

              {/* Main Headline & Value Proposition */}
              <div className="space-y-3 pt-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>المنصة السحابية الموحدة للتخليص الكمركي في العراق</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  إدارة ذكية وشاملة للبوالص، الحاويات، وسلف الموانئ
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                  منظومة مالية وكمركية متقدمة تربط المعاملات اليومية، أرشيف الوصولات، حسابات شركات النقل، والصندوق المالي المشترك لشركتي <span className="text-emerald-400 font-bold">نقاء البصرة</span> و <span className="text-cyan-400 font-bold">صوت الجنوب</span> بدقة متناهية.
                </p>
              </div>

              {/* Feature Cards Showcase */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                
                {/* Feature 1 */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-emerald-500/40 transition-all duration-200 group">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Boxes className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-bold text-white mb-1">بوالص وحاويات</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    متابعة كشوفات المنافذ، أجور العمال، ورسوم الفحص والكمارك.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/40 transition-all duration-200 group">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-bold text-white mb-1">صندوق مالي موحد</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    إدارة متزامنة بالدينار والدولار مع تسوية سلف المخلصين بدقة.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-amber-500/40 transition-all duration-200 group">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-bold text-white mb-1">أرشيف وتدقيق رقابي</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    سجل تدقيق آمن لكل عملية مالية مع منع التلاعب أو الحذف غير المصرح.
                  </p>
                </div>

              </div>

            </div>

            {/* Bottom Live Metrics & Security Seal */}
            <div className="pt-8 space-y-4 relative z-10 border-t border-slate-800/80 mt-6">
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
                  <div className="text-lg font-black text-emerald-400 font-sans">+15,400</div>
                  <div className="text-[10px] text-slate-400">بوليصة منجزة</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
                  <div className="text-lg font-black text-cyan-400 font-sans">100%</div>
                  <div className="text-[10px] text-slate-400">مطابقة محاسبية</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
                  <div className="text-lg font-black text-amber-400 font-sans">24/7</div>
                  <div className="text-[10px] text-slate-400">توافر وحماية سحابية</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>تشفير بيانات معتمد بتقنية 256-Bit SSL المتوافقة كمركياً</span>
                </div>
                <div>حقوق النظام محفوظة © 2026 مكتب النجم</div>
              </div>

            </div>

          </div>

          {/* ============================================================== */}
          {/* COLUMN 2: Interactive Authentication Form (Left Side in RTL)   */}
          {/* ============================================================== */}
          <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between bg-slate-900/95 relative">
            
            {/* Header / Nav Actions */}
            <div>
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

              {/* Demo Fast-Login Pills (حسابات تجريبية سريعة) */}
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
                        onClick={() => handleSelectDemoUser(u)}
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
              <form onSubmit={handleSubmit} className="space-y-4">
                
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
                      onClick={() => setShowForgotModal(true)}
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
                  
                  {/* Branch selector */}
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

                  {/* Remember Me Checkbox */}
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
                  onClick={() => setShowSupportModal(true)}
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

        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: Forgot Password Info Modal                            */}
      {/* ============================================================== */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-5 left-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white mb-2">استعادة وتعيين كلمة المرور</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              لدواعي الأمان والرقابة المالية في نظام التخليص الكمركي، تتم إدارة وتعيين كلمات المرور حصراً عبر إدارة النظام والمدير العام.
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2 mb-5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">إدارة النظام:</span>
                <strong className="text-white">المدير العام (مكتب النجم)</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">الهاتف المباشر:</span>
                <span className="text-emerald-400 font-mono font-bold" dir="ltr">0770 123 4567</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">البريد الإلكتروني:</span>
                <span className="text-cyan-400 font-mono text-[11px]">admin@alnajm-customs.com</span>
              </div>
            </div>

            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
            >
              حسناً، فهمت
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: Support & Port Operations Modal                       */}
      {/* ============================================================== */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowSupportModal(false)}
              className="absolute top-5 left-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
              <PhoneCall className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white mb-2">الدعم الفني والعمليات الكمركية</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              فريق الدعم الفني جاهز لمساعدتكم في حل أي صعوبات تقنية أو ربط أجهزة المسح الضوئي وأرشفة الوصولات.
            </p>

            <div className="space-y-2 text-xs mb-5">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-white font-bold">قسم تكنولوجيا المعلومات والموانئ</div>
                  <div className="text-[10px] text-slate-400">ميناء أم قصر - خور الزبير</div>
                </div>
                <span className="text-emerald-400 font-mono font-bold" dir="ltr">0780 998 8776</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-white font-bold">الشعبة المالية والمحاسبية</div>
                  <div className="text-[10px] text-slate-400">إدارة الصندوق ومطابقة السلف</div>
                </div>
                <span className="text-cyan-400 font-mono font-bold" dir="ltr">0770 234 5678</span>
              </div>
            </div>

            <button
              onClick={() => setShowSupportModal(false)}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition"
            >
              إغلاق النافذة
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
