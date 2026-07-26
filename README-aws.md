# AWS — môi trường DEV

Branch này (`aseka-dev`) dùng để build và test app trên hạ tầng AWS, tách biệt khỏi
deploy Vercel hiện tại (`dev`/`main`).

## Mục tiêu môi trường dev
Chi phí gần $0, ưu tiên đơn giản để tự học AWS.

## Hạ tầng dự kiến
| Thành phần | Dịch vụ | Ghi chú |
|---|---|---|
| Hosting | EC2 `t4g.micro`/`t4g.small` | Free tier 12 tháng đầu; sau đó stop instance khi không test |
| Reverse proxy + SSL | Nginx + Certbot | Chạy trên chính EC2 |
| Process manager | PM2 | `pm2 start npm --name aseka-dev -- start` |
| Database | RDS PostgreSQL `db.t4g.micro`, Single-AZ | Free tier 12 tháng đầu |
| File CV | S3 bucket `aseka-dev-cv` | Free tier 5GB |
| Secrets | SSM Parameter Store (Standard, free) | `JWT_SECRET`, `GMAIL_APP_PASSWORD`, `RESEND_API_KEY`, `GROQ_API_KEY` |
| CI/CD | GitHub Actions (`.github/workflows/deploy-aws-dev.yml`) | Push vào `aseka-dev` → build → SSH deploy lên EC2 |

## Việc còn thiếu (chưa làm trong lần tạo branch này)
- [ ] Tạo AWS account riêng cho dev (dưới AWS Organization)
- [ ] Tạo EC2 instance + security group + Elastic IP
- [ ] Tạo RDS dev, cập nhật `DATABASE_URL`/`DIRECT_URL`
- [ ] Tạo S3 bucket, viết lại phần upload CV (hiện đang dùng Supabase Storage) sang S3
- [ ] Thêm GitHub Secrets: `EC2_DEV_HOST`, `EC2_DEV_SSH_KEY`
- [ ] Bật bước SSH deploy trong `deploy-aws-dev.yml` (đang comment sẵn)

## Không đổi
- Auth (JWT tự viết) — giữ nguyên, không phụ thuộc hạ tầng
- Email (Resend/Nodemailer) — giữ nguyên
- Middleware routing theo hostname (main/admin/mypage) — giữ nguyên
