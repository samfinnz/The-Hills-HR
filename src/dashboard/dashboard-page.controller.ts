import { Controller, Get, Header, Res } from '@nestjs/common';
import type { Response } from 'express';
import { DashboardService } from './dashboard.service';

function esc(v: unknown): string {
  if (v === null || v === undefined) return '';
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fmtDate(v: unknown): string {
  if (!v) return '-';
  const d = new Date(v as string | Date);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toISOString().slice(0, 10);
}

function personName(employee: any): string {
  if (!employee) return '-';
  const legal = `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim();
  return employee.nickname ? `${legal} (${employee.nickname})` : legal;
}

@Controller()
export class DashboardPageController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('dashboard')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async page(@Res({ passthrough: false }) res: Response) {
    try {
      const data = await this.dashboard.hrDashboard();
      res.send(this.shell(data));
    } catch {
      res.send(this.shell(this.offlineData(), true));
    }
  }

  private shell(data: any, offline = false) {
    const counts = data.counts ?? {};
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>HR Dashboard</title>
<style>
  :root{
    --bg:#f5f7f8;--surface:#fff;--ink:#14282f;--muted:#647780;--line:#d7e1e4;
    --teal:#0d7f78;--teal-soft:#e4f3f1;--amber:#b98112;--amber-soft:#fff3d7;
    --red:#c94d3f;--red-soft:#fdecea;--green:#247b55;--green-soft:#e4f3eb;
    --indigo:#4359a8;--indigo-soft:#e9edfb;--shadow:0 1px 2px rgba(20,40,47,.05),0 8px 24px rgba(20,40,47,.07)
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Noto Sans Thai",Arial,sans-serif;font-size:14px;line-height:1.45}
  .page{max-width:1240px;margin:0 auto;padding:22px 18px 46px}
  header{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;margin-bottom:16px}
  .eyebrow{font-size:11px;font-weight:800;color:var(--teal);letter-spacing:.13em;text-transform:uppercase}
  h1{margin:2px 0 0;font-size:25px;letter-spacing:0}
  .stamp{color:var(--muted);font-size:12px;text-align:right}
  nav{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:15px}
  nav a{color:var(--ink);text-decoration:none;background:var(--surface);border:1px solid var(--line);border-radius:7px;padding:7px 10px;font-weight:700;box-shadow:var(--shadow)}
  nav a.active{background:var(--teal-soft);border-color:#b8deda;color:var(--teal)}
  .offline{background:var(--amber-soft);border:1px solid #efd391;color:#6f4b09;border-radius:8px;padding:10px 12px;margin-bottom:14px;font-weight:700}
  .kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin-bottom:16px}
  .kpi{background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:12px;box-shadow:var(--shadow);min-height:86px}
  .kpi .label{font-size:11px;color:var(--muted);font-weight:800;text-transform:uppercase;letter-spacing:.07em}
  .kpi .value{font-size:28px;font-weight:850;margin-top:4px}
  .kpi.urgent .value{color:var(--red)}.kpi.warn .value{color:var(--amber)}.kpi.info .value{color:var(--indigo)}.kpi.ok .value{color:var(--green)}
  .grid{display:grid;grid-template-columns:1.2fr .8fr;gap:14px;align-items:start}
  section{margin-bottom:14px}
  .panel{background:var(--surface);border:1px solid var(--line);border-radius:8px;box-shadow:var(--shadow);overflow:hidden}
  .panel-head{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:10px 12px;border-bottom:1px solid var(--line);background:#fbfcfc}
  h2{font-size:14px;margin:0}
  .count{font-size:11px;font-weight:800;color:var(--muted);background:#eef3f4;border-radius:999px;padding:2px 8px}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th{text-align:left;color:var(--muted);font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;background:#f5f8f8}
  th,td{padding:8px 10px;border-bottom:1px solid var(--line);vertical-align:top}
  tr:last-child td{border-bottom:0}
  .name{font-weight:800}
  .sub{color:var(--muted);font-size:12px;margin-top:1px}
  .badge{display:inline-block;font-size:10.5px;font-weight:800;border-radius:5px;padding:2px 6px;background:#eef3f4;color:var(--muted)}
  .badge.red{background:var(--red-soft);color:var(--red)}.badge.amber{background:var(--amber-soft);color:var(--amber)}.badge.green{background:var(--green-soft);color:var(--green)}.badge.indigo{background:var(--indigo-soft);color:var(--indigo)}
  .empty{padding:16px;color:var(--muted);font-weight:650}
  .stack{display:grid;gap:14px}
  @media (max-width:980px){.kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.grid{grid-template-columns:1fr}header{align-items:flex-start;flex-direction:column}.stamp{text-align:left}}
  @media (max-width:560px){.page{padding:16px 10px 34px}.kpis{grid-template-columns:1fr}table{font-size:12px}th,td{padding:7px 8px}h1{font-size:21px}}
</style>
</head>
<body>
<div class="page">
  <header>
    <div>
      <div class="eyebrow">The Hills System</div>
      <h1>HR Dashboard</h1>
    </div>
    <div class="stamp">Updated ${esc(fmtDate(data.generatedAt))}</div>
  </header>
  <nav>
    <a href="/system">Overview</a>
    <a href="/system/apps">Apps</a>
    <a href="/system/modules">Modules</a>
    <a href="/system/workflows">Workflows</a>
    <a href="/system/integrations">Integrations</a>
    <a href="/system/roadmap">Roadmap</a>
    <a href="/system/documents">Docs</a>
    <a class="active" href="/dashboard">HR Dashboard</a>
    <a href="/staff">Staff</a>
    <a href="/api/hr-dashboard">API</a>
  </nav>
  ${offline ? '<div class="offline">API is running. PostgreSQL is not reachable yet, so live queues are waiting for the database.</div>' : ''}
  <div class="kpis">
    ${this.kpi('Renewals', counts.renewals, 'urgent')}
    ${this.kpi('Evaluations Due', counts.evaluationsDue, 'warn')}
    ${this.kpi('Probation Ending', counts.probationaryEndings, 'info')}
    ${this.kpi('Contractor Payments', counts.contractorPaymentsPending, 'warn')}
    ${this.kpi('Missing Docs', counts.missingDocuments, 'urgent')}
  </div>
  <div class="grid">
    <div class="stack">
      ${this.renewals(data.renewalsQueue)}
      ${this.evaluations(data.evaluationsDue)}
      ${this.documents(data.openOnboardingOffboarding?.missingDocuments ?? [])}
    </div>
    <div class="stack">
      ${this.probation(data.probationaryEndings)}
      ${this.contractorPayments(data.contractorPaymentsPending)}
      ${this.rosters(data.rosterStatusByDepartment)}
    </div>
  </div>
</div>
</body>
</html>`;
  }

  private kpi(label: string, value: unknown, tone: string) {
    return `<div class="kpi ${tone}"><div class="label">${esc(label)}</div><div class="value">${esc(value ?? 0)}</div></div>`;
  }

  private panel(title: string, count: number, body: string) {
    return `<section class="panel"><div class="panel-head"><h2>${esc(title)}</h2><span class="count">${count}</span></div>${body}</section>`;
  }

  private renewals(queue: any) {
    const rows = [
      ...((queue?.certifications ?? []) as any[]).map((item) => ({
        employee: item.employee,
        document: item.name,
        due: item.expiryDate,
        type: 'Certification',
      })),
      ...((queue?.foreignCompliance ?? []) as any[]).flatMap((item) => [
        item.passportExpiry && {
          employee: item.employee,
          document: 'Passport',
          due: item.passportExpiry,
          type: 'Foreign',
        },
        item.visaExpiry && {
          employee: item.employee,
          document: 'Visa',
          due: item.visaExpiry,
          type: 'Foreign',
        },
        item.workPermitExpiry && {
          employee: item.employee,
          document: 'Work permit',
          due: item.workPermitExpiry,
          type: 'Foreign',
        },
      ].filter(Boolean)),
      ...((queue?.annualCompliance ?? []) as any[]).map((item) => ({
        employee: item.employee,
        document: item.type,
        due: item.coverageEnd ?? item.scheduledAt,
        type: 'Annual',
      })),
    ].sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());

    if (!rows.length) return this.panel('Renewals Queue', 0, '<div class="empty">No renewal items due.</div>');
    return this.panel('Renewals Queue', rows.length, `<table><thead><tr><th>Employee</th><th>Item</th><th>Due</th><th>Type</th></tr></thead><tbody>${rows
      .slice(0, 8)
      .map((row) => `<tr><td><div class="name">${esc(personName(row.employee))}</div><div class="sub">${esc(row.employee?.department?.name ?? '-')}</div></td><td>${esc(row.document)}</td><td><span class="badge red">${esc(fmtDate(row.due))}</span></td><td><span class="badge indigo">${esc(row.type)}</span></td></tr>`)
      .join('')}</tbody></table>`);
  }

  private evaluations(rows: any[]) {
    if (!rows?.length) return this.panel('Evaluations Due', 0, '<div class="empty">No evaluations due.</div>');
    return this.panel('Evaluations Due', rows.length, `<table><thead><tr><th>Employee</th><th>Period End</th><th>Status</th></tr></thead><tbody>${rows
      .slice(0, 6)
      .map((row) => `<tr><td><div class="name">${esc(personName(row.employee))}</div><div class="sub">${esc(row.employee?.position?.title ?? '-')}</div></td><td>${esc(fmtDate(row.periodEnd))}</td><td><span class="badge amber">${esc(row.status)}</span></td></tr>`)
      .join('')}</tbody></table>`);
  }

  private documents(rows: any[]) {
    if (!rows?.length) return this.panel('Document Checklist', 0, '<div class="empty">No missing personnel-file documents.</div>');
    return this.panel('Document Checklist', rows.length, `<table><thead><tr><th>Employee</th><th>Document</th><th>Status</th></tr></thead><tbody>${rows
      .slice(0, 8)
      .map((row) => `<tr><td><div class="name">${esc(personName(row.employee))}</div><div class="sub">${esc(row.employee?.department?.name ?? '-')}</div></td><td>${esc(row.documentName)}</td><td><span class="badge red">${esc(row.status)}</span></td></tr>`)
      .join('')}</tbody></table>`);
  }

  private probation(rows: any[]) {
    if (!rows?.length) return this.panel('Probation Ending', 0, '<div class="empty">No probation endings in the next 30 days.</div>');
    return this.panel('Probation Ending', rows.length, `<table><thead><tr><th>Employee</th><th>End Date</th></tr></thead><tbody>${rows
      .slice(0, 6)
      .map((row) => `<tr><td><div class="name">${esc(personName(row))}</div><div class="sub">${esc(row.department?.name ?? '-')}</div></td><td><span class="badge indigo">${esc(fmtDate(row.probationEndDate))}</span></td></tr>`)
      .join('')}</tbody></table>`);
  }

  private contractorPayments(rows: any[]) {
    if (!rows?.length) return this.panel('Contractor Payments', 0, '<div class="empty">No pending contractor payments.</div>');
    return this.panel('Contractor Payments', rows.length, `<table><thead><tr><th>Contractor</th><th>Session</th><th>Amount</th></tr></thead><tbody>${rows
      .slice(0, 6)
      .map((row) => `<tr><td><div class="name">${esc(row.contractor?.name ?? '-')}</div><div class="sub">${esc(row.serviceType)}</div></td><td>${esc(fmtDate(row.sessionDate))}</td><td><span class="badge amber">THB ${esc(row.totalAmount ?? '-')}</span></td></tr>`)
      .join('')}</tbody></table>`);
  }

  private rosters(rows: any[]) {
    if (!rows?.length) return this.panel('Roster Status', 0, '<div class="empty">No roster records for this week.</div>');
    return this.panel('Roster Status', rows.length, `<table><thead><tr><th>Department</th><th>Status</th><th>Entries</th></tr></thead><tbody>${rows
      .slice(0, 8)
      .map((row) => `<tr><td><div class="name">${esc(row.department?.code ?? '-')} ${esc(row.department?.name ?? '')}</div><div class="sub">${esc(personName(row.authoredByHod))}</div></td><td><span class="badge green">${esc(row.status)}</span></td><td>${esc(row._count?.entries ?? 0)}</td></tr>`)
      .join('')}</tbody></table>`);
  }

  private offlineData() {
    return {
      generatedAt: new Date().toISOString(),
      renewalsQueue: {
        certifications: [],
        foreignCompliance: [],
        annualCompliance: [],
      },
      evaluationsDue: [],
      probationaryEndings: [],
      contractorPaymentsPending: [],
      rosterStatusByDepartment: [],
      openOnboardingOffboarding: { missingDocuments: [] },
      counts: {
        renewals: 0,
        evaluationsDue: 0,
        probationaryEndings: 0,
        contractorPaymentsPending: 0,
        rostersTotal: 0,
        missingDocuments: 0,
      },
    };
  }
}

// SANDBOX-TRUNCATION REPAIR: completed truncated counts field as rostersTotal, added missingDocuments (referenced by KPI), closed counts/object/method/class.
