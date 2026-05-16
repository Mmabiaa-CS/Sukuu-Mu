'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useFinances } from '@/lib/use-finances';
import { canManageFinances } from '@/lib/permissions';
import { AlertCircle, DollarSign, CheckCircle, Clock, Users, Search, X, Plus } from 'lucide-react';
import { PaymentRecordDialog } from '@/components/payment-record-dialog';
import { getApiErrorMessage } from '@/lib/api-errors';

export default function FinancesPage() {
  const { user } = useAuth();
  const { fees, recordPayment, isLoading } = useFinances();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentDialogFee, setPaymentDialogFee] = useState<any | null>(null);
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'cash' as const,
    notes: '',
  });

  if (!canManageFinances(user)) {
    return (
      <div className="fp-denied">
        <div className="fp-denied-inner">
          <div className="fp-denied-icon"><AlertCircle size={24} color="#b52b2b" /></div>
          <h2>Access Denied</h2>
          <p>You don&apos;t have permission to access finances.</p>
        </div>
      </div>
    );
  }

  const totalFeesAmount = fees.reduce((sum, f) => sum + Number(f.total_fee), 0);
  const totalPaidAmount = fees.reduce((sum, f) => sum + Number(f.total_paid), 0);
  const pendingAmount = totalFeesAmount - totalPaidAmount;
  const uniqueStudents = new Set(fees.map((f) => f.student_id)).size;

  const filteredFees = useMemo(() => {
    return fees.filter((fee) => {
      const name = `${fee.student_first_name} ${fee.student_last_name}`;
      const status = fee.is_cleared ? 'paid' : (Number(fee.total_paid) > 0 ? 'partial' : 'pending');
      const matchSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(fee.student_code || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchFilter = statusFilter === 'all' || status === statusFilter;
      return matchSearch && matchFilter;
    });
  }, [fees, searchTerm, statusFilter]);

  const statusCounts = useMemo(() => ({
    all: fees.length,
    paid: fees.filter((f) => f.is_cleared).length,
    partial: fees.filter((f) => !f.is_cleared && Number(f.total_paid) > 0).length,
    pending: fees.filter((f) => !f.is_cleared && Number(f.total_paid) <= 0).length,
  }), [fees]);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentDialogFee || !paymentForm.amount) return;

    try {
      await recordPayment({
        student_id: paymentDialogFee.student_id,
        fee_structure_id: paymentDialogFee.fee_structure_id,
        amount_paid: parseFloat(paymentForm.amount),
        payment_method: paymentForm.paymentMethod,
        notes: paymentForm.notes,
      });
      setPaymentForm({ amount: '', paymentMethod: 'cash', notes: '' });
      setPaymentDialogFee(null);
    } catch (error) {
      console.error('Payment failed:', error);
      alert(getApiErrorMessage(error, 'Failed to record payment'));
    }
  };

  const initials = (name: string) => {
    const parts = name.split(' ');
    return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase();
  };

  if (isLoading) {
    return <div className="fp-root"><div className="fp-sub">Loading financial records...</div></div>;
  }

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

        .fp-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 28px; }
        .fp-stat {
          background: #fff; border: 1px solid #e8e8e6; border-radius: 10px;
          padding: 22px 24px; position: relative; overflow: hidden;
          transition: all 0.2s;
        }
        .fp-stat:hover { border-color:#c8c8c6; transform:translateY(-2px); box-shadow:0 4px 20px rgba(0,0,0,0.07); }
        .fp-stat-icon { width:32px; height:32px; border-radius:7px; background:#f4f4f3; display:flex; align-items:center; justify-content:center; margin-bottom:14px; }
        .fp-stat-label { font-size:10px; font-weight:500; letter-spacing:0.14em; text-transform:uppercase; color:#bbb; margin-bottom:6px; }
        .fp-stat-value { font-family:'Playfair Display',serif; font-size:28px; font-weight:700; color:#0a0a0a; line-height:1; }
        .fp-stat-sub { font-size:11px; font-weight:300; color:#bbb; margin-top:4px; }

        .fp-toolbar { display:flex; align-items:center; gap:12px; margin-bottom:20px; flex-wrap:wrap; }
        .fp-search-wrap { flex:1; min-width:220px; position:relative; }
        .fp-search-icon { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:#ccc; }
        .fp-search {
          width:100%; padding:11px 14px 11px 40px; font-family:'DM Sans',sans-serif;
          font-size:13px; color:#0a0a0a; background:#fff;
          border:1px solid #e4e4e2; border-radius:8px; outline:none;
        }

        .fp-filter-pill {
          padding:8px 14px; border-radius:20px; font-size:12px; border:1px solid #e4e4e2; background:#fff;
          color:#888; cursor:pointer; transition:all 0.15s;
        }
        .fp-filter-pill.active { background:#0a0a0a; border-color:#0a0a0a; color:#fff; }
        .fp-filter-count { font-size:10px; opacity:0.6; margin-left:4px; }

        .fp-card { background:#fff; border:1px solid #e8e8e6; border-radius:10px; overflow:hidden; }
        .fp-table { width:100%; border-collapse:collapse; font-size:13px; }
        .fp-table th { padding:14px 20px; text-align:left; font-size:9px; font-weight:500; letter-spacing:0.14em; text-transform:uppercase; color:#bbb; border-bottom:1px solid #f0f0ee; }
        .fp-table td { padding:16px 20px; border-bottom:1px solid #f8f8f7; }
        
        .fp-student-cell { display:flex; align-items:center; gap:12px; }
        .fp-avatar { width:34px; height:34px; border-radius:50%; background:#f4f4f3; border:1px solid #e8e8e6; font-size:11px; font-weight:600; color:#555; display:flex; align-items:center; justify-content:center; }
        .fp-student-name { font-weight:500; color:#0a0a0a; }
        .fp-student-id { font-size:11px; color:#aaa; }

        .fp-status { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:20px; font-size:11px; }
        .fp-status.paid { background:#f0faf4; color:#2d7a4f; }
        .fp-status.partial { background:#fef9ec; color:#a06b00; }
        .fp-status.pending { background:#fef2f2; color:#b52b2b; }
        .fp-status-dot { width:5px; height:5px; border-radius:50%; background:currentColor; }

        .fp-record-btn {
          padding:6px 12px; background:#fff; border:1px solid #e4e4e2; border-radius:6px;
          font-size:11px; cursor:pointer;
        }
        .fp-record-btn:hover:not(:disabled) { background:#0a0a0a; color:#fff; }
        .fp-record-btn:disabled { opacity:0.3; cursor:not-allowed; }

        .fp-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:100; display:flex; align-items:center; justify-content:center; padding:20px; }
        .fp-dialog { background:#fff; border-radius:12px; padding:32px; width:400px; max-width:100%; box-shadow: 0 20px 50px rgba(0,0,0,0.1); }
        .fp-field { margin-bottom:16px; }
        .fp-field label { display:block; font-size:11px; font-weight:500; text-transform:uppercase; color:#888; margin-bottom:6px; }
        .fp-field input, .fp-field select { width:100%; padding:10px; border:1px solid #e4e4e2; border-radius:8px; font-size:13px; outline:none; }
        .fp-btn-submit { width:100%; padding:12px; background:#0a0a0a; color:#fff; border:none; border-radius:8px; font-weight:500; cursor:pointer; margin-top:20px; }
        
        .fp-denied { display:flex; align-items:center; justify-content:center; min-height:100vh; background:#f9f9f8; text-align:center; }
      `}</style>

      <div className="fp-root">
        <div className="fp-header">
          <div>
            <div className="fp-eyebrow">Accounting</div>
            <h1 className="fp-title">Finances</h1>
            <p className="fp-sub">Track student fees, payments, and outstanding balances</p>
          </div>
          <button
            type="button"
            className="fp-add-btn"
            onClick={() => setShowRecordPayment(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 22px',
              background: '#0a0a0a',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <Plus size={15} /> Record payment
          </button>
        </div>

        <div className="fp-stats">
          <div className="fp-stat">
            <div className="fp-stat-icon"><DollarSign size={15} color="#0a0a0a" /></div>
            <div className="fp-stat-label">Total Billed</div>
            <div className="fp-stat-value">${totalFeesAmount.toLocaleString()}</div>
            <div className="fp-stat-sub">Across all terms</div>
          </div>
          <div className="fp-stat">
            <div className="fp-stat-icon"><CheckCircle size={15} color="#2d7a4f" /></div>
            <div className="fp-stat-label">Collected</div>
            <div className="fp-stat-value">${totalPaidAmount.toLocaleString()}</div>
            <div className="fp-stat-sub">Payments received</div>
          </div>
          <div className="fp-stat">
            <div className="fp-stat-icon"><Clock size={15} color="#d4900a" /></div>
            <div className="fp-stat-label">Balance Due</div>
            <div className="fp-stat-value">${pendingAmount.toLocaleString()}</div>
            <div className="fp-stat-sub">Remaining outstanding</div>
          </div>
          <div className="fp-stat">
            <div className="fp-stat-icon"><Users size={15} color="#0a0a0a" /></div>
            <div className="fp-stat-label">Billed Students</div>
            <div className="fp-stat-value">{uniqueStudents}</div>
            <div className="fp-stat-sub">Active records</div>
          </div>
        </div>

        <div className="fp-toolbar">
          <div className="fp-search-wrap">
            <Search size={14} className="fp-search-icon" />
            <input
              className="fp-search"
              placeholder="Search student or ID…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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

        <div className="fp-card">
          <table className="fp-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Fee Structure</th>
                <th>Billed</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredFees.map((fee) => {
                const name = `${fee.student_first_name} ${fee.student_last_name}`;
                const status = fee.is_cleared ? 'paid' : (Number(fee.total_paid) > 0 ? 'partial' : 'pending');
                return (
                  <tr key={fee.id}>
                    <td>
                      <div className="fp-student-cell">
                        <div className="fp-avatar">{initials(name)}</div>
                        <div>
                          <div className="fp-student-name">{name}</div>
                          <div className="fp-student-id">{fee.class_name}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="fp-student-name">{fee.fee_structure_name}</div>
                      <div className="fp-student-id">{fee.term} {fee.academic_year}</div>
                    </td>
                    <td className="fp-student-name">${Number(fee.total_fee).toLocaleString()}</td>
                    <td className="fp-student-name" style={{ color: '#2d7a4f' }}>${Number(fee.total_paid).toLocaleString()}</td>
                    <td className="fp-student-name" style={{ color: '#b52b2b' }}>${Number(fee.balance).toLocaleString()}</td>
                    <td>
                      <span className={`fp-status ${status}`}>
                        <span className="fp-status-dot" />
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <button
                        className="fp-record-btn"
                        disabled={fee.is_cleared}
                        onClick={() => setPaymentDialogFee(fee)}
                      >
                        Record Payment
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredFees.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#aaa' }}>No records found</div>
          )}
        </div>
      </div>

      {paymentDialogFee && (
        <div className="fp-overlay" onClick={() => setPaymentDialogFee(null)}>
          <div className="fp-dialog" onClick={(e) => e.stopPropagation()}>
            <h2 className="fp-dialog-title">Record Payment</h2>
            <p className="fp-dialog-sub">Recording payment for {paymentDialogFee.student_first_name}</p>

            <div style={{ background: '#f9f9f8', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888' }}>Balance Due</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>${Number(paymentDialogFee.balance).toLocaleString()}</div>
            </div>

            <form onSubmit={handlePaymentSubmit}>
              <div className="fp-field">
                <label>Amount Paid</label>
                <input
                  type="number" step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  max={paymentDialogFee.balance}
                  required
                />
              </div>
              <div className="fp-field">
                <label>Method</label>
                <select
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
                <label>Notes</label>
                <input
                  type="text"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="Optional notes"
                />
              </div>
              <button type="submit" className="fp-btn-submit">Confirm Payment</button>
            </form>
          </div>
        </div>
      )}

      <PaymentRecordDialog
        isOpen={showRecordPayment}
        onClose={() => setShowRecordPayment(false)}
        preselectedStudentId={paymentDialogFee?.student_id}
      />
    </>
  );
}