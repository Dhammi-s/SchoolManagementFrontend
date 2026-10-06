import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { StudentsService } from '../../core/services/students.service';
import { ClassesService } from '../../core/services/classes.service';
import { MediaService } from '../../core/services/media.service';
import {
  BusRouteDto,
  ClassDto,
  CreateStudentRequest,
  SectionDto,
  StudentDetail,
  StudentDocument,
  StudentInterest,
  StudentListItem,
} from '../../core/models/domain.models';

@Component({
  selector: 'app-students',
  imports: [FormsModule, DecimalPipe, DatePipe],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <h2 class="text-xl font-bold text-slate-800">Students</h2>
        <div class="flex items-center gap-3">
          <select [(ngModel)]="filterClassId" (ngModelChange)="load()"
            class="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option [ngValue]="null">All classes</option>
            @for (c of classes(); track c.id) { <option [ngValue]="c.id">{{ c.name }}</option> }
          </select>
          @if (auth.hasRole('Principal', 'HeadMaster')) {
            <button (click)="showAdmit.set(!showAdmit())"
              class="rounded-lg px-4 py-2 text-sm font-medium text-white"
              [style.background-color]="'var(--brand-primary)'">
              {{ showAdmit() ? 'Close' : 'Admit student' }}
            </button>
          }
        </div>
      </div>

      <!-- Admission form -->
      @if (showAdmit()) {
        <div class="rounded-xl bg-white p-5 shadow-sm">
          <h3 class="font-semibold mb-4 text-slate-700">New admission</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <label class="block"><span class="text-xs text-slate-500">Admission number *</span>
              <input [(ngModel)]="form.admissionNumber" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label class="block"><span class="text-xs text-slate-500">First name *</span>
              <input [(ngModel)]="form.firstName" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label class="block"><span class="text-xs text-slate-500">Last name</span>
              <input [(ngModel)]="form.lastName" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label class="block"><span class="text-xs text-slate-500">Gender</span>
              <select [(ngModel)]="form.gender" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
                <option [ngValue]="null">—</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
              </select></label>
            <label class="block"><span class="text-xs text-slate-500">Date of birth</span>
              <input type="date" [(ngModel)]="form.dateOfBirth" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label class="block"><span class="text-xs text-slate-500">Admission date</span>
              <input type="date" [(ngModel)]="form.admissionDate" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label class="block"><span class="text-xs text-slate-500">Class</span>
              <select [(ngModel)]="form.classId" (ngModelChange)="onFormClassChange($event)" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
                <option [ngValue]="null">—</option>
                @for (c of classes(); track c.id) { <option [ngValue]="c.id">{{ c.name }}</option> }
              </select></label>
            <label class="block"><span class="text-xs text-slate-500">Section</span>
              <select [(ngModel)]="form.sectionId" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
                <option [ngValue]="null">—</option>
                @for (s of formSections(); track s.id) { <option [ngValue]="s.id">{{ s.name }}</option> }
              </select></label>
            <label class="block"><span class="text-xs text-slate-500">Roll number</span>
              <input [(ngModel)]="form.rollNumber" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label class="block"><span class="text-xs text-slate-500">Guardian name</span>
              <input [(ngModel)]="form.guardianName" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label class="block"><span class="text-xs text-slate-500">Guardian phone</span>
              <input [(ngModel)]="form.guardianPhone" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label class="block"><span class="text-xs text-slate-500">Address</span>
              <input [(ngModel)]="form.address" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label class="block"><span class="text-xs text-slate-500">Previous school</span>
              <input [(ngModel)]="form.previousSchoolName" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label class="block sm:col-span-2"><span class="text-xs text-slate-500">Previous school details</span>
              <input [(ngModel)]="form.previousSchoolDetails" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
          </div>

          <div class="mt-4 border-t border-slate-100 pt-4 flex flex-wrap items-center gap-4">
            <label class="inline-flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" [(ngModel)]="form.usesBusService" /> Uses bus service
            </label>
            @if (form.usesBusService) {
              <select [(ngModel)]="form.busRouteId" class="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option [ngValue]="null">Select route</option>
                @for (b of busRoutes(); track b.id) { <option [ngValue]="b.id">{{ b.routeName }} (₹{{ b.fee }})</option> }
              </select>
            }
          </div>

          <div class="mt-4 flex items-center gap-3">
            <button (click)="admit()" [disabled]="saving()"
              class="rounded-lg px-5 py-2 font-medium text-white disabled:opacity-60"
              [style.background-color]="'var(--brand-primary)'">
              {{ saving() ? 'Saving…' : 'Admit' }}
            </button>
            @if (error()) { <span class="text-sm text-red-600">{{ error() }}</span> }
          </div>
        </div>
      }

      <!-- List -->
      <div class="rounded-xl bg-white shadow-sm overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th class="px-4 py-3 font-medium">Photo</th>
              <th class="px-4 py-3 font-medium">Adm #</th>
              <th class="px-4 py-3 font-medium">Name</th>
              <th class="px-4 py-3 font-medium">Class / Sec</th>
              <th class="px-4 py-3 font-medium">Guardian</th>
              <th class="px-4 py-3 font-medium">Bus</th>
              <th class="px-4 py-3 font-medium text-right">Pending fees</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (s of students(); track s.id) {
              <tr class="hover:bg-slate-50">
                <td class="px-4 py-2">
                  @if (s.photoUrl) { <img [src]="s.photoUrl" class="h-9 w-9 rounded-full object-cover" alt="" /> }
                  @else { <div class="h-9 w-9 rounded-full bg-slate-200"></div> }
                </td>
                <td class="px-4 py-3 text-slate-600">{{ s.admissionNumber }}</td>
                <td class="px-4 py-3 font-medium text-slate-800">{{ s.firstName }} {{ s.lastName }}</td>
                <td class="px-4 py-3 text-slate-600">{{ s.className || '—' }}{{ s.sectionName ? ' / ' + s.sectionName : '' }}</td>
                <td class="px-4 py-3 text-slate-600">{{ s.guardianName || '—' }}</td>
                <td class="px-4 py-3">{{ s.usesBusService ? 'Yes' : 'No' }}</td>
                <td class="px-4 py-3 text-right" [class.text-red-600]="s.pendingFees > 0">{{ s.pendingFees | number:'1.2-2' }}</td>
                <td class="px-4 py-3 text-right">
                  <button (click)="open(s)" class="text-sm font-medium" [style.color]="'var(--brand-primary)'">View</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="8" class="px-4 py-8 text-center text-slate-400">No students yet.</td></tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Detail -->
      @if (selected(); as d) {
        <div class="rounded-xl bg-white p-5 shadow-sm space-y-5">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-4">
              @if (d.photoUrl) { <img [src]="d.photoUrl" class="h-20 w-20 rounded-full object-cover" alt="" /> }
              @else { <div class="h-20 w-20 rounded-full bg-slate-200"></div> }
              <div>
                <h3 class="text-lg font-bold text-slate-800">{{ d.firstName }} {{ d.lastName }}</h3>
                <p class="text-sm text-slate-500">{{ d.admissionNumber }} · {{ d.className || '—' }}{{ d.sectionName ? ' / ' + d.sectionName : '' }}</p>
                <p class="text-sm" [class.text-red-600]="d.pendingFees > 0">Pending fees: {{ d.pendingFees | number:'1.2-2' }}</p>
              </div>
            </div>
            <button (click)="selected.set(null)" class="text-sm text-slate-400">Close</button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div><span class="text-slate-400">Guardian:</span> {{ d.guardianName || '—' }} ({{ d.guardianPhone || '—' }})</div>
            <div><span class="text-slate-400">Gender / DOB:</span> {{ d.gender || '—' }} / {{ d.dateOfBirth ? (d.dateOfBirth | date:'mediumDate') : '—' }}</div>
            <div><span class="text-slate-400">Address:</span> {{ d.address || '—' }}</div>
            <div><span class="text-slate-400">Bus:</span> {{ d.usesBusService ? (d.busRouteName || 'Yes') : 'No' }}</div>
            <div class="sm:col-span-2"><span class="text-slate-400">Previous school:</span> {{ d.previousSchoolName || '—' }} — {{ d.previousSchoolDetails || '' }}</div>
          </div>

          @if (auth.hasRole('Principal', 'HeadMaster')) {
            <div class="flex items-center gap-3 border-t border-slate-100 pt-4">
              <span class="text-sm font-medium text-slate-600">Profile photo:</span>
              <input type="file" accept="image/*" (change)="uploadPhoto($event)" class="text-sm" />
              @if (uploadingPhoto()) { <span class="text-xs text-slate-400">Uploading…</span> }
            </div>
          }

          <!-- Interests -->
          <div class="border-t border-slate-100 pt-4">
            <h4 class="text-sm font-semibold text-slate-600 mb-2">Interests</h4>
            <div class="flex flex-wrap gap-2 mb-3">
              @for (i of interests(); track i.id) {
                <span class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs">
                  {{ i.interestType }}: {{ i.interestName }}
                  @if (auth.hasRole('Principal', 'HeadMaster')) {
                    <button (click)="removeInterest(i.id)" class="text-slate-400 hover:text-red-600">×</button>
                  }
                </span>
              } @empty { <span class="text-xs text-slate-400">None</span> }
            </div>
            @if (auth.hasRole('Principal', 'HeadMaster')) {
              <div class="flex flex-wrap gap-2 items-end">
                <select [(ngModel)]="newInterestType" class="rounded-lg border border-slate-300 px-2 py-2 text-sm">
                  <option value="Game">Game</option><option value="Music">Music</option><option value="Art">Art</option><option value="Other">Other</option>
                </select>
                <input [(ngModel)]="newInterestName" placeholder="e.g. Football" class="rounded-lg border border-slate-300 px-2 py-2 text-sm" />
                <button (click)="addInterest()" class="rounded-lg px-3 py-2 text-sm font-medium text-white" [style.background-color]="'var(--brand-primary)'">Add</button>
              </div>
            }
          </div>

          <!-- Documents -->
          <div class="border-t border-slate-100 pt-4">
            <h4 class="text-sm font-semibold text-slate-600 mb-2">Documents</h4>
            <ul class="space-y-1 mb-3 text-sm">
              @for (doc of documents(); track doc.id) {
                <li><a [href]="doc.fileUrl" target="_blank" class="font-medium" [style.color]="'var(--brand-primary)'">{{ doc.documentType }}</a>
                  <span class="text-slate-400">— {{ doc.fileName || doc.fileUrl }}</span></li>
              } @empty { <li class="text-xs text-slate-400">No documents.</li> }
            </ul>
            @if (auth.hasRole('Principal', 'HeadMaster')) {
              <div class="flex flex-wrap gap-2 items-center">
                <input [(ngModel)]="newDocType" placeholder="Document type (e.g. TC)" class="rounded-lg border border-slate-300 px-2 py-2 text-sm" />
                <input type="file" accept="image/*,application/pdf" (change)="uploadDocument($event)" class="text-sm" />
                @if (uploadingDoc()) { <span class="text-xs text-slate-400">Uploading…</span> }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class Students {
  readonly auth = inject(AuthService);
  private readonly service = inject(StudentsService);
  private readonly classesService = inject(ClassesService);
  private readonly media = inject(MediaService);

  readonly students = signal<StudentListItem[]>([]);
  readonly classes = signal<ClassDto[]>([]);
  readonly busRoutes = signal<BusRouteDto[]>([]);
  readonly formSections = signal<SectionDto[]>([]);
  readonly selected = signal<StudentDetail | null>(null);
  readonly interests = signal<StudentInterest[]>([]);
  readonly documents = signal<StudentDocument[]>([]);

  readonly showAdmit = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly uploadingPhoto = signal(false);
  readonly uploadingDoc = signal(false);

  filterClassId: number | null = null;
  form: CreateStudentRequest = this.blankForm();
  newInterestType = 'Game';
  newInterestName = '';
  newDocType = '';

  constructor() {
    this.classesService.getAll().subscribe({ next: (c) => this.classes.set(c), error: () => {} });
    this.service.getBusRoutes().subscribe({ next: (b) => this.busRoutes.set(b), error: () => {} });
    this.load();
  }

  load() {
    this.service.list(this.filterClassId).subscribe({ next: (s) => this.students.set(s), error: () => {} });
  }

  onFormClassChange(classId: number | null) {
    this.form.sectionId = null;
    this.formSections.set([]);
    if (classId) this.service.getSections(classId).subscribe({ next: (s) => this.formSections.set(s), error: () => {} });
  }

  admit() {
    if (!this.form.admissionNumber || !this.form.firstName) {
      this.error.set('Admission number and first name are required.');
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    this.service.admit(this.form).subscribe({
      next: () => {
        this.saving.set(false);
        this.showAdmit.set(false);
        this.form = this.blankForm();
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.error ?? 'Failed to admit student.');
      },
    });
  }

  open(s: StudentListItem) {
    this.service.get(s.id).subscribe({ next: (d) => this.selected.set(d), error: () => {} });
    this.service.getInterests(s.id).subscribe({ next: (i) => this.interests.set(i), error: () => {} });
    this.service.getDocuments(s.id).subscribe({ next: (d) => this.documents.set(d), error: () => {} });
  }

  addInterest() {
    const d = this.selected();
    if (!d || !this.newInterestName) return;
    this.service.addInterest(d.id, this.newInterestType, this.newInterestName).subscribe({
      next: () => { this.newInterestName = ''; this.service.getInterests(d.id).subscribe((i) => this.interests.set(i)); },
    });
  }

  removeInterest(id: number) {
    const d = this.selected();
    if (!d) return;
    this.service.deleteInterest(id).subscribe({ next: () => this.service.getInterests(d.id).subscribe((i) => this.interests.set(i)) });
  }

  uploadPhoto(event: Event) {
    const d = this.selected();
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!d || !file) return;
    this.uploadingPhoto.set(true);
    this.media.upload(file, 'students').subscribe({
      next: (res) => this.service.setPhoto(d.id, res.url).subscribe({
        next: () => { this.uploadingPhoto.set(false); this.open(d); this.load(); },
        error: () => this.uploadingPhoto.set(false),
      }),
      error: () => this.uploadingPhoto.set(false),
    });
  }

  uploadDocument(event: Event) {
    const d = this.selected();
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!d || !file) return;
    this.uploadingDoc.set(true);
    this.media.upload(file, 'documents').subscribe({
      next: (res) => this.service.addDocument(d.id, {
        documentType: this.newDocType || 'Document',
        fileName: file.name,
        fileUrl: res.url,
        publicId: res.publicId,
      }).subscribe({
        next: () => { this.uploadingDoc.set(false); this.newDocType = ''; this.service.getDocuments(d.id).subscribe((docs) => this.documents.set(docs)); },
        error: () => this.uploadingDoc.set(false),
      }),
      error: () => this.uploadingDoc.set(false),
    });
  }

  private blankForm(): CreateStudentRequest {
    return { admissionNumber: '', firstName: '', usesBusService: false, classId: null, sectionId: null, busRouteId: null };
  }
}
