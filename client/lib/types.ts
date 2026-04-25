// User roles
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  TEACHER = 'teacher',
  STUDENT = 'student'
}

// User interface
export interface User {
  id: string;
  email: string;
  password: string; // Note: Mock only, never store plaintext in production
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  address?: string;
  createdAt: Date;
}

// Student interface
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  address?: string;
  classId: string;
  enrollmentDate: Date;
  status: 'active' | 'inactive' | 'graduated';
}

// Class interface
export interface Class {
  id: string;
  name: string;
  code: string;
  description?: string;
  level: number; // e.g., 1-12 for grade levels
  academicYear: string; // e.g., "2024-2025"
  capacity: number;
  createdAt: Date;
}

// Subject interface
export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  creditHours: number;
}

// Teacher interface
export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  qualification?: string;
  joinDate: Date;
  subjectIds: string[]; // References to Subject IDs
  status: 'active' | 'inactive' | 'on-leave';
}

// Class-Subject assignment
export interface ClassSubject {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  maxMarks?: number;
  passingMarks?: number;
}

// Auth context type
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Dashboard stats
export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSubjects: number;
}

// Class-Teacher assignment
export interface ClassTeacher {
  id: string;
  classId: string;
  teacherId: string;
  subjectId: string;
  assignedAt: Date;
}

// Fee structure
export interface Fee {
  id: string;
  studentId: string;
  classId: string;
  amount: number;
  dueDate: Date;
  description: string;
  status: 'pending' | 'paid' | 'partial';
  createdAt: Date;
}

// Payment record
export interface Payment {
  id: string;
  feeId: string;
  studentId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: 'cash' | 'check' | 'transfer' | 'online';
  receiptNumber: string;
  notes?: string;
  createdAt: Date;
}

// Receipt document
export interface Receipt {
  id: string;
  paymentId: string;
  studentId: string;
  receiptNumber: string;
  totalAmount: number;
  issueDate: Date;
  paidBy: string;
}

// Attendance record
export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: Date;
  status: 'present' | 'absent' | 'late';
  remarks?: string;
  recordedAt: Date;
}
