export interface ToolPermissions {
  access: ToolAccessLevel;
  roles: string[];
  capabilities: ToolCapability[];
  ipWhitelist?: string[];
  ipBlacklist?: string[];
  maxConcurrent: number;
  requireAuth: boolean;
}

export type ToolAccessLevel = "public" | "authenticated" | "admin";

export type ToolCapability =
  | "read"
  | "write"
  | "execute"
  | "delete"
  | "upload"
  | "download"
  | "export"
  | "share";

export const DEFAULT_TOOL_PERMISSIONS: ToolPermissions = {
  access: "public",
  roles: [],
  capabilities: ["read", "execute"],
  maxConcurrent: 10,
  requireAuth: false,
};

export function createPermissions(overrides: Partial<ToolPermissions>): ToolPermissions {
  return {
    ...DEFAULT_TOOL_PERMISSIONS,
    ...overrides,
  };
}

export function hasCapability(permissions: ToolPermissions, capability: ToolCapability): boolean {
  return permissions.capabilities.includes(capability);
}

export function checkAccess(
  permissions: ToolPermissions,
  userRole: string | undefined,
  isAuthenticated: boolean
): ToolAccessCheckResult {
  if (permissions.access === "admin" && userRole !== "admin") {
    return { allowed: false, reason: "Admin access required" };
  }

  if (permissions.access === "authenticated" && !isAuthenticated) {
    return { allowed: false, reason: "Authentication required" };
  }

  if (permissions.roles.length > 0 && userRole && !permissions.roles.includes(userRole)) {
    return { allowed: false, reason: `Requires one of roles: ${permissions.roles.join(", ")}` };
  }

  return { allowed: true };
}

export interface ToolAccessCheckResult {
  allowed: boolean;
  reason?: string;
}
