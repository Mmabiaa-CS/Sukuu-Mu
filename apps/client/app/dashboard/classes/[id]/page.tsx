'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useClass } from '@/lib/use-class';
import { getApiErrorMessage } from '@/lib/api-errors';
import { AlertCircle } from 'lucide-react';

export default function ClassDetailPage() {
  const params = useParams();
  const classId = params.id as string;
  const { data: cls, isLoading, error } = useClass(classId);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-[#888]">
        Loading class details…
      </div>
    );
  }

  if (error || !cls) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold">Class not found</h2>
        <p className="max-w-md text-sm text-[#888]">
          {error ? getApiErrorMessage(error) : 'This class could not be loaded.'}
        </p>
        <Link href="/dashboard/classes" className="rounded-lg bg-[#0a0a0a] px-5 py-2.5 text-sm font-medium text-white">
          Back to classes
        </Link>
      </div>
    );
  }

  const students = cls.students ?? [];
  const subjects = cls.subjects ?? [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700&family=DM+Sans:wght@300;400;500&display=swap');
        .cd-root { font-family:'DM Sans',sans-serif; color:#0a0a0a; background:#f9f9f8; min-height:100vh; padding:44px 48px; max-width:1100px; margin:0 auto; }
        .cd-back { display:inline-flex; align-items:center; gap:8px; font-size:13px; color:#666; text-decoration:none; margin-bottom:28px; }
        .cd-back:hover { color:#0a0a0a; }
        .cd-title { font-family:'Playfair Display',serif; font-size:34px; font-weight:700; margin-bottom:6px; }
        .cd-sub { font-size:13px; color:#aaa; margin-bottom:28px; }
        .cd-card { background:#fff; border:1px solid #e8e8e6; border-radius:12px; margin-bottom:20px; overflow:hidden; }
        .cd-card-head { padding:18px 24px; border-bottom:1px solid #f0f0ee; font-weight:600; font-size:14px; }
        .cd-table { width:100%; border-collapse:collapse; font-size:13px; }
        .cd-table th { text-align:left; padding:12px 24px; font-size:10px; letter-spacing:0.12em; text-transform:uppercase; color:#aaa; border-bottom:1px solid #f0f0ee; }
        .cd-table td { padding:14px 24px; border-bottom:1px solid #f8f8f6; }
        .cd-empty { padding:32px 24px; text-align:center; color:#aaa; font-size:13px; }
        .cd-tag { display:inline-block; background:#f4f4f3; padding:3px 10px; border-radius:20px; font-size:11px; }
      `}</style>

      <div className="cd-root">
        <Link href="/dashboard/classes" className="cd-back">← Back to classes</Link>
        <h1 className="cd-title">{cls.name}</h1>
        <p className="cd-sub">
          {cls.code} · Grade {cls.level} · {students.length} student{students.length !== 1 ? 's' : ''} enrolled
        </p>

        <div className="cd-card">
          <div className="cd-card-head">Students in this class</div>
          {students.length === 0 ? (
            <div className="cd-empty">No students assigned to this class yet.</div>
          ) : (
            <table className="cd-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Email</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <Link href={`/dashboard/students/${s.id}`} className="hover:underline">
                        {s.first_name} {s.last_name}
                      </Link>
                    </td>
                    <td>{s.student_code}</td>
                    <td>{s.email}</td>
                    <td>
                      <span className="cd-tag">{s.is_active === 1 ? 'Active' : 'Inactive'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="cd-card">
          <div className="cd-card-head">Subjects & teachers</div>
          {subjects.length === 0 ? (
            <div className="cd-empty">No subjects assigned to this class yet.</div>
          ) : (
            <table className="cd-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Code</th>
                  <th>Teacher</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((row) => (
                  <tr key={row.subject_id}>
                    <td>{row.subject_name}</td>
                    <td>{row.subject_code || '—'}</td>
                    <td>{row.teacher_name || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
