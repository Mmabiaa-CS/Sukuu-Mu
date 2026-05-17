'use client';

import { useState, useEffect } from 'react';
import { Subject } from '@/lib/types';
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
import { getApiErrorMessage } from '@/lib/api-errors';

interface SubjectFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (subject: Omit<Subject, 'id'>) => void;
  initialData?: Subject;
  isEditing?: boolean;
}

export function SubjectFormDialog({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false
}: SubjectFormDialogProps) {
  const [formData, setFormData] = useState<Omit<Subject, 'id'>>({
    name: initialData?.name || '',
    code: initialData?.code || '',
    description: initialData?.description || '',
    creditHours: initialData?.creditHours || 3
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: initialData?.name || '',
        code: initialData?.code || '',
        description: initialData?.description || '',
        creditHours: initialData?.creditHours || 3
      });
      setError(null);
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(getApiErrorMessage(err, 'Action failed. Please try again or check for duplicates.'));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Subject' : 'Add New Subject'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update subject information'
              : 'Fill in the details below to add a new subject'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 text-sm text-red-800 bg-red-100 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Subject Name *</label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Mathematics"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Subject Code *</label>
            <Input
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              placeholder="e.g., MATH"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <Input
              value={formData.description || ''}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Optional subject description"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Credit Hours *</label>
            <Input
              type="number"
              min="1"
              max="10"
              value={Number.isNaN(formData.creditHours) ? '' : formData.creditHours}
              onChange={(e) =>
                setFormData({ ...formData, creditHours: e.target.value ? parseInt(e.target.value) : 0 })
              }
              required
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update Subject' : 'Add Subject'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
