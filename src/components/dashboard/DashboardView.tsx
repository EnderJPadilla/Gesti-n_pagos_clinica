/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Calendar,
  AlertTriangle,
  Receipt,
  ArrowUpRight,
  Clock,
  CheckCircle,
  FileText,
  AlertCircle,
  Building2,
  HelpCircle,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { apiService } from '../../services/apiClient';
import {
  DashboardSummary,
  TopDebtor,
  Payment,
  PeriodFilter,
} from '../../types/api';
import {
  formatCOP,
  formatDateCO,
  formatDateTimeCO,
  getPaymentMethodLabel,
  getPayerTypeBadge,
} from '../../utils/formatters';
import { CardSkeleton, TableSkeleton } from '../common/LoadingSkeleton';
import { ActiveTab } from '../layout/Sidebar';
import { useAuth } from '../../context/AuthContext';

interface DashboardViewProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onSelectPayerDetail: (payerId: string) => void;
  onSelectPaymentDetail: (paymentId: string) => void;
  onOpenNewPaymentModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onSelectPayerDetail,
  onSelectPaymentDetail,
  onOpenNewPaymentModal,
}) => {
  const { isAdmin } = useAuth();
  const [period, setPeriod] = useState<PeriodFilter>('month');
  const [customFrom, setCustomFrom] = useState<string>('2026-10-01');
  const [customTo, setCustomTo] = useState<string>('2026-10-31');
  const [showCustomRange, setShowCustomRange] = useState<boolean>(false);

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [topDebtors, setTopDebtors] = useState<TopDebtor[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [sumRes, debtorsRes, paymentsRes] = await Promise.all([
        apiService.getDashboardSummary({
          period,
          from: period === 'custom' ? customFrom : undefined,
          to: period === 'custom' ? customTo : undefined,
        }),
        apiService.getTopDebtors(),
        apiService.getRecentPayments(6),
      ]);
      setSummary(sumRes);
      setTopDebtors(debtorsRes);
      setRecentPayments(paymentsRes);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al cargar los indicadores financieros.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [period, customFrom, customTo]);

  const handlePeriodChange = (newPeriod: PeriodFilter) => {
    setPeriod(newPeriod);
    if (newPeriod === 'custom') {
      setShowCustomRange(true);
    } else {
      setShowCustomRange(false);
    }
  };

  if (isLoading && !summary) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <TableSkeleton rows={4} cols={5} />
      </div>
    );
  }

  if (errorMsg && !summary) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm flex items-center justify-between">
          <span>{errorMsg}</span>
          <button
            onClick={fetchDashboardData}
            className="px-3 py-1 bg-white border border-rose-300 text-xs font-medium rounded hover:bg-rose-50"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Toolbar: Period Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Resumen de Recaudos y Cartera
          </h2>
          <p className="text-xs text-slate-500">
            Valores monetarios calculados en pesos colombianos (COP).
          </p>
        </div>

        {/* Filter Tabs (Interactive Segmented Control according to Constitution) */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => handlePeriodChange('today')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                period === 'today'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => handlePeriodChange('week')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                period === 'week'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Esta semana
            </button>
            <button
              onClick={() => handlePeriodChange('month')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                period === 'month'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Este mes
            </button>
            <button
              onClick={() => handlePeriodChange('custom')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                period === 'custom'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Personalizado
            </button>
          </div>
        </div>
      </div>

      {/* Custom Date Range Picker if period === 'custom' */}
      {showCustomRange && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center gap-3 text-xs">
          <span className="font-medium text-slate-700 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" /> Rango de consulta:
          </span>
          <div className="flex items-center gap-2">
            <label className="text-slate-500">Desde:</label>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-slate-500">Hasta:</label>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800"
            />
          </div>
        </div>
      )}

      {/* Unallocated Payments Notice / Highlight Card (Sección 5.1 & Regla R14) */}
      {summary && summary.unallocatedPaymentsCount > 0 && (
        <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-900 shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-amber-950">
                  {summary.unallocatedPaymentsCount} pago(s) con saldo sin asignar
                </h3>
                <span className="text-[11px] font-mono font-medium text-amber-800">
                  Total: {formatCOP(summary.unallocatedPaymentsTotal)}
                </span>
              </div>
              <p className="text-xs text-amber-900/80 mt-0.5">
                (Regla R14) El dinero ya ingresó y se contabiliza en recaudos, pero no reduce la cartera de cuentas por cobrar hasta que tesorería lo distribuya.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <button
              onClick={() => onNavigateTab('payments')}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md bg-amber-200 hover:bg-amber-300 text-amber-950 transition-colors whitespace-nowrap"
            >
              <span>Ver pagos pendientes de asignar</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Core Financial Indicators (6 Essential Cards strictly adhering to 5.1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Recibido Hoy */}
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium text-slate-600">Recibido Hoy</span>
            <span className="text-[11px] text-slate-400 font-mono">29/10/2026</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {formatCOP(summary?.receivedToday)}
          </div>
          <p className="mt-2 text-xs text-slate-500 leading-tight">
            Pagos efectivos confirmados recibidos durante la jornada.
          </p>
        </div>

        {/* Recibido Esta Semana */}
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium text-slate-600">Recibido Esta Semana</span>
            <span className="text-[11px] text-slate-400">Lun - Dom</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {formatCOP(summary?.receivedThisWeek)}
          </div>
          <p className="mt-2 text-xs text-slate-500 leading-tight">
            Total recaudado acumulado en la semana en curso.
          </p>
        </div>

        {/* Recibido Este Mes / En el Periodo */}
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium text-slate-600">
              {period === 'custom' ? 'Recibido en Periodo' : 'Recibido Este Mes'}
            </span>
            <span className="text-[11px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded font-mono">
              {period === 'custom' ? 'Filtro activo' : 'Octubre 2026'}
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-teal-800 tabular-nums">
            {formatCOP(period === 'custom' ? summary?.receivedInPeriod : summary?.receivedThisMonth)}
          </div>
          <p className="mt-2 text-xs text-slate-500 leading-tight">
            Ingresos confirmados no revertidos en el rango seleccionado.
          </p>
        </div>

        {/* Cartera Pendiente Total */}
        <div
          onClick={() => onNavigateTab('receivables')}
          className="bg-white p-5 border border-slate-200 rounded-xl shadow-2xs hover:border-teal-500/50 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium text-slate-600">Cartera Pendiente Total</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {formatCOP(summary?.pendingPortfolio)}
          </div>
          <p className="mt-2 text-xs text-slate-500 leading-tight">
            Suma de saldos de todas las facturas vigentes por cobrar.
          </p>
        </div>

        {/* Cartera Vencida */}
        <div
          onClick={() => onNavigateTab('receivables')}
          className="bg-white p-5 border border-rose-200/80 rounded-xl shadow-2xs hover:border-rose-400 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between text-xs text-rose-700 mb-2">
            <span className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              Cartera Vencida
            </span>
            <ArrowUpRight className="w-4 h-4 text-rose-400 group-hover:text-rose-600 transition-colors" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-800 tabular-nums">
            {formatCOP(summary?.overduePortfolio)}
          </div>
          <p className="mt-2 text-xs text-slate-500 leading-tight">
            Cuentas con vencimiento anterior a hoy en Bogotá.
          </p>
        </div>

        {/* Cuentas Abiertas */}
        <div
          onClick={() => onNavigateTab('receivables')}
          className="bg-white p-5 border border-slate-200 rounded-xl shadow-2xs hover:border-slate-300 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium text-slate-600">Cuentas por Cobrar Abiertas</span>
            <Receipt className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {summary?.openReceivablesCount || 0}
          </div>
          <p className="mt-2 text-xs text-slate-500 leading-tight">
            Documentos con saldo pendiente mayor a cero.
          </p>
        </div>
      </div>

      {/* Structured 2-Column Section: Top Debtors & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Principales Deudores (Sección 5.6) */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Principales Deudores
              </h3>
              <p className="text-xs text-slate-500">
                Pagadores ordenados por saldo pendiente descendente
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('payers')}
              className="text-xs font-medium text-teal-700 hover:text-teal-800 transition-colors flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Pagador</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Saldo Pendiente</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Vencido</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Cuentas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {topDebtors.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 font-sans">
                      No hay deudores con saldo pendiente
                    </td>
                  </tr>
                ) : (
                  topDebtors.map((debtor) => {
                    const badge = getPayerTypeBadge(debtor.payerType);
                    return (
                      <tr
                        key={debtor.payerId}
                        onClick={() => onSelectPayerDetail(debtor.payerId)}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                      >
                        <td className="py-3 px-3 font-sans">
                          <div className="font-medium text-slate-900 group-hover:text-teal-700 transition-colors">
                            {debtor.payerName}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
                            <span>{debtor.payerType}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-slate-900 tabular-nums">
                          {formatCOP(debtor.pendingBalance)}
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums">
                          {parseFloat(debtor.overdueBalance) > 0 ? (
                            <span className="text-rose-700 font-medium">
                              {formatCOP(debtor.overdueBalance)}
                            </span>
                          ) : (
                            <span className="text-slate-400">$ 0</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center tabular-nums text-slate-700">
                          {debtor.openReceivablesCount}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagos Recientes (Sección 5.1 & 5.4) */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Pagos Recientes
              </h3>
              <p className="text-xs text-slate-500">
                Últimos movimientos registrados en el sistema
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('payments')}
              className="text-xs font-medium text-teal-700 hover:text-teal-800 transition-colors flex items-center gap-1"
            >
              <span>Ver historial</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Fecha / Referencia</th>
                  <th className="py-2.5 px-3 font-semibold">Pagador</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Valor Recibido</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {recentPayments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 font-sans">
                      No hay pagos registrados
                    </td>
                  </tr>
                ) : (
                  recentPayments.map((payment) => {
                    const isReversed = payment.status === 'reversed';
                    const hasUnallocated = parseFloat(payment.unallocatedAmount) > 0;
                    return (
                      <tr
                        key={payment.id}
                        onClick={() => onSelectPaymentDetail(payment.id)}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                      >
                        <td className="py-3 px-3">
                          <div className="text-slate-900 font-medium font-sans">
                            {formatDateCO(payment.receivedAt)}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {payment.reference || 'Sin ref'}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-sans">
                          <div className="font-medium text-slate-900 group-hover:text-teal-700 transition-colors truncate max-w-[150px]">
                            {payment.payerName}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {getPaymentMethodLabel(payment.paymentMethod)}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums">
                          <div className={`font-semibold ${isReversed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {formatCOP(payment.amount)}
                          </div>
                          {hasUnallocated && !isReversed && (
                            <div className="text-[10px] text-amber-700 font-medium">
                              Sin asignar: {formatCOP(payment.unallocatedAmount)}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-sans">
                          {isReversed ? (
                            <span className="text-[11px] font-medium text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              Revertido
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Confirmado
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
