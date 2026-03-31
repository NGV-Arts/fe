import PortalGuard from "@/components/auth/PortalGuard";
import PortalShell from "@/components/portal/PortalShell";

export default function TeacherPortalPage() {
  return (
    <PortalGuard allowedRoles={["teacher"]}>
      <PortalShell title="Teacher Portal">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-600">Empty page</p>
        </div>
      </PortalShell>
    </PortalGuard>
  );
}
