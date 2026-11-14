import { TreasuryTransaction, Receipt, CompanyId, Currency, TreasuryAttachment } from './customs';

export interface UnifiedRecord {
  id: string;
  source: 'treasury' | 'bill_payment' | 'broker_advance' | 'broker_settlement' | 'initial_deposit';
  rawTreasury?: TreasuryTransaction;
  rawReceipt?: Receipt;
  voucherNo: string;
  type: 'deposit' | 'withdrawal';
  date: string;
  partyName: string;
  category: string;
  description: string;
  amount: number;
  currency?: Currency;
  exchangeRate?: number;
  attachment?: TreasuryAttachment;
  recordedBy: string;
  relatedBillNo?: string;
  companyId?: CompanyId | 'shared';
  status?: 'active' | 'cancelled';
  cancelledAt?: string;
  cancelledBy?: string;
  cancelReason?: string;
  hasCommission?: boolean;
  commissionAmount?: number;
  commissionCurrency?: Currency;
  commissionBearer?: 'company' | 'party';
}
