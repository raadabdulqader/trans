import { Customer, TreasuryAttachment } from '../types/customs';
import { CarrierFinancialSummary } from './storage';

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
