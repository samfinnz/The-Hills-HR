import { Controller, Get, Header, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { RostersService } from './rosters.service';

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
  return new Date(d).toISOString().slice(0, 10);
}

function fmtTime(d: Date | null | undefined): string {
  if (!d) return '';
  return new Date(d).toISOString().slice(11, 16);
}

function statusChip(status: string): string {
  const cls: Record<string, string> = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    EXPORTED_TO_HUMANSOFT: 'exported',
    ARCHIVED: 'archived',
  };
  const labels: Record<string, string> = {
    DRAFT: 'Draft',
    PUBLISHED: 'Published',
    EXPORTED_TO_HUMANSOFT: 'Exported to HumanSoft',
    ARCHIVED: 'Archived',
  };
  const c = cls[status] ?? 'draft';
  return `<span class="chip ${c}">${esc(labels[status] ?? status)}</span>`;
}

function shiftChip(type: string): string {
  const cls: Record<string, string> = {
    DAY: 'day', EVENING: 'evening', NIGHT: 'night', ON_CALL: 'oncall', OFF: 'off',
  };
  return `<span class="shift ${cls[type] ?? 'day'}">${esc(type)}</span>`;
}

const NAV = `
  <nav class="topnav">
    <a href="/system">Overview</a>
    <a href="/system/modules">Modules</a>
    <a href="/dashboard">HR Dashboard</a>
    <a href="/staff">Staff</a>
    <a class="active" href="/rosters">Rosters</a>
    <a href="/contractors">Contractors</a>
    <a href="/evaluations">Evaluations</a>
    <a href="/api/rosters">API</a>
  </nav>`;

const CSS = `
  :root{
    --bg:#f6f8f9;--ink:#0f2e35;--muted:#5b7780;--line:#d7e3e6;--card:#fff;
    --teal:#0e8c8c;--teal-d:#0a6b6b;--teal-soft:#e3f3f3;--gold:#c8911f;--gold-soft:#fbf1da;
    --red:#d65a4a;--green:#2f9e6f;--green-soft:#e3f4ec;--slate:#33505a;
    --indigo:#4058a8;--indigo-soft:#e9edfb;
    --shadow:0 1px 2px rgba(15,46,53,.06),0 6px 22px rgba(15,46,53,.08)
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Noto Sans Thai",Arial,sans-serif;line-height:1.45;font-size:14px}
  .page{max-width:1200px;margin:0 auto;padding:24px 18px 60px}
  header{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:8px}
  h1{font-size:22px;margin:0}h2{font-size:16px;margin:18px 0 8px;color:var(--slate)}
  .kicker{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--teal-d);font-weight:700}
  nav.topnav{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0 14px}
  nav.topnav a{color:var(--ink);text-decoration:none;background:#fff;border:1px solid var(--line);border-radius:7px;padding:5px 10px;font-weight:600;font-size:12.5px;box-shadow:var(--shadow)}
  nav.topnav a.active{background:var(--teal-soft);border-color:#b7deda;color:var(--teal-d)}
  .kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-bottom:18px}
  .kpi{background:#fff;border:1px solid var(--line);border-radius:11px;padding:11px 13px;box-shadow:var(--shadow)}
  .kpi .v{font-size:22px;font-weight:800}.kpi .l{font-size:11.5px;color:var(--muted)}
  .kpi.alert{background:var(--gold-soft);border-color:#ecd9a8}.kpi.alert .v{color:var(--gold)}
  .panel{background:#fff;border:1px solid var(--line);border-radius:12px;box-shadow:var(--shadow);overflow:hidden;margin-bottom:14px}
  .panel-head{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 14px;background:#f9fbfb;border-bottom:1px solid var(--line)}
  .panel-head h2{margin:0;font-size:14px;color:var(--slate)}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th{text-align:left;padding:8px 10px;background:#f3f8f8;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--slate);font-weight:700;border-bottom:1px solid var(--line)}
  td{padding:8px 10px;border-bottom:1px solid var(--line);vertical-align:top}
  tr:last-child td{border-bottom:0}
  .chip{display:inline-block;font-size:10.5px;font-weight:700;border-radius:6px;padding:2px 7px;background:#eef3f4;color:var(--slate);margin-right:3px}
  .chip.published{background:var(--green-soft);color:var(--green)}
  .chip.exported{background:var(--indigo-soft);color:var(--indigo)}
  .chip.draft{background:var(--gold-soft);color:var(--gold)}
  .chip.archived{background:#eef3f4;color:var(--muted)}
  .shift{display:inline-block;font-size:10px;font-weight:800;border-radius:4px;padding:1px 6px;margin-right:2px}
  .shift.day{background:#e8f4f8;color:#1a6080}
  .shift.evening{background:#fff3e0;color:#a05e00}
  .shift.night{background:#f0eaf8;color:#5a3f7e}
  .shift.oncall{background:#e3f3f3;color:var(--teal-d)}
  .shift.off{background:#f3f8f8;color:var(--muted)}
  .muted{color:var(--muted)}
  a.emp-link{color:var(--teal-d);text-decoration:none;border-bottom:1px dotted #b7deda}
  a.emp-link:hover{color:var(--ink)}
  a.roster-link{color:var(--teal-d);text-decoration:none;font-weight:700}
  a.roster-link:hover{text-decoration:underline}
  .btn{display:inline-block;padding:6px 12px;border-radius:7px;font-size:12px;font-weight:700;text-decoration:none;border:1px solid var(--line);background:#fff;color:var(--ink);cursor:pointer;box-shadow:var(--shadow)}
  .btn.teal{background:var(--teal-soft);border-color:#b7deda;color:var(--teal-d)}
  .btn.indigo{background:var(--indigo-soft);border-color:#c5ceef;color:var(--indigo)}
  .back-link{display:inline-block;margin:0 0 8px;font-size:13px;color:var(--teal-d);text-decoration:none}
  .back-link:hover{color:var(--ink)}
  .dept-badge{display:inline-block;background:var(--teal);color:#fff;border-radius:5px;padding:1px 7px;font-size:11px;font-weight:800;margin-right:6px}
  footer{margin-top:24px;color:var(--muted);font-size:12px;border-top:1px solid var(--line);padding-top:12px}`;

@Controller()
export class RostersPageController {
  constructor(private readonly rosters: RostersService) {}

  @Get('rosters')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async list(@Res({ passthrough: false }) res: Response) {
    try {
      const data = await this.rosters.list();

      const total = data.length;
      const published = data.filter((r) => r.status === 'PUBLISHED').length;
      const draft = data.filter((r) => r.status === 'DRAFT').length;
      const exported = data.filter((r) => r.status === 'EXPORTED_TO_HUMANSOFT').length;

      // group by department
      const byDept = new Map<string, { dept: any; rows: any[] }>();
      for (const r of data) {
        const key = r.departmentId;
        const slot = byDept.get(key) ?? { dept: r.department, rows: [] };
        slot.rows.push(r);
        byDept.set(key, slot);
      }

      const sections = [...byDept.values()]
        .sort((a, b) => (a.dept?.code ?? '').localeCompare(b.dept?.code ?? ''))
        .map(({ dept, rows }) => {
          const tableRows = rows
            .map((r) => {
              const entryCount = r.entries?.length ?? 0;
              return `<tr>
                <td><a class="roster-link" href="/rosters/${esc(r.id)}">${fmtDate(r.periodStart)} – ${fmtDate(r.periodEnd)}</a></td>
                <td>${statusChip(r.status)}</td>
                <td>${entryCount} shift${entryCount !== 1 ? 's' : ''}</td>
                <td class="muted">${esc(r.authoredByHod?.firstName ?? '')} ${esc(r.authoredByHod?.lastName ?? '')}</td>
                <td class="muted">${r.publishedAt ? fmtDate(r.publishedAt) : '—'}</td>
                <td>
                  <a class="btn teal" href="/rosters/${esc(r.id)}">View</a>
                  ${r.status === 'PUBLISHED' ? `<a class="btn indigo" href="/api/rosters/${esc(r.id)}/humansoft-csv" target="_blank">⬇ HumanSoft CSV</a>` : ''}
                </td>
              </tr>`;
            })
            .join('');

          return `
            <div class="panel">
              <div class="panel-head">
                <h2><span class="dept-badge">${esc(dept?.code ?? '?')}</span>${esc(dept?.name ?? 'Unknown')} ${dept?.nameTh ? `<span class="muted" style="font-size:12px">/ ${esc(dept.nameTh)}</span>` : ''}</h2>
                <span class="muted" style="font-size:12px">${rows.length} roster${rows.length !== 1 ? 's' : ''}</span>
              </div>
              <table>
                <thead><tr>
                  <th>Period</th><th>Status</th><th>Entries</th><th>Authored by HOD</th><th>Published</th><th>Actions</th>
                </tr></thead>
                <tbody>${tableRows}</tbody>
              </table>
            </div>`;
        })
        .join('');

      const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Rosters · HR Project</title><style>${CSS}</style></head>
<body><div class="page">
<header>
  <div><div class="kicker">The Hills System · HR Project</div><h1>Roster Authoring</h1><div class="muted" style="font-size:13px">Replacing SharePoint — HODs author here, export to HumanSoft</div></div>
</header>
${NAV}
<div class="kpis">
  <div class="kpi"><div class="v">${total}</div><div class="l">Total rosters</div></div>
  <div class="kpi"><div class="v">${draft}</div><div class="l">Draft</div></div>
  <div class="kpi"><div class="v" style="color:var(--green)">${published}</div><div class="l">Published</div></div>
  <div class="kpi"><div class="v" style="color:var(--indigo)">${exported}</div><div class="l">Exported to HumanSoft</div></div>
  <div class="kpi"><div class="v">${byDept.size}</div><div class="l">Departments</div></div>
</div>
${data.length === 0 ? '<p class="muted">No rosters yet. POST to <code>/api/rosters</code> to create the first one.</p>' : sections}
<footer>Roster data via M17 HR module · Exported CSV goes to HumanSoft for time-tracking · <a href="/api/rosters" style="color:var(--teal-d)">JSON API</a></footer>
</div></body></html>`;
      res.send(html);
    } catch {
      res.send(this.errorPage('Could not load rosters — is PostgreSQL reachable?'));
    }
  }

  @Get('rosters/:id')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async detail(@Param('id') id: string, @Res({ passthrough: false }) res: Response) {
    try {
      const r = await this.rosters.get(id);

      // group entries by date
      const byDate = new Map<string, any[]>();
      for (const e of r.entries) {
        const key = fmtDate(e.shiftDate);
        const slot = byDate.get(key) ?? [];
        slot.push(e);
        byDate.set(key, slot);
      }

      const dateSections = [...byDate.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, entries]) => {
          const rows = entries
            .sort((a, b) => (a.shiftStart?.getTime() ?? 0) - (b.shiftStart?.getTime() ?? 0))
            .map((e) => {
              const name = `${esc(e.employee.firstName)} ${esc(e.employee.lastName)}${e.employee.nickname ? ` <span class="muted">"${esc(e.employee.nickname)}"</span>` : ''}`;
              const pos = e.employee.position?.title ?? '—';
              const time =
                e.shiftStart && e.shiftEnd
                  ? `${fmtTime(e.shiftStart)} – ${fmtTime(e.shiftEnd)}`
                  : e.shiftStart
                    ? `from ${fmtTime(e.shiftStart)}`
                    : '—';
              return `<tr>
                <td><a class="emp-link" href="/staff/${esc(e.employeeId)}">${name}</a></td>
                <td class="muted">${esc(pos)}</td>
                <td>${shiftChip(e.shiftType)}</td>
                <td class="muted">${esc(time)}</td>
                <td class="muted">${esc(e.areaAssignment ?? '—')}</td>
                <td class="muted">${esc(e.notes ?? '')}</td>
              </tr>`;
            })
            .join('');

          return `
            <h2 style="margin-top:20px">${esc(date)}</h2>
            <div class="panel">
              <table>
                <thead><tr>
                  <th>Employee</th><th>Position</th><th>Shift</th><th>Time</th><th>Area</th><th>Notes</th>
                </tr></thead>
                <tbody>${rows}</tbody>
              </table>
            </div>`;
        })
        .join('');

      const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(r.department.code)} Roster ${fmtDate(r.periodStart)} · HR Project</title>
<style>${CSS}</style></head>
<body><div class="page">
<a class="back-link" href="/rosters">← Back to Rosters</a>
<header>
  <div>
    <div class="kicker">The Hills System · HR Project · Roster</div>
    <h1><span class="dept-badge">${esc(r.department.code)}</span>${esc(r.department.name)} ${fmtDate(r.periodStart)} – ${fmtDate(r.periodEnd)}</h1>
    <div class="muted" style="font-size:13px">${statusChip(r.status)} · ${r.entries.length} shift entries · authored by ${esc(r.authoredByHod?.firstName ?? '')} ${esc(r.authoredByHod?.lastName ?? '')}</div>
  </div>
  <div style="display:flex;gap:8px;align-items:flex-end">
    ${r.status === 'PUBLISHED' ? `<a class="btn indigo" href="/api/rosters/${esc(r.id)}/humansoft-csv" target="_blank">⬇ Export to HumanSoft CSV</a>` : ''}
    <a class="btn" href="/api/rosters/${esc(r.id)}" target="_blank">JSON</a>
  </div>
</header>
${NAV.replace('active" href="/rosters"', 'active" href="/rosters"')}
<div class="kpis">
  <div class="kpi"><div class="v">${r.entries.length}</div><div class="l">Shift entries</div></div>
  <div class="kpi"><div class="v">${new Set(r.entries.map((e) => e.employeeId)).size}</div><div class="l">Employees on roster</div></div>
  <div class="kpi"><div class="v">${r.entries.filter((e) => e.shiftType === 'DAY').length}</div><div class="l">Day shifts</div></div>
  <div class="kpi"><div class="v">${r.entries.filter((e) => e.shiftType === 'EVENING').length}</div><div class="l">Evening shifts</div></div>
  <div class="kpi"><div class="v">${r.entries.filter((e) => e.shiftType === 'NIGHT').length}</div><div class="l">Night shifts</div></div>
  <div class="kpi"><div class="v">${r.entries.filter((e) => e.shiftType === 'OFF').length}</div><div class="l">Days off</div></div>
</div>
${r.notes ? `<p style="color:var(--muted);font-size:13px;margin:0 0 14px"><strong>Notes:</strong> ${esc(r.notes)}</p>` : ''}
${r.entries.length === 0 ? '<p class="muted">No shift entries yet.</p>' : dateSections}
<footer>Roster ID: <code>${esc(r.id)}</code> · Published: ${fmtDate(r.publishedAt)} · HumanSoft export: ${fmtDate(r.exportedToHumanSoftAt)}</footer>
</div></body></html>`;
      res.send(html);
    } catch {
      res.send(this.errorPage(`Could not load roster ${id}`));
    }
  }

  private errorPage(msg: string) {
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Rosters</title>
<style>body{margin:0;font-family:-apple-system,sans-serif;background:#f6f8f9;color:#0f2e35;padding:40px}
.box{max-width:540px;margin:60px auto;background:#fff;border:1px solid #d7e3e6;border-radius:12px;padding:22px 24px}
a{color:#0a6b6b}</style></head><body><div class="box">
<h2>Rosters</h2><p>${esc(msg)}</p>
<p><a href="/rosters">← Rosters</a> · <a href="/dashboard">Dashboard</a> · <a href="/system">Overview</a></p>
</div></body></html>`;
  }
}
