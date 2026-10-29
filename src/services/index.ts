/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Barril de exportación central de todos los servicios de dominio de la aplicación.
 * Proporciona acceso modular a cada dominio y una fachada unificada (apiService)
 * para máxima compatibilidad con los componentes existentes.
 */

import { authService, IAuthService } from './authService';
import { payersService, IPayersService } from './payers.service';
import { receivablesService, IReceivablesService } from './receivables.service';
import { paymentsService, IPaymentsService } from './payments.service';
import { dashboardService, IDashboardService } from './dashboard.service';
import { auditService, IAuditService } from './audit.service';
import { mockApiAdapter } from '../mocks/mock-api-adapter';
import {
  AuditLog,
  CreatePayerDto,
  CreatePaymentDto,
  CreateReceivableDto,
  DashboardSummary,
  PaginatedResponse,
  Payer,
  Payment,
  PaymentsFilterParams,
  PeriodFilter,
  Receivable,
  ReceivablesFilterParams,
  TopDebtor,
  UpdatePayerDto,
  UpdateReceivableDto,
  UserProfile,
  UserRole,
} from '../types';

export {
  authService,
  payersService,
  receivablesService,
  paymentsService,
  dashboardService,
  auditService,
};

export type {
  IAuthService,
  IPayersService,
  IReceivablesService,
  IPaymentsService,
  IDashboardService,
  IAuditService,
};

/**
 * Fachada consolidada IApiService para compatibilidad uniforme con todos los componentes
 */
export interface IUnifiedApiService {
  getMe(): Promise<UserProfile>;
  getDashboardSummary(params?: { period?: PeriodFilter; from?: string; to?: string }): Promise<DashboardSummary>;
  getTopDebtors(): Promise<TopDebtor[]>;
  getRecentPayments(limit?: number): Promise<Payment[]>;
  getPayers(params?: { search?: string; type?: string; isActive?: boolean }): Promise<Payer[]>;
  getPayerById(id: string): Promise<Payer>;
  createPayer(dto: CreatePayerDto, actor?: string, role?: UserRole): Promise<Payer>;
  updatePayer(id: string, dto: UpdatePayerDto, actor?: string, role?: UserRole): Promise<Payer>;
  getReceivables(params?: ReceivablesFilterParams): Promise<PaginatedResponse<Receivable>>;
  getReceivableById(id: string): Promise<Receivable>;
  createReceivable(dto: CreateReceivableDto, actor?: string, role?: UserRole): Promise<Receivable>;
  updateReceivable(id: string, dto: UpdateReceivableDto, actor?: string, role?: UserRole): Promise<Receivable>;
  getPayments(params?: PaymentsFilterParams): Promise<PaginatedResponse<Payment>>;
  getPaymentById(id: string): Promise<Payment>;
  createPayment(dto: CreatePaymentDto, idempotencyKey?: string, actor?: string, role?: UserRole): Promise<Payment>;
  reversePayment(id: string, reason: string, actor?: string, role?: UserRole): Promise<Payment>;
  allocatePayment(
    paymentId: string,
    allocations: { receivableId: string; amount: string }[],
    actor?: string,
    role?: UserRole
  ): Promise<Payment>;
  getAuditLogs(): Promise<AuditLog[]>;
  resetToInitialDemo(): Promise<void>;
}

export const apiService: IUnifiedApiService = {
  getMe: () => authService.getCurrentSession().then((s) => s?.user || mockApiAdapter.getMe()),
  getDashboardSummary: (params) => dashboardService.getDashboardSummary(params),
  getTopDebtors: () => dashboardService.getTopDebtors(),
  getRecentPayments: (limit) => dashboardService.getRecentPayments(limit),
  getPayers: (params) => payersService.getPayers(params),
  getPayerById: (id) => payersService.getPayerById(id),
  createPayer: (dto, actor, role) => payersService.createPayer(dto, actor, role),
  updatePayer: (id, dto, actor, role) => payersService.updatePayer(id, dto, actor, role),
  getReceivables: (params) => receivablesService.getReceivables(params),
  getReceivableById: (id) => receivablesService.getReceivableById(id),
  createReceivable: (dto, actor, role) => receivablesService.createReceivable(dto, actor, role),
  updateReceivable: (id, dto, actor, role) => receivablesService.updateReceivable(id, dto, actor, role),
  getPayments: (params) => paymentsService.getPayments(params),
  getPaymentById: (id) => paymentsService.getPaymentById(id),
  createPayment: (dto, idempotencyKey, actor, role) => paymentsService.createPayment(dto, idempotencyKey, actor, role),
  reversePayment: (id, reason, actor, role) => paymentsService.reversePayment(id, reason, actor, role),
  allocatePayment: (paymentId, allocations, actor, role) =>
    paymentsService.allocatePayment(paymentId, allocations, actor, role),
  getAuditLogs: () => auditService.getAuditLogs(),
  resetToInitialDemo: () => mockApiAdapter.resetData(),
};
