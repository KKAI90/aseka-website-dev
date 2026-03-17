"use client";
import { useState } from "react";

const navy = "#0B1F3A";
const B = { border: "0.5px solid rgba(11,31,58,0.1)" };

const WEBHOOK_URL = "https://aseka-website-dev.vercel.app/api/webhook/google-form";
const WEBHOOK_SECRET = "aseka-webhook-2026";

const GAS_CODE = `// ============================================================
// Google Apps Script — Aseka BO Webhook
// Cách dùng:
//   1. Mở Google Form → ⋮ → Script editor
//   2. Paste toàn bộ code này vào
//   3. Lưu → Run setupTrigger() một lần
//   4. Cấp quyền khi Google hỏi
// ============================================================

var WEBHOOK_URL    = "${WEBHOOK_URL}";
var WEBHOOK_SECRET = "${WEBHOOK_SECRET}";

// Chạy 1 lần để gắn trigger vào form
function setupTrigger() {
  // Xóa trigger cũ nếu có
  ScriptApp.getProjectTriggers().forEach(function(t) {
    ScriptApp.deleteTrigger(t);
  });
  // Lấy form hiện tại
  var form = FormApp.getActiveForm();
  ScriptApp.newTrigger("onFormSubmit")
    .forForm(form)
    .onFormSubmit()
    .create();
  Logger.log("✅ Trigger đã được gắn vào form: " + form.getTitle());
}

// Tự động chạy mỗi khi có người submit form
function onFormSubmit(e) {
  try {
    var responses = {};
    e.response.getItemResponses().forEach(function(itemRes) {
      var title = itemRes.getItem().getTitle();
      var value = itemRes.getResponse();
      // Ghép nhiều lựa chọn thành chuỗi
      if (Array.isArray(value)) value = value.join(", ");
      responses[title] = value || "";
    });

    var payload = JSON.stringify({ responses: responses });

    var options = {
      method: "post",
      contentType: "application/json",
      headers: { "x-webhook-secret": WEBHOOK_SECRET },
      payload: payload,
      muteHttpExceptions: true,
    };

    var res = UrlFetchApp.fetch(WEBHOOK_URL, options);
    var code = res.getResponseCode();
    var body = res.getContentText();

    if (code === 200) {
      Logger.log("✅ Đã import ứng viên: " + body);
    } else {
      Logger.log("❌ Lỗi " + code + ": " + body);
    }
  } catch (err) {
    Logger.log("❌ Exception: " + err);
  }
}

// Test thủ công — chạy để kiểm tra kết nối
function testConnection() {
  var testData = {
    responses: {
      "氏名": "Test Nguyen Van A",
      "メールアドレス": "test@example.com",
      "電話番号": "090-0000-0000",
      "日本語レベル": "N3",
      "希望業種": "製造",
    }
  };
  var options = {
    method: "post",
    contentType: "application/json",
    headers: { "x-webhook-secret": WEBHOOK_SECRET },
    payload: JSON.stringify(testData),
    muteHttpExceptions: true,
  };
  var res = UrlFetchApp.fetch(WEBHOOK_URL, options);
  Logger.log("Status: " + res.getResponseCode());
  Logger.log("Body: " + res.getContentText());
}`;

export default function SettingsPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ background: "#fff", ...B, borderTop: "none", borderLeft: "none", borderRight: "none", padding: "0 20px", height: "52px", display: "flex", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: navy }}>設定 / Cài đặt</div>
          <div style={{ fontSize: "10px", color: "#6B6B6B" }}>Google Form 連携 · Kết nối Google Form</div>
        </div>
      </div>

      <div style={{ padding: "20px" }}>

        {/* Flow diagram */}
        <div style={{ background: "#fff", ...B, borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: navy, marginBottom: "16px" }}>
            📋 Google Form → BO 自動連携フロー / Luồng tự động
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {[
              { icon: "📝", label: "ứng viên điền form", sub: "Google Form" },
              { icon: "→" },
              { icon: "⚙️", label: "Apps Script gửi data", sub: "tự động khi submit" },
              { icon: "→" },
              { icon: "🔗", label: "Webhook API nhận", sub: "/api/webhook/google-form" },
              { icon: "→" },
              { icon: "✅", label: "Tự vào danh sách", sub: "nhân vật quản lý / BO" },
            ].map((s, i) => (
              "icon" in s && s.label ? (
                <div key={i} style={{ background: "#F6F7F9", borderRadius: "10px", padding: "10px 14px", textAlign: "center", minWidth: "120px" }}>
                  <div style={{ fontSize: "20px" }}>{s.icon}</div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: navy, marginTop: "4px" }}>{s.label}</div>
                  <div style={{ fontSize: "9px", color: "#6B6B6B" }}>{s.sub}</div>
                </div>
              ) : (
                <div key={i} style={{ fontSize: "20px", color: "#6B6B6B" }}>{s.icon}</div>
              )
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          {/* Webhook URL */}
          <div style={{ background: "#fff", ...B, borderRadius: "12px", padding: "16px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: navy, marginBottom: "12px" }}>
              🔗 Webhook URL
            </div>
            <div style={{ background: "#F6F7F9", borderRadius: "8px", padding: "10px 12px", fontFamily: "monospace", fontSize: "11px", color: "#185FA5", wordBreak: "break-all", marginBottom: "8px" }}>
              {WEBHOOK_URL}
            </div>
            <button onClick={() => copy(WEBHOOK_URL, "url")}
              style={{ padding: "6px 14px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, background: copied === "url" ? "#27500A" : navy, color: "#fff", border: "none", cursor: "pointer", width: "100%" }}>
              {copied === "url" ? "✓ Copied!" : "コピー / Copy URL"}
            </button>
          </div>

          {/* Webhook Secret */}
          <div style={{ background: "#fff", ...B, borderRadius: "12px", padding: "16px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: navy, marginBottom: "12px" }}>
              🔑 Webhook Secret (bảo mật)
            </div>
            <div style={{ background: "#FFF8E6", border: "0.5px solid #EF9F27", borderRadius: "8px", padding: "10px 12px", fontFamily: "monospace", fontSize: "13px", fontWeight: 700, color: "#633806", marginBottom: "8px" }}>
              {WEBHOOK_SECRET}
            </div>
            <div style={{ fontSize: "10px", color: "#6B6B6B", marginBottom: "8px" }}>
              ⚠️ Thêm vào Vercel: Settings → Environment Variables → WEBHOOK_SECRET
            </div>
            <button onClick={() => copy(WEBHOOK_SECRET, "secret")}
              style={{ padding: "6px 14px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, background: copied === "secret" ? "#27500A" : "#633806", color: "#fff", border: "none", cursor: "pointer", width: "100%" }}>
              {copied === "secret" ? "✓ Copied!" : "Secret をコピー"}
            </button>
          </div>
        </div>

        {/* Setup steps */}
        <div style={{ background: "#fff", ...B, borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: navy, marginBottom: "16px" }}>
            📌 セットアップ手順 / Các bước cài đặt
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              {
                step: "1",
                title: "Google Form mở Script editor",
                desc: "Mở Google Form → click ⋮ (3 chấm) ở góc trên phải → chọn \"Script editor\"",
                color: "#185FA5",
              },
              {
                step: "2",
                title: "Paste Google Apps Script",
                desc: "Copy toàn bộ code bên dưới → paste vào Script editor → Lưu (Ctrl+S)",
                color: "#7C6FF7",
              },
              {
                step: "3",
                title: "Chạy setupTrigger() một lần",
                desc: "Trong Script editor → chọn hàm \"setupTrigger\" → nhấn Run ▶ → cấp quyền khi Google hỏi",
                color: "#EF9F27",
              },
              {
                step: "4",
                title: "Thêm WEBHOOK_SECRET vào Vercel",
                desc: "Vercel Dashboard → Project → Settings → Environment Variables → thêm WEBHOOK_SECRET = aseka-webhook-2026",
                color: "#5DCAA5",
              },
              {
                step: "5",
                title: "Test kết nối",
                desc: "Trong Script editor → chọn hàm \"testConnection\" → Run ▶ → kiểm tra log (View → Logs). Nếu thấy ✅ là thành công!",
                color: "#27500A",
              },
            ].map(s => (
              <div key={s.step} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: s.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, flexShrink: 0 }}>
                  {s.step}
                </div>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: navy }}>{s.title}</div>
                  <div style={{ fontSize: "11px", color: "#6B6B6B", marginTop: "2px" }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Field mapping */}
        <div style={{ background: "#fff", ...B, borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: navy, marginBottom: "4px" }}>
            🗂 Tên field trong Google Form → BO (tự động nhận diện)
          </div>
          <div style={{ fontSize: "11px", color: "#6B6B6B", marginBottom: "14px" }}>
            Đặt tên câu hỏi trong Form khớp với 1 trong các tên dưới đây (không phân biệt hoa/thường)
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {[
              { field: "名前 / Họ tên",     accept: "氏名、名前、Full name、Họ và tên" },
              { field: "Email",              accept: "メールアドレス、Email、E-mail、Địa chỉ email" },
              { field: "Điện thoại / 電話",  accept: "電話番号、Phone、Tel、Số điện thoại" },
              { field: "Ngày sinh / 生年月日",accept: "生年月日、Date of birth、Ngày sinh" },
              { field: "Giới tính / 性別",   accept: "性別、Gender、Giới tính" },
              { field: "JLPT / 日本語",      accept: "日本語レベル、JLPT、Trình độ tiếng Nhật" },
              { field: "Ngành nghề / 業種",  accept: "希望業種、業種、Ngành nghề、Lĩnh vực" },
              { field: "Vị trí mong muốn",   accept: "希望職種、Preferred job、Công việc mong muốn" },
              { field: "Visa / 在留資格",    accept: "在留資格、Visa type、Loại visa" },
              { field: "Lý do / 動機",       accept: "志望動機、Motivation、Lý do sang Nhật" },
              { field: "Giới thiệu / 自己PR",accept: "自己PR、Self PR、Giới thiệu bản thân" },
              { field: "Ghi chú / 備考",     accept: "備考、Note、Ghi chú、その他" },
            ].map(m => (
              <div key={m.field} style={{ background: "#F6F7F9", borderRadius: "8px", padding: "8px 10px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: navy }}>{m.field}</div>
                <div style={{ fontSize: "9px", color: "#6B6B6B", marginTop: "2px" }}>{m.accept}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Google Apps Script code */}
        <div style={{ background: "#fff", ...B, borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "0.5px solid rgba(11,31,58,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: navy }}>⚙️ Google Apps Script Code</div>
              <div style={{ fontSize: "10px", color: "#6B6B6B", marginTop: "1px" }}>Copy toàn bộ và paste vào Script editor của Google Form</div>
            </div>
            <button onClick={() => copy(GAS_CODE, "gas")}
              style={{ padding: "7px 16px", borderRadius: "7px", fontSize: "12px", fontWeight: 600, background: copied === "gas" ? "#27500A" : navy, color: "#fff", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>
              {copied === "gas" ? "✓ Copied!" : "📋 全てコピー / Copy tất cả"}
            </button>
          </div>
          <pre style={{ margin: 0, padding: "16px 20px", background: "#0B1F3A", color: "#E8F4FD", fontSize: "11px", lineHeight: "1.6", overflowX: "auto", maxHeight: "400px", overflowY: "auto" }}>
            {GAS_CODE}
          </pre>
        </div>

      </div>
    </div>
  );
}
