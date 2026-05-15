'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api-client';
import { Class } from './types';
import { useState } from 'react';
import { useStudents } from './use-students';

export function useClasses() {
  const queryClient = useQueryClient();

  const { data: classes = [], isLoading, error } = useQuery<Class[]>({
    queryKey: ['classes'],
    queryFn: async () => {
      const response = await apiClient.get('/classes');
      return response.data.data || response.data;
    },
  });

  const addClassMutation = useMutation({
    mutationFn: async (newClass: Omit<Class, 'id'>) => {
      const response = await apiClient.post('/classes', newClass);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });

  const updateClassMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Class> }) => {
      const response = await apiClient.put(`/classes/${id}`, updates);
      return response.data.data;
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

  const filteredClasses = classes.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStudentsInClass = (classId: number) => {
    return students.filter(s => s.class_id === classId);
  };

  const getClassFillPercentage = (classId: number) => {
    const cls = classes.find(c => c.id === classId);
    if (!cls || !cls.capacity) return 0;
    const count = getStudentsInClass(classId).length;
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
