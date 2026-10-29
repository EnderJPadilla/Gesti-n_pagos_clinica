/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Hook para gestión del estado y consumo del Dashboard Gerencial.
 */

import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboard.service';
import { DashboardSummary, Payment, PeriodFilter, TopDebtor } from '../types';
import { ApiClientError } from '../lib/api/api-error';

export interface UseDashboardOptions {
  initialPeriod?: PeriodFilter;
  from?: string;
  to?: string;
  recentLimit?: number;
}

export function useDashboard(options: UseDashboardOptions = {}) {
  const [period, setPeriod] = useState<PeriodFilter>(options.initialPeriod || 'month');
  const [customFrom, setCustomFrom] = useState<string>(options.from || '2026-10-01');
  const [customTo, setCustomTo] = useState<string>(options.to || '2026-10-31');

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [topDebtors, setTopDebtors] = useState<TopDebtor[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiClientError | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sumRes, debtorsRes, paymentsRes] = await Promise.all([
        dashboardService.getDashboardSummary({
          period,
          from: period === 'custom' ? customFrom : undefined,
          to: period === 'custom' ? customTo : undefined,
        }),
        dashboardService.getTopDebtors(),
        dashboardService.getRecentPayments(options.recentLimit || 6),
      ]);
      setSummary(sumRes);
      setTopDebtors(debtorsRes);
      setRecentPayments(paymentsRes);
    } catch (err: any) {
      if (err instanceof ApiClientError) {
        setError(err);
      } else {
        setError(
          new ApiClientError({
            message: err?.message || 'Error al cargar los datos del dashboard.',
            code: 'SERVER_ERROR',
          })
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [period, customFrom, customTo, options.recentLimit]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    period,
    setPeriod,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
    summary,
    topDebtors,
    recentPayments,
    isLoading,
    error,
    refetch: fetchDashboardData,
  };
}
