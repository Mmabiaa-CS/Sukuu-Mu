'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useAttendance } from '@/lib/use-attendance';
import { canRecordAttendance, getTeacherClasses } from '@/lib/permissions';
import { useRouter } from 'next/navigation';
import { useStudents } from '@/lib/use-students';
import { useClasses } from '@/lib/use-classes';
import { Student } from '@/lib/types';
import { CheckCircle2, X, Clock, Users, CalendarCheck, AlertCircle, ChevronDown } from 'lucide-react';

export default function AttendancePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { recordBulkAttendance, fetchClassAttendance, isRecording } = useAttendance();
  const { classes, isLoading: classesLoading } = useClasses();
  const { students, isLoading: studentsLoading } = useStudents();
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [markingAll, setMarkingAll] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [router, user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-sm text-muted-foreground">
        Redirecting to login...
      </div>
    );
  }

  const accessibleClasses = useMemo(() => {
    if (user.role === 'admin' || user.role === 'manager') return classes;
    if (user.role === 'teacher') {
      const classIds = getTeacherClasses(user.id);
      return classes.filter((c) => classIds.includes(c.id));
    }
    return [];
  }, [user, classes]);

  const accessibleStudents = useMemo(() => {
    if (!selectedClass) return [];
    return students.filter((s) => s.class_id === parseInt(selectedClass));
  }, [selectedClass, students]);

  useEffect(() => {
    if (selectedClass) {
      fetchClassAttendance(selectedClass, new Date(selectedDate)).then(setTodayAttendance);
    }
  }, [selectedClass, selectedDate]);

  const stats = useMemo(() => {
    const present = todayAttendance.filter((a) => a.status === 'present').length;
    const absent = todayAttendance.filter((a) => a.status === 'absent').length;
    const late = todayAttendance.filter((a) => a.status === 'late').length;
    const total = accessibleStudents.length;
    const recorded = todayAttendance.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, absent, late, total, recorded, rate };
  }, [todayAttendance, accessibleStudents]);

  const handleRecordAttendance = async (studentId: number, status: 'present' | 'absent' | 'late') => {
    if (!selectedClass) return;
    setActionError(null);
    try {
      await recordBulkAttendance([{ studentId: studentId.toString(), classId: selectedClass, date: new Date(selectedDate), status }]);
      // Refresh
      fetchClassAttendance(selectedClass, new Date(selectedDate)).then(setTodayAttendance);
    } catch (error) {
      console.error('Failed to record attendance:', error);
      setActionError('Could not record attendance. Please try again.');
    }
  };

  const handleBulkMarkPresent = async () => {
    if (!selectedClass) return;
    setActionError(null);
    setMarkingAll(true);
    try {
      const records = accessibleStudents
        .filter((s) => !todayAttendance.find((a) => a.student_id === s.id))
        .map((s) => ({ studentId: s.id.toString(), classId: selectedClass, date: new Date(selectedDate), status: 'present' as const }));
      if (records.length > 0) {
        await recordBulkAttendance(records);
        fetchClassAttendance(selectedClass, new Date(selectedDate)).then(setTodayAttendance);
      }
    } catch (error) {
      console.error('Failed to mark attendance in bulk:', error);
      setActionError('Could not mark all students as present. Please try again.');
    } finally {
      setTimeout(() => setMarkingAll(false), 600);
    }
  };

  const canRecord = canRecordAttendance(user, selectedClass || undefined);
  const selectedClassName = classes.find((c) => c.id === parseInt(selectedClass || '0'))?.name ?? '';

  const initials = (s: Student) => `${s.first_name?.[0] ?? ''}${s.last_name?.[0] ?? ''}`.toUpperCase();

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .ap-root {
          font-family: 'DM Sans', sans-serif;
          color: #0a0a0a;
          background: #f9f9f8;
          min-height: 100vh;
          padding: 44px 48px;
          max-width: 1200px;
          margin: 0 auto;
          animation: ap-in 0.4s ease both;
        }
        @keyframes ap-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

        /* HEADER */
        .ap-header {
          display: flex; align-items: flex-end; justify-content: space-between;
          margin-bottom: 36px; padding-bottom: 28px; border-bottom: 1px solid #e8e8e6;
        }
        .ap-eyebrow { font-size: 10px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: #aaa; margin-bottom: 8px; }
        .ap-title { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 700; color: #0a0a0a; line-height: 1.1; margin-bottom: 6px; }
        .ap-sub { font-size: 13px; font-weight: 300; color: #aaa; }

        /* CONTROLS ROW */
        .ap-controls {
          display: grid; grid-template-columns: 1fr 1fr auto; gap: 12px;
          margin-bottom: 28px; align-items: end;
        }
        .ap-field-label { font-size: 10px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: #888; display: block; margin-bottom: 7px; }
        .ap-select-wrap { position: relative; }
        .ap-select-wrap svg { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #ccc; }
        .ap-select {
          width: 100%; padding: 11px 36px 11px 14px;
          font-family: 'DM Sans', sans-serif; font-size: 13px; color: #0a0a0a;
          background: #fff; border: 1px solid #e4e4e2; border-radius: 8px;
          outline: none; appearance: none; cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .ap-select:focus { border-color: #0a0a0a; box-shadow: 0 0 0 3px rgba(10,10,10,0.06); }
        .ap-date-input {
          width: 100%; padding: 11px 14px;
          font-family: 'DM Sans', sans-serif; font-size: 13px; color: #0a0a0a;
          background: #fff; border: 1px solid #e4e4e2; border-radius: 8px;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .ap-date-input:focus { border-color: #0a0a0a; box-shadow: 0 0 0 3px rgba(10,10,10,0.06); }

        .ap-bulk-btn {
          padding: 11px 20px; background: #0a0a0a; color: #fff; border: none; border-radius: 8px;
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 0.04em;
          cursor: pointer; white-space: nowrap;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
        }
        .ap-bulk-btn:hover { background: #1a1a1a; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.15); }
        .ap-bulk-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

        /* STAT CARDS */
        .ap-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; margin-bottom: 28px; animation: ap-in 0.4s 0.05s ease both; }
        .ap-stat { background: #fff; border: 1px solid #e8e8e6; border-radius: 10px; padding: 20px 22px; position: relative; overflow: hidden; transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s; }
        .ap-stat::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:#0a0a0a; transform:scaleX(0); transform-origin:left; transition:transform 0.3s ease; }
        .ap-stat:hover { border-color: #c8c8c6; transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,0.07); }
        .ap-stat:hover::before { transform: scaleX(1); }
        .ap-stat-icon { width: 30px; height: 30px; border-radius: 7px; background: #f4f4f3; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
        .ap-stat-label { font-size: 10px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: #bbb; margin-bottom: 5px; }
        .ap-stat-value { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; color: #0a0a0a; line-height: 1; margin-bottom: 3px; }
        .ap-stat-value.green { color: #2d7a4f; }
        .ap-stat-value.red { color: #b52b2b; }
        .ap-stat-value.amber { color: #a06b00; }
        .ap-stat-sub { font-size: 11px; font-weight: 300; color: #bbb; }

        /* RATE BAR */
        .ap-rate-bar { height: 4px; background: #f0f0ee; border-radius: 2px; overflow: hidden; margin-top: 10px; }
        .ap-rate-fill { height: 100%; border-radius: 2px; background: #2d7a4f; transition: width 0.5s ease; }

        /* CLASS HEADER */
        .ap-class-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 16px;
        }
        .ap-class-name {
          font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: #0a0a0a;
        }
        .ap-class-date { font-size: 12px; font-weight: 300; color: #aaa; margin-top: 2px; }
        .ap-progress-text { font-size: 12px; color: #aaa; font-weight: 300; }

        /* TABLE CARD */
        .ap-card { background: #fff; border: 1px solid #e8e8e6; border-radius: 10px; overflow: hidden; animation: ap-in 0.4s 0.1s ease both; }
        .ap-card-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 24px; border-bottom: 1px solid #f0f0ee; }
        .ap-card-title { font-size: 10px; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; color: #bbb; }
        .ap-card-meta { display: flex; align-items: center; gap: 14px; }
        .ap-card-count { font-size: 12px; color: #ccc; font-weight: 300; }

        /* LEGEND */
        .ap-legend { display: flex; align-items: center; gap: 12px; }
        .ap-legend-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #bbb; }
        .ap-legend-dot { width: 6px; height: 6px; border-radius: 50%; }
        .ap-legend-dot.green { background: #2d7a4f; }
        .ap-legend-dot.red { background: #b52b2b; }
        .ap-legend-dot.amber { background: #d4900a; }
        .ap-legend-dot.gray { background: #ccc; }

        /* TABLE */
        .ap-table-wrap { overflow-x: auto; }
        .ap-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .ap-table thead tr { border-bottom: 1px solid #f0f0ee; }
        .ap-table th { padding: 12px 20px; text-align: left; font-size: 9px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: #bbb; white-space: nowrap; }
        .ap-table tbody tr { border-bottom: 1px solid #f8f8f7; transition: background 0.12s; }
        .ap-table tbody tr:last-child { border-bottom: none; }
        .ap-table tbody tr:hover { background: #fafafa; }
        .ap-table td { padding: 13px 20px; color: #444; vertical-align: middle; }

        /* STUDENT CELL */
        .ap-student-cell { display: flex; align-items: center; gap: 11px; }
        .ap-avatar { width: 32px; height: 32px; border-radius: 50%; background: #f4f4f3; border: 1px solid #e8e8e6; font-size: 10px; font-weight: 600; color: #555; display: flex; align-items: center; justify-content: center; flex-shrink: 0; letter-spacing: 0.04em; }
        .ap-student-name { font-size: 13px; font-weight: 500; color: #0a0a0a; }
        .ap-student-class { font-size: 11px; font-weight: 300; color: #aaa; margin-top: 1px; }

        /* STATUS BADGE */
        .ap-status { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 400; }
        .ap-status-dot { width: 5px; height: 5px; border-radius: 50%; }
        .ap-status.present { background: #f0faf4; color: #2d7a4f; }
        .ap-status.present .ap-status-dot { background: #2d7a4f; }
        .ap-status.absent { background: #fef2f2; color: #b52b2b; }
        .ap-status.absent .ap-status-dot { background: #b52b2b; }
        .ap-status.late { background: #fef9ec; color: #a06b00; }
        .ap-status.late .ap-status-dot { background: #d4900a; }
        .ap-status.unrecorded { background: #f4f4f3; color: #aaa; }
        .ap-status.unrecorded .ap-status-dot { background: #ccc; }

        /* ACTION BUTTONS */
        .ap-action-group { display: flex; gap: 6px; align-items: center; }
        .ap-action-btn {
          padding: 5px 12px; border-radius: 6px; font-family: 'DM Sans', sans-serif;
          font-size: 11px; font-weight: 400; cursor: pointer;
          border: 1px solid #e4e4e2; background: #fff; color: #555;
          transition: all 0.15s;
        }
        .ap-action-btn:hover { border-color: #c0c0be; color: #0a0a0a; }
        .ap-action-btn.active-present { background: #f0faf4; border-color: #2d7a4f; color: #2d7a4f; font-weight: 500; }
        .ap-action-btn.active-absent { background: #fef2f2; border-color: #b52b2b; color: #b52b2b; font-weight: 500; }
        .ap-action-btn.active-late { background: #fef9ec; border-color: #d4900a; color: #a06b00; font-weight: 500; }

        /* EMPTY / PLACEHOLDER STATES */
        .ap-empty { text-align: center; padding: 70px 24px; }
        .ap-empty-icon { width: 52px; height: 52px; border-radius: 50%; background: #f4f4f3; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
        .ap-empty-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: #0a0a0a; margin-bottom: 6px; }
        .ap-empty-sub { font-size: 13px; font-weight: 300; color: #bbb; }

        /* PLACEHOLDER STATS */
        .ap-stat-placeholder .ap-stat-value { color: #ddd; }
        .ap-stat-placeholder .ap-stat-sub { color: #e8e8e6; }

        @media (max-width: 768px) {
          .ap-root { padding: 24px 18px; }
          .ap-header { flex-direction: column; align-items: flex-start; gap: 16px; }
          .ap-controls { grid-template-columns: 1fr; }
          .ap-legend { display: none; }
        }
      `}</style>

      <div className="ap-root">

        {/* HEADER */}
        <div className="ap-header">
          <div>
            <div className="ap-eyebrow">Daily Records</div>
            <h1 className="ap-title">Attendance</h1>
            <p className="ap-sub">Track and record student attendance by class and date</p>
          </div>
        </div>

        {/* CONTROLS */}
        {actionError && (
          <div
            role="alert"
            style={{
              marginBottom: '16px',
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

        <div className="ap-controls">
          <div>
            <label className="ap-field-label">Class</label>
            <div className="ap-select-wrap">
              <select
                className="ap-select"
                value={selectedClass || ''}
                onChange={(e) => setSelectedClass(e.target.value || null)}
              >
                <option value="">Select a class…</option>
                {accessibleClasses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown size={13} />
            </div>
          </div>

          <div>
            <label className="ap-field-label">Date</label>
            <input
              type="date"
              className="ap-date-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {canRecord && selectedClass && (
            <div style={{ paddingBottom: 0 }}>
              <label className="ap-field-label" style={{ opacity: 0 }}>Action</label>
              <button
                className="ap-bulk-btn"
                onClick={handleBulkMarkPresent}
                disabled={markingAll || stats.recorded === stats.total}
              >
                {markingAll ? 'Marking…' : 'Mark All Present'}
              </button>
            </div>
          )}
        </div>

        {/* STAT CARDS */}
        <div className="ap-stats">
          <div className={`ap-stat ${!selectedClass ? 'ap-stat-placeholder' : ''}`}>
            <div className="ap-stat-icon">
              <Users size={14} color="#0a0a0a" />
            </div>
            <div className="ap-stat-label">Total Students</div>
            <div className="ap-stat-value">{selectedClass ? stats.total : '—'}</div>
            <div className="ap-stat-sub">In selected class</div>
          </div>
          <div className={`ap-stat ${!selectedClass ? 'ap-stat-placeholder' : ''}`}>
            <div className="ap-stat-icon">
              <CheckCircle2 size={14} color="#2d7a4f" />
            </div>
            <div className="ap-stat-label">Present</div>
            <div className={`ap-stat-value ${selectedClass ? 'green' : ''}`}>
              {selectedClass ? stats.present : '—'}
            </div>
            <div className="ap-stat-sub">Recorded today</div>
          </div>
          <div className={`ap-stat ${!selectedClass ? 'ap-stat-placeholder' : ''}`}>
            <div className="ap-stat-icon">
              <X size={14} color="#b52b2b" />
            </div>
            <div className="ap-stat-label">Absent</div>
            <div className={`ap-stat-value ${selectedClass ? 'red' : ''}`}>
              {selectedClass ? stats.absent : '—'}
            </div>
            <div className="ap-stat-sub">Recorded today</div>
          </div>
          <div className={`ap-stat ${!selectedClass ? 'ap-stat-placeholder' : ''}`}>
            <div className="ap-stat-icon">
              <Clock size={14} color="#d4900a" />
            </div>
            <div className="ap-stat-label">Late</div>
            <div className={`ap-stat-value ${selectedClass ? 'amber' : ''}`}>
              {selectedClass ? stats.late : '—'}
            </div>
            <div className="ap-stat-sub">Recorded today</div>
          </div>
          <div className={`ap-stat ${!selectedClass ? 'ap-stat-placeholder' : ''}`}>
            <div className="ap-stat-icon">
              <CalendarCheck size={14} color="#0a0a0a" />
            </div>
            <div className="ap-stat-label">Attendance Rate</div>
            <div className="ap-stat-value">{selectedClass ? `${stats.rate}%` : '—'}</div>
            <div className="ap-stat-sub">Present / total</div>
            {selectedClass && (
              <div className="ap-rate-bar">
                <div className="ap-rate-fill" style={{ width: `${stats.rate}%` }} />
              </div>
            )}
          </div>
        </div>

        {/* TABLE CARD */}
        <div className="ap-card">
          <div className="ap-card-header">
            <span className="ap-card-title">
              {selectedClass ? `${selectedClassName} · ${formatDate(selectedDate)}` : 'Student List'}
            </span>
            <div className="ap-card-meta">
              <div className="ap-legend">
                <span className="ap-legend-item"><span className="ap-legend-dot green" />Present</span>
                <span className="ap-legend-item"><span className="ap-legend-dot red" />Absent</span>
                <span className="ap-legend-item"><span className="ap-legend-dot amber" />Late</span>
                <span className="ap-legend-item"><span className="ap-legend-dot gray" />Unrecorded</span>
              </div>
              <span className="ap-card-count">
                {selectedClass
                  ? `${stats.recorded} of ${stats.total} recorded`
                  : 'No class selected'}
              </span>
            </div>
          </div>

          {!selectedClass ? (
            <div className="ap-empty">
              <div className="ap-empty-icon">
                <CalendarCheck size={22} color="#ccc" />
              </div>
              <p className="ap-empty-title">Select a class to begin</p>
              <p className="ap-empty-sub">Choose a class and date above to view and record attendance</p>
            </div>
          ) : accessibleStudents.length === 0 ? (
            <div className="ap-empty">
              <div className="ap-empty-icon">
                <Users size={22} color="#ccc" />
              </div>
              <p className="ap-empty-title">No students in this class</p>
              <p className="ap-empty-sub">This class has no enrolled students yet</p>
            </div>
          ) : (
            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Status</th>
                    {canRecord && <th>Record</th>}
                  </tr>
                </thead>
                <tbody>
                  {accessibleStudents.map((student) => {
                    const record = todayAttendance.find((a) => a.student_id === student.id);
                    const status = record?.status;

                    return (
                      <tr key={student.id}>
                        <td>
                          <div className="ap-student-cell">
                            <div className="ap-avatar">{initials(student)}</div>
                            <div>
                              <div className="ap-student-name">{student.first_name} {student.last_name}</div>
                              <div className="ap-student-class">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {status ? (
                            <span className={`ap-status ${status}`}>
                              <span className="ap-status-dot" />
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                          ) : (
                            <span className="ap-status unrecorded">
                              <span className="ap-status-dot" />
                              Not recorded
                            </span>
                          )}
                        </td>
                        {canRecord && (
                          <td>
                            <div className="ap-action-group">
                              <button
                                className={`ap-action-btn ${status === 'present' ? 'active-present' : ''}`}
                                onClick={() => handleRecordAttendance(student.id, 'present')}
                              >
                                Present
                              </button>
                              <button
                                className={`ap-action-btn ${status === 'absent' ? 'active-absent' : ''}`}
                                onClick={() => handleRecordAttendance(student.id, 'absent')}
                              >
                                Absent
                              </button>
                              <button
                                className={`ap-action-btn ${status === 'late' ? 'active-late' : ''}`}
                                onClick={() => handleRecordAttendance(student.id, 'late')}
                              >
                                Late
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}