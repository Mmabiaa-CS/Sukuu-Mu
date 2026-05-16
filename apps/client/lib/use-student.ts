'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from './api-client';
import { mapStudentFromApi } from './api-mappers';

export function useStudent(id: string | number | undefined) {
  const numericId = id != null ? Number(id) : NaN;

  return useQuery({
    queryKey: ['students', numericId],
    queryFn: async () => {
      const response = await apiClient.get(`/students/${numericId}`);
      return mapStudentFromApi(response.data.data ?? response.data);
    },
    enabled: Number.isInteger(numericId) && numericId > 0,
  });
}
