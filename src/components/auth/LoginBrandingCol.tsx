import React from 'react';
import { 
  Anchor, 
  Sparkles, 
  Boxes, 
  Building2, 
  FileCheck2, 
  ShieldCheck 
} from 'lucide-react';

export const LoginBrandingCol: React.FC = () => {
  return (
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
  );
};
