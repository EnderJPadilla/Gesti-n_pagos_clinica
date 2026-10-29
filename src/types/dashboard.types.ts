/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MoneyAmount } from './api.types';
import { PayerType } from './payer.types';

export type PeriodFilter = 'today' | 'week' | 'month' | 'custom';

export interface DashboardSummary {
  receivedToday: MoneyAmount;
  receivedThisWeek: MoneyAmount;
  receivedThisMonth: MoneyAmount;
  receivedInPeriod: MoneyAmount;
  pendingPortfolio: MoneyAmount;
  overduePortfolio: MoneyAmount;
  openReceivablesCount: number;
  unallocatedPaymentsTotal: MoneyAmount;
  unallocatedPaymentsCount: number;
  period: PeriodFilter;
  from?: string;
  to?: string;
}

export interface TopDebtor {
  payerId: string;
  payerName: string;
  payerType: PayerType;
  pendingBalance: MoneyAmount;
  overdueBalance: MoneyAmount;
  openReceivablesCount: number;
}
