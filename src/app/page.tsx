"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  getPortalRouteForRole,
  getUser,
  isAuthenticated,
} from "@/lib/auth/session";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      const user = getUser();
      if (user) {
        router.replace(getPortalRouteForRole(user.role));
        return;
      }
    }

    router.replace("/login");
  }, [router]);

  return null;
}
