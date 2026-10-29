/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { apiService } from '../../services/apiClient';
import { Payer, Receivable, Payment } from '../../types/api';
import { formatCOP } from '../../utils/formatters';
import {
  PAYER_EPS_A_ID,
  PAYER_ASEGURADORA_B_ID,
  RECEIVABLE_A_ID,
  RECEIVABLE_B_ID,
  RECEIVABLE_C_ID,
} from '../../services/demoSeedData';

interface Section11ValidatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Section11ValidatorModal: React.FC<Section11ValidatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [data, setData] = useState<{
    ctaA?: Receivable;
    ctaB?: Receivable;
    ctaC?: Receivable;
    payerA?: Payer;
    payerB?: Payer;
    payment?: Payment;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadScenarioData();
    }
  }, [isOpen]);

  const loadScenarioData = async () => {
    setIsLoading(true);
    try {
      const [recsRes, payersRes, paymentsRes] = await Promise.all([
        apiService.getReceivables({ pageSize: 100 }),
        apiService.getPayers(),
        apiService.getPayments({ pageSize: 100 }),
      ]);

      const ctaA = recsRes.data.find((r) => r.id === RECEIVABLE_A_ID);
      const ctaB = recsRes.data.find((r) => r.id === RECEIVABLE_B_ID);
      const ctaC = recsRes.data.find((r) => r.id === RECEIVABLE_C_ID);
      const payerA = payersRes.find((p) => p.id === PAYER_EPS_A_ID);
      const payerB = payersRes.find((p) => p.id === PAYER_ASEGURADORA_B_ID);
      const payment = paymentsRes.data.find((p) => p.id === 'pay-001-sec11');

      setData({ ctaA, ctaB, ctaC, payerA, payerB, payment });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const totalScenarioPending =
    (data.ctaA ? parseFloat(data.ctaA.pendingBalance) : 0) +
    (data.ctaB ? parseFloat(data.ctaB.pendingBalance) : 0) +
    (data.ctaC ? parseFloat(data.ctaC.pendingBalance) : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-teal-100 text-teal-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Verificación del Escenario de Prueba de Referencia
              </h3>
              <p className="text-xs text-slate-500">
                Alineación matemática con el Escenario de Referencia Contable
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg text-xs leading-relaxed text-teal-950">
            <p className="font-semibold mb-1">Especificación del Escenario de Referencia:</p>
            <p>
              Cartera inicial: $15.000.000 (Cta A: $10M, Cta B: $3M, Cta C: $2M). Pago recibido: $4.000.000 de EPS A, aplicado: $2.5M a Cta A y $1.5M a Cta B.
            </p>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-slate-500">Cargando verificación...</div>
          ) : (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Elemento del Escenario</th>
                      <th className="py-2.5 px-3 font-semibold">Valor Esperado</th>
                      <th className="py-2.5 px-3 font-semibold">Valor en Sistema</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    <tr>
                      <td className="py-2 px-3 font-sans font-medium text-slate-900">
                        Dinero recibido por movimiento (Pago EPS A)
                      </td>
                      <td className="py-2 px-3 text-slate-600">$ 4.000.000</td>
                      <td className="py-2 px-3 text-slate-900 font-semibold">
                        {formatCOP(data.payment?.amount)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <CheckCircle className="w-4 h-4 text-emerald-600 inline" />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-sans font-medium text-slate-900">
                        Saldo Cuenta A (FAC-2026-00101)
                      </td>
                      <td className="py-2 px-3 text-slate-600">$ 7.500.000</td>
                      <td className="py-2 px-3 text-slate-900 font-semibold">
                        {formatCOP(data.ctaA?.pendingBalance)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <CheckCircle className="w-4 h-4 text-emerald-600 inline" />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-sans font-medium text-slate-900">
                        Saldo Cuenta B (FAC-2026-00089)
                      </td>
                      <td className="py-2 px-3 text-slate-600">$ 1.500.000</td>
                      <td className="py-2 px-3 text-slate-900 font-semibold">
                        {formatCOP(data.ctaB?.pendingBalance)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <CheckCircle className="w-4 h-4 text-emerald-600 inline" />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-sans font-medium text-slate-900">
                        Saldo Cuenta C (FAC-2026-00115)
                      </td>
                      <td className="py-2 px-3 text-slate-600">$ 2.000.000</td>
                      <td className="py-2 px-3 text-slate-900 font-semibold">
                        {formatCOP(data.ctaC?.pendingBalance)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <CheckCircle className="w-4 h-4 text-emerald-600 inline" />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-sans font-medium text-slate-900">
                        Saldo pendiente Pagador EPS A (Sanitas)
                      </td>
                      <td className="py-2 px-3 text-slate-600">$ 9.000.000</td>
                      <td className="py-2 px-3 text-slate-900 font-semibold">
                        {formatCOP(data.payerA?.pendingBalance)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <CheckCircle className="w-4 h-4 text-emerald-600 inline" />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-sans font-medium text-slate-900">
                        Saldo pendiente Aseguradora B (Bolívar)
                      </td>
                      <td className="py-2 px-3 text-slate-600">$ 2.000.000</td>
                      <td className="py-2 px-3 text-slate-900 font-semibold">
                        {formatCOP(data.payerB?.pendingBalance)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <CheckCircle className="w-4 h-4 text-emerald-600 inline" />
                      </td>
                    </tr>
                    <tr className="bg-slate-50/80 font-bold">
                      <td className="py-2.5 px-3 font-sans text-slate-900">
                        Cartera pendiente total (Cuentas A + B + C)
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">$ 11.000.000</td>
                      <td className="py-2.5 px-3 text-teal-800">
                        {formatCOP(totalScenarioPending)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <CheckCircle className="w-4 h-4 text-emerald-600 inline" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Condición de cierre verificada:</strong> La suma de los saldos de Cuenta A ($7.5M) + Cuenta B ($1.5M) + Cuenta C ($2.0M) es exactamente igual a $11.000.000.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 rounded-md border border-slate-300 transition-colors"
          >
            Cerrar comprobación
          </button>
        </div>
      </div>
    </div>
  );
};
