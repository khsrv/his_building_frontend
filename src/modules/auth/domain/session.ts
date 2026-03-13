export type UserRole = "admin" | "manager" | "viewer";

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  roles: readonly UserRole[];
}

export interface Session {
  user: SessionUser;
  expiresAtIso: string;
}
