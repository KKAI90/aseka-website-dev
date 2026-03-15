import { NextRequest, NextResponse } from "next/server";

const JOBS = [
  { id:1, company:"山本フーズ株式会社", position:"調理師", positionVn:"Nhân viên bếp",        industry:"飲食",  jlptMin:"N4", salary:"¥200,000", location:"東京都", status:"urgent" },
  { id:2, company:"東京工場株式会社",   position:"製造ライン", positionVn:"Công nhân",        industry:"製造",  jlptMin:"N5", salary:"¥185,000", location:"埼玉県", status:"urgent" },
  { id:3, company:"グランドホテル大阪", position:"客室清掃", positionVn:"Phục vụ phòng",      industry:"ホテル",jlptMin:"N4", salary:"¥175,000", location:"大阪府", status:"open"   },
  { id:4, company:"みどり農業組合",     position:"農場作業員", positionVn:"Nông trại",        industry:"農業",  jlptMin:"N5", salary:"¥165,000", location:"北海道", status:"open"   },
  { id:5, company:"さくらレストラン",   position:"ホール", positionVn:"Phục vụ bàn",          industry:"飲食",  jlptMin:"N4", salary:"¥170,000", location:"神奈川県",status:"paused" },
];

const JLPT_RANK: Record<string,number> = { N1:5,N2:4,N3:3,N4:2,N5:1,"なし":0,"":0 };

// ── Rule-based CV parser ──────────────────────────────────────────────────────

function extractName(text: string): string {
  // Vietnamese name patterns
  const vnPatterns = [
    /(?:氏名|お名前|名前)[：:\s]*([A-Za-z\u00C0-\u024F\s]{5,40})/i,
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s*$/m,
    /(?:Họ tên|Tên)[：:\s]*([A-Za-z\u00C0-\u024F\s]{5,40})/i,
  ];
  // Japanese katakana name (Vietnamese names written in katakana)
  const kataPattern = /([ア-ン゛゜ァ-ォャ-ョー]{4,20}[・\s][ア-ン゛゜ァ-ォャ-ョー]{2,15})/;
  const kataMatch = text.match(kataPattern);
  if (kataMatch) return kataMatch[1].replace(/\s+/g," ").trim();

  for (const p of vnPatterns) {
    const m = text.match(p);
    if (m) return m[1].replace(/\s+/g," ").trim();
  }

  // Fallback: first line that looks like a name
  const lines = text.split("\n").map(l=>l.trim()).filter(l=>l.length>0);
  for (const line of lines.slice(0,10)) {
    if (/^[A-Z][a-z]+(\s[A-Z][a-z]+){1,3}$/.test(line)) return line;
  }
  return "";
}

function extractEmail(text: string): string {
  const m = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  return m ? m[0] : "";
}

function extractPhone(text: string): string {
  const patterns = [
    /(?:0[789]0[-\s]?\d{4}[-\s]?\d{4})/,
    /(?:\+81[-\s]?[789]0[-\s]?\d{4}[-\s]?\d{4})/,
    /(?:電話|Tel|TEL|SĐT)[：:\s]*([0-9\-\s\+]{10,15})/i,
    /0\d{2,3}[-\s]?\d{3,4}[-\s]?\d{4}/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return (m[1] || m[0]).replace(/\s/g,"-").trim();
  }
  return "";
}

function extractJLPT(text: string): string {
  const m = text.match(/N[1-5](?:\s*(?:取得|合格|level|レベル))?/i);
  if (m) {
    const level = m[0].match(/N[1-5]/i);
    if (level) return level[0].toUpperCase();
  }
  // Check text mentions
  if (/日本語能力.*N1|N1.*日本語能力/i.test(text)) return "N1";
  if (/日本語能力.*N2|N2.*日本語能力/i.test(text)) return "N2";
  if (/日本語能力.*N3|N3.*日本語能力/i.test(text)) return "N3";
  if (/日本語能力.*N4|N4.*日本語能力/i.test(text)) return "N4";
  if (/日本語能力.*N5|N5.*日本語能力/i.test(text)) return "N5";
  if (/日本語.*初級|初級.*日本語/i.test(text)) return "N5";
  if (/日本語.*中級|中級.*日本語/i.test(text)) return "N4";
  if (/日本語.*上級|上級.*日本語/i.test(text)) return "N2";
  return "なし";
}

function extractIndustry(text: string): string {
  const keywords: Record<string, string[]> = {
    "飲食": ["飲食","レストラン","調理","料理","キッチン","ホール","接客","カフェ","食品","nhà hàng","bếp","phục vụ","ẩm thực"],
    "製造": ["製造","工場","ライン","溶接","組立","品質","機械","加工","生産","nhà máy","xí nghiệp","công nhân","hàn","lắp ráp"],
    "農業": ["農業","農場","農家","栽培","収穫","農作業","ハウス","nông nghiệp","nông trại","thu hoạch","trồng trọt"],
    "ホテル": ["ホテル","宿泊","客室","フロント","清掃","ハウスキーピング","khách sạn","dọn phòng","lễ tân"],
  };
  const scores: Record<string,number> = { "飲食":0,"製造":0,"農業":0,"ホテル":0 };
  const lower = text.toLowerCase();
  for (const [ind, kws] of Object.entries(keywords)) {
    for (const kw of kws) {
      const count = (lower.match(new RegExp(kw.toLowerCase(),"g"))||[]).length;
      scores[ind] += count;
    }
  }
  const best = Object.entries(scores).sort((a,b)=>b[1]-a[1])[0];
  return best[1] > 0 ? best[0] : "その他";
}

function extractExperienceYears(text: string): number {
  // Pattern: X年間 or X年の経験 or X năm kinh nghiệm
  const patterns = [
    /(\d+)年(?:間)?(?:の)?(?:経験|勤務|従事)/,
    /経験\s*[:：]?\s*(\d+)年/,
    /(\d+)\s*năm\s*kinh\s*nghiệm/i,
    /(\d+)\s*年\s*(\d+)\s*ヶ月/,
  ];
  let maxYears = 0;
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const y = parseInt(m[1]);
      if (y > maxYears && y < 50) maxYears = y;
    }
  }
  // Also check date ranges like 2019年 ～ 2024年
  const dateRanges = text.matchAll(/(\d{4})年.*?[～〜\-~].*?(\d{4})年/g);
  for (const match of dateRanges) {
    const years = parseInt(match[2]) - parseInt(match[1]);
    if (years > 0 && years < 30 && years > maxYears) maxYears = years;
  }
  return maxYears;
}

function extractSkills(text: string): string[] {
  const skillKeywords = [
    "溶接","フォークリフト","品質管理","Excel","Word","PowerPoint",
    "調理","接客","レジ操作","在庫管理","トラクター","ハウス栽培",
    "清掃","フロント業務","食品衛生","N1","N2","N3","N4","N5",
    "Hàn","Phục vụ","Lái xe","Tin học","Microsoft Office",
  ];
  const found: string[] = [];
  for (const skill of skillKeywords) {
    if (text.includes(skill) && !found.includes(skill)) {
      found.push(skill);
    }
  }
  return found.slice(0, 6);
}

function extractCertifications(text: string): string[] {
  const certs: string[] = [];
  const certPatterns = [
    /(?:資格|免許)[：:\s]*([^\n]{5,40})/g,
    /([^\n]*(?:免許|資格|検定|JLPT|N[1-5]取得)[^\n]{0,30})/g,
  ];
  for (const p of certPatterns) {
    const matches = text.matchAll(p);
    for (const m of matches) {
      const cert = m[1].trim();
      if (cert.length > 3 && cert.length < 50 && !certs.includes(cert)) {
        certs.push(cert);
      }
    }
  }
  return certs.slice(0, 4);
}

function extractGender(text: string): string {
  if (/女性|女|nữ/i.test(text)) return "女性";
  if (/男性|男|nam/i.test(text)) return "男性";
  return "";
}

function buildSummary(info: Record<string, unknown>, lang: "ja"|"vn"): string {
  const name = info.name as string;
  const jlpt = info.jlpt as string;
  const industry = info.industry as string;
  const exp = info.experienceYears as number;
  const industryVn: Record<string,string> = {
    "飲食":"nhà hàng/ẩm thực","製造":"nhà máy/xí nghiệp",
    "農業":"nông nghiệp","ホテル":"khách sạn","その他":"các ngành khác"
  };
  if (lang === "vn") {
    return `${name || "Ứng viên"} có ${exp > 0 ? `${exp} năm` : "kinh nghiệm"} trong ngành ${industryVn[industry]||industry}. ` +
      `Trình độ tiếng Nhật ${jlpt !== "なし" ? jlpt : "đang học"}. ` +
      `Sẵn sàng làm việc tại Nhật Bản.`;
  }
  return `${name || "候補者"}は${industry}業界で${exp > 0 ? `${exp}年間` : ""}の経験があります。` +
    `日本語レベルは${jlpt !== "なし" ? jlpt : "学習中"}です。日本での就労を希望しています。`;
}

function buildStrengths(industry: string, jlpt: string, expYears: number): string[] {
  const strengths: string[] = [];
  const jlptRank = JLPT_RANK[jlpt] || 0;
  if (jlptRank >= 3) strengths.push("日本語コミュニケーション能力 · Giao tiếp tiếng Nhật tốt");
  if (expYears >= 3) strengths.push(`${expYears}年以上の実務経験 · ${expYears}+ năm kinh nghiệm thực tế`);
  if (industry === "飲食") strengths.push("飲食業界の専門知識 · Kiến thức chuyên môn ngành F&B");
  if (industry === "製造") strengths.push("製造・品質管理スキル · Kỹ năng sản xuất & QC");
  if (industry === "農業") strengths.push("農業技術・体力 · Kỹ thuật nông nghiệp & thể lực tốt");
  if (industry === "ホテル") strengths.push("ホスピタリティスキル · Kỹ năng hospitality");
  strengths.push("チームワーク・責任感 · Tinh thần đồng đội & trách nhiệm cao");
  return strengths.slice(0, 3);
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("cv") as File | null;
    if (!file) return NextResponse.json({ error: "CVファイルが必要です" }, { status: 400 });

    // Read and clean text
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const rawText = buffer.toString("utf-8")
      .replace(/[^\u0020-\u007E\u3000-\u9FFF\uFF00-\uFFEF\n\r\t]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Extract all fields using rule-based parsing
    const name           = extractName(rawText);
    const email          = extractEmail(rawText);
    const phone          = extractPhone(rawText);
    const jlpt           = extractJLPT(rawText);
    const industry       = extractIndustry(rawText);
    const experienceYears = extractExperienceYears(rawText);
    const skills         = extractSkills(rawText);
    const certifications = extractCertifications(rawText);
    const gender         = extractGender(rawText);

    const candidateInfo = {
      name,
      email,
      phone,
      gender,
      dateOfBirth: "",
      jlpt,
      industry,
      experienceYears,
      skills,
      certifications,
      summary:   buildSummary({ name, jlpt, industry, experienceYears }, "ja"),
      summaryVn: buildSummary({ name, jlpt, industry, experienceYears }, "vn"),
      strengths: buildStrengths(industry, jlpt, experienceYears),
      preferredLocation: "",
      availability: "immediate",
    };

    // Job matching
    const rank = JLPT_RANK[jlpt] || 0;
    const suggestions = JOBS
      .filter(j => j.status !== "full")
      .map(job => {
        let score = 0;
        const reasons: string[] = [];
        if (job.industry === industry)          { score += 40; reasons.push(`業種マッチ · Đúng ngành ${industry}`); }
        const rq = JLPT_RANK[job.jlptMin] || 0;
        if (rank >= rq)                         { score += 30; reasons.push(`日本語OK · ${jlpt}`); }
        else if (rank === rq - 1)               { score += 10; reasons.push(`日本語レベル近似`); }
        if (experienceYears >= 3)               { score += 20; reasons.push(`経験${experienceYears}年`); }
        else if (experienceYears >= 1)          { score += 10; reasons.push(`経験あり`); }
        if (job.status === "urgent")            { score += 10; reasons.push(`緊急募集`); }
        return { ...job, score, reasons, matchPct: Math.min(score, 100) };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return NextResponse.json({
      candidate: candidateInfo,
      suggestions,
      fileName: file.name,
      fileSize: file.size,
    });

  } catch (err) {
    console.error("CV analysis error:", err);
    return NextResponse.json(
      { error: "CV分析エラー / Lỗi phân tích CV" },
      { status: 500 }
    );
  }
}