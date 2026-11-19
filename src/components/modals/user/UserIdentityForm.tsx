import React from 'react';
import { KeyRound, Sparkles, Eye, EyeOff, Mail, Phone } from 'lucide-react';
import { UserRole } from '../../../types/customs';

interface UserIdentityFormProps {
  name: string;
  setName: (v: string) => void;
  username: string;
  setUsername: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  onGeneratePassword: () => void;
  role: UserRole;
  onRoleChange: (r: UserRole) => void;
  roleTitle: string;
  setRoleTitle: (v: string) => void;
  status: 'active' | 'suspended';
  setStatus: (v: 'active' | 'suspended') => void;
  email: string;
  setEmail: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
}

export const UserIdentityForm: React.FC<UserIdentityFormProps> = ({
  name,
  setName,
  username,
  setUsername,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  onGeneratePassword,
  role,
  onRoleChange,
  roleTitle,
  setRoleTitle,
  status,
  setStatus,
  email,
  setEmail,
  phone,
  setPhone,
}) => {
  return (
    <>
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
            onClick={onGeneratePassword}
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
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
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
            placeholder="0770 123 4567"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>
    </>
  );
};
