"use client";

// Access token stored only in memory (not localStorage/sessionStorage — prevents XSS)
// Refresh token is stored in httpOnly cookie managed by the BFF — never accessible to JavaScript
let _accessToken: string | null = null;
let _accessTokenExpiresAt: Date | null = null;

export const tokenStorage = {
  getAccessToken(): string | null {
    return _accessToken;
  },

  setAccessToken(token: string, expiresAt: string): void {
    _accessToken = token;
    _accessTokenExpiresAt = new Date(expiresAt);
  },

  clearAccessToken(): void {
    _accessToken = null;
    _accessTokenExpiresAt = null;
  },

  isAccessTokenExpired(): boolean {
    if (!_accessToken || !_accessTokenExpiresAt) return true;
    return new Date() >= _accessTokenExpiresAt;
  },

  clearAll(): void {
    _accessToken = null;
    _accessTokenExpiresAt = null;
  },
};
