// src/api/requests.ts

import { TokenPair, User } from './types';

// Easier tuple-form of response objects
export type SdkResponse<T> = [boolean, T | null, Error | null];

// Interfaces for request payloads
export interface LoginRequest {
  email: string;
  password: string;
}

// Interfaces for response objects
export interface LoginResponse {
  tokens: TokenPair;
  user: User;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
}

export interface RegisterResponse {
  tokens: TokenPair;
  user: User;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export type RefreshResponse = TokenPair;
