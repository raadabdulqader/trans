import React from 'react';
import { 
  Coins, 
  Landmark, 
  Plus, 
  Users, 
  Coffee, 
  Building2, 
  Printer, 
  TrendingDown,
  Truck 
} from 'lucide-react';
import { AppUser } from '../../types/customs';
import { SubAccountType } from '../modals/AccountExpenseModal';
import { formatCurrency, TreasuryFinancialSummary } from '../../utils/storage';

export interface AccountsHeaderCardsProps {
  currentUser: AppUser;
  treasurySummary: TreasuryFinancialSummary;
  onNavigateToTreasury: () => void;
  onOpenAddExpense: (subAccount: SubAccountType) => void;
  onAddEmployee?: () => void;
  onPrint: () => void;
  totalSalariesIQD: number;
  totalSalariesUSD: number;
  totalDailyIQD: number;
  totalDailyUSD: number;
  totalRentsIQD: number;
  totalRentsUSD: number;
  totalCarriersIQD?: number;
  totalCarriersUSD?: number;
}

export const AccountsHeaderCards: React.FC<AccountsHeaderCardsProps> = ({
  currentUser,
  treasurySummary,
  onNavigateToTreasury,
  onOpenAddExpense,
  onAddEmployee,
  onPrint,
  totalSalariesIQD,
  totalSalariesUSD,
  totalDailyIQD,
  totalDailyUSD,
  totalRentsIQD,
  totalRentsUSD,
  totalCarriersIQD = 0,
  totalCarriersUSD = 0,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -z-10" />
      
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <span>إدارة الحسابات والمصاريف المالية</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/30 flex items-center gap-1">
                  <Landmark className="w-3 h-3" />
                  مربوطة بصندوق الشركة
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                توثيق ومتابعة رواتب الكادر، المصاريف اليومية والتشغيلية، والإيجارات مع خصمها التلقائي من الخزينة
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {onAddEmployee && (currentUser.role === 'admin' || currentUser.permissions.manageUsers !== false) && (
            <button
              onClick={onAddEmployee}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ إضافة موظف</span>
            </button>
          )}

          {(currentUser.role === 'admin' || currentUser.permissions.createExpenses !== false) && (
            <>
              <button
                onClick={() => onOpenAddExpense('salaries')}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
              >
                <Users className="w-3.5 h-3.5" />
                <span>+ صرف راتب</span>
              </button>

              <button
                onClick={() => onOpenAddExpense('daily')}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-amber-500/20"
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>+ مصروف يومي</span>
              </button>

              <button
                onClick={() => onOpenAddExpense('rents')}
                className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-cyan-500/20"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>+ دفع إيجار</span>
              </button>
            </>
          )}

          {(currentUser.role === 'admin' || currentUser.permissions.printVouchers !== false) && (
            <button
              onClick={onPrint}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
              title="طباعة كشف الحسابات المعروض"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>طباعة الكشف</span>
            </button>
          )}
        </div>
      </div>

      {/* Financial KPI Cards Linked Directly with Treasury */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 mt-6 border-t border-slate-800/80">
        
        {/* Company Treasury Current Balance Banner */}
        <div 
          onClick={onNavigateToTreasury}
          className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/30 hover:border-emerald-500/60 transition cursor-pointer group"
          title="انقر للانتقال إلى صندوق الشركة"
        >
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <Landmark className="w-3.5 h-3.5" />
              رصيد الصندوق المتوفر
            </span>
            <span className="text-[10px] text-emerald-400 group-hover:underline">عرض الخزينة ↗</span>
          </div>
          <div className="text-sm font-bold text-emerald-400 font-mono" dir="ltr">
            {formatCurrency(treasurySummary.currentBalanceIQD, 'IQD')}
          </div>
          <div className="text-xs font-bold text-cyan-400 font-mono mt-0.5" dir="ltr">
            + {formatCurrency(treasurySummary.currentBalanceUSD, 'USD')}
          </div>
        </div>

        {/* Total Salaries */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1 text-slate-300 font-medium">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              رواتب وأجور الكادر
            </span>
          </div>
          <div className="text-sm font-bold text-white font-mono" dir="ltr">
            {formatCurrency(totalSalariesIQD, 'IQD')}
          </div>
          {totalSalariesUSD > 0 ? (
            <div className="text-xs font-bold text-cyan-400 font-mono mt-0.5" dir="ltr">
              + {formatCurrency(totalSalariesUSD, 'USD')}
            </div>
          ) : (
            <div className="text-[10px] text-slate-500 mt-0.5">مجموع الرواتب المنصرفة</div>
          )}
        </div>

        {/* Total Daily Expenses */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1 text-slate-300 font-medium">
              <Coffee className="w-3.5 h-3.5 text-amber-400" />
              مصاريف يومية وتشغيل
            </span>
          </div>
          <div className="text-sm font-bold text-amber-300 font-mono" dir="ltr">
            {formatCurrency(totalDailyIQD, 'IQD')}
          </div>
          {totalDailyUSD > 0 ? (
            <div className="text-xs font-bold text-cyan-400 font-mono mt-0.5" dir="ltr">
              + {formatCurrency(totalDailyUSD, 'USD')}
            </div>
          ) : (
            <div className="text-[10px] text-slate-500 mt-0.5">نثريات وضيافة ونقل وصيانة</div>
          )}
        </div>

        {/* Total Rents */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1 text-slate-300 font-medium">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              إيجارات ومرافق
            </span>
          </div>
          <div className="text-sm font-bold text-cyan-300 font-mono" dir="ltr">
            {formatCurrency(totalRentsIQD, 'IQD')}
          </div>
          {totalRentsUSD > 0 ? (
            <div className="text-xs font-bold text-cyan-400 font-mono mt-0.5" dir="ltr">
              + {formatCurrency(totalRentsUSD, 'USD')}
            </div>
          ) : (
            <div className="text-[10px] text-slate-500 mt-0.5">المكاتب والمستودعات والساحات</div>
          )}
        </div>

        {/* Total Carrier Expenses (أجور ونواقل النقل البري) */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-amber-500/20">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1 text-amber-400 font-medium">
              <Truck className="w-3.5 h-3.5" />
              أجور ونواقل النقل البري
            </span>
          </div>
          <div className="text-sm font-bold text-amber-400 font-mono" dir="ltr">
            {formatCurrency(totalCarriersIQD, 'IQD')}
          </div>
          {totalCarriersUSD > 0 ? (
            <div className="text-xs font-bold text-cyan-400 font-mono mt-0.5" dir="ltr">
              + {formatCurrency(totalCarriersUSD, 'USD')}
            </div>
          ) : (
            <div className="text-[10px] text-slate-500 mt-0.5">مسددات أجور النواقل</div>
          )}
        </div>

        {/* Grand Total Accounts Expenses */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1 text-rose-400 font-medium">
              <TrendingDown className="w-3.5 h-3.5" />
              إجمالي سحوبات المصاريف
            </span>
          </div>
          <div className="text-sm font-bold text-rose-400 font-mono" dir="ltr">
            {formatCurrency(totalSalariesIQD + totalDailyIQD + totalRentsIQD + totalCarriersIQD, 'IQD')}
          </div>
          {(totalSalariesUSD + totalDailyUSD + totalRentsUSD + totalCarriersUSD) > 0 ? (
            <div className="text-xs font-bold text-amber-400 font-mono mt-0.5" dir="ltr">
              + {formatCurrency(totalSalariesUSD + totalDailyUSD + totalRentsUSD + totalCarriersUSD, 'USD')}
            </div>
          ) : (
            <div className="text-[10px] text-slate-500 mt-0.5">خصم كلي من صندوق الشركة</div>
          )}
        </div>

      </div>
    </div>
  );
};
