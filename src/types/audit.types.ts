/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserRole } from './user.types';

export interface AuditLog {
  id: string;
  timestamp: string; // ISO 8601
  user: string;
  userRole: UserRole;
  action: string;
  entityType: 'payer' | 'receivable' | 'payment' | 'reversal';
  entityReference: string;
  reason?: string;
  metadata?: Record<string, string | number | boolean>;
}
