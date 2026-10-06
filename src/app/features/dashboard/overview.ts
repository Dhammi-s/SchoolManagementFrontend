import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-overview',
  template: `
    <div class="space-y-6">
      <div class="rounded-xl bg-white p-6 shadow-sm">
        <h2 class="text-xl font-bold text-slate-800">
          Welcome, {{ auth.user()?.username }}
        </h2>
        <p class="text-slate-500 mt-1">
          {{ auth.user()?.schoolName }} · Role: {{ auth.user()?.role }}
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (card of cards; track card.title) {
          <div class="rounded-xl bg-white p-5 shadow-sm">
            <div class="text-sm text-slate-500">{{ card.title }}</div>
            <div class="text-2xl font-bold mt-1" [style.color]="'var(--brand-primary)'">{{ card.value }}</div>
            <div class="text-xs text-slate-400 mt-1">{{ card.hint }}</div>
          </div>
        }
      </div>
    </div>
  `,
})
export class Overview {
  readonly auth = inject(AuthService);

  readonly cards = [
    { title: 'Classes', value: '—', hint: 'Manage from the Classes tab' },
    { title: 'Students', value: '—', hint: 'Admissions & profiles' },
    { title: 'Pending fees', value: '—', hint: 'Coming next' },
  ];
}
