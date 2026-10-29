/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  Receipt,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Building2,
  Calendar,
  CheckCircle2,
  CreditCard,
} from 'lucide-react';
import { apiService } from '../../services/apiClient';
import {
  Receivable,
  Payer,
  PaymentStatus,
  ReviewStatus,
} from '../../types/api';
import {
  formatCOP,
  formatDateCO,
  getPaymentStatusInfo,
  getReviewStatusInfo,
} from '../../utils/formatters';
import { TableSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';
import { CreateReceivableModal } from './CreateReceivableModal';
import { ReceivableDetailModal } from './ReceivableDetailModal';
import { useAuth } from '../../context/AuthContext';

interface ReceivablesViewProps {
  onOpenNewPaymentWithReceivable?: (receivable: Receivable) => void;
}

export const ReceivablesView: React.FC<ReceivablesViewProps> = ({
  onOpenNewPaymentWithReceivable,
}) => {
  const { isAdmin } = useAuth();
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [payers, setPayers] = useState<Payer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filtros
  const [search, setSearch] = useState<string>('');
  const [selectedPayerId, setSelectedPayerId] = useState<string>('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('');
  const [selectedReviewStatus, setSelectedReviewStatus] = useState<string>('');
  const [onlyOverdue, setOnlyOverdue] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'balance' | 'issueDate' | 'dueDate' | 'reference'>('issueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Paginación
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  const fetchReceivables = async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getReceivables({
        search: search.trim() || undefined,
        payerId: selectedPayerId || undefined,
        paymentStatus: (selectedPaymentStatus as PaymentStatus) || undefined,
        reviewStatus: (selectedReviewStatus as ReviewStatus) || undefined,
        overdue: onlyOverdue ? true : undefined,
        sortBy,
        sortOrder,
        page,
        pageSize: 10,
      });
      setReceivables(res.data);
      setTotalPages(res.totalPages);
      setTotalCount(res.total);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    apiService.getPayers().then(setPayers);
  }, []);

  useEffect(() => {
    fetchReceivables();
  }, [search, selectedPayerId, selectedPaymentStatus, selectedReviewStatus, onlyOverdue, sortBy, sortOrder, page]);

  const handleOpenDetail = (rec: Receivable) => {
    setSelectedReceivable(rec);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Cuentas por Cobrar
          </h2>
          <p className="text-xs text-slate-500">
            Control de facturación emitida a EPS, aseguradoras y particulares.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg shadow-xs transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nueva Cuenta</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por referencia o pagador..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          {/* Pagador */}
          <div>
            <select
              value={selectedPayerId}
              onChange={(e) => {
                setSelectedPayerId(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="">Todos los pagadores</option>
              {payers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Estado de Pago */}
          <div>
            <select
              value={selectedPaymentStatus}
              onChange={(e) => {
                setSelectedPaymentStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="">Todos los estados de pago</option>
              <option value="pending">Pendiente (Sin abonos)</option>
              <option value="partial">Abono parcial</option>
              <option value="paid">Pagada totalmente</option>
            </select>
          </div>

          {/* Estado de Revisión */}
          <div>
            <select
              value={selectedReviewStatus}
              onChange={(e) => {
                setSelectedReviewStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="">Todos los estados de revisión</option>
              <option value="not_reviewed">No revisada</option>
              <option value="in_review">En revisión</option>
              <option value="accepted">Aceptada</option>
              <option value="disputed">Con glosa / Devolución</option>
            </select>
          </div>
        </div>

        {/* Second row: Overdue switch & Sorting */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyOverdue}
                onChange={(e) => {
                  setOnlyOverdue(e.target.checked);
                  setPage(1);
                }}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
              />
              <span className="font-medium text-slate-700 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Solo cartera vencida
              </span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800"
            >
              <option value="issueDate">Fecha de Emisión</option>
              <option value="dueDate">Fecha de Vencimiento</option>
              <option value="balance">Saldo Pendiente</option>
              <option value="reference">Referencia</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800 hover:bg-slate-100"
            >
              {sortOrder === 'desc' ? 'Descendente' : 'Ascendente'}
            </button>
          </div>
        </div>
      </div>

      {/* Receivables Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : receivables.length === 0 ? (
          <EmptyState
            title="No se encontraron cuentas por cobrar"
            description="Ajuste los criterios de búsqueda o registre una nueva cuenta."
            actionText={isAdmin ? 'Registrar Primera Cuenta' : undefined}
            onAction={isAdmin ? () => setIsCreateModalOpen(true) : undefined}
            icon={search ? 'search' : 'inbox'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-3 px-3 font-semibold">Referencia</th>
                  <th className="py-3 px-3 font-semibold">Pagador Responsable</th>
                  <th className="py-3 px-3 font-semibold">Emisión / Venc.</th>
                  <th className="py-3 px-3 font-semibold text-right">Valor Original</th>
                  <th className="py-3 px-3 font-semibold text-right">Aplicado</th>
                  <th className="py-3 px-3 font-semibold text-right">Saldo Pendiente</th>
                  <th className="py-3 px-3 font-semibold text-center">Estado Pago</th>
                  <th className="py-3 px-3 font-semibold text-center">Revisión</th>
                  <th className="py-3 px-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {receivables.map((rec) => {
                  const payStatus = getPaymentStatusInfo(rec.paymentStatus);
                  const revStatus = getReviewStatusInfo(rec.reviewStatus);

                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => handleOpenDetail(rec)}
                    >
                      {/* Referencia */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
                          {rec.referenceNumber}
                        </div>
                        {rec.description && (
                          <div className="text-[11px] text-slate-400 font-sans truncate max-w-[180px]">
                            {rec.description}
                          </div>
                        )}
                      </td>

                      {/* Pagador */}
                      <td className="py-3 px-3 font-sans">
                        <div className="font-medium text-slate-900 truncate max-w-[200px]">
                          {rec.payerName}
                        </div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wide">
                          {rec.payerType}
                        </span>
                      </td>

                      {/* Emisión / Vencimiento */}
                      <td className="py-3 px-3">
                        <div className="text-slate-800">{formatDateCO(rec.issueDate)}</div>
                        <div className="text-[11px]">
                          {rec.dueDate ? (
                            <span className={rec.isOverdue ? 'text-rose-700 font-semibold' : 'text-slate-400'}>
                              Vence: {formatDateCO(rec.dueDate)}
                            </span>
                          ) : (
                            <span className="text-slate-300">Sin vencimiento</span>
                          )}
                        </div>
                      </td>

                      {/* Valor Original */}
                      <td className="py-3 px-3 text-right text-slate-700 tabular-nums">
                        {formatCOP(rec.originalAmount)}
                      </td>

                      {/* Valor Aplicado */}
                      <td className="py-3 px-3 text-right text-emerald-800 font-medium tabular-nums">
                        {formatCOP(rec.allocatedAmount)}
                      </td>

                      {/* Saldo Pendiente */}
                      <td className="py-3 px-3 text-right font-bold text-slate-900 tabular-nums">
                        {formatCOP(rec.pendingBalance)}
                      </td>

                      {/* Estado Pago */}
                      <td className="py-3 px-3 text-center font-sans">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${payStatus.textColor} ${payStatus.bgColor} ${payStatus.borderColor}`}
                        >
                          {payStatus.label}
                        </span>
                      </td>

                      {/* Estado Revisión */}
                      <td className="py-3 px-3 text-center font-sans">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${revStatus.textColor} ${revStatus.bgColor} ${revStatus.borderColor}`}
                        >
                          {revStatus.label}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-3 text-right font-sans" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenDetail(rec)}
                            className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <div>
            Mostrando <span className="font-semibold text-slate-900">{receivables.length}</span> de{' '}
            <span className="font-semibold text-slate-900">{totalCount}</span> cuentas
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateReceivableModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchReceivables}
      />

      <ReceivableDetailModal
        receivable={selectedReceivable}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onUpdated={fetchReceivables}
      />
    </div>
  );
};
