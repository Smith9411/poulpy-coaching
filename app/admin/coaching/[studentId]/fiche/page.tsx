import { redirect } from 'next/navigation';

export default async function StudentFicheRedirect({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  redirect(`/admin/coaching/${studentId}/sheet`);
}
