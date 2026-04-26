'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  LogOut,
  Menu,
  X,
  DollarSign,
  ClipboardList,
  BarChart3,
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

  const baseMenuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
    { href: '/dashboard/students', label: 'Students', icon: Users, show: true },
  ];

  const roleMenuItems = [
    { href: '/dashboard/classes', label: 'Classes', icon: BookOpen, show: canManageClasses(user) },
    { href: '/dashboard/subjects', label: 'Subjects', icon: BarChart3, show: canManageSubjects(user) },
    { href: '/dashboard/teachers', label: 'Teachers', icon: GraduationCap, show: user?.role === 'admin' || user?.role === 'manager' },
    { href: '/dashboard/attendance', label: 'Attendance', icon: ClipboardList, show: canRecordAttendance(user) },
    { href: '/dashboard/finances', label: 'Finances', icon: DollarSign, show: canManageFinances(user) },
  ];

  const menuItems = [...baseMenuItems, ...roleMenuItems.filter(item => item.show)];

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'));

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();
  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : '';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700&family=DM+Sans:wght@300;400;500&display=swap');

        .sb-root {
          font-family: 'DM Sans', sans-serif;
        }

        /* ── MOBILE TOGGLE ── */
        .sb-toggle {
          display: none;
          position: fixed;
          top: 16px;
          left: 16px;
          z-index: 50;
          width: 38px;
          height: 38px;
          border-radius: 8px;
          background: #ffffff;
          border: 1px solid #e4e4e2;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        @media (max-width: 768px) {
          .sb-toggle { display: flex; }
        }

        /* ── OVERLAY ── */
        .sb-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          z-index: 30;
        }
        .sb-overlay.open { display: block; }

        /* ── SIDEBAR ── */
        .sb-aside {
          position: fixed;
          left: 0; top: 0;
          height: 100vh;
          width: 240px;
          background: #0a0a0a;
          display: flex;
          flex-direction: column;
          z-index: 40;
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
        }

        @media (min-width: 769px) {
          .sb-aside { position: relative; transform: none !important; }
        }

        @media (max-width: 768px) {
          .sb-aside { transform: translateX(-100%); }
          .sb-aside.open { transform: translateX(0); }
        }

        /* ── LOGO ── */
        .sb-logo {
          padding: 28px 24px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sb-logo-icon .brand-logo {
          width: 130px;
          height: auto;
        }

        .sb-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 0.02em;
          line-height: 1;
        }

        .sb-logo-sub {
          font-size: 9px;
          font-weight: 400;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          margin-top: 2px;
        }

        /* ── NAV ── */
        .sb-nav {
          flex: 1;
          overflow-y: auto;
          padding: 20px 14px;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .sb-nav::-webkit-scrollbar { width: 0; }

        .sb-section-label {
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          padding: 12px 10px 6px;
          margin-top: 4px;
        }

        .sb-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 7px;
          font-size: 13px;
          font-weight: 400;
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          position: relative;
          transition: color 0.15s, background 0.15s;
          cursor: pointer;
        }

        .sb-link:hover {
          color: rgba(255,255,255,0.9);
          background: rgba(255,255,255,0.06);
        }

        .sb-link.active {
          color: #0a0a0a;
          background: #ffffff;
          font-weight: 500;
        }

        .sb-link.active .sb-link-icon {
          color: #0a0a0a;
        }

        .sb-link-icon {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          color: rgba(255,255,255,0.35);
          transition: color 0.15s;
        }

        .sb-link:hover .sb-link-icon {
          color: rgba(255,255,255,0.8);
        }

        /* ── USER FOOTER ── */
        .sb-footer {
          padding: 16px 14px;
          border-top: 1px solid rgba(255,255,255,0.07);
        }

        .sb-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          margin-bottom: 8px;
          background: rgba(255,255,255,0.05);
          cursor: pointer;
          text-decoration: none;
          transition: background 0.15s, transform 0.15s;
        }
        .sb-user:hover {
          background: rgba(255,255,255,0.12);
          transform: translateY(-1px);
        }

        .sb-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #ffffff;
          color: #0a0a0a;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          letter-spacing: 0.04em;
        }

        .sb-user-name {
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.85);
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sb-user-role {
          font-size: 10px;
          font-weight: 300;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .sb-logout {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 7px;
          font-size: 13px;
          font-weight: 400;
          color: rgba(255,255,255,0.3);
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: color 0.15s, background 0.15s;
        }

        .sb-logout:hover {
          color: #ff6b6b;
          background: rgba(255,107,107,0.08);
        }

        .sb-logout:hover .sb-logout-icon {
          color: #ff6b6b;
        }

        .sb-logout-icon {
          width: 16px;
          height: 16px;
          color: rgba(255,255,255,0.25);
          transition: color 0.15s;
        }
      `}</style>

      <div className="sb-root">
        {/* Mobile toggle */}
        <button className="sb-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen
            ? <X size={18} color="#0a0a0a" />
            : <Menu size={18} color="#0a0a0a" />}
        </button>

        {/* Overlay */}
        <div
          className={`sb-overlay ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(false)}
        />

        {/* Sidebar */}
        <aside className={`sb-aside ${isOpen ? 'open' : ''}`}>

          {/* Logo */}
          <div className="sb-logo">
            <div className="sb-logo-icon">
            <Image 
              src="/logo.png?v=2" 
              alt="Sukuu Mu Logo"
              width={130}
              height={62}
              className="brand-logo"
            />
            </div>
          </div>

          {/* Nav */}
          <nav className="sb-nav">
            <div className="sb-section-label">Menu</div>

            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sb-link ${active ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="sb-link-icon" size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="sb-footer">
            <Link href="/dashboard/settings" className="sb-user" onClick={() => setIsOpen(false)}>
              <div className="sb-avatar">{initials}</div>
              <div>
                <div className="sb-user-name">{user?.firstName} {user?.lastName}</div>
                <div className="sb-user-role">{roleLabel} • Profile</div>
              </div>
            </Link>

            <button className="sb-logout" onClick={handleLogout}>
              <LogOut className="sb-logout-icon" size={16} />
              Sign out
            </button>
          </div>

        </aside>
      </div>
    </>
  );
}