import StudentInvoices from "@/components/portal/StudentInvoices";
export default async function Page({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  return (
    <StudentInvoices
      key={studentId}
      studentId={studentId}
      backHref="/portal/admin/students"
    />
  );
}
