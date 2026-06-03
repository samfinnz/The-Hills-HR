export interface SystemModule {
  id: string;
  name: string;
  layer: string;
  phase: string;
  app: string;
  status: 'implemented' | 'partial' | 'planned';
  summary: string;
  sources: string[];
}

export interface SystemApp {
  name: string;
  owner: string;
  modules: string[];
  purpose: string;
}

export interface BuildGate {
  id: string;
  name: string;
  weeks: string;
  objective: string;
  exitCriteria: string[];
}

export interface DesignDocument {
  file: string;
  group: string;
  title: string;
  role: string;
}

export interface SystemWorkflow {
  name: string;
  owner: string;
  modules: string[];
  trigger: string;
  outcome: string;
  steps: string[];
}

export interface SystemIntegration {
  name: string;
  type: string;
  owner: string;
  direction: string;
  modules: string[];
  boundary: string;
}

export const SYSTEM_MODULES: SystemModule[] = [
  {
    id: 'M01',
    name: 'Identity & Access',
    layer: 'Foundation',
    phase: 'Phase 1',
    app: 'Admin Console',
    status: 'planned',
    summary: 'Login, role-based permissions, facility scoping, audit logging, and deny-by-default access to sensitive records.',
    sources: ['PRD.md', 'Modules-Index.md'],
  },
  {
    id: 'M02',
    name: 'Client Registry',
    layer: 'Foundation',
    phase: 'Phase 1',
    app: 'Clinical / Admission',
    status: 'planned',
    summary: 'Client master record, lifecycle, room assignment history, guardian/ROI gates, and condition-driven clinical links.',
    sources: ['Data-Client.md', 'Data-Assessment-Scales.md'],
  },
  {
    id: 'M03',
    name: 'Employee Registry',
    layer: 'Foundation',
    phase: 'Phase 1',
    app: 'Admin Console',
    status: 'implemented',
    summary: 'Staff master record, departments, positions, HOD access views, certifications, and foreign-employee compliance.',
    sources: ['Data-HR.md'],
  },
  {
    id: 'M04',
    name: 'Document Vault',
    layer: 'Foundation',
    phase: 'Phase 1',
    app: 'Admin Console',
    status: 'planned',
    summary: 'Upload, tag, version, and retrieve documents across client, employee, inspection, billing, and workflow evidence.',
    sources: ['PRD.md', 'Data-Administration.md'],
  },
  {
    id: 'M05',
    name: 'Admissions',
    layer: 'Clinical',
    phase: 'Phase 2',
    app: 'Admission',
    status: 'planned',
    summary: 'Restricted inquiries database plus admission workflow that converts inquiries into admitted clients.',
    sources: ['Data-Inquiries.md'],
  },
  {
    id: 'M06',
    name: 'Counseling',
    layer: 'Clinical',
    phase: 'Phase 2',
    app: 'Counseling',
    status: 'planned',
    summary: 'Session calendar, SOAP-style notes, treatment plans, group therapy, twelve-step progress, and counselor reports.',
    sources: ['Data-Counselor.md', 'Integration-Meeting-Recorder.md'],
  },
  {
    id: 'M07',
    name: 'Nursing & Medical',
    layer: 'Clinical',
    phase: 'Phase 2',
    app: 'Clinical',
    status: 'planned',
    summary: 'Vitals, observations, MAR execution, incidents, handover, off-site visits, supplies, and clinical assessment scales.',
    sources: ['Data-Nurse.md', 'Data-Medical.md', 'Data-Assessment-Scales.md'],
  },
  {
    id: 'M08',
    name: 'Pharmacy',
    layer: 'Clinical',
    phase: 'Phase 2',
    app: 'Clinical',
    status: 'planned',
    summary: 'Clinical decision layer for prescribing, review, allergy pop-up, MAR, returns, recall, reorder, billing, and stickers; PharmaSys owns dispensary stock.',
    sources: ['Data-Pharmacist.md', 'Integration-Pharmasys.md'],
  },
  {
    id: 'M09',
    name: 'Client Support',
    layer: 'Clinical',
    phase: 'Phase 2',
    app: 'Support',
    status: 'planned',
    summary: 'Behaviour and mood observations, shopping lists, off-site errands, family communication, guardian reports, and aftercare logistics.',
    sources: ['Data-Support.md'],
  },
  {
    id: 'M10',
    name: 'Kitchen & Dietary',
    layer: 'Hospitality',
    phase: 'Phase 3',
    app: 'Kitchen',
    status: 'planned',
    summary: 'Recipes, ingredients, daily menu plan, market list, stock inflow/outflow, waste log, weekly count, and food cost per client per day.',
    sources: ['Data-Kitchen.md'],
  },
  {
    id: 'M11',
    name: 'Service & Dining',
    layer: 'Hospitality',
    phase: 'Phase 3',
    app: 'Kitchen',
    status: 'planned',
    summary: 'Service rosters, meal counts, dining-room incidents, and meal-service coordination.',
    sources: ['PRD.md', 'Modules-Index.md'],
  },
  {
    id: 'M12',
    name: 'Housekeeping',
    layer: 'Hospitality',
    phase: 'Phase 3',
    app: 'Housekeeping',
    status: 'planned',
    summary: 'Room registry, cleaning schedules, linen stock, damage reporting, laundry vendor, and mattress vendor workflows.',
    sources: ['Data-Housekeeping.md'],
  },
  {
    id: 'M13',
    name: 'Maintenance',
    layer: 'Facilities',
    phase: 'Phase 3',
    app: 'Maintenance',
    status: 'planned',
    summary: 'Repair requests, preventive maintenance, meter readings, anomaly detection, parts inventory, and outside-vendor work.',
    sources: ['Data-Maintenance.md'],
  },
  {
    id: 'M14',
    name: 'Grounds',
    layer: 'Facilities',
    phase: 'Phase 3',
    app: 'Maintenance',
    status: 'planned',
    summary: 'Garden schedule, irrigation, landscaping projects, pest control, and grounds work coordination.',
    sources: ['Modules-Index.md', 'Blueprint.md'],
  },
  {
    id: 'M15',
    name: 'Accounting',
    layer: 'Business',
    phase: 'Phase 4',
    app: 'Accounting',
    status: 'planned',
    summary: 'Receipt capture, reimbursement prep, Work Flow bridge, client billing, deposit ledger, cash accounts, and daily finance reports.',
    sources: ['Data-Accounting.md'],
  },
  {
    id: 'M16',
    name: 'Procurement',
    layer: 'Business',
    phase: 'Phase 4',
    app: 'Accounting',
    status: 'planned',
    summary: 'Light supplier catalog and reorder alerts while formal PR/PO/GR remains in Work Flow.',
    sources: ['PRD.md', 'Modules-Index.md'],
  },
  {
    id: 'M17',
    name: 'HR',
    layer: 'Business',
    phase: 'Phase 4',
    app: 'Admin Console',
    status: 'implemented',
    summary: 'HumanSoft overlay with evaluations, roster authoring, contractor registry, annual compliance, certifications, and renewal queues.',
    sources: ['Data-HR.md'],
  },
  {
    id: 'M18',
    name: 'Administration',
    layer: 'Business',
    phase: 'Phase 4',
    app: 'Admin Console',
    status: 'planned',
    summary: 'Licenses, contracts, recurring bills, vendors, inspections, SOP registry, renewal alerts, and inspection document library.',
    sources: ['Data-Administration.md', 'Findings-Administration-Review.md'],
  },
  {
    id: 'M19',
    name: 'CRM',
    layer: 'Insight',
    phase: 'Phase 5',
    app: 'Admission / Admin Console',
    status: 'planned',
    summary: 'Two-faced CRM for restricted pre-client inquiries and broader client relationship summaries, visa alerts, sponsors, and aftercare.',
    sources: ['PRD.md', 'Data-Inquiries.md'],
  },
  {
    id: 'M20',
    name: 'Reporting & Dashboards',
    layer: 'Insight',
    phase: 'Phase 5',
    app: 'Admin Console',
    status: 'partial',
    summary: 'Cross-module dashboards for census, occupancy, AR aging, dietary compliance, MAR completion, staff utilization, procurement spend, and deposit health.',
    sources: ['PRD.md', 'System-Integration.md'],
  },
  {
    id: 'M21',
    name: 'Property & Asset Registry',
    layer: 'Insight',
    phase: 'Phase 4',
    app: 'Admin Console / Maintenance',
    status: 'planned',
    summary: 'Facility-wide physical property, annual count, replacement-budget forecast, maintenance schedules, and department change requests.',
    sources: ['Data-Property.md'],
  },
];

export const SYSTEM_APPS: SystemApp[] = [
  {
    name: 'Admin / Director Console',
    owner: 'Admin, Director, HR',
    modules: ['M01', 'M03', 'M04', 'M17', 'M18', 'M20', 'M21'],
    purpose: 'Cross-cutting control center for staff, compliance, assets, SOPs, inspections, and leadership reporting.',
  },
  {
    name: 'Clinical',
    owner: 'Doctor, Nurse, Pharmacist',
    modules: ['M02', 'M07', 'M08'],
    purpose: 'Clinical record, MAR, prescriptions, assessment scales, nursing workflows, and PharmaSys boundary.',
  },
  {
    name: 'Admission',
    owner: 'Admission team',
    modules: ['M05', 'M19'],
    purpose: 'Inquiry capture, restricted CRM pipeline, alerts, nurture cadence, and admission conversion.',
  },
  {
    name: 'Counseling',
    owner: 'Counselors',
    modules: ['M06'],
    purpose: 'Session notes, treatment plans, group therapy, twelve-step progress, and recorder-assisted documentation.',
  },
  {
    name: 'Support',
    owner: 'Client support team',
    modules: ['M09'],
    purpose: 'Daily-life observations, client requests, shopping lists, guardian reports, and family communication.',
  },
  {
    name: 'Kitchen',
    owner: 'F&B / Kitchen',
    modules: ['M10', 'M11'],
    purpose: 'Menus, dietary safety, market lists, stock movement, meal counts, and food cost reporting.',
  },
  {
    name: 'Housekeeping',
    owner: 'Head Maid',
    modules: ['M12'],
    purpose: 'Rooms, cleaning, linen, damage reporting, laundry, and mattress workflows.',
  },
  {
    name: 'Maintenance',
    owner: 'Head Maintenance Technician',
    modules: ['M13', 'M14', 'M21'],
    purpose: 'Repairs, preventive maintenance, meters, grounds, parts, and asset maintenance events.',
  },
  {
    name: 'Accounting',
    owner: 'Accounting team',
    modules: ['M15', 'M16'],
    purpose: 'Receipt capture, Work Flow bridge, reimbursements, program-fee billing, deposits, and light procurement.',
  },
];

export const BUILD_GATES: BuildGate[] = [
  {
    id: 'G1',
    name: 'Foundation services online',
    weeks: 'Weeks 1-6',
    objective: 'Auth, audit, Postgres/RLS, shared kernel, n8n, document vault, notifications, and a reference Admin frontend.',
    exitCriteria: ['API online', 'Auth + RBAC baseline', 'Audit log', 'Document vault', 'n8n workflows', 'Design system skeleton'],
  },
  {
    id: 'G2',
    name: 'Nursing port + Accounting build',
    weeks: 'Weeks 7-16',
    objective: 'Port existing Nursing to the shared backend and launch Accounting receipt/deposit workflows.',
    exitCriteria: ['Nursing migrated safely', 'Shadow-write checked', 'Accounting receipt capture', 'Deposit ledger', 'Work Flow bridge'],
  },
  {
    id: 'G3',
    name: 'Remaining frontends rolling',
    weeks: 'Weeks 17-34',
    objective: 'Kitchen, Housekeeping, Maintenance, Admission, Counseling, Support, and full Admin Console roll out in waves.',
    exitCriteria: ['All v1 frontends usable', 'Cross-app workflows running', 'AACI dry-run ready', 'Post-MVP stabilization'],
  },
];

export const DESIGN_DOCUMENTS: DesignDocument[] = [
  { file: 'Blueprint.md', group: 'Strategy', title: 'Project Blueprint', role: 'Vision, principles, module narrative, rollout shape.' },
  { file: 'PRD.md', group: 'Strategy', title: 'Product Requirements', role: 'Functional requirements, personas, MVP, metrics, and risks.' },
  { file: 'Modules-Index.md', group: 'Strategy', title: 'Modules Index', role: '21-module map across 6 layers plus dependencies.' },
  { file: 'System-Integration.md', group: 'Architecture', title: 'System Integration', role: 'Workflow traces, access matrix, state machines, and integration checks.' },
  { file: 'Architecture-Decision-Monolith-vs-MultiApp.md', group: 'Architecture', title: 'Architecture Decision', role: 'Option C decision: shared backend API plus multiple frontends.' },
  { file: 'Architecture-Phase1-Build-Plan.md', group: 'Architecture', title: 'Phase 1 Build Plan', role: 'G1/G2/G3 engineering build sequence.' },
  { file: 'Architecture-App-Partition.md', group: 'Architecture', title: 'App Partition', role: 'Nine v1 apps, shared entities, and table ownership.' },
  { file: 'Build-Optimization-Plan.md', group: 'Build Review', title: 'Build Optimization Plan', role: 'Improve current IT build without restarting.' },
  { file: 'Build-vs-Design-Gap-Report.md', group: 'Build Review', title: 'Build Gap Report', role: 'Map live build to target design.' },
  { file: 'Findings-SharePoint-Review.md', group: 'Findings', title: 'SharePoint Review', role: 'Real document registry, external systems, and design validations.' },
  { file: 'Findings-Administration-Review.md', group: 'Findings', title: 'Administration Review', role: 'Corporate, bills, SOPs, inspections, and accounting findings.' },
  { file: 'Findings-Website-Review.md', group: 'Findings', title: 'Website Review', role: 'Public-facing facility facts and refinements.' },
  { file: 'Data-Client.md', group: 'Data', title: 'Client Data', role: 'Client master record and lifecycle.' },
  { file: 'Data-Assessment-Scales.md', group: 'Data', title: 'Assessment Scales', role: 'Condition-driven clinical assessment layer.' },
  { file: 'Data-Inquiries.md', group: 'Data', title: 'Inquiries', role: 'Restricted pre-client pipeline.' },
  { file: 'Data-Medical.md', group: 'Data', title: 'Medical Integration', role: 'Prescription, MAR, daily reports, off-site visit pattern.' },
  { file: 'Data-Nurse.md', group: 'Data', title: 'Nurse', role: 'Nursing forms, checklists, and workflows.' },
  { file: 'Data-Doctor.md', group: 'Data', title: 'Doctor', role: 'Doctor workflows and prescribing.' },
  { file: 'Data-Pharmacist.md', group: 'Data', title: 'Pharmacist', role: 'Medication catalog, stock model, pharmacist workflows.' },
  { file: 'Data-Counselor.md', group: 'Data', title: 'Counselor', role: 'Counseling notes, treatment plans, and reports.' },
  { file: 'Data-Support.md', group: 'Data', title: 'Support', role: 'Observation, shopping, family communication, and reports.' },
  { file: 'Data-Kitchen.md', group: 'Data', title: 'Kitchen', role: 'Recipes, menus, stock, cost, and market list.' },
  { file: 'Data-Housekeeping.md', group: 'Data', title: 'Housekeeping', role: 'Rooms, cleaning, damage, laundry, and mattress workflows.' },
  { file: 'Data-Maintenance.md', group: 'Data', title: 'Maintenance', role: 'Repairs, preventive maintenance, meters, and parts.' },
  { file: 'Data-Accounting.md', group: 'Data', title: 'Accounting', role: 'Receipts, reimbursements, Work Flow bridge, billing, deposits.' },
  { file: 'Data-Administration.md', group: 'Data', title: 'Administration', role: 'Licenses, contracts, bills, vendors, inspections, SOPs.' },
  { file: 'Data-HR.md', group: 'Data', title: 'HR', role: 'Employee registry, HumanSoft overlay, contractors, rosters, evaluations.' },
  { file: 'Data-Property.md', group: 'Data', title: 'Property', role: 'Assets, counts, replacement forecast, and maintenance links.' },
  { file: 'Integration-n8n.md', group: 'Integration', title: 'n8n Runtime', role: 'Workflow orchestration and AI agent runtime.' },
  { file: 'Integration-Pharmasys.md', group: 'Integration', title: 'PharmaSys', role: 'External dispensary boundary.' },
  { file: 'Integration-Bilingual-Translation.md', group: 'Integration', title: 'Bilingual Translation', role: 'TH/EN UI and translation agent.' },
  { file: 'Integration-Meeting-Recorder.md', group: 'Integration', title: 'Meeting Recorder', role: 'Consent, transcript, summary, and redaction workflow.' },
  { file: 'Integration-Cowork-Folders.md', group: 'Integration', title: 'Cowork Folders', role: 'Future folder-bus workflow triggers.' },
  { file: 'Build-Optimization-Mockup.html', group: 'UX', title: 'Build Optimization Mockup', role: 'HTML reference mockup.' },
  { file: 'UX-Clinical-Journey-Map.html', group: 'UX', title: 'Clinical Journey Map', role: 'HTML clinical journey reference.' },
  { file: 'UX-Clinical-User-Journey.md', group: 'UX', title: 'Clinical User Journey', role: 'Clinical UX principles and role journeys.' },
];

export const SYSTEM_WORKFLOWS: SystemWorkflow[] = [
  {
    name: 'Inquiry to Admission',
    owner: 'Admission team',
    modules: ['M05', 'M02', 'M04', 'M19'],
    trigger: 'New inquiry from website, email, Line, WhatsApp, or manual entry.',
    outcome: 'Inquiry is qualified, converted, and becomes an admitted client with required gates satisfied.',
    steps: ['Capture inquiry', 'Run restricted follow-up cadence', 'Check duplicate/ex-client match', 'Collect documents and guardian/ROI gates', 'Create client record', 'Move to admitted lifecycle'],
  },
  {
    name: 'Prescription to MAR',
    owner: 'Doctor, Pharmacist, Nurse',
    modules: ['M02', 'M07', 'M08'],
    trigger: 'Doctor writes or changes a medication order.',
    outcome: 'Reviewed medication order is dispensed via PharmaSys and executed in Hills MAR.',
    steps: ['Doctor enters prescription', 'Allergy pop-up checks client record', 'Pharmacist reviews order', 'Pharmacist re-keys dispense into PharmaSys', 'Per-meal labels/stickers print from Hills', 'Nurse administers and signs MAR'],
  },
  {
    name: 'Receipt to Work Flow',
    owner: 'Accounting team',
    modules: ['M15', 'M10', 'M12', 'M13', 'M18'],
    trigger: 'Staff member submits receipt evidence or online order proof.',
    outcome: 'Receipt is verified, routed, reconciled, and prepared for Work Flow PV/CA/CL processing.',
    steps: ['Capture receipt', 'OCR/extract line items', 'Tag source account and department', 'Route stock lines to owning module', 'Apply approval threshold', 'Export or submit to Work Flow', 'Track HQ paper trail'],
  },
  {
    name: 'Kitchen Menu to Market List',
    owner: 'Head Chef',
    modules: ['M10', 'M02', 'M15', 'M16'],
    trigger: 'Head Chef approves daily menu plan.',
    outcome: 'Diet-safe menu creates market list, stock movements, and cost-per-client reporting.',
    steps: ['Pick daily menus', 'Scan dietary conflicts', 'Explode recipes into ingredients', 'Apply yield-loss rules', 'Create market list', 'Record inflow/outflow', 'Run weekly inventory count'],
  },
  {
    name: 'Room Damage to Maintenance',
    owner: 'Head Maid and Maintenance',
    modules: ['M12', 'M13', 'M21', 'M15'],
    trigger: 'Housekeeping records damage, defect, or room issue.',
    outcome: 'Routine issues route direct to maintenance; major/critical/recurring issues escalate through HOD meeting.',
    steps: ['Log damage', 'Classify severity', 'Create maintenance work order', 'Assign technician/vendor', 'Record parts/vendor receipt', 'Close after originator sign-off'],
  },
  {
    name: 'HR Roster to HumanSoft',
    owner: 'HOD and HR',
    modules: ['M03', 'M17'],
    trigger: 'HOD publishes departmental roster.',
    outcome: 'Operational roster becomes the Hills source of truth and exports to HumanSoft for time tracking.',
    steps: ['HOD authors roster', 'Publish schedule', 'Operational modules read active shifts', 'Export HumanSoft CSV', 'HR verifies imported schedule'],
  },
  {
    name: 'Contractor Session to PV',
    owner: 'HR / Coordinator',
    modules: ['M17', 'M15'],
    trigger: 'Contractor completes service session.',
    outcome: 'Session evidence becomes PV-ready payment record without adding contractor to HumanSoft payroll.',
    steps: ['Record session', 'Attach agreement or invoice', 'Calculate rate/total', 'Submit PV evidence', 'Track Work Flow reference', 'Mark paid'],
  },
  {
    name: 'Renewal Alert Sweep',
    owner: 'Administration / HR',
    modules: ['M03', 'M17', 'M18', 'M21'],
    trigger: 'Daily n8n scheduled renewal scan.',
    outcome: 'Responsible admin and leadership receive lead-time alerts before documents, licenses, contracts, inspections, assets, or HR compliance items lapse.',
    steps: ['Scan expiry dates', 'Band green/amber/red', 'Email responsible admin', 'CC Director and Assistant Director', 'Escalate to Telegram near deadline', 'Log renewal completion'],
  },
  {
    name: 'Discharge Cascade',
    owner: 'Clinical and Accounting',
    modules: ['M02', 'M07', 'M08', 'M09', 'M15', 'M19'],
    trigger: 'Client discharge is scheduled or completed.',
    outcome: 'Clinical closure, medication returns/take-home, support aftercare, and deposit settlement stay synchronized.',
    steps: ['Set discharge state', 'Close clinical tasks', 'Prepare medication returns/take-home', 'Finalize support aftercare', 'Settle deposit ledger', 'Move CRM to aftercare'],
  },
];

export const SYSTEM_INTEGRATIONS: SystemIntegration[] = [
  {
    name: 'HumanSoft',
    type: 'External HR system',
    owner: 'HR',
    direction: 'Outbound roster export; manual duplicate employee entry',
    modules: ['M03', 'M17'],
    boundary: 'HumanSoft owns check-in/out, day-off, OT, tax filing, and payroll calculation. Hills owns employee references, rosters, evaluations, compliance, and contractor registry.',
  },
  {
    name: 'Work Flow',
    type: 'External accounting system',
    owner: 'Accounting',
    direction: 'Manual PV/CA/CL hand-off and reconciliation exports',
    modules: ['M15', 'M16', 'M17', 'M18'],
    boundary: 'Work Flow remains ledger/process system. Hills captures evidence, approval context, routing, and operational stock/deposit effects.',
  },
  {
    name: 'PharmaSys',
    type: 'External dispensary system',
    owner: 'Pharmacist',
    direction: 'Manual re-key from Hills order into PharmaSys',
    modules: ['M07', 'M08'],
    boundary: 'PharmaSys owns catalog, inventory, dispensing, pricing, and reports. Hills owns clinical order, allergy pop-up, MAR, returns, recall, billing, and stickers.',
  },
  {
    name: 'n8n',
    type: 'Orchestration runtime',
    owner: 'IT / Admin',
    direction: 'Scheduled jobs, AI workflows, notifications, and integrations',
    modules: ['M04', 'M05', 'M15', 'M18', 'M20'],
    boundary: 'Backend owns records and permissions; n8n owns long-running and event-driven orchestration.',
  },
  {
    name: 'SharePoint / OneDrive Folder Bus',
    type: 'Future input-folder integration',
    owner: 'IT',
    direction: 'Inbound document drops into workflow queues',
    modules: ['M04', 'M10', 'M15', 'M17', 'M18'],
    boundary: 'Folder bus is a v2+ input surface; web UI remains the approval surface for sensitive flows.',
  },
  {
    name: 'Telegram / Email',
    type: 'Notification channels',
    owner: 'Admin / IT',
    direction: 'Outbound alerts and reminders',
    modules: ['M05', 'M13', 'M15', 'M17', 'M18'],
    boundary: 'Notifications never approve consequential actions; humans remain responsible for approvals and sign-off.',
  },
  {
    name: 'Public Website',
    type: 'Inquiry source',
    owner: 'Admission / Marketing',
    direction: 'Inbound web inquiry submissions',
    modules: ['M05', 'M19'],
    boundary: 'Website submits inquiry leads; restricted admissions CRM owns follow-up and conversion.',
  },
  {
    name: 'Translation Agent',
    type: 'Bilingual TH/EN layer',
    owner: 'Admin / IT',
    direction: 'Bidirectional translation support',
    modules: ['M04', 'M18', 'M20'],
    boundary: 'Agent drafts and normalizes translations; approved operational text remains human-owned.',
  },
];
