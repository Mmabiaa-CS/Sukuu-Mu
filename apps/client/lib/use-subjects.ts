'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api-client';
import { Subject } from './types';
import { useState } from 'react';
import { mapSubjectFromApi, subjectToApiPayload } from './api-mappers';
import { unwrapListPayload } from './api-errors';

export function useSubjects() {
  const queryClient = useQueryClient();

  const { data: subjects = [], isLoading, error } = useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: async () => {
      const response = await apiClient.get('/subjects', { params: { limit: 100 } });
      const list = unwrapListPayload<Record<string, unknown>>(response.data);
      return list.map((row: Record<string, unknown>) => mapSubjectFromApi(row));
    },
  });

  const addSubjectMutation = useMutation({
    mutationFn: async (newSubject: Omit<Subject, 'id'>) => {
      const response = await apiClient.post('/subjects', subjectToApiPayload(newSubject));
      return mapSubjectFromApi(response.data.data ?? response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const updateSubjectMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Subject> }) => {
      const response = await apiClient.put(`/subjects/${id}`, subjectToApiPayload(updates));
      return mapSubjectFromApi(response.data.data ?? response.data);
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

  const filteredSubjects = subjects.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q)
    );
  });

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
