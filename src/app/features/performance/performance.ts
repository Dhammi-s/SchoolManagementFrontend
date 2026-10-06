import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { PerformanceService } from '../../core/services/performance.service';
import { ClassesService } from '../../core/services/classes.service';
import { TeachersService } from '../../core/services/teachers.service';
import {
  ClassDto,
  CreatePerformanceTestRequest,
  EmployeeDto,
  PerformanceTest,
  SubjectDto,
  TestResultRow,
} from '../../core/models/domain.models';

@Component({
  selector: 'app-performance',
  imports: [FormsModule, DatePipe],
  template: `
    <div class="space-y-6">
      <h2 class="text-xl font-bold text-slate-800">Performance & Results</h2>

      <!-- Create test -->
      <div class="rounded-xl bg-white p-5 shadow-sm">
        <h3 class="font-semibold mb-3 text-slate-700">New test</h3>
        <div class="flex flex-wrap gap-2 items-end">
          <select [(ngModel)]="form.classId" class="rounded-lg border border-slate-300 px-2 py-2 text-sm">
            <option [ngValue]="0">Class</option>
            @for (c of classes(); track c.id) { <option [ngValue]="c.id">{{ c.name }}</option> }
          </select>
          <select [(ngModel)]="form.subjectId" class="rounded-lg border border-slate-300 px-2 py-2 text-sm">
            <option [ngValue]="0">Subject</option>
            @for (s of subjects(); track s.id) { <option [ngValue]="s.id">{{ s.name }}</option> }
          </select>
          <select [(ngModel)]="form.teacherEmployeeId" class="rounded-lg border border-slate-300 px-2 py-2 text-sm">
            <option [ngValue]="0">Teacher</option>
            @for (t of teachers(); track t.id) { <option [ngValue]="t.id">{{ t.firstName }} {{ t.lastName }}</option> }
          </select>
          <input [(ngModel)]="form.title" placeholder="Title" class="rounded-lg border border-slate-300 px-2 py-2 text-sm" />
          <input type="date" [(ngModel)]="form.testDate" class="rounded-lg border border-slate-300 px-2 py-2 text-sm" />
          <input type="number" [(ngModel)]="form.maxMarks" placeholder="Max" class="w-24 rounded-lg border border-slate-300 px-2 py-2 text-sm" />
          <button (click)="createTest()" class="rounded-lg px-4 py-2 text-sm font-medium text-white" [style.background-color]="'var(--brand-primary)'">Create</button>
        </div>
      </div>

      <!-- Tests list -->
      <div class="rounded-xl bg-white shadow-sm overflow-hidden">
        <div class="px-4 py-3 border-b border-slate-100 font-semibold text-slate-700">Tests</div>
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-slate-500 text-left">
            <tr><th class="px-4 py-2 font-medium">Title</th><th class="px-4 py-2 font-medium">Class</th>
            <th class="px-4 py-2 font-medium">Subject</th><th class="px-4 py-2 font-medium">Date</th>
            <th class="px-4 py-2 font-medium text-right">Max</th><th class="px-4 py-2"></th></tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (t of tests(); track t.id) {
              <tr class="hover:bg-slate-50">
                <td class="px-4 py-2 font-medium text-slate-800">{{ t.title }}</td>
                <td class="px-4 py-2 text-slate-600">{{ t.className }}</td>
                <td class="px-4 py-2 text-slate-600">{{ t.subjectName }}</td>
                <td class="px-4 py-2 text-slate-600">{{ t.testDate | date:'mediumDate' }}</td>
                <td class="px-4 py-2 text-right">{{ t.maxMarks }}</td>
                <td class="px-4 py-2 text-right"><button (click)="openResults(t)" class="text-sm font-medium" [style.color]="'var(--brand-primary)'">Enter marks</button></td>
              </tr>
            } @empty { <tr><td colspan="6" class="px-4 py-6 text-center text-slate-400">No tests yet.</td></tr> }
          </tbody>
        </table>
      </div>

      <!-- Marks entry -->
      @if (selected(); as t) {
        <div class="rounded-xl bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-slate-700">{{ t.title }} — {{ t.className }} / {{ t.subjectName }} (max {{ t.maxMarks }})</h3>
            <button (click)="selected.set(null)" class="text-sm text-slate-400">Close</button>
          </div>
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-500 text-left">
              <tr><th class="px-3 py-2 font-medium">Roll</th><th class="px-3 py-2 font-medium">Student</th>
              <th class="px-3 py-2 font-medium">Marks</th><th class="px-3 py-2 font-medium">Grade</th>
              <th class="px-3 py-2 font-medium">Remarks</th><th class="px-3 py-2"></th></tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (r of rows(); track r.studentId) {
                <tr>
                  <td class="px-3 py-2 text-slate-600">{{ r.rollNumber || '—' }}</td>
                  <td class="px-3 py-2 font-medium text-slate-800">{{ r.studentName }}</td>
                  <td class="px-3 py-2"><input type="number" [(ngModel)]="r.marksObtained" class="w-20 rounded border border-slate-300 px-2 py-1" /></td>
                  <td class="px-3 py-2"><input [(ngModel)]="r.grade" class="w-16 rounded border border-slate-300 px-2 py-1" /></td>
                  <td class="px-3 py-2"><input [(ngModel)]="r.remarks" class="w-full rounded border border-slate-300 px-2 py-1" /></td>
                  <td class="px-3 py-2 text-right"><button (click)="save(r)" class="rounded px-2 py-1 text-xs font-medium text-white" [style.background-color]="'var(--brand-primary)'">Save</button></td>
                </tr>
              } @empty { <tr><td colspan="6" class="px-3 py-6 text-center text-slate-400">No students in this class.</td></tr> }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class Performance {
  readonly auth = inject(AuthService);
  private readonly service = inject(PerformanceService);
  private readonly classesService = inject(ClassesService);
  private readonly teachersService = inject(TeachersService);

  readonly classes = signal<ClassDto[]>([]);
  readonly subjects = signal<SubjectDto[]>([]);
  readonly teachers = signal<EmployeeDto[]>([]);
  readonly tests = signal<PerformanceTest[]>([]);
  readonly selected = signal<PerformanceTest | null>(null);
  readonly rows = signal<TestResultRow[]>([]);

  form: CreatePerformanceTestRequest = this.blank();

  constructor() {
    this.classesService.getAll().subscribe({ next: (c) => this.classes.set(c), error: () => {} });
    this.teachersService.getSubjects().subscribe({ next: (s) => this.subjects.set(s), error: () => {} });
    this.teachersService.getTeachers().subscribe({
      next: (t) => {
        this.teachers.set(t);
        const myId = this.auth.user()?.employeeId;
        if (myId) this.form.teacherEmployeeId = myId;
      },
      error: () => {},
    });
    this.loadTests();
  }

  loadTests() {
    this.service.getTests().subscribe({ next: (t) => this.tests.set(t), error: () => {} });
  }

  createTest() {
    if (!this.form.classId || !this.form.subjectId || !this.form.teacherEmployeeId || !this.form.title || !this.form.testDate) return;
    this.service.createTest(this.form).subscribe({
      next: () => { this.form = this.blank(); this.loadTests(); },
    });
  }

  openResults(t: PerformanceTest) {
    this.selected.set(t);
    this.service.getResults(t.id).subscribe({ next: (r) => this.rows.set(r), error: () => {} });
  }

  save(r: TestResultRow) {
    const t = this.selected();
    if (!t) return;
    this.service.saveResult(t.id, r.studentId, r.marksObtained ?? null, r.grade ?? null, r.remarks ?? null).subscribe();
  }

  private blank(): CreatePerformanceTestRequest {
    return { classId: 0, subjectId: 0, teacherEmployeeId: 0, title: '', testDate: '', maxMarks: 100 };
  }
}
