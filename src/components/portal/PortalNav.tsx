"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  clearSession,
  getPortalRouteForRole,
  getUser,
} from "@/lib/auth/session";

export default function PortalNav() {
  const router = useRouter();
  const user = getUser();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const displayName = user?.firstName?.trim() || user?.email || "User";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) {
        return;
      }

      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onLogout = () => {
    clearSession();
    router.replace("/login");
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const currentUser = getUser();
              if (!currentUser) {
                return;
              }

              router.push(getPortalRouteForRole(currentUser.role));
            }}
            aria-label="Go to dashboard"
          >
            <img
              src="/logo.png"
              alt="Logo"
              className="h-12 w-12 rounded-full object-cover"
            />
          </button>
        </div>

        <div className="relative flex items-center gap-3" ref={menuRef}>
          <span className="text-sm text-gray-700">
            Welcome,{" "}
            <span className="font-medium text-gray-900">{displayName}</span>
          </span>

          <button
            type="button"
            onClick={() => setOpen((previous) => !previous)}
            aria-label="Open menu"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 transition hover:bg-gray-100"
          >
            <div className="space-y-1.5">
              <span className="block h-0.5 w-5 bg-gray-800" />
              <span className="block h-0.5 w-5 bg-gray-800" />
              <span className="block h-0.5 w-5 bg-gray-800" />
            </div>
          </button>

          {open ? (
            <div className="absolute right-0 top-12 z-20 w-48 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
              <Link
                href="/portal/profile"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Edit Profile
              </Link>
              {user?.role === "teacher" || user?.role === "admin" ? (
                <Link
                  href="/portal/students"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Students
                </Link>
              ) : null}
              <button
                type="button"
                onClick={onLogout}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
