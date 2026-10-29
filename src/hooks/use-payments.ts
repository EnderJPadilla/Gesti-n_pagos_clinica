/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Hook para consulta, registro, reversión y asignación de Pagos Recibidos.
 */

import { useState, useEffect, useCallback } from 'react';
import { paymentsService } from '../services/payments.service';
import {
  CreatePaymentDto,
  Payment,
  PaymentsFilterParams,
  UserRole,
} from '../types';
import { ApiClientError } from '../lib/api/api-error';

export function usePayments(initialParams: PaymentsFilterParams = {}) {
  const [params, setParams] = useState<PaymentsFilterParams>({
    page: 1,
    pageSize: 10,
    ...initialParams,
  });

  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiClientError | null>(null);

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await paymentsService.getPayments(params);
      setPayments(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      if (err instanceof ApiClientError) {
        setError(err);
      } else {
        setError(
          new ApiClientError({
            message: err?.message || 'Error al cargar los pagos.',
            code: 'SERVER_ERROR',
          })
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const updateFilters = (newFilters: Partial<PaymentsFilterParams>) => {
    setParams((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1,
    }));
  };

  const createPayment = async (
    dto: CreatePaymentDto,
    idempotencyKey?: string,
    actor?: string,
    role?: UserRole
  ) => {
    const created = await paymentsService.createPayment(dto, idempotencyKey, actor, role);
    await fetchPayments();
    return created;
  };

  const reversePayment = async (id: string, reason: string, actor?: string, role?: UserRole) => {
    const reversed = await paymentsService.reversePayment(id, reason, actor, role);
    await fetchPayments();
    return reversed;
  };

  const allocatePayment = async (
    paymentId: string,
    allocations: { receivableId: string; amount: string }[],
    actor?: string,
    role?: UserRole
  ) => {
    const allocated = await paymentsService.allocatePayment(paymentId, allocations, actor, role);
    await fetchPayments();
    return allocated;
  };

  return {
    payments,
    total,
    totalPages,
    currentPage: params.page || 1,
    pageSize: params.pageSize || 10,
    params,
    isLoading,
    error,
    updateFilters,
    refetch: fetchPayments,
    createPayment,
    reversePayment,
    allocatePayment,
  };
}
