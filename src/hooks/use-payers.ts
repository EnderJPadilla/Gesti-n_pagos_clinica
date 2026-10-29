/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Hook para consulta y gestión de Pagadores (EPS, Aseguradoras, Particulares).
 */

import { useState, useEffect, useCallback } from 'react';
import { payersService } from '../services/payers.service';
import { CreatePayerDto, Payer, UpdatePayerDto, UserRole } from '../types';
import { ApiClientError } from '../lib/api/api-error';

export interface UsePayersOptions {
  search?: string;
  type?: string;
  isActive?: boolean;
  autoFetch?: boolean;
}

export function usePayers(options: UsePayersOptions = {}) {
  const [payers, setPayers] = useState<Payer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiClientError | null>(null);

  const fetchPayers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await payersService.getPayers({
        search: options.search?.trim() || undefined,
        type: options.type || undefined,
        isActive: options.isActive,
      });
      setPayers(data);
    } catch (err: any) {
      if (err instanceof ApiClientError) {
        setError(err);
      } else {
        setError(
          new ApiClientError({
            message: err?.message || 'Error al cargar los pagadores.',
            code: 'SERVER_ERROR',
          })
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [options.search, options.type, options.isActive]);

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchPayers();
    }
  }, [fetchPayers, options.autoFetch]);

  const createPayer = async (dto: CreatePayerDto, actor?: string, role?: UserRole) => {
    const created = await payersService.createPayer(dto, actor, role);
    await fetchPayers();
    return created;
  };

  const updatePayer = async (id: string, dto: UpdatePayerDto, actor?: string, role?: UserRole) => {
    const updated = await payersService.updatePayer(id, dto, actor, role);
    await fetchPayers();
    return updated;
  };

  return {
    payers,
    isLoading,
    error,
    refetch: fetchPayers,
    createPayer,
    updatePayer,
  };
}
