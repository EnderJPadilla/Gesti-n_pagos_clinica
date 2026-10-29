/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Info,
} from 'lucide-react';
import { apiService } from '../../services/apiClient';
import {
  Payer,
  Receivable,
  PaymentMethod,
  CreatePaymentDto,
  CreatePaymentAllocationDto,
  ApiError,
} from '../../types/api';
import {
  formatCOP,
  getTodayBogota,
  toCents,
  centsToDecimalString,
  getPaymentMethodLabel,
} from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

interface CreatePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedPayerId?: string;
  preselectedReceivable?: Receivable;
}

export const CreatePaymentModal: React.FC<CreatePaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedPayerId,
  preselectedReceivable,
}) => {
  const { user, role } = useAuth();
  const [payers, setPayers] = useState<Payer[]>([]);
  const [selectedPayerId, setSelectedPayerId] = useState<string>('');
  const [receivedDate, setReceivedDate] = useState<string>(getTodayBogota());
  const [receivedTime, setReceivedTime] = useState<string>('10:00');
  const [amountStr, setAmountStr] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [reference, setReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Cuentas abiertas del pagador seleccionado
  const [openReceivables, setOpenReceivables] = useState<Receivable[]>([]);
  // Mapeo de receivableId -> monto a aplicar en centavos
  const [allocationsMap, setAllocationsMap] = useState<Record<string, number>>({});

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Cargar pagadores al abrir
  useEffect(() => {
    if (isOpen) {
      apiService.getPayers({ isActive: true }).then((data) => {
        setPayers(data);
        const initialPayer = preselectedReceivable
          ? preselectedReceivable.payerId
          : preselectedPayerId || (data.length > 0 ? data[0].id : '');
        setSelectedPayerId(initialPayer);
      });

      setReceivedDate(getTodayBogota());
      setReceivedTime('10:00');
      setAmountStr(preselectedReceivable ? preselectedReceivable.pendingBalance : '');
      setPaymentMethod('bank_transfer');
      setReference('');
      setNotes('');
      setFieldErrors({});
      setGeneralError(null);
      setAllocationsMap({});
    }
  }, [isOpen, preselectedPayerId, preselectedReceivable]);

  // Cargar cuentas abiertas del pagador seleccionado
  useEffect(() => {
    if (selectedPayerId && isOpen) {
      apiService
        .getReceivables({
          payerId: selectedPayerId,
          paymentStatus: undefined, // Queremos filtrar en cliente los que tengan saldo > 0
          pageSize: 100,
        })
        .then((res) => {
          const withBalance = res.data.filter((r) => toCents(r.pendingBalance) > 0);
          setOpenReceivables(withBalance);

          // Si vino preseleccionada una cuenta
          if (preselectedReceivable && preselectedReceivable.payerId === selectedPayerId) {
            setAllocationsMap({
              [preselectedReceivable.id]: toCents(preselectedReceivable.pendingBalance),
            });
          } else {
            setAllocationsMap({});
          }
        });
    } else {
      setOpenReceivables([]);
      setAllocationsMap({});
    }
  }, [selectedPayerId, isOpen]);

  if (!isOpen) return null;

  const paymentTotalCents = toCents(amountStr);

  // Suma de aplicaciones seleccionadas
  const totalAllocatedCents = Object.values(allocationsMap).reduce((sum, val) => sum + val, 0);
  const unallocatedCents = Math.max(0, paymentTotalCents - totalAllocatedCents);
  const exceedsPayment = totalAllocatedCents > paymentTotalCents;

  const handleAllocationChange = (recId: string, valStr: string) => {
    const rawVal = parseFloat(valStr.replace(/[^0-9.]/g, ''));
    const cents = isNaN(rawVal) ? 0 : Math.round(rawVal * 100);

    const rec = openReceivables.find((r) => r.id === recId);
    if (!rec) return;
    const maxRecCents = toCents(rec.pendingBalance);

    // Evitar que sobrepase el saldo de la cuenta (Regla R11)
    const validCents = Math.min(cents, maxRecCents);

    setAllocationsMap((prev) => {
      const copy = { ...prev };
      if (validCents <= 0) {
        delete copy[recId];
      } else {
        copy[recId] = validCents;
      }
      return copy;
    });
  };

  const handleApplyFullBalance = (rec: Receivable) => {
    const recPendingCents = toCents(rec.pendingBalance);
    // Calcular cuánto le queda disponible al pago
    const currentOtherAllocations = totalAllocatedCents - (allocationsMap[rec.id] || 0);
    const availableFromPayment = Math.max(0, paymentTotalCents - currentOtherAllocations);

    // Puede aplicar hasta el saldo de la cuenta o hasta lo que quede del pago
    const amountToApply = Math.min(recPendingCents, availableFromPayment || recPendingCents);

    setAllocationsMap((prev) => ({
      ...prev,
      [rec.id]: amountToApply,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    const errors: Record<string, string> = {};

    if (!selectedPayerId) errors.payerId = 'Seleccione un pagador';
    if (!receivedDate) errors.receivedDate = 'La fecha de recepción es obligatoria';
    if (paymentTotalCents <= 0) errors.amount = 'El valor recibido debe ser mayor a cero en COP (Regla R09)';

    if (totalAllocatedCents > paymentTotalCents) {
      errors.allocations = 'La suma de aplicaciones no puede superar el valor del pago (Regla R10)';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const isoReceivedAt = `${receivedDate}T${receivedTime}:00-05:00`;
      const allocations: CreatePaymentAllocationDto[] = Object.entries(allocationsMap)
        .filter(([_, cents]) => cents > 0)
        .map(([recId, cents]) => ({
          receivableId: recId,
          amount: centsToDecimalString(cents),
        }));

      const dto: CreatePaymentDto = {
        payerId: selectedPayerId,
        receivedAt: isoReceivedAt,
        amount: centsToDecimalString(paymentTotalCents),
        paymentMethod,
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
        allocations: allocations.length > 0 ? allocations : undefined,
      };

      const idempotencyKey = `idemp-${Date.now()}-${Math.random()}`;
      await apiService.createPayment(dto, idempotencyKey, user?.name || 'Usuario', role || undefined);
      onSuccess();
      onClose();
    } catch (err: any) {
      const apiErr = err as ApiError;
      setGeneralError(apiErr.message || 'Error al registrar el pago.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-teal-100 text-teal-800">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Registrar Pago Recibido
              </h3>
              <p className="text-xs text-slate-500">
                Ingreso efectivo de dinero con distribución a cuentas o registro sin asignar
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {generalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Pagador y Monto Principal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Pagador Responsable <span className="text-rose-600">*</span>
              </label>
              <select
                value={selectedPayerId}
                onChange={(e) => {
                  setSelectedPayerId(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, payerId: '' }));
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-600 bg-white"
              >
                <option value="">Seleccione pagador...</option>
                {payers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.type})
                  </option>
                ))}
              </select>
              {fieldErrors.payerId && (
                <p className="mt-1 text-rose-600">{fieldErrors.payerId}</p>
              )}
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Valor Recibido (COP) <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-mono font-medium">$</span>
                <input
                  type="text"
                  placeholder="Ej. 4000000"
                  value={amountStr}
                  onChange={(e) => {
                    setAmountStr(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, amount: '' }));
                  }}
                  className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-600 font-mono text-right font-bold text-sm"
                />
              </div>
              {fieldErrors.amount && <p className="mt-1 text-rose-600">{fieldErrors.amount}</p>}
            </div>
          </div>

          {/* Fecha y Medio de Pago */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Fecha Efectiva de Recepción <span className="text-rose-600">*</span>
              </label>
              <input
                type="date"
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Hora aproximada</label>
              <input
                type="time"
                value={receivedTime}
                onChange={(e) => setReceivedTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Medio de Pago <span className="text-rose-600">*</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
              >
                <option value="bank_transfer">Transferencia bancaria</option>
                <option value="deposit">Consignación</option>
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta de crédito/débito</option>
                <option value="other">Otro medio</option>
              </select>
            </div>
          </div>

          {/* Referencia y Observaciones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Referencia de Transferencia / Comprobante
              </label>
              <input
                type="text"
                placeholder="Ej. TRX-BCO-99824 o Aprobación 10293"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Observaciones del Pago
              </label>
              <input
                type="text"
                placeholder="Ej. Giro quincenal convenios de salud"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>

          {/* Asistente de Distribución a Cuentas por Cobrar (Sección 5.4) */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">
                  Distribución a Cuentas por Cobrar (Opcional)
                </h4>
                <p className="text-[11px] text-slate-500">
                  (Regla R13/R15) Aplique este abono a una o varias cuentas del mismo pagador o déjelo sin asignar.
                </p>
              </div>
            </div>

            {openReceivables.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500">
                <Info className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                <span>Este pagador no tiene cuentas por cobrar pendientes. El pago se registrará como <strong className="text-slate-700">Saldo sin asignar</strong> (Regla R13).</span>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Factura / Cuenta</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Saldo Disponible</th>
                      <th className="py-2.5 px-3 font-semibold text-right w-44">Valor a Aplicar</th>
                      <th className="py-2.5 px-3 font-semibold text-center w-28">Acción Rápida</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {openReceivables.map((rec) => {
                      const currentAlloc = allocationsMap[rec.id] || 0;
                      return (
                        <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-900">{rec.referenceNumber}</div>
                            {rec.description && (
                              <div className="text-[11px] text-slate-400 font-sans truncate max-w-xs">
                                {rec.description}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-slate-900 tabular-nums">
                            {formatCOP(rec.pendingBalance)}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="relative inline-block w-full">
                              <span className="absolute left-2 top-1.5 text-slate-400 text-xs">$</span>
                              <input
                                type="text"
                                placeholder="0"
                                value={currentAlloc > 0 ? (currentAlloc / 100).toString() : ''}
                                onChange={(e) => handleAllocationChange(rec.id, e.target.value)}
                                className="w-full pl-5 pr-2 py-1 bg-white border border-slate-300 rounded text-right text-xs font-mono font-medium focus:ring-1 focus:ring-teal-600"
                              />
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center font-sans">
                            <button
                              type="button"
                              onClick={() => handleApplyFullBalance(rec)}
                              className="px-2 py-1 text-[11px] font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 rounded border border-teal-200 transition-colors"
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

            {/* Panel de Validación de Saldos en Vivo (Reglas R10, R11, R14) */}
            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Valor Recibido
                  </span>
                  <span className="font-bold font-mono text-slate-900">
                    {formatCOP(centsToDecimalString(paymentTotalCents))}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Total Aplicado
                  </span>
                  <span
                    className={`font-bold font-mono ${
                      exceedsPayment ? 'text-rose-700' : 'text-emerald-800'
                    }`}
                  >
                    {formatCOP(centsToDecimalString(totalAllocatedCents))}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Saldo sin Asignar
                  </span>
                  <span
                    className={`font-bold font-mono ${
                      unallocatedCents > 0 ? 'text-amber-700' : 'text-slate-700'
                    }`}
                  >
                    {formatCOP(centsToDecimalString(unallocatedCents))}
                  </span>
                </div>
              </div>

              {exceedsPayment ? (
                <div className="text-rose-700 font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>El total aplicado supera el pago recibido. Corrija los importes.</span>
                </div>
              ) : unallocatedCents > 0 ? (
                <div className="text-amber-800 text-[11px]">
                  (Regla R13) {formatCOP(centsToDecimalString(unallocatedCents))} quedará disponible para aplicar más adelante.
                </div>
              ) : (
                <div className="text-emerald-800 text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Pago aplicado al 100% en las cuentas seleccionadas.</span>
                </div>
              )}
            </div>
            {fieldErrors.allocations && (
              <p className="mt-1 text-rose-600 text-xs">{fieldErrors.allocations}</p>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || exceedsPayment}
              className="px-4 py-2 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Registrando...' : 'Confirmar Registro del Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
