'use client';

import { useParams } from 'next/navigation';
import { useTeacher } from '@/lib/use-teachers';
import { useSubjects } from '@/lib/use-subjects';
import { EntityProfileView } from '@/components/entity-profile-view';
import { getApiErrorMessage } from '@/lib/api-errors';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function TeacherProfilePage() {
  const params = useParams();
  const teacherId = params.id as string;
  const { data: teacher, isLoading, error } = useTeacher(teacherId);
  const { subjects } = useSubjects();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-[#888]">
        Loading teacher profile…
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold">Teacher not found</h2>
        <p className="max-w-md text-sm text-[#888]">
          {error ? getApiErrorMessage(error) : 'This teacher could not be loaded.'}
        </p>
        <Link
          href="/dashboard/teachers"
          className="rounded-lg bg-[#0a0a0a] px-5 py-2.5 text-sm font-medium text-white"
        >
          Back to teachers
        </Link>
      </div>
    );
  }

  const fullName = `${teacher.first_name} ${teacher.last_name}`.trim();
  const initials = `${teacher.first_name?.[0] ?? ''}${teacher.last_name?.[0] ?? ''}`.toUpperCase();

  const subjectNames =
    teacher.subjectIds?.map((id) => subjects.find((s) => s.id === id)?.name ?? `Subject #${id}`) ?? [];

  const formatDate = (value?: string) => {
    if (!value) return '—';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
  };

  return (
    <EntityProfileView
      theme="teacher"
      eyebrow="Teacher profile"
      title={fullName}
      subtitle={teacher.employee_id ? `Employee ID: ${teacher.employee_id}` : `Record #${teacher.id}`}
      initials={initials || '?'}
      statusLabel={teacher.is_active === 1 ? 'Active' : 'Inactive'}
      statusActive={teacher.is_active === 1}
      backHref="/dashboard/teachers"
      backLabel="Back to teachers"
      fields={[
        { label: 'Employee ID', value: teacher.employee_id },
        { label: 'Email', value: teacher.email },
        { label: 'Phone', value: teacher.phone },
        { label: 'Qualification', value: teacher.qualification },
        { label: 'Join date', value: formatDate(teacher.join_date) },
        { label: 'Subjects', value: subjectNames.length ? subjectNames.join(', ') : '—' },
        { label: 'Gender', value: teacher.gender },
        { label: 'System ID', value: String(teacher.id) },
      ]}
    />
  );
}
