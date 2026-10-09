"use client";
import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  getPortalRouteForRole,
  getSessionSnapshot,
  subscribeSession,
} from "@/lib/auth/session";
import { AuthUser, UserRole } from "@/types/user";
const serverSession = () => null;
export default function PortalGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) {
  const router = useRouter();
  const snapshot = useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    serverSession,
  );
  const user: AuthUser | null = snapshot
    ? (JSON.parse(snapshot) as AuthUser)
    : null;
  const permitted =
    !!user && (!allowedRoles || allowedRoles.includes(user.role));
  const destination =
    snapshot === null
      ? null
      : !user
        ? "/login"
        : !permitted
          ? getPortalRouteForRole(user.role)
          : null;
  useEffect(() => {
    if (destination) router.replace(destination);
  }, [destination, router]);
  if (!permitted)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p role="status" className="text-sm text-gray-700">
          Loading…
        </p>
      </div>
    );
  return <>{children}</>;
}
