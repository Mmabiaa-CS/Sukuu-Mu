'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useFinances } from '@/lib/use-finances';
import { canManageFinances } from '@/lib/permissions';
import { useRouter } from 'next/navigation';
import { mockStudents } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

export default function FinancesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { fees, addPayment, getStudentBalance } = useFinances();
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedFeeId, setSelectedFeeId] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'cash' as const,
    notes: ''
  });

  if (!canManageFinances(user)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don&apos;t have permission to access finances.</p>
        </div>
      </div>
    );
  }

  const filteredFees = useMemo(() => {
    return fees.filter(fee => {
      const student = mockStudents.find(s => s.id === fee.studentId);
      const studentName = student ? `${student.firstName} ${student.lastName}` : '';
      return studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             fee.id.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [fees, searchTerm]);

  const totalFeesAmount = fees.reduce((sum, f) => sum + f.amount, 0);
  const totalPaidAmount = fees
    .filter(f => f.status === 'paid')
    .reduce((sum, f) => sum + f.amount, 0);
  const pendingAmount = totalFeesAmount - totalPaidAmount;

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeeId || !paymentForm.amount) return;

    const fee = fees.find(f => f.id === selectedFeeId);
    if (!fee) return;

    addPayment({
      feeId: selectedFeeId,
      studentId: fee.studentId,
      amount: parseFloat(paymentForm.amount),
      paymentDate: new Date(),
      paymentMethod: paymentForm.paymentMethod,
      receiptNumber: `RCP-${Date.now()}`,
      notes: paymentForm.notes
    });

    setPaymentForm({ amount: '', paymentMethod: 'cash', notes: '' });
    setShowPaymentDialog(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Financial Management</h1>
        <p className="text-muted-foreground mt-2">Manage student fees, payments, and receipts</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalFeesAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All student fees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPaidAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Paid fees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Outstanding balance</p>
          </CardContent>
        </Card>
      </div>

      {/* Fees Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Student Fees</CardTitle>
              <CardDescription>Track and manage student fee payments</CardDescription>
            </div>
          </div>
          <div className="mt-4">
            <Input
              placeholder="Search by student name or fee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFees.map((fee) => {
                const student = mockStudents.find(s => s.id === fee.studentId);
                const statusColors = {
                  paid: 'bg-green-100 text-green-800',
                  partial: 'bg-amber-100 text-amber-800',
                  pending: 'bg-red-100 text-red-800'
                };

                return (
                  <TableRow key={fee.id}>
                    <TableCell className="font-medium">
                      {student ? `${student.firstName} ${student.lastName}` : 'Unknown'}
                    </TableCell>
                    <TableCell>${fee.amount.toLocaleString()}</TableCell>
                    <TableCell>{fee.dueDate.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[fee.status]}>
                        {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{fee.description}</TableCell>
                    <TableCell>
                      <Dialog open={showPaymentDialog && selectedFeeId === fee.id} onOpenChange={(open) => {
                        setShowPaymentDialog(open);
                        if (open) setSelectedFeeId(fee.id);
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">Record Payment</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Record Payment</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handlePaymentSubmit} className="space-y-4">
                            <div>
                              <p className="text-sm font-medium">Fee Amount: ${fee.amount}</p>
                              <p className="text-xs text-muted-foreground">Due: {fee.dueDate.toLocaleDateString()}</p>
                            </div>
                            
                            <Field>
                              <FieldLabel>Payment Amount</FieldLabel>
                              <Input
                                type="number"
                                min="0"
                                max={fee.amount}
                                step="0.01"
                                value={paymentForm.amount}
                                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                placeholder="Enter amount"
                                required
                              />
                            </Field>

                            <Field>
                              <FieldLabel>Payment Method</FieldLabel>
                              <select
                                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={paymentForm.paymentMethod}
                                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as any })}
                              >
                                <option value="cash">Cash</option>
                                <option value="check">Check</option>
                                <option value="transfer">Bank Transfer</option>
                                <option value="online">Online</option>
                              </select>
                            </Field>

                            <Field>
                              <FieldLabel>Notes (Optional)</FieldLabel>
                              <Input
                                value={paymentForm.notes}
                                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                                placeholder="Payment notes"
                              />
                            </Field>

                            <div className="flex justify-end gap-2">
                              <Button type="button" variant="outline" onClick={() => setShowPaymentDialog(false)}>Cancel</Button>
                              <Button type="submit">Record Payment</Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
