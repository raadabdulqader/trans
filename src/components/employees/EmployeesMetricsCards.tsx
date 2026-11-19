import React from 'react';
import { Users, BadgeDollarSign, Wallet, Coins, CheckCheck, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/storage';

interface EmployeesMetricsCardsProps {
  activeTab: 'all' | 'staff' | 'brokers';
  staffStats: {
    count: number;
    totalBaseSalary: number;
    totalSalariesPaid: number;
  };
  brokerStats: {
    advancesIQD: number;
    settledIQD: number;
    openIQD: number;
    advancesUSD: number;
    settledUSD: number;
    openUSD: number;
  };
}

export const EmployeesMetricsCards: React.FC<EmployeesMetricsCardsProps> = ({
  activeTab,
  staffStats,
  brokerStats,
}) => {
  if (activeTab === 'staff') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-400" />
              <span>إجمالي موظفي الشركة</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
              كادر الشركة
            </span>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {staffStats.count} <span className="text-xs font-normal text-slate-400">موظف مسجل</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">كادر الإدارة، الحسابات، النقل، والخدمات</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <BadgeDollarSign className="w-4 h-4 text-emerald-400" />
              <span>الرواتب الشهرية المعتمدة</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
              استحقاق شهري
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono" dir="ltr">
            {formatCurrency(staffStats.totalBaseSalary)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">إجمالي الرواتب الأساسية المقررة لموظفي الشركة</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-cyan-400" />
              <span>الرواتب المصروفة من الصندوق</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
              منصرف فعلي
            </span>
          </div>
          <div className="text-2xl font-black text-cyan-300 font-mono" dir="ltr">
            {formatCurrency(staffStats.totalSalariesPaid)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">مجموع الرواتب المقيدة والمخصومة من الصندوق</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>إجمالي السلف المصروفة</span>
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
            صادر
          </span>
        </div>
        <div className="text-xl font-black text-amber-400 font-mono" dir="ltr">
          {formatCurrency(brokerStats.advancesIQD, 'IQD')}
        </div>
        {brokerStats.advancesUSD > 0 && (
          <div className="text-sm font-black text-cyan-400 font-mono mt-0.5" dir="ltr">
            + {formatCurrency(brokerStats.advancesUSD, 'USD')}
          </div>
        )}
        <p className="text-[11px] text-slate-400 mt-1">كافة المبالغ المصروفة كعهدة للمخلصين</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span>المسدد بالوصولات الكمركية</span>
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
            مصفى ومؤرشف
          </span>
        </div>
        <div className="text-xl font-black text-emerald-400 font-mono" dir="ltr">
          {formatCurrency(brokerStats.settledIQD, 'IQD')}
        </div>
        {brokerStats.settledUSD > 0 && (
          <div className="text-sm font-black text-cyan-400 font-mono mt-0.5" dir="ltr">
            + {formatCurrency(brokerStats.settledUSD, 'USD')}
          </div>
        )}
        <p className="text-[11px] text-slate-400 mt-1">مبالغ تمت تصفيتها بموجب وصولات رسمية</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>صافي السلف المفتوحة حالياً</span>
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400">
            مستحقة التصفية
          </span>
        </div>
        <div className="text-xl font-black text-rose-400 font-mono" dir="ltr">
          {formatCurrency(brokerStats.openIQD, 'IQD')}
        </div>
        {brokerStats.openUSD > 0 && (
          <div className="text-sm font-black text-rose-300 font-mono mt-0.5" dir="ltr">
            + {formatCurrency(brokerStats.openUSD, 'USD')}
          </div>
        )}
        <p className="text-[11px] text-slate-400 mt-1">المبالغ المتبقية بذمة المخلصين قيد العمل</p>
      </div>
    </div>
  );
};
