export type Role = 'Principal' | 'HeadMaster' | 'Teacher' | 'Accountant' | 'Student';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAtUtc: string;
  userId: number;
  username: string;
  role: Role;
  employeeId?: number | null;
  studentId?: number | null;
  schoolName: string;
}

export interface CurrentUser {
  userId: number;
  username: string;
  role: Role;
  employeeId?: number | null;
  studentId?: number | null;
  schoolName: string;
}
