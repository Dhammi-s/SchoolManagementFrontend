import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../core/models/auth.models';

interface NavItem {
  label: string;
  path: string;
  roles: Role[];
}

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="min-h-screen flex bg-slate-100 text-slate-800">
      <!-- Sidebar -->
      <aside class="w-64 shrink-0 text-white flex flex-col" [style.background-color]="'var(--brand-secondary)'">
        <div class="h-16 flex items-center px-6 text-lg font-bold border-b border-white/10">
          {{ auth.user()?.schoolName || 'School' }}
        </div>
        <nav class="flex-1 p-3 space-y-1">
          @for (item of visibleNav(); track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-white/15"
              [routerLinkActiveOptions]="{ exact: item.path === '' }"
              class="block rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-white/10 transition"
            >
              {{ item.label }}
            </a>
          }
        </nav>
        <div class="p-3 border-t border-white/10 text-xs text-white/60">
          {{ auth.user()?.username }} · {{ auth.user()?.role }}
        </div>
      </aside>

      <!-- Main -->
      <div class="flex-1 flex flex-col min-w-0">
        <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <h1 class="font-semibold" [style.color]="'var(--brand-secondary)'">Dashboard</h1>
          <button
            (click)="logout()"
            class="rounded-lg px-4 py-2 text-sm font-medium text-white"
            [style.background-color]="'var(--brand-primary)'"
          >
            Sign out
          </button>
        </header>
        <main class="flex-1 overflow-auto p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class Shell {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private readonly nav: NavItem[] = [
    { label: 'Overview', path: '', roles: ['Principal', 'HeadMaster', 'Teacher', 'Accountant', 'Student'] },
    { label: 'Classes', path: 'classes', roles: ['Principal', 'HeadMaster', 'Teacher', 'Accountant'] },
    { label: 'Teachers', path: 'teachers', roles: ['Principal', 'HeadMaster', 'Teacher', 'Accountant'] },
    { label: 'Students', path: 'students', roles: ['Principal', 'HeadMaster', 'Teacher', 'Accountant'] },
    { label: 'Performance', path: 'performance', roles: ['Principal', 'HeadMaster', 'Teacher'] },
    { label: 'Fees', path: 'fees', roles: ['Principal', 'HeadMaster', 'Accountant'] },
    { label: 'My Results', path: 'results', roles: ['Student'] },
    { label: 'My Profile', path: 'profile', roles: ['Student'] },
    { label: 'Appearance', path: 'appearance', roles: ['Principal'] },
  ];

  readonly visibleNav = computed(() => {
    const role = this.auth.role();
    if (!role) return [];
    return this.nav.filter((n) => n.roles.includes(role));
  });

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
