import React, { useState, useEffect } from 'react';
import { X, Trash2, AlertCircle } from 'lucide-react';
import { AppUser, UserRole, UserPermissions } from '../../types/customs';
import { UserPermissionsEditor } from './UserPermissionsEditor';
import { ROLE_PRESETS } from './user/UserRolePresets';
import { UserIdentityForm } from './user/UserIdentityForm';

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

  const [permissions, setPermissions] = useState<UserPermissions>(ROLE_PRESETS.employee.perms);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setUsername(initialData.username || '');
      setPassword(initialData.password || '');
      setEmail(initialData.email || '');
      setPhone(initialData.phone || '');
      setStatus(initialData.status || 'active');
      setRole(initialData.role || 'employee');
      setRoleTitle(initialData.roleTitle || 'موظف');
      setAvatar(initialData.avatar || '👤');
      
      const p = initialData.permissions;
      setPermissions({
        viewDashboard: p.viewDashboard !== false,
        viewTreasury: p.viewTreasury !== false,
        viewAccounts: p.viewAccounts !== false,
        viewCustomers: p.viewCustomers !== false,
        viewTransactions: p.viewTransactions !== false,
        viewEmployees: p.viewEmployees !== false,
        viewReceipts: p.viewReceipts !== false,
        viewReports: p.viewReports !== false,
        viewAuditLog: p.viewAuditLog !== false,
        viewUsers: p.viewUsers !== false,
        editTx: !!p.editTx,
        editSettled: !!p.editSettled,
        createReceipts: p.createReceipts !== false,
        createExpenses: !!p.createExpenses,
        disburseAdvance: !!p.disburseAdvance,
        settleAdvance: !!p.settleAdvance,
        printVouchers: p.printVouchers !== false,
        exportBackup: !!p.exportBackup,
        reports: !!p.reports,
        manageUsers: !!p.manageUsers,
        treasury: !!p.treasury,
        deleteRecords: !!p.deleteRecords,
        auditLog: !!p.auditLog,
      });
      setErrorMessage(null);
    } else {
      setName('');
      setUsername('');
      setPassword('user123');
      setShowPassword(false);
      setEmail('');
      setPhone('');
      setStatus('active');
      setRole('employee');
      setRoleTitle(ROLE_PRESETS.employee.title);
      setAvatar(ROLE_PRESETS.employee.avatar);
      setPermissions(ROLE_PRESETS.employee.perms);
      setErrorMessage(null);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole !== 'custom') {
      const preset = ROLE_PRESETS[newRole];
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

          <UserIdentityForm
            name={name}
            setName={setName}
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            onGeneratePassword={handleGeneratePassword}
            role={role}
            onRoleChange={handleRoleChange}
            roleTitle={roleTitle}
            setRoleTitle={setRoleTitle}
            status={status}
            setStatus={setStatus}
            email={email}
            setEmail={setEmail}
            phone={phone}
            setPhone={setPhone}
          />

          {/* Permissions Editor Component */}
          <UserPermissionsEditor
            permissions={permissions}
            setPermissions={setPermissions}
            permsTab={permsTab}
            setPermsTab={setPermsTab}
            onToggleAllTabs={toggleAllTabs}
            onToggleAllOps={toggleAllOps}
          />

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800 shrink-0">
            {initialData && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(initialData);
                  onClose();
                }}
                className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl font-bold flex items-center gap-1.5 transition text-xs border border-rose-500/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف المستخدم</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20"
              >
                {initialData ? 'حفظ التعديلات' : 'إضافة وتفعيل المستخدم'}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
