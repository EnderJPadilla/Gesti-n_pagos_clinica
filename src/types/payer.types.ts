/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MoneyAmount } from './api.types';

export type PayerType = 'EPS' | 'Aseguradora' | 'Particular';

export type IdentificationType = 'NIT' | 'CC' | 'CE' | 'Pasaporte' | 'Otro';

export interface Payer {
  id: string;
  name: string;
  type: PayerType;
  idType?: IdentificationType;
  idNumber?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  notes?: string;
  isActive: boolean;
  pendingBalance: MoneyAmount; // Decimal string ej. "9000000.00"
  overdueBalance: MoneyAmount; // Decimal string
  openReceivablesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePayerDto {
  name: string;
  type: PayerType;
  idType?: IdentificationType;
  idNumber?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  notes?: string;
  isActive?: boolean;
}

export interface UpdatePayerDto extends Partial<CreatePayerDto> {}
