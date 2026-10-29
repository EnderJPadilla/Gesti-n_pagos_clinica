/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Hook para consulta de la bitácora de auditoría.
 */

import { useState, useEffect, useCallback } from 'react';
import { auditService } from '../services/audit.service';
import { AuditLog } from '../types';
import { ApiClientError } from '../lib/api/api-error';

export function useAudit(enabled = true) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiClientError | null>(null);

  const fetchLogs = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await auditService.getAuditLogs();
      setLogs(data);
    } catch (err: any) {
      if (err instanceof ApiClientError) {
        setError(err);
      } else {
        setError(
          new ApiClientError({
            message: err?.message || 'Error al cargar los registros de auditoría.',
            code: 'SERVER_ERROR',
          })
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    isLoading,
    error,
    refetch: fetchLogs,
  };
}
