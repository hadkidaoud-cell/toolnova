export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  links: {
    github?: string;
    twitter?: string;
    discord?: string;
  };
}

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
}

export interface AuthConfig {
  sessionMaxAge: number;
  passwordMinLength: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
}

export const siteConfig: SiteConfig = {
  name: "ToolNova",
  description: "Hundreds of free online tools for developers, designers, and creators",
  url: "https://toolnova.com",
  ogImage: "https://toolnova.com/og.png",
  links: {
    github: "https://github.com/toolnova",
    twitter: "https://twitter.com/toolnova",
    discord: "https://discord.gg/toolnova",
  },
};

export const apiConfig: ApiConfig = {
  baseUrl: process.env["NEXT_PUBLIC_API_URL"] || "http://localhost:4000/api",
  timeout: 30000,
  retries: 3,
};

export const authConfig: AuthConfig = {
  sessionMaxAge: 7 * 24 * 60 * 60,
  passwordMinLength: 8,
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60,
};
