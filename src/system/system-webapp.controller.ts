import { Controller, Get, Header, NotFoundException, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { slugify, SystemService } from './system.service';

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
export class SystemWebappController {
  constructor(private readonly system: SystemService) {}

  @Get('system/apps')
  @Header('Content-Type', 'text/html; charset=utf-8')
  apps(@Res({ passthrough: false }) res: Response) {
    const apps = this.system.apps();
    const body = `<div class="grid cards">${apps
      .map((app: any) => `<a class="card linkcard" href="/system/apps/${esc(slugify(app.name))}">
        <div class="row"><h2>${esc(app.name)}</h2><span class="badge">${esc(app.modules.length)} modules</span></div>
        <p>${esc(app.purpose)}</p>
        <div class="muted">${esc(app.owner)}</div>
        <div class="chips">${app.modules.map((id: string) => `<span>${esc(id)}</span>`).join('')}</div>
      </a>`)
      .join('')}</div>`;
    res.send(this.frame('Apps', 'Nine v1 frontends that share one backend API.', body, 'apps'));
  }

  @Get('system/apps/:slug')
  @Header('Content-Type', 'text/html; charset=utf-8')
  appDetail(@Param('slug') slug: string, @Res({ passthrough: false }) res: Response) {
    const app = this.system.app(slug) as any;
    if (!app) throw new NotFoundException(`App ${slug} not found`);
    const body = `
      <section class="panel hero">
        <div>
          <div class="eyebrow">Department App</div>
          <h2>${esc(app.name)}</h2>
          <p>${esc(app.purpose)}</p>
          <div class="muted">${esc(app.owner)}</div>
        </div>
        <span class="badge big">${esc(app.modules.length)} modules</span>
      </section>
      <section class="panel">
        <div class="panel-head"><h2>Modules</h2><span class="count">${esc(app.moduleDetails.length)}</span></div>
        <div class="list">${app.moduleDetails.map((m: any) => this.moduleRow(m)).join('')}</div>
      </section>
      <div class="split">
        ${this.workflowPanel(app.workflows)}
        ${this.integrationPanel(app.integrations)}
      </div>`;
    res.send(this.frame(app.name, 'App workspace generated from the design documents.', body, 'apps'));
  }

  @Get('system/modules')
  @Header('Content-Type', 'text/html; charset=utf-8')
  modules(@Res({ passthrough: false }) res: Response) {
    const modules = this.system.modules();
    const layers = [...new Set(modules.map((m) => m.layer))];
    const body = `<div class="stack">${layers
      .map((layer) => {
        const rows = modules.filter((m) => m.layer === layer);
        return `<section class="panel"><div class="panel-head"><h2>${esc(layer)}</h2><span class="count">${rows.length}</span></div><div class="list">${rows
          .map((m) => this.moduleRow(m))
          .join('')}</div></section>`;
      })
      .join('')}</div>`;
    res.send(this.frame('Modules', 'The full 21-module operating model.', body, 'modules'));
  }

  @Get('system/modules/:id')
  @Header('Content-Type', 'text/html; charset=utf-8')
  moduleDetail(@Param('id') id: string, @Res({ passthrough: false }) res: Response) {
    const module = this.system.module(id) as any;
    if (!module) throw new NotFoundException(`Module ${id} not found`);
    const body = `
      <section class="panel hero">
        <div>
          <div class="eyebrow">${esc(module.layer)} / ${esc(module.phase)}</div>
          <h2>${esc(module.id)} - ${esc(module.name)}</h2>
          <p>${esc(module.summary)}</p>
          <div class="chips">${module.sources.map((s: string) => `<span>${esc(s)}</span>`).join('')}</div>
        </div>
        <span class="badge big ${esc(module.status)}">${esc(module.status)}</span>
      </section>
      <div class="split">
        <section class="panel">
          <div class="panel-head"><h2>Apps</h2><span class="count">${module.apps.length}</span></div>
          <div class="list">${module.apps.map((app: any) => `<a class="rowlink" href="/system/apps/${esc(slugify(app.name))}"><strong>${esc(app.name)}</strong><span>${esc(app.owner)}</span></a>`).join('') || this.empty('No app mapping.')}</div>
        </section>
        <section class="panel">
          <div class="panel-head"><h2>Source Documents</h2><span class="count">${module.documents.length}</span></div>
          <div class="list">${module.documents.map((doc: any) => `<div class="rowlink"><strong>${esc(doc.title)}</strong><span>${esc(doc.file)}</span></div>`).join('') || this.empty('No source documents mapped.')}</div>
        </section>
      </div>
      <div class="split">
        ${this.workflowPanel(module.workflows)}
        ${this.integrationPanel(module.integrations)}
      </div>`;
    res.send(this.frame(`${module.id} ${module.name}`, 'Module detail.', body, 'modules'));
  }

  @Get('system/roadmap')
  @Header('Content-Type', 'text/html; charset=utf-8')
  roadmap(@Res({ passthrough: false }) res: Response) {
    const gates = this.system.roadmap();
    const body = `<div class="timeline">${gates
      .map((gate) => `<section class="panel gate"><div class="gate-id">${esc(gate.id)}</div><div><h2>${esc(gate.name)}</h2><div class="muted">${esc(gate.weeks)}</div><p>${esc(gate.objective)}</p><div class="chips">${gate.exitCriteria.map((x) => `<span>${esc(x)}</span>`).join('')}</div></div></section>`)
      .join('')}</div>`;
    res.send(this.frame('Roadmap', 'G1/G2/G3 build plan from the architecture documents.', body, 'roadmap'));
  }

  @Get('system/documents')
  @Header('Content-Type', 'text/html; charset=utf-8')
  documents(@Res({ passthrough: false }) res: Response) {
    const docs = this.system.documents();
    const groups = [...new Set(docs.map((doc) => doc.group))];
    const body = `<div class="stack">${groups
      .map((group) => {
        const rows = docs.filter((doc) => doc.group === group);
        return `<section class="panel"><div class="panel-head"><h2>${esc(group)}</h2><span class="count">${rows.length}</span></div><table><thead><tr><th>Document</th><th>Role</th><th>File</th></tr></thead><tbody>${rows
          .map((doc) => `<tr><td><strong>${esc(doc.title)}</strong></td><td>${esc(doc.role)}</td><td><code>${esc(doc.file)}</code></td></tr>`)
          .join('')}</tbody></table></section>`;
      })
      .join('')}</div>`;
    res.send(this.frame('Documents', 'Source document inventory mapped into the webapp.', body, 'documents'));
  }

  @Get('system/workflows')
  @Header('Content-Type', 'text/html; charset=utf-8')
  workflows(@Res({ passthrough: false }) res: Response) {
    const workflows = this.system.workflows();
    const body = `<div class="grid cards">${workflows
      .map((workflow) => `<section class="card">
        <div class="row"><h2>${esc(workflow.name)}</h2><span class="badge">${esc(workflow.owner)}</span></div>
        <p><strong>Trigger:</strong> ${esc(workflow.trigger)}</p>
        <p><strong>Outcome:</strong> ${esc(workflow.outcome)}</p>
        <div class="chips">${workflow.modules.map((id) => `<span>${esc(id)}</span>`).join('')}</div>
        <ol>${workflow.steps.map((step) => `<li>${esc(step)}</li>`).join('')}</ol>
      </section>`)
      .join('')}</div>`;
    res.send(this.frame('Workflows', 'End-to-end operational flows across modules.', body, 'workflows'));
  }

  @Get('system/integrations')
  @Header('Content-Type', 'text/html; charset=utf-8')
  integrations(@Res({ passthrough: false }) res: Response) {
    const integrations = this.system.integrations();
    const body = `<div class="grid cards">${integrations
      .map((integration) => `<section class="card">
        <div class="row"><h2>${esc(integration.name)}</h2><span class="badge">${esc(integration.type)}</span></div>
        <p>${esc(integration.boundary)}</p>
        <div class="muted">${esc(integration.direction)} / ${esc(integration.owner)}</div>
        <div class="chips">${integration.modules.map((id) => `<span>${esc(id)}</span>`).join('')}</div>
      </section>`)
      .join('')}</div>`;
    res.send(this.frame('Integrations', 'External systems and cross-cutting runtime boundaries.', body, 'integrations'));
  }

  private frame(title: string, subtitle: string, body: string, active: string) {
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} - The Hills System</title>
<style>
  :root{--bg:#f5f7f8;--surface:#fff;--ink:#10272e;--muted:#60757e;--line:#d8e2e5;--teal:#0c7a76;--teal-soft:#e2f2ef;--green:#267a56;--green-soft:#e4f3eb;--amber:#b17b12;--amber-soft:#fff2d3;--indigo:#4058a8;--indigo-soft:#e9edfb;--shadow:0 1px 2px rgba(16,39,46,.05),0 8px 24px rgba(16,39,46,.07)}
  *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Noto Sans Thai",Arial,sans-serif;font-size:14px;line-height:1.45}
  .page{max-width:1240px;margin:0 auto;padding:22px 18px 44px}header{display:flex;justify-content:space-between;gap:16px;align-items:flex-end;margin-bottom:14px}
  .eyebrow{font-size:11px;font-weight:850;color:var(--teal);letter-spacing:.13em;text-transform:uppercase}h1{font-size:26px;margin:2px 0 0}h2{font-size:15px;margin:0}.subtitle,.muted{color:var(--muted);font-size:13px}
  nav{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 16px}nav a{color:var(--ink);text-decoration:none;background:var(--surface);border:1px solid var(--line);border-radius:7px;padding:7px 10px;font-weight:750;box-shadow:var(--shadow)}nav a.active{background:var(--teal-soft);border-color:#b7deda;color:var(--teal)}
  .stack{display:grid;gap:14px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.split{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}
  .panel,.card{background:var(--surface);border:1px solid var(--line);border-radius:8px;box-shadow:var(--shadow);overflow:hidden}.card{padding:12px}.linkcard{display:block;color:inherit;text-decoration:none}
  .hero{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;padding:16px}.hero h2{font-size:22px;margin:3px 0 6px}.hero p{max-width:780px;color:var(--muted);margin:0 0 8px}
  .panel-head{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:10px 12px;background:#fbfcfc;border-bottom:1px solid var(--line)}.count{font-size:11px;font-weight:850;color:var(--muted);background:#eef3f4;border-radius:999px;padding:2px 8px}
  .list{display:grid}.rowlink,.module-row{display:grid;grid-template-columns:90px 1fr auto;gap:10px;align-items:start;padding:10px 12px;border-top:1px solid #eef3f4;color:inherit;text-decoration:none}.rowlink:first-child,.module-row:first-child{border-top:0}.rowlink{grid-template-columns:1fr auto}
  .mod-id{font-weight:900;color:var(--teal)}.mod-name{font-weight:850}.mod-summary{color:var(--muted);font-size:12px;margin-top:1px}
  .row{display:flex;align-items:center;justify-content:space-between;gap:10px}.badge{display:inline-block;font-size:10.5px;font-weight:850;border-radius:5px;padding:2px 6px;background:#eef3f4;color:var(--muted);white-space:nowrap}.badge.big{font-size:13px;padding:5px 9px}.badge.implemented{background:var(--green-soft);color:var(--green)}.badge.partial{background:var(--amber-soft);color:var(--amber)}.badge.planned{background:var(--indigo-soft);color:var(--indigo)}
  .chips{display:flex;gap:5px;flex-wrap:wrap;margin-top:8px}.chips span{font-size:10.5px;font-weight:800;color:var(--teal);background:var(--teal-soft);border-radius:5px;padding:2px 6px}
  table{width:100%;border-collapse:collapse;font-size:13px}th{text-align:left;color:var(--muted);font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;background:#f5f8f8}th,td{padding:8px 10px;border-bottom:1px solid var(--line);vertical-align:top}tr:last-child td{border-bottom:0}code{font-family:Consolas,monospace;font-size:12px;color:var(--muted)}
  .timeline{display:grid;gap:12px}.gate{display:grid;grid-template-columns:72px 1fr;padding:14px}.gate-id{width:48px;height:48px;border-radius:8px;background:var(--teal);color:#fff;display:grid;place-items:center;font-weight:900;font-size:18px}ol{margin:10px 0 0;padding-left:20px}li{margin:4px 0}
  @media(max-width:900px){header{align-items:flex-start;flex-direction:column}.grid,.split{grid-template-columns:1fr}.rowlink,.module-row{grid-template-columns:60px 1fr}.rowlink{grid-template-columns:1fr}.module-row .badge{grid-column:2}.hero{display:block}.hero .badge{margin-top:10px}}
</style>
</head>
<body>
<div class="page">
  <header><div><div class="eyebrow">The Hills System</div><h1>${esc(title)}</h1><div class="subtitle">${esc(subtitle)}</div></div><div class="subtitle">Unified webapp shell</div></header>
  <nav>
    ${this.nav('Overview', '/system', active === 'overview')}
    ${this.nav('Apps', '/system/apps', active === 'apps')}
    ${this.nav('Modules', '/system/modules', active === 'modules')}
    ${this.nav('Workflows', '/system/workflows', active === 'workflows')}
    ${this.nav('Integrations', '/system/integrations', active === 'integrations')}
    ${this.nav('Roadmap', '/system/roadmap', active === 'roadmap')}
    ${this.nav('Docs', '/system/documents', active === 'documents')}
    ${this.nav('HR Dashboard', '/dashboard', false)}
    ${this.nav('Staff', '/staff', false)}
    ${this.nav('API', '/api/system', false)}
  </nav>
  ${body}
</div>
</body>
</html>`;
  }

  private nav(label: string, href: string, active: boolean) {
    return `<a href="${href}" class="${active ? 'active' : ''}">${esc(label)}</a>`;
  }

  private moduleRow(module: any) {
    return `<a class="module-row" href="/system/modules/${esc(module.id)}"><div class="mod-id">${esc(module.id)}</div><div><div class="mod-name">${esc(module.name)}</div><div class="mod-summary">${esc(module.summary)}</div><div class="chips"><span>${esc(module.layer)}</span><span>${esc(module.phase)}</span><span>${esc(module.app)}</span></div></div><span class="badge ${esc(module.status)}">${esc(module.status)}</span></a>`;
  }

  private workflowPanel(workflows: any[]) {
    return `<section class="panel"><div class="panel-head"><h2>Workflows</h2><span class="count">${workflows.length}</span></div><div class="list">${workflows
      .map((w) => `<div class="rowlink"><div><strong>${esc(w.name)}</strong><div class="muted">${esc(w.outcome)}</div><div class="chips">${w.modules.map((id: string) => `<span>${esc(id)}</span>`).join('')}</div></div><span class="badge">${esc(w.owner)}</span></div>`)
      .join('') || this.empty('No workflows mapped.')}</div></section>`;
  }

  private integrationPanel(integrations: any[]) {
    return `<section class="panel"><div class="panel-head"><h2>Integrations</h2><span class="count">${integrations.length}</span></div><div class="list">${integrations
      .map((i) => `<div class="rowlink"><div><strong>${esc(i.name)}</strong><div class="muted">${esc(i.boundary)}</div></div><span class="badge">${esc(i.type)}</span></div>`)
      .join('') || this.empty('No integrations mapped.')}</div></section>`;
  }

  private empty(text: string) {
    return `<div class="muted" style="padding:12px">${esc(text)}</div>`;
  }
}
