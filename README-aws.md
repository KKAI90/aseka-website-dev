# AWS — môi trường DEV

Branch này (`aseka-dev`) dùng để build và test app trên hạ tầng AWS, tách biệt khỏi
deploy Vercel hiện tại (`dev`/`main`) và khỏi `aseka-main` (prod thật).

## Mục tiêu môi trường dev
Chi phí $0 trong Free Tier, ưu tiên đơn giản, có thể Stop/Start tự do khi không test.
Xem đầy đủ giải thích + sơ đồ tại `docs/aws-infrastructure-plan.md` trên nhánh `dev`.

## Hạ tầng dự kiến
| Thành phần | Dịch vụ | Ghi chú |
|---|---|---|
| Hosting | EC2 `t4g.micro` | Free tier 12 tháng đầu; Stop khi không test (release Elastic IP nếu muốn tuyệt đối $0) |
| Reverse proxy + SSL | Nginx + Certbot | Chạy trên chính EC2 |
| Process manager | PM2 | `pm2 start npm --name aseka-dev -- start` |
| Database | RDS PostgreSQL `db.t4g.micro`, Single-AZ, **Public access: YES** | Free tier 12 tháng đầu; public để chạy `prisma migrate` từ máy local |
| File CV | S3 bucket `aseka-dev-cv` | Free tier 5GB. **Lưu ý**: code hiện tại (nhánh `dev`) chưa thực sự lưu file CV gốc ở đâu — chỉ lưu văn bản đã trích xuất qua Groq. Cần viết thêm code upload lên S3 khi làm bước này, không phải "đồng bộ" từ Supabase Storage vì chưa từng dùng. |
| Email | Amazon SES — Sandbox mode | Đủ để test, không cần xin Production access ở dev |
| Secrets | SSM Parameter Store (Standard, free) | `JWT_SECRET`, `GROQ_API_KEY`, SES SMTP creds |
| Domain test | `dev.aseka.co.jp` (subdomain riêng, không đụng DNS chính) | |
| CI/CD | GitHub Actions (`.github/workflows/deploy-aws-dev.yml`) | Push vào `aseka-dev` → build ở CI → rsync artifact → PM2 restart (không build trên EC2) |

## Việc còn thiếu (chưa làm trong lần tạo branch này)
- [ ] Tạo IAM user riêng cho dev + Budget Alert (ngưỡng ví dụ $1)
- [ ] Tạo EC2 instance + security group + Elastic IP
- [ ] Tạo RDS dev, cập nhật `DATABASE_URL`/`DIRECT_URL`
- [ ] Tạo S3 bucket `aseka-dev-cv`, viết code upload CV lên S3 (tính năng mới, chưa từng có)
- [ ] Thêm GitHub Secrets: `EC2_DEV_HOST`, `EC2_DEV_SSH_KEY`, `DEV_DATABASE_URL`, `DEV_DIRECT_URL`
- [ ] Bật bước deploy trong `deploy-aws-dev.yml` (đang comment sẵn)
- [ ] Trỏ `dev.aseka.co.jp` → Elastic IP, chạy Certbot

## Không đổi
- Auth (JWT tự viết + bcrypt) — giữ nguyên, không phụ thuộc hạ tầng
- Middleware routing theo hostname (main/admin/mypage) — giữ nguyên
- Email hiện đang qua Gmail SMTP (nodemailer) trên `dev` — chuyển sang SES sandbox ở bước này
