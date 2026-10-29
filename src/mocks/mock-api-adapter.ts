/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Adaptador de Datos Simulado en Memoria (Mock API Adapter).
 * Implementa las 22 reglas de negocio contables (R01 a R22) en memoria
 * para permitir la operación completa del frontend sin requerir un backend activo.
 */

import {
  AuditLog,
  CreatePayerDto,
  CreatePaymentDto,
  CreateReceivableDto,
  DashboardSummary,
  PaginatedResponse,
  Payer,
  Payment,
  PaymentsFilterParams,
  PeriodFilter,
  Receivable,
  ReceivablesFilterParams,
  TopDebtor,
  UpdatePayerDto,
  UpdateReceivableDto,
  UserProfile,
  UserRole,
} from '../types';
import { ApiClientError } from '../lib/api/api-error';
import {
  centsToDecimalString,
  getTodayBogota,
  toCents,
} from '../utils/formatters';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_PAYERS,
  INITIAL_PAYMENTS,
  INITIAL_RECEIVABLES,
} from './mock-data';

export class MockApiAdapter {
  private payers: Payer[] = JSON.parse(JSON.stringify(INITIAL_PAYERS));
  private receivables: Receivable[] = JSON.parse(JSON.stringify(INITIAL_RECEIVABLES));
  private payments: Payment[] = JSON.parse(JSON.stringify(INITIAL_PAYMENTS));
  private auditLogs: AuditLog[] = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
  private idempotencyKeys: Set<string> = new Set();

  private simulateDelay(ms = 120): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public async resetData(): Promise<void> {
    await this.simulateDelay(50);
    this.payers = JSON.parse(JSON.stringify(INITIAL_PAYERS));
    this.receivables = JSON.parse(JSON.stringify(INITIAL_RECEIVABLES));
    this.payments = JSON.parse(JSON.stringify(INITIAL_PAYMENTS));
    this.auditLogs = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
    this.idempotencyKeys.clear();
    this.recalculateAllBalances();
  }

  /**
   * Recalcula los saldos derivados asegurando consistencia matemática (R03, R04, R05, R06, R07)
   */
  public recalculateAllBalances(): void {
    const today = getTodayBogota();

    // 1. Cuentas por cobrar
    this.receivables.forEach((rec) => {
      const origCents = toCents(rec.originalAmount);
      const allocCents = toCents(rec.allocatedAmount);
      const pendingCents = Math.max(0, origCents - allocCents);
      rec.pendingBalance = centsToDecimalString(pendingCents);

      if (pendingCents === 0) {
        rec.paymentStatus = 'paid';
      } else if (allocCents > 0) {
        rec.paymentStatus = 'partial';
      } else {
        rec.paymentStatus = 'pending';
      }

      rec.isOverdue = pendingCents > 0 && !!rec.dueDate && rec.dueDate < today;
    });

    // 2. Pagadores
    this.payers.forEach((payer) => {
      const payerRecs = this.receivables.filter((r) => r.payerId === payer.id);
      let totalPendingCents = 0;
      let totalOverdueCents = 0;
      let openCount = 0;

      payerRecs.forEach((r) => {
        const pend = toCents(r.pendingBalance);
        if (pend > 0) {
          totalPendingCents += pend;
          openCount += 1;
          if (r.isOverdue) {
            totalOverdueCents += pend;
          }
        }
      });

      payer.pendingBalance = centsToDecimalString(totalPendingCents);
      payer.overdueBalance = centsToDecimalString(totalOverdueCents);
      payer.openReceivablesCount = openCount;
    });
  }

  // --- Módulo Auth ---
  public async getMe(): Promise<UserProfile> {
    await this.simulateDelay();
    return {
      id: 'usr-admin-01',
      name: 'Dra. Andrea Morales',
      email: 'admin@clinica-demo.local',
      role: 'admin',
      roleTitle: 'Tesorera y Administradora Financiera',
    };
  }

  // --- Módulo Pagadores ---
  public async getPayers(params?: { search?: string; type?: string; isActive?: boolean }): Promise<Payer[]> {
    await this.simulateDelay();
    this.recalculateAllBalances();

    return this.payers.filter((p) => {
      if (params?.type && p.type !== params.type) return false;
      if (params?.isActive !== undefined && p.isActive !== params.isActive) return false;
      if (params?.search) {
        const q = params.search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          (p.idNumber && p.idNumber.toLowerCase().includes(q)) ||
          (p.contactName && p.contactName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }

  public async getPayerById(id: string): Promise<Payer> {
    await this.simulateDelay();
    this.recalculateAllBalances();
    const payer = this.payers.find((p) => p.id === id);
    if (!payer) {
      throw new ApiClientError({
        message: `El pagador solicitado (${id}) no fue encontrado.`,
        code: 'NOT_FOUND',
        status: 404,
      });
    }
    return payer;
  }

  public async createPayer(dto: CreatePayerDto, actor = 'Usuario', role: UserRole = 'admin'): Promise<Payer> {
    await this.simulateDelay();
    if (role !== 'admin') {
      throw new ApiClientError({
        message: 'No tienes permisos de administrador para crear pagadores.',
        code: 'FORBIDDEN',
        status: 403,
      });
    }

    if (!dto.name?.trim()) {
      throw new ApiClientError({
        message: 'El nombre o razón social del pagador es obligatorio.',
        code: 'VALIDATION_ERROR',
        status: 422,
        fieldErrors: { name: 'Campo obligatorio' },
      });
    }

    const newPayer: Payer = {
      id: `payer-${Date.now()}`,
      name: dto.name.trim(),
      type: dto.type,
      idType: dto.idType,
      idNumber: dto.idNumber?.trim(),
      contactName: dto.contactName?.trim(),
      email: dto.email?.trim(),
      phone: dto.phone?.trim(),
      notes: dto.notes?.trim(),
      isActive: dto.isActive !== false,
      pendingBalance: '0.00',
      overdueBalance: '0.00',
      openReceivablesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.payers.unshift(newPayer);

    this.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: actor,
      userRole: role,
      action: 'CREACION_PAGADOR',
      entityType: 'payer',
      entityReference: newPayer.name,
      reason: `Alta de pagador tipo ${newPayer.type}`,
    });

    return newPayer;
  }

  public async updatePayer(id: string, dto: UpdatePayerDto, actor = 'Usuario', role: UserRole = 'admin'): Promise<Payer> {
    await this.simulateDelay();
    if (role !== 'admin') {
      throw new ApiClientError({
        message: 'No tienes permisos de administrador para editar pagadores.',
        code: 'FORBIDDEN',
        status: 403,
      });
    }

    const payer = this.payers.find((p) => p.id === id);
    if (!payer) {
      throw new ApiClientError({
        message: 'Pagador no encontrado.',
        code: 'NOT_FOUND',
        status: 404,
      });
    }

    if (dto.name !== undefined && !dto.name.trim()) {
      throw new ApiClientError({
        message: 'El nombre no puede estar vacío.',
        code: 'VALIDATION_ERROR',
        status: 422,
        fieldErrors: { name: 'Campo obligatorio' },
      });
    }

    Object.assign(payer, {
      ...dto,
      name: dto.name !== undefined ? dto.name.trim() : payer.name,
      updatedAt: new Date().toISOString(),
    });

    this.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: actor,
      userRole: role,
      action: 'EDICION_PAGADOR',
      entityType: 'payer',
      entityReference: payer.name,
      reason: 'Actualización de datos generales o de contacto',
    });

    return payer;
  }

  // --- Módulo Cuentas por Cobrar ---
  public async getReceivables(params?: ReceivablesFilterParams): Promise<PaginatedResponse<Receivable>> {
    await this.simulateDelay();
    this.recalculateAllBalances();

    let filtered = [...this.receivables];

    if (params?.payerId) {
      filtered = filtered.filter((r) => r.payerId === params.payerId);
    }
    if (params?.paymentStatus) {
      filtered = filtered.filter((r) => r.paymentStatus === params.paymentStatus);
    }
    if (params?.reviewStatus) {
      filtered = filtered.filter((r) => r.reviewStatus === params.reviewStatus);
    }
    if (params?.overdue !== undefined) {
      filtered = filtered.filter((r) => r.isOverdue === params.overdue);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.referenceNumber.toLowerCase().includes(q) ||
          r.payerName.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q))
      );
    }

    const sortBy = params?.sortBy || 'issueDate';
    const sortOrder = params?.sortOrder || 'desc';

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'balance') {
        comparison = toCents(a.pendingBalance) - toCents(b.pendingBalance);
      } else if (sortBy === 'issueDate') {
        comparison = new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime();
      } else if (sortBy === 'dueDate') {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        comparison = dateA - dateB;
      } else if (sortBy === 'reference') {
        comparison = a.referenceNumber.localeCompare(b.referenceNumber);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    return { data, total, page, pageSize, totalPages };
  }

  public async getReceivableById(id: string): Promise<Receivable> {
    await this.simulateDelay();
    this.recalculateAllBalances();
    const rec = this.receivables.find((r) => r.id === id);
    if (!rec) {
      throw new ApiClientError({
        message: 'Cuenta por cobrar no encontrada.',
        code: 'NOT_FOUND',
        status: 404,
      });
    }
    return rec;
  }

  public async createReceivable(
    dto: CreateReceivableDto,
    actor = 'Usuario',
    role: UserRole = 'admin'
  ): Promise<Receivable> {
    await this.simulateDelay();
    if (role !== 'admin') {
      throw new ApiClientError({
        message: 'No tienes permisos para registrar cuentas por cobrar.',
        code: 'FORBIDDEN',
        status: 403,
      });
    }

    const payer = this.payers.find((p) => p.id === dto.payerId);
    if (!payer) {
      throw new ApiClientError({
        message: 'El pagador seleccionado no existe.',
        code: 'VALIDATION_ERROR',
        status: 422,
        fieldErrors: { payerId: 'Seleccione un pagador válido' },
      });
    }

    const origCents = toCents(dto.originalAmount);
    if (origCents <= 0) {
      throw new ApiClientError({
        message: 'El valor original debe ser mayor que cero en pesos colombianos (COP).',
        code: 'VALIDATION_ERROR',
        status: 422,
        fieldErrors: { originalAmount: 'Debe ser un valor positivo mayor a 0' },
      });
    }

    if (!dto.referenceNumber?.trim()) {
      throw new ApiClientError({
        message: 'La referencia de factura o cuenta es obligatoria.',
        code: 'VALIDATION_ERROR',
        status: 422,
        fieldErrors: { referenceNumber: 'Campo obligatorio' },
      });
    }

    const existingRef = this.receivables.find(
      (r) => r.payerId === dto.payerId && r.referenceNumber.toLowerCase() === dto.referenceNumber.trim().toLowerCase()
    );
    if (existingRef) {
      throw new ApiClientError({
        message: `El pagador ${payer.name} ya tiene registrada una cuenta con la referencia ${dto.referenceNumber}.`,
        code: 'DUPLICATE_REFERENCE',
        status: 409,
        fieldErrors: { referenceNumber: 'Referencia ya registrada para este pagador' },
      });
    }

    if (!dto.issueDate) {
      throw new ApiClientError({
        message: 'La fecha de emisión/registro es obligatoria.',
        code: 'VALIDATION_ERROR',
        status: 422,
        fieldErrors: { issueDate: 'Campo obligatorio' },
      });
    }

    const today = getTodayBogota();
    const isOverdue = !!dto.dueDate && dto.dueDate < today;

    const newReceivable: Receivable = {
      id: `rec-${Date.now()}`,
      payerId: payer.id,
      payerName: payer.name,
      payerType: payer.type,
      referenceNumber: dto.referenceNumber.trim(),
      description: dto.description?.trim(),
      issueDate: dto.issueDate,
      dueDate: dto.dueDate || undefined,
      originalAmount: centsToDecimalString(origCents),
      allocatedAmount: '0.00',
      pendingBalance: centsToDecimalString(origCents),
      paymentStatus: 'pending',
      reviewStatus: dto.reviewStatus || 'not_reviewed',
      isOverdue,
      notes: dto.notes?.trim(),
      currency: 'COP',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      allocations: [],
    };

    this.receivables.unshift(newReceivable);
    this.recalculateAllBalances();

    this.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: actor,
      userRole: role,
      action: 'CREACION_CUENTA_COBRAR',
      entityType: 'receivable',
      entityReference: newReceivable.referenceNumber,
      reason: `Registro de factura por $ ${origCents / 100} para ${payer.name}`,
    });

    return newReceivable;
  }

  public async updateReceivable(
    id: string,
    dto: UpdateReceivableDto,
    actor = 'Usuario',
    role: UserRole = 'admin'
  ): Promise<Receivable> {
    await this.simulateDelay();
    if (role !== 'admin') {
      throw new ApiClientError({
        message: 'No tienes permisos para modificar cuentas por cobrar.',
        code: 'FORBIDDEN',
        status: 403,
      });
    }

    const rec = this.receivables.find((r) => r.id === id);
    if (!rec) {
      throw new ApiClientError({
        message: 'Cuenta no encontrada.',
        code: 'NOT_FOUND',
        status: 404,
      });
    }

    if (dto.description !== undefined) rec.description = dto.description.trim();
    if (dto.dueDate !== undefined) rec.dueDate = dto.dueDate;
    if (dto.reviewStatus !== undefined) rec.reviewStatus = dto.reviewStatus;
    if (dto.notes !== undefined) rec.notes = dto.notes.trim();

    rec.updatedAt = new Date().toISOString();
    this.recalculateAllBalances();

    this.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: actor,
      userRole: role,
      action: 'EDICION_CUENTA_COBRAR',
      entityType: 'receivable',
      entityReference: rec.referenceNumber,
      reason: `Actualización de cuenta (${dto.reviewStatus ? `Estado de revisión: ${dto.reviewStatus}` : 'Datos generales'})`,
    });

    return rec;
  }

  // --- Módulo Pagos ---
  public async getPayments(params?: PaymentsFilterParams): Promise<PaginatedResponse<Payment>> {
    await this.simulateDelay();

    let filtered = [...this.payments];

    if (params?.payerId) {
      filtered = filtered.filter((p) => p.payerId === params.payerId);
    }
    if (params?.paymentMethod) {
      filtered = filtered.filter((p) => p.paymentMethod === params.paymentMethod);
    }
    if (params?.status) {
      filtered = filtered.filter((p) => p.status === params.status);
    }
    if (params?.from) {
      filtered = filtered.filter((p) => p.receivedAt.split('T')[0] >= params.from!);
    }
    if (params?.to) {
      filtered = filtered.filter((p) => p.receivedAt.split('T')[0] <= params.to!);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.payerName.toLowerCase().includes(q) ||
          (p.reference && p.reference.toLowerCase().includes(q)) ||
          (p.notes && p.notes.toLowerCase().includes(q))
      );
    }

    filtered.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());

    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    return { data, total, page, pageSize, totalPages };
  }

  public async getPaymentById(id: string): Promise<Payment> {
    await this.simulateDelay();
    const payment = this.payments.find((p) => p.id === id);
    if (!payment) {
      throw new ApiClientError({
        message: 'Pago no encontrado.',
        code: 'NOT_FOUND',
        status: 404,
      });
    }
    return payment;
  }

  public async createPayment(
    dto: CreatePaymentDto,
    idempotencyKey?: string,
    actor = 'Usuario',
    role: UserRole = 'admin'
  ): Promise<Payment> {
    await this.simulateDelay();
    if (role !== 'admin') {
      throw new ApiClientError({
        message: 'No tienes permisos para registrar pagos.',
        code: 'FORBIDDEN',
        status: 403,
      });
    }

    if (idempotencyKey) {
      if (this.idempotencyKeys.has(idempotencyKey)) {
        throw new ApiClientError({
          message: 'Esta transacción ya fue procesada previamente con la misma clave de idempotencia.',
          code: 'IDEMPOTENCY_CONFLICT',
          status: 409,
        });
      }
      this.idempotencyKeys.add(idempotencyKey);
    }

    const paymentTotalCents = toCents(dto.amount);
    if (paymentTotalCents <= 0) {
      throw new ApiClientError({
        message: 'El valor recibido debe ser mayor que cero.',
        code: 'VALIDATION_ERROR',
        status: 422,
        fieldErrors: { amount: 'Monto debe ser positivo' },
      });
    }

    const payer = this.payers.find((p) => p.id === dto.payerId);
    if (!payer) {
      throw new ApiClientError({
        message: 'El pagador no es válido.',
        code: 'VALIDATION_ERROR',
        status: 422,
        fieldErrors: { payerId: 'Seleccione un pagador válido' },
      });
    }

    if (!dto.receivedAt) {
      throw new ApiClientError({
        message: 'La fecha efectiva de recepción es obligatoria.',
        code: 'VALIDATION_ERROR',
        status: 422,
        fieldErrors: { receivedAt: 'Campo obligatorio' },
      });
    }

    const rawAllocations = dto.allocations || [];
    let sumAllocCents = 0;
    const finalAllocations: Payment['allocations'] = [];

    for (const alloc of rawAllocations) {
      const allocCents = toCents(alloc.amount);
      if (allocCents <= 0) continue;

      const rec = this.receivables.find((r) => r.id === alloc.receivableId);
      if (!rec) {
        throw new ApiClientError({
          message: `Cuenta por cobrar (${alloc.receivableId}) no encontrada.`,
          code: 'NOT_FOUND',
          status: 404,
        });
      }

      if (rec.payerId !== payer.id) {
        throw new ApiClientError({
          message: `La cuenta ${rec.referenceNumber} no pertenece al pagador ${payer.name}.`,
          code: 'VALIDATION_ERROR',
          status: 422,
        });
      }

      const currentPendingCents = toCents(rec.pendingBalance);
      if (allocCents > currentPendingCents) {
        throw new ApiClientError({
          message: `El valor a aplicar ($ ${allocCents / 100}) supera el saldo disponible ($ ${currentPendingCents / 100}) de la cuenta ${rec.referenceNumber}.`,
          code: 'INSUFFICIENT_RECEIVABLE_BALANCE',
          status: 422,
        });
      }

      sumAllocCents += allocCents;
      finalAllocations.push({
        receivableId: rec.id,
        amount: centsToDecimalString(allocCents),
        receivableReference: rec.referenceNumber,
        receivableDescription: rec.description,
      });
    }

    if (sumAllocCents > paymentTotalCents) {
      throw new ApiClientError({
        message: 'La suma de las aplicaciones no puede superar el valor total del pago recibido.',
        code: 'VALIDATION_ERROR',
        status: 422,
      });
    }

    const unallocatedCents = paymentTotalCents - sumAllocCents;
    const paymentId = `pay-${Date.now()}`;

    const newPayment: Payment = {
      id: paymentId,
      payerId: payer.id,
      payerName: payer.name,
      receivedAt: dto.receivedAt,
      amount: centsToDecimalString(paymentTotalCents),
      allocatedAmount: centsToDecimalString(sumAllocCents),
      unallocatedAmount: centsToDecimalString(unallocatedCents),
      paymentMethod: dto.paymentMethod,
      reference: dto.reference?.trim(),
      notes: dto.notes?.trim(),
      status: 'confirmed',
      createdBy: actor,
      createdAt: new Date().toISOString(),
      currency: 'COP',
      allocations: finalAllocations,
    };

    finalAllocations.forEach((alloc) => {
      const rec = this.receivables.find((r) => r.id === alloc.receivableId)!;
      const recAllocCents = toCents(rec.allocatedAmount) + toCents(alloc.amount);
      rec.allocatedAmount = centsToDecimalString(recAllocCents);
      rec.allocations.push({
        id: `alloc-${Date.now()}-${Math.random()}`,
        paymentId: newPayment.id,
        paymentReference: newPayment.reference || 'Sin ref',
        receivedAt: newPayment.receivedAt,
        amount: alloc.amount,
        paymentMethod: newPayment.paymentMethod,
      });
    });

    this.payments.unshift(newPayment);
    this.recalculateAllBalances();

    this.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: actor,
      userRole: role,
      action: finalAllocations.length === 0 ? 'REGISTRO_PAGO_SIN_ASIGNAR' : 'REGISTRO_PAGO_Y_APLICACION',
      entityType: 'payment',
      entityReference: newPayment.reference || newPayment.id,
      reason:
        finalAllocations.length === 0
          ? `Pago de $ ${paymentTotalCents / 100} registrado sin asignar`
          : `Pago distribuido en ${finalAllocations.length} cuenta(s). Saldo sin asignar: $ ${unallocatedCents / 100}`,
      metadata: {
        valorTotal: `$ ${paymentTotalCents / 100}`,
        pagador: payer.name,
      },
    });

    return newPayment;
  }

  public async reversePayment(
    id: string,
    reason: string,
    actor = 'Usuario',
    role: UserRole = 'admin'
  ): Promise<Payment> {
    await this.simulateDelay();
    if (role !== 'admin') {
      throw new ApiClientError({
        message: 'Solo los usuarios con rol Administrador pueden solicitar la reversión de un pago.',
        code: 'FORBIDDEN',
        status: 403,
      });
    }

    if (!reason?.trim() || reason.trim().length < 5) {
      throw new ApiClientError({
        message: 'Debe especificar un motivo detallado de reversión (mínimo 5 caracteres).',
        code: 'VALIDATION_ERROR',
        status: 422,
        fieldErrors: { reason: 'Motivo obligatorio' },
      });
    }

    const payment = this.payments.find((p) => p.id === id);
    if (!payment) {
      throw new ApiClientError({
        message: 'Pago no encontrado.',
        code: 'NOT_FOUND',
        status: 404,
      });
    }

    if (payment.status === 'reversed') {
      throw new ApiClientError({
        message: 'Este pago ya se encuentra revertido previamente.',
        code: 'PAYMENT_ALREADY_REVERSED',
        status: 409,
      });
    }

    payment.status = 'reversed';
    payment.reversal = {
      reversedAt: new Date().toISOString(),
      reversedBy: actor,
      reason: reason.trim(),
    };

    payment.allocations.forEach((alloc) => {
      const rec = this.receivables.find((r) => r.id === alloc.receivableId);
      if (rec) {
        const allocCents = toCents(alloc.amount);
        const currentAllocCents = toCents(rec.allocatedAmount);
        const restoredAllocCents = Math.max(0, currentAllocCents - allocCents);
        rec.allocatedAmount = centsToDecimalString(restoredAllocCents);
        rec.allocations = rec.allocations.filter((a) => a.paymentId !== payment.id);
      }
    });

    this.recalculateAllBalances();

    this.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: actor,
      userRole: role,
      action: 'REVERSION_PAGO',
      entityType: 'reversal',
      entityReference: payment.reference || payment.id,
      reason: `Reversión autorizada: "${reason.trim()}" - Cuentas restauradas`,
      metadata: {
        valorRevertido: `$ ${toCents(payment.amount) / 100}`,
        pagador: payment.payerName,
      },
    });

    return payment;
  }

  public async allocatePayment(
    paymentId: string,
    allocations: { receivableId: string; amount: string }[],
    actor = 'Usuario',
    role: UserRole = 'admin'
  ): Promise<Payment> {
    await this.simulateDelay();
    if (role !== 'admin') {
      throw new ApiClientError({
        message: 'No tienes permisos para aplicar pagos.',
        code: 'FORBIDDEN',
        status: 403,
      });
    }

    const payment = this.payments.find((p) => p.id === paymentId);
    if (!payment) {
      throw new ApiClientError({
        message: 'Pago no encontrado.',
        code: 'NOT_FOUND',
        status: 404,
      });
    }

    if (payment.status === 'reversed') {
      throw new ApiClientError({
        message: 'No es posible aplicar un pago que ha sido revertido.',
        code: 'VALIDATION_ERROR',
        status: 422,
      });
    }

    const unallocCents = toCents(payment.unallocatedAmount);
    let newAllocTotalCents = 0;

    for (const item of allocations) {
      const itemCents = toCents(item.amount);
      if (itemCents <= 0) continue;

      const rec = this.receivables.find((r) => r.id === item.receivableId);
      if (!rec) {
        throw new ApiClientError({ message: 'Cuenta no encontrada.', code: 'NOT_FOUND', status: 404 });
      }
      if (rec.payerId !== payment.payerId) {
        throw new ApiClientError({
          message: 'La cuenta no pertenece al mismo pagador del pago.',
          code: 'VALIDATION_ERROR',
          status: 422,
        });
      }

      const recPendingCents = toCents(rec.pendingBalance);
      if (itemCents > recPendingCents) {
        throw new ApiClientError({
          message: `El monto excede el saldo pendiente ($ ${recPendingCents / 100}) de la cuenta ${rec.referenceNumber}.`,
          code: 'INSUFFICIENT_RECEIVABLE_BALANCE',
          status: 422,
        });
      }

      newAllocTotalCents += itemCents;
    }

    if (newAllocTotalCents > unallocCents) {
      throw new ApiClientError({
        message: `El total a aplicar ($ ${newAllocTotalCents / 100}) supera el saldo sin asignar disponible ($ ${unallocCents / 100}).`,
        code: 'VALIDATION_ERROR',
        status: 422,
      });
    }

    allocations.forEach((item) => {
      const itemCents = toCents(item.amount);
      if (itemCents <= 0) return;

      const rec = this.receivables.find((r) => r.id === item.receivableId)!;
      rec.allocatedAmount = centsToDecimalString(toCents(rec.allocatedAmount) + itemCents);
      rec.allocations.push({
        id: `alloc-${Date.now()}-${Math.random()}`,
        paymentId: payment.id,
        paymentReference: payment.reference || 'Sin ref',
        receivedAt: payment.receivedAt,
        amount: item.amount,
        paymentMethod: payment.paymentMethod,
      });

      payment.allocations.push({
        receivableId: rec.id,
        amount: item.amount,
        receivableReference: rec.referenceNumber,
        receivableDescription: rec.description,
      });
    });

    const finalAllocCents = toCents(payment.allocatedAmount) + newAllocTotalCents;
    const finalUnallocCents = toCents(payment.amount) - finalAllocCents;
    payment.allocatedAmount = centsToDecimalString(finalAllocCents);
    payment.unallocatedAmount = centsToDecimalString(finalUnallocCents);

    this.recalculateAllBalances();

    this.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: actor,
      userRole: role,
      action: 'APLICACION_PAGO_POSTERIOR',
      entityType: 'payment',
      entityReference: payment.reference || payment.id,
      reason: `Aplicación de $ ${newAllocTotalCents / 100} de saldo sin asignar`,
    });

    return payment;
  }

  // --- Módulo Dashboard ---
  public async getDashboardSummary(params?: {
    period?: PeriodFilter;
    from?: string;
    to?: string;
  }): Promise<DashboardSummary> {
    await this.simulateDelay();
    this.recalculateAllBalances();

    const todayStr = getTodayBogota();
    const activePayments = this.payments.filter((p) => p.status === 'confirmed');

    const todayDate = new Date(todayStr + 'T00:00:00');
    const dayOfWeek = todayDate.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(todayDate);
    monday.setDate(todayDate.getDate() + diffToMonday);
    const mondayStr = monday.toISOString().split('T')[0];

    const firstDayOfMonthStr = `${todayStr.substring(0, 7)}-01`;

    let receivedTodayCents = 0;
    let receivedThisWeekCents = 0;
    let receivedThisMonthCents = 0;
    let receivedPeriodCents = 0;
    let unallocatedPaymentsCents = 0;
    let unallocatedCount = 0;

    const period = params?.period || 'today';
    const customFrom = params?.from;
    const customTo = params?.to;

    activePayments.forEach((p) => {
      const pDate = p.receivedAt.split('T')[0];
      const pCents = toCents(p.amount);
      const unallocCents = toCents(p.unallocatedAmount);

      if (unallocCents > 0) {
        unallocatedPaymentsCents += unallocCents;
        unallocatedCount += 1;
      }

      if (pDate === todayStr) receivedTodayCents += pCents;
      if (pDate >= mondayStr && pDate <= todayStr) receivedThisWeekCents += pCents;
      if (pDate >= firstDayOfMonthStr && pDate <= todayStr) receivedThisMonthCents += pCents;

      if (period === 'today' && pDate === todayStr) {
        receivedPeriodCents += pCents;
      } else if (period === 'week' && pDate >= mondayStr && pDate <= todayStr) {
        receivedPeriodCents += pCents;
      } else if (period === 'month' && pDate >= firstDayOfMonthStr && pDate <= todayStr) {
        receivedPeriodCents += pCents;
      } else if (period === 'custom' && customFrom && customTo && pDate >= customFrom && pDate <= customTo) {
        receivedPeriodCents += pCents;
      }
    });

    let pendingPortfolioCents = 0;
    let overduePortfolioCents = 0;
    let openCount = 0;

    this.receivables.forEach((r) => {
      const pendingCents = toCents(r.pendingBalance);
      if (pendingCents > 0) {
        pendingPortfolioCents += pendingCents;
        openCount += 1;
        if (r.isOverdue) {
          overduePortfolioCents += pendingCents;
        }
      }
    });

    return {
      receivedToday: centsToDecimalString(receivedTodayCents),
      receivedThisWeek: centsToDecimalString(receivedThisWeekCents),
      receivedThisMonth: centsToDecimalString(receivedThisMonthCents),
      receivedInPeriod: centsToDecimalString(receivedPeriodCents || receivedTodayCents),
      pendingPortfolio: centsToDecimalString(pendingPortfolioCents),
      overduePortfolio: centsToDecimalString(overduePortfolioCents),
      openReceivablesCount: openCount,
      unallocatedPaymentsTotal: centsToDecimalString(unallocatedPaymentsCents),
      unallocatedPaymentsCount: unallocatedCount,
      period,
      from: customFrom,
      to: customTo,
    };
  }

  public async getTopDebtors(): Promise<TopDebtor[]> {
    await this.simulateDelay();
    this.recalculateAllBalances();

    return this.payers
      .filter((p) => toCents(p.pendingBalance) > 0)
      .map((p) => ({
        payerId: p.id,
        payerName: p.name,
        payerType: p.type,
        pendingBalance: p.pendingBalance,
        overdueBalance: p.overdueBalance,
        openReceivablesCount: p.openReceivablesCount,
      }))
      .sort((a, b) => toCents(b.pendingBalance) - toCents(a.pendingBalance));
  }

  public async getRecentPayments(limit = 5): Promise<Payment[]> {
    await this.simulateDelay();
    return [...this.payments]
      .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
      .slice(0, limit);
  }

  // --- Módulo Auditoría ---
  public async getAuditLogs(): Promise<AuditLog[]> {
    await this.simulateDelay();
    return [...this.auditLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}

export const mockApiAdapter = new MockApiAdapter();
