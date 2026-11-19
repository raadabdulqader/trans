import React from 'react';
import { Plus, Users, CheckCircle2, Shield, KeyRound } from 'lucide-react';
import { AppUser } from '../../types/customs';

interface UsersHeaderProps {
  currentUser: AppUser;
  onAddUser: () => void;
  stats: {
    total: number;
    active: number;
    admins: number;
    accountants: number;
  };
}

export const UsersHeader: React.FC<UsersHeaderProps> = ({
  currentUser,
  onAddUser,
  stats,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 shrink-0 text-2xl font-black">
            👥
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                إدارة المستخدمين وبيانات الدخول والصلاحيات
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                User Access & Security
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              إنشاء وتعيين أسماء الدخول (Usernames) وكلمات المرور (Passwords) لموظفي ومحاسبي المكتب، وتخصيص صلاحيات الوصول والرقابة المالية.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-2.5 shadow-inner">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>المستخدم النشط حالياً:</span>
            <strong className="text-emerald-400 font-bold">{currentUser.name} ({currentUser.roleTitle})</strong>
          </div>

          <button
            onClick={onAddUser}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مستخدم جديد</span>
          </button>
        </div>
      </div>

      {/* Live Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-800/80">
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>إجمالي المستخدمين</span>
          </div>
          <div className="text-xl font-black text-white font-mono">{stats.total}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
          <div className="text-xs text-emerald-400 mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>الحسابات المفعلة والنشطة</span>
          </div>
          <div className="text-xl font-black text-emerald-300 font-mono">{stats.active}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
          <div className="text-xs text-amber-400 mb-1 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>المدراء المعتمدون</span>
          </div>
          <div className="text-xl font-black text-amber-300 font-mono">{stats.admins}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-sky-500/5 border border-sky-500/20">
          <div className="text-xs text-sky-400 mb-1 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-sky-400" />
            <span>المحاسبون الماليون</span>
          </div>
          <div className="text-xl font-black text-sky-300 font-mono">{stats.accountants}</div>
        </div>
      </div>
    </div>
  );
};
