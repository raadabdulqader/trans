import React from 'react';
import { 
  Phone, 
  Building2, 
  Coins, 
  CheckCheck, 
  FileText, 
  Paperclip, 
  Eye, 
  Edit2, 
  Trash2 
} from 'lucide-react';
import { Employee, Transaction, Receipt, AppUser } from '../../types/customs';
import { formatCurrency, getEmployeeAdvances } from '../../utils/storage';

interface BrokersCardsGridProps {
  filteredEmployees: Employee[];
  transactions: Transaction[];
  receipts: Receipt[];
  currentUser: AppUser;
  onEditEmployee: (emp: Employee) => void;
  onDeleteEmployee: (emp: Employee) => void;
  onDisburseAdvance: (emp: Employee) => void;
  onSettleAdvance: (emp: Employee) => void;
  onViewEmployeeDetail: (emp: Employee) => void;
}

export const BrokersCardsGrid: React.FC<BrokersCardsGridProps> = ({
  filteredEmployees,
  transactions,
  receipts,
  currentUser,
  onEditEmployee,
  onDeleteEmployee,
  onDisburseAdvance,
  onSettleAdvance,
  onViewEmployeeDetail,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredEmployees.map((emp) => {
        const empTransactions = transactions.filter((t) => t.employeeId === emp.id);
        const empReceipts = receipts.filter((r) => r.employeeId === emp.id);
        const adv = getEmployeeAdvances(emp.id, receipts);
        const archivedVouchers = empReceipts.filter((r) => !!r.attachment);

        return (
          <div 
            key={emp.id} 
            className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between transition group space-y-4"
          >
            {/* Header Info */}
            <div className="space-y-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-2xl border border-amber-500/20 shadow-xs">
                    👷
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition">
                      {emp.name}
                    </h3>
                    <div className="text-xs text-slate-400 font-mono">
                      {emp.idNo ? `رقم الهوية: ${emp.idNo}` : 'بدون رقم هوية'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditEmployee(emp)}
                    title="تعديل بيانات المخلص"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteEmployee(emp)}
                    title="حذف المخلص"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Broker Contacts and Department */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                <div className="flex items-center gap-1.5 truncate">
                  <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="font-mono text-[11px] truncate">{emp.phone || 'لا يوجد هاتف'}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="text-[11px] truncate">{emp.department || 'التخليص الميداني'}</span>
                </div>
              </div>

              {/* 3 Financial Sub-metrics per Broker (IQD & USD) */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5 font-medium">السلف المصروفة</span>
                  <strong className="text-xs text-amber-300 font-mono block truncate" dir="ltr">
                    {formatCurrency(adv.advancesIQD, 'IQD')}
                  </strong>
                  {adv.advancesUSD > 0 && (
                    <strong className="text-[11px] text-cyan-400 font-mono block truncate" dir="ltr">
                      + {formatCurrency(adv.advancesUSD, 'USD')}
                    </strong>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5 font-medium">المسدد بوصولات</span>
                  <strong className="text-xs text-emerald-400 font-mono block truncate" dir="ltr">
                    {formatCurrency(adv.settledIQD, 'IQD')}
                  </strong>
                  {adv.settledUSD > 0 && (
                    <strong className="text-[11px] text-cyan-400 font-mono block truncate" dir="ltr">
                      + {formatCurrency(adv.settledUSD, 'USD')}
                    </strong>
                  )}
                </div>

                <div className={`rounded-lg p-0.5 ${(adv.openIQD > 0 || adv.openUSD > 0) ? 'bg-rose-500/10' : ''}`}>
                  <span className={`text-[10px] block mb-0.5 font-bold ${(adv.openIQD > 0 || adv.openUSD > 0) ? 'text-rose-400' : 'text-slate-400'}`}>
                    الرصيد المفتوح
                  </span>
                  <strong className={`text-xs font-mono block truncate ${adv.openIQD > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}`} dir="ltr">
                    {formatCurrency(adv.openIQD, 'IQD')}
                  </strong>
                  {adv.openUSD > 0 && (
                    <strong className="text-[11px] text-rose-300 font-mono font-bold block truncate" dir="ltr">
                      + {formatCurrency(adv.openUSD, 'USD')}
                    </strong>
                  )}
                </div>
              </div>

              {/* Activity badges */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1">
                <div className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>{empTransactions.length} بوليصة كمركية</span>
                </div>
                <div className="flex items-center gap-1">
                  <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-cyan-300 font-semibold">{archivedVouchers.length} وصل مؤرشف</span>
                </div>
              </div>
            </div>

            {/* Footer Action Buttons for Broker */}
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                {(currentUser.role === 'admin' || currentUser.permissions.disburseAdvance !== false) ? (
                  <button
                    onClick={() => onDisburseAdvance(emp)}
                    className="py-2 px-3 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>صرف سلفة</span>
                  </button>
                ) : (
                  <div className="py-2 px-3 bg-slate-950/60 text-slate-500 border border-slate-800 rounded-xl text-xs flex items-center justify-center gap-1 opacity-60 cursor-not-allowed">
                    <Coins className="w-3.5 h-3.5" />
                    <span>صرف سلفة (محجوب)</span>
                  </div>
                )}

                {(currentUser.role === 'admin' || currentUser.permissions.settleAdvance !== false) ? (
                  <button
                    onClick={() => onSettleAdvance(emp)}
                    className="py-2 px-3 bg-purple-500/15 hover:bg-purple-500/25 text-purple-200 border border-purple-500/30 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>تسوية بالوصول</span>
                  </button>
                ) : (
                  <div className="py-2 px-3 bg-slate-950/60 text-slate-500 border border-slate-800 rounded-xl text-xs flex items-center justify-center gap-1 opacity-60 cursor-not-allowed">
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>تسوية (محجوب)</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => onViewEmployeeDetail(emp)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>كشف الحساب وسجل السلف والتسويات</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
