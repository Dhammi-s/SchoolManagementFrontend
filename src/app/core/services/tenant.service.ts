import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Resolves the current tenant domain. Uses the configured value when present
 * (each deployed site sets its own), otherwise falls back to the browser host.
 */
@Injectable({ providedIn: 'root' })
export class TenantService {
  get domain(): string {
    if (environment.tenantDomain && environment.tenantDomain.trim().length > 0) {
      return environment.tenantDomain.trim().toLowerCase();
    }
    return (typeof window !== 'undefined' ? window.location.hostname : '').toLowerCase();
  }
}
