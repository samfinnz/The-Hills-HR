import { Injectable } from '@nestjs/common';
import {
  BUILD_GATES,
  DESIGN_DOCUMENTS,
  SYSTEM_INTEGRATIONS,
  SYSTEM_APPS,
  SYSTEM_MODULES,
  SYSTEM_WORKFLOWS,
} from './system-manifest';

@Injectable()
export class SystemService {
  overview() {
    const byStatus = countBy(SYSTEM_MODULES, (m) => m.status);
    const byLayer = countBy(SYSTEM_MODULES, (m) => m.layer);
    const byPhase = countBy(SYSTEM_MODULES, (m) => m.phase);
    return {
      name: 'The Hills System',
      architecture: 'Option C - shared backend API plus nine v1 frontends',
      moduleCount: SYSTEM_MODULES.length,
      appCount: SYSTEM_APPS.length,
      documentCount: DESIGN_DOCUMENTS.length,
      gates: BUILD_GATES,
      counts: { byStatus, byLayer, byPhase },
      modules: SYSTEM_MODULES,
      apps: SYSTEM_APPS,
      documents: DESIGN_DOCUMENTS,
      workflows: SYSTEM_WORKFLOWS,
      integrations: SYSTEM_INTEGRATIONS,
    };
  }

  modules() {
    return SYSTEM_MODULES;
  }

  module(id: string) {
    const moduleId = id.toUpperCase();
    const item = SYSTEM_MODULES.find((m) => m.id === moduleId);
    if (!item) return null;
    return {
      ...item,
      apps: SYSTEM_APPS.filter((app) => app.modules.includes(item.id)),
      workflows: SYSTEM_WORKFLOWS.filter((workflow) =>
        workflow.modules.includes(item.id),
      ),
      integrations: SYSTEM_INTEGRATIONS.filter((integration) =>
        integration.modules.includes(item.id),
      ),
      documents: DESIGN_DOCUMENTS.filter((doc) =>
        item.sources.includes(doc.file),
      ),
    };
  }

  apps() {
    return SYSTEM_APPS.map((app) => ({
      ...app,
      moduleDetails: app.modules
        .map((id) => SYSTEM_MODULES.find((m) => m.id === id))
        .filter(Boolean),
    }));
  }

  app(slug: string) {
    const item = SYSTEM_APPS.find((app) => slugify(app.name) === slug);
    if (!item) return null;
    return {
      ...item,
      slug: slugify(item.name),
      moduleDetails: item.modules
        .map((id) => SYSTEM_MODULES.find((m) => m.id === id))
        .filter(Boolean),
      workflows: SYSTEM_WORKFLOWS.filter((workflow) =>
        workflow.modules.some((id) => item.modules.includes(id)),
      ),
      integrations: SYSTEM_INTEGRATIONS.filter((integration) =>
        integration.modules.some((id) => item.modules.includes(id)),
      ),
    };
  }

  documents() {
    return DESIGN_DOCUMENTS;
  }

  roadmap() {
    return BUILD_GATES;
  }

  workflows() {
    return SYSTEM_WORKFLOWS;
  }

  integrations() {
    return SYSTEM_INTEGRATIONS;
  }
}

function countBy<T>(rows: T[], keyFn: (row: T) => string) {
  return rows.reduce<Record<string, number>>((acc, row) => {
    const key = keyFn(row);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
