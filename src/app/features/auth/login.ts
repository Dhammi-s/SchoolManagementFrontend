import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BrandingService } from '../../core/services/branding.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  template: `
    <div
      class="min-h-screen flex items-center justify-center bg-slate-100 bg-cover bg-center p-4"
      [style.background-image]="bgImage()"
    >
      <div class="w-full max-w-md rounded-2xl bg-white/95 shadow-xl backdrop-blur p-8">
        <div class="text-center mb-6">
          @if (branding.branding()?.logoUrl) {
            <img [src]="branding.branding()!.logoUrl" alt="logo" class="mx-auto h-16 w-16 rounded-full object-cover mb-3" />
          }
          <h1 class="text-2xl font-bold" [style.color]="'var(--brand-secondary)'">
            {{ branding.branding()?.loginTitle || branding.branding()?.schoolName || 'School Management' }}
          </h1>
          <p class="text-sm text-slate-500 mt-1">
            {{ branding.branding()?.loginSubtitle || 'Sign in to continue' }}
          </p>
        </div>

        <form (ngSubmit)="submit()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input
              name="username"
              [(ngModel)]="username"
              autocomplete="username"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              name="password"
              type="password"
              [(ngModel)]="password"
              autocomplete="current-password"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          @if (error()) {
            <p class="text-sm text-red-600">{{ error() }}</p>
          }

          <button
            type="submit"
            [disabled]="loading()"
            class="w-full rounded-lg py-2.5 font-semibold text-white transition disabled:opacity-60"
            [style.background-color]="'var(--brand-primary)'"
          >
            {{ loading() ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>
      </div>
    </div>
  `,
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly branding = inject(BrandingService);

  username = '';
  password = '';
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.branding.loadBranding().subscribe({ error: () => {} });
  }

  bgImage() {
    const url = this.branding.branding()?.loginBackgroundUrl;
    return url ? `url('${url}')` : 'none';
  }

  submit() {
    this.error.set(null);
    this.loading.set(true);
    this.auth.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.error ?? 'Sign in failed. Check your credentials.');
      },
    });
  }
}
