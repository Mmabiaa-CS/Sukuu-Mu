'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api-client';
import { Class } from './types';
import { useState } from 'react';
import { useStudents } from './use-students';
import { classToApiPayload, mapClassFromApi } from './api-mappers';
import { unwrapListPayload } from './api-errors';

export function useClasses() {
  const queryClient = useQueryClient();

  const { data: classes = [], isLoading, error } = useQuery<Class[]>({
    queryKey: ['classes'],
    queryFn: async () => {
      const response = await apiClient.get('/classes', { params: { limit: 100 } });
      const list = unwrapListPayload<Record<string, unknown>>(response.data);
      return list.map((row: Record<string, unknown>) => mapClassFromApi(row));
    },
  });

  const addClassMutation = useMutation({
    mutationFn: async (newClass: Omit<Class, 'id'>) => {
      const response = await apiClient.post('/classes', classToApiPayload(newClass));
      return mapClassFromApi(response.data.data ?? response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });

  const updateClassMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Class> }) => {
      const response = await apiClient.put(`/classes/${id}`, classToApiPayload(updates));
      return mapClassFromApi(response.data.data ?? response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });

  const deleteClassMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/classes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });

  const [searchTerm, setSearchTerm] = useState('');
  const { students } = useStudents();

  const filteredClasses = classes.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.code || '').toLowerCase().includes(q)
    );
  });

  const getStudentsInClass = (classId: number) => {
    return students.filter((s) => s.class_id === classId);
  };

  const getClassFillPercentage = (classId: number) => {
    const cls = classes.find((c) => c.id === classId);
    if (!cls || !cls.capacity) return 0;
    const count =
      cls.total_students != null
        ? cls.total_students
        : getStudentsInClass(classId).length;
    return Math.round((count / cls.capacity) * 100);
  };

  return {
    classes,
    filteredClasses,
    searchTerm,
    setSearchTerm,
    isLoading,
    error,
    addClass: addClassMutation.mutateAsync,
    updateClass: updateClassMutation.mutateAsync,
    deleteClass: deleteClassMutation.mutateAsync,
    getStudentsInClass,
    getClassFillPercentage,
  };
}
