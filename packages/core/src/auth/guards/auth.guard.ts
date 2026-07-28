import { User, UserRole, Permission, ROLE_PERMISSIONS } from "../types";

export interface AuthGuardResult {
  allowed: boolean;
  reason?: string;
}

export class AuthGuard {
  isAuthenticated(user: User | null): boolean {
    return user !== null;
  }

  hasRole(user: User, role: UserRole): boolean {
    return user.role === role;
  }

  hasAnyRole(user: User, roles: UserRole[]): boolean {
    return roles.includes(user.role);
  }

  hasPermission(user: User, permission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[user.role] || [];
    return permissions.includes(permission);
  }

  hasAnyPermission(user: User, permissions: Permission[]): boolean {
    return permissions.some((p) => this.hasPermission(user, p));
  }

  hasAllPermissions(user: User, permissions: Permission[]): boolean {
    return permissions.every((p) => this.hasPermission(user, p));
  }

  canAccess(user: User | null, requiredRole?: UserRole, requiredPermission?: Permission): AuthGuardResult {
    if (!user) {
      return { allowed: false, reason: "Not authenticated" };
    }

    if (requiredRole && !this.hasRole(user, requiredRole)) {
      return { allowed: false, reason: `Requires role: ${requiredRole}` };
    }

    if (requiredPermission && !this.hasPermission(user, requiredPermission)) {
      return { allowed: false, reason: `Requires permission: ${requiredPermission}` };
    }

    return { allowed: true };
  }

  getPermissions(role: UserRole): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
  }

  isRoleHigherOrEqual(userRole: UserRole, requiredRole: UserRole): boolean {
    const hierarchy: Record<UserRole, number> = {
      admin: 4,
      editor: 3,
      user: 2,
      guest: 1,
    };
    return hierarchy[userRole] >= hierarchy[requiredRole];
  }
}

export const authGuard = new AuthGuard();
