'use client';

import { useMemo, useState } from 'react';
import { useClasses } from '@/lib/use-classes';
import { ClassFormDialog } from '@/components/class-form-dialog';
import { Class } from '@/lib/types';
import { Plus, Search, MoreHorizontal, Trash2, X } from 'lucide-react';

export default function ClassesPage() {
  const {
    filteredClasses,
    searchTerm,
    setSearchTerm,
    addClass,
    updateClass,
    deleteClass,
    getStudentsInClass,
    getClassFillPercentage,
  } = useClasses();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleAddClass = (data: Omit<Class, 'id' | 'createdAt' | 'created_at' | 'total_students'>) => {
    setActionError(null);
    try {
      addClass(data);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Failed to add class:', error);
      setActionError('Could not create class. Please try again.');
    }
  };
  const handleEditClass = (cls: Class) => { setEditingClass(cls); setIsFormOpen(true); };
  const handleFormClose = () => { setIsFormOpen(false); setEditingClass(null); };
  const handleDeleteClass = (id: number) => {
    if (!confirm('Are you sure you want to delete this class?')) return;
    setActionError(null);
    try {
      deleteClass(id);
    } catch (error) {
      console.error('Failed to delete class:', error);
      setActionError('Could not delete class. Please try again.');
    }
  };

  const stats = useMemo(() => {
    const safeList = filteredClasses ?? [];
    const totalEnrolled = safeList.reduce(
      (sum, cls) => sum + getStudentsInClass(cls.id).length, 0
    );
    const totalCap = safeList.reduce((sum, cls) => sum + (cls.capacity || 0), 0);
    const avgFill = totalCap > 0 ? Math.round((totalEnrolled / totalCap) * 100) : 0;
    return { total: safeList.length, totalEnrolled, avgFill };
  }, [filteredClasses, getStudentsInClass]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .cp-root {
          font-family: 'DM Sans', sans-serif;
          color: #0a0a0a;
          background: #f9f9f8;
          min-height: 100vh;
          padding: 44px 48px;
          max-width: 1200px;
          margin: 0 auto;
          animation: cp-in 0.4s ease both;
        }
        @keyframes cp-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

        .cp-header { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:36px; padding-bottom:28px; border-bottom:1px solid #e8e8e6; }
        .cp-eyebrow { font-size:10px; font-weight:500; letter-spacing:0.18em; text-transform:uppercase; color:#aaa; margin-bottom:8px; }
        .cp-title { font-family:'Playfair Display',serif; font-size:36px; font-weight:700; color:#0a0a0a; line-height:1.1; margin-bottom:6px; }
        .cp-sub { font-size:13px; font-weight:300; color:#aaa; }

        .cp-add-btn {
          display:flex; align-items:center; gap:8px; padding:12px 22px;
          background:#0a0a0a; color:#fff; border:none; border-radius:8px;
          font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500; letter-spacing:0.04em;
          cursor:pointer; transition:background 0.15s, transform 0.15s, box-shadow 0.15s; white-space:nowrap;
        }
        .cp-add-btn:hover { background:#1a1a1a; transform:translateY(-1px); box-shadow:0 4px 14px rgba(0,0,0,0.15); }

        /* STATS */
        .cp-stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:14px; margin-bottom:28px; animation:cp-in 0.4s 0.05s ease both; }
        .cp-stat { background:#fff; border:1px solid #e8e8e6; border-radius:10px; padding:22px 24px; position:relative; overflow:hidden; transition:border-color 0.2s, transform 0.2s, box-shadow 0.2s; }
        .cp-stat::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:#0a0a0a; transform:scaleX(0); transform-origin:left; transition:transform 0.3s ease; }
        .cp-stat:hover { border-color:#c8c8c6; transform:translateY(-2px); box-shadow:0 4px 20px rgba(0,0,0,0.07); }
        .cp-stat:hover::before { transform:scaleX(1); }
        .cp-stat-icon { width:32px; height:32px; border-radius:7px; background:#f4f4f3; display:flex; align-items:center; justify-content:center; margin-bottom:14px; }
        .cp-stat-label { font-size:10px; font-weight:500; letter-spacing:0.14em; text-transform:uppercase; color:#bbb; margin-bottom:6px; }
        .cp-stat-value { font-family:'Playfair Display',serif; font-size:28px; font-weight:700; color:#0a0a0a; line-height:1; margin-bottom:4px; }
        .cp-stat-sub { font-size:11px; font-weight:300; color:#bbb; }

        /* TOOLBAR */
        .cp-toolbar { display:flex; align-items:center; gap:12px; margin-bottom:20px; flex-wrap:wrap; }
        .cp-search-wrap { flex:1; min-width:220px; position:relative; }
        .cp-search-icon { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:#ccc; pointer-events:none; }
        .cp-search {
          width:100%; padding:11px 14px 11px 40px; font-family:'DM Sans',sans-serif;
          font-size:13px; color:#0a0a0a; background:#fff; border:1px solid #e4e4e2;
          border-radius:8px; outline:none; transition:border-color 0.2s, box-shadow 0.2s;
        }
        .cp-search::placeholder { color:#ccc; }
        .cp-search:focus { border-color:#0a0a0a; box-shadow:0 0 0 3px rgba(10,10,10,0.06); }
        .cp-clear { position:absolute; right:12px; top:50%; transform:translateY(-50%); color:#ccc; cursor:pointer; background:none; border:none; padding:0; display:flex; align-items:center; }
        .cp-clear:hover { color:#888; }

        /* TABLE CARD */
        .cp-card { background:#fff; border:1px solid #e8e8e6; border-radius:10px; overflow:hidden; animation:cp-in 0.4s 0.1s ease both; }
        .cp-card-header { display:flex; align-items:center; justify-content:space-between; padding:18px 24px; border-bottom:1px solid #f0f0ee; }
        .cp-card-title { font-size:10px; font-weight:500; letter-spacing:0.16em; text-transform:uppercase; color:#bbb; }
        .cp-card-count { font-size:12px; color:#ccc; font-weight:300; }

        .cp-table-wrap { overflow-x:auto; }
        .cp-table { width:100%; border-collapse:collapse; font-size:13px; }
        .cp-table thead tr { border-bottom:1px solid #f0f0ee; }
        .cp-table th { padding:12px 20px; text-align:left; font-size:9px; font-weight:500; letter-spacing:0.14em; text-transform:uppercase; color:#bbb; white-space:nowrap; }
        .cp-table th:last-child { text-align:right; }
        .cp-table tbody tr { border-bottom:1px solid #f8f8f7; transition:background 0.12s; }
        .cp-table tbody tr:last-child { border-bottom:none; }
        .cp-table tbody tr:hover { background:#fafafa; }
        .cp-table td { padding:14px 20px; color:#444; vertical-align:middle; }
        .cp-table td:last-child { text-align:right; }

        .cp-class-name { font-size:13px; font-weight:500; color:#0a0a0a; }
        .cp-code { font-size:12px; font-family:'Courier New',monospace; color:#888; background:#f4f4f3; padding:2px 7px; border-radius:4px; }
        .cp-muted { color:#aaa; font-weight:300; }

        /* PROGRESS */
        .cp-progress-wrap { display:flex; align-items:center; gap:10px; }
        .cp-progress-bar { width:60px; height:5px; background:#f0f0ee; border-radius:3px; overflow:hidden; }
        .cp-progress-fill { height:100%; border-radius:3px; }
        .cp-progress-fill.green { background:#2d7a4f; }
        .cp-progress-fill.amber { background:#d4900a; }
        .cp-progress-fill.red { background:#b52b2b; }
        .cp-progress-label { font-size:11px; color:#aaa; font-weight:400; min-width:32px; }

        /* ENROLLMENT BADGE */
        .cp-enroll-badge { display:inline-flex; align-items:center; gap:6px; }
        .cp-enroll-num { font-weight:500; color:#0a0a0a; }
        .cp-enroll-cap { color:#aaa; font-weight:300; }

        /* ACTIONS */
        .cp-actions-wrap { position:relative; display:inline-block; }
        .cp-menu-btn { width:30px; height:30px; border-radius:6px; border:1px solid transparent; background:none; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#bbb; transition:background 0.12s, border-color 0.12s, color 0.12s; }
        .cp-menu-btn:hover { background:#f4f4f3; border-color:#e4e4e2; color:#555; }
        .cp-dropdown { position:absolute; right:0; top:calc(100% + 6px); background:#fff; border:1px solid #e4e4e2; border-radius:8px; box-shadow:0 8px 24px rgba(0,0,0,0.09); min-width:160px; z-index:20; overflow:hidden; animation:cp-drop 0.15s ease; }
        @keyframes cp-drop { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .cp-dropdown-item { display:flex; align-items:center; gap:9px; padding:10px 14px; font-size:12px; color:#444; cursor:pointer; transition:background 0.1s; border:none; background:none; width:100%; text-align:left; font-family:'DM Sans',sans-serif; }
        .cp-dropdown-item:hover { background:#f7f7f6; }
        .cp-dropdown-item.danger { color:#c0392b; }
        .cp-dropdown-item.danger:hover { background:#fef2f2; }
        .cp-dropdown-divider { height:1px; background:#f0f0ee; margin:4px 0; }

        .cp-empty { text-align:center; padding:60px 24px; }
        .cp-empty-icon { width:44px; height:44px; border-radius:50%; background:#f4f4f3; display:flex; align-items:center; justify-content:center; margin:0 auto 14px; }
        .cp-empty-text { font-size:14px; color:#bbb; }
        .cp-empty-sub { font-size:12px; color:#ddd; margin-top:4px; font-weight:300; }

        @media (max-width:700px) { .cp-root { padding:24px 18px; } .cp-header { flex-direction:column; align-items:flex-start; gap:16px; } }
      `}</style>

      <div className="cp-root">

        <div className="cp-header">
          <div>
            <div className="cp-eyebrow">Academic Structure</div>
            <h1 className="cp-title">Classes</h1>
            <p className="cp-sub">Manage classes and monitor enrollment capacity</p>
          </div>
          <button className="cp-add-btn" onClick={() => setIsFormOpen(true)}>
            <Plus size={15} />
            Create Class
          </button>
        </div>

        {/* STAT CARDS */}
        <div className="cp-stats">
          <div className="cp-stat">
            <div className="cp-stat-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
            </div>
            <div className="cp-stat-label">Total Classes</div>
            <div className="cp-stat-value">{stats.total}</div>
            <div className="cp-stat-sub">Academic year 2024–25</div>
          </div>
          <div className="cp-stat">
            <div className="cp-stat-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </div>
            <div className="cp-stat-label">Total Enrolled</div>
            <div className="cp-stat-value">{stats.totalEnrolled}</div>
            <div className="cp-stat-sub">Students across all classes</div>
          </div>
          <div className="cp-stat">
            <div className="cp-stat-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
            </div>
            <div className="cp-stat-label">Avg Fill Rate</div>
            <div className="cp-stat-value">{stats.avgFill}%</div>
            <div className="cp-stat-sub">Average across all classes</div>
          </div>
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

        <div className="cp-toolbar">
          <div className="cp-search-wrap">
            <Search size={14} className="cp-search-icon" />
            <input
              className="cp-search"
              placeholder="Search by name or code…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="cp-clear" onClick={() => setSearchTerm('')}><X size={13} /></button>
            )}
          </div>
        </div>

        {/* TABLE */}
        <div className="cp-card">
          <div className="cp-card-header">
            <span className="cp-card-title">Class List</span>
            <span className="cp-card-count">{filteredClasses.length} class{filteredClasses.length !== 1 ? 'es' : ''}</span>
          </div>

          {filteredClasses.length === 0 ? (
            <div className="cp-empty">
              <div className="cp-empty-icon"><Search size={18} color="#ccc" /></div>
              <p className="cp-empty-text">No classes found</p>
              <p className="cp-empty-sub">Try adjusting your search</p>
            </div>
          ) : (
            <div className="cp-table-wrap">
              <table className="cp-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Code</th>
                    <th>Grade</th>
                    <th>Enrolled</th>
                    <th>Capacity</th>
                    <th>Fill Rate</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClasses.map((cls) => {
                    const students = getStudentsInClass(cls.id);
                    const fill = getClassFillPercentage(cls.id);
                    const fillClass = fill > 90 ? 'red' : fill > 70 ? 'amber' : 'green';
                    return (
                      <tr key={cls.id}>
                        <td><span className="cp-class-name">{cls.name}</span></td>
                        <td><span className="cp-code">{cls.code}</span></td>
                        <td className="cp-muted">Grade {cls.level}</td>
                        <td>
                          <span className="cp-enroll-badge">
                            <span className="cp-enroll-num">{students.length}</span>
                            <span className="cp-enroll-cap">/ {cls.capacity}</span>
                          </span>
                        </td>
                        <td className="cp-muted">{cls.capacity}</td>
                        <td>
                          <div className="cp-progress-wrap">
                            <div className="cp-progress-bar">
                              <div className={`cp-progress-fill ${fillClass}`} style={{ width: `${fill}%` }} />
                            </div>
                            <span className="cp-progress-label">{fill}%</span>
                          </div>
                        </td>
                        <td>
                          <div className="cp-actions-wrap">
                            <button
                              className="cp-menu-btn"
                              onClick={() => setActiveMenu(activeMenu === cls.id ? null : cls.id)}
                            >
                              <MoreHorizontal size={15} />
                            </button>
                            {activeMenu === cls.id && (
                              <div className="cp-dropdown">
                                <button
                                  className="cp-dropdown-item"
                                  onClick={() => { setActiveMenu(null); handleEditClass(cls); }}
                                >
                                  Edit Class
                                </button>
                                <div className="cp-dropdown-divider" />
                                <button
                                  className="cp-dropdown-item danger"
                                  onClick={() => { setActiveMenu(null); handleDeleteClass(cls.id); }}
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

      <ClassFormDialog
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={editingClass
          ? (data: Omit<Class, 'id' | 'createdAt' | 'created_at' | 'total_students'>) => {
            setActionError(null);
            try {
              updateClass({ id: editingClass.id, updates: data });
              setEditingClass(null);
            } catch (error) {
              console.error('Failed to update class:', error);
              setActionError('Could not update class. Please try again.');
            }
          }
          : handleAddClass}
        initialData={editingClass ?? undefined}
        isEditing={!!editingClass}
      />
    </>
  );
}