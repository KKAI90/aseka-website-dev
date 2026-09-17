"use client";
import React from 'react';
import { createPortal } from "react-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import JSZip from "jszip";
import { useAdminLang } from "@/lib/adminI18n";
import { calcExperienceMonths, formatExperienceJa, formatExperienceVn } from "@/lib/experience";

/* ─── Types ─────────────────────────────────────────────── */
type Edu  = { year:string; month:string; school:string; event:string };
type Work = { year:string; month:string; company:string; position:string; event:string };
type Cert = { year:string; month:string; name:string; result:string };
type MatchBreakdown = { criterion:string; score:number; noteVn:string };
type Job  = { id:string; company:string; position_ja:string; position_vn:string; industry:string; jlpt_min:string; salary:string; location:string; status:string; score:number; matchPct:number; reasons:string[]; breakdown?:MatchBreakdown[] };

type Candidate = {
  id:string; name:string; name_kana:string; email:string; phone:string;
  gender:string; date_of_birth:string; nationality:string; address:string;
  visa_type:string; visa_expiry:string; jlpt:string; jlpt_actual:string;
  jlpt_exam_year?:string; jlpt_exam_month?:string; jlpt_exam_status?:string;
  height_cm:number|null; weight_kg:number|null;
  skill:string; preferred_job:string; preferred_location?:string; work_hours:string; availability:string;
  marital_status:string; dependents:string;
  education:Edu[]; work_history:Work[]; certifications:Cert[];
  motivation:string; self_pr:string;
  status:string; match_job_id:string|null; match_job_name:string;
  applied_via:string|null; applied_at:string|null; applied_reviewed:boolean;
  note:string; cv_filename:string|null; ai_data:Record<string,unknown>|null;
  photo_url?:string|null; id_front_url?:string|null; id_back_url?:string|null;
  jlpt_cert_url?:string|null; senmonkyu_url?:string|null; other_cert_url?:string|null;
  created_at:string; updated_at:string;
};

type FileItem = {
  file:File; id:string;
  status:"waiting"|"analyzing"|"done"|"error";
  progress:number;
  result?:{ success:boolean; fileName:string; candidate?:Record<string,unknown>; suggestions?:Job[]; error?:string; rateLimited?:boolean };
};

/* ─── Constants ──────────────────────────────────────────── */
const ST: Record<string,{ja:string;vn:string;tc:string;tb:string;labelKey:string}> = {
  new:      {ja:"新規",   vn:"Mới",       tc:"#0C447C",tb:"#E6F1FB",labelKey:"candidates.statusNew"},
  interview:{ja:"面接中", vn:"Phỏng vấn", tc:"#633806",tb:"#FAEEDA",labelKey:"candidates.statusInterview"},
  offered:  {ja:"内定済", vn:"Đã offer",  tc:"#534AB7",tb:"#EEEDFE",labelKey:"candidates.statusOffered"},
  working:  {ja:"就業中", vn:"Đang làm",  tc:"#27500A",tb:"#EAF3DE",labelKey:"candidates.statusWorking"},
  quit:     {ja:"退職",   vn:"Nghỉ",      tc:"#444441",tb:"#F1EFE8",labelKey:"candidates.statusQuit"},
};
const JC: Record<string,{tc:string;tb:string}> = {
  N1:{tc:"#A32D2D",tb:"#FCEBEB"},N2:{tc:"#633806",tb:"#FAEEDA"},
  N3:{tc:"#27500A",tb:"#EAF3DE"},N4:{tc:"#444441",tb:"#F1EFE8"},N5:{tc:"#52525B",tb:"#F1EFE8"},
};
const navy="#0B1F3A";
const B={border:"0.5px solid rgba(11,31,58,0.1)"};
const fmt=(b:number)=>b>1048576?`${(b/1048576).toFixed(1)}MB`:`${(b/1024).toFixed(0)}KB`;
const fmtDate=(s:string)=>s?new Date(s).toLocaleDateString("ja-JP"):"—";
const calcAge=(dob:string)=>{
  if(!dob) return null;
  const b=new Date(dob); if(Number.isNaN(b.getTime())) return null;
  const now=new Date();
  let age=now.getFullYear()-b.getFullYear();
  const m=now.getMonth()-b.getMonth();
  if(m<0||(m===0&&now.getDate()<b.getDate())) age--;
  return age;
};
// FORM_URL phải luôn trỏ về domain chính (nơi /dang-ky thực sự tồn tại) —
// KHÔNG dùng window.location.origin vì trang này chạy trên subdomain admin.*,
// middleware chặn mọi route không phải /admin trên subdomain đó.
const FORM_URL = `${process.env.NEXT_PUBLIC_SITE_URL || "https://dev.aseka.co.jp"}/dang-ky`;

/* ─── Export CV as HTML ──────────────────────────────────── */
function exportCV(c: Candidate) {
  const html = `<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8"><title>履歴書 - ${c.name}</title>
<style>
body{font-family:'Noto Sans JP',sans-serif;max-width:800px;margin:0 auto;padding:24px;color:#0B1F3A}
h1{font-size:22px;text-align:center;margin-bottom:4px}
.sub{text-align:center;color:#52525B;font-size:13px;margin-bottom:20px}
table{width:100%;border-collapse:collapse;margin-bottom:16px}
th,td{border:1px solid #ddd;padding:8px 12px;font-size:13px}
th{background:#F6F7F9;font-weight:600;width:180px;text-align:left}
.section{font-size:14px;font-weight:700;background:#0B1F3A;color:#fff;padding:6px 12px;margin:16px 0 8px;border-radius:4px}
.tag{display:inline-block;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;margin:2px}
.timeline{font-size:12px;line-height:2}
.footer{margin-top:24px;text-align:center;font-size:11px;color:#999}
@media print{body{padding:0}}
</style></head>
<body>
<h1>履歴書 / Hồ sơ ứng viên</h1>
<div class="sub">作成日 ${new Date().toLocaleDateString("ja-JP")}</div>

<div class="section">基本情報 / Thông tin cơ bản</div>
<table>
<tr><th>氏名</th><td><strong>${c.name}</strong>${c.name_kana?` (${c.name_kana})`:""}</td></tr>
<tr><th>性別 / 生年月日</th><td>${c.gender||"—"} / ${c.date_of_birth?new Date(c.date_of_birth).toLocaleDateString("ja-JP"):"—"}</td></tr>
<tr><th>連絡先</th><td>${c.email||"—"} / ${c.phone||"—"}</td></tr>
<tr><th>住所</th><td>${c.address||"ベトナム"}</td></tr>
<tr><th>在留資格</th><td>${c.visa_type||"—"} ${c.visa_expiry?`（期限: ${new Date(c.visa_expiry).toLocaleDateString("ja-JP")}）`:""}</td></tr>
<tr><th>日本語能力</th><td><span class="tag" style="background:#EAF3DE;color:#27500A">${c.jlpt||"—"}</span> ${c.jlpt_actual?`(${c.jlpt_actual})`:""}</td></tr>
<tr><th>身長 / 体重</th><td>${c.height_cm?`${c.height_cm}cm`:"—"} / ${c.weight_kg?`${c.weight_kg}kg`:"—"}</td></tr>
<tr><th>婚姻 / 扶養</th><td>${c.marital_status||"—"} / ${c.dependents||0}人</td></tr>
<tr><th>希望職種</th><td>${c.preferred_job||"—"}</td></tr>
<tr><th>就業可能日</th><td>${c.availability||"即日"}</td></tr>
</table>

${(c.education||[]).length>0?`
<div class="section">学歴 / Học vấn</div>
<table>
<tr><th>年月</th><th>学校名</th><th>区分</th></tr>
${(c.education||[]).map(e=>`<tr><td>${e.year||""}年${e.month||""}月</td><td>${e.school||""}</td><td>${e.event||""}</td></tr>`).join("")}
</table>`:""}

${(c.work_history||[]).length>0?`
<div class="section">職歴 / Kinh nghiệm làm việc</div>
<table>
<tr><th>年月</th><th>会社名</th><th>職種</th><th>区分</th></tr>
${(c.work_history||[]).map(w=>`<tr><td>${w.year||""}年${w.month||""}月</td><td>${w.company||""}</td><td>${w.position||""}</td><td>${w.event||""}</td></tr>`).join("")}
</table>`:""}

${(c.certifications||[]).length>0?`
<div class="section">免許・資格 / Chứng chỉ</div>
<table>
<tr><th>年月</th><th>資格名</th><th>結果</th></tr>
${(c.certifications||[]).map(ct=>`<tr><td>${ct.year||""}年${ct.month||""}月</td><td>${ct.name||""}</td><td>${ct.result||""}</td></tr>`).join("")}
</table>`:""}

${c.motivation?`<div class="section">志望動機</div><p style="font-size:13px;line-height:1.8;padding:8px">${c.motivation}</p>`:""}
${c.self_pr?`<div class="section">自己PR</div><p style="font-size:13px;line-height:1.8;padding:8px">${c.self_pr}</p>`:""}

<div class="footer">Generated by Aseka株式会社 Back Office System</div>
</body></html>`;

  const blob = new Blob([html], { type:"text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `CV_${c.name.replace(/\s+/g,"_")}.html`;
  a.click(); URL.revokeObjectURL(url);
}

/* ─── CV Modal (履歴書-style view) ──────────────────────────── */
const DOC_FIELDS: {key:"photo_url"|"id_front_url"|"id_back_url"|"jlpt_cert_url"|"senmonkyu_url"|"other_cert_url"; labelKey:string}[] = [
  { key:"id_front_url",   labelKey:"candidates.docIdFront" },
  { key:"id_back_url",    labelKey:"candidates.docIdBack" },
  { key:"jlpt_cert_url",  labelKey:"candidates.docJlptCert" },
  { key:"senmonkyu_url",  labelKey:"candidates.docSenmonkyu" },
  { key:"other_cert_url", labelKey:"candidates.docOther" },
];
// Same 6 slots as DOC_FIELDS plus the portrait photo — used by the Documents section in the
// candidate detail panel, where (unlike the CV popup) an admin can also upload into an
// empty slot, so 写真 belongs in this list too.
const DOC_FIELDS_ALL: {key:"photo_url"|"id_front_url"|"id_back_url"|"jlpt_cert_url"|"senmonkyu_url"|"other_cert_url"; labelKey:string}[] = [
  { key:"photo_url", labelKey:"candidates.docPhoto" },
  ...DOC_FIELDS,
];

function CVModal({ candidate, fileUrls, loading, onClose, t }:
  { candidate:Candidate; fileUrls:Record<string,string|null>; loading:boolean; onClose:()=>void; t:(k:string,v?:Record<string,string|number>)=>string }) {
  const age = calcAge(candidate.date_of_birth);
  const edu = candidate.education||[];
  const work = candidate.work_history||[];
  const certs = candidate.certifications||[];

  const th: React.CSSProperties = { border:"1px solid #C9C6BB", background:"#F6F7F9", fontWeight:700, fontSize:"11px", padding:"6px 8px", textAlign:"left", color:navy, whiteSpace:"nowrap" };
  const td: React.CSSProperties = { border:"1px solid #C9C6BB", fontSize:"12px", padding:"6px 8px", color:"#1A1A1A" };
  const sectionBar: React.CSSProperties = { background:navy, color:"#fff", fontSize:"12px", fontWeight:700, padding:"6px 10px", letterSpacing:"0.02em" };

  // Portal straight to document.body: .admin-main > div carries a CSS animation
  // (adminFadeIn) that sets `transform`, which creates a new containing block for any
  // position:fixed descendant per the CSS spec. Without the portal, this overlay would
  // resolve "fixed" against that animated ancestor instead of the viewport — found via
  // real-browser screenshot testing (the modal rendered squeezed into the content area,
  // sidebar still visible, instead of covering the whole screen).
  return createPortal(
    <div className="rirekisho-overlay" style={{position:"fixed",inset:0,background:"rgba(11,31,58,0.55)",zIndex:200,display:"flex",alignItems:"flex-start",justifyContent:"center",overflowY:"auto",padding:"28px 16px"}} onClick={onClose}>
      <style>{`
        @media print {
          /* visibility:hidden (the usual "print only this element" trick) keeps every
             hidden element's layout box in the flow — it only stops painting. Since this
             modal is portalled to document.body, the whole rest of the admin app (sidebar,
             candidate list, detail panel) is a sibling that still occupies its full height
             above us, pushing our content a full page down and leaving page 1 blank
             (verified via a real PDF export). display:none actually removes those siblings
             from layout instead, so collapse everything except our own overlay. */
          body > *:not(.rirekisho-overlay) { display: none !important; }
          /* The overlay is position:fixed + overflow-y:auto so it can scroll on screen —
             but a fixed/overflow-clipped ancestor also clips Chromium's print pagination,
             silently dropping every page after the first (verified: the 添付書類 page
             vanished entirely from a real PDF export until this was added). Print needs
             the whole chain back in normal, unclipped flow so content can paginate. */
          .rirekisho-overlay { position: static !important; overflow: visible !important; height: auto !important; padding: 0 !important; background: none !important; display: block !important; }
          .rirekisho-print { position: static !important; overflow: visible !important; width: 100% !important; max-width: 100% !important; box-shadow: none !important; border-radius: 0 !important; }
          .rirekisho-noprint { display: none !important; }
        }
      `}</style>
      <div className="rirekisho-print" onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"10px",maxWidth:"860px",width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.3)",overflow:"hidden"}}>
        <div className="rirekisho-noprint" style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 18px",borderBottom:"0.5px solid rgba(11,31,58,0.1)",position:"sticky",top:0,background:"#fff",zIndex:2}}>
          <div style={{fontSize:"14px",fontWeight:700,color:navy}}>📋 {t("candidates.rirekishoTitle")} — {candidate.name}</div>
          <div style={{display:"flex",gap:"8px"}}>
            <button onClick={()=>window.print()} style={{padding:"6px 12px",borderRadius:"6px",fontSize:"11px",fontWeight:600,background:"#EAF3DE",color:"#27500A",border:"0.5px solid #27500A",cursor:"pointer"}}>🖨 {t("candidates.printBtn")}</button>
            <button onClick={onClose} style={{padding:"6px 12px",borderRadius:"6px",fontSize:"11px",fontWeight:600,background:"#F1EFE8",color:navy,border:"0.5px solid rgba(11,31,58,0.15)",cursor:"pointer"}}>✕</button>
          </div>
        </div>

        <div style={{padding:"20px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:"8px"}}>
            <h2 style={{fontSize:"20px",fontWeight:700,color:navy,margin:0}}>{t("candidates.rirekishoTitle")}</h2>
            <div style={{fontSize:"11px",color:"#52525B"}}>{t("candidates.printedOn")}: {new Date().toLocaleDateString("ja-JP")}</div>
          </div>

          <table style={{width:"100%",borderCollapse:"collapse",marginBottom:"14px",tableLayout:"fixed"}}>
            <tbody>
              <tr>
                <td style={{...td,width:"110px"}} rowSpan={4}>
                  {loading ? (
                    <div style={{width:"100px",height:"120px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",color:"#999",border:"1px solid #C9C6BB"}}>...</div>
                  ) : fileUrls.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={fileUrls.photo_url} alt={candidate.name} style={{width:"100px",height:"120px",objectFit:"cover",border:"1px solid #C9C6BB"}} />
                  ) : (
                    <div style={{width:"100px",height:"120px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",color:"#999",border:"1px solid #C9C6BB",textAlign:"center",padding:"4px"}}>{t("candidates.docPhoto")}</div>
                  )}
                </td>
                <th style={th}>{t("candidates.furigana")}</th>
                <td style={td} colSpan={3}>{candidate.name_kana||"—"}</td>
              </tr>
              <tr>
                <th style={th}>{t("candidates.name")}</th>
                <td style={{...td,fontSize:"15px",fontWeight:700}} colSpan={3}>{candidate.name}</td>
              </tr>
              <tr>
                <th style={th}>{t("candidates.dob")}</th>
                <td style={td}>{fmtDate(candidate.date_of_birth)}{age!==null?`（${age}${t("candidates.ageYears")}）`:""}</td>
                <th style={th}>{t("candidates.gender")}</th>
                <td style={td}>{candidate.gender||"—"}</td>
              </tr>
              <tr>
                <th style={th}>{t("candidates.visaType")}</th>
                <td style={td}>{candidate.visa_type||"—"}</td>
                <th style={th}>{t("candidates.visaExpiry")}</th>
                <td style={td}>{fmtDate(candidate.visa_expiry)}</td>
              </tr>
              <tr>
                <th style={th}>{t("candidates.currentAddress")}</th>
                {/* Only append nationality as a fallback hint when there's no real address to
                   show — appending it unconditionally made an actual Japan address read as
                   "…（Vietnam）", which looks like a mistranslation, not a nationality note. */}
                <td style={td} colSpan={4}>{candidate.address || `（${candidate.nationality||"Vietnam"}）`}</td>
              </tr>
              <tr>
                <th style={th}>{t("candidates.mobile")}</th>
                <td style={td}>{candidate.phone||"—"}</td>
                <th style={th}>{t("candidates.contact")}</th>
                <td style={td}>{candidate.email||"—"}</td>
              </tr>
              <tr>
                {/* The reference rirekisho's 職種 row is the candidate's Tokutei/技能実習
                   industry category (e.g. 外食業) — the same controlled vocabulary
                   /dang-ky's 現在職種 selector writes to `skill`, not the free-text desired
                   job in `preferred_job`. Confirmed against a real candidate: their skill
                   column showed 外食業 on the list page while this row sat empty, because
                   it was reading the wrong field. */}
                <th style={th}>{t("candidates.jobType")}</th>
                <td style={td}>{candidate.skill||"—"}</td>
                <th style={th}>{t("candidates.jlptExam")}</th>
                <td style={td}>{candidate.jlpt||"—"}{candidate.jlpt_actual?`（${candidate.jlpt_actual}）`:""}</td>
              </tr>
              <tr>
                <th style={th}>{t("candidates.preferredLocation")}</th>
                <td style={td} colSpan={3}>{candidate.preferred_location||"—"}</td>
              </tr>
            </tbody>
          </table>

          <div style={sectionBar}>{t("candidates.education")}</div>
          <table style={{width:"100%",borderCollapse:"collapse",marginBottom:"14px"}}>
            <thead><tr><th style={{...th,width:"70px"}}>年</th><th style={{...th,width:"50px"}}>月</th><th style={th}>{t("candidates.education")}</th></tr></thead>
            <tbody>
              {edu.length===0 && <tr><td style={td} colSpan={3}>{t("candidates.noEntry")}</td></tr>}
              {edu.map((e,i)=>(
                <tr key={i}><td style={td}>{e.year||"—"}</td><td style={td}>{e.month||"—"}</td><td style={td}>{e.school} {e.event||""}</td></tr>
              ))}
            </tbody>
          </table>

          <div style={sectionBar}>{t("candidates.workHistory")}</div>
          <table style={{width:"100%",borderCollapse:"collapse",marginBottom:"14px"}}>
            <thead><tr><th style={{...th,width:"70px"}}>年</th><th style={{...th,width:"50px"}}>月</th><th style={th}>{t("candidates.workHistory")}</th></tr></thead>
            <tbody>
              {work.length===0 && <tr><td style={td} colSpan={3}>{t("candidates.noEntry")}</td></tr>}
              {work.map((w,i)=>(
                <tr key={i}><td style={td}>{w.year||"—"}</td><td style={td}>{w.month||"—"}</td><td style={td}>{w.company} {w.position?`（${w.position}）`:""} {w.event||""}</td></tr>
              ))}
            </tbody>
          </table>

          <div style={sectionBar}>{t("candidates.certifications")}</div>
          <table style={{width:"100%",borderCollapse:"collapse",marginBottom:"14px"}}>
            <thead><tr><th style={{...th,width:"70px"}}>年</th><th style={{...th,width:"50px"}}>月</th><th style={th}>{t("candidates.certifications")}</th></tr></thead>
            <tbody>
              {certs.length===0 && <tr><td style={td} colSpan={3}>{t("candidates.noEntry")}</td></tr>}
              {certs.map((c,i)=>(
                <tr key={i}><td style={td}>{c.year||"—"}</td><td style={td}>{c.month||"—"}</td><td style={td}>{c.name} {c.result?`（${c.result}）`:""}</td></tr>
              ))}
            </tbody>
          </table>

          <table style={{width:"100%",borderCollapse:"collapse",marginBottom:"14px"}}>
            <tbody>
              <tr>
                <th style={{...th,width:"25%"}}>{t("candidates.healthTransport")}</th>
                <td style={td}>{t("candidates.healthGood")} — {candidate.height_cm?`${candidate.height_cm}cm`:"—"} / {candidate.weight_kg?`${candidate.weight_kg}kg`:"—"}</td>
              </tr>
              <tr>
                <th style={th}>{t("candidates.spouseStatus")} / {t("candidates.familyDependents")}</th>
                <td style={td}>{candidate.marital_status||"—"} / {candidate.dependents||0}{t("candidates.familyDependents")==="扶養家族数（配偶者を除く）"?"人":""}</td>
              </tr>
            </tbody>
          </table>

          <div style={sectionBar}>{t("candidates.motivationTitle")}</div>
          <div style={{border:"1px solid #C9C6BB",borderTop:"none",padding:"10px",fontSize:"12px",lineHeight:1.8,minHeight:"48px",marginBottom:"14px",whiteSpace:"pre-wrap"}}>{candidate.motivation||t("candidates.noEntry")}</div>

          <div style={sectionBar}>{t("candidates.selfPrTitle")}</div>
          <div style={{border:"1px solid #C9C6BB",borderTop:"none",padding:"10px",fontSize:"12px",lineHeight:1.8,minHeight:"48px",marginBottom:"14px",whiteSpace:"pre-wrap"}}>{candidate.self_pr||t("candidates.noEntry")}</div>

          <div style={sectionBar}>{t("candidates.requestField")}</div>
          <div style={{border:"1px solid #C9C6BB",borderTop:"none",padding:"10px",fontSize:"12px",lineHeight:1.8,minHeight:"36px",marginBottom:"4px"}}>{candidate.preferred_location||t("candidates.noEntry")}</div>
        </div>

        {/* ─ Page 2: attached ID / certificate images ─ */}
        <div style={{padding:"20px",borderTop:"2px solid "+navy,pageBreakBefore:"always"} as React.CSSProperties}>
          <div style={sectionBar}>{t("candidates.attachedDocsPage")}</div>
          {/* Always render all 5 slots, matching the reference rirekisho's own layout —
             its 添付書類 page shows every box (身分証明書の表面/裏面, 日本語検定資格,
             専門級, その他) even when unfilled (e.g. a literal {{photoSenmonkyu}} template
             placeholder), rather than collapsing the whole section away just because one
             candidate happens to be missing a file. */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(2, 1fr)",gap:"12px",marginTop:"10px"}}>
            {DOC_FIELDS.map(d => {
              const has = !!candidate[d.key];
              const url = fileUrls[d.key];
              const isPdf = (String(candidate[d.key]||"")).toLowerCase().endsWith(".pdf");
              return (
                <div key={d.key} style={{border:"1px solid #C9C6BB",borderRadius:"6px",overflow:"hidden"}}>
                  <div style={{background:"#F6F7F9",fontSize:"11px",fontWeight:700,color:navy,padding:"6px 8px",borderBottom:"1px solid #C9C6BB"}}>{t(d.labelKey)}</div>
                  {!has ? (
                    <div style={{padding:"20px",textAlign:"center",fontSize:"11px",color:"#9BA0AC",background:"#FAFBFC"}}>{t("candidates.noDocuments")}</div>
                  ) : loading ? (
                    <div style={{padding:"20px",textAlign:"center",fontSize:"11px",color:"#52525B"}}>...</div>
                  ) : !url ? (
                    <div style={{padding:"20px",textAlign:"center",fontSize:"11px",color:"#A32D2D"}}>{t("candidates.fileUnavailable")}</div>
                  ) : isPdf ? (
                    <a href={url} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",justifyContent:"center",height:"120px",fontSize:"11px",fontWeight:600,color:navy,background:"#F1EFE8",textDecoration:"none"}}>📄 PDF — {t("common.export")}</a>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt={t(d.labelKey)} style={{width:"100%",maxHeight:"260px",objectFit:"contain",background:"#F1EFE8"}} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function CandidatesPage() {
  const router = useRouter();
  const { t } = useAdminLang();
  const [cands, setCands] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Candidate|null>(null);
  const [detailTab, setDetailTab] = useState<"basic"|"history"|"pr"|"match">("basic");
  const [filter, setFilter] = useState("all");
  const [pendingAppliesOnly, setPendingAppliesOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [skillFilter, setSkillFilter] = useState("all");
  const [jlptFilter, setJlptFilter] = useState("all");
  const [sortKey, setSortKey] = useState<"name"|"jlpt"|"updated_at">("updated_at");
  const [sortDir, setSortDir] = useState<"asc"|"desc">("desc");
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout>|null>(null);
  const [view, setView] = useState<"list"|"import"|"review">("list");
  const [fileItems, setFileItems] = useState<FileItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentReview, setCurrentReview] = useState<{candidate:Record<string,unknown>;suggestions:Job[];fileName:string}|null>(null);
  // Images pulled out of each uploaded .docx (word/media/*), keyed by FileItem.id, so the
  // review screen can offer them for upload once Groq's text-only analysis has finished.
  const [docxImages, setDocxImages] = useState<Record<string,{name:string;url:string;blob:Blob;mime:string}[]>>({});
  const [reviewImages, setReviewImages] = useState<{name:string;url:string;blob:Blob;mime:string}[]>([]);
  const [imageUploadState, setImageUploadState] = useState<Record<string,"idle"|"uploading"|"done"|"error">>({});
  const [imageAssignedField, setImageAssignedField] = useState<Record<string,string>>({});
  const [editForm, setEditForm] = useState<Record<string,string>>({});
  const [selectedJobId, setSelectedJobId] = useState<string|null>(null);
  const [editingBasic, setEditingBasic] = useState(false);
  const [basicEditForm, setBasicEditForm] = useState<Record<string,string>>({});
  const [savingBasic, setSavingBasic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [matchResults, setMatchResults] = useState<Job[]>([]);
  const [matching, setMatching] = useState(false);
  const [matchError, setMatchError] = useState<string|null>(null);
  const [retryCountdown, setRetryCountdown] = useState(0);
  const [showFormPopup, setShowFormPopup] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const retryTimerRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const load = useCallback(async () => {
    const p = new URLSearchParams();
    if (filter!=="all") p.set("status",filter);
    if (skillFilter!=="all") p.set("skill",skillFilter);
    if (jlptFilter!=="all") p.set("jlpt",jlptFilter);
    if (search) p.set("search",search);
    const res = await fetch(`/api/admin/candidates?${p}`);
    if (res.status===401){router.push("/admin/login");return;}
    const d = await res.json();
    setCands(d.data||[]);
    setLoading(false);
  },[filter,skillFilter,jlptFilter,search,router]);

  useEffect(()=>{load();},[load]);

  // Deep-link support: /admin/candidates?id=xxx (e.g. from Jobs → AIマッチング) auto-opens that candidate's detail panel once.
  const appliedDeepLink = useRef(false);
  useEffect(() => {
    if (appliedDeepLink.current || cands.length === 0) return;
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) { appliedDeepLink.current = true; return; }
    const found = cands.find(c => c.id === id);
    if (found) {
      setSelected(found);
      setEditingBasic(false);
      window.history.replaceState(null, "", "/admin/candidates");
    }
    appliedDeepLink.current = true;
  }, [cands]);

  // Debounce search input → search (300ms)
  useEffect(()=>{
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(()=>setSearch(searchInput), 300);
    return ()=>{if(searchDebounceRef.current) clearTimeout(searchDebounceRef.current);};
  },[searchInput]);

  const counts: Record<string,number> = {all:cands.length};
  Object.keys(ST).forEach((k: string) => {counts[k] = cands.filter((c: Candidate) => c.status === k).length;});
  const pendingAppliesCount = cands.filter(c=>c.applied_via==="self"&&!c.applied_reviewed).length;

  const activeFilterCount = (filter!=="all"?1:0) + (skillFilter!=="all"?1:0) + (jlptFilter!=="all"?1:0) + (search?1:0);
  const clearFilters = () => { setFilter("all"); setSkillFilter("all"); setJlptFilter("all"); setSearchInput(""); setSearch(""); };

  // Distinct skill values currently in data, for the dropdown
  const skillOptions = Array.from(new Set(cands.map(c=>c.skill).filter(Boolean))).sort();

  const sortedCands = [...cands]
    .filter(c=>!pendingAppliesOnly || (c.applied_via==="self"&&!c.applied_reviewed))
    .sort((a,b)=>{
    let cmp = 0;
    if (sortKey==="name") cmp = a.name.localeCompare(b.name, "ja");
    else if (sortKey==="jlpt") cmp = (a.jlpt||"").localeCompare(b.jlpt||"");
    else cmp = new Date(a.updated_at||0).getTime() - new Date(b.updated_at||0).getTime();
    return sortDir==="asc"?cmp:-cmp;
  });
  const toggleSort = (key: "name"|"jlpt"|"updated_at") => {
    if (sortKey===key) setSortDir(d=>d==="asc"?"desc":"asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const updateStatus = async (id:string, status:string) => {
    await fetch("/api/admin/candidates",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status})});
    setCands((p: Candidate[]) => p.map((c: Candidate) => c.id === id ? {...c, status} : c));
    setSelected((p: Candidate | null) => p?.id === id ? {...p, status} : p);
  };

  const markApplyReviewed = async (id:string) => {
    await fetch("/api/admin/candidates",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,applied_reviewed:true})});
    setCands((p: Candidate[]) => p.map((c: Candidate) => c.id === id ? {...c, applied_reviewed:true} : c));
    setSelected((p: Candidate | null) => p?.id === id ? {...p, applied_reviewed:true} : p);
  };

  const startEditBasic = (c: Candidate) => {
    setBasicEditForm({
      name: c.name||"", name_kana: c.name_kana||"", email: c.email||"", phone: c.phone||"",
      gender: c.gender||"", date_of_birth: c.date_of_birth||"", address: c.address||"",
      visa_type: c.visa_type||"", visa_expiry: c.visa_expiry||"",
      jlpt: c.jlpt||"", jlpt_actual: c.jlpt_actual||"",
      height_cm: c.height_cm?String(c.height_cm):"", weight_kg: c.weight_kg?String(c.weight_kg):"",
      marital_status: c.marital_status||"", dependents: c.dependents?String(c.dependents):"",
      preferred_job: c.preferred_job||"", work_hours: c.work_hours||"", availability: c.availability||"",
    });
    setEditingBasic(true);
  };

  const saveBasicInfo = async () => {
    if (!selected) return;
    setSavingBasic(true);
    const payload = {
      ...basicEditForm,
      height_cm: basicEditForm.height_cm ? Number(basicEditForm.height_cm) : null,
      weight_kg: basicEditForm.weight_kg ? Number(basicEditForm.weight_kg) : null,
      dependents: basicEditForm.dependents || null,
    };
    const res = await fetch("/api/admin/candidates",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:selected.id, ...payload})});
    setSavingBasic(false);
    if (!res.ok) { alert(t("common.saveFailed")); return; }
    const merged = { ...selected, ...payload } as Candidate;
    setCands((p: Candidate[]) => p.map((c: Candidate) => c.id === selected.id ? merged : c));
    setSelected(merged);
    setEditingBasic(false);
  };

  const [openingFile, setOpeningFile] = useState<string|null>(null);
  const openCandidateFile = async (id:string, field:string) => {
    setOpeningFile(field);
    try {
      const res = await fetch(`/api/admin/candidates/file?id=${id}&field=${field}`);
      const d = await res.json();
      if (res.ok && d.url) window.open(d.url, "_blank", "noopener,noreferrer");
      else alert(t("candidates.fileUnavailable"));
    } catch { alert(t("candidates.fileUnavailable")); }
    setOpeningFile(null);
  };

  // Lets admin attach a photo/ID/certificate file directly onto an EXISTING candidate —
  // e.g. one imported via CV取込 before this upload option existed, or one whose original
  // file the admin no longer has but now holds a scan/photo of separately. Same private-S3
  // pipeline /dang-ky and CV取込's review screen already use, just wired to an update
  // instead of a create.
  const [uploadingDoc, setUploadingDoc] = useState<string|null>(null);
  const uploadDocumentForCandidate = async (id: string, field: string, file: File) => {
    setUploadingDoc(field);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("fieldKey", field);
      const upRes = await fetch("/api/upload-candidate-file", { method:"POST", body: fd });
      const upData = await upRes.json();
      if (!upRes.ok) throw new Error(upData.error || "upload_failed");
      const patchRes = await fetch("/api/admin/candidates", {
        method: "PATCH", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ id, [field]: upData.key }),
      });
      if (!patchRes.ok) throw new Error("save_failed");
      const merged = { ...(selected as Candidate), [field]: upData.key } as Candidate;
      setSelected(merged);
      setCands(p => p.map(c => c.id === id ? merged : c));
    } catch {
      alert(t("candidates.fileUnavailable"));
    }
    setUploadingDoc(null);
  };

  const [showCV, setShowCV] = useState(false);
  const [cvFileUrls, setCvFileUrls] = useState<Record<string,string|null>>({});
  const [cvLoading, setCvLoading] = useState(false);
  const openCVView = async (cand: Candidate) => {
    setShowCV(true); setCvLoading(true); setCvFileUrls({});
    const fields: (keyof Candidate)[] = ["photo_url","id_front_url","id_back_url","jlpt_cert_url","senmonkyu_url","other_cert_url"];
    const present = fields.filter(f => cand[f]);
    const results = await Promise.all(present.map(async f => {
      try {
        const res = await fetch(`/api/admin/candidates/file?id=${cand.id}&field=${f}`);
        const d = await res.json();
        return [f, res.ok ? d.url : null] as const;
      } catch { return [f, null] as const; }
    }));
    setCvFileUrls(Object.fromEntries(results));
    setCvLoading(false);
  };

  const deleteCandidate = async (id:string) => {
    if (!confirm(t("candidates.deleteConfirm"))) return;
    await fetch(`/api/admin/candidates?id=${id}`,{method:"DELETE"});
    setCands((p: Candidate[]) => p.filter((c: Candidate) => c.id !== id));
    setSelected(null);
  };

  const runMatch = async (cand: Candidate) => {
    setMatching(true); setMatchResults([]); setMatchError(null);
    try {
      const res = await fetch("/api/admin/match-candidates",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ candidateId: cand.id }),
      });
      const d = await res.json();
      setMatchResults((d.matches||[]) as Job[]);
      setMatchError(d.error||null);
    } catch { setMatchResults([]); setMatchError("failed"); }
    setMatching(false);
  };

  const applyJobToCandidate = async (cand: Candidate, job: Job) => {
    const payload = { match_job_id: job.id, match_job_name: job.company };
    const res = await fetch("/api/admin/candidates",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:cand.id, ...payload})});
    if (!res.ok) { alert(t("common.saveFailed")); return; }
    const merged = { ...cand, ...payload } as Candidate;
    setCands((p: Candidate[]) => p.map((c: Candidate) => c.id === cand.id ? merged : c));
    setSelected((p: Candidate | null) => p?.id === cand.id ? merged : p);
  };

  /* File handling */
  const addFiles = (files: FileList|File[]) => {
    const arr = Array.from(files).filter(f=>/\.(pdf|doc|docx)$/i.test(f.name));
    const toAdd = arr.slice(0, 5-fileItems.length).map(file=>({
      file, id:Math.random().toString(36).slice(2),
      status:"waiting" as const, progress:0,
    }));
    setFileItems((p: FileItem[]) => [...p, ...toAdd]);
  };

  const extractText = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const ab = await file.arrayBuffer();
    if (ext === "docx" || ext === "doc") {
      try {
        // Use JSZip to properly decompress DOCX (ZIP format)
        const zip = await JSZip.loadAsync(ab);
        const xmlFile = zip.file("word/document.xml");
        if (xmlFile) {
          const xml = await xmlFile.async("string");
          // A raw 履歴書-style table (label in one cell, value in the next) loses its
          // structure once tags are simply stripped and whitespace collapsed to single
          // spaces — "住所" and its value end up indistinguishable from the flat token
          // stream around them, and the LLM was silently dropping fields rather than guess
          // where one ends and the next begins (verified against a real imported candidate
          // whose address/phone/visa_type all came back empty despite being on the page).
          // Every table row and paragraph gets its own line instead, so each label/value
          // stays a clearly separate line the LLM can read top-to-bottom.
          //
          // The tag match MUST consume the whole opening tag, attributes included.
          // <w:p[ >] only replaces the "<w:p " it matches, leaving a real Word document's
          // attributes (w:rsidR="...", w14:paraId="...", ...) and the tag's closing ">"
          // behind as literal visible text on every single line — invisible in a
          // hand-written test fixture with bare <w:p> tags, but every real .docx paragraph
          // carries these, so this was silently corrupting the text sent to Groq on every
          // real import (caught only once tested against an actual user-supplied file).
          const raw = xml
            .replace(/<w:tr(?:\s[^>]*)?>/g, "\n")
            .replace(/<w:p(?:\s[^>]*)?>/g, "\n")
            .replace(/<[^>]+>/g, "")
            .replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&").replace(/&nbsp;/g," ");
          return raw.split("\n").map(l=>l.trim()).filter(Boolean).join("\n").slice(0, 5000);
        }
      } catch { /* fallback to PDF path */ }
    }
    // PDF — use pdfjs-dist for proper text extraction
    if (ext === "pdf") {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(ab) }).promise;
        const pages: string[] = [];
        for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items
            .map((item) => ("str" in item ? item.str : ""))
            .join(" ");
          pages.push(pageText);
        }
        return pages.join("\n").replace(/\s+/g, " ").trim().slice(0, 5000);
      } catch { return ""; }
    }
    // Other fallback
    return "";
  };

  // A .docx is a ZIP archive — any embedded portrait photo / scanned ID lives as a plain
  // image file under word/media/, completely separate from the document.xml text stream
  // extractText() reads. CV import previously only ever sent Groq the resume TEXT, so a
  // candidate's photo (present right there in the uploaded file) never made it into the
  // system at all. This pulls those images out client-side so the review screen can offer
  // them for upload — the same private-S3 pipeline /dang-ky already uses.
  const IMG_EXT: Record<string,string> = { jpg:"image/jpeg", jpeg:"image/jpeg", png:"image/png", webp:"image/webp", gif:"image/gif", bmp:"image/bmp" };
  const extractDocxImages = async (file: File): Promise<{name:string; blob:Blob; mime:string}[]> => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (ext !== "docx" && ext !== "doc") return [];
    try {
      const ab = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(ab);
      const entries = Object.values(zip.files).filter(f => !f.dir && /^word\/media\//i.test(f.name));
      const out: {name:string; blob:Blob; mime:string}[] = [];
      for (const entry of entries) {
        const fext = entry.name.split(".").pop()?.toLowerCase() || "";
        const mime = IMG_EXT[fext];
        if (!mime) continue; // skip non-image media (e.g. embedded .emf drawings)
        const data = await entry.async("uint8array");
        if (data.byteLength < 2000) continue; // skip tiny logos/bullets, keep real photos
        const buf = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
        out.push({ name: entry.name.split("/").pop() || entry.name, blob: new Blob([buf], {type:mime}), mime });
      }
      return out;
    } catch { return []; }
  };

  const analyzeAll = async () => {
    if (!fileItems.length) return;
    setIsAnalyzing(true);
    setFileItems((p: FileItem[]) => p.map((f: FileItem) => ({...f, status: "analyzing", progress: 0})));
    const timers: Record<string,ReturnType<typeof setInterval>> = {};
    fileItems.forEach((item: FileItem) => {
      timers[item.id] = setInterval(() => {
        setFileItems((p: FileItem[]) => p.map((f: FileItem) => f.id === item.id && f.status === "analyzing" ? {...f, progress: Math.min(f.progress + 8, 85)} : f));
      },200);
    });
    try {
      // Extract text CLIENT-SIDE → send only text (avoid 413 error)
      const filesWithText = await Promise.all(
        fileItems.map(async (item: FileItem) => ({
          fileName: item.file.name,
          fileSize: item.file.size,
          text: await extractText(item.file),
        }))
      );
      // Also pull out any embedded photo(s) so the review screen can offer them for upload
      // — independent of the Groq call, since this never touches the AI at all.
      await Promise.all(fileItems.map(async (item: FileItem) => {
        const imgs = await extractDocxImages(item.file);
        if (imgs.length) {
          setDocxImages(prev => ({ ...prev, [item.id]: imgs.map(i => ({...i, url: URL.createObjectURL(i.blob)})) }));
        }
      }));
      const res = await fetch("/api/admin/analyze-cv",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({files:filesWithText}),
      });
      const data = await res.json();
      Object.values(timers).forEach(t=>clearInterval(t));
      if (data.results) {
        setFileItems((p: FileItem[]) => p.map((f: FileItem, i: number) => {
          const r = data.results[i];
          if (!r) return {...f,status:"error",progress:100};
          return {...f,status:r.success?"done":"error",progress:100,result:r};
        }));
        // If any file hit rate limit, start countdown and auto-retry
        const hasRateLimit = data.results.some((r: {rateLimited?:boolean}) => r.rateLimited);
        if (hasRateLimit) {
          if (retryTimerRef.current) clearInterval(retryTimerRef.current);
          setRetryCountdown(60);
          retryTimerRef.current = setInterval(() => {
            setRetryCountdown(prev => {
              if (prev <= 1) {
                clearInterval(retryTimerRef.current!);
                retryTimerRef.current = null;
                setFileItems(p => p.map(f => f.result?.rateLimited ? {...f, status:"waiting", progress:0, result:undefined} : f));
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      }
    } catch (err) {
      console.error("analyzeAll error:", err);
      Object.values(timers).forEach(t=>clearInterval(t));
      setFileItems((p: FileItem[]) => p.map((f: FileItem) => ({...f, status: "error", progress: 100})));
    }
    setIsAnalyzing(false);
  };


  const openReview = (item: FileItem) => {
    if (!item.result?.candidate) return;
    const c = item.result.candidate;
    setCurrentReview({ candidate:c, suggestions:(item.result.suggestions||[]) as Job[], fileName:item.result.fileName });
    setEditForm({
      name:        String(c.name||""),
      name_kana:   String(c.name_kana||""),
      email:       String(c.email||""),
      phone:       String(c.phone||""),
      gender:      String(c.gender||""),
      date_of_birth: String(c.date_of_birth||""),
      address:     String(c.address||""),
      visa_type:   String(c.visa_type||""),
      visa_expiry: String(c.visa_expiry||""),
      jlpt:        String(c.jlpt||"N4"),
      jlpt_actual: String(c.jlpt_actual||""),
      jlpt_exam_year:   String(c.jlpt_exam_year||""),
      jlpt_exam_month:  String(c.jlpt_exam_month||""),
      jlpt_exam_status: String(c.jlpt_exam_status||""),
      height_cm:   String(c.height_cm||""),
      weight_kg:   String(c.weight_kg||""),
      skill:       String(c.skill||"飲食"),
      preferred_job: String(c.preferred_job||""),
      preferred_location: String(c.preferred_location||""),
      work_hours:  String(c.work_hours||""),
      availability:String(c.availability||""),
      marital_status: String(c.marital_status||""),
      dependents:  String(c.dependents||"0"),
      motivation:  String(c.motivation||""),
      self_pr:     String(c.self_pr||""),
      note:        String((c as Record<string,unknown>).summary_vn||""),
      cv_filename: item.result.fileName,
      photo_url: "", id_front_url: "", id_back_url: "", jlpt_cert_url: "", senmonkyu_url: "", other_cert_url: "",
    });
    if (item.result.suggestions?.[0]) setSelectedJobId(item.result.suggestions[0].id);
    setReviewImages(docxImages[item.id] || []);
    setImageUploadState({});
    setImageAssignedField({});
    setView("review");
  };

  const assignExtractedImage = async (img: {name:string;url:string;blob:Blob;mime:string}, fieldKey: string) => {
    setImageUploadState(prev => ({ ...prev, [img.url]: "uploading" }));
    try {
      const fd = new FormData();
      fd.append("file", img.blob, img.name);
      fd.append("fieldKey", fieldKey);
      const res = await fetch("/api/upload-candidate-file", { method:"POST", body: fd });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "upload_failed");
      setEditForm(prev => ({ ...prev, [fieldKey]: d.key }));
      setImageUploadState(prev => ({ ...prev, [img.url]: "done" }));
      setImageAssignedField(prev => ({ ...prev, [img.url]: fieldKey }));
    } catch {
      setImageUploadState(prev => ({ ...prev, [img.url]: "error" }));
    }
  };

  const saveCandidate = async () => {
    if (!editForm.name || !currentReview) return;
    setSaving(true);
    const job = currentReview.suggestions?.find((j: Job) => j.id === selectedJobId);
    const c = currentReview.candidate;
    const res = await fetch("/api/admin/candidates",{
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        ...editForm,
        height_cm: editForm.height_cm ? Number(editForm.height_cm) : null,
        weight_kg: editForm.weight_kg ? Number(editForm.weight_kg) : null,
        dependents: editForm.dependents || "0",
        status: "new",
        match_job_id: job?.id || null,
        match_job_name: job?.company || "未定",
        applied_via: job ? "admin" : null,
        applied_at: job ? new Date().toISOString() : null,
        education: c.education || [],
        work_history: c.work_history || [],
        certifications: c.certifications || [],
        ai_data: c,
      }),
    });
    if (res.ok) {
      setView("list");
      setFileItems((p: FileItem[]) => p.filter((f: FileItem) => f.result?.fileName !== editForm.cv_filename));
      setCurrentReview(null);
      await load();
    } else {
      const err = await res.json();
      alert(t("common.saveFailed") + ": " + err.error);
    }
    setSaving(false);
  };

  /* ─── LIST VIEW ─────────────────────────────────────────── */
  if (view==="list") return (
    <div>
      <style>{`
        @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }
        @keyframes candFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .cand-fade { animation: candFadeIn 0.35s cubic-bezier(0.16,1,0.3,1) both; }
        .cand-input:focus, .cand-select:focus { border-color:${navy} !important; box-shadow:0 0 0 3px rgba(11,31,58,0.08); }
        .cand-btn { transition: opacity 0.15s ease, transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease; }
        .cand-btn:hover { opacity:0.85; transform:translateY(-1px); }
        .cand-btn:active { transform:translateY(0); }
        .cand-pill { transition: background 0.15s ease, border-color 0.15s ease, transform 0.12s ease; }
        .cand-pill:hover { transform:translateY(-1px); }
        .cand-card { transition: box-shadow 0.2s ease; }
        .cand-card:hover { box-shadow: 0 4px 18px rgba(11,31,58,0.06); }
        .match-card:hover { box-shadow: 0 4px 16px rgba(11,31,58,0.08); }
        .match-card:hover .match-name-link { text-decoration-color: #0B1F3A !important; }
        .cand-row { transition: background 0.12s ease; }
        .cand-row:hover:not(.selected) { background: #FAFBFC !important; }
        @media (prefers-reduced-motion: reduce) { .cand-fade{animation:none;} .cand-btn,.cand-pill{transition:none;} }
      `}</style>
      <div style={{background:"#fff",...B,borderTop:"none",borderLeft:"none",borderRight:"none",padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"10px"}}>
        <div>
          <div style={{fontSize:"16px",fontWeight:700,color:navy,letterSpacing:"-0.01em"}}>{t("candidates.title")}</div>
          <div style={{fontSize:"11px",color:"#52525B",marginTop:"2px"}}>{t("candidates.subtitle")}</div>
        </div>
        <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
          {/* Form share button + popup */}
          <div style={{position:"relative"}}>
            <button className="cand-btn" onClick={()=>setShowFormPopup(p=>!p)}
              style={{padding:"7px 12px",borderRadius:"6px",fontSize:"12px",fontWeight:600,background:showFormPopup?"#E6F1FB":"#fff",color:navy,border:`1px solid ${showFormPopup?navy:"rgba(11,31,58,0.2)"}`,cursor:"pointer",display:"flex",alignItems:"center",gap:"5px"}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
              {t("candidates.shareForm")}
            </button>

            {showFormPopup && (
              <div style={{position:"absolute",top:"calc(100% + 8px)",right:0,background:"#fff",borderRadius:"12px",padding:"16px",boxShadow:"0 8px 32px rgba(11,31,58,0.14)",zIndex:200,width:"300px",border:"0.5px solid rgba(11,31,58,0.1)"}}>
                <div style={{fontSize:"12px",fontWeight:700,color:navy,marginBottom:"6px"}}>📋 {t("candidates.shareFormDesc")}</div>
                <div style={{fontSize:"11px",color:"#52525B",marginBottom:"10px"}}>
                  {t("candidates.shareFormHint")}
                </div>
                <div style={{background:"#F6F7F9",borderRadius:"8px",padding:"8px 10px",fontFamily:"monospace",fontSize:"11px",color:"#185FA5",wordBreak:"break-all",marginBottom:"10px",userSelect:"all"}}>
                  {FORM_URL}
                </div>
                <div style={{display:"flex",gap:"6px"}}>
                  <button onClick={()=>{navigator.clipboard.writeText(FORM_URL);setLinkCopied(true);setTimeout(()=>setLinkCopied(false),2000);}}
                    style={{flex:1,padding:"7px",borderRadius:"7px",fontSize:"11px",fontWeight:700,background:linkCopied?"#27500A":navy,color:"#fff",border:"none",cursor:"pointer"}}>
                    {linkCopied?`✓ ${t("candidates.linkCopied")}`:`🔗 ${t("candidates.copyLink")}`}
                  </button>
                  <a href={FORM_URL} target="_blank" rel="noreferrer"
                    style={{flex:1,padding:"7px",borderRadius:"7px",fontSize:"11px",fontWeight:700,background:"#E6F1FB",color:navy,border:"none",cursor:"pointer",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:"4px"}}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    {t("candidates.openForm")}
                  </a>
                </div>
              </div>
            )}
          </div>

          <button className="cand-btn" onClick={()=>setView("import")} style={{padding:"7px 14px",borderRadius:"6px",fontSize:"12px",fontWeight:700,background:"#C8002A",color:"#fff",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:"5px"}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            {t("candidates.importCV")}
          </button>
        </div>
      </div>

      <div style={{padding:"16px 20px"}}>
        {/* Search + advanced filters toolbar */}
        <div className="cand-fade" style={{background:"#fff",...B,borderRadius:"10px",padding:"12px 14px",marginBottom:"12px",display:"flex",gap:"10px",flexWrap:"wrap",alignItems:"center"}}>
          <div style={{position:"relative",flex:"1 1 220px",minWidth:"200px"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B4B2A9" strokeWidth="2" style={{position:"absolute",left:"10px",top:"50%",transform:"translateY(-50%)"}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" className="cand-input" placeholder={t("candidates.searchPlaceholder")} value={searchInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
              style={{width:"100%",padding:"7px 10px 7px 30px",borderRadius:"7px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none",boxSizing:"border-box",transition:"border-color 0.15s ease, box-shadow 0.15s ease"}}/>
          </div>
          <select value={skillFilter} onChange={e=>setSkillFilter(e.target.value)} className="cand-select"
            style={{padding:"7px 10px",borderRadius:"7px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",color:navy,background:"#fff",cursor:"pointer",outline:"none",transition:"border-color 0.15s ease, box-shadow 0.15s ease"}}>
            <option value="all">{t("candidates.allIndustries")}</option>
            {skillOptions.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          <select value={jlptFilter} onChange={e=>setJlptFilter(e.target.value)} className="cand-select"
            style={{padding:"7px 10px",borderRadius:"7px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",color:navy,background:"#fff",cursor:"pointer",outline:"none",transition:"border-color 0.15s ease, box-shadow 0.15s ease"}}>
            <option value="all">{t("candidates.allJlpt")}</option>
            {["N1","N2","N3","N4","N5"].map(j=><option key={j} value={j}>{j}</option>)}
          </select>
          {activeFilterCount>0&&(
            <button className="cand-btn" onClick={clearFilters} style={{padding:"7px 12px",borderRadius:"7px",fontSize:"11px",fontWeight:600,background:"#FCEBEB",color:"#A32D2D",border:"0.5px solid #F09595",cursor:"pointer",whiteSpace:"nowrap"}}>
              ✕ {t("common.clearFilters")} ({activeFilterCount})
            </button>
          )}
          <div style={{marginLeft:"auto",fontSize:"11px",color:"#52525B",whiteSpace:"nowrap"}}>
            {loading?t("common.loading"):`${cands.length} ${t("common.results")}`}
          </div>
        </div>

        <div className="cand-fade" style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"14px",animationDelay:"60ms"}}>
          {[{key:"all",labelKey:"common.all"},...Object.entries(ST).map(([k,v])=>({key:k,labelKey:v.labelKey}))].map(f=>(
            <button key={f.key} className="cand-pill" onClick={()=>setFilter(f.key)} style={{padding:"5px 12px",borderRadius:"20px",fontSize:"11px",fontWeight:600,border:`1px solid ${filter===f.key?navy:"rgba(11,31,58,0.15)"}`,background:filter===f.key?navy:"#fff",color:filter===f.key?"#fff":"#52525B",cursor:"pointer",whiteSpace:"nowrap"}}>
              {t(f.labelKey)} ({counts[f.key]||0})
            </button>
          ))}
          {pendingAppliesCount>0&&(
            <button className="cand-pill" onClick={()=>setPendingAppliesOnly(p=>!p)}
              style={{padding:"5px 12px",borderRadius:"20px",fontSize:"11px",fontWeight:700,border:`1px solid ${pendingAppliesOnly?"#C8002A":"#F09595"}`,background:pendingAppliesOnly?"#C8002A":"#FCEBEB",color:pendingAppliesOnly?"#fff":"#A32D2D",cursor:"pointer",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:"5px"}}>
              🔔 {t("candidates.pendingApplies")} ({pendingAppliesCount})
            </button>
          )}
        </div>

        <div className="cand-fade" style={{display:"grid",gridTemplateColumns:selected?"1fr 420px":"1fr",gap:"12px",animationDelay:"120ms"}}>
          {/* Table */}
          <div className="cand-card" style={{background:"#fff",...B,borderRadius:"10px",overflow:"hidden"}}>
            {loading?<div style={{padding:"40px",textAlign:"center",color:"#52525B"}}>{t("common.loading")}</div>
            :cands.length===0?<div style={{padding:"48px",textAlign:"center"}}>
              <div style={{fontSize:"32px",marginBottom:"12px"}}>👤</div>
              <div style={{fontSize:"14px",fontWeight:700,color:navy,marginBottom:"6px"}}>{t("candidates.empty")}</div>
              <button onClick={()=>setView("import")} style={{marginTop:"8px",padding:"8px 18px",borderRadius:"7px",fontSize:"12px",fontWeight:700,background:"#C8002A",color:"#fff",border:"none",cursor:"pointer"}}>{t("candidates.addViaImport")}</button>
            </div>:(
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px"}}>
                <thead><tr style={{background:"#F6F7F9"}}>
                  {[
                    {h:t("candidates.colCandidate"),key:"name" as const},
                    {h:t("candidates.colIndustry"),key:null},
                    {h:t("candidates.colJlpt"),key:"jlpt" as const},
                    {h:t("candidates.colPreferredJob"),key:null},
                    {h:t("candidates.colMatch"),key:null},
                    {h:t("candidates.colCV"),key:null},
                    {h:t("candidates.colStatus"),key:null},
                    {h:t("candidates.colUpdated"),key:"updated_at" as const},
                  ].map(col=>(
                    <th key={col.h} onClick={col.key?()=>toggleSort(col.key!):undefined}
                      style={{padding:"11px 10px",textAlign:"left",fontSize:"12px",color:"#3F4552",fontWeight:700,borderBottom:"1px solid rgba(11,31,58,0.1)",whiteSpace:"nowrap",cursor:col.key?"pointer":"default",userSelect:"none"}}>
                      {col.h}{col.key&&sortKey===col.key?(sortDir==="asc"?" ▲":" ▼"):""}
                    </th>
                  ))}
                </tr></thead>
                <tbody>
                  {sortedCands.map(c=>{
                    const st=ST[c.status]||ST.new; const jc=JC[c.jlpt]||JC["N5"];
                    const ini=c.name.split(" ").slice(-2).map((w:string)=>w[0]).join("").toUpperCase();
                    return(
                      <tr key={c.id} className={`cand-row${selected?.id===c.id?" selected":""}`} onClick={()=>{setSelected(selected?.id===c.id?null:c);setEditingBasic(false);}}
                        style={{borderBottom:"0.5px solid rgba(11,31,58,0.06)",cursor:"pointer",background:selected?.id===c.id?"#E6F1FB":"transparent"}}>
                        <td style={{padding:"12px 10px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:"9px"}}>
                            <div style={{width:"32px",height:"32px",borderRadius:"50%",background:st.tb,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:700,color:st.tc,flexShrink:0}}>{ini}</div>
                            <div>
                              <div style={{fontWeight:700,color:navy,fontSize:"13px",display:"flex",alignItems:"center",gap:"5px"}}>
                                {c.applied_via==="self"&&!c.applied_reviewed&&(
                                  <span title={t("candidates.pendingApplies")} style={{width:"7px",height:"7px",borderRadius:"50%",background:"#C8002A",flexShrink:0,animation:"pulseDot 1.6s ease-in-out infinite"}}/>
                                )}
                                {c.name}
                              </div>
                              <div style={{fontSize:"12px",color:"#52525B",marginTop:"1px"}}>{c.email||c.phone||"—"}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{padding:"12px 10px"}}><span style={{background:"#E6F1FB",color:"#0C447C",fontSize:"12px",fontWeight:700,padding:"3px 8px",borderRadius:"5px"}}>{c.skill||"—"}</span></td>
                        <td style={{padding:"12px 10px"}}><span style={{background:jc.tb,color:jc.tc,fontSize:"12px",fontWeight:700,padding:"3px 8px",borderRadius:"5px"}}>{c.jlpt||"—"}</span></td>
                        <td style={{padding:"12px 10px",fontSize:"12px",color:"#33363D",maxWidth:"100px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.preferred_job||"—"}</td>
                        <td style={{padding:"12px 10px",fontSize:"12px",color:c.match_job_name&&c.match_job_name!=="未定"?"#185FA5":"#52525B",fontWeight:600}}>{c.match_job_name&&c.match_job_name!=="未定"?c.match_job_name:t("candidates.noMatch")}</td>
                        <td style={{padding:"12px 10px"}}>{c.cv_filename?<span style={{fontSize:"13px",color:"#C8002A",fontWeight:700}}>📄</span>:<span style={{fontSize:"13px",color:"#B4B2A9"}}>—</span>}</td>
                        <td style={{padding:"12px 10px"}}><span style={{background:st.tb,color:st.tc,fontSize:"12px",fontWeight:700,padding:"3px 8px",borderRadius:"5px"}}>{t(st.labelKey)}</span></td>
                        <td style={{padding:"12px 10px",fontSize:"12px",color:"#52525B"}}>{c.updated_at?new Date(c.updated_at).toLocaleDateString("ja-JP"):"—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Detail panel */}
          {selected&&(
            <div style={{background:"#fff",...B,borderRadius:"10px",height:"fit-content",position:"sticky",top:"16px",overflow:"hidden"}}>
              {/* Header */}
              <div style={{padding:"14px 16px",borderBottom:"0.5px solid rgba(11,31,58,0.08)",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <div style={{fontSize:"15px",fontWeight:700,color:navy}}>{selected.name}</div>
                  <div style={{fontSize:"11px",color:"#52525B"}}>{selected.name_kana||""}</div>
                  <div style={{display:"flex",gap:"5px",marginTop:"5px",flexWrap:"wrap"}}>
                    <span style={{background:(JC[selected.jlpt]||JC["N5"]).tb,color:(JC[selected.jlpt]||JC["N5"]).tc,fontSize:"11px",fontWeight:700,padding:"2px 7px",borderRadius:"20px"}}>{selected.jlpt||"—"}</span>
                    <span style={{background:"#E6F1FB",color:"#0C447C",fontSize:"11px",fontWeight:700,padding:"2px 7px",borderRadius:"20px"}}>{selected.skill||"—"}</span>
                    {selected.visa_type&&<span style={{background:"#EEEDFE",color:"#534AB7",fontSize:"11px",fontWeight:700,padding:"2px 7px",borderRadius:"20px"}}>{selected.visa_type}</span>}
                  </div>
                </div>
                <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",cursor:"pointer",color:"#52525B",fontSize:"18px"}}>×</button>
              </div>

              {/* Applied job banner */}
              {selected.match_job_name&&selected.match_job_name!=="未定"&&(
                <div style={{padding:"10px 16px",background:selected.applied_via==="self"?"#EAF3DE":"#E6F1FB",borderBottom:"0.5px solid rgba(11,31,58,0.08)"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"4px"}}>
                    <div style={{fontSize:"12px",color:navy}}>
                      <span style={{fontWeight:700}}>📋 {t("candidates.appliedTo")}:</span> {selected.match_job_name}
                    </div>
                    <span style={{fontSize:"10px",fontWeight:700,padding:"2px 7px",borderRadius:"20px",background:selected.applied_via==="self"?"#27500A":"#0C447C",color:"#fff"}}>
                      {selected.applied_via==="self"?t("candidates.appliedSelf"):t("candidates.appliedAdmin")}
                    </span>
                  </div>
                  {selected.applied_at&&(
                    <div style={{fontSize:"11px",color:"#52525B",marginTop:"3px"}}>
                      {t("candidates.appliedAt")}: {new Date(selected.applied_at).toLocaleString("ja-JP")}
                    </div>
                  )}
                  {selected.applied_via==="self"&&(
                    selected.applied_reviewed
                      ? <div style={{fontSize:"11px",color:"#27500A",fontWeight:700,marginTop:"6px"}}>{t("candidates.reviewed")}</div>
                      : <button onClick={()=>markApplyReviewed(selected.id)} style={{marginTop:"6px",padding:"4px 10px",borderRadius:"6px",fontSize:"11px",fontWeight:700,background:navy,color:"#fff",border:"none",cursor:"pointer"}}>{t("candidates.markReviewed")}</button>
                  )}
                </div>
              )}

              {/* Tabs */}
              <div style={{display:"flex",borderBottom:"0.5px solid rgba(11,31,58,0.08)"}}>
                {[{k:"basic",lk:"candidates.tabBasic"},{k:"history",lk:"candidates.tabHistory"},{k:"pr",lk:"candidates.tabPr"},{k:"match",lk:"candidates.tabMatch"}].map(tb=>(
                  <button key={tb.k} onClick={()=>setDetailTab(tb.k as "basic"|"history"|"pr"|"match")} style={{flex:1,padding:"8px 4px",fontSize:"11px",fontWeight:detailTab===tb.k?700:400,color:detailTab===tb.k?navy:"#52525B",border:"none",background:detailTab===tb.k?"#fff":"#F6F7F9",borderBottom:`2px solid ${detailTab===tb.k?navy:"transparent"}`,cursor:"pointer"}}>
                    {t(tb.lk)}
                  </button>
                ))}
              </div>

              <div style={{padding:"14px 16px",maxHeight:"480px",overflowY:"auto"}}>
                {/* Basic tab */}
                {detailTab==="basic"&&(
                  <div>
                    <div style={{display:"flex",justifyContent:"flex-end",marginBottom:"8px"}}>
                      {editingBasic ? (
                        <div style={{display:"flex",gap:"6px"}}>
                          <button onClick={()=>setEditingBasic(false)} disabled={savingBasic}
                            style={{padding:"5px 10px",borderRadius:"6px",fontSize:"11px",fontWeight:600,background:"transparent",color:"#52525B",border:"0.5px solid rgba(11,31,58,0.15)",cursor:"pointer"}}>
                            {t("common.cancel")}
                          </button>
                          <button onClick={saveBasicInfo} disabled={savingBasic}
                            style={{padding:"5px 10px",borderRadius:"6px",fontSize:"11px",fontWeight:600,background:navy,color:"#fff",border:"none",cursor:savingBasic?"not-allowed":"pointer"}}>
                            {savingBasic?t("common.saving"):t("common.save")}
                          </button>
                        </div>
                      ) : (
                        <button onClick={()=>startEditBasic(selected)}
                          style={{padding:"5px 10px",borderRadius:"6px",fontSize:"11px",fontWeight:600,background:"#F6F7F9",color:navy,border:"0.5px solid rgba(11,31,58,0.15)",cursor:"pointer",display:"flex",alignItems:"center",gap:"4px"}}>
                          ✏️ {t("candidates.editInfo")}
                        </button>
                      )}
                    </div>

                    {editingBasic ? (
                      <div style={{display:"flex",flexDirection:"column",gap:"9px"}}>
                        {[
                          {k:"name",lk:"candidates.name",type:"text"},
                          {k:"name_kana",lk:"candidates.nameKana",type:"text"},
                          {k:"email",lk:"candidates.email",type:"email"},
                          {k:"phone",lk:"candidates.phone",type:"text"},
                          {k:"gender",lk:"candidates.gender",type:"text"},
                          {k:"date_of_birth",lk:"candidates.dob",type:"text"},
                          {k:"address",lk:"candidates.address",type:"text"},
                          {k:"visa_type",lk:"candidates.visaType",type:"text"},
                          {k:"visa_expiry",lk:"candidates.visaExpiry",type:"text"},
                          {k:"jlpt",lk:"candidates.colJlpt",type:"text"},
                          {k:"jlpt_actual",lk:"candidates.jlptActual",type:"text"},
                          {k:"height_cm",lk:"candidates.heightCm",type:"number"},
                          {k:"weight_kg",lk:"candidates.weightKg",type:"number"},
                          {k:"marital_status",lk:"candidates.marital",type:"text"},
                          {k:"dependents",lk:"candidates.dependents",type:"number"},
                          {k:"preferred_job",lk:"candidates.colPreferredJob",type:"text"},
                          {k:"work_hours",lk:"candidates.workHours",type:"text"},
                          {k:"availability",lk:"candidates.availability",type:"text"},
                        ].map(f=>(
                          <div key={f.k}>
                            <label style={{display:"block",fontSize:"11px",color:"#52525B",marginBottom:"3px",fontWeight:600}}>{t(f.lk)}</label>
                            <input type={f.type} value={basicEditForm[f.k]||""} onChange={e=>setBasicEditForm({...basicEditForm,[f.k]:e.target.value})}
                              style={{width:"100%",padding:"6px 9px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none",boxSizing:"border-box"}}/>
                          </div>
                        ))}
                      </div>
                    ) : (
                      [
                        {lk:"candidates.name",v:`${selected.name} / ${selected.name_kana||"—"}`},
                        {lk:"candidates.gender",v:selected.gender||"—"},
                        {lk:"candidates.dob",v:selected.date_of_birth?new Date(selected.date_of_birth).toLocaleDateString("ja-JP"):"—"},
                        {lk:"candidates.contact",v:selected.email||selected.phone||"—"},
                        {lk:"candidates.phone",v:selected.phone||"—"},
                        {lk:"candidates.address",v:selected.address||"ベトナム"},
                        {lk:"candidates.visaType",v:selected.visa_type||"—"},
                        {lk:"candidates.visaExpiry",v:fmtDate(selected.visa_expiry)},
                        {lk:"candidates.colJlpt",v:`${selected.jlpt||"—"} (${selected.jlpt_actual||"—"})`},
                        {lk:"candidates.jlptExam",v: selected.jlpt_exam_year ? `${selected.jlpt_exam_year}年${selected.jlpt_exam_month||""}月 · ${selected.jlpt_exam_status||"—"}` : "—"},
                        {lk:"candidates.heightWeight",v:`${selected.height_cm||"—"}cm / ${selected.weight_kg||"—"}kg`},
                        {lk:"candidates.marital",v:selected.marital_status||"—"},
                        {lk:"candidates.dependents",v:`${selected.dependents||0}`},
                        {lk:"candidates.colPreferredJob",v:selected.preferred_job||"—"},
                        {lk:"candidates.preferredLocation",v:selected.preferred_location||"—"},
                        {lk:"candidates.workHours",v:selected.work_hours||"—"},
                        {lk:"candidates.availability",v:selected.availability||t("candidates.immediate")},
                      ].map(r=>(
                        <div key={r.lk} style={{display:"flex",gap:"8px",padding:"5px 0",borderBottom:"0.5px solid rgba(11,31,58,0.04)",fontSize:"12px"}}>
                          <span style={{color:"#52525B",width:"80px",flexShrink:0,fontSize:"11px"}}>{t(r.lk)}</span>
                          <span style={{color:navy,fontWeight:500,flex:1,wordBreak:"break-word"}}>{r.v}</span>
                        </div>
                      ))
                    )}

                    {/* Documents — presigned URLs minted on click, never stored/shown as permanent
                        links. Empty slots get their own upload button too, so a candidate
                        created without a photo/ID (e.g. via CV取込, or before this option
                        existed) can still have one attached later. */}
                    {!editingBasic && (
                      <div style={{marginTop:"14px"}}>
                        <div style={{fontSize:"11px",fontWeight:700,color:navy,marginBottom:"6px"}}>{t("candidates.documents")}</div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                          {DOC_FIELDS_ALL.map(d=>{
                            const v = selected[d.key];
                            if (v) return (
                              <button key={d.key} onClick={()=>openCandidateFile(selected.id,d.key)} disabled={openingFile===d.key}
                                style={{padding:"6px 10px",borderRadius:"6px",fontSize:"10px",fontWeight:600,background:"#E6F1FB",color:"#0C447C",border:"0.5px solid #0C447C33",cursor:openingFile===d.key?"wait":"pointer",display:"flex",alignItems:"center",gap:"4px"}}>
                                📎 {t(d.labelKey)} {openingFile===d.key?"...":"↗"}
                              </button>
                            );
                            return (
                              <label key={d.key}
                                style={{padding:"6px 10px",borderRadius:"6px",fontSize:"10px",fontWeight:600,background:"#F6F7F9",color:"#52525B",border:"0.5px dashed rgba(11,31,58,0.25)",cursor:uploadingDoc===d.key?"wait":"pointer",display:"flex",alignItems:"center",gap:"4px"}}>
                                {uploadingDoc===d.key?`⏳ ${t("candidates.photoUploading")}`:`＋ ${t(d.labelKey)}`}
                                <input type="file" accept="image/*,application/pdf" style={{display:"none"}} disabled={uploadingDoc===d.key}
                                  onChange={e=>{ const f=e.target.files?.[0]; if (f) uploadDocumentForCandidate(selected.id, d.key, f); e.target.value=""; }}/>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* History tab */}
                {detailTab==="history"&&(
                  <div>
                    {(selected.education||[]).length>0&&<>
                      <div style={{fontSize:"11px",fontWeight:700,color:navy,marginBottom:"6px"}}>{t("candidates.education")}</div>
                      {(selected.education||[]).map((e,i)=>(
                        <div key={i} style={{display:"flex",gap:"8px",fontSize:"11px",padding:"4px 0",borderBottom:"0.5px solid rgba(11,31,58,0.04)"}}>
                          <span style={{color:"#52525B",width:"70px",flexShrink:0}}>{e.year}年{e.month}月</span>
                          <span style={{flex:1,color:navy}}>{e.school}</span>
                          <span style={{background:"#E6F1FB",color:"#0C447C",fontSize:"10px",padding:"1px 5px",borderRadius:"3px",flexShrink:0}}>{e.event}</span>
                        </div>
                      ))}
                    </>}
                    {(selected.work_history||[]).length>0&&<>
                      <div style={{display:"flex",alignItems:"center",gap:"8px",margin:"12px 0 6px",flexWrap:"wrap"}}>
                        <div style={{fontSize:"11px",fontWeight:700,color:navy}}>{t("candidates.workHistory")}</div>
                        {(() => {
                          const months = calcExperienceMonths(selected.work_history);
                          const ja = formatExperienceJa(months);
                          const vn = formatExperienceVn(months);
                          if (!ja) return null;
                          return (
                            <span style={{background:"#EAF3DE",color:"#27500A",fontSize:"11px",fontWeight:700,padding:"2px 9px",borderRadius:"20px",display:"inline-flex",alignItems:"center",gap:"4px"}}>
                              💼 {t("candidates.totalExperience")}: {ja} <span style={{fontWeight:400,opacity:0.8}}>({vn})</span>
                            </span>
                          );
                        })()}
                      </div>
                      {(selected.work_history||[]).map((w,i)=>(
                        <div key={i} style={{display:"flex",gap:"8px",fontSize:"11px",padding:"4px 0",borderBottom:"0.5px solid rgba(11,31,58,0.04)"}}>
                          <span style={{color:"#52525B",width:"70px",flexShrink:0}}>{w.year}年{w.month}月</span>
                          <span style={{flex:1,color:navy}}><strong>{w.company}</strong>{w.position?` — ${w.position}`:""}</span>
                          <span style={{background:"#EAF3DE",color:"#27500A",fontSize:"10px",padding:"1px 5px",borderRadius:"3px",flexShrink:0}}>{w.event}</span>
                        </div>
                      ))}
                    </>}
                  </div>
                )}

                {/* PR tab */}
                {detailTab==="pr"&&(
                  <div>
                    {(selected.certifications||[]).length>0&&<>
                      <div style={{fontSize:"11px",fontWeight:700,color:navy,marginBottom:"6px"}}>{t("candidates.certifications")}</div>
                      {(selected.certifications||[]).map((ct,i)=>(
                        <div key={i} style={{display:"flex",gap:"8px",fontSize:"11px",padding:"4px 0",borderBottom:"0.5px solid rgba(11,31,58,0.04)"}}>
                          <span style={{color:"#52525B",width:"70px",flexShrink:0}}>{ct.year}年{ct.month}月</span>
                          <span style={{flex:1,color:navy}}>{ct.name}</span>
                          <span style={{background:"#FAEEDA",color:"#633806",fontSize:"10px",padding:"1px 5px",borderRadius:"3px",flexShrink:0}}>{ct.result}</span>
                        </div>
                      ))}
                    </>}
                    {selected.motivation&&<>
                      <div style={{fontSize:"11px",fontWeight:700,color:navy,margin:"12px 0 6px"}}>{t("candidates.motivation")}</div>
                      <div style={{fontSize:"11px",color:"#444",lineHeight:1.7,background:"#F6F7F9",borderRadius:"6px",padding:"8px"}}>{selected.motivation}</div>
                    </>}
                    {selected.self_pr&&<>
                      <div style={{fontSize:"11px",fontWeight:700,color:navy,margin:"12px 0 6px"}}>{t("candidates.selfPr")}</div>
                      <div style={{fontSize:"11px",color:"#444",lineHeight:1.7,background:"#F6F7F9",borderRadius:"6px",padding:"8px"}}>{selected.self_pr}</div>
                    </>}
                    {selected.ai_data&&(selected.ai_data.strengths as string[])?.length>0&&<>
                      <div style={{fontSize:"11px",fontWeight:700,color:navy,margin:"12px 0 6px"}}>{t("candidates.aiStrengths")}</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:"4px"}}>
                        {(selected.ai_data.strengths as string[]).map((s,i)=>(
                          <span key={i} style={{background:"#E6F1FB",color:"#0C447C",fontSize:"11px",padding:"2px 8px",borderRadius:"20px"}}>{s}</span>
                        ))}
                      </div>
                    </>}
                  </div>
                )}

                {/* Match tab */}
                {detailTab==="match"&&(
                  <div>
                    {matchResults.length===0&&!matching&&!matchError&&(
                      <div style={{textAlign:"center",padding:"20px"}}>
                        <div style={{fontSize:"11px",color:"#52525B",marginBottom:"12px"}}>{t("candidates.runMatching")}</div>
                        <button onClick={()=>runMatch(selected)} style={{padding:"8px 16px",borderRadius:"7px",fontSize:"12px",fontWeight:700,background:"#C8002A",color:"#fff",border:"none",cursor:"pointer"}}>{t("candidates.startMatching")}</button>
                      </div>
                    )}
                    {matchResults.length===0&&!matching&&matchError&&(
                      <div style={{textAlign:"center",padding:"20px"}}>
                        <div style={{fontSize:"20px",marginBottom:"8px"}}>⚠️</div>
                        <div style={{fontSize:"12px",fontWeight:600,color:"#A32D2D",marginBottom:"4px"}}>
                          {matchError==="rate_limited" ? t("jobs.matchRateLimited") : t("jobs.matchFailed")}
                        </div>
                        <div style={{fontSize:"11px",color:"#52525B",marginBottom:"12px"}}>
                          {matchError==="rate_limited" ? t("jobs.matchRateLimitedDesc") : t("jobs.matchFailedDesc")}
                        </div>
                        <button onClick={()=>runMatch(selected)} style={{padding:"8px 16px",borderRadius:"7px",fontSize:"12px",fontWeight:700,background:navy,color:"#fff",border:"none",cursor:"pointer"}}>{t("common.retry")}</button>
                      </div>
                    )}
                    {matching&&<div style={{textAlign:"center",padding:"20px",color:"#52525B",fontSize:"12px"}}>{t("candidates.matching")}</div>}
                    {matchResults.map((job,i)=>{
                      const isApplied = selected.match_job_id===job.id;
                      return (
                      <div key={job.id} className="match-card" style={{...B,borderRadius:"9px",padding:"10px",marginBottom:"8px",background:isApplied?"#EAF3DE":i===0?"#F0F7FF":"#fff",transition:"box-shadow 0.2s ease"}}>
                        <div onClick={()=>router.push(`/admin/jobs?id=${job.id}&forCandidate=${selected.id}`)}
                          style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"6px",cursor:"pointer"}}
                          title={t("jobs.viewJobDetail")}>
                          <div>
                            <div className="match-name-link" style={{fontSize:"12px",fontWeight:700,color:navy,textDecoration:"underline",textDecorationColor:"transparent",transition:"text-decoration-color 0.15s"}}>{job.company} →</div>
                            <div style={{fontSize:"11px",color:"#52525B"}}>{job.position_vn} · {job.location}</div>
                          </div>
                          <div style={{fontSize:"18px",fontWeight:700,color:job.matchPct>=70?"#27500A":"#633806"}}>{job.matchPct}%</div>
                        </div>
                        <div style={{background:"#F1EFE8",borderRadius:"3px",height:"4px",overflow:"hidden",marginBottom:"6px"}}>
                          <div style={{height:"100%",background:job.matchPct>=70?"#27500A":"#EF9F27",width:`${job.matchPct}%`,transition:"width 0.6s"}}/>
                        </div>

                        {/* Per-criteria breakdown */}
                        {job.breakdown && job.breakdown.length>0 && (
                          <div style={{display:"flex",flexDirection:"column",gap:"4px",marginBottom:"6px",background:"#FAFBFC",borderRadius:"7px",padding:"7px 9px",border:"0.5px solid rgba(11,31,58,0.06)"}}>
                            {job.breakdown.map((b,bi)=>(
                              <div key={bi} style={{display:"flex",alignItems:"center",gap:"6px"}}>
                                <span style={{fontSize:"10px",fontWeight:600,color:navy,width:"40px",flexShrink:0}}>{b.criterion}</span>
                                <div style={{flex:1,background:"#EEF0F3",borderRadius:"3px",height:"4px",overflow:"hidden"}}>
                                  <div style={{height:"100%",width:`${b.score}%`,background:b.score>=70?"#27500A":b.score>=50?"#EF9F27":"#C8002A",borderRadius:"3px"}}/>
                                </div>
                                <span style={{fontSize:"10px",fontWeight:700,color:navy,width:"24px",textAlign:"right",flexShrink:0}}>{b.score}%</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div style={{display:"flex",flexWrap:"wrap",gap:"3px",marginBottom:"7px"}}>
                          {job.reasons.map((r,ri)=><span key={ri} style={{background:"#F6F7F9",color:navy,fontSize:"10px",padding:"2px 6px",borderRadius:"20px"}}>{r}</span>)}
                        </div>

                        <button onClick={()=>applyJobToCandidate(selected,job)} disabled={isApplied}
                          style={{width:"100%",padding:"6px",borderRadius:"6px",fontSize:"11px",fontWeight:700,cursor:isApplied?"default":"pointer",background:isApplied?"#27500A":"#fff",color:isApplied?"#fff":navy,border:`1px solid ${isApplied?"#27500A":"rgba(11,31,58,0.2)"}`}}>
                          {isApplied ? `✓ ${t("candidates.appliedTo")}` : t("candidates.applyThisJob")}
                        </button>
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{padding:"12px 16px",borderTop:"0.5px solid rgba(11,31,58,0.08)"}}>
                <div style={{display:"flex",flexWrap:"wrap",gap:"4px",marginBottom:"8px"}}>
                  {Object.entries(ST).map(([k,v])=>(
                    <button key={k} onClick={()=>updateStatus(selected.id,k)} style={{padding:"4px 8px",borderRadius:"5px",fontSize:"11px",fontWeight:600,cursor:"pointer",background:selected.status===k?v.tc:v.tb,color:selected.status===k?"#fff":v.tc,border:`1px solid ${v.tc}`}}>{t(v.labelKey)}</button>
                  ))}
                </div>
                <button onClick={()=>openCVView(selected)} style={{width:"100%",padding:"8px",borderRadius:"7px",fontSize:"11px",fontWeight:700,background:navy,color:"#fff",border:"none",cursor:"pointer",marginBottom:"6px",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px"}}>
                  📋 {t("candidates.viewRirekisho")}
                </button>
                <div style={{display:"flex",gap:"6px"}}>
                  <button onClick={()=>exportCV(selected)} style={{flex:1,padding:"7px",borderRadius:"7px",fontSize:"11px",fontWeight:600,background:"#EAF3DE",color:"#27500A",border:"0.5px solid #27500A",cursor:"pointer"}}>📄 {t("common.export")}</button>
                  {selected.email&&<a href={`mailto:${selected.email}`} style={{flex:1,padding:"7px",borderRadius:"7px",fontSize:"11px",fontWeight:600,textAlign:"center",background:navy,color:"#fff",textDecoration:"none"}}>{t("common.sendEmail")}</a>}
                  <button onClick={()=>deleteCandidate(selected.id)} style={{padding:"7px 10px",borderRadius:"7px",fontSize:"11px",fontWeight:600,background:"#FCEBEB",color:"#A32D2D",border:"0.5px solid #F09595",cursor:"pointer"}}>{t("common.delete")}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {showCV && selected && (
        <CVModal candidate={selected} fileUrls={cvFileUrls} loading={cvLoading} onClose={()=>setShowCV(false)} t={t} />
      )}
    </div>
  );

  /* ─── IMPORT VIEW ───────────────────────────────────────── */
  if (view==="import") return (
    <div>
      <div style={{background:"#fff",...B,borderTop:"none",borderLeft:"none",borderRight:"none",padding:"0 20px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><div style={{fontSize:"14px",fontWeight:700,color:navy}}>{t("candidates.importTitle")}</div><div style={{fontSize:"11px",color:"#52525B"}}>{t("candidates.importSubtitle")}</div></div>
        <button onClick={()=>{setView("list");setFileItems([]);}} style={{padding:"7px 14px",borderRadius:"6px",fontSize:"12px",fontWeight:600,background:"transparent",color:navy,border:`0.5px solid ${navy}`,cursor:"pointer"}}>← {t("common.backToList")}</button>
      </div>
      <div style={{padding:"20px",maxWidth:"780px",margin:"0 auto"}}>
        {/* Drop zone */}
        <div
          onDragOver={e=>{e.preventDefault();}}
          onDrop={e=>{e.preventDefault();addFiles(e.dataTransfer.files);}}
          onClick={()=>fileItems.length<5&&fileInputRef.current?.click()}
          style={{border:"2px dashed rgba(11,31,58,0.2)",borderRadius:"14px",padding:"36px 24px",textAlign:"center",cursor:fileItems.length>=5?"not-allowed":"pointer",background:"#fff",marginBottom:"16px"}}>
          <div style={{width:"48px",height:"48px",borderRadius:"12px",background:"#E6F1FB",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={navy} strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <div style={{fontSize:"14px",fontWeight:700,color:navy,marginBottom:"4px"}}>{t("candidates.dropzoneTitle")}</div>
          <div style={{fontSize:"11px",color:"#52525B",marginBottom:"12px"}}>{t("candidates.dropzoneHint")}</div>
          <div style={{display:"inline-block",padding:"7px 18px",borderRadius:"7px",background:navy,color:"#fff",fontSize:"12px",fontWeight:600}}>{t("candidates.chooseFile")} ({fileItems.length}/5)</div>
        </div>
        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" multiple style={{display:"none"}} onChange={e=>{if(e.target.files)addFiles(e.target.files);e.target.value="";}}/>

        {/* File list */}
        {fileItems.length>0&&(
          <div style={{display:"flex",flexDirection:"column",gap:"8px",marginBottom:"16px"}}>
            {fileItems.map(item=>(
              <div key={item.id} style={{background:"#fff",...B,borderRadius:"10px",padding:"12px 16px"}}>
                <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                  <div style={{width:"36px",height:"36px",borderRadius:"8px",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:item.status==="done"?"#EAF3DE":item.status==="error"?"#FCEBEB":"#E6F1FB"}}>
                    {item.status==="done"?<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#27500A" strokeWidth="2"><path d="M9 12l2 2 4-4M12 3a9 9 0 100 18 9 9 0 000-18z"/></svg>
                    :item.status==="error"?<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8002A" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    :<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
                      <span style={{fontSize:"12px",fontWeight:600,color:navy,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.file.name}</span>
                      <span style={{fontSize:"11px",color:"#52525B",flexShrink:0,marginLeft:"8px"}}>{fmt(item.file.size)}</span>
                    </div>
                    {item.status!=="waiting"&&(
                      <div>
                        <div style={{background:"#F1EFE8",borderRadius:"3px",height:"4px",overflow:"hidden",marginBottom:"3px"}}>
                          <div style={{height:"100%",borderRadius:"3px",transition:"width 0.3s",background:item.status==="done"?"#27500A":item.status==="error"?"#C8002A":"#378ADD",width:`${item.progress}%`}}/>
                        </div>
                        <div style={{fontSize:"11px",color:item.status==="done"?"#27500A":item.status==="error"?"#C8002A":"#52525B"}}>
                          {item.status==="analyzing"?`${item.progress}% — ${t("candidates.analyzing")}`
                          :item.status==="done"?t("candidates.done")
                          :`${t("candidates.errorPrefix")}${item.result?.error?` · ${item.result.error.slice(0,80)}`:""}`}
                        </div>
                      </div>
                    )}
                    {item.status==="waiting"&&<div style={{fontSize:"11px",color:"#B4B2A9"}}>{t("candidates.waiting")}</div>}
                  </div>
                  <div style={{display:"flex",gap:"5px",flexShrink:0}}>
                    {item.status==="done"&&item.result?.candidate&&(
                      <button onClick={()=>openReview(item)} style={{padding:"5px 10px",borderRadius:"6px",fontSize:"11px",fontWeight:600,background:navy,color:"#fff",border:"none",cursor:"pointer"}}>{t("candidates.reviewSave")}</button>
                    )}
                    {!isAnalyzing&&(
                      <button onClick={()=>setFileItems(p=>p.filter(f=>f.id!==item.id))} style={{padding:"5px 7px",borderRadius:"6px",fontSize:"11px",background:"transparent",color:"#52525B",border:"0.5px solid rgba(11,31,58,0.15)",cursor:"pointer"}}>×</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {retryCountdown>0&&(
          <div style={{background:"#FAEEDA",border:"1px solid #EF9F27",borderRadius:"9px",padding:"12px 16px",marginBottom:"10px",display:"flex",alignItems:"center",gap:"10px"}}>
            <span style={{fontSize:"20px"}}>⏱</span>
            <div style={{flex:1}}>
              <div style={{fontSize:"13px",fontWeight:700,color:"#633806"}}>{t("candidates.rateLimited", { s: retryCountdown })}</div>
              <div style={{fontSize:"11px",color:"#633806",marginTop:"2px"}}>{t("candidates.rateLimitedDesc")}</div>
            </div>
            <div style={{width:"44px",height:"44px",borderRadius:"50%",background:"#fff",border:"2px solid #EF9F27",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",fontWeight:700,color:"#633806",flexShrink:0}}>{retryCountdown}</div>
          </div>
        )}

        {fileItems.length>0&&!isAnalyzing&&fileItems.some(f=>f.status==="waiting")&&retryCountdown===0&&(
          <button onClick={analyzeAll} style={{width:"100%",padding:"12px",borderRadius:"9px",fontSize:"14px",fontWeight:700,background:navy,color:"#fff",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"}}>
            {t("candidates.runExtract")} ({fileItems.filter(f=>f.status==="waiting").length})
          </button>
        )}

        {fileItems.length===0&&(
          <div style={{background:"#F6F7F9",borderRadius:"10px",padding:"14px 16px"}}>
            <div style={{fontSize:"11px",fontWeight:700,color:navy,marginBottom:"8px"}}>{t("candidates.extractInfo")}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px"}}>
              {Array.from({length:12},(_,i)=>t(`candidates.extractItem${i+1}`)).map((it,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"11px",color:"#444"}}>
                  <div style={{width:"5px",height:"5px",borderRadius:"50%",background:"#27500A",flexShrink:0}}/>
                  {it}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  /* ─── REVIEW VIEW ───────────────────────────────────────── */
  if (view==="review"&&currentReview) {
    const c = currentReview.candidate;
    return (
      <div>
        <div style={{background:"#fff",...B,borderTop:"none",borderLeft:"none",borderRight:"none",padding:"0 20px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div><div style={{fontSize:"14px",fontWeight:700,color:navy}}>{t("candidates.reviewHeaderTitle")}</div><div style={{fontSize:"11px",color:"#52525B"}}>{currentReview.fileName}</div></div>
          <button onClick={()=>setView("import")} style={{padding:"7px 14px",borderRadius:"6px",fontSize:"12px",fontWeight:600,background:"transparent",color:navy,border:`0.5px solid ${navy}`,cursor:"pointer"}}>← {t("common.back")}</button>
        </div>
        <div style={{padding:"16px 20px",maxWidth:"920px",margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
          {/* Left: Edit form */}
          <div>
            <div style={{background:"#fff",...B,borderRadius:"10px",padding:"16px",marginBottom:"12px"}}>
              <div style={{fontSize:"12px",fontWeight:700,color:navy,marginBottom:"12px",display:"flex",alignItems:"center",gap:"7px"}}>
                <span style={{background:"#EAF3DE",color:"#27500A",fontSize:"11px",fontWeight:700,padding:"2px 8px",borderRadius:"20px"}}>{t("candidates.groqExtracted")}</span>
                {t("candidates.reviewFormTitle")}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
                {[
                  {f:"name",lk:"candidates.name",req:true,t:"text"},{f:"name_kana",lk:"candidates.nameKana",t:"text"},
                  {f:"email",lk:"candidates.email",t:"email"},{f:"phone",lk:"candidates.phone",t:"text"},
                  {f:"gender",lk:"candidates.gender",t:"text"},{f:"date_of_birth",lk:"candidates.dob",t:"text"},
                  {f:"visa_type",lk:"candidates.visaType",t:"text"},{f:"visa_expiry",lk:"candidates.visaExpiry",t:"text"},
                  {f:"height_cm",lk:"candidates.heightCm",t:"number"},{f:"weight_kg",lk:"candidates.weightKg",t:"number"},
                  {f:"preferred_job",lk:"candidates.colPreferredJob",t:"text"},{f:"work_hours",lk:"candidates.workHours",t:"text"},
                  {f:"address",lk:"candidates.address",t:"text"},{f:"preferred_location",lk:"candidates.preferredLocation",t:"text"},
                ].map(x=>(
                  <div key={x.f}>
                    <label style={{display:"block",fontSize:"11px",color:"#52525B",marginBottom:"3px",fontWeight:600}}>{t(x.lk)}{x.req?" *":""}</label>
                    <input type={x.t} value={editForm[x.f]||""} onChange={e=>setEditForm({...editForm,[x.f]:e.target.value})} style={{width:"100%",padding:"6px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}/>
                  </div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginTop:"10px"}}>
                <div>
                  <label style={{display:"block",fontSize:"11px",color:"#52525B",marginBottom:"3px",fontWeight:600}}>{t("candidates.colJlpt")}</label>
                  <select value={editForm.jlpt||"N4"} onChange={e=>setEditForm({...editForm,jlpt:e.target.value})} style={{width:"100%",padding:"6px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}>
                    {["N1","N2","N3","N4","N5","N3相当","N4相当","なし"].map(j=><option key={j}>{j}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{display:"block",fontSize:"11px",color:"#52525B",marginBottom:"3px",fontWeight:600}}>{t("candidates.colIndustry")}</label>
                  <select value={editForm.skill||"飲食"} onChange={e=>setEditForm({...editForm,skill:e.target.value})} style={{width:"100%",padding:"6px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}>
                    {["飲食","製造","農業","ホテル","宿泊業","IT","その他"].map(i=><option key={i}>{i}</option>)}
                  </select>
                </div>
              </div>
              <div style={{marginTop:"10px"}}>
                <label style={{display:"block",fontSize:"11px",color:"#52525B",marginBottom:"3px",fontWeight:600}}>{t("candidates.jlptExam")}</label>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1.4fr",gap:"6px"}}>
                  <input placeholder="YYYY" value={editForm.jlpt_exam_year||""} onChange={e=>setEditForm({...editForm,jlpt_exam_year:e.target.value})} style={{width:"100%",padding:"6px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}/>
                  <input placeholder="MM" value={editForm.jlpt_exam_month||""} onChange={e=>setEditForm({...editForm,jlpt_exam_month:e.target.value})} style={{width:"100%",padding:"6px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}/>
                  <select value={editForm.jlpt_exam_status||""} onChange={e=>setEditForm({...editForm,jlpt_exam_status:e.target.value})} style={{width:"100%",padding:"6px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}>
                    <option value="">—</option>
                    <option value="合格">合格</option>
                    <option value="受験予定">受験予定</option>
                    <option value="結果待ち">結果待ち</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Photo/ID images extracted from the uploaded .docx — text extraction never
                sees these, so offer them here for a one-click upload into the matching slot. */}
            {reviewImages.length>0&&(
              <div style={{background:"#fff",...B,borderRadius:"10px",padding:"16px",marginBottom:"12px"}}>
                <div style={{fontSize:"12px",fontWeight:700,color:navy,marginBottom:"4px"}}>{t("candidates.extractedImages")}</div>
                <div style={{fontSize:"11px",color:"#52525B",marginBottom:"10px"}}>{t("candidates.extractedImagesHint")}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:"12px"}}>
                  {reviewImages.map(img=>{
                    const state = imageUploadState[img.url]||"idle";
                    const assignedLabel = imageAssignedField[img.url] ? t(DOC_FIELDS.find(d=>d.key===imageAssignedField[img.url])?.labelKey || "candidates.docPhoto") : "";
                    return (
                      <div key={img.url} style={{width:"120px"}}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt={img.name} style={{width:"120px",height:"120px",objectFit:"cover",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.15)",marginBottom:"6px"}}/>
                        <select disabled={state==="uploading"} defaultValue=""
                          onChange={e=>{ if(e.target.value) assignExtractedImage(img, e.target.value); e.target.value=""; }}
                          style={{width:"100%",padding:"4px 6px",borderRadius:"5px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"10px",outline:"none",marginBottom:"3px"}}>
                          <option value="">{state==="uploading"?t("candidates.photoUploading"):t("candidates.useAsPhoto")}</option>
                          <option value="photo_url">{t("candidates.docPhoto")}</option>
                          <option value="id_front_url">{t("candidates.docIdFront")}</option>
                          <option value="id_back_url">{t("candidates.docIdBack")}</option>
                          <option value="jlpt_cert_url">{t("candidates.docJlptCert")}</option>
                          <option value="senmonkyu_url">{t("candidates.docSenmonkyu")}</option>
                          <option value="other_cert_url">{t("candidates.docOther")}</option>
                        </select>
                        {state==="done"&&<div style={{fontSize:"10px",color:"#27500A",fontWeight:600}}>✓ {assignedLabel}</div>}
                        {state==="error"&&<div style={{fontSize:"10px",color:"#A32D2D",fontWeight:600}}>✕ {t("candidates.fileUnavailable")}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Extracted data preview */}
            {(()=>{
              const edu = c.education as Edu[]|null;
              const wh  = c.work_history as Work[]|null;
              const crt = c.certifications as Cert[]|null;
              if (!edu?.length && !wh?.length && !crt?.length) return null;
              return (
                <div style={{background:"#fff",...B,borderRadius:"10px",padding:"16px",marginBottom:"12px"}}>
                  <div style={{fontSize:"12px",fontWeight:700,color:navy,marginBottom:"10px"}}>{t("candidates.extractedData")}</div>
                  {edu && edu.length>0&&<>
                    <div style={{fontSize:"11px",color:"#52525B",fontWeight:600,marginBottom:"4px"}}>{t("candidates.education")} ({edu.length})</div>
                    {edu.map((e,i)=><div key={i} style={{fontSize:"11px",color:navy,padding:"3px 0",borderBottom:"0.5px solid rgba(11,31,58,0.04)"}}>{e.year}年{e.month}月 {e.school} {e.event}</div>)}
                  </>}
                  {wh && wh.length>0&&<>
                    <div style={{fontSize:"11px",color:"#52525B",fontWeight:600,margin:"8px 0 4px"}}>{t("candidates.workHistory")} ({wh.length})</div>
                    {wh.map((w,i)=><div key={i} style={{fontSize:"11px",color:navy,padding:"3px 0",borderBottom:"0.5px solid rgba(11,31,58,0.04)"}}>{w.year}年{w.month}月 <strong>{w.company}</strong> {w.position} {w.event}</div>)}
                  </>}
                  {crt && crt.length>0&&<>
                    <div style={{fontSize:"11px",color:"#52525B",fontWeight:600,margin:"8px 0 4px"}}>{t("candidates.certifications")} ({crt.length})</div>
                    {crt.map((ct,i)=><div key={i} style={{fontSize:"11px",color:navy,padding:"3px 0",borderBottom:"0.5px solid rgba(11,31,58,0.04)"}}>{ct.year}年{ct.month}月 {ct.name} {ct.result}</div>)}
                  </>}
                </div>
              );
            })()}

            {/* Motivation/PR */}
            {(()=>{
              const mot = c.motivation as string|null;
              const pr  = c.self_pr as string|null;
              if (!mot && !pr) return null;
              return (
                <div style={{background:"#fff",...B,borderRadius:"10px",padding:"16px"}}>
                  {mot&&<><div style={{fontSize:"11px",fontWeight:700,color:navy,marginBottom:"4px"}}>{t("candidates.motivation")}</div><div style={{fontSize:"11px",color:"#444",lineHeight:1.6,marginBottom:"10px",background:"#F6F7F9",borderRadius:"6px",padding:"8px"}}>{mot}</div></>}
                  {pr&&<><div style={{fontSize:"11px",fontWeight:700,color:navy,marginBottom:"4px"}}>{t("candidates.selfPr")}</div><div style={{fontSize:"11px",color:"#444",lineHeight:1.6,background:"#F6F7F9",borderRadius:"6px",padding:"8px"}}>{pr}</div></>}
                </div>
              );
            })()}
          </div>

          {/* Right: Job matching */}
          <div>
            <div style={{background:"#fff",...B,borderRadius:"10px",padding:"16px",marginBottom:"12px"}}>
              <div style={{fontSize:"12px",fontWeight:700,color:navy,marginBottom:"4px"}}>{t("candidates.aiMatchedJobs")}</div>
              <div style={{fontSize:"11px",color:"#52525B",marginBottom:"12px"}}>
                {t("candidates.desiredLabel")}: <strong>{String(c.preferred_job||t("candidates.notFilled"))}</strong> ·
                {t("candidates.colJlpt")}: <strong>{String(c.jlpt||"—")}</strong> ·
                {t("candidates.colIndustry")}: <strong>{String(c.skill||"—")}</strong>
              </div>
              {currentReview.suggestions.length===0&&<div style={{padding:"16px",textAlign:"center",color:"#52525B",fontSize:"12px"}}>{t("candidates.noJobData")}</div>}
              {currentReview.suggestions.map((job,i)=>(
                <div key={job.id} onClick={()=>setSelectedJobId(job.id)} style={{border:`1.5px solid ${selectedJobId===job.id?navy:"rgba(11,31,58,0.1)"}`,borderRadius:"10px",padding:"12px",marginBottom:"8px",cursor:"pointer",background:selectedJobId===job.id?"#E6F1FB":"#fff",transition:"all 0.15s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"6px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"7px"}}>
                      <div style={{width:"22px",height:"22px",borderRadius:"50%",background:i===0?navy:"#F1EFE8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:700,color:i===0?"#fff":navy,flexShrink:0}}>{i+1}</div>
                      <div>
                        <div style={{fontSize:"12px",fontWeight:700,color:navy}}>{job.company}</div>
                        <div style={{fontSize:"11px",color:"#52525B"}}>{job.position_vn} · {job.location}</div>
                      </div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:"18px",fontWeight:700,color:job.matchPct>=70?"#27500A":"#633806"}}>{job.matchPct}%</div>
                    </div>
                  </div>
                  <div style={{background:"#F1EFE8",borderRadius:"3px",height:"4px",overflow:"hidden",marginBottom:"6px"}}>
                    <div style={{height:"100%",background:job.matchPct>=70?"#27500A":"#EF9F27",borderRadius:"3px",width:`${job.matchPct}%`}}/>
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:"3px",marginBottom:"4px"}}>
                    {job.reasons.map((r,ri)=><span key={ri} style={{background:"#F6F7F9",color:navy,fontSize:"10px",padding:"2px 6px",borderRadius:"20px"}}>{r}</span>)}
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:"11px",fontWeight:700,color:"#27500A"}}>{job.salary}</span>
                    <span style={{background:job.status==="urgent"?"#FCEBEB":"#E6F1FB",color:job.status==="urgent"?"#A32D2D":"#0C447C",fontSize:"10px",fontWeight:700,padding:"2px 6px",borderRadius:"4px"}}>{job.status==="urgent"?`⚡ ${t("jobs.statusUrgent")}`:t("dashboard.subRecruiting")}</span>
                  </div>
                  {selectedJobId===job.id&&<div style={{marginTop:"6px",paddingTop:"6px",borderTop:"0.5px solid rgba(11,31,58,0.08)",fontSize:"11px",color:"#27500A",fontWeight:700}}>{t("candidates.registerToThisJob")}</div>}
                </div>
              ))}
              <button onClick={()=>setSelectedJobId(null)} style={{width:"100%",padding:"7px",borderRadius:"7px",fontSize:"11px",color:"#52525B",border:"0.5px solid rgba(11,31,58,0.15)",background:"transparent",cursor:"pointer",marginTop:"4px"}}>
                {t("candidates.noMatchOption")}
              </button>
            </div>

            {/* Guards against saving mid-upload: clicking 保存 while an assigned image's S3
                upload is still in flight would create the candidate with that photo/ID slot
                silently empty, since saveCandidate only ever sees whatever is in editForm at
                click time (verified — a fast click order really does drop the photo). */}
            {(() => { const anyImageUploading = Object.values(imageUploadState).some(s=>s==="uploading"); return (
            <button onClick={saveCandidate} disabled={!editForm.name||saving||anyImageUploading} style={{width:"100%",padding:"13px",borderRadius:"9px",fontSize:"14px",fontWeight:700,background:editForm.name&&!saving&&!anyImageUploading?navy:"#B4B2A9",color:"#fff",border:"none",cursor:editForm.name&&!anyImageUploading?"pointer":"not-allowed",transition:"background 0.2s"}}>
              {anyImageUploading?t("candidates.photoUploading"):saving?t("candidates.savingDb"):t("candidates.saveToDbBtn")}
            </button>
            ); })()}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
