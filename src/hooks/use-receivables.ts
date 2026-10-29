/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Hook para consulta, filtrado, paginación y mutaciones de Cuentas por Cobrar.
 */

import { useState, useEffect, useCallback } from 'react';
import { receivablesService } from '../services/receivables.service';
import {
  CreateReceivableDto,
  Receivable,
  ReceivablesFilterParams,
  UpdateReceivableDto,
  UserRole,
} from '../types';
import { ApiClientError } from '../lib/api/api-error';

export function useReceivables(initialParams: ReceivablesFilterParams = {}) {
  const [params, setParams] = useState<ReceivablesFilterParams>({
    page: 1,
    pageSize: 10,
    sortBy: 'issueDate',
    sortOrder: 'desc',
    ...initialParams,
  });

  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiClientError | null>(null);

  const fetchReceivables = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await receivablesService.getReceivables(params);
      setReceivables(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      if (err instanceof ApiClientError) {
        setError(err);
      } else {
        setError(
          new ApiClientError({
            message: err?.message || 'Error al cargar las cuentas por cobrar.',
            code: 'SERVER_ERROR',
          })
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchReceivables();
  }, [fetchReceivables]);

  const updateFilters = (newFilters: Partial<ReceivablesFilterParams>) => {
    setParams((prev) => ({
      ...prev,
      ...newFilters,
      // Si cambia algún filtro que no sea la página, reiniciar a la página 1
      page: newFilters.page !== undefined ? newFilters.page : 1,
    }));
  };

  const createReceivable = async (dto: CreateReceivableDto, actor?: string, role?: UserRole) => {
    const created = await receivablesService.createReceivable(dto, actor, role);
    await fetchReceivables();
    return created;
  };

  const updateReceivable = async (id: string, dto: UpdateReceivableDto, actor?: string, role?: UserRole) => {
    const updated = await receivablesService.updateReceivable(id, dto, actor, role);
    await fetchReceivables();
    return updated;
  };

  return {
    receivables,
    total,
    totalPages,
    currentPage: params.page || 1,
    pageSize: params.pageSize || 10,
    params,
    isLoading,
    error,
    updateFilters,
    refetch: fetchReceivables,
    createReceivable,
    updateReceivable,
  };
}
