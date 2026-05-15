'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api-client';
import { Fee, Payment } from './types';

export function useFinances() {
  const queryClient = useQueryClient();

  // All student fee records
  const { data: fees = [], isLoading: feesLoading } = useQuery<any[]>({
    queryKey: ['student-fees'],
    queryFn: async () => {
      const response = await apiClient.get('/fees/student-fees');
      return response.data.data || response.data;
    },
  });

  // All payments
  const { data: payments = [], isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ['payments'],
    queryFn: async () => {
      const response = await apiClient.get('/fees');
      return response.data.data || response.data;
    },
  });

  // Fee structures
  const { data: structures = [], isLoading: structuresLoading } = useQuery<any[]>({
    queryKey: ['fee-structures'],
    queryFn: async () => {
      const response = await apiClient.get('/fees/structures');
      return response.data.data || response.data;
    },
  });

  // Record payment
  const recordPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await apiClient.post('/fees/pay', paymentData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });

  // Statistics
  const { data: report } = useQuery({
    queryKey: ['fee-report'],
    queryFn: async () => {
      const response = await apiClient.get('/fees/reports/summary');
      return response.data.data;
    },
  });

  const getStudentFees = (studentId: string) => {
    return fees.filter((f: any) => f.student_id === parseInt(studentId));
  };

  const getStudentPayments = (studentId: string) => {
    return payments.filter((p: any) => p.student_id === parseInt(studentId));
  };

  const getStudentBalance = (studentId: string) => {
    const studentFees = getStudentFees(studentId);
    const totalFees = studentFees.reduce((sum: number, f: any) => sum + parseFloat(f.total_fee), 0);
    const totalPaid = studentFees.reduce((sum: number, f: any) => sum + parseFloat(f.total_paid), 0);
    const balance = totalFees - totalPaid;
    return { totalFees, totalPaid, balance };
  };

  return {
    fees,
    payments,
    structures,
    report,
    getStudentFees,
    getStudentPayments,
    getStudentBalance,
    isLoading: feesLoading || paymentsLoading || structuresLoading,
    recordPayment: recordPaymentMutation.mutateAsync,
  };
}
