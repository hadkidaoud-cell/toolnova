import * as crypto from "crypto";
import {
  User,
  Session,
  LoginCredentials,
  RegisterData,
  PasswordResetRequest,
  PasswordResetConfirm,
  EmailVerification,
  AuthTokens,
} from "../types";
import { tokenService } from "../tokens";

export interface AuthConfig {
  maxSessions: number;
  sessionTimeout: number;
  passwordMinLength: number;
  requireEmailVerification: boolean;
}

const DEFAULT_CONFIG: AuthConfig = {
  maxSessions: 5,
  sessionTimeout: 7 * 24 * 60 * 60 * 1000,
  passwordMinLength: 8,
  requireEmailVerification: false,
};

export class AuthService {
  private users: Map<string, User & { password: string }> = new Map();
  private sessions: Map<string, Session> = new Map();
  private passwordResets: Map<string, { userId: string; expiresAt: number }> = new Map();
  private emailVerifications: Map<string, { userId: string; expiresAt: number }> = new Map();
  private config: AuthConfig;

  constructor(config: Partial<AuthConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    const existing = this.findByEmail(data.email);
    if (existing) {
      throw new Error("Email already registered");
    }

    if (data.password.length < this.config.passwordMinLength) {
      throw new Error(`Password must be at least ${this.config.passwordMinLength} characters`);
    }

    const id = this.generateId();
    const now = new Date().toISOString();

    const user: User & { password: string } = {
      id,
      email: data.email.toLowerCase(),
      name: data.name,
      role: "user",
      emailVerified: !this.config.requireEmailVerification,
      password: this.hashPassword(data.password),
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(id, user);

    const tokens = tokenService.generateTokens(id);
    this.createSession(id, tokens);

    if (this.config.requireEmailVerification) {
      const verificationToken = this.generateVerificationToken(id);
      await this.sendVerificationEmail(data.email, verificationToken);
    }

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    const user = this.findByEmail(credentials.email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (!this.verifyPassword(credentials.password, user.password)) {
      throw new Error("Invalid email or password");
    }

    const tokens = tokenService.generateTokens(user.id);
    this.createSession(user.id, tokens);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async logout(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  async logoutAll(userId: string): Promise<void> {
    for (const [id, session] of this.sessions) {
      if (session.userId === userId) {
        this.sessions.delete(id);
      }
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const result = tokenService.verifyRefreshToken(refreshToken);

    if (!result.valid || result.expired) {
      throw new Error("Invalid or expired refresh token");
    }

    const session = this.findSessionByRefreshToken(refreshToken);
    if (!session) {
      throw new Error("Session not found");
    }

    const newTokens = tokenService.generateTokens(result.userId);

    this.sessions.delete(session.id);
    this.createSession(result.userId, newTokens);

    return newTokens;
  }

  async getCurrentUser(userId: string): Promise<User | null> {
    const user = this.users.get(userId);
    if (!user) return null;
    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, data: Partial<Pick<User, "name" | "avatar">>): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");

    if (data.name) user.name = data.name;
    if (data.avatar !== undefined) user.avatar = data.avatar;
    user.updatedAt = new Date().toISOString();

    return this.sanitizeUser(user);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");

    if (!this.verifyPassword(currentPassword, user.password)) {
      throw new Error("Current password is incorrect");
    }

    if (newPassword.length < this.config.passwordMinLength) {
      throw new Error(`Password must be at least ${this.config.passwordMinLength} characters`);
    }

    user.password = this.hashPassword(newPassword);
    user.updatedAt = new Date().toISOString();

    await this.logoutAll(userId);
  }

  async requestPasswordReset(data: PasswordResetRequest): Promise<string> {
    const user = this.findByEmail(data.email);
    if (!user) {
      return "If the email exists, a reset link has been sent";
    }

    const token = this.generateResetToken(user.id);
    await this.sendResetEmail(user.email, token);

    return "If the email exists, a reset link has been sent";
  }

  async confirmPasswordReset(data: PasswordResetConfirm): Promise<void> {
    const reset = this.passwordResets.get(data.token);
    if (!reset) throw new Error("Invalid reset token");

    if (Date.now() > reset.expiresAt) {
      this.passwordResets.delete(data.token);
      throw new Error("Reset token expired");
    }

    const user = this.users.get(reset.userId);
    if (!user) throw new Error("User not found");

    if (data.password.length < this.config.passwordMinLength) {
      throw new Error(`Password must be at least ${this.config.passwordMinLength} characters`);
    }

    user.password = this.hashPassword(data.password);
    user.updatedAt = new Date().toISOString();

    this.passwordResets.delete(data.token);
    await this.logoutAll(user.id);
  }

  async verifyEmail(data: EmailVerification): Promise<void> {
    const verification = this.emailVerifications.get(data.token);
    if (!verification) throw new Error("Invalid verification token");

    if (Date.now() > verification.expiresAt) {
      this.emailVerifications.delete(data.token);
      throw new Error("Verification token expired");
    }

    const user = this.users.get(verification.userId);
    if (!user) throw new Error("User not found");

    user.emailVerified = true;
    user.updatedAt = new Date().toISOString();

    this.emailVerifications.delete(data.token);
  }

  async resendVerification(email: string): Promise<string> {
    const user = this.findByEmail(email);
    if (!user || user.emailVerified) {
      return "If the email exists, a verification link has been sent";
    }

    const token = this.generateVerificationToken(user.id);
    await this.sendVerificationEmail(user.email, token);

    return "If the email exists, a verification link has been sent";
  }

  validateSession(token: string): { valid: boolean; userId: string; expired: boolean } {
    return tokenService.verifyAccessToken(token);
  }

  getSessions(userId: string): Session[] {
    return Array.from(this.sessions.values()).filter((s) => s.userId === userId);
  }

  private createSession(userId: string, tokens: AuthTokens): Session {
    const userSessions = this.getSessions(userId);
    if (userSessions.length >= this.config.maxSessions) {
      const sorted = userSessions.sort((a, b) => a.createdAt - b.createdAt);
      if (sorted[0]) this.sessions.delete(sorted[0].id);
    }

    const session: Session = {
      id: this.generateId(),
      userId,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: Date.now() + tokens.expiresIn,
      createdAt: Date.now(),
    };

    this.sessions.set(session.id, session);
    return session;
  }

  private findSessionByRefreshToken(refreshToken: string): Session | undefined {
    for (const session of this.sessions.values()) {
      if (session.refreshToken === refreshToken) return session;
    }
    return undefined;
  }

  private findByEmail(email: string): (User & { password: string }) | undefined {
    for (const user of this.users.values()) {
      if (user.email === email.toLowerCase()) return user;
    }
    return undefined;
  }

  private sanitizeUser(user: User & { password: string }): User {
    const { password, ...sanitized } = user;
    return sanitized;
  }

  private hashPassword(password: string): string {
    return crypto.createHash("sha256").update(password).digest("hex");
  }

  private verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  private generateId(): string {
    return `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateResetToken(userId: string): string {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    this.passwordResets.set(token, {
      userId,
      expiresAt: Date.now() + 60 * 60 * 1000,
    });
    return token;
  }

  private generateVerificationToken(userId: string): string {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    this.emailVerifications.set(token, {
      userId,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });
    return token;
  }

  private async sendVerificationEmail(_email: string, token: string): Promise<void> {
    console.log(`[Email] Verification link: https://toolnova.com/verify?token=${token}`);
  }

  private async sendResetEmail(_email: string, token: string): Promise<void> {
    console.log(`[Email] Reset link: https://toolnova.com/reset?token=${token}`);
  }

  clear(): void {
    this.users.clear();
    this.sessions.clear();
    this.passwordResets.clear();
    this.emailVerifications.clear();
  }
}

export const authService = new AuthService();
