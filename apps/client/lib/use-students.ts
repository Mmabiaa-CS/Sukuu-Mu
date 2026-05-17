'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api-client';
import { Student } from './types';
import { useState } from 'react';
import { mapStudentFromApi, studentToApiPayload } from './api-mappers';
import { unwrapListPayload } from './api-errors';

export function useStudents() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: students = [], isLoading, error } = useQuery<Student[]>({
    queryKey: ['students', searchTerm],
    queryFn: async () => {
      const response = await apiClient.get(
        searchTerm ? `/students/search?q=${encodeURIComponent(searchTerm)}` : '/students',
        searchTerm ? undefined : { params: { limit: 100 } }
      );
      const rows = searchTerm
        ? unwrapListPayload<Record<string, unknown>>(response.data)
        : unwrapListPayload<Record<string, unknown>>(response.data);
      return rows.map(mapStudentFromApi);
    },
  });

  const addStudentMutation = useMutation({
    mutationFn: async (newStudent: Omit<Student, 'id' | 'student_code'>) => {
      const response = await apiClient.post('/students', studentToApiPayload(newStudent));
      return mapStudentFromApi(response.data.data ?? response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  const updateStudentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Student> }) => {
      if (!id || Number.isNaN(id)) throw new Error('Invalid student id');
      const response = await apiClient.put(`/students/${id}`, studentToApiPayload(updates));
      return mapStudentFromApi(response.data.data ?? response.data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['students', variables.id] });
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!id || Number.isNaN(id)) throw new Error('Invalid student id');
      await apiClient.delete(`/students/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  return {
    students,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    addStudent: addStudentMutation.mutateAsync,
    updateStudent: updateStudentMutation.mutateAsync,
    deleteStudent: deleteStudentMutation.mutateAsync,
    isAdding: addStudentMutation.isPending,
    isUpdating: updateStudentMutation.isPending,
    getStudentById: (id: string | number) => {
      const numericId = Number(id);
      return students.find((s) => s.id === numericId);
    },
    isDeleting: deleteStudentMutation.isPending,
    filteredStudents: students,
    getClassName: (classId: number | string) => `Class ${classId}`,
  };
}
