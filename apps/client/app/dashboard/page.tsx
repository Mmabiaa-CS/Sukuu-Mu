'use client';

import { useAuth } from '@/lib/auth-context';
import { useStudents } from '@/lib/use-students';
import { useClasses } from '@/lib/use-classes';
import { useTeachers } from '@/lib/use-teachers';
import { useSubjects } from '@/lib/use-subjects';
import { Users, BookOpen, GraduationCap, BarChart3, ClipboardList, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const { students } = useStudents();
  const { classes } = useClasses();
  const { teachers } = useTeachers();
  const { subjects } = useSubjects();

  const baseStats = [
    {
      title: 'Total Students',
      value: students.length,
      icon: Users,
      href: '/dashboard/students',
      sub: `${students.filter(s => s.is_active === 1).length} active`,
    }
  ];

  const adminStats = [
    {
      title: 'Total Classes',
      value: classes.length,
      icon: BookOpen,
      href: '/dashboard/classes',
      sub: 'Academic year 2024–25',
    },
    {
      title: 'Subjects',
      value: subjects.length,
      icon: BarChart3,
      href: '/dashboard/subjects',
      sub: 'Across all classes',
    },
    {
      title: 'Teaching Staff',
      value: teachers.length,
      icon: GraduationCap,
      href: '/dashboard/teachers',
      sub: 'Active members',
    }
  ];

  const teacherStats = [
    {
      title: 'Attendance',
      value: 'Manage',
      icon: ClipboardList,
      href: '/dashboard/attendance',
      sub: 'Record today\'s sessions',
    }
  ];

  const stats = user?.role === 'teacher'
    ? [...baseStats, ...teacherStats]
    : [...baseStats, ...adminStats];

  const roleLabel =
    user?.role === 'admin' ? 'Administrator'
      : user?.role === 'manager' ? 'Manager'
        : user?.role === 'teacher' ? 'Teacher'
          : 'Staff';

  const roleDescription =
    user?.role === 'admin' ? 'Manage your school system efficiently'
      : user?.role === 'manager' ? 'Oversee school operations'
        : user?.role === 'teacher' ? 'Manage your classes and students'
          : 'View your academic information';

  const quickActions =
    user?.role === 'teacher'
      ? [
        { label: 'View Students', href: '/dashboard/students' },
        { label: 'Record Attendance', href: '/dashboard/attendance' },
      ]
      : [
        { label: 'Add New Student', href: '/dashboard/students' },
        { label: 'Create Class', href: '/dashboard/classes' },
        { label: 'Add Subject', href: '/dashboard/subjects' },
        { label: 'View Teachers', href: '/dashboard/teachers' },
        { label: 'Manage Finances', href: '/dashboard/finances' },
      ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .db-root {
          font-family: 'DM Sans', sans-serif;
          color: #0a0a0a;
          background: #f9f9f8;
          min-height: 100vh;
          padding: 48px 52px;
          max-width: 1200px;
          margin: 0 auto;
          animation: db-fadein 0.5s ease both;
        }

        @keyframes db-fadein {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .db-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 52px;
          padding-bottom: 36px;
          border-bottom: 1px solid #e8e8e6;
        }

        .db-role-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #888;
          margin-bottom: 10px;
        }

        .db-role-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #0a0a0a;
        }

        .db-greeting {
          font-family: 'Playfair Display', serif;
          font-size: clamp(30px, 3vw, 44px);
          font-weight: 700;
          line-height: 1.1;
          color: #0a0a0a;
          margin-bottom: 8px;
        }

        .db-greeting em { font-style: italic; color: #555; }
        .db-sub { font-size: 14px; font-weight: 300; color: #999; }
        .db-date { text-align: right; }
        .db-date-day { font-family: 'Playfair Display', serif; font-size: 42px; font-weight: 600; color: #0a0a0a; line-height: 1; }
        .db-date-rest { font-size: 12px; color: #aaa; letter-spacing: 0.06em; text-transform: uppercase; margin-top: 4px; }

        .db-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px; margin-bottom: 32px; }

        .db-stat-card {
          background: #ffffff; border: 1px solid #e8e8e6; border-radius: 10px;
          padding: 24px 26px; display: flex; flex-direction: column; gap: 16px;
          text-decoration: none; color: inherit; position: relative; overflow: hidden;
          transition: all 0.2s;
        }
        .db-stat-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: #0a0a0a; transform: scaleX(0); transform-origin: left; transition: transform 0.3s ease;
        }
        .db-stat-card:hover { border-color: #c8c8c6; box-shadow: 0 4px 24px rgba(0,0,0,0.07); transform: translateY(-2px); }
        .db-stat-card:hover::before { transform: scaleX(1); }
        .db-stat-top { display: flex; align-items: center; justify-content: space-between; }
        .db-stat-icon { width: 36px; height: 36px; border-radius: 8px; background: #f4f4f3; display: flex; align-items: center; justify-content: center; color: #0a0a0a; }
        .db-stat-arrow { color: #ccc; transition: all 0.2s; }
        .db-stat-card:hover .db-stat-arrow { color: #0a0a0a; transform: translate(2px, -2px); }
        .db-stat-value { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 700; color: #0a0a0a; line-height: 1; }
        .db-stat-title { font-size: 12px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; color: #888; margin-bottom: 2px; }
        .db-stat-sub { font-size: 12px; font-weight: 300; color: #bbb; }

        .db-bottom { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .db-panel { background: #ffffff; border: 1px solid #e8e8e6; border-radius: 10px; padding: 28px 30px; }
        .db-panel-title { font-size: 10px; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; color: #aaa; margin-bottom: 20px; }

        .db-actions-list { display: flex; flex-direction: column; gap: 10px; }
        .db-action-btn {
          display: flex; align-items: center; justify-content: space-between; padding: 13px 16px;
          background: #f7f7f6; border: 1px solid transparent; border-radius: 8px;
          font-size: 13px; color: #333; text-decoration: none; transition: all 0.15s;
        }
        .db-action-btn:hover { background: #0a0a0a; color: #ffffff; }

        .db-info-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #f0f0ee; }
        .db-info-row:last-child { border-bottom: none; }
        .db-info-label { font-size: 13px; font-weight: 300; color: #aaa; }
        .db-info-value { font-size: 13px; font-weight: 500; color: #0a0a0a; }

        .db-info-pill { display: inline-flex; align-items: center; gap: 5px; background: #f0f0ee; border-radius: 20px; padding: 4px 10px; font-size: 11px; font-weight: 500; color: #555; }
        .db-info-pill-dot { width: 5px; height: 5px; border-radius: 50%; background: #0a0a0a; }

        @media (max-width: 700px) {
          .db-root { padding: 28px 20px; }
          .db-header { flex-direction: column; align-items: flex-start; gap: 20px; }
          .db-date { text-align: left; }
          .db-bottom { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="db-root">
        <div className="db-header">
          <div className="db-header-left">
            <div className="db-role-badge">
              <div className="db-role-dot" />
              {roleLabel}
            </div>
            <h1 className="db-greeting">
              Good morning, <em>{user?.firstName}.</em>
            </h1>
            <p className="db-sub">{roleDescription}</p>
          </div>
          <div className="db-date">
            <div className="db-date-day">{new Date().getDate()}</div>
            <div className="db-date-rest">{new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</div>
          </div>
        </div>

        <div className="db-stats">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.title} href={stat.href} className="db-stat-card" style={{ animationDelay: `${i * 0.07}s` }}>
                <div className="db-stat-top">
                  <div className="db-stat-icon"><Icon size={16} /></div>
                  <ArrowUpRight size={16} className="db-stat-arrow" />
                </div>
                <div className="db-stat-value">{stat.value}</div>
                <div>
                  <div className="db-stat-title">{stat.title}</div>
                  <div className="db-stat-sub">{stat.sub}</div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="db-bottom">
          <div className="db-panel">
            <div className="db-panel-title">Quick Actions</div>
            <div className="db-actions-list">
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href} className="db-action-btn">
                  <span>{action.label}</span>
                  <ArrowUpRight size={14} className="db-action-icon" />
                </Link>
              ))}
            </div>
          </div>

          <div className="db-panel">
            <div className="db-panel-title">System Overview</div>
            <div className="db-info-list">
              <div className="db-info-row">
                <span className="db-info-label">Academic Year</span>
                <span className="db-info-value">2024 – 2025</span>
              </div>
              <div className="db-info-row">
                <span className="db-info-label">Enrolled Students</span>
                <span className="db-info-pill">
                  <span className="db-info-pill-dot" />
                  {students.filter(s => s.is_active === 1).length} Active
                </span>
              </div>
              <div className="db-info-row">
                <span className="db-info-label">Teaching Staff</span>
                <span className="db-info-value">{teachers.length} Teachers</span>
              </div>
              <div className="db-info-row">
                <span className="db-info-label">Total Classes</span>
                <span className="db-info-value">{classes.length}</span>
              </div>
              <div className="db-info-row">
                <span className="db-info-label">Subjects Offered</span>
                <span className="db-info-value">{subjects.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}