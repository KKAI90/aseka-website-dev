import * as XLSX from 'xlsx';
import { writeFileSync } from 'fs';

const wb = XLSX.utils.book_new();

// ─── SHEET 1: Scope ───────────────────────────────────────────────────────────
const scopeData = [
  ['ASEKA — Scope Dự Án', '', ''],
  ['', '', ''],
  ['#', 'Hạng mục', 'Mô tả'],
  [1, 'Landing Page', 'Giới thiệu dịch vụ, form liên hệ, form đăng ký ứng viên'],
  [2, 'Form đăng ký ứng viên', 'Multi-step form 4 bước, tự động import + xuất CV'],
  [3, 'Admin Panel', 'Quản lý ứng viên, việc làm, tin nhắn, dashboard'],
  [4, 'AI CV Analysis', 'Phân tích CV, trích xuất thông tin, tính kinh nghiệm tự động'],
  [5, 'AI Job Matching', 'Gợi ý việc phù hợp theo JLPT, kinh nghiệm, ngành nghề'],
  [6, 'Candidate Portal (Mypage)', 'Ứng viên xem TOP 10 việc phù hợp, trạng thái hồ sơ, profile'],
  [7, 'Hệ thống Visa', 'Hỗ trợ 16 ngành Tokutei + 5 ngành Kỹ sư'],
  ['', '', ''],
  ['Quy mô 1 năm', '', ''],
  ['Ứng viên', '3.000', ''],
  ['Công ty đối tác', '100', ''],
  ['', '', ''],
  ['KHÔNG bao gồm', '', ''],
  ['', 'Thanh toán / billing', ''],
  ['', 'Mobile App (iOS/Android)', ''],
  ['', 'Hệ thống kế toán / payroll', ''],
  ['', 'Tích hợp Hello Work / JLPT API chính thức', ''],
];
const wsScope = XLSX.utils.aoa_to_sheet(scopeData);
wsScope['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 60 }];
XLSX.utils.book_append_sheet(wb, wsScope, 'Scope');

// ─── SHEET 2: Yêu cầu chức năng ──────────────────────────────────────────────
const requirementsData = [
  ['ASEKA — Yêu Cầu Chức Năng Chi Tiết', '', '', ''],
  ['', '', '', ''],
  ['Module', 'Tính năng', 'Mô tả chi tiết', 'Ghi chú'],
  // Landing Page
  ['Landing Page', 'Trang chủ', 'Giới thiệu 6 dịch vụ, quy trình 4 bước, thông tin visa', 'Bilingual JP/VN'],
  ['Landing Page', 'Contact Form', 'Form liên hệ (Business / Individual): tên, email, SĐT, dịch vụ, tin nhắn', ''],
  ['Landing Page', 'SEO / Responsive', 'Mobile responsive, meta tags, hiệu năng tải nhanh', ''],
  // Form đăng ký
  ['Form /dang-ky', 'Bước 1 - Cá nhân', 'Họ tên, email, SĐT, ngày sinh, giới tính, địa chỉ, quốc tịch', ''],
  ['Form /dang-ky', 'Bước 2 - Tiếng Nhật & Visa', 'JLPT level, loại visa, tình trạng hôn nhân, ngày đi làm được', ''],
  ['Form /dang-ky', 'Bước 3 - Ngành nghề', 'Chọn tối đa 3 ngành, công việc mong muốn, giờ làm', 'Max 3 ngành'],
  ['Form /dang-ky', 'Bước 4 - PR', 'Motivation & Self-PR', ''],
  ['Form /dang-ky', 'Xuất CV', 'Sau submit → tự động tạo hồ sơ + xuất file CV (HTML/PDF)', ''],
  ['Form /dang-ky', 'Chống trùng', 'Kiểm tra email đã tồn tại', ''],
  // Admin
  ['Admin', 'Auth', 'Email + password login, session cookie HTTP-only', ''],
  ['Admin', 'Dashboard', 'KPI (ứng viên, phỏng vấn, offer, việc làm), pipeline chart, biểu đồ ngành', ''],
  ['Admin', 'Danh sách ứng viên', 'Filter trạng thái, JLPT, ngành, visa. Search tên/email', ''],
  ['Admin', 'Upload CV', 'Kéo thả PDF/DOCX → AI phân tích → tự điền form', ''],
  ['Admin', 'Tính kinh nghiệm', 'AI tự tính năm KN từ work_history theo từng ngành (VD: IT 2020→2025 = 5 năm)', 'Quan trọng'],
  ['Admin', 'Chi tiết ứng viên', 'Xem/sửa hồ sơ, đổi trạng thái, xuất CV, gợi ý việc', ''],
  ['Admin', 'Quản lý việc làm', 'CRUD ~20 fields, filter trạng thái/ngành/JLPT', ''],
  ['Admin', '16 ngành Tokutei', 'Điều dưỡng, Vệ sinh, Chế tạo, Xây dựng, Đóng tàu, Sửa ô tô, Hàng không, Khách sạn, Nông nghiệp, Ngư nghiệp, Thực phẩm, F&B, Dệt may, In ấn, Đường sắt, Lâm nghiệp', ''],
  ['Admin', '5 ngành Kỹ sư', 'IT, Cơ khí/điện tử, Kinh doanh QT, Biên phiên dịch, Kế toán', ''],
  ['Admin', 'AI Matching', 'TOP candidates cho 1 job (% match + lý do JP/VN)', ''],
  ['Admin', 'Tin nhắn', 'Xem contact form, filter trạng thái mới/liên hệ/đóng', ''],
  // AI Module
  ['AI Module', 'CV Analysis', 'Extract text PDF/DOCX → Groq LLM → JSON structured data', 'Groq llama-3.3-70b'],
  ['AI Module', 'Matching Priority', '1. JLPT → 2. Kinh nghiệm → 3. Ngành → 4. Nội dung công việc', 'Thứ tự ưu tiên'],
  ['AI Module', 'Output', 'TOP 10 việc phù hợp nhất hiển thị trên Mypage', ''],
  // Mypage
  ['Mypage', 'Auth', 'Email/password + magic link', ''],
  ['Mypage', 'Tab 紹介求人', 'TOP 10 việc phù hợp, filter mới/tất cả, xem chi tiết, yêu thích', ''],
  ['Mypage', 'Tab 選考状況', 'Pipeline visual: Nộp hồ sơ → Phỏng vấn → Offer → Đi làm', ''],
  ['Mypage', 'Tab プロフィール', 'Xem thông tin đã đăng ký', ''],
];
const wsReq = XLSX.utils.aoa_to_sheet(requirementsData);
wsReq['!cols'] = [{ wch: 18 }, { wch: 22 }, { wch: 70 }, { wch: 15 }];
XLSX.utils.book_append_sheet(wb, wsReq, 'Yêu cầu chức năng');

// ─── SHEET 3: WBS ─────────────────────────────────────────────────────────────
const wbsData = [
  ['ASEKA — Work Breakdown Structure (WBS)', '', '', '', ''],
  ['', '', '', '', ''],
  ['ID', 'Phase', 'Task', 'Sub-task', 'Ghi chú'],
  ['1', 'Setup & Infrastructure', 'Repo, CI/CD, Vercel 3 apps', '', ''],
  ['1.1', '', '', 'Tạo 3 Vercel project (website / admin / mypage)', ''],
  ['1.2', '', '', 'Supabase schema (candidates, jobs, contact, auth)', ''],
  ['1.3', '', '', 'Environment variables & secrets', ''],
  ['1.4', '', '', 'Domain & SSL', ''],
  ['2', 'Landing Page', '', '', ''],
  ['2.1', '', '', 'Design system (màu, font, component library)', ''],
  ['2.2', '', '', 'Navbar + Hero + Services sections', ''],
  ['2.3', '', '', 'Flow + Visa + Nenkin sections', ''],
  ['2.4', '', '', 'Contact form + API', ''],
  ['2.5', '', '', 'JP/VN bilingual (LangContext)', ''],
  ['2.6', '', '', 'Responsive mobile', ''],
  ['3', 'Form Đăng Ký (/dang-ky)', '', '', ''],
  ['3.1', '', '', 'Multi-step form UI (4 bước + progress bar)', ''],
  ['3.2', '', '', 'Validation & error handling', ''],
  ['3.3', '', '', 'Submit → Supabase insert', ''],
  ['3.4', '', '', 'Xuất CV file (HTML/PDF)', ''],
  ['3.5', '', '', 'Duplicate email check', ''],
  ['4', 'Admin Panel', '', '', ''],
  ['4.1', '', '', 'Auth (login / logout / session cookie)', ''],
  ['4.2', '', '', 'Layout + sidebar navigation', ''],
  ['4.3', '', '', 'Dashboard (KPI + biểu đồ)', ''],
  ['4.4', '', '', 'Candidate list + filter + search', ''],
  ['4.5', '', '', 'Candidate detail + edit modal', ''],
  ['4.6', '', '', 'Status workflow (New → Interview → Offer → Working)', ''],
  ['4.7', '', '', 'CV export', ''],
  ['4.8', '', '', 'Job Management CRUD (20 fields)', ''],
  ['4.9', '', '', 'Messages management', ''],
  ['4.10', '', '', 'Settings page', ''],
  ['5', 'AI Module', '', '', ''],
  ['5.1', '', '', 'CV Upload + text extraction (PDF/DOCX)', ''],
  ['5.2', '', '', 'Groq LLM prompt engineering', ''],
  ['5.3', '', '', 'JSON parsing + field mapping', ''],
  ['5.4', '', '', 'Work experience calculator (by industry + date range)', 'Tính KN tự động'],
  ['5.5', '', '', 'Job matching: JLPT → KN → Ngành → Nội dung', 'Thứ tự ưu tiên'],
  ['5.6', '', '', 'Rate limit handling + retry logic', ''],
  ['6', 'Candidate Portal (Mypage)', '', '', ''],
  ['6.1', '', '', 'Auth (email/password + magic link)', ''],
  ['6.2', '', '', 'Dashboard layout + sidebar', ''],
  ['6.3', '', '', 'Tab 紹介求人 (TOP 10 jobs)', ''],
  ['6.4', '', '', 'Tab 選考状況 (pipeline visual)', ''],
  ['6.5', '', '', 'Tab プロフィール (profile view)', ''],
  ['6.6', '', '', 'Favorites + contact job button', ''],
  ['7', 'Testing & QA', '', '', ''],
  ['7.1', '', '', 'Unit test API routes', ''],
  ['7.2', '', '', 'E2E test flows (đăng ký, upload CV, match)', ''],
  ['7.3', '', '', 'Load test (3.000 users simulation)', ''],
  ['7.4', '', '', 'Security audit (RLS, auth, OWASP)', ''],
  ['8', 'Launch & Handover', '', '', ''],
  ['8.1', '', '', 'Production deployment', ''],
  ['8.2', '', '', 'DNS & domain config', ''],
  ['8.3', '', '', 'Admin training', ''],
  ['8.4', '', '', 'Documentation', ''],
];
const wsWBS = XLSX.utils.aoa_to_sheet(wbsData);
wsWBS['!cols'] = [{ wch: 6 }, { wch: 25 }, { wch: 30 }, { wch: 50 }, { wch: 20 }];
XLSX.utils.book_append_sheet(wb, wsWBS, 'WBS');

// ─── SHEET 4: Estimate ────────────────────────────────────────────────────────
const estimateData = [
  ['ASEKA — Estimate Chi Phí & Timeline', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  // Option 1
  ['OPTION 1 — Team 2 Người', '', '', '', '', '', '', ''],
  ['Timeline: 6–7 tháng', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['Vai trò', 'Số lượng', 'Rate ($/giờ)', '', '', '', '', ''],
  ['Fullstack Developer (Next.js + Supabase + AI)', '1', '$30/h', '', '', '', '', ''],
  ['Frontend Developer (UI/UX + Landing)', '1', '$25/h', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['Phase', 'Hạng mục', 'Giờ Dev', 'Giờ FE', 'Tổng giờ', 'Chi phí Dev', 'Chi phí FE', 'Tổng chi phí'],
  ['1', 'Setup & Infrastructure', 20, 5, 25, 600, 125, 725],
  ['2', 'Landing Page', 20, 60, 80, 600, 1500, 2100],
  ['3', 'Form Đăng Ký', 30, 40, 70, 900, 1000, 1900],
  ['4', 'Admin Panel', 120, 80, 200, 3600, 2000, 5600],
  ['5', 'AI Module', 80, 10, 90, 2400, 250, 2650],
  ['6', 'Candidate Portal', 40, 50, 90, 1200, 1250, 2450],
  ['7', 'Testing & QA', 30, 20, 50, 900, 500, 1400],
  ['8', 'Launch & Handover', 10, 5, 15, 300, 125, 425],
  ['TOTAL', '', 350, 270, 620, 10500, 6750, 17250],
  ['', '', '', '', '', '', '', ''],
  ['TỔNG CHI PHÍ OPTION 1', '', '', '', '', '', '', '$17,250'],
  ['Tương đương VND', '', '', '', '', '', '', '~250,000,000 VND'],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  // Option 2
  ['OPTION 2 — Team 4 Người ✅ KHUYẾN NGHỊ', '', '', '', '', '', '', ''],
  ['Timeline: 3–4 tháng', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['Vai trò', 'Số lượng', 'Rate ($/giờ)', '', '', '', '', ''],
  ['Tech Lead / Fullstack', '1', '$35/h', '', '', '', '', ''],
  ['Backend Developer (API + Supabase + AI)', '1', '$30/h', '', '', '', '', ''],
  ['Frontend Developer (Admin + Mypage)', '1', '$25/h', '', '', '', '', ''],
  ['Frontend Developer (Landing + /dang-ky + UI)', '1', '$25/h', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['Phase', 'Hạng mục', 'Giờ TL', 'Giờ BE', 'Giờ FE1', 'Giờ FE2', 'Tổng giờ', 'Tổng chi phí'],
  ['1', 'Setup & Infrastructure', 20, 10, 5, 5, 40, 1025],
  ['2', 'Landing Page', 5, 5, 10, 60, 80, 2050],
  ['3', 'Form Đăng Ký', 5, 20, 10, 35, 70, 1925],
  ['4', 'Admin Panel', 20, 60, 80, 20, 180, 5800],
  ['5', 'AI Module', 15, 60, 5, 5, 85, 4150],
  ['6', 'Candidate Portal', 10, 25, 55, 10, 100, 3225],
  ['7', 'Testing & QA', 15, 20, 15, 15, 65, 2150],
  ['8', 'Launch & Handover', 10, 5, 5, 5, 25, 825],
  ['TOTAL', '', 100, 205, 185, 155, 645, 18150],
  ['', '', '', '', '', '', '', ''],
  ['TỔNG CHI PHÍ OPTION 2', '', '', '', '', '', '', '$18,150'],
  ['Tương đương VND', '', '', '', '', '', '', '~265,000,000 VND'],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  // So sánh
  ['SO SÁNH 2 OPTIONS', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['Tiêu chí', 'Option 1 (2 người)', 'Option 2 (4 người)', '', '', '', '', ''],
  ['Chi phí', '$17,250', '$18,150', '', '', '', '', ''],
  ['Timeline', '6–7 tháng', '3–4 tháng', '', '', '', '', ''],
  ['Rủi ro', 'Cao (quá tải)', 'Thấp', '', '', '', '', ''],
  ['Chất lượng', 'Trung bình', 'Cao', '', '', '', '', ''],
  ['Time-to-market', 'Chậm', 'Nhanh', '', '', '', '', ''],
  ['Khuyến nghị', 'Nếu budget rất eo', '✅ Ưu tiên chọn', '', '', '', '', ''],
];
const wsEstimate = XLSX.utils.aoa_to_sheet(estimateData);
wsEstimate['!cols'] = [
  { wch: 45 }, { wch: 20 }, { wch: 12 }, { wch: 12 },
  { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 20 }
];
XLSX.utils.book_append_sheet(wb, wsEstimate, 'Estimate');

// ─── SHEET 5: Tech Stack & Chi phí vận hành ──────────────────────────────────
const techData = [
  ['ASEKA — Tech Stack & Chi Phí Vận Hành', '', '', ''],
  ['', '', '', ''],
  ['Tech Stack', '', '', ''],
  ['Layer', 'Technology', 'Mục đích', ''],
  ['Frontend', 'Next.js 14 + TypeScript', 'Framework chính, App Router', ''],
  ['Styling', 'Tailwind CSS', 'UI styling', ''],
  ['Database', 'Supabase (PostgreSQL)', 'DB + Auth + RLS + Storage', ''],
  ['AI / LLM', 'Groq API (llama-3.3-70b)', 'CV analysis + Job matching', ''],
  ['Hosting', 'Vercel', '3 deployments (website/admin/mypage)', ''],
  ['CV Parse', 'pdfjs-dist + Mammoth', 'Extract text từ PDF/DOCX', ''],
  ['CI/CD', 'GitHub Actions', 'Auto lint → deploy', ''],
  ['', '', '', ''],
  ['Chi Phí Vận Hành / Tháng', '', '', ''],
  ['Service', 'Plan', 'Ghi chú', 'Est. Cost/tháng'],
  ['Vercel', 'Hobby → Pro', 'Nâng khi traffic tăng', '$0 → $20'],
  ['Supabase', 'Free → Pro', 'Free: 500MB DB, 50MB file', '$0 → $25'],
  ['Groq API', 'Free tier', 'Generous rate limit', '~$0 → $10'],
  ['Domain aseka.jp', 'Năm', '', '~$3'],
  ['TOTAL', '', '', '$3 → $58/tháng'],
  ['', '', '', ''],
  ['Trạng thái hiện tại (tháng 3/2026)', '', '', ''],
  ['', '', '', ''],
  ['✅ Đã hoàn thành', '', '', ''],
  ['', 'Landing page (bilingual JP/VN)', '', ''],
  ['', 'Form đăng ký ứng viên 4 bước', '', ''],
  ['', 'Admin authentication + dashboard', '', ''],
  ['', 'Quản lý ứng viên (upload CV + AI phân tích)', '', ''],
  ['', 'Quản lý việc làm CRUD', '', ''],
  ['', 'AI CV analysis (Groq)', '', ''],
  ['', 'AI job matching (candidate ↔ job)', '', ''],
  ['', 'Candidate Portal (Mypage) cơ bản', '', ''],
  ['', 'Contact form', '', ''],
  ['', '', '', ''],
  ['🚧 Còn thiếu', '', '', ''],
  ['', 'AI tính kinh nghiệm tự động từ work_history', '', ''],
  ['', 'Logic matching ưu tiên: JLPT → KN → Ngành → Nội dung', '', ''],
  ['', 'TOP 10 jobs hiển thị trên Mypage', '', ''],
  ['', 'Giới hạn tối đa 3 ngành/ứng viên (enforce)', '', ''],
  ['', 'Chuẩn hóa 16 ngành Tokutei + 5 ngành Kỹ sư', '', ''],
  ['', 'Xuất CV từ form /dang-ky', '', ''],
  ['', 'Settings page', '', ''],
  ['', 'Email notifications', '', ''],
  ['', 'Testing & QA', '', ''],
  ['', 'Production launch', '', ''],
];
const wsTech = XLSX.utils.aoa_to_sheet(techData);
wsTech['!cols'] = [{ wch: 25 }, { wch: 45 }, { wch: 35 }, { wch: 20 }];
XLSX.utils.book_append_sheet(wb, wsTech, 'Tech & Vận hành');

// ─── Write file ───────────────────────────────────────────────────────────────
const outputPath = './docs/ASEKA-Project-Requirements.xlsx';
XLSX.writeFile(wb, outputPath);
console.log(`✅ Xuất thành công: ${outputPath}`);
