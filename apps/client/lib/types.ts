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
  name: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: UserRole | string;
  is_active?: number;
  phone?: string;
  address?: string;
  createdAt?: Date;
}

// Student interface
export interface Student {
  id: number;
  student_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  class_id?: number | string;
  enrollment_date: string;
  is_active: number;
}

export interface Class {
  id: number;
  name: string;
  code: string;
  description?: string;
  level: number;
  capacity: number;
  academicYear: string;
  is_active: number;
  total_students?: number;
  createdAt?: string;
  created_at?: string;
}

// Subject interface
export interface Subject {
  id: number;
  name: string;
  code: string;
  description?: string;
  creditHours?: number;
  created_at?: string;
}

// Teacher interface
export interface Teacher {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  gender?: string;
  qualification?: string;
  join_date?: string;
  is_active: number;
  password?: string;
  subjectIds?: number[];
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
  updateProfile: (updates: Partial<Pick<User, 'firstName' | 'lastName' | 'phone' | 'address'>>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

// Dashboard stats
export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSubjects: number;
}

// Parent interface
export interface Parent {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  gender?: string;
  occupation?: string;
  address?: string;
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
