'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api-client';
import { Subject } from './types';
import { useState } from 'react';

export function useSubjects() {
  const queryClient = useQueryClient();

  const { data: subjects = [], isLoading, error } = useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: async () => {
      const response = await apiClient.get('/subjects');
      return response.data.data || response.data;
    },
  });

  const addSubjectMutation = useMutation({
    mutationFn: async (newSubject: Omit<Subject, 'id'>) => {
      const response = await apiClient.post('/subjects', newSubject);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const updateSubjectMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Subject> }) => {
      const response = await apiClient.put(`/subjects/${id}`, updates);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/subjects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const [searchTerm, setSearchTerm] = useState('');

  const filteredSubjects = subjects.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    subjects,
    filteredSubjects,
    searchTerm,
    setSearchTerm,
    isLoading,
    error,
    addSubject: addSubjectMutation.mutateAsync,
    updateSubject: updateSubjectMutation.mutateAsync,
    deleteSubject: deleteSubjectMutation.mutateAsync,
  };
}
