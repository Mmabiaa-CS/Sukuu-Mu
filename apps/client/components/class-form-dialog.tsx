'use client';

import { useState } from 'react';
import { Class } from '@/lib/types';
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

interface ClassFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (classData: Omit<Class, 'id' | 'createdAt' | 'created_at' | 'total_students'>) => void;
  initialData?: Class;
  isEditing?: boolean;
}

export function ClassFormDialog({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false
}: ClassFormDialogProps) {
  const [formData, setFormData] = useState<Omit<Class, 'id' | 'createdAt' | 'created_at' | 'total_students'>>({
    name: initialData?.name || '',
    code: initialData?.code || '',
    description: initialData?.description || '',
    level: initialData?.level || 1,
    academicYear: initialData?.academicYear || '2024-2025',
    capacity: initialData?.capacity || 40,
    is_active: initialData?.is_active ?? 1
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
            {isEditing ? 'Edit Class' : 'Create New Class'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update class information'
              : 'Fill in the details below to create a new class'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Class Name *</label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Grade 9 - A"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Class Code *</label>
            <Input
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              placeholder="e.g., G9A"
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
              placeholder="Optional description"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Level *</label>
              <Select value={String(formData.level)} onValueChange={(value) =>
                setFormData({ ...formData, level: parseInt(value) })
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      Grade {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Capacity *</label>
              <Input
                type="number"
                min="1"
                max="100"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: parseInt(e.target.value) })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Academic Year *</label>
            <Input
              value={formData.academicYear}
              onChange={(e) =>
                setFormData({ ...formData, academicYear: e.target.value })
              }
              placeholder="e.g., 2024-2025"
              required
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update Class' : 'Create Class'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
