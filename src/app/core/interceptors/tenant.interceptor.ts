import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TenantService } from '../services/tenant.service';

/** Adds the tenant domain header the API uses to resolve the school database. */
export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const tenant = inject(TenantService);
  const domain = tenant.domain;
  if (domain) {
    req = req.clone({ setHeaders: { 'X-Tenant-Domain': domain } });
  }
  return next(req);
};
