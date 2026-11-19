import React from 'react';
import { FileText, Building2, Package, UserCheck } from 'lucide-react';
import { Transaction, Customer, Employee } from '../../types/customs';

interface BillExpenseContextStripProps {
  transaction: Transaction;
  customer?: Customer;
  employee?: Employee;
}

export const BillExpenseContextStrip: React.FC<BillExpenseContextStripProps> = ({
  transaction,
  customer,
  employee,
}) => {
  return (
    <div className="px-5 sm:px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/70 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shrink-0">
      <div className="flex items-center gap-2 text-slate-400">
        <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
        <div className="truncate">
          <span className="block text-[10px] text-slate-500">رقم البوليصة</span>
          <span className="font-mono font-bold text-white truncate">{transaction.billNo}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-slate-400">
        <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <div className="truncate">
          <span className="block text-[10px] text-slate-500">الزبون / التاجر</span>
          <span className="font-bold text-white truncate">{customer?.name || 'غير محدد'}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-slate-400">
        <Package className="w-4 h-4 text-amber-400 shrink-0" />
        <div className="truncate">
          <span className="block text-[10px] text-slate-500">نوع البضاعة</span>
          <span className="font-medium text-slate-200 truncate">{transaction.goodsType || 'بضاعة عامة'}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-slate-400">
        <UserCheck className="w-4 h-4 text-purple-400 shrink-0" />
        <div className="truncate">
          <span className="block text-[10px] text-slate-500">المخلص الكمركي</span>
          <span className="font-medium text-slate-200 truncate">{employee?.name || 'غير محدد'}</span>
        </div>
      </div>
    </div>
  );
};
