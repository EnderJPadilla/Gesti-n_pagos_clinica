/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { Payment, ApiError } from '../../types/api';
import { formatCOP, formatDateCO } from '../../utils/formatters';
import { apiService } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';

interface ReversePaymentModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReversePaymentModal: React.FC<ReversePaymentModalProps> = ({
  payment,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, role, isAdmin } = useAuth();
  const [reason, setReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !payment) return null;

  const handleReverse = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!reason.trim() || reason.trim().length < 5) {
      setErrorMsg('Debe especificar un motivo detallado de reversión (mínimo 5 caracteres).');
      return;
    }

    setIsLoading(true);
    try {
      await apiService.reversePayment(payment.id, reason.trim(), user?.name || 'Usuario', role || undefined);
      onSuccess();
      onClose();
    } catch (err: any) {
      const apiErr = err as ApiError;
      setErrorMsg(apiErr.message || 'Error al solicitar la reversión.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-rose-200 rounded-xl shadow-xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rose-100 bg-rose-50/70">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-rose-100 text-rose-800">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-rose-950">
                Reversión de Pago Confirmado
              </h3>
              <p className="text-xs text-rose-700">Acción financiera sensible bajo auditoría</p>
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
        <form onSubmit={handleReverse} className="p-6 space-y-4 text-xs text-slate-700">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
              {errorMsg}
            </div>
          )}

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Referencia:</span>
              <span className="font-semibold text-slate-900 font-sans">{payment.reference || payment.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Pagador:</span>
              <span className="text-slate-900 font-sans">{payment.payerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Fecha de Recepción:</span>
              <span className="text-slate-900">{formatDateCO(payment.receivedAt)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200">
              <span className="text-slate-500 font-sans">Valor a Revertir:</span>
              <span className="text-rose-700 font-bold">{formatCOP(payment.amount)}</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] leading-relaxed">
            <strong className="font-semibold block mb-0.5">Consecuencias de la reversión (Regla R20):</strong>
            El pago quedará marcado como <span className="font-mono">revertido</span>, se conservará la trazabilidad completa, se restaurará el saldo pendiente de las {payment.allocations.length} cuentas por cobrar aplicadas y se restará el importe de los recaudos del periodo.
          </div>

          <div>
            <label className="block font-semibold text-slate-900 mb-1">
              Motivo obligatorio de la reversión <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Ej. Cheque devuelto por fondos insuficientes, error en radicación del banco o duplicación de giro..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-rose-600"
              required
            />
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
              disabled={isLoading}
              className="px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg transition-colors"
            >
              {isLoading ? 'Revirtiendo...' : 'Confirmar Reversión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
