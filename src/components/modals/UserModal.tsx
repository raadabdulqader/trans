import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Mail, 
  Phone, 
  AlertCircle
} from 'lucide-react';
import { AppUser, UserRole, UserPermissions } from '../../types/customs';
import { UserPermissionsEditor } from './UserPermissionsEditor';

export { SwitchUserModal } from './SwitchUserModal';
export type { SwitchUserModalProps } from './SwitchUserModal';

export interface UserModalProps {
  isOpen: boolean;
  initialData?: AppUser | null;
  onClose: () => void;
  onSave: (user: Omit<AppUser, 'id' | 'createdAt'> & { id?: string }) => void;
  onDelete?: (user: AppUser) => void;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  initialData,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'active' | 'suspended'>('active');
  const [role, setRole] = useState<UserRole>('employee');
  const [roleTitle, setRoleTitle] = useState('موظف متابعة وتخليص');
  const [avatar, setAvatar] = useState('👷');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active permissions subtab inside modal
  const [permsTab, setPermsTab] = useState<'tabs' | 'ops' | 'security'>('tabs');

  const [permissions, setPermissions] = useState<UserPermissions>({
    viewDashboard: true,
    viewTreasury: false,
    viewAccounts: false,
    viewCustomers: true,
    viewTransactions: true,
    viewEmployees: true,
    viewReceipts: true,
    viewReports: false,
    viewAuditLog: false,
    viewUsers: false,
    editTx: true,
    editSettled: false,
    createReceipts: true,
    createExpenses: false,
    disburseAdvance: false,
    settleAdvance: false,
    printVouchers: true,
    exportBackup: false,
    reports: false,
    manageUsers: false,
    treasury: false,
    deleteRecords: false,
    auditLog: false,
  });

  const rolePresets: Record<UserRole, { title: string; avatar: string; perms: UserPermissions }> = {
    admin: {
      title: 'مدير النظام (كامل الصلاحيات)',
      avatar: '👑',
      perms: { 
        viewDashboard: true,
        viewTreasury: true,
        viewAccounts: true,
        viewCustomers: true,
        viewTransactions: true,
        viewEmployees: true,
        viewReceipts: true,
        viewReports: true,
        viewAuditLog: true,
        viewUsers: true,
        editTx: true, 
        editSettled: true, 
        createReceipts: true,
        createExpenses: true,
        disburseAdvance: true,
        settleAdvance: true,
        printVouchers: true,
        exportBackup: true,
        reports: true, 
        manageUsers: true, 
        treasury: true,
        deleteRecords: true, 
        auditLog: true 
      },
    },
    accountant: {
      title: 'محاسب مالي رئيسي',
      avatar: '💼',
      perms: { 
        viewDashboard: true,
        viewTreasury: true,
        viewAccounts: true,
        viewCustomers: true,
        viewTransactions: true,
        viewEmployees: true,
        viewReceipts: true,
        viewReports: true,
        viewAuditLog: true,
        viewUsers: false,
        editTx: false, 
        editSettled: false, 
        createReceipts: true,
        createExpenses: true,
        disburseAdvance: true,
        settleAdvance: true,
        printVouchers: true,
        exportBackup: true,
        reports: true, 
        manageUsers: false, 
        treasury: true,
        deleteRecords: true, 
        auditLog: true 
      },
    },
    employee: {
      title: 'موظف متابعة وتخليص',
      avatar: '👷',
      perms: { 
        viewDashboard: true,
        viewTreasury: false,
        viewAccounts: false,
        viewCustomers: true,
        viewTransactions: true,
        viewEmployees: true,
        viewReceipts: true,
        viewReports: false,
        viewAuditLog: false,
        viewUsers: false,
        editTx: true, 
        editSettled: false, 
        createReceipts: true,
        createExpenses: false,
        disburseAdvance: false,
        settleAdvance: false,
        printVouchers: true,
        exportBackup: false,
        reports: false, 
        manageUsers: false, 
        treasury: false,
        deleteRecords: false, 
        auditLog: false 
      },
    },
    custom: {
      title: 'صلاحيات مخصصة',
      avatar: '⚙️',
      perms: { 
        viewDashboard: true,
        viewTreasury: false,
        viewAccounts: false,
        viewCustomers: true,
        viewTransactions: true,
        viewEmployees: false,
        viewReceipts: false,
        viewReports: false,
        viewAuditLog: false,
        viewUsers: false,
        editTx: false, 
        editSettled: false, 
        createReceipts: false,
        createExpenses: false,
        disburseAdvance: false,
        settleAdvance: false,
        printVouchers: false,
        exportBackup: false,
        reports: false, 
        manageUsers: false, 
        treasury: false,
        deleteRecords: false, 
        auditLog: false 
      },
    },
  };

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setUsername(initialData.username || '');
      setPassword(initialData.password || '');
      setEmail(initialData.email || '');
      setPhone(initialData.phone || '');
      setStatus(initialData.status || 'active');
      setRole(initialData.role || 'employee');
      setRoleTitle(initialData.roleTitle || '');
      setAvatar(initialData.avatar || '👤');
      
      const p = (initialData.permissions || {}) as Partial<UserPermissions>;
      const isAdmin = initialData.role === 'admin';
      const isAcc = initialData.role === 'accountant';

      setPermissions({
        viewDashboard: p.viewDashboard ?? true,
        viewTreasury: p.viewTreasury ?? (isAdmin || isAcc || !!p.treasury),
        viewAccounts: p.viewAccounts ?? (isAdmin || isAcc),
        viewCustomers: p.viewCustomers ?? true,
        viewTransactions: p.viewTransactions ?? true,
        viewEmployees: p.viewEmployees ?? true,
        viewReceipts: p.viewReceipts ?? true,
        viewReports: p.viewReports ?? (isAdmin || isAcc || !!p.reports),
        viewAuditLog: p.viewAuditLog ?? (isAdmin || isAcc || !!p.auditLog),
        viewUsers: p.viewUsers ?? (isAdmin || !!p.manageUsers),
        editTx: p.editTx ?? (isAdmin || !isAcc),
        editSettled: p.editSettled ?? isAdmin,
        createReceipts: p.createReceipts ?? true,
        createExpenses: p.createExpenses ?? (isAdmin || isAcc),
        disburseAdvance: p.disburseAdvance ?? (isAdmin || isAcc),
        settleAdvance: p.settleAdvance ?? (isAdmin || isAcc),
        printVouchers: p.printVouchers ?? true,
        exportBackup: p.exportBackup ?? (isAdmin || isAcc),
        reports: p.reports ?? (isAdmin || isAcc),
        treasury: p.treasury ?? (isAdmin || isAcc),
        manageUsers: p.manageUsers ?? isAdmin,
        deleteRecords: p.deleteRecords ?? (isAdmin || isAcc),
        auditLog: p.auditLog ?? (isAdmin || isAcc),
      });
      setErrorMessage(null);
    } else {
      setName('');
      setUsername('');
      setPassword('');
      setEmail('');
      setPhone('');
      setStatus('active');
      setRole('employee');
      setRoleTitle(rolePresets.employee.title);
      setAvatar(rolePresets.employee.avatar);
      setPermissions(rolePresets.employee.perms);
      setErrorMessage(null);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole !== 'custom') {
      const preset = rolePresets[newRole];
      setRoleTitle(preset.title);
      setAvatar(preset.avatar);
      setPermissions(preset.perms);
    } else {
      setRoleTitle('مخصص (تحديد يدوي)');
      setAvatar('⚙️');
    }
  };

  const handleGeneratePassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$%';
    let generated = '';
    for (let i = 0; i < 8; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
    setShowPassword(true);
  };

  const toggleAllTabs = (enable: boolean) => {
    setPermissions(prev => ({
      ...prev,
      viewDashboard: enable,
      viewTreasury: enable,
      viewAccounts: enable,
      viewCustomers: enable,
      viewTransactions: enable,
      viewEmployees: enable,
      viewReceipts: enable,
      viewReports: enable,
      viewAuditLog: enable,
      viewUsers: enable,
    }));
  };

  const toggleAllOps = (enable: boolean) => {
    setPermissions(prev => ({
      ...prev,
      editTx: enable,
      createReceipts: enable,
      createExpenses: enable,
      disburseAdvance: enable,
      settleAdvance: enable,
      editSettled: enable,
      printVouchers: enable,
      exportBackup: enable,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('يرجى إدخال اسم المستخدم الكامل.');
      return;
    }

    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '_');
    if (!cleanUsername) {
      setErrorMessage('يرجى إدخال اسم المستخدم لتسجيل الدخول (Username).');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('يرجى تعيين كلمة مرور للمستخدم.');
      return;
    }

    if (password.trim().length < 4) {
      setErrorMessage('يجب أن تتكون كلمة المرور من 4 خانات على الأقل.');
      return;
    }

    // Keep legacy mapped flags synchronized with tab permissions
    const finalPermissions: UserPermissions = {
      ...permissions,
      treasury: permissions.viewTreasury,
      reports: permissions.viewReports ?? false,
      auditLog: permissions.viewAuditLog ?? false,
      manageUsers: permissions.viewUsers ?? false,
    };

    onSave({
      id: initialData?.id,
      name: name.trim(),
      username: cleanUsername,
      password: password.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      status,
      role,
      roleTitle: roleTitle.trim() || 'موظف',
      avatar,
      permissions: finalPermissions,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[94vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{avatar}</span>
            <div>
              <h2 className="text-base font-bold text-white">
                {initialData ? 'تعديل بيانات المستخدم وتخصيص الصلاحيات' : 'إضافة مستخدم جديد للنظام وتحديد صلاحياته'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                تحديد التبويبات المسموحة والصلاحيات التشغيلية والمالية بدقة
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* User Basic Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">الاسم الكامل / المعروض *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: أحمد عبد الله / المدير العام"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                اسم الدخول (Username) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">@</span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                  placeholder="admin / ahmed_acc"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Credentials Box */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-bold flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <span>كلمة المرور السرية (Password) *</span>
              </label>

              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:underline font-mono"
              >
                <Sparkles className="w-3 h-3" />
                <span>توليد باسوورد عشوائي</span>
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور (4 خانات على الأقل)"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-emerald-500 focus:outline-none text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Role & Preset Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">الدور الوظيفي / الرتبة *</label>
              <select
                value={role}
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold focus:border-emerald-500 focus:outline-none"
              >
                <option value="admin">👑 مدير النظام (شامل)</option>
                <option value="accountant">💼 محاسب مالي رئيسي</option>
                <option value="employee">👷 موظف تخليص ومتابعة</option>
                <option value="custom">⚙️ مخصص (تحديد يدوي)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">المسمى الوظيفي بالعربية *</label>
              <input
                type="text"
                required
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="مثال: مسؤول تخليص كمركي"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">حالة الحساب</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'suspended')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-bold focus:border-emerald-500 focus:outline-none"
              >
                <option value="active">🟢 حساب نشط ومفعل</option>
                <option value="suspended">🔴 حساب معطل مؤقتاً</option>
              </select>
            </div>
          </div>

          {/* Contact Details (Email & Phone) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
                <Mail className="w-3 h-3" />
                <span>البريد الإلكتروني (اختياري)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@alnajm.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span>رقم الهاتف (اختياري)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0770..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* ================= COMPREHENSIVE PERMISSIONS SECTION ================= */}
          <UserPermissionsEditor
            permissions={permissions}
            setPermissions={setPermissions}
            permsTab={permsTab}
            setPermsTab={setPermsTab}
            onToggleAllTabs={toggleAllTabs}
            onToggleAllOps={toggleAllOps}
          />

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <div>
              {initialData && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(initialData)}
                  className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 font-bold rounded-xl transition text-xs flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف المستخدم</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition text-xs"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition text-xs shadow-lg shadow-emerald-500/20"
              >
                {initialData ? 'حفظ التعديلات' : 'إنشاء المستخدم'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
