import { Controller, Get, Header, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { EvaluationsService } from './evaluations.service';

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

function daysUntil(d: Date | null | undefined): number | null {
  if (!d) return null;
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
}

function deadlineBadge(d: Date | null | undefined): string {
  const n = daysUntil(d);
  if (n === null) return '';
  if (n < 0) return `<span class="badge red">overdue ${-n}d</span>`;
  if (n <= 14) return `<span class="badge red">${n}d</span>`;
  if (n <= 30) return `<span class="badge amber">${n}d</span>`;
  return `<span class="badge ok">${n}d</span>`;
}

function statusChip(status: string): string {
  const map: Record<string, { cls: string; label: string }> = {
    DRAFT: { cls: 'draft', label: 'Draft' },
    SENT_TO_EMPLOYEE: { cls: 'sent', label: 'Sent to Employee' },
    DISCUSSION_HELD: { cls: 'discussion', label: 'Discussion Held' },
    SIGNED_OFF: { cls: 'signedoff', label: 'Signed Off' },
    ARCHIVED: { cls: 'archived', label: 'Archived' },
  };
  const s = map[status] ?? { cls: 'draft', label: status };
  return `<span class="chip ${s.cls}">${esc(s.label)}</span>`;
}

function ratingChip(rating: string | null | undefined): string {
  if (!rating) return '<span class="muted">—</span>';
  const map: Record<string, { cls: string; label: string }> = {
    OUTSTANDING: { cls: 'outstanding', label: 'Outstanding' },
    EXCEEDS_EXPECTATIONS: { cls: 'exceeds', label: 'Exceeds' },
    MEETS_EXPECTATIONS: { cls: 'meets', label: 'Meets' },
    NEEDS_IMPROVEMENT: { cls: 'needs', label: 'Needs Improvement' },
    UNSATISFACTORY: { cls: 'unsat', label: 'Unsatisfactory' },
  };
  const r = map[rating] ?? { cls: 'meets', label: rating };
  return `<span class="chip ${r.cls}">${esc(r.label)}</span>`;
}

const CSS = `
  :root{
    --bg:#f6f8f9;--ink:#0f2e35;--muted:#5b7780;--line:#d7e3e6;--card:#fff;
    --teal:#0e8c8c;--teal-d:#0a6b6b;--teal-soft:#e3f3f3;--gold:#c8911f;--gold-soft:#fbf1da;
    --red:#d65a4a;--red-soft:#fdecea;--green:#2f9e6f;--green-soft:#e3f4ec;
    --slate:#33505a;--indigo:#4058a8;--indigo-soft:#e9edfb;--amber:#d9a32a;
    --shadow:0 1px 2px rgba(15,46,53,.06),0 6px 22px rgba(15,46,53,.08)
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Noto Sans Thai",Arial,sans-serif;line-height:1.45;font-size:14px}
  .page{max-width:1200px;margin:0 auto;padding:24px 18px 60px}
  header{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:8px}
  h1{font-size:22px;margin:0}h2{font-size:15px;margin:18px 0 8px;color:var(--slate)}
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
  .chip.draft{background:var(--gold-soft);color:var(--gold)}
  .chip.sent{background:var(--indigo-soft);color:var(--indigo)}
  .chip.discussion{background:#e8f4f8;color:#1a6080}
  .chip.signedoff{background:var(--green-soft);color:var(--green)}
  .chip.archived{background:#eef3f4;color:var(--muted)}
  .chip.outstanding{background:#fef9ec;color:#8a6b00}
  .chip.exceeds{background:var(--green-soft);color:var(--green)}
  .chip.meets{background:#e8f4f8;color:#1a6080}
  .chip.needs,.chip.unsat{background:var(--red-soft);color:var(--red)}
  .badge{display:inline-block;font-size:10px;font-weight:800;border-radius:4px;padding:1px 5px;margin-left:4px}
  .badge.ok{background:var(--green-soft);color:var(--green)}
  .badge.amber{background:var(--gold-soft);color:var(--gold)}
  .badge.red{background:var(--red-soft);color:var(--red)}
  .muted{color:var(--muted)}
  a.emp-link{color:var(--teal-d);text-decoration:none;border-bottom:1px dotted #b7deda}
  a.emp-link:hover{color:var(--ink)}
  .score-bar{display:flex;gap:6px;align-items:center;font-size:12px}
  .score-val{font-weight:800;font-size:15px;color:var(--ink)}
  .score-label{color:var(--muted)}
  .back-link{display:inline-block;margin:0 0 8px;font-size:13px;color:var(--teal-d);text-decoration:none}
  .back-link:hover{color:var(--ink)}
  .detail-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin-top:14px}
  .detail-card{background:#fff;border:1px solid var(--line);border-radius:12px;padding:14px;box-shadow:var(--shadow)}
  .detail-card h3{margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--slate)}
  .detail-card .kv{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;font-size:13px}
  .detail-card .kv dt{color:var(--muted);font-weight:600}
  .detail-card .kv dd{margin:0;font-weight:600}
  footer{margin-top:24px;color:var(--muted);font-size:12px;border-top:1px solid var(--line);padding-top:12px}`;

const NAV = `
  <nav class="topnav">
    <a href="/system">Overview</a>
    <a href="/system/modules">Modules</a>
    <a href="/dashboard">HR Dashboard</a>
    <a href="/staff">Staff</a>
    <a href="/rosters">Rosters</a>
    <a href="/contractors">Contractors</a>
    <a class="active" href="/evaluations">Evaluations</a>
    <a href="/api/evaluations">API</a>
  </nav>`;

@Controller()
export class EvaluationsPageController {
  constructor(private readonly evaluations: EvaluationsService) {}

  @Get('evaluations')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async list(@Res({ passthrough: false }) res: Response) {
    try {
      const [all, due] = await Promise.all([
        this.evaluations.list(),
        this.evaluations.due(30),
      ]);

      const total = all.length;
      const draft = all.filter((e) => e.status === 'DRAFT').length;
      const signedOff = all.filter((e) => e.status === 'SIGNED_OFF').length;
      const dueCount = due.length;

      const makeRows = (rows: typeof all) =>
        rows
          .map((e) => {
            const name = `${esc(e.employee.firstName)} ${esc(e.employee.lastName)}`;
            const dept = e.employee.department?.name ?? '—';
            const pos = e.employee.position?.title ?? '—';
            return `<tr>
              <td><a class="emp-link" href="/staff/${esc(e.employeeId)}">${name}</a><div class="muted" style="font-size:11px">${esc(dept)} · ${esc(pos)}</div></td>
              <td class="muted">${fmtDate(e.periodStart)} – ${fmtDate(e.periodEnd)} ${deadlineBadge(e.periodEnd)}</td>
              <td>${statusChip(e.status)}</td>
              <td>${ratingChip(e.overallRating)}</td>
              <td class="muted" style="font-size:12px">${e.weightedTotal ? `<span class="score-val">${Number(e.weightedTotal).toFixed(1)}</span>` : '—'}</td>
              <td class="muted" style="font-size:12px">${e.evaluator ? `${esc(e.evaluator.firstName)} ${esc(e.evaluator.lastName)}` : '—'}</td>
              <td class="muted" style="font-size:12px">${fmtDate(e.scheduledMeetingAt)}</td>
            </tr>`;
          })
          .join('');

      const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Evaluations · HR Project</title><style>${CSS}</style></head>
<body><div class="page">
<header>
  <div>
    <div class="kicker">The Hills System · HR Project</div>
    <h1>Performance Evaluations</h1>
    <div class="muted" style="font-size:13px">KPI + Core + Functional competency scores · STAFF (50/20/30) and MANAGER (50/30/20) weighting sets</div>
  </div>
</header>
${NAV}
<div class="kpis">
  <div class="kpi"><div class="v">${total}</div><div class="l">Total evaluations</div></div>
  <div class="kpi"><div class="v">${draft}</div><div class="l">Draft</div></div>
  <div class="kpi"><div class="v" style="color:var(--green)">${signedOff}</div><div class="l">Signed off</div></div>
  <div class="kpi ${dueCount > 0 ? 'alert' : ''}"><div class="v">${dueCount}</div><div class="l">Due in 30 days</div></div>
</div>

${dueCount > 0 ? `
<div class="panel" style="border-left:4px solid var(--gold)">
  <div class="panel-head"><h2 style="color:var(--gold)">Due within 30 days (${dueCount})</h2></div>
  <table>
    <thead><tr><th>Employee</th><th>Period</th><th>Status</th><th>Rating</th><th>Score</th><th>Evaluator</th><th>Meeting</th></tr></thead>
    <tbody>${makeRows(due)}</tbody>
  </table>
</div>` : ''}

<div class="panel">
  <div class="panel-head"><h2>All evaluations</h2></div>
  <table>
    <thead><tr><th>Employee</th><th>Period</th><th>Status</th><th>Rating</th><th>Score</th><th>Evaluator</th><th>Meeting</th></tr></thead>
    <tbody>${all.length === 0 ? '<tr><td colspan="7" class="muted">No evaluations recorded yet.</td></tr>' : makeRows(all)}</tbody>
  </table>
</div>
<footer>Evaluation data via M17 HR module · <a href="/api/evaluations" style="color:var(--teal-d)">JSON API</a></footer>
</div></body></html>`;
      res.send(html);
    } catch {
      res.send(this.errorPage('Could not load evaluations — is PostgreSQL reachable?'));
    }
  }

  @Get('evaluations/:id')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async detail(@Param('id') id: string, @Res({ passthrough: false }) res: Response) {
    try {
      const e = await this.evaluations.get(id);
      const name = `${esc(e.employee.firstName)} ${esc(e.employee.lastName)}`;

      const scoresCard = `
        <div class="detail-card">
          <h3>Scores</h3>
          <div class="kv" style="display:grid;gap:6px">
            <div class="score-bar"><span class="score-label" style="width:160px">KPI</span> <span class="score-val">${e.kpiScore ? Number(e.kpiScore).toFixed(1) : '—'}</span></div>
            <div class="score-bar"><span class="score-label" style="width:160px">Core Competency</span> <span class="score-val">${e.coreCompetencyScore ? Number(e.coreCompetencyScore).toFixed(1) : '—'}</span></div>
            <div class="score-bar"><span class="score-label" style="width:160px">Functional Competency</span> <span class="score-val">${e.functionalCompetencyScore ? Number(e.functionalCompetencyScore).toFixed(1) : '—'}</span></div>
            <hr style="border:none;border-top:1px solid var(--line);margin:4px 0">
            <div class="score-bar"><span class="score-label" style="width:160px"><strong>Weighted Total</strong></span> <span class="score-val" style="font-size:20px">${e.weightedTotal ? Number(e.weightedTotal).toFixed(1) : '—'}</span></div>
          </div>
          <div style="margin-top:8px">${ratingChip(e.overallRating)} <span class="muted" style="font-size:12px">${esc(e.weightingSet ?? '')} weighting set</span></div>
        </div>`;

      const goals = e.goalsNextPeriod as Array<{ title: string; targetDate?: string }> | null;
      const goalsCard = goals?.length
        ? `<div class="detail-card">
            <h3>Goals next period</h3>
            <ul style="margin:0;padding-left:16px;font-size:13px">
              ${goals.map((g) => `<li><strong>${esc(g.title)}</strong>${g.targetDate ? ` <span class="muted">· by ${esc(g.targetDate)}</span>` : ''}</li>`).join('')}
            </ul>
          </div>`
        : '';

      const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} Evaluation · HR Project</title><style>${CSS}</style></head>
<body><div class="page">
<a class="back-link" href="/evaluations">← Back to Evaluations</a>
<header>
  <div>
    <div class="kicker">The Hills System · HR Project · Evaluation</div>
    <h1><a class="emp-link" href="/staff/${esc(e.employeeId)}">${name}</a></h1>
    <div class="muted" style="font-size:13px">
      ${esc(e.employee.department?.name ?? '—')} · ${esc(e.employee.position?.title ?? '—')} ·
      Period: ${fmtDate(e.periodStart)} – ${fmtDate(e.periodEnd)} ${deadlineBadge(e.periodEnd)}
    </div>
  </div>
</header>
${NAV.replace('active" href="/evaluations"', 'active" href="/evaluations"')}
<div class="kpis">
  <div class="kpi">${statusChip(e.status)}<div class="l" style="margin-top:4px">Status</div></div>
  <div class="kpi">${ratingChip(e.overallRating)}<div class="l" style="margin-top:4px">Overall rating</div></div>
  <div class="kpi"><div class="v">${e.weightedTotal ? Number(e.weightedTotal).toFixed(1) : '—'}</div><div class="l">Weighted total</div></div>
  <div class="kpi"><div class="v">${fmtDate(e.scheduledMeetingAt)}</div><div class="l">Meeting scheduled</div></div>
</div>
<div class="detail-grid">
  ${scoresCard}
  <div class="detail-card">
    <h3>People</h3>
    <dl class="kv">
      <dt>Employee</dt><dd><a class="emp-link" href="/staff/${esc(e.employeeId)}">${name}</a></dd>
      <dt>Evaluator</dt><dd>${e.evaluator ? `${esc(e.evaluator.firstName)} ${esc(e.evaluator.lastName)}` : '—'}</dd>
      <dt>HR owner</dt><dd>${e.hrOwner ? `${esc(e.hrOwner.firstName)} ${esc(e.hrOwner.lastName)}` : '—'}</dd>
      <dt>Meeting (scheduled)</dt><dd>${fmtDate(e.scheduledMeetingAt)}</dd>
      <dt>Meeting (actual)</dt><dd>${fmtDate(e.actualMeetingAt)}</dd>
    </dl>
  </div>
  ${e.strengths ? `<div class="detail-card"><h3>Strengths</h3><p style="margin:0;font-size:13px">${esc(e.strengths)}</p></div>` : ''}
  ${e.areasForDevelopment ? `<div class="detail-card"><h3>Areas for development</h3><p style="margin:0;font-size:13px">${esc(e.areasForDevelopment)}</p></div>` : ''}
  ${goalsCard}
  ${e.employeeComments ? `<div class="detail-card"><h3>Employee comments</h3><p style="margin:0;font-size:13px">${esc(e.employeeComments)}</p></div>` : ''}
</div>
<footer>Evaluation ID: <code>${esc(e.id)}</code> · <a href="/api/evaluations/${esc(e.id)}" style="color:var(--teal-d)">JSON</a></footer>
</div></body></html>`;
      res.send(html);
    } catch {
      res.send(this.errorPage(`Could not load evaluation ${id}`));
    }
  }

  private errorPage(msg: string) {
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Evaluations</title>
<style>body{margin:0;font-family:-apple-system,sans-serif;background:#f6f8f9;color:#0f2e35;padding:40px}
.box{max-width:540px;margin:60px auto;background:#fff;border:1px solid #d7e3e6;border-radius:12px;padding:22px 24px}
a{color:#0a6b6b}</style></head><body><div class="box">
<h2>Evaluations</h2><p>${esc(msg)}</p>
<p><a href="/evaluations">← Evaluations</a> · <a href="/dashboard">Dashboard</a></p>
</div></body></html>`;
  }
}
