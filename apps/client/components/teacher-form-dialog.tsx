'use client';

import { useState } from 'react';
import { Teacher } from '@/lib/types';
import { useSubjects } from '@/lib/use-subjects';
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
import { Eye, EyeOff } from 'lucide-react';

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
  const { subjects } = useSubjects();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<Omit<Teacher, 'id'>>({
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    qualification: initialData?.qualification || '',
    join_date: initialData?.join_date || new Date().toISOString().split('T')[0],
    is_active: initialData?.is_active ?? 1,
    employee_id: initialData?.employee_id || '',
    password: '',
    subjectIds: initialData?.subjectIds || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const toggleSubject = (subjectId: number) => {
    setFormData((prev) => {
      const currentIds = prev.subjectIds || [];
      return {
        ...prev,
        subjectIds: currentIds.includes(subjectId)
          ? currentIds.filter((id) => id !== subjectId)
          : [...currentIds, subjectId]
      };
    });
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
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Last Name *</label>
              <Input
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Employee ID *</label>
            <Input
              value={formData.employee_id || ''}
              onChange={(e) =>
                setFormData({ ...formData, employee_id: e.target.value })
              }
              required
            />
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
              value={formData.join_date}
              onChange={(e) =>
                setFormData({ ...formData, join_date: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Subjects *</label>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-input rounded-md p-3">
              {subjects.map((subject) => (
                <label key={subject.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.subjectIds?.includes(subject.id)}
                    onChange={() => toggleSubject(subject.id)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{subject.name}</span>
                </label>
              ))}
            </div>
          </div>

          {!isEditing && (
            <div className="space-y-1">
              <label className="text-sm font-medium">Password *</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Create a strong password for this teacher"
                  required
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium">Status</label>
            <Select value={formData.is_active === 1 ? 'active' : 'inactive'} onValueChange={(value: any) =>
              setFormData({ ...formData, is_active: value === 'active' ? 1 : 0 })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
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
