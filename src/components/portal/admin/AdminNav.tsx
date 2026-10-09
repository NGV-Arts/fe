"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const links = [
  ["Dashboard", "/portal/admin"],
  ["Students", "/portal/admin/students"],
  ["Teachers", "/portal/admin/teachers"],
  ["Groups", "/portal/admin/groups"],
  ["Calendar", "/portal/admin/calendar"],
];
export default function AdminNav() {
  const path = usePathname();
  return (
    <nav
      aria-label="Admin navigation"
      className="mb-6 flex gap-2 overflow-x-auto rounded-xl border border-gray-200 bg-white p-2 shadow-sm"
    >
      {links.map(([label, href]) => {
        const active =
          href === "/portal/admin" ? path === href : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`whitespace-nowrap rounded-lg px-4 py-3 text-sm font-medium ${active ? "bg-red-600 text-white" : "text-gray-900 hover:bg-red-50"}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
