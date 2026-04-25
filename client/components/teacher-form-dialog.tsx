'use client';

import { useState } from 'react';
import { Teacher } from '@/lib/types';
import { mockSubjects } from '@/lib/mock-data';
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

interface TeacherFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (teacher: Omit<Teacher, 'id'>) => void;
  initialData?: Teacher;
  isEditing?: boolean;
}

export function TeacherFormDialog({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false
}: TeacherFormDialogProps) {
  const [formData, setFormData] = useState<Omit<Teacher, 'id'>>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    qualification: initialData?.qualification || '',
    joinDate: initialData?.joinDate || new Date(),
    subjectIds: initialData?.subjectIds || [],
    status: initialData?.status || 'active'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const toggleSubject = (subjectId: string) => {
    setFormData((prev) => ({
      ...prev,
      subjectIds: prev.subjectIds.includes(subjectId)
        ? prev.subjectIds.filter((id) => id !== subjectId)
        : [...prev.subjectIds, subjectId]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Teacher' : 'Add New Teacher'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update teacher information'
              : 'Fill in the details below to add a new teacher'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">First Name *</label>
              <Input
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Last Name *</label>
              <Input
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Email *</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Phone</label>
            <Input
              value={formData.phone || ''}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Qualification</label>
            <Input
              value={formData.qualification || ''}
              onChange={(e) =>
                setFormData({ ...formData, qualification: e.target.value })
              }
              placeholder="e.g., M.Sc. in Mathematics"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Join Date *</label>
            <Input
              type="date"
              value={
                formData.joinDate
                  ? new Date(formData.joinDate).toISOString().split('T')[0]
                  : ''
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  joinDate: e.target.value ? new Date(e.target.value) : new Date()
                })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Subjects *</label>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-input rounded-md p-3">
              {mockSubjects.map((subject) => (
                <label key={subject.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.subjectIds.includes(subject.id)}
                    onChange={() => toggleSubject(subject.id)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{subject.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Status</label>
            <Select value={formData.status} onValueChange={(value: any) =>
              setFormData({ ...formData, status: value })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on-leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update Teacher' : 'Add Teacher'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
