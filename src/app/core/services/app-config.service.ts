import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface RuntimeConfig {
  apiUrl: string;
  tenantDomain: string;
}

/**
 * Runtime configuration, loaded from /config.json at app startup.
 *
 * This lets each deployed site set its own apiUrl / tenantDomain WITHOUT
 * rebuilding — just edit config.json in the deployed folder. The values in
 * environment.ts are used as fallbacks (and for local dev if the file is absent).
 */
@Injectable({ providedIn: 'root' })
export class AppConfig {
  private config: RuntimeConfig = {
    apiUrl: environment.apiUrl,
    tenantDomain: environment.tenantDomain,
  };

  get apiUrl(): string {
    return this.config.apiUrl;
  }

  get tenantDomain(): string {
    return this.config.tenantDomain;
  }

  /** Called once at startup (APP_INITIALIZER) before any component/service runs. */
  async load(): Promise<void> {
    try {
      const res = await fetch('config.json', { cache: 'no-store' });
      if (res.ok) {
        const json = (await res.json()) as Partial<RuntimeConfig>;
        this.config = {
          apiUrl: json.apiUrl?.trim() || this.config.apiUrl,
          tenantDomain: json.tenantDomain ?? this.config.tenantDomain,
        };
      }
    } catch {
      // Network/parse error — keep environment.ts defaults.
    }
  }
}
