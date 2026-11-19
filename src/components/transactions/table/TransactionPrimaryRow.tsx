'use client';

import React from 'react';
import { Building2, Eye, Coins, Wallet, Edit2, Trash2 } from 'lucide-react';
import { Transaction, Customer, Employee, AppUser, COMPANIES, TreasuryAttachment } from '../../../types/customs';
import { formatCurrency, BillFinancials } from '../../../utils/storage';
import { TransactionRowPopover } from '../TransactionRowPopover';

export interface TransactionPrimaryRowProps {
  tx: Transaction;
  cust?: Customer;
  emp?: Employee;
  fin: BillFinancials;
  currentUser: AppUser;
  exchangeRate: number;
  onViewArchive?: (attachment: TreasuryAttachment, title?: string) => void;
  onOpenTransactionDetail: (tx: Transaction) => void;
  onOpenQuickAdvance: (tx: Transaction) => void;
  onOpenQuickPayment: (tx: Transaction) => void;
  onOpenAddExpense?: (tx: Transaction) => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (tx: Transaction) => void;
  onTryChangeStatus: (tx: Transaction, newStatus: Transaction['status']) => void;
}

export const TransactionPrimaryRow: React.FC<TransactionPrimaryRowProps> = ({
  tx,
  cust,
  emp,
  fin,
  currentUser,
  exchangeRate,
  onViewArchive,
  onOpenTransactionDetail,
  onOpenQuickAdvance,
  onOpenQuickPayment,
  onOpenAddExpense,
  onEditTransaction,
  onDeleteTransaction,
  onTryChangeStatus,
}) => {
  const comp = COMPANIES[tx.companyId || 'naqaa_basra'];
  const isFullyPaid = tx.isMixedCurrency
    ? (fin.remainingAmount <= 0 && (fin.remainingAmountUSD || 0) <= 0)
    : fin.remainingAmount <= 0;

  return (
    <tr className="bg-slate-900 hover:bg-slate-850/80 transition-colors border-b border-slate-800/80">
      {/* Col 1: Bill No + Company badge + Interactive Popover */}
      <td className="pt-3.5 pb-2 px-4 align-top">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border shrink-0 ${comp.badgeColor}`}>
            {comp.shortName}
          </span>

          <TransactionRowPopover
            tx={tx}
            comp={comp}
            emp={emp}
            fin={fin}
            currentUser={currentUser}
            onTryChangeStatus={onTryChangeStatus}
            onViewArchive={onViewArchive}
          />

          {tx.jobNumber && (
            <span
              className="font-mono text-[10px] px-1.5 py-0.5 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold shrink-0"
              title={`رقم المعاملة الداخلي: ${tx.jobNumber}`}
            >
              Job: {tx.jobNumber}
            </span>
          )}
        </div>
      </td>

      {/* Col 2: Customer */}
      <td className="pt-3.5 pb-1.5 px-4 align-top">
        <div className="flex items-center gap-1.5 font-bold text-slate-100 text-xs">
          <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate">{cust?.name || 'غير محدد'}</span>
        </div>
        <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate" dir="ltr">
          {cust?.phone || cust?.contact || '—'}
        </div>
      </td>

      {/* Col 3: Total Bill Amount */}
      <td className="pt-3.5 pb-1.5 px-4 align-top">
        <div className="text-[10px] text-slate-400 font-semibold mb-0.5">المبلغ الكلي</div>
        <div className="font-mono font-bold text-slate-100 text-sm" dir="ltr">
          {tx.isMixedCurrency ? (
            <div className="flex flex-col text-xs leading-tight">
              <span>{formatCurrency(fin.totalAmount || 0, 'IQD')}</span>
              <span className="text-cyan-300">+{formatCurrency(fin.totalAmountUSD || 0, 'USD')}</span>
            </div>
          ) : (
            formatCurrency(fin.totalAmount, tx.currency || 'IQD')
          )}
        </div>
        {tx.currency === 'USD' && !tx.isMixedCurrency && (
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            ≈ {new Intl.NumberFormat('ar-IQ').format(Math.round(fin.totalAmount * exchangeRate))} د.ع
          </div>
        )}
        {tx.isMixedCurrency && (
          <div className="text-[10px] text-slate-400 font-mono mt-0.5" dir="ltr">
            ≈ {new Intl.NumberFormat('ar-IQ').format((fin.totalAmount || 0) + ((fin.totalAmountUSD || 0) * exchangeRate))} د.ع
          </div>
        )}
      </td>

      {/* Col 4: Total Collected */}
      <td className="pt-3.5 pb-1.5 px-4 align-top">
        <div className="text-[10px] text-slate-400 font-semibold mb-0.5">المسدد من الزبون</div>
        <div className="font-mono font-bold text-emerald-400 text-sm" dir="ltr">
          {tx.isMixedCurrency ? (
            <div className="flex flex-col text-xs leading-tight">
              <span>{formatCurrency(fin.totalCollected, 'IQD')}</span>
              <span className="text-cyan-300">+{formatCurrency(fin.totalCollectedUSD || 0, 'USD')}</span>
            </div>
          ) : (
            formatCurrency(fin.totalCollected, tx.currency || 'IQD')
          )}
        </div>
        {!tx.isMixedCurrency &&
          (((tx.currency === 'USD' && (fin.collectedInIQD || 0) > 0) ||
            ((tx.currency || 'IQD') === 'IQD' && (fin.collectedInUSD || 0) > 0) ||
            ((fin.collectedInUSD || 0) > 0 && (fin.collectedInIQD || 0) > 0))) && (
          <div className="text-[10px] text-cyan-300 font-mono mt-0.5" dir="ltr">
            {(fin.collectedInUSD || 0) > 0 ? `$${(fin.collectedInUSD || 0).toLocaleString()}` : ''}
            {(fin.collectedInUSD || 0) > 0 && (fin.collectedInIQD || 0) > 0 ? ' + ' : ''}
            {(fin.collectedInIQD || 0) > 0 ? `${new Intl.NumberFormat('ar-IQ').format(fin.collectedInIQD || 0)} د.ع` : ''}
          </div>
        )}
        {((fin.commissionsUSD || 0) > 0 || (fin.commissionsIQD || 0) > 0) && (
          <div className="text-[10px] text-amber-300 font-mono mt-0.5 flex flex-wrap items-center gap-1">
            <span className="bg-amber-500/15 border border-amber-500/30 px-1 py-0.2 rounded font-sans">
              عمولات:{' '}
              {(fin.commissionsUSD || 0) > 0 ? `$${fin.commissionsUSD}` : ''}
              {(fin.commissionsUSD || 0) > 0 && (fin.commissionsIQD || 0) > 0 ? ' + ' : ''}
              {(fin.commissionsIQD || 0) > 0 ? `${new Intl.NumberFormat('ar-IQ').format(fin.commissionsIQD || 0)} د.ع` : ''}
            </span>
          </div>
        )}
      </td>

      {/* Col 5: Remaining Amount */}
      <td className="pt-3.5 pb-1.5 px-4 align-top">
        <div className="text-[10px] text-slate-400 font-semibold mb-0.5">المتبقي على الزبون</div>
        <div className="font-mono font-bold text-sm" dir="ltr">
          {tx.isMixedCurrency ? (
            (fin.remainingAmount > 0 || (fin.remainingAmountUSD || 0) > 0) ? (
              <div className="flex flex-col text-xs leading-tight text-amber-400">
                <span>{formatCurrency(fin.remainingAmount, 'IQD')}</span>
                <span className="text-cyan-400">+{formatCurrency(fin.remainingAmountUSD || 0, 'USD')}</span>
              </div>
            ) : (
              <span className="text-emerald-400 font-semibold">0 (خالص)</span>
            )
          ) : fin.remainingAmount > 0 ? (
            <span className="text-amber-400">{formatCurrency(fin.remainingAmount, tx.currency || 'IQD')}</span>
          ) : (
            <span className="text-emerald-400 font-semibold">0 (خالص)</span>
          )}
        </div>
        {tx.currency === 'USD' && fin.remainingAmount > 0 && !tx.isMixedCurrency && (
          <div className="text-[10px] text-amber-300/80 font-mono mt-0.5">
            ≈ {new Intl.NumberFormat('ar-IQ').format(Math.round(fin.remainingAmount * exchangeRate))} د.ع
          </div>
        )}
        {(fin.customerCommissionInBillCurr || 0) > 0 && (
          <div className="text-[9px] text-amber-300/90 mt-0.5">
            شامل عمولة على الزبون ({formatCurrency(fin.customerCommissionInBillCurr || 0, tx.currency || 'IQD')})
          </div>
        )}
      </td>

      {/* Col 6: Quick Actions */}
      <td className="pt-3.5 pb-1.5 px-4 text-center align-top">
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => onOpenTransactionDetail(tx)}
            title="عرض تفاصيل البوليصة"
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 transition cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {(currentUser.role === 'admin' || currentUser.permissions.disburseAdvance !== false) && (
            <button
              onClick={() => onOpenQuickAdvance(tx)}
              title="صرف سلفة للمخلص على هذه البوليصة"
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition cursor-pointer"
            >
              <Coins className="w-3.5 h-3.5" />
            </button>
          )}

          {(currentUser.role === 'admin' || currentUser.permissions.createReceipts !== false) && (
            <button
              onClick={() => onOpenQuickPayment(tx)}
              disabled={isFullyPaid}
              title={isFullyPaid ? 'البوليصة مسددة بالكامل (خالصة)' : 'تسجيل دفعة جديدة من الزبون'}
              className={`p-1.5 rounded-xl transition cursor-pointer ${
                isFullyPaid
                  ? 'bg-slate-900 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-800 hover:bg-slate-700 text-emerald-400'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
            </button>
          )}

          {onOpenAddExpense && (
            <button
              onClick={() => onOpenAddExpense(tx)}
              disabled={tx.status === 'cancelled'}
              title="صرف مصروف كمركي أو تشغيلي على هذه البوليصة (رسوم، موانئ، سونار، فحص، عمال، نثريات)"
              className={`p-1.5 rounded-xl transition cursor-pointer ${
                tx.status === 'cancelled'
                  ? 'bg-slate-900 text-slate-600 cursor-not-allowed opacity-50'
                  : 'bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30'
              }`}
            >
              <span className="text-xs">💸</span>
            </button>
          )}

          {(currentUser.role === 'admin' || currentUser.permissions.editTx) && (
            <button
              onClick={() => onEditTransaction(tx)}
              title="تعديل البوليصة"
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => onDeleteTransaction(tx)}
            title="حذف البوليصة"
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};
