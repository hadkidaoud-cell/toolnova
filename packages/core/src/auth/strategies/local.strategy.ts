import * as crypto from "crypto";
import { User, LoginCredentials, RegisterData } from "../types";

export interface AuthStrategy {
  name: string;
  authenticate(credentials: LoginCredentials): Promise<User | null>;
  register?(data: RegisterData): Promise<User>;
  validate?(token: string): Promise<User | null>;
}

export class LocalStrategy implements AuthStrategy {
  name = "local";

  private users: Map<string, User & { password: string }> = new Map();

  constructor() {
    this.seed();
  }

  private seed(): void {
    const admin: User & { password: string } = {
      id: "admin-1",
      email: "admin@toolnova.com",
      name: "Admin",
      role: "admin",
      emailVerified: true,
      password: this.hash("admin123"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users.set(admin.email, admin);
  }

  async authenticate(credentials: LoginCredentials): Promise<User | null> {
    const user = this.users.get(credentials.email.toLowerCase());
    if (!user) return null;

    if (!this.verify(credentials.password, user.password)) {
      return null;
    }

    const { password, ...sanitized } = user;
    return sanitized;
  }

  async register(data: RegisterData): Promise<User> {
    if (this.users.has(data.email.toLowerCase())) {
      throw new Error("Email already exists");
    }

    const user: User & { password: string } = {
      id: `user-${Date.now()}`,
      email: data.email.toLowerCase(),
      name: data.name,
      role: "user",
      emailVerified: false,
      password: this.hash(data.password),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users.set(user.email, user);

    const { password, ...sanitized } = user;
    return sanitized;
  }

  async validate(token: string): Promise<User | null> {
    const user = this.users.get(token);
    if (!user) return null;
    const { password, ...sanitized } = user;
    return sanitized;
  }

  private hash(password: string): string {
    return crypto.createHash("sha256").update(password).digest("hex");
  }

  private verify(password: string, hash: string): boolean {
    return this.hash(password) === hash;
  }
}

export const localStrategy = new LocalStrategy();
