import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ClassDto, CreateClassRequest } from '../models/domain.models';

@Injectable({ providedIn: 'root' })
export class ClassesService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  getAll(): Observable<ClassDto[]> {
    return this.http.get<ClassDto[]>(`${this.api}/classes`);
  }

  create(request: CreateClassRequest): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${this.api}/classes`, request);
  }
}
