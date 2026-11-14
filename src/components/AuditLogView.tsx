'use client';

import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Printer, 
  Download, 
  Ban, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Lock, 
  Calendar, 
  User, 
  FileText, 
  Coins, 
  Landmark, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Eye, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { AuditLogEntry, AuditAction, AuditEntityType, AppUser } from '../types/customs';
import { formatCurrency, formatRelativeTime } from '../utils/storage';
import { DatePicker } from './ui/date-picker';

interface AuditLogViewProps {
  auditLogs: AuditLogEntry[];
  currentUser: AppUser;
  users: AppUser[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  auditLogs = [],
  currentUser,
  users = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedEntity, setSelectedEntity] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Detail Modal State
  const [inspectEntry, setInspectEntry] = useState<AuditLogEntry | null>(null);
  
  // Print Report State
  const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesRef = log.entityReference?.toLowerCase().includes(q);
        const matchesTitle = log.title?.toLowerCase().includes(q);
        const matchesDetails = log.details?.toLowerCase().includes(q);
        const matchesUser = log.userName?.toLowerCase().includes(q);
        const matchesReason = log.cancelReason?.toLowerCase().includes(q);
        if (!matchesRef && !matchesTitle && !matchesDetails && !matchesUser && !matchesReason) {
          return false;
        }
      }

      // Action Filter
      if (selectedAction !== 'all' && log.action !== selectedAction) {
        return false;
      }

      // Entity Filter
      if (selectedEntity !== 'all' && log.entityType !== selectedEntity) {
        return false;
      }

      // User Filter
      if (selectedUser !== 'all' && log.userId !== selectedUser && log.userName !== selectedUser) {
        return false;
      }

      // Date Range Filter
      if (startDate) {
        const logDate = log.timestamp.split('T')[0];
        if (logDate < startDate) return false;
      }
      if (endDate) {
        const logDate = log.timestamp.split('T')[0];
        if (logDate > endDate) return false;
      }

      return true;
    });
  }, [auditLogs, searchTerm, selectedAction, selectedEntity, selectedUser, startDate, endDate]);

  // Statistics
  const stats = useMemo(() => {
    const total = auditLogs.length;
    const voidCount = auditLogs.filter(l => l.action === 'void').length;
    const financialCount = auditLogs.filter(l => 
      l.entityType === 'receipt' || l.entityType === 'treasury' || l.entityType === 'account_expense'
    ).length;
    const securityCount = auditLogs.filter(l => 
      l.entityType === 'user' || l.entityType === 'system' || l.action === 'auth'
    ).length;

    return { total, voidCount, financialCount, securityCount };
  }, [auditLogs]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['المعرف', 'التاريخ والوقت', 'المستخدم', 'الرتبة', 'نوع العملية', 'الجهة', 'المرجع', 'العنوان', 'التفاصيل', 'سبب الإلغاء'];
    const rows = filteredLogs.map(l => [
      l.id,
      new Date(l.timestamp).toLocaleString('ar-IQ'),
      l.userName,
      l.userRole,
      l.action,
      l.entityType,
      l.entityReference || '-',
      `"${l.title.replace(/"/g, '""')}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${(l.cancelReason || '-').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `audit_log_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const getActionBadge = (action: AuditAction) => {
    switch (action) {
      case 'void':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <Ban className="w-3.5 h-3.5" />
            <span>إلغاء دفتري (Void)</span>
          </span>
        );
      case 'create':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>إضافة وقيد جديد</span>
          </span>
        );
      case 'update':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <Edit3 className="w-3.5 h-3.5" />
            <span>تعديل بيانات</span>
          </span>
        );
      case 'delete':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600/20 text-red-300 border border-red-600/40">
            <Trash2 className="w-3.5 h-3.5" />
            <span>حذف إداري</span>
          </span>
        );
      case 'print':
      case 'export':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة وتصدير</span>
          </span>
        );
      case 'auth':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>أمان وصلاحيات</span>
          </span>
        );
    }
  };

  const getEntityBadge = (entity: AuditEntityType) => {
    switch (entity) {
      case 'bill':
        return <span className="text-slate-300 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[11px] font-mono">بوليصة كمركية</span>;
      case 'receipt':
        return <span className="text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded text-[11px] font-mono">سند / وصل</span>;
      case 'treasury':
        return <span className="text-teal-300 bg-teal-950/60 border border-teal-800/60 px-2 py-0.5 rounded text-[11px] font-mono">صندوق الشركة</span>;
      case 'account_expense':
        return <span className="text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded text-[11px] font-mono">مصروفات / رواتب</span>;
      case 'customer':
        return <span className="text-blue-300 bg-blue-950/60 border border-blue-800/60 px-2 py-0.5 rounded text-[11px] font-mono">عميل / زبون</span>;
      case 'employee':
        return <span className="text-purple-300 bg-purple-950/60 border border-purple-800/60 px-2 py-0.5 rounded text-[11px] font-mono">موظف / مخلص</span>;
      case 'user':
        return <span className="text-rose-300 bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded text-[11px] font-mono">مستخدم ونظام</span>;
      default:
        return <span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded text-[11px] font-mono">النظام العام</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner & Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  سجل التدقيق والرقابة المحاسبية
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Audit Log & Compliance
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                سجل إلكتروني رقابي غير قابل للتعديل يوثق جميع العمليات المالية، الإلغاءات الدفترية، حركة الصندوق، وتعديل صلاحيات المستخدمين بدقة متناهية.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>سجل محمي ومقفل محاسبياً (Immutable)</span>
            </div>

            <button
              onClick={() => setIsPrintReportOpen(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold rounded-xl transition text-xs flex items-center gap-2 shadow-sm"
              title="طباعة تقرير التدقيق الرقابي"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>طباعة كشف التدقيق</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              title="تصدير السجل بصيغة CSV للمدقق الخارجي"
            >
              <Download className="w-4 h-4" />
              <span>تصدير إلى CSV</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>إجمالي العمليات الموثقة</span>
            </div>
            <div className="text-xl font-black text-white font-mono">{stats.total}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/20">
            <div className="text-xs text-rose-400 mb-1 flex items-center gap-1.5">
              <Ban className="w-3.5 h-3.5 text-rose-400" />
              <span>العمليات الملغاة دفترياً</span>
            </div>
            <div className="text-xl font-black text-rose-300 font-mono">{stats.voidCount}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
            <div className="text-xs text-emerald-400 mb-1 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-emerald-400" />
              <span>القيود المالية وحركات الخزينة</span>
            </div>
            <div className="text-xl font-black text-emerald-300 font-mono">{stats.financialCount}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
            <div className="text-xs text-amber-400 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>عمليات الأمان والمستخدمين</span>
            </div>
            <div className="text-xl font-black text-amber-300 font-mono">{stats.securityCount}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث برقم البوليصة، رقم السند، اسم المستخدم، سبب الإلغاء، أو تفاصيل الحركة..."
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

          {/* Action Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">جميع أنواع الإجراءات</option>
              <option value="void">⛔ إلغاء دفتري (Void)</option>
              <option value="create">➕ إنشاء وقيد جديد</option>
              <option value="update">✏️ تعديل بيانات</option>
              <option value="delete">🗑️ حذف إداري</option>
              <option value="print">🖨️ طباعة وتصدير</option>
              <option value="auth">🛡️ أمان ونظام</option>
            </select>
          </div>

          {/* Entity Type Filter */}
          <div>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="w-full md:w-auto bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">جميع الأقسام والسجلات</option>
              <option value="bill">بوالص ومعاملات كمركية</option>
              <option value="treasury">صندوق الشركة والخزينة</option>
              <option value="receipt">وصولات وسندات</option>
              <option value="account_expense">حسابات ومصروفات ورواتب</option>
              <option value="customer">سجلات الزبائن</option>
              <option value="employee">موظفون ومخلصون</option>
              <option value="user">مستخدمون وصلاحيات</option>
            </select>
          </div>

          {/* User Filter */}
          <div>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full md:w-auto bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">جميع المستخدمين</option>
              {users.map(u => (
                <option key={u.id} value={u.name}>
                  {u.name} ({u.roleTitle})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2 flex-wrap">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="shrink-0">نطاق التاريخ:</span>
            <div className="w-[160px] sm:w-[175px]">
              <DatePicker
                value={startDate}
                onChange={setStartDate}
                placeholder="من تاريخ..."
              />
            </div>
            <span className="shrink-0">إلى</span>
            <div className="w-[160px] sm:w-[175px]">
              <DatePicker
                value={endDate}
                onChange={setEndDate}
                placeholder="إلى تاريخ..."
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="p-1 text-slate-400 hover:text-white"
                title="إعادة تعيين التاريخ"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-slate-400">
            تم العثور على <span className="font-bold text-emerald-400">{filteredLogs.length}</span> عملية مطابقة
          </div>
        </div>
      </div>

      {/* Audit Log Entries List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-200">لا توجد سجلات تدقيق تطابق معايير البحث</h3>
            <p className="text-xs text-slate-500 mt-1">جرّب تغيير فلاتر التاريخ، أو نوع العملية، أو تفريغ خانة البحث.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredLogs.map((log) => {
              const isVoid = log.action === 'void';
              return (
                <div 
                  key={log.id} 
                  className={`p-4 sm:p-5 hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isVoid ? 'bg-rose-950/10' : ''
                  }`}
                >
                  {/* Left block: Icon, User info, and Content */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="pt-0.5">
                      {getActionBadge(log.action)}
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {log.title}
                        </span>
                        {log.entityReference && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-800 text-amber-300 border border-slate-700">
                            {log.entityReference}
                          </span>
                        )}
                        {getEntityBadge(log.entityType)}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed break-words">
                        {log.details}
                      </p>

                      {/* Cancel Reason Box if voided */}
                      {isVoid && log.cancelReason && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-medium mt-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span>سبب الإلغاء:</span>
                          <span className="font-bold text-rose-200">{log.cancelReason}</span>
                        </div>
                      )}

                      {/* Financial Impact if any */}
                      {log.financialImpact?.balanceChange && (
                        <div className="text-[11px] font-mono text-teal-300 flex items-center gap-1.5 mt-1">
                          <Coins className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span>الأثر المالي: {log.financialImpact.balanceChange}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right block: User, Timestamp, Inspect Action */}
                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-xs font-bold text-slate-200">{log.userName}</span>
                        <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs">
                          👤
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 justify-end mt-0.5">
                        <span className="font-mono">{formatRelativeTime(log.timestamp)}</span>
                        <span>•</span>
                        <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setInspectEntry(log)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition text-xs flex items-center gap-1.5 border border-slate-700/80"
                      title="معاينة تفاصيل سجل التدقيق"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>فحص</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= INSPECT MODAL ================= */}
      {inspectEntry && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">بطاقة التحقق والتدقيق الرقابي</h3>
                  <span className="text-[11px] font-mono text-slate-400">معرف السجل: {inspectEntry.id}</span>
                </div>
              </div>

              <button
                onClick={() => setInspectEntry(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 text-xs">
              
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-slate-400 block mb-1">نوع الحركة الرقابية</span>
                  <div>{getActionBadge(inspectEntry.action)}</div>
                </div>
                <div className="text-left">
                  <span className="text-slate-400 block mb-1">القسم المعني</span>
                  <div>{getEntityBadge(inspectEntry.entityType)}</div>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-slate-400 font-semibold block">العنوان والتوصيف</span>
                <div className="text-slate-100 font-bold text-sm bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  {inspectEntry.title}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-slate-400 font-semibold block">البيان والتفاصيل المحاسبية</span>
                <div className="text-slate-200 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 leading-relaxed font-sans">
                  {inspectEntry.details}
                </div>
              </div>

              {inspectEntry.cancelReason && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                  <span className="text-rose-400 font-bold block mb-1">سبب الإلغاء الدفتري المحاسبي:</span>
                  <div className="text-rose-200 font-medium">{inspectEntry.cancelReason}</div>
                </div>
              )}

              {inspectEntry.financialImpact && (
                <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 space-y-1">
                  <span className="text-teal-400 font-bold block">الأثر المالي المترتب على الحركة:</span>
                  {inspectEntry.financialImpact.amount !== undefined && (
                    <div className="text-teal-200 font-mono">
                      المبلغ المالي: {formatCurrency(inspectEntry.financialImpact.amount)}
                    </div>
                  )}
                  {inspectEntry.financialImpact.balanceChange && (
                    <div className="text-teal-200 font-mono">
                      تأثير الصندوق: {inspectEntry.financialImpact.balanceChange}
                    </div>
                  )}
                </div>
              )}

              {/* Security Details Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block mb-0.5">المستخدم المنفذ:</span>
                  <span className="text-slate-200 font-bold">{inspectEntry.userName}</span>
                  <span className="text-[11px] text-slate-400 block">({inspectEntry.userRole})</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block mb-0.5">التوقيت الدقيق (ISO):</span>
                  <span className="text-slate-200 font-mono text-[11px] block">{new Date(inspectEntry.timestamp).toLocaleString('ar-IQ')}</span>
                  <span className="text-emerald-400 text-[10px] flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>سجل موثق ومختوم رقمياً</span>
                  </span>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>غير قابل للتعديل أو الحذف (Tamper-Proof)</span>
              </div>

              <button
                onClick={() => setInspectEntry(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition text-xs"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= PRINT REPORT MODAL ================= */}
      {isPrintReportOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto">
            
            {/* Header controls (Screen only) */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between print:hidden bg-slate-900">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">معاينة وطباعة كشف التدقيق والرقابة المحاسبية</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة فورية</span>
                </button>
                <button
                  onClick={() => setIsPrintReportOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition text-xs"
                >
                  إغلاق
                </button>
              </div>
            </div>

            {/* Printable Document Area */}
            <div className="p-8 bg-white text-slate-950 font-sans print:p-0 print:m-0">
              
              {/* Document Header */}
              <div className="border-b-2 border-slate-900 pb-5 mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">مكتب النجم للتخليص الكمركي والنقل العام</h2>
                  <p className="text-xs text-slate-600 mt-0.5">قسم الرقابة المالية والتدقيق الداخلي • كشف حركات النظام</p>
                  <div className="text-[11px] font-mono text-slate-500 mt-1">
                    تاريخ استخراج الكشف: {new Date().toLocaleDateString('ar-IQ', { dateStyle: 'full' })}
                  </div>
                </div>

                <div className="text-left font-mono text-xs">
                  <div className="p-2 border border-slate-400 rounded bg-slate-50">
                    <div>المستخرج: <span className="font-bold">{currentUser.name}</span></div>
                    <div>الصفة: {currentUser.roleTitle}</div>
                    <div>عدد العمليات: {filteredLogs.length}</div>
                  </div>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-4 gap-3 mb-5 text-center text-xs">
                <div className="p-2 bg-slate-100 rounded border border-slate-200">
                  <div className="text-slate-500">إجمالي الحركات</div>
                  <div className="font-black text-sm">{stats.total}</div>
                </div>
                <div className="p-2 bg-rose-50 rounded border border-rose-200 text-rose-900">
                  <div>ملغاة دفترياً</div>
                  <div className="font-black text-sm">{stats.voidCount}</div>
                </div>
                <div className="p-2 bg-emerald-50 rounded border border-emerald-200 text-emerald-900">
                  <div>حركات مالية</div>
                  <div className="font-black text-sm">{stats.financialCount}</div>
                </div>
                <div className="p-2 bg-amber-50 rounded border border-amber-200 text-amber-900">
                  <div>أمان ونظام</div>
                  <div className="font-black text-sm">{stats.securityCount}</div>
                </div>
              </div>

              {/* Report Table */}
              <table className="w-full text-right text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300">
                    <th className="p-2 border-l border-slate-300">التاريخ والوقت</th>
                    <th className="p-2 border-l border-slate-300">المستخدم</th>
                    <th className="p-2 border-l border-slate-300">الإجراء</th>
                    <th className="p-2 border-l border-slate-300">المرجع</th>
                    <th className="p-2 border-l border-slate-300">البيان والتفاصيل</th>
                    <th className="p-2">سبب الإلغاء والأثر</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.slice(0, 50).map((log, index) => (
                    <tr key={log.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="p-2 border-l border-slate-200 font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleString('ar-IQ')}
                      </td>
                      <td className="p-2 border-l border-slate-200 font-bold">
                        {log.userName}
                      </td>
                      <td className="p-2 border-l border-slate-200">
                        {log.action === 'void' ? '⛔ ملغي دفترياً' : log.action === 'create' ? '➕ إنشاء' : log.action === 'update' ? '✏️ تعديل' : '🛡️ نظام'}
                      </td>
                      <td className="p-2 border-l border-slate-200 font-mono font-bold">
                        {log.entityReference || '-'}
                      </td>
                      <td className="p-2 border-l border-slate-200">
                        <div className="font-bold">{log.title}</div>
                        <div className="text-[11px] text-slate-600">{log.details}</div>
                      </td>
                      <td className="p-2">
                        {log.cancelReason && (
                          <div className="text-rose-700 font-bold">سبب الإلغاء: {log.cancelReason}</div>
                        )}
                        {log.financialImpact?.balanceChange && (
                          <div className="text-teal-700 text-[11px] font-mono">{log.financialImpact.balanceChange}</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredLogs.length > 50 && (
                <div className="text-center text-xs text-slate-500 mt-2 font-mono">
                  * تم عرض أول 50 سجلاً من أصل {filteredLogs.length} سجلاً في هذه الصفحة.
                </div>
              )}

              {/* Signatures Footer */}
              <div className="mt-10 pt-5 border-t border-slate-300 grid grid-cols-3 gap-5 text-center text-xs">
                <div>
                  <div className="font-bold mb-8">مسؤول التدقيق والرقابة</div>
                  <div className="border-t border-dotted border-slate-400 pt-1">التوقيع والختم</div>
                </div>
                <div>
                  <div className="font-bold mb-8">المحاسب القانوني</div>
                  <div className="border-t border-dotted border-slate-400 pt-1">التوقيع والختم</div>
                </div>
                <div>
                  <div className="font-bold mb-8">إدارة المكتب والاعتماد</div>
                  <div className="border-t border-dotted border-slate-400 pt-1">التوقيع والختم</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
