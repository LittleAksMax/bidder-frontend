// src/api/requests.ts

import { TokenPair, User } from './auth.types';

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

export type AttachPolicyRequest = {
  adgroup_id: string;
  campaign_id: string;
  policy_id: string;
  profile_id: number;
  is_live: boolean;
};

export type DetachPolicyRequest = {
  adgroup_id: string;
  campaign_id: string;
  profile_id: number;
};

export type PolicyAssignmentInput = {
  profileId: number;
  campaignId: string;
  adgroupId: string;
  policyId: string;
  isLive: boolean;
};

export type ConvertResponse<T> = {
  result: T | null;
  errorMessage: string | null;
};
