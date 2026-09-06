# AWS — môi trường PROD

Branch này (`aseka-main`) dùng để build và deploy app lên hạ tầng AWS production,
phục vụ traffic thật (ước tính ~3.000 ứng viên/năm, ~100 công ty/năm).

**Base của nhánh này = `main` thật (đang chạy tại `aseka.co.jp` qua Vercel)**, không
phải `dev`. Mục đích: chuyển hạ tầng và ra mắt tính năng mới là 2 việc tách biệt —
AWS Prod ban đầu phải giống hệt production hiện tại để dễ xác định lỗi (nếu có) là
do hạ tầng mới, không lẫn với tính năng mới. Các tính năng đang phát triển trên
`aseka-dev`/`dev` sẽ lên sau, qua PR riêng khi cần.

## Nguyên tắc
Chỉ merge vào `aseka-main` sau khi đã test kỹ trên `aseka-dev`. Không chạy thử
nghiệm hạ tầng mới trực tiếp trên prod. Merge vào `aseka-main` yêu cầu Pull Request
đã review — không push thẳng.

## Hạ tầng dự kiến (đã chốt bản tối giản chi phí)
| Thành phần | Dịch vụ | Ghi chú | Chi phí trong Free Tier | Sau Free Tier |
|---|---|---|---|---|
| Hosting | EC2 `t4g.micro`/`t4g.small` | Elastic IP (giữ cố định) + Nginx + Certbot (SSL) + PM2 cluster ×2 | $0 | ~$6-7/tháng |
| CDN + chống DDoS | CloudFront + Shield Standard | Đứng trước EC2, cache static asset | $0 (1TB/12 tháng) | ~$0 (traffic thấp) |
| Database | RDS PostgreSQL `db.t4g.micro`, **Single-AZ** | Public access: NO (private subnet), Storage Autoscaling, Auto Recovery | $0 | ~$12-13/tháng |
| File CV | S3 Standard + lifecycle rule (Glacier sau 1 năm) | | $0 (<5GB) | ~$1-2/tháng |
| Email | Amazon SES — Production access | Thay Gmail SMTP hiện tại | $0 | ~$0-1/tháng |
| Secrets | SSM Parameter Store (Standard, free) | `JWT_SECRET`, `GROQ_API_KEY`, SES SMTP creds | $0 | $0 |
| DNS/SSL | Giữ ở nhà đăng ký hiện tại (không cần Route 53) | `aseka.co.jp`, `admin.aseka.co.jp`, `mypage.aseka.co.jp` | $0 | $0 |
| Monitoring | CloudWatch (trong hạn free) → EC2 Auto Recovery | | $0 | $0 (trong hạn) |
| CI/CD | GitHub Actions (`.github/workflows/deploy-aws-prod.yml`) | Push vào `aseka-main` → build ở CI → rsync artifact → PM2 restart (không build trên EC2) | — | — |

**Tổng ước tính: $0/tháng trong Free Tier → ~$20-25/tháng sau đó.**

Multi-AZ và AWS WAF **cố tình bỏ ở giai đoạn đầu** — thêm sau khi có traffic thật
cần SLA uptime hoặc gặp spam/bot cụ thể (xem `docs/aws-infrastructure-plan.md` ở
nhánh `dev` để biết đầy đủ lý do và ngưỡng nâng cấp).

## Việc còn thiếu (chưa làm trong lần tạo branch này)
- [ ] Tạo AWS account/IAM user riêng cho prod + Budget Alert
- [ ] Tạo EC2 + security group (chỉ mở port 443/80, SSH giới hạn IP)
- [ ] Tạo RDS Single-AZ, `Public access: NO`, private subnet, Storage Autoscaling
- [ ] Tạo S3 bucket `aseka-main-cv`, viết code upload CV lên S3 (đồng bộ với `aseka-dev`)
- [ ] Xin SES Production access, verify domain DKIM/SPF
- [ ] Bật CloudFront trước EC2
- [ ] Thêm GitHub Secrets: `EC2_PROD_HOST`, `EC2_PROD_SSH_KEY`
- [ ] Bật bước deploy trong `deploy-aws-prod.yml` (đang comment sẵn) — kèm health check
- [ ] Đổi DNS `aseka.co.jp` sang hạ tầng mới **chỉ sau khi** AWS Prod đã chạy ổn định song song

## Không đổi
- Auth (JWT tự viết + bcrypt) — giữ nguyên, không phụ thuộc hạ tầng
- Middleware routing theo hostname (main/admin/mypage) — giữ nguyên
- Email hiện đang qua Gmail SMTP (nodemailer) — sẽ chuyển sang SES ở bước này, không đổi ở code khác
