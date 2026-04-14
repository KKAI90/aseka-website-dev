import ExcelJS from 'exceljs';

const wb = new ExcelJS.Workbook();
wb.creator = 'ASEKA';
wb.created = new Date();

// ─── Colors ───────────────────────────────────────────────────────────────────
const C = {
  navy:       'FF0B1F3A',
  navyLight:  'FF1A3A5C',
  white:      'FFFFFFFF',
  gray100:    'FFF5F5F5',
  gray200:    'FFE8E8E8',
  gray400:    'FFB0B0B0',
  green:      'FF2ECC71',
  greenLight: 'FFD5F5E3',
  blue:       'FF3498DB',
  blueLight:  'FFD6EAF8',
  orange:     'FFE67E22',
  orangeLight:'FFFDEBD0',
  red:        'FFE74C3C',
  redLight:   'FFFDEDEC',
  yellow:     'FFF1C40F',
  yellowLight:'FFFEF9E7',
  purple:     'FF9B59B6',
  purpleLight:'FFF4ECF7',
  teal:       'FF1ABC9C',
  tealLight:  'FFD1F2EB',
  gantt1:     'FF2980B9',
  gantt2:     'FF27AE60',
  ganttDone:  'FFB2DFDB',
  milestone:  'FFFF6B6B',
};

const PHASE_COLORS = [
  { bg: 'FF3498DB', light: 'FFD6EAF8' }, // Setup - blue
  { bg: 'FF2ECC71', light: 'FFD5F5E3' }, // Landing - green
  { bg: 'FFE67E22', light: 'FFFDEBD0' }, // Form - orange
  { bg: 'FF9B59B6', light: 'FFF4ECF7' }, // Admin - purple
  { bg: 'FF1ABC9C', light: 'FFD1F2EB' }, // AI - teal
  { bg: 'FFE74C3C', light: 'FFFDEDEC' }, // Mypage - red
  { bg: 'FFF1C40F', light: 'FFFEF9E7' }, // Testing - yellow
  { bg: 'FF0B1F3A', light: 'FFD6DBDF' }, // Launch - navy
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function addDate(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function fmtDate(d) {
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
}

function fmtMonth(d) {
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}`;
}

function headerStyle(bgHex, fgHex = C.white, size = 11, bold = true) {
  return {
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bgHex } },
    font: { bold, color: { argb: fgHex }, size, name: 'Calibri' },
    alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
    border: {
      top: { style: 'thin', color: { argb: 'FFB0B0B0' } },
      bottom: { style: 'thin', color: { argb: 'FFB0B0B0' } },
      left: { style: 'thin', color: { argb: 'FFB0B0B0' } },
      right: { style: 'thin', color: { argb: 'FFB0B0B0' } },
    },
  };
}

function cellStyle(bgHex, fgHex = 'FF1A1A1A', bold = false, align = 'left') {
  return {
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bgHex } },
    font: { bold, color: { argb: fgHex }, size: 10, name: 'Calibri' },
    alignment: { horizontal: align, vertical: 'middle', wrapText: true },
    border: {
      top: { style: 'hair', color: { argb: 'FFD0D0D0' } },
      bottom: { style: 'hair', color: { argb: 'FFD0D0D0' } },
      left: { style: 'thin', color: { argb: 'FFB0B0B0' } },
      right: { style: 'thin', color: { argb: 'FFB0B0B0' } },
    },
  };
}

function ganttCell(filled, color) {
  return filled
    ? { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: color } },
        border: { top: { style: 'hair', color: { argb: 'FFB0B0B0' } }, bottom: { style: 'hair', color: { argb: 'FFB0B0B0' } }, left: { style: 'hair', color: { argb: 'FFB0B0B0' } }, right: { style: 'hair', color: { argb: 'FFB0B0B0' } } } }
    : { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: C.gray100 } },
        border: { top: { style: 'hair', color: { argb: 'FFEBEBEB' } }, bottom: { style: 'hair', color: { argb: 'FFEBEBEB' } }, left: { style: 'hair', color: { argb: 'FFEBEBEB' } }, right: { style: 'hair', color: { argb: 'FFEBEBEB' } } } };
}

// ─── SHEET 1: COVER ───────────────────────────────────────────────────────────
function makeCover(wb) {
  const ws = wb.addWorksheet('📋 Tổng quan', { views: [{ showGridLines: false }] });
  ws.columns = [
    { width: 3 }, { width: 28 }, { width: 28 }, { width: 28 }, { width: 28 }, { width: 3 }
  ];

  // Title block
  ws.mergeCells('B1:E1');
  ws.getCell('B1').value = '';
  ws.getRow(1).height = 15;

  ws.mergeCells('B2:E2');
  const t = ws.getCell('B2');
  t.value = 'ASEKA PLATFORM';
  t.style = { fill: { type:'pattern', pattern:'solid', fgColor:{ argb: C.navy } },
    font: { bold: true, size: 28, color: { argb: C.white }, name: 'Calibri' },
    alignment: { horizontal: 'center', vertical: 'middle' } };
  ws.getRow(2).height = 55;

  ws.mergeCells('B3:E3');
  const sub = ws.getCell('B3');
  sub.value = 'Kế Hoạch Dự Án — Project Plan 2026';
  sub.style = { fill: { type:'pattern', pattern:'solid', fgColor:{ argb: C.navyLight } },
    font: { bold: false, size: 14, color: { argb: C.white }, name: 'Calibri' },
    alignment: { horizontal: 'center', vertical: 'middle' } };
  ws.getRow(3).height = 35;

  ws.getRow(4).height = 12;

  // Info block
  const infos = [
    ['Dự án', 'ASEKA Recruitment Platform'],
    ['Khách hàng', 'KK-AI / KKAI90'],
    ['Ngày bắt đầu', '01/04/2026'],
    ['Cập nhật', '28/03/2026'],
    ['Trạng thái', '🟡 Chuẩn bị khởi động'],
  ];
  infos.forEach(([k, v], i) => {
    const row = ws.getRow(5 + i);
    row.height = 24;
    ws.mergeCells(`B${5+i}:C${5+i}`);
    ws.mergeCells(`D${5+i}:E${5+i}`);
    const kCell = ws.getCell(`B${5+i}`);
    kCell.value = k;
    kCell.style = headerStyle(C.navy, C.white, 10);
    const vCell = ws.getCell(`D${5+i}`);
    vCell.value = v;
    vCell.style = cellStyle(C.gray100, 'FF1A1A1A', true, 'left');
  });

  ws.getRow(10).height = 18;

  // Option summary
  ws.mergeCells('B11:E11');
  ws.getCell('B11').value = 'TÓM TẮT 2 OPTIONS';
  ws.getCell('B11').style = headerStyle(C.navyLight, C.white, 12);
  ws.getRow(11).height = 28;

  const optHeaders = ['', 'OPTION 1 — 2 Người', 'OPTION 2 — 4 Người ✅'];
  const opts = [
    ['Team', '1 Fullstack + 1 Frontend', '1 Tech Lead + 1 Backend + 2 Frontend'],
    ['Timeline', '6–7 tháng', '3–4 tháng'],
    ['Bắt đầu', '01/04/2026', '01/04/2026'],
    ['Kết thúc dự kiến', '~31/10/2026', '~31/07/2026'],
    ['Tổng giờ', '620 giờ', '645 giờ'],
    ['Chi phí', '$17,250 (~250M VND)', '$18,150 (~265M VND)'],
    ['Khuyến nghị', 'Budget eo hẹp', '✅ Ưu tiên'],
  ];

  const hRow = ws.getRow(12);
  hRow.height = 22;
  ['B','C','D','E'].forEach((col, i) => {
    if (i === 0) return;
    const label = i === 1 ? 'OPTION 1 — 2 Người' : 'OPTION 2 — 4 Người ✅';
    ws.getCell(`${col}12`).value = label;
    ws.getCell(`${col}12`).style = headerStyle(i === 1 ? C.blue : C.green, C.white, 11);
  });
  ws.getCell('B12').value = '';
  ws.getCell('B12').style = headerStyle(C.navy, C.white, 11);

  opts.forEach(([label, v1, v2], i) => {
    const rn = 13 + i;
    const row = ws.getRow(rn);
    row.height = 22;
    const bg = i % 2 === 0 ? C.gray100 : C.white;
    ws.getCell(`B${rn}`).value = label;
    ws.getCell(`B${rn}`).style = cellStyle(C.gray200, 'FF1A1A1A', true, 'left');
    ws.getCell(`C${rn}`).value = v1;
    ws.getCell(`C${rn}`).style = cellStyle(bg, 'FF1A1A1A', false, 'center');
    ws.getCell(`D${rn}`).value = v2;
    ws.getCell(`D${rn}`).style = cellStyle(bg, 'FF1A1A1A', false, 'center');
    ws.getCell(`E${rn}`).value = '';
    ws.getCell(`E${rn}`).style = cellStyle(bg, C.white);
    ws.mergeCells(`D${rn}:E${rn}`);
  });

  ws.getRow(20).height = 18;

  // Phase overview table
  ws.mergeCells('B21:E21');
  ws.getCell('B21').value = 'CÁC GIAI ĐOẠN DỰ ÁN';
  ws.getCell('B21').style = headerStyle(C.navyLight, C.white, 12);
  ws.getRow(21).height = 28;

  const phaseHeaders = ['#', 'Giai đoạn', 'Nội dung chính', 'Deliverable'];
  ws.getRow(22).height = 22;
  ['B','C','D','E'].forEach((col, i) => {
    ws.getCell(`${col}22`).value = phaseHeaders[i];
    ws.getCell(`${col}22`).style = headerStyle(C.navy, C.white, 10);
  });

  const phases = [
    ['P1', 'Setup & Infrastructure', 'Repo, CI/CD, Supabase schema, Domain', 'Môi trường dev sẵn sàng'],
    ['P2', 'Landing Page', 'UI/UX, bilingual JP/VN, contact form', 'Website public live'],
    ['P3', 'Form Đăng Ký (/dang-ky)', 'Multi-step form 4 bước, xuất CV', 'Ứng viên đăng ký được'],
    ['P4', 'Admin Panel', 'Dashboard, quản lý ứng viên & việc làm', 'Admin quản lý đầy đủ'],
    ['P5', 'AI Module', 'CV analysis, tính KN, job matching', 'AI hoạt động chính xác'],
    ['P6', 'Candidate Portal', 'Mypage: TOP 10 jobs, pipeline, profile', 'Ứng viên xem việc được'],
    ['P7', 'Testing & QA', 'Unit test, E2E, load test, security', 'Hệ thống ổn định'],
    ['P8', 'Launch & Handover', 'Deploy production, training, docs', '🚀 Go Live'],
  ];

  phases.forEach(([num, name, content, deliverable], i) => {
    const rn = 23 + i;
    const row = ws.getRow(rn);
    row.height = 22;
    const pc = PHASE_COLORS[i];
    ws.getCell(`B${rn}`).value = num;
    ws.getCell(`B${rn}`).style = headerStyle(pc.bg, C.white, 10);
    ws.getCell(`C${rn}`).value = name;
    ws.getCell(`C${rn}`).style = cellStyle(pc.light, 'FF1A1A1A', true, 'left');
    ws.getCell(`D${rn}`).value = content;
    ws.getCell(`D${rn}`).style = cellStyle(i%2===0 ? C.gray100 : C.white, 'FF1A1A1A', false, 'left');
    ws.getCell(`E${rn}`).value = deliverable;
    ws.getCell(`E${rn}`).style = cellStyle(i%2===0 ? C.gray100 : C.white, 'FF1A1A1A', true, 'left');
  });

  // Legend
  ws.getRow(32).height = 18;
  ws.mergeCells('B33:E33');
  ws.getCell('B33').value = '📌 Ghi chú: Xem sheet "Option 1 - Gantt" và "Option 2 - Gantt" để xem chi tiết timeline từng tuần';
  ws.getCell('B33').style = { font: { italic: true, size: 10, color: { argb: C.gray400 }, name: 'Calibri' }, alignment: { horizontal: 'center' } };
}

// ─── SHEET 2 & 3: GANTT ───────────────────────────────────────────────────────
function makeGantt(wb, option) {
  const isOpt2 = option === 2;
  const sheetName = isOpt2 ? '📅 Option 2 - Gantt' : '📅 Option 1 - Gantt';
  const ws = wb.addWorksheet(sheetName, { views: [{ showGridLines: false, state: 'frozen', xSplit: 6, ySplit: 5 }] });

  const START = new Date('2026-04-01');
  const totalWeeks = isOpt2 ? 17 : 30;

  // Column widths: col A=3, B=4(#), C=22(phase), D=22(task), E=12(owner), F=10(h), then weeks=3.5 each
  ws.columns = [
    { width: 2 },   // A spacer
    { width: 4 },   // B #
    { width: 22 },  // C Phase
    { width: 28 },  // D Task
    { width: 14 },  // E Owner
    { width: 8 },   // F Hours
    ...Array(totalWeeks).fill({ width: 3.8 }),
  ];

  // ── Row 1: Title ─────────────────────────────────────────────────────────────
  ws.mergeCells(1, 2, 1, 6 + totalWeeks);
  const titleCell = ws.getCell(1, 2);
  titleCell.value = `ASEKA — PROJECT PLAN | OPTION ${option}: ${isOpt2 ? '4 NGƯỜI (3–4 THÁNG)' : '2 NGƯỜI (6–7 THÁNG)'} | Bắt đầu: 01/04/2026`;
  titleCell.style = { fill: { type:'pattern', pattern:'solid', fgColor:{ argb: C.navy } },
    font: { bold: true, size: 14, color: { argb: C.white }, name: 'Calibri' },
    alignment: { horizontal: 'center', vertical: 'middle' } };
  ws.getRow(1).height = 36;

  // ── Row 2: Month labels ────────────────────────────────────────────────────
  ws.getRow(2).height = 18;
  let lastMonth = '';
  let monthStart = 7;
  for (let w = 0; w < totalWeeks; w++) {
    const d = addDate(START, w * 7);
    const m = fmtMonth(d);
    if (m !== lastMonth) {
      if (lastMonth !== '') {
        ws.mergeCells(2, monthStart, 2, 6 + w);
        ws.getCell(2, monthStart).value = lastMonth;
        ws.getCell(2, monthStart).style = headerStyle(C.navyLight, C.white, 9, true);
      }
      monthStart = 7 + w;
      lastMonth = m;
    }
    if (w === totalWeeks - 1) {
      ws.mergeCells(2, monthStart, 2, 6 + totalWeeks);
      ws.getCell(2, monthStart).value = lastMonth;
      ws.getCell(2, monthStart).style = headerStyle(C.navyLight, C.white, 9, true);
    }
  }

  // ── Row 3: Week number ─────────────────────────────────────────────────────
  ws.getRow(3).height = 16;
  for (let w = 0; w < totalWeeks; w++) {
    const c = ws.getCell(3, 7 + w);
    c.value = `W${w+1}`;
    c.style = headerStyle(C.navy, C.white, 8, false);
  }

  // ── Row 4: Date labels ─────────────────────────────────────────────────────
  ws.getRow(4).height = 16;
  for (let w = 0; w < totalWeeks; w++) {
    const d = addDate(START, w * 7);
    const c = ws.getCell(4, 7 + w);
    c.value = `${d.getDate()}/${d.getMonth()+1}`;
    c.style = { fill: { type:'pattern', pattern:'solid', fgColor:{ argb: C.gray200 } },
      font: { size: 7, color: { argb: 'FF555555' }, name: 'Calibri' },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: { left: { style:'hair', color:{ argb:'FFD0D0D0' } }, right: { style:'hair', color:{ argb:'FFD0D0D0' } } } };
  }

  // ── Row 5: Column headers ──────────────────────────────────────────────────
  ws.getRow(5).height = 22;
  const colHdrs = ['#', 'Phase', 'Task / Hạng mục', 'Owner', 'Giờ'];
  colHdrs.forEach((h, i) => {
    const c = ws.getCell(5, 2 + i);
    c.value = h;
    c.style = headerStyle(C.navy, C.white, 10);
  });
  for (let w = 0; w < totalWeeks; w++) {
    ws.getCell(5, 7 + w).value = '';
    ws.getCell(5, 7 + w).style = headerStyle(C.navy, C.white, 9);
  }

  // ── PLAN DATA ──────────────────────────────────────────────────────────────
  // Each row: { phase, task, owner, hours, startW (1-based), durW, isPhase }
  // Option 2: 17 weeks | Option 1: 30 weeks

  const plan1 = [
    // Phase 1
    { phase:'P1 Setup & Infrastructure', task:'', owner:'', hours:40, startW:1, durW:2, isPhase:true, pi:0 },
    { phase:'', task:'Repo, CI/CD, Vercel 3 apps', owner:'Dev', hours:15, startW:1, durW:1, isPhase:false, pi:0 },
    { phase:'', task:'Supabase schema + migrations', owner:'Dev', hours:15, startW:1, durW:2, isPhase:false, pi:0 },
    { phase:'', task:'Domain, SSL, environment vars', owner:'Dev', hours:10, startW:2, durW:1, isPhase:false, pi:0 },
    // Phase 2
    { phase:'P2 Landing Page', task:'', owner:'', hours:80, startW:2, durW:6, isPhase:true, pi:1 },
    { phase:'', task:'Design system (màu, font, components)', owner:'FE', hours:20, startW:2, durW:2, isPhase:false, pi:1 },
    { phase:'', task:'Navbar + Hero + Services sections', owner:'FE', hours:20, startW:3, durW:2, isPhase:false, pi:1 },
    { phase:'', task:'Flow + Visa + Nenkin + Footer', owner:'FE', hours:20, startW:5, durW:2, isPhase:false, pi:1 },
    { phase:'', task:'Contact form + API + Responsive', owner:'FE+Dev', hours:20, startW:6, durW:2, isPhase:false, pi:1 },
    // Phase 3
    { phase:'P3 Form Đăng Ký (/dang-ky)', task:'', owner:'', hours:70, startW:5, durW:5, isPhase:true, pi:2 },
    { phase:'', task:'Multi-step form UI 4 bước', owner:'FE', hours:30, startW:5, durW:3, isPhase:false, pi:2 },
    { phase:'', task:'Submit → Supabase, duplicate check', owner:'Dev', hours:20, startW:7, durW:2, isPhase:false, pi:2 },
    { phase:'', task:'Xuất CV (HTML/PDF)', owner:'Dev', hours:20, startW:8, durW:2, isPhase:false, pi:2 },
    // Phase 4
    { phase:'P4 Admin Panel', task:'', owner:'', hours:180, startW:4, durW:10, isPhase:true, pi:3 },
    { phase:'', task:'Auth (login/logout/session)', owner:'Dev', hours:15, startW:4, durW:1, isPhase:false, pi:3 },
    { phase:'', task:'Layout + sidebar + navigation', owner:'FE', hours:15, startW:4, durW:1, isPhase:false, pi:3 },
    { phase:'', task:'Dashboard KPI + biểu đồ', owner:'FE+Dev', hours:30, startW:5, durW:2, isPhase:false, pi:3 },
    { phase:'', task:'Candidate list + filter + search', owner:'FE', hours:25, startW:6, durW:2, isPhase:false, pi:3 },
    { phase:'', task:'Candidate detail + edit + workflow', owner:'FE+Dev', hours:30, startW:7, durW:3, isPhase:false, pi:3 },
    { phase:'', task:'Job Management CRUD (20 fields)', owner:'FE+Dev', hours:35, startW:9, durW:3, isPhase:false, pi:3 },
    { phase:'', task:'Messages + Settings', owner:'FE', hours:20, startW:11, durW:2, isPhase:false, pi:3 },
    { phase:'', task:'CV Export', owner:'Dev', hours:10, startW:12, durW:1, isPhase:false, pi:3 },
    // Phase 5
    { phase:'P5 AI Module', task:'', owner:'', hours:85, startW:8, durW:6, isPhase:true, pi:4 },
    { phase:'', task:'CV text extraction (PDF/DOCX)', owner:'Dev', hours:15, startW:8, durW:1, isPhase:false, pi:4 },
    { phase:'', task:'Groq LLM prompt engineering', owner:'Dev', hours:20, startW:8, durW:2, isPhase:false, pi:4 },
    { phase:'', task:'Work experience calculator (by industry)', owner:'Dev', hours:20, startW:9, durW:2, isPhase:false, pi:4 },
    { phase:'', task:'Matching: JLPT→KN→Ngành→Nội dung', owner:'Dev', hours:20, startW:10, durW:2, isPhase:false, pi:4 },
    { phase:'', task:'Rate limit, retry, error handling', owner:'Dev', hours:10, startW:12, durW:2, isPhase:false, pi:4 },
    // Phase 6
    { phase:'P6 Candidate Portal (Mypage)', task:'', owner:'', hours:100, startW:11, durW:5, isPhase:true, pi:5 },
    { phase:'', task:'Auth (email/password + magic link)', owner:'Dev', hours:15, startW:11, durW:1, isPhase:false, pi:5 },
    { phase:'', task:'Dashboard layout + sidebar', owner:'FE', hours:20, startW:11, durW:2, isPhase:false, pi:5 },
    { phase:'', task:'Tab 紹介求人 (TOP 10 jobs)', owner:'FE+Dev', hours:30, startW:12, durW:2, isPhase:false, pi:5 },
    { phase:'', task:'Tab 選考状況 + プロフィール', owner:'FE', hours:25, startW:13, durW:2, isPhase:false, pi:5 },
    { phase:'', task:'Favorites, contact button', owner:'FE', hours:10, startW:15, durW:1, isPhase:false, pi:5 },
    // Phase 7
    { phase:'P7 Testing & QA', task:'', owner:'', hours:65, startW:15, durW:3, isPhase:true, pi:6 },
    { phase:'', task:'Unit test API routes', owner:'Dev', hours:20, startW:15, durW:2, isPhase:false, pi:6 },
    { phase:'', task:'E2E test (đăng ký, CV, match)', owner:'Dev+FE', hours:25, startW:16, durW:2, isPhase:false, pi:6 },
    { phase:'', task:'Load test + Security audit', owner:'Dev', hours:20, startW:17, durW:1, isPhase:false, pi:6 },
    // Phase 8
    { phase:'P8 Launch & Handover', task:'', owner:'', hours:25, startW:17, durW:1, isPhase:true, pi:7 },
    { phase:'', task:'Production deploy + DNS', owner:'Dev', hours:10, startW:17, durW:1, isPhase:false, pi:7 },
    { phase:'', task:'Admin training + Documentation', owner:'All', hours:15, startW:17, durW:1, isPhase:false, pi:7 },
  ];

  // Option 1: same phases but stretched across 30 weeks
  const plan2 = [
    { phase:'P1 Setup & Infrastructure', task:'', owner:'', hours:25, startW:1, durW:2, isPhase:true, pi:0 },
    { phase:'', task:'Repo, CI/CD, Vercel 3 apps', owner:'Dev', hours:12, startW:1, durW:1, isPhase:false, pi:0 },
    { phase:'', task:'Supabase schema + migrations', owner:'Dev', hours:8, startW:1, durW:2, isPhase:false, pi:0 },
    { phase:'', task:'Domain, SSL, environment vars', owner:'Dev', hours:5, startW:2, durW:1, isPhase:false, pi:0 },

    { phase:'P2 Landing Page', task:'', owner:'', hours:80, startW:2, durW:8, isPhase:true, pi:1 },
    { phase:'', task:'Design system', owner:'FE', hours:25, startW:2, durW:3, isPhase:false, pi:1 },
    { phase:'', task:'Navbar + Hero + Services', owner:'FE', hours:20, startW:4, durW:2, isPhase:false, pi:1 },
    { phase:'', task:'Flow + Visa + Nenkin + Footer', owner:'FE', hours:20, startW:6, durW:2, isPhase:false, pi:1 },
    { phase:'', task:'Contact form + API + Responsive', owner:'Dev+FE', hours:15, startW:8, durW:2, isPhase:false, pi:1 },

    { phase:'P3 Form Đăng Ký (/dang-ky)', task:'', owner:'', hours:70, startW:8, durW:7, isPhase:true, pi:2 },
    { phase:'', task:'Multi-step form UI 4 bước', owner:'FE', hours:30, startW:8, durW:4, isPhase:false, pi:2 },
    { phase:'', task:'Submit → Supabase, duplicate check', owner:'Dev', hours:20, startW:10, durW:3, isPhase:false, pi:2 },
    { phase:'', task:'Xuất CV (HTML/PDF)', owner:'Dev', hours:20, startW:12, durW:3, isPhase:false, pi:2 },

    { phase:'P4 Admin Panel', task:'', owner:'', hours:200, startW:9, durW:12, isPhase:true, pi:3 },
    { phase:'', task:'Auth + Layout + sidebar', owner:'Dev+FE', hours:30, startW:9, durW:2, isPhase:false, pi:3 },
    { phase:'', task:'Dashboard KPI + biểu đồ', owner:'Dev+FE', hours:40, startW:10, durW:3, isPhase:false, pi:3 },
    { phase:'', task:'Candidate list + filter + search', owner:'FE', hours:30, startW:12, durW:3, isPhase:false, pi:3 },
    { phase:'', task:'Candidate detail + edit + workflow', owner:'Dev+FE', hours:40, startW:14, durW:3, isPhase:false, pi:3 },
    { phase:'', task:'Job Management CRUD', owner:'Dev+FE', hours:40, startW:16, durW:3, isPhase:false, pi:3 },
    { phase:'', task:'Messages + Settings + CV Export', owner:'Dev+FE', hours:20, startW:18, durW:3, isPhase:false, pi:3 },

    { phase:'P5 AI Module', task:'', owner:'', hours:90, startW:15, durW:8, isPhase:true, pi:4 },
    { phase:'', task:'CV extraction + Groq prompts', owner:'Dev', hours:25, startW:15, durW:3, isPhase:false, pi:4 },
    { phase:'', task:'Work experience calculator', owner:'Dev', hours:25, startW:17, durW:3, isPhase:false, pi:4 },
    { phase:'', task:'Matching algorithm', owner:'Dev', hours:25, startW:19, durW:3, isPhase:false, pi:4 },
    { phase:'', task:'Rate limit + retry handling', owner:'Dev', hours:15, startW:21, durW:2, isPhase:false, pi:4 },

    { phase:'P6 Candidate Portal (Mypage)', task:'', owner:'', hours:90, startW:20, durW:7, isPhase:true, pi:5 },
    { phase:'', task:'Auth + layout', owner:'Dev+FE', hours:20, startW:20, durW:2, isPhase:false, pi:5 },
    { phase:'', task:'Tab 紹介求人 (TOP 10 jobs)', owner:'Dev+FE', hours:30, startW:21, durW:3, isPhase:false, pi:5 },
    { phase:'', task:'Tab 選考状況 + プロフィール', owner:'FE', hours:25, startW:23, durW:3, isPhase:false, pi:5 },
    { phase:'', task:'Favorites + contact button', owner:'FE', hours:15, startW:25, durW:2, isPhase:false, pi:5 },

    { phase:'P7 Testing & QA', task:'', owner:'', hours:50, startW:25, durW:4, isPhase:true, pi:6 },
    { phase:'', task:'Unit test API routes', owner:'Dev', hours:15, startW:25, durW:2, isPhase:false, pi:6 },
    { phase:'', task:'E2E test flows', owner:'Dev+FE', hours:20, startW:26, durW:2, isPhase:false, pi:6 },
    { phase:'', task:'Load test + Security audit', owner:'Dev', hours:15, startW:28, durW:2, isPhase:false, pi:6 },

    { phase:'P8 Launch & Handover', task:'', owner:'', hours:15, startW:29, durW:2, isPhase:true, pi:7 },
    { phase:'', task:'Production deploy + DNS', owner:'Dev', hours:8, startW:29, durW:1, isPhase:false, pi:7 },
    { phase:'', task:'Training + Documentation', owner:'All', hours:7, startW:30, durW:1, isPhase:false, pi:7 },
  ];

  const planData = isOpt2 ? plan1 : plan2;

  // ── Render rows ────────────────────────────────────────────────────────────
  planData.forEach((row, idx) => {
    const rn = 6 + idx;
    const wr = ws.getRow(rn);
    wr.height = row.isPhase ? 22 : 18;
    const pc = PHASE_COLORS[row.pi];

    // # column
    const numCell = ws.getCell(rn, 2);
    numCell.value = row.isPhase ? row.phase.split(' ')[0] : '';
    numCell.style = row.isPhase
      ? headerStyle(pc.bg, C.white, 9)
      : cellStyle(pc.light, 'FF555555', false, 'center');

    // Phase name column
    const phaseCell = ws.getCell(rn, 3);
    phaseCell.value = row.isPhase ? row.phase.replace(/^P\d+ /, '') : '';
    phaseCell.style = row.isPhase
      ? headerStyle(pc.bg, C.white, 10)
      : cellStyle(pc.light, 'FF555555', false, 'left');

    // Task column
    const taskCell = ws.getCell(rn, 4);
    taskCell.value = row.isPhase ? '' : `  ${row.task}`;
    taskCell.style = row.isPhase
      ? headerStyle(pc.bg, C.white, 10)
      : cellStyle(idx % 2 === 0 ? C.white : C.gray100, 'FF1A1A1A', false, 'left');

    // Owner
    const ownerCell = ws.getCell(rn, 5);
    ownerCell.value = row.owner;
    ownerCell.style = row.isPhase
      ? headerStyle(pc.bg, C.white, 9)
      : cellStyle(idx % 2 === 0 ? C.white : C.gray100, 'FF555555', false, 'center');

    // Hours
    const hoursCell = ws.getCell(rn, 6);
    hoursCell.value = row.hours || '';
    hoursCell.style = row.isPhase
      ? headerStyle(pc.bg, C.white, 9)
      : cellStyle(idx % 2 === 0 ? C.white : C.gray100, 'FF555555', false, 'center');

    // Gantt bars
    for (let w = 0; w < totalWeeks; w++) {
      const col = 7 + w;
      const weekNum = w + 1;
      const filled = weekNum >= row.startW && weekNum < row.startW + row.durW;
      const gc = ws.getCell(rn, col);
      gc.value = '';
      if (filled) {
        gc.style = {
          fill: { type:'pattern', pattern:'solid', fgColor:{ argb: row.isPhase ? pc.bg : pc.light } },
          border: { top:{ style:'hair', color:{ argb:'FFB0B0B0' } }, bottom:{ style:'hair', color:{ argb:'FFB0B0B0' } }, left:{ style:'hair', color:{ argb:'FFB0B0B0' } }, right:{ style:'hair', color:{ argb:'FFB0B0B0' } } },
        };
      } else {
        gc.style = {
          fill: { type:'pattern', pattern:'solid', fgColor:{ argb: idx%2===0 ? C.white : C.gray100 } },
          border: { top:{ style:'hair', color:{ argb:'FFEEEEEE' } }, bottom:{ style:'hair', color:{ argb:'FFEEEEEE' } }, left:{ style:'hair', color:{ argb:'FFEEEEEE' } }, right:{ style:'hair', color:{ argb:'FFEEEEEE' } } },
        };
      }
    }
  });

  // Milestone row
  const milestoneRow = isOpt2 ? 6 + planData.length + 1 : 6 + planData.length + 1;
  const mr = ws.getRow(milestoneRow);
  mr.height = 20;
  ws.getCell(milestoneRow, 2).value = '🚀';
  ws.getCell(milestoneRow, 2).style = headerStyle(C.milestone, C.white, 10);
  ws.mergeCells(milestoneRow, 3, milestoneRow, 6);
  ws.getCell(milestoneRow, 3).value = isOpt2 ? 'GO LIVE — Dự kiến cuối tháng 7/2026' : 'GO LIVE — Dự kiến cuối tháng 10/2026';
  ws.getCell(milestoneRow, 3).style = headerStyle(C.milestone, C.white, 10);
  const goLiveWeek = isOpt2 ? 17 : 30;
  for (let w = 0; w < totalWeeks; w++) {
    const c = ws.getCell(milestoneRow, 7 + w);
    c.value = w + 1 === goLiveWeek ? '🚀' : '';
    c.style = {
      fill: { type:'pattern', pattern:'solid', fgColor:{ argb: w+1===goLiveWeek ? C.milestone : C.gray100 } },
      alignment: { horizontal:'center', vertical:'middle' },
      font: { size: 9 },
    };
  }

  // Legend
  const lr = milestoneRow + 2;
  ws.getRow(lr).height = 18;
  ws.mergeCells(lr, 2, lr, 6 + totalWeeks);
  ws.getCell(lr, 2).value = '■ Phase bar (đậm)   □ Task bar (nhạt)   🚀 Go Live milestone    Màu: P1=Xanh dương  P2=Xanh lá  P3=Cam  P4=Tím  P5=Teal  P6=Đỏ  P7=Vàng  P8=Navy';
  ws.getCell(lr, 2).style = { font:{ italic:true, size:9, color:{ argb:C.gray400 }, name:'Calibri' }, alignment:{ horizontal:'left' } };
}

// ─── SHEET 4: PROGRESS REPORT ─────────────────────────────────────────────────
function makeProgress(wb) {
  const ws = wb.addWorksheet('📊 Progress Report', { views: [{ showGridLines: false }] });
  ws.columns = [
    { width: 2 }, { width: 5 }, { width: 25 }, { width: 30 },
    { width: 14 }, { width: 14 }, { width: 12 }, { width: 18 }, { width: 25 }, { width: 2 },
  ];

  // Title
  ws.mergeCells('B1:I1');
  ws.getCell('B1').value = 'ASEKA — PROGRESS REPORT (Báo Cáo Tiến Độ)';
  ws.getCell('B1').style = { fill:{type:'pattern',pattern:'solid',fgColor:{argb:C.navy}}, font:{bold:true,size:16,color:{argb:C.white},name:'Calibri'}, alignment:{horizontal:'center',vertical:'middle'} };
  ws.getRow(1).height = 44;

  ws.mergeCells('B2:I2');
  ws.getCell('B2').value = 'Cập nhật mỗi tuần — Gửi cho khách hàng vào thứ Sáu hàng tuần';
  ws.getCell('B2').style = { fill:{type:'pattern',pattern:'solid',fgColor:{argb:C.navyLight}}, font:{italic:true,size:11,color:{argb:C.white},name:'Calibri'}, alignment:{horizontal:'center',vertical:'middle'} };
  ws.getRow(2).height = 24;

  ws.getRow(3).height = 14;

  // Report meta
  const metaFields = [
    ['Tuần báo cáo', 'Week #___'],
    ['Ngày báo cáo', ''],
    ['Kỳ báo cáo', ''],
    ['Option đang thực hiện', '☐ Option 1 (2 người)   ☐ Option 2 (4 người)'],
  ];
  metaFields.forEach(([k, v], i) => {
    const rn = 4 + i;
    ws.getRow(rn).height = 22;
    ws.mergeCells(`B${rn}:C${rn}`);
    ws.getCell(`B${rn}`).value = k;
    ws.getCell(`B${rn}`).style = cellStyle(C.navy, C.white, true, 'left');
    ws.mergeCells(`D${rn}:I${rn}`);
    ws.getCell(`D${rn}`).value = v;
    ws.getCell(`D${rn}`).style = cellStyle(C.gray100, 'FF1A1A1A', false, 'left');
  });

  ws.getRow(8).height = 14;

  // Overall progress
  ws.mergeCells('B9:I9');
  ws.getCell('B9').value = '1. TIẾN ĐỘ TỔNG THỂ';
  ws.getCell('B9').style = headerStyle(C.navyLight, C.white, 12);
  ws.getRow(9).height = 26;

  const overallCols = ['#', 'Phase', 'Hạng mục', 'Ngày bắt đầu', 'Ngày kết thúc', '% Hoàn thành', 'Trạng thái', 'Ghi chú'];
  ws.getRow(10).height = 22;
  overallCols.forEach((h, i) => {
    ws.getCell(10, 2 + i).value = h;
    ws.getCell(10, 2 + i).style = headerStyle(C.navy, C.white, 10);
  });

  const phases = [
    ['P1', 'Setup & Infrastructure'],
    ['P2', 'Landing Page'],
    ['P3', 'Form Đăng Ký'],
    ['P4', 'Admin Panel'],
    ['P5', 'AI Module'],
    ['P6', 'Candidate Portal'],
    ['P7', 'Testing & QA'],
    ['P8', 'Launch & Handover'],
  ];

  const statusOpts = '☐ Chưa bắt đầu  ☐ Đang làm  ☐ Chờ review  ☐ Hoàn thành  ☐ Chậm';

  phases.forEach(([num, name], i) => {
    const rn = 11 + i;
    ws.getRow(rn).height = 22;
    const pc = PHASE_COLORS[i];
    const bg = i % 2 === 0 ? C.gray100 : C.white;
    ws.getCell(rn, 2).value = num;
    ws.getCell(rn, 2).style = headerStyle(pc.bg, C.white, 9);
    ws.getCell(rn, 3).value = name;
    ws.getCell(rn, 3).style = cellStyle(pc.light, 'FF1A1A1A', true, 'left');
    ws.getCell(rn, 4).value = '';
    ws.getCell(rn, 4).style = cellStyle(bg, 'FF555555', false, 'left');
    ws.getCell(rn, 5).value = '';
    ws.getCell(rn, 5).style = cellStyle(bg, 'FF555555', false, 'center');
    ws.getCell(rn, 6).value = '';
    ws.getCell(rn, 6).style = cellStyle(bg, 'FF555555', false, 'center');
    ws.getCell(rn, 7).value = '0%';
    ws.getCell(rn, 7).style = cellStyle(bg, 'FF555555', false, 'center');
    ws.getCell(rn, 8).value = '☐ Chưa bắt đầu';
    ws.getCell(rn, 8).style = cellStyle(bg, 'FF555555', false, 'left');
    ws.getCell(rn, 9).value = '';
    ws.getCell(rn, 9).style = cellStyle(bg, 'FF555555', false, 'left');
  });

  ws.getRow(19).height = 14;

  // Completed this week
  ws.mergeCells('B20:I20');
  ws.getCell('B20').value = '2. HOÀN THÀNH TRONG TUẦN NÀY ✅';
  ws.getCell('B20').style = headerStyle(C.green, C.white, 12);
  ws.getRow(20).height = 26;

  for (let i = 0; i < 5; i++) {
    const rn = 21 + i;
    ws.getRow(rn).height = 20;
    ws.mergeCells(rn, 2, rn, 4);
    ws.getCell(rn, 2).value = `${i+1}.`;
    ws.getCell(rn, 2).style = cellStyle(i%2===0 ? C.greenLight : C.white, 'FF1A1A1A', false, 'left');
    ws.mergeCells(rn, 5, rn, 9);
    ws.getCell(rn, 5).value = '';
    ws.getCell(rn, 5).style = cellStyle(i%2===0 ? C.greenLight : C.white, 'FF1A1A1A', false, 'left');
  }

  ws.getRow(26).height = 14;

  // Next week plan
  ws.mergeCells('B27:I27');
  ws.getCell('B27').value = '3. KẾ HOẠCH TUẦN TỚI 📋';
  ws.getCell('B27').style = headerStyle(C.blue, C.white, 12);
  ws.getRow(27).height = 26;

  for (let i = 0; i < 5; i++) {
    const rn = 28 + i;
    ws.getRow(rn).height = 20;
    ws.mergeCells(rn, 2, rn, 4);
    ws.getCell(rn, 2).value = `${i+1}.`;
    ws.getCell(rn, 2).style = cellStyle(i%2===0 ? C.blueLight : C.white, 'FF1A1A1A', false, 'left');
    ws.mergeCells(rn, 5, rn, 9);
    ws.getCell(rn, 5).value = '';
    ws.getCell(rn, 5).style = cellStyle(i%2===0 ? C.blueLight : C.white, 'FF1A1A1A', false, 'left');
  }

  ws.getRow(33).height = 14;

  // Issues & Risks
  ws.mergeCells('B34:I34');
  ws.getCell('B34').value = '4. RỦI RO / VẤN ĐỀ CẦN GIẢI QUYẾT ⚠️';
  ws.getCell('B34').style = headerStyle(C.orange, C.white, 12);
  ws.getRow(34).height = 26;

  const issueHdrs = ['#', 'Vấn đề', 'Mô tả', 'Mức độ', 'Người xử lý', 'Deadline', 'Trạng thái', 'Ghi chú'];
  ws.getRow(35).height = 20;
  issueHdrs.forEach((h, i) => {
    ws.getCell(35, 2+i).value = h;
    ws.getCell(35, 2+i).style = headerStyle(C.orange, C.white, 9);
  });

  for (let i = 0; i < 4; i++) {
    const rn = 36 + i;
    ws.getRow(rn).height = 20;
    [2,3,4,5,6,7,8,9].forEach(col => {
      ws.getCell(rn, col).value = col === 2 ? `${i+1}` : col === 5 ? '☐ Cao  ☐ Trung bình  ☐ Thấp' : '';
      ws.getCell(rn, col).style = cellStyle(i%2===0 ? C.orangeLight : C.white, 'FF1A1A1A', false, 'left');
    });
  }

  ws.getRow(40).height = 14;

  // KPI Summary
  ws.mergeCells('B41:I41');
  ws.getCell('B41').value = '5. KPI TUẦN — SỐ LIỆU BÁO CÁO CHO KHÁCH HÀNG 📈';
  ws.getCell('B41').style = headerStyle(C.navyLight, C.white, 12);
  ws.getRow(41).height = 26;

  const kpis = [
    ['Tổng giờ đã làm (tuần này)', '', 'giờ'],
    ['Tổng giờ lũy kế', '', 'giờ'],
    ['% Tổng tiến độ dự án', '', '%'],
    ['Số tính năng hoàn thành', '', 'feature'],
    ['Số bug phát hiện / đã fix', '', 'bugs'],
    ['Commits trong tuần', '', 'commits'],
  ];

  kpis.forEach(([label, val, unit], i) => {
    const rn = 42 + i;
    ws.getRow(rn).height = 22;
    ws.mergeCells(rn, 2, rn, 5);
    ws.getCell(rn, 2).value = label;
    ws.getCell(rn, 2).style = cellStyle(i%2===0 ? C.gray100 : C.white, 'FF1A1A1A', true, 'left');
    ws.mergeCells(rn, 6, rn, 7);
    ws.getCell(rn, 6).value = val;
    ws.getCell(rn, 6).style = cellStyle(i%2===0 ? C.gray100 : C.white, C.navy, true, 'center');
    ws.mergeCells(rn, 8, rn, 9);
    ws.getCell(rn, 8).value = unit;
    ws.getCell(rn, 8).style = cellStyle(i%2===0 ? C.gray100 : C.white, 'FF555555', false, 'left');
  });

  ws.getRow(48).height = 14;

  // Signature
  ws.mergeCells('B49:I49');
  ws.getCell('B49').value = 'Người lập báo cáo: ___________________     Ngày: ___________________     Xác nhận khách hàng: ___________________';
  ws.getCell('B49').style = { font:{italic:true, size:10, color:{argb:C.gray400}, name:'Calibri'}, alignment:{horizontal:'center'} };
  ws.getRow(49).height = 24;
}

// ─── SHEET 5: Team & Contact ──────────────────────────────────────────────────
function makeTeam(wb, option) {
  const isOpt2 = option === 2;
  const ws = wb.addWorksheet(`👥 Option ${option} - Team`, { views: [{ showGridLines: false }] });
  ws.columns = [{ width: 2 }, { width: 20 }, { width: 22 }, { width: 18 }, { width: 14 }, { width: 14 }, { width: 16 }, { width: 22 }, { width: 2 }];

  ws.mergeCells('B1:H1');
  ws.getCell('B1').value = `ASEKA — OPTION ${option}: ${isOpt2 ? 'TEAM 4 NGƯỜI' : 'TEAM 2 NGƯỜI'}`;
  ws.getCell('B1').style = { fill:{type:'pattern',pattern:'solid',fgColor:{argb:C.navy}}, font:{bold:true,size:16,color:{argb:C.white},name:'Calibri'}, alignment:{horizontal:'center',vertical:'middle'} };
  ws.getRow(1).height = 44;

  ws.getRow(2).height = 14;

  // Team table
  ws.mergeCells('B3:H3');
  ws.getCell('B3').value = 'THÀNH PHẦN TEAM';
  ws.getCell('B3').style = headerStyle(C.navyLight, C.white, 12);
  ws.getRow(3).height = 26;

  const teamHdrs = ['Vai trò', 'Trách nhiệm chính', 'Phụ trách phase', 'Rate ($/h)', 'Tổng giờ', 'Tổng chi phí', 'Ghi chú'];
  ws.getRow(4).height = 22;
  teamHdrs.forEach((h, i) => {
    ws.getCell(4, 2+i).value = h;
    ws.getCell(4, 2+i).style = headerStyle(C.navy, C.white, 10);
  });

  const teams = isOpt2 ? [
    ['Tech Lead / Fullstack', 'Kiến trúc hệ thống, review code, setup infra', 'P1, P4 (auth), P5 (AI)', '$35', '100h', '$3,500', 'Senior 5+ năm'],
    ['Backend Developer', 'API routes, Supabase, AI integration', 'P5 (AI), P4, P6', '$30', '205h', '$6,150', 'Next.js + Supabase'],
    ['Frontend Developer 1', 'Admin panel, Mypage UI', 'P4, P6', '$25', '185h', '$4,625', 'React/Next.js'],
    ['Frontend Developer 2', 'Landing page, /dang-ky, design system', 'P2, P3', '$25', '155h', '$3,875', 'UI/UX focus'],
  ] : [
    ['Fullstack Developer', 'API, Supabase, AI, Admin backend', 'P1→P8 (backend)', '$30', '350h', '$10,500', 'Next.js + Supabase + AI'],
    ['Frontend Developer', 'UI/UX Landing, Admin, Mypage', 'P2, P3, P4 (UI), P6', '$25', '270h', '$6,750', 'React/Next.js'],
  ];

  teams.forEach((row, i) => {
    const rn = 5 + i;
    ws.getRow(rn).height = 24;
    const bg = i % 2 === 0 ? C.gray100 : C.white;
    const pc = PHASE_COLORS[i];
    row.forEach((v, j) => {
      const c = ws.getCell(rn, 2+j);
      c.value = v;
      c.style = j === 0
        ? cellStyle(pc.light, 'FF1A1A1A', true, 'left')
        : cellStyle(bg, 'FF1A1A1A', false, j >= 3 ? 'center' : 'left');
    });
  });

  const totalRow = 5 + teams.length;
  ws.getRow(totalRow).height = 22;
  ws.mergeCells(totalRow, 2, totalRow, 4);
  ws.getCell(totalRow, 2).value = 'TỔNG CỘNG';
  ws.getCell(totalRow, 2).style = headerStyle(C.navy, C.white, 10);
  const totals = isOpt2
    ? ['', '645h', '$18,150', '']
    : ['', '620h', '$17,250', ''];
  totals.forEach((v, i) => {
    const c = ws.getCell(totalRow, 5+i);
    c.value = v;
    c.style = headerStyle(C.navy, C.white, 10);
  });

  ws.getRow(totalRow+1).height = 14;

  // Deliverables per phase
  ws.mergeCells(totalRow+2, 2, totalRow+2, 8);
  ws.getCell(totalRow+2, 2).value = 'DELIVERABLES THEO GIAI ĐOẠN';
  ws.getCell(totalRow+2, 2).style = headerStyle(C.navyLight, C.white, 12);
  ws.getRow(totalRow+2).height = 26;

  const delHdrs = ['Phase', 'Deliverable', 'Định nghĩa "Hoàn thành" (Definition of Done)', '', 'Tuần KT', 'Review', 'Sign-off'];
  ws.getRow(totalRow+3).height = 22;
  delHdrs.forEach((h, i) => {
    ws.getCell(totalRow+3, 2+i).value = h;
    ws.getCell(totalRow+3, 2+i).style = headerStyle(C.navy, C.white, 10);
  });

  const deliverables = [
    ['P1', 'Môi trường sẵn sàng', 'Vercel 3 app live, DB schema OK, ENV set', '', isOpt2?'W2':'W2', 'Dev', '☐'],
    ['P2', 'Landing Page live', 'Deploy lên Vercel, bilingual, responsive, contact form OK', '', isOpt2?'W7':'W9', 'Client', '☐'],
    ['P3', 'Form /dang-ky live', 'Submit → DB OK, email check OK, xuất CV OK', '', isOpt2?'W10':'W14', 'Client', '☐'],
    ['P4', 'Admin Panel full', 'Tất cả CRUD, dashboard, filter, search hoạt động', '', isOpt2?'W13':'W20', 'Client', '☐'],
    ['P5', 'AI hoạt động', 'CV upload → parse → KN tính OK → matching TOP10 OK', '', isOpt2?'W13':'W22', 'Client', '☐'],
    ['P6', 'Mypage live', 'Login, TOP10 jobs, pipeline, profile hiển thị đúng', '', isOpt2?'W15':'W26', 'Client', '☐'],
    ['P7', 'QA Pass', 'Tất cả test pass, load test OK, 0 critical bug', '', isOpt2?'W17':'W29', 'Dev+Client', '☐'],
    ['P8', '🚀 GO LIVE', 'Domain chính thức, admin training done, docs OK', '', isOpt2?'W17':'W30', 'Client', '☐'],
  ];

  deliverables.forEach((row, i) => {
    const rn = totalRow + 4 + i;
    ws.getRow(rn).height = 22;
    const pc = PHASE_COLORS[i];
    const bg = i%2===0 ? C.gray100 : C.white;
    row.forEach((v, j) => {
      const c = ws.getCell(rn, 2+j);
      c.value = v;
      c.style = j === 0
        ? headerStyle(pc.bg, C.white, 9)
        : j === 1
        ? cellStyle(pc.light, 'FF1A1A1A', true, 'left')
        : cellStyle(bg, 'FF1A1A1A', false, 'left');
    });
  });
}

// ─── BUILD WORKBOOK ───────────────────────────────────────────────────────────
makeCover(wb);
makeGantt(wb, 2);   // Option 2 first (recommended)
makeGantt(wb, 1);   // Option 1
makeTeam(wb, 2);
makeTeam(wb, 1);
makeProgress(wb);

const outputPath = '/Users/minhkien/Desktop/KK AI/aseka/docs/ASEKA-Project-Plan.xlsx';
await wb.xlsx.writeFile(outputPath);
console.log('✅ Xuất thành công:', outputPath);
