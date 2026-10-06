import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from './app-config.service';
import {
  CreateTeacherRequest,
  CreateTeacherResponse,
  CreateTimetablePeriodRequest,
  EmployeeDto,
  SubjectDto,
  TimetablePeriodDto,
} from '../models/domain.models';

@Injectable({ providedIn: 'root' })
export class TeachersService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfig);
  private get api() { return this.config.apiUrl; }

  getTeachers(role = 'Teacher'): Observable<EmployeeDto[]> {
    return this.http.get<EmployeeDto[]>(`${this.api}/teachers`, { params: { role } });
  }

  hire(request: CreateTeacherRequest): Observable<CreateTeacherResponse> {
    return this.http.post<CreateTeacherResponse>(`${this.api}/teachers`, request);
  }

  getSchedule(teacherId: number): Observable<TimetablePeriodDto[]> {
    return this.http.get<TimetablePeriodDto[]>(`${this.api}/teachers/${teacherId}/schedule`);
  }

  getSubjects(): Observable<SubjectDto[]> {
    return this.http.get<SubjectDto[]>(`${this.api}/subjects`);
  }

  addPeriod(request: CreateTimetablePeriodRequest): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${this.api}/timetable`, request);
  }

  setPhoto(teacherId: number, photoUrl: string): Observable<void> {
    return this.http.put<void>(`${this.api}/teachers/${teacherId}/photo`, { photoUrl });
  }
}
