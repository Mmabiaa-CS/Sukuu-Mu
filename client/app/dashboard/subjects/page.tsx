'use client';

import { useState } from 'react';
import { useSubjects } from '@/lib/use-subjects';
import { SubjectFormDialog } from '@/components/subject-form-dialog';
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

export default function SubjectsPage() {
  const {
    filteredSubjects,
    searchTerm,
    setSearchTerm,
    addSubject,
    updateSubject,
    deleteSubject
  } = useSubjects();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const handleAddSubject = (data) => {
    addSubject(data);
    setIsFormOpen(false);
  };

  const handleEditSubject = (subject) => {
    setEditingSubject(subject);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingSubject(null);
  };

  const handleDeleteSubject = (id) => {
    if (confirm('Are you sure you want to delete this subject?')) {
      deleteSubject(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Subjects</h1>
        <p className="text-muted-foreground mt-1">Manage academic subjects offered at the school</p>
      </div>

      {/* Search and Add Button */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Subject
        </Button>
      </div>

      {/* Subjects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subject List</CardTitle>
          <CardDescription>
            Showing {filteredSubjects.length} subjects
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSubjects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No subjects found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Credit Hours</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubjects.map((subject) => (
                    <TableRow key={subject.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {subject.name}
                      </TableCell>
                      <TableCell className="text-sm font-mono">{subject.code}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {subject.description || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                          {subject.creditHours} hrs
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
                            <DropdownMenuItem onClick={() => handleEditSubject(subject)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteSubject(subject.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <SubjectFormDialog
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={editingSubject ? (data) => {
          updateSubject(editingSubject.id, data);
          setEditingSubject(null);
        } : handleAddSubject}
        initialData={editingSubject}
        isEditing={!!editingSubject}
      />
    </div>
  );
}
