'use client';

import { useAuth } from '@/lib/auth-context';
import { mockStudents, mockClasses, mockSubjects, mockTeachers } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, BookOpen, GraduationCap, BarChart3, ClipboardList } from 'lucide-react';
import { canRecordAttendance } from '@/lib/permissions';

export default function DashboardPage() {
  const { user } = useAuth();

  const baseStats = [
    {
      title: 'Total Students',
      value: mockStudents.length,
      icon: Users,
      color: 'bg-blue-100 text-blue-700',
      href: '/dashboard/students'
    }
  ];

  const adminStats = [
    {
      title: 'Total Classes',
      value: mockClasses.length,
      icon: BookOpen,
      color: 'bg-green-100 text-green-700',
      href: '/dashboard/classes'
    },
    {
      title: 'Total Subjects',
      value: mockSubjects.length,
      icon: BarChart3,
      color: 'bg-purple-100 text-purple-700',
      href: '/dashboard/subjects'
    },
    {
      title: 'Total Teachers',
      value: mockTeachers.length,
      icon: GraduationCap,
      color: 'bg-orange-100 text-orange-700',
      href: '/dashboard/teachers'
    }
  ];

  const teacherStats = user?.role === 'teacher' ? [
    {
      title: 'Attendance',
      value: 'Manage',
      icon: ClipboardList,
      color: 'bg-red-100 text-red-700',
      href: '/dashboard/attendance'
    }
  ] : [];

  const stats = user?.role === 'teacher' 
    ? [...baseStats, ...teacherStats]
    : [...baseStats, ...adminStats];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Welcome, {user?.firstName}!</h1>
        <p className="text-muted-foreground mt-2">
          {user?.role === 'admin'
            ? 'Manage your school system efficiently'
            : user?.role === 'manager'
            ? 'Oversee school operations'
            : user?.role === 'teacher'
            ? 'Manage your classes and students'
            : 'View your academic information'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <Link href={stat.href}>
                  <Button variant="link" className="p-0 h-auto text-xs mt-2">
                    View Details →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks you can perform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <>
                <Link href="/dashboard/students">
                  <Button variant="outline" className="w-full justify-start">
                    Add New Student
                  </Button>
                </Link>
                <Link href="/dashboard/classes">
                  <Button variant="outline" className="w-full justify-start">
                    Create Class
                  </Button>
                </Link>
                <Link href="/dashboard/subjects">
                  <Button variant="outline" className="w-full justify-start">
                    Add Subject
                  </Button>
                </Link>
                <Link href="/dashboard/teachers">
                  <Button variant="outline" className="w-full justify-start">
                    View Teachers
                  </Button>
                </Link>
              </>
            )}
            {user?.role === 'teacher' && (
              <>
                <Link href="/dashboard/students">
                  <Button variant="outline" className="w-full justify-start">
                    View Students
                  </Button>
                </Link>
                <Link href="/dashboard/attendance">
                  <Button variant="outline" className="w-full justify-start">
                    Record Attendance
                  </Button>
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Academic Year</p>
              <p className="font-semibold">2024-2025</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Enrolled</p>
              <p className="font-semibold">{mockStudents.filter(s => s.status === 'active').length} Active Students</p>
            </div>
            <div>
              <p className="text-muted-foreground">Staff Members</p>
              <p className="font-semibold">{mockTeachers.length} Teachers</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
