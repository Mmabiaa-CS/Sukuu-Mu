'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from './api-client';
import { mapClassFromApi, mapStudentFromApi } from './api-mappers';
import { ClassDetail } from './api-mappers';

export function useClass(id: string | number | undefined) {
  const numericId = id != null ? Number(id) : NaN;

  return useQuery<ClassDetail>({
    queryKey: ['classes', numericId, 'detail'],
    queryFn: async () => {
      const [classRes, studentsRes] = await Promise.all([
        apiClient.get(`/classes/${numericId}`),
        apiClient.get(`/classes/${numericId}/students`),
      ]);

      const cls = mapClassFromApi(classRes.data.data ?? classRes.data);
      const rawSubjects = (classRes.data.data ?? classRes.data)?.subjects ?? [];
      const studentsPayload = studentsRes.data.data ?? studentsRes.data;
      const studentRows = studentsPayload?.students ?? [];

      return {
        ...cls,
        subjects: Array.isArray(rawSubjects)
          ? rawSubjects.map((s: Record<string, unknown>) => ({
              subject_id: Number(s.subject_id),
              subject_name: String(s.subject_name ?? ''),
              subject_code: s.subject_code != null ? String(s.subject_code) : undefined,
              teacher_id: s.teacher_id != null ? Number(s.teacher_id) : undefined,
              teacher_name: s.teacher_name != null ? String(s.teacher_name) : undefined,
            }))
          : [],
        students: Array.isArray(studentRows)
          ? studentRows.map((row: Record<string, unknown>) => mapStudentFromApi(row))
          : [],
      };
    },
    enabled: Number.isInteger(numericId) && numericId > 0,
  });
}
