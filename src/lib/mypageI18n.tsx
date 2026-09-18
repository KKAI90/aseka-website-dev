"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

// Same shape/pattern as src/lib/adminI18n.tsx's AdminLangProvider — a real single-language
// switcher (EN/VI/JA persisted to localStorage) instead of always showing Japanese + a
// Vietnamese gloss stacked together, which is what mypage did before this.
export type MypageLang = "en" | "vi" | "ja";

const DICT: Record<string, Record<MypageLang, string>> = {
  // ── nav / header ──────────────────────────────────────
  "nav.tagline": { en: "Aseka Career · My Page", vi: "Aseka Career · Trang cá nhân", ja: "Asekaキャリア · マイページ" },
  "nav.welcome": { en: "Welcome, {name}", vi: "Xin chào, {name}", ja: "ようこそ、{name} さん" },
  "nav.logout": { en: "Log out", vi: "Đăng xuất", ja: "ログアウト" },
  "nav.jobs": { en: "Introduced jobs", vi: "Việc làm giới thiệu", ja: "紹介求人" },
  "nav.favorites": { en: "Jobs I'm considering", vi: "Việc đang cân nhắc", ja: "検討中求人" },
  "nav.status": { en: "Application status", vi: "Trạng thái ứng tuyển", ja: "選考状況" },
  "nav.profile": { en: "Profile", vi: "Hồ sơ", ja: "プロフィール" },

  // ── job list ──────────────────────────────────────────
  "jobs.pickupTitle": { en: "Recommended jobs", vi: "Việc làm đề xuất", ja: "ピックアップ求人" },
  "jobs.pickupDesc": { en: "Jobs matched to your skill ({skill}) · JLPT {jlpt}", vi: "Việc làm phù hợp với kỹ năng ({skill}) · JLPT {jlpt} của bạn", ja: "あなたのスキル（{skill}）· JLPT {jlpt} に合わせたおすすめ求人" },
  "jobs.tabAll": { en: "All", vi: "Tất cả", ja: "すべて" },
  "jobs.tabUnread": { en: "Unread", vi: "Chưa xem", ja: "未読" },
  "jobs.tabNew": { en: "New", vi: "Mới", ja: "新着" },
  "jobs.favHint": { en: "Click ♡ \"Consider\" to save a job to your considering list. Click a row to see details.", vi: "Nhấn ♡ \"Cân nhắc\" để lưu vào mục Việc đang cân nhắc. Nhấn vào một dòng để xem chi tiết.", ja: "検討する♡をクリックすると、検討中求人に保存されます。行をクリックすると詳細が見られます。" },
  "jobs.colCompany": { en: "Company", vi: "Công ty", ja: "企業名" },
  "jobs.colPosition": { en: "Position", vi: "Vị trí", ja: "求人ポジション" },
  "jobs.colIncome": { en: "Annual income", vi: "Thu nhập năm", ja: "年収" },
  "jobs.colConsider": { en: "Consider", vi: "Cân nhắc", ja: "検討する" },
  "jobs.emptyAll": { en: "No matching jobs right now.", vi: "Hiện chưa có việc làm phù hợp.", ja: "現在該当する求人はありません。" },
  "jobs.negotiable": { en: "Negotiable", vi: "Thoả thuận", ja: "要相談" },
  "jobs.badgeNew": { en: "NEW", vi: "MỚI", ja: "NEW" },
  "jobs.badgeUrgent": { en: "⚡ Urgent", vi: "⚡ Khẩn cấp", ja: "⚡急募" },
  "jobs.badgeApplied": { en: "✓ Applied", vi: "✓ Đã ứng tuyển", ja: "✓応募済み" },
  "jobs.jlptOrMore": { en: "{lvl}+", vi: "Từ {lvl}", ja: "{lvl}以上" },
  "jobs.favAdd": { en: "Add to considering", vi: "Thêm vào cân nhắc", ja: "お気に入りに追加" },
  "jobs.favRemove": { en: "Remove from considering", vi: "Bỏ khỏi cân nhắc", ja: "お気に入り解除" },
  "jobs.unread": { en: "Unread", vi: "Chưa xem", ja: "未読" },

  "favorites.title": { en: "Jobs I'm considering", vi: "Việc đang cân nhắc", ja: "検討中求人" },
  "favorites.desc": { en: "Jobs you've marked ♥ to consider", vi: "Những việc làm bạn đã đánh dấu để cân nhắc", ja: "♥ お気に入りに追加した求人" },
  "favorites.empty": { en: "No jobs saved to consider yet.", vi: "Bạn chưa lưu việc làm nào để cân nhắc.", ja: "まだ検討中の求人はありません。" },

  // ── status tab ────────────────────────────────────────
  "status.title": { en: "Application status", vi: "Trạng thái ứng tuyển", ja: "選考状況" },
  "status.desc": { en: "Your current stage in the process", vi: "Giai đoạn tuyển dụng hiện tại của bạn", ja: "現在の選考ステージ" },
  "status.step.new": { en: "Document review", vi: "Đang xét hồ sơ", ja: "書類審査中" },
  "status.step.interview": { en: "Interview arranging", vi: "Đang phỏng vấn", ja: "面接調整中" },
  "status.step.offered": { en: "Offer received", vi: "Đã nhận offer", ja: "内定" },
  "status.step.working": { en: "Employed", vi: "Đang làm việc", ja: "就業中" },
  "status.current": { en: "Current status:", vi: "Trạng thái hiện tại:", ja: "現在のステータス:" },
  "status.registered": { en: "Registered", vi: "Đã đăng ký", ja: "登録済み" },
  "status.introducedTo": { en: "Introduced to:", vi: "Giới thiệu tới:", ja: "紹介先:" },
  "status.contactNote": { en: "Contact your advisor with any questions.", vi: "Liên hệ nhân viên phụ trách nếu có thắc mắc.", ja: "ご不明な点は担当スタッフへお問い合わせください。" },

  // ── profile tab ───────────────────────────────────────
  "profile.title": { en: "Profile", vi: "Hồ sơ của bạn", ja: "プロフィール" },
  "profile.desc": { en: "Your registered information", vi: "Thông tin đã đăng ký", ja: "登録情報" },
  "profile.name": { en: "Name", vi: "Họ tên", ja: "氏名" },
  "profile.email": { en: "Email", vi: "Email", ja: "メール" },
  "profile.phone": { en: "Phone", vi: "Điện thoại", ja: "電話番号" },
  "profile.dob": { en: "Date of birth", vi: "Ngày sinh", ja: "生年月日" },
  "profile.gender": { en: "Gender", vi: "Giới tính", ja: "性別" },
  "profile.jlpt": { en: "Japanese level", vi: "Trình độ tiếng Nhật", ja: "日本語" },
  "profile.skill": { en: "Desired industry", vi: "Ngành nghề mong muốn", ja: "希望業種" },
  "profile.preferredJob": { en: "Desired job", vi: "Vị trí mong muốn", ja: "希望職種" },
  "profile.visaType": { en: "Visa status", vi: "Tình trạng visa", ja: "在留資格" },
  "profile.availability": { en: "Available from", vi: "Thời gian có thể sang Nhật", ja: "来日可能時期" },
  "profile.updateInfo": { en: "✏️ Update my info", vi: "✏️ Cập nhật thông tin", ja: "✏️ 情報を更新する" },
  "profile.pwChangeTitle": { en: "Change password", vi: "Đổi mật khẩu", ja: "パスワード変更" },
  "profile.pwSetTitle": { en: "Set a password", vi: "Đặt mật khẩu", ja: "パスワードを設定する" },
  "profile.pwChangeDesc": { en: "Log in with your password from now on.", vi: "Đổi mật khẩu đăng nhập.", ja: "次回からパスワードでログインできます。" },
  "profile.pwSetDesc": { en: "Setting one skips the magic-link step next time.", vi: "Đặt mật khẩu để lần sau đăng nhập nhanh hơn.", ja: "設定すると次回からマジックリンク不要でログインできます。" },
  "profile.pwCurrentPlaceholder": { en: "Current password", vi: "Mật khẩu hiện tại", ja: "現在のパスワード" },
  "profile.pwNewPlaceholder": { en: "New password (6+ characters)", vi: "Mật khẩu mới (từ 6 ký tự)", ja: "新しいパスワード（6文字以上）" },
  "profile.pwSave": { en: "Saving...", vi: "Đang lưu...", ja: "保存中..." },
  "profile.pwChangeBtn": { en: "Change password", vi: "Đổi mật khẩu", ja: "パスワードを変更" },
  "profile.pwSetBtn": { en: "Set password", vi: "Đặt mật khẩu", ja: "パスワードを設定" },
  "profile.pwUpdated": { en: "Password updated", vi: "Đã cập nhật mật khẩu", ja: "パスワードを更新しました" },
  "unset": { en: "—", vi: "—", ja: "—" },

  // ── sidebar ───────────────────────────────────────────
  "sidebar.advisor": { en: "Career advisor", vi: "Nhân viên phụ trách", ja: "担当キャリアアドバイザー" },
  "sidebar.advisorName": { en: "Aseka Career", vi: "Aseka Career", ja: "Aseka キャリア" },
  "sidebar.contact": { en: "📩 Contact us", vi: "📩 Liên hệ", ja: "📩 相談する" },

  // ── job detail page ───────────────────────────────────
  "detail.loading": { en: "Loading...", vi: "Đang tải...", ja: "読み込み中..." },
  "detail.notFound": { en: "This job could not be found.", vi: "Không tìm thấy việc làm này.", ja: "この求人は見つかりませんでした。" },
  "detail.backToList": { en: "← Back to job list", vi: "← Về danh sách việc làm", ja: "← 求人一覧に戻る" },
  "detail.jobId": { en: "Job ID:", vi: "Mã việc làm:", ja: "求人ID:" },
  "detail.hired": { en: "hiring {n}", vi: "tuyển {n} người", ja: "採用{n}名" },
  "detail.tabOverview": { en: "Overview", vi: "Tổng quan", ja: "求人概要" },
  "detail.tabCompany": { en: "Company info", vi: "Thông tin công ty", ja: "企業情報" },
  "detail.osusume": { en: "⭐ Highlights", vi: "⭐ Điểm nổi bật", ja: "⭐ おすすめポイント" },
  "detail.section.employment": { en: "Employment terms", vi: "Điều kiện tuyển dụng", ja: "雇用条件" },
  "detail.section.jobDesc": { en: "Job description", vi: "Nội dung công việc", ja: "職務内容" },
  "detail.section.location": { en: "Work location", vi: "Địa điểm làm việc", ja: "勤務地" },
  "detail.section.requirements": { en: "Requirements", vi: "Yêu cầu", ja: "要件" },
  "detail.section.language": { en: "Language", vi: "Ngôn ngữ", ja: "語学" },
  "detail.section.education": { en: "Education", vi: "Học vấn", ja: "学歴" },
  "detail.section.selection": { en: "Selection process", vi: "Quy trình tuyển dụng", ja: "選考内容" },
  "detail.section.benefits": { en: "Compensation & benefits", vi: "Đãi ngộ", ja: "各種待遇" },
  "detail.section.other": { en: "Other", vi: "Khác", ja: "その他" },
  "detail.row.employmentType": { en: "Employment type", vi: "Hình thức hợp đồng", ja: "雇用形態" },
  "detail.row.trialPeriod": { en: "Trial period", vi: "Thời gian thử việc", ja: "試用期間" },
  "detail.row.jobDesc": { en: "Job description", vi: "Nội dung công việc", ja: "職務内容" },
  "detail.row.location": { en: "Work location", vi: "Địa điểm làm việc", ja: "勤務地" },
  "detail.row.workEnv": { en: "Work environment", vi: "Môi trường làm việc", ja: "就業環境備考" },
  "detail.row.requirements": { en: "Requirements", vi: "Yêu cầu ứng tuyển", ja: "応募要件" },
  "detail.row.qualifications": { en: "Qualifications", vi: "Bằng cấp / Chứng chỉ", ja: "資格" },
  "detail.row.language": { en: "Language ability", vi: "Yêu cầu ngôn ngữ", ja: "語学力" },
  "detail.row.education": { en: "Education", vi: "Học vấn", ja: "学歴" },
  "detail.row.selection": { en: "Selection process", vi: "Quy trình tuyển dụng", ja: "選考内容" },
  "detail.row.income": { en: "Annual income", vi: "Thu nhập năm", ja: "年収" },
  "detail.row.salaryType": { en: "Salary type", vi: "Hình thức trả lương", ja: "給与形態" },
  "detail.row.salaryNote": { en: "Salary notes", vi: "Ghi chú lương", ja: "賃金備考" },
  "detail.row.workHours": { en: "Working hours", vi: "Giờ làm việc", ja: "勤務時間" },
  "detail.row.holidays": { en: "Holidays", vi: "Ngày nghỉ", ja: "休日・休暇" },
  "detail.row.insurance": { en: "Insurance", vi: "Bảo hiểm", ja: "各種保険" },
  "detail.row.remarks": { en: "Remarks", vi: "Ghi chú khác", ja: "備考" },
  "detail.row.companyName": { en: "Company name", vi: "Tên công ty", ja: "企業名" },
  "detail.row.industry": { en: "Industry", vi: "Ngành nghề", ja: "業種" },
  "detail.applyBtn": { en: "Apply", vi: "Ứng tuyển", ja: "応募する" },
  "detail.applyBtnApplied": { en: "✓ Applied", vi: "✓ Đã ứng tuyển", ja: "✓ 応募済み" },
  "detail.applyBtnSending": { en: "Sending...", vi: "Đang gửi...", ja: "送信中..." },
  "detail.considerBtn": { en: "Consider", vi: "Cân nhắc", ja: "検討する" },
  "detail.consideredBtn": { en: "Added to considering", vi: "Đã thêm vào cân nhắc", ja: "検討中に追加済み" },
  "detail.backToListBtn": { en: "Back to job list", vi: "Về danh sách việc làm", ja: "求人一覧に戻る" },
  "detail.applySuccess": { en: "Applied to \"{company}\"", vi: "Đã ứng tuyển \"{company}\"", ja: "「{company}」に応募しました" },
  "detail.applyError": { en: "Something went wrong", vi: "Đã xảy ra lỗi", ja: "エラーが発生しました" },
  "detail.confirmSwitch": { en: "You're currently applying to \"{current}\". Switch to \"{next}\"?", vi: "Bạn đang ứng tuyển \"{current}\". Chuyển sang \"{next}\"?", ja: "現在「{current}」に応募中です。「{next}」に切り替えますか？" },
};

const MypageLangContext = createContext<{ lang: MypageLang; setLang: (l: MypageLang) => void; t: (key: string, vars?: Record<string,string|number>) => string } | null>(null);

export function MypageLangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<MypageLang>("ja");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("mypage_lang") : null;
    if (saved === "en" || saved === "vi" || saved === "ja") setLangState(saved);
  }, []);

  const setLang = useCallback((l: MypageLang) => {
    setLangState(l);
    if (typeof window !== "undefined") window.localStorage.setItem("mypage_lang", l);
  }, []);

  const t = useCallback((key: string, vars?: Record<string,string|number>) => {
    let str = DICT[key]?.[lang] ?? key;
    if (vars) Object.entries(vars).forEach(([k,v]) => { str = str.replace(`{${k}}`, String(v)); });
    return str;
  }, [lang]);

  return <MypageLangContext.Provider value={{ lang, setLang, t }}>{children}</MypageLangContext.Provider>;
}

export function useMypageLang() {
  const ctx = useContext(MypageLangContext);
  if (!ctx) throw new Error("useMypageLang must be used within MypageLangProvider");
  return ctx;
}
