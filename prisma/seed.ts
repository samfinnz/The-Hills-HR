/**
 * HR Project — seed data.
 *
 * Realistic-shape data for The Hills System staff section, grounded in the
 * SharePoint dept codes (AD/HR/AC/PU/SM/NU/CN/SU/HK/FB/TE/GA/SE/HO/FI/CO/AM)
 * and a handful of named employees from the meeting minutes + testimonials.
 *
 * Run:  npx ts-node prisma/seed.ts   (or `npm run seed`)
 * Docker entrypoint runs this automatically on container start when the
 * `employee` table is empty.
 */
import {
  AnnualComplianceStatus,
  AnnualComplianceType,
  ContractorPaymentMethod,
  ContractorPaymentStatus,
  ContractorPaymentTerms,
  ContractorServiceCategory,
  DocumentChecklistStatus,
  EmploymentStatus,
  EmploymentTerm,
  EvaluationStatus,
  EvaluationWeightingSet,
  OverallRating,
  PrismaClient,
  RosterStatus,
  ShiftType,
} from '@prisma/client';

const prisma = new PrismaClient();

interface DeptSeed {
  code: string;
  name: string;
  nameTh: string;
  description?: string;
}

const DEPTS: DeptSeed[] = [
  { code: 'AD', name: 'Administration', nameTh: 'ฝ่ายบริหาร' },
  { code: 'HR', name: 'HR', nameTh: 'ทรัพยากรบุคคล' },
  { code: 'AC', name: 'Accounting', nameTh: 'บัญชี' },
  { code: 'PU', name: 'Purchase', nameTh: 'จัดซื้อ' },
  { code: 'SM', name: 'Sales & Marketing', nameTh: 'การตลาด' },
  { code: 'NU', name: 'Nursing', nameTh: 'พยาบาล' },
  { code: 'CN', name: 'Counselor', nameTh: 'นักบำบัด' },
  { code: 'SU', name: 'Support', nameTh: 'สนับสนุน' },
  { code: 'HK', name: 'Housekeeping', nameTh: 'แม่บ้าน' },
  { code: 'FB', name: 'F&B', nameTh: 'อาหารและเครื่องดื่ม' },
  { code: 'TE', name: 'Technician (Maintenance)', nameTh: 'ช่างซ่อมบำรุง' },
  { code: 'GA', name: 'Gardener', nameTh: 'สวน' },
  { code: 'SE', name: 'Security', nameTh: 'รักษาความปลอดภัย' },
  { code: 'HO', name: 'Holistic', nameTh: 'องค์รวม' },
  { code: 'FI', name: 'Fitness', nameTh: 'ฟิตเนส' },
  { code: 'CO', name: 'Counselor (SP)', nameTh: 'นักบำบัด (SP)' },
  { code: 'AM', name: 'Admission', nameTh: 'แผนกรับผู้ป่วยใหม่' },
];

interface PositionSeed {
  deptCode: string;
  code: string;
  title: string;
  titleTh: string;
  isHodTitle?: boolean;
}

const POSITIONS: PositionSeed[] = [
  // Admin
  { deptCode: 'AD', code: 'DIR', title: 'Rehab Director', titleTh: 'ผู้อำนวยการสถานฟื้นฟู', isHodTitle: true },
  { deptCode: 'AD', code: 'ASST', title: 'Assistant Director', titleTh: 'ผู้ช่วยผู้อำนวยการ' },
  { deptCode: 'AD', code: 'ADMIN', title: 'Administrator', titleTh: 'เจ้าหน้าที่ธุรการ' },
  // HR
  { deptCode: 'HR', code: 'MGR', title: 'HR Manager', titleTh: 'ผู้จัดการฝ่ายบุคคล', isHodTitle: true },
  { deptCode: 'HR', code: 'OFF', title: 'HR Officer', titleTh: 'เจ้าหน้าที่บุคคล' },
  // Accounting
  { deptCode: 'AC', code: 'LEAD', title: 'Accounting Lead', titleTh: 'หัวหน้าบัญชี', isHodTitle: true },
  { deptCode: 'AC', code: 'ACC', title: 'Accountant', titleTh: 'นักบัญชี' },
  { deptCode: 'AC', code: 'GRO', title: 'GRO (Cash Desk)', titleTh: 'GRO (โต๊ะเงินสด)' },
  // Purchase
  { deptCode: 'PU', code: 'PUR', title: 'Purchaser', titleTh: 'เจ้าหน้าที่จัดซื้อ', isHodTitle: true },
  // Sales & Marketing
  { deptCode: 'SM', code: 'ADM', title: 'Admission Agent', titleTh: 'เจ้าหน้าที่รับผู้ป่วยใหม่' },
  // Nursing
  { deptCode: 'NU', code: 'DR', title: 'Doctor', titleTh: 'แพทย์' },
  { deptCode: 'NU', code: 'HEAD', title: 'Head Nurse', titleTh: 'หัวหน้าพยาบาล', isHodTitle: true },
  { deptCode: 'NU', code: 'RN', title: 'Registered Nurse', titleTh: 'พยาบาลวิชาชีพ' },
  { deptCode: 'NU', code: 'NA', title: 'Nurse Assistant', titleTh: 'ผู้ช่วยพยาบาล' },
  { deptCode: 'NU', code: 'PHARM', title: 'Pharmacist', titleTh: 'เภสัชกร' },
  // Counselor
  { deptCode: 'CN', code: 'LEAD', title: 'Head Counselor', titleTh: 'หัวหน้านักบำบัด', isHodTitle: true },
  { deptCode: 'CN', code: 'CN', title: 'Counselor (Psychotherapist)', titleTh: 'นักบำบัด (นักจิตบำบัด)' },
  // Support
  { deptCode: 'SU', code: 'LEAD', title: 'Support Lead', titleTh: 'หัวหน้าซัพพอร์ต', isHodTitle: true },
  { deptCode: 'SU', code: 'SU', title: 'Client Supporter', titleTh: 'เจ้าหน้าที่ซัพพอร์ต' },
  // Housekeeping
  { deptCode: 'HK', code: 'HEAD', title: 'Head Maid', titleTh: 'หัวหน้าแม่บ้าน', isHodTitle: true },
  { deptCode: 'HK', code: 'MAID', title: 'Maid', titleTh: 'แม่บ้าน' },
  // F&B
  { deptCode: 'FB', code: 'CHEF', title: 'Head Chef', titleTh: 'หัวหน้าเชฟ', isHodTitle: true },
  { deptCode: 'FB', code: 'COOK', title: 'Cook', titleTh: 'พ่อครัว/แม่ครัว' },
  { deptCode: 'FB', code: 'SVC', title: 'Steward / Waiter', titleTh: 'เด็กเสิร์ฟ' },
  // Technician
  { deptCode: 'TE', code: 'HEAD', title: 'Head of Maintenance Technicians', titleTh: 'หัวหน้าช่าง', isHodTitle: true },
  { deptCode: 'TE', code: 'TECH', title: 'Maintenance Technician', titleTh: 'ช่างซ่อมบำรุง' },
  // Gardener
  { deptCode: 'GA', code: 'GARD', title: 'Gardener', titleTh: 'คนสวน' },
  // Security
  { deptCode: 'SE', code: 'GUARD', title: 'Security Guard', titleTh: 'พนักงานรักษาความปลอดภัย' },
  // Holistic
  { deptCode: 'HO', code: 'YOGA', title: 'Yoga Instructor', titleTh: 'ครูโยคะ' },
  { deptCode: 'HO', code: 'SOUND', title: 'Sound-Healing Practitioner', titleTh: 'นักบำบัดเสียง' },
  // Fitness
  { deptCode: 'FI', code: 'TRAINER', title: 'Personal Trainer', titleTh: 'เทรนเนอร์' },
];

interface EmpSeed {
  firstName: string;
  lastName: string;
  firstNameTh?: string;
  lastNameTh?: string;
  nickname?: string;
  nationality?: string;
  pronouns?: string;
  email?: string;
  phone?: string;
  deptCode: string;
  positionCode: string;
  isHod?: boolean;
  managerEmail?: string;
  term: EmploymentTerm;
  status?: EmploymentStatus;
  hireDate?: string;
  foreignCompliance?: {
    passportNumber?: string;
    passportIssuingCountry?: string;
    passportExpiry?: string;
    visaType?: string;
    visaNumber?: string;
    visaExpiry?: string;
    workPermitNumber?: string;
    workPermitExpiry?: string;
  };
  certifications?: Array<{
    name: string;
    nameTh?: string;
    issuingAuthority?: string;
    expiryDate?: string;
    required?: boolean;
  }>;
}

const EMPLOYEES: EmpSeed[] = [
  // Admin
  {
    firstName: 'Arina', lastName: 'Laphsiriphon', firstNameTh: 'อารีนา', lastNameTh: 'ลาภศิริผล',
    nickname: 'Aree', nationality: 'TH', pronouns: 'she/her',
    email: 'arina.l@thehillsrehabchiangmai.com',
    deptCode: 'AD', positionCode: 'DIR', isHod: true,
    term: EmploymentTerm.PERMANENT, status: EmploymentStatus.ACTIVE, hireDate: '2022-01-04',
  },
  {
    firstName: 'Yathida', lastName: 'Muangkham', firstNameTh: 'ญาธิดา', lastNameTh: 'เมืองคำ',
    nickname: 'Tida', nationality: 'TH', pronouns: 'she/her',
    deptCode: 'AD', positionCode: 'ASST',
    term: EmploymentTerm.PERMANENT, status: EmploymentStatus.ACTIVE, hireDate: '2022-04-01',
  },
  // HR
  {
    firstName: 'Jasmine', lastName: 'Sutthikun', firstNameTh: 'จัสมิน', lastNameTh: 'สุทธิคุณ',
    nickname: 'Jas', nationality: 'TH', pronouns: 'she/her',
    email: 'hr@thehillsrehabchiangmai.com',
    deptCode: 'HR', positionCode: 'MGR', isHod: true,
    term: EmploymentTerm.PERMANENT, status: EmploymentStatus.ACTIVE, hireDate: '2023-03-01',
  },
  // Accounting
  {
    firstName: 'Lee', lastName: 'Phuengphat', firstNameTh: 'พี่ลี', lastNameTh: 'พึ่งพัฒน์',
    nickname: 'Lee', nationality: 'TH', pronouns: 'she/her',
    deptCode: 'AC', positionCode: 'LEAD', isHod: true,
    term: EmploymentTerm.PERMANENT, status: EmploymentStatus.ACTIVE, hireDate: '2022-05-12',
  },
  {
    firstName: 'Yui', lastName: 'Wongchai', firstNameTh: 'ยุ้ย', lastNameTh: 'วงศ์ชัย',
    nickname: 'Yui', nationality: 'TH', pronouns: 'she/her',
    deptCode: 'AC', positionCode: 'GRO',
    term: EmploymentTerm.PERMANENT, status: EmploymentStatus.ACTIVE, hireDate: '2022-08-01',
  },
  // Nursing — Doctor + Head Nurse + RNs
  {
    firstName: 'Surasak', lastName: 'Tantiwong', firstNameTh: 'สุรศักดิ์', lastNameTh: 'ตันติวงศ์',
    nickname: 'Dr.S', nationality: 'TH', pronouns: 'he/him',
    deptCode: 'NU', positionCode: 'DR',
    term: EmploymentTerm.CONTRACTOR, status: EmploymentStatus.ACTIVE, hireDate: '2023-01-15',
    certifications: [
      { name: 'Medical License (Thailand)', nameTh: 'ใบอนุญาตประกอบวิชาชีพเวชกรรม', issuingAuthority: 'Medical Council of Thailand', expiryDate: '2027-12-31', required: true },
      { name: 'ACLS Provider', nameTh: 'การช่วยชีวิตขั้นสูง', expiryDate: '2026-09-30', required: true },
    ],
  },
  {
    firstName: 'Sansineey', lastName: 'Phromphan', firstNameTh: 'สัณห์สินีย์', lastNameTh: 'พรหมพันธ์',
    nickname: 'Sin', nationality: 'TH', pronouns: 'she/her',
    deptCode: 'NU', positionCode: 'HEAD', isHod: true,
    term: EmploymentTerm.PERMANENT, status: EmploymentStatus.ACTIVE, hireDate: '2022-07-01',
    certifications: [
      { name: 'Nursing License', nameTh: 'ใบประกอบวิชาชีพการพยาบาล', issuingAuthority: 'Thailand Nursing and Midwifery Council', expiryDate: '2026-08-15', required: true },
      { name: 'ACLS Provider', nameTh: 'การช่วยชีวิตขั้นสูง', expiryDate: '2026-07-10', required: true },
    ],
  },
  {
    firstName: 'Yim', lastName: 'Chaiyo', firstNameTh: 'ยิ้ม', lastNameTh: 'ชัยโย',
    nickname: 'Yim', nationality: 'TH', pronouns: 'she/her',
    deptCode: 'NU', positionCode: 'RN',
    term: EmploymentTerm.PERMANENT, status: EmploymentStatus.ACTIVE, hireDate: '2023-02-10',
    certifications: [
      { name: 'Nursing License', issuingAuthority: 'Thailand Nursing and Midwifery Council', expiryDate: '2027-02-28', required: true },
      { name: 'EFR (Emergency First Response)', expiryDate: '2026-11-15' },
    ],
  },
  {
    firstName: 'Mali', lastName: 'Sripun', firstNameTh: 'มะลิ', lastNameTh: 'ศรีปุ่น',
    nickname: 'Mali', nationality: 'TH', pronouns: 'she/her',
    deptCode: 'NU', positionCode: 'NA',
    term: EmploymentTerm.PERMANENT, status: EmploymentStatus.ACTIVE, hireDate: '2024-01-08',
  },
  {
    firstName: 'Natthaphon', lastName: 'Phaengpho', firstNameTh: 'ณัฐพล', lastNameTh: 'แพ่งโพธิ์',
    nickname: 'Nat', nationality: 'TH', pronouns: 'he/him',
    deptCode: 'NU', positionCode: 'PHARM',
    term: EmploymentTerm.PERMANENT, status: EmploymentStatus.ACTIVE, hireDate: '2023-11-01',
    certifications: [
      { name: 'Pharmacy License', nameTh: 'ใบประกอบวิชาชีพเภสัชกรรม', expiryDate: '2027-06-30', required: true },
    ],
  },
  // Counselor — including the foreign-employee story
  {
    firstName: 'Ahmed', lastName: 'Metwaly', nickname: 'Ahmed', nationality: 'EG',
    pronouns: 'he/him',
    deptCode: 'CN', positionCode: 'LEAD', isHod: true,
    term: EmploymentTerm.PERMANENT, status: EmploymentStatus.ACTIVE, hireDate: '2022-06-01',
    foreignCompliance: {
      passportNumber: 'A12345678', passportIssuingCountry: 'EG', passportExpiry: '2028-04-22',
      visaType: 'Non-B (Business)', visaNumber: 'NB-2025-0042', visaExpiry: '2026-07-15',
      workPermitNumber: 'WP-25-0042', workPermitExpiry: '2026-07-15',
    },
    certifications: [
      { name: 'EMDR Practitioner', expiryDate: '2027-05-30' },
      { name: 'CBT Certification', expiryDate: '2027-09-12' },
    ],
  },
  {
    firstName: 'Yuri', lastName: 'Cardozo', nickname: 'Yuri', nationality: 'BR', pronouns: 'she/her',
    deptCode: 'CN', positionCode: 'CN',
    term: EmploymentTerm.PERMANENT, status: EmploymentStatus.ACTIVE, hireDate: '2022-10-15',
    foreignCompliance: {
      passportNumber: 'B98765432', passportIssuingCountry: 'BR', passportExpiry: '2027-03-08',
      visaType: 'Non-B (Business)', visaNumber: 'NB-2025-0061', visaExpiry: '2026-06-22',
      workPermitNumber: 'WP-25-0061', workPermitExpiry: '2026-06-22',
    },
    certifications: [
      { name: 'DBT Skills Certificate', expiryDate: '2027-12-01' },
    ],
  },
  {
    firstName: 'Matthew', lastName: 'OConnor', nickname: 'Matt', nationality: 'IE', pronouns: 'he/him',
    deptCode: 'CN', positionCode: 'CN',
    term: EmploymentTerm.PERMANENT, status: EmploymentStatus.ACTIVE, hireDate: '2024-03-04',
    foreignCompliance: {
      passportNumber: 'P55667788', passportIssuingCountry: 'IE', passportExpiry: '2029-02-14',
      visaType: 'Non-B (Business)', visaNumber: 'NB-2025-0103', visaExpiry: '2027-04-30',
      workPermitNumber: 'WP-25-0103', workPermitExpiry: '2027-04-30',
    },
  },
  // Support
  {
    firstName: 'Peter', lastName: 'Smith', nickname: 'Peter', nationality: 'GB', pronouns: 'he/him',
    deptCode: 'SU', positionCode: 'LEAD', isHod: true,
    term: EmploymentTerm.PERMANENT, status: EmploymentStatus.ACTIVE, hireDate: '2022-04-20',
    foreignCompliance: {
      passportNumber: 'GB44556677', passportIssuingCountry: 'GB', passportExpiry: '2030-01-11',
      visaType: 'Non-B (Business)', visaNumber: 'NB-2025-0011', visaExpiry: '2026-12-30',
      workPermitNumber: 'WP-25-0011', workPermitExpiry: '2026-12-30',
    },
  },
  {
    firstName: 'Nan', lastName: 'Thanya', firstNameTh: 'น่าน', lastNameTh: 'ธัญญา',
    nickname: 'Nan', nationality: 'TH', pronouns: 'she/her',
    deptCode: 'SU', positionCode: 'SU',
    term: EmploymentTerm.PERMANENT, status: EmploymentStatus.ACTIVE, hireDate: '2024-06-01',
  },
  // Housekeeping
  {
    firstName: 'Nicha', lastName: 'Janchaichana', firstNameTh: 'ณิชา', lastNameTh: 'จันทร์ชัยชนะ',
    nickname: 'Nicha', nationality: 'TH', pronouns: 'she/her',
    deptCode: 'HK', positionCode: 'HEAD', isHod: true,
    term: EmploymentTerm.PERMANENT, status: EmploymentStatus.ACTIVE, hireDate: '2022-06-10',
  },
  {
    firstName: 'Som', lastName: 'Bunma', firstNameTh: 'ส้ม', lastNameTh: 'บุญมา',
    nickname: 'Som', nationality: 'TH',
    deptCode: 'HK', positionCode: 'MAID',
    term: EmploymentTerm.DAILY_WAGES, status: EmploymentStatus.ACTIVE, hireDate: '2024-09-01',
  },
  // F&B
  {
    firstName: 'Praew', lastName: 'Thapwong', firstNameTh: 'แพรว', lastNameTh: 'ทาพวง',
    nickname: 'Praew', nationality: 'TH', pronouns: 'she/her',
    deptCode: 'FB', positionCode: 'CHEF', isHod: true,
    term: EmploymentTerm.PERMANENT, status: EmploymentStatus.ACTIVE, hireDate: '2023-04-15',
    certifications: [
      { name: 'Food Handler Certification', nameTh: 'การสุขาภิบาลอาหาร', expiryDate: '2026-10-20', required: true },
    ],
  },
  {
    firstName: 'Bow', lastName: 'Phimchan', firstNameTh: 'โบว์', lastNameTh: 'พิมพ์จันทร์',
    nickname: 'Bow', nationality: 'TH',
    deptCode: 'FB', positionCode: 'COOK',
    term: EmploymentTerm.PERMANENT, status: EmploymentStatus.ACTIVE, hireDate: '2024-02-05',
    certifications: [
      { name: 'Food Handler Certification', nameTh: 'การสุขาภิบาลอาหาร', expiryDate: '2027-05-30' },
    ],
  },
  // Technician
  {
    firstName: 'Paweekorn', lastName: 'Udsom', firstNameTh: 'ปวีณ์กร', lastNameTh: 'อุดสม',
    nickname: 'Paw', nationality: 'TH', pronouns: 'he/him',
    deptCode: 'TE', positionCode: 'HEAD', isHod: true,
    term: EmploymentTerm.PERMANENT, status: EmploymentStatus.ACTIVE, hireDate: '2022-09-01',
  },
  {
    firstName: 'Win', lastName: 'Komkam', firstNameTh: 'วิน', lastNameTh: 'คมคำ',
    nickname: 'Win', nationality: 'TH',
    deptCode: 'TE', positionCode: 'TECH',
    term: EmploymentTerm.PERMANENT, status: EmploymentStatus.ACTIVE, hireDate: '2023-10-04',
  },
  // Gardener
  {
    firstName: 'Lung', lastName: 'Saen', firstNameTh: 'ลุง', lastNameTh: 'แสน',
    nickname: 'Lung', nationality: 'TH',
    deptCode: 'GA', positionCode: 'GARD',
    term: EmploymentTerm.DAILY_WAGES, status: EmploymentStatus.ACTIVE, hireDate: '2024-01-15',
  },
  // Security
  {
    firstName: 'Krit', lastName: 'Khampaeng', firstNameTh: 'กฤษณ์', lastNameTh: 'คำแพง',
    nickname: 'Krit', nationality: 'TH', pronouns: 'he/him',
    deptCode: 'SE', positionCode: 'GUARD',
    term: EmploymentTerm.PERMANENT, status: EmploymentStatus.ACTIVE, hireDate: '2023-07-01',
  },
  // Holistic (a department the design didn't model — surfaced from SharePoint)
  {
    firstName: 'Mali', lastName: 'Yokha', firstNameTh: 'มลิ', lastNameTh: 'โยคะ',
    nickname: 'Mali-Y', nationality: 'TH', pronouns: 'she/her',
    deptCode: 'HO', positionCode: 'YOGA',
    term: EmploymentTerm.CONTRACTOR, status: EmploymentStatus.ACTIVE, hireDate: '2024-05-01',
  },
  // Fitness
  {
    firstName: 'Tee', lastName: 'Wongchai', firstNameTh: 'ที', lastNameTh: 'วงศ์ชัย',
    nickname: 'Tee', nationality: 'TH', pronouns: 'he/him',
    deptCode: 'FI', positionCode: 'TRAINER',
    term: EmploymentTerm.PERMANENT, status: EmploymentStatus.ACTIVE, hireDate: '2023-08-20',
    certifications: [
      { name: 'Personal Trainer Certification (ACE)', expiryDate: '2027-08-20' },
      { name: 'EFR (Emergency First Response)', expiryDate: '2026-06-30' },
    ],
  },
];

async function upsertFacility() {
  let f = await prisma.facility.findFirst();
  if (!f) {
    f = await prisma.facility.create({
      data: {
        name: 'The Hills Rehab Chiang Mai',
        nameTh: 'เดอะฮิลส์ รีแฮบ เชียงใหม่',
        legalEntity: 'Mantra Asset Co., Ltd.',
      },
    });
  }
  return f;
}

async function main() {
  console.log('[seed] Starting…');
  const facility = await upsertFacility();
  console.log(`[seed] Facility: ${facility.name} (${facility.id})`);

  // Departments
  const deptByCode = new Map<string, string>();
  for (const d of DEPTS) {
    const rec = await prisma.department.upsert({
      where: { facilityId_code: { facilityId: facility.id, code: d.code } },
      update: { name: d.name, nameTh: d.nameTh, description: d.description },
      create: {
        facilityId: facility.id,
        code: d.code,
        name: d.name,
        nameTh: d.nameTh,
        description: d.description,
      },
    });
    deptByCode.set(d.code, rec.id);
  }
  console.log(`[seed] Departments: ${deptByCode.size}`);

  // Positions
  const posKey = new Map<string, string>();
  for (const p of POSITIONS) {
    const deptId = deptByCode.get(p.deptCode);
    if (!deptId) continue;
    const rec = await prisma.position.upsert({
      where: { departmentId_code: { departmentId: deptId, code: p.code } },
      update: { title: p.title, titleTh: p.titleTh, isHodTitle: !!p.isHodTitle },
      create: {
        departmentId: deptId,
        code: p.code,
        title: p.title,
        titleTh: p.titleTh,
        isHodTitle: !!p.isHodTitle,
      },
    });
    posKey.set(`${p.deptCode}:${p.code}`, rec.id);
  }
  console.log(`[seed] Positions: ${posKey.size}`);

  // Employees
  const emailIndex = new Map<string, string>();
  let createdCount = 0;
  for (const e of EMPLOYEES) {
    const deptId = deptByCode.get(e.deptCode);
    const positionId = posKey.get(`${e.deptCode}:${e.positionCode}`);
    if (!deptId || !positionId) {
      console.warn(
        `[seed] skipping ${e.firstName} ${e.lastName} — missing dept/position`,
      );
      continue;
    }

    // de-dup by (firstName, lastName, dept) — re-runs idempotent
    const existing = await prisma.employee.findFirst({
      where: {
        firstName: e.firstName,
        lastName: e.lastName,
        departmentId: deptId,
      },
    });
    if (existing) {
      if (e.email) emailIndex.set(e.email, existing.id);
      continue;
    }

    const emp = await prisma.employee.create({
      data: {
        facilityId: facility.id,
        firstName: e.firstName,
        lastName: e.lastName,
        firstNameTh: e.firstNameTh,
        lastNameTh: e.lastNameTh,
        nickname: e.nickname,
        nationality: e.nationality,
        pronouns: e.pronouns,
        email: e.email,
        phone: e.phone,
        departmentId: deptId,
        positionId,
        isHod: !!e.isHod,
        employmentTerm: e.term,
        employmentStatus: e.status ?? EmploymentStatus.ACTIVE,
        hireDate: e.hireDate ? new Date(e.hireDate) : null,
        foreignCompliance: e.foreignCompliance
          ? {
              create: {
                passportNumber: e.foreignCompliance.passportNumber,
                passportIssuingCountry: e.foreignCompliance.passportIssuingCountry,
                passportExpiry: e.foreignCompliance.passportExpiry
                  ? new Date(e.foreignCompliance.passportExpiry)
                  : null,
                visaType: e.foreignCompliance.visaType,
                visaNumber: e.foreignCompliance.visaNumber,
                visaExpiry: e.foreignCompliance.visaExpiry
                  ? new Date(e.foreignCompliance.visaExpiry)
                  : null,
                workPermitNumber: e.foreignCompliance.workPermitNumber,
                workPermitExpiry: e.foreignCompliance.workPermitExpiry
                  ? new Date(e.foreignCompliance.workPermitExpiry)
                  : null,
              },
            }
          : undefined,
        certifications: e.certifications && e.certifications.length
          ? {
              create: e.certifications.map((c) => ({
                name: c.name,
                nameTh: c.nameTh,
                issuingAuthority: c.issuingAuthority,
                expiryDate: c.expiryDate ? new Date(c.expiryDate) : null,
                isRequiredForRole: !!c.required,
              })),
            }
          : undefined,
      },
    });
    if (e.email) emailIndex.set(e.email, emp.id);
    createdCount++;
  }
  console.log(`[seed] Employees created: ${createdCount}`);

  const allEmployees = await prisma.employee.findMany({
    include: { department: true },
  });
  const employeeByName = new Map(
    allEmployees.map((e) => [`${e.firstName} ${e.lastName}`, e]),
  );
  const employee = (firstName: string, lastName: string) =>
    employeeByName.get(`${firstName} ${lastName}`);

  async function ensureDocument(
    employeeId: string,
    documentName: string,
    status: DocumentChecklistStatus,
    category: string,
    expiryDate?: string,
  ) {
    const existing = await prisma.documentChecklistItem.findFirst({
      where: { employeeId, documentName },
    });
    const data = {
      category,
      status,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      notes: 'Seeded from Data-HR required-document pattern.',
    };
    if (existing) {
      await prisma.documentChecklistItem.update({
        where: { id: existing.id },
        data,
      });
      return;
    }
    await prisma.documentChecklistItem.create({
      data: { employeeId, documentName, ...data },
    });
  }

  const ahmed = employee('Ahmed', 'Metwaly');
  const headNurse = employee('Sansineey', 'Phromphan');
  const nurseYim = employee('Yim', 'Chaiyo');
  const nurseMali = employee('Mali', 'Sripun');
  const chef = employee('Praew', 'Thapwong');

  if (ahmed) {
    await ensureDocument(
      ahmed.id,
      'Passport copy',
      DocumentChecklistStatus.ON_FILE,
      'foreign',
      '2028-04-22',
    );
    await ensureDocument(
      ahmed.id,
      'Work permit copy',
      DocumentChecklistStatus.ON_FILE,
      'foreign',
      '2026-07-15',
    );
  }
  if (chef) {
    await ensureDocument(
      chef.id,
      'Food handler certificate',
      DocumentChecklistStatus.ON_FILE,
      'role-specific',
      '2026-10-20',
    );
    await ensureDocument(
      chef.id,
      'Police clearance',
      DocumentChecklistStatus.MISSING,
      'role-specific',
    );
  }

  const nuDeptId = deptByCode.get('NU');
  if (nuDeptId && headNurse && nurseYim && nurseMali) {
    const periodStart = new Date('2026-06-01T00:00:00+07:00');
    const existingRoster = await prisma.roster.findFirst({
      where: { departmentId: nuDeptId, periodStart },
    });
    if (!existingRoster) {
      await prisma.roster.create({
        data: {
          facilityId: facility.id,
          departmentId: nuDeptId,
          periodStart,
          periodEnd: new Date('2026-06-07T23:59:59+07:00'),
          authoredByHodId: headNurse.id,
          status: RosterStatus.PUBLISHED,
          publishedAt: new Date('2026-05-29T09:00:00+07:00'),
          notes: 'Seed roster replacing SharePoint authoring for Nursing.',
          entries: {
            create: [
              {
                employeeId: headNurse.id,
                shiftDate: new Date('2026-06-01T00:00:00+07:00'),
                shiftStart: new Date('2026-06-01T07:00:00+07:00'),
                shiftEnd: new Date('2026-06-01T15:00:00+07:00'),
                shiftType: ShiftType.DAY,
                areaAssignment: 'Main nursing station',
              },
              {
                employeeId: nurseYim.id,
                shiftDate: new Date('2026-06-01T00:00:00+07:00'),
                shiftStart: new Date('2026-06-01T15:00:00+07:00'),
                shiftEnd: new Date('2026-06-01T23:00:00+07:00'),
                shiftType: ShiftType.EVENING,
                areaAssignment: '401-410',
              },
              {
                employeeId: nurseMali.id,
                shiftDate: new Date('2026-06-01T00:00:00+07:00'),
                shiftType: ShiftType.OFF,
                notes: 'Day off from published roster.',
              },
            ],
          },
        },
      });
    }
  }

  if (chef) {
    const existingEvaluation = await prisma.performanceEvaluation.findFirst({
      where: {
        employeeId: chef.id,
        periodStart: new Date('2026-01-01T00:00:00+07:00'),
        periodEnd: new Date('2026-12-31T23:59:59+07:00'),
      },
    });
    if (!existingEvaluation) {
      await prisma.performanceEvaluation.create({
        data: {
          employeeId: chef.id,
          periodStart: new Date('2026-01-01T00:00:00+07:00'),
          periodEnd: new Date('2026-12-31T23:59:59+07:00'),
          hrOwnerId: employee('Jasmine', 'Sutthikun')?.id,
          status: EvaluationStatus.DRAFT,
          weightingSet: EvaluationWeightingSet.MANAGER,
          overallRating: OverallRating.MEETS_EXPECTATIONS,
          kpiScore: 84,
          coreCompetencyScore: 81,
          functionalCompetencyScore: 88,
          weightedTotal: 83.9,
          strengths: 'Strong kitchen hygiene ownership and steady menu execution.',
          areasForDevelopment: 'Create monthly cost-control report by dish.',
          goalsNextPeriod: [
            { title: 'Standardize seasonal menu rotation', targetDate: '2026-08-31' },
          ],
        },
      });
    }
  }

  const contractor =
    (await prisma.contractor.findFirst({
      where: { facilityId: facility.id, name: 'Mali Yokha Yoga Studio' },
    })) ??
    (await prisma.contractor.create({
      data: {
        facilityId: facility.id,
        name: 'Mali Yokha Yoga Studio',
        serviceCategory: ContractorServiceCategory.YOGA_MOVEMENT,
        phone: '+66-80-000-0101',
        paymentMethod: ContractorPaymentMethod.BANK_TRANSFER,
        paymentTerms: ContractorPaymentTerms.PER_SESSION,
        standardRate: 2500,
        notes: 'Example contractor paid through M15 PV flow.',
      },
    }));
  const existingSession = await prisma.contractorSession.findFirst({
    where: {
      contractorId: contractor.id,
      sessionDate: new Date('2026-06-03T10:00:00+07:00'),
    },
  });
  if (!existingSession) {
    await prisma.contractorSession.create({
      data: {
        contractorId: contractor.id,
        sessionDate: new Date('2026-06-03T10:00:00+07:00'),
        serviceType: ContractorServiceCategory.YOGA_MOVEMENT,
        durationHours: 1.5,
        agreedRate: 2500,
        totalAmount: 2500,
        paymentStatus: ContractorPaymentStatus.PENDING,
        notes: 'Morning yoga group session.',
      },
    });
  }

  if (headNurse) {
    const existingHealthCheck = await prisma.annualComplianceItem.findFirst({
      where: {
        employeeId: headNurse.id,
        type: AnnualComplianceType.HEALTH_CHECKUP,
      },
    });
    if (!existingHealthCheck) {
      await prisma.annualComplianceItem.create({
        data: {
          employeeId: headNurse.id,
          type: AnnualComplianceType.HEALTH_CHECKUP,
          provider: 'Chiang Mai clinic',
          scheduledAt: new Date('2026-06-20T09:00:00+07:00'),
          status: AnnualComplianceStatus.SCHEDULED,
          notes: 'Annual health checkup seeded for HR dashboard.',
        },
      });
    }
  }

  console.log('[seed] HR workflows seeded.');
  console.log('[seed] Done.');
}

main()
  .catch((err) => {
    console.error('[seed] FAILED:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
