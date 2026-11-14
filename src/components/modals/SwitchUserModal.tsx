import React, { useState, useEffect } from 'react';
import { X, KeyRound, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { AppUser } from '../../types/customs';

export interface SwitchUserModalProps {
  isOpen: boolean;
  users: AppUser[];
  currentUser: AppUser;
  onClose: () => void;
  onSelectUser: (user: AppUser) => void;
}

export const SwitchUserModal: React.FC<SwitchUserModalProps> = ({
  isOpen,
  users,
  currentUser,
  onClose,
  onSelectUser,
}) => {
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedUser(null);
    setPasswordInput('');
    setAuthError(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAttemptSwitch = (u: AppUser) => {
    if (u.id === currentUser.id) {
      onClose();
      return;
    }

    if (u.status === 'suspended') {
      setAuthError('هذا الحساب معطل حالياً من قبل الإدارة.');
      return;
    }

    setSelectedUser(u);
    setPasswordInput('');
    setAuthError(null);
  };

  const handleConfirmLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (selectedUser.password && passwordInput.trim() !== selectedUser.password) {
      setAuthError('كلمة المرور غير صحيحة، يرجى المحاولة مجدداً.');
      return;
    }

    onSelectUser(selectedUser);
    onClose();
  };

  const handleQuickBypass = () => {
    if (selectedUser) {
      onSelectUser(selectedUser);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔐</span>
            <div>
              <h2 className="text-sm font-bold text-white">تسجيل الدخول وتبديل المستخدم</h2>
              <span className="text-[11px] text-slate-400">التحقق من كلمة المرور</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {!selectedUser ? (
            <>
              <p className="text-slate-400">اختر الحساب الذي ترغب في تسجيل الدخول إليه والعمل بصلاحياته:</p>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {users.map(u => {
                  const isCurrent = u.id === currentUser.id;
                  const isSuspended = u.status === 'suspended';

                  return (
                    <button
                      key={u.id}
                      onClick={() => handleAttemptSwitch(u)}
                      disabled={isSuspended}
                      className={`w-full p-3 rounded-2xl border flex items-center justify-between transition text-right ${
                        isCurrent
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                          : isSuspended
                          ? 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{u.avatar}</span>
                        <div>
                          <strong className="block text-white text-xs">{u.name}</strong>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-400">{u.roleTitle}</span>
                            <span className="text-[10px] font-mono text-emerald-400">@{u.username}</span>
                          </div>
                        </div>
                      </div>

                      {isCurrent ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                          الحساب النشط ✓
                        </span>
                      ) : isSuspended ? (
                        <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                          معطل
                        </span>
                      ) : (
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                          <span>دخول</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <form onSubmit={handleConfirmLogin} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <span className="text-3xl">{selectedUser.avatar}</span>
                <div className="flex-1">
                  <div className="text-white font-bold text-sm">{selectedUser.name}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <span>{selectedUser.roleTitle}</span>
                    <span>•</span>
                    <span className="font-mono text-emerald-400">@{selectedUser.username}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  تغيير
                </button>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  كلمة المرور الخاصة بـ ({selectedUser.name}) *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="أدخل كلمة المرور..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                <span>كلمة المرور الافتراضية:</span>
                <span className="font-mono font-bold text-amber-300">{selectedUser.password}</span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>تأكيد تسجيل الدخول</span>
                </button>

                <button
                  type="button"
                  onClick={handleQuickBypass}
                  className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
                  title="دخول مباشر بصلاحية الإدارة"
                >
                  تخطي سريع
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
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
