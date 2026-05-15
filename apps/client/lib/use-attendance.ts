import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api-client';
import { Attendance } from './types';

export const useAttendance = () => {
  const queryClient = useQueryClient();

  const recordAttendanceMutation = useMutation({
    mutationFn: async (records: Omit<Attendance, 'id' | 'recordedAt'>[]) => {
      // Map frontend fields to backend (studentId -> student_id, etc.)
      const formattedRecords = records.map(r => ({
        student_id: r.studentId,
        class_id: r.classId,
        date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : r.date,
        status: r.status,
        remarks: r.remarks || ''
      }));
      await apiClient.post('/attendance/record', { records: formattedRecords });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    }
  });

  const fetchClassAttendance = async (classId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const response = await apiClient.get(`/attendance/class/${classId}?date=${dateStr}`);
    return response.data.data;
  };

  const fetchStudentAttendance = async (studentId: string) => {
    const response = await apiClient.get(`/attendance/student/${studentId}`);
    return response.data; // { success, data, stats }
  };

  return {
    recordBulkAttendance: recordAttendanceMutation.mutateAsync,
    isRecording: recordAttendanceMutation.isPending,
    fetchClassAttendance,
    fetchStudentAttendance
  };
};
