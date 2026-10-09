import PortalGuard from "@/components/auth/PortalGuard";
import PortalShell from "@/components/portal/PortalShell";
import AdminNav from "@/components/portal/admin/AdminNav";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalGuard allowedRoles={["admin"]}>
      <PortalShell title="Admin Portal">
        <AdminNav />
        {children}
      </PortalShell>
    </PortalGuard>
  );
}
