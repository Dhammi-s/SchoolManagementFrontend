export interface Branding {
  schoolName?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  loginBackgroundUrl?: string | null;
  loginTitle?: string | null;
  loginSubtitle?: string | null;
}

export interface SchoolSettings extends Branding {
  updatedAt?: string | null;
}

export interface ClassDto {
  id: number;
  name: string;
  academicYear: string;
  classInchargeEmployeeId?: number | null;
  classInchargeName?: string | null;
  studentCount: number;
  createdAt: string;
}

export interface CreateClassRequest {
  name: string;
  academicYear: string;
  classInchargeEmployeeId?: number | null;
}

export interface EmployeeDto {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName?: string | null;
  roleId: number;
  roleName: string;
  designation?: string | null;
  email?: string | null;
  phone?: string | null;
  gender?: string | null;
  qualification?: string | null;
  photoUrl?: string | null;
  isActive: boolean;
  inchargeClasses?: string | null;
}

export interface CreateTeacherRequest {
  employeeCode: string;
  firstName: string;
  lastName?: string | null;
  roleName?: string;
  designation?: string | null;
  email?: string | null;
  phone?: string | null;
  gender?: string | null;
  qualification?: string | null;
  classInchargeId?: number | null;
  createLogin?: boolean;
  username?: string | null;
  password?: string | null;
}

export interface CreateTeacherResponse {
  employeeId: number;
  userId?: number | null;
}

export interface SubjectDto {
  id: number;
  name: string;
  code?: string | null;
}

export interface TimetablePeriodDto {
  id: number;
  classId: number;
  className: string;
  sectionId?: number | null;
  sectionName?: string | null;
  subjectId: number;
  subjectName: string;
  teacherEmployeeId: number;
  teacherName?: string | null;
  dayOfWeek: number;
  periodNumber: number;
  startTime: string;
  endTime: string;
}

export interface CreateTimetablePeriodRequest {
  classId: number;
  sectionId?: number | null;
  subjectId: number;
  teacherEmployeeId: number;
  dayOfWeek: number;
  periodNumber: number;
  startTime: string;
  endTime: string;
}

export interface SectionDto {
  id: number;
  classId: number;
  name: string;
}

export interface BusRouteDto {
  id: number;
  routeName: string;
  vehicleNumber?: string | null;
  driverName?: string | null;
  driverPhone?: string | null;
  fee: number;
  isActive: boolean;
}

export interface StudentListItem {
  id: number;
  admissionNumber: string;
  firstName: string;
  lastName?: string | null;
  gender?: string | null;
  rollNumber?: string | null;
  classId?: number | null;
  className?: string | null;
  sectionId?: number | null;
  sectionName?: string | null;
  photoUrl?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  usesBusService: boolean;
  pendingFees: number;
}

export interface StudentDetail extends StudentListItem {
  dateOfBirth?: string | null;
  address?: string | null;
  previousSchoolName?: string | null;
  previousSchoolDetails?: string | null;
  busRouteId?: number | null;
  busRouteName?: string | null;
  admissionDate?: string | null;
  isActive: boolean;
}

export interface CreateStudentRequest {
  admissionNumber: string;
  firstName: string;
  lastName?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  classId?: number | null;
  sectionId?: number | null;
  rollNumber?: string | null;
  address?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  previousSchoolName?: string | null;
  previousSchoolDetails?: string | null;
  usesBusService: boolean;
  busRouteId?: number | null;
  admissionDate?: string | null;
  photoUrl?: string | null;
}

export interface StudentInterest {
  id: number;
  studentId: number;
  interestType: string;
  interestName: string;
}

export interface StudentDocument {
  id: number;
  studentId: number;
  documentType: string;
  fileName?: string | null;
  fileUrl: string;
  publicId?: string | null;
  uploadedAt: string;
}

export interface MediaUploadResponse {
  url: string;
  publicId: string;
}

// ---- Fees ----
export interface FeeStructure {
  id: number;
  classId?: number | null;
  className?: string | null;
  academicYear: string;
  title: string;
  amount: number;
  dueDate?: string | null;
  isActive: boolean;
}

export interface CreateFeeStructureRequest {
  classId?: number | null;
  academicYear: string;
  title: string;
  amount: number;
  dueDate?: string | null;
}

export interface StudentFee {
  id: number;
  studentId: number;
  feeStructureId: number;
  title: string;
  academicYear: string;
  amountDue: number;
  amountPaid: number;
  balance: number;
  status: string;
  dueDate?: string | null;
  paidDate?: string | null;
}

export interface PendingFee {
  studentId: number;
  admissionNumber: string;
  studentName: string;
  className?: string | null;
  pendingAmount: number;
}

// ---- Performance / Results ----
export interface PerformanceTest {
  id: number;
  classId: number;
  className: string;
  sectionId?: number | null;
  sectionName?: string | null;
  subjectId: number;
  subjectName: string;
  teacherEmployeeId: number;
  teacherName?: string | null;
  title: string;
  testDate: string;
  maxMarks: number;
}

export interface CreatePerformanceTestRequest {
  classId: number;
  sectionId?: number | null;
  subjectId: number;
  teacherEmployeeId: number;
  title: string;
  testDate: string;
  maxMarks: number;
}

export interface TestResultRow {
  studentId: number;
  studentName: string;
  rollNumber?: string | null;
  resultId?: number | null;
  marksObtained?: number | null;
  grade?: string | null;
  remarks?: string | null;
}

export interface StudentResult {
  resultId: number;
  performanceTestId: number;
  title: string;
  testDate: string;
  subjectName: string;
  maxMarks: number;
  marksObtained?: number | null;
  grade?: string | null;
  remarks?: string | null;
}
