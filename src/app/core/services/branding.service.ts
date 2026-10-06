import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AppConfig } from './app-config.service';
import { Branding, SchoolSettings } from '../models/domain.models';

@Injectable({ providedIn: 'root' })
export class BrandingService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfig);
  private get api() { return this.config.apiUrl; }

  readonly branding = signal<Branding | null>(null);

  /** Public (pre-login) branding used to theme the login page. */
  loadBranding(): Observable<Branding> {
    return this.http.get<Branding>(`${this.api}/branding`).pipe(
      tap((b) => {
        this.branding.set(b);
        this.applyTheme(b);
      }),
    );
  }

  getSettings(): Observable<SchoolSettings> {
    return this.http.get<SchoolSettings>(`${this.api}/school-settings`);
  }

  updateSettings(settings: SchoolSettings): Observable<void> {
    return this.http.put<void>(`${this.api}/school-settings`, settings);
  }

  applyTheme(b: Branding | null): void {
    if (!b || typeof document === 'undefined') return;
    const root = document.documentElement;
    if (b.primaryColor) root.style.setProperty('--brand-primary', b.primaryColor);
    if (b.secondaryColor) root.style.setProperty('--brand-secondary', b.secondaryColor);
  }
}
