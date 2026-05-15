'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api-client';
import { Student } from './types';
import { useState } from 'react';

export function useStudents() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all students (with search)
  const { data: students = [], isLoading, error } = useQuery<Student[]>({
    queryKey: ['students', searchTerm],
    queryFn: async () => {
      const response = await apiClient.get(
        searchTerm ? `/students/search?q=${searchTerm}` : '/students'
      );
      // Backend returns { success: true, data: [...], pagination: {...} } or [ ... ] depending on endpoint
      // Adjust based on backend implementation: /students returns { data: [] }
      return response.data.data || response.data;
    },
  });

  // Create student
  const addStudentMutation = useMutation({
    mutationFn: async (newStudent: Omit<Student, 'id' | 'student_code'>) => {
      const response = await apiClient.post('/students', newStudent);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  // Update student
  const updateStudentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Student> }) => {
      const response = await apiClient.put(`/students/${id}`, updates);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  // Delete student
  const deleteStudentMutation = useMutation({
    mutationFn: async (id: number) => {
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
      // In a real app we'd use useQuery here, but for brevity in this hook context:
      return students.find(s => s.id === parseInt(id.toString()));
    },
    isDeleting: deleteStudentMutation.isPending,
    // Compatibility helpers
    filteredStudents: students,
    getClassName: (classId: number | string) => {
      // Placeholder for now, ideally fetch from useClasses
      return `Class ${classId}`;
    }
  };
}
