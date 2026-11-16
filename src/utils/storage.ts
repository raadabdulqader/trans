import { Customer, Employee, Transaction, Receipt, AppUser, Attachment, TreasuryTransaction, AuditLogEntry, Currency, TransportCompany, BillTransportTrip } from '../types/customs';
import { 
  INITIAL_CUSTOMERS, 
  INITIAL_EMPLOYEES, 
  INITIAL_CARRIERS,
  INITIAL_TRANSACTIONS, 
  INITIAL_RECEIPTS, 
  INITIAL_USERS, 
  INITIAL_ATTACHMENTS,
  INITIAL_TREASURY 
} from './initialData';

export const DEFAULT_EXCHANGE_RATE = 1500; // 1$ = 1,500 د.ع (أي 100$ = 150,000 د.ع)

const KEYS = {
  CUSTOMERS: 'customs_customers_v4',
  EMPLOYEES: 'customs_employees_v4',
  CARRIERS: 'customs_carriers_v4',
  TRANSACTIONS: 'customs_transactions_v4',
  RECEIPTS: 'customs_receipts_v4',
  USERS: 'customs_users_v4',
  CURRENT_USER: 'customs_current_user_v4',
  ATTACHMENTS: 'customs_attachments_v4',
  TREASURY: 'customs_treasury_v4',
  AUDIT_LOGS: 'customs_audit_logs_v4',
  EXCHANGE_RATE: 'customs_exchange_rate_v4',
};

/**
 * توحيد ومعالجة سعر الصرف المدخل سواء أُدخل بسعر الـ 100$ (الورقة مثل 150000 أو 169000)
 * أو بالاختصار (مثل 150 أو 169) أو بسعر الـ 1$ (مثل 1500 أو 1690) ليُرجع دائماً سعر الـ 1 دولار بالدينار.
 */
export const normalizeExchangeRate = (
  rawRate?: number | string | null,
  fallback: number = DEFAULT_EXCHANGE_RATE
): number => {
  const safeFallback =
    fallback && fallback >= 500 && fallback < 10000 ? fallback : DEFAULT_EXCHANGE_RATE;
  const num = typeof rawRate === 'string' ? parseFloat(rawRate) : Number(rawRate);
  if (!num || isNaN(num) || num < 100) return safeFallback;

  // إذا أُدخل سعر الـ 100 دولار (الورقة) مثل 150000 أو 169000 -> يُقسم على 100 ليصبح 1500 أو 1690
  if (num >= 50000) {
    return Math.round((num / 100) * 10000) / 10000;
  }
  // إذا أُدخل من 5 مراتب مثل 15000 أو 16900 -> يُقسم على 10 ليصبح 1500 أو 1690
  if (num >= 10000) {
    return Math.round((num / 10) * 10000) / 10000;
  }
  // إذا أُدخل بالاختصار السريع للورقة مثل 150 أو 169 -> يُضرب في 10 ليصبح 1500 أو 1690
  if (num >= 100 && num < 500) {
    return Math.round(num * 10 * 10000) / 10000;
  }
  // إذا أُدخل بسعر الـ 1 دولار مباشرة مثل 1500 أو 1690
  return num;
};

const readStoredExchangeRate = (): number => {
  try {
    if (typeof window === 'undefined') return DEFAULT_EXCHANGE_RATE;
    const keysToTry = [KEYS.EXCHANGE_RATE, 'customs_exchange_rate_v3', 'customs_exchange_rate_v2'];
    for (const k of keysToTry) {
      const raw = localStorage.getItem(k);
      if (raw) {
        const parsed = Number(JSON.parse(raw));
        if (parsed > 0) {
          const normalized = normalizeExchangeRate(parsed, DEFAULT_EXCHANGE_RATE);
          try {
            localStorage.setItem(KEYS.EXCHANGE_RATE, JSON.stringify(normalized));
          } catch (_) {}
          return normalized;
        }
      }
    }
  } catch (_) {}
  return DEFAULT_EXCHANGE_RATE;
};

let activeSystemExchangeRate: number = typeof window !== 'undefined' ? readStoredExchangeRate() : DEFAULT_EXCHANGE_RATE;

export const getActiveExchangeRate = (): number => activeSystemExchangeRate;


export interface CustomsAppState {
  customers: Customer[];
  employees: Employee[];
  carriers: TransportCompany[];
  transactions: Transaction[];
  receipts: Receipt[];
  users: AppUser[];
  currentUser: AppUser;
  attachments: Attachment[];
  treasury: TreasuryTransaction[];
  auditLogs: AuditLogEntry[];
  exchangeRate: number; // سعر الصرف اليومي (دينار لكل 1 دولار)
}

export const resetDatabase = (): CustomsAppState => {
  const allKeys = [
    'customs_customers_v1', 'customs_employees_v1', 'customs_transactions_v1', 'customs_receipts_v1', 'customs_users_v1', 'customs_current_user_v1', 'customs_attachments_v1', 'customs_treasury_v1',
    'customs_customers_v2', 'customs_employees_v2', 'customs_transactions_v2', 'customs_receipts_v2', 'customs_users_v2', 'customs_current_user_v2', 'customs_attachments_v2', 'customs_treasury_v2',
    'customs_exchange_rate_v2',
    'customs_exchange_rate_v3',
    ...Object.values(KEYS),
  ];
  if (typeof window !== 'undefined') {
    allKeys.forEach(k => {
      try { localStorage.removeItem(k); } catch (_) {}
    });
  }
  activeSystemExchangeRate = DEFAULT_EXCHANGE_RATE;
  return {
    customers: [],
    employees: [],
    carriers: [],
    transactions: [],
    receipts: [],
    users: INITIAL_USERS,
    currentUser: INITIAL_USERS[0],
    attachments: [],
    treasury: [],
    auditLogs: [],
    exchangeRate: DEFAULT_EXCHANGE_RATE,
  };
};

export const loadSimulationData = (): CustomsAppState => {
  if (typeof window !== 'undefined') {
    Object.values(KEYS).forEach(k => {
      try { localStorage.removeItem(k); } catch (_) {}
    });
  }
  const auditLogs = buildInitialAuditLogs(
    INITIAL_TRANSACTIONS,
    INITIAL_RECEIPTS,
    INITIAL_TREASURY,
    INITIAL_USERS
  );
  return {
    customers: INITIAL_CUSTOMERS,
    employees: INITIAL_EMPLOYEES,
    carriers: INITIAL_CARRIERS,
    transactions: INITIAL_TRANSACTIONS,
    receipts: INITIAL_RECEIPTS,
    users: INITIAL_USERS,
    currentUser: INITIAL_USERS[0],
    attachments: INITIAL_ATTACHMENTS,
    treasury: INITIAL_TREASURY,
    auditLogs,
    exchangeRate: DEFAULT_EXCHANGE_RATE,
  };
};

export const buildInitialAuditLogs = (
  transactions: Transaction[],
  receipts: Receipt[],
  treasury: TreasuryTransaction[],
  users: AppUser[]
): AuditLogEntry[] => {
  const logs: AuditLogEntry[] = [];
  const adminUser = users.find(u => u.role === 'admin') || users[0] || { id: 'u1', name: 'المدير العام', roleTitle: 'مدير النظام' };

  // 1. Audit logs for cancelled/voided transactions
  transactions.forEach((tx, idx) => {
    if (tx.status === 'cancelled') {
      logs.push({
        id: `aud-void-tx-${tx.id}`,
        timestamp: tx.cancelledAt || new Date(Date.now() - 3600000 * (idx + 1)).toISOString(),
        userId: adminUser.id,
        userName: tx.cancelledBy || adminUser.name,
        userRole: adminUser.roleTitle || 'مدير النظام',
        action: 'void',
        entityType: 'bill',
        entityId: tx.id,
        entityReference: `بوليصة ${tx.billNo}`,
        title: 'إلغاء دفتري لبوليصة شحن ومعاملة كمركية',
        details: `تم تحويل البوليصة (${tx.billNo}) إلى ملغاة دفترياً لحماية السجلات المالية بعد تسوية الحسابات.`,
        cancelReason: tx.cancelReason || 'إلغاء دفتري محاسبي معتمد',
        financialImpact: {
          amount: tx.totalAmount,
          balanceChange: 'تم قفل قيود البوليصة وتحييد أثرها المالي',
        },
      });
    }
  });

  // 2. Audit logs for cancelled receipts
  receipts.forEach((rcpt, idx) => {
    if (rcpt.status === 'cancelled') {
      logs.push({
        id: `aud-void-rcpt-${rcpt.id}`,
        timestamp: rcpt.cancelledAt || new Date(Date.now() - 7200000 * (idx + 1)).toISOString(),
        userId: adminUser.id,
        userName: rcpt.cancelledBy || adminUser.name,
        userRole: adminUser.roleTitle || 'مدير النظام',
        action: 'void',
        entityType: 'receipt',
        entityId: rcpt.id,
        entityReference: `سند ${rcpt.receiptNo}`,
        title: rcpt.type === 'advance' ? 'إلغاء دفتري لسلفة مخلص واستردادها للصندوق' : 'إلغاء دفتري لسند قبض واستبعاد أثره المالي',
        details: `تم إلغاء السند (${rcpt.receiptNo}) بمبلغ (${formatCurrency(rcpt.amount)}) دفترياً، واستبعاد أثره من رصيد الصندوق فوراً.`,
        cancelReason: rcpt.cancelReason || 'إلغاء محاسبي مصرح',
        financialImpact: {
          amount: rcpt.amount,
          balanceChange: rcpt.type === 'advance' ? `استرداد ${formatCurrency(rcpt.amount)} إلى الصندوق` : `خصم ${formatCurrency(rcpt.amount)} من الواردات والصندوق`,
        },
      });
    }
  });

  // 3. Audit logs for treasury transactions
  treasury.slice(0, 5).forEach((tr, idx) => {
    logs.push({
      id: `aud-tr-${tr.id}`,
      timestamp: new Date(Date.now() - 86400000 * (idx + 1)).toISOString(),
      userId: adminUser.id,
      userName: tr.recordedBy || adminUser.name,
      userRole: adminUser.roleTitle || 'مدير النظام',
      action: tr.status === 'cancelled' ? 'void' : 'create',
      entityType: 'treasury',
      entityId: tr.id,
      entityReference: `قيد ${tr.voucherNo}`,
      title: tr.status === 'cancelled' ? 'إلغاء دفتري لقيد في الخزينة' : `تسجيل ${tr.type === 'deposit' ? 'إيداع نقدي' : 'صرف نقدي'} في صندوق الشركة`,
      details: `${tr.category} - ${tr.description} بمبلغ ${formatCurrency(tr.amount)} (الطرف: ${tr.partyName || 'صندوق الشركة'}).`,
      cancelReason: tr.cancelReason,
      financialImpact: {
        amount: tr.amount,
        balanceChange: tr.type === 'deposit' ? `زيادة الصندوق بمقدار ${formatCurrency(tr.amount)}` : `خصم ${formatCurrency(tr.amount)} من الصندوق`,
      },
    });
  });

  // 4. System Initialization & Security Log
  logs.push({
    id: 'aud-sys-init',
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
    userId: adminUser.id,
    userName: adminUser.name,
    userRole: adminUser.roleTitle || 'مدير النظام',
    action: 'auth',
    entityType: 'system',
    title: 'بدء تشغيل النظام وتدقيق الصلاحيات المحاسبية',
    details: 'تم تفعيل بروتوكول التدقيق الدفتري المحاسبي وحماية الصندوق والربط الرقمي للبوالص.',
  });

  // Sort newest first
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const loadData = (): CustomsAppState => {
  const getItem = <T>(key: string, fallback: T): T => {
    try {
      if (typeof window === 'undefined') return fallback;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  };

  const rawUsers = getItem<AppUser[]>(KEYS.USERS, INITIAL_USERS);
  const users: AppUser[] = rawUsers.map((u, idx) => {
    let defaultUsername = u.username;
    if (!defaultUsername) {
      if (u.role === 'admin') defaultUsername = 'admin';
      else if (u.role === 'accountant') defaultUsername = 'accountant';
      else if (u.name && u.name.includes('تخليص')) defaultUsername = 'operator';
      else defaultUsername = `user_${idx + 1}`;
    }
    const defaultPassword = u.password || (u.role === 'admin' ? 'admin123' : u.role === 'accountant' ? 'acc123' : 'op123');

    const isAdmin = u.role === 'admin';
    const isAccountant = u.role === 'accountant';

    return {
      ...u,
      username: defaultUsername,
      password: defaultPassword,
      status: u.status || 'active',
      lastLogin: u.lastLogin || new Date().toISOString(),
      permissions: {
        // Tab access defaults
        viewDashboard: u.permissions?.viewDashboard ?? true,
        viewTreasury: u.permissions?.viewTreasury ?? (isAdmin || isAccountant || !!u.permissions?.treasury),
        viewAccounts: u.permissions?.viewAccounts ?? (isAdmin || isAccountant),
        viewCustomers: u.permissions?.viewCustomers ?? true,
        viewTransactions: u.permissions?.viewTransactions ?? true,
        viewCarriers: u.permissions?.viewCarriers ?? true,
        viewEmployees: u.permissions?.viewEmployees ?? true,
        viewReceipts: u.permissions?.viewReceipts ?? true,
        viewReports: u.permissions?.viewReports ?? (isAdmin || isAccountant || !!u.permissions?.reports),
        viewAuditLog: u.permissions?.viewAuditLog ?? (isAdmin || isAccountant || !!u.permissions?.auditLog),
        viewUsers: u.permissions?.viewUsers ?? (isAdmin || !!u.permissions?.manageUsers),

        // Operational permissions
        editTx: u.permissions?.editTx ?? (isAdmin || !isAccountant),
        editSettled: u.permissions?.editSettled ?? isAdmin,
        createReceipts: u.permissions?.createReceipts ?? true,
        createExpenses: u.permissions?.createExpenses ?? (isAdmin || isAccountant),
        disburseAdvance: u.permissions?.disburseAdvance ?? (isAdmin || isAccountant),
        settleAdvance: u.permissions?.settleAdvance ?? (isAdmin || isAccountant),
        printVouchers: u.permissions?.printVouchers ?? true,
        exportBackup: u.permissions?.exportBackup ?? (isAdmin || isAccountant),

        // Legacy / Security fields
        reports: u.permissions?.reports ?? (isAdmin || isAccountant),
        treasury: u.permissions?.treasury ?? (isAdmin || isAccountant),
        manageUsers: u.permissions?.manageUsers ?? isAdmin,
        deleteRecords: typeof u.permissions?.deleteRecords === 'boolean' 
          ? u.permissions.deleteRecords 
          : (isAdmin || isAccountant),
        auditLog: typeof u.permissions?.auditLog === 'boolean'
          ? u.permissions.auditLog
          : (isAdmin || isAccountant),
      },
    };
  });

  const rawCurrentUser = getItem<AppUser>(KEYS.CURRENT_USER, users[0] || INITIAL_USERS[0]);
  const matchedUser = users.find(u => u.id === rawCurrentUser.id) || users[0];
  const currentUser: AppUser = {
    ...matchedUser,
  };

  const customers = getItem<Customer[]>(KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  const employees = getItem<Employee[]>(KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
  const carriers = getItem<TransportCompany[]>(KEYS.CARRIERS, INITIAL_CARRIERS);
  const storedRate = readStoredExchangeRate();
  const exchangeRate = normalizeExchangeRate(storedRate, DEFAULT_EXCHANGE_RATE);
  activeSystemExchangeRate = exchangeRate;
  const transactions = getItem<Transaction[]>(KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS).map(t => {
    const totalAmount = Number(t.totalAmount) || 0;
    const initialPaid = Math.min(totalAmount, Math.max(0, Number(t.initialPaid) || 0));
    return {
      ...t,
      totalAmount,
      initialPaid,
      exchangeRate: t.exchangeRate ? normalizeExchangeRate(t.exchangeRate, exchangeRate) : exchangeRate,
    };
  });
  const rawReceipts = getItem<Receipt[]>(KEYS.RECEIPTS, INITIAL_RECEIPTS);
  const receipts: Receipt[] = rawReceipts.map(r => {
    const tx = transactions.find(t => t.id === r.billId);
    const resolvedCurrency = r.currency || (tx ? tx.currency : undefined) || 'IQD';
    return {
      ...r,
      currency: resolvedCurrency,
      exchangeRate: normalizeExchangeRate(r.exchangeRate || (tx ? tx.exchangeRate : undefined), exchangeRate),
      companyId: r.companyId || (tx ? tx.companyId : undefined) || 'naqaa_basra',
    };
  });
  const attachments = getItem<Attachment[]>(KEYS.ATTACHMENTS, INITIAL_ATTACHMENTS);
  const treasury = getItem<TreasuryTransaction[]>(KEYS.TREASURY, INITIAL_TREASURY).map(t => ({
    ...t,
    exchangeRate: t.exchangeRate ? normalizeExchangeRate(t.exchangeRate, exchangeRate) : undefined,
  }));

  let auditLogs = getItem<AuditLogEntry[]>(KEYS.AUDIT_LOGS, []);
  if (!auditLogs || auditLogs.length === 0) {
    auditLogs = buildInitialAuditLogs(transactions, receipts, treasury, users);
    try {
      localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
    } catch (_) {}
  }

  return {
    customers,
    employees,
    carriers,
    transactions,
    receipts,
    users,
    currentUser,
    attachments,
    treasury,
    auditLogs,
    exchangeRate,
  };
};

const safeSetItem = (key: string, val: string) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, val);
    } catch (_) {}
  }
};

export const saveData = {
  customers: (data: Customer[]) => safeSetItem(KEYS.CUSTOMERS, JSON.stringify(data)),
  employees: (data: Employee[]) => safeSetItem(KEYS.EMPLOYEES, JSON.stringify(data)),
  carriers: (data: TransportCompany[]) => safeSetItem(KEYS.CARRIERS, JSON.stringify(data)),
  transactions: (data: Transaction[]) => safeSetItem(KEYS.TRANSACTIONS, JSON.stringify(data)),
  receipts: (data: Receipt[]) => safeSetItem(KEYS.RECEIPTS, JSON.stringify(data)),
  users: (data: AppUser[]) => safeSetItem(KEYS.USERS, JSON.stringify(data)),
  currentUser: (data: AppUser) => safeSetItem(KEYS.CURRENT_USER, JSON.stringify(data)),
  attachments: (data: Attachment[]) => safeSetItem(KEYS.ATTACHMENTS, JSON.stringify(data)),
  treasury: (data: TreasuryTransaction[]) => safeSetItem(KEYS.TREASURY, JSON.stringify(data)),
  auditLogs: (data: AuditLogEntry[]) => safeSetItem(KEYS.AUDIT_LOGS, JSON.stringify(data)),
  exchangeRate: (rate: number) => {
    if (rate && rate > 0) {
      const normalized = normalizeExchangeRate(rate, activeSystemExchangeRate || DEFAULT_EXCHANGE_RATE);
      activeSystemExchangeRate = normalized;
      safeSetItem(KEYS.EXCHANGE_RATE, JSON.stringify(normalized));
    }
  },
};

export const formatCurrency = (amount: number, currency: Currency = 'IQD'): string => {
  if (currency === 'USD') {
    return '$' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount || 0);
  }
  return new Intl.NumberFormat('ar-IQ').format(Math.round(amount || 0)) + ' د.ع';
};

export const formatRateDisplay = (rate: number): string => {
  const normalized = normalizeExchangeRate(rate, DEFAULT_EXCHANGE_RATE);
  const hundredRate = Math.round(normalized * 100);
  return `100$ = ${new Intl.NumberFormat('ar-IQ').format(hundredRate)} د.ع`;
};

export const formatRelativeTime = (isoDate: string): string => {
  try {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return 'الآن';
    if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays === 1) return 'أمس';
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    return date.toLocaleDateString('ar-IQ', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return isoDate;
  }
};

export const exportBackup = (data: {
  customers: Customer[];
  employees: Employee[];
  transactions: Transaction[];
  receipts: Receipt[];
  users: AppUser[];
  attachments: Attachment[];
  treasury?: TreasuryTransaction[];
  auditLogs?: AuditLogEntry[];
  exchangeRate?: number;
}) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('download', `customs_system_backup_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export interface ReceiptBillBreakdown {
  receiptCurrency: Currency;
  billCurrency: Currency;
  exchangeRate: number;
  grossAmount: number;
  grossInBillCurrency: number;
  hasCommission: boolean;
  commissionAmount: number;
  commissionCurrency: Currency;
  commissionBearer: 'company' | 'party';
  commissionInBillCurrency: number;
  netCreditInBillCurrency: number;
}

export const getReceiptBreakdownForBill = (
  r: Receipt,
  billCurrency: Currency,
  fallbackRate: number = DEFAULT_EXCHANGE_RATE
): ReceiptBillBreakdown => {
  const receiptCurrency: Currency = r.currency === 'USD' ? 'USD' : 'IQD';
  const safeFallback = normalizeExchangeRate(fallbackRate, DEFAULT_EXCHANGE_RATE);
  const convRate = normalizeExchangeRate(r.exchangeRate, safeFallback);
  const grossAmount = Math.max(0, r.amount || 0);

  let grossInBillCurrency = grossAmount;
  if (receiptCurrency !== billCurrency) {
    if (billCurrency === 'USD' && receiptCurrency === 'IQD') {
      grossInBillCurrency = Math.round((grossAmount / convRate) * 100) / 100;
    } else if (billCurrency === 'IQD' && receiptCurrency === 'USD') {
      grossInBillCurrency = Math.round(grossAmount * convRate);
    }
  }

  const hasCommission = !!(r.hasCommission && (r.commissionAmount || 0) > 0);
  const commissionAmount = hasCommission ? Math.max(0, r.commissionAmount || 0) : 0;
  const commissionCurrency: Currency = (r.commissionCurrency || receiptCurrency) === 'USD' ? 'USD' : 'IQD';
  const commissionBearer: 'company' | 'party' = r.commissionBearer === 'party' ? 'party' : 'company';

  let commissionInBillCurrency = commissionAmount;
  if (hasCommission && commissionCurrency !== billCurrency) {
    if (billCurrency === 'USD' && commissionCurrency === 'IQD') {
      commissionInBillCurrency = Math.round((commissionAmount / convRate) * 100) / 100;
    } else if (billCurrency === 'IQD' && commissionCurrency === 'USD') {
      commissionInBillCurrency = Math.round(commissionAmount * convRate);
    }
  }

  // العمولة التي على الشركة تُستقطع من مبلغ الدفعة في الصندوق فقط ولا تنقص ما يُحتسب للزبون،
  // والعمولة التي على الزبون لا تؤثر على الحوالة (البوليصة) ولا تؤثر على الصندوق.
  const netCreditInBillCurrency = grossInBillCurrency;

  return {
    receiptCurrency,
    billCurrency,
    exchangeRate: convRate,
    grossAmount,
    grossInBillCurrency,
    hasCommission,
    commissionAmount,
    commissionCurrency,
    commissionBearer,
    commissionInBillCurrency,
    netCreditInBillCurrency,
  };
};

export interface BillFinancials {
  currency: Currency;
  grossTotalAmount: number; // المبلغ الإجمالي للبوليصة المتفق عليه مع الزبون
  totalCarrierCost: number; // إجمالي تكاليف ومصاريف النواقل المرتبطة بالبوليصة (تكلفة تشغيلية لا تخصم من الزبون)
  totalCarrierCostIQD: number;
  totalCarrierCostUSD: number;
  totalCarrierPaid?: number; // إجمالي المسدد للنواقل من الصندوق للبوليصة
  totalCarrierPaidIQD?: number;
  totalCarrierPaidUSD?: number;
  remainingCarrierDue?: number; // المتبقي المستحق للنواقل بذمة البوليصة
  remainingCarrierDueIQD?: number;
  remainingCarrierDueUSD?: number;
  totalAmount: number; // إجمالي استحقاق البوليصة بذمة الزبون (شامل لكل التكاليف المتفق عليها)
  initialPaid: number;
  additionalPayments: number;
  grossCollected?: number;
  totalCollected: number;
  remainingAmount: number;
  totalAdvances: number;
  totalSettled: number;
  openAdvances: number;
  openAdvancesIQD?: number;
  openAdvancesUSD?: number;
  collectedInIQD?: number;
  collectedInUSD?: number;
  commissionsIQD?: number;
  commissionsUSD?: number;
  customerCommissionInBillCurr?: number;
  companyCommissionInBillCurr?: number;
  isMixedCurrency?: boolean;
  grossTotalAmountUSD?: number;
  totalAmountUSD?: number;
  initialPaidUSD?: number;
  additionalPaymentsUSD?: number;
  totalCollectedUSD?: number;
  remainingAmountUSD?: number;
  equivalentTotalIQD?: number;
  equivalentCollectedIQD?: number;
  equivalentRemainingIQD?: number;
  exchangeRateUsed?: number;
}

export const getBillFinancials = (
  tx: Transaction, 
  receipts: Receipt[], 
  currentRate?: number,
  treasury?: TreasuryTransaction[]
): BillFinancials => {
  const currency: Currency = tx.currency === 'USD' ? 'USD' : 'IQD';
  const isMixed = !!tx.isMixedCurrency;
  const isTxCancelled = tx.status === 'cancelled';
  const rate = normalizeExchangeRate(
    currentRate || activeSystemExchangeRate || tx.exchangeRate,
    DEFAULT_EXCHANGE_RATE
  );

  // Active receipts linked to this bill
  const activeReceipts = receipts.filter(r => r.status !== 'cancelled' && r.billId === tx.id);

  // Calculate carrier transport expenses for this bill (to be deducted from total amount)
  let totalCarrierCostIQD = 0;
  let totalCarrierCostUSD = 0;
  let carrierCostInBillCurr = 0;

  if (tx.transportTrips && tx.transportTrips.length > 0) {
    tx.transportTrips.forEach(trip => {
      const cAmt = Math.max(0, Number(trip.carrierCost) || 0);
      const cCurr: Currency = trip.currency === 'USD' ? 'USD' : 'IQD';
      if (cCurr === 'USD') {
        totalCarrierCostUSD += cAmt;
        if (currency === 'USD') {
          carrierCostInBillCurr += cAmt;
        } else {
          carrierCostInBillCurr += Math.round(cAmt * rate);
        }
      } else {
        totalCarrierCostIQD += cAmt;
        if (currency === 'IQD') {
          carrierCostInBillCurr += cAmt;
        } else {
          carrierCostInBillCurr += Math.round((cAmt / rate) * 100) / 100;
        }
      }
    });
  }

  // Calculate carrier payments from treasury linked to this bill
  const normalizeBillNo = (no?: string) => (no || '').trim().replace(/^#/, '').toLowerCase();
  const txBillNo = normalizeBillNo(tx.billNo);

  const activeCarrierPayments = (treasury || []).filter(t => {
    if (t.status === 'cancelled' || t.type !== 'withdrawal') return false;
    const isCarrier = t.subAccount === 'carriers' || !!t.carrierId || (t.category && (t.category.includes('نقل') || t.category.includes('ناقل')));
    if (!isCarrier) return false;
    return normalizeBillNo(t.relatedBillNo) === txBillNo;
  });

  const totalCarrierPaidIQD = activeCarrierPayments
    .filter(t => (t.currency || 'IQD') === 'IQD')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalCarrierPaidUSD = activeCarrierPayments
    .filter(t => t.currency === 'USD')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalCarrierPaid = currency === 'USD'
    ? totalCarrierPaidUSD + Math.round((totalCarrierPaidIQD / rate) * 100) / 100
    : totalCarrierPaidIQD + Math.round(totalCarrierPaidUSD * rate);

  const remainingCarrierDue = Math.max(0, carrierCostInBillCurr - totalCarrierPaid);
  const remainingCarrierDueIQD = Math.max(0, totalCarrierCostIQD - totalCarrierPaidIQD);
  const remainingCarrierDueUSD = Math.max(0, totalCarrierCostUSD - totalCarrierPaidUSD);

  // Separate Broker Advances by Currency
  const advIQD = activeReceipts
    .filter(r => r.type === 'advance' && (r.currency || 'IQD') === 'IQD')
    .reduce((s, r) => s + (r.amount || 0), 0);
  const setIQD = activeReceipts
    .filter(r => r.type === 'settlement' && (r.currency || 'IQD') === 'IQD')
    .reduce((s, r) => s + (r.amount || 0), 0);
  const openAdvancesIQD = Math.max(0, advIQD - setIQD);

  const advUSD = activeReceipts
    .filter(r => r.type === 'advance' && r.currency === 'USD')
    .reduce((s, r) => s + (r.amount || 0), 0);
  const setUSD = activeReceipts
    .filter(r => r.type === 'settlement' && r.currency === 'USD')
    .reduce((s, r) => s + (r.amount || 0), 0);
  const openAdvancesUSD = Math.max(0, advUSD - setUSD);

  if (isMixed) {
    // Mixed currency (IQD + USD) - Carrier costs are operational expenses, not deducted from customer's receivable
    const grossTotalAmountIQD = isTxCancelled ? 0 : Math.max(0, tx.totalAmount || 0);
    const totalAmountIQD = grossTotalAmountIQD;
    const grossTotalAmountUSD = isTxCancelled ? 0 : Math.max(0, tx.totalAmountUSD || 0);
    const totalAmountUSD = grossTotalAmountUSD;

    const allDepositReceiptsForBill = receipts.filter(r => r.billId === tx.id && r.type === 'deposit');
    const depositReceiptsActive = activeReceipts.filter(r => r.type === 'deposit');
    const paymentReceiptsActive = activeReceipts.filter(r => r.type === 'payment');

    const depositIQD = depositReceiptsActive
      .filter(r => (r.currency || 'IQD') === 'IQD')
      .reduce((s, r) => s + (r.amount || 0), 0);
    const initialIQD = isTxCancelled 
      ? 0 
      : allDepositReceiptsForBill.length > 0 
        ? depositIQD 
        : Math.min(totalAmountIQD, Math.max(0, tx.initialPaid || 0));

    const depositUSD = depositReceiptsActive
      .filter(r => r.currency === 'USD')
      .reduce((s, r) => s + (r.amount || 0), 0);
    const initialUSD = isTxCancelled 
      ? 0 
      : allDepositReceiptsForBill.length > 0 
        ? depositUSD 
        : Math.min(totalAmountUSD, Math.max(0, tx.initialPaidUSD || 0));

    const addIQD = paymentReceiptsActive
      .filter(r => (r.currency || 'IQD') === 'IQD')
      .reduce((s, r) => s + getReceiptBreakdownForBill(r, 'IQD', rate).netCreditInBillCurrency, 0);

    const addUSD = paymentReceiptsActive
      .filter(r => r.currency === 'USD')
      .reduce((s, r) => s + getReceiptBreakdownForBill(r, 'USD', rate).netCreditInBillCurrency, 0);

    const totalCollectedIQD = Math.min(totalAmountIQD, initialIQD + addIQD);
    const remainingIQD = Math.max(0, totalAmountIQD - totalCollectedIQD);

    const totalCollectedUSD = Math.min(totalAmountUSD, initialUSD + addUSD);
    const remainingUSD = Math.max(0, totalAmountUSD - totalCollectedUSD);

    // Track actual collections in IQD and USD for mixed
    const allBillCollections = [...depositReceiptsActive, ...paymentReceiptsActive];
    const collectedInIQD = allBillCollections
      .filter(r => (r.currency || 'IQD') === 'IQD')
      .reduce((s, r) => s + (r.amount || 0), 0) + (allDepositReceiptsForBill.length === 0 ? (tx.initialPaid || 0) : 0);
    const collectedInUSD = allBillCollections
      .filter(r => r.currency === 'USD')
      .reduce((s, r) => s + (r.amount || 0), 0) + (allDepositReceiptsForBill.length === 0 ? (tx.initialPaidUSD || 0) : 0);

    return {
      currency: 'IQD',
      grossTotalAmount: grossTotalAmountIQD,
      totalCarrierCost: totalCarrierCostIQD,
      totalCarrierCostIQD,
      totalCarrierCostUSD,
      totalCarrierPaid,
      totalCarrierPaidIQD,
      totalCarrierPaidUSD,
      remainingCarrierDue,
      remainingCarrierDueIQD,
      remainingCarrierDueUSD,
      totalAmount: totalAmountIQD,
      initialPaid: initialIQD,
      additionalPayments: addIQD,
      totalCollected: totalCollectedIQD,
      remainingAmount: remainingIQD,
      totalAdvances: advIQD + (advUSD * rate),
      totalSettled: setIQD + (setUSD * rate),
      openAdvances: openAdvancesIQD + (openAdvancesUSD * rate),
      openAdvancesIQD,
      openAdvancesUSD,
      collectedInIQD,
      collectedInUSD,
      isMixedCurrency: true,
      grossTotalAmountUSD,
      totalAmountUSD,
      initialPaidUSD: initialUSD,
      additionalPaymentsUSD: addUSD,
      totalCollectedUSD,
      remainingAmountUSD: remainingUSD,
      equivalentTotalIQD: totalAmountIQD + (totalAmountUSD * rate),
      equivalentCollectedIQD: totalCollectedIQD + (totalCollectedUSD * rate),
      equivalentRemainingIQD: remainingIQD + (remainingUSD * rate),
      exchangeRateUsed: rate,
    };
  }

  // Single Currency (IQD or USD)
  const grossTotalAmount = isTxCancelled ? 0 : Math.max(0, tx.totalAmount || 0);
  // Carrier costs are operational expenses and NOT deducted from the customer's receivable:
  const totalAmount = grossTotalAmount;
  const allDepositReceiptsForBill = receipts.filter(r => r.billId === tx.id && r.type === 'deposit');

  const depositReceiptsActive = activeReceipts.filter(r => r.type === 'deposit');
  const paymentReceiptsActive = activeReceipts.filter(r => r.type === 'payment');

  const fallbackInitial = currency === 'IQD'
    ? Math.max(0, tx.initialPaid || 0) + Math.round(Math.max(0, tx.initialPaidUSD || 0) * rate)
    : Math.max(0, tx.initialPaid || 0) + Math.round((Math.max(0, tx.initialPaidUSD || 0) / rate) * 100) / 100;

  const rawInitial = allDepositReceiptsForBill.length > 0
    ? depositReceiptsActive.reduce((sum, r) => sum + getReceiptBreakdownForBill(r, currency, rate).netCreditInBillCurrency, 0)
    : fallbackInitial;
  const initial = isTxCancelled ? 0 : Math.min(totalAmount, rawInitial);

  const rawInitialGross = allDepositReceiptsForBill.length > 0
    ? depositReceiptsActive.reduce((sum, r) => sum + getReceiptBreakdownForBill(r, currency, rate).grossInBillCurrency, 0)
    : fallbackInitial;

  const additionalPayments = paymentReceiptsActive.reduce(
    (sum, r) => sum + getReceiptBreakdownForBill(r, currency, rate).netCreditInBillCurrency,
    0
  );

  const additionalPaymentsGross = paymentReceiptsActive.reduce(
    (sum, r) => sum + getReceiptBreakdownForBill(r, currency, rate).grossInBillCurrency,
    0
  );

  const rawCollected = Math.round((initial + additionalPayments) * 100) / 100;
  const grossCollected = Math.round((rawInitialGross + additionalPaymentsGross) * 100) / 100;
  const totalCollected = totalAmount > 0 ? Math.min(totalAmount, rawCollected) : 0;
  const remainingAmount = Math.max(0, Math.round((totalAmount - totalCollected) * 100) / 100);

  // Track actual cash collected by currency & commissions on this bill
  const allBillCollections = [...depositReceiptsActive, ...paymentReceiptsActive];
  const collectedInIQD = allBillCollections
    .filter(r => (r.currency || 'IQD') === 'IQD')
    .reduce((s, r) => s + (r.amount || 0), 0) + (allDepositReceiptsForBill.length === 0 ? (currency === 'IQD' ? (tx.initialPaid || 0) : 0) : 0);
  const collectedInUSD = allBillCollections
    .filter(r => r.currency === 'USD')
    .reduce((s, r) => s + (r.amount || 0), 0) + (allDepositReceiptsForBill.length === 0 ? (currency === 'USD' ? (tx.initialPaid || 0) : (tx.initialPaidUSD || 0)) : 0);

  let commissionsIQD = 0;
  let commissionsUSD = 0;
  let customerCommissionInBillCurr = 0;
  let companyCommissionInBillCurr = 0;

  activeReceipts.forEach(r => {
    if (r.hasCommission && (r.commissionAmount || 0) > 0) {
      const b = getReceiptBreakdownForBill(r, currency, rate);
      if (b.commissionCurrency === 'USD') {
        commissionsUSD += b.commissionAmount;
      } else {
        commissionsIQD += b.commissionAmount;
      }
      if (r.type === 'deposit' || r.type === 'payment') {
        if (b.commissionBearer === 'party') {
          customerCommissionInBillCurr += b.commissionInBillCurrency;
        } else {
          companyCommissionInBillCurr += b.commissionInBillCurrency;
        }
      }
    }
  });

  // Broker advances converted to bill currency (plus exact IQD/USD fields)
  const totalAdvances = currency === 'USD'
    ? Math.round((advUSD + (advIQD / rate)) * 100) / 100
    : Math.round(advIQD + (advUSD * rate));

  const totalSettled = currency === 'USD'
    ? Math.round((setUSD + (setIQD / rate)) * 100) / 100
    : Math.round(setIQD + (setUSD * rate));

  const openAdvances = Math.max(0, Math.round((totalAdvances - totalSettled) * 100) / 100);

  return {
    currency,
    grossTotalAmount,
    totalCarrierCost: carrierCostInBillCurr,
    totalCarrierCostIQD,
    totalCarrierCostUSD,
    totalCarrierPaid,
    totalCarrierPaidIQD,
    totalCarrierPaidUSD,
    remainingCarrierDue,
    remainingCarrierDueIQD,
    remainingCarrierDueUSD,
    totalAmount: isTxCancelled ? (tx.totalAmount || 0) : totalAmount,
    initialPaid: initial,
    additionalPayments,
    grossCollected,
    totalCollected,
    remainingAmount: isTxCancelled ? 0 : remainingAmount,
    totalAdvances,
    totalSettled,
    openAdvances,
    openAdvancesIQD,
    openAdvancesUSD,
    collectedInIQD,
    collectedInUSD,
    commissionsIQD,
    commissionsUSD,
    customerCommissionInBillCurr,
    companyCommissionInBillCurr,
    equivalentTotalIQD: currency === 'USD' ? Math.round(totalAmount * rate) : totalAmount,
    equivalentCollectedIQD: currency === 'USD' ? Math.round(totalCollected * rate) : totalCollected,
    equivalentRemainingIQD: currency === 'USD' ? Math.round(remainingAmount * rate) : remainingAmount,
    exchangeRateUsed: rate,
  };
};

export const getEmployeeAdvances = (empId: string, receipts: Receipt[]) => {
  const activeReceipts = receipts.filter(r => r.status !== 'cancelled' && r.employeeId === empId);

  const advancesIQD = activeReceipts
    .filter(r => r.type === 'advance' && (r.currency || 'IQD') === 'IQD')
    .reduce((s, r) => s + (r.amount || 0), 0);
  const settledIQD = activeReceipts
    .filter(r => r.type === 'settlement' && (r.currency || 'IQD') === 'IQD')
    .reduce((s, r) => s + (r.amount || 0), 0);
  const openIQD = Math.max(0, advancesIQD - settledIQD);

  const advancesUSD = activeReceipts
    .filter(r => r.type === 'advance' && r.currency === 'USD')
    .reduce((s, r) => s + (r.amount || 0), 0);
  const settledUSD = activeReceipts
    .filter(r => r.type === 'settlement' && r.currency === 'USD')
    .reduce((s, r) => s + (r.amount || 0), 0);
  const openUSD = Math.max(0, advancesUSD - settledUSD);

  return {
    advances: advancesIQD,
    settled: settledIQD,
    open: openIQD,
    advancesIQD,
    settledIQD,
    openIQD,
    advancesUSD,
    settledUSD,
    openUSD,
  };
};

export interface CarrierTripWithBill {
  trip: BillTransportTrip;
  bill: Transaction;
}

export interface CarrierFinancialSummary {
  carrier: TransportCompany;
  trips: CarrierTripWithBill[];
  payments: TreasuryTransaction[];
  activePayments: TreasuryTransaction[];
  totalTripsCount: number;
  totalTrucksCount: number;
  billsCount: number;
  totalCostIQD: number;
  totalCostUSD: number;
  paidIQD: number;
  paidUSD: number;
  remainingIQD: number;
  remainingUSD: number;
  equivalentRemainingIQD: number;
}

export const getCarrierFinancials = (
  carrier: TransportCompany,
  transactions: Transaction[],
  treasury: TreasuryTransaction[],
  currentExchangeRate?: number
): CarrierFinancialSummary => {
  const rate = normalizeExchangeRate(
    currentExchangeRate || activeSystemExchangeRate,
    DEFAULT_EXCHANGE_RATE
  );

  const trips: CarrierTripWithBill[] = [];
  const billIdsSet = new Set<string>();
  let totalTrucksCount = 0;
  let totalCostIQD = 0;
  let totalCostUSD = 0;

  transactions.forEach(tx => {
    if (tx.status === 'cancelled') return;
    if (tx.transportTrips && tx.transportTrips.length > 0) {
      tx.transportTrips.forEach(trip => {
        if (trip.carrierId === carrier.id || (!trip.carrierId && trip.carrierName === carrier.name)) {
          trips.push({ trip, bill: tx });
          billIdsSet.add(tx.id);
          totalTrucksCount += Math.max(1, Number(trip.truckCount) || 1);
          if (trip.currency === 'USD') {
            totalCostUSD += Number(trip.carrierCost) || 0;
          } else {
            totalCostIQD += Number(trip.carrierCost) || 0;
          }
        }
      });
    }
  });

  // All treasury withdrawals linked to this carrier
  const payments = treasury.filter(
    t =>
      t.type === 'withdrawal' &&
      (t.carrierId === carrier.id ||
        (t.subAccount === 'carriers' && t.partyName === carrier.name))
  );

  const activePayments = payments.filter(t => t.status !== 'cancelled');

  const paidIQD = activePayments
    .filter(t => (t.currency || 'IQD') === 'IQD')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const paidUSD = activePayments
    .filter(t => t.currency === 'USD')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // Account for cross-currency settlements if one currency was overpaid to settle the other
  let rawRemIQD = totalCostIQD - paidIQD;
  let rawRemUSD = totalCostUSD - paidUSD;

  if (rawRemIQD < 0 && rawRemUSD > 0) {
    const excessIQDInUSD = Math.abs(rawRemIQD) / rate;
    rawRemUSD = Math.max(0, Math.round((rawRemUSD - excessIQDInUSD) * 100) / 100);
    rawRemIQD = 0;
  } else if (rawRemUSD < 0 && rawRemIQD > 0) {
    const excessUSDInIQD = Math.round(Math.abs(rawRemUSD) * rate);
    rawRemIQD = Math.max(0, rawRemIQD - excessUSDInIQD);
    rawRemUSD = 0;
  }

  const remainingIQD = Math.max(0, Math.round(rawRemIQD));
  const remainingUSD = Math.max(0, Math.round(rawRemUSD * 100) / 100);
  const equivalentRemainingIQD = Math.round(remainingIQD + remainingUSD * rate);

  return {
    carrier,
    trips,
    payments,
    activePayments,
    totalTripsCount: trips.length,
    totalTrucksCount,
    billsCount: billIdsSet.size,
    totalCostIQD,
    totalCostUSD,
    paidIQD,
    paidUSD,
    remainingIQD,
    remainingUSD,
    equivalentRemainingIQD,
  };
};

export interface TreasuryFinancialSummary {
  // IQD Balances & Flows
  directDepositsIQD: number;
  directWithdrawalsIQD: number;
  customerCollectionsIQD: number;
  brokerAdvancesIQD: number;
  totalCommissionsIQD: number;
  companyCommissionsIQD?: number;
  partyCommissionsIQD?: number;
  totalInflowIQD: number;
  totalOutflowIQD: number;
  currentBalanceIQD: number;

  // USD Balances & Flows
  directDepositsUSD: number;
  directWithdrawalsUSD: number;
  customerCollectionsUSD: number;
  brokerAdvancesUSD: number;
  totalCommissionsUSD: number;
  companyCommissionsUSD?: number;
  partyCommissionsUSD?: number;
  totalInflowUSD: number;
  totalOutflowUSD: number;
  currentBalanceUSD: number;

  // Overall Total Liquidity Evaluated in IQD
  totalEquivalentIQD: number;
  exchangeRate: number;

  // Aliases for Backward Compatibility (IQD values)
  directDeposits: number;
  directWithdrawals: number;
  customerCollections: number;
  brokerAdvances: number;
  totalCommissions: number;
  totalInflow: number;
  totalOutflow: number;
  currentBalance: number;
}

export const getTreasuryFinancialSummary = (
  treasury: TreasuryTransaction[],
  receipts: Receipt[],
  currentExchangeRate?: number
): TreasuryFinancialSummary => {
  const activeTreasury = treasury.filter(t => t.status !== 'cancelled');
  const activeReceipts = receipts.filter(r => r.status !== 'cancelled');
  const rate = normalizeExchangeRate(
    currentExchangeRate || activeSystemExchangeRate,
    DEFAULT_EXCHANGE_RATE
  );

  // Direct Treasury Movements in IQD
  let directDepositsIQD = activeTreasury
    .filter(t => t.type === 'deposit' && (t.currency || 'IQD') === 'IQD')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  let directWithdrawalsIQD = activeTreasury
    .filter(t => t.type === 'withdrawal' && (t.currency || 'IQD') === 'IQD')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  // Direct Treasury Movements in USD
  let directDepositsUSD = activeTreasury
    .filter(t => t.type === 'deposit' && t.currency === 'USD')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  let directWithdrawalsUSD = activeTreasury
    .filter(t => t.type === 'withdrawal' && t.currency === 'USD')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  // Handle Internal Currency Swaps (تصريف وتحويل عملة داخل الصندوق)
  activeTreasury.forEach(t => {
    const isSwapCategory = !!(
      t.category &&
      (t.category.includes('تصريف') || t.category.includes('تحويل عملة') || t.category.includes('FX Swap'))
    );
    if (isSwapCategory) {
      const txRate = normalizeExchangeRate(t.exchangeRate, rate);
      if (t.type === 'withdrawal' && t.currency === 'USD') {
        // Exchanged USD -> IQD: Adds to IQD cashbox!
        const swappedIQD = t.swapTargetAmount || (t.amount * txRate);
        directDepositsIQD += swappedIQD;
      } else if (t.type === 'withdrawal' && (t.currency || 'IQD') === 'IQD') {
        // Exchanged IQD -> USD: Adds to USD cashbox!
        const swappedUSD = t.swapTargetAmount || Math.round((t.amount / txRate) * 100) / 100;
        directDepositsUSD += swappedUSD;
      } else if (t.type === 'deposit' && (t.currency || 'IQD') === 'IQD') {
        // Deposited IQD from USD swap: Deducts USD from USD cashbox!
        const swappedUSD = t.swapTargetAmount || Math.round((t.amount / txRate) * 100) / 100;
        directWithdrawalsUSD += swappedUSD;
      } else if (t.type === 'deposit' && t.currency === 'USD') {
        // Deposited USD from IQD swap: Deducts IQD from IQD cashbox!
        const swappedIQD = t.swapTargetAmount || (t.amount * txRate);
        directWithdrawalsIQD += swappedIQD;
      }
    }
  });

  // Calculate Transfer & Exchange Commissions (العمولة التي على الشركة فقط تُستقطع من مبلغ الدفعة في الصندوق، والتي على الزبون لا تؤثر على الصندوق)
  let totalCommissionsIQD = 0;
  let totalCommissionsUSD = 0;
  let companyCommissionsIQD = 0;
  let companyCommissionsUSD = 0;
  let partyCommissionsIQD = 0;
  let partyCommissionsUSD = 0;

  // 1. Commissions from Treasury transactions
  activeTreasury.forEach(t => {
    if (t.hasCommission && (t.commissionAmount || 0) > 0) {
      const commCurr = t.commissionCurrency || t.currency || 'IQD';
      const amt = t.commissionAmount || 0;
      if (t.commissionBearer === 'party') {
        if (commCurr === 'USD') partyCommissionsUSD += amt;
        else partyCommissionsIQD += amt;
      } else {
        if (commCurr === 'USD') {
          companyCommissionsUSD += amt;
          totalCommissionsUSD += amt;
        } else {
          companyCommissionsIQD += amt;
          totalCommissionsIQD += amt;
        }
      }
    }
  });

  // 2. Commissions from Receipts:
  // - إذا كانت على الشركة: تُستقطع من مبلغ الدفعة في الصندوق
  // - إذا كانت على الزبون: لا تؤثر على الحوالة أو الصندوق
  activeReceipts.forEach(r => {
    if (r.hasCommission && (r.commissionAmount || 0) > 0) {
      const commCurr = r.commissionCurrency || r.currency || 'IQD';
      const amt = r.commissionAmount || 0;
      if (r.commissionBearer === 'party') {
        if (commCurr === 'USD') partyCommissionsUSD += amt;
        else partyCommissionsIQD += amt;
      } else {
        if (commCurr === 'USD') {
          companyCommissionsUSD += amt;
          totalCommissionsUSD += amt;
        } else {
          companyCommissionsIQD += amt;
          totalCommissionsIQD += amt;
        }
      }
    }
  });

  // Customer Collections in IQD & USD (Gross receipts before commission deduction)
  const customerCollectionsIQD = activeReceipts
    .filter(r => (r.type === 'deposit' || r.type === 'payment') && (r.currency || 'IQD') === 'IQD')
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  const customerCollectionsUSD = activeReceipts
    .filter(r => (r.type === 'deposit' || r.type === 'payment') && r.currency === 'USD')
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  // Broker Advances in IQD & USD
  const brokerAdvancesIQD = activeReceipts
    .filter(r => r.type === 'advance' && (r.currency || 'IQD') === 'IQD')
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  const brokerAdvancesUSD = activeReceipts
    .filter(r => r.type === 'advance' && r.currency === 'USD')
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  // Totals IQD
  const totalInflowIQD = directDepositsIQD + customerCollectionsIQD;
  const totalOutflowIQD = directWithdrawalsIQD + brokerAdvancesIQD + totalCommissionsIQD;
  const currentBalanceIQD = totalInflowIQD - totalOutflowIQD;

  // Totals USD
  const totalInflowUSD = directDepositsUSD + customerCollectionsUSD;
  const totalOutflowUSD = directWithdrawalsUSD + brokerAdvancesUSD + totalCommissionsUSD;
  const currentBalanceUSD = Math.round((totalInflowUSD - totalOutflowUSD) * 100) / 100;

  // Total Combined Liquidity
  const totalEquivalentIQD = currentBalanceIQD + (currentBalanceUSD * rate);

  return {
    directDepositsIQD,
    directWithdrawalsIQD,
    customerCollectionsIQD,
    brokerAdvancesIQD,
    totalCommissionsIQD,
    companyCommissionsIQD,
    partyCommissionsIQD,
    totalInflowIQD,
    totalOutflowIQD,
    currentBalanceIQD,

    directDepositsUSD,
    directWithdrawalsUSD,
    customerCollectionsUSD,
    brokerAdvancesUSD,
    totalCommissionsUSD,
    companyCommissionsUSD,
    partyCommissionsUSD,
    totalInflowUSD,
    totalOutflowUSD,
    currentBalanceUSD,

    totalEquivalentIQD,
    exchangeRate: rate,

    // Aliases
    directDeposits: directDepositsIQD,
    directWithdrawals: directWithdrawalsIQD,
    customerCollections: customerCollectionsIQD,
    brokerAdvances: brokerAdvancesIQD,
    totalCommissions: totalCommissionsIQD,
    totalInflow: totalInflowIQD,
    totalOutflow: totalOutflowIQD,
    currentBalance: currentBalanceIQD,
  };
};
