'use client';

import React, { useState, useMemo } from 'react';
import {
  Truck,
  Plus,
  Search,
  Coins,
  FileText,
  Edit2,
  Trash2,
  Eye,
  Phone,
  MapPin,
  User,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Building2,
  Layers,
} from 'lucide-react';
import {
  TransportCompany,
  Transaction,
  TreasuryTransaction,
  TreasuryAttachment,
  AppUser,
  Customer,
  BillTransportTrip,
} from '../types/customs';
import {
  formatCurrency,
  getCarrierFinancials,
  CarrierFinancialSummary,
} from '../utils/storage';

export interface CarrierBillBreakdownItem {
  billId: string;
  billNo: string;
  billDate: string;
  goodsType: string;
  customerName: string;
  tripsCount: number;
  trucksCount: number;
  destinations: string[];
  driverNames: string[];
  truckPlateNos: string[];
  totalCostIQD: number;
  totalCostUSD: number;
  paidIQD: number;
  paidUSD: number;
  remainingIQD: number;
  remainingUSD: number;
  transportDoc?: TreasuryAttachment;
}

export function getCarrierBillGroups(
  carrierSummary: CarrierFinancialSummary,
  customers: Customer[] = []
): { bills: CarrierBillBreakdownItem[]; unallocatedPaidIQD: number; unallocatedPaidUSD: number } {
  const map = new Map<string, CarrierBillBreakdownItem>();

  carrierSummary.trips.forEach(({ trip, bill }) => {
    let item = map.get(bill.id);
    if (!item) {
      const cust = customers.find((c) => c.id === bill.customerId);
      item = {
        billId: bill.id,
        billNo: bill.billNo,
        billDate: bill.date,
        goodsType: bill.goodsType || 'بضاعة عامة',
        customerName: cust?.name || '—',
        tripsCount: 0,
        trucksCount: 0,
        destinations: [],
        driverNames: [],
        truckPlateNos: [],
        totalCostIQD: 0,
        totalCostUSD: 0,
        paidIQD: 0,
        paidUSD: 0,
        remainingIQD: 0,
        remainingUSD: 0,
        transportDoc: trip.transportDocument || bill.transportDocument,
      };
      map.set(bill.id, item);
    }

    item.tripsCount += 1;
    item.trucksCount += Math.max(1, Number(trip.truckCount) || 1);
    if (trip.destination && !item.destinations.includes(trip.destination)) {
      item.destinations.push(trip.destination);
    }
    if (trip.driverName && !item.driverNames.includes(trip.driverName)) {
      item.driverNames.push(trip.driverName);
    }
    if (trip.truckPlateNo && !item.truckPlateNos.includes(trip.truckPlateNo)) {
      item.truckPlateNos.push(trip.truckPlateNo);
    }
    if (trip.currency === 'USD') {
      item.totalCostUSD += Number(trip.carrierCost) || 0;
    } else {
      item.totalCostIQD += Number(trip.carrierCost) || 0;
    }
    if (!item.transportDoc && trip.transportDocument) {
      item.transportDoc = trip.transportDocument;
    }
  });

  // Calculate payments specifically tied to each bill
  let totalAllocatedIQD = 0;
  let totalAllocatedUSD = 0;

  carrierSummary.activePayments.forEach((pmt) => {
    if (pmt.relatedBillNo) {
      const found = Array.from(map.values()).find(
        (b) => b.billNo.trim().toLowerCase() === pmt.relatedBillNo!.trim().toLowerCase()
      );
      if (found) {
        if (pmt.currency === 'USD') {
          found.paidUSD += Number(pmt.amount) || 0;
          totalAllocatedUSD += Number(pmt.amount) || 0;
        } else {
          found.paidIQD += Number(pmt.amount) || 0;
          totalAllocatedIQD += Number(pmt.amount) || 0;
        }
      }
    }
  });

  // Calculate remaining balances per bill
  map.forEach((item) => {
    item.remainingIQD = Math.max(0, item.totalCostIQD - item.paidIQD);
    item.remainingUSD = Math.max(0, item.totalCostUSD - item.paidUSD);
  });

  const unallocatedPaidIQD = Math.max(0, carrierSummary.paidIQD - totalAllocatedIQD);
  const unallocatedPaidUSD = Math.max(0, carrierSummary.paidUSD - totalAllocatedUSD);

  return {
    bills: Array.from(map.values()),
    unallocatedPaidIQD,
    unallocatedPaidUSD,
  };
}

interface CarriersViewProps {
  carriers: TransportCompany[];
  transactions: Transaction[];
  treasury: TreasuryTransaction[];
  currentUser: AppUser;
  exchangeRate: number;
  customers?: Customer[];
  onAddCarrier: () => void;
  onEditCarrier: (carrier: TransportCompany) => void;
  onDeleteCarrier: (carrier: TransportCompany) => void;
  onPayCarrier: (carrier: TransportCompany, billNo?: string) => void;
  onOpenStatement: (carrier: TransportCompany) => void;
  onViewArchive: (attachment: TreasuryAttachment, title?: string) => void;
}

export const CarriersView: React.FC<CarriersViewProps> = ({
  carriers,
  transactions,
  treasury,
  currentUser,
  exchangeRate,
  customers = [],
  onAddCarrier,
  onEditCarrier,
  onDeleteCarrier,
  onPayCarrier,
  onOpenStatement,
  onViewArchive,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'has_debt' | 'settled'>('all');
  const [expandedCarrierIds, setExpandedCarrierIds] = useState<Record<string, boolean>>({});

  const toggleExpandCarrier = (carrierId: string) => {
    setExpandedCarrierIds((prev) => ({
      ...prev,
      [carrierId]: !prev[carrierId],
    }));
  };

  const carrierSummaries: CarrierFinancialSummary[] = useMemo(() => {
    return carriers.map((c) => getCarrierFinancials(c, transactions, treasury, exchangeRate));
  }, [carriers, transactions, treasury, exchangeRate]);

  // Pre-calculate per-carrier bill breakdowns
  const carrierBillGroupsMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getCarrierBillGroups>>();
    carrierSummaries.forEach((s) => {
      map.set(s.carrier.id, getCarrierBillGroups(s, customers));
    });
    return map;
  }, [carrierSummaries, customers]);

  const toggleExpandAll = () => {
    const allExpanded = filteredSummaries.length > 0 && filteredSummaries.every((s) => expandedCarrierIds[s.carrier.id]);
    if (allExpanded) {
      setExpandedCarrierIds({});
    } else {
      const next: Record<string, boolean> = {};
      filteredSummaries.forEach((s) => {
        next[s.carrier.id] = true;
      });
      setExpandedCarrierIds(next);
    }
  };

  // Aggregate totals across all transport companies
  const totals = useMemo(() => {
    return carrierSummaries.reduce(
      (acc, s) => {
        acc.trips += s.totalTripsCount;
        acc.trucks += s.totalTrucksCount;
        acc.costIQD += s.totalCostIQD;
        acc.costUSD += s.totalCostUSD;
        acc.paidIQD += s.paidIQD;
        acc.paidUSD += s.paidUSD;
        acc.remIQD += s.remainingIQD;
        acc.remUSD += s.remainingUSD;
        return acc;
      },
      {
        trips: 0,
        trucks: 0,
        costIQD: 0,
        costUSD: 0,
        paidIQD: 0,
        paidUSD: 0,
        remIQD: 0,
        remUSD: 0,
      }
    );
  }, [carrierSummaries]);

  const filteredSummaries = useMemo(() => {
    return carrierSummaries.filter((s) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        s.carrier.name.toLowerCase().includes(q) ||
        (s.carrier.contactPerson || '').toLowerCase().includes(q) ||
        (s.carrier.phone || '').toLowerCase().includes(q) ||
        s.trips.some(
          (t) =>
            t.bill.billNo.toLowerCase().includes(q) ||
            (t.trip.driverName || '').toLowerCase().includes(q) ||
            (t.trip.truckPlateNo || '').toLowerCase().includes(q) ||
            (t.trip.destination || '').toLowerCase().includes(q)
        );

      if (!matchesSearch) return false;

      const hasDebt = s.remainingIQD > 0 || s.remainingUSD > 0;
      if (statusFilter === 'has_debt') return hasDebt;
      if (statusFilter === 'settled') return !hasDebt;
      return true;
    });
  }, [carrierSummaries, search, statusFilter]);

  const allTrips = useMemo(() => {
    const list: {
      carrier: TransportCompany;
      bill: Transaction;
      trip: CarrierFinancialSummary['trips'][number]['trip'];
    }[] = [];
    carrierSummaries.forEach((s) => {
      s.trips.forEach(({ trip, bill }) => {
        list.push({ carrier: s.carrier, bill, trip });
      });
    });
    return list;
  }, [carrierSummaries]);

  const canDelete = currentUser.role === 'admin' || !!currentUser.permissions?.deleteRecords;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white">
              إدارة شركات النقل والنواقل البرية المستقلة
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              متابعة حسابات شركات النقل المستقلة، الشاحنات المنفذة لكل بوليصة، الدفعات المسددة من الصندوق، والأرصدة المتبقية
            </p>
          </div>
        </div>

        <button
          onClick={onAddCarrier}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة شركة نقل جديدة</span>
        </button>
      </div>

      {/* Top Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs text-slate-400 font-semibold">شركات النقل والشاحنات المنفذة</div>
          <div className="text-xl font-black text-white font-mono mt-1.5">
            {carriers.length} شركة نقل
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            {totals.trips} نقلة · {totals.trucks} شاحنة وتريلة
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs text-slate-400 font-semibold">المبلغ الكلي (إجمالي مستحقات النقل)</div>
          <div className="text-lg font-black text-amber-400 font-mono mt-1.5" dir="ltr">
            {formatCurrency(totals.costIQD, 'IQD')}
          </div>
          <div className="text-xs font-bold text-cyan-400 font-mono mt-0.5" dir="ltr">
            {totals.costUSD > 0 ? `+ ${formatCurrency(totals.costUSD, 'USD')}` : '0 دولار'}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs text-slate-400 font-semibold">الواصل (المسدد للنواقل من الصندوق)</div>
          <div className="text-lg font-black text-emerald-400 font-mono mt-1.5" dir="ltr">
            {formatCurrency(totals.paidIQD, 'IQD')}
          </div>
          <div className="text-xs font-bold text-cyan-300 font-mono mt-0.5" dir="ltr">
            {totals.paidUSD > 0 ? `+ ${formatCurrency(totals.paidUSD, 'USD')}` : '0 دولار'}
          </div>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4">
          <div className="text-xs text-amber-300 font-bold">المتبقي بذمتنا لشركات النقل</div>
          <div className="text-lg font-black text-rose-400 font-mono mt-1.5" dir="ltr">
            {formatCurrency(totals.remIQD, 'IQD')}
          </div>
          <div className="text-xs font-bold text-amber-400 font-mono mt-0.5" dir="ltr">
            {totals.remUSD > 0 ? `+ ${formatCurrency(totals.remUSD, 'USD')}` : 'لا يوجد متبقي بالدولار'}
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث باسم شركة النقل، اسم السائق، رقم السيارة، رقم البوليصة، أو الوجهة..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            كافة الشركات ({carrierSummaries.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('has_debt')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              statusFilter === 'has_debt'
                ? 'bg-rose-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            بذمتنا لها رصيد متبقي
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('settled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              statusFilter === 'settled'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            مصفاة بالكامل
          </button>
        </div>
      </div>

      {/* Table 1: Independent Transport Companies & Balances */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white">
              سجل شركات النقل، البوالص المسؤولة عليها، وكشوفات الحساب ({filteredSummaries.length})
            </h2>
          </div>

          {filteredSummaries.length > 0 && (
            <button
              type="button"
              onClick={toggleExpandAll}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>
                {filteredSummaries.every((s) => expandedCarrierIds[s.carrier.id])
                  ? 'طي كافة تفاصيل البوالص'
                  : 'توسيع تفاصيل البوالص لكافة الشركات'}
              </span>
            </button>
          )}
        </div>

        {filteredSummaries.length === 0 ? (
          <div className="p-10 text-center text-slate-400 space-y-3">
            <p className="text-sm font-semibold">لا توجد شركات نقل مطابقة للبحث الحالي.</p>
            <button
              onClick={onAddCarrier}
              className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold"
            >
              + إضافة شركة نقل جديدة
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="py-3 px-4">شركة النقل والمسؤول</th>
                  <th className="py-3 px-4">الهاتف والعنوان</th>
                  <th className="py-3 px-4">البوالص المسؤولة عليها</th>
                  <th className="py-3 px-4 text-center">النقلات / الشاحنات</th>
                  <th className="py-3 px-4">المبلغ الكلي</th>
                  <th className="py-3 px-4">الواصل (المسدد)</th>
                  <th className="py-3 px-4">المتبقي بذمتنا</th>
                  <th className="py-3 px-4 text-center">إجراءات المحاسبة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredSummaries.map((s) => {
                  const hasDebt = s.remainingIQD > 0 || s.remainingUSD > 0;
                  const { bills, unallocatedPaidIQD, unallocatedPaidUSD } =
                    carrierBillGroupsMap.get(s.carrier.id) || {
                      bills: [],
                      unallocatedPaidIQD: 0,
                      unallocatedPaidUSD: 0,
                    };
                  const isExpanded = !!expandedCarrierIds[s.carrier.id];

                  return (
                    <React.Fragment key={s.carrier.id}>
                      <tr className="hover:bg-slate-800/40 transition">
                        {/* 1. شركة النقل والمسؤول */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="font-bold text-white text-sm">{s.carrier.name}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <User className="w-3 h-3 text-amber-400" />
                            <span>{s.carrier.contactPerson || 'لم يحدد اسم المسؤول'}</span>
                          </div>
                        </td>

                        {/* 2. الهاتف والعنوان */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="font-mono text-slate-200 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-cyan-400" />
                            <span dir="ltr">{s.carrier.phone || '—'}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span>{s.carrier.address || '—'}</span>
                          </div>
                        </td>

                        {/* 3. البوالص المسؤولة عليها مع زر التوسيع */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="flex flex-col gap-1.5">
                            <button
                              type="button"
                              onClick={() => toggleExpandCarrier(s.carrier.id)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition w-fit ${
                                isExpanded
                                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                                  : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30'
                              }`}
                              title="عرض تفاصيل البوالص والشاحنات والمبالغ لكل بوليصة"
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              <span>
                                {bills.length} {bills.length === 1 ? 'بوليصة' : 'بوالص'}
                              </span>
                              <span className="text-[10px] opacity-80 font-normal">
                                ({isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'})
                              </span>
                            </button>

                            {bills.length > 0 ? (
                              <div className="flex flex-wrap gap-1 max-w-[220px]">
                                {bills.map((b) => {
                                  const hasBillDebt = b.remainingIQD > 0 || b.remainingUSD > 0;
                                  return (
                                    <span
                                      key={b.billId}
                                      onClick={() => toggleExpandCarrier(s.carrier.id)}
                                      className={`cursor-pointer px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border transition ${
                                        hasBillDebt
                                          ? 'bg-amber-950/40 text-amber-300 border-amber-700/50 hover:border-amber-400'
                                          : 'bg-emerald-950/40 text-emerald-300 border-emerald-700/50 hover:border-emerald-400'
                                      }`}
                                      title={`بوليصة ${b.billNo} - ${hasBillDebt ? 'عليها متبقي' : 'خالصة بالكامل'}`}
                                    >
                                      {b.billNo}
                                    </span>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-slate-500 text-[10px]">لا توجد بوالص مسندة</span>
                            )}
                          </div>
                        </td>

                        {/* 4. النقلات والشاحنات */}
                        <td className="py-3.5 px-4 text-center font-mono align-top">
                          <div className="font-bold text-amber-300">
                            {s.totalTripsCount} نقلة ({s.totalTrucksCount} شاحنة)
                          </div>
                          <div className="text-[10px] text-slate-400 font-sans">
                            على {bills.length} بوليصة
                          </div>
                        </td>

                        {/* 5. المبلغ الكلي */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-200 align-top" dir="ltr">
                          <div>{formatCurrency(s.totalCostIQD, 'IQD')}</div>
                          {s.totalCostUSD > 0 && (
                            <div className="text-cyan-400 text-[11px]">
                              + {formatCurrency(s.totalCostUSD, 'USD')}
                            </div>
                          )}
                        </td>

                        {/* 6. الواصل (المسدد) */}
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 align-top" dir="ltr">
                          <div>{formatCurrency(s.paidIQD, 'IQD')}</div>
                          {s.paidUSD > 0 && (
                            <div className="text-cyan-300 text-[11px]">
                              + {formatCurrency(s.paidUSD, 'USD')}
                            </div>
                          )}
                        </td>

                        {/* 7. المتبقي بذمتنا */}
                        <td className="py-3.5 px-4 font-mono align-top" dir="ltr">
                          {hasDebt ? (
                            <div className="space-y-0.5">
                              {s.remainingIQD > 0 && (
                                <div className="font-black text-rose-400 text-sm">
                                  {formatCurrency(s.remainingIQD, 'IQD')}
                                </div>
                              )}
                              {s.remainingUSD > 0 && (
                                <div className="font-black text-amber-400 text-xs">
                                  {formatCurrency(s.remainingUSD, 'USD')}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-sans font-bold text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>خالص (0)</span>
                            </span>
                          )}
                        </td>

                        {/* 8. إجراءات المحاسبة */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onPayCarrier(s.carrier)}
                              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-xs whitespace-nowrap"
                              title="تسديد دفعة لشركة النقل من الصندوق"
                            >
                              <Coins className="w-3.5 h-3.5" />
                              <span>تسديد دفعة</span>
                            </button>

                            <button
                              onClick={() => onOpenStatement(s.carrier)}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-bold text-[11px] flex items-center gap-1 whitespace-nowrap"
                              title="فتح كشف الحساب التفصيلي والطباعة"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>كشف الحساب</span>
                            </button>

                            <button
                              onClick={() => onEditCarrier(s.carrier)}
                              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                              title="تعديل بيانات شركة النقل"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {canDelete && (
                              <button
                                onClick={() => onDeleteCarrier(s.carrier)}
                                className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                                title="حذف شركة النقل"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Accordion Row: كشف تفصيلي بالبوالص المسؤولة عليها شركة النقل */}
                      {isExpanded && (
                        <tr className="bg-slate-950/90 border-b-2 border-amber-500/30">
                          <td colSpan={8} className="p-4 sm:p-5">
                            <div className="space-y-3.5">
                              {/* Sub-table Header */}
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                                    <FileText className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                                      <span>كشف البوالص المسؤولة عنها شركة "{s.carrier.name}":</span>
                                      <span className="text-amber-400 font-mono text-xs">
                                        ({bills.length} بوليصة · {s.totalTripsCount} نقلة · {s.totalTrucksCount} شاحنة)
                                      </span>
                                    </h3>
                                    <p className="text-[11px] text-slate-400">
                                      تفصيل المبلغ الكلي (أجرة النقل)، الواصل (المسدد من الصندوق)، والمتبقي بذمتنا لكل بوليصة مسندة
                                    </p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => onPayCarrier(s.carrier)}
                                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm"
                                >
                                  <Coins className="w-3.5 h-3.5" />
                                  <span>تسديد دفعة عامة للشركة</span>
                                </button>
                              </div>

                              {/* Bills Table for this carrier */}
                              {bills.length === 0 ? (
                                <div className="p-6 text-center text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
                                  لا توجد أي بوالص أو نقلات مسندة لهذه الشركة بعد. يمكنك إضافة نقلات وتعيين شركة النقل من داخل نافذة البوليصة.
                                </div>
                              ) : (
                                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 shadow-inner">
                                  <table className="w-full text-right text-xs border-collapse">
                                    <thead>
                                      <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                                        <th className="py-2.5 px-3">رقم البوليصة وتاريخها</th>
                                        <th className="py-2.5 px-3">الزبون ونوع البضاعة</th>
                                        <th className="py-2.5 px-3">تفاصيل النقل والشاحنات</th>
                                        <th className="py-2.5 px-3">المبلغ الكلي (أجرة النقل)</th>
                                        <th className="py-2.5 px-3">الواصل (المسدد)</th>
                                        <th className="py-2.5 px-3">المتبقي بذمتنا</th>
                                        <th className="py-2.5 px-3 text-center">إجراءات السداد والوثائق</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60 font-sans">
                                      {bills.map((b) => {
                                        const hasBillDebt = b.remainingIQD > 0 || b.remainingUSD > 0;
                                        return (
                                          <tr key={b.billId} className="hover:bg-slate-800/40 transition">
                                            {/* 1. رقم وتاريخ البوليصة */}
                                            <td className="py-2.5 px-3">
                                              <div className="font-mono font-bold text-emerald-400 text-xs flex items-center gap-1">
                                                <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                                <span>{b.billNo}</span>
                                              </div>
                                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                {b.billDate || '—'}
                                              </div>
                                            </td>

                                            {/* 2. الزبون والبضاعة */}
                                            <td className="py-2.5 px-3">
                                              <div className="font-bold text-slate-100 flex items-center gap-1">
                                                <Building2 className="w-3 h-3 text-cyan-400 shrink-0" />
                                                <span className="truncate max-w-[150px]">{b.customerName}</span>
                                              </div>
                                              <div className="text-[10px] text-slate-400 truncate max-w-[160px] mt-0.5">
                                                نوع البضاعة: {b.goodsType}
                                              </div>
                                            </td>

                                            {/* 3. الشاحنات والوجهة والسائق */}
                                            <td className="py-2.5 px-3">
                                              <div className="text-amber-300 font-bold font-mono">
                                                {b.trucksCount} شاحنة ({b.tripsCount} نقلة)
                                              </div>
                                              <div className="text-[10px] text-slate-300 mt-0.5">
                                                {b.destinations.join(' · ') || '—'}
                                              </div>
                                              {b.driverNames.length > 0 && (
                                                <div className="text-[10px] text-cyan-300 font-mono mt-0.5 truncate max-w-[180px]">
                                                  السائق: {b.driverNames.join(' ، ')}
                                                  {b.truckPlateNos.length > 0 ? ` (${b.truckPlateNos.join(' ، ')})` : ''}
                                                </div>
                                              )}
                                            </td>

                                            {/* 4. المبلغ الكلي */}
                                            <td className="py-2.5 px-3 font-mono font-bold text-white whitespace-nowrap" dir="ltr">
                                              <div>{formatCurrency(b.totalCostIQD, 'IQD')}</div>
                                              {b.totalCostUSD > 0 && (
                                                <div className="text-cyan-400 text-[11px]">
                                                  + {formatCurrency(b.totalCostUSD, 'USD')}
                                                </div>
                                              )}
                                            </td>

                                            {/* 5. الواصل */}
                                            <td className="py-2.5 px-3 font-mono font-bold text-emerald-400 whitespace-nowrap" dir="ltr">
                                              <div>{formatCurrency(b.paidIQD, 'IQD')}</div>
                                              {b.paidUSD > 0 && (
                                                <div className="text-cyan-300 text-[11px]">
                                                  + {formatCurrency(b.paidUSD, 'USD')}
                                                </div>
                                              )}
                                            </td>

                                            {/* 6. المتبقي */}
                                            <td className="py-2.5 px-3 font-mono whitespace-nowrap" dir="ltr">
                                              {hasBillDebt ? (
                                                <div className="space-y-0.5">
                                                  {b.remainingIQD > 0 && (
                                                    <div className="font-black text-rose-400 text-xs">
                                                      {formatCurrency(b.remainingIQD, 'IQD')}
                                                    </div>
                                                  )}
                                                  {b.remainingUSD > 0 && (
                                                    <div className="font-black text-amber-400 text-[11px]">
                                                      {formatCurrency(b.remainingUSD, 'USD')}
                                                    </div>
                                                  )}
                                                </div>
                                              ) : (
                                                <span className="inline-flex items-center gap-1 text-emerald-400 font-sans font-bold text-[11px]">
                                                  <CheckCircle2 className="w-3 h-3" />
                                                  <span>خالص (0)</span>
                                                </span>
                                              )}
                                            </td>

                                            {/* 7. إجراءات */}
                                            <td className="py-2.5 px-3 text-center">
                                              <div className="flex items-center justify-center gap-1.5">
                                                {hasBillDebt ? (
                                                  <button
                                                    type="button"
                                                    onClick={() => onPayCarrier(s.carrier, b.billNo)}
                                                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] flex items-center gap-1 shadow-xs whitespace-nowrap"
                                                    title={`تسديد دفعة مخصصة للبوليصة ${b.billNo}`}
                                                  >
                                                    <Coins className="w-3 h-3" />
                                                    <span>تسديد لهذه البوليصة</span>
                                                  </button>
                                                ) : (
                                                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                                                    مسددة بالكامل
                                                  </span>
                                                )}

                                                {b.transportDoc && onViewArchive && (
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      onViewArchive(
                                                        b.transportDoc!,
                                                        `وصل نقل بوليصة ${b.billNo} (${s.carrier.name})`
                                                      )
                                                    }
                                                    className="p-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30"
                                                    title="معاينة وصل استلام النقل"
                                                  >
                                                    <Eye className="w-3 h-3" />
                                                  </button>
                                                )}
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )}

                              {/* Unallocated Payments Notice if any */}
                              {(unallocatedPaidIQD > 0 || unallocatedPaidUSD > 0) && (
                                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 text-xs flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Coins className="w-4 h-4 text-cyan-400 shrink-0" />
                                    <span>
                                      <strong>تنبيه محاسبي:</strong> توجد دفعات عامة مسددة لشركة النقل على الحساب (غير مخصصة لبوليصة معينة):
                                    </span>
                                  </div>
                                  <div className="font-mono font-bold text-cyan-300" dir="ltr">
                                    {unallocatedPaidIQD > 0 && formatCurrency(unallocatedPaidIQD, 'IQD')}
                                    {unallocatedPaidUSD > 0 && ` + ${formatCurrency(unallocatedPaidUSD, 'USD')}`}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Table 2: All Transport Trips Across Bills */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>سجل النقلات والشاحنات المربوطة بالبوالص ({allTrips.length})</span>
          </h2>
        </div>

        {allTrips.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            لا توجد نقلات مضافة داخل البوالص حالياً. يمكنك إضافة نقلات وشاحنات من داخل نافذة إضافة أو تعديل البوليصة.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="py-3 px-4">رقم البوليصة</th>
                  <th className="py-3 px-4">شركة النقل</th>
                  <th className="py-3 px-4">وجهة النقل</th>
                  <th className="py-3 px-4 text-center">عدد الشاحنات</th>
                  <th className="py-3 px-4">اسم السائق ورقم السيارة</th>
                  <th className="py-3 px-4">أجرة شركة النقل</th>
                  <th className="py-3 px-4 text-center">ورقة / وصل النقل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {allTrips.map(({ carrier, bill, trip }) => {
                  const doc = trip.transportDocument || bill.transportDocument;
                  return (
                    <tr key={trip.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                        {bill.billNo}
                        <div className="text-[10px] font-sans font-normal text-slate-400">
                          {bill.date}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-white">{carrier.name}</td>
                      <td className="py-3 px-4 text-slate-200 font-semibold">
                        {trip.destination || '—'}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-amber-300">
                        {trip.truckCount || 1} شاحنة
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{trip.driverName || '—'}</div>
                        <div className="text-[11px] font-mono text-cyan-300">
                          {trip.truckPlateNo || '—'} {trip.driverPhone ? `· ${trip.driverPhone}` : ''}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-400 whitespace-nowrap" dir="ltr">
                        {formatCurrency(trip.carrierCost, trip.currency)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {doc ? (
                          <button
                            onClick={() =>
                              onViewArchive(doc, `وصل استلام نقل بوليصة ${bill.billNo}`)
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>معاينة وصل النقل</span>
                          </button>
                        ) : (
                          <span className="text-slate-500 text-[11px]">غير مرفق</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
