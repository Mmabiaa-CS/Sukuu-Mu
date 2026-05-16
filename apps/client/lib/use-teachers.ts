'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api-client';
import { Teacher } from './types';
import { useState } from 'react';
import { mapTeacherFromApi, teacherToApiPayload } from './api-mappers';
import { unwrapListPayload } from './api-errors';

export function useTeachers() {
  const queryClient = useQueryClient();

  const { data: teachers = [], isLoading, error } = useQuery<Teacher[]>({
    queryKey: ['teachers'],
    queryFn: async () => {
      const response = await apiClient.get('/teachers', { params: { limit: 100 } });
      const rows = unwrapListPayload<Record<string, unknown>>(response.data);
      return rows.map(mapTeacherFromApi);
    },
  });

  const addTeacherMutation = useMutation({
    mutationFn: async (newTeacher: Omit<Teacher, 'id'>) => {
      const response = await apiClient.post('/teachers', teacherToApiPayload(newTeacher));
      return mapTeacherFromApi(response.data.data ?? response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
  });

  const updateTeacherMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Teacher> }) => {
      if (!id || Number.isNaN(id)) {
        throw new Error('Invalid teacher id');
      }
      const response = await apiClient.put(`/teachers/${id}`, teacherToApiPayload(updates));
      return mapTeacherFromApi(response.data.data ?? response.data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['teachers', variables.id] });
    },
  });

  const deleteTeacherMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!id || Number.isNaN(id)) {
        throw new Error('Invalid teacher id');
      }
      await apiClient.delete(`/teachers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
  });

  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeachers = teachers.filter((t) => {
    const q = searchTerm.toLowerCase();
    return (
      t.first_name.toLowerCase().includes(q) ||
      t.last_name.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q)
    );
  });

  return {
    teachers,
    filteredTeachers,
    searchTerm,
    setSearchTerm,
    isLoading,
    error,
    addTeacher: addTeacherMutation.mutateAsync,
    updateTeacher: updateTeacherMutation.mutateAsync,
    deleteTeacher: deleteTeacherMutation.mutateAsync,
    getTeacherSubjects: (subjectIds?: number[]) => {
      if (!subjectIds?.length) return [];
      return subjectIds.map((id) => `Subject #${id}`);
    },
  };
}

export function useTeacher(id: string | number | undefined) {
  const numericId = id != null ? Number(id) : NaN;

  return useQuery({
    queryKey: ['teachers', numericId],
    queryFn: async () => {
      const response = await apiClient.get(`/teachers/${numericId}`);
      return mapTeacherFromApi(response.data.data ?? response.data);
    },
    enabled: Number.isInteger(numericId) && numericId > 0,
  });
}
