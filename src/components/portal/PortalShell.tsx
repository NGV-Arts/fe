"use client";

import PortalNav from "./PortalNav";

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function PortalShell({ title, children }: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      <PortalNav />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        </div>

        {children}
      </main>
    </div>
  );
}
