/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MoneyAmount } from './api.types';

export type PaymentMethod = 'bank_transfer' | 'deposit' | 'cash' | 'card' | 'other';

export interface PaymentAllocationItem {
  receivableId: string;
  amount: MoneyAmount; // Decimal string
  receivableReference?: string;
  receivableDescription?: string;
}

export interface PaymentReversal {
  reversedAt: string;
  reversedBy: string;
  reason: string;
}

export interface Payment {
  id: string;
  payerId: string;
  payerName: string;
  receivedAt: string; // ISO 8601 con zona horaria America/Bogota
  amount: MoneyAmount; // Decimal string > 0
  allocatedAmount: MoneyAmount; // Decimal string
  unallocatedAmount: MoneyAmount; // Decimal string
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
  status: 'confirmed' | 'reversed';
  createdBy: string;
  createdAt: string;
  currency: 'COP';
  allocations: PaymentAllocationItem[];
  reversal?: PaymentReversal;
}

export interface CreatePaymentAllocationDto {
  receivableId: string;
  amount: MoneyAmount;
}

export interface CreatePaymentDto {
  payerId: string;
  receivedAt: string;
  amount: MoneyAmount;
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
  allocations?: CreatePaymentAllocationDto[];
}

export interface ReversePaymentDto {
  reason: string;
}

export interface PaymentsFilterParams {
  payerId?: string;
  from?: string;
  to?: string;
  paymentMethod?: PaymentMethod;
  status?: 'confirmed' | 'reversed';
  search?: string;
  page?: number;
  pageSize?: number;
}
