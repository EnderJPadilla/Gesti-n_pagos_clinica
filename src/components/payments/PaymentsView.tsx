/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  CreditCard,
  RotateCcw,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { apiService } from '../../services/apiClient';
import { Payment, Payer, PaymentMethod } from '../../types/api';
import {
  formatCOP,
  formatDateCO,
  formatDateTimeCO,
  getPaymentMethodLabel,
} from '../../utils/formatters';
import { TableSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';
import { CreatePaymentModal } from './CreatePaymentModal';
import { PaymentDetailModal } from './PaymentDetailModal';
import { useAuth } from '../../context/AuthContext';

interface PaymentsViewProps {
  onSelectPaymentDetail?: (paymentId: string) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({ onSelectPaymentDetail }) => {
  const { isAdmin } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [payers, setPayers] = useState<Payer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filtros
  const [search, setSearch] = useState<string>('');
  const [selectedPayerId, setSelectedPayerId] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // Paginación
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getPayments({
        search: search.trim() || undefined,
        payerId: selectedPayerId || undefined,
        paymentMethod: (selectedMethod as PaymentMethod) || undefined,
        status: (selectedStatus as any) || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
        page,
        pageSize: 10,
      });
      setPayments(res.data);
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
    fetchPayments();
  }, [search, selectedPayerId, selectedMethod, selectedStatus, fromDate, toDate, page]);

  const handleOpenDetail = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDetailModalOpen(true);
    if (onSelectPaymentDetail) onSelectPaymentDetail(payment.id);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Pagos Recibidos
          </h2>
          <p className="text-xs text-slate-500">
            Registro cronológico de recaudos, asignaciones y saldos pendientes por aplicar.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg shadow-xs transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Pago</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por referencia, pagador o nota..."
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

          {/* Medio de Pago */}
          <div>
            <select
              value={selectedMethod}
              onChange={(e) => {
                setSelectedMethod(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="">Todos los medios de pago</option>
              <option value="bank_transfer">Transferencia bancaria</option>
              <option value="deposit">Consignación</option>
              <option value="cash">Efectivo</option>
              <option value="card">Tarjeta</option>
              <option value="other">Otro medio</option>
            </select>
          </div>

          {/* Estado */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="">Todos los estados</option>
              <option value="confirmed">Confirmados (Activos)</option>
              <option value="reversed">Revertidos</option>
            </select>
          </div>
        </div>

        {/* Date Filter Row */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Fecha efectiva:
          </span>
          <div className="flex items-center gap-2">
            <label className="text-slate-400">Desde:</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(1);
              }}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-slate-400">Hasta:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(1);
              }}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800"
            />
          </div>
          {(fromDate || toDate) && (
            <button
              onClick={() => {
                setFromDate('');
                setToDate('');
                setPage(1);
              }}
              className="text-xs text-teal-700 hover:underline ml-2"
            >
              Limpiar fechas
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} cols={7} />
        ) : payments.length === 0 ? (
          <EmptyState
            title="No se encontraron pagos"
            description="No hay pagos que coincidan con los filtros seleccionados."
            actionText={isAdmin ? 'Registrar Pago' : undefined}
            onAction={isAdmin ? () => setIsCreateModalOpen(true) : undefined}
            icon={search ? 'search' : 'inbox'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-3 px-3 font-semibold">Fecha Efectiva</th>
                  <th className="py-3 px-3 font-semibold">Pagador</th>
                  <th className="py-3 px-3 font-semibold">Referencia</th>
                  <th className="py-3 px-3 font-semibold">Medio</th>
                  <th className="py-3 px-3 font-semibold text-right">Valor Recibido</th>
                  <th className="py-3 px-3 font-semibold text-right">Aplicado</th>
                  <th className="py-3 px-3 font-semibold text-right">Sin Asignar</th>
                  <th className="py-3 px-3 font-semibold text-center">Estado</th>
                  <th className="py-3 px-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {payments.map((p) => {
                  const isReversed = p.status === 'reversed';
                  const unallocVal = parseFloat(p.unallocatedAmount);

                  return (
                    <tr
                      key={p.id}
                      onClick={() => handleOpenDetail(p)}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      {/* Fecha Efectiva */}
                      <td className="py-3 px-3">
                        <div className="text-slate-900 font-medium font-sans">
                          {formatDateCO(p.receivedAt)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {p.receivedAt.includes('T') ? p.receivedAt.split('T')[1].substring(0, 5) : ''}
                        </div>
                      </td>

                      {/* Pagador */}
                      <td className="py-3 px-3 font-sans">
                        <div className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors truncate max-w-[190px]">
                          {p.payerName}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Reg: {p.createdBy}
                        </span>
                      </td>

                      {/* Referencia */}
                      <td className="py-3 px-3 text-slate-800">
                        {p.reference || <span className="text-slate-300 font-sans">Sin ref</span>}
                      </td>

                      {/* Medio */}
                      <td className="py-3 px-3 font-sans text-slate-600">
                        {getPaymentMethodLabel(p.paymentMethod)}
                      </td>

                      {/* Valor Recibido */}
                      <td className="py-3 px-3 text-right tabular-nums">
                        <span
                          className={`font-bold ${
                            isReversed ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {formatCOP(p.amount)}
                        </span>
                      </td>

                      {/* Aplicado */}
                      <td className="py-3 px-3 text-right text-emerald-800 font-medium tabular-nums">
                        {formatCOP(p.allocatedAmount)}
                      </td>

                      {/* Sin Asignar */}
                      <td className="py-3 px-3 text-right tabular-nums">
                        {unallocVal > 0 && !isReversed ? (
                          <span className="text-amber-800 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            {formatCOP(p.unallocatedAmount)}
                          </span>
                        ) : (
                          <span className="text-slate-400">$ 0</span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="py-3 px-3 text-center font-sans">
                        {isReversed ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium text-rose-800 bg-rose-50 border border-rose-200">
                            Revertido
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200">
                            Confirmado
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-3 text-right font-sans" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenDetail(p)}
                            className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
                            title="Ver detalle de aplicaciones y auditoría"
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

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <div>
            Mostrando <span className="font-semibold text-slate-900">{payments.length}</span> de{' '}
            <span className="font-semibold text-slate-900">{totalCount}</span> pagos
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreatePaymentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchPayments}
      />

      <PaymentDetailModal
        payment={selectedPayment}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onRefresh={fetchPayments}
      />
    </div>
  );
};
