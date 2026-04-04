export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
