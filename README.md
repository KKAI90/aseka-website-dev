# Aseka株式会社 — Website

Website giới thiệu nhân sự & hỗ trợ người Việt tại Nhật Bản.

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deploy**: Vercel (free tier)
- **CI/CD**: GitHub Actions

---

## Bắt đầu nhanh (Local Dev)

### 1. Clone & cài dependencies

```bash
git clone https://github.com/YOUR_ORG/aseka-website.git
cd aseka-website
npm install
```

### 2. Tạo file môi trường

```bash
cp .env.example .env.local
```

Điền vào `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=re_xxxxxxxxxxxx
```

### 3. Chạy dev server

```bash
npm run dev
# → http://localhost:3000
```

---

## Cấu trúc dự án

```
aseka/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout + metadata
│   │   ├── page.tsx            # Landing page (ghép components)
│   │   ├── globals.css         # Global styles + CSS variables
│   │   └── api/
│   │       └── contact/
│   │           └── route.ts    # API: nhận form liên hệ → Supabase + email
│   └── components/
│       ├── Navbar.tsx          # Navigation + language toggle
│       ├── Hero.tsx            # Hero section + dashboard card
│       ├── TrustStrip.tsx      # Logo đối tác
│       ├── Services.tsx        # 6 dịch vụ
│       ├── Nenkin.tsx          # Highlight năm kim
│       ├── Flow.tsx            # Quy trình 4 bước
│       ├── Visa.tsx            # Visa support
│       ├── Contact.tsx         # Form liên hệ
│       └── Footer.tsx          # Footer
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD: lint → deploy Vercel
├── .env.example
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Deploy lên Vercel (lần đầu)

### Bước 1: Tạo tài khoản Vercel
Vào [vercel.com](https://vercel.com) → đăng ký bằng GitHub

### Bước 2: Import project
```bash
npm install -g vercel
vercel login
vercel        # follow prompts
```

### Bước 3: Thêm GitHub Secrets
Vào repo GitHub → **Settings → Secrets → Actions**, thêm:

| Secret | Lấy từ đâu |
|--------|-----------|
| `VERCEL_TOKEN` | vercel.com → Settings → Tokens |
| `VERCEL_ORG_ID` | `.vercel/project.json` sau khi `vercel link` |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` sau khi `vercel link` |

### Bước 4: Push code → tự động deploy
```bash
git add .
git commit -m "feat: initial landing page"
git push origin main
# → GitHub Actions chạy lint → deploy Vercel tự động
```

---

## Kết nối domain

### Mua domain
- Khuyến nghị: [Namecheap](https://namecheap.com) → tìm `aseka.co.jp` hoặc `aseka.jp`
- `.com` rẻ hơn (~$15/năm), `.jp` uy tín hơn tại Nhật (~$20/năm)

### Gắn domain vào Vercel
1. Vercel Dashboard → project → **Settings → Domains**
2. Thêm domain: `aseka.jp`
3. Copy nameserver về Namecheap → **Domain → Nameservers → Custom**
4. Chờ 24–48h propagate

---

## Roadmap tiếp theo

### Phase 2 — Back Office (BO) System
- [ ] `/admin` — dashboard quản lý
- [ ] Quản lý ứng viên (CRUD)
- [ ] Quản lý doanh nghiệp khách hàng
- [ ] Workflow tuyển dụng (apply → interview → hired)
- [ ] Auth: Supabase Auth (email + Google)

### Phase 3 — Scale lên AWS
- [ ] Migrate từ Vercel → AWS Amplify hoặc ECS
- [ ] RDS PostgreSQL thay Supabase
- [ ] S3 lưu CV / hồ sơ
- [ ] CloudFront CDN

---

## Liên hệ & hỗ trợ

**Aseka株式会社 / công ty aseka**
- Email: info@aseka.jp
- ベトナム語対応 · Hỗ trợ tiếng Việt
# aseka-website-dev
