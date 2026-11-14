import React from 'react';
import { Users, Plus, Coins } from 'lucide-react';
import { Employee } from '../../types/customs';
import { formatCurrency } from '../../utils/storage';

export interface StaffPayrollRosterProps {
  companyStaff: Employee[];
  onAddEmployee?: () => void;
  onPaySalary?: (emp: Employee) => void;
}

export const StaffPayrollRoster: React.FC<StaffPayrollRosterProps> = ({
  companyStaff,
  onAddEmployee,
  onPaySalary,
}) => {
  if (companyStaff.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-lg space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>كادر وموظفو الشركة المسجلون</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {companyStaff.length} موظف
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              صرف الراتب المباشر مع استدعاء الراتب الأساسي والتوثيق بسند الخزينة التلقائي
            </p>
          </div>
        </div>
        {onAddEmployee && (
          <button
            onClick={onAddEmployee}
            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ إضافة موظف جديد</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
        {companyStaff.map((emp) => (
          <div
            key={emp.id}
            className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between hover:border-slate-700 transition"
          >
            <div>
              <div className="font-bold text-xs text-white flex items-center gap-1.5">
                <span>{emp.name}</span>
                {emp.jobTitle && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {emp.jobTitle}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                <span>
                  الأساسي:{' '}
                  <strong className="text-emerald-400 font-mono" dir="ltr">
                    {formatCurrency(emp.baseSalary || 0)}
                  </strong>
                </span>
                {emp.department && <span className="text-slate-500">• {emp.department}</span>}
              </div>
            </div>
            {onPaySalary && (
              <button
                onClick={() => onPaySalary(emp)}
                className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-[11px] transition shrink-0 flex items-center gap-1 shadow-md shadow-emerald-500/10"
                title={`صرف راتب ${emp.name}`}
              >
                <Coins className="w-3 h-3" />
                <span>صرف راتب</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
