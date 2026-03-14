"use client";
import { useState } from "react";

type FormState = {
  type: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  service: string;
  message: string;
};

const initialForm: FormState = {
  type: "business",
  name: "",
  company: "",
  email: "",
  phone: "",
  service: "",
  message: "",
};

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>(initialForm);

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "エラーが発生しました");
      }
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section id="contact" className="py-16 max-w-6xl mx-auto px-6 text-center">
        <div className="inline-flex flex-col items-center gap-4 rounded-2xl p-10 max-w-md mx-auto" style={{ border: "0.5px solid var(--border)" }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "#EAF3DE" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#27500A" strokeWidth="2">
              <path d="M9 12l2 2 4-4M12 3a9 9 0 100 18 9 9 0 000-18z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold" style={{ color: "var(--navy)" }}>送信完了 / Đã gửi thành công</h3>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            24時間以内にご連絡いたします。<br />Chúng tôi sẽ liên hệ trong vòng 24 giờ.
          </p>
          <button className="btn-ghost text-sm" onClick={() => { setSubmitted(false); setForm(initialForm); }}>
            別のお問い合わせ
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-16" style={{ background: "var(--surface)" }}>
      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center mb-8">
          <div className="section-eyebrow">Contact · お問い合わせ</div>
          <div className="section-title">まずは無料でご相談ください</div>
          <p className="text-sm" style={{ color: "var(--muted)" }}>Tư vấn miễn phí · Phản hồi trong 24 giờ · Hỗ trợ tiếng Việt</p>
        </div>
        <div className="flex rounded-xl overflow-hidden mb-6" style={{ border: "0.5px solid var(--border)", background: "#fff" }}>
          {[
            { val: "business", label: "企業・採用担当者", sub: "Doanh nghiệp" },
            { val: "individual", label: "個人・求職者", sub: "Cá nhân / ứng viên" },
          ].map((t) => (
            <button key={t.val} className="flex-1 py-3 text-sm font-medium border-none cursor-pointer transition-all"
              style={{ background: form.type === t.val ? "var(--navy)" : "transparent", color: form.type === t.val ? "#fff" : "var(--muted)" }}
              onClick={() => setForm((f) => ({ ...f, type: t.val }))}>
              {t.label}
              <span className="block text-xs mt-0.5" style={{ opacity: 0.65 }}>{t.sub}</span>
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>お名前 / Họ tên *</label>
              <input required type="text" className="w-full" placeholder="山田 太郎 / Nguyễn Văn A" value={form.name} onChange={set("name")} />
            </div>
            {form.type === "business" && (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>会社名 / Tên công ty *</label>
                <input required type="text" className="w-full" placeholder="株式会社〇〇" value={form.company} onChange={set("company")} />
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>メールアドレス / Email *</label>
              <input required type="email" className="w-full" placeholder="example@email.com" value={form.email} onChange={set("email")} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>電話番号 / Số điện thoại</label>
              <input type="tel" className="w-full" placeholder="090-0000-0000" value={form.phone} onChange={set("phone")} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>ご相談内容 / Dịch vụ quan tâm</label>
            <select className="w-full" value={form.service} onChange={set("service")}>
              <option value="">選択してください / Chọn dịch vụ</option>
              <option value="hr">人材紹介 / Giới thiệu nhân sự</option>
              <option value="nenkin">年金・社会保険 / Nenkin</option>
              <option value="visa">観光ビザ / Visa du lịch</option>
              <option value="zairyu">在留手続き / Thủ tục lưu trú</option>
              <option value="other">その他 / Khác</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>メッセージ / Nội dung</label>
            <textarea rows={4} className="w-full" placeholder="ご質問・ご要望をご記入ください / Nhập nội dung..." value={form.message} onChange={set("message")} />
          </div>
          {error && <p className="text-xs text-center" style={{ color: "var(--accent)" }}>{error}</p>}
          <button type="submit" disabled={loading} className="btn-navy w-full justify-center text-sm py-3" style={{ opacity: loading ? 0.6 : 1 }}>
            {loading ? "送信中... / Đang gửi..." : "送信する · Gửi liên hệ →"}
          </button>
          <p className="text-xs text-center" style={{ color: "var(--muted)" }}>
            個人情報は適切に管理し、第三者に提供しません。<br />Thông tin của bạn được bảo mật hoàn toàn.
          </p>
        </form>
      </div>
    </section>
  );
}
