'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useAttendance } from '@/lib/use-attendance';
import { canRecordAttendance, filterStudentsByAccess, getTeacherClasses } from '@/lib/permissions';
import { useRouter } from 'next/navigation';
import { mockStudents, mockClasses } from '@/lib/mock-data';
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
import { AlertCircle, CheckCircle2, X, Clock } from 'lucide-react';

export default function AttendancePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { attendance, addAttendance, recordBulkAttendance, getClassAttendance } = useAttendance();
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);

  if (!user) {
    router.push('/login');
    return null;
  }

  // Get accessible classes
  const accessibleClasses = useMemo(() => {
    if (user.role === 'admin' || user.role === 'manager') {
      return mockClasses;
    }
    if (user.role === 'teacher') {
      const classIds = getTeacherClasses(user.id);
      return mockClasses.filter(c => classIds.includes(c.id));
    }
    return [];
  }, [user]);

  // Get accessible students in selected class
  const accessibleStudents = useMemo(() => {
    if (!selectedClass) return [];
    return mockStudents.filter(s => s.classId === selectedClass);
  }, [selectedClass]);

  // Get today's attendance for selected class
  const todayAttendance = useMemo(() => {
    if (!selectedClass) return [];
    const selectedDateTime = new Date(selectedDate);
    return getClassAttendance(selectedClass, selectedDateTime);
  }, [selectedClass, selectedDate, getClassAttendance]);

  const handleRecordAttendance = (studentId: string, status: 'present' | 'absent' | 'late') => {
    if (!selectedClass) return;

    const selectedDateTime = new Date(selectedDate);
    const existingRecord = todayAttendance.find(a => a.studentId === studentId);

    if (existingRecord) {
      // Update existing record
      const index = attendance.findIndex(a => a.id === existingRecord.id);
      if (index !== -1) {
        const updated = [...attendance];
        updated[index] = { ...updated[index], status };
        // In a real app, we'd update state properly
      }
    } else {
      // Add new record
      addAttendance({
        studentId,
        classId: selectedClass,
        date: selectedDateTime,
        status
      });
    }
  };

  const handleBulkRecordAttendance = () => {
    if (!selectedClass) return;

    const records = accessibleStudents
      .filter(s => !todayAttendance.find(a => a.studentId === s.id))
      .map(s => ({
        studentId: s.id,
        classId: selectedClass,
        date: new Date(selectedDate),
        status: 'present' as const
      }));

    if (records.length > 0) {
      recordBulkAttendance(records);
    }
  };

  const canRecord = canRecordAttendance(user, selectedClass || undefined);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Attendance Management</h1>
        <p className="text-muted-foreground mt-2">Track and record student attendance</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>Record attendance for your classes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Select Class</FieldLabel>
              <select
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedClass || ''}
                onChange={(e) => setSelectedClass(e.target.value || null)}
              >
                <option value="">-- Select Class --</option>
                {accessibleClasses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>

            <Field>
              <FieldLabel>Select Date</FieldLabel>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </Field>
          </div>

          {canRecord && selectedClass && (
            <div className="flex gap-2">
              <Button onClick={handleBulkRecordAttendance}>Mark All Present</Button>
              <Dialog open={showAttendanceDialog} onOpenChange={setShowAttendanceDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">View Summary</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Attendance Summary</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{todayAttendance.filter(a => a.status === 'present').length}</p>
                        <p className="text-sm text-muted-foreground">Present</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{todayAttendance.filter(a => a.status === 'absent').length}</p>
                        <p className="text-sm text-muted-foreground">Absent</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-amber-600">{todayAttendance.filter(a => a.status === 'late').length}</p>
                        <p className="text-sm text-muted-foreground">Late</p>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance Table */}
      {selectedClass && (
        <Card>
          <CardHeader>
            <CardTitle>
              {mockClasses.find(c => c.id === selectedClass)?.name} - {selectedDate}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accessibleStudents.map((student) => {
                  const record = todayAttendance.find(a => a.studentId === student.id);
                  const status = record?.status;

                  const statusIcons = {
                    present: <CheckCircle2 className="h-4 w-4 text-green-600" />,
                    absent: <X className="h-4 w-4 text-red-600" />,
                    late: <Clock className="h-4 w-4 text-amber-600" />
                  };

                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.firstName} {student.lastName}
                      </TableCell>
                      <TableCell>
                        {status ? (
                          <Badge className="flex w-fit items-center gap-2">
                            {statusIcons[status]}
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not Recorded</Badge>
                        )}
                      </TableCell>
                      <TableCell className="space-x-2">
                        {canRecord && (
                          <>
                            <Button
                              size="sm"
                              variant={status === 'present' ? 'default' : 'outline'}
                              onClick={() => handleRecordAttendance(student.id, 'present')}
                            >
                              Present
                            </Button>
                            <Button
                              size="sm"
                              variant={status === 'absent' ? 'destructive' : 'outline'}
                              onClick={() => handleRecordAttendance(student.id, 'absent')}
                            >
                              Absent
                            </Button>
                            <Button
                              size="sm"
                              variant={status === 'late' ? 'secondary' : 'outline'}
                              onClick={() => handleRecordAttendance(student.id, 'late')}
                            >
                              Late
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
