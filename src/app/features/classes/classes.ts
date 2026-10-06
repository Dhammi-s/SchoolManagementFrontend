import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ClassesService } from '../../core/services/classes.service';
import { ClassDto } from '../../core/models/domain.models';

@Component({
  selector: 'app-classes',
  imports: [FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-slate-800">Classes</h2>
      </div>

      @if (auth.hasRole('Principal', 'HeadMaster')) {
        <div class="rounded-xl bg-white p-4 shadow-sm">
          <h3 class="font-semibold mb-3 text-slate-700">Add a class</h3>
          <form (ngSubmit)="add()" class="flex flex-wrap gap-3 items-end">
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">Name</label>
              <input name="name" [(ngModel)]="name" placeholder="e.g. Class 7"
                class="rounded-lg border border-slate-300 px-3 py-2" required />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">Academic year</label>
              <input name="year" [(ngModel)]="academicYear" placeholder="2025-26"
                class="rounded-lg border border-slate-300 px-3 py-2" required />
            </div>
            <button type="submit" [disabled]="saving()"
              class="rounded-lg px-4 py-2 font-medium text-white disabled:opacity-60"
              [style.background-color]="'var(--brand-primary)'">
              {{ saving() ? 'Saving…' : 'Add class' }}
            </button>
          </form>
          @if (error()) { <p class="text-sm text-red-600 mt-2">{{ error() }}</p> }
        </div>
      }

      <div class="rounded-xl bg-white shadow-sm overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th class="px-4 py-3 font-medium">Class</th>
              <th class="px-4 py-3 font-medium">Academic year</th>
              <th class="px-4 py-3 font-medium">Class incharge</th>
              <th class="px-4 py-3 font-medium text-right">Students</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (c of classes(); track c.id) {
              <tr class="hover:bg-slate-50">
                <td class="px-4 py-3 font-medium text-slate-800">{{ c.name }}</td>
                <td class="px-4 py-3 text-slate-600">{{ c.academicYear }}</td>
                <td class="px-4 py-3 text-slate-600">{{ c.classInchargeName || '—' }}</td>
                <td class="px-4 py-3 text-right text-slate-600">{{ c.studentCount }}</td>
              </tr>
            } @empty {
              <tr><td colspan="4" class="px-4 py-8 text-center text-slate-400">No classes yet.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class Classes {
  readonly auth = inject(AuthService);
  private readonly service = inject(ClassesService);

  readonly classes = signal<ClassDto[]>([]);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  name = '';
  academicYear = '';

  constructor() {
    this.load();
  }

  load() {
    this.service.getAll().subscribe({
      next: (list) => this.classes.set(list),
      error: (err) => this.error.set(err?.error?.error ?? 'Failed to load classes.'),
    });
  }

  add() {
    if (!this.name || !this.academicYear) return;
    this.saving.set(true);
    this.error.set(null);
    this.service.create({ name: this.name, academicYear: this.academicYear }).subscribe({
      next: () => {
        this.saving.set(false);
        this.name = '';
        this.academicYear = '';
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.error ?? 'Failed to add class.');
      },
    });
  }
}
