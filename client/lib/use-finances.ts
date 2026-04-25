import { useState } from 'react';
import { Fee, Payment, Receipt } from './types';
import { mockFees, mockPayments, mockReceipts } from './mock-data';

export const useFinances = () => {
  const [fees, setFees] = useState<Fee[]>(mockFees);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [receipts, setReceipts] = useState<Receipt[]>(mockReceipts);

  const addFee = (fee: Omit<Fee, 'id' | 'createdAt'>) => {
    const newFee: Fee = {
      ...fee,
      id: `fee-${Date.now()}`,
      createdAt: new Date()
    };
    setFees([...fees, newFee]);
    return newFee;
  };

  const updateFee = (id: string, updates: Partial<Fee>) => {
    setFees(fees.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const deleteFee = (id: string) => {
    setFees(fees.filter(f => f.id !== id));
  };

  const addPayment = (payment: Omit<Payment, 'id' | 'createdAt'>) => {
    const newPayment: Payment = {
      ...payment,
      id: `pay-${Date.now()}`,
      createdAt: new Date()
    };
    setPayments([...payments, newPayment]);

    // Update fee status based on payment
    const fee = fees.find(f => f.id === payment.feeId);
    if (fee) {
      if (payment.amount >= fee.amount) {
        updateFee(payment.feeId, { status: 'paid' });
      } else if (payment.amount > 0) {
        updateFee(payment.feeId, { status: 'partial' });
      }
    }

    // Create receipt
    const newReceipt: Receipt = {
      id: `rcpt-${Date.now()}`,
      paymentId: newPayment.id,
      studentId: payment.studentId,
      receiptNumber: payment.receiptNumber,
      totalAmount: payment.amount,
      issueDate: payment.paymentDate,
      paidBy: ''
    };
    setReceipts([...receipts, newReceipt]);

    return newPayment;
  };

  const getStudentFees = (studentId: string) => {
    return fees.filter(f => f.studentId === studentId);
  };

  const getStudentPayments = (studentId: string) => {
    return payments.filter(p => p.studentId === studentId);
  };

  const getStudentReceipts = (studentId: string) => {
    return receipts.filter(r => r.studentId === studentId);
  };

  const getStudentBalance = (studentId: string) => {
    const studentFees = getStudentFees(studentId);
    const totalFees = studentFees.reduce((sum, f) => sum + f.amount, 0);
    
    const studentPayments = getStudentPayments(studentId);
    const totalPaid = studentPayments.reduce((sum, p) => sum + p.amount, 0);

    return {
      totalFees,
      totalPaid,
      balance: totalFees - totalPaid,
      studentFees,
      studentPayments
    };
  };

  const getFeeDetails = (feeId: string) => {
    const fee = fees.find(f => f.id === feeId);
    const feePayments = payments.filter(p => p.feeId === feeId);
    const totalPaid = feePayments.reduce((sum, p) => sum + p.amount, 0);

    return {
      fee,
      payments: feePayments,
      totalPaid,
      balance: fee ? fee.amount - totalPaid : 0,
      isPaid: fee ? totalPaid >= fee.amount : false
    };
  };

  return {
    fees,
    payments,
    receipts,
    addFee,
    updateFee,
    deleteFee,
    addPayment,
    getStudentFees,
    getStudentPayments,
    getStudentReceipts,
    getStudentBalance,
    getFeeDetails
  };
};
