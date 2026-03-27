"use client";

import { useIdleLogout } from "@/shared/hooks/use-idle-logout";

/**
 * #20 fix: Drop this into the admin layout to auto-logout after 30 min of inactivity.
 * Renders nothing — purely a side-effect component.
 */
export function IdleLogoutGuard() {
  useIdleLogout();
  return null;
}
