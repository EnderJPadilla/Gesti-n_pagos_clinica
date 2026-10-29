/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, CreditCard } from 'lucide-react';
import { Payment, Receivable, ApiError } from '../../types/api';
import { formatCOP, toCents, centsToDecimalString } from '../../utils/formatters';
import { apiService } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';

interface AllocateRemainingModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AllocateRemainingModal: React.FC<AllocateRemainingModalProps> = ({
  payment,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, role } = useAuth();
  const [openReceivables, setOpenReceivables] = useState<Receivable[]>([]);
  const [allocationsMap, setAllocationsMap] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && payment) {
      setErrorMsg(null);
      setAllocationsMap({});
      apiService
        .getReceivables({ payerId: payment.payerId, pageSize: 100 })
        .then((res) => {
          const withBalance = res.data.filter((r) => toCents(r.pendingBalance) > 0);
          setOpenReceivables(withBalance);
        });
    }
  }, [isOpen, payment]);

  if (!isOpen || !payment) return null;

  const unallocCents = toCents(payment.unallocatedAmount);
  const totalNewAllocCents = Object.values(allocationsMap).reduce((sum, v) => sum + v, 0);
  const exceedsUnallocated = totalNewAllocCents > unallocCents;

  const handleAllocationChange = (recId: string, valStr: string) => {
    const rawVal = parseFloat(valStr.replace(/[^0-9.]/g, ''));
    const cents = isNaN(rawVal) ? 0 : Math.round(rawVal * 100);

    const rec = openReceivables.find((r) => r.id === recId);
    if (!rec) return;
    const maxRecCents = toCents(rec.pendingBalance);

    const validCents = Math.min(cents, maxRecCents);

    setAllocationsMap((prev) => {
      const copy = { ...prev };
      if (validCents <= 0) delete copy[recId];
      else copy[recId] = validCents;
      return copy;
    });
  };

  const handleApplyFull = (rec: Receivable) => {
    const recPendingCents = toCents(rec.pendingBalance);
    const otherAllocs = totalNewAllocCents - (allocationsMap[rec.id] || 0);
    const available = Math.max(0, unallocCents - otherAllocs);
    const toApply = Math.min(recPendingCents, available);

    setAllocationsMap((prev) => ({
      ...prev,
      [rec.id]: toApply,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (totalNewAllocCents <= 0) {
      setErrorMsg('Debe ingresar un monto a aplicar mayor a cero.');
      return;
    }

    if (exceedsUnallocated) {
      setErrorMsg('El valor a aplicar supera el saldo sin asignar disponible.');
      return;
    }

    setIsLoading(true);
    try {
      const allocations = Object.entries(allocationsMap)
        .filter(([_, cents]) => cents > 0)
        .map(([recId, cents]) => ({
          receivableId: recId,
          amount: centsToDecimalString(cents),
        }));

      await apiService.allocatePayment(payment.id, allocations, user?.name || 'Usuario', role || undefined);
      onSuccess();
      onClose();
    } catch (err: any) {
      const apiErr = err as ApiError;
      setErrorMsg(apiErr.message || 'Error al aplicar el pago.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-teal-100 text-teal-800">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Aplicar Saldo sin Asignar
              </h3>
              <p className="text-xs text-slate-500">
                Distribuir fondos pendientes del pago ({payment.reference || payment.id})
              </p>
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
            <span className="font-medium text-amber-950">Saldo sin asignar disponible:</span>
            <span className="text-base font-bold font-mono text-amber-900 tabular-nums">
              {formatCOP(payment.unallocatedAmount)}
            </span>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900">Cuentas por cobrar abiertas de {payment.payerName}</h4>
            {openReceivables.length === 0 ? (
              <p className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-slate-400">
                No hay cuentas pendientes para este pagador.
              </p>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Cuenta</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Saldo</th>
                      <th className="py-2.5 px-3 font-semibold text-right w-40">Monto a Aplicar</th>
                      <th className="py-2.5 px-3 font-semibold text-center w-28">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {openReceivables.map((rec) => {
                      const cur = allocationsMap[rec.id] || 0;
                      return (
                        <tr key={rec.id}>
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-900">{rec.referenceNumber}</div>
                            {rec.description && (
                              <div className="text-[10px] text-slate-400 font-sans truncate max-w-xs">
                                {rec.description}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums text-slate-900 font-medium">
                            {formatCOP(rec.pendingBalance)}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="relative">
                              <span className="absolute left-2 top-1 text-slate-400">$</span>
                              <input
                                type="text"
                                placeholder="0"
                                value={cur > 0 ? (cur / 100).toString() : ''}
                                onChange={(e) => handleAllocationChange(rec.id, e.target.value)}
                                className="w-full pl-5 pr-2 py-1 bg-white border border-slate-300 rounded text-right text-xs font-mono"
                              />
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center font-sans">
                            <button
                              type="button"
                              onClick={() => handleApplyFull(rec)}
                              className="px-2 py-1 text-[11px] font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 rounded border border-teal-200"
                            >
                              Aplicar saldo
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-slate-500 block text-[10px]">Total a Aplicar Ahora:</span>
              <span className={`font-bold font-mono ${exceedsUnallocated ? 'text-rose-700' : 'text-emerald-800'}`}>
                {formatCOP(centsToDecimalString(totalNewAllocCents))}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Restante sin Asignar:</span>
              <span className="font-bold font-mono text-slate-900">
                {formatCOP(centsToDecimalString(Math.max(0, unallocCents - totalNewAllocCents)))}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || totalNewAllocCents <= 0 || exceedsUnallocated}
              className="px-4 py-2 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg disabled:opacity-50"
            >
              {isLoading ? 'Aplicando...' : 'Confirmar Aplicación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
