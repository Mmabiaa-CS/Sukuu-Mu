import { User, Student, Class, Subject, Teacher, ClassSubject, UserRole, ClassTeacher, Fee, Payment, Receipt, Attendance } from './types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'admin@school.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
    phone: '+1-555-0100',
    address: '123 School St, Education City',
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'user-2',
    email: 'manager@school.com',
    password: 'manager123',
    firstName: 'John',
    lastName: 'Manager',
    role: UserRole.MANAGER,
    phone: '+1-555-0101',
    address: '456 Admin Ave, Education City',
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'user-3',
    email: 'teacher@school.com',
    password: 'teacher123',
    firstName: 'Sarah',
    lastName: 'Teacher',
    role: UserRole.TEACHER,
    phone: '+1-555-0102',
    address: '789 Faculty Lane, Education City',
    createdAt: new Date('2024-02-01')
  }
];

// Mock Classes
export const mockClasses: Class[] = [
  {
    id: 'class-1',
    name: 'Grade 9 - A',
    code: 'G9A',
    description: 'Grade 9 Section A',
    level: 9,
    academicYear: '2024-2025',
    capacity: 40,
    createdAt: new Date('2024-01-10')
  },
  {
    id: 'class-2',
    name: 'Grade 9 - B',
    code: 'G9B',
    description: 'Grade 9 Section B',
    level: 9,
    academicYear: '2024-2025',
    capacity: 40,
    createdAt: new Date('2024-01-10')
  },
  {
    id: 'class-3',
    name: 'Grade 10 - A',
    code: 'G10A',
    description: 'Grade 10 Section A',
    level: 10,
    academicYear: '2024-2025',
    capacity: 40,
    createdAt: new Date('2024-01-10')
  },
  {
    id: 'class-4',
    name: 'Grade 10 - B',
    code: 'G10B',
    description: 'Grade 10 Section B',
    level: 10,
    academicYear: '2024-2025',
    capacity: 40,
    createdAt: new Date('2024-01-10')
  }
];

// Mock Subjects
export const mockSubjects: Subject[] = [
  {
    id: 'subject-1',
    name: 'English',
    code: 'ENG',
    description: 'English Language and Literature',
    creditHours: 3
  },
  {
    id: 'subject-2',
    name: 'Mathematics',
    code: 'MATH',
    description: 'Mathematics and Algebra',
    creditHours: 3
  },
  {
    id: 'subject-3',
    name: 'Science',
    code: 'SCI',
    description: 'General Science',
    creditHours: 4
  },
  {
    id: 'subject-4',
    name: 'Physics',
    code: 'PHY',
    description: 'Physics',
    creditHours: 3
  },
  {
    id: 'subject-5',
    name: 'Chemistry',
    code: 'CHEM',
    description: 'Chemistry',
    creditHours: 3
  },
  {
    id: 'subject-6',
    name: 'Biology',
    code: 'BIO',
    description: 'Biology',
    creditHours: 3
  },
  {
    id: 'subject-7',
    name: 'History',
    code: 'HIST',
    description: 'World History',
    creditHours: 2
  },
  {
    id: 'subject-8',
    name: 'Geography',
    code: 'GEO',
    description: 'Geography and Social Studies',
    creditHours: 2
  }
];

// Mock Teachers
export const mockTeachers: Teacher[] = [
  {
    id: 'teacher-1',
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah.williams@school.com',
    phone: '+1-555-0201',
    qualification: 'M.A. in English Literature',
    joinDate: new Date('2023-08-01'),
    subjectIds: ['subject-1'],
    status: 'active'
  },
  {
    id: 'teacher-2',
    firstName: 'Michael',
    lastName: 'Johnson',
    email: 'michael.johnson@school.com',
    phone: '+1-555-0202',
    qualification: 'M.Sc. in Mathematics',
    joinDate: new Date('2023-08-01'),
    subjectIds: ['subject-2'],
    status: 'active'
  },
  {
    id: 'teacher-3',
    firstName: 'Emma',
    lastName: 'Brown',
    email: 'emma.brown@school.com',
    phone: '+1-555-0203',
    qualification: 'M.Sc. in Physics',
    joinDate: new Date('2024-01-15'),
    subjectIds: ['subject-4'],
    status: 'active'
  },
  {
    id: 'teacher-4',
    firstName: 'David',
    lastName: 'Smith',
    email: 'david.smith@school.com',
    phone: '+1-555-0204',
    qualification: 'M.Sc. in Chemistry',
    joinDate: new Date('2024-01-15'),
    subjectIds: ['subject-5'],
    status: 'active'
  },
  {
    id: 'teacher-5',
    firstName: 'Lisa',
    lastName: 'Davis',
    email: 'lisa.davis@school.com',
    phone: '+1-555-0205',
    qualification: 'M.Sc. in Biology',
    joinDate: new Date('2024-01-15'),
    subjectIds: ['subject-6'],
    status: 'active'
  }
];

// Mock Students
export const mockStudents: Student[] = [
  {
    id: 'student-1',
    firstName: 'Alice',
    lastName: 'Anderson',
    email: 'alice.anderson@school.com',
    phone: '+1-555-1001',
    dateOfBirth: new Date('2009-05-12'),
    address: '101 Student Ave, Education City',
    classId: 'class-1',
    enrollmentDate: new Date('2024-01-20'),
    status: 'active'
  },
  {
    id: 'student-2',
    firstName: 'Bob',
    lastName: 'Brown',
    email: 'bob.brown@school.com',
    phone: '+1-555-1002',
    dateOfBirth: new Date('2009-08-23'),
    address: '102 Student Ave, Education City',
    classId: 'class-1',
    enrollmentDate: new Date('2024-01-20'),
    status: 'active'
  },
  {
    id: 'student-3',
    firstName: 'Charlie',
    lastName: 'Chen',
    email: 'charlie.chen@school.com',
    phone: '+1-555-1003',
    dateOfBirth: new Date('2009-11-05'),
    address: '103 Student Ave, Education City',
    classId: 'class-1',
    enrollmentDate: new Date('2024-01-20'),
    status: 'active'
  },
  {
    id: 'student-4',
    firstName: 'Diana',
    lastName: 'Davis',
    email: 'diana.davis@school.com',
    phone: '+1-555-1004',
    dateOfBirth: new Date('2009-03-15'),
    address: '104 Student Ave, Education City',
    classId: 'class-1',
    enrollmentDate: new Date('2024-01-20'),
    status: 'active'
  },
  {
    id: 'student-5',
    firstName: 'Eve',
    lastName: 'Evans',
    email: 'eve.evans@school.com',
    phone: '+1-555-1005',
    dateOfBirth: new Date('2009-07-22'),
    address: '105 Student Ave, Education City',
    classId: 'class-2',
    enrollmentDate: new Date('2024-01-20'),
    status: 'active'
  },
  {
    id: 'student-6',
    firstName: 'Frank',
    lastName: 'Foster',
    email: 'frank.foster@school.com',
    phone: '+1-555-1006',
    dateOfBirth: new Date('2009-09-10'),
    address: '106 Student Ave, Education City',
    classId: 'class-2',
    enrollmentDate: new Date('2024-01-20'),
    status: 'active'
  },
  {
    id: 'student-7',
    firstName: 'Grace',
    lastName: 'Green',
    email: 'grace.green@school.com',
    phone: '+1-555-1007',
    dateOfBirth: new Date('2009-12-01'),
    address: '107 Student Ave, Education City',
    classId: 'class-2',
    enrollmentDate: new Date('2024-01-20'),
    status: 'active'
  },
  {
    id: 'student-8',
    firstName: 'Henry',
    lastName: 'Harris',
    email: 'henry.harris@school.com',
    phone: '+1-555-1008',
    dateOfBirth: new Date('2009-04-18'),
    address: '108 Student Ave, Education City',
    classId: 'class-3',
    enrollmentDate: new Date('2024-01-20'),
    status: 'active'
  }
];

// Mock Class-Subject assignments
export const mockClassSubjects: ClassSubject[] = [
  { id: 'cs-1', classId: 'class-1', subjectId: 'subject-1', teacherId: 'teacher-1', maxMarks: 100, passingMarks: 40 },
  { id: 'cs-2', classId: 'class-1', subjectId: 'subject-2', teacherId: 'teacher-2', maxMarks: 100, passingMarks: 40 },
  { id: 'cs-3', classId: 'class-1', subjectId: 'subject-3', teacherId: 'teacher-3', maxMarks: 100, passingMarks: 40 },
  { id: 'cs-4', classId: 'class-2', subjectId: 'subject-1', teacherId: 'teacher-1', maxMarks: 100, passingMarks: 40 },
  { id: 'cs-5', classId: 'class-2', subjectId: 'subject-2', teacherId: 'teacher-2', maxMarks: 100, passingMarks: 40 },
  { id: 'cs-6', classId: 'class-3', subjectId: 'subject-4', teacherId: 'teacher-3', maxMarks: 100, passingMarks: 40 },
  { id: 'cs-7', classId: 'class-3', subjectId: 'subject-5', teacherId: 'teacher-4', maxMarks: 100, passingMarks: 40 },
  { id: 'cs-8', classId: 'class-3', subjectId: 'subject-6', teacherId: 'teacher-5', maxMarks: 100, passingMarks: 40 }
];

// Mock Class-Teacher assignments
export const mockClassTeachers: ClassTeacher[] = [
  { id: 'ct-1', classId: 'class-1', teacherId: 'teacher-1', subjectId: 'subject-1', assignedAt: new Date('2024-01-01') },
  { id: 'ct-2', classId: 'class-1', teacherId: 'teacher-2', subjectId: 'subject-2', assignedAt: new Date('2024-01-01') },
  { id: 'ct-3', classId: 'class-1', teacherId: 'teacher-3', subjectId: 'subject-3', assignedAt: new Date('2024-01-01') },
  { id: 'ct-4', classId: 'class-2', teacherId: 'teacher-1', subjectId: 'subject-1', assignedAt: new Date('2024-01-01') },
  { id: 'ct-5', classId: 'class-2', teacherId: 'teacher-2', subjectId: 'subject-2', assignedAt: new Date('2024-01-01') },
  { id: 'ct-6', classId: 'class-3', teacherId: 'teacher-3', subjectId: 'subject-4', assignedAt: new Date('2024-01-01') },
  { id: 'ct-7', classId: 'class-3', teacherId: 'teacher-4', subjectId: 'subject-5', assignedAt: new Date('2024-01-01') },
  { id: 'ct-8', classId: 'class-3', teacherId: 'teacher-5', subjectId: 'subject-6', assignedAt: new Date('2024-01-01') }
];

// Mock Fees
export const mockFees: Fee[] = [
  { id: 'fee-1', studentId: 'student-1', classId: 'class-1', amount: 5000, dueDate: new Date('2024-02-28'), description: 'Monthly tuition fee', status: 'paid', createdAt: new Date('2024-02-01') },
  { id: 'fee-2', studentId: 'student-1', classId: 'class-1', amount: 5000, dueDate: new Date('2024-03-28'), description: 'Monthly tuition fee', status: 'pending', createdAt: new Date('2024-03-01') },
  { id: 'fee-3', studentId: 'student-2', classId: 'class-1', amount: 5000, dueDate: new Date('2024-02-28'), description: 'Monthly tuition fee', status: 'partial', createdAt: new Date('2024-02-01') },
  { id: 'fee-4', studentId: 'student-2', classId: 'class-1', amount: 5000, dueDate: new Date('2024-03-28'), description: 'Monthly tuition fee', status: 'pending', createdAt: new Date('2024-03-01') },
  { id: 'fee-5', studentId: 'student-3', classId: 'class-1', amount: 5000, dueDate: new Date('2024-02-28'), description: 'Monthly tuition fee', status: 'paid', createdAt: new Date('2024-02-01') },
  { id: 'fee-6', studentId: 'student-4', classId: 'class-1', amount: 5000, dueDate: new Date('2024-02-28'), description: 'Monthly tuition fee', status: 'paid', createdAt: new Date('2024-02-01') },
];

// Mock Payments
export const mockPayments: Payment[] = [
  { id: 'pay-1', feeId: 'fee-1', studentId: 'student-1', amount: 5000, paymentDate: new Date('2024-02-20'), paymentMethod: 'transfer', receiptNumber: 'RCP-001', notes: 'Full payment', createdAt: new Date('2024-02-20') },
  { id: 'pay-2', feeId: 'fee-3', studentId: 'student-2', amount: 2500, paymentDate: new Date('2024-02-25'), paymentMethod: 'cash', receiptNumber: 'RCP-002', notes: 'Partial payment', createdAt: new Date('2024-02-25') },
  { id: 'pay-3', feeId: 'fee-5', studentId: 'student-3', amount: 5000, paymentDate: new Date('2024-02-15'), paymentMethod: 'check', receiptNumber: 'RCP-003', notes: 'Full payment', createdAt: new Date('2024-02-15') },
  { id: 'pay-4', feeId: 'fee-6', studentId: 'student-4', amount: 5000, paymentDate: new Date('2024-02-10'), paymentMethod: 'online', receiptNumber: 'RCP-004', notes: 'Full payment', createdAt: new Date('2024-02-10') },
];

// Mock Receipts
export const mockReceipts: Receipt[] = [
  { id: 'rcpt-1', paymentId: 'pay-1', studentId: 'student-1', receiptNumber: 'RCP-001', totalAmount: 5000, issueDate: new Date('2024-02-20'), paidBy: 'Alice Anderson' },
  { id: 'rcpt-2', paymentId: 'pay-2', studentId: 'student-2', receiptNumber: 'RCP-002', totalAmount: 2500, issueDate: new Date('2024-02-25'), paidBy: 'Bob Brown' },
  { id: 'rcpt-3', paymentId: 'pay-3', studentId: 'student-3', receiptNumber: 'RCP-003', totalAmount: 5000, issueDate: new Date('2024-02-15'), paidBy: 'Charlie Chen' },
  { id: 'rcpt-4', paymentId: 'pay-4', studentId: 'student-4', receiptNumber: 'RCP-004', totalAmount: 5000, issueDate: new Date('2024-02-10'), paidBy: 'Diana Davis' },
];

// Mock Attendance
export const mockAttendance: Attendance[] = [
  { id: 'att-1', studentId: 'student-1', classId: 'class-1', date: new Date('2024-04-01'), status: 'present', recordedAt: new Date('2024-04-01') },
  { id: 'att-2', studentId: 'student-1', classId: 'class-1', date: new Date('2024-04-02'), status: 'present', recordedAt: new Date('2024-04-02') },
  { id: 'att-3', studentId: 'student-1', classId: 'class-1', date: new Date('2024-04-03'), status: 'absent', recordedAt: new Date('2024-04-03') },
  { id: 'att-4', studentId: 'student-1', classId: 'class-1', date: new Date('2024-04-04'), status: 'late', recordedAt: new Date('2024-04-04') },
  { id: 'att-5', studentId: 'student-2', classId: 'class-1', date: new Date('2024-04-01'), status: 'present', recordedAt: new Date('2024-04-01') },
  { id: 'att-6', studentId: 'student-2', classId: 'class-1', date: new Date('2024-04-02'), status: 'present', recordedAt: new Date('2024-04-02') },
  { id: 'att-7', studentId: 'student-2', classId: 'class-1', date: new Date('2024-04-03'), status: 'present', recordedAt: new Date('2024-04-03') },
  { id: 'att-8', studentId: 'student-2', classId: 'class-1', date: new Date('2024-04-04'), status: 'absent', recordedAt: new Date('2024-04-04') },
];
