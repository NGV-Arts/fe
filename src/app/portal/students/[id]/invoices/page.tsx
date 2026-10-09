import PortalGuard from "@/components/auth/PortalGuard";
import PortalShell from "@/components/portal/PortalShell";
import StudentInvoices from "@/components/portal/StudentInvoices";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PortalGuard allowedRoles={["teacher", "admin"]}>
      <PortalShell title="Student Invoices">
        <StudentInvoices key={id} studentId={id} backHref="/portal/students" />
      </PortalShell>
    </PortalGuard>
  );
}
