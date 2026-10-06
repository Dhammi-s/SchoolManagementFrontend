import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateFeeStructureRequest,
  FeeStructure,
  PendingFee,
  StudentFee,
} from '../models/domain.models';

@Injectable({ providedIn: 'root' })
export class FeesService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  getStructures(classId?: number | null): Observable<FeeStructure[]> {
    const params: Record<string, string> = {};
    if (classId) params['classId'] = String(classId);
    return this.http.get<FeeStructure[]>(`${this.api}/fees/structures`, { params });
  }

  createStructure(request: CreateFeeStructureRequest): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${this.api}/fees/structures`, request);
  }

  assign(studentId: number, feeStructureId: number): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${this.api}/fees/assign`, { studentId, feeStructureId });
  }

  getByStudent(studentId: number): Observable<StudentFee[]> {
    return this.http.get<StudentFee[]>(`${this.api}/fees/student/${studentId}`);
  }

  recordPayment(studentFeeId: number, amount: number): Observable<void> {
    return this.http.post<void>(`${this.api}/fees/${studentFeeId}/payment`, { amount });
  }

  getPending(): Observable<PendingFee[]> {
    return this.http.get<PendingFee[]>(`${this.api}/fees/pending`);
  }
}
