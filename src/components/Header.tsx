'use client';

import { Menu, Search, Download, Upload, Bell, ChevronDown, RotateCcw, Calendar as CalendarIcon, DollarSign, LogOut } from 'lucide-react';
import { AppUser } from '../types/customs';

interface HeaderProps {
  pageTitle: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentUser: AppUser;
  pendingCount: number;
  exchangeRate?: number;
  onOpenExchangeRate?: () => void;
  onOpenSwitchUser: () => void;
  onExportBackup: () => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetDatabase?: () => void;
  onToggleMobileMenu: () => void;
  onNotificationClick: () => void;
  onOpenCalendar?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  pageTitle,
  searchTerm,
  setSearchTerm,
  currentUser,
  pendingCount,
  exchangeRate = 1500,
  onOpenExchangeRate,
  onOpenSwitchUser,
  onExportBackup,
  onImportBackup,
  onResetDatabase,
  onToggleMobileMenu,
  onNotificationClick,
  onOpenCalendar,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Mobile Toggle & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white tracking-tight">{pageTitle}</h1>
        </div>

        {/* Right: Actions, Search, User */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Global Search */}
          <div className="relative min-w-[200px] sm:min-w-[260px]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث برقم البوليصة أو الزبون..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pr-9 pl-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>

          {/* Daily Exchange Rate Quick Pill */}
          {onOpenExchangeRate && (
            <button
              onClick={onOpenExchangeRate}
              title="تعديل سعر الصرف اليومي للـ 100 دولار"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-500/30 transition shadow-xs group"
            >
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <DollarSign className="w-3 h-3" />
              </span>
              <span className="font-mono font-bold text-white tracking-wide text-[11px]" dir="ltr">
                100$ = {((exchangeRate || 1500) * 100).toLocaleString('ar-IQ')} د.ع
              </span>
              <span className="text-[10px] text-emerald-400/80 hidden md:inline font-sans underline underline-offset-2">
                تعديل
              </span>
            </button>
          )}

          {/* Calendar Button */}
          {onOpenCalendar && (
            <button
              onClick={onOpenCalendar}
              title="التقويم الكمركي والمالي اليومي"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 hover:border-emerald-500/40 transition"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">التقويم</span>
            </button>
          )}

          {/* Backup Button (Requires admin or exportBackup permission) */}
          {(currentUser.role === 'admin' || currentUser.permissions.exportBackup !== false) && (
            <>
              <button
                onClick={onExportBackup}
                title="تصدير نسخة احتياطية من البيانات"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>نسخ احتياطي</span>
              </button>

              {/* Restore Button */}
              <label
                title="استعادة نسخة احتياطية من ملف JSON"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 cursor-pointer transition"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>استعادة</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={onImportBackup}
                  className="hidden"
                />
              </label>
            </>
          )}

          {/* Reset Database Button (Strict Admin Only) */}
          {onResetDatabase && currentUser.role === 'admin' && (
            <button
              onClick={onResetDatabase}
              title="تصفير كافة السجلات والمعاملات لبدء اختبار جديد"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 text-xs font-semibold rounded-xl border border-slate-700 hover:border-rose-500/30 transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>تصفير البيانات</span>
            </button>
          )}

          {/* Notifications */}
          <button
            onClick={onNotificationClick}
            title={`${pendingCount} معاملة معلقة أو قيد المتابعة`}
            className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <Bell className="w-4 h-4" />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-black text-[10px] h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>

          {/* User Profile Badge */}
          <button
            onClick={onOpenSwitchUser}
            title="تغيير المستخدم / الصلاحيات"
            className="flex items-center gap-2.5 py-1 px-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition text-right"
          >
            <span className="text-lg">{currentUser.avatar}</span>
            <div className="hidden sm:block text-right leading-tight">
              <div className="text-xs font-bold text-white">{currentUser.name}</div>
              <div className="text-[10px] text-emerald-400 font-medium">{currentUser.roleTitle}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              title="تسجيل الخروج والانتقال لصفحة الدخول"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700/80 hover:border-rose-500/30 transition flex items-center justify-center"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
