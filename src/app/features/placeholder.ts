import { Component, Input } from '@angular/core';

/** Simple "coming next" placeholder for features scaffolded but not yet built. */
@Component({
  selector: 'app-placeholder',
  template: `
    <div class="rounded-xl bg-white p-8 shadow-sm">
      <h2 class="text-xl font-bold text-slate-800">{{ title }}</h2>
      <p class="text-slate-500 mt-2">{{ description }}</p>
      <span class="inline-block mt-4 rounded-full bg-amber-100 text-amber-700 text-xs font-medium px-3 py-1">
        Planned — built in the next increment
      </span>
    </div>
  `,
})
export class Placeholder {
  @Input() title = 'Coming soon';
  @Input() description = '';
}

@Component({
  selector: 'app-students',
  imports: [Placeholder],
  template: `<app-placeholder title="Students"
    description="Admissions (previous school details, documents & photos to Cloudinary), sections, interests, bus service and fees." />`,
})
export class Students {}

@Component({
  selector: 'app-fees',
  imports: [Placeholder],
  template: `<app-placeholder title="Fees"
    description="Fee structures per class, student fee assignment, and pending-fee tracking." />`,
})
export class Fees {}

@Component({
  selector: 'app-results',
  imports: [Placeholder],
  template: `<app-placeholder title="My Results"
    description="Subject-wise test results and daily class performance entered by your teachers." />`,
})
export class Results {}

@Component({
  selector: 'app-profile',
  imports: [Placeholder],
  template: `<app-placeholder title="My Profile"
    description="Your profile, documents and class details." />`,
})
export class Profile {}
