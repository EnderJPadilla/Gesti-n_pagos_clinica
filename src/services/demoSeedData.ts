/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Datos de demostración iniciales para el MVP de Control Financiero.
 * Cumple con el Escenario de Prueba de Referencia Contable.
 * Todos los datos están claramente marcados como demostración.
 */

import { Payer, Receivable, Payment, AuditLog } from '../types/api';

// Identificadores consistentes
export const PAYER_EPS_A_ID = 'payer-eps-sanitas';
export const PAYER_ASEGURADORA_B_ID = 'payer-seguros-bolivar';
export const PAYER_EPS_SURA_ID = 'payer-eps-sura';
export const PAYER_PARTICULAR_ID = 'payer-particular-gomez';

export const RECEIVABLE_A_ID = 'rec-cta-a-fac-001';
export const RECEIVABLE_B_ID = 'rec-cta-b-fac-002';
export const RECEIVABLE_C_ID = 'rec-cta-c-fac-003';
export const RECEIVABLE_D_ID = 'rec-cta-d-fac-004';
export const RECEIVABLE_E_ID = 'rec-cta-e-fac-005';

export const INITIAL_PAYERS: Payer[] = [
  {
    id: PAYER_EPS_A_ID,
    name: 'EPS Sanitas S.A.S.',
    type: 'EPS',
    idType: 'NIT',
    idNumber: '800.251.440-6',
    contactName: 'Dra. Claudia Rincón - Cartera Médica',
    email: 'pagos.salud@epssanitas.com.co',
    phone: '+57 (601) 375-9000',
    notes: 'Convenio de atención ambulatoria y hospitalaria 2026.',
    isActive: true,
    pendingBalance: '9000000.00', // $ 7.500.000 (Cta A) + $ 1.500.000 (Cta B)
    overdueBalance: '1500000.00',  // Cuenta B vencida
    openReceivablesCount: 2,
    createdAt: '2026-09-01T08:00:00-05:00',
    updatedAt: '2026-10-29T08:00:00-05:00',
  },
  {
    id: PAYER_ASEGURADORA_B_ID,
    name: 'Seguros Bolívar S.A.',
    type: 'Aseguradora',
    idType: 'NIT',
    idNumber: '860.002.503-2',
    contactName: 'Ing. Mauricio Valencia - Reclamaciones',
    email: 'salud.radicaciones@segurosbolivar.com',
    phone: '+57 (601) 338-8000',
    notes: 'Pólizas de hospitalización y cirugía programada.',
    isActive: true,
    pendingBalance: '2000000.00', // $ 2.000.000 (Cta C)
    overdueBalance: '0.00',
    openReceivablesCount: 1,
    createdAt: '2026-09-15T09:30:00-05:00',
    updatedAt: '2026-10-20T11:15:00-05:00',
  },
  {
    id: PAYER_EPS_SURA_ID,
    name: 'EPS y Medicina Prepagada Suramericana',
    type: 'EPS',
    idType: 'NIT',
    idNumber: '800.088.702-2',
    contactName: 'Dra. Marcela Restrepo',
    email: 'auditoria.cuentas@epssura.com.co',
    phone: '+57 (604) 448-6115',
    notes: 'Pagador puntual con auditoría médica concurrente.',
    isActive: true,
    pendingBalance: '6800000.00',
    overdueBalance: '0.00',
    openReceivablesCount: 1,
    createdAt: '2026-08-10T10:00:00-05:00',
    updatedAt: '2026-10-28T14:20:00-05:00',
  },
  {
    id: PAYER_PARTICULAR_ID,
    name: 'Carlos Eduardo Gómez Londoño',
    type: 'Particular',
    idType: 'CC',
    idNumber: '79.845.120',
    contactName: 'Carlos Gómez (Paciente)',
    email: 'carlos.gomez79@email.com',
    phone: '+57 310 445 8892',
    notes: 'Procedimiento oftalmológico láser particular.',
    isActive: true,
    pendingBalance: '1200000.00',
    overdueBalance: '1200000.00', // Vencida
    openReceivablesCount: 1,
    createdAt: '2026-09-20T16:00:00-05:00',
    updatedAt: '2026-10-25T17:00:00-05:00',
  },
];

export const INITIAL_RECEIVABLES: Receivable[] = [
  // Cuenta A (Escenario Sec. 11): Original $ 10.000.000, Aplicado $ 2.500.000, Saldo $ 7.500.000
  {
    id: RECEIVABLE_A_ID,
    payerId: PAYER_EPS_A_ID,
    payerName: 'EPS Sanitas S.A.S.',
    payerType: 'EPS',
    referenceNumber: 'FAC-2026-00101',
    description: 'Servicios de hospitalización intermedia y cirugía general - Lote 101',
    issueDate: '2026-10-05',
    dueDate: '2026-11-15', // Vigente
    originalAmount: '10000000.00',
    allocatedAmount: '2500000.00',
    pendingBalance: '7500000.00',
    paymentStatus: 'partial',
    reviewStatus: 'accepted',
    isOverdue: false,
    notes: 'Aprobada sin glosas por auditoría médica de Sanitas.',
    currency: 'COP',
    createdAt: '2026-10-05T09:00:00-05:00',
    updatedAt: '2026-10-29T10:00:00-05:00',
    allocations: [
      {
        id: 'alloc-1',
        paymentId: 'pay-001-sec11',
        paymentReference: 'TRX-BCO-99824',
        receivedAt: '2026-10-29T10:00:00-05:00',
        amount: '2500000.00',
        paymentMethod: 'bank_transfer',
      },
    ],
  },
  // Cuenta B (Escenario Sec. 11): Original $ 3.000.000, Aplicado $ 1.500.000, Saldo $ 1.500.000
  {
    id: RECEIVABLE_B_ID,
    payerId: PAYER_EPS_A_ID,
    payerName: 'EPS Sanitas S.A.S.',
    payerType: 'EPS',
    referenceNumber: 'FAC-2026-00089',
    description: 'Urgencias y laboratorio clínico especializado - Septiembre 2026',
    issueDate: '2026-09-10',
    dueDate: '2026-10-15', // Vencida en America/Bogota (hoy es 29 de Octubre 2026)
    originalAmount: '3000000.00',
    allocatedAmount: '1500000.00',
    pendingBalance: '1500000.00',
    paymentStatus: 'partial',
    reviewStatus: 'accepted',
    isOverdue: true,
    notes: 'Se aplicó abono parcial en pago del 29/10/2026.',
    currency: 'COP',
    createdAt: '2026-09-10T14:30:00-05:00',
    updatedAt: '2026-10-29T10:00:00-05:00',
    allocations: [
      {
        id: 'alloc-2',
        paymentId: 'pay-001-sec11',
        paymentReference: 'TRX-BCO-99824',
        receivedAt: '2026-10-29T10:00:00-05:00',
        amount: '1500000.00',
        paymentMethod: 'bank_transfer',
      },
    ],
  },
  // Cuenta C (Escenario Sec. 11): Original $ 2.000.000, Aplicado $ 0, Saldo $ 2.000.000
  {
    id: RECEIVABLE_C_ID,
    payerId: PAYER_ASEGURADORA_B_ID,
    payerName: 'Seguros Bolívar S.A.',
    payerType: 'Aseguradora',
    referenceNumber: 'FAC-2026-00115',
    description: 'Tratamiento ambulatorio ortopédico y terapia de rehabilitación',
    issueDate: '2026-10-18',
    dueDate: '2026-11-20', // Vigente
    originalAmount: '2000000.00',
    allocatedAmount: '0.00',
    pendingBalance: '2000000.00',
    paymentStatus: 'pending',
    reviewStatus: 'in_review',
    isOverdue: false,
    notes: 'Radicado físico entregado en sucursal Bogotá.',
    currency: 'COP',
    createdAt: '2026-10-18T11:00:00-05:00',
    updatedAt: '2026-10-18T11:00:00-05:00',
    allocations: [],
  },
  // Cuenta D: EPS Sura (Vigente con glosa en revisión)
  {
    id: RECEIVABLE_D_ID,
    payerId: PAYER_EPS_SURA_ID,
    payerName: 'EPS y Medicina Prepagada Suramericana',
    payerType: 'EPS',
    referenceNumber: 'FAC-2026-00120',
    description: 'Intervenciones diagnósticas resonancia magnética de alto campo',
    issueDate: '2026-10-12',
    dueDate: '2026-11-28',
    originalAmount: '6800000.00',
    allocatedAmount: '0.00',
    pendingBalance: '6800000.00',
    paymentStatus: 'pending',
    reviewStatus: 'disputed',
    isOverdue: false,
    notes: 'Objeción parcial remitida por soporte de imagenología.',
    currency: 'COP',
    createdAt: '2026-10-12T16:20:00-05:00',
    updatedAt: '2026-10-24T09:10:00-05:00',
    allocations: [],
  },
  // Cuenta E: Paciente Particular (Vencida)
  {
    id: RECEIVABLE_E_ID,
    payerId: PAYER_PARTICULAR_ID,
    payerName: 'Carlos Eduardo Gómez Londoño',
    payerType: 'Particular',
    referenceNumber: 'FAC-2026-00072',
    description: 'Cirugía refractiva LASIK particular bilateral',
    issueDate: '2026-09-18',
    dueDate: '2026-10-10', // Vencida
    originalAmount: '1200000.00',
    allocatedAmount: '0.00',
    pendingBalance: '1200000.00',
    paymentStatus: 'pending',
    reviewStatus: 'not_reviewed',
    isOverdue: true,
    notes: 'Compromiso de pago acordado para final de mes.',
    currency: 'COP',
    createdAt: '2026-09-18T17:00:00-05:00',
    updatedAt: '2026-09-18T17:00:00-05:00',
    allocations: [],
  },
];

export const INITIAL_PAYMENTS: Payment[] = [
  // Pago del Escenario Sec. 11: $ 4.000.000 recibido HOY (29/10/2026)
  {
    id: 'pay-001-sec11',
    payerId: PAYER_EPS_A_ID,
    payerName: 'EPS Sanitas S.A.S.',
    receivedAt: '2026-10-29T10:00:00-05:00', // Hoy
    amount: '4000000.00',
    allocatedAmount: '4000000.00',
    unallocatedAmount: '0.00',
    paymentMethod: 'bank_transfer',
    reference: 'TRX-BCO-99824',
    notes: 'Giro programado quincenal Bancolombia.',
    status: 'confirmed',
    createdBy: 'Dra. Andrea Morales (Tesorera)',
    createdAt: '2026-10-29T10:05:00-05:00',
    currency: 'COP',
    allocations: [
      {
        receivableId: RECEIVABLE_A_ID,
        amount: '2500000.00',
        receivableReference: 'FAC-2026-00101',
        receivableDescription: 'Servicios de hospitalización intermedia y cirugía general',
      },
      {
        receivableId: RECEIVABLE_B_ID,
        amount: '1500000.00',
        receivableReference: 'FAC-2026-00089',
        receivableDescription: 'Urgencias y laboratorio clínico especializado',
      },
    ],
  },
  // Pago sin asignar (Reglas R13 y R14) recibido HOY de EPS Sura
  {
    id: 'pay-002-unallocated',
    payerId: PAYER_EPS_SURA_ID,
    payerName: 'EPS y Medicina Prepagada Suramericana',
    receivedAt: '2026-10-29T11:30:00-05:00', // Hoy
    amount: '3500000.00',
    allocatedAmount: '0.00',
    unallocatedAmount: '3500000.00',
    paymentMethod: 'bank_transfer',
    reference: 'ACH-SURA-77312',
    notes: 'Transferencia directa sin detalle de radicación. Pendiente de aplicar por tesorería.',
    status: 'confirmed',
    createdBy: 'Dra. Andrea Morales (Tesorera)',
    createdAt: '2026-10-29T11:35:00-05:00',
    currency: 'COP',
    allocations: [],
  },
  // Pago de esta semana (hace 2 días)
  {
    id: 'pay-003-earlier-week',
    payerId: PAYER_ASEGURADORA_B_ID,
    payerName: 'Seguros Bolívar S.A.',
    receivedAt: '2026-10-27T15:00:00-05:00',
    amount: '5000000.00',
    allocatedAmount: '5000000.00',
    unallocatedAmount: '0.00',
    paymentMethod: 'deposit',
    reference: 'CONSIG-CTA-44120',
    notes: 'Consignación nacional cheque de gerencia.',
    status: 'confirmed',
    createdBy: 'Dr. Julián Castro (Admin)',
    createdAt: '2026-10-27T15:15:00-05:00',
    currency: 'COP',
    allocations: [],
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-1',
    timestamp: '2026-10-29T11:35:00-05:00',
    user: 'Dra. Andrea Morales',
    userRole: 'admin',
    action: 'REGISTRO_PAGO_SIN_ASIGNAR',
    entityType: 'payment',
    entityReference: 'ACH-SURA-77312',
    reason: 'Giro recibido sin radicación de facturas adjunta (Regla R13)',
    metadata: {
      valor: '$ 3.500.000',
      pagador: 'EPS y Medicina Prepagada Suramericana',
    },
  },
  {
    id: 'audit-2',
    timestamp: '2026-10-29T10:05:00-05:00',
    user: 'Dra. Andrea Morales',
    userRole: 'admin',
    action: 'REGISTRO_PAGO_Y_APLICACION',
    entityType: 'payment',
    entityReference: 'TRX-BCO-99824',
    reason: 'Pago de $4.000.000 distribuido: $2.5M a FAC-2026-00101 y $1.5M a FAC-2026-00089',
    metadata: {
      valorTotal: '$ 4.000.000',
      pagador: 'EPS Sanitas S.A.S.',
    },
  },
  {
    id: 'audit-3',
    timestamp: '2026-10-18T11:00:00-05:00',
    user: 'Dr. Julián Castro',
    userRole: 'admin',
    action: 'CREACION_CUENTA_COBRAR',
    entityType: 'receivable',
    entityReference: 'FAC-2026-00115',
    reason: 'Radicación de cuenta de cobro Seguros Bolívar por $2.000.000',
  },
];
