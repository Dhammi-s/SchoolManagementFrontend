import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { PortalService } from '../../core/services/performance.service';
import { StudentResult } from '../../core/models/domain.models';

@Component({
  selector: 'app-my-results',
  imports: [DatePipe, DecimalPipe],
  template: `
    <div class="space-y-6">
      <h2 class="text-xl font-bold text-slate-800">My Results</h2>
      <div class="rounded-xl bg-white shadow-sm overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th class="px-4 py-3 font-medium">Date</th>
              <th class="px-4 py-3 font-medium">Subject</th>
              <th class="px-4 py-3 font-medium">Test</th>
              <th class="px-4 py-3 font-medium text-right">Marks</th>
              <th class="px-4 py-3 font-medium">Grade</th>
              <th class="px-4 py-3 font-medium">Remarks</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (r of results(); track r.resultId) {
              <tr class="hover:bg-slate-50">
                <td class="px-4 py-3 text-slate-600">{{ r.testDate | date:'mediumDate' }}</td>
                <td class="px-4 py-3 text-slate-600">{{ r.subjectName }}</td>
                <td class="px-4 py-3 font-medium text-slate-800">{{ r.title }}</td>
                <td class="px-4 py-3 text-right">{{ r.marksObtained != null ? (r.marksObtained | number:'1.0-2') : '—' }} / {{ r.maxMarks | number:'1.0-0' }}</td>
                <td class="px-4 py-3">{{ r.grade || '—' }}</td>
                <td class="px-4 py-3 text-slate-600">{{ r.remarks || '' }}</td>
              </tr>
            } @empty {
              <tr><td colspan="6" class="px-4 py-8 text-center text-slate-400">No results published yet.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class MyResults {
  private readonly portal = inject(PortalService);
  readonly results = signal<StudentResult[]>([]);

  constructor() {
    this.portal.results().subscribe({ next: (r) => this.results.set(r), error: () => {} });
  }
}
