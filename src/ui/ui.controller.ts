import {
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
  Redirect,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { EmployeesService } from '../employees/employees.service';
import { DepartmentsService } from '../departments/departments.service';
import { EvaluationsService } from '../evaluations/evaluations.service';
import { DocumentChecklistService } from '../document-checklist/document-checklist.service';
import { AnnualComplianceService } from '../annual-compliance/annual-compliance.service';
import { RostersService } from '../rosters/rosters.service';

function esc(v: unknown): string {
  if (v === null || v === undefined) return '';
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fmtDate(d: Date | null | undefined): string {
  if (!d) return '—';
  const x = new Date(d);
  return x.toISOString().slice(0, 10);
}

function daysUntil(d: Date | null | undefined): number | null {
  if (!d) return null;
  const ms = new Date(d).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function expiryBadge(d: Date | null | undefined): string {
  const n = daysUntil(d);
  if (n === null) return '';
  if (n < 0) return `<span class="badge red">expired ${-n}d ago</span>`;
  if (n <= 30) return `<span class="badge red">${n}d</span>`;
  if (n <= 60) return `<span class="badge amber">${n}d</span>`;
  return `<span class="badge ok">${n}d</span>`;
}

@Controller()
export class UiController {
  constructor(
    private readonly employees: EmployeesService,
    private readonly departments: DepartmentsService,
    private readonly evaluations: EvaluationsService,
    private readonly docChecklist: DocumentChecklistService,
    private readonly annualCompliance: AnnualComplianceService,
    private readonly rosters: RostersService,
  ) {}

  @Get('')
  @Redirect('/system', 302)
  home() {
    return;
  }

  @Get('staff')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async staff(@Res({ passthrough: false }) res: Response) {
    try {
    const [list, depts, expiring] = await Promise.all([
      this.employees.list(),
      this.departments.list(),
      this.employees.expiring(60),
    ]);

    // group by department
    const byDept = new Map<string, { dept: any; rows: any[] }>();
    for (const e of list) {
      const key = e.departmentId ?? '__unassigned';
      const slot = byDept.get(key) ?? {
        dept: e.department ?? { code: '—', name: 'Unassigned', nameTh: 'ยังไม่กำหนด' },
        rows: [],
      };
      slot.rows.push(e);
      byDept.set(key, slot);
    }

    // headline counts
    const totalEmployees = list.length;
    const totalDepts = depts.length;
    const totalForeign = list.filter((e) => e.foreignCompliance).length;
    const totalExpiring =
      expiring.certifications.length + expiring.compliance.length;

    // build dept sections
    const sections = [...byDept.values()]
      .sort((a, b) => (a.dept.code || '').localeCompare(b.dept.code || ''))
      .map((s) => this.renderDeptSection(s.dept, s.rows))
      .join('');

    const alertSection = this.renderAlerts(expiring);

    const html = this.shell({
      title: 'HR Project — Staff Directory',
      totals: { totalEmployees, totalDepts, totalForeign, totalExpiring },
      alerts: alertSection,
      sections,
    });
    res.send(html);
    } catch {
      const html = this.shell({
        title: 'HR Project â€” Staff Directory',
        totals: {
          totalEmployees: 0,
          totalDepts: 0,
          totalForeign: 0,
          totalExpiring: 0,
        },
        alerts:
          '<p class="ok-line">API is running, but PostgreSQL is not reachable yet. Start the database, then refresh this page.</p>',
        sections:
          '<section class="dept"><h2><span class="code">DB</span> Database required</h2><table class="staff"><tbody><tr><td>Run <code>docker compose up -d --build</code> when Docker/Postgres is available.</td></tr></tbody></table></section>',
      });
      res.send(html);
    }
  }

  @Get('staff/:id')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async staffDetail(@Param('id') id: string, @Res({ passthrough: false }) res: Response) {
    try {
      const emp: any = await this.employees.get(id);
      // Per-employee data — each call is best-effort so one missing slice doesn't break the page
      const [evals, docs, docsCompletion, annual, rostersList] = await Promise.all([
        this.evaluations.list({ employeeId: id }).catch(() => []),
        this.docChecklist.list(id).catch(() => []),
        this.docChecklist.completion(id).catch(() => null),
        this.annualCompliance.list(id).catch(() => []),
        this.rosters.list ? this.rosters.list({ employeeId: id } as any).catch(() => []) : Promise.resolve([]),
      ] as Promise<any>[]);
      const html = this.detailShell(emp, { evals, docs, docsCompletion, annual, rosters: rostersList });
      res.send(html);
    } catch (err) {
      const message =
        err instanceof NotFoundException
          ? 'No employee with that id.'
          : 'Could not load this employee — is PostgreSQL reachable?';
      const html = this.detailErrorShell(id, message);
      res.send(html);
    }
  }

  private renderAlerts(expiring: any): string {
    const certs = expiring.certifications as any[];
    const comps = expiring.compliance as any[];
    if (certs.length === 0 && comps.length === 0) {
      return `<p class="ok-line" data-en="No documents expiring in the next 60 days." data-th="ไม่มีเอกสารหมดอายุใน 60 วันข้างหน้า">No documents expiring in the next 60 days.</p>`;
    }
    const certRows = certs
      .map(
        (c) => `<tr>
        <td>${esc(c.employee.firstName)} ${esc(c.employee.lastName)}${c.employee.nickname ? ` <span class="muted">"${esc(c.employee.nickname)}"</span>` : ''}</td>
        <td>${esc(c.employee.department?.name ?? '—')}</td>
        <td><b>${esc(c.name)}</b>${c.nameTh ? ` <span class="muted">/ ${esc(c.nameTh)}</span>` : ''}</td>
        <td>${fmtDate(c.expiryDate)} ${expiryBadge(c.expiryDate)}</td>
      </tr>`,
      )
      .join('');
    const compRows = comps
      .flatMap((c) => {
        const out: string[] = [];
        const who = `${esc(c.employee.firstName)} ${esc(c.employee.lastName)}${c.employee.nickname ? ` <span class="muted">"${esc(c.employee.nickname)}"</span>` : ''}`;
        const dept = esc(c.employee.department?.name ?? '—');
        if (c.passportExpiry)
          out.push(
            `<tr><td>${who}</td><td>${dept}</td><td>Passport</td><td>${fmtDate(c.passportExpiry)} ${expiryBadge(c.passportExpiry)}</td></tr>`,
          );
        if (c.visaExpiry)
          out.push(
            `<tr><td>${who}</td><td>${dept}</td><td>Visa (${esc(c.visaType ?? '')})</td><td>${fmtDate(c.visaExpiry)} ${expiryBadge(c.visaExpiry)}</td></tr>`,
          );
        if (c.workPermitExpiry)
          out.push(
            `<tr><td>${who}</td><td>${dept}</td><td>Work Permit</td><td>${fmtDate(c.workPermitExpiry)} ${expiryBadge(c.workPermitExpiry)}</td></tr>`,
          );
        return out;
      })
      .join('');
    return `
      <table class="staff">
        <thead><tr>
          <th data-en="Employee" data-th="พนักงาน">Employee</th>
          <th data-en="Department" data-th="แผนก">Department</th>
          <th data-en="Document" data-th="เอกสาร">Document</th>
          <th data-en="Expires" data-th="หมดอายุ">Expires</th>
        </tr></thead>
        <tbody>${certRows}${compRows}</tbody>
      </table>
    `;
  }

  private renderDeptSection(dept: any, rows: any[]): string {
    const hod = rows.find((r) => r.isHod);
    const code = esc(dept.code ?? '—');
    const nameEn = esc(dept.name ?? '—');
    const nameTh = esc(dept.nameTh ?? '');
    const hodLine = hod
      ? `<span class="hod">HOD: ${esc(hod.firstName)} ${esc(hod.lastName)}${hod.nickname ? ` "${esc(hod.nickname)}"` : ''}</span>`
      : '';

    const tableRows = rows
      .map((e) => {
        const detailHref = `/staff/${esc(e.id)}`;
        const name = `<a class="emp-link" href="${detailHref}">${esc(e.firstName)} ${esc(e.lastName)}</a>`;
        const thName =
          e.firstNameTh || e.lastNameTh
            ? `${esc(e.firstNameTh ?? '')} ${esc(e.lastNameTh ?? '')}`.trim()
            : '';
        const nick = e.nickname ? `<span class="muted">"${esc(e.nickname)}"</span>` : '';
        const pos = e.position ? esc(e.position.title) : '';
        const termCls = (e.employmentTerm || '').toLowerCase().replace(/_/g, '-');
        const statusCls = (e.employmentStatus || '').toLowerCase().replace(/_/g, '-');
        const flags = [
          e.isHod ? '<span class="chip gold">HOD</span>' : '',
          e.foreignCompliance ? '<span class="chip blue">Foreign</span>' : '',
          e.nationality ? `<span class="chip">${esc(e.nationality)}</span>` : '',
        ]
          .filter(Boolean)
          .join(' ');
        const fc = e.foreignCompliance;
        const fcBits = fc
          ? `<div class="fc-line">
              ${fc.passportExpiry ? `Passport: ${fmtDate(fc.passportExpiry)} ${expiryBadge(fc.passportExpiry)}` : ''}
              ${fc.visaExpiry ? `· Visa: ${fmtDate(fc.visaExpiry)} ${expiryBadge(fc.visaExpiry)}` : ''}
              ${fc.workPermitExpiry ? `· Work Permit: ${fmtDate(fc.workPermitExpiry)} ${expiryBadge(fc.workPermitExpiry)}` : ''}
            </div>`
          : '';
        const certs = (e.certifications as any[])
          .map(
            (c) =>
              `<span class="cert">${esc(c.name)} ${expiryBadge(c.expiryDate)}</span>`,
          )
          .join(' ');
        return `<tr>
          <td>
            <div class="name">${name} ${nick}</div>
            ${thName ? `<div class="th muted">${thName}</div>` : ''}
            ${fcBits}
          </td>
          <td>${pos}</td>
          <td><span class="chip ${termCls}">${esc(e.employmentTerm)}</span></td>
          <td><span class="chip ${statusCls}">${esc(e.employmentStatus)}</span></td>
          <td>${flags}</td>
          <td>${certs || '<span class="muted">—</span>'}</td>
        </tr>`;
      })
      .join('');

    return `
      <section class="dept">
        <h2><span class="code">${code}</span> ${nameEn} ${nameTh ? `<span class="th-name">${nameTh}</span>` : ''} <span class="count">${rows.length}</span> ${hodLine}</h2>
        <table class="staff">
          <thead><tr>
            <th data-en="Name" data-th="ชื่อ">Name</th>
            <th data-en="Position" data-th="ตำแหน่ง">Position</th>
            <th data-en="Term" data-th="ประเภท">Term</th>
            <th data-en="Status" data-th="สถานะ">Status</th>
            <th data-en="Flags" data-th="ป้าย">Flags</th>
            <th data-en="Certifications" data-th="ใบรับรอง">Certifications</th>
          </tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </section>
    `;
  }

  private shell(opts: {
    title: string;
    totals: { totalEmployees: number; totalDepts: number; totalForeign: number; totalExpiring: number };
    alerts: string;
    sections: string;
  }): string {
    const t = opts.totals;
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(opts.title)}</title>
<style>
  :root{
    --bg:#f6f8f9;--ink:#0f2e35;--muted:#5b7780;--line:#d7e3e6;
    --card:#fff;--teal:#0e8c8c;--teal-d:#0a6b6b;--teal-soft:#e3f3f3;
    --gold:#c8911f;--gold-soft:#fbf1da;--blue-soft:#e6eefc;--blue:#3c5fb4;
    --red:#d65a4a;--amber:#e0a92e;--green:#2f9e6f;--green-soft:#e3f4ec;
    --slate:#33505a;--shadow:0 1px 2px rgba(15,46,53,.06),0 6px 22px rgba(15,46,53,.08);
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Noto Sans Thai",Helvetica,Arial,sans-serif;line-height:1.45}
  .page{max-width:1180px;margin:0 auto;padding:24px 18px 60px}
  header{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px}
  h1{font-size:22px;margin:0}
  .kicker{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--teal-d);font-weight:700}
  .langbtn{border:1px solid var(--line);background:#fff;border-radius:999px;padding:7px 13px;font:inherit;font-size:13px;font-weight:700;cursor:pointer;color:var(--teal-d);box-shadow:var(--shadow)}
  .kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:18px}
  .kpi{background:#fff;border:1px solid var(--line);border-radius:11px;padding:11px 13px;box-shadow:var(--shadow)}
  .kpi .v{font-size:22px;font-weight:800}.kpi .l{font-size:11.5px;color:var(--muted)}
  .kpi.alert{background:var(--gold-soft);border-color:#ecd9a8}.kpi.alert .v{color:var(--gold)}
  h2{font-size:15px;margin:18px 0 8px;color:var(--slate);display:flex;align-items:center;gap:9px;flex-wrap:wrap}
  h2 .code{background:var(--teal);color:#fff;border-radius:6px;padding:2px 7px;font-size:11px;font-weight:800;letter-spacing:.06em}
  h2 .th-name{color:var(--muted);font-weight:600;font-size:13px}
  h2 .count{background:#eef3f4;color:var(--muted);border-radius:999px;padding:1px 9px;font-size:11px;font-weight:700}
  h2 .hod{margin-left:6px;font-size:11px;color:var(--gold);font-weight:700;background:var(--gold-soft);border-radius:5px;padding:2px 7px;letter-spacing:.04em}
  .alert-card{background:#fff;border:1px solid var(--line);border-left:4px solid var(--gold);border-radius:12px;padding:12px 14px;box-shadow:var(--shadow);margin-bottom:14px}
  .alert-card h2{margin-top:0}
  .ok-line{color:var(--green);font-weight:600;margin:4px 0}
  table.staff{width:100%;border-collapse:collapse;background:#fff;border:1px solid var(--line);border-radius:12px;overflow:hidden;box-shadow:var(--shadow);font-size:13px}
  table.staff th{text-align:left;background:#f3f8f8;padding:8px 10px;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--slate);font-weight:700;border-bottom:1px solid var(--line)}
  table.staff td{padding:8px 10px;border-bottom:1px solid var(--line);vertical-align:top}
  table.staff tr:last-child td{border-bottom:0}
  .name{font-weight:700}
  .muted{color:var(--muted);font-weight:400}
  .th{font-size:12px;margin-top:2px}
  .fc-line{font-size:11px;color:var(--muted);margin-top:3px}
  .chip{display:inline-block;font-size:10.5px;font-weight:700;border-radius:6px;padding:2px 7px;background:#eef3f4;color:var(--slate);margin-right:3px}
  .chip.permanent{background:var(--green-soft);color:var(--green)}
  .chip.probationary,.chip.daily-wages,.chip.fixed-term{background:var(--gold-soft);color:var(--gold)}
  .chip.contractor{background:#f1ecfb;color:#7a6cc4}
  .chip.active{background:var(--green-soft);color:var(--green)}
  .chip.probation{background:var(--gold-soft);color:var(--gold)}
  .chip.on-leave,.chip.suspended{background:#fdeceb;color:var(--red)}
  .chip.separated{background:#eef3f4;color:var(--muted)}
  .chip.gold{background:var(--gold-soft);color:var(--gold)}
  .chip.blue{background:var(--blue-soft);color:var(--blue)}
  .cert{display:inline-block;font-size:11px;color:var(--slate);background:#f3f8f8;border-radius:5px;padding:1px 6px;margin:1px 1px 0 0}
  .badge{display:inline-block;font-size:10px;font-weight:800;border-radius:4px;padding:1px 5px;margin-left:4px}
  .badge.ok{background:var(--green-soft);color:var(--green)}
  .badge.amber{background:var(--gold-soft);color:var(--gold)}
  .badge.red{background:#fdeceb;color:var(--red)}
  section.dept{margin-bottom:18px}
  footer{margin-top:24px;color:var(--muted);font-size:12px;border-top:1px solid var(--line);padding-top:12px}
  footer code{background:#eef3f4;padding:1px 6px;border-radius:4px;font-size:11.5px}
  nav.topnav{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0 14px}
  nav.topnav a{color:var(--ink);text-decoration:none;background:#fff;border:1px solid var(--line);border-radius:7px;padding:5px 10px;font-weight:600;font-size:12.5px;box-shadow:var(--shadow)}
  nav.topnav a.active{background:var(--teal-soft);border-color:#b7deda;color:var(--teal-d)}
  .emp-link{color:var(--teal-d);text-decoration:none;border-bottom:1px dotted #b7deda}
  .emp-link:hover{color:var(--ink);border-bottom-color:var(--ink)}
  .detail-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin-top:14px}
  .detail-card{background:#fff;border:1px solid var(--line);border-radius:12px;padding:14px;box-shadow:var(--shadow)}
  .detail-card h3{margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--slate)}
  .detail-card .kv{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;font-size:13px}
  .detail-card .kv dt{color:var(--muted);font-weight:600}
  .detail-card .kv dd{margin:0;font-weight:600}
  .back-link{display:inline-block;margin-bottom:8px;font-size:13px;color:var(--teal-d);text-decoration:none}
  .back-link:hover{color:var(--ink)}
</style>
</head>
<body data-lang="en">
<div class="page">
  <header>
    <div>
      <div class="kicker">The Hills System · HR Project</div>
      <h1 data-en="Staff Directory" data-th="ทำเนียบพนักงาน">Staff Directory</h1>
    </div>
    <button class="langbtn" onclick="toggleLang()"><span id="langlabel">🌐 EN · switch to ไทย</span></button>
  </header>

  <nav class="topnav">
    <a href="/system">Overview</a>
    <a href="/system/modules">Modules</a>
    <a href="/dashboard">HR Dashboard</a>
    <a class="active" href="/staff">Staff</a>
    <a href="/rosters">Rosters</a>
    <a href="/contractors">Contractors</a>
    <a href="/evaluations">Evaluations</a>
    <a href="/api/employees">API</a>
  </nav>

  <div class="kpis">
    <div class="kpi"><div class="v">${t.totalEmployees}</div><div class="l" data-en="Employees" data-th="พนักงาน">Employees</div></div>
    <div class="kpi"><div class="v">${t.totalDepts}</div><div class="l" data-en="Departments" data-th="แผนก">Departments</div></div>
    <div class="kpi"><div class="v">${t.totalForeign}</div><div class="l" data-en="Foreign employees" data-th="พนักงานต่างชาติ">Foreign employees</div></div>
    <div class="kpi ${t.totalExpiring > 0 ? 'alert' : ''}"><div class="v">${t.totalExpiring}</div><div class="l" data-en="Docs expiring (60d)" data-th="เอกสารหมดอายุ (60 วัน)">Docs expiring (60d)</div></div>
  </div>

  <div class="alert-card">
    <h2 data-en="Renewal alerts — next 60 days" data-th="แจ้งเตือนการต่ออายุ — 60 วันข้างหน้า">Renewal alerts — next 60 days</h2>
    ${opts.alerts}
  </div>

  ${opts.sections}

  <footer>
    The Hills System · HR Project · NestJS + Prisma + PostgreSQL.
    APIs at <code>/api/employees</code>, <code>/api/departments</code>, <code>/api/positions</code>, <code>/api/certifications</code>, <code>/api/employees/expiring?days=60</code>, <code>/api/health</code>.
  </footer>
</div>

<script>
  function toggleLang() {
    var b = document.body;
    var lang = b.getAttribute('data-lang') === 'en' ? 'th' : 'en';
    b.setAttribute('data-lang', lang);
    document.querySelectorAll('[data-en]').forEach(function (el) {
      el.textContent = lang === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-th');
    });
    document.getElementById('langlabel').textContent =
      lang === 'en' ? '🌐 EN · switch to ไทย' : '🌐 ไทย · switch to EN';
  }
</script>
</body>
</html>`;
  }

  // ---------- employee detail page ----------

  private detailShell(emp: any, extra: { evals: any[]; docs: any[]; docsCompletion: any; annual: any[]; rosters: any[] }): string {
    const nameEn = `${esc(emp.firstName)} ${esc(emp.lastName)}`;
    const nameTh =
      emp.firstNameTh || emp.lastNameTh
        ? `${esc(emp.firstNameTh ?? '')} ${esc(emp.lastNameTh ?? '')}`.trim()
        : '';
    const nick = emp.nickname ? `&quot;${esc(emp.nickname)}&quot;` : '';
    const dept = emp.department
      ? `${esc(emp.department.code)} · ${esc(emp.department.name)}`
      : '—';
    const pos = emp.position ? esc(emp.position.title) : '—';
    const fc = emp.foreignCompliance;

    const identityCard = `
      <div class="detail-card">
        <h3>Identity</h3>
        <dl class="kv">
          <dt>Name</dt><dd>${nameEn} ${nick ? `<span class="muted">${nick}</span>` : ''}</dd>
          ${nameTh ? `<dt>ชื่อไทย</dt><dd>${nameTh}</dd>` : ''}
          <dt>Nationality</dt><dd>${esc(emp.nationality ?? '—')}</dd>
          <dt>Pronouns</dt><dd>${esc(emp.pronouns ?? '—')}</dd>
          <dt>Email</dt><dd>${esc(emp.email ?? '—')}</dd>
          <dt>Phone</dt><dd>${esc(emp.phone ?? '—')}</dd>
        </dl>
      </div>`;

    const employmentCard = `
      <div class="detail-card">
        <h3>Employment</h3>
        <dl class="kv">
          <dt>Department</dt><dd>${dept}</dd>
          <dt>Position</dt><dd>${pos}</dd>
          <dt>HOD?</dt><dd>${emp.isHod ? '<span class="chip gold">HOD</span>' : '—'}</dd>
          <dt>Term</dt><dd><span class="chip ${(emp.employmentTerm || '').toLowerCase().replace(/_/g, '-')}">${esc(emp.employmentTerm)}</span></dd>
          <dt>Status</dt><dd><span class="chip ${(emp.employmentStatus || '').toLowerCase().replace(/_/g, '-')}">${esc(emp.employmentStatus)}</span></dd>
          <dt>Hire date</dt><dd>${fmtDate(emp.hireDate)}</dd>
          <dt>Probation ends</dt><dd>${fmtDate(emp.probationEndDate)}</dd>
          <dt>Permanent since</dt><dd>${fmtDate(emp.permanentSinceDate)}</dd>
        </dl>
      </div>`;

    const complianceCard = fc
      ? `
      <div class="detail-card">
        <h3>Foreign-employee compliance</h3>
        <dl class="kv">
          <dt>Passport</dt><dd>${esc(fc.passportNumber ?? '—')} <span class="muted">${esc(fc.passportIssuingCountry ?? '')}</span></dd>
          <dt>Passport expiry</dt><dd>${fmtDate(fc.passportExpiry)} ${expiryBadge(fc.passportExpiry)}</dd>
          <dt>Visa</dt><dd>${esc(fc.visaType ?? '')} ${esc(fc.visaNumber ?? '')}</dd>
          <dt>Visa expiry</dt><dd>${fmtDate(fc.visaExpiry)} ${expiryBadge(fc.visaExpiry)}</dd>
          <dt>Work Permit</dt><dd>${esc(fc.workPermitNumber ?? '—')}</dd>
          <dt>WP expiry</dt><dd>${fmtDate(fc.workPermitExpiry)} ${expiryBadge(fc.workPermitExpiry)}</dd>
        </dl>
      </div>`
      : '';

    const certs = (emp.certifications as any[]) || [];
    const certsCard = `
      <div class="detail-card">
        <h3>Certifications (${certs.length})</h3>
        ${
          certs.length
            ? `<ul>${certs
                .map(
                  (c) =>
                    `<li><strong>${esc(c.name)}</strong>${c.nameTh ? ` <span class="muted">/ ${esc(c.nameTh)}</span>` : ''} — ${fmtDate(c.expiryDate)} ${expiryBadge(c.expiryDate)}${c.isRequiredForRole ? ' <span class="chip">required</span>' : ''}</li>`,
                )
                .join('')}</ul>`
            : '<p class="muted">No certifications on file.</p>'
        }
      </div>`;

    const evals = (extra.evals as any[]) || [];
    const evalsCard = `
      <div class="detail-card">
        <h3>Performance evaluations (${evals.length})</h3>
        ${
          evals.length
            ? `<ul>${evals
                .slice(0, 6)
                .map(
                  (ev) =>
                    `<li><strong>${esc(ev.periodLabel ?? ev.weightingSet ?? 'Evaluation')}</strong> — ${esc(ev.status ?? '—')}${ev.overallRating ? ` · <span class="chip">${esc(ev.overallRating)}</span>` : ''}${ev.dueDate ? ` · due ${fmtDate(ev.dueDate)}` : ''}</li>`,
                )
                .join('')}</ul>`
            : '<p class="muted">No evaluations recorded yet.</p>'
        }
      </div>`;

    const docs = (extra.docs as any[]) || [];
    const docsCard = `
      <div class="detail-card">
        <h3>Personnel document checklist${extra.docsCompletion ? ` (${extra.docsCompletion.complete}/${extra.docsCompletion.total})` : ''}</h3>
        ${
          docs.length
            ? `<ul>${docs
                .slice(0, 10)
                .map(
                  (d) =>
                    `<li><strong>${esc(d.documentName ?? d.documentCode ?? '—')}</strong> — <span class="chip">${esc(d.status ?? '—')}</span></li>`,
                )
                .join('')}${docs.length > 10 ? `<li class="muted">…and ${docs.length - 10} more</li>` : ''}</ul>`
            : '<p class="muted">No checklist items.</p>'
        }
      </div>`;

    const annual = (extra.annual as any[]) || [];
    const annualCard = `
      <div class="detail-card">
        <h3>Annual compliance (${annual.length})</h3>
        ${
          annual.length
            ? `<ul>${annual
                .map(
                  (a) =>
                    `<li><strong>${esc(a.type ?? '—')}</strong> — <span class="chip">${esc(a.status ?? '—')}</span>${a.dueDate ? ` · due ${fmtDate(a.dueDate)}` : ''}</li>`,
                )
                .join('')}</ul>`
            : '<p class="muted">Nothing recorded for social security / group insurance / annual health check yet.</p>'
        }
      </div>`;

    const rosters = (extra.rosters as any[]) || [];
    const rostersCard = `
      <div class="detail-card">
        <h3>Roster shifts (${rosters.length})</h3>
        ${
          rosters.length
            ? `<ul>${rosters
                .slice(0, 8)
                .map(
                  (r) =>
                    `<li>${fmtDate(r.shiftDate ?? r.weekStart)} <span class="chip">${esc(r.shiftType ?? '—')}</span> ${r.status ? `<span class="chip">${esc(r.status)}</span>` : ''}</li>`,
                )
                .join('')}${rosters.length > 8 ? `<li class="muted">…and ${rosters.length - 8} more</li>` : ''}</ul>`
            : '<p class="muted">No upcoming shifts.</p>'
        }
      </div>`;

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${nameEn} · Staff · HR Project</title>
<style>
  :root{--bg:#f6f8f9;--ink:#0f2e35;--muted:#5b7780;--line:#d7e3e6;--card:#fff;--teal:#0e8c8c;--teal-d:#0a6b6b;--teal-soft:#e3f3f3;--gold:#c8911f;--gold-soft:#fbf1da;--blue-soft:#e6eefc;--blue:#3c5fb4;--red:#d65a4a;--green:#2f9e6f;--green-soft:#e3f4ec;--slate:#33505a;--shadow:0 1px 2px rgba(15,46,53,.06),0 6px 22px rgba(15,46,53,.08)}
  *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Noto Sans Thai",Helvetica,Arial,sans-serif;line-height:1.45}
  .page{max-width:1100px;margin:0 auto;padding:24px 18px 60px}
  header{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:8px}
  h1{font-size:24px;margin:0}
  .kicker{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--teal-d);font-weight:700}
  nav.topnav{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0 14px}
  nav.topnav a{color:var(--ink);text-decoration:none;background:#fff;border:1px solid var(--line);border-radius:7px;padding:5px 10px;font-weight:600;font-size:12.5px;box-shadow:var(--shadow)}
  nav.topnav a.active{background:var(--teal-soft);border-color:#b7deda;color:var(--teal-d)}
  .back-link{display:inline-block;margin:0 0 8px;font-size:13px;color:var(--teal-d);text-decoration:none}
  .back-link:hover{color:var(--ink)}
  .chip{display:inline-block;font-size:10.5px;font-weight:700;border-radius:6px;padding:2px 7px;background:#eef3f4;color:var(--slate);margin-right:3px}
  .chip.permanent{background:var(--green-soft);color:var(--green)}
  .chip.probationary,.chip.daily-wages,.chip.fixed-term{background:var(--gold-soft);color:var(--gold)}
  .chip.contractor{background:#f1ecfb;color:#7a6cc4}
  .chip.active{background:var(--green-soft);color:var(--green)}
  .chip.probation{background:var(--gold-soft);color:var(--gold)}
  .chip.on-leave,.chip.suspended{background:#fdeceb;color:var(--red)}
  .chip.separated{background:#eef3f4;color:var(--muted)}
  .chip.gold{background:var(--gold-soft);color:var(--gold)}
  .chip.blue{background:var(--blue-soft);color:var(--blue)}
  .badge{display:inline-block;font-size:10px;font-weight:800;border-radius:4px;padding:1px 5px;margin-left:4px}
  .badge.ok{background:var(--green-soft);color:var(--green)}
  .badge.amber{background:var(--gold-soft);color:var(--gold)}
  .badge.red{background:#fdeceb;color:var(--red)}
  .muted{color:var(--muted)}
  .detail-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;margin-top:14px}
  .detail-card{background:#fff;border:1px solid var(--line);border-radius:12px;padding:14px;box-shadow:var(--shadow)}
  .detail-card h3{margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--slate)}
  .detail-card .kv{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;font-size:13px}
  .detail-card .kv dt{color:var(--muted);font-weight:600}
  .detail-card .kv dd{margin:0;font-weight:600}
  .detail-card ul{margin:6px 0 0;padding-left:18px;font-size:13px}
  .detail-card li{margin:3px 0}
  footer{margin-top:24px;color:var(--muted);font-size:12px;border-top:1px solid var(--line);padding-top:12px}
</style>
</head>
<body>
<div class="page">
  <a class="back-link" href="/staff">← Back to Staff Directory</a>
  <header>
    <div>
      <div class="kicker">The Hills System · HR Project · Employee</div>
      <h1>${nameEn} ${nick ? `<span class="muted" style="font-weight:600;font-size:18px">${nick}</span>` : ''}</h1>
      <div class="muted" style="font-size:13px">${dept} · ${pos}</div>
    </div>
  </header>

  <nav class="topnav">
    <a href="/system">Overview</a>
    <a href="/system/modules">Modules</a>
    <a href="/dashboard">HR Dashboard</a>
    <a class="active" href="/staff">Staff</a>
    <a href="/rosters">Rosters</a>
    <a href="/contractors">Contractors</a>
    <a href="/evaluations">Evaluations</a>
    <a href="/api/employees/${esc(emp.id)}">JSON</a>
  </nav>

  <div class="detail-grid">
    ${identityCard}
    ${employmentCard}
    ${complianceCard}
    ${certsCard}
    ${evalsCard}
    ${docsCard}
    ${annualCard}
    ${rostersCard}
  </div>

  <footer>
    Linked data for this employee: M03 Employee · ForeignEmployeeCompliance · Certification · Evaluation · DocumentChecklist · AnnualCompliance · Roster.
  </footer>
</div>
</body>
</html>`;
  }

  private detailErrorShell(id: string, message: string): string {
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Staff · not found</title>
<style>body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f6f8f9;color:#0f2e35;padding:40px}
.box{max-width:560px;margin:60px auto;background:#fff;border:1px solid #d7e3e6;border-radius:12px;padding:22px 24px;box-shadow:0 6px 22px rgba(15,46,53,.06)}
a{color:#0a6b6b}</style></head><body><div class="box">
<h2>Staff · not found</h2>
<p>${esc(message)}</p>
<p class="muted">Looked up <code>${esc(id)}</code>.</p>
<p><a href="/staff">← Back to Staff Directory</a> · <a href="/system">Overview</a> · <a href="/dashboard">HR Dashboard</a></p>
</div></body></html>`;
  }
}
