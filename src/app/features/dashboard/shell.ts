import { Component, computed, inject, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../core/models/auth.models';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles: Role[];
}

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-800">
      <!-- Mobile overlay -->
      @if (sidebarOpen()) {
        <div class="fixed inset-0 z-20 bg-slate-900/40 lg:hidden" (click)="sidebarOpen.set(false)"></div>
      }

      <!-- Sidebar -->
      <aside
        class="fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col
               transition-transform duration-200 lg:translate-x-0"
        [class.-translate-x-full]="!sidebarOpen()"
      >
        <div class="h-16 flex items-center gap-3 px-5 border-b border-slate-100">
          <div class="h-9 w-9 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
               [style.background]="'var(--brand-primary)'">
            {{ initial() }}
          </div>
          <div class="min-w-0">
            <div class="font-semibold text-slate-900 truncate text-sm">{{ auth.user()?.schoolName || 'School' }}</div>
            <div class="text-xs text-slate-400">Management</div>
          </div>
        </div>

        <nav class="flex-1 overflow-y-auto p-3 space-y-0.5">
          @for (item of visibleNav(); track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="nav-active"
              [routerLinkActiveOptions]="{ exact: item.path === '' }"
              (click)="sidebarOpen.set(false)"
              class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600
                     hover:bg-slate-100 transition-colors"
            >
              <span class="shrink-0" [innerHTML]="iconFor(item.icon)"></span>
              {{ item.label }}
            </a>
          }
        </nav>

        <div class="p-3 border-t border-slate-100">
          <div class="flex items-center gap-3 px-2 py-2">
            <div class="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
              {{ userInitial() }}
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-sm font-medium text-slate-800 truncate">{{ auth.user()?.username }}</div>
              <div class="text-xs text-slate-400">{{ auth.user()?.role }}</div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Content -->
      <div class="lg:pl-64 flex flex-col min-h-screen">
        <header class="sticky top-0 z-10 h-16 bg-white/80 backdrop-blur border-b border-slate-200 flex items-center justify-between px-4 sm:px-6">
          <button class="lg:hidden p-2 -ml-2 text-slate-500 rounded-lg hover:bg-slate-100" (click)="sidebarOpen.set(true)" aria-label="Open menu">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
          </button>
          <div class="font-semibold text-slate-900 hidden sm:block">{{ auth.user()?.schoolName }}</div>
          <div class="flex-1 lg:hidden"></div>
          <button
            (click)="logout()"
            class="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span class="hidden sm:inline">Sign out</span>
          </button>
        </header>

        <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class Shell {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);

  readonly sidebarOpen = signal(false);

  private readonly nav: NavItem[] = [
    { label: 'Overview', path: '', icon: 'home', roles: ['Principal', 'HeadMaster', 'Teacher', 'Accountant', 'Student'] },
    { label: 'Classes', path: 'classes', icon: 'classes', roles: ['Principal', 'HeadMaster', 'Teacher', 'Accountant'] },
    { label: 'Teachers', path: 'teachers', icon: 'teachers', roles: ['Principal', 'HeadMaster', 'Teacher', 'Accountant'] },
    { label: 'Students', path: 'students', icon: 'students', roles: ['Principal', 'HeadMaster', 'Teacher', 'Accountant'] },
    { label: 'Performance', path: 'performance', icon: 'chart', roles: ['Principal', 'HeadMaster', 'Teacher'] },
    { label: 'Fees', path: 'fees', icon: 'fees', roles: ['Principal', 'HeadMaster', 'Accountant'] },
    { label: 'My Results', path: 'results', icon: 'results', roles: ['Student'] },
    { label: 'My Profile', path: 'profile', icon: 'profile', roles: ['Student'] },
    { label: 'Appearance', path: 'appearance', icon: 'appearance', roles: ['Principal'] },
  ];

  readonly visibleNav = computed(() => {
    const role = this.auth.role();
    return role ? this.nav.filter((n) => n.roles.includes(role)) : [];
  });

  readonly initial = computed(() => (this.auth.user()?.schoolName || 'S').charAt(0).toUpperCase());
  readonly userInitial = computed(() => (this.auth.user()?.username || '?').charAt(0).toUpperCase());

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  private readonly iconCache = new Map<string, SafeHtml>();

  // Inline icons (trusted static SVG strings).
  iconFor(key: string): SafeHtml {
    const cached = this.iconCache.get(key);
    if (cached) return cached;
    const s = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
    const paths: Record<string, string> = {
      home: '<path d="M3 9.5 12 3l9 6.5"/><path d="M5 10v10h14V10"/>',
      classes: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
      teachers: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
      students: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
      chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
      fees: '<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>',
      results: '<path d="M9 2h6a1 1 0 0 1 1 1v1h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2V3a1 1 0 0 1 1-1z"/><path d="M9 14l2 2 4-4"/>',
      profile: '<circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>',
      appearance: '<circle cx="13.5" cy="6.5" r="2.5"/><circle cx="6.5" cy="12" r="2.5"/><circle cx="17" cy="14" r="2.5"/><path d="M12 22a10 10 0 1 1 0-20"/>',
    };
    const html = this.sanitizer.bypassSecurityTrustHtml(s + (paths[key] ?? paths['home']) + '</svg>');
    this.iconCache.set(key, html);
    return html;
  }
}
