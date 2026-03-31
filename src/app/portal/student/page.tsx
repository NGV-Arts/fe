import PortalGuard from "@/components/auth/PortalGuard";
import PortalShell from "@/components/portal/PortalShell";

export default function StudentPortalPage() {
  return (
    <PortalGuard allowedRoles={["student"]}>
      <PortalShell title="Student Portal">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-600">Empty page</p>
        </div>
      </PortalShell>
    </PortalGuard>
  );
}
