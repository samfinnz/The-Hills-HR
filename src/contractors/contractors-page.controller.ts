import { Controller, Get, Header, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ContractorsService } from './contractors.service';

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

function fmtThb(v: unknown): string {
  if (v === null || v === undefined) return '—';
  const n = parseFloat(String(v));
  if (isNaN(n)) return '—';
  return `฿${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function statusChip(status: string): string {
  const map: Record<string, { cls: string; label: string }> = {
    ACTIVE: { cls: 'active', label: 'Active' },
    INACTIVE: { cls: 'inactive', label: 'Inactive' },
    TERMINATED: { cls: 'terminated', label: 'Terminated' },
  };
  const s = map[status] ?? { cls: 'inactive', label: status };
  return `<span class="chip ${s.cls}">${esc(s.label)}</span>`;
}

function paymentChip(status: string): string {
  const map: Record<string, { cls: string; label: string }> = {
    PENDING: { cls: 'pending', label: 'Pending PV' },
    SUBMITTED_TO_WORK_FLOW: { cls: 'submitted', label: 'Submitted to Work Flow' },
    PAID: { cls: 'paid', label: 'Paid' },
  };
  const s = map[status] ?? { cls: 'pending', label: status };
  return `<span class="chip ${s.cls}">${esc(s.label)}</span>`;
}

function categoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    YOGA_MOVEMENT: 'Yoga / Movement',
    ART_THERAPY: 'Art Therapy',
    RELIGIOUS_SPIRITUAL: 'Religious / Spiritual',
    SOUND_HEALING: 'Sound Healing',
    MUSIC_ARTS_PERFORMANCE: 'Music / Arts',
    SPECIALIST_THERAPY: 'Specialist Therapy',
    OTHER: 'Other',
  };
  return labels[cat] ?? cat;
}

const CSS = `
  :root{
    --bg:#f6f8f9;--ink:#0f2e35;--muted:#5b7780;--line:#d7e3e6;--card:#fff;
    --teal:#0e8c8c;--teal-d:#0a6b6b;--teal-soft:#e3f3f3;--gold:#c8911f;--gold-soft:#fbf1da;
    --red:#d65a4a;--red-soft:#fdecea;--green:#2f9e6f;--green-soft:#e3f4ec;
    --slate:#33505a;--indigo:#4058a8;--indigo-soft:#e9edfb;
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
  .chip.active{background:var(--green-soft);color:var(--green)}
  .chip.inactive,.chip.terminated{background:#eef3f4;color:var(--muted)}
  .chip.pending{background:var(--gold-soft);color:var(--gold)}
  .chip.submitted{background:var(--indigo-soft);color:var(--indigo)}
  .chip.paid{background:var(--green-soft);color:var(--green)}
  .muted{color:var(--muted)}
  a.cont-link{color:var(--teal-d);text-decoration:none;font-weight:700}
  a.cont-link:hover{text-decoration:underline}
  .back-link{display:inline-block;margin:0 0 8px;font-size:13px;color:var(--teal-d);text-decoration:none}
  .back-link:hover{color:var(--ink)}
  .alert-panel{background:#fff;border:1px solid var(--line);border-left:4px solid var(--gold);border-radius:12px;padding:12px 14px;box-shadow:var(--shadow);margin-bottom:14px}
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
    <a class="active" href="/contractors">Contractors</a>
    <a href="/evaluations">Evaluations</a>
    <a href="/api/contractors">API</a>
  </nav>`;

@Controller()
export class ContractorsPageController {
  constructor(private readonly contractors: ContractorsService) {}

  @Get('contractors')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async list(@Res({ passthrough: false }) res: Response) {
    try {
      const [data, pendingSessions] = await Promise.all([
        this.contractors.list(),
        this.contractors.pendingPayments(),
      ]);

      const active = data.filter((c) => c.status === 'ACTIVE').length;
      const totalPending = pendingSessions.length;
      const pendingValue = pendingSessions.reduce(
        (sum, s) => sum + parseFloat(String(s.totalAmount ?? 0)),
        0,
      );

      const alertSection =
        pendingSessions.length > 0
          ? `<div class="alert-panel">
              <h2 style="margin:0 0 8px;font-size:14px;color:var(--gold)">Pending PV payments (${pendingSessions.length})</h2>
              <table>
                <thead><tr>
                  <th>Contractor</th><th>Service</th><th>Date</th><th>Amount</th><th>Status</th>
                </tr></thead>
                <tbody>
                  ${pendingSessions
                    .map(
                      (s) => `<tr>
                    <td><a class="cont-link" href="/contractors/${esc(s.contractorId)}">${esc(s.contractor.name)}</a></td>
                    <td class="muted">${esc(categoryLabel(s.serviceType))}</td>
                    <td class="muted">${fmtDate(s.sessionDate)}</td>
                    <td><strong>${fmtThb(s.totalAmount)}</strong></td>
                    <td>${paymentChip(s.paymentStatus)}</td>
                  </tr>`,
                    )
                    .join('')}
                </tbody>
              </table>
            </div>`
          : `<p class="muted" style="margin-bottom:14px">No pending PV payments.</p>`;

      const rows = data
        .map((c) => {
          const sessionCount = c.sessions?.length ?? 0;
          const pendingCount = c.sessions?.filter((s) => s.paymentStatus === 'PENDING').length ?? 0;
          return `<tr>
            <td><a class="cont-link" href="/contractors/${esc(c.id)}">${esc(c.name)}</a></td>
            <td class="muted">${esc(categoryLabel(c.serviceCategory))}</td>
            <td>${statusChip(c.status)}</td>
            <td class="muted">${fmtThb(c.standardRate)} / ${esc((c.paymentTerms ?? '').toLowerCase().replace(/_/g, ' '))}</td>
            <td class="muted">${esc(c.paymentMethod)}</td>
            <td>${sessionCount} session${sessionCount !== 1 ? 's' : ''}${pendingCount > 0 ? ` <span class="chip pending">${pendingCount} pending</span>` : ''}</td>
            <td class="muted">${esc(c.phone ?? '—')}</td>
          </tr>`;
        })
        .join('');

      const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Contractors · HR Project</title><style>${CSS}</style></head>
<body><div class="page">
<header>
  <div>
    <div class="kicker">The Hills System · HR Project</div>
    <h1>Contractor & Service Provider Registry</h1>
    <div class="muted" style="font-size:13px">Yoga, Art, Sound Healing, Spiritual — paid via M15 PV. Not in HumanSoft.</div>
  </div>
</header>
${NAV}
<div class="kpis">
  <div class="kpi"><div class="v">${data.length}</div><div class="l">Contractors</div></div>
  <div class="kpi"><div class="v" style="color:var(--green)">${active}</div><div class="l">Active</div></div>
  <div class="kpi ${totalPending > 0 ? 'alert' : ''}"><div class="v">${totalPending}</div><div class="l">Pending PV sessions</div></div>
  <div class="kpi ${totalPending > 0 ? 'alert' : ''}"><div class="v" style="font-size:18px">${fmtThb(pendingValue)}</div><div class="l">Pending PV value</div></div>
</div>
${alertSection}
<div class="panel">
  <div class="panel-head"><h2>All contractors</h2></div>
  <table>
    <thead><tr>
      <th>Name</th><th>Category</th><th>Status</th><th>Rate</th><th>Payment</th><th>Sessions</th><th>Phone</th>
    </tr></thead>
    <tbody>${data.length === 0 ? '<tr><td colspan="7" class="muted">No contractors registered yet.</td></tr>' : rows}</tbody>
  </table>
</div>
<footer>Contractor data via M17 HR module · Sessions become PV receipts through M15 Accounting · <a href="/api/contractors" style="color:var(--teal-d)">JSON API</a></footer>
</div></body></html>`;
      res.send(html);
    } catch {
      res.send(this.errorPage('Could not load contractors — is PostgreSQL reachable?'));
    }
  }

  @Get('contractors/:id')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async detail(@Param('id') id: string, @Res({ passthrough: false }) res: Response) {
    try {
      const c = await this.contractors.get(id);

      const totalEarned = c.sessions.reduce(
        (sum, s) => sum + parseFloat(String(s.totalAmount ?? 0)),
        0,
      );
      const pendingAmount = c.sessions
        .filter((s) => s.paymentStatus === 'PENDING')
        .reduce((sum, s) => sum + parseFloat(String(s.totalAmount ?? 0)), 0);

      const sessionRows = c.sessions
        .map((s) => `<tr>
          <td class="muted">${fmtDate(s.sessionDate)}</td>
          <td class="muted">${esc(categoryLabel(s.serviceType))}</td>
          <td class="muted">${s.durationHours ? `${s.durationHours}h` : '—'}</td>
          <td><strong>${fmtThb(s.totalAmount)}</strong></td>
          <td>${paymentChip(s.paymentStatus)}</td>
          <td class="muted">${esc(s.notes ?? '')}</td>
        </tr>`)
        .join('');

      const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(c.name)} · Contractors · HR Project</title><style>${CSS}</style></head>
<body><div class="page">
<a class="back-link" href="/contractors">← Back to Contractors</a>
<header>
  <div>
    <div class="kicker">The Hills System · HR Project · Contractor</div>
    <h1>${esc(c.name)}</h1>
    <div class="muted" style="font-size:13px">${esc(categoryLabel(c.serviceCategory))} · ${statusChip(c.status)}</div>
  </div>
</header>
${NAV.replace('active" href="/contractors"', 'active" href="/contractors"')}
<div class="kpis">
  <div class="kpi"><div class="v">${c.sessions.length}</div><div class="l">Total sessions</div></div>
  <div class="kpi"><div class="v" style="font-size:18px">${fmtThb(totalEarned)}</div><div class="l">Total earned</div></div>
  <div class="kpi ${pendingAmount > 0 ? 'alert' : ''}"><div class="v" style="font-size:18px">${fmtThb(pendingAmount)}</div><div class="l">Pending PV</div></div>
</div>
<div class="detail-grid">
  <div class="detail-card">
    <h3>Contact</h3>
    <dl class="kv">
      <dt>Phone</dt><dd>${esc(c.phone ?? '—')}</dd>
      <dt>Email</dt><dd>${esc(c.email ?? '—')}</dd>
      <dt>Tax ID</dt><dd>${esc(c.taxId ?? '—')}</dd>
    </dl>
  </div>
  <div class="detail-card">
    <h3>Payment terms</h3>
    <dl class="kv">
      <dt>Method</dt><dd>${esc(c.paymentMethod)}</dd>
      <dt>Terms</dt><dd>${esc((c.paymentTerms ?? '').toLowerCase().replace(/_/g, ' '))}</dd>
      <dt>Standard rate</dt><dd>${fmtThb(c.standardRate)}</dd>
    </dl>
  </div>
  ${c.notes ? `<div class="detail-card"><h3>Notes</h3><p style="margin:0;font-size:13px">${esc(c.notes)}</p></div>` : ''}
</div>
<h2>Sessions (${c.sessions.length})</h2>
<div class="panel">
  <table>
    <thead><tr>
      <th>Date</th><th>Service</th><th>Duration</th><th>Amount</th><th>Payment status</th><th>Notes</th>
    </tr></thead>
    <tbody>${c.sessions.length === 0 ? '<tr><td colspan="6" class="muted">No sessions recorded yet.</td></tr>' : sessionRows}</tbody>
  </table>
</div>
<footer>Contractor ID: <code>${esc(c.id)}</code></footer>
</div></body></html>`;
      res.send(html);
    } catch {
      res.send(this.errorPage(`Could not load contractor ${id}`));
    }
  }

  private errorPage(msg: string) {
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Contractors</title>
<style>body{margin:0;font-family:-apple-system,sans-serif;background:#f6f8f9;color:#0f2e35;padding:40px}
.box{max-width:540px;margin:60px auto;background:#fff;border:1px solid #d7e3e6;border-radius:12px;padding:22px 24px}
a{color:#0a6b6b}</style></head><body><div class="box">
<h2>Contractors</h2><p>${esc(msg)}</p>
<p><a href="/contractors">← Contractors</a> · <a href="/dashboard">Dashboard</a></p>
</div></body></html>`;
  }
}
