import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BrandingService } from '../../core/services/branding.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  template: `
    <div class="min-h-screen grid lg:grid-cols-2 bg-white">
      <!-- Brand panel -->
      <div
        class="relative hidden lg:flex flex-col justify-between p-12 text-white bg-cover bg-center overflow-hidden"
        [style.background-image]="panelBg()"
      >
        @if (bgImage() !== 'none') {
          <div class="absolute inset-0 bg-slate-900/55"></div>
        }
        <div class="relative flex items-center gap-3">
          @if (branding.branding()?.logoUrl) {
            <img [src]="branding.branding()!.logoUrl" alt="logo" class="h-11 w-11 rounded-xl object-cover" />
          } @else {
            <div class="h-11 w-11 rounded-xl bg-white/20 flex items-center justify-center font-bold text-lg">
              {{ (branding.branding()?.schoolName || 'S').charAt(0) }}
            </div>
          }
          <span class="font-semibold text-lg">{{ branding.branding()?.schoolName || 'School Management' }}</span>
        </div>
        <div class="relative">
          <h2 class="text-4xl font-extrabold leading-tight">{{ branding.branding()?.loginTitle || 'Welcome back' }}</h2>
          <p class="mt-3 text-white/80 max-w-sm">{{ branding.branding()?.loginSubtitle || 'Manage classes, students, staff and more — all in one place.' }}</p>
        </div>
        <div class="relative text-sm text-white/60">© {{ year }} {{ branding.branding()?.schoolName || 'School Management' }}</div>
      </div>

      <!-- Form panel -->
      <div class="flex items-center justify-center p-6 sm:p-10">
        <div class="w-full max-w-sm">
          <div class="lg:hidden flex items-center gap-3 mb-8">
            @if (branding.branding()?.logoUrl) {
              <img [src]="branding.branding()!.logoUrl" alt="logo" class="h-10 w-10 rounded-xl object-cover" />
            } @else {
              <div class="h-10 w-10 rounded-xl flex items-center justify-center font-bold text-white" [style.background]="'var(--brand-primary)'">
                {{ (branding.branding()?.schoolName || 'S').charAt(0) }}
              </div>
            }
            <span class="font-semibold text-slate-900">{{ branding.branding()?.schoolName || 'School Management' }}</span>
          </div>

          <h1 class="text-2xl font-bold text-slate-900">Sign in</h1>
          <p class="text-sm text-slate-500 mt-1 mb-8">Enter your credentials to access your account.</p>

          <form (ngSubmit)="submit()" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
              <input
                name="username"
                [(ngModel)]="username"
                autocomplete="username"
                placeholder="your username"
                class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm transition"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                name="password"
                type="password"
                [(ngModel)]="password"
                autocomplete="current-password"
                placeholder="••••••••"
                class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm transition"
                required
              />
            </div>

            @if (error()) {
              <div class="rounded-xl bg-red-50 border border-red-100 px-3.5 py-2.5 text-sm text-red-600">{{ error() }}</div>
            }

            <button
              type="submit"
              [disabled]="loading()"
              class="w-full rounded-xl py-3 font-semibold text-white transition hover:opacity-95 active:scale-[.99] disabled:opacity-60"
              [style.background-color]="'var(--brand-primary)'"
            >
              {{ loading() ? 'Signing in…' : 'Sign in' }}
            </button>
          </form>
        </div>
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
  readonly year = new Date().getFullYear();
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  brandGradient(): string {
    return 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)';
  }

  /** Background image for the brand panel: the configured image, else the brand gradient. */
  panelBg(): string {
    return this.bgImage() !== 'none' ? this.bgImage() : this.brandGradient();
  }

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
