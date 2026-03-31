"use client";

import { useRouter } from "next/navigation";

import { clearSession, getUser } from "@/lib/auth/session";

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function PortalShell({ title, children }: Props) {
  const router = useRouter();
  const user = getUser();

  const onLogout = () => {
    clearSession();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500">
              {user?.firstName || user?.email || "User"}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
