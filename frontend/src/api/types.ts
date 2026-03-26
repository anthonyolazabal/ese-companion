export interface UserInfo {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserInfo;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}
