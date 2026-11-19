import React from 'react';
import { Users, BadgeDollarSign, Edit2, Trash2 } from 'lucide-react';
import { Employee, AppUser } from '../../types/customs';
import { formatCurrency } from '../../utils/storage';

interface StaffTableProps {
  filteredEmployees: Employee[];
  currentUser: AppUser;
  getEmployeePaidSalaries: (emp: Employee) => number;
  onPaySalary?: (emp: Employee) => void;
  onEditEmployee: (emp: Employee) => void;
  onDeleteEmployee: (emp: Employee) => void;
}

export const StaffTable: React.FC<StaffTableProps> = ({
  filteredEmployees,
  currentUser,
  getEmployeePaidSalaries,
  onPaySalary,
  onEditEmployee,
  onDeleteEmployee,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-bold text-white">قائمة موظفي وكادر الشركة والرواتب</h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          العدد: <strong className="text-blue-400 font-bold">{filteredEmployees.length}</strong> موظف
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold">
              <th className="py-3.5 px-4">#</th>
              <th className="py-3.5 px-4">اسم الموظف</th>
              <th className="py-3.5 px-4">المسمى الوظيفي</th>
              <th className="py-3.5 px-4">القسم / الفرع</th>
              <th className="py-3.5 px-4">الراتب الأساسي الشهري</th>
              <th className="py-3.5 px-4">رقم الهاتف والهوية</th>
              <th className="py-3.5 px-4">تاريخ المباشرة</th>
              <th className="py-3.5 px-4">إجمالي الرواتب المستلمة</th>
              <th className="py-3.5 px-4 text-center">الإجراءات وصرف الراتب</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredEmployees.map((emp, idx) => {
              const paidTotal = getEmployeePaidSalaries(emp);

              return (
                <tr key={emp.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-mono text-slate-400">{idx + 1}</td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-sm">
                        👤
                      </div>
                      <div>
                        <strong className="block text-white text-xs font-bold">{emp.name}</strong>
                        <span className="text-[10px] text-slate-400">
                          {emp.category === 'both' ? 'موظف ومخلص كمركي' : 'موظف شركة'}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                      {emp.jobTitle || 'موظف عام'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-300">
                    {emp.department || 'الإدارة العامة'}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400" dir="ltr">
                    {formatCurrency(emp.baseSalary || 0)}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    <div>{emp.phone || '—'}</div>
                    {emp.idNo && <div className="text-[10px] text-slate-400 font-mono">هوية: {emp.idNo}</div>}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    {emp.joinDate || '—'}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-300" dir="ltr">
                    {paidTotal > 0 ? (
                      <span className="text-cyan-300 font-bold">{formatCurrency(paidTotal)}</span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">لم يصرف بعد</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {onPaySalary && (currentUser.role === 'admin' || currentUser.permissions.createExpenses !== false) && (
                        <button
                          onClick={() => onPaySalary(emp)}
                          title="صرف راتب فوري من الصندوق"
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <BadgeDollarSign className="w-3.5 h-3.5" />
                          <span>صرف راتب</span>
                        </button>
                      )}

                      <button
                        onClick={() => onEditEmployee(emp)}
                        title="تعديل بيانات الموظف والراتب"
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteEmployee(emp)}
                        title="حذف الموظف"
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition cursor-pointer"
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
