import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from './app-config.service';
import {
  BusRouteDto,
  CreateLoginResult,
  CreateStudentRequest,
  SectionDto,
  StudentDetail,
  StudentDocument,
  StudentInterest,
  StudentListItem,
} from '../models/domain.models';

@Injectable({ providedIn: 'root' })
export class StudentsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfig);
  private get api() { return this.config.apiUrl; }

  list(classId?: number | null, search?: string): Observable<StudentListItem[]> {
    const params: Record<string, string> = {};
    if (classId) params['classId'] = String(classId);
    if (search) params['search'] = search;
    return this.http.get<StudentListItem[]>(`${this.api}/students`, { params });
  }

  get(id: number): Observable<StudentDetail> {
    return this.http.get<StudentDetail>(`${this.api}/students/${id}`);
  }

  admit(request: CreateStudentRequest): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${this.api}/students`, request);
  }

  setPhoto(id: number, photoUrl: string): Observable<void> {
    return this.http.put<void>(`${this.api}/students/${id}/photo`, { photoUrl });
  }

  getInterests(id: number): Observable<StudentInterest[]> {
    return this.http.get<StudentInterest[]>(`${this.api}/students/${id}/interests`);
  }

  addInterest(id: number, interestType: string, interestName: string): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${this.api}/students/${id}/interests`, { interestType, interestName });
  }

  deleteInterest(interestId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/students/interests/${interestId}`);
  }

  getDocuments(id: number): Observable<StudentDocument[]> {
    return this.http.get<StudentDocument[]>(`${this.api}/students/${id}/documents`);
  }

  addDocument(id: number, doc: { documentType: string; fileName?: string; fileUrl: string; publicId?: string }): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${this.api}/students/${id}/documents`, doc);
  }

  getSections(classId: number): Observable<SectionDto[]> {
    return this.http.get<SectionDto[]>(`${this.api}/sections`, { params: { classId: String(classId) } });
  }

  addSection(classId: number, name: string): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${this.api}/sections`, { classId, name });
  }

  getBusRoutes(): Observable<BusRouteDto[]> {
    return this.http.get<BusRouteDto[]>(`${this.api}/bus-routes`);
  }

  createLogin(studentId: number, username?: string, password?: string): Observable<CreateLoginResult> {
    return this.http.post<CreateLoginResult>(`${this.api}/students/${studentId}/login`, { username, password });
  }
}
