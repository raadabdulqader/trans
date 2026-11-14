'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Phone, Mail, MapPin, Building2, Search, ExternalLink } from 'lucide-react';
import { Customer, Transaction, Receipt, AppUser, CompanyId, COMPANIES } from '../types/customs';
import { formatCurrency, getBillFinancials } from '../utils/storage';

interface CustomersViewProps {
  customers: Customer[];
  transactions: Transaction[];
  receipts: Receipt[];
  currentUser: AppUser;
  searchTerm: string;
  onAddCustomer: () => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customer: Customer) => void;
  onViewCustomerTransactions: (customerId: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  transactions,
  receipts,
  currentUser,
  searchTerm,
  onAddCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onViewCustomerTransactions,
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState<'all' | CompanyId>('all');

  const activeSearch = searchTerm || localSearch;

  const filteredCustomers = customers.filter(c => {
    if (companyFilter !== 'all') {
      const cComp = c.companyId || 'both';
      if (cComp !== 'both' && cComp !== companyFilter) return false;
    }

    const q = activeSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.contact.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.regNo.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onAddCustomer}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة زبون جديد</span>
          </button>

          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition"
          >
            <option value="all">🏢 كل الشركات والزبائن</option>
            <option value="naqaa_basra">🌿 زبائن نقاء البصرة</option>
            <option value="sawt_aljanoub">⚓ زبائن صوت الجنوب</option>
          </select>
        </div>

        <div className="relative min-w-[220px]">
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="بحث باسم الشركة أو الهاتف..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950/70 text-slate-400 border-b border-slate-800 font-semibold">
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">اسم الشركة</th>
                <th className="py-3.5 px-4">رقم التسجيل</th>
                <th className="py-3.5 px-4">المسؤول</th>
                <th className="py-3.5 px-4">الهاتف</th>
                <th className="py-3.5 px-4">العنوان</th>
                <th className="py-3.5 px-4 text-center">المعاملات</th>
                <th className="py-3.5 px-4">المتبقي بذمته</th>
                <th className="py-3.5 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    لا يوجد زبائن يطابقون البحث
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer, idx) => {
                  const custTransactions = transactions.filter(t => t.customerId === customer.id);
                  let remainingIQD = 0;
                  let remainingUSD = 0;
                  custTransactions.forEach(t => {
                    if (t.status === 'cancelled') return;
                    const fin = getBillFinancials(t, receipts);
                    if (fin.currency === 'USD') {
                      remainingUSD += fin.remainingAmount;
                    } else {
                      remainingIQD += fin.remainingAmount;
                    }
                  });

                  return (
                    <tr key={customer.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span>{customer.name}</span>
                          {(() => {
                            const cComp = customer.companyId || 'both';
                            if (cComp === 'both') {
                              return (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                  كلا الشركتين
                                </span>
                              );
                            }
                            const comp = COMPANIES[cComp];
                            return (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${comp.badgeColor}`}>
                                {comp.shortName}
                              </span>
                            );
                          })()}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">{customer.regNo || '—'}</td>
                      <td className="py-3 px-4 font-medium text-slate-300">{customer.contact}</td>
                      <td className="py-3 px-4 font-mono text-slate-300" dir="ltr">{customer.phone || '—'}</td>
                      <td className="py-3 px-4 text-slate-400 max-w-[150px] truncate">{customer.address || '—'}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onViewCustomerTransactions(customer.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold transition"
                        >
                          <span>{custTransactions.length}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold" dir="ltr">
                        {remainingIQD > 0 || remainingUSD > 0 ? (
                          <div className="flex flex-col gap-0.5">
                            {remainingIQD > 0 && (
                              <span className="text-amber-400">{formatCurrency(remainingIQD, 'IQD')}</span>
                            )}
                            {remainingUSD > 0 && (
                              <span className="text-cyan-400">{formatCurrency(remainingUSD, 'USD')}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-emerald-400">0 د.ع (خالص)</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onEditCustomer(customer)}
                            title="تعديل بيانات الزبون"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteCustomer(customer)}
                            title="حذف الزبون"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
