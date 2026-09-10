"use client";
import { useState } from "react";
import { useAdminLang } from "@/lib/adminI18n";

const navy = "#0B1F3A";
const B = { border: "0.5px solid rgba(11,31,58,0.1)" };

const WEBHOOK_URL = `${process.env.NEXT_PUBLIC_SITE_URL || "https://dev.aseka.co.jp"}/api/webhook/google-form`;
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
  const { t } = useAdminLang();
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      <style>{`
        @keyframes settingsFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .settings-fade { animation: settingsFadeIn 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .settings-card { transition: box-shadow 0.2s ease, transform 0.2s ease; }
        .settings-card:hover { box-shadow: 0 6px 20px rgba(11,31,58,0.06); transform: translateY(-1px); }
        .settings-btn { transition: opacity 0.15s ease, transform 0.15s ease; }
        .settings-btn:hover { opacity: 0.85; transform: translateY(-1px); }
        .settings-btn:active { transform: translateY(0); }
        @media (prefers-reduced-motion: reduce) { .settings-fade{animation:none;} .settings-card,.settings-btn{transition:none;} }
      `}</style>
      {/* Header */}
      <div style={{ background: "#fff", ...B, borderTop: "none", borderLeft: "none", borderRight: "none", padding: "0 20px", height: "52px", display: "flex", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: navy }}>{t("sidebar.settings")}</div>
          <div style={{ fontSize: "11px", color: "#52525B" }}>{t("settings.subtitle")}</div>
        </div>
      </div>

      <div style={{ padding: "20px" }}>

        {/* Flow diagram */}
        <div className="settings-card settings-fade" style={{ background: "#fff", ...B, borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: navy, marginBottom: "16px" }}>
            {t("settings.flowTitle")}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {[
              { icon: "📝", label: t("settings.flowStep1"), sub: "Google Form" },
              { icon: "→" },
              { icon: "⚙️", label: t("settings.flowStep2"), sub: t("settings.flowStep2Sub") },
              { icon: "→" },
              { icon: "🔗", label: t("settings.flowStep3"), sub: "/api/webhook/google-form" },
              { icon: "→" },
              { icon: "✅", label: t("settings.flowStep4"), sub: t("settings.flowStep4Sub") },
            ].map((s, i) => (
              "icon" in s && s.label ? (
                <div key={i} style={{ background: "#F6F7F9", borderRadius: "10px", padding: "10px 14px", textAlign: "center", minWidth: "120px" }}>
                  <div style={{ fontSize: "20px" }}>{s.icon}</div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: navy, marginTop: "4px" }}>{s.label}</div>
                  <div style={{ fontSize: "10px", color: "#52525B" }}>{s.sub}</div>
                </div>
              ) : (
                <div key={i} style={{ fontSize: "20px", color: "#52525B" }}>{s.icon}</div>
              )
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          {/* Webhook URL */}
          <div className="settings-card settings-fade" style={{ background: "#fff", ...B, borderRadius: "12px", padding: "16px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: navy, marginBottom: "12px" }}>
              {t("settings.webhookUrlLabel")}
            </div>
            <div style={{ background: "#F6F7F9", borderRadius: "8px", padding: "10px 12px", fontFamily: "monospace", fontSize: "11px", color: "#185FA5", wordBreak: "break-all", marginBottom: "8px" }}>
              {WEBHOOK_URL}
            </div>
            <button className="settings-btn" onClick={() => copy(WEBHOOK_URL, "url")}
              style={{ padding: "6px 14px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, background: copied === "url" ? "#27500A" : navy, color: "#fff", border: "none", cursor: "pointer", width: "100%" }}>
              {copied === "url" ? t("settings.copiedBtn") : t("settings.copyUrlBtn")}
            </button>
          </div>

          {/* Webhook Secret */}
          <div className="settings-card settings-fade" style={{ background: "#fff", ...B, borderRadius: "12px", padding: "16px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: navy, marginBottom: "12px" }}>
              {t("settings.webhookSecretLabel")}
            </div>
            <div style={{ background: "#FFF8E6", border: "0.5px solid #EF9F27", borderRadius: "8px", padding: "10px 12px", fontFamily: "monospace", fontSize: "13px", fontWeight: 700, color: "#633806", marginBottom: "8px" }}>
              {WEBHOOK_SECRET}
            </div>
            <div style={{ fontSize: "11px", color: "#52525B", marginBottom: "8px" }}>
              {t("settings.secretWarning")}
            </div>
            <button className="settings-btn" onClick={() => copy(WEBHOOK_SECRET, "secret")}
              style={{ padding: "6px 14px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, background: copied === "secret" ? "#27500A" : "#633806", color: "#fff", border: "none", cursor: "pointer", width: "100%" }}>
              {copied === "secret" ? t("settings.copiedBtn") : t("settings.copySecretBtn")}
            </button>
          </div>
        </div>

        {/* Setup steps */}
        <div className="settings-card settings-fade" style={{ background: "#fff", ...B, borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: navy, marginBottom: "16px" }}>
            {t("settings.setupStepsTitle")}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { step: "1", titleKey: "settings.step1Title", descKey: "settings.step1Desc", color: "#185FA5" },
              { step: "2", titleKey: "settings.step2Title", descKey: "settings.step2Desc", color: "#7C6FF7" },
              { step: "3", titleKey: "settings.step3Title", descKey: "settings.step3Desc", color: "#EF9F27" },
              { step: "4", titleKey: "settings.step4Title", descKey: "settings.step4Desc", color: "#5DCAA5" },
              { step: "5", titleKey: "settings.step5Title", descKey: "settings.step5Desc", color: "#27500A" },
            ].map(s => (
              <div key={s.step} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: s.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, flexShrink: 0 }}>
                  {s.step}
                </div>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: navy }}>{t(s.titleKey)}</div>
                  <div style={{ fontSize: "11px", color: "#52525B", marginTop: "2px" }}>{t(s.descKey)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Field mapping */}
        <div className="settings-card settings-fade" style={{ background: "#fff", ...B, borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: navy, marginBottom: "4px" }}>
            {t("settings.fieldMapTitle")}
          </div>
          <div style={{ fontSize: "11px", color: "#52525B", marginBottom: "14px" }}>
            {t("settings.fieldMapDesc")}
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
                <div style={{ fontSize: "10px", color: "#52525B", marginTop: "2px" }}>{m.accept}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Google Apps Script code */}
        <div className="settings-card settings-fade" style={{ background: "#fff", ...B, borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "0.5px solid rgba(11,31,58,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: navy }}>{t("settings.gasCodeTitle")}</div>
              <div style={{ fontSize: "11px", color: "#52525B", marginTop: "1px" }}>{t("settings.gasCodeDesc")}</div>
            </div>
            <button className="settings-btn" onClick={() => copy(GAS_CODE, "gas")}
              style={{ padding: "7px 16px", borderRadius: "7px", fontSize: "12px", fontWeight: 600, background: copied === "gas" ? "#27500A" : navy, color: "#fff", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>
              {copied === "gas" ? t("settings.copiedBtn") : t("settings.copyAllBtn")}
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
