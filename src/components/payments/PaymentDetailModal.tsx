/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  CreditCard,
  AlertTriangle,
  RotateCcw,
  PlusCircle,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { Payment } from '../../types/api';
import {
  formatCOP,
  formatDateCO,
  formatDateTimeCO,
  getPaymentMethodLabel,
} from '../../utils/formatters';
import { ReversePaymentModal } from './ReversePaymentModal';
import { AllocateRemainingModal } from './AllocateRemainingModal';
import { useAuth } from '../../context/AuthContext';

interface PaymentDetailModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({
  payment,
  isOpen,
  onClose,
  onRefresh,
}) => {
  const { isAdmin } = useAuth();
  const [isReverseModalOpen, setIsReverseModalOpen] = useState<boolean>(false);
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState<boolean>(false);

  if (!isOpen || !payment) return null;

  const isReversed = payment.status === 'reversed';
  const hasUnallocated = parseFloat(payment.unallocatedAmount) > 0;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
        <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <div
                className={`p-1.5 rounded-md ${
                  isReversed ? 'bg-rose-100 text-rose-800' : 'bg-teal-100 text-teal-800'
                }`}
              >
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900 font-mono">
                    {payment.reference || payment.id}
                  </h3>
                  {isReversed ? (
                    <span className="text-[11px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Revertido
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Confirmado
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{payment.payerName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
            {/* Reversal Banner if reversed */}
            {isReversed && payment.reversal && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-sm">
                  <AlertTriangle className="w-4 h-4 text-rose-700" />
                  <span>Pago Revertido el {formatDateTimeCO(payment.reversal.reversedAt)}</span>
                </div>
                <p className="text-xs">
                  <strong>Responsable:</strong> {payment.reversal.reversedBy}
                </p>
                <p className="text-xs">
                  <strong>Motivo registrado:</strong> "{payment.reversal.reason}"
                </p>
                <p className="text-[11px] text-rose-800/80 pt-1 border-t border-rose-200">
                  (Regla R20) Los importes aplicados fueron reintegrados a sus respectivas cuentas por cobrar.
                </p>
              </div>
            )}

            {/* Financial Breakdown */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <span className="text-[11px] text-slate-500 font-medium">Valor Recibido</span>
                <div
                  className={`text-lg font-bold font-mono tabular-nums mt-0.5 ${
                    isReversed ? 'line-through text-slate-400' : 'text-slate-900'
                  }`}
                >
                  {formatCOP(payment.amount)}
                </div>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium">Total Aplicado</span>
                <div className="text-lg font-bold font-mono text-emerald-800 tabular-nums mt-0.5">
                  {formatCOP(payment.allocatedAmount)}
                </div>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium">Saldo sin Asignar</span>
                <div className="text-lg font-bold font-mono text-amber-800 tabular-nums mt-0.5">
                  {formatCOP(payment.unallocatedAmount)}
                </div>
              </div>
            </div>

            {/* General Metadata */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-white border border-slate-200 rounded-lg">
              <div>
                <span className="text-slate-400 block">Fecha Efectiva de Recepción:</span>
                <span className="font-mono text-slate-900 font-medium">
                  {formatDateTimeCO(payment.receivedAt)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Medio de Pago:</span>
                <span className="text-slate-900 font-medium">
                  {getPaymentMethodLabel(payment.paymentMethod)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Registrado por:</span>
                <span className="text-slate-700">{payment.createdBy}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Fecha de Registro en Sistema:</span>
                <span className="font-mono text-slate-700">
                  {formatDateTimeCO(payment.createdAt)}
                </span>
              </div>
              {payment.notes && (
                <div className="col-span-2 pt-1 border-t border-slate-100">
                  <span className="text-slate-400 block">Observaciones:</span>
                  <span className="text-slate-700">{payment.notes}</span>
                </div>
              )}
            </div>

            {/* Allocations Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-slate-900">
                  Distribución a Cuentas por Cobrar ({payment.allocations.length})
                </h4>
                {hasUnallocated && !isReversed && isAdmin && (
                  <button
                    onClick={() => setIsAllocateModalOpen(true)}
                    className="inline-flex items-center gap-1 text-xs text-teal-700 hover:text-teal-800 font-medium"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Aplicar saldo sin asignar ({formatCOP(payment.unallocatedAmount)})</span>
                  </button>
                )}
              </div>

              {payment.allocations.length === 0 ? (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-lg text-center text-amber-900 text-xs">
                  <AlertCircle className="w-4 h-4 mx-auto mb-1 text-amber-700" />
                  <span>Este pago no tiene aplicaciones a cuentas por cobrar. La totalidad del valor ({formatCOP(payment.amount)}) está registrada como <strong className="font-semibold">saldo sin asignar</strong> (Reglas R13 y R14).</span>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="py-2 px-3 font-semibold">Cuenta / Factura</th>
                        <th className="py-2 px-3 font-semibold">Detalle</th>
                        <th className="py-2 px-3 font-semibold text-right">Valor Aplicado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {payment.allocations.map((alloc, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {alloc.receivableReference || alloc.receivableId}
                          </td>
                          <td className="py-2.5 px-3 font-sans text-slate-500">
                            {alloc.receivableDescription || 'Servicios hospitalarios'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-800 tabular-nums">
                            {formatCOP(alloc.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              {!isReversed && isAdmin && (
                <button
                  onClick={() => setIsReverseModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors"
                  title="Acción sensible: Revertir pago y restaurar saldos de cuentas"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Solicitar Reversión</span>
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 rounded-md border border-slate-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Sub-modals */}
      <ReversePaymentModal
        payment={payment}
        isOpen={isReverseModalOpen}
        onClose={() => setIsReverseModalOpen(false)}
        onSuccess={() => {
          onRefresh();
          onClose();
        }}
      />

      <AllocateRemainingModal
        payment={payment}
        isOpen={isAllocateModalOpen}
        onClose={() => setIsAllocateModalOpen(false)}
        onSuccess={() => {
          onRefresh();
          onClose();
        }}
      />
    </>
  );
};
