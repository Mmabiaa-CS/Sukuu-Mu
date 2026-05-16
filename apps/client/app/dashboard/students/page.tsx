'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Student } from '@/lib/types';
import { useStudents } from '@/lib/use-students';
import { StudentFormDialog } from '@/components/student-form-dialog';
import { canManageStudents, filterStudentsByAccess } from '@/lib/permissions';
import { useClasses } from '@/lib/use-classes';
import { Plus, Search, MoreHorizontal, Trash2, Eye, SlidersHorizontal, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function StudentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const {
    students,
    filteredStudents,
    searchTerm,
    setSearchTerm,
    addStudent,
    updateStudent,
    deleteStudent,
  } = useStudents();
  const { classes } = useClasses();

  const getClassName = (classId: number | string) => {
    const classItem = classes.find(c => String(c.id) === String(classId));
    return classItem?.name || 'Unknown Class';
  };

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const accessibleStudents = useMemo(() => {
    const base = filterStudentsByAccess(user, filteredStudents);
    if (statusFilter === 'all') return base;
    return base.filter(s => (s.is_active === 1 ? 'active' : 'inactive') === statusFilter);
  }, [user, filteredStudents, statusFilter]);

  const canAdd = canManageStudents(user);

  const [actionError, setActionError] = useState<string | null>(null);

  const handleAddStudent = async (data: any) => {
    setActionError(null);
    try {
      await addStudent(data);
      setIsFormOpen(false);
    } catch (error: any) {
      console.error('Failed to add student:', error);
      setActionError(error?.response?.data?.message || 'Could not add student. Please try again.');
      throw error;
    }
  };
  const handleEditStudent = (student: Student) => { setEditingStudent(student); setIsFormOpen(true); };
  const handleFormClose = () => { setIsFormOpen(false); setEditingStudent(null); };
  const handleDeleteStudent = async (id: number) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    setActionError(null);
    try {
      await deleteStudent(id);
    } catch (error: any) {
      console.error('Failed to delete student:', error);
      setActionError(error?.response?.data?.message || 'Could not delete student. Please try again.');
    }
  };

  const initials = (s: Student) =>
    `${s.first_name?.[0] ?? ''}${s.last_name?.[0] ?? ''}`.toUpperCase();

  const statusCounts = useMemo(() => ({
    all: filterStudentsByAccess(user, filteredStudents).length,
    active: filterStudentsByAccess(user, filteredStudents).filter(s => s.is_active === 1).length,
    inactive: filterStudentsByAccess(user, filteredStudents).filter(s => s.is_active === 0).length,
    graduated: 0,
  }), [user, filteredStudents]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .sp-root {
          font-family: 'DM Sans', sans-serif;
          color: #0a0a0a;
          background: #f9f9f8;
          min-height: 100vh;
          padding: 44px 48px;
          max-width: 1200px;
          margin: 0 auto;
          animation: sp-in 0.4s ease both;
        }
        @keyframes sp-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

        /* HEADER */
        .sp-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 36px;
          padding-bottom: 28px;
          border-bottom: 1px solid #e8e8e6;
        }
        .sp-eyebrow {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #aaa;
          margin-bottom: 8px;
        }
        .sp-title {
          font-family: 'Playfair Display', serif;
          font-size: 36px;
          font-weight: 700;
          color: #0a0a0a;
          line-height: 1.1;
          margin-bottom: 6px;
        }
        .sp-sub {
          font-size: 13px;
          font-weight: 300;
          color: #aaa;
        }
        .sp-add-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 22px;
          background: #0a0a0a;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
          white-space: nowrap;
        }
        .sp-add-btn:hover {
          background: #1a1a1a;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(0,0,0,0.15);
        }

        /* TOOLBAR */
        .sp-toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .sp-search-wrap {
          flex: 1;
          min-width: 220px;
          position: relative;
        }
        .sp-search-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #ccc;
          pointer-events: none;
        }
        .sp-search {
          width: 100%;
          padding: 11px 14px 11px 40px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #0a0a0a;
          background: #ffffff;
          border: 1px solid #e4e4e2;
          border-radius: 8px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .sp-search::placeholder { color: #ccc; }
        .sp-search:focus {
          border-color: #0a0a0a;
          box-shadow: 0 0 0 3px rgba(10,10,10,0.06);
        }
        .sp-clear {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #ccc;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          display: flex;
          align-items: center;
        }
        .sp-clear:hover { color: #888; }

        /* STATUS FILTER PILLS */
        .sp-filters {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .sp-filter-pill {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 8px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 400;
          border: 1px solid #e4e4e2;
          background: #ffffff;
          color: #888;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .sp-filter-pill:hover { border-color: #c0c0be; color: #444; }
        .sp-filter-pill.active {
          background: #0a0a0a;
          border-color: #0a0a0a;
          color: #ffffff;
          font-weight: 500;
        }
        .sp-filter-count {
          font-size: 10px;
          opacity: 0.6;
        }

        /* TABLE CARD */
        .sp-card {
          background: #ffffff;
          border: 1px solid #e8e8e6;
          border-radius: 10px;
          overflow: hidden;
          animation: sp-in 0.4s 0.1s ease both;
        }

        .sp-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 24px;
          border-bottom: 1px solid #f0f0ee;
        }
        .sp-card-title {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #bbb;
        }
        .sp-card-count {
          font-size: 12px;
          color: #ccc;
          font-weight: 300;
        }

        /* TABLE */
        .sp-table-wrap { overflow-x: auto; }
        .sp-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .sp-table thead tr {
          border-bottom: 1px solid #f0f0ee;
        }
        .sp-table th {
          padding: 12px 20px;
          text-align: left;
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #bbb;
          white-space: nowrap;
        }
        .sp-table th:last-child { text-align: right; }
        .sp-table tbody tr {
          border-bottom: 1px solid #f8f8f7;
          transition: background 0.12s;
        }
        .sp-table tbody tr:last-child { border-bottom: none; }
        .sp-table tbody tr:hover { background: #fafafa; }
        .sp-table td {
          padding: 14px 20px;
          color: #444;
          vertical-align: middle;
        }
        .sp-table td:last-child { text-align: right; }

        /* STUDENT CELL */
        .sp-student-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .sp-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #f4f4f3;
          border: 1px solid #e8e8e6;
          font-size: 11px;
          font-weight: 600;
          color: #555;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          letter-spacing: 0.04em;
        }
        .sp-student-name {
          font-size: 13px;
          font-weight: 500;
          color: #0a0a0a;
        }
        .sp-student-email {
          font-size: 11px;
          font-weight: 300;
          color: #aaa;
          margin-top: 1px;
        }

        /* STATUS BADGE */
        .sp-status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 400;
        }
        .sp-status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }
        .sp-status.active { background: #f0faf4; color: #2d7a4f; }
        .sp-status.active .sp-status-dot { background: #2d7a4f; }
        .sp-status.inactive { background: #fef2f2; color: #c0392b; }
        .sp-status.inactive .sp-status-dot { background: #c0392b; }
        .sp-status.graduated { background: #f5f5f5; color: #666; }
        .sp-status.graduated .sp-status-dot { background: #999; }

        /* CELL SECONDARY */
        .sp-cell-secondary { color: #aaa; font-weight: 300; }

        /* ACTIONS */
        .sp-menu-btn { width:30px; height:30px; border-radius:6px; border:1px solid transparent; background:none; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#bbb; transition:background 0.12s, border-color 0.12s, color 0.12s; }
        .sp-menu-btn:hover { background:#f4f4f3; border-color:#e4e4e2; color:#555; }
        .sp-menu-btn[data-state="open"] { background:#f4f4f3; border-color:#e4e4e2; color:#555; }

        /* EMPTY STATE */
        .sp-empty {
          text-align: center;
          padding: 60px 24px;
          color: #ccc;
        }
        .sp-empty-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #f4f4f3;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 14px;
        }
        .sp-empty-text { font-size: 14px; color: #bbb; }
        .sp-empty-sub { font-size: 12px; color: #ddd; margin-top: 4px; font-weight: 300; }

        @media (max-width: 700px) {
          .sp-root { padding: 24px 18px; }
          .sp-header { flex-direction: column; align-items: flex-start; gap: 16px; }
        }
      `}</style>

      <div className="sp-root">

        {/* HEADER */}
        <div className="sp-header">
          <div>
            <div className="sp-eyebrow">Directory</div>
            <h1 className="sp-title">Students</h1>
            <p className="sp-sub">Manage student information and enrollment</p>
          </div>
          {canAdd && (
            <button className="sp-add-btn" onClick={() => setIsFormOpen(true)}>
              <Plus size={15} />
              Add Student
            </button>
          )}
        </div>

        {/* TOOLBAR */}
        {actionError && (
          <div
            role="alert"
            style={{
              marginBottom: '12px',
              border: '1px solid #f5c2c7',
              background: '#fef2f2',
              color: '#7f1d1d',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '13px',
            }}
          >
            {actionError}
          </div>
        )}
        <div className="sp-toolbar">
          <div className="sp-search-wrap">
            <Search size={14} className="sp-search-icon" />
            <input
              className="sp-search"
              placeholder="Search by name, email, or ID…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="sp-clear" onClick={() => setSearchTerm('')}>
                <X size={13} />
              </button>
            )}
          </div>

          <div className="sp-filters">
            {(['all', 'active', 'inactive', 'graduated'] as const).map((f) => (
              <button
                key={f}
                className={`sp-filter-pill ${statusFilter === f ? 'active' : ''}`}
                onClick={() => setStatusFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <span className="sp-filter-count">{statusCounts[f]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* TABLE */}
        <div className="sp-card">
          <div className="sp-card-header">
            <span className="sp-card-title">Student List</span>
            <span className="sp-card-count">
              {accessibleStudents.length} of {students.length} students
            </span>
          </div>

          {accessibleStudents.length === 0 ? (
            <div className="sp-empty">
              <div className="sp-empty-icon">
                <Search size={18} color="#ccc" />
              </div>
              <p className="sp-empty-text">No students found</p>
              <p className="sp-empty-sub">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="sp-table-wrap">
              <table className="sp-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Class</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {accessibleStudents.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <div className="sp-student-cell">
                          <div className="sp-avatar">{initials(student)}</div>
                          <div>
                            <div className="sp-student-name">
                              {student.first_name} {student.last_name}
                            </div>
                            <div className="sp-student-email">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="sp-cell-secondary">
                        {student.class_id ? getClassName(student.class_id) : '—'}
                      </td>
                      <td className="sp-cell-secondary">
                        {student.phone || '—'}
                      </td>
                      <td>
                        <span className={`sp-status ${student.is_active === 1 ? 'active' : 'inactive'}`}>
                          <span className="sp-status-dot" />
                          {student.is_active === 1 ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="sp-menu-btn">
                              <MoreHorizontal size={15} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/students/${student.id}`)}>
                              <Eye size={13} className="mr-2" /> View Profile
                            </DropdownMenuItem>
                            {canManageStudents(user) && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleEditStudent(student)}>
                                  Edit Student
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600 focus:bg-red-50 focus:text-red-700"
                                  onClick={() => handleDeleteStudent(student.id)}
                                >
                                  <Trash2 size={13} className="mr-2" /> Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      <StudentFormDialog
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={editingStudent
          ? async (data) => {
            setActionError(null);
            try {
              await updateStudent({ id: editingStudent.id, updates: data });
              setEditingStudent(null);
              setIsFormOpen(false);
            } catch (error: any) {
              console.error('Failed to update student:', error);
              setActionError(error?.response?.data?.message || 'Could not update student. Please try again.');
              throw error;
            }
          }
          : handleAddStudent}
        initialData={editingStudent}
        isEditing={!!editingStudent}
      />
    </>
  );
}