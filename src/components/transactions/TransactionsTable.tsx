import React from 'react';
import { Transaction, Customer, Employee, Receipt, AppUser, TreasuryAttachment } from '../../types/customs';
import { getBillFinancials } from '../../utils/storage';
import { TransactionPrimaryRow } from './table/TransactionPrimaryRow';
import { TransactionExpandedRow } from './table/TransactionExpandedRow';

interface TransactionsTableProps {
  filteredTransactions: Transaction[];
  customers: Customer[];
  employees: Employee[];
  receipts: Receipt[];
  currentUser: AppUser;
  exchangeRate?: number;
  expandedRowIds: Set<string>;
  toggleRowExpand: (id: string) => void;
  onViewArchive?: (attachment: TreasuryAttachment, title?: string) => void;
  onOpenTransactionDetail: (tx: Transaction) => void;
  onOpenQuickAdvance: (tx: Transaction) => void;
  onOpenQuickPayment: (tx: Transaction) => void;
  onOpenAddExpense?: (tx: Transaction) => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (tx: Transaction) => void;
  onTryChangeStatus: (tx: Transaction, newStatus: Transaction['status']) => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  filteredTransactions,
  customers,
  employees,
  receipts,
  currentUser,
  exchangeRate = 1500,
  expandedRowIds,
  onViewArchive,
  onOpenTransactionDetail,
  onOpenQuickAdvance,
  onOpenQuickPayment,
  onOpenAddExpense,
  onEditTransaction,
  onDeleteTransaction,
  onTryChangeStatus,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold">
              <th className="py-3.5 px-4 w-[28%]">البوليصة والبيانات الأساسية</th>
              <th className="py-3.5 px-4 w-[20%]">الزبون التجاري / المخلص</th>
              <th className="py-3.5 px-4 w-[13%]">المبلغ الكلي</th>
              <th className="py-3.5 px-4 w-[13%]">المسدد الإجمالي</th>
              <th className="py-3.5 px-4 w-[12%]">المتبقي المستحق</th>
              <th className="py-3.5 px-4 text-center w-[14%]">إجراءات المعاملة</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-800/80">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 text-center text-slate-400">
                  <div className="max-w-xs mx-auto space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-xl mx-auto">
                      📋
                    </div>
                    <div className="text-slate-300 font-bold">لا توجد بوالص مطابقة للفلاتر الحالية</div>
                    <p className="text-[11px] text-slate-500">جرب تغيير حالة المعاملة أو خيارات البحث</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const cust = customers.find((c) => c.id === tx.customerId);
                const emp = employees.find((e) => e.id === tx.employeeId);
                const fin = getBillFinancials(tx, receipts, exchangeRate);

                return (
                  <React.Fragment key={tx.id}>
                    <TransactionPrimaryRow
                      tx={tx}
                      cust={cust}
                      emp={emp}
                      fin={fin}
                      currentUser={currentUser}
                      exchangeRate={exchangeRate}
                      onViewArchive={onViewArchive}
                      onOpenTransactionDetail={onOpenTransactionDetail}
                      onOpenQuickAdvance={onOpenQuickAdvance}
                      onOpenQuickPayment={onOpenQuickPayment}
                      onOpenAddExpense={onOpenAddExpense}
                      onEditTransaction={onEditTransaction}
                      onDeleteTransaction={onDeleteTransaction}
                      onTryChangeStatus={onTryChangeStatus}
                    />

                    {expandedRowIds.has(tx.id) && (
                      <TransactionExpandedRow
                        tx={tx}
                        emp={emp}
                        currentUser={currentUser}
                        onTryChangeStatus={onTryChangeStatus}
                        onViewArchive={onViewArchive}
                      />
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
