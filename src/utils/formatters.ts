/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Utilidades de formato monetario, fechas (es-CO, America/Bogota)
 * y cálculo decimal exacto para Control Financiero de Clínica.
 */

import { PaymentMethod, PaymentStatus, PayerType, ReviewStatus } from '../types/api';

export const TIMEZONE_BOGOTA = 'America/Bogota';

/**
 * Parsea una cadena decimal o número de forma segura en centavos para cálculos aritméticos exactos
 * evitando errores de punto flotante (Regla R17).
 */
export function toCents(decimalStrOrNum: string | number): number {
  if (typeof decimalStrOrNum === 'number') {
    return Math.round(decimalStrOrNum * 100);
  }
  const clean = String(decimalStrOrNum || '0').replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(clean);
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}

/**
 * Convierte centavos a cadena decimal "0.00"
 */
export function centsToDecimalString(cents: number): string {
  const isNegative = cents < 0;
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100);
  const remainder = abs % 100;
  const paddedRemainder = remainder.toString().padStart(2, '0');
  return `${isNegative ? '-' : ''}${dollars}.${paddedRemainder}`;
}

/**
 * Formatea valor en Pesos Colombianos (COP) según la especificación:
 * Ejemplo visual: $ 1.250.000
 */
export function formatCOP(amount: string | number | undefined | null): string {
  if (amount === undefined || amount === null) return '$ 0';
  const cents = toCents(amount);
  const value = cents / 100;

  // Formato es-CO: separador de miles con punto
  const formatted = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

  // Reemplaza posibles formatos no estándar por el estándar limpio: $ 1.250.000
  return formatted.replace(/\s+/g, ' ');
}

/**
 * Obtiene la fecha actual en la zona horaria America/Bogota en formato YYYY-MM-DD
 */
export function getTodayBogota(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE_BOGOTA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(now); // "YYYY-MM-DD"
}

/**
 * Determina si una fecha de vencimiento dada ya está vencida respecto a hoy en Bogotá
 * Regla R06: Vencida si tiene saldo pendiente y vencimiento < hoy America/Bogota
 * Regla R07: Sin fecha no es vencida
 */
export function isDateOverdue(dueDateStr?: string | null): boolean {
  if (!dueDateStr) return false;
  const today = getTodayBogota();
  return dueDateStr < today;
}

/**
 * Formatea fecha de calendario YYYY-MM-DD a DD/MM/YYYY
 */
export function formatDateCO(dateStr?: string | null): string {
  if (!dateStr) return '—';
  // Si viene en formato ISO timestamp "2026-10-29T10:00:00-05:00"
  if (dateStr.includes('T')) {
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('es-CO', {
        timeZone: TIMEZONE_BOGOTA,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(d);
    } catch {
      return dateStr;
    }
  }

  // Si viene como YYYY-MM-DD
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateStr;
}

/**
 * Formatea instante ISO 8601 a DD/MM/YYYY, hh:mm a en America/Bogota
 */
export function formatDateTimeCO(isoStr?: string | null): string {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    return new Intl.DateTimeFormat('es-CO', {
      timeZone: TIMEZONE_BOGOTA,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return isoStr;
  }
}

/**
 * Etiquetas y estilos de estado de pago (Sección 6)
 * Se usan textos limpios con indicadores de accesibilidad y sin pills decorativos
 */
export function getPaymentStatusInfo(status: PaymentStatus) {
  switch (status) {
    case 'paid':
      return {
        label: 'Pagada',
        desc: 'Saldo pendiente: $ 0',
        textColor: 'text-emerald-800',
        borderColor: 'border-emerald-300',
        bgColor: 'bg-emerald-50',
        indicator: 'bg-emerald-600',
      };
    case 'partial':
      return {
        label: 'Abono parcial',
        desc: 'Con aplicaciones y saldo pendiente',
        textColor: 'text-amber-800',
        borderColor: 'border-amber-300',
        bgColor: 'bg-amber-50',
        indicator: 'bg-amber-600',
      };
    case 'pending':
    default:
      return {
        label: 'Pendiente',
        desc: 'Sin aplicaciones registradas',
        textColor: 'text-slate-700',
        borderColor: 'border-slate-300',
        bgColor: 'bg-slate-100',
        indicator: 'bg-slate-400',
      };
  }
}

/**
 * Etiquetas de estado de revisión (Sección 6)
 * Totalmente independiente del estado de pago
 */
export function getReviewStatusInfo(status: ReviewStatus) {
  switch (status) {
    case 'not_reviewed':
      return {
        label: 'No revisada',
        textColor: 'text-slate-600',
        bgColor: 'bg-slate-100',
        borderColor: 'border-slate-200',
      };
    case 'in_review':
      return {
        label: 'En revisión',
        textColor: 'text-sky-800',
        bgColor: 'bg-sky-50',
        borderColor: 'border-sky-200',
      };
    case 'accepted':
      return {
        label: 'Aceptada',
        textColor: 'text-teal-800',
        bgColor: 'bg-teal-50',
        borderColor: 'border-teal-200',
      };
    case 'disputed':
      return {
        label: 'Con glosa / Devolución',
        textColor: 'text-rose-800',
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-200',
      };
  }
}

/**
 * Etiquetas para Medios de Pago (Sección 5.4)
 */
export function getPaymentMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case 'bank_transfer':
      return 'Transferencia bancaria';
    case 'deposit':
      return 'Consignación';
    case 'cash':
      return 'Efectivo';
    case 'card':
      return 'Tarjeta';
    case 'other':
      return 'Otro medio';
    default:
      return method;
  }
}

/**
 * Etiquetas para Tipos de Pagador (Sección 5.2)
 */
export function getPayerTypeBadge(type: PayerType) {
  switch (type) {
    case 'EPS':
      return { label: 'EPS', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    case 'Aseguradora':
      return { label: 'Aseguradora', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
    case 'Particular':
      return { label: 'Particular', color: 'text-slate-700 bg-slate-100 border-slate-200' };
  }
}
