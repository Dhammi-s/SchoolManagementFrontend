import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from './app-config.service';
import {
  CreatePerformanceTestRequest,
  PerformanceTest,
  StudentResult,
  TestResultRow,
} from '../models/domain.models';

@Injectable({ providedIn: 'root' })
export class PerformanceService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfig);
  private get api() { return this.config.apiUrl; }

  getTests(classId?: number | null, teacherId?: number | null): Observable<PerformanceTest[]> {
    const params: Record<string, string> = {};
    if (classId) params['classId'] = String(classId);
    if (teacherId) params['teacherId'] = String(teacherId);
    return this.http.get<PerformanceTest[]>(`${this.api}/performance/tests`, { params });
  }

  createTest(request: CreatePerformanceTestRequest): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${this.api}/performance/tests`, request);
  }

  getResults(testId: number): Observable<TestResultRow[]> {
    return this.http.get<TestResultRow[]>(`${this.api}/performance/tests/${testId}/results`);
  }

  saveResult(testId: number, studentId: number, marksObtained: number | null, grade: string | null, remarks: string | null): Observable<void> {
    return this.http.post<void>(`${this.api}/performance/results`, {
      performanceTestId: testId,
      studentId,
      marksObtained,
      grade,
      remarks,
    });
  }
}

@Injectable({ providedIn: 'root' })
export class PortalService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfig);
  private get api() { return this.config.apiUrl; }

  profile() {
    return this.http.get(`${this.api}/me/profile`);
  }
  results(): Observable<StudentResult[]> {
    return this.http.get<StudentResult[]>(`${this.api}/me/results`);
  }
  fees() {
    return this.http.get(`${this.api}/me/fees`);
  }
}
