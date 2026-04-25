'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  LogOut,
  Menu,
  X,
  DollarSign,
  ClipboardList
} from 'lucide-react';
import { canManageFinances, canManageClasses, canManageSubjects, canRecordAttendance } from '@/lib/permissions';
import { useState } from 'react';

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Base menu items available to all
  const baseMenuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
    { href: '/dashboard/students', label: 'Students', icon: Users, show: true }
  ];

  // Role-based menu items
  const roleMenuItems = [
    { href: '/dashboard/classes', label: 'Classes', icon: BookOpen, show: canManageClasses(user) },
    { href: '/dashboard/subjects', label: 'Subjects', icon: BookOpen, show: canManageSubjects(user) },
    { href: '/dashboard/teachers', label: 'Teachers', icon: GraduationCap, show: user?.role === 'admin' || user?.role === 'manager' },
    { href: '/dashboard/attendance', label: 'Attendance', icon: ClipboardList, show: canRecordAttendance(user) },
    { href: '/dashboard/finances', label: 'Finances', icon: DollarSign, show: canManageFinances(user) }
  ];

  const menuItems = [...baseMenuItems, ...roleMenuItems.filter(item => item.show)];

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-background border border-border"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-card border-r border-border transition-transform duration-300 z-40 md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <h1 className="text-2xl font-bold text-foreground">School</h1>
            <p className="text-xs text-muted-foreground">Management System</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive(item.href) ? 'default' : 'ghost'}
                  className="w-full justify-start gap-3"
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-border space-y-3">
            <div className="text-sm">
              <p className="text-xs text-muted-foreground">Logged in as</p>
              <p className="font-medium text-foreground">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
