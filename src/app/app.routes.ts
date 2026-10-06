import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login').then((m) => m.Login),
  },
  {
    path: '',
    loadComponent: () => import('./features/dashboard/shell').then((m) => m.Shell),
    canActivate: [authGuard],
    children: [
      { path: '', loadComponent: () => import('./features/dashboard/overview').then((m) => m.Overview) },
      {
        path: 'classes',
        canActivate: [roleGuard('Principal', 'HeadMaster', 'Teacher', 'Accountant')],
        loadComponent: () => import('./features/classes/classes').then((m) => m.Classes),
      },
      {
        path: 'teachers',
        canActivate: [roleGuard('Principal', 'HeadMaster', 'Teacher', 'Accountant')],
        loadComponent: () => import('./features/teachers/teachers').then((m) => m.Teachers),
      },
      {
        path: 'students',
        canActivate: [roleGuard('Principal', 'HeadMaster', 'Teacher', 'Accountant')],
        loadComponent: () => import('./features/students/students').then((m) => m.Students),
      },
      {
        path: 'fees',
        canActivate: [roleGuard('Principal', 'Accountant', 'HeadMaster')],
        loadComponent: () => import('./features/fees/fees').then((m) => m.Fees),
      },
      {
        path: 'performance',
        canActivate: [roleGuard('Principal', 'HeadMaster', 'Teacher')],
        loadComponent: () => import('./features/performance/performance').then((m) => m.Performance),
      },
      {
        path: 'results',
        canActivate: [roleGuard('Student')],
        loadComponent: () => import('./features/portal/results').then((m) => m.MyResults),
      },
      {
        path: 'profile',
        canActivate: [roleGuard('Student')],
        loadComponent: () => import('./features/portal/profile').then((m) => m.MyProfile),
      },
      {
        path: 'appearance',
        canActivate: [roleGuard('Principal')],
        loadComponent: () => import('./features/appearance/appearance').then((m) => m.Appearance),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
