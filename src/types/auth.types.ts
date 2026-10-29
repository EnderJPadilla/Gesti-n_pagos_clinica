/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile } from './user.types';

export interface LoginCredentialsDto {
  usernameOrEmail: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthSession {
  user: UserProfile;
  token?: string;
  authenticatedAt: string;
  mode: 'demo' | 'api';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserProfile;
  token?: string;
  expiresIn?: number;
}
