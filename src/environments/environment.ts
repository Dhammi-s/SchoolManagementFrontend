// Production build (used by `ng build`). Each deployed school site sets its own
// tenantDomain — it MUST match the Domain registered in the master DB Tenants
// table (the API resolves the school from this value, sent as X-Tenant-Domain).
export const environment = {
  production: true,
  apiUrl: 'https://schoolmanagementj.runasp.net/api',
  tenantDomain: 'app.schoolmanagementj.runasp.net',
};
