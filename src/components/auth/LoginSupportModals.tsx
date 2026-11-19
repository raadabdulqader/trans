import React from 'react';
import { X, KeyRound, PhoneCall } from 'lucide-react';

interface LoginSupportModalsProps {
  showForgotModal: boolean;
  setShowForgotModal: (show: boolean) => void;
  showSupportModal: boolean;
  setShowSupportModal: (show: boolean) => void;
}

export const LoginSupportModals: React.FC<LoginSupportModalsProps> = ({
  showForgotModal,
  setShowForgotModal,
  showSupportModal,
  setShowSupportModal,
}) => {
  return (
    <>
      {/* ================= MODAL 1: Forgot Password Info Modal ================= */}
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

      {/* ================= MODAL 2: Support & Port Operations Modal ================= */}
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
    </>
  );
};
