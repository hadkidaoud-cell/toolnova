export const ERROR_CODES = {
  VALIDATION: {
    REQUIRED_FIELD: { code: "VALIDATION_001", message: "Required field is missing", severity: "low" as const, category: "validation" as const },
    INVALID_FORMAT: { code: "VALIDATION_002", message: "Invalid field format", severity: "low" as const, category: "validation" as const },
    INVALID_LENGTH: { code: "VALIDATION_003", message: "Field length is invalid", severity: "low" as const, category: "validation" as const },
    INVALID_ENUM: { code: "VALIDATION_004", message: "Invalid enum value", severity: "low" as const, category: "validation" as const },
    INVALID_TYPE: { code: "VALIDATION_005", message: "Invalid field type", severity: "low" as const, category: "validation" as const },
    INVALID_RANGE: { code: "VALIDATION_006", message: "Value is out of range", severity: "low" as const, category: "validation" as const },
    DUPLICATE_VALUE: { code: "VALIDATION_007", message: "Duplicate value not allowed", severity: "medium" as const, category: "validation" as const },
    INVALID_INPUT: { code: "VALIDATION_008", message: "Invalid input provided", severity: "low" as const, category: "validation" as const },
  },
  PLUGIN: {
    NOT_FOUND: { code: "PLUGIN_001", message: "Plugin not found", severity: "medium" as const, category: "plugin" as const },
    ALREADY_REGISTERED: { code: "PLUGIN_002", message: "Plugin already registered", severity: "medium" as const, category: "plugin" as const },
    INVALID_MANIFEST: { code: "PLUGIN_003", message: "Invalid plugin manifest", severity: "high" as const, category: "plugin" as const },
    LOAD_FAILED: { code: "PLUGIN_004", message: "Failed to load plugin", severity: "high" as const, category: "plugin" as const },
    EXECUTION_FAILED: { code: "PLUGIN_005", message: "Plugin execution failed", severity: "high" as const, category: "plugin" as const, retryable: true },
    VALIDATION_FAILED: { code: "PLUGIN_006", message: "Plugin validation failed", severity: "medium" as const, category: "plugin" as const },
    DEPENDENCY_MISSING: { code: "PLUGIN_007", message: "Plugin dependency missing", severity: "high" as const, category: "plugin" as const },
    VERSION_MISMATCH: { code: "PLUGIN_008", message: "Plugin version mismatch", severity: "medium" as const, category: "plugin" as const },
  },
  API: {
    BAD_REQUEST: { code: "API_001", message: "Bad request", severity: "low" as const, category: "api" as const },
    UNAUTHORIZED: { code: "API_002", message: "Unauthorized access", severity: "high" as const, category: "auth" as const },
    FORBIDDEN: { code: "API_003", message: "Access forbidden", severity: "high" as const, category: "permission" as const },
    NOT_FOUND: { code: "API_004", message: "Resource not found", severity: "low" as const, category: "not_found" as const },
    METHOD_NOT_ALLOWED: { code: "API_005", message: "HTTP method not allowed", severity: "low" as const, category: "api" as const },
    CONFLICT: { code: "API_006", message: "Resource conflict", severity: "medium" as const, category: "api" as const },
    UNPROCESSABLE: { code: "API_007", message: "Unprocessable entity", severity: "low" as const, category: "validation" as const },
    TOO_MANY_REQUESTS: { code: "API_008", message: "Rate limit exceeded", severity: "medium" as const, category: "rate_limit" as const, retryable: true },
    INTERNAL_ERROR: { code: "API_009", message: "Internal server error", severity: "critical" as const, category: "internal" as const, retryable: true },
    SERVICE_UNAVAILABLE: { code: "API_010", message: "Service unavailable", severity: "critical" as const, category: "internal" as const, retryable: true },
    GATEWAY_TIMEOUT: { code: "API_011", message: "Gateway timeout", severity: "high" as const, category: "timeout" as const, retryable: true },
  },
  DATABASE: {
    CONNECTION_FAILED: { code: "DB_001", message: "Database connection failed", severity: "critical" as const, category: "database" as const, retryable: true },
    QUERY_FAILED: { code: "DB_002", message: "Database query failed", severity: "high" as const, category: "database" as const, retryable: true },
    CONSTRAINT_VIOLATION: { code: "DB_003", message: "Database constraint violation", severity: "medium" as const, category: "database" as const },
    TRANSACTION_FAILED: { code: "DB_004", message: "Database transaction failed", severity: "high" as const, category: "database" as const, retryable: true },
    MIGRATION_FAILED: { code: "DB_005", message: "Database migration failed", severity: "critical" as const, category: "database" as const },
  },
  AUTH: {
    INVALID_CREDENTIALS: { code: "AUTH_001", message: "Invalid credentials", severity: "high" as const, category: "auth" as const },
    TOKEN_EXPIRED: { code: "AUTH_002", message: "Authentication token expired", severity: "medium" as const, category: "auth" as const, retryable: true },
    TOKEN_INVALID: { code: "AUTH_003", message: "Invalid authentication token", severity: "high" as const, category: "auth" as const },
    SESSION_EXPIRED: { code: "AUTH_004", message: "Session expired", severity: "medium" as const, category: "auth" as const },
    INSUFFICIENT_PERMISSIONS: { code: "AUTH_005", message: "Insufficient permissions", severity: "high" as const, category: "permission" as const },
  },
  NOT_FOUND: {
    RESOURCE: { code: "NOTFOUND_001", message: "Resource not found", severity: "low" as const, category: "not_found" as const },
    TOOL: { code: "NOTFOUND_002", message: "Tool not found", severity: "low" as const, category: "not_found" as const },
    CATEGORY: { code: "NOTFOUND_003", message: "Category not found", severity: "low" as const, category: "not_found" as const },
    USER: { code: "NOTFOUND_004", message: "User not found", severity: "medium" as const, category: "not_found" as const },
  },
  RATE_LIMIT: {
    EXCEEDED: { code: "RATE_001", message: "Rate limit exceeded", severity: "medium" as const, category: "rate_limit" as const, retryable: true },
    TOO_MANY_REQUESTS: { code: "RATE_002", message: "Too many requests", severity: "medium" as const, category: "rate_limit" as const, retryable: true },
  },
  TIMEOUT: {
    REQUEST: { code: "TIMEOUT_001", message: "Request timeout", severity: "high" as const, category: "timeout" as const, retryable: true },
    SERVICE: { code: "TIMEOUT_002", message: "Service timeout", severity: "high" as const, category: "timeout" as const, retryable: true },
  },
  INTERNAL: {
    UNEXPECTED: { code: "INTERNAL_001", message: "Unexpected internal error", severity: "critical" as const, category: "internal" as const },
    CONFIGURATION: { code: "INTERNAL_002", message: "Configuration error", severity: "critical" as const, category: "internal" as const },
    DEPENDENCY: { code: "INTERNAL_003", message: "Dependency failure", severity: "critical" as const, category: "internal" as const, retryable: true },
  },
} as const;

export type ErrorCodeGroup = keyof typeof ERROR_CODES;
export type ErrorCodeEntry = (typeof ERROR_CODES)[ErrorCodeGroup][keyof (typeof ERROR_CODES)[ErrorCodeGroup]];

export function getErrorCode(group: ErrorCodeGroup, key: string): ErrorCodeEntry | undefined {
  const groupObj = ERROR_CODES[group];
  if (!groupObj) return undefined;
  return (groupObj as unknown as Record<string, ErrorCodeEntry>)[key];
}

export function findErrorCode(code: string): ErrorCodeEntry | undefined {
  for (const group of Object.values(ERROR_CODES)) {
    for (const entry of Object.values(group)) {
      if (entry.code === code) return entry;
    }
  }
  return undefined;
}
