export type UserRole = 'admin' | 'accountant' | 'employee' | 'custom';

export interface UserPermissions {
  // === 1. Tab Access Permissions (صلاحيات الوصول لكافة تبويبات النظام) ===
  viewDashboard?: boolean;    // لوحة التحكم
  viewTreasury?: boolean;     // صندوق الشركة (الخزينة)
  viewAccounts?: boolean;     // الحسابات والمصاريف
  viewCustomers?: boolean;    // الزبائن
  viewTransactions?: boolean; // البوالص والمعاملات
  viewCarriers?: boolean;     // شركات النقل والنواقل البرية
  viewEmployees?: boolean;    // الموظفون والمخلصون
  viewReceipts?: boolean;     // الوصولات والأرشيف
  viewReports?: boolean;      // التقارير المالية
  viewAuditLog?: boolean;     // سجل التدقيق والرقابة
  viewUsers?: boolean;        // المستخدمون والصلاحيات

  // === 2. Operational Permissions (الصلاحيات التشغيلية والمالية) ===
  createTransactions?: boolean; // إنشاء بوالص كمركية جديدة
  editTx: boolean;            // إنشاء وتعديل البوالص والمعاملات
  editSettled: boolean;       // تعديل السلف المصفاة
  createReceipts?: boolean;   // إصدار سندات قبض ووصولات مالية
  createExpenses?: boolean;   // تسجيل قيود صرف ورواتب وإيجارات
  manageCarriers?: boolean;   // إدارة وتسديد أجور شركات النقل
  disburseAdvance?: boolean;  // صرف سلف للمخلصين الكمركيين
  settleAdvance?: boolean;    // تسوية سلف المخلصين
  printVouchers?: boolean;    // طباعة السندات والبوالص
  exportBackup?: boolean;     // تصدير البيانات والنسخ الاحتياطي

  // === 3. Sensitive & Security Permissions (الصلاحيات الحساسة) ===
  reports: boolean;           // التقارير المالية
  treasury?: boolean;         // حركات الصندوق والخزينة
  manageUsers: boolean;       // إدارة المستخدمين والصلاحيات
  deleteRecords: boolean;     // صلاحية الإلغاء الدفتري والحذف
  auditLog?: boolean;         // سجل التدقيق والرقابة
}

export interface AppUser {
  id: string;
  name: string;
  username: string;
  password?: string;
  email?: string;
  phone?: string;
  role: UserRole;
  roleTitle: string;
  avatar: string;
  status?: 'active' | 'suspended';
  lastLogin?: string;
  permissions: UserPermissions;
  createdAt: string;
}

export type CompanyId = 'naqaa_basra' | 'sawt_aljanoub';

export interface CompanyInfo {
  id: CompanyId;
  name: string;
  fullName: string;
  shortName: string;
  badgeClass: string;
  badgeColor: string;
  badgeDot: string;
  borderClass: string;
  slogan: string;
  address: string;
  phone: string;
  email: string;
  regNo: string;
}

export const COMPANIES: Record<CompanyId, CompanyInfo> = {
  naqaa_basra: {
    id: 'naqaa_basra',
    name: 'شركة نقاء البصرة',
    fullName: 'شركة نقاء البصرة للتخليص الكمركي والنقل العام',
    shortName: 'نقاء البصرة',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    badgeDot: 'bg-emerald-400',
    borderClass: 'border-emerald-500/40',
    slogan: 'خدمات التخليص الكمركي المتقدمة، الشحن البحري، والنقل العام',
    address: 'البصرة - شارع الاستقلال - مجمع الموانئ التجاري',
    phone: '0780 123 4567 / 0770 987 6543',
    email: 'info@naqaa-basra.com',
    regNo: 'ر.ش: 48921/بصرة',
  },
  sawt_aljanoub: {
    id: 'sawt_aljanoub',
    name: 'شركة صوت الجنوب',
    fullName: 'شركة صوت الجنوب للتخليص الكمركي والخدمات اللوجستية',
    shortName: 'صوت الجنوب',
    badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    badgeDot: 'bg-cyan-400',
    borderClass: 'border-cyan-500/40',
    slogan: 'حلول التخليص الكمركي المتكاملة والملاحة والشحن والترانزيت',
    address: 'البصرة - العشار - تقاطع الطويسة - برج الفرات',
    phone: '0781 555 8899 / 0771 222 3344',
    email: 'contact@sawt-aljanoub.com',
    regNo: 'ر.ش: 56104/جنوب',
  },
};

export type Currency = 'IQD' | 'USD';

export interface Customer {
  id: string;
  name: string;
  regNo: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  companyId?: CompanyId | 'both';
  notes: string;
  createdAt: string;
}

export interface TreasuryAttachment {
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  date: string;
}

export interface TransportCompany {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  address: string;
  notes: string;
  createdAt: string;
}

export interface BillTransportTrip {
  id: string;
  carrierId: string;
  carrierName?: string;
  destination: string;      // وجهة النقل (مثلاً: أم قصر ← بغداد)
  truckCount: number;       // عدد الشاحنات
  driverName: string;       // اسم السائق
  truckPlateNo: string;     // رقم السيارة / الشاحنة
  driverPhone?: string;     // هاتف السائق
  currency: Currency;       // عملة النقلة ('IQD' أو 'USD')
  carrierCost: number;      // أجرة شركة النقل (المستحق لشركة النقل)
  customerCharge?: number;  // أجرة النقل المحملة على الزبون (اختياري)
  notes?: string;
  transportDocument?: TreasuryAttachment; // أرشفة ورقة أو وصل استلام النقل الخاص بالنقلة
}

export type TransactionStatus = 'pending' | 'completed' | 'issue' | 'cancelled';

export interface Transaction {
  id: string;
  billNo: string;
  companyId?: CompanyId; // شركة نقاء البصرة أو شركة صوت الجنوب
  customerId: string;
  employeeId: string;
  date: string; // تاريخ فتح المعاملة / الاستلام
  deliveryOrderDate?: string; // تاريخ أمر تسليم الشحنة (Delivery Order)
  clearanceDate?: string; // تاريخ إنجاز التخليص الكمركي
  exitDate?: string; // تاريخ خروج الشحنة من الميناء أو المنفذ الكمركي
  containerReturnDate?: string; // تاريخ إعادة الحاوية الفارغة للميناء / الخط الملاحي
  goodsType: string;
  status: TransactionStatus;
  currency?: Currency; // 'IQD' (الافتراضي) أو 'USD'
  exchangeRate?: number; // سعر الصرف المعتمد للبوليصة (دينار لكل دولار)
  totalAmount: number;
  initialPaid: number;
  isMixedCurrency?: boolean; // هل المعاملة هجينة (مختلطة دينار + دولار)؟
  totalAmountUSD?: number; // جزء الدولار إن وجد للمعاملات المختلطة
  initialPaidUSD?: number; // مقدم الدولار إن وجد
  notes: string;
  containers: string[];
  agencyDocument?: TreasuryAttachment; // ورقة الوكالة الخاصة بالعمل المؤرشفة لكل بوليصة
  hasTransport?: boolean; // هل البوليصة تتضمن نقل بضائع (نواقل)؟
  transportTrips?: BillTransportTrip[]; // قائمة النقلات والشاحنات المرتبطة بالبوليصة
  transportDocument?: TreasuryAttachment; // ورقة أو وصل استلام النقل العام للبوليصة
  cancelledAt?: string;
  cancelledBy?: string;
  cancelReason?: string;
  createdAt: string;
}

export type EmployeeCategory = 'staff' | 'broker' | 'both';

export interface Employee {
  id: string;
  name: string;
  phone: string;
  idNo: string;
  joinDate: string;
  notes: string;
  category?: EmployeeCategory;
  jobTitle?: string;
  baseSalary?: number;
  department?: string;
}

export type ReceiptType = 'deposit' | 'payment' | 'advance' | 'settlement';

export interface Receipt {
  id: string;
  receiptNo: string;
  type: ReceiptType;
  billId: string;
  companyId?: CompanyId; // الشركة التابعة للسند
  customerId?: string;
  employeeId?: string;
  currency?: Currency; // 'IQD' (الافتراضي) أو 'USD'
  exchangeRate?: number; // سعر الصرف وقت تسجيل السند
  amount: number;
  date: string;
  notes: string;
  status?: 'active' | 'cancelled';
  cancelledAt?: string;
  cancelledBy?: string;
  cancelReason?: string;
  attachment?: TreasuryAttachment;
  // عمولات التحويل والصرافة (Commissions)
  hasCommission?: boolean;
  commissionAmount?: number;
  commissionCurrency?: Currency;
  commissionBearer?: 'company' | 'party'; // 'company' = الشركة/الصندوق يتحملها, 'party' = الطرف الآخر (الزبون/المخلص)
  createdAt: string;
}

export interface Attachment {
  id: string;
  entityType: 'transaction' | 'receipt' | 'treasury';
  entityId: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  date: string;
}

export type TreasuryMovementType = 'deposit' | 'withdrawal';

export interface TreasuryTransaction {
  id: string;
  voucherNo: string;
  companyId?: CompanyId | 'shared'; // نقاء البصرة أو صوت الجنوب أو مشترك
  type: TreasuryMovementType;
  category: string;
  currency?: Currency; // 'IQD' (الافتراضي) أو 'USD'
  exchangeRate?: number; // سعر الصرف وقت الحركة
  amount: number;
  // للحركات الخاصة بتصريف العملة داخل الصندوق (FX Swap)
  swapTargetCurrency?: Currency;
  swapTargetAmount?: number;
  // عمولات التحويل والصرافة (Commissions)
  hasCommission?: boolean;
  commissionAmount?: number;
  commissionCurrency?: Currency;
  commissionBearer?: 'company' | 'party';
  date: string;
  partyName: string;
  description: string;
  relatedBillNo?: string;
  carrierId?: string; // معرف شركة النقل عند تسديد دفعة لشركة النقل
  tripId?: string; // معرف النقلة المرتبطة إن وجد
  status?: 'active' | 'cancelled';
  cancelledAt?: string;
  cancelledBy?: string;
  cancelReason?: string;
  attachment?: TreasuryAttachment;
  subAccount?: 'salaries' | 'daily' | 'rents' | 'carriers' | 'bill_expenses' | 'other';
  period?: string;
  recordedBy: string;
  createdAt: string;
}

export type AuditAction = 'create' | 'update' | 'void' | 'delete' | 'print' | 'export' | 'auth';

export type AuditEntityType = 
  | 'bill' 
  | 'receipt' 
  | 'treasury' 
  | 'account_expense' 
  | 'carrier'
  | 'customer' 
  | 'employee' 
  | 'user' 
  | 'system';

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO string
  userId: string;
  userName: string;
  userRole: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string;
  entityReference?: string;
  title: string;
  details: string;
  cancelReason?: string;
  financialImpact?: {
    amount?: number;
    inflowChange?: string;
    outflowChange?: string;
    balanceChange?: string;
  };
  metadata?: Record<string, any>;
  ipAddress?: string;
}


