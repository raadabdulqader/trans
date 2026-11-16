'use client';

import React, { useState, useEffect } from 'react';
import { 
  Customer, 
  Employee, 
  Transaction, 
  Receipt, 
  AppUser, 
  Attachment,
  TreasuryTransaction,
  TreasuryMovementType,
  TreasuryAttachment,
  EmployeeCategory,
  AuditLogEntry,
  Currency,
  TransportCompany,
  BillTransportTrip
} from './types/customs';
import { 
  loadData, 
  saveData, 
  exportBackup, 
  getBillFinancials,
  getTreasuryFinancialSummary,
  getEmployeeAdvances,
  getCarrierFinancials,
  resetDatabase,
  loadSimulationData,
  formatCurrency,
  normalizeExchangeRate
} from './utils/storage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { CustomersView } from './components/CustomersView';
import { TransactionsView } from './components/TransactionsView';
import { CarriersView } from './components/CarriersView';
import { EmployeesView } from './components/EmployeesView';
import { ReceiptsView } from './components/ReceiptsView';
import { ReportsView } from './components/ReportsView';
import { UsersView } from './components/UsersView';
import { TreasuryView } from './components/TreasuryView';
import { AccountsView } from './components/AccountsView';
import { AuditLogView } from './components/AuditLogView';

// Modals
import { TransactionModal } from './components/modals/TransactionModal';
import {
  CarrierFormModal,
  CarrierPaymentModal,
  CarrierStatementModal,
} from './components/modals/CarrierModals';
import { CustomerModal } from './components/modals/CustomerModal';
import { EmployeeModal } from './components/modals/EmployeeModal';
import { ReceiptModal } from './components/modals/ReceiptModal';
import { TransactionDetailModal } from './components/modals/TransactionDetailModal';
import { 
  QuickAdvanceModal, 
  QuickPaymentModal, 
  QuickSettlementModal 
} from './components/modals/QuickModals';
import { ValidationErrorModal } from './components/modals/ValidationErrorModal';
import { AttachmentsModal } from './components/modals/AttachmentsModal';
import { UserModal, SwitchUserModal } from './components/modals/UserModal';
import { PrintModal } from './components/modals/PrintModal';
import { TreasuryModal } from './components/modals/TreasuryModal';
import { TreasuryArchiveViewModal } from './components/modals/TreasuryArchiveViewModal';
import { PrintTreasuryModal } from './components/modals/PrintTreasuryModal';
import { 
  BrokerAdvanceModal, 
  BrokerSettlementModal, 
  BrokerStatementModal 
} from './components/modals/BrokerFinancialModal';
import { AccountExpenseModal, SubAccountType } from './components/modals/AccountExpenseModal';
import { ConfirmDeleteModal, FinancialImpact, BlockedReasonDetail } from './components/modals/ConfirmDeleteModal';
import { VoidBillFinancialModal, VoidResolutionMode } from './components/modals/VoidBillFinancialModal';
import { CalendarViewModal } from './components/modals/CalendarViewModal';
import { ExchangeRateModal } from './components/modals/ExchangeRateModal';
import { LoginPage } from './components/auth/LoginPage';

// Treasury states

export default function App() {
  const [data, setData] = useState(() => loadData());
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [activePage, setActivePage] = useState<string>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCustomerId, setFilterCustomerId] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [isCustModalOpen, setIsCustModalOpen] = useState(false);
  const [editingCust, setEditingCust] = useState<Customer | null>(null);

  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);

  const [isRcptModalOpen, setIsRcptModalOpen] = useState(false);

  const [isTxDetailOpen, setIsTxDetailOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const [isQuickAdvOpen, setIsQuickAdvOpen] = useState(false);
  const [quickAdvTx, setQuickAdvTx] = useState<Transaction | null>(null);

  const [isQuickPayOpen, setIsQuickPayOpen] = useState(false);
  const [quickPayTx, setQuickPayTx] = useState<Transaction | null>(null);

  const [isQuickSettleOpen, setIsQuickSettleOpen] = useState(false);
  const [quickSettleTx, setQuickSettleTx] = useState<Transaction | null>(null);
  const [quickSettleEmpId, setQuickSettleEmpId] = useState<string>('');

  const [isValidationOpen, setIsValidationOpen] = useState(false);
  const [validationMsg, setValidationMsg] = useState('');
  const [validationDetails, setValidationDetails] = useState<string[]>([]);

  const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(false);
  const [attachEntityType, setAttachEntityType] = useState<'transaction' | 'receipt'>('transaction');
  const [attachEntityId, setAttachEntityId] = useState('');
  const [attachTitle, setAttachTitle] = useState('');

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  const [isSwitchUserOpen, setIsSwitchUserOpen] = useState(false);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printType, setPrintType] = useState<'bill' | 'invoice' | 'voucher'>('invoice');
  const [printTx, setPrintTx] = useState<Transaction | null>(null);
  const [printRcpt, setPrintRcpt] = useState<Receipt | null>(null);

  // Treasury states
  const [isTreasuryModalOpen, setIsTreasuryModalOpen] = useState(false);
  const [treasuryModalType, setTreasuryModalType] = useState<TreasuryMovementType>('deposit');
  const [editingTreasuryTx, setEditingTreasuryTx] = useState<TreasuryTransaction | null>(null);
  const [isTreasuryArchiveViewOpen, setIsTreasuryArchiveViewOpen] = useState(false);
  const [selectedArchiveTx, setSelectedArchiveTx] = useState<TreasuryTransaction | null>(null);
  const [selectedArchiveDirectAttachment, setSelectedArchiveDirectAttachment] = useState<TreasuryAttachment | null>(null);
  const [selectedArchiveTitle, setSelectedArchiveTitle] = useState<string>('');
  const [isPrintTreasuryOpen, setIsPrintTreasuryOpen] = useState(false);
  const [printTreasuryMode, setPrintTreasuryMode] = useState<'voucher' | 'statement'>('voucher');
  const [printTreasuryTx, setPrintTreasuryTx] = useState<TreasuryTransaction | null>(null);

  // Broker Financial Modals State
  const [isBrokerAdvModalOpen, setIsBrokerAdvModalOpen] = useState(false);
  const [isBrokerSettleModalOpen, setIsBrokerSettleModalOpen] = useState(false);
  const [isBrokerStatementModalOpen, setIsBrokerStatementModalOpen] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<Employee | null>(null);

  // Accounts Expense Modal State (Salaries, Daily, Rents)
  const [isAccountExpenseOpen, setIsAccountExpenseOpen] = useState(false);
  const [accountExpenseSubAccount, setAccountExpenseSubAccount] = useState<SubAccountType>('salaries');
  const [editingAccountExpense, setEditingAccountExpense] = useState<TreasuryTransaction | null>(null);
  const [accountExpenseTargetEmp, setAccountExpenseTargetEmp] = useState<Employee | null>(null);

  // Calendar View Modal State (Shadcn Calendar)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isExchangeRateModalOpen, setIsExchangeRateModalOpen] = useState(false);
  const [empModalCategory, setEmpModalCategory] = useState<EmployeeCategory>('staff');

  // Carrier Modals State (شركات النقل والنواقل البرية)
  const [isCarrierFormOpen, setIsCarrierFormOpen] = useState(false);
  const [editingCarrier, setEditingCarrier] = useState<TransportCompany | null>(null);
  const [isCarrierPaymentOpen, setIsCarrierPaymentOpen] = useState(false);
  const [selectedCarrierForPayment, setSelectedCarrierForPayment] = useState<TransportCompany | null>(null);
  const [carrierPaymentBillNo, setCarrierPaymentBillNo] = useState<string>('');
  const [isCarrierStatementOpen, setIsCarrierStatementOpen] = useState(false);
  const [selectedCarrierForStatement, setSelectedCarrierForStatement] = useState<TransportCompany | null>(null);

  // Void Bill Financial Resolution Modal State
  const [isVoidBillModalOpen, setIsVoidBillModalOpen] = useState(false);
  const [voidBillTarget, setVoidBillTarget] = useState<Transaction | null>(null);

  // In-App Confirm Delete & Accounting Cancellation State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    mode?: 'cancel' | 'delete' | 'blocked';
    title: string;
    itemName: string;
    message: string;
    financialImpact?: FinancialImpact;
    activeFinancialsWarning?: {
      collected: number;
      advances: number;
      receiptsCount: number;
    };
    blockedReasonDetails?: BlockedReasonDetail[];
    accountingAdvice?: string[];
    hasPermission: boolean;
    permissionNote?: string;
    onConfirm?: () => void;
    onConfirmCancel?: (reason: string) => void;
    onConvertToCancelledBill?: () => void;
  }>({
    isOpen: false,
    mode: 'delete',
    title: '',
    itemName: '',
    message: '',
    hasPermission: true,
    permissionNote: '',
    onConfirm: () => {},
  });

  const requestDelete = ({
    title,
    itemName,
    message,
    onConfirm,
  }: {
    title: string;
    itemName?: string;
    message?: string;
    onConfirm: () => void;
  }) => {
    const hasPerm = data.currentUser.role === 'admin' || !!data.currentUser.permissions.deleteRecords;
    setDeleteConfirmation({
      isOpen: true,
      mode: 'delete',
      title,
      itemName: itemName || '',
      message: message || '',
      hasPermission: hasPerm,
      permissionNote: hasPerm
        ? undefined
        : `المستخدم الحالي (${data.currentUser.name} - ${data.currentUser.roleTitle}) لا يمتلك صلاحية الحذف. يمكنك تفعيل "صلاحية الحذف" لهذا الحساب من تبويب إدارة المستخدمين.`,
      onConfirm,
    });
  };

  // Fetch initial state from PostgreSQL on server
  useEffect(() => {
    fetch('/api/state')
      .then((res) => {
        if (!res.ok) throw new Error('Server returned error status');
        return res.json();
      })
      .then((serverData) => {
        if (serverData && !serverData.offline && serverData.users && serverData.users.length > 0) {
          setData((prev) => ({
            ...prev,
            ...serverData,
            currentUser: prev.currentUser?.id
              ? serverData.users.find((u: any) => u.id === prev.currentUser.id) || prev.currentUser
              : serverData.currentUser || prev.currentUser,
          }));
        }
      })
      .catch((err) => {
        console.info('Running with local state cache:', err?.message);
      });
  }, []);

  // Sync state to local storage
  useEffect(() => {
    saveData.customers(data.customers);
    saveData.employees(data.employees);
    saveData.carriers(data.carriers || []);
    saveData.transactions(data.transactions);
    saveData.receipts(data.receipts);
    saveData.users(data.users);
    saveData.currentUser(data.currentUser);
    saveData.attachments(data.attachments);
    saveData.treasury(data.treasury || []);
    saveData.auditLogs(data.auditLogs || []);
    if (data.exchangeRate && data.exchangeRate > 0) {
      saveData.exchangeRate(data.exchangeRate);
    }
  }, [data]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Centralized Audit Logging
  const addAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'userId' | 'userName' | 'userRole'>) => {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId: data.currentUser.id,
      userName: data.currentUser.name,
      userRole: data.currentUser.roleTitle || 'المستخدم',
    };
    setData(prev => {
      const updated = [newEntry, ...(prev.auditLogs || [])];
      return { ...prev, auditLogs: updated };
    });

    // مزامنة سجل التدقيق بالخلفية مع قاعدة بيانات PostgreSQL
    fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add_audit_log', payload: { log: newEntry } }),
    }).catch(() => {});
  };

  // Pending/Issues count for notification badge
  const pendingNotificationCount = data.transactions.filter(
    t => t.status === 'issue' || t.status === 'pending'
  ).length;

  // Transaction Status Change Rule Validation
  const handleTryChangeStatus = (tx: Transaction, newStatus: Transaction['status']) => {
    if (newStatus === 'cancelled') {
      if (tx.status === 'cancelled') return;
      setVoidBillTarget(tx);
      setIsVoidBillModalOpen(true);
      return;
    }

    if (newStatus === 'completed') {
      const fin = getBillFinancials(tx, data.receipts);
      const errors: string[] = [];

      if (fin.remainingAmount > 0) {
        errors.push(`يوجد مبلغ متبقي بذمة العميل غير مسدد بقيمة: ${formatCurrency(fin.remainingAmount, fin.currency)}`);
      }
      if (fin.openAdvances > 0) {
        errors.push(`يوجد سلف للمخلص مفتوحة وغير مصفاة بقيمة: ${formatCurrency(fin.openAdvances, fin.currency)}`);
      }

      if (errors.length > 0) {
        setValidationMsg(`لا يمكن إغلاق وإنجاز البوليصة (${tx.billNo}) لوجود التزامات مالية معلقة.`);
        setValidationDetails(errors);
        setIsValidationOpen(true);
        return;
      }
    }

    const updated = data.transactions.map(t => t.id === tx.id ? { ...t, status: newStatus } : t);
    setData(prev => ({ ...prev, transactions: updated }));
    showToast(`تم تحديث حالة البوليصة ${tx.billNo} بنجاح`);
  };

  // Void Bill Financial Resolution Handler (Cascading Void / Contra-Entry)
  const handleConfirmVoidBill = (
    tx: Transaction,
    resolution: VoidResolutionMode,
    reason: string,
    refundCash: boolean
  ) => {
    const fin = getBillFinancials(tx, data.receipts);

    const updatedTx: Transaction = {
      ...tx,
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      cancelledBy: data.currentUser.name,
      cancelReason: reason,
    };

    let updatedReceipts = [...data.receipts];
    let balanceImpactMsg = '';

    if (resolution === 'void_and_refund') {
      // Option 1: Cascading Void
      // All receipts, customer deposits/payments and open broker advances for this bill become 'cancelled'
      updatedReceipts = data.receipts.map(r => {
        if (r.billId === tx.id && r.status !== 'cancelled') {
          return {
            ...r,
            status: 'cancelled' as const,
            cancelledAt: new Date().toISOString(),
            cancelledBy: data.currentUser.name,
            cancelReason: `إلغاء دفتري مترابط مع إلغاء البوليصة (${tx.billNo}): ${reason}`,
          };
        }
        return r;
      });

      balanceImpactMsg = `تم تحييد المقبوضات (${formatCurrency(fin.totalCollected, fin.currency)}) من واردات ورصيد الصندوق واسترداد السلف (${formatCurrency(fin.openAdvances, fin.currency)})`;
      showToast(`تم إلغاء البوليصة دفترياً وانعكاس تحييد ${formatCurrency(fin.totalCollected, fin.currency)} من مقبوضات الصندوق بنجاح`);
    } else if (resolution === 'credit_customer') {
      // Option 2: Credit to customer (Cash remains in cashbox as amana/credit)
      updatedReceipts = data.receipts.map(r => {
        if (r.billId === tx.id && r.type === 'advance' && r.status !== 'cancelled') {
          return {
            ...r,
            status: 'cancelled' as const,
            cancelledAt: new Date().toISOString(),
            cancelledBy: data.currentUser.name,
            cancelReason: `استرداد سلفة ملغاة مع البوليصة (${tx.billNo}) إلى الصندوق: ${reason}`,
          };
        }
        if (r.billId === tx.id && (r.type === 'deposit' || r.type === 'payment') && r.status !== 'cancelled') {
          return {
            ...r,
            notes: `[أمانات ورصيد دائن للزبون] - أصل البوليصة الملغاة (${tx.billNo}): ${r.notes || ''}`,
          };
        }
        return r;
      });

      balanceImpactMsg = `تم الاحتفاظ بالمقبوضات (${formatCurrency(fin.totalCollected, fin.currency)}) كأمانات ورصيد دائن للزبون في الصندوق واسترداد السلف`;
      showToast(`تم إلغاء البوليصة دفترياً وتثبيت المبالغ كأمانات للزبون في الصندوق`);
    } else {
      // Option 3: Void bill only
      balanceImpactMsg = 'تم إلغاء البوليصة دفترياً فقط مع إبقاء القيود الحالية للمراجعة اليدوية';
      showToast(`تم تحويل حالة البوليصة (${tx.billNo}) إلى ملغاة دفترياً`);
    }

    const carrierPaymentsToCancel = resolution === 'void_and_refund'
      ? (data.treasury || []).filter(
          t =>
            t.status !== 'cancelled' &&
            t.type === 'withdrawal' &&
            (t.carrierId || t.subAccount === 'carriers') &&
            t.relatedBillNo &&
            t.relatedBillNo.trim().toLowerCase() === tx.billNo.trim().toLowerCase()
        )
      : [];

    let updatedTreasury = data.treasury || [];
    if (carrierPaymentsToCancel.length > 0) {
      updatedTreasury = updatedTreasury.map(t => {
        if (carrierPaymentsToCancel.some(p => p.id === t.id)) {
          return {
            ...t,
            status: 'cancelled' as const,
            cancelledAt: new Date().toISOString(),
            cancelledBy: data.currentUser.name,
            cancelReason: `إلغاء سند صرف أجور النقل واسترداد المبلغ للصندوق تلقائياً مع إلغاء البوليصة (${tx.billNo}): ${reason}`,
          };
        }
        return t;
      });
    }

    const updatedTransactions = data.transactions.map(t => t.id === tx.id ? updatedTx : t);
    setData(prev => ({
      ...prev,
      transactions: updatedTransactions,
      receipts: updatedReceipts,
      treasury: updatedTreasury,
    }));

    addAuditLog({
      action: 'void',
      entityType: 'bill',
      entityId: tx.id,
      entityReference: `بوليصة ${tx.billNo}`,
      title: 'إلغاء دفتري للبوليصة مع المعالجة المالية في الصندوق',
      details: `تم إلغاء البوليصة (${tx.billNo}) دفترياً بالمعالجة المالية (${
        resolution === 'void_and_refund'
          ? 'تحييد الأثر المالي والاسترداد من الصندوق'
          : resolution === 'credit_customer'
          ? 'أمانات ورصيد دائن للزبون'
          : 'إلغاء البوليصة فقط'
      }). السبب: ${reason}`,
      cancelReason: reason,
      financialImpact: {
        amount: tx.totalAmount,
        balanceChange: balanceImpactMsg,
      },
    });

    setIsVoidBillModalOpen(false);
    setVoidBillTarget(null);
    setIsTxDetailOpen(false);
    setIsTxModalOpen(false);
  };

  // Transaction Save
  const handleSaveTransaction = (txData: Omit<Transaction, 'id' | 'createdAt'> & { id?: string }) => {
    const totalAmount = Math.max(0, Number(txData.totalAmount) || 0);
    const initialPaid = Math.max(0, Number(txData.initialPaid) || 0);
    const initialPaidUSD = Math.max(0, Number(txData.initialPaidUSD) || 0);
    const safeTxData = {
      ...txData,
      totalAmount,
      initialPaid,
      initialPaidUSD,
    };
    const txCurr = safeTxData.currency || 'IQD';

    if (safeTxData.id) {
      const oldTx = data.transactions.find(t => t.id === safeTxData.id);
      const updated = data.transactions.map(t => t.id === safeTxData.id ? { ...t, ...safeTxData } : t);
      const rate = safeTxData.exchangeRate || data.exchangeRate || 1500;

      // Handle dual-currency deposit receipts
      let updatedReceipts = data.receipts.filter(r => {
        if (r.billId === safeTxData.id && r.type === 'deposit') {
          const rCurr = r.currency || 'IQD';
          if (rCurr === 'IQD' && safeTxData.initialPaid <= 0) return false;
          if (rCurr === 'USD' && (safeTxData.initialPaidUSD || 0) <= 0) return false;
        }
        return true;
      }).map(r => {
        if (r.billId === safeTxData.id && r.type === 'deposit') {
          const rCurr = r.currency || 'IQD';
          if (rCurr === 'IQD') {
            return {
              ...r,
              amount: safeTxData.initialPaid,
              currency: 'IQD' as Currency,
              exchangeRate: rate,
              customerId: safeTxData.customerId,
              companyId: safeTxData.companyId || r.companyId || 'naqaa_basra',
            };
          }
          if (rCurr === 'USD') {
            return {
              ...r,
              amount: safeTxData.initialPaidUSD || 0,
              currency: 'USD' as Currency,
              exchangeRate: rate,
              customerId: safeTxData.customerId,
              companyId: safeTxData.companyId || r.companyId || 'naqaa_basra',
            };
          }
        }
        return r;
      });

      const hasIQDDeposit = updatedReceipts.some(r => r.billId === safeTxData.id && r.type === 'deposit' && (r.currency || 'IQD') === 'IQD');
      const hasUSDDeposit = updatedReceipts.some(r => r.billId === safeTxData.id && r.type === 'deposit' && r.currency === 'USD');

      const newDeposits: Receipt[] = [];
      if (!hasIQDDeposit && safeTxData.initialPaid > 0) {
        newDeposits.push({
          id: `rcpt-${Date.now()}-iqd`,
          receiptNo: `REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
          type: 'deposit',
          billId: safeTxData.id,
          customerId: safeTxData.customerId,
          companyId: safeTxData.companyId || 'naqaa_basra',
          amount: safeTxData.initialPaid,
          currency: 'IQD',
          exchangeRate: rate,
          date: safeTxData.date,
          notes: 'دفعة أولى بالدينار مسجلة تلقائياً عند تعديل المعاملة',
          createdAt: new Date().toISOString().split('T')[0],
        });
      }
      if (!hasUSDDeposit && (safeTxData.initialPaidUSD || 0) > 0) {
        newDeposits.push({
          id: `rcpt-${Date.now() + 1}-usd`,
          receiptNo: `REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
          type: 'deposit',
          billId: safeTxData.id,
          customerId: safeTxData.customerId,
          companyId: safeTxData.companyId || 'naqaa_basra',
          amount: safeTxData.initialPaidUSD || 0,
          currency: 'USD',
          exchangeRate: rate,
          date: safeTxData.date,
          notes: 'دفعة أولى بالدولار مسجلة تلقائياً عند تعديل المعاملة',
          createdAt: new Date().toISOString().split('T')[0],
        });
      }
      if (newDeposits.length > 0) {
        updatedReceipts = [...newDeposits, ...updatedReceipts];
      }

      // Check if transport trips were removed/deleted and refund carrier payments to treasury
      const activeCarrierPaymentsForBill = (data.treasury || []).filter(
        t =>
          t.status !== 'cancelled' &&
          t.type === 'withdrawal' &&
          (t.carrierId || t.subAccount === 'carriers') &&
          t.relatedBillNo &&
          oldTx &&
          t.relatedBillNo.trim().toLowerCase() === oldTx.billNo.trim().toLowerCase()
      );

      const oldTrips = oldTx?.transportTrips || [];
      const newTrips = safeTxData.transportTrips || [];

      let paymentsToCancel: TreasuryTransaction[] = [];
      if (oldTrips.length > 0 && activeCarrierPaymentsForBill.length > 0) {
        if (!safeTxData.hasTransport || newTrips.length === 0) {
          // All transport trips removed from this bill
          paymentsToCancel = activeCarrierPaymentsForBill;
        } else {
          // Specific carrier trips removed or cleared
          paymentsToCancel = activeCarrierPaymentsForBill.filter(pmt => {
            const carrierStillHasTrip = newTrips.some(
              trip =>
                (pmt.carrierId && trip.carrierId === pmt.carrierId) ||
                (!pmt.carrierId && trip.carrierName === pmt.partyName)
            );
            return !carrierStillHasTrip;
          });
        }
      }

      let updatedTreasury = data.treasury || [];
      let refundNotice = '';

      if (paymentsToCancel.length > 0) {
        const cancelReason = `استرداد المبلغ للصندوق تلقائياً بسبب مسح مصاريف الشحن والنقل من البوليصة (${safeTxData.billNo})`;
        updatedTreasury = updatedTreasury.map(t => {
          if (paymentsToCancel.some(p => p.id === t.id)) {
            return {
              ...t,
              status: 'cancelled' as const,
              cancelledAt: new Date().toISOString(),
              cancelledBy: data.currentUser.name,
              cancelReason,
            };
          }
          return t;
        });

        const refundedIQD = paymentsToCancel
          .filter(p => (p.currency || 'IQD') === 'IQD')
          .reduce((s, p) => s + (p.amount || 0), 0);
        const refundedUSD = paymentsToCancel
          .filter(p => p.currency === 'USD')
          .reduce((s, p) => s + (p.amount || 0), 0);

        refundNotice = `${refundedIQD > 0 ? formatCurrency(refundedIQD, 'IQD') : ''}${
          refundedUSD > 0 ? (refundedIQD > 0 ? ' + ' : '') + formatCurrency(refundedUSD, 'USD') : ''
        }`;

        addAuditLog({
          action: 'void',
          entityType: 'treasury',
          entityId: safeTxData.id,
          entityReference: `بوليصة ${safeTxData.billNo}`,
          title: 'استرداد أجور النقل إلى الصندوق بعد مسح الشحن',
          details: `تم إلغاء ${paymentsToCancel.length} سند صرف لنواقل البوليصة (${safeTxData.billNo}) وإعادة المبالغ (${refundNotice}) إلى رصيد الصندوق تلقائياً بعد مسح مصاريف النقل.`,
          financialImpact: {
            amount: refundedIQD || refundedUSD,
            balanceChange: `إيداع واسترداد نقدي إلى الصندوق: +${refundNotice}`,
          },
        });
      }

      setData(prev => ({
        ...prev,
        transactions: updated,
        receipts: updatedReceipts,
        treasury: updatedTreasury,
      }));

      setSelectedTx(prev => (prev && prev.id === safeTxData.id ? updated.find(t => t.id === safeTxData.id) || null : prev));

      addAuditLog({
        action: 'update',
        entityType: 'bill',
        entityId: txData.id,
        entityReference: `بوليصة ${safeTxData.billNo}`,
        title: 'تعديل بيانات بوليصة كمركية',
        details: `تحديث بيانات البوليصة (${safeTxData.billNo}) - المبلغ الكلي: ${formatCurrency(safeTxData.totalAmount, txCurr)}.`,
        financialImpact: { amount: safeTxData.totalAmount },
      });

      if (refundNotice) {
        showToast(`تم تعديل البوليصة واسترداد ${refundNotice} إلى رصيد الصندوق تلقائياً`);
      } else {
        showToast('تم تعديل بيانات البوليصة بنجاح');
      }
    } else {
      const txCurr = safeTxData.currency || 'IQD';
      const newTx: Transaction = {
        ...safeTxData,
        id: `tx-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      // If there is an initial paid amount, automatically record deposit receipts for IQD and/or USD
      let newReceipts = [...data.receipts];
      const rate = newTx.exchangeRate || data.exchangeRate || 1500;

      if (newTx.initialPaid > 0) {
        newReceipts.push({
          id: `rcpt-${Date.now()}-iqd`,
          receiptNo: `REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
          type: 'deposit',
          billId: newTx.id,
          customerId: newTx.customerId,
          companyId: newTx.companyId || 'naqaa_basra',
          amount: newTx.initialPaid,
          currency: 'IQD',
          exchangeRate: rate,
          date: newTx.date,
          notes: 'دفعة أولى بالدينار مسجلة تلقائياً عند فتح المعاملة',
          createdAt: newTx.createdAt,
        });
      }

      if ((newTx.initialPaidUSD || 0) > 0) {
        newReceipts.push({
          id: `rcpt-${Date.now() + 1}-usd`,
          receiptNo: `REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
          type: 'deposit',
          billId: newTx.id,
          customerId: newTx.customerId,
          companyId: newTx.companyId || 'naqaa_basra',
          amount: newTx.initialPaidUSD!,
          currency: 'USD',
          exchangeRate: rate,
          date: newTx.date,
          notes: 'دفعة أولى بالدولار مسجلة تلقائياً عند فتح المعاملة',
          createdAt: newTx.createdAt,
        });
      }

      const depositSummary = [
        newTx.initialPaid > 0 ? formatCurrency(newTx.initialPaid, 'IQD') : null,
        (newTx.initialPaidUSD || 0) > 0 ? formatCurrency(newTx.initialPaidUSD || 0, 'USD') : null,
      ].filter(Boolean).join(' + ');

      setData(prev => ({
        ...prev,
        transactions: [newTx, ...prev.transactions],
        receipts: newReceipts,
      }));
      addAuditLog({
        action: 'create',
        entityType: 'bill',
        entityId: newTx.id,
        entityReference: `بوليصة ${newTx.billNo}`,
        title: 'إنشاء بوليصة كمركية ومعاملة جديدة',
        details: `تم تسجيل بوليصة جديدة رقم (${newTx.billNo}) لبضاعة: ${newTx.goodsType || 'عامة'} بمبلغ إجمالي ${
          newTx.isMixedCurrency
            ? `${formatCurrency(newTx.totalAmount, 'IQD')} + ${formatCurrency(newTx.totalAmountUSD || 0, 'USD')}`
            : formatCurrency(newTx.totalAmount, txCurr)
        }${depositSummary ? ` (الدفعة الأولى المقبوضة: ${depositSummary})` : ''}.`,
        financialImpact: {
          amount: newTx.totalAmount,
          balanceChange: depositSummary ? `إيداع الدفعة الأولى (${depositSummary}) في الصندوق` : undefined,
        },
      });
      showToast('تم إنشاء البوليصة الجديدة بنجاح');
    }
    setIsTxModalOpen(false);
    setEditingTx(null);
  };

  const handleDeleteTransaction = (tx: Transaction) => {
    // Check if the bill has active financial movements (non-cancelled receipts, collected/advance funds, or carrier payments)
    const activeReceipts = data.receipts.filter(r => r.billId === tx.id && r.status !== 'cancelled');
    const fin = getBillFinancials(tx, data.receipts);
    const activeCarrierPayments = (data.treasury || []).filter(
      t =>
        t.status !== 'cancelled' &&
        t.type === 'withdrawal' &&
        (t.carrierId || t.subAccount === 'carriers') &&
        t.relatedBillNo &&
        t.relatedBillNo.trim().toLowerCase() === tx.billNo.trim().toLowerCase()
    );

    if (activeReceipts.length > 0 || fin.totalCollected > 0 || fin.totalAdvances > 0 || activeCarrierPayments.length > 0) {
      // Accounting Guard: Block raw deletion to protect financial ledger integrity
      setDeleteConfirmation({
        isOpen: true,
        mode: 'blocked',
        title: 'قيد حماية محاسبي: منع حذف البوليصة',
        itemName: `بوليصة رقم: ${tx.billNo} - ${tx.goodsType || 'بضاعة عامة'}`,
        message: `وفقاً للمبادئ والمعايير المحاسبية المعتمدة، لا يمكن حذف بوليصة كمركية تم تقييد وصولات قبض أو سلف أو دفعات نقل مرتبطة بها بصندوق الشركة. يمكنك إلغاء السندات أولاً أو تحويل حالة البوليصة دفترياً إلى "ملغاة" للاحتفاظ بالأمان المالي واسترداد المبالغ للصندوق.`,
        hasPermission: data.currentUser.role === 'admin' || !!data.currentUser.permissions.deleteRecords,
        activeFinancialsWarning: {
          collected: fin.totalCollected,
          advances: fin.totalAdvances,
          receiptsCount: activeReceipts.length + activeCarrierPayments.length,
        },
        onConvertToCancelledBill: () => {
          setDeleteConfirmation(prev => ({ ...prev, isOpen: false }));
          setVoidBillTarget(tx);
          setIsVoidBillModalOpen(true);
        },
      });
      return;
    }

    // If bill has no active financial records, standard delete confirmation is permitted
    const hasPerm = data.currentUser.role === 'admin' || !!data.currentUser.permissions.deleteRecords;
    setDeleteConfirmation({
      isOpen: true,
      mode: 'delete',
      title: 'حذف بوليصة كمركية (بدون قيود مالية)',
      itemName: `بوليصة رقم: ${tx.billNo} - ${tx.goodsType || 'بضاعة عامة'}`,
      message: `هل أنت متأكد من حذف البوليصة (${tx.billNo})؟ لا توجد وصولات مالية نشطة مرتبطة بها، وسيتم حذف السجل والمرفقات نهائياً.`,
      hasPermission: hasPerm,
      permissionNote: hasPerm
        ? undefined
        : `المستخدم الحالي (${data.currentUser.name} - ${data.currentUser.roleTitle}) لا يمتلك صلاحية الحذف.`,
      onConfirm: () => {
        setData(prev => ({
          ...prev,
          transactions: prev.transactions.filter(t => t.id !== tx.id),
          receipts: prev.receipts.filter(r => r.billId !== tx.id),
          attachments: prev.attachments.filter(a => a.entityId !== tx.id),
        }));
        addAuditLog({
          action: 'delete',
          entityType: 'bill',
          entityId: tx.id,
          entityReference: `بوليصة ${tx.billNo}`,
          title: 'حذف إداري لبوليصة كمركية',
          details: `تم الحذف الإداري للبوليصة (${tx.billNo}) الخالية من القيود المالية.`,
        });
        showToast(`تم حذف البوليصة (${tx.billNo}) بنجاح`);
        setIsTxModalOpen(false);
        setIsTxDetailOpen(false);
      },
    });
  };

  const handleDeleteTripFromBill = (tx: Transaction, trip: BillTransportTrip) => {
    const normalizeBillNo = (no?: string) => (no || '').trim().replace(/^#/, '').toLowerCase();
    const billNoClean = normalizeBillNo(tx.billNo);

    const activeCarrierPayments = (data.treasury || []).filter(t => {
      if (t.status === 'cancelled' || t.type !== 'withdrawal') return false;
      const isCarrier = t.subAccount === 'carriers' || !!t.carrierId || (t.category && (t.category.includes('نقل') || t.category.includes('ناقل')));
      if (!isCarrier) return false;
      const matchBill = normalizeBillNo(t.relatedBillNo) === billNoClean;
      const matchCarrier = (t.carrierId && t.carrierId === trip.carrierId) || (trip.carrierName && t.partyName === trip.carrierName);
      return matchBill && matchCarrier;
    });

    const otherTripsForThisCarrier = (tx.transportTrips || []).filter(
      t => t.id !== trip.id && ((trip.carrierId && t.carrierId === trip.carrierId) || (trip.carrierName && t.carrierName === trip.carrierName))
    );

    const willCancelPayments = activeCarrierPayments.length > 0 && otherTripsForThisCarrier.length === 0;

    const totalPaidIQD = activeCarrierPayments.filter(p => (p.currency || 'IQD') === 'IQD').reduce((s, p) => s + (p.amount || 0), 0);
    const totalPaidUSD = activeCarrierPayments.filter(p => p.currency === 'USD').reduce((s, p) => s + (p.amount || 0), 0);
    const paidText = `${totalPaidIQD > 0 ? formatCurrency(totalPaidIQD, 'IQD') : ''}${totalPaidUSD > 0 ? (totalPaidIQD > 0 ? ' + ' : '') + formatCurrency(totalPaidUSD, 'USD') : ''}`;

    const hasPerm = data.currentUser.role === 'admin' || !!data.currentUser.permissions.deleteRecords;

    const message = willCancelPayments
      ? `هل أنت متأكد من حذف هذه النقلة (${trip.carrierName || 'شركة النقل'} - ${trip.destination || 'وجهة عامة'})؟\n\nتنبيه محاسبي: توجد سندات صرف مسددة لهذا الناقل من الصندوق بقيمة (${paidText}). عند تأكيد الحذف، سيتم حذف النقلة وإلغاء سندات الصرف دفترياً تلقائياً واسترداد كامل المبالغ المسددة إلى رصيد الصندوق مع قيد تدقيق محاسبي.`
      : `هل أنت متأكد من حذف هذه النقلة (${trip.carrierName || 'شركة النقل'} - ${trip.destination || 'وجهة عامة'}) من البوليصة رقم (${tx.billNo})؟ سيتم تحديث إجمالي تكاليف النقل المستحقة للبوليصة تلقائياً.`;

    const financialImpact: FinancialImpact | undefined = willCancelPayments
      ? {
          inflowChange: `استرداد نقدي للصندوق: +${paidText}`,
          outflowChange: `إلغاء سندات صرف الناقل: -${paidText}`,
          balanceChange: `زيادة رصيد الصندوق: +${paidText}`,
        }
      : undefined;

    setDeleteConfirmation({
      isOpen: true,
      mode: willCancelPayments ? 'cancel' : 'delete',
      title: 'حذف نقلة / شاحنة من البوليصة',
      itemName: `${trip.carrierName || 'شركة النقل'} (${trip.destination || 'مسار عام'}) - تكلفة: ${formatCurrency(trip.carrierCost, trip.currency)}`,
      message,
      financialImpact,
      accountingAdvice: willCancelPayments ? [
        'سيتم إلغاء سندات الصرف المسددة لهذا الناقل دفترياً تلقائياً لإعادة الأموال إلى رصيد الصندوق.',
        'سيتم تسجيل قيد تدقيق يوضح استرداد المبلغ دفترياً لضمان سلامة ميزانية الخزينة.',
      ] : undefined,
      hasPermission: hasPerm,
      permissionNote: hasPerm
        ? undefined
        : `المستخدم الحالي (${data.currentUser.name} - ${data.currentUser.roleTitle}) لا يمتلك صلاحية الحذف.`,
      onConfirm: () => {
        const updatedTrips = (tx.transportTrips || []).filter(t => t.id !== trip.id);
        const updatedTx: Transaction = {
          ...tx,
          transportTrips: updatedTrips,
          hasTransport: updatedTrips.length > 0,
        };
        handleSaveTransaction(updatedTx);
      },
    });
  };

  // Customer Save & Delete
  const handleSaveCustomer = (custData: Omit<Customer, 'id' | 'createdAt'> & { id?: string }) => {
    if (custData.id) {
      const updated = data.customers.map(c => c.id === custData.id ? { ...c, ...custData } : c);
      setData(prev => ({ ...prev, customers: updated }));
      showToast('تم تحديث بيانات الزبون');
    } else {
      const newCust: Customer = {
        ...custData,
        id: `cust-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setData(prev => ({ ...prev, customers: [newCust, ...prev.customers] }));
      showToast('تمت إضافة الزبون بنجاح');
    }
    setIsCustModalOpen(false);
    setEditingCust(null);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    // Check if customer has active bills or active receipts
    const custBills = (data.transactions || []).filter(t => t.status !== 'cancelled' && t.customerId === customer.id);
    const custReceipts = (data.receipts || []).filter(r => r.status !== 'cancelled' && r.customerId === customer.id);

    if (custBills.length > 0 || custReceipts.length > 0) {
      const blockedDetails: BlockedReasonDetail[] = [];
      if (custBills.length > 0) {
        blockedDetails.push({
          label: 'بوالص كمركية مرتبطة بالزبون',
          value: `${custBills.length} بوليصة نشطة`,
          subValue: 'بوالص نشطة في النظام ولها حسابات وذمم مالية',
          variant: 'amber',
        });
      }
      if (custReceipts.length > 0) {
        blockedDetails.push({
          label: 'سندات ووصولات قبض من الزبون',
          value: `${custReceipts.length} سند قبض`,
          subValue: 'مقبوضات مقيدة بحساب صندوق الشركة',
          variant: 'cyan',
        });
      }

      setDeleteConfirmation({
        isOpen: true,
        mode: 'blocked',
        title: 'قيد حماية محاسبي: منع حذف سجل الزبون',
        itemName: `الزبون: ${customer.name} (${customer.phone || customer.contact || 'زبون تجاري'})`,
        message: `وفقاً للأصول والمعايير المحاسبية المعتمدة، لا يمكن حذف سجل زبون مقيد باسمه بوالص كمركية جارية أو سندات قبض مالية بصندوق الشركة، وذلك لحماية الذمم المالية وسلامة كشوف الحسابات.`,
        hasPermission: data.currentUser.role === 'admin' || !!data.currentUser.permissions.deleteRecords,
        blockedReasonDetails: blockedDetails,
        accountingAdvice: [
          'يجب تصفية كافة المعاملات والمستحقات المتبقية على الزبون قبل أي إجراء.',
          'الاحتفاظ ببيانات الزبون كأرشيف تاريخي دائم يضمن سلامة القيود وكشوف المطابقة في أي وقت.',
        ],
      });
      return;
    }

    const hasPerm = data.currentUser.role === 'admin' || !!data.currentUser.permissions.deleteRecords;
    setDeleteConfirmation({
      isOpen: true,
      mode: 'delete',
      title: 'حذف سجل الزبون (بدون قيود مالية)',
      itemName: `الزبون: ${customer.name}`,
      message: `هل أنت متأكد من حذف الزبون (${customer.name})؟ لا توجد أي بوالص أو وصولات مالية مرتبطة به في النظام.`,
      hasPermission: hasPerm,
      permissionNote: hasPerm
        ? undefined
        : `المستخدم الحالي (${data.currentUser.name} - ${data.currentUser.roleTitle}) لا يمتلك صلاحية الحذف.`,
      onConfirm: () => {
        setData(prev => ({
          ...prev,
          customers: prev.customers.filter(c => c.id !== customer.id),
        }));
        addAuditLog({
          action: 'delete',
          entityType: 'customer',
          entityId: customer.id,
          entityReference: `زبون: ${customer.name}`,
          title: 'حذف إداري لسجل زبون',
          details: `تم الحذف الإداري لسجل الزبون (${customer.name}) الخالي من القيود المالية والبوالص.`,
        });
        showToast('تم حذف الزبون بنجاح');
        setIsCustModalOpen(false);
      },
    });
  };

  // Employee Save & Delete
  const handleSaveEmployee = (empData: Omit<Employee, 'id'> & { id?: string }) => {
    if (empData.id) {
      const updated = data.employees.map(e => e.id === empData.id ? { ...e, ...empData } : e);
      setData(prev => ({ ...prev, employees: updated }));
      showToast('تم تحديث بيانات الموظف / المخلص بنجاح');
    } else {
      const newEmp: Employee = {
        ...empData,
        id: `emp-${Date.now()}`,
      };
      setData(prev => ({ ...prev, employees: [...prev.employees, newEmp] }));
      showToast('تمت إضافة الموظف / المخلص بنجاح');
    }
    setIsEmpModalOpen(false);
    setEditingEmp(null);
  };

  const handleDeleteEmployee = (emp: Employee) => {
    const roleLabel = emp.category === 'staff' ? 'موظف شركة' : emp.category === 'broker' ? 'مخلص كمركي' : 'موظف / مخلص كمركي';

    // 1. Check active financial receipts & open advances
    const empReceipts = (data.receipts || []).filter(r => r.status !== 'cancelled' && r.employeeId === emp.id);
    const empAdvances = getEmployeeAdvances(emp.id, data.receipts || []);

    // 2. Check active customs declarations / bills assigned to this broker/employee
    const empBills = (data.transactions || []).filter(t => t.status !== 'cancelled' && t.employeeId === emp.id);

    // 3. Check active treasury cashbox movements tied to this employee (salaries, advances, etc.)
    const empTreasury = (data.treasury || []).filter(
      t =>
        t.status !== 'cancelled' &&
        (t.partyName?.trim().toLowerCase() === emp.name.trim().toLowerCase() ||
          t.description?.includes(emp.name))
    );

    const hasActiveFinancials =
      empReceipts.length > 0 ||
      empAdvances.openIQD > 0 ||
      empAdvances.openUSD > 0 ||
      empAdvances.advancesIQD > 0 ||
      empAdvances.advancesUSD > 0 ||
      empBills.length > 0 ||
      empTreasury.length > 0;

    if (hasActiveFinancials) {
      const blockedDetails: BlockedReasonDetail[] = [];

      if (empAdvances.openIQD > 0 || empAdvances.openUSD > 0) {
        blockedDetails.push({
          label: 'سلف مفتوحة بذمة المخلص (غير مسواة)',
          value: `${formatCurrency(empAdvances.openIQD, 'IQD')}${empAdvances.openUSD > 0 ? ' + ' + formatCurrency(empAdvances.openUSD, 'USD') : ''}`,
          subValue: 'أموال نقدية خرجت من الصندوق ولم تسوَّ بعد',
          variant: 'rose',
        });
      }

      if (empAdvances.advancesIQD > 0 || empAdvances.advancesUSD > 0) {
        blockedDetails.push({
          label: 'إجمالي السلف النقدية المنصرفة',
          value: `${formatCurrency(empAdvances.advancesIQD, 'IQD')}${empAdvances.advancesUSD > 0 ? ' + ' + formatCurrency(empAdvances.advancesUSD, 'USD') : ''}`,
          subValue: 'سندات سلف صادرة من صندوق الشركة',
          variant: 'amber',
        });
      }

      if (empReceipts.length > 0) {
        blockedDetails.push({
          label: 'سندات ووصولات مالية نشطة',
          value: `${empReceipts.length} سند مالي`,
          subValue: 'سلف نقدية وتسويات مصاريف تخليص',
          variant: 'cyan',
        });
      }

      if (empBills.length > 0) {
        blockedDetails.push({
          label: 'بوالص كمركية مسندة للمخلص',
          value: `${empBills.length} بوليصة نشطة`,
          subValue: 'بوالص قيد الإجراء أو مكتملة في النظام',
          variant: 'emerald',
        });
      }

      if (empTreasury.length > 0) {
        blockedDetails.push({
          label: 'قيود مدفوعات بصندوق الشركة',
          value: `${empTreasury.length} قيد صندوق`,
          subValue: 'سندات صرف أو رواتب مباشرة من الخزينة',
          variant: 'default',
        });
      }

      setDeleteConfirmation({
        isOpen: true,
        mode: 'blocked',
        title: 'قيد حماية محاسبي: منع حذف المخلص / الموظف',
        itemName: `${roleLabel}: ${emp.name} (${emp.jobTitle || 'تخليص كمركي'})`,
        message: `وفقاً للأصول والمعايير المحاسبية المعتمدة، لا يمكن حذف سجل مخلص كمركي أو موظف ارتبطت بذمته بوالص جارية أو وصولات سلف وأموال نقدية من صندوق الشركة. حذف السجل يؤدي إلى ضياع تسلسل القيود واختلال كشوفات الحسابات وميزان الصندوق.`,
        hasPermission: data.currentUser.role === 'admin' || !!data.currentUser.permissions.deleteRecords,
        blockedReasonDetails: blockedDetails,
        accountingAdvice: [
          'تصفية وتسوية سلف المخلص الكمركي دفترياً بالكامل من تبويب "المخلصين" قبل اتخاذ أي إجراء.',
          'إعادة إسناد البوالص الكمركية الجارية إلى مخلص كمركي آخر لضمان استمرارية العمليات.',
          'الاحتفاظ بسجل المخلص في النظام كأرشيف تاريخي دائم لضمان صحة التدقيق المالي وكشوفات الحساب.',
        ],
      });
      return;
    }

    // If completely free from any financial or operational links:
    const hasPerm = data.currentUser.role === 'admin' || !!data.currentUser.permissions.deleteRecords;
    setDeleteConfirmation({
      isOpen: true,
      mode: 'delete',
      title: 'حذف سجل موظف أو مخلص (بدون قيود مالية)',
      itemName: `${roleLabel}: ${emp.name}`,
      message: `هل أنت متأكد من حذف ${roleLabel} (${emp.name})؟ لا توجد أي بوالص أو قيود مالية أو سلف مرتبطة به.`,
      hasPermission: hasPerm,
      permissionNote: hasPerm
        ? undefined
        : `المستخدم الحالي (${data.currentUser.name} - ${data.currentUser.roleTitle}) لا يمتلك صلاحية الحذف.`,
      onConfirm: () => {
        setData(prev => ({ ...prev, employees: prev.employees.filter(e => e.id !== emp.id) }));
        addAuditLog({
          action: 'delete',
          entityType: 'employee',
          entityId: emp.id,
          entityReference: `${roleLabel}: ${emp.name}`,
          title: 'حذف إداري لسجل موظف / مخلص',
          details: `تم الحذف الإداري لسجل (${emp.name}) الخالي من القيود المالية والبوالص.`,
        });
        showToast('تم حذف السجل بنجاح');
        setIsEmpModalOpen(false);
      },
    });
  };

  // Receipt Save & Delete
  const handleSaveReceipt = (rcptData: Omit<Receipt, 'id' | 'createdAt'>) => {
    const safeAmount = Number(rcptData.amount) || 0;
    if (rcptData.type === 'payment' && rcptData.billId) {
      const tx = data.transactions.find(t => t.id === rcptData.billId);
      if (tx) {
        const fin = getBillFinancials(tx, data.receipts);
        const hasRemaining = tx.isMixedCurrency
          ? (fin.remainingAmount > 0 || (fin.remainingAmountUSD || 0) > 0)
          : fin.remainingAmount > 0;
        if (!hasRemaining) {
          showToast('هذه البوليصة مسددة بالكامل (خالصة)، ولا يمكن إضافة دفعة');
          return;
        }
      }
    }

    const tx = rcptData.billId ? data.transactions.find(t => t.id === rcptData.billId) : null;
    const resolvedCurrency = rcptData.currency || tx?.currency || 'IQD';
    const resolvedRate = rcptData.exchangeRate || data.exchangeRate || tx?.exchangeRate || 1500;
    const resolvedCompany = rcptData.companyId || tx?.companyId || 'naqaa_basra';

    const newRcpt: Receipt = {
      ...rcptData,
      amount: safeAmount,
      currency: resolvedCurrency,
      exchangeRate: resolvedRate,
      companyId: resolvedCompany,
      id: `rcpt-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    saveData.exchangeRate(resolvedRate);
    setData(prev => ({
      ...prev,
      exchangeRate: resolvedRate,
      receipts: [newRcpt, ...prev.receipts],
    }));
    addAuditLog({
      action: 'create',
      entityType: 'receipt',
      entityId: newRcpt.id,
      entityReference: `سند ${newRcpt.receiptNo}`,
      title: newRcpt.type === 'deposit' ? 'تسجيل سند قبض دفعة أولى' : newRcpt.type === 'payment' ? 'تسجيل سند قبض دفعة زبون' : newRcpt.type === 'advance' ? 'صرف سلفة لمخلص كمركي' : 'تسوية سلفة لمخلص',
      details: `سند رقم (${newRcpt.receiptNo}) بمبلغ (${formatCurrency(newRcpt.amount, resolvedCurrency)}) - البيان: ${newRcpt.notes || 'سند نظامي'}.`,
      financialImpact: {
        amount: newRcpt.amount,
        balanceChange: (newRcpt.type === 'deposit' || newRcpt.type === 'payment') 
          ? `إيداع ${formatCurrency(newRcpt.amount, resolvedCurrency)} في الخزينة`
          : newRcpt.type === 'advance'
          ? `صرف ${formatCurrency(newRcpt.amount, resolvedCurrency)} من الصندوق كسلفة`
          : undefined,
      },
    });
    setIsRcptModalOpen(false);
    showToast(`تم تسجيل السند المالي بمبلغ ${formatCurrency(newRcpt.amount, resolvedCurrency)} بنجاح`);
  };

  const handleDeleteReceipt = (rcpt: Receipt) => {
    const typeLabel = rcpt.type === 'deposit' ? 'دفعة أولى (مقدم)' : rcpt.type === 'payment' ? 'دفعة من الزبون' : rcpt.type === 'advance' ? 'سلفة للمخلص' : 'تسوية سلفة';
    const tx = data.transactions.find(t => t.id === rcpt.billId);
    const hasPerm = data.currentUser.role === 'admin' || !!data.currentUser.permissions.deleteRecords;

    // Calculate exact corporate financial impact on Inflow, Outflow, Cashbox, and Parties
    let inflowChange: string | undefined;
    let outflowChange: string | undefined;
    let balanceChange: string | undefined;
    let partyChange: string | undefined;

    const rCurr = rcpt.currency || tx?.currency || 'IQD';
    if (rcpt.type === 'deposit' || rcpt.type === 'payment') {
      inflowChange = `خصم ${formatCurrency(rcpt.amount, rCurr)} من إجمالي الواردات (المقبوضات)`;
      balanceChange = `نقصان رصيد صندوق الشركة فوراً بمقدار ${formatCurrency(rcpt.amount, rCurr)}`;
      partyChange = tx
        ? `إعادة احتساب ذمة الزبون في البوليصة (${tx.billNo})، حيث سيزداد المتبقي بمقدار ${formatCurrency(rcpt.amount, rCurr)}`
        : `تعديل حساب الزبون بمقدار ${formatCurrency(rcpt.amount, rCurr)}`;
    } else if (rcpt.type === 'advance') {
      outflowChange = `خصم ${formatCurrency(rcpt.amount, rCurr)} من إجمالي المصروفات والسلف`;
      balanceChange = `استرداد ${formatCurrency(rcpt.amount, rCurr)} إلى رصيد صندوق الشركة`;
      partyChange = `تخفيض ذمة المخلص وإغلاق السلفة المفتوحة بمقدار ${formatCurrency(rcpt.amount, rCurr)}`;
    } else if (rcpt.type === 'settlement') {
      partyChange = `إلغاء قيد التسوية وإعادة فتح ذمة السلفة على المخلص الكمركي بمقدار ${formatCurrency(rcpt.amount, rCurr)}`;
    }

    setDeleteConfirmation({
      isOpen: true,
      mode: 'cancel',
      title: 'إلغاء دفتري محاسبي لسند مالي',
      itemName: `سند رقم: ${rcpt.receiptNo} (${typeLabel} بمبلغ ${formatCurrency(rcpt.amount, rCurr)})`,
      message: `حسب الأصول المحاسبية القياسية، يتم وسم السند بـ "ملغي دفترياً" مع الاحتفاظ برقمه التسلسلي وتاريخه، وحذف أثره بالكامل من رصيد الصندوق وإجمالي الواردات/المصروفات.`,
      financialImpact: {
        inflowChange,
        outflowChange,
        balanceChange,
        partyChange,
      },
      hasPermission: hasPerm,
      permissionNote: hasPerm
        ? undefined
        : `المستخدم الحالي (${data.currentUser.name} - ${data.currentUser.roleTitle}) لا يمتلك صلاحية إلغاء أو حذف السجلات المالية.`,
      onConfirmCancel: (reason: string) => {
        const updated = data.receipts.map(r =>
          r.id === rcpt.id
            ? {
                ...r,
                status: 'cancelled' as const,
                cancelledAt: new Date().toISOString(),
                cancelledBy: data.currentUser.name,
                cancelReason: reason || 'إلغاء دفتري محاسبي',
              }
            : r
        );
        setData(prev => ({ ...prev, receipts: updated }));
        addAuditLog({
          action: 'void',
          entityType: 'receipt',
          entityId: rcpt.id,
          entityReference: `سند ${rcpt.receiptNo}`,
          title: rcpt.type === 'advance' ? 'إلغاء دفتري لسلفة مخلص واستردادها للصندوق' : 'إلغاء دفتري لسند مالي وتحييد أثره',
          details: `تم إلغاء السند (${rcpt.receiptNo}) بمبلغ (${formatCurrency(rcpt.amount, rCurr)}) دفترياً واستبعاد أثره من الخزينة.`,
          cancelReason: reason || 'إلغاء دفتري محاسبي',
          financialImpact: {
            amount: rcpt.amount,
            balanceChange,
          },
        });
        showToast(`تم إلغاء السند (${rcpt.receiptNo}) دفترياً وتعديل أثر الصندوق والحسابات`);
        setDeleteConfirmation(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  // User Save & Delete
  const handleSaveUser = (userData: Omit<AppUser, 'id' | 'createdAt'> & { id?: string }) => {
    if (userData.id) {
      const updated = data.users.map(u => u.id === userData.id ? { ...u, ...userData } : u);
      setData(prev => ({
        ...prev,
        users: updated,
        currentUser: prev.currentUser.id === userData.id ? { ...prev.currentUser, ...userData } : prev.currentUser,
      }));
      addAuditLog({
        action: 'update',
        entityType: 'user',
        entityId: userData.id,
        entityReference: `@${userData.username}`,
        title: 'تعديل بيانات المستخدم وكلمة المرور',
        details: `تم تحديث بيانات المستخدم (${userData.name} - @${userData.username}) وتعديل صلاحياته ورتبته (${userData.roleTitle}).`,
      });
      showToast('تم تحديث بيانات وصلاحيات المستخدم بنجاح');
    } else {
      const newUser: AppUser = {
        ...userData,
        id: `usr-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setData(prev => ({ ...prev, users: [...prev.users, newUser] }));
      addAuditLog({
        action: 'create',
        entityType: 'user',
        entityId: newUser.id,
        entityReference: `@${newUser.username}`,
        title: 'إضافة مستخدم جديد وتعيين كلمة المرور',
        details: `تم إنشاء حساب مستخدم جديد (${newUser.name} - @${newUser.username}) برتبة: ${newUser.roleTitle}.`,
      });
      showToast('تمت إضافة المستخدم وتعيين بيانات الدخول بنجاح');
    }
    setIsUserModalOpen(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (user: AppUser) => {
    if (data.users.length <= 1) {
      showToast('لا يمكن حذف المستخدم الأخير المتبقي في النظام، يجب وجود مستخدم واحد على الأقل.');
      return;
    }
    if (user.id === data.currentUser.id) {
      showToast('لا يمكنك حذف المستخدم المسجل دخوله حالياً. يرجى التبديل لمستخدم آخر أولاً.');
      return;
    }
    requestDelete({
      title: 'حذف مستخدم النظام',
      itemName: `المستخدم: ${user.name} (@${user.username})`,
      message: `هل أنت متأكد من حذف المستخدم (${user.name})؟ سيتم سحب صلاحياته ومنعه من تسجيل الدخول.`,
      onConfirm: () => {
        setData(prev => ({
          ...prev,
          users: prev.users.filter(u => u.id !== user.id),
        }));
        addAuditLog({
          action: 'delete',
          entityType: 'user',
          entityId: user.id,
          entityReference: `@${user.username}`,
          title: 'حذف مستخدم من النظام',
          details: `تم حذف حساب المستخدم (${user.name} - @${user.username}) من النظام.`,
        });
        showToast('تم حذف المستخدم بنجاح');
        setIsUserModalOpen(false);
      },
    });
  };

  const handleSwitchUser = (u: AppUser) => {
    const updatedUser: AppUser = {
      ...u,
      lastLogin: new Date().toISOString(),
    };
    const updatedUsers = data.users.map(user => user.id === u.id ? updatedUser : user);
    setData(prev => ({
      ...prev,
      users: updatedUsers,
      currentUser: updatedUser,
    }));
    
    // Auto-switch to first allowed tab if current activePage is forbidden for this user
    if (!isPageAllowed(activePage, updatedUser)) {
      const fallbackTab = getFirstAllowedPage(updatedUser);
      setActivePage(fallbackTab);
    }

    addAuditLog({
      action: 'auth',
      entityType: 'user',
      entityId: u.id,
      entityReference: `@${u.username}`,
      title: 'تسجيل دخول وتبديل مستخدم',
      details: `تم تسجيل الدخول بنجاح بحساب (${u.name} - @${u.username}) برتبة (${u.roleTitle}).`,
    });
    showToast(`تم تسجيل الدخول بنجاح: ${u.name}`);
  };

  // Quick Advance Save
  const handleSaveQuickAdvance = (
    amount: number,
    employeeId: string,
    date: string,
    notes: string,
    commission?: {
      hasCommission: boolean;
      commissionAmount: number;
      commissionCurrency: Currency;
      commissionBearer: 'company' | 'party';
    },
    advanceCurrency?: Currency
  ) => {
    if (!quickAdvTx) return;
    const curr = advanceCurrency || quickAdvTx.currency || 'IQD';
    const usedRate = data.exchangeRate || quickAdvTx.exchangeRate || 1500;
    const newRcpt: Receipt = {
      id: `rcpt-${Date.now()}`,
      receiptNo: `ADV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      type: 'advance',
      billId: quickAdvTx.id,
      employeeId,
      companyId: quickAdvTx.companyId || 'naqaa_basra',
      amount: Number(amount) || 0,
      currency: curr,
      exchangeRate: usedRate,
      hasCommission: commission?.hasCommission,
      commissionAmount: commission?.hasCommission ? commission.commissionAmount : undefined,
      commissionCurrency: commission?.hasCommission ? commission.commissionCurrency : undefined,
      commissionBearer: commission?.hasCommission ? commission.commissionBearer : undefined,
      date,
      notes,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setData(prev => ({ ...prev, receipts: [newRcpt, ...prev.receipts] }));
    setIsQuickAdvOpen(false);
    setQuickAdvTx(null);
    showToast(`تم صرف السلفة للمخلص وتسجيل السند بمبلغ ${formatCurrency(amount, curr)}`);
  };

  // Quick Payment Save
  const handleSaveQuickPayment = (
    amount: number,
    date: string,
    notes: string,
    commission?: {
      hasCommission: boolean;
      commissionAmount: number;
      commissionCurrency: Currency;
      commissionBearer: 'company' | 'party';
    },
    paymentCurrency?: Currency,
    customExchangeRate?: number,
    dualPayment?: {
      amountIQD: number;
      amountUSD: number;
    }
  ) => {
    if (!quickPayTx) return;
    const fin = getBillFinancials(quickPayTx, data.receipts, customExchangeRate || data.exchangeRate || 1500);
    const hasRemaining = quickPayTx.isMixedCurrency
      ? (fin.remainingAmount > 0 || (fin.remainingAmountUSD || 0) > 0)
      : fin.remainingAmount > 0;
    if (!hasRemaining) {
      showToast('هذه البوليصة مسددة بالكامل (خالصة)، ولا يوجد متبقي مستحق للقبض');
      return;
    }

    const usedRate = normalizeExchangeRate(
      customExchangeRate || data.exchangeRate || quickPayTx.exchangeRate,
      1500
    );

    let createdReceipts: Receipt[] = [];

    if (dualPayment && (dualPayment.amountIQD > 0 || dualPayment.amountUSD > 0)) {
      if (dualPayment.amountIQD > 0) {
        createdReceipts.push({
          id: `rcpt-${Date.now()}-iqd`,
          receiptNo: `PAY-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
          type: 'payment',
          billId: quickPayTx.id,
          customerId: quickPayTx.customerId,
          companyId: quickPayTx.companyId || 'naqaa_basra',
          amount: dualPayment.amountIQD,
          currency: 'IQD',
          exchangeRate: usedRate,
          date,
          notes: notes ? `${notes} (دفعة بالدينار)` : 'دفعة من الزبون بالدينار',
          createdAt: new Date().toISOString().split('T')[0],
        });
      }
      if (dualPayment.amountUSD > 0) {
        createdReceipts.push({
          id: `rcpt-${Date.now() + 1}-usd`,
          receiptNo: `PAY-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
          type: 'payment',
          billId: quickPayTx.id,
          customerId: quickPayTx.customerId,
          companyId: quickPayTx.companyId || 'naqaa_basra',
          amount: dualPayment.amountUSD,
          currency: 'USD',
          exchangeRate: usedRate,
          hasCommission: commission?.hasCommission,
          commissionAmount: commission?.hasCommission ? commission.commissionAmount : undefined,
          commissionCurrency: commission?.hasCommission ? commission.commissionCurrency : undefined,
          commissionBearer: commission?.hasCommission ? commission.commissionBearer : undefined,
          date,
          notes: notes ? `${notes} (دفعة بالدولار)` : 'دفعة من الزبون بالدولار',
          createdAt: new Date().toISOString().split('T')[0],
        });
      }
    } else {
      const safeAmount = Number(amount) || 0;
      const curr = paymentCurrency || quickPayTx.currency || 'IQD';
      createdReceipts.push({
        id: `rcpt-${Date.now()}`,
        receiptNo: `PAY-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        type: 'payment',
        billId: quickPayTx.id,
        customerId: quickPayTx.customerId,
        companyId: quickPayTx.companyId || 'naqaa_basra',
        amount: safeAmount,
        currency: curr,
        exchangeRate: usedRate,
        hasCommission: commission?.hasCommission,
        commissionAmount: commission?.hasCommission ? commission.commissionAmount : undefined,
        commissionCurrency: commission?.hasCommission ? commission.commissionCurrency : undefined,
        commissionBearer: commission?.hasCommission ? commission.commissionBearer : undefined,
        date,
        notes,
        createdAt: new Date().toISOString().split('T')[0],
      });
    }

    saveData.exchangeRate(usedRate);
    setData(prev => ({
      ...prev,
      exchangeRate: usedRate,
      receipts: [...createdReceipts, ...prev.receipts],
    }));
    setIsQuickPayOpen(false);
    setQuickPayTx(null);
    const summaryText = createdReceipts.map(r => formatCurrency(r.amount, r.currency || 'IQD')).join(' + ');
    showToast(`تم تسجيل الدفعة من الزبون بمبلغ ${summaryText} بنجاح`);
  };

  // Quick Settlement Save
  const handleSaveQuickSettlement = (
    amount: number,
    employeeId: string,
    date: string,
    notes: string,
    settlementCurrency?: Currency
  ) => {
    if (!quickSettleTx) return;
    const curr = settlementCurrency || quickSettleTx.currency || 'IQD';
    const newRcpt: Receipt = {
      id: `rcpt-${Date.now()}`,
      receiptNo: `SET-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      type: 'settlement',
      billId: quickSettleTx.id,
      employeeId,
      companyId: quickSettleTx.companyId || 'naqaa_basra',
      amount,
      currency: curr,
      exchangeRate: normalizeExchangeRate(data.exchangeRate || quickSettleTx.exchangeRate, 1500),
      date,
      notes,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setData(prev => ({ ...prev, receipts: [newRcpt, ...prev.receipts] }));
    setIsQuickSettleOpen(false);
    setQuickSettleTx(null);
    showToast(`تمت تسوية حساب السلفة وتصفيتها بالكامل بمبلغ ${formatCurrency(amount, curr)}`);
  };

  // Daily Exchange Rate Handler
  const handleSaveExchangeRate = (newRate: number, silent: boolean = false) => {
    const rawNum = Number(newRate);
    if (!rawNum || rawNum <= 0) return;
    const validRate = normalizeExchangeRate(rawNum, 1500);
    saveData.exchangeRate(validRate);
    setData(prev => ({
      ...prev,
      exchangeRate: validRate,
      transactions: prev.transactions.map(t =>
        t.status === 'cancelled' ? t : { ...t, exchangeRate: validRate }
      ),
    }));
    if (selectedTx && selectedTx.status !== 'cancelled') {
      setSelectedTx(prev => (prev ? { ...prev, exchangeRate: validRate } : null));
    }
    if (!silent) {
      setIsExchangeRateModalOpen(false);
      addAuditLog({
        action: 'update',
        entityType: 'treasury',
        entityId: 'exchange_rate',
        title: 'سعر الصرف اليومي المعتمد',
        details: `تم تحديث سعر الصرف المعتمد في النظام: 1$ = ${validRate.toLocaleString('ar-IQ')} د.ع (100$ = ${Math.round(validRate * 100).toLocaleString('ar-IQ')} د.ع)`,
      });
      showToast(`تم اعتماد وتثبيت سعر الصرف: 1$ = ${validRate.toLocaleString('ar-IQ')} د.ع (100$ = ${Math.round(validRate * 100).toLocaleString('ar-IQ')} د.ع)`);
    }
  };

  // Treasury Handlers
  const handleSaveTreasuryTransaction = (
    txData: Omit<TreasuryTransaction, 'id' | 'createdAt'> & { id?: string },
    andPrint: boolean = false
  ) => {
    let savedRecord: TreasuryTransaction;
    if (txData.id) {
      const existing = (data.treasury || []).find(t => t.id === txData.id);
      savedRecord = {
        ...(existing || {}),
        ...txData,
        id: txData.id,
        createdAt: existing?.createdAt || new Date().toISOString().split('T')[0],
      } as TreasuryTransaction;
      const updated = (data.treasury || []).map(t => t.id === txData.id ? savedRecord : t);
      setData(prev => ({ ...prev, treasury: updated }));
      addAuditLog({
        action: 'update',
        entityType: 'treasury',
        entityId: savedRecord.id,
        entityReference: `قيد ${savedRecord.voucherNo}`,
        title: 'تعديل قيد في صندوق الشركة',
        details: `تم تعديل بيانات القيد (${savedRecord.voucherNo}) - الباب: ${savedRecord.category} بمبلغ ${formatCurrency(savedRecord.amount)}.`,
        financialImpact: { amount: savedRecord.amount },
      });
      showToast('تم تعديل قيد الصندوق بنجاح');
    } else {
      const newTx: TreasuryTransaction = {
        ...txData,
        id: `tr-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      savedRecord = newTx;
      setData(prev => ({ ...prev, treasury: [newTx, ...(prev.treasury || [])] }));
      const commText = savedRecord.hasCommission && (savedRecord.commissionAmount || 0) > 0
        ? ` | عمولة: ${formatCurrency(savedRecord.commissionAmount || 0, savedRecord.commissionCurrency || savedRecord.currency)} (${savedRecord.commissionBearer === 'company' ? 'تحمل الشركة كمصروف مستقل' : 'على الطرف'})`
        : '';

      addAuditLog({
        action: 'create',
        entityType: 'treasury',
        entityId: savedRecord.id,
        entityReference: `قيد ${savedRecord.voucherNo}`,
        title: savedRecord.type === 'deposit' ? 'إيداع نقدي مباشر في الصندوق' : 'سحب نقدي مباشر من الصندوق',
        details: `${savedRecord.category} - الطرف: ${savedRecord.partyName || 'صندوق الشركة'} بمبلغ ${formatCurrency(savedRecord.amount, savedRecord.currency)} (${savedRecord.description || 'حركة نقدية'})${commText}.`,
        financialImpact: {
          amount: savedRecord.amount,
          balanceChange: savedRecord.type === 'deposit' 
            ? `زيادة الصندوق بمقدار ${formatCurrency(savedRecord.amount, savedRecord.currency)}${commText}` 
            : `خصم ${formatCurrency(savedRecord.amount, savedRecord.currency)} من الصندوق${commText}`,
        },
      });
      showToast(txData.type === 'deposit' ? 'تم تسجيل الإيداع النقدي في الصندوق' : 'تم تسجيل السحب النقدي من الصندوق');
    }
    setIsTreasuryModalOpen(false);
    setEditingTreasuryTx(null);

    if (andPrint) {
      setPrintTreasuryTx(savedRecord);
      setPrintTreasuryMode('voucher');
      setIsPrintTreasuryOpen(true);
    }
  };

  const handleDeleteTreasuryTransaction = (tx: TreasuryTransaction) => {
    const hasPerm = data.currentUser.role === 'admin' || !!data.currentUser.permissions.deleteRecords;

    let inflowChange: string | undefined;
    let outflowChange: string | undefined;
    let balanceChange: string | undefined;

    const tCurr = tx.currency || 'IQD';
    if (tx.type === 'deposit') {
      inflowChange = `خصم ${formatCurrency(tx.amount, tCurr)} من إجمالي الواردات المباشرة`;
      balanceChange = `نقصان رصيد صندوق الشركة بمقدار ${formatCurrency(tx.amount, tCurr)}`;
    } else {
      outflowChange = `خصم ${formatCurrency(tx.amount, tCurr)} من إجمالي المصروفات والسحوبات (${tx.category})`;
      balanceChange = `استرجاع ${formatCurrency(tx.amount, tCurr)} إلى رصيد صندوق الشركة`;
    }

    setDeleteConfirmation({
      isOpen: true,
      mode: 'cancel',
      title: 'إلغاء دفتري لقيد في صندوق الشركة',
      itemName: `قيد رقم: ${tx.voucherNo} (${tx.category} - ${formatCurrency(tx.amount, tCurr)})`,
      message: `سيتم وسم قيد الصندوق بـ "ملغي دفترياً" مع بقاء السجل في كشف المراجعة للتدقيق المالي، واستبعاد أثره فوراً من رصيد الصندوق وإجمالي الواردات/المصروفات.`,
      financialImpact: {
        inflowChange,
        outflowChange,
        balanceChange,
        partyChange: tx.partyName ? `الطرف المقابل: ${tx.partyName}` : undefined,
      },
      hasPermission: hasPerm,
      permissionNote: hasPerm
        ? undefined
        : `المستخدم الحالي (${data.currentUser.name} - ${data.currentUser.roleTitle}) لا يمتلك صلاحية إلغاء أو حذف القيود المالية.`,
      onConfirmCancel: (reason: string) => {
        const updatedTreasury = (data.treasury || []).map(t =>
          t.id === tx.id
            ? {
                ...t,
                status: 'cancelled' as const,
                cancelledAt: new Date().toISOString(),
                cancelledBy: data.currentUser.name,
                cancelReason: reason || 'إلغاء دفتري محاسبي',
              }
            : t
        );
        setData(prev => ({ ...prev, treasury: updatedTreasury }));
        addAuditLog({
          action: 'void',
          entityType: 'treasury',
          entityId: tx.id,
          entityReference: `قيد ${tx.voucherNo}`,
          title: 'إلغاء دفتري لقيد في صندوق الشركة',
          details: `تم إلغاء قيد الصندوق (${tx.voucherNo}) بقيمة (${formatCurrency(tx.amount)}) دفترياً واستبعاد أثره المالي.`,
          cancelReason: reason || 'إلغاء دفتري محاسبي',
          financialImpact: {
            amount: tx.amount,
            balanceChange,
          },
        });
        showToast(`تم إلغاء قيد الصندوق (${tx.voucherNo}) دفترياً وتعديل رصيد الصندوق`);
        setDeleteConfirmation(prev => ({ ...prev, isOpen: false }));
        setIsTreasuryModalOpen(false);
        setIsAccountExpenseOpen(false);
      },
    });
  };

  // Accounts Expense Handler (Salaries, Daily Expenses, Rents)
  const handleSaveAccountExpense = (
    txData: Omit<TreasuryTransaction, 'id' | 'createdAt'> & { id?: string },
    andPrint: boolean = false
  ) => {
    let savedRecord: TreasuryTransaction;
    if (txData.id) {
      const existing = (data.treasury || []).find(t => t.id === txData.id);
      savedRecord = {
        ...(existing || {}),
        ...txData,
        id: txData.id,
        createdAt: existing?.createdAt || new Date().toISOString().split('T')[0],
      } as TreasuryTransaction;
      const updated = (data.treasury || []).map(t => t.id === txData.id ? savedRecord : t);
      setData(prev => ({ ...prev, treasury: updated }));
      addAuditLog({
        action: 'update',
        entityType: 'account_expense',
        entityId: savedRecord.id,
        entityReference: `قيد ${savedRecord.voucherNo}`,
        title: 'تعديل قيد مصروفات بالحسابات',
        details: `تحديث قيد المصروف (${savedRecord.voucherNo}) - ${savedRecord.category} بمبلغ ${formatCurrency(savedRecord.amount)}.`,
        financialImpact: { amount: savedRecord.amount },
      });
      showToast('تم تحديث قيد الحسابات بنجاح');
    } else {
      const newTx: TreasuryTransaction = {
        ...txData,
        id: `tr-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      savedRecord = newTx;
      setData(prev => ({ ...prev, treasury: [newTx, ...(prev.treasury || [])] }));
      addAuditLog({
        action: 'create',
        entityType: 'account_expense',
        entityId: savedRecord.id,
        entityReference: `قيد ${savedRecord.voucherNo}`,
        title: 'صرف قيد ونفقة من الحسابات (خصم من الصندوق)',
        details: `${savedRecord.category} - المستفيد: ${savedRecord.partyName} بمبلغ ${formatCurrency(savedRecord.amount)} (${savedRecord.description}).`,
        financialImpact: {
          amount: savedRecord.amount,
          balanceChange: `خصم ${formatCurrency(savedRecord.amount)} من رصيد الصندوق`,
        },
      });
      showToast('تم حفظ قيد الحسابات وخصم المبلغ من صندوق الشركة بنجاح');
    }
    setIsAccountExpenseOpen(false);
    setEditingAccountExpense(null);
    setAccountExpenseTargetEmp(null);

    if (andPrint) {
      setPrintTreasuryTx(savedRecord);
      setPrintTreasuryMode('voucher');
      setIsPrintTreasuryOpen(true);
    }
  };

  const handleOpenAddEmployee = (cat?: EmployeeCategory) => {
    setEditingEmp(null);
    setEmpModalCategory(cat || 'staff');
    setIsEmpModalOpen(true);
  };

  const handleQuickPaySalary = (emp: Employee) => {
    setAccountExpenseTargetEmp(emp);
    setAccountExpenseSubAccount('salaries');
    setEditingAccountExpense(null);
    setIsAccountExpenseOpen(true);
  };

  const handleAttachReceiptToTreasury = (tx: TreasuryTransaction, file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      alert('حجم الملف يجب ألا يتجاوز 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const attachment = {
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: reader.result as string,
        date: new Date().toISOString().split('T')[0],
      };
      const updated = (data.treasury || []).map(t => t.id === tx.id ? { ...t, attachment } : t);
      setData(prev => ({ ...prev, treasury: updated }));
      showToast(`تمت أرشفة الوصل للسند ${tx.voucherNo} بنجاح`);
    };
    reader.readAsDataURL(file);
  };

  const handleOpenArchiveViewer = (attachment: TreasuryAttachment, title?: string) => {
    setSelectedArchiveDirectAttachment(attachment);
    setSelectedArchiveTitle(title || 'معاينة الوصل المؤرشف');
    setIsTreasuryArchiveViewOpen(true);
  };

  const handleAttachAgencyToTransaction = (tx: Transaction, file: File) => {
    if (file.size > 4 * 1024 * 1024) {
      showToast('حجم ملف ورقة الوكالة يجب ألا يتجاوز 4MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const agencyDocument: TreasuryAttachment = {
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: reader.result as string,
        date: new Date().toISOString().split('T')[0],
      };
      const updated = data.transactions.map(t => t.id === tx.id ? { ...t, agencyDocument } : t);
      setData(prev => ({ ...prev, transactions: updated }));
      if (selectedTx && selectedTx.id === tx.id) {
        setSelectedTx(prev => (prev ? { ...prev, agencyDocument } : null));
      }
      showToast(`تمت أرشفة ورقة الوكالة للبوليصة (${tx.billNo}) بنجاح`);
    };
    reader.readAsDataURL(file);
  };

  const handleAttachReceiptToBillReceipt = (rcpt: Receipt, file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      alert('حجم الملف يجب ألا يتجاوز 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const attachment: TreasuryAttachment = {
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: reader.result as string,
        date: new Date().toISOString().split('T')[0],
      };
      const updated = data.receipts.map(r => r.id === rcpt.id ? { ...r, attachment } : r);
      setData(prev => ({ ...prev, receipts: updated }));
      showToast(`تمت أرشفة الوصل للسند ${rcpt.receiptNo} بنجاح`);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBrokerAdvance = (advData: { employeeId: string; billId: string; amount: number; date: string; notes: string }) => {
    const relatedTx = data.transactions.find(t => t.id === advData.billId);
    const curr = relatedTx?.currency || 'IQD';
    const newRcpt: Receipt = {
      id: `rcpt-${Date.now()}`,
      receiptNo: `ADV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      type: 'advance',
      billId: advData.billId,
      companyId: relatedTx?.companyId || 'naqaa_basra',
      employeeId: advData.employeeId,
      amount: advData.amount,
      currency: curr,
      exchangeRate: relatedTx?.exchangeRate || data.exchangeRate || 1500,
      date: advData.date,
      notes: advData.notes,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setData(prev => ({ ...prev, receipts: [newRcpt, ...prev.receipts] }));
    setIsBrokerAdvModalOpen(false);
    setSelectedBroker(null);
    showToast(`تم صرف السلفة للمخلص بمبلغ ${formatCurrency(advData.amount, curr)} وتسجيل القيد في الصندوق بنجاح`);
  };

  const handleSaveBrokerSettlement = (settleData: { 
    employeeId: string; 
    billId: string; 
    amount: number; 
    date: string; 
    notes: string;
    attachment?: TreasuryAttachment;
  }) => {
    const relatedTx = data.transactions.find(t => t.id === settleData.billId);
    const curr = relatedTx?.currency || 'IQD';
    const newRcpt: Receipt = {
      id: `rcpt-${Date.now()}`,
      receiptNo: `SET-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      type: 'settlement',
      billId: settleData.billId,
      companyId: relatedTx?.companyId || 'naqaa_basra',
      employeeId: settleData.employeeId,
      amount: settleData.amount,
      currency: curr,
      exchangeRate: relatedTx?.exchangeRate || data.exchangeRate || 1500,
      date: settleData.date,
      notes: settleData.notes,
      attachment: settleData.attachment,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setData(prev => ({ ...prev, receipts: [newRcpt, ...prev.receipts] }));
    setIsBrokerSettleModalOpen(false);
    setSelectedBroker(null);
    showToast(`تم اعتماد تسوية السلفة بمبلغ ${formatCurrency(settleData.amount, curr)} وأرشفة الوصل بنجاح`);
  };

  // Backup Import
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.customers && json.transactions) {
          setData(prev => ({
            ...prev,
            customers: json.customers || prev.customers,
            employees: json.employees || prev.employees,
            transactions: json.transactions || prev.transactions,
            receipts: json.receipts || prev.receipts,
            users: json.users || prev.users,
            attachments: json.attachments || prev.attachments,
            treasury: json.treasury || prev.treasury,
            exchangeRate: json.exchangeRate || prev.exchangeRate || 1500,
          }));
          showToast('تمت استعادة النسخة الاحتياطية بنجاح!');
        } else {
          alert('ملف النسخة الاحتياطية غير متوافق');
        }
      } catch (err) {
        alert('حدث خطأ في قراءة ملف JSON');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Database Reset Handler
  const handleResetDatabase = () => {
    requestDelete({
      title: 'تصفير قاعدة البيانات بالكامل',
      itemName: 'مسح كافة السجلات والبدء من الصفر',
      message: 'تحذير هام: هل أنت متأكد من تصفير قاعدة البيانات بالكامل؟ سيتم مسح كافة الزبائن والبوالص والسندات والقيود فوراً.',
      onConfirm: () => {
        const freshData = resetDatabase();
        setData(freshData);
        showToast('تم تصفير قاعدة البيانات بنجاح، يمكنك الآن بدء إدخال البيانات واختبار السستم');
      },
    });
  };

  // Carrier (Transport Companies) Handlers
  const handleSaveCarrier = (carrierData: Omit<TransportCompany, 'id' | 'createdAt'> & { id?: string }) => {
    if (carrierData.id) {
      setData(prev => ({
        ...prev,
        carriers: (prev.carriers || []).map(c =>
          c.id === carrierData.id ? { ...c, ...carrierData } : c
        ),
      }));
      showToast(`تم تحديث بيانات شركة النقل (${carrierData.name})`);
    } else {
      const newCarrier: TransportCompany = {
        ...carrierData,
        id: `car-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setData(prev => ({
        ...prev,
        carriers: [newCarrier, ...(prev.carriers || [])],
      }));
      showToast(`تمت إضافة شركة النقل (${newCarrier.name}) بنجاح`);
    }
    setIsCarrierFormOpen(false);
    setEditingCarrier(null);
  };

  const handleQuickAddCarrier = (carrierData: Omit<TransportCompany, 'id' | 'createdAt'>): TransportCompany => {
    const newCarrier: TransportCompany = {
      ...carrierData,
      id: `car-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setData(prev => ({
      ...prev,
      carriers: [newCarrier, ...(prev.carriers || [])],
    }));
    showToast(`تم تعريف شركة النقل (${newCarrier.name})`);
    return newCarrier;
  };

  const handleDeleteCarrier = (carrier: TransportCompany) => {
    const carrierFin = getCarrierFinancials(
      carrier,
      data.transactions,
      data.treasury || [],
      data.exchangeRate || 1500
    );

    const hasActiveFinancials =
      carrierFin.trips.length > 0 ||
      carrierFin.activePayments.length > 0 ||
      carrierFin.paidIQD > 0 ||
      carrierFin.paidUSD > 0 ||
      carrierFin.totalCostIQD > 0 ||
      carrierFin.totalCostUSD > 0 ||
      carrierFin.remainingIQD > 0 ||
      carrierFin.remainingUSD > 0;

    if (hasActiveFinancials) {
      const blockedDetails: BlockedReasonDetail[] = [];

      if (carrierFin.trips.length > 0) {
        blockedDetails.push({
          label: 'نقلات شحن نشطة بالبوالص',
          value: `${carrierFin.trips.length} نقلة (${carrierFin.billsCount} بوليصة)`,
          subValue: `إجمالي الشاحنات: ${carrierFin.totalTrucksCount} شاحنة`,
          variant: 'amber',
        });
      }

      if (carrierFin.paidIQD > 0 || carrierFin.paidUSD > 0) {
        blockedDetails.push({
          label: 'مبالغ مصروفة من صندوق الشركة',
          value: `${formatCurrency(carrierFin.paidIQD, 'IQD')}${carrierFin.paidUSD > 0 ? ' + ' + formatCurrency(carrierFin.paidUSD, 'USD') : ''}`,
          subValue: `${carrierFin.activePayments.length} سند صرف نقدي`,
          variant: 'cyan',
        });
      }

      if (carrierFin.totalCostIQD > 0 || carrierFin.totalCostUSD > 0) {
        blockedDetails.push({
          label: 'إجمالي استحقاقات النقل المقيدة',
          value: `${formatCurrency(carrierFin.totalCostIQD, 'IQD')}${carrierFin.totalCostUSD > 0 ? ' + ' + formatCurrency(carrierFin.totalCostUSD, 'USD') : ''}`,
          subValue: 'تكاليف تشغيلية مقيدة بالبوالص',
          variant: 'default',
        });
      }

      if (carrierFin.remainingIQD > 0 || carrierFin.remainingUSD > 0) {
        blockedDetails.push({
          label: 'متبقي ذمة مستحقة للناقل',
          value: `${formatCurrency(carrierFin.remainingIQD, 'IQD')}${carrierFin.remainingUSD > 0 ? ' + ' + formatCurrency(carrierFin.remainingUSD, 'USD') : ''}`,
          subValue: 'التزام مالي قائم لم يُسدد بعد',
          variant: 'rose',
        });
      }

      setDeleteConfirmation({
        isOpen: true,
        mode: 'blocked',
        title: 'قيد حماية محاسبي: منع حذف شركة النقل',
        itemName: `شركة النقل: ${carrier.name} (${carrier.phone || 'بدون هاتف'})`,
        message: `وفقاً للأصول والمعايير المحاسبية المعتمدة، يمنع منعاً باتاً حذف شركة نقل مسجل لها أجور نقل في البوالص الكمركية أو صدرت لها سندات صرف نقدية من صندوق الشركة. حذف السجل سيؤدي لانهيار شجرة الحسابات وفقدان كشف حساب الناقل وسندات الصرف.`,
        hasPermission: data.currentUser.role === 'admin' || !!data.currentUser.permissions.deleteRecords,
        blockedReasonDetails: blockedDetails,
        accountingAdvice: [
          'في حال كانت النقلات مسجلة بالخطأ، يمكن مسح النقلة من البوليصة المعنية وستُرد المبالغ تلقائياً للصندوق.',
          'في حال وجود سند صرف خاطئ، يتم إلغاؤه دفترياً (Void) من الصندوق ليعود المبلغ لرصيد الخزينة فوراً.',
          'الاحتفاظ بشركة النقل في النظام كأرشيف تاريخي دائم يتيح استخراج كشوفات الحساب وسندات النقل ومطابقات الجرد في أي وقت.',
        ],
      });
      return;
    }

    // If completely free from any trips or treasury payments:
    const hasPerm = data.currentUser.role === 'admin' || !!data.currentUser.permissions.deleteRecords;
    setDeleteConfirmation({
      isOpen: true,
      mode: 'delete',
      title: 'حذف شركة نقل (بدون قيود مالية)',
      itemName: carrier.name,
      message: `هل أنت متأكد من حذف شركة النقل "${carrier.name}"؟ لا توجد أي نقلات كمركية أو سندات صرف مرتبطة بها.`,
      hasPermission: hasPerm,
      permissionNote: hasPerm
        ? undefined
        : `المستخدم الحالي (${data.currentUser.name} - ${data.currentUser.roleTitle}) لا يمتلك صلاحية الحذف.`,
      onConfirm: () => {
        setData(prev => ({
          ...prev,
          carriers: (prev.carriers || []).filter(c => c.id !== carrier.id),
        }));
        addAuditLog({
          action: 'delete',
          entityType: 'carrier',
          entityId: carrier.id,
          entityReference: `شركة نقل: ${carrier.name}`,
          title: 'حذف إداري لشركة نقل',
          details: `تم الحذف الإداري لشركة النقل (${carrier.name}) الخالية من الحركات والقيود المالية.`,
        });
        showToast('تم حذف شركة النقل بنجاح');
      },
    });
  };

  const handleSaveCarrierPayment = (
    txData: {
      carrierId: string;
      carrierName: string;
      companyId: 'naqaa_basra' | 'sawt_aljanoub' | 'shared';
      currency: Currency;
      exchangeRate: number;
      amount: number;
      date: string;
      relatedBillNo?: string;
      description: string;
      hasCommission?: boolean;
      commissionAmount?: number;
      commissionCurrency?: Currency;
      commissionBearer?: 'company' | 'party';
      attachment?: TreasuryAttachment;
    },
    shouldPrint: boolean
  ) => {
    const voucherNo = `CAR-VCH-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTreasuryTx: TreasuryTransaction = {
      id: `tr-car-${Date.now()}`,
      voucherNo,
      companyId: txData.companyId,
      type: 'withdrawal',
      subAccount: 'carriers',
      carrierId: txData.carrierId,
      relatedBillNo: txData.relatedBillNo,
      category: 'أجور نقل بري: تسديد دفعة لشركة النقل',
      currency: txData.currency,
      exchangeRate: txData.exchangeRate,
      amount: txData.amount,
      hasCommission: txData.hasCommission,
      commissionAmount: txData.commissionAmount,
      commissionCurrency: txData.commissionCurrency,
      commissionBearer: txData.commissionBearer,
      date: txData.date,
      partyName: txData.carrierName,
      description: txData.description,
      attachment: txData.attachment,
      status: 'active',
      recordedBy: data.currentUser.name,
      createdAt: txData.date,
    };

    setData(prev => ({
      ...prev,
      treasury: [newTreasuryTx, ...(prev.treasury || [])],
    }));

    addAuditLog({
      action: 'create',
      entityType: 'carrier',
      entityId: newTreasuryTx.id,
      entityReference: voucherNo,
      title: `تسديد دفعة أجور نقل لشركة (${txData.carrierName})`,
      details: `${txData.description} بمبلغ ${formatCurrency(txData.amount, txData.currency)}`,
      financialImpact: {
        amount: txData.amount,
        outflowChange: `-${formatCurrency(txData.amount, txData.currency)}`,
        balanceChange: `خصم من الصندوق وتسديد لحساب ${txData.carrierName}`,
      },
    });

    setIsCarrierPaymentOpen(false);
    showToast(`تم تسجيل دفعة لشركة النقل (${txData.carrierName}) بمبلغ ${formatCurrency(txData.amount, txData.currency)}`);

    if (shouldPrint) {
      setPrintTreasuryTx(newTreasuryTx);
      setPrintTreasuryMode('voucher');
      setIsPrintTreasuryOpen(true);
    }
  };

  // Helper to check page permission
  const isPageAllowed = (page: string, user: AppUser = data.currentUser) => {
    if (user.role === 'admin') return true;
    const p = user.permissions;
    switch (page) {
      case 'dashboard': return p.viewDashboard !== false;
      case 'treasury': return p.viewTreasury !== false && p.treasury !== false;
      case 'accounts': return p.viewAccounts !== false;
      case 'customers': return p.viewCustomers !== false;
      case 'transactions': return p.viewTransactions !== false;
      case 'carriers': return p.viewCarriers !== false;
      case 'employees': return p.viewEmployees !== false;
      case 'receipts': return p.viewReceipts !== false;
      case 'reports': return p.viewReports !== false && p.reports !== false;
      case 'users': return p.viewUsers !== false && p.manageUsers !== false;
      case 'audit': return p.viewAuditLog !== false && p.auditLog !== false;
      default: return true;
    }
  };

  const getFirstAllowedPage = (user: AppUser = data.currentUser): string => {
    const pages = ['dashboard', 'transactions', 'carriers', 'treasury', 'accounts', 'customers', 'employees', 'receipts', 'reports', 'audit', 'users'];
    for (const pg of pages) {
      if (isPageAllowed(pg, user)) return pg;
    }
    return 'dashboard';
  };

  // Page titles
  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard': return 'لوحة التحكم والمؤشرات المالية';
      case 'treasury': return 'صندوق الشركة والخزينة المالية - السحب والإيداع';
      case 'accounts': return 'الحسابات والمصاريف - الرواتب والمصاريف اليومية والإيجارات';
      case 'customers': return 'دليل الزبائن والشركات التجارية';
      case 'transactions': return 'إدارة البوالص والمعاملات الكمركية';
      case 'carriers': return 'إدارة شركات النقل والنواقل البرية المستقلة';
      case 'employees': return 'إدارة موظفي الشركة والمخلصين الكمركيين';
      case 'receipts': return 'سجل الوصولات وسندات الصرف والقبض';
      case 'reports': return 'التقارير المالية وحركة الحسابات';
      case 'users': return 'إدارة المستخدمين والصلاحيات';
      case 'audit': return 'سجل التدقيق والمراقبة الشامل (Audit Log)';
      default: return 'نظام التخليص الكمركي';
    }
  };

  if (isLoggedOut) {
    return (
      <LoginPage
        users={data.users}
        onLoginSuccess={(user, branch) => {
          handleSwitchUser(user);
          setIsLoggedOut(false);
        }}
        onCancel={() => setIsLoggedOut(false)}
      />
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Sidebar */}
      <Sidebar
        activePage={activePage}
        setActivePage={(p) => {
          setActivePage(p);
          if (p !== 'transactions') setFilterCustomerId(undefined);
        }}
        currentUser={data.currentUser}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onOpenCalendar={() => setIsCalendarOpen(true)}
      />

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <Header
          pageTitle={getPageTitle()}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          currentUser={data.currentUser}
          pendingCount={pendingNotificationCount}
          exchangeRate={data.exchangeRate || 1500}
          onOpenExchangeRate={() => setIsExchangeRateModalOpen(true)}
          onOpenSwitchUser={() => setIsSwitchUserOpen(true)}
          onExportBackup={() => exportBackup(data)}
          onImportBackup={handleImportBackup}
          onResetDatabase={handleResetDatabase}
          onToggleMobileMenu={() => setMobileOpen(true)}
          onNotificationClick={() => {
            setActivePage('transactions');
          }}
          onOpenCalendar={() => setIsCalendarOpen(true)}
          onLogout={() => setIsLoggedOut(true)}
        />

        {/* Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {!isPageAllowed(activePage) ? (
            <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto my-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">
                ⛔
              </div>
              <h2 className="text-xl font-bold text-white mb-2">عذراً، هذا التبويب غير متاح لحسابك</h2>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                لا يمتلك حسابك الحالي (<strong className="text-emerald-400">{data.currentUser.name}</strong> - <span className="text-slate-400">{data.currentUser.roleTitle}</span>) صلاحية الوصول إلى تبويب <strong className="text-white">"{getPageTitle()}"</strong>.
                <br />
                يرجى مراجعة إدارة النظام أو المسؤول العام لمنحك صلاحية هذا التبويب.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setActivePage(getFirstAllowedPage())}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-500/20"
                >
                  العودة للتبويب المصرح به
                </button>
                <button
                  onClick={() => setIsSwitchUserOpen(true)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl border border-slate-700 transition"
                >
                  تبديل المستخدم
                </button>
              </div>
            </div>
          ) : (
            <>
              {activePage === 'dashboard' && (
            <DashboardView
              transactions={data.transactions}
              customers={data.customers}
              employees={data.employees}
              receipts={data.receipts}
              treasury={data.treasury}
              exchangeRate={data.exchangeRate || 1500}
              onUpdateExchangeRate={handleSaveExchangeRate}
              onOpenExchangeRate={() => setIsExchangeRateModalOpen(true)}
              onOpenTreasury={() => setActivePage('treasury')}
              onViewAllTransactions={() => setActivePage('transactions')}
              onOpenTransactionDetail={(tx) => {
                setSelectedTx(tx);
                setIsTxDetailOpen(true);
              }}
              onOpenQuickAdvance={(tx) => {
                setQuickAdvTx(tx);
                setIsQuickAdvOpen(true);
              }}
              onOpenQuickPayment={(tx) => {
                setQuickPayTx(tx);
                setIsQuickPayOpen(true);
              }}
              onOpenQuickSettlement={(tx, empId) => {
                setQuickSettleTx(tx);
                setQuickSettleEmpId(empId);
                setIsQuickSettleOpen(true);
              }}
            />
          )}

          {activePage === 'treasury' && (
            <TreasuryView
              treasury={data.treasury || []}
              receipts={data.receipts}
              transactions={data.transactions}
              customers={data.customers}
              employees={data.employees}
              currentUser={data.currentUser}
              exchangeRate={data.exchangeRate || 1500}
              onOpenExchangeRate={() => setIsExchangeRateModalOpen(true)}
              onOpenDeposit={() => {
                setTreasuryModalType('deposit');
                setEditingTreasuryTx(null);
                setIsTreasuryModalOpen(true);
              }}
              onOpenWithdrawal={() => {
                setTreasuryModalType('withdrawal');
                setEditingTreasuryTx(null);
                setIsTreasuryModalOpen(true);
              }}
              onEditTransaction={(tx) => {
                setEditingTreasuryTx(tx);
                setTreasuryModalType(tx.type);
                setIsTreasuryModalOpen(true);
              }}
              onDeleteTransaction={handleDeleteTreasuryTransaction}
              onViewArchive={(att, title) => handleOpenArchiveViewer(att, title)}
              onAttachReceiptToTreasury={handleAttachReceiptToTreasury}
              onAttachReceiptToBillReceipt={handleAttachReceiptToBillReceipt}
              onPrintVoucher={(tx) => {
                setPrintTreasuryTx(tx);
                setPrintTreasuryMode('voucher');
                setIsPrintTreasuryOpen(true);
              }}
              onPrintStatement={() => {
                setPrintTreasuryMode('statement');
                setIsPrintTreasuryOpen(true);
              }}
              onDeleteReceipt={handleDeleteReceipt}
            />
          )}

          {activePage === 'accounts' && (
            <AccountsView
              treasury={data.treasury || []}
              receipts={data.receipts}
              employees={data.employees}
              currentUser={data.currentUser}
              onOpenAddExpense={(subAccount) => {
                setAccountExpenseSubAccount(subAccount);
                setEditingAccountExpense(null);
                setAccountExpenseTargetEmp(null);
                setIsAccountExpenseOpen(true);
              }}
              onEditExpense={(tx) => {
                setEditingAccountExpense(tx);
                setAccountExpenseTargetEmp(null);
                setAccountExpenseSubAccount((tx.subAccount as any) || 'salaries');
                setIsAccountExpenseOpen(true);
              }}
              onDeleteExpense={handleDeleteTreasuryTransaction}
              onViewArchive={(att, title) => handleOpenArchiveViewer(att, title)}
              onPrintVoucher={(tx) => {
                setPrintTreasuryTx(tx);
                setPrintTreasuryMode('voucher');
                setIsPrintTreasuryOpen(true);
              }}
              onNavigateToTreasury={() => setActivePage('treasury')}
              onAddEmployee={() => handleOpenAddEmployee('staff')}
              onPaySalary={handleQuickPaySalary}
            />
          )}

          {activePage === 'customers' && (
            <CustomersView
              customers={data.customers}
              transactions={data.transactions}
              receipts={data.receipts}
              currentUser={data.currentUser}
              searchTerm={searchTerm}
              onAddCustomer={() => {
                setEditingCust(null);
                setIsCustModalOpen(true);
              }}
              onEditCustomer={(cust) => {
                setEditingCust(cust);
                setIsCustModalOpen(true);
              }}
              onDeleteCustomer={handleDeleteCustomer}
              onViewCustomerTransactions={(customerId) => {
                setFilterCustomerId(customerId);
                setActivePage('transactions');
              }}
            />
          )}

          {activePage === 'transactions' && (
            <TransactionsView
              transactions={data.transactions}
              customers={data.customers}
              employees={data.employees}
              receipts={data.receipts}
              currentUser={data.currentUser}
              searchTerm={searchTerm}
              selectedCustomerId={filterCustomerId}
              exchangeRate={data.exchangeRate || 1500}
              onViewArchive={(att, title) => handleOpenArchiveViewer(att, title)}
              onAddTransaction={() => {
                setEditingTx(null);
                setIsTxModalOpen(true);
              }}
              onEditTransaction={(tx) => {
                setEditingTx(tx);
                setIsTxModalOpen(true);
              }}
              onDeleteTransaction={handleDeleteTransaction}
              onOpenTransactionDetail={(tx) => {
                setSelectedTx(tx);
                setIsTxDetailOpen(true);
              }}
              onOpenQuickAdvance={(tx) => {
                setQuickAdvTx(tx);
                setIsQuickAdvOpen(true);
              }}
              onOpenQuickPayment={(tx) => {
                setQuickPayTx(tx);
                setIsQuickPayOpen(true);
              }}
              onOpenQuickSettlement={(tx, empId) => {
                setQuickSettleTx(tx);
                setQuickSettleEmpId(empId);
                setIsQuickSettleOpen(true);
              }}
              onTryChangeStatus={handleTryChangeStatus}
            />
          )}

          {activePage === 'carriers' && (
            <CarriersView
              carriers={data.carriers || []}
              transactions={data.transactions}
              treasury={data.treasury || []}
              customers={data.customers || []}
              currentUser={data.currentUser}
              exchangeRate={data.exchangeRate || 1500}
              onAddCarrier={() => {
                setEditingCarrier(null);
                setIsCarrierFormOpen(true);
              }}
              onEditCarrier={(carrier) => {
                setEditingCarrier(carrier);
                setIsCarrierFormOpen(true);
              }}
              onDeleteCarrier={handleDeleteCarrier}
              onPayCarrier={(carrier, billNo) => {
                setSelectedCarrierForPayment(carrier);
                setCarrierPaymentBillNo(billNo || '');
                setIsCarrierPaymentOpen(true);
              }}
              onOpenStatement={(carrier) => {
                setSelectedCarrierForStatement(carrier);
                setIsCarrierStatementOpen(true);
              }}
              onViewArchive={(att, title) => handleOpenArchiveViewer(att, title)}
            />
          )}

          {activePage === 'employees' && (
            <EmployeesView
              employees={data.employees}
              transactions={data.transactions}
              receipts={data.receipts}
              treasury={data.treasury || []}
              currentUser={data.currentUser}
              onAddEmployee={(cat) => handleOpenAddEmployee(cat)}
              onEditEmployee={(emp) => {
                setEditingEmp(emp);
                setIsEmpModalOpen(true);
              }}
              onDeleteEmployee={handleDeleteEmployee}
              onViewEmployeeDetail={(emp) => {
                setSelectedBroker(emp);
                setIsBrokerStatementModalOpen(true);
              }}
              onDisburseAdvance={(emp) => {
                setSelectedBroker(emp);
                setIsBrokerAdvModalOpen(true);
              }}
              onSettleAdvance={(emp) => {
                setSelectedBroker(emp);
                setIsBrokerSettleModalOpen(true);
              }}
              onPaySalary={handleQuickPaySalary}
              onViewArchive={(att, title) => handleOpenArchiveViewer(att, title)}
            />
          )}

          {activePage === 'receipts' && (
            <ReceiptsView
              receipts={data.receipts}
              transactions={data.transactions}
              customers={data.customers}
              employees={data.employees}
              currentUser={data.currentUser}
              exchangeRate={data.exchangeRate || 1500}
              onAddReceipt={() => setIsRcptModalOpen(true)}
              onDeleteReceipt={handleDeleteReceipt}
              onPrintVoucher={(rcpt) => {
                const tx = data.transactions.find(t => t.id === rcpt.billId);
                const cust = rcpt.customerId ? data.customers.find(c => c.id === rcpt.customerId) : null;
                const emp = rcpt.employeeId ? data.employees.find(e => e.id === rcpt.employeeId) : null;
                setPrintType('voucher');
                setPrintRcpt(rcpt);
                setPrintTx(tx || null);
                setIsPrintModalOpen(true);
              }}
            />
          )}

          {activePage === 'reports' && (
            <ReportsView
              transactions={data.transactions}
              customers={data.customers}
              employees={data.employees}
              receipts={data.receipts}
              treasury={data.treasury || []}
              currentUser={data.currentUser}
              exchangeRate={data.exchangeRate || 1500}
              onViewArchive={(att, title) => handleOpenArchiveViewer(att, title)}
            />
          )}

          {activePage === 'users' && (
            <UsersView
              users={data.users}
              currentUser={data.currentUser}
              onAddUser={() => {
                setEditingUser(null);
                setIsUserModalOpen(true);
              }}
              onEditUser={(u) => {
                setEditingUser(u);
                setIsUserModalOpen(true);
              }}
              onDeleteUser={handleDeleteUser}
              onSwitchUser={handleSwitchUser}
            />
          )}

          {activePage === 'audit' && (
            <AuditLogView
              auditLogs={data.auditLogs || []}
              currentUser={data.currentUser}
              users={data.users}
            />
          )}
            </>
          )}
        </main>
      </div>

      {/* ================= MODALS ================= */}

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        initialData={editingTx}
        customers={data.customers}
        employees={data.employees}
        carriers={data.carriers || []}
        onQuickAddCarrier={handleQuickAddCarrier}
        receipts={data.receipts}
        treasury={data.treasury || []}
        exchangeRate={data.exchangeRate || 1500}
        onExchangeRateChange={(newRate) => handleSaveExchangeRate(newRate, true)}
        onViewArchive={(att, title) => handleOpenArchiveViewer(att, title)}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        onSave={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
      />

      {/* Carrier Modals (شركات النقل والنواقل البرية) */}
      <CarrierFormModal
        isOpen={isCarrierFormOpen}
        initialData={editingCarrier}
        onClose={() => {
          setIsCarrierFormOpen(false);
          setEditingCarrier(null);
        }}
        onSave={handleSaveCarrier}
      />

      <CarrierPaymentModal
        isOpen={isCarrierPaymentOpen}
        carrier={selectedCarrierForPayment}
        transactions={data.transactions}
        treasury={data.treasury || []}
        exchangeRate={data.exchangeRate || 1500}
        onExchangeRateChange={(newRate) => handleSaveExchangeRate(newRate, true)}
        defaultBillNo={carrierPaymentBillNo}
        onClose={() => {
          setIsCarrierPaymentOpen(false);
          setSelectedCarrierForPayment(null);
          setCarrierPaymentBillNo('');
        }}
        onSave={handleSaveCarrierPayment}
      />

      <CarrierStatementModal
        isOpen={isCarrierStatementOpen}
        carrier={selectedCarrierForStatement}
        transactions={data.transactions}
        treasury={data.treasury || []}
        exchangeRate={data.exchangeRate || 1500}
        onClose={() => {
          setIsCarrierStatementOpen(false);
          setSelectedCarrierForStatement(null);
        }}
        onOpenPayModal={(carrier, billNo) => {
          setIsCarrierStatementOpen(false);
          setSelectedCarrierForPayment(carrier);
          setCarrierPaymentBillNo(billNo || '');
          setIsCarrierPaymentOpen(true);
        }}
        onViewArchive={(att, title) => handleOpenArchiveViewer(att, title)}
        onPrintVoucher={(tx) => {
          setPrintTreasuryTx(tx);
          setPrintTreasuryMode('voucher');
          setIsPrintTreasuryOpen(true);
        }}
        onVoidPayment={handleDeleteTreasuryTransaction}
      />

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isCustModalOpen}
        initialData={editingCust}
        onClose={() => {
          setIsCustModalOpen(false);
          setEditingCust(null);
        }}
        onSave={handleSaveCustomer}
        onDelete={handleDeleteCustomer}
      />

      {/* Employee Modal */}
      <EmployeeModal
        isOpen={isEmpModalOpen}
        initialData={editingEmp}
        defaultCategory={empModalCategory}
        onClose={() => {
          setIsEmpModalOpen(false);
          setEditingEmp(null);
        }}
        onSave={handleSaveEmployee}
        onDelete={handleDeleteEmployee}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={isRcptModalOpen}
        transactions={data.transactions}
        customers={data.customers}
        employees={data.employees}
        receipts={data.receipts}
        exchangeRate={data.exchangeRate || 1500}
        onExchangeRateChange={(newRate) => handleSaveExchangeRate(newRate, true)}
        onClose={() => setIsRcptModalOpen(false)}
        onSave={handleSaveReceipt}
      />

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        isOpen={isTxDetailOpen}
        transaction={selectedTx}
        customers={data.customers}
        employees={data.employees}
        receipts={data.receipts}
        attachments={data.attachments}
        treasury={data.treasury || []}
        exchangeRate={data.exchangeRate || 1500}
        onViewArchive={(att, title) => handleOpenArchiveViewer(att, title)}
        onAttachAgencyToTransaction={handleAttachAgencyToTransaction}
        onClose={() => {
          setIsTxDetailOpen(false);
          setSelectedTx(null);
        }}
        onEditTransaction={(tx) => {
          setIsTxDetailOpen(false);
          setEditingTx(tx);
          setIsTxModalOpen(true);
        }}
        onDeleteTrip={handleDeleteTripFromBill}
        onOpenQuickAdvance={() => {
          if (selectedTx) {
            setQuickAdvTx(selectedTx);
            setIsQuickAdvOpen(true);
          }
        }}
        onOpenQuickPayment={() => {
          if (selectedTx) {
            setQuickPayTx(selectedTx);
            setIsQuickPayOpen(true);
          }
        }}
        onOpenQuickSettlement={(empId) => {
          if (selectedTx) {
            setQuickSettleTx(selectedTx);
            setQuickSettleEmpId(empId);
            setIsQuickSettleOpen(true);
          }
        }}
        onOpenAttachments={() => {
          if (selectedTx) {
            setAttachEntityType('transaction');
            setAttachEntityId(selectedTx.id);
            setAttachTitle(`بوليصة ${selectedTx.billNo}`);
            setIsAttachmentsOpen(true);
          }
        }}
        onPrintBillFile={() => {
          if (selectedTx) {
            setPrintType('bill');
            setPrintTx(selectedTx);
            setIsPrintModalOpen(true);
          }
        }}
        onPrintInvoice={() => {
          if (selectedTx) {
            setPrintType('invoice');
            setPrintTx(selectedTx);
            setIsPrintModalOpen(true);
          }
        }}
        onDeleteReceipt={handleDeleteReceipt}
        onDeleteTransaction={handleDeleteTransaction}
      />

      {/* Quick Advance Modal */}
      <QuickAdvanceModal
        isOpen={isQuickAdvOpen}
        transaction={quickAdvTx}
        employees={data.employees}
        exchangeRate={data.exchangeRate || 1500}
        onClose={() => {
          setIsQuickAdvOpen(false);
          setQuickAdvTx(null);
        }}
        onSave={handleSaveQuickAdvance}
      />

      {/* Quick Payment Modal */}
      <QuickPaymentModal
        isOpen={isQuickPayOpen}
        transaction={quickPayTx}
        receipts={data.receipts}
        exchangeRate={data.exchangeRate || 1500}
        onExchangeRateChange={(newRate) => handleSaveExchangeRate(newRate, true)}
        onClose={() => {
          setIsQuickPayOpen(false);
          setQuickPayTx(null);
        }}
        onSave={handleSaveQuickPayment}
      />

      {/* Quick Settlement Modal */}
      <QuickSettlementModal
        isOpen={isQuickSettleOpen}
        transaction={quickSettleTx}
        employeeId={quickSettleEmpId}
        employees={data.employees}
        receipts={data.receipts}
        exchangeRate={data.exchangeRate || 1500}
        onClose={() => {
          setIsQuickSettleOpen(false);
          setQuickSettleTx(null);
        }}
        onSave={handleSaveQuickSettlement}
      />

      {/* Attachments Modal */}
      <AttachmentsModal
        isOpen={isAttachmentsOpen}
        entityType={attachEntityType}
        entityId={attachEntityId}
        entityTitle={attachTitle}
        attachments={data.attachments}
        onClose={() => setIsAttachmentsOpen(false)}
        onAddAttachment={(newAtt) => {
          const att: Attachment = {
            ...newAtt,
            id: `att-${Date.now()}`,
          };
          setData(prev => ({ ...prev, attachments: [att, ...prev.attachments] }));
          showToast('تم رفع الملف بنجاح');
        }}
        onDeleteAttachment={(attId) => {
          setData(prev => ({
            ...prev,
            attachments: prev.attachments.filter(a => a.id !== attId),
          }));
          showToast('تم حذف الملف');
        }}
        onViewAttachment={(att) => {
          handleOpenArchiveViewer(
            {
              name: att.name,
              size: att.size,
              type: att.type,
              dataUrl: att.dataUrl,
              date: att.date,
            },
            `معاينة ${att.name}`
          );
        }}
      />

      {/* Validation Error Modal */}
      <ValidationErrorModal
        isOpen={isValidationOpen}
        message={validationMsg}
        details={validationDetails}
        onClose={() => setIsValidationOpen(false)}
      />

      {/* User Modal */}
      <UserModal
        isOpen={isUserModalOpen}
        initialData={editingUser}
        onClose={() => {
          setIsUserModalOpen(false);
          setEditingUser(null);
        }}
        onSave={handleSaveUser}
        onDelete={handleDeleteUser}
      />

      {/* Switch User Modal */}
      <SwitchUserModal
        isOpen={isSwitchUserOpen}
        users={data.users}
        currentUser={data.currentUser}
        onClose={() => setIsSwitchUserOpen(false)}
        onSelectUser={handleSwitchUser}
        onGoToLoginPage={() => setIsLoggedOut(true)}
      />

      {/* Print Document Modal */}
      <PrintModal
        isOpen={isPrintModalOpen}
        type={printType}
        transaction={printTx}
        receipt={printRcpt}
        customer={printTx ? data.customers.find(c => c.id === printTx.customerId) : null}
        employee={printTx ? data.employees.find(e => e.id === printTx.employeeId) : null}
        receipts={data.receipts}
        onClose={() => {
          setIsPrintModalOpen(false);
          setPrintTx(null);
          setPrintRcpt(null);
        }}
      />

      {/* Treasury Modal (Deposit / Withdrawal & Archiving) */}
      <TreasuryModal
        isOpen={isTreasuryModalOpen}
        type={treasuryModalType}
        initialData={editingTreasuryTx}
        currentUser={data.currentUser}
        exchangeRate={data.exchangeRate || 1500}
        onExchangeRateChange={(newRate) => handleSaveExchangeRate(newRate, true)}
        onClose={() => {
          setIsTreasuryModalOpen(false);
          setEditingTreasuryTx(null);
        }}
        onSave={handleSaveTreasuryTransaction}
        onDelete={handleDeleteTreasuryTransaction}
      />

      {/* Treasury Archive Viewer Modal */}
      <TreasuryArchiveViewModal
        isOpen={isTreasuryArchiveViewOpen}
        transaction={selectedArchiveTx}
        directAttachment={selectedArchiveDirectAttachment}
        customTitle={selectedArchiveTitle}
        onClose={() => {
          setIsTreasuryArchiveViewOpen(false);
          setSelectedArchiveTx(null);
          setSelectedArchiveDirectAttachment(null);
          setSelectedArchiveTitle('');
        }}
      />

      {/* Broker Advance Modal */}
      <BrokerAdvanceModal
        isOpen={isBrokerAdvModalOpen}
        employee={selectedBroker}
        transactions={data.transactions}
        onClose={() => {
          setIsBrokerAdvModalOpen(false);
          setSelectedBroker(null);
        }}
        onSave={handleSaveBrokerAdvance}
      />

      {/* Broker Settlement Modal (المسدد بالوصولات وأرشفة الوصل) */}
      <BrokerSettlementModal
        isOpen={isBrokerSettleModalOpen}
        employee={selectedBroker}
        transactions={data.transactions}
        receipts={data.receipts}
        onClose={() => {
          setIsBrokerSettleModalOpen(false);
          setSelectedBroker(null);
        }}
        onSave={handleSaveBrokerSettlement}
      />

      {/* Broker Statement & History Modal */}
      <BrokerStatementModal
        isOpen={isBrokerStatementModalOpen}
        employee={selectedBroker}
        transactions={data.transactions}
        receipts={data.receipts}
        onClose={() => {
          setIsBrokerStatementModalOpen(false);
          setSelectedBroker(null);
        }}
        onOpenAdvance={(emp) => {
          setIsBrokerStatementModalOpen(false);
          setSelectedBroker(emp);
          setIsBrokerAdvModalOpen(true);
        }}
        onOpenSettlement={(emp) => {
          setIsBrokerStatementModalOpen(false);
          setSelectedBroker(emp);
          setIsBrokerSettleModalOpen(true);
        }}
        onViewArchive={(att, title) => handleOpenArchiveViewer(att, title)}
        onAttachFile={handleAttachReceiptToBillReceipt}
        onPrintStatement={() => window.print()}
        onDeleteReceipt={handleDeleteReceipt}
      />

      {/* Print Treasury Voucher & Statement Modal */}
      <PrintTreasuryModal
        isOpen={isPrintTreasuryOpen}
        mode={printTreasuryMode}
        transaction={printTreasuryTx}
        transactions={data.treasury || []}
        summary={getTreasuryFinancialSummary(data.treasury || [], data.receipts, data.exchangeRate || 1500)}
        onClose={() => {
          setIsPrintTreasuryOpen(false);
          setPrintTreasuryTx(null);
        }}
      />

      {/* Account Expense Modal (Salaries, Daily Expenses, Rents) */}
      <AccountExpenseModal
        isOpen={isAccountExpenseOpen}
        defaultSubAccount={accountExpenseSubAccount}
        initialData={editingAccountExpense}
        initialEmployee={accountExpenseTargetEmp}
        employees={data.employees}
        currentUser={data.currentUser}
        onClose={() => {
          setIsAccountExpenseOpen(false);
          setEditingAccountExpense(null);
          setAccountExpenseTargetEmp(null);
        }}
        onSave={handleSaveAccountExpense}
        onDelete={handleDeleteTreasuryTransaction}
      />

      {/* Confirm Delete & Accounting Cancellation In-App Modal */}
      <ConfirmDeleteModal
        isOpen={deleteConfirmation.isOpen}
        mode={deleteConfirmation.mode}
        title={deleteConfirmation.title}
        itemName={deleteConfirmation.itemName}
        message={deleteConfirmation.message}
        financialImpact={deleteConfirmation.financialImpact}
        activeFinancialsWarning={deleteConfirmation.activeFinancialsWarning}
        blockedReasonDetails={deleteConfirmation.blockedReasonDetails}
        accountingAdvice={deleteConfirmation.accountingAdvice}
        hasPermission={deleteConfirmation.hasPermission}
        permissionNote={deleteConfirmation.permissionNote}
        onClose={() => setDeleteConfirmation(prev => ({ ...prev, isOpen: false }))}
        onConfirmCancel={deleteConfirmation.onConfirmCancel}
        onConfirmDelete={deleteConfirmation.onConfirm}
        onConvertToCancelledBill={deleteConfirmation.onConvertToCancelledBill}
      />

      {/* Void Bill & Treasury Cascading Resolution Modal */}
      <VoidBillFinancialModal
        isOpen={isVoidBillModalOpen}
        transaction={voidBillTarget}
        customers={data.customers}
        employees={data.employees}
        receipts={data.receipts}
        treasury={data.treasury || []}
        currentUser={data.currentUser}
        onClose={() => {
          setIsVoidBillModalOpen(false);
          setVoidBillTarget(null);
        }}
        onConfirmVoid={handleConfirmVoidBill}
      />

      {/* Shadcn Customs & Treasury Calendar View Modal */}
      <CalendarViewModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        transactions={data.transactions}
        receipts={data.receipts}
        treasury={data.treasury}
        customers={data.customers}
        employees={data.employees}
        onSelectTransaction={(tx) => {
          setSelectedTx(tx);
          setIsTxDetailOpen(true);
        }}
      />

      {/* Daily Exchange Rate Adjustment Modal (سعر الصرف اليومي للـ 100 دولار) */}
      <ExchangeRateModal
        isOpen={isExchangeRateModalOpen}
        currentRate={data.exchangeRate || 1500}
        onClose={() => setIsExchangeRateModalOpen(false)}
        onSaveRate={handleSaveExchangeRate}
      />

    </div>
  );
}
