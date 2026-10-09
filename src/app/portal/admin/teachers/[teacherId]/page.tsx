import TeacherDetail from "@/components/portal/admin/TeacherDetail";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ teacherId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { teacherId } = await params;
  const { tab } = await searchParams;
  return (
    <TeacherDetail
      key={teacherId}
      teacherId={teacherId}
      initialTab={tab === "groups" ? "groups" : "students"}
    />
  );
}
