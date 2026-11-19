import { useState, useEffect, useRef } from 'react';
import { 
  Transaction, 
  Customer, 
  Employee, 
  Receipt, 
  CompanyId, 
  Currency, 
  TreasuryAttachment, 
  TransportCompany, 
  BillTransportTrip, 
  TreasuryTransaction 
} from '../../../types/customs';
import { getBillFinancials, normalizeExchangeRate } from '../../../utils/storage';

export type ModalTab = 'general' | 'financial' | 'transport' | 'notes';

export interface UseTransactionFormProps {
  isOpen: boolean;
  initialData?: Transaction | null;
  customers: Customer[];
  employees: Employee[];
  carriers?: TransportCompany[];
  receipts?: Receipt[];
  treasury?: TreasuryTransaction[];
  exchangeRate?: number;
  onExchangeRateChange?: (newRate: number, silent?: boolean) => void;
  onSave: (txData: Omit<Transaction, 'id' | 'createdAt'> & { id?: string }) => void;
}

export function useTransactionForm({
  isOpen,
  initialData,
  customers,
  employees,
  carriers = [],
  receipts = [],
  treasury = [],
  exchangeRate = 1500,
  onExchangeRateChange,
  onSave,
}: UseTransactionFormProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>('general');
  const [billNo, setBillNo] = useState('');
  const [jobNumber, setJobNumber] = useState('');
  const [freeTimeDays, setFreeTimeDays] = useState<number | ''>(14);
  const [containerDestination, setContainerDestination] = useState('');
  const [companyId, setCompanyId] = useState<CompanyId>('naqaa_basra');
  const [currency, setCurrency] = useState<Currency>('IQD');
  const [localRate, setLocalRate] = useState<number>(normalizeExchangeRate(exchangeRate, 1500));
  const [isMixedCurrency, setIsMixedCurrency] = useState<boolean>(false);
  const [customerId, setCustomerId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [date, setDate] = useState('');
  const [deliveryOrderDate, setDeliveryOrderDate] = useState<string>('');
  const [clearanceDate, setClearanceDate] = useState<string>('');
  const [exitDate, setExitDate] = useState<string>('');
  const [containerReturnDate, setContainerReturnDate] = useState<string>('');
  const [goodsType, setGoodsType] = useState('');
  const [status, setStatus] = useState<Transaction['status']>('pending');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [initialPaid, setInitialPaid] = useState<number>(0);
  const [totalAmountUSD, setTotalAmountUSD] = useState<number>(0);
  const [initialPaidUSD, setInitialPaidUSD] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [containers, setContainers] = useState<string[]>([]);
  const [agencyDocument, setAgencyDocument] = useState<TreasuryAttachment | undefined>(undefined);
  const [hasTransport, setHasTransport] = useState<boolean>(false);
  const [transportTrips, setTransportTrips] = useState<BillTransportTrip[]>([]);
  const [transportDocument, setTransportDocument] = useState<TreasuryAttachment | undefined>(undefined);
  const [formError, setFormError] = useState<string | null>(null);
  const footerAgencyInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (exchangeRate && exchangeRate > 0) {
      const normalizedProp = normalizeExchangeRate(exchangeRate, 1500);
      setLocalRate((prev) => {
        if (prev > 0 && normalizeExchangeRate(prev, 1500) === normalizedProp) {
          return prev;
        }
        return normalizedProp;
      });
    }
  }, [exchangeRate]);

  useEffect(() => {
    setFormError(null);
    setActiveTab('general');
    if (initialData) {
      setBillNo(initialData.billNo);
      setJobNumber(initialData.jobNumber || '');
      setFreeTimeDays(
        initialData.freeTimeDays !== undefined && initialData.freeTimeDays !== null
          ? initialData.freeTimeDays
          : ''
      );
      setContainerDestination(initialData.containerDestination || '');
      setCompanyId(initialData.companyId || 'naqaa_basra');
      setCurrency(initialData.currency || 'IQD');
      setIsMixedCurrency(!!initialData.isMixedCurrency);
      setCustomerId(initialData.customerId);
      setEmployeeId(initialData.employeeId);
      setDate(initialData.date);
      setDeliveryOrderDate(initialData.deliveryOrderDate || '');
      setClearanceDate(initialData.clearanceDate || '');
      setExitDate(initialData.exitDate || '');
      setContainerReturnDate(initialData.containerReturnDate || '');
      setGoodsType(initialData.goodsType || '');
      setStatus(initialData.status);
      setTotalAmount(initialData.totalAmount || 0);
      setInitialPaid(initialData.initialPaid || 0);
      setTotalAmountUSD(initialData.totalAmountUSD || 0);
      setInitialPaidUSD(initialData.initialPaidUSD || 0);
      setNotes(initialData.notes || '');
      setContainers(initialData.containers || []);
      setAgencyDocument(initialData.agencyDocument);
      setHasTransport(
        !!(
          initialData.hasTransport ||
          (initialData.transportTrips && initialData.transportTrips.length > 0)
        )
      );
      setTransportTrips(initialData.transportTrips || []);
      setTransportDocument(initialData.transportDocument);
    } else {
      const randomBill = `BL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const randomJob = `JOB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setBillNo(randomBill);
      setJobNumber(randomJob);
      setFreeTimeDays(14);
      setContainerDestination('');
      setCompanyId('naqaa_basra');
      setCurrency('IQD');
      setIsMixedCurrency(false);
      setCustomerId(customers[0]?.id || '');
      setEmployeeId(employees[0]?.id || '');
      setDate(new Date().toISOString().split('T')[0]);
      setDeliveryOrderDate('');
      setClearanceDate('');
      setExitDate('');
      setContainerReturnDate('');
      setGoodsType('');
      setStatus('pending');
      setTotalAmount(0);
      setInitialPaid(0);
      setTotalAmountUSD(0);
      setInitialPaidUSD(0);
      setNotes('');
      setContainers([]);
      setAgencyDocument(undefined);
      setHasTransport(false);
      setTransportTrips([]);
      setTransportDocument(undefined);
    }
    setLocalRate(normalizeExchangeRate(exchangeRate, 1500));
  }, [initialData, isOpen, customers, employees, exchangeRate]);

  const activeRate = normalizeExchangeRate(localRate, normalizeExchangeRate(exchangeRate, 1500));

  const existingFin =
    initialData && receipts
      ? getBillFinancials({ ...initialData, currency, exchangeRate: activeRate }, receipts, activeRate)
      : null;
  const existingPayments = existingFin ? existingFin.additionalPayments : 0;
  const existingPaymentsUSD = existingFin?.additionalPaymentsUSD || 0;

  const directExpensesOnBill = (treasury || []).filter(
    (tx) => tx.relatedBillNo === billNo && tx.type === 'withdrawal' && tx.status !== 'cancelled'
  );
  const directExpensesIQDOnBill = directExpensesOnBill
    .filter((t) => (t.currency || 'IQD') === 'IQD')
    .reduce((s, t) => s + (t.amount || 0), 0);
  const directExpensesUSDOnBill = directExpensesOnBill
    .filter((t) => t.currency === 'USD')
    .reduce((s, t) => s + (t.amount || 0), 0);

  const carrierPaymentsOnBill = (treasury || []).filter(
    (tx) => tx.relatedBillNo === billNo && tx.subAccount === 'carriers' && tx.status !== 'cancelled'
  );
  const carrierPaidIQDOnBill = carrierPaymentsOnBill
    .filter((t) => (t.currency || 'IQD') === 'IQD')
    .reduce((s, t) => s + (t.amount || 0), 0);
  const carrierPaidUSDOnBill = carrierPaymentsOnBill
    .filter((t) => t.currency === 'USD')
    .reduce((s, t) => s + (t.amount || 0), 0);
  const hasPaidCarriersOnBill = carrierPaidIQDOnBill > 0 || carrierPaidUSDOnBill > 0;

  const milestonesCount = [deliveryOrderDate, clearanceDate, exitDate, containerReturnDate].filter(
    Boolean
  ).length;

  const equivalentInitialInBillCurr =
    currency === 'USD'
      ? (initialPaidUSD || 0) + (initialPaid > 0 && activeRate > 0 ? initialPaid / activeRate : 0)
      : initialPaid + (initialPaidUSD || 0) * activeRate;

  const isInitialExceeded =
    !isMixedCurrency && totalAmount > 0 && equivalentInitialInBillCurr > totalAmount;
  const isInitialUSDExceeded =
    isMixedCurrency && (totalAmountUSD || 0) > 0 && (initialPaidUSD || 0) > (totalAmountUSD || 0);
  const isTotalLessThanExisting =
    !isMixedCurrency &&
    existingPayments > 0 &&
    totalAmount < existingPayments + equivalentInitialInBillCurr;
  const isTotalUSDLessThanExisting =
    isMixedCurrency &&
    existingPaymentsUSD > 0 &&
    (totalAmountUSD || 0) < existingPaymentsUSD + (initialPaidUSD || 0);

  const remaining = Math.max(
    0,
    Math.round(
      (totalAmount -
        Math.min(totalAmount, isMixedCurrency ? initialPaid : equivalentInitialInBillCurr) -
        existingPayments) *
        100
    ) / 100
  );
  const remainingUSD = Math.max(
    0,
    Math.round(
      ((totalAmountUSD || 0) -
        Math.min(totalAmountUSD || 0, initialPaidUSD || 0) -
        existingPaymentsUSD) *
        100
    ) / 100
  );

  const handleFooterAgencyUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setFormError('حجم ملف ورقة الوكالة يجب ألا يتجاوز 4 ميغابايت');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAgencyDocument({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: reader.result as string,
        date: new Date().toISOString().split('T')[0],
      });
      setFormError(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleTransportDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setFormError('حجم ملف وصل استلام النقل يجب ألا يتجاوز 4 ميغابايت');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setTransportDocument({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: reader.result as string,
        date: new Date().toISOString().split('T')[0],
      });
      setFormError(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddTransportTrip = () => {
    const defaultCarrier = carriers[0];
    const newTrip: BillTransportTrip = {
      id: `trip-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      carrierId: defaultCarrier?.id || '',
      carrierName: defaultCarrier?.name || '',
      destination: containerDestination || 'ميناء أم قصر ← بغداد',
      truckCount: 1,
      driverName: '',
      truckPlateNo: '',
      driverPhone: '',
      currency: 'IQD',
      carrierCost: 700000,
      customerCharge: 0,
      notes: '',
    };
    setHasTransport(true);
    setTransportTrips((prev) => [...prev, newTrip]);
  };

  const handleUpdateTrip = (tripId: string, patch: Partial<BillTransportTrip>) => {
    setTransportTrips((prev) =>
      prev.map((t) => {
        if (t.id !== tripId) return t;
        const updated = { ...t, ...patch };
        if (patch.carrierId) {
          const found = carriers.find((c) => c.id === patch.carrierId);
          if (found) updated.carrierName = found.name;
        }
        return updated;
      })
    );
  };

  const handleRemoveTrip = (tripId: string) => {
    setTransportTrips((prev) => {
      const next = prev.filter((t) => t.id !== tripId);
      if (next.length === 0) setHasTransport(false);
      return next;
    });
  };

  const handleTripFileUpload = (tripId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      handleUpdateTrip(tripId, {
        transportDocument: {
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: reader.result as string,
          date: new Date().toISOString().split('T')[0],
        },
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleQuickCarrierCreated = (created: TransportCompany) => {
    if (transportTrips.length === 0) {
      setHasTransport(true);
      setTransportTrips([
        {
          id: `trip-${Date.now()}`,
          carrierId: created.id,
          carrierName: created.name,
          destination: containerDestination || 'ميناء أم قصر ← بغداد',
          truckCount: 1,
          driverName: '',
          truckPlateNo: '',
          driverPhone: '',
          currency: 'IQD',
          carrierCost: 700000,
        },
      ]);
    } else {
      const last = transportTrips[transportTrips.length - 1];
      handleUpdateTrip(last.id, { carrierId: created.id, carrierName: created.name });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billNo || !customerId) {
      setFormError('يرجى ملء رقم البوليصة واختيار الزبون أولاً');
      setActiveTab('general');
      return;
    }

    if (totalAmount <= 0 && (!isMixedCurrency || (totalAmountUSD || 0) <= 0)) {
      setFormError('يرجى إدخال المبلغ الكلي للبوليصة في تبويب الإنفاق المالي');
      setActiveTab('financial');
      return;
    }

    if (isInitialExceeded) {
      setFormError(`الدفعة الأولى لا يجوز أن تتجاوز المبلغ الكلي للبوليصة`);
      setActiveTab('financial');
      return;
    }

    if (isInitialUSDExceeded) {
      setFormError(`الدفعة الأولى بالدولار لا يجوز أن تتجاوز إجمالي الدولار`);
      setActiveTab('financial');
      return;
    }

    if (isTotalLessThanExisting || isTotalUSDLessThanExisting) {
      setFormError(`المبلغ الكلي لا يمكن أن يكون أقل من مجموع الدفعات المسددة مسبقاً`);
      setActiveTab('financial');
      return;
    }

    if (activeRate >= 100 && onExchangeRateChange) {
      onExchangeRateChange(activeRate, true);
    }

    const validTrips = hasTransport
      ? transportTrips.filter((t) => t.carrierId && t.carrierCost > 0)
      : [];

    onSave({
      id: initialData?.id,
      billNo,
      jobNumber: jobNumber.trim() || undefined,
      freeTimeDays: freeTimeDays === '' ? undefined : Number(freeTimeDays),
      containerDestination: containerDestination.trim() || undefined,
      companyId,
      customerId,
      employeeId,
      date,
      deliveryOrderDate: deliveryOrderDate || undefined,
      clearanceDate: clearanceDate || undefined,
      exitDate: exitDate || undefined,
      containerReturnDate: containerReturnDate || undefined,
      goodsType,
      status,
      totalAmount: Number(totalAmount) || 0,
      initialPaid: isMixedCurrency
        ? Math.min(Number(totalAmount) || 0, Number(initialPaid) || 0)
        : Math.min(Number(totalAmount) || 0, Math.round(equivalentInitialInBillCurr)),
      currency: isMixedCurrency ? 'IQD' : currency,
      exchangeRate: activeRate,
      isMixedCurrency,
      totalAmountUSD: isMixedCurrency ? Number(totalAmountUSD) || 0 : undefined,
      initialPaidUSD: initialPaidUSD && initialPaidUSD > 0 ? Number(initialPaidUSD) : undefined,
      notes,
      containers,
      agencyDocument,
      hasTransport: validTrips.length > 0,
      transportTrips: validTrips,
      transportDocument: validTrips.length > 0 || transportDocument ? transportDocument : undefined,
    });
  };

  return {
    activeTab,
    setActiveTab,
    billNo,
    setBillNo,
    jobNumber,
    setJobNumber,
    freeTimeDays,
    setFreeTimeDays,
    containerDestination,
    setContainerDestination,
    companyId,
    setCompanyId,
    currency,
    setCurrency,
    localRate,
    setLocalRate,
    activeRate,
    isMixedCurrency,
    setIsMixedCurrency,
    customerId,
    setCustomerId,
    employeeId,
    setEmployeeId,
    date,
    setDate,
    deliveryOrderDate,
    setDeliveryOrderDate,
    clearanceDate,
    setClearanceDate,
    exitDate,
    setExitDate,
    containerReturnDate,
    setContainerReturnDate,
    goodsType,
    setGoodsType,
    status,
    setStatus,
    totalAmount,
    setTotalAmount,
    initialPaid,
    setInitialPaid,
    totalAmountUSD,
    setTotalAmountUSD,
    initialPaidUSD,
    setInitialPaidUSD,
    notes,
    setNotes,
    containers,
    setContainers,
    agencyDocument,
    setAgencyDocument,
    hasTransport,
    transportTrips,
    transportDocument,
    formError,
    setFormError,
    footerAgencyInputRef,
    directExpensesOnBill,
    directExpensesIQDOnBill,
    directExpensesUSDOnBill,
    hasPaidCarriersOnBill,
    carrierPaidIQDOnBill,
    carrierPaidUSDOnBill,
    milestonesCount,
    equivalentInitialInBillCurr,
    isInitialExceeded,
    isTotalLessThanExisting,
    remaining,
    remainingUSD,
    handleFooterAgencyUpload,
    handleTransportDocUpload,
    handleAddTransportTrip,
    handleUpdateTrip,
    handleRemoveTrip,
    handleTripFileUpload,
    handleQuickCarrierCreated,
    handleSubmit,
  };
}
