import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from './app-config.service';
import { MediaUploadResponse } from '../models/domain.models';

@Injectable({ providedIn: 'root' })
export class MediaService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfig);
  private get api() { return this.config.apiUrl; }

  upload(file: File, folder: string): Observable<MediaUploadResponse> {
    const form = new FormData();
    form.append('File', file);
    form.append('Folder', folder);
    return this.http.post<MediaUploadResponse>(`${this.api}/media/upload`, form);
  }
}
