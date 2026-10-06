import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { FeesService } from '../../core/services/fees.service';
import { ClassesService } from '../../core/services/classes.service';
import { StudentsService } from '../../core/services/students.service';
import {
  ClassDto,
  CreateFeeStructureRequest,
  FeeStructure,
  PendingFee,
  StudentFee,
  StudentListItem,
} from '../../core/models/domain.models';

@Component({
  selector: 'app-fees',
  imports: [FormsModule, DecimalPipe],
  template: `
    <div class="space-y-6">
      <h2 class="text-xl font-bold text-slate-800">Fees</h2>

      <!-- Pending fees -->
      <div class="rounded-xl bg-white shadow-sm overflow-hidden">
        <div class="px-4 py-3 border-b border-slate-100 font-semibold text-slate-700">Pending fees</div>
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-slate-500 text-left">
            <tr><th class="px-4 py-2 font-medium">Adm #</th><th class="px-4 py-2 font-medium">Student</th>
            <th class="px-4 py-2 font-medium">Class</th><th class="px-4 py-2 font-medium text-right">Pending</th></tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (p of pending(); track p.studentId) {
              <tr><td class="px-4 py-2 text-slate-600">{{ p.admissionNumber }}</td>
              <td class="px-4 py-2 font-medium text-slate-800">{{ p.studentName }}</td>
              <td class="px-4 py-2 text-slate-600">{{ p.className || '—' }}</td>
              <td class="px-4 py-2 text-right text-red-600">{{ p.pendingAmount | number:'1.2-2' }}</td></tr>
            } @empty { <tr><td colspan="4" class="px-4 py-6 text-center text-slate-400">No pending fees.</td></tr> }
          </tbody>
        </table>
      </div>

      <!-- Fee structures -->
      @if (auth.hasRole('Principal', 'Accountant')) {
        <div class="rounded-xl bg-white p-5 shadow-sm">
          <h3 class="font-semibold mb-3 text-slate-700">Fee structures</h3>
          <div class="flex flex-wrap gap-2 items-end mb-4">
            <select [(ngModel)]="fsForm.classId" class="rounded-lg border border-slate-300 px-2 py-2 text-sm">
              <option [ngValue]="null">All classes</option>
              @for (c of classes(); track c.id) { <option [ngValue]="c.id">{{ c.name }}</option> }
            </select>
            <input [(ngModel)]="fsForm.title" placeholder="Title (e.g. Tuition Term 1)" class="rounded-lg border border-slate-300 px-2 py-2 text-sm" />
            <input [(ngModel)]="fsForm.academicYear" placeholder="2025-26" class="w-28 rounded-lg border border-slate-300 px-2 py-2 text-sm" />
            <input type="number" [(ngModel)]="fsForm.amount" placeholder="Amount" class="w-28 rounded-lg border border-slate-300 px-2 py-2 text-sm" />
            <input type="date" [(ngModel)]="fsForm.dueDate" class="rounded-lg border border-slate-300 px-2 py-2 text-sm" />
            <button (click)="createStructure()" class="rounded-lg px-4 py-2 text-sm font-medium text-white" [style.background-color]="'var(--brand-primary)'">Add</button>
          </div>
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-500 text-left">
              <tr><th class="px-3 py-2 font-medium">Title</th><th class="px-3 py-2 font-medium">Class</th>
              <th class="px-3 py-2 font-medium">Year</th><th class="px-3 py-2 font-medium text-right">Amount</th></tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (f of structures(); track f.id) {
                <tr><td class="px-3 py-2">{{ f.title }}</td><td class="px-3 py-2">{{ f.className || 'All' }}</td>
                <td class="px-3 py-2">{{ f.academicYear }}</td><td class="px-3 py-2 text-right">{{ f.amount | number:'1.2-2' }}</td></tr>
              } @empty { <tr><td colspan="4" class="px-3 py-6 text-center text-slate-400">No structures.</td></tr> }
            </tbody>
          </table>
        </div>

        <!-- Per-student fees -->
        <div class="rounded-xl bg-white p-5 shadow-sm">
          <h3 class="font-semibold mb-3 text-slate-700">Student fees</h3>
          <div class="flex flex-wrap gap-2 items-center mb-4">
            <select [(ngModel)]="pickStudentId" (ngModelChange)="loadStudentFees($event)" class="rounded-lg border border-slate-300 px-2 py-2 text-sm">
              <option [ngValue]="null">Select a student</option>
              @for (s of students(); track s.id) { <option [ngValue]="s.id">{{ s.firstName }} {{ s.lastName }} ({{ s.admissionNumber }})</option> }
            </select>
            @if (pickStudentId) {
              <select [(ngModel)]="assignStructureId" class="rounded-lg border border-slate-300 px-2 py-2 text-sm">
                <option [ngValue]="null">Assign a structure…</option>
                @for (f of structures(); track f.id) { <option [ngValue]="f.id">{{ f.title }} ({{ f.amount | number:'1.0-0' }})</option> }
              </select>
              <button (click)="assign()" class="rounded-lg px-3 py-2 text-sm font-medium text-white" [style.background-color]="'var(--brand-primary)'">Assign</button>
            }
          </div>
          @if (pickStudentId) {
            <table class="w-full text-sm">
              <thead class="bg-slate-50 text-slate-500 text-left">
                <tr><th class="px-3 py-2 font-medium">Title</th><th class="px-3 py-2 font-medium text-right">Due</th>
                <th class="px-3 py-2 font-medium text-right">Paid</th><th class="px-3 py-2 font-medium text-right">Balance</th>
                <th class="px-3 py-2 font-medium">Status</th><th class="px-3 py-2 font-medium"></th></tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (sf of studentFees(); track sf.id) {
                  <tr>
                    <td class="px-3 py-2">{{ sf.title }}</td>
                    <td class="px-3 py-2 text-right">{{ sf.amountDue | number:'1.2-2' }}</td>
                    <td class="px-3 py-2 text-right">{{ sf.amountPaid | number:'1.2-2' }}</td>
                    <td class="px-3 py-2 text-right" [class.text-red-600]="sf.balance > 0">{{ sf.balance | number:'1.2-2' }}</td>
                    <td class="px-3 py-2">{{ sf.status }}</td>
                    <td class="px-3 py-2 text-right">
                      @if (sf.balance > 0) {
                        <span class="inline-flex gap-1 items-center">
                          <input type="number" [(ngModel)]="payAmounts[sf.id]" placeholder="Amt" class="w-20 rounded border border-slate-300 px-2 py-1 text-xs" />
                          <button (click)="pay(sf)" class="rounded px-2 py-1 text-xs font-medium text-white" [style.background-color]="'var(--brand-primary)'">Pay</button>
                        </span>
                      }
                    </td>
                  </tr>
                } @empty { <tr><td colspan="6" class="px-3 py-6 text-center text-slate-400">No fees assigned.</td></tr> }
              </tbody>
            </table>
          }
        </div>
      }
    </div>
  `,
})
export class Fees {
  readonly auth = inject(AuthService);
  private readonly feesService = inject(FeesService);
  private readonly classesService = inject(ClassesService);
  private readonly studentsService = inject(StudentsService);

  readonly pending = signal<PendingFee[]>([]);
  readonly structures = signal<FeeStructure[]>([]);
  readonly classes = signal<ClassDto[]>([]);
  readonly students = signal<StudentListItem[]>([]);
  readonly studentFees = signal<StudentFee[]>([]);

  fsForm: CreateFeeStructureRequest = { academicYear: '2025-26', title: '', amount: 0, classId: null, dueDate: null };
  pickStudentId: number | null = null;
  assignStructureId: number | null = null;
  payAmounts: Record<number, number> = {};

  constructor() {
    this.loadPending();
    this.classesService.getAll().subscribe({ next: (c) => this.classes.set(c), error: () => {} });
    if (this.auth.hasRole('Principal', 'Accountant')) {
      this.feesService.getStructures().subscribe({ next: (s) => this.structures.set(s), error: () => {} });
      this.studentsService.list().subscribe({ next: (s) => this.students.set(s), error: () => {} });
    }
  }

  loadPending() {
    this.feesService.getPending().subscribe({ next: (p) => this.pending.set(p), error: () => {} });
  }

  createStructure() {
    if (!this.fsForm.title || !this.fsForm.amount) return;
    this.feesService.createStructure(this.fsForm).subscribe({
      next: () => {
        this.fsForm = { academicYear: this.fsForm.academicYear, title: '', amount: 0, classId: null, dueDate: null };
        this.feesService.getStructures().subscribe((s) => this.structures.set(s));
      },
    });
  }

  loadStudentFees(studentId: number | null) {
    if (!studentId) { this.studentFees.set([]); return; }
    this.feesService.getByStudent(studentId).subscribe({ next: (f) => this.studentFees.set(f), error: () => {} });
  }

  assign() {
    if (!this.pickStudentId || !this.assignStructureId) return;
    this.feesService.assign(this.pickStudentId, this.assignStructureId).subscribe({
      next: () => { this.assignStructureId = null; this.loadStudentFees(this.pickStudentId); },
    });
  }

  pay(sf: StudentFee) {
    const amount = this.payAmounts[sf.id];
    if (!amount || amount <= 0) return;
    this.feesService.recordPayment(sf.id, amount).subscribe({
      next: () => {
        this.payAmounts[sf.id] = 0;
        this.loadStudentFees(this.pickStudentId);
        this.loadPending();
      },
    });
  }
}
