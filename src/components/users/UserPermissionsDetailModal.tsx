import React from 'react';
import { X, Layers, Shield, Trash2, Edit2 } from 'lucide-react';
import { AppUser } from '../../types/customs';

interface UserPermissionsDetailModalProps {
  user: AppUser | null;
  onClose: () => void;
  onEditUser: (user: AppUser) => void;
}

export const UserPermissionsDetailModal: React.FC<UserPermissionsDetailModalProps> = ({
  user,
  onClose,
  onEditUser,
}) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl">
              {user.avatar}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>كشف صلاحيات: {user.name}</span>
                <span className="font-mono text-emerald-400 text-xs">@{user.username}</span>
              </h3>
              <span className="text-[11px] text-slate-400">{user.roleTitle}</span>
            </div>
          </div>

          <button
            onClick={onClose}
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
                { label: 'لوحة التحكم', allowed: user.role === 'admin' || user.permissions.viewDashboard !== false },
                { label: 'صندوق الشركة (الخزينة)', allowed: user.role === 'admin' || user.permissions.viewTreasury !== false },
                { label: 'الحسابات والمصاريف', allowed: user.role === 'admin' || user.permissions.viewAccounts !== false },
                { label: 'الزبائن وكشوف الحساب', allowed: user.role === 'admin' || user.permissions.viewCustomers !== false },
                { label: 'البوالص والمعاملات', allowed: user.role === 'admin' || user.permissions.viewTransactions !== false },
                { label: 'الموظفون والمخلصون', allowed: user.role === 'admin' || user.permissions.viewEmployees !== false },
                { label: 'الوصولات والأرشيف', allowed: user.role === 'admin' || user.permissions.viewReceipts !== false },
                { label: 'التقارير المالية', allowed: user.role === 'admin' || user.permissions.viewReports !== false },
                { label: 'سجل التدقيق (Audit Log)', allowed: user.role === 'admin' || user.permissions.viewAuditLog !== false },
                { label: 'المستخدمون والصلاحيات', allowed: user.role === 'admin' || user.permissions.viewUsers !== false },
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
                { label: 'إنشاء وتعديل البوالص', allowed: user.role === 'admin' || !!user.permissions.editTx },
                { label: 'إصدار سندات قبض ووصولات', allowed: user.role === 'admin' || user.permissions.createReceipts !== false },
                { label: 'تسجيل قيود صرف ومصاريف', allowed: user.role === 'admin' || !!user.permissions.createExpenses },
                { label: 'صرف سلف للمخلصين', allowed: user.role === 'admin' || !!user.permissions.disburseAdvance },
                { label: 'تسوية سلف المخلصين', allowed: user.role === 'admin' || !!user.permissions.settleAdvance },
                { label: 'تعديل السلف المصفاة', allowed: user.role === 'admin' || !!user.permissions.editSettled },
                { label: 'طباعة السندات والبوالص', allowed: user.role === 'admin' || user.permissions.printVouchers !== false },
                { label: 'تصدير البيانات والنسخ', allowed: user.role === 'admin' || !!user.permissions.exportBackup },
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
              {user.role === 'admin' || user.permissions.deleteRecords ? 'ممنوحة ✓' : 'محجوبة ✕'}
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onClose();
              onEditUser(user);
            }}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition text-xs flex items-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>تعديل صلاحيات هذا المستخدم</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition text-xs"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
