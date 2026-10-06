import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrandingService } from '../../core/services/branding.service';
import { SchoolSettings } from '../../core/models/domain.models';

@Component({
  selector: 'app-appearance',
  imports: [FormsModule],
  template: `
    <div class="max-w-2xl space-y-6">
      <h2 class="text-xl font-bold text-slate-800">Appearance</h2>
      <p class="text-sm text-slate-500">
        Customize the login page and theme for your school. Changes apply to everyone at this school.
      </p>

      <div class="rounded-xl bg-white p-6 shadow-sm space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">School name</label>
          <input [(ngModel)]="model.schoolName" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Primary color</label>
            <input type="color" [(ngModel)]="model.primaryColor" class="h-10 w-full rounded-lg border border-slate-300" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Secondary color</label>
            <input type="color" [(ngModel)]="model.secondaryColor" class="h-10 w-full rounded-lg border border-slate-300" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Logo URL</label>
          <input [(ngModel)]="model.logoUrl" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Login background URL</label>
          <input [(ngModel)]="model.loginBackgroundUrl" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Login title</label>
          <input [(ngModel)]="model.loginTitle" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Login subtitle</label>
          <input [(ngModel)]="model.loginSubtitle" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </div>

        <div class="flex items-center gap-3 pt-2">
          <button (click)="save()" [disabled]="saving()"
            class="rounded-lg px-5 py-2 font-medium text-white disabled:opacity-60"
            [style.background-color]="'var(--brand-primary)'">
            {{ saving() ? 'Saving…' : 'Save changes' }}
          </button>
          @if (saved()) { <span class="text-sm text-green-600">Saved.</span> }
          @if (error()) { <span class="text-sm text-red-600">{{ error() }}</span> }
        </div>
      </div>
    </div>
  `,
})
export class Appearance {
  private readonly branding = inject(BrandingService);

  model: SchoolSettings = { primaryColor: '#2563eb', secondaryColor: '#1e293b' };
  readonly saving = signal(false);
  readonly saved = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.branding.getSettings().subscribe({
      next: (s) => (this.model = { ...this.model, ...s }),
      error: () => {},
    });
  }

  save() {
    this.saving.set(true);
    this.saved.set(false);
    this.error.set(null);
    this.branding.updateSettings(this.model).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
        this.branding.applyTheme(this.model);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.error ?? 'Failed to save.');
      },
    });
  }
}
