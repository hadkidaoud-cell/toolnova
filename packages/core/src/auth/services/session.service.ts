import { Session } from "../types";

export interface SessionConfig {
  maxSessions: number;
  sessionTimeout: number;
  cleanupInterval: number;
}

const DEFAULT_SESSION_CONFIG: SessionConfig = {
  maxSessions: 5,
  sessionTimeout: 7 * 24 * 60 * 60 * 1000,
  cleanupInterval: 60 * 60 * 1000,
};

export class SessionManager {
  private sessions: Map<string, Session> = new Map();
  private config: SessionConfig;
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config: Partial<SessionConfig> = {}) {
    this.config = { ...DEFAULT_SESSION_CONFIG, ...config };
  }

  create(userId: string, token: string, refreshToken: string, metadata?: { userAgent?: string; ip?: string }): Session {
    const userSessions = this.getByUserId(userId);
    if (userSessions.length >= this.config.maxSessions) {
      const sorted = userSessions.sort((a, b) => a.createdAt - b.createdAt);
      if (sorted[0]) this.delete(sorted[0].id);
    }

    const session: Session = {
      id: this.generateId(),
      userId,
      token,
      refreshToken,
      expiresAt: Date.now() + this.config.sessionTimeout,
      createdAt: Date.now(),
      userAgent: metadata?.userAgent,
      ip: metadata?.ip,
    };

    this.sessions.set(session.id, session);
    return session;
  }

  get(id: string): Session | undefined {
    const session = this.sessions.get(id);
    if (session && Date.now() > session.expiresAt) {
      this.sessions.delete(id);
      return undefined;
    }
    return session;
  }

  getByUserId(userId: string): Session[] {
    return Array.from(this.sessions.values())
      .filter((s) => s.userId === userId)
      .filter((s) => Date.now() <= s.expiresAt);
  }

  getByToken(token: string): Session | undefined {
    for (const session of this.sessions.values()) {
      if (session.token === token || session.refreshToken === token) {
        if (Date.now() > session.expiresAt) {
          this.sessions.delete(session.id);
          return undefined;
        }
        return session;
      }
    }
    return undefined;
  }

  update(id: string, data: Partial<Pick<Session, "token" | "refreshToken">>): Session | undefined {
    const session = this.sessions.get(id);
    if (!session) return undefined;

    if (data.token) session.token = data.token;
    if (data.refreshToken) session.refreshToken = data.refreshToken;

    return session;
  }

  delete(id: string): boolean {
    return this.sessions.delete(id);
  }

  deleteByUserId(userId: string): number {
    let count = 0;
    for (const [id, session] of this.sessions) {
      if (session.userId === userId) {
        this.sessions.delete(id);
        count++;
      }
    }
    return count;
  }

  deleteAll(): void {
    this.sessions.clear();
  }

  isValid(id: string): boolean {
    const session = this.get(id);
    return session !== undefined;
  }

  isExpired(id: string): boolean {
    const session = this.sessions.get(id);
    if (!session) return true;
    return Date.now() > session.expiresAt;
  }

  count(): number {
    return this.sessions.size;
  }

  countByUserId(userId: string): number {
    return this.getByUserId(userId).length;
  }

  cleanup(): number {
    let count = 0;
    for (const [id, session] of this.sessions) {
      if (Date.now() > session.expiresAt) {
        this.sessions.delete(id);
        count++;
      }
    }
    return count;
  }

  startCleanup(): void {
    if (this.cleanupTimer) return;
    this.cleanupTimer = setInterval(() => this.cleanup(), this.config.cleanupInterval);
  }

  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  private generateId(): string {
    return `sess-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

export const sessionManager = new SessionManager();
