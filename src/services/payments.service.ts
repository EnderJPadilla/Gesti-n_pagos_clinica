/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Servicio del dominio de Pagos Recibidos y Asignaciones.
 * Separa la implementación HTTP REST de la simulación en memoria.
 */

import { apiConfig } from '../config/api.config';
import { httpClient } from '../lib/api/api-client';
import { mockApiAdapter } from '../mocks/mock-api-adapter';
import {
  CreatePaymentDto,
  PaginatedResponse,
  Payment,
  PaymentsFilterParams,
  UserRole,
} from '../types';

export interface IPaymentsService {
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
}

export class HttpPaymentsService implements IPaymentsService {
  getPayments(params?: PaymentsFilterParams): Promise<PaginatedResponse<Payment>> {
    return httpClient.get<PaginatedResponse<Payment>>(apiConfig.endpoints.payments.list, params as any);
  }

  getPaymentById(id: string): Promise<Payment> {
    return httpClient.get<Payment>(apiConfig.endpoints.payments.detail(id));
  }

  createPayment(dto: CreatePaymentDto, idempotencyKey?: string): Promise<Payment> {
    return httpClient.post<Payment>(apiConfig.endpoints.payments.create, dto, {
      idempotencyKey,
    });
  }

  reversePayment(id: string, reason: string): Promise<Payment> {
    return httpClient.post<Payment>(apiConfig.endpoints.payments.reversals(id), { reason });
  }

  allocatePayment(
    paymentId: string,
    allocations: { receivableId: string; amount: string }[]
  ): Promise<Payment> {
    return httpClient.post<Payment>(apiConfig.endpoints.payments.allocations(paymentId), {
      allocations,
    });
  }
}

export class MockPaymentsService implements IPaymentsService {
  getPayments(params?: PaymentsFilterParams): Promise<PaginatedResponse<Payment>> {
    return mockApiAdapter.getPayments(params);
  }

  getPaymentById(id: string): Promise<Payment> {
    return mockApiAdapter.getPaymentById(id);
  }

  createPayment(dto: CreatePaymentDto, idempotencyKey?: string, actor?: string, role?: UserRole): Promise<Payment> {
    return mockApiAdapter.createPayment(dto, idempotencyKey, actor, role);
  }

  reversePayment(id: string, reason: string, actor?: string, role?: UserRole): Promise<Payment> {
    return mockApiAdapter.reversePayment(id, reason, actor, role);
  }

  allocatePayment(
    paymentId: string,
    allocations: { receivableId: string; amount: string }[],
    actor?: string,
    role?: UserRole
  ): Promise<Payment> {
    return mockApiAdapter.allocatePayment(paymentId, allocations, actor, role);
  }
}

export const paymentsService: IPaymentsService = apiConfig.isMockMode
  ? new MockPaymentsService()
  : new HttpPaymentsService();
