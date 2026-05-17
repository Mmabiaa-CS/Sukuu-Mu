'use client';

import { useState, useEffect } from 'react';
import { useStudents } from '@/lib/use-students';
import { useFinances } from '@/lib/use-finances';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getApiErrorMessage } from '@/lib/api-errors';

type PaymentRecordDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  preselectedStudentId?: number;
};

export function PaymentRecordDialog({
  isOpen,
  onClose,
  preselectedStudentId,
}: PaymentRecordDialogProps) {
  const { students } = useStudents();
  const { structures, recordPayment } = useFinances();

  const [form, setForm] = useState({
    student_id: '',
    fee_structure_id: '',
    amount_paid: '',
    total_fee: '',
    payment_method: 'cash',
    notes: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({
        student_id: preselectedStudentId ? String(preselectedStudentId) : '',
        fee_structure_id: '',
        amount_paid: '',
        total_fee: '',
        payment_method: 'cash',
        notes: '',
      });
      setError(null);
    }
  }, [isOpen, preselectedStudentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        student_id: Number(form.student_id),
        amount_paid: parseFloat(form.amount_paid),
        payment_method: form.payment_method,
        notes: form.notes || undefined,
      };

      if (form.fee_structure_id) {
        payload.fee_structure_id = Number(form.fee_structure_id);
      } else if (form.total_fee) {
        payload.total_fee = parseFloat(form.total_fee);
      } else {
        setError('Select a fee structure or enter a total fee amount for this payment.');
        setIsSubmitting(false);
        return;
      }

      await recordPayment(payload);
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to record payment.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>
            Record tuition, fees, or other payments for a student.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Student *</label>
            <Select
              value={form.student_id}
              onValueChange={(v) => setForm({ ...form, student_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.first_name} {s.last_name} ({s.student_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Fee structure (optional)</label>
            <Select
              value={form.fee_structure_id || 'none'}
              onValueChange={(v) =>
                setForm({
                  ...form,
                  fee_structure_id: v === 'none' ? '' : v,
                  total_fee: v !== 'none' ? '' : form.total_fee,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="General / other payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Other payment (enter total below)</SelectItem>
                {structures.map((st: { id: number; name: string }) => (
                  <SelectItem key={st.id} value={String(st.id)}>
                    {st.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!form.fee_structure_id && (
            <div className="space-y-1">
              <label className="text-sm font-medium">Total fee amount *</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.total_fee}
                onChange={(e) => setForm({ ...form, total_fee: e.target.value })}
                placeholder="Required when no fee structure is selected"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium">Amount paid *</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.amount_paid}
              onChange={(e) => setForm({ ...form, amount_paid: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Payment method</label>
            <Select
              value={form.payment_method}
              onValueChange={(v) => setForm({ ...form, payment_method: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank_transfer">Bank transfer</SelectItem>
                <SelectItem value="mobile_money">Mobile money</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Notes</label>
            <Input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Optional reference or description"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !form.student_id}>
              {isSubmitting ? 'Saving…' : 'Record payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
