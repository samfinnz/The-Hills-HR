import { Controller, Get, Header, Res } from '@nestjs/common';
import type { Response } from 'express';
import { BuildGate, DesignDocument, SystemApp, SystemModule } from './system-manifest';
import { SystemService } from './system.service';

function esc(v: unknown): string {
  if (v === null || v === undefined) return '';
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

@Controller()
export class SystemPageController {
  constructor(private readonly system: SystemService) {}

  @Get('system')
  @Header('Content-Type', 'text/html; charset=utf-8')
  page(@Res({ passthrough: false }) res: Response) {
    res.send(this.shell(this.system.overview()));
  }

  private shell(data: ReturnType<SystemService['overview']>) {
    const modules = data.modules;
    const apps = data.apps;
    const docs = data.documents;
    const gates = data.gates;
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The Hills System</title>
<style>
  :root{
    --bg:#f5f7f8;--surface:#fff;--ink:#10272e;--muted:#60757e;--line:#d8e2e5;
    --teal:#0c7a76;--teal-soft:#e2f2ef;--green:#267a56;--green-soft:#e4f3eb;
    --amber:#b17b12;--amber-soft:#fff2d3;--red:#c75145;--red-soft:#fdecea;
    --indigo:#4058a8;--indigo-soft:#e9edfb;--shadow:0 1px 2px rgba(16,39,46,.05),0 8px 24px rgba(16,39,46,.07)
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Noto Sans Thai",Arial,sans-serif;font-size:14px;line-height:1.45}
  .page{max-width:1260px;margin:0 auto;padding:22px 18px 44px}
  header{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;margin-bottom:14px}
  .eyebrow{font-size:11px;font-weight:850;color:var(--teal);letter-spacing:.13em;text-transform:uppercase}
  h1{font-size:26px;margin:2px 0 0;letter-spacing:0}.subhead{color:var(--muted);font-size:13px;margin-top:2px}
  nav{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 16px}
  nav a{color:var(--ink);text-decoration:none;background:var(--surface);border:1px solid var(--line);border-radius:7px;padding:7px 10px;font-weight:750;box-shadow:var(--shadow)}
  nav a.active{background:var(--teal-soft);border-color:#b7deda;color:var(--teal)}
  .kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin-bottom:16px}
  .kpi{background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:12px;box-shadow:var(--shadow)}
  .kpi .label{font-size:10.5px;color:var(--muted);font-weight:850;text-transform:uppercase;letter-spacing:.07em}
  .kpi .value{font-size:28px;font-weight:850;margin-top:3px}
  .grid{display:grid;grid-template-columns:1.12fr .88fr;gap:14px;align-items:start}
  .stack{display:grid;gap:14px}
  .panel{background:var(--surface);border:1px solid var(--line);border-radius:8px;box-shadow:var(--shadow);overflow:hidden}
  .panel-head{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 12px;background:#fbfcfc;border-bottom:1px solid var(--line)}
  h2{font-size:14px;margin:0}.count{font-size:11px;font-weight:850;color:var(--muted);background:#eef3f4;border-radius:999px;padding:2px 8px}
  .layers{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;padding:12px}
  .layer{border:1px solid var(--line);border-radius:8px;padding:10px;background:#fff}
  .layer h3{margin:0 0 8px;font-size:13px}
  .module{display:grid;grid-template-columns:44px 1fr auto;gap:8px;align-items:start;padding:8px 0;border-top:1px solid #eef3f4}
  .module:first-of-type{border-top:0}.mod-id{font-weight:900;color:var(--teal)}
  .mod-name{font-weight:850}.mod-summary{color:var(--muted);font-size:12px;margin-top:1px}
  .badge{display:inline-block;font-size:10.5px;font-weight:850;border-radius:5px;padding:2px 6px;background:#eef3f4;color:var(--muted);white-space:nowrap}
  .badge.implemented{background:var(--green-soft);color:var(--green)}
  .badge.partial{background:var(--amber-soft);color:var(--amber)}
  .badge.planned{background:var(--indigo-soft);color:var(--indigo)}
  .cards{display:grid;gap:9px;padding:12px}.card{border:1px solid var(--line);border-radius:8px;padding:10px;background:#fff}
  .card-title{font-weight:850}.card-meta{color:var(--muted);font-size:12px;margin-top:2px}.chiprow{display:flex;gap:5px;flex-wrap:wrap;margin-top:8px}
  table{width:100%;border-collapse:collapse;font-size:13px}th{text-align:left;color:var(--muted);font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;background:#f5f8f8}
  th,td{padding:8px 10px;border-bottom:1px solid var(--line);vertical-align:top}tr:last-child td{border-bottom:0}
  .docgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:12px}
  .doc{border:1px solid var(--line);border-radius:8px;padding:9px;background:#fff}.doc-file{font-family:Consolas,monospace;font-size:11px;color:var(--muted);margin-top:2px}
  @media (max-width:980px){.grid,.layers,.docgrid{grid-template-columns:1fr}.kpis{grid-template-columns:repeat(2,minmax(0,1fr))}header{align-items:flex-start;flex-direction:column}}
  @media (max-width:560px){.page{padding:16px 10px 34px}.kpis{grid-template-columns:1fr}.module{grid-template-columns:40px 1fr} .module .badge{grid-column:2}h1{font-size:22px}}
</style>
</head>
<body>
<div class="page">
  <header>
    <div>
      <div class="eyebrow">Unified Project</div>
      <h1>The Hills System</h1>
      <div class="subhead">${esc(data.architecture)}</div>
    </div>
    <div class="subhead">Built from ${docs.length} design files</div>
  </header>
  <nav>
    <a class="active" href="/system">Overview</a>
    <a href="/system/apps">Apps</a>
    <a href="/system/modules">Modules</a>
    <a href="/system/workflows">Workflows</a>
    <a href="/system/integrations">Integrations</a>
    <a href="/system/roadmap">Roadmap</a>
    <a href="/system/documents">Docs</a>
    <a href="/dashboard">HR Dashboard</a>
    <a href="/staff">Staff</a>
    <a href="/api/system">API</a>
  </nav>
  <div class="kpis">
    ${this.kpi('Modules', data.moduleCount)}
    ${this.kpi('Apps', data.appCount)}
    ${this.kpi('Design Files', data.documentCount)}
    ${this.kpi('Implemented', data.counts.byStatus.implemented ?? 0)}
    ${this.kpi('Build Gates', gates.length)}
  </div>
  <div class="grid">
    <div class="stack">
      ${this.modulesPanel(modules)}
      ${this.documentsPanel(docs)}
    </div>
    <div class="stack">
      ${this.appsPanel(apps)}
      ${this.gatesPanel(gates)}
      ${this.integrationPanel()}
    </div>
  </div>
</div>
</body>
</html>`;
  }

  private kpi(label: string, value: unknown) {
    return `<div class="kpi"><div class="label">${esc(label)}</div><div class="value">${esc(value)}</div></div>`;
  }

  private panel(title: string, count: number, body: string) {
    return `<section class="panel"><div class="panel-head"><h2>${esc(title)}</h2><span class="count">${count}</span></div>${body}</section>`;
  }

  private modulesPanel(modules: SystemModule[]) {
    const layers = [...new Set(modules.map((m) => m.layer))];
    const body = `<div class="layers">${layers
      .map((layer) => {
        const rows = modules.filter((m) => m.layer === layer);
        return `<div class="layer"><h3>${esc(layer)}</h3>${rows
          .map((m) => `<div class="module"><div class="mod-id">${esc(m.id)}</div><div><div class="mod-name">${esc(m.name)}</div><div class="mod-summary">${esc(m.summary)}</div><div class="chiprow"><span class="badge">${esc(m.phase)}</span><span class="badge">${esc(m.app)}</span></div></div><span class="badge ${esc(m.status)}">${esc(m.status)}</span></div>`)
          .join('')}</div>`;
      })
      .join('')}</div>`;
    return this.panel('21 Modules Across 6 Layers', modules.length, body);
  }

  private appsPanel(apps: SystemApp[]) {
    const body = `<div class="cards">${apps
      .map((app) => `<div class="card"><div class="card-title">${esc(app.name)}</div><div class="card-meta">${esc(app.owner)}</div><div class="card-meta">${esc(app.purpose)}</div><div class="chiprow">${app.modules
        .map((id) => `<span class="badge">${esc(id)}</span>`)
        .join('')}</div></div>`)
      .join('')}</div>`;
    return this.panel('Nine v1 Apps', apps.length, body);
  }

  private gatesPanel(gates: BuildGate[]) {
    const body = `<table><thead><tr><th>Gate</th><th>Objective</th><th>Weeks</th></tr></thead><tbody>${gates
      .map((g) => `<tr><td><div class="mod-id">${esc(g.id)}</div><div class="card-title">${esc(g.name)}</div></td><td>${esc(g.objective)}<div class="chiprow">${g.exitCriteria
        .slice(0, 4)
        .map((x) => `<span class="badge">${esc(x)}</span>`)
        .join('')}</div></td><td><span class="badge partial">${esc(g.weeks)}</span></td></tr>`)
      .join('')}</tbody></table>`;
    return this.panel('Phase 1 Build Gates', gates.length, body);
  }

  private documentsPanel(docs: DesignDocument[]) {
    const body = `<div class="docgrid">${docs
      .map((doc) => `<div class="doc"><div class="card-title">${esc(doc.title)}</div><div class="card-meta">${esc(doc.group)} - ${esc(doc.role)}</div><div class="doc-file">${esc(doc.file)}</div></div>`)
      .join('')}</div>`;
    return this.panel('Source Documents Read Into This Project', docs.length, body);
  }

  private integrationPanel() {
    return this.panel(
      'Integration Spine',
      5,
      `<div class="cards">
        <div class="card"><div class="card-title">Shared Backend API</div><div class="card-meta">Owns business logic, RBAC, audit log, and cross-module contracts.</div></div>
        <div class="card"><div class="card-title">PostgreSQL + Prisma</div><div class="card-meta">Single operational data spine with future RLS and facility scoping.</div></div>
        <div class="card"><div class="card-title">n8n Runtime</div><div class="card-meta">Scheduled jobs, AI workflows, integrations, notifications, and folder-bus automation.</div></div>
        <div class="card"><div class="card-title">External Systems</div><div class="card-meta">HumanSoft for HR/payroll, Work Flow for accounting, PharmaSys for dispensary inventory.</div></div>
        <div class="card"><div class="card-title">Bilingual Layer</div><div class="card-meta">TH/EN UI, glossary discipline, and translation-agent workflows.</div></div>
      </div>`
    );
  }
}

// SANDBOX-TRUNCATION REPAIR: completed Bilingual Layer card-meta text, closed cards div, template literal, panel() call, method, and class.
