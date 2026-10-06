import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../core/models/auth.models';

interface QuickLink { label: string; path: string; desc: string; roles: Role[]; }

@Component({
  selector: 'app-overview',
  imports: [RouterLink],
  template: `
    <div class="space-y-8">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">
          {{ greeting() }}, {{ auth.user()?.username }}
        </h1>
        <p class="text-slate-500 mt-1">{{ auth.user()?.schoolName }} · {{ auth.user()?.role }}</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (l of links(); track l.path) {
          <a [routerLink]="l.path"
             class="group rounded-2xl bg-white border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition">
            <div class="flex items-center justify-between">
              <div class="h-10 w-10 rounded-xl flex items-center justify-center text-white"
                   [style.background]="'var(--brand-primary)'">
                <span class="font-bold">{{ l.label.charAt(0) }}</span>
              </div>
              <svg class="text-slate-300 group-hover:text-slate-400 transition" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </div>
            <div class="mt-4 font-semibold text-slate-900">{{ l.label }}</div>
            <div class="text-sm text-slate-500 mt-0.5">{{ l.desc }}</div>
          </a>
        }
      </div>
    </div>
  `,
})
export class Overview {
  readonly auth = inject(AuthService);

  private readonly all: QuickLink[] = [
    { label: 'Classes', path: '/classes', desc: 'Classes, sections & incharge', roles: ['Principal', 'HeadMaster', 'Teacher', 'Accountant'] },
    { label: 'Teachers', path: '/teachers', desc: 'Hire staff & set schedules', roles: ['Principal', 'HeadMaster', 'Teacher', 'Accountant'] },
    { label: 'Students', path: '/students', desc: 'Admissions & profiles', roles: ['Principal', 'HeadMaster', 'Teacher', 'Accountant'] },
    { label: 'Performance', path: '/performance', desc: 'Tests & results', roles: ['Principal', 'HeadMaster', 'Teacher'] },
    { label: 'Fees', path: '/fees', desc: 'Structures & pending fees', roles: ['Principal', 'HeadMaster', 'Accountant'] },
    { label: 'My Results', path: '/results', desc: 'Your test results', roles: ['Student'] },
    { label: 'My Profile', path: '/profile', desc: 'Your details & fees', roles: ['Student'] },
    { label: 'Appearance', path: '/appearance', desc: 'Customize your school theme', roles: ['Principal'] },
  ];

  readonly links = computed(() => {
    const role = this.auth.role();
    return role ? this.all.filter((l) => l.roles.includes(role)) : [];
  });

  greeting() {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  }
}
