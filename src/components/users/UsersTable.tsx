import React from 'react';
import { 
  KeyRound, 
  Eye, 
  EyeOff, 
  Check, 
  Copy, 
  Layers, 
  UserCheck, 
  Edit2, 
  Trash2 
} from 'lucide-react';
import { AppUser } from '../../types/customs';
import { formatRelativeTime } from '../../utils/storage';

interface UsersTableProps {
  users: AppUser[];
  currentUser: AppUser;
  revealedPasswords: Record<string, boolean>;
  toggleRevealPassword: (id: string) => void;
  handleCopyCredentials: (usr: AppUser) => void;
  copiedId: string | null;
  setViewingPermsUser: (usr: AppUser) => void;
  countAllowedTabs: (usr: AppUser) => number;
  onSwitchUser: (usr: AppUser) => void;
  onEditUser: (usr: AppUser) => void;
  onDeleteUser: (usr: AppUser) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  currentUser,
  revealedPasswords,
  toggleRevealPassword,
  handleCopyCredentials,
  copiedId,
  setViewingPermsUser,
  countAllowedTabs,
  onSwitchUser,
  onEditUser,
  onDeleteUser,
}) => {
  return (
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
            {users.map((usr, idx) => {
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
  );
};
