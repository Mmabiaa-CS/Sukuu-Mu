import { Class, Student, Subject, Teacher } from './types';

export function mapClassFromApi(row: Record<string, unknown>): Class {
  const id = Number(row.id);
  const name = String(row.name ?? '');
  return {
    id,
    name,
    code: String(row.code ?? `CLS-${id}`),
    description: row.description != null ? String(row.description) : undefined,
    level: Number(row.level ?? 1),
    capacity: Number(row.capacity ?? 40),
    academicYear: String(row.academic_year ?? row.academicYear ?? ''),
    is_active: Number(row.is_active ?? 1),
    total_students: row.total_students != null ? Number(row.total_students) : undefined,
    created_at: row.created_at != null ? String(row.created_at) : undefined,
  };
}

export function mapSubjectFromApi(row: Record<string, unknown>): Subject {
  return {
    id: Number(row.id),
    name: String(row.name ?? ''),
    code: String(row.code ?? ''),
    description: row.description != null ? String(row.description) : undefined,
    creditHours: Number(row.credit_hours ?? row.creditHours ?? 0),
    created_at: row.created_at != null ? String(row.created_at) : undefined,
  };
}

export function subjectToApiPayload(
  subject: Omit<Subject, 'id'> | Partial<Subject>
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (subject.name !== undefined) payload.name = subject.name;
  if (subject.code !== undefined) payload.code = subject.code;
  if (subject.description !== undefined) payload.description = subject.description;
  if (subject.creditHours !== undefined) payload.credit_hours = subject.creditHours;
  return payload;
}

export function classToApiPayload(
  classData: Omit<Class, 'id' | 'createdAt' | 'created_at' | 'total_students'> | Partial<Class>
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (classData.name !== undefined) payload.name = classData.name;
  if (classData.description !== undefined) payload.description = classData.description;
  if (classData.is_active !== undefined) payload.is_active = classData.is_active;
  return payload;
}

export function mapStudentFromApi(row: Record<string, unknown>): Student {
  return {
    id: Number(row.id),
    student_code: String(row.student_code ?? ''),
    first_name: String(row.first_name ?? ''),
    last_name: String(row.last_name ?? ''),
    email: String(row.email ?? ''),
    phone: row.phone != null ? String(row.phone) : undefined,
    date_of_birth: row.date_of_birth != null ? String(row.date_of_birth) : undefined,
    address: row.address != null ? String(row.address) : undefined,
    class_id: row.class_id != null ? Number(row.class_id) : undefined,
    enrollment_date: String(row.enrollment_date ?? ''),
    is_active: Number(row.is_active ?? 1),
  };
}

export function studentToApiPayload(
  student: Omit<Student, 'id' | 'student_code'> | Partial<Student>
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (student.first_name !== undefined) payload.first_name = student.first_name;
  if (student.last_name !== undefined) payload.last_name = student.last_name;
  if (student.email !== undefined) payload.email = student.email;
  if (student.phone !== undefined) payload.phone = student.phone;
  if (student.date_of_birth !== undefined) payload.date_of_birth = student.date_of_birth;
  if (student.address !== undefined) payload.address = student.address;
  if (student.class_id !== undefined) payload.class_id = student.class_id;
  if (student.enrollment_date !== undefined) payload.enrollment_date = student.enrollment_date;
  if (student.is_active !== undefined) payload.is_active = student.is_active;
  return payload;
}

export function mapTeacherFromApi(row: Record<string, unknown>): Teacher {
  const subjects = Array.isArray(row.subjects) ? row.subjects : [];
  const subjectIds = subjects
    .map((s: Record<string, unknown>) => Number(s.id ?? s.subject_id))
    .filter((id) => Number.isInteger(id) && id > 0);

  return {
    id: Number(row.id),
    employee_id: String(row.employee_id ?? ''),
    first_name: String(row.first_name ?? ''),
    last_name: String(row.last_name ?? ''),
    email: String(row.email ?? ''),
    phone: row.phone != null ? String(row.phone) : undefined,
    gender: row.gender != null ? String(row.gender) : undefined,
    qualification: row.qualification != null ? String(row.qualification) : undefined,
    join_date: row.join_date != null ? String(row.join_date) : undefined,
    is_active: Number(row.is_active ?? 1),
    subjectIds: subjectIds.length ? subjectIds : undefined,
  };
}

export function teacherToApiPayload(
  teacher: Omit<Teacher, 'id'> | Partial<Teacher>
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (teacher.first_name !== undefined) payload.first_name = teacher.first_name;
  if (teacher.last_name !== undefined) payload.last_name = teacher.last_name;
  if (teacher.email !== undefined) payload.email = teacher.email;
  if (teacher.phone !== undefined) payload.phone = teacher.phone;
  if (teacher.employee_id !== undefined) payload.employee_id = teacher.employee_id;
  if (teacher.qualification !== undefined) payload.qualification = teacher.qualification;
  if (teacher.join_date !== undefined) payload.join_date = teacher.join_date;
  if (teacher.is_active !== undefined) payload.is_active = teacher.is_active;
  if (teacher.gender !== undefined) payload.gender = teacher.gender;
  if ('password' in teacher && teacher.password) payload.password = teacher.password;
  return payload;
}
