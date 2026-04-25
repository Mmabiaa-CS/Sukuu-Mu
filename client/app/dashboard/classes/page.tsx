'use client';

import { useState } from 'react';
import { useClasses } from '@/lib/use-classes';
import { ClassFormDialog } from '@/components/class-form-dialog';
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

export default function ClassesPage() {
  const {
    filteredClasses,
    searchTerm,
    setSearchTerm,
    addClass,
    updateClass,
    deleteClass,
    getStudentsInClass,
    getClassFillPercentage
  } = useClasses();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  const handleAddClass = (data) => {
    addClass(data);
    setIsFormOpen(false);
  };

  const handleEditClass = (classItem) => {
    setEditingClass(classItem);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingClass(null);
  };

  const handleDeleteClass = (id) => {
    if (confirm('Are you sure you want to delete this class?')) {
      deleteClass(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Classes</h1>
        <p className="text-muted-foreground mt-1">Manage classes and view enrollment status</p>
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
          Create Class
        </Button>
      </div>

      {/* Classes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Class List</CardTitle>
          <CardDescription>
            Showing {filteredClasses.length} classes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredClasses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No classes found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Grade Level</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Fill %</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClasses.map((classItem) => {
                    const students = getStudentsInClass(classItem.id);
                    const fillPercentage = getClassFillPercentage(classItem.id);
                    return (
                      <TableRow key={classItem.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {classItem.name}
                        </TableCell>
                        <TableCell className="text-sm">{classItem.code}</TableCell>
                        <TableCell className="text-sm">Grade {classItem.level}</TableCell>
                        <TableCell className="text-sm">{students.length}</TableCell>
                        <TableCell className="text-sm">{classItem.capacity}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  fillPercentage > 90
                                    ? 'bg-red-500'
                                    : fillPercentage > 70
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                }`}
                                style={{ width: `${fillPercentage}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium w-8">{fillPercentage}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditClass(classItem)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteClass(classItem.id)}
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
      <ClassFormDialog
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={editingClass ? (data) => {
          updateClass(editingClass.id, data);
          setEditingClass(null);
        } : handleAddClass}
        initialData={editingClass}
        isEditing={!!editingClass}
      />
    </div>
  );
}
