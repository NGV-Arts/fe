"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  getPortalRouteForRole,
  getUser,
  isAuthenticated,
} from "@/lib/auth/session";
import { UserRole } from "@/types/user";

type Props = {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
};

export default function PortalGuard({ children, allowedRoles }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const authed = isAuthenticated();
    const user = getUser();

    if (!authed || !user) {
      router.replace("/login");
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      const correctRoute = getPortalRouteForRole(user.role);
      if (pathname !== correctRoute) {
        router.replace(correctRoute);
        return;
      }
    }

    setReady(true);
  }, [allowedRoles, pathname, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
