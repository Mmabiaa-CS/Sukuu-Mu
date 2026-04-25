'use client';

import { useMemo, useState } from 'react';
import { useTeachers } from '@/lib/use-teachers';
import { TeacherFormDialog } from '@/components/teacher-form-dialog';
import { Teacher } from '@/lib/types';
import { Plus, Search, MoreHorizontal, Trash2, X } from 'lucide-react';

export default function TeachersPage() {
  const {
    filteredTeachers,
    searchTerm,
    setSearchTerm,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    getTeacherSubjects,
  } = useTeachers();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionError, setActionError] = useState<string | null>(null);

  const accessibleTeachers = useMemo(() => {
    if (statusFilter === 'all') return filteredTeachers;
    return filteredTeachers.filter((t) => t.status === statusFilter);
  }, [filteredTeachers, statusFilter]);

  const statusCounts = useMemo(() => ({
    all: filteredTeachers.length,
    active: filteredTeachers.filter((t) => t.status === 'active').length,
    'on-leave': filteredTeachers.filter((t) => t.status === 'on-leave').length,
    inactive: filteredTeachers.filter((t) => t.status === 'inactive').length,
  }), [filteredTeachers]);

  const handleAddTeacher = (data: Omit<Teacher, 'id'>) => {
    setActionError(null);
    try {
      addTeacher(data);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Failed to add teacher:', error);
      setActionError('Could not add teacher. Please try again.');
    }
  };
  const handleEditTeacher = (teacher: Teacher) => { setEditingTeacher(teacher); setIsFormOpen(true); };
  const handleFormClose = () => { setIsFormOpen(false); setEditingTeacher(null); };
  const handleDeleteTeacher = (id: string) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;
    setActionError(null);
    try {
      deleteTeacher(id);
    } catch (error) {
      console.error('Failed to delete teacher:', error);
      setActionError('Could not delete teacher. Please try again.');
    }
  };

  const initials = (t: Teacher) =>
    `${t.firstName?.[0] ?? ''}${t.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .tp-root {
          font-family: 'DM Sans', sans-serif;
          color: #0a0a0a;
          background: #f9f9f8;
          min-height: 100vh;
          padding: 44px 48px;
          max-width: 1200px;
          margin: 0 auto;
          animation: tp-in 0.4s ease both;
        }
        @keyframes tp-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

        .tp-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 36px;
          padding-bottom: 28px;
          border-bottom: 1px solid #e8e8e6;
        }
        .tp-eyebrow {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #aaa;
          margin-bottom: 8px;
        }
        .tp-title {
          font-family: 'Playfair Display', serif;
          font-size: 36px;
          font-weight: 700;
          color: #0a0a0a;
          line-height: 1.1;
          margin-bottom: 6px;
        }
        .tp-sub { font-size: 13px; font-weight: 300; color: #aaa; }

        .tp-add-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 22px;
          background: #0a0a0a;
          color: #fff;
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
        .tp-add-btn:hover {
          background: #1a1a1a;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(0,0,0,0.15);
        }

        .tp-toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .tp-search-wrap { flex: 1; min-width: 220px; position: relative; }
        .tp-search-icon {
          position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
          color: #ccc; pointer-events: none;
        }
        .tp-search {
          width: 100%;
          padding: 11px 14px 11px 40px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #0a0a0a;
          background: #fff;
          border: 1px solid #e4e4e2;
          border-radius: 8px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .tp-search::placeholder { color: #ccc; }
        .tp-search:focus { border-color: #0a0a0a; box-shadow: 0 0 0 3px rgba(10,10,10,0.06); }
        .tp-clear {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          color: #ccc; cursor: pointer; background: none; border: none;
          padding: 0; display: flex; align-items: center;
        }
        .tp-clear:hover { color: #888; }

        .tp-filters { display: flex; gap: 6px; flex-wrap: wrap; }
        .tp-filter-pill {
          display: flex; align-items: center; gap: 5px;
          padding: 8px 14px; border-radius: 20px;
          font-size: 12px; font-weight: 400;
          border: 1px solid #e4e4e2; background: #fff;
          color: #888; cursor: pointer; transition: all 0.15s; white-space: nowrap;
        }
        .tp-filter-pill:hover { border-color: #c0c0be; color: #444; }
        .tp-filter-pill.active { background: #0a0a0a; border-color: #0a0a0a; color: #fff; font-weight: 500; }
        .tp-filter-count { font-size: 10px; opacity: 0.6; }

        .tp-card {
          background: #fff;
          border: 1px solid #e8e8e6;
          border-radius: 10px;
          overflow: hidden;
          animation: tp-in 0.4s 0.1s ease both;
        }
        .tp-card-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 24px; border-bottom: 1px solid #f0f0ee;
        }
        .tp-card-title { font-size: 10px; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; color: #bbb; }
        .tp-card-count { font-size: 12px; color: #ccc; font-weight: 300; }

        .tp-table-wrap { overflow-x: auto; }
        .tp-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .tp-table thead tr { border-bottom: 1px solid #f0f0ee; }
        .tp-table th {
          padding: 12px 20px; text-align: left;
          font-size: 9px; font-weight: 500; letter-spacing: 0.14em;
          text-transform: uppercase; color: #bbb; white-space: nowrap;
        }
        .tp-table th:last-child { text-align: right; }
        .tp-table tbody tr { border-bottom: 1px solid #f8f8f7; transition: background 0.12s; }
        .tp-table tbody tr:last-child { border-bottom: none; }
        .tp-table tbody tr:hover { background: #fafafa; }
        .tp-table td { padding: 14px 20px; color: #444; vertical-align: middle; }
        .tp-table td:last-child { text-align: right; }

        .tp-teacher-cell { display: flex; align-items: center; gap: 12px; }
        .tp-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: #f4f4f3; border: 1px solid #e8e8e6;
          font-size: 11px; font-weight: 600; color: #555;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; letter-spacing: 0.04em;
        }
        .tp-teacher-name { font-size: 13px; font-weight: 500; color: #0a0a0a; }
        .tp-teacher-email { font-size: 11px; font-weight: 300; color: #aaa; margin-top: 1px; }

        .tp-subjects { display: flex; flex-wrap: wrap; gap: 4px; }
        .tp-subject-tag {
          background: #f2eeff; color: #5b41c9;
          padding: 2px 8px; border-radius: 4px; font-size: 11px;
        }

        .tp-status {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 400;
        }
        .tp-status-dot { width: 5px; height: 5px; border-radius: 50%; }
        .tp-status.active { background: #f0faf4; color: #2d7a4f; }
        .tp-status.active .tp-status-dot { background: #2d7a4f; }
        .tp-status.on-leave { background: #fef9ec; color: #a06b00; }
        .tp-status.on-leave .tp-status-dot { background: #d4900a; }
        .tp-status.inactive { background: #fef2f2; color: #b52b2b; }
        .tp-status.inactive .tp-status-dot { background: #b52b2b; }

        .tp-cell-secondary { color: #aaa; font-weight: 300; }

        .tp-actions-wrap { position: relative; display: inline-block; }
        .tp-menu-btn {
          width: 30px; height: 30px; border-radius: 6px;
          border: 1px solid transparent; background: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #bbb;
          transition: background 0.12s, border-color 0.12s, color 0.12s;
        }
        .tp-menu-btn:hover { background: #f4f4f3; border-color: #e4e4e2; color: #555; }
        .tp-dropdown {
          position: absolute; right: 0; top: calc(100% + 6px);
          background: #fff; border: 1px solid #e4e4e2;
          border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.09);
          min-width: 160px; z-index: 20; overflow: hidden;
          animation: tp-drop 0.15s ease;
        }
        @keyframes tp-drop { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .tp-dropdown-item {
          display: flex; align-items: center; gap: 9px;
          padding: 10px 14px; font-size: 12px; color: #444;
          cursor: pointer; transition: background 0.1s;
          border: none; background: none; width: 100%;
          text-align: left; font-family: 'DM Sans', sans-serif;
        }
        .tp-dropdown-item:hover { background: #f7f7f6; }
        .tp-dropdown-item.danger { color: #c0392b; }
        .tp-dropdown-item.danger:hover { background: #fef2f2; }
        .tp-dropdown-divider { height: 1px; background: #f0f0ee; margin: 4px 0; }

        .tp-empty { text-align: center; padding: 60px 24px; }
        .tp-empty-icon {
          width: 44px; height: 44px; border-radius: 50%; background: #f4f4f3;
          display: flex; align-items: center; justify-content: center; margin: 0 auto 14px;
        }
        .tp-empty-text { font-size: 14px; color: #bbb; }
        .tp-empty-sub { font-size: 12px; color: #ddd; margin-top: 4px; font-weight: 300; }

        @media (max-width: 700px) {
          .tp-root { padding: 24px 18px; }
          .tp-header { flex-direction: column; align-items: flex-start; gap: 16px; }
        }
      `}</style>

      <div className="tp-root">

        <div className="tp-header">
          <div>
            <div className="tp-eyebrow">Staff Directory</div>
            <h1 className="tp-title">Teachers</h1>
            <p className="tp-sub">Manage teacher information and subject assignments</p>
          </div>
          <button className="tp-add-btn" onClick={() => setIsFormOpen(true)}>
            <Plus size={15} />
            Add Teacher
          </button>
        </div>

        <div className="tp-toolbar">
          {actionError && (
            <div
              role="alert"
              style={{
                width: '100%',
                marginBottom: '4px',
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

          <div className="tp-search-wrap">
            <Search size={14} className="tp-search-icon" />
            <input
              className="tp-search"
              placeholder="Search by name or email…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="tp-clear" onClick={() => setSearchTerm('')}>
                <X size={13} />
              </button>
            )}
          </div>

          <div className="tp-filters">
            {(['all', 'active', 'on-leave', 'inactive'] as const).map((f) => (
              <button
                key={f}
                className={`tp-filter-pill ${statusFilter === f ? 'active' : ''}`}
                onClick={() => setStatusFilter(f)}
              >
                {f === 'on-leave' ? 'On Leave' : f.charAt(0).toUpperCase() + f.slice(1)}
                <span className="tp-filter-count">{statusCounts[f]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="tp-card">
          <div className="tp-card-header">
            <span className="tp-card-title">Teaching Staff</span>
            <span className="tp-card-count">
              {accessibleTeachers.length} staff member{accessibleTeachers.length !== 1 ? 's' : ''}
            </span>
          </div>

          {accessibleTeachers.length === 0 ? (
            <div className="tp-empty">
              <div className="tp-empty-icon">
                <Search size={18} color="#ccc" />
              </div>
              <p className="tp-empty-text">No teachers found</p>
              <p className="tp-empty-sub">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="tp-table-wrap">
              <table className="tp-table">
                <thead>
                  <tr>
                    <th>Teacher</th>
                    <th>Subjects</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {accessibleTeachers.map((teacher) => {
                    const subjects = getTeacherSubjects(teacher.subjectIds);
                    return (
                      <tr key={teacher.id}>
                        <td>
                          <div className="tp-teacher-cell">
                            <div className="tp-avatar">{initials(teacher)}</div>
                            <div>
                              <div className="tp-teacher-name">{teacher.firstName} {teacher.lastName}</div>
                              <div className="tp-teacher-email">{teacher.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="tp-subjects">
                            {subjects.slice(0, 2).map((s, i) => (
                              <span key={i} className="tp-subject-tag">{s}</span>
                            ))}
                            {subjects.length > 2 && (
                              <span className="tp-cell-secondary" style={{ fontSize: 11 }}>
                                +{subjects.length - 2} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="tp-cell-secondary">{teacher.phone || '—'}</td>
                        <td>
                          <span className={`tp-status ${teacher.status}`}>
                            <span className="tp-status-dot" />
                            {teacher.status === 'on-leave' ? 'On Leave' : teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          <div className="tp-actions-wrap">
                            <button
                              className="tp-menu-btn"
                              onClick={() => setActiveMenu(activeMenu === teacher.id ? null : teacher.id)}
                            >
                              <MoreHorizontal size={15} />
                            </button>
                            {activeMenu === teacher.id && (
                              <div className="tp-dropdown">
                                <button
                                  className="tp-dropdown-item"
                                  onClick={() => { setActiveMenu(null); handleEditTeacher(teacher); }}
                                >
                                  Edit Teacher
                                </button>
                                <div className="tp-dropdown-divider" />
                                <button
                                  className="tp-dropdown-item danger"
                                  onClick={() => { setActiveMenu(null); handleDeleteTeacher(teacher.id); }}
                                >
                                  <Trash2 size={13} /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {activeMenu && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setActiveMenu(null)} />
      )}

      <TeacherFormDialog
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={editingTeacher
          ? (data: Omit<Teacher, 'id'>) => {
              setActionError(null);
              try {
                updateTeacher(editingTeacher.id, data);
                setEditingTeacher(null);
              } catch (error) {
                console.error('Failed to update teacher:', error);
                setActionError('Could not update teacher. Please try again.');
              }
            }
          : handleAddTeacher}
        initialData={editingTeacher ?? undefined}
        isEditing={!!editingTeacher}
      />
    </>
  );
}