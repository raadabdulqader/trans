import React from 'react';
import { Search, Filter, Calendar, RotateCcw, X } from 'lucide-react';
import { AppUser } from '../../types/customs';
import { DatePicker } from '../ui/date-picker';

interface AuditLogFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedAction: string;
  setSelectedAction: (val: string) => void;
  selectedEntity: string;
  setSelectedEntity: (val: string) => void;
  selectedUser: string;
  setSelectedUser: (val: string) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  users: AppUser[];
  matchCount: number;
}

export const AuditLogFilters: React.FC<AuditLogFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedAction,
  setSelectedAction,
  selectedEntity,
  setSelectedEntity,
  selectedUser,
  setSelectedUser,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  users,
  matchCount,
}) => {
  return (
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
            {users.map((u) => (
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
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="p-1 text-slate-400 hover:text-white"
              title="إعادة تعيين التاريخ"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="text-slate-400">
          تم العثور على <span className="font-bold text-emerald-400">{matchCount}</span> عملية مطابقة
        </div>
      </div>
    </div>
  );
};
