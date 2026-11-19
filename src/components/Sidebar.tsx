'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Landmark,
  Coins,
  Building2, 
  FileText, 
  Receipt as ReceiptIcon, 
  BarChart3, 
  Users, 
  ShieldCheck,
  Calendar as CalendarIcon,
  Truck,
  X,
  ChevronLeft,
  ChevronRight,
  PanelRightClose
} from 'lucide-react';
import { AppUser, UserPermissions } from '../types/customs';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  currentUser: AppUser;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  onOpenCalendar?: () => void;
  sidebarMode: 'expanded' | 'collapsed' | 'hidden';
  setSidebarMode: (mode: 'expanded' | 'collapsed' | 'hidden') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  currentUser,
  mobileOpen,
  setMobileOpen,
  onOpenCalendar,
  sidebarMode,
  setSidebarMode,
}) => {
  const isCollapsed = sidebarMode === 'collapsed';
  const isHidden = sidebarMode === 'hidden';

  const navItems: { id: string; label: string; icon: any; tabPermission: keyof UserPermissions }[] = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, tabPermission: 'viewDashboard' },
    { id: 'treasury', label: 'صندوق الشركة (الخزينة)', icon: Landmark, tabPermission: 'viewTreasury' },
    { id: 'accounts', label: 'الحسابات والمصاريف', icon: Coins, tabPermission: 'viewAccounts' },
    { id: 'customers', label: 'الزبائن', icon: Building2, tabPermission: 'viewCustomers' },
    { id: 'transactions', label: 'البوالص والمعاملات', icon: FileText, tabPermission: 'viewTransactions' },
    { id: 'carriers', label: 'شركات النقل (النواقل)', icon: Truck, tabPermission: 'viewCarriers' },
    { id: 'employees', label: 'الموظفون والمخلصون', icon: Users, tabPermission: 'viewEmployees' },
    { id: 'receipts', label: 'الوصولات والأرشيف', icon: ReceiptIcon, tabPermission: 'viewReceipts' },
    { id: 'reports', label: 'التقارير المالية', icon: BarChart3, tabPermission: 'viewReports' },
    { id: 'users', label: 'المستخدمون والصلاحيات', icon: Users, tabPermission: 'viewUsers' },
    { id: 'audit', label: 'سجل التدقيق (Audit Log)', icon: ShieldCheck, tabPermission: 'viewAuditLog' },
  ];

  const today = new Intl.DateTimeFormat('ar-IQ', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const handleNavClick = (id: string) => {
    setActivePage(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside className={`fixed lg:sticky top-0 right-0 h-screen bg-slate-900 border-l border-slate-800 flex flex-col z-50 transition-all duration-300 select-none ${
        mobileOpen 
          ? 'translate-x-0 w-72 shadow-2xl' 
          : isHidden 
            ? 'translate-x-full lg:translate-x-full lg:w-0 lg:border-none overflow-hidden' 
            : isCollapsed 
              ? 'translate-x-full lg:translate-x-0 lg:w-18 w-72' 
              : 'translate-x-full lg:translate-x-0 lg:w-64 xl:w-72 w-72'
      }`}>
        
        {/* Brand Header */}
        {isCollapsed ? (
          /* Collapsed Header (Mini Icon Rail) */
          <div className="p-2 border-b border-slate-800 flex flex-col items-center gap-1 shrink-0">
            <div 
              className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 text-base font-black shadow-md shadow-emerald-500/20 shrink-0 cursor-pointer"
              onClick={() => setSidebarMode('expanded')}
              title="نقاء البصرة & صوت الجنوب - انقر للتوسيع"
            >
              🏛️
            </div>
            {/* Expand / Restore Button */}
            <button
              type="button"
              onClick={() => setSidebarMode('expanded')}
              className="p-1 rounded-lg text-emerald-400 hover:text-white hover:bg-slate-800 transition group"
              title="إرجاع الشريط الجانبي (توسيع)"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="sr-only">إرجاع الشريط الجانبي</span>
            </button>
          </div>
        ) : (
          /* Expanded Header */
          <div className="px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 text-base font-black shadow-md shadow-emerald-500/20 shrink-0">
                🏛️
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-black text-white tracking-tight leading-tight">نقاء البصرة & صوت الجنوب</h2>
                <span className="text-[10px] font-semibold text-emerald-400 tracking-wider">التخليص والصندوق المشترك</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Desktop Collapse Button */}
              <button
                type="button"
                onClick={() => setSidebarMode('collapsed')}
                className="hidden lg:flex p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition group"
                title="طي الشريط الجانبي (تصغير)"
              >
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                <span className="sr-only">طي الشريط الجانبي</span>
              </button>

              {/* Mobile Close Button */}
              <button 
                type="button"
                onClick={() => setMobileOpen(false)} 
                className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Dual Company Indicator Widget (Expanded Only - Compact 1-line strip) */}
        {!isCollapsed && (
          <div className="mx-3 mt-2 px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-[10px] font-bold shrink-0">
            <span className="text-emerald-400 flex items-center gap-1">🌿 نقاء البصرة</span>
            <span className="text-slate-600 text-[9px]">•</span>
            <span className="text-cyan-400 flex items-center gap-1">⚓ صوت الجنوب</span>
          </div>
        )}

        {/* Navigation Items (Auto-Fit without scrollbar) */}
        <nav className={`flex-1 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] space-y-1 ${isCollapsed ? 'p-1.5' : 'px-3 py-2'}`}>
          {navItems.map((item) => {
            const isAllowed = currentUser.role === 'admin' || (
              currentUser.permissions?.[item.tabPermission] !== false
            );
            if (!isAllowed) {
              return null;
            }

            const Icon = item.icon;
            const isActive = activePage === item.id;

            if (isCollapsed) {
              return (
                <div key={item.id} className="relative group flex justify-center">
                  <button
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                    }`}
                    title={item.label}
                  >
                    <Icon className="w-4 h-4" />
                  </button>

                  {/* Tooltip on Hover */}
                  <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xl border border-slate-700 whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.label}
                  </div>
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-xs transition-all text-right ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm shadow-emerald-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span className="flex-1 truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer (Compact 1-line format) */}
        {isCollapsed ? (
          <div className="p-1.5 border-t border-slate-800/80 bg-slate-950/40 flex flex-col items-center gap-1 shrink-0">
            {onOpenCalendar && (
              <button
                type="button"
                onClick={onOpenCalendar}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition"
                title={`التقويم الكمركي: ${today}`}
              >
                <CalendarIcon className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setSidebarMode('hidden')}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
              title="إخفاء الشريط بالكامل (ملء الشاشة)"
            >
              <PanelRightClose className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="px-3 py-2 border-t border-slate-800/80 bg-slate-950/50 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
            <span className="text-[10px] text-slate-400 font-medium truncate" title={today}>
              📅 {today}
            </span>
            {onOpenCalendar && (
              <button
                type="button"
                onClick={onOpenCalendar}
                className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition text-[10px] shrink-0 hover:underline"
                title="فتح التقويم الكمركي"
              >
                <CalendarIcon className="w-3 h-3" />
                <span>التقويم</span>
              </button>
            )}
          </div>
        )}

      </aside>
    </>
  );
};
