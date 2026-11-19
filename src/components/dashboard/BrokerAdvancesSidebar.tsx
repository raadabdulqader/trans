import React from 'react';
import { UserCheck } from 'lucide-react';
import { Employee } from '../../types/customs';
import { formatCurrency } from '../../utils/storage';

interface BrokerAdvancesSidebarProps {
  employeesWithOpenAdvances: Array<{
    employee: Employee;
    openIQD: number;
    advancesIQD: number;
    settledIQD: number;
    openUSD: number;
    advancesUSD: number;
    settledUSD: number;
  }>;
}

export const BrokerAdvancesSidebar: React.FC<BrokerAdvancesSidebarProps> = ({
  employeesWithOpenAdvances,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="pb-3 border-b border-slate-800">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <span>🏦</span> السلف المفتوحة للمخلصين
        </h3>
        <p className="text-[11px] text-slate-400 mt-1">مبالغ بانتظار تقديم وصولات التصفية (بالدينار والدولار)</p>
      </div>

      <div className="space-y-3">
        {employeesWithOpenAdvances.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            لا توجد سلف معلقة حالياً، جميع الحسابات مصفاة بالكامل ✅
          </div>
        ) : (
          employeesWithOpenAdvances.map(
            ({ employee, openIQD, advancesIQD, settledIQD, openUSD, advancesUSD, settledUSD }) => (
              <div key={employee.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    {employee.name}
                  </span>
                  <div className="text-left font-mono font-bold text-xs" dir="ltr">
                    {openIQD > 0 && <div className="text-rose-400">{formatCurrency(openIQD, 'IQD')}</div>}
                    {openUSD > 0 && <div className="text-amber-400">{formatCurrency(openUSD, 'USD')}</div>}
                  </div>
                </div>

                {advancesIQD > 0 && (
                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-900 pt-1.5">
                    <span>سلف (د.ع): {formatCurrency(advancesIQD, 'IQD')}</span>
                    <span>مصفى: {formatCurrency(settledIQD, 'IQD')}</span>
                  </div>
                )}
                {advancesUSD > 0 && (
                  <div className="flex items-center justify-between text-[11px] text-cyan-300/80 border-t border-slate-900 pt-1.5">
                    <span>سلف ($): {formatCurrency(advancesUSD, 'USD')}</span>
                    <span>مصفى: {formatCurrency(settledUSD, 'USD')}</span>
                  </div>
                )}
              </div>
            )
          )
        )}
      </div>
    </div>
  );
};
