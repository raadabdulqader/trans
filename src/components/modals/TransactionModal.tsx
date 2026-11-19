import React from 'react';
import { AlertCircle } from 'lucide-react';
import { 
  Transaction, 
  Customer, 
  Employee, 
  Receipt, 
  TreasuryAttachment, 
  TransportCompany, 
  TreasuryTransaction 
} from '../../types/customs';
import { TransactionGeneralTab } from '../transactions/modal/TransactionGeneralTab';
import { TransactionFinancialTab } from '../transactions/modal/TransactionFinancialTab';
import { TransactionTransportTab } from '../transactions/modal/TransactionTransportTab';
import { TransactionNotesTab } from '../transactions/modal/TransactionNotesTab';
import { TransactionModalFooter } from '../transactions/modal/TransactionModalFooter';
import { TransactionModalHeader } from '../transactions/modal/TransactionModalHeader';
import { useTransactionForm, ModalTab } from '../transactions/modal/useTransactionForm';

export type { ModalTab };

interface TransactionModalProps {
  isOpen: boolean;
  initialData?: Transaction | null;
  customers: Customer[];
  employees: Employee[];
  carriers?: TransportCompany[];
  onQuickAddCarrier?: (carrier: Omit<TransportCompany, 'id' | 'createdAt'>) => TransportCompany;
  receipts?: Receipt[];
  treasury?: TreasuryTransaction[];
  exchangeRate?: number;
  onExchangeRateChange?: (newRate: number, silent?: boolean) => void;
  onViewArchive?: (attachment: TreasuryAttachment, title?: string) => void;
  onClose: () => void;
  onSave: (txData: Omit<Transaction, 'id' | 'createdAt'> & { id?: string }) => void;
  onDelete?: (transaction: Transaction) => void;
  onOpenAddExpense?: (transaction: Transaction) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  initialData,
  customers,
  employees,
  carriers = [],
  onQuickAddCarrier,
  receipts = [],
  treasury = [],
  exchangeRate = 1500,
  onExchangeRateChange,
  onViewArchive,
  onClose,
  onSave,
  onDelete,
  onOpenAddExpense,
}) => {
  const form = useTransactionForm({
    isOpen,
    initialData,
    customers,
    employees,
    carriers,
    receipts,
    treasury,
    exchangeRate,
    onExchangeRateChange,
    onSave,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-3 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-750 rounded-2xl max-w-5xl xl:max-w-6xl w-full shadow-2xl overflow-hidden max-h-[96vh] flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header with Tabs */}
        <TransactionModalHeader
          initialData={initialData}
          billNo={form.billNo}
          jobNumber={form.jobNumber}
          companyId={form.companyId}
          activeTab={form.activeTab}
          setActiveTab={form.setActiveTab}
          milestonesCount={form.milestonesCount}
          totalAmount={form.totalAmount}
          totalAmountUSD={form.totalAmountUSD}
          isMixedCurrency={form.isMixedCurrency}
          currency={form.currency}
          containersCount={form.containers.length}
          hasAgencyDocument={!!form.agencyDocument}
          onClose={onClose}
        />

        {/* Form Container */}
        <form onSubmit={form.handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {form.formError && (
            <div className="mx-4 sm:mx-5 mt-2.5 p-2 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-bold flex items-center justify-between gap-2 shrink-0 animate-in fade-in">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{form.formError}</span>
              </div>
              <button
                type="button"
                onClick={() => form.setFormError(null)}
                className="text-rose-400 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded hover:bg-rose-500/20 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {initialData?.status === 'cancelled' && (
            <div className="mx-4 sm:mx-5 mt-2.5 p-2 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-semibold flex items-center gap-1.5 shrink-0">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>هذه البوليصة ملغاة دفترياً ومحاسبياً. التعديل هنا للبيانات الإيضاحية فقط.</span>
            </div>
          )}

          {/* Scrollable Form Body */}
          <div className="overflow-y-auto flex-1 p-3 sm:p-3.5 scrollbar-thin scrollbar-thumb-slate-700">
            {/* TAB 1 */}
            {form.activeTab === 'general' && (
              <TransactionGeneralTab
                companyId={form.companyId}
                setCompanyId={form.setCompanyId}
                billNo={form.billNo}
                setBillNo={form.setBillNo}
                jobNumber={form.jobNumber}
                setJobNumber={form.setJobNumber}
                date={form.date}
                setDate={form.setDate}
                status={form.status}
                setStatus={form.setStatus}
                customerId={form.customerId}
                setCustomerId={form.setCustomerId}
                employeeId={form.employeeId}
                setEmployeeId={form.setEmployeeId}
                goodsType={form.goodsType}
                setGoodsType={form.setGoodsType}
                customers={customers}
                employees={employees}
                initialData={initialData}
                deliveryOrderDate={form.deliveryOrderDate}
                setDeliveryOrderDate={form.setDeliveryOrderDate}
                clearanceDate={form.clearanceDate}
                setClearanceDate={form.setClearanceDate}
                exitDate={form.exitDate}
                setExitDate={form.setExitDate}
                containerReturnDate={form.containerReturnDate}
                setContainerReturnDate={form.setContainerReturnDate}
                freeTimeDays={form.freeTimeDays}
                setFreeTimeDays={form.setFreeTimeDays}
                containerDestination={form.containerDestination}
                setContainerDestination={form.setContainerDestination}
                onNext={() => form.setActiveTab('financial')}
              />
            )}

            {/* TAB 2 */}
            {form.activeTab === 'financial' && (
              <TransactionFinancialTab
                isMixedCurrency={form.isMixedCurrency}
                setIsMixedCurrency={form.setIsMixedCurrency}
                currency={form.currency}
                setCurrency={form.setCurrency}
                localRate={form.localRate}
                setLocalRate={form.setLocalRate}
                activeRate={form.activeRate}
                onExchangeRateChange={onExchangeRateChange}
                totalAmount={form.totalAmount}
                setTotalAmount={form.setTotalAmount}
                initialPaid={form.initialPaid}
                setInitialPaid={form.setInitialPaid}
                totalAmountUSD={form.totalAmountUSD}
                setTotalAmountUSD={form.setTotalAmountUSD}
                initialPaidUSD={form.initialPaidUSD}
                setInitialPaidUSD={form.setInitialPaidUSD}
                remaining={form.remaining}
                remainingUSD={form.remainingUSD}
                equivalentInitialInBillCurr={form.equivalentInitialInBillCurr}
                initialData={initialData}
                directExpensesOnBill={form.directExpensesOnBill}
                directExpensesIQDOnBill={form.directExpensesIQDOnBill}
                directExpensesUSDOnBill={form.directExpensesUSDOnBill}
                onOpenAddExpense={onOpenAddExpense}
                onPrev={() => form.setActiveTab('general')}
                onNext={() => form.setActiveTab('transport')}
              />
            )}

            {/* TAB 3 */}
            {form.activeTab === 'transport' && (
              <TransactionTransportTab
                jobNumber={form.jobNumber}
                containerDestination={form.containerDestination}
                freeTimeDays={form.freeTimeDays}
                containers={form.containers}
                setContainers={form.setContainers}
                hasPaidCarriersOnBill={form.hasPaidCarriersOnBill}
                hasTransport={form.hasTransport}
                transportTrips={form.transportTrips}
                carrierPaidIQDOnBill={form.carrierPaidIQDOnBill}
                carrierPaidUSDOnBill={form.carrierPaidUSDOnBill}
                billNo={form.billNo}
                carriers={carriers}
                transportDocument={form.transportDocument}
                handleTransportDocUpload={form.handleTransportDocUpload}
                handleAddTransportTrip={form.handleAddTransportTrip}
                handleUpdateTrip={form.handleUpdateTrip}
                handleRemoveTrip={form.handleRemoveTrip}
                handleTripFileUpload={form.handleTripFileUpload}
                onQuickAddCarrier={onQuickAddCarrier}
                handleQuickCarrierCreated={form.handleQuickCarrierCreated}
                onViewArchive={onViewArchive}
                onPrev={() => form.setActiveTab('financial')}
                onNext={() => form.setActiveTab('notes')}
                onEditDestination={() => form.setActiveTab('general')}
              />
            )}

            {/* TAB 4 */}
            {form.activeTab === 'notes' && (
              <TransactionNotesTab
                agencyDocument={form.agencyDocument}
                setAgencyDocument={form.setAgencyDocument}
                billNo={form.billNo}
                onViewArchive={onViewArchive}
                setFormError={form.setFormError}
                notes={form.notes}
                setNotes={form.setNotes}
                onPrev={() => form.setActiveTab('transport')}
              />
            )}
          </div>

          {/* Hidden input for footer agency upload button */}
          <input
            ref={form.footerAgencyInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={form.handleFooterAgencyUpload}
            className="hidden"
          />

          {/* Footer */}
          <TransactionModalFooter
            isMixedCurrency={form.isMixedCurrency}
            currency={form.currency}
            totalAmount={form.totalAmount}
            totalAmountUSD={form.totalAmountUSD}
            initialPaid={form.initialPaid}
            initialPaidUSD={form.initialPaidUSD}
            containersCount={form.containers.length}
            milestonesCount={form.milestonesCount}
            agencyDocument={form.agencyDocument}
            onTriggerAgencyUpload={() => form.footerAgencyInputRef.current?.click()}
            initialData={initialData}
            onDelete={onDelete}
            onClose={onClose}
            isInitialExceeded={form.isInitialExceeded}
            isTotalLessThanExisting={form.isTotalLessThanExisting}
          />
        </form>

      </div>
    </div>
  );
};
