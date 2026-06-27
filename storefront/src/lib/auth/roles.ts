import { auth } from "./auth";
import { redirect } from "next/navigation";

/**
 * All available roles in the system.
 */
export const ROLES = {
  CUSTOMER: "CUSTOMER",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/**
 * Role hierarchy: higher index = more privileges.
 */
const ROLE_HIERARCHY: Role[] = ["CUSTOMER", "ADMIN", "SUPER_ADMIN"];

/**
 * Check if a role has sufficient privileges.
 */
export function hasMinRole(userRole: Role, requiredRole: Role): boolean {
  const userIdx = ROLE_HIERARCHY.indexOf(userRole);
  const requiredIdx = ROLE_HIERARCHY.indexOf(requiredRole);
  return userIdx >= requiredIdx;
}

/**
 * Require authentication. Redirects to login if not authenticated.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

/**
 * Require a minimum role. Redirects to login or home if not authorized.
 */
export async function requireRole(minimumRole: Role) {
  const session = await requireAuth();
  const userRole = session.user.role as Role;

  if (!hasMinRole(userRole, minimumRole)) {
    redirect("/?error=unauthorized");
  }

  return session;
}
