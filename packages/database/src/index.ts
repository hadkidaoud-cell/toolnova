export interface DatabaseConfig {
  url: string;
  maxConnections: number;
  timeout: number;
}

export const defaultDatabaseConfig: DatabaseConfig = {
  url: process.env["DATABASE_URL"] || "postgresql://localhost:5432/toolnova",
  maxConnections: 10,
  timeout: 5000,
};
