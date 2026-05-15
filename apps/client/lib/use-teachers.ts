'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api-client';
import { Teacher } from './types';
import { useState } from 'react';

export function useTeachers() {
  const queryClient = useQueryClient();

  const { data: teachers = [], isLoading, error } = useQuery<Teacher[]>({
    queryKey: ['teachers'],
    queryFn: async () => {
      const response = await apiClient.get('/teachers');
      return response.data.data || response.data;
    },
  });

  const addTeacherMutation = useMutation({
    mutationFn: async (newTeacher: Omit<Teacher, 'id'>) => {
      const response = await apiClient.post('/teachers', newTeacher);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
  });

  const updateTeacherMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Teacher> }) => {
      const response = await apiClient.put(`/teachers/${id}`, updates);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
  });

  const deleteTeacherMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/teachers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
  });

  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeachers = teachers.filter(t =>
    t.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      if (!subjectIds || !Array.isArray(subjectIds)) return [];
      // Mock for now, ideally fetch from useSubjects
      return subjectIds.map(id => `Subject ${id}`);
    }
  };
}
