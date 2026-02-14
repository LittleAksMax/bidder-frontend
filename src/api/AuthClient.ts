import { createApiRequest } from './client';
import {
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  RegisterRequest,
  RegisterResponse,
} from './requests';
import { TokenPair, User } from './types';

class AuthClient {
  private cachedTokens: TokenPair | null = null;
  private cachedUser: User | null = null;

  async login(credentials: LoginRequest): Promise<LoginResponse | null> {
    const [data, err] = await createApiRequest({
      method: 'POST',
      endpoint: '/auth/login',
      body: {
        email: credentials.email,
        password: credentials.password,
      },
    });
    if (err || !data) {
      return null;
    }

    this.cachedTokens = {
      accessToken: data.tokens.access_token,
      refreshToken: data.tokens.refresh_token,
    };
    this.cachedUser = {
      id: data.user.id,
      username: data.user.username,
      email: data.user.email,
      role: data.user.role,
      updatedAt: new Date(data.user.updated_at),
      createdAt: new Date(data.user.created_at),
    };

    return {
      tokens: this.cachedTokens,
      user: this.cachedUser,
    };
  }

  async register(details: RegisterRequest): Promise<RegisterResponse | null> {
    const [data, err] = await createApiRequest({
      method: 'POST',
      endpoint: '/auth/register',
      body: {
        username: details.username,
        email: details.email,
        password: details.password,
        role: 'user', // NOTE: hard-coded for client app
      },
    });
    if (err || !data) {
      return null;
    }

    this.cachedTokens = {
      accessToken: data.tokens.access_token,
      refreshToken: data.tokens.refresh_token,
    };
    this.cachedUser = {
      id: data.user.id,
      username: data.user.username,
      email: data.user.email,
      role: data.user.role,
      updatedAt: new Date(data.user.updated_at),
      createdAt: new Date(data.user.created_at),
    };

    return {
      tokens: this.cachedTokens,
      user: this.cachedUser,
    };
  }

  async logout(): Promise<boolean> {
    if (!this.isAuthenticated()) return false;
    const [_, err] = await createApiRequest({
      method: 'POST',
      endpoint: '/auth/logout',
      body: {
        refresh_token: this.cachedTokens!.refreshToken,
      },
    });

    if (!err) {
      this.cachedTokens = null;
      this.cachedUser = null;
      return true;
    }

    return false;
  }

  async refresh(): Promise<RefreshResponse | null> {
    const [data, err] = await createApiRequest({
      method: 'POST',
      endpoint: '/auth/refresh',
      body: {
        refresh_token: this.cachedTokens!.refreshToken,
      },
    });
    if (err || !data) {
      return null;
    }

    this.cachedTokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    };

    return this.cachedTokens;
  }

  isAuthenticated(): boolean {
    return this.cachedTokens !== null && this.cachedUser !== null;
  }
}

export const authClient = new AuthClient();
