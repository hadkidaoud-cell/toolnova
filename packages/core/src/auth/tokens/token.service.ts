import * as crypto from "crypto";
import { AuthTokens } from "../types";

export interface TokenConfig {
  accessTokenSecret: string;
  refreshTokenSecret: string;
  accessTokenExpiry: number;
  refreshTokenExpiry: number;
  issuer: string;
}

const DEFAULT_CONFIG: TokenConfig = {
  accessTokenSecret: "toolnova-access-secret",
  refreshTokenSecret: "toolnova-refresh-secret",
  accessTokenExpiry: 15 * 60 * 1000,
  refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000,
  issuer: "toolnova",
};

export class TokenService {
  private config: TokenConfig;

  constructor(config: Partial<TokenConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  generateTokens(userId: string): AuthTokens {
    const accessToken = this.generateAccessToken(userId);
    const refreshToken = this.generateRefreshToken(userId);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.config.accessTokenExpiry,
    };
  }

  generateAccessToken(userId: string): string {
    const payload = {
      sub: userId,
      type: "access",
      iat: Date.now(),
      exp: Date.now() + this.config.accessTokenExpiry,
      iss: this.config.issuer,
    };

    return this.encode(payload, this.config.accessTokenSecret);
  }

  generateRefreshToken(userId: string): string {
    const payload = {
      sub: userId,
      type: "refresh",
      iat: Date.now(),
      exp: Date.now() + this.config.refreshTokenExpiry,
      iss: this.config.issuer,
    };

    return this.encode(payload, this.config.refreshTokenSecret);
  }

  verifyAccessToken(token: string): { userId: string; valid: boolean; expired: boolean } {
    return this.verify(token, this.config.accessTokenSecret);
  }

  verifyRefreshToken(token: string): { userId: string; valid: boolean; expired: boolean } {
    return this.verify(token, this.config.refreshTokenSecret);
  }

  decodeToken(token: string): Record<string, unknown> | null {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;

      const body = parts[1];
      if (!body) return null;

      const payload = JSON.parse(
        Buffer.from(body.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString()
      );
      return payload;
    } catch {
      return null;
    }
  }

  isExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload || typeof payload.exp !== "number") return true;
    return Date.now() > payload.exp;
  }

  getTokenPayload(token: string): { userId: string; type: string } | null {
    const payload = this.decodeToken(token);
    if (!payload) return null;

    return {
      userId: payload.sub as string,
      type: payload.type as string,
    };
  }

  private encode(payload: Record<string, unknown>, secret: string): string {
    const header = this.base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const body = this.base64url(JSON.stringify(payload));
    const signature = this.base64url(
      this.hmacSha256(`${header}.${body}`, secret)
    );
    return `${header}.${body}.${signature}`;
  }

  private verify(
    token: string,
    secret: string
  ): { userId: string; valid: boolean; expired: boolean } {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return { userId: "", valid: false, expired: false };
    }

    const [header, body, signature] = parts;
    const expectedSignature = this.base64url(
      this.hmacSha256(`${header}.${body}`, secret)
    );

    if (signature !== expectedSignature) {
      return { userId: "", valid: false, expired: false };
    }

    const payload = this.decodeToken(token);
    if (!payload) {
      return { userId: "", valid: false, expired: false };
    }

    const expired = Date.now() > (payload.exp as number);

    return {
      userId: payload.sub as string,
      valid: true,
      expired,
    };
  }

  private base64url(data: string): string {
    return Buffer.from(data)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  private hmacSha256(message: string, secret: string): string {
    return crypto.createHmac("sha256", secret).update(message).digest("hex");
  }
}

export const tokenService = new TokenService();
