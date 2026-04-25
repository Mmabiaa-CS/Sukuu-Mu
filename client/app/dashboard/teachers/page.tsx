'use client';

import { useState } from 'react';
import { useTeachers } from '@/lib/use-teachers';
import { TeacherFormDialog } from '@/components/teacher-form-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Plus, Search, Trash2 } from 'lucide-react';

export default function TeachersPage() {
  const {
    filteredTeachers,
    searchTerm,
    setSearchTerm,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    getTeacherSubjects
  } = useTeachers();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  const handleAddTeacher = (data) => {
    addTeacher(data);
    setIsFormOpen(false);
  };

  const handleEditTeacher = (teacher) => {
    setEditingTeacher(teacher);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingTeacher(null);
  };

  const handleDeleteTeacher = (id) => {
    if (confirm('Are you sure you want to delete this teacher?')) {
      deleteTeacher(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Teachers</h1>
        <p className="text-muted-foreground mt-1">Manage teacher information and assignments</p>
      </div>

      {/* Search and Add Button */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Teacher
        </Button>
      </div>

      {/* Teachers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Teacher List</CardTitle>
          <CardDescription>
            Showing {filteredTeachers.length} teachers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTeachers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No teachers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subjects</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map((teacher) => {
                    const subjects = getTeacherSubjects(teacher.subjectIds);
                    return (
                      <TableRow key={teacher.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {teacher.firstName} {teacher.lastName}
                        </TableCell>
                        <TableCell className="text-sm">{teacher.email}</TableCell>
                        <TableCell className="text-sm">
                          {subjects.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {subjects.slice(0, 2).map((subj, idx) => (
                                <span
                                  key={idx}
                                  className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs"
                                >
                                  {subj}
                                </span>
                              ))}
                              {subjects.length > 2 && (
                                <span className="text-xs text-muted-foreground">
                                  +{subjects.length - 2} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{teacher.phone || '-'}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              teacher.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : teacher.status === 'on-leave'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditTeacher(teacher)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteTeacher(teacher.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <TeacherFormDialog
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={editingTeacher ? (data) => {
          updateTeacher(editingTeacher.id, data);
          setEditingTeacher(null);
        } : handleAddTeacher}
        initialData={editingTeacher}
        isEditing={!!editingTeacher}
      />
    </div>
  );
}
