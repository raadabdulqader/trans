'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Landmark,
  Coins,
  Building2, 
  FileText, 
  HardHat, 
  Receipt as ReceiptIcon, 
  BarChart3, 
  Users, 
  ShieldCheck,
  Calendar as CalendarIcon,
  Truck,
  X
} from 'lucide-react';
import { AppUser, UserPermissions } from '../types/customs';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  currentUser: AppUser;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  onOpenCalendar?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  currentUser,
  mobileOpen,
  setMobileOpen,
  onOpenCalendar,
}) => {
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
    weekday: 'long',
    year: 'numeric',
    month: 'long',
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

      <aside className={`fixed lg:sticky top-0 right-0 h-screen w-72 bg-slate-900 border-l border-slate-800 flex flex-col z-50 transition-transform duration-200 select-none ${
        mobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}>
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 text-xl font-black shadow-lg shadow-emerald-500/20 shrink-0">
              🏛️
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-tight leading-tight">نقاء البصرة & صوت الجنوب</h2>
              <span className="text-[11px] font-semibold text-emerald-400 tracking-wider">التخليص والصندوق المشترك</span>
            </div>
          </div>

          <button 
            onClick={() => setMobileOpen(false)} 
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dual Company Indicator Widget */}
        <div className="mx-3.5 mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] space-y-1">
          <div className="flex items-center justify-between font-bold">
            <span className="text-emerald-400 flex items-center gap-1">🌿 نقاء البصرة</span>
            <span className="text-cyan-400 flex items-center gap-1">⚓ صوت الجنوب</span>
          </div>
          <div className="text-[10px] text-slate-500 text-center border-t border-slate-800/80 pt-1">
            صندوق ورأس مال مالي موحد
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isAllowed = currentUser.role === 'admin' || (
              currentUser.permissions?.[item.tabPermission] !== false
            );
            if (!isAllowed) {
              return null;
            }

            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all text-right ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span className="flex-1">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer with date & calendar trigger */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-xs text-slate-400">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span>التاريخ الحالي:</span>
            {onOpenCalendar && (
              <button
                type="button"
                onClick={onOpenCalendar}
                className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition text-[10px]"
              >
                <CalendarIcon className="w-3 h-3" />
                <span>فتح التقويم</span>
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onOpenCalendar}
            className="w-full text-right font-medium text-slate-300 hover:text-white transition flex items-center justify-between gap-1 group"
          >
            <span>{today}</span>
            <CalendarIcon className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition" />
          </button>
        </div>
      </aside>
    </>
  );
};
