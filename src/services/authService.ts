/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Capa de Autenticación para Control Financiero de Clínica.
 * Separa la autenticación de demostración local de la futura integración con la API REST.
 * No simula un backend real ni genera tokens falsos de producción.
 */

import { AuthSession, LoginCredentialsDto, UserProfile, ApiError } from '../types/api';

export interface IAuthService {
  login(credentials: LoginCredentialsDto): Promise<AuthSession>;
  logout(): Promise<void>;
  getCurrentSession(): Promise<AuthSession | null>;
  getMode(): 'demo' | 'api';
}

/**
 * Credenciales ficticias exclusivas para el entorno de demostración (Sección 3 de la especificación).
 * NUNCA deben utilizarse en un entorno de producción.
 */
export const DEMO_CREDENTIALS = {
  admin: {
    username: 'admin@clinica-demo.local',
    password: 'DemoClinica2026!',
    user: {
      id: 'usr-admin-01',
      name: 'Dra. Andrea Morales',
      email: 'admin@clinica-demo.local',
      role: 'admin' as const,
      roleTitle: 'Tesorera y Administradora Financiera',
    },
  },
  viewer: {
    username: 'gerente@clinica-demo.local',
    password: 'DemoClinica2026!',
    user: {
      id: 'usr-viewer-01',
      name: 'Dr. Roberto Mendoza',
      email: 'gerente@clinica-demo.local',
      role: 'viewer' as const,
      roleTitle: 'Gerente General (Consulta)',
    },
  },
};

/**
 * Servicio de Autenticación de Demostración (In-Memory Demo Auth)
 */
export class DemoAuthService implements IAuthService {
  private currentSession: AuthSession | null = null;

  getMode(): 'demo' | 'api' {
    return 'demo';
  }

  private simulateDelay(ms = 450): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async login(credentials: LoginCredentialsDto): Promise<AuthSession> {
    await this.simulateDelay();

    const usernameClean = credentials.usernameOrEmail.trim().toLowerCase();
    const passwordClean = credentials.password; // No se altera la contraseña

    // Comprobación contra las credenciales ficticias de demostración
    let matchedUser: UserProfile | null = null;

    if (
      usernameClean === DEMO_CREDENTIALS.admin.username.toLowerCase() &&
      passwordClean === DEMO_CREDENTIALS.admin.password
    ) {
      matchedUser = DEMO_CREDENTIALS.admin.user;
    } else if (
      usernameClean === DEMO_CREDENTIALS.viewer.username.toLowerCase() &&
      passwordClean === DEMO_CREDENTIALS.viewer.password
    ) {
      matchedUser = DEMO_CREDENTIALS.viewer.user;
    }

    if (!matchedUser) {
      // Regla de seguridad: Mensaje genérico sin revelar si falló el usuario o la contraseña
      throw {
        code: 'UNAUTHORIZED',
        message: 'No fue posible iniciar sesión. Verifica tus credenciales.',
      } as ApiError;
    }

    // Sesión en memoria temporal (No se guardan contraseñas ni tokens falsos)
    this.currentSession = {
      user: matchedUser,
      authenticatedAt: new Date().toISOString(),
      mode: 'demo',
    };

    return this.currentSession;
  }

  async logout(): Promise<void> {
    await this.simulateDelay(150);
    this.currentSession = null;
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    return this.currentSession;
  }
}

/**
 * Servicio de Autenticación HTTP preparado para la API REST (/api/v1/auth/login)
 */
export class HttpAuthService implements IAuthService {
  private baseUrl = '/api/v1';
  private currentSession: AuthSession | null = null;

  getMode(): 'demo' | 'api' {
    return 'api';
  }

  async login(credentials: LoginCredentialsDto): Promise<AuthSession> {
    const res = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email: credentials.usernameOrEmail.trim(),
        password: credentials.password,
      }),
    });

    if (!res.ok) {
      let errData: any = {};
      try {
        errData = await res.json();
      } catch {
        errData = { message: 'No fue posible iniciar sesión. Verifica tus credenciales.' };
      }
      throw {
        code: errData.code || 'UNAUTHORIZED',
        message: errData.message || 'No fue posible iniciar sesión. Verifica tus credenciales.',
      } as ApiError;
    }

    const data = await res.json();
    this.currentSession = {
      user: data.user,
      token: data.token,
      authenticatedAt: new Date().toISOString(),
      mode: 'api',
    };

    return this.currentSession;
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/auth/logout`, { method: 'POST' });
    } catch {
      // Logout silencioso
    }
    this.currentSession = null;
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    if (this.currentSession) return this.currentSession;
    try {
      const res = await fetch(`${this.baseUrl}/auth/me`);
      if (res.ok) {
        const user = await res.json();
        this.currentSession = {
          user,
          authenticatedAt: new Date().toISOString(),
          mode: 'api',
        };
        return this.currentSession;
      }
    } catch {
      // Sin sesión activa
    }
    return null;
  }
}

/**
 * Modo de autenticación determinado por VITE_AUTH_MODE (por defecto: 'demo')
 */
const authMode = (import.meta as any).env?.VITE_AUTH_MODE || 'demo';

export const authService: IAuthService =
  authMode === 'api' ? new HttpAuthService() : new DemoAuthService();
