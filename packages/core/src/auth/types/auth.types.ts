export type UserRole = "admin" | "editor" | "user" | "guest";

export type Permission =
  | "tools:create"
  | "tools:read"
  | "tools:update"
  | "tools:delete"
  | "tools:publish"
  | "categories:create"
  | "categories:read"
  | "categories:update"
  | "categories:delete"
  | "users:create"
  | "users:read"
  | "users:update"
  | "users:delete"
  | "users:manage"
  | "seo:read"
  | "seo:update"
  | "analytics:read"
  | "settings:read"
  | "settings:update"
  | "logs:read"
  | "backups:create"
  | "backups:read"
  | "backups:delete"
  | "comments:create"
  | "comments:read"
  | "comments:delete"
  | "profile:read"
  | "profile:update";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    "tools:create", "tools:read", "tools:update", "tools:delete", "tools:publish",
    "categories:create", "categories:read", "categories:update", "categories:delete",
    "users:create", "users:read", "users:update", "users:delete", "users:manage",
    "seo:read", "seo:update",
    "analytics:read",
    "settings:read", "settings:update",
    "logs:read",
    "backups:create", "backups:read", "backups:delete",
    "comments:create", "comments:read", "comments:delete",
    "profile:read", "profile:update",
  ],
  editor: [
    "tools:create", "tools:read", "tools:update", "tools:publish",
    "categories:create", "categories:read", "categories:update",
    "seo:read", "seo:update",
    "analytics:read",
    "comments:create", "comments:read", "comments:delete",
    "profile:read", "profile:update",
  ],
  user: [
    "tools:read",
    "categories:read",
    "comments:create", "comments:read",
    "profile:read", "profile:update",
  ],
  guest: [
    "tools:read",
    "categories:read",
    "profile:read",
  ],
};

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: number;
  createdAt: number;
  userAgent?: string;
  ip?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
}

export interface EmailVerification {
  token: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
