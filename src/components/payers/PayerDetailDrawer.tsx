/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { X, Building2, Phone, Mail, FileText, Receipt, CreditCard, ChevronRight } from 'lucide-react';
import { Payer, Receivable, Payment } from '../../types/api';
import { apiService } from '../../services/apiClient';
import { formatCOP, formatDateCO, getPaymentMethodLabel, getPaymentStatusInfo } from '../../utils/formatters';
import { TableSkeleton } from '../common/LoadingSkeleton';

interface PayerDetailDrawerProps {
  payerId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectReceivable?: (rec: Receivable) => void;
  onSelectPayment?: (payment: Payment) => void;
}

export const PayerDetailDrawer: React.FC<PayerDetailDrawerProps> = ({
  payerId,
  isOpen,
  onClose,
  onSelectReceivable,
  onSelectPayment,
}) => {
  const [payer, setPayer] = useState<Payer | null>(null);
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen && payerId) {
      setIsLoading(true);
      Promise.all([
        apiService.getPayerById(payerId),
        apiService.getReceivables({ payerId, pageSize: 50 }),
        apiService.getPayments({ payerId, pageSize: 50 }),
      ])
        .then(([p, recsRes, paysRes]) => {
          setPayer(p);
          setReceivables(recsRes.data);
          setPayments(paysRes.data);
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, payerId]);

  if (!isOpen || !payerId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border-l border-slate-200 w-full max-w-2xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-teal-100 text-teal-800">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">{payer?.name || 'Cargando...'}</h3>
              <p className="text-xs text-slate-500">
                {payer?.type} {payer?.idNumber ? `· ${payer.idType}: ${payer.idNumber}` : ''}
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          {isLoading ? (
            <TableSkeleton rows={4} cols={4} />
          ) : (
            <>
              {/* Balances Card */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <span className="text-[11px] text-slate-500 font-medium">Saldo Pendiente</span>
                  <div className="text-xl font-bold font-mono text-slate-900 tabular-nums mt-0.5">
                    {formatCOP(payer?.pendingBalance)}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-rose-700 font-medium">Cartera Vencida</span>
                  <div className="text-xl font-bold font-mono text-rose-800 tabular-nums mt-0.5">
                    {formatCOP(payer?.overdueBalance)}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-medium">Cuentas Abiertas</span>
                  <div className="text-xl font-bold font-mono text-slate-900 tabular-nums mt-0.5">
                    {payer?.openReceivablesCount || 0}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                <h4 className="font-semibold text-slate-900">Datos de Contacto y Convenio</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {payer?.contactName && (
                    <div>
                      <span className="text-slate-400 block">Contacto:</span>
                      <span className="text-slate-800 font-medium">{payer.contactName}</span>
                    </div>
                  )}
                  {payer?.phone && (
                    <div>
                      <span className="text-slate-400 block">Teléfono:</span>
                      <span className="text-slate-800 font-mono">{payer.phone}</span>
                    </div>
                  )}
                  {payer?.email && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 block">Correo:</span>
                      <span className="text-slate-800 font-mono">{payer.email}</span>
                    </div>
                  )}
                  {payer?.notes && (
                    <div className="sm:col-span-2 pt-1 border-t border-slate-100">
                      <span className="text-slate-400 block">Observaciones:</span>
                      <span className="text-slate-600">{payer.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cuentas por Cobrar de este Pagador */}
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900 flex items-center justify-between">
                  <span>Cuentas por Cobrar Asociadas ({receivables.length})</span>
                </h4>
                {receivables.length === 0 ? (
                  <p className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 text-center">
                    No tiene cuentas por cobrar registradas.
                  </p>
                ) : (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <tr>
                          <th className="py-2 px-3 font-semibold">Referencia</th>
                          <th className="py-2 px-3 font-semibold">Emisión / Venc.</th>
                          <th className="py-2 px-3 font-semibold text-right">Saldo</th>
                          <th className="py-2 px-3 font-semibold text-center">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {receivables.map((r) => {
                          const status = getPaymentStatusInfo(r.paymentStatus);
                          return (
                            <tr
                              key={r.id}
                              onClick={() => onSelectReceivable && onSelectReceivable(r)}
                              className="hover:bg-slate-50 cursor-pointer"
                            >
                              <td className="py-2 px-3 font-semibold text-slate-900">
                                {r.referenceNumber}
                              </td>
                              <td className="py-2 px-3">
                                <div>{formatDateCO(r.issueDate)}</div>
                                <div className="text-[10px] text-slate-400">{formatDateCO(r.dueDate)}</div>
                              </td>
                              <td className="py-2 px-3 text-right font-bold text-slate-900 tabular-nums">
                                {formatCOP(r.pendingBalance)}
                              </td>
                              <td className="py-2 px-3 text-center font-sans">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${status.bgColor} ${status.textColor}`}>
                                  {status.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Pagos Recibidos de este Pagador */}
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900">Historial de Pagos del Pagador ({payments.length})</h4>
                {payments.length === 0 ? (
                  <p className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 text-center">
                    No tiene pagos registrados.
                  </p>
                ) : (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <tr>
                          <th className="py-2 px-3 font-semibold">Fecha</th>
                          <th className="py-2 px-3 font-semibold">Referencia</th>
                          <th className="py-2 px-3 font-semibold text-right">Valor</th>
                          <th className="py-2 px-3 font-semibold text-center">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {payments.map((p) => (
                          <tr
                            key={p.id}
                            onClick={() => onSelectPayment && onSelectPayment(p)}
                            className="hover:bg-slate-50 cursor-pointer"
                          >
                            <td className="py-2 px-3">{formatDateCO(p.receivedAt)}</td>
                            <td className="py-2 px-3 font-sans font-medium text-slate-900">
                              {p.reference || 'Sin ref'}
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900 tabular-nums">
                              {formatCOP(p.amount)}
                            </td>
                            <td className="py-2 px-3 text-center font-sans">
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded ${
                                  p.status === 'confirmed'
                                    ? 'bg-emerald-50 text-emerald-800'
                                    : 'bg-rose-50 text-rose-800'
                                }`}
                              >
                                {p.status === 'confirmed' ? 'Confirmado' : 'Revertido'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 rounded-md border border-slate-300"
          >
            Cerrar detalle
          </button>
        </div>
      </div>
    </div>
  );
};
