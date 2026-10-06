import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { TeachersService } from '../../core/services/teachers.service';
import { ClassesService } from '../../core/services/classes.service';
import { MediaService } from '../../core/services/media.service';
import {
  ClassDto,
  CreateTeacherRequest,
  CreateTimetablePeriodRequest,
  EmployeeDto,
  SubjectDto,
  TimetablePeriodDto,
} from '../../core/models/domain.models';

const DAYS = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

@Component({
  selector: 'app-teachers',
  imports: [FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-slate-800">Teachers</h2>
        @if (auth.hasRole('Principal', 'HeadMaster')) {
          <button (click)="showHire.set(!showHire())"
            class="rounded-lg px-4 py-2 text-sm font-medium text-white"
            [style.background-color]="'var(--brand-primary)'">
            {{ showHire() ? 'Close' : 'Hire teacher' }}
          </button>
        }
      </div>

      <!-- Hire form -->
      @if (showHire()) {
        <div class="rounded-xl bg-white p-5 shadow-sm">
          <h3 class="font-semibold mb-4 text-slate-700">Hire a teacher</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <label class="block"><span class="text-xs text-slate-500">Employee code *</span>
              <input [(ngModel)]="form.employeeCode" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label class="block"><span class="text-xs text-slate-500">First name *</span>
              <input [(ngModel)]="form.firstName" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label class="block"><span class="text-xs text-slate-500">Last name</span>
              <input [(ngModel)]="form.lastName" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label class="block"><span class="text-xs text-slate-500">Designation</span>
              <input [(ngModel)]="form.designation" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label class="block"><span class="text-xs text-slate-500">Email</span>
              <input [(ngModel)]="form.email" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label class="block"><span class="text-xs text-slate-500">Phone</span>
              <input [(ngModel)]="form.phone" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label class="block"><span class="text-xs text-slate-500">Qualification</span>
              <input [(ngModel)]="form.qualification" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label class="block"><span class="text-xs text-slate-500">Class incharge of</span>
              <select [(ngModel)]="form.classInchargeId" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
                <option [ngValue]="null">— none —</option>
                @for (c of classes(); track c.id) { <option [ngValue]="c.id">{{ c.name }} ({{ c.academicYear }})</option> }
              </select></label>
          </div>

          <div class="mt-4 border-t border-slate-100 pt-4">
            <label class="inline-flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" [(ngModel)]="form.createLogin" /> Create a login account
            </label>
            @if (form.createLogin) {
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                <label class="block"><span class="text-xs text-slate-500">Username</span>
                  <input [(ngModel)]="form.username" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
                <label class="block"><span class="text-xs text-slate-500">Temporary password</span>
                  <input [(ngModel)]="form.password" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
              </div>
            }
          </div>

          <div class="mt-4 flex items-center gap-3">
            <button (click)="hire()" [disabled]="saving()"
              class="rounded-lg px-5 py-2 font-medium text-white disabled:opacity-60"
              [style.background-color]="'var(--brand-primary)'">
              {{ saving() ? 'Saving…' : 'Hire' }}
            </button>
            @if (error()) { <span class="text-sm text-red-600">{{ error() }}</span> }
          </div>
        </div>
      }

      <!-- Teachers table -->
      <div class="rounded-xl bg-white shadow-sm overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th class="px-4 py-3 font-medium">Code</th>
              <th class="px-4 py-3 font-medium">Name</th>
              <th class="px-4 py-3 font-medium">Designation</th>
              <th class="px-4 py-3 font-medium">Class incharge</th>
              <th class="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (t of teachers(); track t.id) {
              <tr class="hover:bg-slate-50">
                <td class="px-4 py-3 text-slate-600">{{ t.employeeCode }}</td>
                <td class="px-4 py-3 font-medium text-slate-800">{{ t.firstName }} {{ t.lastName }}</td>
                <td class="px-4 py-3 text-slate-600">{{ t.designation || '—' }}</td>
                <td class="px-4 py-3 text-slate-600">{{ t.inchargeClasses || '—' }}</td>
                <td class="px-4 py-3 text-right">
                  <button (click)="openSchedule(t)" class="text-sm font-medium" [style.color]="'var(--brand-primary)'">Schedule</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="px-4 py-8 text-center text-slate-400">No teachers yet.</td></tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Schedule panel -->
      @if (selected()) {
        <div class="rounded-xl bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-slate-700">
              Schedule — {{ selected()!.firstName }} {{ selected()!.lastName }}
            </h3>
            <button (click)="selected.set(null)" class="text-sm text-slate-400">Close</button>
          </div>

          @if (auth.hasRole('Principal', 'HeadMaster')) {
            <div class="flex items-center gap-3 mb-4 text-sm">
              @if (selected()!.photoUrl) { <img [src]="selected()!.photoUrl" class="h-12 w-12 rounded-full object-cover" alt="" /> }
              <span class="font-medium text-slate-600">Profile photo:</span>
              <input type="file" accept="image/*" (change)="uploadPhoto($event)" class="text-sm" />
              @if (uploadingPhoto()) { <span class="text-xs text-slate-400">Uploading…</span> }
            </div>
          }

          <table class="w-full text-sm mb-4">
            <thead class="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th class="px-3 py-2 font-medium">Day</th>
                <th class="px-3 py-2 font-medium">Period</th>
                <th class="px-3 py-2 font-medium">Class</th>
                <th class="px-3 py-2 font-medium">Subject</th>
                <th class="px-3 py-2 font-medium">Time</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (p of schedule(); track p.id) {
                <tr>
                  <td class="px-3 py-2">{{ dayName(p.dayOfWeek) }}</td>
                  <td class="px-3 py-2">{{ p.periodNumber }}</td>
                  <td class="px-3 py-2">{{ p.className }}</td>
                  <td class="px-3 py-2">{{ p.subjectName }}</td>
                  <td class="px-3 py-2">{{ p.startTime }}–{{ p.endTime }}</td>
                </tr>
              } @empty {
                <tr><td colspan="5" class="px-3 py-6 text-center text-slate-400">No periods scheduled.</td></tr>
              }
            </tbody>
          </table>

          @if (auth.hasRole('Principal', 'HeadMaster')) {
            <div class="border-t border-slate-100 pt-4">
              <h4 class="text-sm font-semibold text-slate-600 mb-2">Add a period</h4>
              <div class="flex flex-wrap gap-2 items-end">
                <select [(ngModel)]="period.classId" class="rounded-lg border border-slate-300 px-2 py-2 text-sm">
                  <option [ngValue]="0">Class</option>
                  @for (c of classes(); track c.id) { <option [ngValue]="c.id">{{ c.name }}</option> }
                </select>
                <select [(ngModel)]="period.subjectId" class="rounded-lg border border-slate-300 px-2 py-2 text-sm">
                  <option [ngValue]="0">Subject</option>
                  @for (s of subjects(); track s.id) { <option [ngValue]="s.id">{{ s.name }}</option> }
                </select>
                <select [(ngModel)]="period.dayOfWeek" class="rounded-lg border border-slate-300 px-2 py-2 text-sm">
                  @for (d of [1,2,3,4,5,6]; track d) { <option [ngValue]="d">{{ dayName(d) }}</option> }
                </select>
                <input type="number" [(ngModel)]="period.periodNumber" placeholder="Period #" class="w-24 rounded-lg border border-slate-300 px-2 py-2 text-sm" />
                <input type="time" [(ngModel)]="period.startTime" class="rounded-lg border border-slate-300 px-2 py-2 text-sm" />
                <input type="time" [(ngModel)]="period.endTime" class="rounded-lg border border-slate-300 px-2 py-2 text-sm" />
                <button (click)="addPeriod()" [disabled]="savingPeriod()"
                  class="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                  [style.background-color]="'var(--brand-primary)'">Add</button>
              </div>
              @if (periodError()) { <p class="text-sm text-red-600 mt-2">{{ periodError() }}</p> }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class Teachers {
  readonly auth = inject(AuthService);
  private readonly service = inject(TeachersService);
  private readonly classesService = inject(ClassesService);
  private readonly media = inject(MediaService);

  readonly teachers = signal<EmployeeDto[]>([]);
  readonly classes = signal<ClassDto[]>([]);
  readonly subjects = signal<SubjectDto[]>([]);
  readonly selected = signal<EmployeeDto | null>(null);
  readonly schedule = signal<TimetablePeriodDto[]>([]);

  readonly showHire = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly savingPeriod = signal(false);
  readonly periodError = signal<string | null>(null);
  readonly uploadingPhoto = signal(false);

  form: CreateTeacherRequest = this.blankForm();
  period: CreateTimetablePeriodRequest = this.blankPeriod();

  constructor() {
    this.loadTeachers();
    this.classesService.getAll().subscribe({ next: (c) => this.classes.set(c), error: () => {} });
    this.service.getSubjects().subscribe({ next: (s) => this.subjects.set(s), error: () => {} });
  }

  dayName(d: number) {
    return DAYS[d] ?? String(d);
  }

  loadTeachers() {
    this.service.getTeachers().subscribe({ next: (t) => this.teachers.set(t), error: () => {} });
  }

  hire() {
    if (!this.form.employeeCode || !this.form.firstName) {
      this.error.set('Employee code and first name are required.');
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    this.service.hire(this.form).subscribe({
      next: () => {
        this.saving.set(false);
        this.showHire.set(false);
        this.form = this.blankForm();
        this.loadTeachers();
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.error ?? 'Failed to hire teacher.');
      },
    });
  }

  openSchedule(t: EmployeeDto) {
    this.selected.set(t);
    this.period = this.blankPeriod();
    this.period.teacherEmployeeId = t.id;
    this.service.getSchedule(t.id).subscribe({ next: (s) => this.schedule.set(s), error: () => {} });
  }

  addPeriod() {
    const p = this.period;
    if (!p.classId || !p.subjectId || !p.periodNumber || !p.startTime || !p.endTime) {
      this.periodError.set('Fill class, subject, period and times.');
      return;
    }
    this.savingPeriod.set(true);
    this.periodError.set(null);
    this.service.addPeriod({ ...p, startTime: this.toTimeSpan(p.startTime), endTime: this.toTimeSpan(p.endTime) }).subscribe({
      next: () => {
        this.savingPeriod.set(false);
        if (this.selected()) this.openSchedule(this.selected()!);
      },
      error: (err) => {
        this.savingPeriod.set(false);
        this.periodError.set(err?.error?.error ?? 'Failed to add period.');
      },
    });
  }

  // HTML time input gives "HH:mm"; the API expects "HH:mm:ss".
  private toTimeSpan(hhmm: string): string {
    return hhmm.length === 5 ? `${hhmm}:00` : hhmm;
  }

  uploadPhoto(event: Event) {
    const t = this.selected();
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!t || !file) return;
    this.uploadingPhoto.set(true);
    this.media.upload(file, 'staff').subscribe({
      next: (res) => this.service.setPhoto(t.id, res.url).subscribe({
        next: () => { this.uploadingPhoto.set(false); this.selected.set({ ...t, photoUrl: res.url }); this.loadTeachers(); },
        error: () => this.uploadingPhoto.set(false),
      }),
      error: () => this.uploadingPhoto.set(false),
    });
  }

  private blankForm(): CreateTeacherRequest {
    return { employeeCode: '', firstName: '', roleName: 'Teacher', classInchargeId: null, createLogin: false };
  }

  private blankPeriod(): CreateTimetablePeriodRequest {
    return { classId: 0, subjectId: 0, teacherEmployeeId: 0, dayOfWeek: 1, periodNumber: 1, startTime: '', endTime: '' };
  }
}
