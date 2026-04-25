'use client';

import { useState } from 'react';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
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
              value={formData.creditHours}
              onChange={(e) =>
                setFormData({ ...formData, creditHours: parseInt(e.target.value) })
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
