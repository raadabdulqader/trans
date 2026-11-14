import React from 'react';
import { 
  Trash2, 
  Users, 
  ShieldCheck, 
  LayoutDashboard, 
  Landmark, 
  Coins, 
  Building2, 
  FileText, 
  Receipt, 
  BarChart3,
  CheckSquare,
  Square
} from 'lucide-react';
import { UserPermissions } from '../../types/customs';

export interface TabPermissionItem {
  key: keyof UserPermissions;
  label: string;
  icon: any;
  desc: string;
}

export interface OpPermissionItem {
  key: keyof UserPermissions;
  label: string;
  desc: string;
}

export const ALL_TABS_LIST: TabPermissionItem[] = [
  { key: 'viewDashboard', label: 'لوحة التحكم (Dashboard)', icon: LayoutDashboard, desc: 'استعراض الإحصائيات العامة ومؤشرات العمل' },
  { key: 'viewTreasury', label: 'صندوق الشركة (Treasury)', icon: Landmark, desc: 'استعراض سجل الصندوق والرصيد الحي والإيداعات' },
  { key: 'viewAccounts', label: 'الحسابات والمصروفات (Accounts)', icon: Coins, desc: 'استعراض حسابات الرواتب والإيجارات والمصاريف اليومية' },
  { key: 'viewTransactions', label: 'البوالص والمعاملات (Transactions)', icon: FileText, desc: 'استعراض جدول البوالص الكمركية وحالات الحاويات' },
  { key: 'viewCarriers', label: 'شركات النقل والنواقل (Carriers)', icon: Building2, desc: 'إدارة شركات النقل وأجور الشاحنات وتسديد الدفعات' },
  { key: 'viewCustomers', label: 'الزبائن والشركات (Customers)', icon: Building2, desc: 'استعراض دليل الزبائن وحساباتهم التجارية' },
  { key: 'viewEmployees', label: 'المخلصين والموظفين (Brokers/Staff)', icon: Users, desc: 'استعراض سجل المخلصين وسلفهم وكشوفات الحساب' },
  { key: 'viewReceipts', label: 'السندات والوصولات (Receipts)', icon: Receipt, desc: 'استعراض سجل سندات القبض والدفعات وسلف المخلصين' },
  { key: 'viewReports', label: 'التقارير المالية والأرباح (Reports)', icon: BarChart3, desc: 'استعراض تقارير أرباح البوالص والميزانية الموحدة' },
  { key: 'viewAuditLog', label: 'سجل التدقيق والرقابة (Audit Log)', icon: ShieldCheck, desc: 'استعراض سجل العمليات المحاسبية وتتبع الإلغاءات' },
  { key: 'viewUsers', label: 'إدارة المستخدمين والصلاحيات (Users)', icon: Users, desc: 'إدارة الحسابات وكلمات المرور والصلاحيات' },
];

export const OPERATIONAL_LIST: OpPermissionItem[] = [
  { key: 'createTransactions', label: 'إنشاء بوالص كمركية جديدة', desc: 'إمكانية إضافة معاملات وبوالص جديدة في النظام' },
  { key: 'editTx', label: 'تعديل بيانات البوالص غير المغلقة', desc: 'تعديل مبالغ العقود وأرقام الحاويات والملاحظات' },
  { key: 'editSettled', label: 'تعديل المعاملات المنجزة والخالصة', desc: 'صلاحية استثنائية لتعديل المعاملات المقفلة' },
  { key: 'createReceipts', label: 'إنشاء وتسجيل سندات القبض والدفعات', desc: 'إصدار وصولات استلام المبالغ من الزبائن' },
  { key: 'disburseAdvance', label: 'صرف السلف النقدية للمخلصين', desc: 'صرف نقدية من الصندوق عهدة للمخلصين الكمركيين' },
  { key: 'settleAdvance', label: 'تصفية وتسوية سلف المخلصين', desc: 'إثبات المصاريف الكمركية وتصفية عهدة المخلص' },
  { key: 'createExpenses', label: 'إنشاء قيود الصرف والمصروفات الإدارية', desc: 'صرف رواتب، إيجارات، ونثريات من الصندوق' },
  { key: 'manageCarriers', label: 'تسديد دفعات شركات النقل البري', desc: 'صرف دفعات نقدية وإدارة حسابات شركات النقل' },
  { key: 'printVouchers', label: 'معاينة وطباعة السندات والفواتير الرسمية', desc: 'طباعة سندات الصندوق وفواتير البوالص والمانفيست' },
  { key: 'exportBackup', label: 'تصدير واسترجاع النسخ الاحتياطية (Backup)', desc: 'تنزيل نسخة من قاعدة البيانات واستعادتها' },
];

interface UserPermissionsEditorProps {
  permissions: UserPermissions;
  setPermissions: React.Dispatch<React.SetStateAction<UserPermissions>>;
  permsTab: 'tabs' | 'ops' | 'security';
  setPermsTab: (tab: 'tabs' | 'ops' | 'security') => void;
  onToggleAllTabs: (grant: boolean) => void;
  onToggleAllOps: (grant: boolean) => void;
}

export const UserPermissionsEditor: React.FC<UserPermissionsEditorProps> = ({
  permissions,
  setPermissions,
  permsTab,
  setPermsTab,
  onToggleAllTabs,
  onToggleAllOps,
}) => {
  return (
    <div className="border border-slate-800 rounded-2xl bg-slate-950/80 overflow-hidden mt-2">
      {/* Permissions Tab Switcher Header */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPermsTab('tabs')}
            className={`px-3 py-1.5 rounded-xl font-bold transition text-xs flex items-center gap-1.5 ${
              permsTab === 'tabs'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>📑</span>
            <span>تبويبات النظام المسموحة (10 تبويبات)</span>
          </button>

          <button
            type="button"
            onClick={() => setPermsTab('ops')}
            className={`px-3 py-1.5 rounded-xl font-bold transition text-xs flex items-center gap-1.5 ${
              permsTab === 'ops'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>⚡</span>
            <span>الصلاحيات التشغيلية والمالية</span>
          </button>

          <button
            type="button"
            onClick={() => setPermsTab('security')}
            className={`px-3 py-1.5 rounded-xl font-bold transition text-xs flex items-center gap-1.5 ${
              permsTab === 'security'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/20'
            }`}
          >
            <span>🔒</span>
            <span>صلاحيات الحذف والأمان</span>
          </button>
        </div>

        {/* Quick Select Buttons */}
        <div className="flex items-center gap-1.5">
          {permsTab === 'tabs' && (
            <>
              <button
                type="button"
                onClick={() => onToggleAllTabs(true)}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-emerald-400 font-bold border border-slate-700"
              >
                تحديد كافة التبويبات
              </button>
              <button
                type="button"
                onClick={() => onToggleAllTabs(false)}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-400 hover:text-slate-200 border border-slate-700"
              >
                إلغاء التحديد
              </button>
            </>
          )}
          {permsTab === 'ops' && (
            <>
              <button
                type="button"
                onClick={() => onToggleAllOps(true)}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-emerald-400 font-bold border border-slate-700"
              >
                منح كل العمليات
              </button>
              <button
                type="button"
                onClick={() => onToggleAllOps(false)}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-400 hover:text-slate-200 border border-slate-700"
              >
                إلغاء التحديد
              </button>
            </>
          )}
        </div>
      </div>

      {/* Subtab Content: All System Tabs */}
      {permsTab === 'tabs' && (
        <div className="p-4 space-y-3">
          <div className="text-[11px] text-slate-400">
            حدد التبويبات التي تظهر لهذا الموظف في القائمة الجانبية (Sidebar) ويسمح له بدخولها:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
            {ALL_TABS_LIST.map((tab) => {
              const isChecked = permissions[tab.key] ?? false;
              const Icon = tab.icon;

              return (
                <label
                  key={tab.key}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition cursor-pointer ${
                    isChecked
                      ? 'bg-slate-900 border-emerald-500/40 text-slate-100'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => setPermissions({ ...permissions, [tab.key]: e.target.checked })}
                    className="mt-0.5 rounded text-emerald-500 focus:ring-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                      <Icon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{tab.label}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{tab.desc}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Subtab Content: Granular Operational Permissions */}
      {permsTab === 'ops' && (
        <div className="p-4 space-y-3">
          <div className="text-[11px] text-slate-400">
            حدد العمليات والوظائف المحاسبية والتشغيلية المسموح للموظف بتنفيذها داخل النظام:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
            {OPERATIONAL_LIST.map((op) => {
              const isChecked = permissions[op.key] ?? false;

              return (
                <label
                  key={op.key}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition cursor-pointer ${
                    isChecked
                      ? 'bg-slate-900 border-emerald-500/40 text-slate-100'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => setPermissions({ ...permissions, [op.key]: e.target.checked })}
                    className="mt-0.5 rounded text-emerald-500 focus:ring-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-white">{op.label}</div>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{op.desc}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Subtab Content: Security & Deletion Permissions */}
      {permsTab === 'security' && (
        <div className="p-4 space-y-3">
          <div className="text-[11px] text-slate-400">
            صلاحيات حساسة ومحصورة بالإدارة العليا والمحاسبين المعتمدين:
          </div>

          <div className="space-y-2.5">
            {/* Void & Delete Permission */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 cursor-pointer">
              <input
                type="checkbox"
                checked={permissions.deleteRecords ?? false}
                onChange={(e) => setPermissions({ ...permissions, deleteRecords: e.target.checked })}
                className="mt-1 rounded text-rose-500 focus:ring-0"
              />
              <div>
                <div className="font-bold text-xs text-rose-300 flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>صلاحية الإلغاء الدفتري والحذف المحاسبي (Critical Void/Delete)</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  تمنح الموظف صلاحية إلغاء سندات القبض، سلف المخلصين، وصولات الصندوق، وحذف البوالص الخالية من القيود المالية. إذا عُطلت، يُمنع الموظف من حذف أو إلغاء أي حركة مالية في النظام.
                </p>
              </div>
            </label>

            {/* Manage Users Permission */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={permissions.viewUsers ?? false}
                onChange={(e) => setPermissions({ 
                  ...permissions, 
                  viewUsers: e.target.checked,
                  manageUsers: e.target.checked
                })}
                className="mt-1 rounded text-emerald-500 focus:ring-0"
              />
              <div>
                <div className="font-bold text-xs text-white flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>إدارة المستخدمين والصلاحيات وكلمات المرور (Manage Users)</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  تسمح للمستخدم بإضافة مستخدمين جدد للنظام، تعيين وتغيير كلمات المرور، وتعديل مصفوفة الصلاحيات لكافة الموظفين.
                </p>
              </div>
            </label>

            {/* Audit Log Permission */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={permissions.viewAuditLog ?? false}
                onChange={(e) => setPermissions({ 
                  ...permissions, 
                  viewAuditLog: e.target.checked,
                  auditLog: e.target.checked
                })}
                className="mt-1 rounded text-emerald-500 focus:ring-0"
              />
              <div>
                <div className="font-bold text-xs text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>الاطلاع على سجل التدقيق والرقابة المحاسبية (Audit Log Access)</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  تسمح للمستخدم باستعراض ومراقبة الحركات المحاسبية الملغاة وتتبع من قام بكل عملية في النظام وطباعة تقرير التدقيق.
                </p>
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
