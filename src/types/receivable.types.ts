/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MoneyAmount } from './api.types';
import { PayerType } from './payer.types';
import { PaymentMethod } from './payment.types';

export type PaymentStatus = 'pending' | 'partial' | 'paid';

export type ReviewStatus = 'not_reviewed' | 'in_review' | 'accepted' | 'disputed';

export interface ReceivableAllocationHistory {
  id: string;
  paymentId: string;
  paymentReference: string;
  receivedAt: string;
  amount: MoneyAmount;
  paymentMethod: PaymentMethod;
}

export interface Receivable {
  id: string;
  payerId: string;
  payerName: string;
  payerType: PayerType;
  referenceNumber: string; // Factura o cuenta (única por pagador)
  description?: string;
  issueDate: string; // YYYY-MM-DD
  dueDate?: string; // YYYY-MM-DD
  originalAmount: MoneyAmount; // Decimal string > 0
  allocatedAmount: MoneyAmount; // Decimal string
  pendingBalance: MoneyAmount; // Decimal string = originalAmount - allocatedAmount
  paymentStatus: PaymentStatus;
  reviewStatus: ReviewStatus;
  isOverdue: boolean; // Calculada: vencimiento < hoy Bogota y saldo > 0
  notes?: string;
  currency: 'COP';
  createdAt: string;
  updatedAt: string;
  allocations: ReceivableAllocationHistory[];
}

export interface CreateReceivableDto {
  payerId: string;
  referenceNumber: string;
  description?: string;
  issueDate: string;
  dueDate?: string;
  originalAmount: MoneyAmount;
  reviewStatus?: ReviewStatus;
  notes?: string;
}

export interface UpdateReceivableDto {
  description?: string;
  dueDate?: string;
  reviewStatus?: ReviewStatus;
  notes?: string;
}

export interface ReceivablesFilterParams {
  payerId?: string;
  paymentStatus?: PaymentStatus;
  reviewStatus?: ReviewStatus;
  overdue?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'balance' | 'issueDate' | 'dueDate' | 'reference';
  sortOrder?: 'asc' | 'desc';
}
