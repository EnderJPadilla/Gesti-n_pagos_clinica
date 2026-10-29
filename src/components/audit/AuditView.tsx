/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { History, Shield, Filter, Search, Calendar } from 'lucide-react';
import { AuditLog } from '../../types/api';
import { apiService } from '../../services/apiClient';
import { formatDateTimeCO } from '../../utils/formatters';
import { TableSkeleton } from '../common/LoadingSkeleton';
import { EmptyState, AccessDeniedView } from '../common/EmptyState';
import { useAuth } from '../../context/AuthContext';

export const AuditView: React.FC = () => {
  const { isAdmin, switchRole } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [entityFilter, setEntityFilter] = useState<string>('');

  useEffect(() => {
    if (isAdmin) {
      setIsLoading(true);
      apiService
        .getAuditLogs()
        .then(setLogs)
        .finally(() => setIsLoading(false));
    }
  }, [isAdmin]);

  // Si no es admin, mostrar vista de acceso denegado (Sección 3.1 & 4)
  if (!isAdmin) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <AccessDeniedView
          title="Módulo de Auditoría Restringido"
          description="El registro de auditoría y trazabilidad solo está disponible para usuarios con rol de Administrador Financiero."
          onSwitchRole={() => switchRole('admin')}
        />
      </div>
    );
  }

  const filteredLogs = logs.filter((log) => {
    if (entityFilter && log.entityType !== entityFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.user.toLowerCase().includes(q) ||
        log.entityReference.toLowerCase().includes(q) ||
        (log.reason && log.reason.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Auditoría y Trazabilidad
          </h2>
          <p className="text-xs text-slate-500">
            Registro inmutable de todas las operaciones financieras, altas y reversiones.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-teal-800 bg-teal-50 rounded-md border border-teal-200">
          <Shield className="w-3.5 h-3.5" />
          <span>Acceso Autorizado · Solo Lectura</span>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por usuario, acción o referencia..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="">Todas las entidades</option>
              <option value="payment">Pagos</option>
              <option value="reversal">Reversiones</option>
              <option value="receivable">Cuentas por cobrar</option>
              <option value="payer">Pagadores</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : filteredLogs.length === 0 ? (
          <EmptyState
            title="No hay registros de auditoría"
            description="Las acciones de los usuarios aparecerán registradas aquí."
            icon="inbox"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-3 px-3 font-semibold">Fecha y Hora</th>
                  <th className="py-3 px-3 font-semibold">Usuario Responsable</th>
                  <th className="py-3 px-3 font-semibold">Acción</th>
                  <th className="py-3 px-3 font-semibold">Entidad / Ref.</th>
                  <th className="py-3 px-3 font-semibold">Motivo / Detalle Registrado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredLogs.map((log) => {
                  const isReversal = log.action.includes('REVERSION');
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 text-slate-800 whitespace-nowrap">
                        {formatDateTimeCO(log.timestamp)}
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <div className="font-medium text-slate-900">{log.user}</div>
                        <span className="text-[10px] text-slate-400 uppercase">
                          Rol: {log.userRole}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            isReversal
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-slate-100 text-slate-800 border-slate-200'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-900 font-semibold">
                        <span className="text-slate-400 font-sans text-[11px] mr-1 uppercase">
                          {log.entityType}:
                        </span>
                        {log.entityReference}
                      </td>
                      <td className="py-3 px-3 font-sans text-slate-600 max-w-sm">
                        {log.reason || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
