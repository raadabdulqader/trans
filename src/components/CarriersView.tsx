'use client';

import React, { useState, useMemo } from 'react';
import { Truck, Plus } from 'lucide-react';
import {
  TransportCompany,
  Transaction,
  TreasuryTransaction,
  TreasuryAttachment,
  AppUser,
  Customer,
} from '../types/customs';
import {
  getCarrierFinancials,
  CarrierFinancialSummary,
} from '../utils/storage';
import { getCarrierBillGroups } from '../utils/carrierCalculations';
import { CarriersMetricsCards } from './carriers/CarriersMetricsCards';
import { CarriersFilters } from './carriers/CarriersFilters';
import { CarriersTable } from './carriers/CarriersTable';
import { CarriersTripsTable } from './carriers/CarriersTripsTable';

// Re-export for backward compatibility
export type { CarrierBillBreakdownItem } from '../utils/carrierCalculations';
export { getCarrierBillGroups } from '../utils/carrierCalculations';

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

      {/* 1. Top Financial KPIs */}
      <CarriersMetricsCards
        carriersCount={carriers.length}
        totals={totals}
      />

      {/* 2. Search & Filter Toolbar */}
      <CarriersFilters
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        carrierSummariesCount={carrierSummaries.length}
      />

      {/* 3. Transport Companies & Balances Table */}
      <CarriersTable
        filteredSummaries={filteredSummaries}
        expandedCarrierIds={expandedCarrierIds}
        toggleExpandCarrier={toggleExpandCarrier}
        toggleExpandAll={toggleExpandAll}
        carrierBillGroupsMap={carrierBillGroupsMap}
        canDelete={canDelete}
        onAddCarrier={onAddCarrier}
        onEditCarrier={onEditCarrier}
        onDeleteCarrier={onDeleteCarrier}
        onPayCarrier={onPayCarrier}
        onOpenStatement={onOpenStatement}
        onViewArchive={onViewArchive}
      />

      {/* 4. All Transport Trips Across Bills Table */}
      <CarriersTripsTable
        allTrips={allTrips}
        onViewArchive={onViewArchive}
      />
    </div>
  );
};
