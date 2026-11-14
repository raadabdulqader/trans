'use client';

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Users, 
  Shield, 
  ShieldCheck, 
  Check, 
  X, 
  Edit2, 
  Trash2, 
  UserCheck, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Copy, 
  Search, 
  Filter, 
  Lock, 
  Unlock, 
  Mail, 
  Phone, 
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  Landmark,
  FileText
} from 'lucide-react';
import { AppUser } from '../types/customs';
import { formatRelativeTime } from '../utils/storage';

interface UsersViewProps {
  users: AppUser[];
  currentUser: AppUser;
  onAddUser: () => void;
  onEditUser: (user: AppUser) => void;
  onDeleteUser: (user: AppUser) => void;
  onSwitchUser: (user: AppUser) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users = [],
  currentUser,
  onAddUser,
  onEditUser,
  onDeleteUser,
  onSwitchUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // State for showing passwords per user id
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewingPermsUser, setViewingPermsUser] = useState<AppUser | null>(null);

  const countAllowedTabs = (u: AppUser) => {
    if (u.role === 'admin') return 10;
    const p = u.permissions;
    let count = 0;
    if (p.viewDashboard !== false) count++;
    if (p.viewTreasury !== false) count++;
    if (p.viewAccounts !== false) count++;
    if (p.viewCustomers !== false) count++;
    if (p.viewTransactions !== false) count++;
    if (p.viewEmployees !== false) count++;
    if (p.viewReceipts !== false) count++;
    if (p.viewReports !== false) count++;
    if (p.viewAuditLog !== false) count++;
    if (p.viewUsers !== false) count++;
    return count;
  };

  const toggleRevealPassword = (id: string) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopyCredentials = (usr: AppUser) => {
    const text = `اسم المستخدم: ${usr.username}\nكلمة المرور: ${usr.password || 'غير معينة'}`;
    navigator.clipboard.writeText(text);
    setCopiedId(usr.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesUsername = u.username?.toLowerCase().includes(q);
        const matchesRole = u.roleTitle?.toLowerCase().includes(q);
        const matchesPhone = u.phone?.toLowerCase().includes(q);
        const matchesEmail = u.email?.toLowerCase().includes(q);
        if (!matchesName && !matchesUsername && !matchesRole && !matchesPhone && !matchesEmail) {
          return false;
        }
      }

      if (roleFilter !== 'all' && u.role !== roleFilter) {
        return false;
      }

      if (statusFilter !== 'all') {
        const userStatus = u.status || 'active';
        if (userStatus !== statusFilter) return false;
      }

      return true;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter(u => u.role === 'admin').length;
    const accountants = users.filter(u => u.role === 'accountant').length;
    const active = users.filter(u => (u.status || 'active') === 'active').length;

    return { total, admins, accountants, active };
  }, [users]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner & Header */}
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

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالاسم الكامل، اسم الدخول (Username)، الرتبة، أو الهاتف..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pr-10 pl-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">جميع الأدوار والرتب</option>
            <option value="admin">👑 مدير النظام (Admin)</option>
            <option value="accountant">💼 محاسب مالي</option>
            <option value="employee">👷 موظف تخليص</option>
            <option value="custom">⚙️ مخصص</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">🟢 نشط فقط</option>
            <option value="suspended">🔴 معطل مؤقتاً</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold">
                <th className="py-4 px-4">#</th>
                <th className="py-4 px-4">المستخدم والاسم</th>
                <th className="py-4 px-4">اسم الدخول (Username)</th>
                <th className="py-4 px-4">كلمة المرور (Password)</th>
                <th className="py-4 px-4">الرتبة والوظيفة</th>
                <th className="py-4 px-4 text-center">الصلاحيات المحاسبية</th>
                <th className="py-4 px-4 text-center">الحالة</th>
                <th className="py-4 px-4">آخر دخول</th>
                <th className="py-4 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((usr, idx) => {
                const isCurrent = usr.id === currentUser.id;
                const isRevealed = !!revealedPasswords[usr.id];
                const isSuspended = usr.status === 'suspended';

                return (
                  <tr 
                    key={usr.id} 
                    className={`hover:bg-slate-800/40 transition ${
                      isCurrent ? 'bg-emerald-500/5' : isSuspended ? 'opacity-70 bg-rose-950/5' : ''
                    }`}
                  >
                    <td className="py-4 px-4 font-mono text-slate-500">{idx + 1}</td>
                    
                    {/* User Avatar & Name */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg shrink-0">
                          {usr.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{usr.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                أنت الآن
                              </span>
                            )}
                          </div>
                          {(usr.email || usr.phone) && (
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              {usr.phone && <span>{usr.phone}</span>}
                              {usr.email && usr.phone && <span>•</span>}
                              {usr.email && <span>{usr.email}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Username */}
                    <td className="py-4 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300">
                        <span className="text-slate-500">@</span>
                        <span className="font-bold">{usr.username || `user_${usr.id.slice(-4)}`}</span>
                      </div>
                    </td>

                    {/* Password Field with Eye and Copy */}
                    <td className="py-4 px-4">
                      <div className="inline-flex items-center gap-2 p-1.5 px-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
                        <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="font-bold text-slate-200 min-w-16">
                          {isRevealed ? (usr.password || '******') : '••••••••'}
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => toggleRevealPassword(usr.id)}
                          className="p-1 text-slate-400 hover:text-slate-200 transition"
                          title={isRevealed ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyCredentials(usr)}
                          className="p-1 text-slate-400 hover:text-emerald-400 transition"
                          title="نسخ بيانات الدخول"
                        >
                          {copiedId === usr.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                        {usr.roleTitle}
                      </span>
                    </td>

                    {/* Permissions Badges */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingPermsUser(usr)}
                          className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 font-mono text-[11px] font-bold border border-slate-800 hover:border-slate-700 transition flex items-center gap-1.5 shadow-xs"
                          title="انقر لمعاينة كافة التبويبات والصلاحيات الممنوحة"
                        >
                          <Layers className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{countAllowedTabs(usr)} من 10 تبويبات</span>
                        </button>

                        <div className="flex flex-wrap items-center justify-center gap-1">
                          {usr.permissions.editTx && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700" title="إنشاء وتعديل البوالص">
                              بوالص
                            </span>
                          )}
                          {usr.permissions.createReceipts && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-800/60" title="إصدار وصولات وسندات قبض">
                              وصولات
                            </span>
                          )}
                          {usr.permissions.disburseAdvance && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-950/60 text-amber-300 border border-amber-800/60" title="صرف سلف للمخلصين">
                              سلف
                            </span>
                          )}
                          {usr.permissions.printVouchers && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-950/60 text-purple-300 border border-purple-800/60" title="طباعة السندات والبوالص">
                              طباعة
                            </span>
                          )}
                          {(usr.role === 'admin' || usr.permissions.deleteRecords) && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-950/70 text-rose-300 border border-rose-800/70 font-bold" title="صلاحية الإلغاء الدفتري والحذف المحاسبي">
                              حذف/إلغاء 🗑️
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      {isSuspended ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          معطل
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          نشط ✓
                        </span>
                      )}
                    </td>

                    {/* Last Login */}
                    <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                      {usr.lastLogin ? formatRelativeTime(usr.lastLogin) : 'لم يسجل بعد'}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {!isCurrent && (
                          <button
                            onClick={() => onSwitchUser(usr)}
                            title="تسجيل الدخول / التبديل لهذا الحساب"
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold transition flex items-center gap-1.5 border border-emerald-500/20"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>تبديل</span>
                          </button>
                        )}

                        <button
                          onClick={() => onEditUser(usr)}
                          title="تعديل المستخدم، اليوزرنيم، الباسوورد، والصلاحيات"
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDeleteUser(usr)}
                          title="حذف المستخدم نهائياً"
                          className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition border border-rose-500/20"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= VIEW USER PERMISSIONS MODAL ================= */}
      {viewingPermsUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl">
                  {viewingPermsUser.avatar}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>كشف صلاحيات: {viewingPermsUser.name}</span>
                    <span className="font-mono text-emerald-400 text-xs">@{viewingPermsUser.username}</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">{viewingPermsUser.roleTitle}</span>
                </div>
              </div>

              <button
                onClick={() => setViewingPermsUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
              
              {/* Section 1: All 10 System Tabs */}
              <div>
                <h4 className="font-bold text-white mb-2 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>التبويبات المسموحة في القائمة الجانبية (10 تبويبات)</span>
                </h4>
                
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'لوحة التحكم', allowed: viewingPermsUser.role === 'admin' || viewingPermsUser.permissions.viewDashboard !== false },
                    { label: 'صندوق الشركة (الخزينة)', allowed: viewingPermsUser.role === 'admin' || viewingPermsUser.permissions.viewTreasury !== false },
                    { label: 'الحسابات والمصاريف', allowed: viewingPermsUser.role === 'admin' || viewingPermsUser.permissions.viewAccounts !== false },
                    { label: 'الزبائن وكشوف الحساب', allowed: viewingPermsUser.role === 'admin' || viewingPermsUser.permissions.viewCustomers !== false },
                    { label: 'البوالص والمعاملات', allowed: viewingPermsUser.role === 'admin' || viewingPermsUser.permissions.viewTransactions !== false },
                    { label: 'الموظفون والمخلصون', allowed: viewingPermsUser.role === 'admin' || viewingPermsUser.permissions.viewEmployees !== false },
                    { label: 'الوصولات والأرشيف', allowed: viewingPermsUser.role === 'admin' || viewingPermsUser.permissions.viewReceipts !== false },
                    { label: 'التقارير المالية', allowed: viewingPermsUser.role === 'admin' || viewingPermsUser.permissions.viewReports !== false },
                    { label: 'سجل التدقيق (Audit Log)', allowed: viewingPermsUser.role === 'admin' || viewingPermsUser.permissions.viewAuditLog !== false },
                    { label: 'المستخدمون والصلاحيات', allowed: viewingPermsUser.role === 'admin' || viewingPermsUser.permissions.viewUsers !== false },
                  ].map((tab, idx) => (
                    <div 
                      key={idx}
                      className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        tab.allowed
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-500'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span>{tab.allowed ? 'مسموح ✓' : 'محظور ✕'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: Operational Permissions */}
              <div>
                <h4 className="font-bold text-white mb-2 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-sky-400" />
                  <span>الصلاحيات التشغيلية الممنوحة</span>
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'إنشاء وتعديل البوالص', allowed: viewingPermsUser.role === 'admin' || !!viewingPermsUser.permissions.editTx },
                    { label: 'إصدار سندات قبض ووصولات', allowed: viewingPermsUser.role === 'admin' || viewingPermsUser.permissions.createReceipts !== false },
                    { label: 'تسجيل قيود صرف ومصاريف', allowed: viewingPermsUser.role === 'admin' || !!viewingPermsUser.permissions.createExpenses },
                    { label: 'صرف سلف للمخلصين', allowed: viewingPermsUser.role === 'admin' || !!viewingPermsUser.permissions.disburseAdvance },
                    { label: 'تسوية سلف المخلصين', allowed: viewingPermsUser.role === 'admin' || !!viewingPermsUser.permissions.settleAdvance },
                    { label: 'تعديل السلف المصفاة', allowed: viewingPermsUser.role === 'admin' || !!viewingPermsUser.permissions.editSettled },
                    { label: 'طباعة السندات والبوالص', allowed: viewingPermsUser.role === 'admin' || viewingPermsUser.permissions.printVouchers !== false },
                    { label: 'تصدير البيانات والنسخ', allowed: viewingPermsUser.role === 'admin' || !!viewingPermsUser.permissions.exportBackup },
                  ].map((op, idx) => (
                    <div 
                      key={idx}
                      className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        op.allowed
                          ? 'bg-sky-950/20 border-sky-500/30 text-sky-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-500'
                      }`}
                    >
                      <span>{op.label}</span>
                      <span>{op.allowed ? 'مفعل ✓' : 'معطل ✕'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Critical Permissions */}
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
                <div>
                  <div className="font-bold text-rose-300 flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>صلاحية الحذف والإلغاء المالي (Void/Delete)</span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    إلغاء سندات القبض، سلف المخلصين، وصولات الصندوق، وحذف البوالص
                  </span>
                </div>
                <span className="px-3 py-1 rounded-xl font-bold font-mono text-xs bg-slate-950 border border-slate-800 text-rose-300">
                  {viewingPermsUser.role === 'admin' || viewingPermsUser.permissions.deleteRecords ? 'ممنوحة ✓' : 'محجوبة ✕'}
                </span>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const target = viewingPermsUser;
                  setViewingPermsUser(null);
                  onEditUser(target);
                }}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition text-xs flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>تعديل صلاحيات هذا المستخدم</span>
              </button>

              <button
                onClick={() => setViewingPermsUser(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition text-xs"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
