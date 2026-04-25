'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, useParams } from 'next/navigation';
import { useFinances } from '@/lib/use-finances';
import { useAttendance } from '@/lib/use-attendance';
import { canViewFinances, canViewAttendance } from '@/lib/permissions';
import { mockStudents, mockClasses } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, User, DollarSign, Calendar } from 'lucide-react';

export default function StudentProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;
  
  const { getStudentBalance, getStudentPayments, getStudentFees } = useFinances();
  const { getStudentAttendance, getAttendanceStats } = useAttendance();

  const student = mockStudents.find(s => s.id === studentId);
  const studentClass = student ? mockClasses.find(c => c.id === student.classId) : null;

  if (!user) {
    router.push('/login');
    return null;
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <h2 className="text-xl font-semibold mb-2">Student Not Found</h2>
          <p className="text-muted-foreground mb-4">The student you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push('/dashboard/students')}>Back to Students</Button>
        </div>
      </div>
    );
  }

  // Check permissions
  if (!canViewFinances(user, studentId)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don&apos;t have permission to view this student&apos;s profile.</p>
        </div>
      </div>
    );
  }

  const financialData = getStudentBalance(studentId);
  const studentPayments = getStudentPayments(studentId);
  const studentFees = getStudentFees(studentId);
  const attendanceRecords = getStudentAttendance(studentId);
  const attendanceStats = getAttendanceStats(studentId);

  const age = new Date().getFullYear() - (student.dateOfBirth ? new Date(student.dateOfBirth).getFullYear() : 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{student.firstName} {student.lastName}</h1>
          <p className="text-muted-foreground mt-2">ID: {student.id}</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/dashboard/students')}>Back</Button>
      </div>

      {/* Student Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Student Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-lg font-medium">{student.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="text-lg font-medium">{student.phone || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date of Birth</p>
            <p className="text-lg font-medium">
              {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'} {age > 0 && `(${age} years old)`}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Class</p>
            <p className="text-lg font-medium">{studentClass?.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge className="mt-1">{student.status}</Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Enrollment Date</p>
            <p className="text-lg font-medium">{student.enrollmentDate.toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Financial Dashboard */}
      {canViewFinances(user, studentId) && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${financialData.totalFees.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">${financialData.totalPaid.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Balance Due</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${financialData.balance > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                  ${financialData.balance.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fees Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Fee Records
              </CardTitle>
              <CardDescription>Student fee and payment history</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentFees.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell>{fee.description}</TableCell>
                      <TableCell>${fee.amount.toLocaleString()}</TableCell>
                      <TableCell>{fee.dueDate.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={fee.status === 'paid' ? 'bg-green-100 text-green-800' : fee.status === 'partial' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}>
                          {fee.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Receipt #</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.paymentDate.toLocaleDateString()}</TableCell>
                      <TableCell>${payment.amount.toLocaleString()}</TableCell>
                      <TableCell className="capitalize">{payment.paymentMethod}</TableCell>
                      <TableCell>{payment.receiptNumber}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* Attendance Dashboard */}
      {canViewAttendance(user, studentClass?.id) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendanceStats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Present</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{attendanceStats.present}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Absent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{attendanceStats.absent}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Percentage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendanceStats.percentage}%</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
