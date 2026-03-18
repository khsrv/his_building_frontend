"use client";

import type { AuthClientPort } from "@/modules/auth/application/ports";
import type { PasswordSignInInput } from "@/modules/auth/domain/sign-in";
import type { SessionUser } from "@/modules/auth/domain/session";
import { tokenStorage } from "@/shared/lib/http/token-storage";

interface LoginApiResponse {
  data: {
    user: SessionUser;
    accessToken: string;
    accessTokenExpiresAt: string;
    // refreshToken is stored in httpOnly cookie by the BFF — not returned to JS
  };
}

interface LoginApiErrorResponse {
  code?: string;
  message?: string;
}

export class HttpPasswordAuthClient implements AuthClientPort {
  async signInWithPassword(input: PasswordSignInInput): Promise<SessionUser> {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as LoginApiErrorResponse | null;
      throw new Error(errorBody?.code ?? errorBody?.message ?? "AUTH_UNKNOWN_ERROR");
    }

    const body = (await response.json()) as LoginApiResponse;

    // Store access token in memory only
    tokenStorage.setAccessToken(body.data.accessToken, body.data.accessTokenExpiresAt);

    return body.data.user;
  }
}
