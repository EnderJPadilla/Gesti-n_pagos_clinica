/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Receipt, Clock, Calendar, CheckCircle, AlertTriangle, Building2 } from 'lucide-react';
import { Receivable, ReviewStatus } from '../../types/api';
import {
  formatCOP,
  formatDateCO,
  formatDateTimeCO,
  getPaymentMethodLabel,
  getPaymentStatusInfo,
  getReviewStatusInfo,
} from '../../utils/formatters';
import { apiService } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';

interface ReceivableDetailModalProps {
  receivable: Receivable | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export const ReceivableDetailModal: React.FC<ReceivableDetailModalProps> = ({
  receivable,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const { user, role, isAdmin } = useAuth();
  const [selectedReviewStatus, setSelectedReviewStatus] = useState<ReviewStatus>(
    receivable?.reviewStatus || 'not_reviewed'
  );
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>(receivable?.notes || '');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen || !receivable) return null;

  const paymentStatus = getPaymentStatusInfo(receivable.paymentStatus);
  const reviewStatus = getReviewStatusInfo(receivable.reviewStatus);

  const handleUpdateReviewStatus = async () => {
    if (!isAdmin) return;
    setIsUpdating(true);
    setFeedback(null);
    try {
      await apiService.updateReceivable(
        receivable.id,
        {
          reviewStatus: selectedReviewStatus,
          notes,
        },
        user?.name || 'Usuario',
        role || undefined
      );
      setFeedback('Estado de revisión actualizado exitosamente.');
      onUpdated();
    } catch (err: any) {
      setFeedback(err?.message || 'Error al actualizar el estado.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-teal-100 text-teal-800">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 font-mono">
                {receivable.referenceNumber}
              </h3>
              <p className="text-xs text-slate-500">{receivable.payerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Financial Breakdown (Read-Only as strictly required by Sec 5.3) */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <span className="text-[11px] text-slate-500 font-medium">Valor Original</span>
              <div className="text-lg font-bold font-mono text-slate-900 tabular-nums mt-0.5">
                {formatCOP(receivable.originalAmount)}
              </div>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium">Total Aplicado</span>
              <div className="text-lg font-bold font-mono text-emerald-800 tabular-nums mt-0.5">
                {formatCOP(receivable.allocatedAmount)}
              </div>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium">Saldo Pendiente Calculado</span>
              <div className="text-lg font-bold font-mono text-teal-800 tabular-nums mt-0.5">
                {formatCOP(receivable.pendingBalance)}
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 border border-slate-200 rounded-lg">
              <span className="font-semibold text-slate-900 block mb-1">
                Estado de Pago (Calculado por Sistema)
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium border ${paymentStatus.textColor} ${paymentStatus.bgColor} ${paymentStatus.borderColor}`}
                >
                  {paymentStatus.label}
                </span>
                {receivable.isOverdue && (
                  <span className="px-2 py-0.5 rounded text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Vencida
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-slate-500">{paymentStatus.desc}</p>
            </div>

            <div className="p-3 border border-slate-200 rounded-lg">
              <span className="font-semibold text-slate-900 block mb-1">
                Estado de Revisión (Auditoría Médica)
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium border ${reviewStatus.textColor} ${reviewStatus.bgColor} ${reviewStatus.borderColor}`}
                >
                  {reviewStatus.label}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Independiente del saldo financiero (Regla de negocio)
              </p>
            </div>
          </div>

          {/* General Metadata */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-white border border-slate-200 rounded-lg">
            <div>
              <span className="text-slate-400 block">Fecha de Emisión:</span>
              <span className="font-mono text-slate-900 font-medium">
                {formatDateCO(receivable.issueDate)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Fecha de Vencimiento:</span>
              <span className="font-mono text-slate-900 font-medium">
                {formatDateCO(receivable.dueDate)}
              </span>
            </div>
            {receivable.description && (
              <div className="col-span-2">
                <span className="text-slate-400 block">Descripción:</span>
                <span className="text-slate-800">{receivable.description}</span>
              </div>
            )}
          </div>

          {/* Applications History (Historial de Pagos aplicados a esta cuenta) */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-2 flex items-center justify-between">
              <span>Historial de Aplicaciones de Pago</span>
              <span className="text-[11px] font-normal text-slate-500">
                {receivable.allocations?.length || 0} aplicación(es)
              </span>
            </h4>

            {(!receivable.allocations || receivable.allocations.length === 0) ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-slate-500 text-xs">
                Esta cuenta no tiene abonos ni pagos aplicados actualmente.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="py-2 px-3 font-semibold">Fecha</th>
                      <th className="py-2 px-3 font-semibold">Ref. Pago</th>
                      <th className="py-2 px-3 font-semibold">Medio</th>
                      <th className="py-2 px-3 font-semibold text-right">Valor Aplicado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {receivable.allocations.map((alloc) => (
                      <tr key={alloc.id}>
                        <td className="py-2 px-3">{formatDateCO(alloc.receivedAt)}</td>
                        <td className="py-2 px-3 font-sans font-medium text-slate-900">
                          {alloc.paymentReference}
                        </td>
                        <td className="py-2 px-3 font-sans text-slate-600">
                          {getPaymentMethodLabel(alloc.paymentMethod)}
                        </td>
                        <td className="py-2 px-3 text-right font-semibold text-emerald-800 tabular-nums">
                          {formatCOP(alloc.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Change Review Status (Only for authorized Admin users) */}
          {isAdmin && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <span className="font-semibold text-slate-900 block text-xs">
                Gestionar Estado de Revisión
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <select
                  value={selectedReviewStatus}
                  onChange={(e) => setSelectedReviewStatus(e.target.value as ReviewStatus)}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600"
                >
                  <option value="not_reviewed">No revisada</option>
                  <option value="in_review">En revisión</option>
                  <option value="accepted">Aceptada</option>
                  <option value="disputed">Con glosa / devolución</option>
                </select>
                <button
                  onClick={handleUpdateReviewStatus}
                  disabled={isUpdating}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  {isUpdating ? 'Actualizando...' : 'Actualizar Estado'}
                </button>
              </div>
              {feedback && (
                <p className="text-[11px] text-teal-800 font-medium">{feedback}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 rounded-md border border-slate-300 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
