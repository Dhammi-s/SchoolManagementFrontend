import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { PortalService } from '../../core/services/performance.service';
import { StudentDetail, StudentFee } from '../../core/models/domain.models';

@Component({
  selector: 'app-my-profile',
  imports: [DatePipe, DecimalPipe],
  template: `
    <div class="space-y-6 max-w-3xl">
      <h2 class="text-xl font-bold text-slate-800">My Profile</h2>

      @if (profile(); as p) {
        <div class="rounded-xl bg-white p-6 shadow-sm">
          <div class="flex items-center gap-4">
            @if (p.photoUrl) { <img [src]="p.photoUrl" class="h-20 w-20 rounded-full object-cover" alt="" /> }
            @else { <div class="h-20 w-20 rounded-full bg-slate-200"></div> }
            <div>
              <h3 class="text-lg font-bold text-slate-800">{{ p.firstName }} {{ p.lastName }}</h3>
              <p class="text-sm text-slate-500">{{ p.admissionNumber }} · {{ p.className || '—' }}{{ p.sectionName ? ' / ' + p.sectionName : '' }}</p>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mt-5">
            <div><span class="text-slate-400">Roll:</span> {{ p.rollNumber || '—' }}</div>
            <div><span class="text-slate-400">Gender / DOB:</span> {{ p.gender || '—' }} / {{ p.dateOfBirth ? (p.dateOfBirth | date:'mediumDate') : '—' }}</div>
            <div><span class="text-slate-400">Guardian:</span> {{ p.guardianName || '—' }} ({{ p.guardianPhone || '—' }})</div>
            <div><span class="text-slate-400">Bus:</span> {{ p.usesBusService ? (p.busRouteName || 'Yes') : 'No' }}</div>
            <div class="sm:col-span-2"><span class="text-slate-400">Address:</span> {{ p.address || '—' }}</div>
          </div>
        </div>
      }

      <div class="rounded-xl bg-white shadow-sm overflow-hidden">
        <div class="px-4 py-3 border-b border-slate-100 font-semibold text-slate-700">My fees</div>
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-slate-500 text-left">
            <tr><th class="px-4 py-2 font-medium">Title</th><th class="px-4 py-2 font-medium text-right">Due</th>
            <th class="px-4 py-2 font-medium text-right">Paid</th><th class="px-4 py-2 font-medium text-right">Balance</th>
            <th class="px-4 py-2 font-medium">Status</th></tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (f of fees(); track f.id) {
              <tr><td class="px-4 py-2">{{ f.title }}</td>
              <td class="px-4 py-2 text-right">{{ f.amountDue | number:'1.2-2' }}</td>
              <td class="px-4 py-2 text-right">{{ f.amountPaid | number:'1.2-2' }}</td>
              <td class="px-4 py-2 text-right" [class.text-red-600]="f.balance > 0">{{ f.balance | number:'1.2-2' }}</td>
              <td class="px-4 py-2">{{ f.status }}</td></tr>
            } @empty { <tr><td colspan="5" class="px-4 py-6 text-center text-slate-400">No fees.</td></tr> }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class MyProfile {
  private readonly portal = inject(PortalService);
  readonly profile = signal<StudentDetail | null>(null);
  readonly fees = signal<StudentFee[]>([]);

  constructor() {
    this.portal.profile().subscribe({ next: (p) => this.profile.set(p as StudentDetail), error: () => {} });
    this.portal.fees().subscribe({ next: (f) => this.fees.set(f as StudentFee[]), error: () => {} });
  }
}
