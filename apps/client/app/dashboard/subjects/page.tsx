'use client';

import { useMemo, useState } from 'react';
import { useSubjects } from '@/lib/use-subjects';
import { SubjectFormDialog } from '@/components/subject-form-dialog';
import { Subject } from '@/lib/types';
import { Plus, Search, MoreHorizontal, Trash2, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function SubjectsPage() {
  const {
    filteredSubjects,
    searchTerm,
    setSearchTerm,
    addSubject,
    updateSubject,
    deleteSubject,
  } = useSubjects();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleAddSubject = async (data: Omit<Subject, 'id'>) => {
    setActionError(null);
    try {
      await addSubject(data);
      setIsFormOpen(false);
    } catch (error: any) {
      console.error('Failed to add subject:', error);
      setActionError(error?.response?.data?.message || 'Could not create subject. Please try again.');
      throw error; // Re-throw so the form dialog catches it and stays open
    }
  };
  const handleEditSubject = (subject: Subject) => { setEditingSubject(subject); setIsFormOpen(true); };
  const handleFormClose = () => { setIsFormOpen(false); setEditingSubject(null); };
  const handleDeleteSubject = (id: number) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    setActionError(null);
    try {
      deleteSubject(id);
    } catch (error) {
      console.error('Failed to delete subject:', error);
      setActionError('Could not delete subject. Please try again.');
    }
  };

  const stats = useMemo(() => {
    const safeList = filteredSubjects ?? [];
    const total = safeList.length;
    const totalCredits = safeList.reduce((sum, s) => sum + (s.creditHours || 0), 0);
    const avgCredits = total > 0 ? Math.round(totalCredits / total) : 0;
    return { total, totalCredits, avgCredits };
  }, [filteredSubjects]);

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

        .sp-header { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:36px; padding-bottom:28px; border-bottom:1px solid #e8e8e6; }
        .sp-eyebrow { font-size:10px; font-weight:500; letter-spacing:0.18em; text-transform:uppercase; color:#aaa; margin-bottom:8px; }
        .sp-title { font-family:'Playfair Display',serif; font-size:36px; font-weight:700; color:#0a0a0a; line-height:1.1; margin-bottom:6px; }
        .sp-sub { font-size:13px; font-weight:300; color:#aaa; }

        .sp-add-btn {
          display:flex; align-items:center; gap:8px; padding:12px 22px;
          background:#0a0a0a; color:#fff; border:none; border-radius:8px;
          font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500; letter-spacing:0.04em;
          cursor:pointer; transition:background 0.15s, transform 0.15s, box-shadow 0.15s; white-space:nowrap;
        }
        .sp-add-btn:hover { background:#1a1a1a; transform:translateY(-1px); box-shadow:0 4px 14px rgba(0,0,0,0.15); }

        /* STATS */
        .sp-stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:14px; margin-bottom:28px; animation:sp-in 0.4s 0.05s ease both; }
        .sp-stat { background:#fff; border:1px solid #e8e8e6; border-radius:10px; padding:22px 24px; position:relative; overflow:hidden; transition:border-color 0.2s, transform 0.2s, box-shadow 0.2s; }
        .sp-stat::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:#0a0a0a; transform:scaleX(0); transform-origin:left; transition:transform 0.3s ease; }
        .sp-stat:hover { border-color:#c8c8c6; transform:translateY(-2px); box-shadow:0 4px 20px rgba(0,0,0,0.07); }
        .sp-stat:hover::before { transform:scaleX(1); }
        .sp-stat-icon { width:32px; height:32px; border-radius:7px; background:#f4f4f3; display:flex; align-items:center; justify-content:center; margin-bottom:14px; }
        .sp-stat-label { font-size:10px; font-weight:500; letter-spacing:0.14em; text-transform:uppercase; color:#bbb; margin-bottom:6px; }
        .sp-stat-value { font-family:'Playfair Display',serif; font-size:28px; font-weight:700; color:#0a0a0a; line-height:1; margin-bottom:4px; }
        .sp-stat-sub { font-size:11px; font-weight:300; color:#bbb; }

        /* TOOLBAR */
        .sp-toolbar { display:flex; align-items:center; gap:12px; margin-bottom:20px; flex-wrap:wrap; }
        .sp-search-wrap { flex:1; min-width:220px; position:relative; }
        .sp-search-icon { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:#ccc; pointer-events:none; }
        .sp-search {
          width:100%; padding:11px 14px 11px 40px; font-family:'DM Sans',sans-serif;
          font-size:13px; color:#0a0a0a; background:#fff; border:1px solid #e4e4e2;
          border-radius:8px; outline:none; transition:border-color 0.2s, box-shadow 0.2s;
        }
        .sp-search::placeholder { color:#ccc; }
        .sp-search:focus { border-color:#0a0a0a; box-shadow:0 0 0 3px rgba(10,10,10,0.06); }
        .sp-clear { position:absolute; right:12px; top:50%; transform:translateY(-50%); color:#ccc; cursor:pointer; background:none; border:none; padding:0; display:flex; align-items:center; }
        .sp-clear:hover { color:#888; }

        /* TABLE CARD */
        .sp-card { background:#fff; border:1px solid #e8e8e6; border-radius:10px; overflow:hidden; animation:sp-in 0.4s 0.1s ease both; }
        .sp-card-header { display:flex; align-items:center; justify-content:space-between; padding:18px 24px; border-bottom:1px solid #f0f0ee; }
        .sp-card-title { font-size:10px; font-weight:500; letter-spacing:0.16em; text-transform:uppercase; color:#bbb; }
        .sp-card-count { font-size:12px; color:#ccc; font-weight:300; }

        .sp-table-wrap { overflow-x:auto; }
        .sp-table { width:100%; border-collapse:collapse; font-size:13px; }
        .sp-table thead tr { border-bottom:1px solid #f0f0ee; }
        .sp-table th { padding:12px 20px; text-align:left; font-size:9px; font-weight:500; letter-spacing:0.14em; text-transform:uppercase; color:#bbb; white-space:nowrap; }
        .sp-table th:last-child { text-align:right; }
        .sp-table tbody tr { border-bottom:1px solid #f8f8f7; transition:background 0.12s; }
        .sp-table tbody tr:last-child { border-bottom:none; }
        .sp-table tbody tr:hover { background:#fafafa; }
        .sp-table td { padding:14px 20px; color:#444; vertical-align:middle; }
        .sp-table td:last-child { text-align:right; }

        .sp-subject-name { font-size:13px; font-weight:500; color:#0a0a0a; }
        .sp-code { font-size:12px; font-family:'Courier New',monospace; color:#888; background:#f4f4f3; padding:2px 7px; border-radius:4px; }
        .sp-muted { color:#aaa; font-weight:300; font-size:12px; max-width:280px; }
        .sp-credit-tag { display:inline-block; background:#e8f1fd; color:#1a5cb0; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:500; }

        /* ACTIONS */
        .sp-menu-btn { width:30px; height:30px; border-radius:6px; border:1px solid transparent; background:none; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#bbb; transition:background 0.12s, border-color 0.12s, color 0.12s; }
        .sp-menu-btn:hover { background:#f4f4f3; border-color:#e4e4e2; color:#555; }
        .sp-menu-btn[data-state="open"] { background:#f4f4f3; border-color:#e4e4e2; color:#555; }

        .sp-empty { text-align:center; padding:60px 24px; }
        .sp-empty-icon { width:44px; height:44px; border-radius:50%; background:#f4f4f3; display:flex; align-items:center; justify-content:center; margin:0 auto 14px; }
        .sp-empty-text { font-size:14px; color:#bbb; }
        .sp-empty-sub { font-size:12px; color:#ddd; margin-top:4px; font-weight:300; }

        @media (max-width:700px) { .sp-root { padding:24px 18px; } .sp-header { flex-direction:column; align-items:flex-start; gap:16px; } }
      `}</style>

      <div className="sp-root">

        <div className="sp-header">
          <div>
            <div className="sp-eyebrow">Curriculum</div>
            <h1 className="sp-title">Subjects</h1>
            <p className="sp-sub">Manage academic subjects offered at the school</p>
          </div>
          <button className="sp-add-btn" onClick={() => setIsFormOpen(true)}>
            <Plus size={15} />
            Add Subject
          </button>
        </div>

        {/* STAT CARDS */}
        <div className="sp-stats">
          <div className="sp-stat">
            <div className="sp-stat-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
            </div>
            <div className="sp-stat-label">Total Subjects</div>
            <div className="sp-stat-value">{stats.total}</div>
            <div className="sp-stat-sub">Across all grades</div>
          </div>
          <div className="sp-stat">
            <div className="sp-stat-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            </div>
            <div className="sp-stat-label">Total Credit Hours</div>
            <div className="sp-stat-value">{stats.totalCredits}</div>
            <div className="sp-stat-sub">Weekly curriculum load</div>
          </div>
          <div className="sp-stat">
            <div className="sp-stat-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
            </div>
            <div className="sp-stat-label">Avg Credit Hours</div>
            <div className="sp-stat-value">{stats.avgCredits}</div>
            <div className="sp-stat-sub">Per subject</div>
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

        <div className="sp-toolbar">
          <div className="sp-search-wrap">
            <Search size={14} className="sp-search-icon" />
            <input
              className="sp-search"
              placeholder="Search by name or code…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="sp-clear" onClick={() => setSearchTerm('')}><X size={13} /></button>
            )}
          </div>
        </div>

        {/* TABLE */}
        <div className="sp-card">
          <div className="sp-card-header">
            <span className="sp-card-title">Subject List</span>
            <span className="sp-card-count">{filteredSubjects.length} subject{filteredSubjects.length !== 1 ? 's' : ''}</span>
          </div>

          {filteredSubjects.length === 0 ? (
            <div className="sp-empty">
              <div className="sp-empty-icon"><Search size={18} color="#ccc" /></div>
              <p className="sp-empty-text">No subjects found</p>
              <p className="sp-empty-sub">Try adjusting your search</p>
            </div>
          ) : (
            <div className="sp-table-wrap">
              <table className="sp-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Code</th>
                    <th>Description</th>
                    <th>Credit Hours</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubjects.map((subject) => (
                    <tr key={subject.id}>
                      <td><span className="sp-subject-name">{subject.name}</span></td>
                      <td><span className="sp-code">{subject.code}</span></td>
                      <td><span className="sp-muted">{subject.description || '—'}</span></td>
                      <td><span className="sp-credit-tag">{subject.creditHours ?? '—'} hrs</span></td>
                      <td>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="sp-menu-btn">
                              <MoreHorizontal size={15} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditSubject(subject)}>
                              Edit Subject
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-700" onClick={() => handleDeleteSubject(subject.id)}>
                              <Trash2 size={13} className="mr-2" /> Delete
                            </DropdownMenuItem>
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



      <SubjectFormDialog
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={editingSubject
          ? async (data: Omit<Subject, 'id'>) => {
            setActionError(null);
            try {
              await updateSubject({ id: editingSubject.id, updates: data });
              setEditingSubject(null);
              setIsFormOpen(false);
            } catch (error: any) {
              console.error('Failed to update subject:', error);
              setActionError(error?.response?.data?.message || 'Could not update subject. Please try again.');
              throw error; // keep dialog open matching standard form behavior
            }
          }
          : handleAddSubject}
        initialData={editingSubject ?? undefined}
        isEditing={!!editingSubject}
      />
    </>
  );
}