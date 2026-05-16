'use client';

import { useParams } from 'next/navigation';
import { useStudent } from '@/lib/use-student';
import { useClasses } from '@/lib/use-classes';
import { EntityProfileView } from '@/components/entity-profile-view';
import { getApiErrorMessage } from '@/lib/api-errors';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function StudentProfilePage() {
  const params = useParams();
  const studentId = params.id as string;
  const { data: student, isLoading, error } = useStudent(studentId);
  const { classes } = useClasses();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-[#888]">
        Loading student profile…
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold">Student not found</h2>
        <p className="max-w-md text-sm text-[#888]">
          {error ? getApiErrorMessage(error) : 'This student could not be loaded.'}
        </p>
        <Link
          href="/dashboard/students"
          className="rounded-lg bg-[#0a0a0a] px-5 py-2.5 text-sm font-medium text-white"
        >
          Back to students
        </Link>
      </div>
    );
  }

  const studentClass = student.class_id
    ? classes.find((c) => c.id === Number(student.class_id))
    : null;

  const fullName = `${student.first_name} ${student.last_name}`.trim();
  const initials = `${student.first_name?.[0] ?? ''}${student.last_name?.[0] ?? ''}`.toUpperCase();

  const formatDate = (value?: string) => {
    if (!value) return '—';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
  };

  return (
    <EntityProfileView
      theme="student"
      eyebrow="Student profile"
      title={fullName}
      subtitle={student.student_code ? `ID: ${student.student_code}` : `Record #${student.id}`}
      initials={initials || '?'}
      statusLabel={student.is_active === 1 ? 'Active' : 'Inactive'}
      statusActive={student.is_active === 1}
      backHref="/dashboard/students"
      backLabel="Back to students"
      fields={[
        { label: 'Student code', value: student.student_code },
        { label: 'Email', value: student.email },
        { label: 'Phone', value: student.phone },
        { label: 'Class', value: studentClass?.name ?? (student.class_id ? `Class #${student.class_id}` : '—') },
        { label: 'Date of birth', value: formatDate(student.date_of_birth) },
        { label: 'Enrollment date', value: formatDate(student.enrollment_date) },
        { label: 'Address', value: student.address },
        { label: 'System ID', value: String(student.id) },
      ]}
    />
  );
}
