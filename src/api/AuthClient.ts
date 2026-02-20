import { createApiRequest } from './client';
import {
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  RegisterRequest,
  RegisterResponse,
} from './requests';

const accessTokenKey = 'ACCESS_TOKEN';
const refreshTokenKey = 'REFRESH_TOKEN';

const userIdKey = 'USER_ID';
const usernameKey = 'USER_NAME';
const emailKey = 'USER_EMAIL';
const roleKey = 'USER_ROLE';

// Helper function to check if JWT token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) {
      return true; // Invalid JWT format
    }
    const payload = JSON.parse(atob(parts[1]!));
    const expiry = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expiry;
  } catch (error) {
    return true; // If we can't decode it, consider it expired
  }
};

class AuthClient {
  private clearCredentials() {
    localStorage.removeItem(accessTokenKey);
    localStorage.removeItem(refreshTokenKey);
    localStorage.removeItem(userIdKey);
    localStorage.removeItem(usernameKey);
    localStorage.removeItem(emailKey);
    localStorage.removeItem(roleKey);
  }

  private setTokens(tokens: any) {
    localStorage.setItem(accessTokenKey, tokens.access_token);
    localStorage.setItem(refreshTokenKey, tokens.refresh_token);
  }

  private setCredentials(data: any) {
    this.setTokens(data.tokens);
    localStorage.setItem(userIdKey, data.user.id);
    localStorage.setItem(usernameKey, data.user.username);
    localStorage.setItem(emailKey, data.user.email);
    localStorage.setItem(roleKey, data.user.role);
  }

  async login(credentials: LoginRequest): Promise<LoginResponse | null> {
    const [_, data, err] = await createApiRequest({
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

    this.setCredentials(data);

    return {
      tokens: {
        accessToken: localStorage.getItem(accessTokenKey)!,
        refreshToken: localStorage.getItem(refreshTokenKey)!,
      },
      user: {
        id: localStorage.getItem(userIdKey)!,
        username: localStorage.getItem(usernameKey)!,
        email: localStorage.getItem(emailKey)!,
        role: localStorage.getItem(roleKey)!,
      },
    };
  }

  async register(details: RegisterRequest): Promise<RegisterResponse | null> {
    const [_, data, err] = await createApiRequest({
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

    this.setCredentials(data);

    return {
      tokens: {
        accessToken: localStorage.getItem(accessTokenKey)!,
        refreshToken: localStorage.getItem(refreshTokenKey)!,
      },
      user: {
        id: localStorage.getItem(userIdKey)!,
        username: localStorage.getItem(usernameKey)!,
        email: localStorage.getItem(emailKey)!,
        role: localStorage.getItem(roleKey)!,
      },
    };
  }

  async logout(): Promise<boolean> {
    if (!this.isAuthenticated()) return false;
    const refreshToken = localStorage.getItem(refreshTokenKey);
    const [_, err] = await createApiRequest({
      method: 'POST',
      endpoint: '/auth/logout',
      body: {
        refresh_token: refreshToken,
      },
    });

    if (!err) {
      this.clearCredentials();
      return true;
    }

    return false;
  }

  async refresh(): Promise<RefreshResponse | null> {
    const refreshToken = localStorage.getItem(refreshTokenKey);
    const [_, data, err] = await createApiRequest({
      method: 'POST',
      endpoint: '/auth/refresh',
      body: {
        refresh_token: refreshToken,
      },
    });
    if (err || !data) {
      return null;
    }

    this.setTokens(data);
    return {
      accessToken: localStorage.getItem(accessTokenKey)!,
      refreshToken: localStorage.getItem(refreshTokenKey)!,
    };
  }

  isAuthenticated(): boolean {
    const accessToken = localStorage.getItem(accessTokenKey);
    const refreshToken = localStorage.getItem(refreshTokenKey);
    const userId = localStorage.getItem(userIdKey);

    // Check if we have all necessary tokens and user data
    return !!accessToken && !!refreshToken && !!userId;
  }

  async ensureAuthenticated(): Promise<boolean> {
    const accessToken = localStorage.getItem(accessTokenKey);
    const refreshToken = localStorage.getItem(refreshTokenKey);
    
    if (!refreshToken) {
      this.clearCredentials();
      return false;
    }

    // If no access token or it's expired, try to refresh
    if (!accessToken || isTokenExpired(accessToken)) {
      const refreshed = await this.refresh();
      if (!refreshed) {
        this.clearCredentials();
        return false;
      }
    }

    return true;
  }

  async getAccessToken(): Promise<string | null> {
    const accessToken = localStorage.getItem(accessTokenKey);

    if (!accessToken) {
      return null;
    }

    // If token is expired, try to refresh it
    if (isTokenExpired(accessToken)) {
      const refreshed = await this.refresh();
      if (!refreshed) {
        this.clearCredentials();
        return null;
      }
      return localStorage.getItem(accessTokenKey);
    }

    return accessToken;
  }
}

export const authClient = new AuthClient();
