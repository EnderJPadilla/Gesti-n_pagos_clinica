/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Clase de Error de API unificada para el cliente HTTP.
 * Proporciona tipado estricto, correlación de solicitudes y mensajes amigables
 * sin exponer secretos, contraseñas ni detalles de infraestructura.
 */

import { ApiErrorCode, ApiErrorPayload } from '../../types/api.types';

export class ApiClientError extends Error implements ApiErrorPayload {
  public readonly code: ApiErrorCode;
  public readonly status?: number;
  public readonly fieldErrors?: Record<string, string>;
  public readonly correlationId?: string;
  public readonly timestamp: string;

  constructor(payload: {
    message: string;
    code: ApiErrorCode;
    status?: number;
    fieldErrors?: Record<string, string>;
    correlationId?: string;
  }) {
    super(payload.message);
    this.name = 'ApiClientError';
    this.code = payload.code;
    this.status = payload.status;
    this.fieldErrors = payload.fieldErrors;
    this.correlationId = payload.correlationId;
    this.timestamp = new Date().toISOString();

    // Mantener prototipo en ES5/ES6
    Object.setPrototypeOf(this, ApiClientError.prototype);
  }

  get isUnauthorized(): boolean {
    return this.code === 'UNAUTHORIZED' || this.status === 401;
  }

  get isForbidden(): boolean {
    return this.code === 'FORBIDDEN' || this.status === 403;
  }

  get isNotFound(): boolean {
    return this.code === 'NOT_FOUND' || this.status === 404;
  }

  get isValidation(): boolean {
    return this.code === 'VALIDATION_ERROR' || this.status === 422 || this.status === 400;
  }

  get isNetworkError(): boolean {
    return this.code === 'NETWORK_ERROR';
  }

  get isTimeout(): boolean {
    return this.code === 'TIMEOUT_ERROR';
  }

  /**
   * Genera un mensaje comprensible en español para presentar al usuario final
   */
  public getUserFriendlyMessage(): string {
    if (this.isUnauthorized) {
      return 'Sesión expirada o no autorizada. Por favor, inicia sesión nuevamente.';
    }
    if (this.isForbidden) {
      return 'No tienes los permisos necesarios para realizar esta acción financiera.';
    }
    if (this.isNotFound) {
      return this.message || 'El registro solicitado no fue encontrado en el sistema.';
    }
    if (this.code === 'DUPLICATE_REFERENCE') {
      return this.message || 'La referencia o número de factura ya se encuentra registrada para este pagador.';
    }
    if (this.code === 'INSUFFICIENT_RECEIVABLE_BALANCE') {
      return this.message || 'El importe ingresado supera el saldo pendiente disponible de la cuenta.';
    }
    if (this.code === 'PAYMENT_ALREADY_REVERSED') {
      return this.message || 'Este pago ya fue revertido con anterioridad y no puede modificarse.';
    }
    if (this.isNetworkError) {
      return 'No fue posible conectar con el servidor. Revisa tu conexión a internet o intenta nuevamente.';
    }
    if (this.isTimeout) {
      return 'El servidor tardó demasiado tiempo en responder. La operación fue cancelada por seguridad.';
    }
    return this.message || 'Ocurrió un error inesperado al procesar la solicitud.';
  }

  /**
   * Fábrica para construir un ApiClientError a partir de una respuesta HTTP
   */
  public static fromHttpResponse(
    res: Response,
    body: any,
    correlationId?: string
  ): ApiClientError {
    let code: ApiErrorCode = 'SERVER_ERROR';

    if (res.status === 401) code = 'UNAUTHORIZED';
    else if (res.status === 403) code = 'FORBIDDEN';
    else if (res.status === 404) code = 'NOT_FOUND';
    else if (res.status === 409) code = 'IDEMPOTENCY_CONFLICT';
    else if (res.status === 422 || res.status === 400) code = 'VALIDATION_ERROR';

    // Si el backend envió un código explícito en el cuerpo
    if (body?.code && typeof body.code === 'string') {
      code = body.code as ApiErrorCode;
    }

    const message =
      body?.message ||
      (res.status === 401
        ? 'No fue posible iniciar sesión. Verifica tus credenciales.'
        : res.statusText || 'Error en la solicitud al servidor');

    return new ApiClientError({
      message,
      code,
      status: res.status,
      fieldErrors: body?.fieldErrors,
      correlationId: correlationId || res.headers.get('x-correlation-id') || undefined,
    });
  }

  /**
   * Fábrica para errores de red
   */
  public static fromNetwork(err: any, correlationId?: string): ApiClientError {
    return new ApiClientError({
      message: 'Error de conexión de red con el servidor backend.',
      code: 'NETWORK_ERROR',
      correlationId,
    });
  }

  /**
   * Fábrica para timeouts
   */
  public static fromTimeout(timeoutMs: number, correlationId?: string): ApiClientError {
    return new ApiClientError({
      message: `La solicitud superó el límite de tiempo de espera (${timeoutMs / 1000}s).`,
      code: 'TIMEOUT_ERROR',
      correlationId,
    });
  }
}
