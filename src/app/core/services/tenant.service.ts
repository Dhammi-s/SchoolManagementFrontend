import { Injectable, inject } from '@angular/core';
import { AppConfig } from './app-config.service';

/**
 * Resolves the current tenant domain. Uses the runtime-configured value
 * (config.json / environment fallback) when present — each deployed site sets
 * its own — otherwise falls back to the browser host.
 */
@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly config = inject(AppConfig);

  get domain(): string {
    const configured = this.config.tenantDomain;
    if (configured && configured.trim().length > 0) {
      return configured.trim().toLowerCase();
    }
    return (typeof window !== 'undefined' ? window.location.hostname : '').toLowerCase();
  }
}
