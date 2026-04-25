'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useFinances } from '@/lib/use-finances';
import { canManageFinances } from '@/lib/permissions';
import { mockStudents } from '@/lib/mock-data';
import { AlertCircle, DollarSign, CheckCircle, Clock, Users, Search, X } from 'lucide-react';

export default function FinancesPage() {
  const { user } = useAuth();
  const { fees, addPayment } = useFinances();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentDialogFeeId, setPaymentDialogFeeId] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'cash' as const,
    notes: '',
  });

  if (!canManageFinances(user)) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500&display=swap');
          .fp-denied {
            font-family: 'DM Sans', sans-serif;
            display: flex; align-items: center; justify-content: center;
            min-height: 100vh; background: #f9f9f8;
          }
          .fp-denied-inner { text-align: center; }
          .fp-denied-icon {
            width: 56px; height: 56px; border-radius: 50%; background: #fef2f2;
            display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;
          }
          .fp-denied h2 { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: #0a0a0a; margin-bottom: 8px; }
          .fp-denied p { font-size: 13px; font-weight: 300; color: #aaa; }
        `}</style>
        <div className="fp-denied">
          <div className="fp-denied-inner">
            <div className="fp-denied-icon"><AlertCircle size={24} color="#b52b2b" /></div>
            <h2>Access Denied</h2>
            <p>You don&apos;t have permission to access finances.</p>
          </div>
        </div>
      </>
    );
  }

  const totalFeesAmount = fees.reduce((sum, f) => sum + f.amount, 0);
  const totalPaidAmount = fees
    .filter((f) => f.status === 'paid')
    .reduce((sum, f) => sum + f.amount, 0);
  const pendingAmount = totalFeesAmount - totalPaidAmount;
  const uniqueStudents = new Set(fees.map((f) => f.studentId)).size;

  const filteredFees = useMemo(() => {
    return fees.filter((fee) => {
      const student = mockStudents.find((s) => s.id === fee.studentId);
      const name = student ? `${student.firstName} ${student.lastName}` : '';
      const matchSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchFilter = statusFilter === 'all' || fee.status === statusFilter;
      return matchSearch && matchFilter;
    });
  }, [fees, searchTerm, statusFilter]);

  const statusCounts = useMemo(() => ({
    all: fees.length,
    paid: fees.filter((f) => f.status === 'paid').length,
    partial: fees.filter((f) => f.status === 'partial').length,
    pending: fees.filter((f) => f.status === 'pending').length,
  }), [fees]);

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentDialogFeeId || !paymentForm.amount) return;
    const fee = fees.find((f) => f.id === paymentDialogFeeId);
    if (!fee) return;
    addPayment({
      feeId: paymentDialogFeeId,
      studentId: fee.studentId,
      amount: parseFloat(paymentForm.amount),
      paymentDate: new Date(),
      paymentMethod: paymentForm.paymentMethod,
      receiptNumber: `RCP-${Date.now()}`,
      notes: paymentForm.notes,
    });
    setPaymentForm({ amount: '', paymentMethod: 'cash', notes: '' });
    setPaymentDialogFeeId(null);
  };

  const initials = (name: string) => {
    const parts = name.split(' ');
    return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .fp-root {
          font-family: 'DM Sans', sans-serif;
          color: #0a0a0a;
          background: #f9f9f8;
          min-height: 100vh;
          padding: 44px 48px;
          max-width: 1200px;
          margin: 0 auto;
          animation: fp-in 0.4s ease both;
        }
        @keyframes fp-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

        .fp-header {
          display: flex; align-items: flex-end; justify-content: space-between;
          margin-bottom: 36px; padding-bottom: 28px; border-bottom: 1px solid #e8e8e6;
        }
        .fp-eyebrow { font-size: 10px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: #aaa; margin-bottom: 8px; }
        .fp-title { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 700; color: #0a0a0a; line-height: 1.1; margin-bottom: 6px; }
        .fp-sub { font-size: 13px; font-weight: 300; color: #aaa; }

        /* STAT CARDS */
        .fp-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 28px; animation: fp-in 0.4s 0.05s ease both; }
        .fp-stat {
          background: #fff; border: 1px solid #e8e8e6; border-radius: 10px;
          padding: 22px 24px; position: relative; overflow: hidden;
          transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
        }
        .fp-stat::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background:#0a0a0a; transform:scaleX(0); transform-origin:left; transition:transform 0.3s ease;
        }
        .fp-stat:hover { border-color:#c8c8c6; transform:translateY(-2px); box-shadow:0 4px 20px rgba(0,0,0,0.07); }
        .fp-stat:hover::before { transform:scaleX(1); }
        .fp-stat-icon { width:32px; height:32px; border-radius:7px; background:#f4f4f3; display:flex; align-items:center; justify-content:center; margin-bottom:14px; }
        .fp-stat-label { font-size:10px; font-weight:500; letter-spacing:0.14em; text-transform:uppercase; color:#bbb; margin-bottom:6px; }
        .fp-stat-value { font-family:'Playfair Display',serif; font-size:28px; font-weight:700; color:#0a0a0a; line-height:1; margin-bottom:4px; }
        .fp-stat-sub { font-size:11px; font-weight:300; color:#bbb; }

        /* TOOLBAR */
        .fp-toolbar { display:flex; align-items:center; gap:12px; margin-bottom:20px; flex-wrap:wrap; }
        .fp-search-wrap { flex:1; min-width:220px; position:relative; }
        .fp-search-icon { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:#ccc; pointer-events:none; }
        .fp-search {
          width:100%; padding:11px 14px 11px 40px; font-family:'DM Sans',sans-serif;
          font-size:13px; color:#0a0a0a; background:#fff;
          border:1px solid #e4e4e2; border-radius:8px; outline:none;
          transition:border-color 0.2s, box-shadow 0.2s;
        }
        .fp-search::placeholder { color:#ccc; }
        .fp-search:focus { border-color:#0a0a0a; box-shadow:0 0 0 3px rgba(10,10,10,0.06); }
        .fp-clear { position:absolute; right:12px; top:50%; transform:translateY(-50%); color:#ccc; cursor:pointer; background:none; border:none; padding:0; display:flex; align-items:center; }
        .fp-clear:hover { color:#888; }

        .fp-filters { display:flex; gap:6px; flex-wrap:wrap; }
        .fp-filter-pill {
          display:flex; align-items:center; gap:5px; padding:8px 14px; border-radius:20px;
          font-size:12px; font-weight:400; border:1px solid #e4e4e2; background:#fff;
          color:#888; cursor:pointer; transition:all 0.15s; white-space:nowrap;
        }
        .fp-filter-pill:hover { border-color:#c0c0be; color:#444; }
        .fp-filter-pill.active { background:#0a0a0a; border-color:#0a0a0a; color:#fff; font-weight:500; }
        .fp-filter-count { font-size:10px; opacity:0.6; }

        /* TABLE */
        .fp-card { background:#fff; border:1px solid #e8e8e6; border-radius:10px; overflow:hidden; animation:fp-in 0.4s 0.1s ease both; }
        .fp-card-header { display:flex; align-items:center; justify-content:space-between; padding:18px 24px; border-bottom:1px solid #f0f0ee; }
        .fp-card-title { font-size:10px; font-weight:500; letter-spacing:0.16em; text-transform:uppercase; color:#bbb; }
        .fp-card-count { font-size:12px; color:#ccc; font-weight:300; }

        .fp-table-wrap { overflow-x:auto; }
        .fp-table { width:100%; border-collapse:collapse; font-size:13px; }
        .fp-table thead tr { border-bottom:1px solid #f0f0ee; }
        .fp-table th { padding:12px 20px; text-align:left; font-size:9px; font-weight:500; letter-spacing:0.14em; text-transform:uppercase; color:#bbb; white-space:nowrap; }
        .fp-table tbody tr { border-bottom:1px solid #f8f8f7; transition:background 0.12s; }
        .fp-table tbody tr:last-child { border-bottom:none; }
        .fp-table tbody tr:hover { background:#fafafa; }
        .fp-table td { padding:14px 20px; color:#444; vertical-align:middle; }

        .fp-student-cell { display:flex; align-items:center; gap:12px; }
        .fp-avatar { width:34px; height:34px; border-radius:50%; background:#f4f4f3; border:1px solid #e8e8e6; font-size:11px; font-weight:600; color:#555; display:flex; align-items:center; justify-content:center; flex-shrink:0; letter-spacing:0.04em; }
        .fp-student-name { font-size:13px; font-weight:500; color:#0a0a0a; }
        .fp-student-id { font-size:11px; font-weight:300; color:#aaa; margin-top:1px; }

        .fp-amount { font-weight:500; color:#0a0a0a; }
        .fp-muted { color:#aaa; font-weight:300; }

        .fp-status { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:400; }
        .fp-status-dot { width:5px; height:5px; border-radius:50%; }
        .fp-status.paid { background:#f0faf4; color:#2d7a4f; }
        .fp-status.paid .fp-status-dot { background:#2d7a4f; }
        .fp-status.partial { background:#fef9ec; color:#a06b00; }
        .fp-status.partial .fp-status-dot { background:#d4900a; }
        .fp-status.pending { background:#fef2f2; color:#b52b2b; }
        .fp-status.pending .fp-status-dot { background:#b52b2b; }

        .fp-record-btn {
          padding:6px 12px; background:#fff; border:1px solid #e4e4e2; border-radius:6px;
          font-family:'DM Sans',sans-serif; font-size:11px; font-weight:400; color:#555;
          cursor:pointer; transition:background 0.12s, border-color 0.12s, color 0.12s;
        }
        .fp-record-btn:hover { background:#0a0a0a; color:#fff; border-color:#0a0a0a; }
        .fp-record-btn:disabled { opacity:0.4; cursor:not-allowed; }

        /* PAYMENT DIALOG */
        .fp-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.35); z-index:50; display:flex; align-items:center; justify-content:center; animation:fp-overlay-in 0.2s ease; }
        @keyframes fp-overlay-in { from{opacity:0} to{opacity:1} }
        .fp-dialog { background:#fff; border-radius:12px; padding:32px; width:420px; max-width:90vw; animation:fp-dialog-in 0.25s ease; }
        @keyframes fp-dialog-in { from{opacity:0;transform:translateY(16px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        .fp-dialog-title { font-family:'Playfair Display',serif; font-size:22px; font-weight:700; color:#0a0a0a; margin-bottom:4px; }
        .fp-dialog-sub { font-size:12px; font-weight:300; color:#aaa; margin-bottom:24px; }
        .fp-dialog-info { background:#f9f9f8; border:1px solid #e8e8e6; border-radius:8px; padding:14px 16px; margin-bottom:22px; }
        .fp-dialog-info-label { font-size:11px; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#bbb; margin-bottom:4px; }
        .fp-dialog-info-amount { font-family:'Playfair Display',serif; font-size:24px; font-weight:700; color:#0a0a0a; }
        .fp-dialog-info-due { font-size:11px; font-weight:300; color:#aaa; margin-top:2px; }
        .fp-field { margin-bottom:16px; }
        .fp-field-label { font-size:11px; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#888; margin-bottom:7px; display:block; }
        .fp-field-input {
          width:100%; padding:10px 14px; font-family:'DM Sans',sans-serif; font-size:13px;
          color:#0a0a0a; background:#fff; border:1px solid #e4e4e2; border-radius:8px; outline:none;
          transition:border-color 0.2s, box-shadow 0.2s;
        }
        .fp-field-input:focus { border-color:#0a0a0a; box-shadow:0 0 0 3px rgba(10,10,10,0.06); }
        .fp-dialog-actions { display:flex; gap:10px; justify-content:flex-end; margin-top:24px; }
        .fp-btn-cancel { padding:10px 20px; background:#fff; border:1px solid #e4e4e2; border-radius:8px; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:400; color:#555; cursor:pointer; transition:background 0.15s; }
        .fp-btn-cancel:hover { background:#f7f7f6; }
        .fp-btn-submit { padding:10px 22px; background:#0a0a0a; border:none; border-radius:8px; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500; color:#fff; cursor:pointer; transition:background 0.15s, transform 0.15s; }
        .fp-btn-submit:hover { background:#1a1a1a; transform:translateY(-1px); }

        .fp-empty { text-align:center; padding:60px 24px; }
        .fp-empty-text { font-size:14px; color:#bbb; }
        .fp-empty-sub { font-size:12px; color:#ddd; margin-top:4px; font-weight:300; }

        @media (max-width:700px) { .fp-root { padding:24px 18px; } .fp-header { flex-direction:column; align-items:flex-start; gap:16px; } }
      `}</style>

      <div className="fp-root">

        <div className="fp-header">
          <div>
            <div className="fp-eyebrow">Accounting</div>
            <h1 className="fp-title">Finances</h1>
            <p className="fp-sub">Track student fees, payments, and outstanding balances</p>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="fp-stats">
          <div className="fp-stat">
            <div className="fp-stat-icon"><DollarSign size={15} color="#0a0a0a" /></div>
            <div className="fp-stat-label">Total Fees</div>
            <div className="fp-stat-value">${totalFeesAmount.toLocaleString()}</div>
            <div className="fp-stat-sub">All student fees</div>
          </div>
          <div className="fp-stat">
            <div className="fp-stat-icon"><CheckCircle size={15} color="#2d7a4f" /></div>
            <div className="fp-stat-label">Collected</div>
            <div className="fp-stat-value">${totalPaidAmount.toLocaleString()}</div>
            <div className="fp-stat-sub">Payments received</div>
          </div>
          <div className="fp-stat">
            <div className="fp-stat-icon"><Clock size={15} color="#d4900a" /></div>
            <div className="fp-stat-label">Outstanding</div>
            <div className="fp-stat-value">${pendingAmount.toLocaleString()}</div>
            <div className="fp-stat-sub">Awaiting payment</div>
          </div>
          <div className="fp-stat">
            <div className="fp-stat-icon"><Users size={15} color="#0a0a0a" /></div>
            <div className="fp-stat-label">Students</div>
            <div className="fp-stat-value">{uniqueStudents}</div>
            <div className="fp-stat-sub">With fee records</div>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="fp-toolbar">
          <div className="fp-search-wrap">
            <Search size={14} className="fp-search-icon" />
            <input
              className="fp-search"
              placeholder="Search by student name or fee ID…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="fp-clear" onClick={() => setSearchTerm('')}><X size={13} /></button>
            )}
          </div>

          <div className="fp-filters">
            {(['all', 'paid', 'partial', 'pending'] as const).map((f) => (
              <button
                key={f}
                className={`fp-filter-pill ${statusFilter === f ? 'active' : ''}`}
                onClick={() => setStatusFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <span className="fp-filter-count">{statusCounts[f]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* TABLE */}
        <div className="fp-card">
          <div className="fp-card-header">
            <span className="fp-card-title">Fee Records</span>
            <span className="fp-card-count">{filteredFees.length} record{filteredFees.length !== 1 ? 's' : ''}</span>
          </div>

          {filteredFees.length === 0 ? (
            <div className="fp-empty">
              <p className="fp-empty-text">No records found</p>
              <p className="fp-empty-sub">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="fp-table-wrap">
              <table className="fp-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFees.map((fee) => {
                    const student = mockStudents.find((s) => s.id === fee.studentId);
                    const name = student ? `${student.firstName} ${student.lastName}` : 'Unknown';
                    return (
                      <tr key={fee.id}>
                        <td>
                          <div className="fp-student-cell">
                            <div className="fp-avatar">{initials(name)}</div>
                            <div>
                              <div className="fp-student-name">{name}</div>
                              <div className="fp-student-id">{fee.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="fp-muted">{fee.description}</td>
                        <td className="fp-amount">${fee.amount.toLocaleString()}</td>
                        <td className="fp-muted">{fee.dueDate.toLocaleDateString()}</td>
                        <td>
                          <span className={`fp-status ${fee.status}`}>
                            <span className="fp-status-dot" />
                            {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          <button
                            className="fp-record-btn"
                            disabled={fee.status === 'paid'}
                            onClick={() => setPaymentDialogFeeId(fee.id)}
                          >
                            Record Payment
                          </button>
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

      {/* PAYMENT DIALOG */}
      {paymentDialogFeeId && (() => {
        const fee = fees.find((f) => f.id === paymentDialogFeeId);
        if (!fee) return null;
        return (
          <div className="fp-overlay" onClick={() => setPaymentDialogFeeId(null)}>
            <div className="fp-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="fp-dialog-title">Record Payment</div>
              <div className="fp-dialog-sub">Enter payment details below</div>
              <div className="fp-dialog-info">
                <div className="fp-dialog-info-label">Fee Amount</div>
                <div className="fp-dialog-info-amount">${fee.amount.toLocaleString()}</div>
                <div className="fp-dialog-info-due">Due {fee.dueDate.toLocaleDateString()}</div>
              </div>
              <form onSubmit={handlePaymentSubmit}>
                <div className="fp-field">
                  <label className="fp-field-label">Payment Amount</label>
                  <input
                    type="number" min="0" max={fee.amount} step="0.01"
                    className="fp-field-input"
                    placeholder="Enter amount"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="fp-field">
                  <label className="fp-field-label">Payment Method</label>
                  <select
                    className="fp-field-input"
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as any })}
                  >
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                    <option value="transfer">Bank Transfer</option>
                    <option value="online">Online</option>
                  </select>
                </div>
                <div className="fp-field">
                  <label className="fp-field-label">Notes (Optional)</label>
                  <input
                    type="text" className="fp-field-input" placeholder="Payment notes"
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  />
                </div>
                <div className="fp-dialog-actions">
                  <button type="button" className="fp-btn-cancel" onClick={() => setPaymentDialogFeeId(null)}>Cancel</button>
                  <button type="submit" className="fp-btn-submit">Record Payment</button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </>
  );
}